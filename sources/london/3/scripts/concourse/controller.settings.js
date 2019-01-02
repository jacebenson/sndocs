/*! RESOURCE: /scripts/concourse/controller.settings.js */
angular.module('sn.concourse').controller('settings', function($scope, $timeout, glideUrlBuilder, getTemplateUrl, i18n, snCustomEvent, modalPath, shouldModalOpen, viewStackService, concourseSettings) {
  "use strict";
  $scope.settings = angular.extend({}, concourseSettings);
  $scope.animateViewStackHeaders = false;
  activate();

  function updateAriaRecordMessage(event) {
    if (!event || !event.action)
      return;
    var ariaMsg = '';
    if (event.action === 'sysverb_insert')
      ariaMsg = i18n.getMessage('record inserted');
    else if (event.action === 'sysverb_update')
      ariaMsg = i18n.getMessage('record updated');
    else if (event.action === 'sysverb_delete')
      ariaMsg = i18n.getMessage('record deleted');
    clearAriaLiveRegion();
    var ariaRecordMsgElem = angular.element('#aria_live_iframe_action');
    if (ariaRecordMsgElem.length) {
      var actionMsgSpan = angular.element("<span id='iframe_action_message'>" + ariaMsg + "</span>");
      ariaRecordMsgElem.append(actionMsgSpan);
    }
  }

  function clearAriaLiveRegion() {
    var ariaRecordMsgElem = angular.element('#iframe_action_message');
    if (ariaRecordMsgElem.length)
      ariaRecordMsgElem.remove();
  }
  snCustomEvent.on('iframe_form.sysverb_insert', updateAriaRecordMessage);
  snCustomEvent.on('iframe_form.sysverb_delete', updateAriaRecordMessage);
  snCustomEvent.on('iframe_form.sysverb_update', updateAriaRecordMessage);
  $scope.previousView = function previousView() {
    if ($scope.viewStack.length > 1) {
      return $scope.viewStack[$scope.viewStack.length - 2];
    }
  };
  $scope.currentView = function currentView() {
    return $scope.viewStack[$scope.viewStack.length - 1];
  };
  $scope.getViewTemplate = function getViewTemplate(view) {
    return getTemplateUrl(view.template);
  };
  $scope.openView = openView;
  $scope.back = function($event) {
    if ($event.type === 'keypress' && $event.keyCode !== 13 && $event.keyCode !== 32) {
      return;
    }
    if ($event.type === 'keypress' && ($event.keyCode === 13 || $event.keyCode === 32)) {
      $event.preventDefault();
      $event.stopPropagation();
    }
    back();
  };
  $scope.$on('dialog.settingsModal.show', function() {
    $scope.$broadcast('concourse_settings.view.refresh');
  });
  $scope.$on('concourse_settings.view.open', function(e, data) {
    _addViewObject(data)
  });
  $scope.$on('concourse_settings.view.back', function() {
    back(true);
  });
  $scope.$on('concourse_settings.view.render_complete', function() {
    initialFocus();
  });

  function initialFocus() {
    var currentView = $scope.currentView();
    if (!currentView)
      return;
    if (currentView.initialFocusSet)
      return;
    if (currentView.initFocus) {
      currentView.initialFocusSet = true;
      $timeout(function() {
        var elem = angular.element(currentView.initFocus);
        if (elem.length)
          elem[0].focus();
      });
    }
  }

  function back() {
    if ($scope.viewStack.length === 1) {
      return;
    }
    var view = $scope.viewStack.pop();
    $scope.$broadcast('concourse_settings.view.closed', view);
    if (view.previouslyFocusedElement) {
      $timeout(function() {
        view.previouslyFocusedElement.focus();
      });
    } else if ($scope.viewStack.length === 1) {
      angular.element('[data-tab-name=' + $scope.viewStack[0].name + ']').focus();
    }
  }

  function activate() {
    $scope.viewStack = [viewStackService.get("general")];
    $scope.views = viewStackService.getTopLevelViews();
    if (!modalPath)
      return;
    var parts = getModalPathParts();
    parts.forEach(function(part) {
      openView(part.view, part.options);
    });
    if (shouldModalOpen)
      toggleModal(true);
  }

  function openView(view, options) {
    var view = viewStackService.get(view, options);
    _addViewObject(view);
  }

  function _addViewObject(view) {
    if (view.replace) {
      $scope.viewStack = [];
      $scope.animateViewStackHeaders = false;
    }
    $scope.viewStack.push(view);
    if ($scope.viewStack.length > 1) {
      $scope.animateViewStackHeaders = true;
    }
  }

  function getModalPathParts() {
    var parts = (modalPath || "").split(".");
    parts.shift();
    var views = [];
    parts.forEach(function(part) {
      var url = glideUrlBuilder.newGlideUrl(part);
      views.push({
        view: url.contextPath,
        options: {
          params: url.getParams()
        }
      });
    })
    return views;
  }

  function toggleModal(bool) {
    var message = bool ? 'dialog.settingsModal.show' : 'dialog.settingsModal.close';
    $scope.$evalAsync(function() {
      $scope.$broadcast(message);
    });
  }
});;