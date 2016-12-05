'use strict';

var scribeBavObjectLinkPlugin = function(){
  return function(scribe){
    var bavObjectLinkCommand = new scribe.api.Command('bavobject-link');
    bavObjectLinkCommand.nodeName = 'A';

    bavObjectLinkCommand.execute = function bavObjectLinkCommandExecute(){
      var selectionObject = new scribe.api.Selection();
      showAutocompleteModal(selectionObject, {
        entityName: 'bavobject',
        remoteDef: {
          url: '/api/artifacts?q=%QUERY',
          filter: function(parsedResponse){
            return _.map(parsedResponse, function(entry){
              return {
                value: entry.title,
                url: '/object/' + entry.id
              };
            });
          },
          ajax: {
            dataType: 'json'
          }
        },
        title: 'Kulturobjekt wählen',
      });
    };

    scribe.commands['bavobject-link'] = bavObjectLinkCommand;
  };
};

module.exports = scribeBavObjectLinkPlugin;
