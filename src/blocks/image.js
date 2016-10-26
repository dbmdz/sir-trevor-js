"use strict";

var Dom = require('../packages/dom');
var Block = require('../block');

module.exports = Block.extend({

  type: 'image',

  icon_name: 'image',

  editorHTML: function () {
    var blockId = this.blockID;
    return '<div class="imageBlock row">' +
           '  <div class="col-lg-8 col-md-8 imageSettings">' +
           '    <a class="btn btn-primary btn-xs open-upload-modal">Bild auswählen</a>' +
           '    <b>Ausrichtung:</b>' +
           '    <input type="radio" name="' + blockId + '-position" data-name="position" value="left" checked/>' +
           '    <label>links</label>' +
           '    <input type="radio" name="' + blockId + '-position" data-name="position" value="right" />' +
           '    <label>rechts</label>' +
           '    <b>Breite:</b>' +
           '    <input type="radio" name="' + blockId + '-width" data-name="width" value="25%" />' +
           '    <label>25%</label>' +
           '    <input type="radio" name="' + blockId + '-width" data-name="width" value="33%" />' +
           '    <label>33%</label>' +
           '    <input type="radio" name="' + blockId + '-width" data-name="width" value="50%" />' +
           '    <label>50%</label>' +
           '    <input type="radio" name="' + blockId + '-width" data-name="width" value="100%" />' +
           '    <label>100%</label>' +
           '    <b>Bild-Link:</b>' +
           '    <input type="text" class="form-control" name="' + blockId + '-image-link" data-name="image-link" />' +
           '  </div>' +
           '  <div class="col-lg-4 col-md-4 imagePreview"></div>' +
           '</div>';
  },

  loadData: function(data){
    // Create our image tag
    var imagePreview = Dom.createElement('img', {src: '/uploads/' + data.id + '/thumbnail', class: 'thumbnail'});
    this.inner.querySelector('.imagePreview').appendChild(imagePreview);

    // Set the radio button value for position
    if(data.position){
      this.inner.querySelector('input[name="' + this.blockID + '-position"][value="' + data.position + '"]').checked = true;
    }
    // Set the radio button value for width
    if(data.width){
      this.inner.querySelectorAll('input[name="' + this.blockID + '-width"][value="' + data.width + '"]')[0].checked = true;
    }
    // Set the input value for the image link
    if(data['image-link']){
      this.inner.querySelector('input[name="' + this.blockID + '-image-link"]').value = data['image-link'];
    }
  },

  onBlockRender: function(){
    this.inner.querySelector('.open-upload-modal').addEventListener('click', function (ev) {
      configureUploadModal('extendedUploadModal', function(data){
        // Remove any error messages
        this.resetMessages();
        // Add the appropriate id or display an error message and exit the process
        if(data.imageId !== ''){
          this.setData({'id': data.imageId});
        }else{
          return this.addMessage('Es wurde keine ID angegeben.');
        }

        Dom.remove(this.inner.querySelector('.imagePreview > img'));
        var imagePreview = Dom.createElement('img', {src: '/uploads/' + data.imageId + '/thumbnail', class: 'thumbnail'});
        this.inner.querySelector('.imagePreview').appendChild(imagePreview);
      }.bind(this));
      $('#extendedUploadModal').modal('show');
    }.bind(this));
  }
});
