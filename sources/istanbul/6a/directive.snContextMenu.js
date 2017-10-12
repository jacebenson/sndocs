/*! RESOURCE: /scripts/sn/common/ui/directive.snContextMenu.js */
angular.module('sn.common.ui').directive('contextMenu', function($document, $window, snCustomEvent) {
      var $contextMenu, $ul;
      var scrollHeight = angular.element("body").get(0).scrollHeight;
      var contextMenuItemHeight = 0;

      function setContextMenuPosition(event, $ul) {
        if (contextMenuItemHeight === 0)
          contextMenuItemHeight = 24;
        var cmWidth = 150;
        var cmHeight = contextMenuItemHeight * $ul.children().length;
        var startX = event.pageX + cmWidth >= $window.innerWidth ? event.pageX - cmWidth : event.pageX;
        var startY = event.pageY + cmHeight >= $window.innerHeight ? event.pageY - cmHeight : event.pageY;
        $ul.css({
          display: 'block',
          position: 'absolute',
          left: startX,
          top: startY
        });
      }

      function renderContextMenuItems($scope, event, options) {
        $ul.empty();
        angular.forEach(options, function(item) {
          var $li = angular.element('<li>');
          if (item === null) {
            $li.addClass('divider');
          } else {
            var $a = angular.element('<a>');
            $a.attr({
              tabindex: '-1'
            });
            $a.text(typeof item[0] == 'string' ? item[0] : item[0].call($scope, $scope));
            $li.append($a);
            $li.on('click', function($event) {
              $event.preventDefault();
              $scope.$apply(function() {
                _clearContextMenus(event);
                item[1].call($scope, $scope);
              });
            });
          }
          $ul.append($li);
        });
        setContextMenuPosition(event, $ul);
      }
      var renderContextMenu = function($scope, event, options) {
        angular.element(event.currentTarget).addClass('context');
        $contextMenu = angular.element('<div>', {
          'class': 'dropdown clearfix context-dropdown open'
        });
        $contextMenu.on('click', function(e) {
          if (angular.element(e.target).hasClass('dropdown')) {
            _clearContextMenus(event);
          }
        });
        $contextMenu.on('contextmenu', function(event) {
          event.preventDefault();
          _clearContextMenus(event);
        });
        $contextMenu.css({
          position: 'absolute',
          top: 0,
          height: scrollHeight,
          left: 0,
          right: 0,
          zIndex: 9999
        });
        $document.find('body').append($contextMenu);
        $ul = angular.element('<ul>', {
          'class': 'dropdown-menu',
          'role': 'menu'
        });
        renderContextMenuItems($scope, event, options);
        $contextMenu.append($ul);
        $contextMenu.data('resizeHandler', function() {
          scrollHeight = angular.element("body").get(0).scrollHeight;
          $contextMenu.css('height', scrollHeight);
        });
        snCustomEvent.observe('partial.page.reload', $contextMenu.data('resizeHandler'));
      };

      function _clearContextMenus(event) {
        if (!event) {
          return;
        }
        angular.element(event.currentTarget).removeClass('context');
        var els = angular.element(".context-dropdown");
        angular.forEach(els, function(el) {
          snCustomEvent.un('partial.page.reload', angular.element(el).data('resizeHandler'));
          angular.element(el).remove();
        });
      }
      re