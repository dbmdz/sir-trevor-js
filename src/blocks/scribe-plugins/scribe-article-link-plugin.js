'use strict';

var scribeArticleLinkPlugin = function(){
  return function(scribe){
    var articleLinkCommand = new scribe.api.Command('article-link');
    articleLinkCommand.nodeName = 'A';

    articleLinkCommand.execute = function articleLinkCommandExecute(){
      var selection = new scribe.api.Selection().selection.toString();
      showAutocompleteModal(selection, {
        entityName: 'bavarikon',
        remoteDef: {
          url: '/api/pages?q=%QUERY',
          filter: function(parsedResponse){
            return _.map(parsedResponse, function(entry){
              return {
                value: entry.title + ' (' + entry.type + ')',
                url: '/cms/' + entry.type + '/' + entry.id
              };
            });
          },
          ajax: {
            dataType: 'json'
          }
        },
        title: 'Artikelwahl',
      });
    };

    scribe.commands['article-link'] = articleLinkCommand;
  };
};

module.exports = scribeArticleLinkPlugin;
