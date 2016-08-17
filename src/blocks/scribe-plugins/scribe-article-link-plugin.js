"use strict";

var scribeArticleLinkPlugin = function() {
  return function(scribe) {
    var articleLinkCommand = new scribe.api.Command('article-link');
    articleLinkCommand.nodeName = 'A';

    articleLinkCommand.execute = function articleLinkCommandExecute(){
      showAutocompleteModal({
        entityName: 'bavarikon',
        title: "Artikelwahl",
      });
    };

    scribe.commands['article-link'] = articleLinkCommand;
  };
};

module.exports = scribeArticleLinkPlugin;
