/*! RESOURCE: /scripts/sn.dragdrop/ui-sortable.js */
angular.module('ui.sortable', [])
  .value('uiSortableConfig', {})
  .directive('uiSortable', [
    'uiSortableConfig', '$timeout', '$log',
    function(uiSortableConfig, $timeout, $log) {
      return {
        require: '?ngModel',
        scope: {
          ngModel: '=',
          uiSortable: '='
        },
        link: function(scope, element, attrs, ngModel) {
          var savedNodes;

          function combineCallbacks(first, second) {
            if (second && (typeof second === 'function')) {
              return function() {
                first.apply(this, arguments);
                second.apply(this, arguments);
              };
            }
            return first;
          }

          function getSortableWidgetInstance(element) {
            var data = element.data('ui-sortable');
            if (data && typeof data === 'object' && data.widgetFullName === 'ui-sortable') {
              return data;
            }
            return null;
          }

          function hasSortingHelper(element, ui) {
            var helperOption = element.sortable('option', 'helper');
            return helperOption === 'clone' || (typeof helperOption === 'function' && ui.item.sortable.isCustomHelperUsed());
          }

          function isFloating(item) {
            return (/left|right/).test(item.css('float')) || (/inline|table-cell/).test(item.css('display'));
          }

          function getElementScope(elementScopes, element) {
            var result = null;
            for (var i = 0; i < elementScopes.length; i++) {
              var x = elementScopes[i];
              if (x.element[0] === element[0]) {
                result = x.scope;
                break;
              }
            }
            return result;
          }

          function afterStop(e, ui) {
            ui.item.sortable._destroy();
          }
          var opts = {};
          var directiveOpts = {
            'ui-floating': undefined
          };
          var callbacks = {
            receive: null,
            remove: null,
            start: null,
            stop: null,
            update: null
          };
          var wrappers = {
            helper: null
          };
          angular.extend(opts, directiveOpts, uiSortableConfig, scope.uiSortable);
          if (!angular.element.fn || !angular.element.fn.jquery) {
            $log.error('ui.sortable: jQuery should be included before AngularJS!');
            return;
          }
          if (ngModel) {
            scope.$watch('ngModel.length', function() {
              $timeout(function() {
                if (!!getSortableWidgetInstance(element)) {
                  element.sortable('refresh');
                }
              }, 0, false);
            });
            callbacks.start = function(e, ui) {
              if (opts['ui-floating'] === 'auto') {
                var siblings = ui.item.siblings();
                var sortableWidgetInstance = getSortableWidgetInstance(angular.element(e.target));
                sortableWidgetInstance.floating = isFloating(siblings);
              }
              ui.item.sortable = {
                model: ngModel.$modelValue[ui.item.index()],
                index: ui.item.index(),
                source: ui.item.parent(),
                sourceModel: ngModel.$modelValue,
                cancel: function() {
                  ui.item.sortable._isCanceled = true;
                },
                isCanceled: function() {
                  return ui.item.sortable._isCanceled;
                },
                isCustomHelperUsed: function() {
                  return !!ui.item.sortable._isCustomHelperUsed;
                },
                _isCanceled: false,
                _isCustomHelperUsed: ui.item.sortable._isCustomHelperUsed,
                _destroy: function() {
                  angular.forEach(ui.item.sortable, function(value, key) {
                    ui.item.sortable[key] = undefined;
                  });
                }
              };
            };
            callbacks.activate = function(e, ui) {
              savedNodes = element.contents();
              var placeholder = element.sortable('option', 'placeholder');
              if (placeholder && placeholder.element && typeof placeholder.element === 'function') {
                var phElement = placeholder.element();
                phElement = angular.element(phElement);
                var excludes = element.find('[class="' + phElement.attr('class') + '"]:not([ng-repeat], [data-ng-repeat])');
                savedNodes = savedNodes.not(excludes);
              }
              var connectedSortables = ui.item.sortable._connectedSortables || [];
              connectedSortables.push({
                element: element,
                scope: scope
              });
              ui.item.sortable._connectedSortables = connectedSortables;
            };
            callbacks.update = function(e, ui) {
              if (!ui.item.sortable.received) {
                ui.item.sortable.dropindex = ui.item.index();
                var droptarget = ui.item.parent();
                ui.item.sortable.droptarget = droptarget;
                var droptargetScope = getElementScope(ui.item.sortable._connectedSortables, droptarget);
                ui.item.sortable.droptargetModel = droptargetScope.ngModel;
                element.sortable('cancel');
              }
              if (hasSortingHelper(element, ui) && !ui.item.sortable.received &&
                element.sortable('option', 'appendTo') === 'parent') {
                savedNodes = savedNodes.not(savedNodes.last());
              }
              savedNodes.appendTo(element);
              if (ui.item.sortable.received) {
                savedNodes = null;
              }
              if (ui.item.sortable.received && !ui.item.sortable.isCanceled()) {
                scope.$apply(function() {
                  ngModel.$modelValue.splice(ui.item.sortable.dropindex, 0,
                    ui.item.sortable.moved);
                });
              }
            };
            callbacks.stop = function(e, ui) {
              if (!ui.item.sortable.received &&
                ('dropindex' in ui.item.sortable) &&
                !ui.item.sortable.isCanceled()) {
                scope.$apply(function() {
                  ngModel.$modelValue.splice(
                    ui.item.sortable.dropindex, 0,
                    ngModel.$modelValue.splice(ui.item.sortable.index, 1)[0]);
                });
              } else {
                if ((!('dropindex' in ui.item.sortable) || ui.item.sortable.isCanceled()) &&
                  !hasSortingHelper(element, ui)) {
                  savedNodes.appendTo(element);
                }
              }
              savedNodes = null;
            };
            callbacks.receive = function(e, ui) {
              ui.item.sortable.received = true;
            };
            callbacks.remove = function(e, ui) {
              if (!('dropindex' in ui.item.sortable)) {
                element.sortable('cancel');
                ui.item.sortable.cancel();
              }
              if (!ui.item.sortable.isCanceled()) {
                scope.$apply(function() {
                  ui.item.sortable.moved = ngModel.$modelValue.splice(
                    ui.item.sortable.index, 1)[0];
                });
              }
            };
            wrappers.helper = function(inner) {
              if (inner && typeof inner === 'function') {
                return function(e, item) {
                  var innerResult = inner.apply(this, arguments);
                  item.sortable._isCustomHelperUsed = item !== innerResult;
                  return innerResult;
                };
              }
              return inner;
            };
            scope.$watch('uiSortable', function(newVal) {
              var sortableWidgetInstance = getSortableWidgetInstance(element);
              if (!!sortableWidgetInstance) {
                angular.forEach(newVal, function(value, key) {
                  if (key in directiveOpts) {
                    if (key === 'ui-floating' && (value === false || value === true)) {
                      sortableWidgetInstance.floating = value;
                    }
                    opts[key] = value;
                    return;
                  }
                  if (callbacks[key]) {
                    if (key === 'stop') {
                      value = combineCallbacks(
                        value,
                        function() {
                          scope.$apply();
                        });
                      value = combineCallbacks(value, afterStop);
                    }
                    value = combineCallbacks(callbacks[key], value);
                  } else if (wrappers[key]) {
                    value = wrappers[key](value);
                  }
                  opts[key] = value;
                  element.sortable('option', key, value);
                });
              }
            }, true);
            angular.forEach(callbacks, function(value, key) {
              opts[key] = combineCallbacks(value, opts[key]);
              if (key === 'stop') {
                opts[key] = combineCallbacks(opts[key], afterStop);
              }
            });
          } else {
            $log.info('ui.sortable: ngModel not provided!', element);
          }
          element.sortable(opts);
        }
      };
    }
  ]);;