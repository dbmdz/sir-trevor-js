"use strict";

var _ = require('./lodash');
var Scribe = require('scribe-editor');
var config = require('./config');

var scribePluginFormatterPlainTextConvertNewLinesToHTML = require('scribe-plugin-formatter-plain-text-convert-new-lines-to-html');
var scribePluginLinkPromptCommand = require('scribe-plugin-link-prompt-command');
var scribePluginSanitizer = require('scribe-plugin-sanitizer');
var scribePersonLinkPlugin = require('./blocks/scribe-plugins/scribe-person-link-plugin');
var scribeArticleLinkPlugin = require('./blocks/scribe-plugins/scribe-article-link-plugin');
var scribePlaceLinkPlugin = require('./blocks/scribe-plugins/scribe-place-link-plugin');
var scribeBavObjectLinkPlugin = require('./blocks/scribe-plugins/scribe-bavobject-link-plugin');

var sanitizeDefaults = {
  p: true,
  a: {
    href: true,
    target: '_blank',
    rel: true,
    title: true
  },
  i: true,
  b: true,
  strong: true,
  em: true
};

module.exports = {

  initScribeInstance: function(el, scribeOptions, configureScribe) {

    scribeOptions = scribeOptions || {};

    var scribeConfig = {debug: config.scribeDebug};
    var tags = sanitizeDefaults;

    if (_.isObject(scribeOptions)) {
      scribeConfig = Object.assign(scribeConfig, scribeOptions);
    }

    var scribe = new Scribe(el, scribeConfig);

    if (scribeOptions.hasOwnProperty("tags")) {
      tags = Object.assign(sanitizeDefaults, scribeOptions.tags);
    }

    scribe.use(scribePluginFormatterPlainTextConvertNewLinesToHTML());
    scribe.use(scribePluginLinkPromptCommand());
    scribe.use(scribePluginSanitizer({tags: tags}));
    scribe.use(scribePersonLinkPlugin());
    scribe.use(scribeArticleLinkPlugin());
    scribe.use(scribePlaceLinkPlugin());
    scribe.use(scribeBavObjectLinkPlugin());

    if (_.isFunction(configureScribe)) {
      configureScribe.call(this, scribe);
    }

    return scribe;
  },

  execTextBlockCommand: function(scribeInstance, cmdName) {
    if (_.isUndefined(scribeInstance)) {
      throw "No Scribe instance found to query command";
    }

    var cmd = scribeInstance.getCommand(cmdName);
    scribeInstance.el.focus();
    return cmd.execute();
  },

  queryTextBlockCommandState: function(scribeInstance, cmdName) {
    if (_.isUndefined(scribeInstance)) {
      throw "No Scribe instance found to query command";
    }

    var cmd = scribeInstance.getCommand(cmdName),
        sel = new scribeInstance.api.Selection();
    return sel.range && cmd.queryState();
  },
};
