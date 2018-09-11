/*! RESOURCE: /scripts/sn/common/ui/js_includes_ui.js */
/*! RESOURCE: /scripts/sn/common/ui/_module.js */
angular.module('sn.common.ui', ['sn.common.messaging']);;
/*! RESOURCE: /scripts/sn/common/ui/popover/js_includes_ui_popover.js */
/*! RESOURCE: /scripts/sn/common/ui/popover/_module.js */
angular.module('sn.common.ui.popover', []);;
/*! RESOURCE: /scripts/sn/common/ui/popover/directive.snBindPopoverSelection.js */
angular.module('sn.common.ui.popover').directive('snBindPopoverSelection', function(snCustomEvent) {
  "use strict";
  return {
    restrict: "A",
    controller: function($scope, $element, $attrs, snCustomEvent) {
      snCustomEvent.observe('list.record_select', recordSelectDataHandler);

      function recordSelectDataHandler(data, event) {
        if (!data || !event)
          return;
        event.stopPropagation();
        var ref = ($scope.field) ? $scope.field.ref : $attrs.ref;
        if (data.ref === ref) {
          if (window.g_form) {
            if ($attrs.addOption) {
              addGlideListChoice('select_0' + $attrs.ref, data.value, data.displayValue);
            } else {
              var fieldValue = typeof $attrs.ref === 'undefined' ? data.ref : $attrs.ref;
              window.g_form._setValue(fieldValue, data.value, data.displayValue);
              clearDerivedFields(data.value);
            }
          }
          if ($scope.field) {
            $scope.field.value = data.value;
            $scope.field.displayValue = data.displayValue;
          }
        }
      }

      function clearDerivedFields(value) {
        if (window.DerivedFields) {
          var df = new DerivedFields($scope.field ? $scope.field.ref : $attrs.ref);
          df.clearRelated();
          df.updateRelated(value);
        }
      }
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/ui/popover/directive.snComplexPopover.js */
angular.module('sn.common.ui.popover').directive('snComplexPopover', function(getTemplateUrl, $q, $http, $templateCache, $compile, $timeout) {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    templateUrl: function(elem, attrs) {
      return getTemplateUrl(attrs.buttonTemplate);
    },
    controller: function($scope, $element, $attrs, $q, $document, snCustomEvent, snComplexPopoverService) {
      $scope.type = $attrs.complexPopoverType || "complex_popover";
      if ($scope.closeEvent) {
        snCustomEvent.observe($scope.closeEvent, destroyPopover);
        $scope.$on($scope.closeEvent, destroyPopover);
      }
      $scope.$parent.$on('$destroy', destroyPopover);
      $scope.$on('$destroy', function() {
        snCustomEvent.un($scope.closeEvent, destroyPopover);
      });
      var newScope;
      var open;
      var popover;
      var content;
      var popoverDefaults = {
        container: 'body',
        html: true,
        placement: 'auto',
        trigger: 'manual',
        template: '<div class="complex_popover popover" role="dialog"><div class="arrow"></div><div class="popover-content"></div></div>'
      };
      var popoverConfig = angular.extend(popoverDefaults, $scope.popoverConfig);
      $scope.loading = false;
      $scope.initialized = false;
      $scope.popOverDisplaying = false;
      $scope.togglePopover = function(event) {
        if (!open) {
          showPopover(event);
        } else {
          destroyPopover();
        }
        $scope.popOverDisplaying = !$scope.popOverDisplaying;
      };

      function showPopover(e) {
        if ($scope.loading)
          return;
        $scope.$toggleButton = angular.element(e.target);
        $scope.loading = true;
        $scope.$emit('list.toggleLoadingState', true);
        _getTemplate()
          .then(_insertTemplate)
          .then(_createPopover)
          .then(_bindHtml)
          .then(function() {
            $scope.initialized = true;
            if (!$scope.loadEvent)
              _openPopover();
          });
      }

      function destroyPopover() {
        if (!newScope)
          return;
        $scope.$toggleButton.on('hidden.bs.popover', function() {
          open = false;
          $scope.$toggleButton.data('bs.popover').$element.removeData('bs.popover').off('.popover');
          $scope.$toggleButton = null;
          snCustomEvent.fire('hidden.complexpopover.' + $scope.ref);
        });
        $scope.$toggleButton.popover('hide');
        snCustomEvent.fire('hide.complexpopover.' + $scope.ref, $scope.$toggleButton);
        newScope.$broadcast('$destroy');
        newScope.$destroy();
        newScope = null;
        $scope.initialized = false;
        angular.element(window).off({
          'click': complexHtmlHandler,
          'keydown': keyDownHandler
        });
      }

      function _getTemplate() {
        return snComplexPopoverService.getTemplate(getTemplateUrl($attrs.template));
      }

      function _createPopover() {
        $scope.$toggleButton.popover(popoverConfig);
        return $q.when(true);
      }

      function _insertTemplate(response) {
        newScope = $scope.$new();
        if ($scope.loadEvent)
          newScope.$on($scope.loadEvent, _openPopover);
        content = $compile(response.data)(newScope);
        popoverConfig.content = content;
        newScope.open = true;
        snCustomEvent.fire('inserted.complexpopover.' + $scope.ref, $scope.$toggleButton);
        return $q.when(true);
      }

      function _bindHtml() {
        angular.element(window).on({
          'click': complexHtmlHandler,
          'keydown': keyDownHandler
        });
        return $q.when(true);
      }

      function complexHtmlHandler(e) {
        var parentComplexPopoverScope = angular.element(e.target).parents('.popover-content').children().scope();
        if (parentComplexPopoverScope && (parentComplexPopoverScope.type = "complex_popover") && $scope.type === "complex_popover")
          return;
        if (!open || angular.element(e.target).parents('html').length === 0)
          return;
        if ($scope.initialized && !$scope.loading && !$scope.$toggleButton.is(e.target) && content.parents('.popover').has(angular.element(e.target)).length === 0) {
          _eventClosePopover(e);
          destroyPopover(e);
        }
      }

      function keyDownHandler(e) {
        if (e.keyCode != 27)
          return;
        if (!open || angular.element(e.target).parents('html').length === 0)
          return;
        if ($scope.initialized && !$scope.loading && !$scope.$toggleButton.is(e.target) && content.parents('.popover').has(angular.element(e.target)).length > 0) {
          _eventClosePopover(e);
          destroyPopover();
        }
      }

      function _eventClosePopover(e) {
        e.preventDefault();
        e.stopPropagation();
      }

      function createAndActivateFocusTrap(popover) {
        var deferred = $q.defer();
        if (!window.focusTrap) {
          deferred.reject('Focus trap not found');
        } else {
          if (!$scope.focusTrap) {
            $scope.focusTrap = window.focusTrap(popover, {
              clickOutsideDeactivates: true
            });
          }
          try {
            $scope.focusTrap.activate({
              onActivate: function() {
                deferred.resolve();
              }
            });
          } catch (e) {
            console.warn("Unable to activate focus trap", e);
          }
        }
        return deferred.promise;
      }

      function deactivateAndDestroyFocusTrap() {
        var deferred = $q.defer();
        if (!$scope.focusTrap) {
          deferred.reject("Focus trap not found");
        } else {
          try {
            $scope.focusTrap.deactivate({
              returnFocus: false,
              onDeactivate: function() {
                deferred.resolve();
              }
            });
          } catch (e) {
            console.warn("Unable to deactivate focus trap", e);
          }
          $scope.focusTrap = null;
        }
        return deferred.promise;
      }

      function _openPopover() {
        if (open) {
          return;
        }
        open = true;
        $timeout(function() {
          $scope.$toggleButton.popover('show');
          $scope.loading = false;
          snCustomEvent.fire('show.complexpopover.' + $scope.ref, $scope.$toggleButton);
          $scope.$toggleButton.on('shown.bs.popover', function(evt) {
            var popoverObject = angular.element(evt.target).data('bs.popover'),
              $tooltip,
              popover;
            $tooltip = popoverObject && popoverObject.$tip;
            popover = $tooltip && $tooltip[0];
            if (popover) {
              createAndActivateFocusTrap(popover);
            }
            snCustomEvent.fire('shown.complexpopover.' + $scope.ref, $scope.$toggleButton);
          });
          $scope.$toggleButton.on('hide.bs.popover', function() {
            deactivateAndDestroyFocusTrap().finally(function() {
              $scope.$toggleButton.focus();
            });
          });
        }, 0);
      }
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/ui/popover/service.snComplexPopoverService.js */
angular.module('sn.common.ui.popover').service('snComplexPopoverService', function($http, $q, $templateCache) {
  "use strict";
  return {
    getTemplate: getTemplate
  };

  function getTemplate(template) {
    return $http.get(template, {
      cache: $templateCache
    });
  }
});;;
/*! RESOURCE: /scripts/sn/common/ui/directive.snConfirmModal.js */
angular.module('sn.common.ui').directive('snConfirmModal', function(getTemplateUrl) {
  return {
    templateUrl: getTemplateUrl('sn_confirm_modal.xml'),
    restrict: 'E',
    replace: true,
    transclude: true,
    scope: {
      config: '=?',
      modalName: '@',
      title: '@?',
      message: '@?',
      cancelButton: '@?',
      okButton: '@?',
      alertButton: '@?',
      cancel: '&?',
      ok: '&?',
      alert: '&?'
    },
    link: function(scope, element) {
      element.find('.modal').remove();
    },
    controller: function($scope, $rootScope) {
      $scope.config = $scope.config || {};

      function Button(fn, text) {
        return {
          fn: fn,
          text: text
        }
      }
      var buttons = {
        'cancelButton': new Button('cancel', 'Cancel'),
        'okButton': new Button('ok', 'OK'),
        'alertButton': new Button('alert', 'Close'),
        getText: function(type) {
          var button = this[type];
          if (button && $scope.get(button.fn))
            return button.text;
        }
      };
      $scope.get = function(type) {
        if ($scope.config[type])
          return $scope.config[type];
        if (!$scope[type]) {
          var text = buttons.getText(type);
          if (text)
            return $scope.config[type] = text;
        }
        return $scope.config[type] = $scope[type];
      };
      if (!$scope.get('modalName'))
        $scope.config.modalName = 'confirm-modal';

      function call(type) {
        var action = $scope.get(type);
        if (action) {
          if (angular.isFunction(action))
            action();
          return true;
        }
        return !!buttons.getText(type);
      }
      $scope.cancelPressed = close('cancel');
      $scope.okPressed = close('ok');
      $scope.alertPressed = close('alert');

      function close(type) {
        return function() {
          actionClosed = true;
          $rootScope.$broadcast('dialog.' + $scope.config.modalName + '.close');
          call(type);
        }
      }
      var actionClosed;
      $scope.$on('dialog.' + $scope.get('modalName') + '.opened', function() {
        actionClosed = false;
      });
      $scope.$on('dialog.' + $scope.get('modalName') + '.closed', function() {
        if (actionClosed)
          return;
        if (call('cancel'))
          return;
        if (call('alert'))
          return;
        call('ok');
      });
    }
  };
});;
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
/*! RESOURCE: /scripts/sn/common/ui/directive.snDialog.js */
angular.module("sn.common.ui").directive("snDialog", function($timeout, $rootScope, $document) {
      "use strict";
      return {
        restrict: "AE",
        transclude: true,
        scope: {
          modal: "=?",
          disableAutoFocus: "=?",
          classCheck: "="
        },
        replace: true,
        template: '<dialog ng-keydown="escape($event)"><div ng-click="onClickClose()" title="Close" class="close-button icon-button icon-cross"></div></dialog>',
        link: function(scope, element, attrs, ctrl, transcludeFn) {
            var transcludeScope = {};
            var _focusTrap = null;
            scope.isOpen = function() {
              return element[0].open;
            };
            transcludeFn(element.scope().$new(), function(a, b) {
              element.append(a);
              transcludeScope = b;
            });
            element.click(function(event) {
              event.stopPropagation();
              if (event.offsetX < 0 || event.offsetX > element[0].offsetWidth || event.offsetY < 0 || event.offsetY > element[0].offsetHeight)
                if (!scope.classCheck)
                  scope.onClickClose();
                else {
                  var classes = scope.classCheck.split(",");
                  var found = false;
                  for (var i = 0; i < classes.length; i++)
                    if (angular.element(event.target).closest(classes[i]).length > 0)
                      found = true;
                  if (!found)
                    scope.onClickClose();
                }
            });
            scope.show = function() {
              var d = element[0];
              if (!d.showModal || true) {
                dialogPolyfill.registerDialog(d);
                d.setDisableAutoFocus(scope.disableAutoFocus);
              }
              if (scope.modal)
                d.showModal();
              else
                d.show();
              if (!angular.element(d).hasClass('sn-alert')) {
                $timeout(function() {
                  if (d.dialogPolyfillInfo && d.dialogPolyfillInfo.backdrop) {
                    angular.element(d.dialogPolyfillInfo.backdrop).one('click', function(event) {
                      if (!scope.classCheck || angular.element(event.srcElement).closest(scope.classCheck).length == 0)
                        scope.onClickClose();
                    })
                  } else {
                    $document.on('click', function(event) {
                      if (!scope.classCheck || angular.element(event.srcElement).closest(scope.classCheck).length == 0)
                        scope.onClickClose();
                    })
                  }
                });
              }
              element.find('.btn-primary').eq(0).focus();
            };
            scope.setPosition = function(data) {
              var contextData = scope.getContextData(data);
              if (contextData && element && element[0]) {
                if (contextData.position) {
                  element[0].style.top = contextData.position.top + "px";
                  element[0].style.left = contextData.position.left + "px";
                  element[0].style.margin = "0px";
                }
                if (contextData.dimensions) {
                  element[0].style.width = contextData.dimensions.width + "px";
                  element[0].style.height = contextData.dimensions.height + "px";
                }
              }
            }
            scope.$on("dialog." + attrs.name + ".move", function(event, data) {
              scope.setPosition(data);
            })
            scope.$on("dialog." + attrs.name + ".show", function(event, data) {
              scope.setPosition(data);
              scope.setKeyEvents(data);
              if (scope.isOpen() === true)
                scope.close();
              else
                scope.show();
              angular.element(".sn-dialog-menu").each(function(index, value) {
                var name = angular.element(this).attr('name');
                if (name != attrs.name && !angular.element(this).attr('open')) {
                  return true;
                }
                if (name != attrs.name && angular.element(this).attr('open')) {
                  $rootScope.$broadcast("dialog." + name + ".close");
                }
              });
              activateFocusTrap();
            })
            scope.onClickClose = function() {
              if (scope.isOpen())
                $rootScope.$broadcast("dialog." + attrs.name + ".close");
            }
            scope.escape = function($event) {
              if ($event.keyCode === 27) {
                scope.onClickClose();
              }
            };
            scope.close = function() {
              var d = element[0];
              d.close();
              scope.removeListeners();
              deactivateFocusTrap();
            }
            scope.ok = function(contextData) {
              contextData.ok();
              scope.removeListeners();
            }
            scope.cancel = function(contextData) {
              contextData.cancel();
              scope.removeListeners();
            }
            scope.removeListeners = function() {
              element[0].removeEventListener("ok", scope.handleContextOk, false);
              element[0].removeEventListener("cancel", scope.handleContextCancel, false);
            }
            scope.setKeyEvents = function(data) {
              var contextData = scope.getContextData(data);
              if (contextData && contextData.cancel) {
                scope.handleContextOk = function() {
                  scope.ok(contextData);
                }
                scope.handleContextCancel = function() {
                  scope.cancel(contextData);
                }
                element[0].addEventListener("ok", scope.handleContextOk, false);
                element[0].addEventListener("cancel", scope.handleContextCancel, false);
              }
            }
            scope.getContextData = function(data) {
              var context = attrs.context;
              var contextData = null;
              if (context && data && context in data) {
                contextData = data[context];
                transcludeScope[context] = contextData;
              }
              return contextData;
            }
            scope.$on("dialog." + attrs.name + ".close", scope.close);

            function activateFocusTrap() {
              if (_focusTrap || !window