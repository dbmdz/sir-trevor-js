"use strict";

var scribePlaceLinkPlugin = function() {
  return function(scribe) {
    var placeLinkCommand = new scribe.api.Command('place-link');
    placeLinkCommand.nodeName = 'A';

    placeLinkCommand.execute = function placeLinkCommandExecute(){
      showAutocompleteModal({
        entityName: 'place',
        title: "Ortswahl",
      });
    };

    scribe.commands['place-link'] = placeLinkCommand;
  };
};

module.exports = scribePlaceLinkPlugin;
