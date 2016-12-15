"use strict";

var Dom = require('../packages/dom');
var Block = require('../block');
var config = require('../config');

module.exports = Block.extend({

  type: "image_gallery",
  icon_name: 'images',
  fetchable: true,

  editorHTML: function () {
    var blockId = this.blockID;
    return '<div class="imageBlock">' +
           '<div class="imageFormatting">' +
           '  <input type="checkbox" name="' + blockId + '-normalize-height" data-name="normalize-height" />' +
           '  Bildhöhe auf' +
           '  <input class="normalized-height" type="text" name="' + blockId + '-height" data-name="height"' +
           '    pattern="[1-3][0-9]{2}|400" title="' + i18n.t('blocks:image_gallery:height_error') + '"' +
           '  /> Pixel vereinheitlichen' +
           '</div>' +
           '<div class="imageUpload">' +
           '  <label>Bilder:</label>' +
           '  <div class="container-fluid"><div class="row image-list">' +
           '    <div class="col-lg-4 col-md-4 thumbnail">' +
           '      <svg class="st-icon open-gallery-upload-modal" role="img"><use xlink:href="' + config.defaults.iconUrl + '#plus"></use></svg>' +
           '    </div>' +
           '  </div></div>' +
           '</div>' +
           '</div>';
  },

  loadData: function(data){
    // Load the list of items and appand a thumbnail for each one to the view
    var itemList = data['item-list'];
    itemList.forEach(function(item){
      this.appendThumbnail(item, itemList);
    }, this);

    // Set checkbox value for the normalize height option
    if(data['normalize-height'] === 'on'){
      this.inner.querySelector('input[name="' + this.blockID + '-normalize-height"]').checked = true;
    }
    // Set input value for the height
    if(data['height']){
      this.inner.querySelector('input[name="' + this.blockID + '-height"]').value = data['height'];
    }

    $(this.inner.querySelector('.image-list')).sortable({
      items: 'div.thumbnail[data-id]',
      update: this.saveItemOrder.bind(this)
    });
  },

  onBlockRender: function(){
    // Add an empty list to the block data, if it is not already existing
    if(this.getBlockData()['item-list'] === undefined){
      this.setData({'item-list':[]});
    }
    this.inner.querySelector('.open-gallery-upload-modal').addEventListener('click', function(ev){
      configureUploadModal('galleryUploadModal', function(data){
        var itemList = this.getData().data['item-list'];
        // Calculate the id for the new thumbnail, either the incremented maximum one or first
        var nextId = _.max(itemList, 'id').id + 1 || 1;
        // Generate the dataset for the thumbnail
        var itemData = {
          'id': nextId,
          'image-link': data.imageLink,
          'text': {'de': data['text[de]'], 'en': data['text[en]']},
          'text-link': data.textLink
        };
        // Remove any error messages
        this.resetMessages();
        // Add the appropriate id or display an error message and exit the process
        if(data.objectID !== ''){
          itemData['object-id'] = data.objectID;
        }else if(data.imageId !== ''){
          itemData['image-id'] = data.imageId;
        }else{
          return this.addMessage('Es wurde keine ID angegeben.');
        }
        itemList.push(itemData);
        this.appendThumbnail(itemData, itemList, nextId);
      }.bind(this));
      $('#galleryUploadModal').modal('show');
    }.bind(this));
    var normalizedHeightCheckbox = this.inner.querySelector('input[type="checkbox"][data-name="normalize-height"]');
    var normalizedHeightInput = this.inner.querySelector('input[type="text"][data-name="height"]');
    // Either disable or enable the input field depending on the checkbox state
    normalizedHeightInput.disabled = normalizedHeightCheckbox.checked ? false : true;
    // Add a click handler for either disabling or enabling the input field
    normalizedHeightCheckbox.addEventListener('click', function (ev) {
      normalizedHeightInput.disabled = this.checked ? false : true;
    });
  },

  fetchUrl: function(id){
    if(id.slice(0, 3) === 'bsb'){
      id = 'BSB-MDZ-00000BSB' + id.slice(3);
    }
    return '/api/artifacts/' + id;
  },

  onFetchSuccess: function(data){
    // Get the thumbnail corresponding to the given id
    var thumbnailImage = this.block.inner.querySelector('div[data-id="' + this.id + '"] > img');
    // Create the image tag and append it to the thumbnail div
    thumbnailImage.setAttribute('src', '/iiif/' + data.previewId + '/full/200,/0/native.jpg');
    thumbnail.appendChild(objectImage);
    this.block.ready();
  },

  onFetchFail: function(){
    // Get the item list of this block
    var itemList = this.block.getData().data['item-list'];
    // Remove the previous inserted item again from the list
    _.remove(itemList, function(item){
      return item.id === this
    }.bind(this.id));
    // Remove the thumbnail again from the view
    Dom.remove(this.block.inner.querySelector('div[data-id="' + this.id + '"]'));
    // Display an error message
    this.block.addMessage("Objekt konnte nicht geladen werden.");
    this.block.ready();
  },

  fetchData: function(objectID, thumbnailId){
    // Remove any error messages
    this.resetMessages();
    // Fetch information on the object
    this.fetch(
      this.fetchUrl(objectID), { dataType: 'json' },
      this.onFetchSuccess.bind({ block: this, id: thumbnailId }),
      this.onFetchFail.bind({ block: this, id: thumbnailId })
    );
  },

  appendThumbnail: function(itemData, itemList, id){
    /* Determine the internal thumbnail id
     * Either it is already stored in the block data or is must be given as parameter
     */
    var thumbnailId = itemData.id || id;

    // Create the remove button for the new thumbnail
    var removeButton = Dom.createElement('button', {class: 'close', type: 'button'});
    removeButton.innerHTML = '<svg class="st-icon" role="img"><use xlink:href="' + config.defaults.iconUrl + '#cross"></use></svg>';
    removeButton.title = i18n.t('blocks:' + this.type + ':remove_thumbnail');
    // Add a click handler for removing the corresponding thumbnail from the DOM and the block data
    removeButton.addEventListener('click', function(){
      // Show a dialog to confirm, that the thumbnail should really be removed from the gallery
      BootstrapDialog.show({
        title: 'Warnung',
        message: 'Sind Sie sicher, dass Sie dieses Bild aus der Galerie entfernen wollen?',
        type: 'type-danger',
        buttons: [
          {
            label: i18n.t('general:yes'),
            cssClass: 'btn-danger',
            action: function(dialogItself){
              // Remove the thumbnail from the DOM and the block data
              _.remove(this, function(item){
                return item.id === parseInt(removeButton.parentNode.getAttribute('data-id'))
              });
              removeButton.parentNode.parentNode.removeChild(removeButton.parentNode);
              dialogItself.close();
            }.bind(itemList)
          },
          {
            label: i18n.t('general:no'),
            action: function(dialogItself){
              dialogItself.close();
            }
          }
        ]
      });
    }.bind(itemList));

    // Create the edit button for the new thumbnail
    var editButton = Dom.createElement('button', {class: 'close edit', type: 'button'});
    editButton.innerHTML = '<svg class="st-icon" role="img"><use xlink:href="' + config.defaults.iconUrl + '#edit"></use></svg>';
    editButton.title = i18n.t('blocks:' + this.type + ':edit_thumbnail');
    // Add a click handler for opening an edit modal
    editButton.addEventListener('click', function(){
      configureEditModal('editModal',itemData,function(editedData){
        _.merge(itemData, editedData);
        this.querySelector('img').title = 'de: ' + (editedData.text.de || '-') + ' | en: ' + (editedData.text.en || '-');
      }.bind(this.parentNode));
      $('#editModal').modal('show');
    });

    // Create the thumbnail itself and define the content and title
    var thumbnail = Dom.createElement('div', {class: 'col-lg-4 col-md-4 thumbnail', 'data-id': thumbnailId});
    if(itemData['object-id']){
      // Add a loading icon to the thumbnail
      thumbnail.innerHTML = '<img class="img-responsive" src="/img/preloader.gif">';
      this.fetchData(itemData['object-id'], thumbnailId);
    }else{
      thumbnail.innerHTML = '<img class="img-responsive" src="/uploads/' + itemData['image-id'] + '/thumbnail">';
    }
    thumbnail.querySelector('img').title = 'de: ' + (itemData.text.de || '-') + ' | en: ' + (itemData.text.en || '-');
    // Append the remove and edit buttons to the thumbnail
    thumbnail.insertBefore(editButton, thumbnail.firstChild);
    thumbnail.insertBefore(removeButton, thumbnail.firstChild);
    // Append the thumbnail to the image list
    var imageList = this.inner.querySelector('.image-list');
    imageList.insertBefore(thumbnail, imageList.lastElementChild);
  },

  saveItemOrder: function(){
    var itemList = this.getData().data['item-list'];
    var reorderedItemList = [];
    var images = this.inner.querySelectorAll('.image-list > div.thumbnail[data-id]');

    [].forEach.call(images, function(item){
      var currentItem = _.find(itemList, {'id': parseInt(item.getAttribute('data-id'))});
      reorderedItemList.push(currentItem);
    });
    this.setData({'item-list': reorderedItemList});
  }
});
