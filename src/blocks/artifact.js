"use strict";

/*
  Simple Artifact Block
*/

var Dom = require('../packages/dom');
var Block = require('../block');
var stToHTML = require('../to-html');

module.exports = Block.extend({
  type: "artifact",

  icon_name: 'link',

  editorHTML: function() {
    return '<form class="form-horizontal" role="form">' +
           '  <div class="form-group">' +
           '    <label class="col-sm-3 control-label">Link</label>' +
           '    <div class="col-sm-9">' +
           '      <input type="text" class="form-control js-artifact-link" data-name="link" placeholder="Link">' +
           '    </div>' +
           '  </div>' +
           '  <div class="form-group">' +
           '    <label class="col-sm-3 control-label">Preview</label>' +
           '    <div class="col-sm-9">' +
           '      <a class="btn btn-primary-btn btn-xs open-upload-modal">Bild auswählen</a>' +
           '      <input type="hidden" class="form-control js-artifact-preview" data-name="preview">' +
           '    </div>' +
           '  </div>' +
           '</form>' +
           '<div class="st-required st-text-block" contenteditable="true"></div>';
  },

  onBlockRender: function(){
    /* Setup the upload button */
    this.inner.querySelector('.open-upload-modal').addEventListener('click', function (ev) {
      configureUploadModal('uploadModal', function(data) {
        var idInput = this.inner.querySelector('.js-artifact-preview');
        var $input = this.$('.js-artifact-preview');
        idInput.value = data.result.files[0].name;
        Dom.remove(this.inner.querySelector('img'));
        Dom.insertAfter(Dom.createElement('img', {src: data.result.files[0].thumbnailUrl}), idInput);
      }.bind(this));
      $('#uploadModal').modal('show');
    }.bind(this));
  },

  loadData: function(data){
    // Set the text to the text block
    this.inner.querySelector('.st-text-block').innerHTML = data.text;

    // Set the values for the fields
    var previewInput = this.inner.querySelector('.js-artifact-preview');
    previewInput.value = data.preview;
    this.inner.querySelector('.js-artifact-link').value = data.link;
    if (data.preview) {
      Dom.insertAfter(Dom.createElement('img', {src: "/uploads/" + data.preview + "/thumbnail"}), previewInput);
    }
  },
});
