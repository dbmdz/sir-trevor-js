"use strict";

/*
  Simple kpbArtifact Block
*/

var Block = require('../block');
var stToHTML = require('../to-html');
var Dom = require('../packages/dom');

var searchEngine = new Bloodhound({
  name: 'articles',
  remote: {
    url: '/api/artifacts?q=%QUERY',
    filter: function(parsedResponse) {
      return _.map(parsedResponse, function(entry) {
        return { value: entry.title,
                 id: entry.id }
      });
    },
    ajax: {dataType: 'json'}
  },
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value')
});
searchEngine.initialize();

var viewTemplate = _.template([
  '<div class="bavobject-preview clearfix">',
    '<div class="thumb"><img src="/iiif/<%= previewId %>/full/200,/0/native.jpg"></div>',
    '<div class="description">',
      '<h5><%= title %></h5>',
      '<p class="creation-date"><%= creationDate %></p>',
      '<p class="authors"><% creationPersons.join("; ") %></p>',
      '<p class="publishing-places"><% creationLocations.join("; ") %></p>',
      '<p class="digital-copy"><a href="/object/<%= id %>" target="_blank">Zum Digitalisat</a></p>',
    '</div>',
  '</div>'
].join("\n"));

module.exports = Block.extend({
  type: "kpb_artifact",

  icon_name: 'link',

  editorHTML: function() {
    return '<form class="form-horizontal" role="form">' +
           '  <div class="form-group">' +
           '    <label class="col-sm-3 control-label">bav-ID</label>' +
           '    <div class="col-sm-9">' +
           '      <input type="text" class="form-control js-kpbartifact-id" placeholder="bav-ID" data-name="id">' +
           '    </div>' +
           '  </div>' +
           '  <div class="form-group">' +
           '    <label class="col-sm-3 control-label">Vorschauseite</label>' +
           '    <div class="col-sm-9">' +
           '      <input type="text" class="form-control js-kpbartifact-preview-page" placeholder="Vorschauseite" data-name="previewPage">' +
           '    </div>' +
           '  </div>' +
           '  <div class="form-group">' +
           '    <div class="col-sm-offset-3 col-sm-9">' +
           '      <div class="checkbox">' +
           '        <label>' +
           '          <input type="checkbox" class="js-kpbartifact-position" data-name="position"> Rechts ausrichten' +
           '        </label>' +
           '      </div>' +
           '    </div>' +
           '  </div>' +
           '</form>';
  },

  fetchable: true,
  kpbData: {},

  fetchUrl: function(id) {
    if (id.slice(0, 3) === 'bsb') id = 'BSB-MDZ-00000BSB' + id.slice(3);
    return '/api/artifacts/' + id;
  },

  onFetchSuccess: function(data) {
    var preview = this.inner.querySelector('.js-kpbartifact-preview-page').value;
    if (!_.isEmpty(preview)) {
      var oldId = data.previewId;
      data.previewId = oldId.slice(0, oldId.length - preview.length) + preview;
    }
    this.$inner.prepend(viewTemplate(data));
    this.ready();
  },

  onFetchFail: function() {
    this.addMessage("Objekt konnte nicht geladen werden.");
    this.ready();
  },

  fetchData: function(id) {
    this.fetch({url: this.fetchUrl(id), dataType: "json"},
                this.onFetchSuccess, this.onFetchFail);
  },

  loadData: function(data){
    if (!_.isEmpty(data.id)) this.fetchData(data.id);
    var idInput = this.inner.querySelector('.js-kpbartifact-id');
    idInput.value = data.id;
    this.inner.querySelector('.js-kpbartifact-preview-page').value = data.previewPage;
    if ( data.position === 'on' ) this.inner.querySelector('.js-kpbartifact-position').checked = true;
    $(idInput).on('blur', function(e) {
      Dom.remove(this.inner.querySelector('.bavobject-preview'));
      this.fetchData(e.target.value);
    }.bind(this));
    $(idInput).typeahead({hint: true}, {
      name: 'kpbartifact-complete-' + this.blockID,
      displayKey: 'id',
      templates: {
        suggestion: function(datum) {
          return '<p>' + datum.value + ' (' + datum.id + ')</p>';
        }
      },
      source: searchEngine.ttAdapter()
    });
    $(idInput).on('typeahead:selected', function() {
      $(idInput).trigger('blur');
    });
  },
});
