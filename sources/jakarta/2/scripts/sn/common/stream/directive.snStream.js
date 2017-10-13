/*! RESOURCE: /scripts/sn/common/stream/directive.snStream.js */
angular.module("sn.common.stream").directive("snStream", function(getTemplateUrl, $http, $sce, $sanitize) {
  "use strict";
  return {
    restrict: "E",
    replace: true,
    scope: {
      table: "=",
      query: "=?",
      sysId: "=?",
      active: "=",
      controls: "=?",
      showCommentsAndWorkNotes: "=?",
      previousActivity: "=?",
      sessions: "=",
      attachments: "=",
      board: "=",
      formJournalFields: "=",
      useMultipleInputs: "=?",
      preferredInput: "=",
      labels: "=",
      subStream: "=",
      expandEntries: "=",
      scaleAnimatedGifs: "=",
      scaleImages: "=",
      pageSize: "=",
      maxEntries: "@"
    },
    templateUrl: getTemplateUrl("ng_activity_stream.xml"),
    controller: "snStream",
    link: function(scope, element) {
      element.on("click", ".at-mention", function(evt) {
        var userID = angular.element(evt.target).attr('class').substring("at-mention at-mention-user-".length);
        $http({
          url: '/api/now/form/mention/user/' + userID,
          method: "GET"
        }).then(function(response) {
          scope.showPopover = true;
          scope.mentionPopoverProfile = response.data.result;
          scope.clickEvent = evt;
        }, function() {
          $http({
            url: '/api/now/live/profiles/' + userID,
            method: "GET"
          }).then(function(response) {
            scope.showPopover = true;
            var tempProfile = response.data.result;
            tempProfile.userID = tempProfile.sys_id = response.data.result.document;
            scope.mentionPopoverProfile = tempProfile;
            scope.mentionPopoverProfile.sysID = response.data.result["userID"];
            scope.clickEvent = evt;
          })
        });
      });
      scope.toggleEmailIframe = function(email, event) {
        email.expanded = !email.expanded;
        event.preventDefault();
      };
    }
  };
});;