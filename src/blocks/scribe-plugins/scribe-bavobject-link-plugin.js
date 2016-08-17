"use strict";

var scribeBavObjectLinkPlugin = function() {
  return function(scribe) {
    var bavObjectLinkCommand = new scribe.api.Command('bavobject-link');
    bavObjectLinkCommand.nodeName = 'A';

    bavObjectLinkCommand.execute = function bavObjectLinkCommandExecute(){
      showAutocompleteModal({
        entityName: 'bavobject',
        title: "Kulturobjekt wählen",
      });
    };

    scribe.commands['bavobject-link'] = bavObjectLinkCommand;
  };
};

module.exports = scribeBavObjectLinkPlugin;
