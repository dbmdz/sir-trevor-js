"use strict";

var Dom = require('../packages/dom');
var Block = require('../block');

module.exports = Block.extend({

  type: "image_gallery",

  icon_name: 'image',

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
    data['item-list'].forEach(function(item){
      thumbnail = Dom.createElement('div', {class: 'col-lg-4 col-md-4 thumb'});
      thumbnail.innerHTML = '<div class="thumbnail">' +
                            '  <img class="img-responsive" src="http://localhost:3000/uploads/thumbnail/' + item['image-id'] + '">' +
                            '</div>';
      imageList.appendChild(thumbnail);
    });
  },

  onBlockRender: function(){
    if(this.getBlockData()['item-list'] === undefined){
      this.setData({'item-list':[]});
    }
    this.inner.querySelector('.open-gallery-upload-modal').addEventListener('click', function (ev) {
      configureUploadModal('galleryUploadModal', function(data){
        this.getData().data['item-list'].push({
          'image-id': data.result.files[0].name,
          'image-link': data.formData['imageLink'],
          'text': {'de': data.formData['text[de]'], 'en': data.formData['text[en]']},
          'text-link': data.formData['textLink']
        });
        var imageList = this.inner.querySelector('.image-list');
        var thumbnail = Dom.createElement('div', {class: 'col-lg-4 col-md-4 thumb'});
        thumbnail.innerHTML = '<div class="thumbnail">' +
                              '  <img class="img-responsive" src="http://localhost:3000/uploads/thumbnail/' + data.result.files[0].name + '">' +
                              '</div>';
        imageList.appendChild(thumbnail);
      }.bind(this));
      $('#galleryUploadModal').modal('show');
    }.bind(this));
  }
});
