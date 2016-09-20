"use strict";

var Dom = require('../packages/dom');
var Block = require('../block');
var config = require('../config');

module.exports = Block.extend({

  type: "image_gallery",

  icon_name: 'images',

  editorHTML: function () {
    var blockId = this.blockID;
    return '<div class="imageBlock">' +
           '<div class="imageFormatting">' +
           '  <input type="checkbox" name="' + blockId + '-normalize-height" data-name="normalize-height" />' +
           '  Bildhöhe auf' +
           '  <input class="normalized-height" type="text" name="' + blockId + '-height" data-name="height"/> Pixel vereinheitlichen' +
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
    // Create the image list
    var imageList = this.inner.querySelector('.image-list');
    var thumbnail;
    var itemList = data['item-list'];
    itemList.forEach(function(item){
      // Create the remove button for the current thumbnail
      var removeButton = Dom.createElement('button', {class: 'close', type: 'button'});
      removeButton.innerHTML = '<svg class="st-icon" role="img"><use xlink:href="' + config.defaults.iconUrl + '#cross"></use></svg>';
      // Add a click handler for removing the corresponding thumbnail from the DOM and the block data
      removeButton.addEventListener('click', function(){
        _.remove(this, function(item){
          return item.id === parseInt(removeButton.parentNode.getAttribute('data-id'))
        });
        removeButton.parentNode.parentNode.removeChild(removeButton.parentNode);
      }.bind(this));
      // Create the edit button for the current thumbnail
      var editButton = Dom.createElement('button', {class: 'close edit', type: 'button'});
      editButton.innerHTML = '<svg class="st-icon" role="img"><use xlink:href="' + config.defaults.iconUrl + '#edit"></use></svg>';
      // Add a click handler for opening an edit modal
      editButton.addEventListener('click', function(){
        configureEditModal('editModal',item,function(editedData){
          // Merge the existing data for the edited thumbnail with the edited data
          _.merge(item, editedData);
          // Update the title displayed when hovering the thumbnail
          this.title = 'de: ' + (editedData.text.de || '-') + ' | en: ' + (editedData.text.en || '-');
        }.bind(this.parentNode));
        $('#editModal').modal('show');
      });
      // Create the thumbnail itself and append the remove button
      thumbnail = Dom.createElement('div', {class: 'col-lg-4 col-md-4 thumbnail', 'data-id': item.id});
      thumbnail.innerHTML = '<img class="img-responsive" src="/uploads/' + item['image-id'] + '/thumbnail">';
      thumbnail.title = 'de: ' + (item.text.de || '-') + ' | en: ' + (item.text.en || '-');
      thumbnail.insertBefore(editButton, thumbnail.firstChild);
      thumbnail.insertBefore(removeButton, thumbnail.firstChild);
      // Append the thumbnail to the image list
      imageList.insertBefore(thumbnail, imageList.lastElementChild);
    },itemList);

    // Set checkbox value for the normalize height option
    if(data['normalize-height'] === 'on'){
      this.inner.querySelector('input[name="' + this.blockID + '-normalize-height"]').checked = true;
    }
    // Set input value for the height
    if(data['height']){
      this.inner.querySelector('input[name="' + this.blockID + '-height"]').value = data['height'];
    }
  },

  onBlockRender: function(){
    // Add an empty list to the block data, if it is not already existing
    if(this.getBlockData()['item-list'] === undefined){
      this.setData({'item-list':[]});
    }
    //$('.image-list').sortable();
    this.inner.querySelector('.open-gallery-upload-modal').addEventListener('click', function (ev) {
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
        // Create the remove button for the new thumbnail
        var removeButton = Dom.createElement('button', {class: 'close', type: 'button'});
        removeButton.innerHTML = '<svg class="st-icon" role="img"><use xlink:href="' + config.defaults.iconUrl + '#cross"></use></svg>';
        // Add a click handler for removing the corresponding thumbnail from the DOM and the block data
        removeButton.addEventListener('click', function(){
          _.remove(this, function(item){
            return item.id === parseInt(removeButton.parentNode.getAttribute('data-id'))
          });
          removeButton.parentNode.parentNode.removeChild(removeButton.parentNode);
        }.bind(itemList));
        // Create the edit button for the new thumbnail
        var editButton = Dom.createElement('button', {class: 'close edit', type: 'button'});
        editButton.innerHTML = '<svg class="st-icon" role="img"><use xlink:href="' + config.defaults.iconUrl + '#edit"></use></svg>';
        // Add a click handler for opening an edit modal
        editButton.addEventListener('click', function(){
          configureEditModal('editModal',itemData,function(editedData){
            // Load the existing data for the edited thumbnail and merged it with the edited data
            var currentData = _.find(itemList, {'id': nextId});
            _.merge(currentData, editedData);
            // Update the title displayed when hovering the thumbnail
            this.title = 'de: ' + (editedData.text.de || '-') + ' | en: ' + (editedData.text.en || '-');
          }.bind(this.parentNode));
          $('#editModal').modal('show');
        });
        // Create the thumbnail itself and append the remove and edit buttons
        var thumbnail = Dom.createElement('div', {class: 'col-lg-4 col-md-4 thumbnail', 'data-id': nextId});
        thumbnail.innerHTML = '<img class="img-responsive" src="/uploads/' + itemData['image-id'] + '/thumbnail">';
        thumbnail.title = 'de: ' + (itemData.text.de || '-') + ' | en: ' + (itemData.text.en || '-');
        thumbnail.insertBefore(editButton, thumbnail.firstChild);
        thumbnail.insertBefore(removeButton, thumbnail.firstChild);
        // Append the thumbnail to the image list
        var imageList = this.inner.querySelector('.image-list');
        imageList.insertBefore(thumbnail, imageList.lastElementChild);
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
  }
});
