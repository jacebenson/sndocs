/*! RESOURCE: /scripts/app.$sp/controller.spWidgetDebug.js */
angular.module('sn.$sp').controller('spWidgetDebug', function($scope, $rootScope, $uibModal, $http, spUtil, $window, i18n) {
  $scope.reveal = false;
  $scope.page = $rootScope.page;
  $scope.portal = $rootScope.portal;
  $scope.contextMenu = function(event) {
    var menu = [];
    if (!event.ctrlKey || !$rootScope.user.can_debug)
      return menu;
    var w = $scope.rectangle.widget;
    var n = "'" + w.name + "'";
    menu.push(n + ' ' + i18n.getMessage('generated in') + ': ' + w._server_time);
    menu.push([i18n.getMessage("Instance Options"), editInstance]);
    menu.push([i18n.getMessage('Instance in Page Editor') + ' ➚', instancePageEdit]);
    menu.push([i18n.getMessage('Page in Designer') + ' ➚', openDesigner]);
    menu.push(null);
    menu.push([i18n.getMessage('Edit Container Background'), editBackground]);
    menu.push(null);
    menu.push([i18n.getMessage('Widget Options Schema'), editOptionSchema]);
    menu.push([i18n.getMessage('Widget in Form Modal'), editWidget]);
    menu.push([i18n.getMessage('Widget in Editor') + ' ➚', openWidgetEditor]);
    menu.push(null);
    menu.push([i18n.getMessage('Log to console') + ': $scope.data', logScopeData]);
    menu.push([i18n.getMessage('Log to console') + ': $scope', logScope]);
    return menu;
  }

  function logScope() {
    console.log("Widget $scope.data...", $scope.rectangle.widget);
  }

  function logScopeData() {
    console.log("Widget $scope.data...", $scope.rectangle.widget.data);
  }

  function editWidget() {
    editRecord('sp_widget', $scope.rectangle.widget.sys_id);
  }

  function editInstance() {
    editRecord('sp_instance', $scope.rectangle.sys_id);
  }

  function editBackground() {
    editRecord('sp_container', $scope.container.sys_id);
  }

  function openDesigner() {
    $window.open('/$spd.do#/' + $scope.portal.url_suffix + '/editor/' + $scope.page.id + '/' + $scope.rectangle.sys_id, '$spd.do');
  }

  function openWidgetEditor() {
    openConfig({
      id: 'widget_editor',
      sys_id: $scope.rectangle.widget.sys_id
    });
  }

  function instancePageEdit() {
    openConfig({
      id: 'page_edit',
      p: $scope.page.id,
      table: 'sp_instance',
      sys_id: $scope.rectangle.sys_id
    });
  }

  function editOptionSchema() {
    var data = {
      embeddedWidgetId: 'we20',
      embeddedWidgetOptions: {
        sys_id: $scope.rectangle.widget.sys_id
      }
    };
    spUtil.get('widget-modal', data).then(function(widget) {
      widget.options.afterClose = function() {
        $scope.rectangle.debugModal = null;
        $rootScope.$broadcast('sp.page.reload');
      };
      $scope.rectangle.debugModal = widget;
    });
  }

  function openConfig(params) {
    $window.open('/sp_config?' + $.param(params), 'sp_config');
  }

  function editRecord(table, sys_id) {
    var input = {
      table: table,
      sys_id: sys_id
    };
    spUtil.get('widget-options-config', input).then(function(widget) {
      var myModalCtrl = null;
      widget.options.afterClose = function() {
        $scope.rectangle.debugModal = null;
      };
      widget.options.afterOpen = function(modalCtrl) {
        myModalCtrl = modalCtrl;
      };
      $scope.rectangle.debugModal = widget;
      var unregister = $scope.$on('sp.form.record.updated', function(evt, fields) {
        unregister();
        unregister = null;
        myModalCtrl.close();
        $rootScope.$broadcast('sp.page.reload');
      });
    });
  }
});;