"use strict";

var config = require('../config');

module.exports = function({name, title, cmd, iconName}) {
  return `
    <button type="button" class="st-format-btn st-format-btn--${name}"
      title="${i18n.t('formatButtons:' + title)}" data-cmd="${cmd}">
      <svg role="img" class="st-icon">
        <use xlink:href="${config.defaults.iconUrl}#${iconName}"/>
      </svg>
    </button>
  `;
};
