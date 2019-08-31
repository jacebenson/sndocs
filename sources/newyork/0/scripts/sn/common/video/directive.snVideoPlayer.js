/*! RESOURCE: /scripts/sn/common/video/directive.snVideoPlayer.js */
angular.module('sn.common.video').directive('snVideoPlayer', function(getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    scope: {},
    templateUrl: getTemplateUrl('sn_table_cell_video.xml'),
    link: function(scope, element, attrs) {
      scope.name = attrs.name;
      scope.player = new GlideVideoPlayer(attrs);
      scope.playVideo = function() {
        scope.playerActive = !scope.playerActive;
        element.append(scope.player.createPlayer());
        if (attrs.showDownloadLink === 'true' && attrs.attachmentRecord !== '')
          element.append(scope.player.createDownloadLink());
      }
      var playOnLoad = attrs.playOnLoad === 'true';
      if (playOnLoad)
        scope.playVideo();
      else
        scope.playerActive = false;
    }
  }
});;