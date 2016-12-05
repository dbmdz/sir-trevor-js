'use strict';

var scribePersonLinkPlugin = function(){
  return function(scribe){
    var personLinkCommand = new scribe.api.Command('person-link');
    personLinkCommand.nodeName = 'A';

    personLinkCommand.execute = function personLinkCommandExecute(){
      var selectionObject = new scribe.api.Selection();
      showAutocompleteModal(selectionObject, {
        entityName: 'person',
        remoteDef: {
          url: '//lobid.org/person?q=%QUERY&format=ids',
          filter: function(parsedResponse){
            return _.map(parsedResponse, function(entry) {
              return {
                value: entry.label,
                url: entry.value
              };
            });
          },
          ajax: {
            dataType: 'jsonp'
          }
        },
        title: 'Person wählen'
      });
    };

    scribe.commands['person-link'] = personLinkCommand;
  };
};

module.exports = scribePersonLinkPlugin;
