"use strict";

var Dom = require('../packages/dom');
var Block = require('../block');

module.exports = Block.extend({

  type: 'image',
  icon_name: 'image',
  fetchable: true,

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
           '    <input type="text" class="form-control" name="' + blockId + '-image-link" data-name="image-link" placeholder="/object/bav-ID" />' +
           '  </div>' +
           '  <div class="col-lg-4 col-md-4 imageDisplay">' +
           '    <div class="imagePreview"></div>' +
           '  </div>' +
           '</div>';
  },

  loadData: function(data){
    // Create our image tag
    this.insertThumbnail(data);

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
        if(data.objectID === '' && data.imageId === ''){
          return this.addMessage('Es wurde keine ID angegeben.');
        }else{
          this.insertThumbnail(data);
        }
      }.bind(this));
      $('#extendedUploadModal').modal('show');
    }.bind(this));
  },

  fetchUrl: function(id){
    if(id.slice(0, 3) === 'bsb'){
      id = 'BSB-MDZ-00000BSB' + id.slice(3);
    }
    return '/api/artifacts/' + id;
  },

  onFetchSuccess: function(data){
    // Get the thumbnail corresponding to the given id
    var thumbnailImage = this.inner.querySelector('.imagePreview > img');
    // Create the image tag and append it to the thumbnail div
    thumbnailImage.setAttribute('src', '/iiif/' + data.previewId + '/full/200,/0/native.jpg');
    this.setData({'id': {
      'type': 'object',
      'value': data.previewId
    }});
    this.ready();
  },

  onFetchFail: function(){
    // Display an error message
    this.addMessage('Objekt konnte nicht geladen werden.');
    this.ready();
  },

  fetchData: function(objectId){
    // Remove any error messages
    this.resetMessages();
    // Fetch information on the object
    this.fetch(
      this.fetchUrl(objectId), { dataType: 'json' },
      this.onFetchSuccess.bind(this),
      this.onFetchFail.bind(this)
    );
  },

  insertThumbnail: function(data){
    var thumbnailWrapper = this.inner.querySelector('.imagePreview');

    thumbnailWrapper.classList.add('thumbnail');

    if(data.objectID && data.objectID !== ''){
      thumbnailWrapper.innerHTML = '<img class="img-responsive" src="/img/preloader.gif">';
      this.fetchData(data.objectID);
    }else if(data.imageId && data.imageId !== ''){
      this.setData({'id': {
        'type': 'image',
        'value': data.imageId
      }});
      thumbnailWrapper.innerHTML = '<img class="img-responsive" src="/uploads/' + data.imageId + '/thumbnail">';
    }else if(data.id && typeof data.id === 'string'){
      thumbnailWrapper.innerHTML = '<img class="img-responsive" src="/uploads/' + data.id + '/thumbnail">';
    }else if(data.id && typeof data.id === 'object'){
      if(data.id.type === 'image'){
        thumbnailWrapper.innerHTML = '<img class="img-responsive" src="/uploads/' + data.id.value + '/thumbnail">';
      }else if(data.id.type === 'object'){
        thumbnailWrapper.innerHTML = '<img class="img-responsive" src="/img/preloader.gif">';
        this.fetchData(data.id.value);
      }
    }
  }
});
