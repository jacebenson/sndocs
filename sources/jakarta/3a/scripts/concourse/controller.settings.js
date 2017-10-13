/*! RESOURCE: /scripts/concourse/controller.settings.js */
angular.module('sn.concourse').controller('settings', function($scope, $timeout, getTemplateUrl, i18n, snCustomEvent, modalPath, shouldModalOpen, viewStackService, concourseSettings) {
  "use strict";
  $scope.settings = angular.extend({}, concourseSettings);
  $scope.animateViewStackHeaders = false;
  activate();
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
    back($event.type === 'keypress');
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

  function back(focusPreviousElement) {
    if ($scope.viewStack.length === 1) {
      return;
    }
    var view = $scope.viewStack.pop();
    $scope.$broadcast('concourse_settings.view.closed', view);
    if (focusPreviousElement && view.previouslyFocusedElement) {
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
      openView(part);
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
    return parts;
  }

  function toggleModal(bool) {
    var message = bool ? 'dialog.settingsModal.show' : 'dialog.settingsModal.close';
    $scope.$evalAsync(function() {
      $scope.$broadcast(message);
    });
  }
});;