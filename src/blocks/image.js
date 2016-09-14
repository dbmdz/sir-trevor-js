"use strict";

var Dom = require('../packages/dom');
var Block = require('../block');

module.exports = Block.extend({

  type: "image",

  icon_name: 'image',

  editorHTML: function () {
    var blockId = this.blockID;
    return '<div class="imageBlock">' +
           '<div class="imageUpload">' +
           '  <a class="btn btn-primary btn-xs open-upload-modal">Bild auswählen</a> oder bekannte ID eingeben' +
           '  <input type="text" pattern="[0-9]*" class="js-image-id" data-name="id"/>' +
           '</div>' +
           '<div class="imageFormatting">' +
           '  <b>Ausrichtung:</b> <input type="radio" name="' + blockId + '-position" data-name="position" value="left">links <input type="radio" name="' + blockId + '-position" data-name="position" value="right">rechts<br/>' +
           '  <b>Breite:</b> <input type="radio" name="' + blockId + '-width" data-name="width" value="25%">25% <input type="radio" name="' + blockId + '-width" data-name="width" value="33%">33% <input type="radio" name="' + blockId + '-width" data-name="width" value="50%">50% <input type="radio" name="' + blockId + '-width" data-name="width" value="100%">100%' +
           '</div>' +
           '</div>';
  },

  loadData: function(data){
    // retrieve the input field for the image id
    var idInput = this.inner.querySelector('.js-image-id');

    // set the image id as value for the input field
    idInput.value = data.id;

    // Create our image tag
    Dom.insertAfter(Dom.createElement('img', {src: "/uploads/" + data.id + "/thumbnail", class: "thumbnail"}), idInput);

    // set radio button value for position
    if(data.position){
      this.inner.querySelector('input[name="' + this.blockID + '-position"][value="' + data.position + '"]').checked = true;
    }
    // set radio button value for width
    if(data.width){
      this.inner.querySelectorAll('input[name="' + this.blockID + '-width"][value="' + data.width + '"]')[0].checked = true;
    }
  },

  onBlockRender: function(){
    this.inner.querySelector('.open-upload-modal').addEventListener('click', function (ev) {
      configureUploadModal('uploadModal', function(data){
        var idInput = this.inner.querySelector('.js-image-id');
        idInput.value = data.imageId;
        Dom.remove(this.inner.querySelector('img'));
        Dom.insertAfter(Dom.createElement('img', {src: "/uploads/" + data.imageId + "/thumbnail", class: "thumbnail"}), idInput);
      }.bind(this));
      $('#uploadModal').modal('show');
    }.bind(this));
  }
});
