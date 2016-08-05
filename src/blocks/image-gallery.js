"use strict";

var Dom = require('../packages/dom');
var Block = require('../block');

module.exports = Block.extend({

  type: "image_gallery",

  icon_name: 'images',

  editorHTML: function () {
    var blockId = this.blockID;
    return '<div class="imageBlock">' +
           '<div class="imageUpload">' +
           '  <a class="btn btn-primary btn-xs open-gallery-upload-modal">Bild hinzufügen</a>' +
           '  <div class="container-fluid"><div class="row image-list"></div></div>' +
           '</div>' +
           '<div class="imageFormatting">' +
           '  <input type="checkbox" name="' + blockId + '-normalize-height" data-name="normalize-height" />' +
           '  <label>Höhe anpassen</label><br/>' +
           '  Höhe: <input type="text" name="' + blockId + '-height" data-name="height"/> Pixel' +
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
      removeButton.innerHTML = '<svg class="st-icon" role="img"><use xlink:href="sir-trevor-icons.svg#cross"></use></svg>';
      removeButton.addEventListener('click', function(){
        _.remove(this, function(item){
          return item.id === parseInt(removeButton.parentNode.getAttribute('data-id'))
        });
        removeButton.parentNode.parentNode.removeChild(removeButton.parentNode);
      }.bind(this));
      // Create the edit button for the current thumbnail
      var editButton = Dom.createElement('button', {class: 'close edit', type: 'button'});
      editButton.innerHTML = '<svg class="st-icon" role="img"><use xlink:href="sir-trevor-icons.svg#edit"></use></svg>';
      editButton.addEventListener('click', function(){
        configureEditModal('editModal',item,function(editedData){
          this.title = 'de: ' + (editedData.text.de || '-') + ' | en: ' + (editedData.text.en || '-');
          _.merge(item, editedData);
        }.bind(this.parentNode));
        $('#editModal').modal('show');
      });
      // Create the thumbnail itself and append the remove button
      thumbnail = Dom.createElement('div', {class: 'col-lg-4 col-md-4 thumbnail', 'data-id': item.id});
      thumbnail.innerHTML = '<img class="img-responsive" src="http://localhost:3000/uploads/thumbnail/' + item['image-id'] + '">';
      thumbnail.title = 'de: ' + (item.text.de || '-') + ' | en: ' + (item.text.en || '-');
      thumbnail.insertBefore(editButton, thumbnail.firstChild);
      thumbnail.insertBefore(removeButton, thumbnail.firstChild);
      // Append the thumbnail to the image list
      imageList.appendChild(thumbnail);
    },itemList);
  },

  onBlockRender: function(){
    if(this.getBlockData()['item-list'] === undefined){
      this.setData({'item-list':[]});
    }
    this.inner.querySelector('.open-gallery-upload-modal').addEventListener('click', function (ev) {
      configureUploadModal('galleryUploadModal', function(data){
        var itemList = this.getData().data['item-list'];
        var nextId = _.max(itemList, 'id').id + 1 || 1;
        var itemData = {
          'id': nextId,
          'image-id': data.result.files[0].name,
          'image-link': data.formData['imageLink'],
          'text': {'de': data.formData['text[de]'], 'en': data.formData['text[en]']},
          'text-link': data.formData['textLink']
        };
        itemList.push(itemData);
        // Create the remove button for the new thumbnail
        var removeButton = Dom.createElement('button', {class: 'close', type: 'button'});
        removeButton.innerHTML = '<svg class="st-icon" role="img"><use xlink:href="sir-trevor-icons.svg#cross"></use></svg>';
        removeButton.addEventListener('click', function(){
          _.remove(this, function(item){
            return item.id === parseInt(removeButton.parentNode.getAttribute('data-id'))
          });
          removeButton.parentNode.parentNode.removeChild(removeButton.parentNode);
        }.bind(itemList));
        // Create the edit button for the new thumbnail
        var editButton = Dom.createElement('button', {class: 'close edit', type: 'button'});
        editButton.innerHTML = '<svg class="st-icon" role="img"><use xlink:href="sir-trevor-icons.svg#edit"></use></svg>';
        editButton.addEventListener('click', function(){
          configureEditModal('editModal',itemData,function(editedData){
            var currentData = _.find(itemList, {'id': nextId});
            _.merge(currentData, editedData);
            this.title = 'de: ' + (editedData.text.de || '-') + ' | en: ' + (editedData.text.en || '-');
          }.bind(this.parentNode));
          $('#editModal').modal('show');
        });
        // Create the thumbnail itself and append the remove button
        var thumbnail = Dom.createElement('div', {class: 'col-lg-4 col-md-4 thumbnail', 'data-id': nextId});
        thumbnail.innerHTML = '<img class="img-responsive" src="' + data.result.files[0].thumbnailUrl+ '">';
        thumbnail.title = 'de: ' + (itemData.text.de || '-') + ' | en: ' + (itemData.text.en || '-');
        thumbnail.insertBefore(editButton, thumbnail.firstChild);
        thumbnail.insertBefore(removeButton, thumbnail.firstChild);
        // Append the thumbnail to the image list
        var imageList = this.inner.querySelector('.image-list');
        imageList.appendChild(thumbnail);
      }.bind(this));
      $('#galleryUploadModal').modal('show');
    }.bind(this));
  }
});
