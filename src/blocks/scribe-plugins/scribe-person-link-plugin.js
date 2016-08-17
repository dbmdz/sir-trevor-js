"use strict";

var scribePersonLinkPlugin = function() {
  return function(scribe) {
    var personLinkCommand = new scribe.api.Command('person-link');
    personLinkCommand.nodeName = 'A';

    personLinkCommand.execute = function personLinkCommandExecute(){
      showAutocompleteModal({
        entityName: 'person',
        title: "Personenwahl",
      });
    };

    scribe.commands['person-link'] = personLinkCommand;
  };
};

module.exports = scribePersonLinkPlugin;
