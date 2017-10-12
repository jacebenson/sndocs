/*! RESOURCE: /scripts/sn/common/stream/controller.Stream.js */
angular.module("sn.common.stream").controller("Stream", function($rootScope, $scope, snRecordWatcher, $timeout) {
      var isForm = NOW.sysId.length > 0;
      $scope.showCommentsAndWorkNotes = isForm;
      $scope.sessions = {};
      $scope.recordStreamOpen = false;
      $scope.streamHidden = true;
      $scope.recordSysId = '';
      $scope.recordDisplayValue = '';
      $scope.$on('record.updated', onRecordUpdated);
      $rootScope.$on('sn.sessions', onSessions);
      $timeout(function() {
        if (isForm)
          snRecordWatcher.initRecord(NOW.targetTable, NOW.sysId);
        else
          snRecordWatcher.initList(NOW.targetTable, NOW.tableQuery);
      }, 100);
      $scope.controls = {
        showRecord: function($event, entry, sysId) {
          if (sysId !== '')
            return;
          if ($event.currentTarget != $event.target && $event.target.tagName == 'A')
            return;
          $scope.recordSysId = entry.document_id;
          $scope.recordDisplayValue = entry.display_value;
          $scope.recordStreamOpen = true;
          $scope.streamHidden = true;
        },
        openRecord: function() {
          var targetFrame = window.self;
          var url = NOW.targetTable + ".do?sys_id=" + $scope.recordSysId;
          if (NOW.linkTarget == 'form_pane') {
            url += "&sysparm_clear_stack=true";
            window.parent.CustomEvent.fireTop(
              "glide:nav_open_url", {
                url: url,
                openInForm: true
              });
            return;
          }
          if (NOW.streamLinkTarget == 'parent' || NOW.concourse == 'true')
            targetFrame = window.parent;
          targetFrame.location = url;
        },
        openAttachment: function(event, sysId) {
          event.stopPropagation();
          var url = "/sys_attachment.do?view=true&sys_id=" + sysId;
          var newTab = window.open(url, '_blank');
          newTab.focus();
        }
      };
      $scope.sessionCount = function() {
        $scope.sessions.length = Object.keys($scope.sessions.data).length;
        return $scope.sessions.length;
      };

      function onSessions(name, sessions) {
        $scope.sessions.data = sessions;
        $scope.sessionCount();
      }

      function onRecordUpdated(name, data) {}
      $scope.showListStream = function() {
        $scope.recordStreamOpen = false;
        $scope.recordHidden = false;
        $scope.streamHidden = false;
        angular.element('div.list-stream-record').velocity('snTransition.streamSlideRight', {
          duration: 400
        });
        angular.element('[streamType="list"]').velocity('snTransition.slideIn', {
          duration: 400,
          complete: function(element) {
            angular.element(element).css({
              display: 'block'
            });
          }
        });
      };
      $scope.$watch(function() {
            return angular.element('div.list-stream-record').length
          }, function(newValue, oldValue) {
            if (newValue == 1) {
              angular.element('div.list-stream-record').delay(100).velocity('snTransition.streamSlideLeft', {
                    begin: function(element) {
                        angular.element(element).css({
                          visibility: 'visible'
                        });
                        angular.element('.list-stream-record-header').css(