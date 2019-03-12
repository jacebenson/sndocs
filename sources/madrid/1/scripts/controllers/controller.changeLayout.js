/*! RESOURCE: /scripts/controllers/controller.changeLayout.js */
angular.module('homeApp', ['sn.base', 'ngSanitize']).controller('changeLayoutController', ['LayoutService', '$document', '$scope', '$timeout', '$window', function(layoutService, $document, $scope, $timeout, $window) {
  "use strict";
  this.showLayoutPicker = false;
  this.currentLayout = null;
  this.layoutService = layoutService;
  var isHomePage = $window.location.pathname.indexOf('home.do') > -1;
  $scope.showConvertBtn = !isHomePage && window.SNC && window.SNC.canvas && window.SNC.canvas.isGridCanvasActive;
  var that = this;
  this.previewLayout = function() {
    var ajax = new GlideAjax("com.glideapp.home.LayoutPreview");
    ajax.addParam("name", this.currentLayout.id);
    ajax.addParam("className", "layout_changer_preview");
    ajax.addParam("showInnerText", "false");
    ajax.addParam("normalizeTables", "true");
    ajax.getXMLAnswer(this.previewLayoutResponse);
    gel('layout_table_wrap').innerHTML = '';
  };
  this.layoutService.fetchLayouts(glideGrid.getProperty("sys_id")).then(function() {
    that.allLayouts = that.layoutService.getLayouts();
    that.currentLayout = that.layoutService.getCurrentLayout();
  });
  this.previewLayoutResponse = function(answer) {
    $scope.$apply(function() {
      gel('layout_table_wrap').innerHTML = answer;
    });
  };
  this.togglePicker = function(event) {
    if (event)
      event.stopPropagation();
    this.showLayoutPicker = !this.showLayoutPicker;
    if (this.showLayoutPicker) {
      $timeout(function() {
        $("layoutPickerDiv").focus();
      });
    }
  };
  this.changePage = function() {
    if (this.selectValue == 'change_layout') {
      this.togglePicker();
      this.selectValue = "";
      $j("#page_selector")[0].selectedIndex = 0;
      $j("#page_selector").select2();
    } else if (this.selectValue == '_new_') {
      var ajax = new GlideAjax("HomePageAjax");
      ajax.addParam("sysparm_name", "homeCreate");
      ajax.getXML(homeAjaxResponse);
    } else if (this.selectValue != "")
      redirectPage(this.selectValue);
  };
  this.changeLayout = function() {
    var ajax = new GlideAjax("HomeLayout");
    ajax.addParam("sysparm_type", "set");
    ajax.addParam("sysparm_view", glideGrid.getProperty('view'));
    ajax.addParam("sysparm_value", glideGrid.getDescribingText());
    ajax.addParam("sysparm_name", glideGrid.getProperty('sys_id'))
    ajax.addParam("sysparm_chars", glideGrid.getProperty('instance_id'));
    ajax.addParam("sysparm_layout", this.currentLayout.id);
    ajax.getXML(this.postLayout);
  };
  this.convertToCanvas = function() {
    var queryParams = window.location.search;
    window.location = '$canvas.do' + queryParams + '&sysparm_pageid=' + glideGrid.getProperty('sys_id');
  };
  this.postLayout = function(request) {
    var xml = request.responseXML;
    var created = xml.documentElement.getAttribute("sysparm_created");
    if (created == "true") {
      var uid = xml.documentElement.getAttribute("sysparm_name");
      redirectPage(uid)
    } else
      homeRefresh();
  };
  $scope.$watch(function() {
    return that.currentLayout;
  }, function(newValue, oldValue) {
    if (oldValue != newValue)
      that.previewLayout();
  });
  this.isHighlighted = function(layout) {
    return this.currentLayout == layout;
  };
  this.handleKeyStrokes = function(event) {
    var layouts = this.filteredLayouts;
    if (event.keyCode == 40) {
      if (!this.currentLayout)
        this.currentLayout = layouts[0];
      else if (this.currentLayout != layouts[layouts.length - 1]) {
        var newIndex = this.getLayoutIndex(this.currentLayout, layouts) + 1;
        this.currentLayout = layouts[newIndex]
      }
      event.preventDefault();
    } else if (event.keyCode == 38) {
      if (!this.currentLayout)
        this.currentLayout = layouts[layouts.length - 1];
      else if (this.currentLayout != layouts[0]) {
        var newIndex = this.getLayoutIndex(this.currentLayout, layouts) - 1;
        this.currentLayout = layouts[newIndex]
      }
      event.preventDefault();
    }
  };
  this.stopDownStrokes = function(event) {
    if (event.keyCode == 40 || event.keyCode == 38)
      event.preventDefault();
  };
  this.getLayoutIndex = function(layout, layouts) {
    for (var i = 0; i < layouts.length; ++i) {
      if (layouts[i].id == layout.id)
        return i;
    }
    return -1;
  };
}]);
angular.element(document).ready(function() {
  var element = angular.element(document.getElementById('top_link_add'));
  var isInitialized = element.injector();
  if (!isInitialized)
    angular.bootstrap(element, ['homeApp']);
});;