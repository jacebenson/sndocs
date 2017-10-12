/*! RESOURCE: /scripts/sn/common/ui/directive.snContextMenu.js */
angular.module('sn.common.ui').directive('contextMenu', function($document, $window, snCustomEvent) {
      var $contextMenu, $ul;
      var scrollHeight = angular.element("body").get(0).scrollHeight;
      var contextMenuItemHeight = 0;
      var $triggeringElement;
      var _focusTrap;

      function setContextMenuPosition(event, $ul) {
        if (!event.pageX && event.originalEvent.changedTouches)
          event = event.originalEvent.changedTouches[0];
        if (contextMenuItemHeight === 0)
          contextMenuItemHeight = 24;
        var cmWidth = 150;
        var cmHeight = contextMenuItemHeight * $ul.children().length;
        var pageX = event.pageX;
        var pageY = event.pageY;
        if (!pageX) {
          var rect = event.target.getBoundingClientRect();
          pageX = rect.left + angular.element(event.target).width();
          pageY = rect.top + angular.element(event.target).height();
        }
        var startX = pageX + cmWidth >= $window.innerWidth ? pageX - cmWidth : pageX;
        var startY = pageY + cmHeight >= $window.innerHeight ? pageY - cmHeight : pageY;
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
          var $li = angular.element('<li role="presentation">');
          if (item === null) {
            $li.addClass('divider');
          } else {
            var $a = angular.element('<a role="menuitem" href="javascript:void(0)">');
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
          $contextMenu.on('keydown', function(event) {
            if (event.keyCode != 27 && event.keyCode != 9)
              return;
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
          $triggeringElement = document.act