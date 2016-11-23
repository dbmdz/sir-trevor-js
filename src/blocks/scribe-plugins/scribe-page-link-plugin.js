'use strict';

var scribePageLinkPlugin = function(){
  return function(scribe){
    var pageLinkCommand = new scribe.api.Command('page-link');
    pageLinkCommand.nodeName = 'A';

    pageLinkCommand.execute = function pageLinkCommandExecute(){
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
        title: 'CMS-Seite wählen',
      });
    };

    scribe.commands['page-link'] = pageLinkCommand;
  };
};

module.exports = scribePageLinkPlugin;
