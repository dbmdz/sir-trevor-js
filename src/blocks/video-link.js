"use strict";

var Block = require('../block');
var Dom = require('../packages/dom');

var videoTemplate = _.template(
  '<video width="100%" controls>' +
  '  <source src="<%= url %>" type="video/mp4">' +
  '</video>'
);

module.exports = Block.extend({

  type: 'video',

  icon_name: 'video',

  pastable: true,

  loadData: function(data){
    // Create the wrapper element
    var videoWrapper = Dom.createElement('div', {class: 'video-wrapper'});
    // Insert the video template with the saved url
    videoWrapper.innerHTML = videoTemplate({ url: data.url });
    // Append it to the DOM
    this.inner.appendChild(videoWrapper);
  },

  onContentPasted: function(event){
    // Set the video data and add them to the block data
    var videoData = {
      url: event.target.value
    };
    this.setData(videoData);

    // Search for an existing wrapper element
    var videoWrapper = this.inner.querySelector('.video-wrapper');
    if(videoWrapper === null){
      // Create the wrapper element and append it to the DOM
      videoWrapper = Dom.createElement('div', {class: 'video-wrapper'});
      this.inner.appendChild(videoWrapper);
    }
    // Set the video template as content of the wrapper element
    videoWrapper.innerHTML = videoTemplate(videoData);
  },
});
