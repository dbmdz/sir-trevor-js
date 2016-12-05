'use strict';

var scribePlaceLinkPlugin = function(){
  return function(scribe){
    var placeLinkCommand = new scribe.api.Command('place-link');
    placeLinkCommand.nodeName = 'A';

    placeLinkCommand.execute = function placeLinkCommandExecute(){
      var selectionObject = new scribe.api.Selection();
      showAutocompleteModal(selectionObject, {
        entityName: 'place',
        remoteDef: {
          url: '/api/places?q=%QUERY',
          filter: function(parsedResponse){
            return _.map(parsedResponse.ergebnisse, function(entry){
              return {
                value: entry.name,
                url: 'http://odb.bavarikon.de/exist/apps/odb/details.html?id=' + entry.oid
              };
            });
          },
          ajax: {
            dataType: 'json'
          }
        },
        title: 'Ort wählen',
      });
    };

    scribe.commands['place-link'] = placeLinkCommand;
  };
};

module.exports = scribePlaceLinkPlugin;
