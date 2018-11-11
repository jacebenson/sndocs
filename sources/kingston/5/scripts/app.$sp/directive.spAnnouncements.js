/*! RESOURCE: /scripts/app.$sp/directive.spAnnouncements.js */
angular.module('sn.$sp').directive('spAnnouncements', function() {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'sp_announcements.xml',
    controllerAs: 'c',
    controller: function($scope, spAnnouncement, spAriaUtil, i18n) {
      var c = this;
      var _announcements;
      c.showAll = false;
      c.announcements = [];
      c.totalAnnouncements = 0;
      c.accessibilityOff = spAriaUtil.g_accessibility === 'false';
      c.i18n = {
        oneOf: i18n.getMessage('1 of'),
        dismiss: i18n.getMessage('Dismiss'),
        collapse: i18n.getMessage('Collapse'),
        expand: i18n.getMessage('Expand'),
        announcement: i18n.getMessage('announcement'),
        announcements: i18n.getMessage('announcements'),
        moreInfo: i18n.getMessage('More information about')
      };

      function _updateCurrentAnnouncements() {
        c.announcements = c.showAll ? _announcements : [_announcements[0]];
      }

      function _getCurrentAnnouncements() {
        c.totalAnnouncements = 0;
        _announcements = spAnnouncement.get(function(announcement) {
          return !announcement.dismissed && spAnnouncement.filterOnType('banner')(announcement);
        });
        if (_announcements.length) {
          c.totalAnnouncements = _announcements.length;
          _announcements = c.totalAnnouncements > 0 ? _announcements : [];
          _updateCurrentAnnouncements();
        }
      }
      c.dismiss = function(id) {
        spAnnouncement.dismiss(id);
      };
      c.toggleShowAll = function() {
        c.showAll = !c.showAll;
        _updateCurrentAnnouncements();
      }
      c.getStyle = function(announcement) {
        var style = announcement.displayStyle || {};
        return {
          backgroundColor: style.backgroundColor || '#006ed5',
          color: style.foregroundColor || '#ffffff',
          textAlign: (style.alignment || 'left').toLowerCase()
        };
      };
      c.getFirstStyle = function() {
        return c.getStyle(c.announcements[0]);
      };
      c.getJustifyContentValue = function(announcement) {
        return (announcement.displayStyle || {}).alignment === 'CENTER' ? 'center' : 'flex-start';
      };
      c.linkSetup = function(a) {
        a.linkTarget = '_self';
        if ('urlNew' === a.clickTarget) {
          a.linkTarget = '_blank';
        }
        a.linkType = !a.targetLink ? 'none' : a.targetLinkText ? 'normal' : 'title';
      };
      c.getAlignementContentValue = function(announcement) {
        return (announcement.displayStyle || {}).alignment === 'CENTER' ? 'static' : 'absolute';
      }
      spAnnouncement.subscribe($scope, _getCurrentAnnouncements);
      _getCurrentAnnouncements();
      $(document).ready(function() {
        $('body').tooltip({
          selector: '[data-toggle="tooltip"]'
        });
      });
    }
  }
});;