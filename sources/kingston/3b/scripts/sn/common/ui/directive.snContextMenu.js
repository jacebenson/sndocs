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
      height: angular.element("body").get(0).scrollHeight,
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
    $triggeringElement = document.activeElement;
    activateFocusTrap();
    $contextMenu.data('resizeHandler', function() {
      scrollHeight = angular.element("body").get(0).scrollHeight;
      $contextMenu.css('height', scrollHeight);
    });
    snCustomEvent.observe('partial.page.reload', $contextMenu.data('resizeHandler'));
  };

  function _clearContextMenus(event) {
    if (!event)
      return;
    angular.element(event.currentTarget).removeClass('context');
    var els = angular.element(".context-dropdown");
    angular.forEach(els, function(el) {
      snCustomEvent.un('partial.page.reload', angular.element(el).data('resizeHandler'));
      angular.element(el).remove();
    });
    deactivateFocusTrap();
  }

  function activateFocusTrap() {
    if (_focusTrap || !window.focusTrap)
      return;
    _focusTrap = focusTrap($contextMenu[0], {
      focusOutsideDeactivates: true,
      clickOutsideDeactivates: true
    });
    _focusTrap.activate();
  }

  function deactivateFocusTrap() {
    if (!_focusTrap || !window.focusTrap)
      return;
    _focusTrap.deactivate();
    _focusTrap = null;
  }
  return function(scope, element, attrs) {
    element.on('contextmenu', function(event) {
      if (event.ctrlKey)
        return;
      if (angular.element(element).attr('context-type'))
        return;
      showMenu(event);
    });
    element.on('click', handleClick);
    element.on('keydown', function(event) {
      if (event.keyCode == 32) {
        handleSpace(event);
      } else if (event.keyCode === 13) {
        handleClick(event);
      }
    });
    var doubleTapTimeout,
      doubleTapActive = false,
      doubleTapStartPosition;
    element.on('touchstart', function(event) {
      doubleTapStartPosition = {
        x: event.originalEvent.changedTouches[0].screenX,
        y: event.originalEvent.changedTouches[0].screenY
      };
    });
    element.on('touchend', function(event) {
      var distX = Math.abs(event.originalEvent.changedTouches[0].screenX - doubleTapStartPosition.x);
      var distY = Math.abs(event.originalEvent.changedTouches[0].screenY - doubleTapStartPosition.y);
      if (distX > 15 || distY > 15) {
        doubleTapStartPosition = null;
        return;
      }
      if (doubleTapActive) {
        doubleTapActive = false;
        clearTimeout(doubleTapTimeout);
        showMenu(event);
        event.preventDefault();
        return;
      }
      doubleTapActive = true;
      event.preventDefault();
      doubleTapTimeout = setTimeout(function() {
        doubleTapActive = false;
        if (event.target)
          event.target.click();
      }, 300);
    });

    function handleSpace(evt) {
      var $target = angular.element(evt.target);
      if ($target.is('button, [role=button]')) {
        handleClick(evt);
        return;
      }
      if (!$target.hasClass('list-edit-cursor'))
        return;
      showMenu(evt);
    }

    function handleClick(event) {
      var $el = angular.element(element);
      var $target = angular.element(event.target);
      if (!$el.attr('context-type') && !$target.hasClass('context-menu-click'))
        return;
      showMenu(event);
    }

    function showMenu(evt) {
      scope.$apply(function() {
        applyMenu(evt);
        clearWindowSelection();
      });
    }

    function clearWindowSelection() {
      if (window.getSelection)
        if (window.getSelection().empty)
          window.getSelection().empty();
        else if (window.getSelection().removeAllRanges)
        window.getSelection().removeAllRanges();
      else if (document.selection)
        document.selection.empty();
    }

    function applyMenu(event) {
      var tagName = event.target.tagName;
      if (tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'BUTTON') {
        return;
      }
      var menu = scope.$eval(attrs.contextMenu, {
        event: event
      });
      if (menu instanceof Array) {
        if (menu.length > 0) {
          event.stopPropagation();
          event.preventDefault();
          scope.$watch(function() {
            return menu;
          }, function(newValue, oldValue) {
            if (newValue !== oldValue) renderContextMenuItems(scope, event, menu);
          }, true);
          renderContextMenu(scope, event, menu);
        }
      } else if (typeof menu !== 'undefined' && typeof menu.then === 'function') {
        event.stopPropagation();
        event.preventDefault();
        menu.then(function(response) {
          var contextMenu = response;
          if (contextMenu.length > 0) {
            scope.$watch(function() {
              return contextMenu;
            }, function(newValue, oldValue) {
              if (newValue !== oldValue)
                renderContextMenuItems(scope, event, contextMenu);
            }, true);
            renderContextMenu(scope, event, contextMenu);
          } else {
            throw '"' + attrs.contextMenu + '" is not an array or promise';
          }
        });
      } else {
        throw '"' + attrs.contextMenu + '" is not an array or promise';
      }
    }
  };
});;