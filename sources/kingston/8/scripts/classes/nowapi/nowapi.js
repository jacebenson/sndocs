/*! RESOURCE: /scripts/classes/nowapi/nowapi.js */
"use strict";
window.nowapi = {
  g_guid: {
    generate: function(l) {
      var l = l || 32,
        strResult = '';
      while (strResult.length < l)
        strResult += (((1 + Math.random() + new Date().getTime()) * 0x10000) | 0).toString(16).substring(1);
      return strResult.substr(0, l);
    }
  },
  g_document: {
    getElement: function(selector, context) {
      context = context || document;
      return context.querySelector(selector);
    },
    getElements: function(selector, context) {
      context = context || document;
      return context.querySelectorAll(selector);
    },
    createElement: function(tagname) {
      return document.createElement(tagname);
    }
  },
  g_navigation: window.g_navigation,
  g_api: 2
};
angular.injector(['ng']).invoke(function($log) {
  window.nowapi.log = $log.log;
  window.jslog = window.jslog || $log.log;
});;