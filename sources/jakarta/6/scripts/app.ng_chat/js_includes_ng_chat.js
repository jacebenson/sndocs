/*! RESOURCE: /scripts/app.ng_chat/js_includes_ng_chat.js */
/*! RESOURCE: /scripts/thirdparty/ment.io/mentio.js */
(function() {
  'use strict';
  angular.module('mentio', [])
    .directive('mentio', ['mentioUtil', '$document', '$compile', '$log', '$timeout',
      function(mentioUtil, $document, $compile, $log, $timeout) {
        return {
          restrict: 'A',
          scope: {
            macros: '=mentioMacros',
            search: '&mentioSearch',
            select: '&mentioSelect',
            items: '=mentioItems',
            typedTerm: '=mentioTypedTerm',
            altId: '=mentioId',
            iframeElement: '=mentioIframeElement',
            requireLeadingSpace: '=mentioRequireLeadingSpace',
            suppressTrailingSpace: '=mentioSuppressTrailingSpace',
            selectNotFound: '=mentioSelectNotFound',
            trimTerm: '=mentioTrimTerm',
            ngModel: '='
          },
          controller: ["$scope", "$timeout", "$attrs", function($scope, $timeout, $attrs) {
            $scope.query = function(triggerChar, triggerText) {
              var remoteScope = $scope.triggerCharMap[triggerChar];
              if ($scope.trimTerm === undefined || $scope.trimTerm) {
                triggerText = triggerText.trim();
              }
              remoteScope.showMenu();
              remoteScope.search({
                term: triggerText
              });
              remoteScope.typedTerm = triggerText;
            };
            $scope.defaultSearch = function(locals) {
              var results = [];
              angular.forEach($scope.items, function(item) {
                if (item.label.toUpperCase().indexOf(locals.term.toUpperCase()) >= 0) {
                  results.push(item);
                }
              });
              $scope.localItems = results;
            };
            $scope.bridgeSearch = function(termString) {
              var searchFn = $attrs.mentioSearch ? $scope.search : $scope.defaultSearch;
              searchFn({
                term: termString
              });
            };
            $scope.defaultSelect = function(locals) {
              return $scope.defaultTriggerChar + locals.item.label;
            };
            $scope.bridgeSelect = function(itemVar) {
              var selectFn = $attrs.mentioSelect ? $scope.select : $scope.defaultSelect;
              return selectFn({
                item: itemVar
              });
            };
            $scope.setTriggerText = function(text) {
              if ($scope.syncTriggerText) {
                $scope.typedTerm = ($scope.trimTerm === undefined || $scope.trimTerm) ? text.trim() : text;
              }
            };
            $scope.context = function() {
              if ($scope.iframeElement) {
                return {
                  iframe: $scope.iframeElement
                };
              }
            };
            $scope.replaceText = function(text, hasTrailingSpace) {
              $scope.hideAll();
              mentioUtil.replaceTriggerText($scope.context(), $scope.targetElement, $scope.targetElementPath,
                $scope.targetElementSelectedOffset, $scope.triggerCharSet, text, $scope.requireLeadingSpace,
                hasTrailingSpace, $scope.suppressTrailingSpace);
              if (!hasTrailingSpace) {
                $scope.setTriggerText('');
                angular.element($scope.targetElement).triggerHandler('change');
                if ($scope.isContentEditable()) {
                  $scope.contentEditableMenuPasted = true;
                  var timer = $timeout(function() {
                    $scope.contentEditableMenuPasted = false;
                  }, 200);
                  $scope.$on('$destroy', function() {
                    $timeout.cancel(timer);
                  });
                }
              }
            };
            $scope.hideAll = function() {
              for (var key in $scope.triggerCharMap) {
                if ($scope.triggerCharMap.hasOwnProperty(key)) {
                  $scope.triggerCharMap[key].hideMenu();
                }
              }
            };
            $scope.getActiveMenuScope = function() {
              for (var key in $scope.triggerCharMap) {
                if ($scope.triggerCharMap.hasOwnProperty(key)) {
                  if ($scope.triggerCharMap[key].visible) {
                    return $scope.triggerCharMap[key];
                  }
                }
              }
              return null;
            };
            $scope.selectActive = function() {
              for (var key in $scope.triggerCharMap) {
                if ($scope.triggerCharMap.hasOwnProperty(key)) {
                  if ($scope.triggerCharMap[key].visible) {
                    $scope.triggerCharMap[key].selectActive();
                  }
                }
              }
            };
            $scope.isActive = function() {
              for (var key in $scope.triggerCharMap) {
                if ($scope.triggerCharMap.hasOwnProperty(key)) {
                  if ($scope.triggerCharMap[key].visible) {
                    return true;
                  }
                }
              }
              return false;
            };
            $scope.isContentEditable = function() {
              return ($scope.targetElement.nodeName !== 'INPUT' && $scope.targetElement.nodeName !== 'TEXTAREA');
            };
            $scope.replaceMacro = function(macro, hasTrailingSpace) {
              if (!hasTrailingSpace) {
                $scope.replacingMacro = true;
                $scope.timer = $timeout(function() {
                  mentioUtil.replaceMacroText($scope.context(), $scope.targetElement,
                    $scope.targetElementPath, $scope.targetElementSelectedOffset,
                    $scope.macros, $scope.macros[macro]);
                  angular.element($scope.targetElement).triggerHandler('change');
                  $scope.replacingMacro = false;
                }, 300);
                $scope.$on('$destroy', function() {
                  $timeout.cancel($scope.timer);
                });
              } else {
                mentioUtil.replaceMacroText($scope.context(), $scope.targetElement, $scope.targetElementPath,
                  $scope.targetElementSelectedOffset, $scope.macros, $scope.macros[macro]);
              }
            };
            $scope.addMenu = function(menuScope) {
              if (menuScope.parentScope && $scope.triggerCharMap.hasOwnProperty(menuScope.triggerChar)) {
                return;
              }
              $scope.triggerCharMap[menuScope.triggerChar] = menuScope;
              if ($scope.triggerCharSet === undefined) {
                $scope.triggerCharSet = [];
              }
              $scope.triggerCharSet.push(menuScope.triggerChar);
              menuScope.setParent($scope);
            };
            $scope.$on(
              'menuCreated',
              function(event, data) {
                if (
                  $attrs.id !== undefined ||
                  $attrs.mentioId !== undefined
                ) {
                  if (
                    $attrs.id === data.targetElement ||
                    (
                      $attrs.mentioId !== undefined &&
                      $scope.altId === data.targetElement
                    )
                  ) {
                    $scope.addMenu(data.scope);
                  }
                }
              }
            );
            $document.on(
              'click',
              function() {
                if ($scope.isActive()) {
                  $scope.$apply(function() {
                    $scope.hideAll();
                  });
                }
              }
            );
            $document.on(
              'keydown keypress paste',
              function(event) {
                var activeMenuScope = $scope.getActiveMenuScope();
                if (activeMenuScope) {
                  if (event.which === 9 || event.which === 13) {
                    event.preventDefault();
                    activeMenuScope.selectActive();
                  }
                  if (event.which === 27) {
                    event.preventDefault();
                    activeMenuScope.$apply(function() {
                      activeMenuScope.hideMenu();
                    });
                  }
                  if (event.which === 40) {
                    event.preventDefault();
                    activeMenuScope.$apply(function() {
                      activeMenuScope.activateNextItem();
                    });
                    activeMenuScope.adjustScroll(1);
                  }
                  if (event.which === 38) {
                    event.preventDefault();
                    activeMenuScope.$apply(function() {
                      activeMenuScope.activatePreviousItem();
                    });
                    activeMenuScope.adjustScroll(-1);
                  }
                  if (event.which === 37 || event.which === 39) {
                    event.preventDefault();
                  }
                }
              }
            );
          }],
          link: function(scope, element, attrs, $timeout) {
            scope.triggerCharMap = {};
            scope.targetElement = element;
            scope.scrollBarParents = element.parents().filter(function() {
              var overflow = angular.element(this).css("overflow");
              return this.scrollHeight > this.clientHeight && overflow !== "hidden" && overflow !== "visible";
            });
            scope.scrollPosition = null;
            attrs.$set('autocomplete', 'off');
            if (attrs.mentioItems) {
              scope.localItems = [];
              scope.parentScope = scope;
              var itemsRef = attrs.mentioSearch ? ' mentio-items="items"' : ' mentio-items="localItems"';
              scope.defaultTriggerChar = attrs.mentioTriggerChar ? scope.$eval(attrs.mentioTriggerChar) : '@';
              var html = '<mentio-menu' +
                ' mentio-search="bridgeSearch(term)"' +
                ' mentio-select="bridgeSelect(item)"' +
                itemsRef;
              if (attrs.mentioTemplateUrl) {
                html = html + ' mentio-template-url="' + attrs.mentioTemplateUrl + '"';
              }
              html = html + ' mentio-trigger-char="\'' + scope.defaultTriggerChar + '\'"' +
                ' mentio-parent-scope="parentScope"' +
                '/>';
              var linkFn = $compile(html);
              var el = linkFn(scope);
              element.parent().append(el);
              scope.$on('$destroy', function() {
                el.remove();
              });
            }
            if (attrs.mentioTypedTerm) {
              scope.syncTriggerText = true;
            }

            function keyHandler(event) {
              function stopEvent(event) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
              }
              var activeMenuScope = scope.getActiveMenuScope();
              if (activeMenuScope) {
                if (event.which === 9 || event.which === 13) {
                  stopEvent(event);
                  activeMenuScope.selectActive();
                  return false;
                }
                if (event.which === 27) {
                  stopEvent(event);
                  activeMenuScope.$apply(function() {
                    activeMenuScope.hideMenu();
                  });
                  return false;
                }
                if (event.which === 40) {
                  stopEvent(event);
                  activeMenuScope.$apply(function() {
                    activeMenuScope.activateNextItem();
                  });
                  activeMenuScope.adjustScroll(1);
                  return false;
                }
                if (event.which === 38) {
                  stopEvent(event);
                  activeMenuScope.$apply(function() {
                    activeMenuScope.activatePreviousItem();
                  });
                  activeMenuScope.adjustScroll(-1);
                  return false;
                }
                if (event.which === 37 || event.which === 39) {
                  stopEvent(event);
                  return false;
                }
              }
            }
            scope.$watch(
              'iframeElement',
              function(newValue) {
                if (newValue) {
                  var iframeDocument = newValue.contentWindow.document;
                  iframeDocument.addEventListener('click',
                    function() {
                      if (scope.isActive()) {
                        scope.$apply(function() {
                          scope.hideAll();
                        });
                      }
                    }
                  );
                  iframeDocument.addEventListener('keydown', keyHandler, true);
                  scope.$on('$destroy', function() {
                    iframeDocument.removeEventListener('keydown', keyHandler);
                  });
                }
              }
            );
            scope.$watch(
              'ngModel',
              function(newValue) {
                if ((!newValue || newValue === '') && !scope.isActive()) {
                  return;
                }
                if (scope.triggerCharSet === undefined) {
                  $log.warn('Error, no mentio-items attribute was provided, ' +
                    'and no separate mentio-menus were specified.  Nothing to do.');
                  return;
                }
                if (scope.contentEditableMenuPasted) {
                  scope.contentEditableMenuPasted = false;
                  return;
                }
                if (scope.replacingMacro) {
                  $timeout.cancel(scope.timer);
                  scope.replacingMacro = false;
                }
                var isActive = scope.isActive();
                var isContentEditable = scope.isContentEditable();
                var mentionInfo = mentioUtil.getTriggerInfo(scope.context(), scope.triggerCharSet,
                  scope.requireLeadingSpace, isActive);
                if (mentionInfo !== undefined &&
                  (!isActive ||
                    (isActive &&
                      (
                        (isContentEditable && mentionInfo.mentionTriggerChar ===
                          scope.currentMentionTriggerChar) ||
                        (!isContentEditable && mentionInfo.mentionPosition ===
                          scope.currentMentionPosition)
                      )
                    )
                  )
                ) {
                  if (mentionInfo.mentionSelectedElement) {
                    scope.targetElement = mentionInfo.mentionSelectedElement;
                    scope.targetElementPath = mentionInfo.mentionSelectedPath;
                    scope.targetElementSelectedOffset = mentionInfo.mentionSelectedOffset;
                  }
                  scope.setTriggerText(mentionInfo.mentionText);
                  scope.currentMentionPosition = mentionInfo.mentionPosition;
                  scope.currentMentionTriggerChar = mentionInfo.mentionTriggerChar;
                  scope.query(mentionInfo.mentionTriggerChar, mentionInfo.mentionText);
                } else {
                  var currentTypedTerm = scope.typedTerm;
                  scope.setTriggerText('');
                  scope.hideAll();
                  var macroMatchInfo = mentioUtil.getMacroMatch(scope.context(), scope.macros);
                  if (macroMatchInfo !== undefined) {
                    scope.targetElement = macroMatchInfo.macroSelectedElement;
                    scope.targetElementPath = macroMatchInfo.macroSelectedPath;
                    scope.targetElementSelectedOffset = macroMatchInfo.macroSelectedOffset;
                    scope.replaceMacro(macroMatchInfo.macroText, macroMatchInfo.macroHasTrailingSpace);
                  } else if (scope.selectNotFound && currentTypedTerm && currentTypedTerm !== '') {
                    var lastScope = scope.triggerCharMap[scope.currentMentionTriggerChar];
                    if (lastScope) {
                      var text = lastScope.select({
                        item: {
                          label: currentTypedTerm
                        }
                      });
                      if (typeof text.then === 'function') {
                        text.then(scope.replaceText);
                      } else {
                        scope.replaceText(text, true);
                      }
                    }
                  }
                }
              }
            );
          }
        };
      }
    ])
    .directive('mentioMenu', ['mentioUtil', '$rootScope', '$log', '$window', '$document', '$timeout',
      function(mentioUtil, $rootScope, $log, $window, $document, $timeout) {
        return {
          restrict: 'E',
          scope: {
            search: '&mentioSearch',
            select: '&mentioSelect',
            items: '=mentioItems',
            triggerChar: '=mentioTriggerChar',
            forElem: '=mentioFor',
            parentScope: '=mentioParentScope'
          },
          templateUrl: function(tElement, tAttrs) {
            return tAttrs.mentioTemplateUrl !== undefined ? tAttrs.mentioTemplateUrl : 'mentio-menu.tpl.html';
          },
          controller: ["$scope", function($scope) {
            $scope.visible = false;
            this.activate = $scope.activate = function(item) {
              $scope.activeItem = item;
            };
            this.isActive = $scope.isActive = function(item) {
              return $scope.activeItem === item;
            };
            this.selectItem = $scope.selectItem = function(item) {
              if (item.termLengthIsZero) {
                item.name = $scope.triggerChar + $scope.typedTerm
              }
              var text = $scope.select({
                item: item
              });
              if (typeof text.then === 'function') {
                text.then($scope.parentMentio.replaceText);
              } else {
                $scope.parentMentio.replaceText(text);
              }
            };
            $scope.activateNextItem = function() {
              var index = $scope.items.indexOf($scope.activeItem);
              this.activate($scope.items[(index + 1) % $scope.items.length]);
            };
            $scope.activatePreviousItem = function() {
              var index = $scope.items.indexOf($scope.activeItem);
              this.activate($scope.items[index === 0 ? $scope.items.length - 1 : index - 1]);
            };
            $scope.isFirstItemActive = function() {
              var index = $scope.items.indexOf($scope.activeItem);
              return index === 0;
            };
            $scope.isLastItemActive = function() {
              var index = $scope.items.indexOf($scope.activeItem);
              return index === ($scope.items.length - 1);
            };
            $scope.selectActive = function() {
              $scope.selectItem($scope.activeItem);
            };
            $scope.isVisible = function() {
              return $scope.visible;
            };
            $scope.showMenu = function() {
              if (!$scope.visible) {
                $scope.menuElement.css("visibility", "visible");
                $scope.requestVisiblePendingSearch = true;
              }
            };
            $scope.setParent = function(scope) {
              $scope.parentMentio = scope;
              $scope.targetElement = scope.targetElement;
            };
            var scopeDuplicate = $scope;
            $rootScope.$on('mentio.closeMenu', function() {
              scopeDuplicate.hideMenu();
            })
          }],
          link: function(scope, element) {
            element[0].parentNode.removeChild(element[0]);
            $document[0].body.appendChild(element[0]);
            scope.menuElement = element;
            scope.menuElement.css("visibility", "hidden");
            if (scope.parentScope) {
              scope.parentScope.addMenu(scope);
            } else {
              if (!scope.forElem) {
                $log.error('mentio-menu requires a target element in tbe mentio-for attribute');
                return;
              }
              if (!scope.triggerChar) {
                $log.error('mentio-menu requires a trigger char');
                return;
              }
              $rootScope.$broadcast('menuCreated', {
                targetElement: scope.forElem,
                scope: scope
              });
            }
            angular.element($window).bind(
              'resize',
              function() {
                if (scope.isVisible()) {
                  var triggerCharSet = [];
                  triggerCharSet.push(scope.triggerChar);
                  mentioUtil.popUnderMention(scope.parentMentio.context(),
                    triggerCharSet, element, scope.requireLeadingSpace);
                }
              }
            );
            scope.$watch('items', function(items) {
              if (items && items.length > 0) {
                scope.activate(items[0]);
                if (!scope.visible && scope.requestVisiblePendingSearch) {
                  scope.visible = true;
                  scope.requestVisiblePendingSearch = false;
                }
                $timeout(function() {
                  var menu = element.find(".dropdown-menu");
                  if (menu.length > 0 && menu.offset().top < 0)
                    menu.addClass("reverse");
                }, 0, false);
              } else {
                scope.activate({
                  termLengthIsZero: true
                });
              }
            });
            scope.$watch('isVisible()', function(visible) {
              if (visible) {
                var triggerCharSet = [];
                triggerCharSet.push(scope.triggerChar);
                mentioUtil.popUnderMention(scope.parentMentio.context(),
                  triggerCharSet, element, scope.requireLeadingSpace);
              } else {
                element.find(".dropdown-menu").removeClass("reverse");
              }
            });
            var prevScroll;
            scope.parentMentio.scrollBarParents.each(function() {
              angular.element(this).on("scroll.mentio", function() {
                if (!prevScroll)
                  prevScroll = this.scrollTop;
                var scrollDiff = prevScroll - this.scrollTop;
                prevScroll = this.scrollTop;
                if (element[0].style["position"] === "absolute") {
                  element[0].style["z-index"] = 9;
                  element[0].style.top = (parseInt(element[0].style.top) + scrollDiff) + "px";
                }
              });
            });
            scope.parentMentio.$on('$destroy', function() {
              element.remove();
            });
            scope.hideMenu = function() {
              scope.visible = false;
              element.css('display', 'none');
            };
            scope.adjustScroll = function(direction) {
              var menuEl = element[0];
              var menuItemsList = menuEl.querySelector('ul');
              var menuItem = menuEl.querySelector('[mentio-menu-item].active');
              if (scope.isFirstItemActive()) {
                return menuItemsList.scrollTop = 0;
              } else if (scope.isLastItemActive()) {
                return menuItemsList.scrollTop = menuItemsList.scrollHeight;
              }
              if (direction === 1) {
                menuItemsList.scrollTop += menuItem.offsetHeight;
              } else {
                menuItemsList.scrollTop -= menuItem.offsetHeight;
              }
            };
          }
        };
      }
    ])
    .directive('mentioMenuItem', function() {
      return {
        restrict: 'A',
        scope: {
          item: '=mentioMenuItem'
        },
        require: '^mentioMenu',
        link: function(scope, element, attrs, controller) {
          scope.$watch(function() {
            return controller.isActive(scope.item);
          }, function(active) {
            if (active) {
              element.addClass('active');
            } else {
              element.removeClass('active');
            }
          });
          element.bind('mouseenter', function() {
            scope.$apply(function() {
              controller.activate(scope.item);
            });
          });
          element.bind('click', function() {
            controller.selectItem(scope.item);
            return false;
          });
        }
      };
    })
    .filter('unsafe', ["$sce", function($sce) {
      return function(val) {
        return $sce.trustAsHtml(val);
      };
    }])
    .filter('mentioHighlight', function() {
      function escapeRegexp(queryToEscape) {
        return queryToEscape.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
      }
      return function(matchItem, query, hightlightClass) {
        if (query) {
          var replaceText = hightlightClass ?
            '<span class="' + hightlightClass + '">$&</span>' :
            '<strong>$&</strong>';
          return ('' + matchItem).replace(new RegExp(escapeRegexp(query), 'gi'), replaceText);
        } else {
          return matchItem;
        }
      };
    });
  'use strict';
  angular.module('mentio')
    .factory('mentioUtil', ["$window", "$location", "$anchorScroll", "$timeout", function($window, $location, $anchorScroll, $timeout) {
      function popUnderMention(ctx, triggerCharSet, selectionEl, requireLeadingSpace) {
        var coordinates;
        var mentionInfo = getTriggerInfo(ctx, triggerCharSet, requireLeadingSpace, false);
        if (mentionInfo !== undefined) {
          if (selectedElementIsTextAreaOrInput(ctx)) {
            coordinates = getTextAreaOrInputUnderlinePosition(ctx, getDocument(ctx).activeElement,
              mentionInfo.mentionPosition);
          } else {
            coordinates = getContentEditableCaretPosition(ctx, mentionInfo.mentionPosition);
          }
          selectionEl.css({
            top: coordinates.top + 'px',
            left: coordinates.left + 'px',
            position: 'absolute',
            zIndex: 5000,
            display: 'block'
          });
          $timeout(function() {
            scrollIntoView(ctx, selectionEl);
          }, 0);
        } else {
          selectionEl.css({
            display: 'none'
          });
        }
      }

      function scrollIntoView(ctx, elem) {
        var reasonableBuffer = 20;
        var maxScrollDisplacement = 100;
        var clientRect;
        var e = elem[0];
        while (clientRect === undefined || clientRect.height === 0) {
          clientRect = e.getBoundingClientRect();
          if (clientRect.height === 0) {
            e = e.childNodes[0];
            if (e === undefined || !e.getBoundingClientRect) {
              return;
            }
          }
        }
        var elemTop = clientRect.top;
        var elemBottom = elemTop + clientRect.height;
        if (elemTop < 0) {
          $window.scrollTo(0, $window.pageYOffset + clientRect.top - reasonableBuffer);
        } else if (elemBottom > $window.innerHeight) {
          var maxY = $window.pageYOffset + clientRect.top - reasonableBuffer;
          if (maxY - $window.pageYOffset > maxScrollDisplacement) {
            maxY = $window.pageYOffset + maxScrollDisplacement;
          }
          var targetY = $window.pageYOffset - ($window.innerHeight - elemBottom);
          if (targetY > maxY) {
            targetY = maxY;
          }
          $window.scrollTo(0, targetY);
        }
      }

      function selectedElementIsTextAreaOrInput(ctx) {
        var element = getDocument(ctx).activeElement;
        if (element !== null) {
          var nodeName = element.nodeName;
          var type = element.getAttribute('type');
          return (nodeName === 'INPUT' && type === 'text') || nodeName === 'TEXTAREA';
        }
        return false;
      }

      function selectElement(ctx, targetElement, path, offset) {
        var range;
        var elem = targetElement;
        if (path) {
          for (var i = 0; i < path.length; i++) {
            elem = elem.childNodes[path[i]];
            if (elem === undefined) {
              return;
            }
            while (elem.length < offset) {
              offset -= elem.length;
              elem = elem.nextSibling;
            }
            if (elem.childNodes.length === 0 && !elem.length) {
              elem = elem.previousSibling;
            }
          }
        }
        var sel = getWindowSelection(ctx);
        range = getDocument(ctx).createRange();
        range.setStart(elem, offset);
        range.setEnd(elem, offset);
        range.collapse(true);
        try {
          sel.removeAllRanges();
        } catch (error) {}
        sel.addRange(range);
        targetElement.focus();
      }

      function pasteHtml(ctx, html, startPos, endPos) {
        var range, sel;
        sel = getWindowSelection(ctx);
        range = getDocument(ctx).createRange();
        range.setStart(sel.anchorNode, startPos);
        range.setEnd(sel.anchorNode, endPos);
        range.deleteContents();
        var el = getDocument(ctx).createElement('div');
        el.innerHTML = html;
        var frag = getDocument(ctx).createDocumentFragment(),
          node, lastNode;
        while ((node = el.firstChild)) {
          lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);
        if (lastNode) {
          range = range.cloneRange();
          range.setStartAfter(lastNode);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }

      function resetSelection(ctx, targetElement, path, offset) {
        var nodeName = targetElement.nodeName;
        if (nodeName === 'INPUT' || nodeName === 'TEXTAREA') {
          if (targetElement !== getDocument(ctx).activeElement) {
            targetElement.focus();
          }
        } else {
          selectElement(ctx, targetElement, path, offset);
        }
      }

      function replaceMacroText(ctx, targetElement, path, offset, macros, text) {
        resetSelection(ctx, targetElement, path, offset);
        var macroMatchInfo = getMacroMatch(ctx, macros);
        if (macroMatchInfo.macroHasTrailingSpace) {
          macroMatchInfo.macroText = macroMatchInfo.macroText + '\xA0';
          text = text + '\xA0';
        }
        if (macroMatchInfo !== undefined) {
          var element = getDocument(ctx).activeElement;
          if (selectedElementIsTextAreaOrInput(ctx)) {
            var startPos = macroMatchInfo.macroPosition;
            var endPos = macroMatchInfo.macroPosition + macroMatchInfo.macroText.length;
            element.value = element.value.substring(0, startPos) + text +
              element.value.substring(endPos, element.value.length);
            element.selectionStart = startPos + text.length;
            element.selectionEnd = startPos + text.length;
          } else {
            pasteHtml(ctx, text, macroMatchInfo.macroPosition,
              macroMatchInfo.macroPosition + macroMatchInfo.macroText.length);
          }
        }
      }

      function replaceTriggerText(ctx, targetElement, path, offset, triggerCharSet,
        text, requireLeadingSpace, hasTrailingSpace, suppressTrailingSpace) {
        resetSelection(ctx, targetElement, path, offset);
        var mentionInfo = getTriggerInfo(ctx, triggerCharSet, requireLeadingSpace, true, hasTrailingSpace);
        if (mentionInfo !== undefined) {
          if (selectedElementIsTextAreaOrInput()) {
            var myField = getDocument(ctx).activeElement;
            if (!suppressTrailingSpace) {
              text = text + ' ';
            }
            var startPos = mentionInfo.mentionPosition;
            var endPos = mentionInfo.mentionPosition + mentionInfo.mentionText.length + 1;
            myField.value = myField.value.substring(0, startPos) + text +
              myField.value.substring(endPos, myField.value.length);
            myField.selectionStart = startPos + text.length;
            myField.selectionEnd = startPos + text.length;
          } else {
            if (!suppressTrailingSpace) {
              text = text + '\xA0';
            }
            pasteHtml(ctx, text, mentionInfo.mentionPosition,
              mentionInfo.mentionPosition + mentionInfo.mentionText.length + 1);
          }
        }
      }

      function getNodePositionInParent(ctx, elem) {
        if (elem.parentNode === null) {
          return 0;
        }
        for (var i = 0; i < elem.parentNode.childNodes.length; i++) {
          var node = elem.parentNode.childNodes[i];
          if (node === elem) {
            return i;
          }
        }
      }

      function getMacroMatch(ctx, macros) {
        var selected, path = [],
          offset;
        if (selectedElementIsTextAreaOrInput(ctx)) {
          selected = getDocument(ctx).activeElement;
        } else {
          var selectionInfo = getContentEditableSelectedPath(ctx);
          if (selectionInfo) {
            selected = selectionInfo.selected;
            path = selectionInfo.path;
            offset = selectionInfo.offset;
          }
        }
        var effectiveRange = getTextPrecedingCurrentSelection(ctx);
        if (effectiveRange !== undefined && effectiveRange !== null) {
          var matchInfo;
          var hasTrailingSpace = false;
          if (effectiveRange.length > 0 &&
            (effectiveRange.charAt(effectiveRange.length - 1) === '\xA0' ||
              effectiveRange.charAt(effectiveRange.length - 1) === ' ')) {
            hasTrailingSpace = true;
            effectiveRange = effectiveRange.substring(0, effectiveRange.length - 1);
          }
          angular.forEach(macros, function(macro, c) {
            var idx = effectiveRange.toUpperCase().lastIndexOf(c.toUpperCase());
            if (idx >= 0 && c.length + idx === effectiveRange.length) {
              var prevCharPos = idx - 1;
              if (idx === 0 || effectiveRange.charAt(prevCharPos) === '\xA0' ||
                effectiveRange.charAt(prevCharPos) === ' ') {
                matchInfo = {
                  macroPosition: idx,
                  macroText: c,
                  macroSelectedElement: selected,
                  macroSelectedPath: path,
                  macroSelectedOffset: offset,
                  macroHasTrailingSpace: hasTrailingSpace
                };
              }
            }
          });
          if (matchInfo) {
            return matchInfo;
          }
        }
      }

      function getContentEditableSelectedPath(ctx) {
        var sel = getWindowSelection(ctx);
        var selected = sel.anchorNode;
        var path = [];
        var offset;
        if (selected != null) {
          var i;
          var ce = selected.contentEditable;
          while (selected !== null && ce !== 'true') {
            i = getNodePositionInParent(ctx, selected);
            path.push(i);
            selected = selected.parentNode;
            if (selected !== null) {
              ce = selected.contentEditable;
            }
          }
          path.reverse();
          offset = sel.getRangeAt(0).startOffset;
          return {
            selected: selected,
            path: path,
            offset: offset
          };
        }
      }

      function getTriggerInfo(ctx, triggerCharSet, requireLeadingSpace, menuAlreadyActive, hasTrailingSpace) {
        var selected, path, offset;
        if (selectedElementIsTextAreaOrInput(ctx)) {
          selected = getDocument(ctx).activeElement;
        } else {
          var selectionInfo = getContentEditableSelectedPath(ctx);
          if (selectionInfo) {
            selected = selectionInfo.selected;
            path = selectionInfo.path;
            offset = selectionInfo.offset;
          }
        }
        var effectiveRange = getTextPrecedingCurrentSelection(ctx);
        if (effectiveRange !== undefined && effectiveRange !== null) {
          var mostRecentTriggerCharPos = -1;
          var triggerChar;
          triggerCharSet.forEach(function(c) {
            var idx = effectiveRange.lastIndexOf(c);
            if (idx > mostRecentTriggerCharPos) {
              mostRecentTriggerCharPos = idx;
              triggerChar = c;
            }
          });
          if (mostRecentTriggerCharPos >= 0 &&
            (
              mostRecentTriggerCharPos === 0 ||
              !requireLeadingSpace ||
              /[\xA0\s]/g.test(
                effectiveRange.substring(
                  mostRecentTriggerCharPos - 1,
                  mostRecentTriggerCharPos)
              )
            )
          ) {
            var currentTriggerSnippet = effectiveRange.substring(mostRecentTriggerCharPos + 1,
              effectiveRange.length);
            triggerChar = effectiveRange.substring(mostRecentTriggerCharPos, mostRecentTriggerCharPos + 1);
            var firstSnippetChar = currentTriggerSnippet.substring(0, 1);
            var leadingSpace = currentTriggerSnippet.length > 0 &&
              (
                firstSnippetChar === ' ' ||
                firstSnippetChar === '\xA0'
              );
            if (hasTrailingSpace) {
              currentTriggerSnippet = currentTriggerSnippet.trim();
            }
            if (!leadingSpace && (menuAlreadyActive || !(/[\xA0\s]/g.test(currentTriggerSnippet)))) {
              return {
                mentionPosition: mostRecentTriggerCharPos,
                mentionText: currentTriggerSnippet,
                mentionSelectedElement: selected,
                mentionSelectedPath: path,
                mentionSelectedOffset: offset,
                mentionTriggerChar: triggerChar
              };
            }
          }
        }
      }

      function getWindowSelection(ctx) {
        if (!ctx) {
          return window.getSelection();
        } else {
          return ctx.iframe.contentWindow.getSelection();
        }
      }

      function getDocument(ctx) {
        if (!ctx) {
          return document;
        } else {
          return ctx.iframe.contentWindow.document;
        }
      }

      function getTextPrecedingCurrentSelection(ctx) {
        var text;
        if (selectedElementIsTextAreaOrInput(ctx)) {
          var textComponent = getDocument(ctx).activeElement;
          var startPos = textComponent.selectionStart;
          text = textComponent.value.substring(0, startPos);
        } else {
          var selectedElem = getWindowSelection(ctx).anchorNode;
          if (selectedElem != null) {
            var workingNodeContent = selectedElem.textContent;
            var selectStartOffset = getWindowSelection(ctx).getRangeAt(0).startOffset;
            if (selectStartOffset >= 0) {
              text = workingNodeContent.substring(0, selectStartOffset);
            }
          }
        }
        return text;
      }

      function getContentEditableCaretPosition(ctx, selectedNodePosition) {
        var markerTextChar = '\ufeff';
        var markerEl, markerId = 'sel_' + new Date().getTime() + '_' + Math.random().toString().substr(2);
        var range;
        var sel = getWindowSelection(ctx);
        var prevRange = sel.getRangeAt(0);
        range = getDocument(ctx).createRange();
        range.setStart(sel.anchorNode, selectedNodePosition);
        range.setEnd(sel.anchorNode, selectedNodePosition);
        range.collapse(false);
        markerEl = getDocument(ctx).createElement('span');
        markerEl.id = markerId;
        markerEl.appendChild(getDocument(ctx).createTextNode(markerTextChar));
        range.insertNode(markerEl);
        sel.removeAllRanges();
        sel.addRange(prevRange);
        var coordinates = {
          left: 0,
          top: markerEl.offsetHeight
        };
        localToGlobalCoordinates(ctx, markerEl, coordinates);
        markerEl.parentNode.removeChild(markerEl);
        return coordinates;
      }

      function localToGlobalCoordinates(ctx, element, coordinates) {
        var obj = element;
        var iframe = ctx ? ctx.iframe : null;
        while (obj) {
          coordinates.left += obj.offsetLeft;
          coordinates.top += obj.offsetTop;
          if (obj !== getDocument().body) {
            coordinates.top -= obj.scrollTop;
            coordinates.left -= obj.scrollLeft;
          }
          obj = obj.offsetParent;
          if (!obj && iframe) {
            obj = iframe;
            iframe = null;
          }
        }
      }

      function getTextAreaOrInputUnderlinePosition(ctx, element, position) {
        var properties = [
          'direction',
          'boxSizing',
          'width',
          'height',
          'overflowX',
          'overflowY',
          'borderTopWidth',
          'borderRightWidth',
          'borderBottomWidth',
          'borderLeftWidth',
          'paddingTop',
          'paddingRight',
          'paddingBottom',
          'paddingLeft',
          'fontStyle',
          'fontVariant',
          'fontWeight',
          'fontStretch',
          'fontSize',
          'fontSizeAdjust',
          'lineHeight',
          'fontFamily',
          'textAlign',
          'textTransform',
          'textIndent',
          'textDecoration',
          'letterSpacing',
          'wordSpacing'
        ];
        var isFirefox = (window.mozInnerScreenX !== null);
        var div = getDocument(ctx).createElement('div');
        div.id = 'input-textarea-caret-position-mirror-div';
        getDocument(ctx).body.appendChild(div);
        var style = div.style;
        var computed = window.getComputedStyle ? getComputedStyle(element) : element.currentStyle;
        style.whiteSpace = 'pre-wrap';
        if (element.nodeName !== 'INPUT') {
          style.wordWrap = 'break-word';
        }
        style.position = 'absolute';
        style.visibility = 'hidden';
        properties.forEach(function(prop) {
          style[prop] = computed[prop];
        });
        if (isFirefox) {
          style.width = (parseInt(computed.width) - 2) + 'px';
          if (element.scrollHeight > parseInt(computed.height))
            style.overflowY = 'scroll';
        } else {
          style.overflow = 'hidden';
        }
        div.textContent = element.value.substring(0, position);
        if (element.nodeName === 'INPUT') {
          div.textContent = div.textContent.replace(/\s/g, '\u00a0');
        }
        var span = getDocument(ctx).createElement('span');
        span.textContent = element.value.substring(position) || '.';
        div.appendChild(span);
        var coordinates = {
          top: span.offsetTop + parseInt(computed.borderTopWidth) + parseInt(computed.fontSize),
          left: span.offsetLeft + parseInt(computed.borderLeftWidth)
        };
        localToGlobalCoordinates(ctx, element, coordinates);
        getDocument(ctx).body.removeChild(div);
        return coordinates;
      }
      return {
        popUnderMention: popUnderMention,
        replaceMacroText: replaceMacroText,
        replaceTriggerText: replaceTriggerText,
        getMacroMatch: getMacroMatch,
        getTriggerInfo: getTriggerInfo,
        selectElement: selectElement,
        getTextAreaOrInputUnderlinePosition: getTextAreaOrInputUnderlinePosition,
        getTextPrecedingCurrentSelection: getTextPrecedingCurrentSelection,
        getContentEditableSelectedPath: getContentEditableSelectedPath,
        getNodePositionInParent: getNodePositionInParent,
        getContentEditableCaretPosition: getContentEditableCaretPosition,
        pasteHtml: pasteHtml,
        resetSelection: resetSelection,
        scrollIntoView: scrollIntoView
      };
    }]);
  angular.module("mentio").run(["$templateCache", function($templateCache) {
    $templateCache.put("mentio-menu.tpl.html", "<style>\n.scrollable-menu {\n    height: auto;\n    max-height: 300px;\n    overflow: auto;\n}\n\n.menu-highlighted {\n    font-weight: bold;\n}\n</style>\n<ul class=\"dropdown-menu scrollable-menu\" style=\"display:block\">\n    <li mentio-menu-item=\"item\" ng-repeat=\"item in items track by $index\">\n        <a class=\"text-primary\" ng-bind-html=\"item.label | mentioHighlight:typedTerm:\'menu-highlighted\' | unsafe\"></a>\n    </li>\n</ul>");
  }]);
})();
/*! RESOURCE: /scripts/thirdparty/typeahead/typeahead.jquery.js */
(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define("typeahead.js", ["jquery"], function(a0) {
      return factory(a0);
    });
  } else if (typeof exports === "object") {
    module.exports = factory(require("jquery"));
  } else {
    factory(jQuery);
  }
})(this, function($) {
    var _ = function() {
      "use strict";
      return {
        isMsie: function() {
          return /(msie|trident)/i.test(navigator.userAgent) ? navigator.userAgent.match(/(msie |rv:)(\d+(.\d+)?)/i)[2] : false;
        },
        isBlankString: function(str) {
          return !str || /^\s*$/.test(str);
        },
        escapeRegExChars: function(str) {
          return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        },
        isString: function(obj) {
          return typeof obj === "string";
        },
        isNumber: function(obj) {
          return typeof obj === "number";
        },
        isArray: $.isArray,
        isFunction: $.isFunction,
        isObject: $.isPlainObject,
        isUndefined: function(obj) {
          return typeof obj === "undefined";
        },
        isElement: function(obj) {
          return !!(obj && obj.nodeType === 1);
        },
        isJQuery: function(obj) {
          return obj instanceof $;
        },
        toStr: function toStr(s) {
          return _.isUndefined(s) || s === null ? "" : s + "";
        },
        bind: $.proxy,
        each: function(collection, cb) {
          $.each(collection, reverseArgs);

          function reverseArgs(index, value) {
            return cb(value, index);
          }
        },
        map: $.map,
        filter: $.grep,
        every: function(obj, test) {
          var result = true;
          if (!obj) {
            return result;
          }
          $.each(obj, function(key, val) {
            if (!(result = test.call(null, val, key, obj))) {
              return false;
            }
          });
          return !!result;
        },
        some: function(obj, test) {
          var result = false;
          if (!obj) {
            return result;
          }
          $.each(obj, function(key, val) {
            if (result = test.call(null, val, key, obj)) {
              return false;
            }
          });
          return !!result;
        },
        mixin: $.extend,
        identity: function(x) {
          return x;
        },
        clone: function(obj) {
          return $.extend(true, {}, obj);
        },
        getIdGenerator: function() {
          var counter = 0;
          return function() {
            return counter++;
          };
        },
        templatify: function templatify(obj) {
          return $.isFunction(obj) ? obj : template;

          function template() {
            return String(obj);
          }
        },
        defer: function(fn) {
          setTimeout(fn, 0);
        },
        debounce: function(func, wait, immediate) {
          var timeout, result;
          return function() {
            var context = this,
              args = arguments,
              later, callNow;
            later = function() {
              timeout = null;
              if (!immediate) {
                result = func.apply(context, args);
              }
            };
            callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
              result = func.apply(context, args);
            }
            return result;
          };
        },
        throttle: function(func, wait) {
          var context, args, timeout, result, previous, later;
          previous = 0;
          later = function() {
            previous = new Date();
            timeout = null;
            result = func.apply(context, args);
          };
          return function() {
            var now = new Date(),
              remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0) {
              clearTimeout(timeout);
              timeout = null;
              previous = now;
              result = func.apply(context, args);
            } else if (!timeout) {
              timeout = setTimeout(later, remaining);
            }
            return result;
          };
        },
        stringify: function(val) {
          return _.isString(val) ? val : JSON.stringify(val);
        },
        noop: function() {}
      };
    }();
    var WWW = function() {
      "use strict";
      var defaultClassNames = {
        wrapper: "twitter-typeahead",
        input: "tt-input",
        hint: "tt-hint",
        menu: "tt-menu",
        dataset: "tt-dataset",
        suggestion: "tt-suggestion",
        selectable: "tt-selectable",
        empty: "tt-empty",
        open: "tt-open",
        cursor: "tt-cursor",
        highlight: "tt-highlight"
      };
      return build;

      function build(o) {
        var www, classes;
        classes = _.mixin({}, defaultClassNames, o);
        www = {
          css: buildCss(),
          classes: classes,
          html: buildHtml(classes),
          selectors: buildSelectors(classes)
        };
        return {
          css: www.css,
          html: www.html,
          classes: www.classes,
          selectors: www.selectors,
          mixin: function(o) {
            _.mixin(o, www);
          }
        };
      }

      function buildHtml(c) {
        return {
          wrapper: '<span class="' + c.wrapper + '"></span>',
          menu: '<div class="' + c.menu + '"></div>'
        };
      }

      function buildSelectors(classes) {
        var selectors = {};
        _.each(classes, function(v, k) {
          selectors[k] = "." + v;
        });
        return selectors;
      }

      function buildCss() {
        var css = {
          wrapper: {
            position: "relative",
            display: "inline-block"
          },
          hint: {
            position: "absolute",
            top: "0",
            left: "0",
            borderColor: "transparent",
            boxShadow: "none",
            opacity: "1"
          },
          input: {
            position: "relative",
            verticalAlign: "top",
            backgroundColor: "transparent"
          },
          inputWithNoHint: {
            position: "relative",
            verticalAlign: "top"
          },
          menu: {
            position: "absolute",
            top: "100%",
            left: "0",
            zIndex: "100",
            display: "none"
          },
          ltr: {
            left: "0",
            right: "auto"
          },
          rtl: {
            left: "auto",
            right: " 0"
          }
        };
        if (_.isMsie()) {
          _.mixin(css.input, {
            backgroundImage: "url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)"
          });
        }
        return css;
      }
    }();
    var EventBus = function() {
      "use strict";
      var namespace, deprecationMap;
      namespace = "typeahead:";
      deprecationMap = {
        render: "rendered",
        cursorchange: "cursorchanged",
        select: "selected",
        autocomplete: "autocompleted"
      };

      function EventBus(o) {
        if (!o || !o.el) {
          $.error("EventBus initialized without el");
        }
        this.$el = $(o.el);
      }
      _.mixin(EventBus.prototype, {
        _trigger: function(type, args) {
          var $e;
          $e = $.Event(namespace + type);
          (args = args || []).unshift($e);
          this.$el.trigger.apply(this.$el, args);
          return $e;
        },
        before: function(type) {
          var args, $e;
          args = [].slice.call(arguments, 1);
          $e = this._trigger("before" + type, args);
          return $e.isDefaultPrevented();
        },
        trigger: function(type) {
          var deprecatedType;
          this._trigger(type, [].slice.call(arguments, 1));
          if (deprecatedType = deprecationMap[type]) {
            this._trigger(deprecatedType, [].slice.call(arguments, 1));
          }
        }
      });
      return EventBus;
    }();
    var EventEmitter = function() {
      "use strict";
      var splitter = /\s+/,
        nextTick = getNextTick();
      return {
        onSync: onSync,
        onAsync: onAsync,
        off: off,
        trigger: trigger
      };

      function on(method, types, cb, context) {
        var type;
        if (!cb) {
          return this;
        }
        types = types.split(splitter);
        cb = context ? bindContext(cb, context) : cb;
        this._callbacks = this._callbacks || {};
        while (type = types.shift()) {
          this._callbacks[type] = this._callbacks[type] || {
            sync: [],
            async: []
          };
          this._callbacks[type][method].push(cb);
        }
        return this;
      }

      function onAsync(types, cb, context) {
        return on.call(this, "async", types, cb, context);
      }

      function onSync(types, cb, context) {
        return on.call(this, "sync", types, cb, context);
      }

      function off(types) {
        var type;
        if (!this._callbacks) {
          return this;
        }
        types = types.split(splitter);
        while (type = types.shift()) {
          delete this._callbacks[type];
        }
        return this;
      }

      function trigger(types) {
        var type, callbacks, args, syncFlush, asyncFlush;
        if (!this._callbacks) {
          return this;
        }
        types = types.split(splitter);
        args = [].slice.call(arguments, 1);
        while ((type = types.shift()) && (callbacks = this._callbacks[type])) {
          syncFlush = getFlush(callbacks.sync, this, [type].concat(args));
          asyncFlush = getFlush(callbacks.async, this, [type].concat(args));
          syncFlush() && nextTick(asyncFlush);
        }
        return this;
      }

      function getFlush(callbacks, context, args) {
        return flush;

        function flush() {
          var cancelled;
          for (var i = 0, len = callbacks.length; !cancelled && i < len; i += 1) {
            cancelled = callbacks[i].apply(context, args) === false;
          }
          return !cancelled;
        }
      }

      function getNextTick() {
        var nextTickFn;
        if (window.setImmediate) {
          nextTickFn = function nextTickSetImmediate(fn) {
            setImmediate(function() {
              fn();
            });
          };
        } else {
          nextTickFn = function nextTickSetTimeout(fn) {
            setTimeout(function() {
              fn();
            }, 0);
          };
        }
        return nextTickFn;
      }

      function bindContext(fn, context) {
        return fn.bind ? fn.bind(context) : function() {
          fn.apply(context, [].slice.call(arguments, 0));
        };
      }
    }();
    var highlight = function(doc) {
      "use strict";
      var defaults = {
        node: null,
        pattern: null,
        tagName: "strong",
        className: null,
        wordsOnly: false,
        caseSensitive: false
      };
      return function hightlight(o) {
        var regex;
        o = _.mixin({}, defaults, o);
        if (!o.node || !o.pattern) {
          return;
        }
        o.pattern = _.isArray(o.pattern) ? o.pattern : [o.pattern];
        regex = getRegex(o.pattern, o.caseSensitive, o.wordsOnly);
        traverse(o.node, hightlightTextNode);

        function hightlightTextNode(textNode) {
          var match, patternNode, wrapperNode;
          if (match = regex.exec(textNode.data)) {
            wrapperNode = doc.createElement(o.tagName);
            o.className && (wrapperNode.className = o.className);
            patternNode = textNode.splitText(match.index);
            patternNode.splitText(match[0].length);
            wrapperNode.appendChild(patternNode.cloneNode(true));
            textNode.parentNode.replaceChild(wrapperNode, patternNode);
          }
          return !!match;
        }

        function traverse(el, hightlightTextNode) {
          var childNode, TEXT_NODE_TYPE = 3;
          for (var i = 0; i < el.childNodes.length; i++) {
            childNode = el.childNodes[i];
            if (childNode.nodeType === TEXT_NODE_TYPE) {
              i += hightlightTextNode(childNode) ? 1 : 0;
            } else {
              traverse(childNode, hightlightTextNode);
            }
          }
        }
      };

      function getRegex(patterns, caseSensitive, wordsOnly) {
        var escapedPatterns = [],
          regexStr;
        for (var i = 0, len = patterns.length; i < len; i++) {
          escapedPatterns.push(_.escapeRegExChars(patterns[i]));
        }
        regexStr = wordsOnly ? "\\b(" + escapedPatterns.join("|") + ")\\b" : "(" + escapedPatterns.join("|") + ")";
        return caseSensitive ? new RegExp(regexStr) : new RegExp(regexStr, "i");
      }
    }(window.document);
    var Input = function() {
        "use strict";
        var specialKeyCodeMap;
        specialKeyCodeMap = {
          9: "tab",
          27: "esc",
          37: "left",
          39: "right",
          13: "enter",
          38: "up",
          40: "down"
        };

        function Input(o, www) {
          o = o || {};
          if (!o.input) {
            $.error("input is missing");
          }
          www.mixin(this);
          this.$hint = $(o.hint);
          this.$input = $(o.input);
          this.query = this.$input.val();
          this.queryWhenFocused = this.hasFocus() ? this.query : null;
          this.$overflowHelper = buildOverflowHelper(this.$input);
          this._checkLanguageDirection();
          if (this.$hint.length === 0) {
            this.setHint = this.getHint = this.clearHint = this.clearHintIfInvalid = _.noop;
          }
        }
        Input.normalizeQuery = function(str) {
          return _.toStr(str).replace(/^\s*/g, "").replace(/\s{2,}/g, " ");
        };
        _.mixin(Input.prototype, EventEmitter, {
              _onBlur: function onBlur() {
                this.resetInputValue();
                this.trigger("blurred");
              },
              _onFocus: function onFocus() {
                this.queryWhenFocused = this.query;
                this.trigger("focused");
              },
              _onKeydown: function onKeydown($e) {
                var keyName = specialKeyCodeMap[$e.which || $e.keyCode];
                this._managePreventDefault(keyName, $e);
                if (keyName && this._shouldTrigger(keyName, $e)) {
                  this.trigger(keyName + "Keyed", $e);
                }
              },
              _onInput: function onInput() {
                this._setQuery(this.getInputValue());
                this.clearHintIfInvalid();
                this._checkLanguageDirection();
              },
              _managePreventDefault: function managePreventDefault(keyName, $e) {
                var preventDefault;
                switch (keyName) {
                  case "up":
                  case "down":
                    preventDefault = !withModifier($e);
                    break;
                  default:
                    preventDefault = false;
                }
                preventDefault && $e.preventDefault();
              },
              _shouldTrigger: function shouldTrigger(keyName, $e) {
                var trigger;
                switch (keyName) {
                  case "tab":
                    trigger = !withModifier($e);
                    break;
                  default:
                    trigger = true;
                }
                return trigger;
              },
              _checkLanguageDirection: function checkLanguageDirection() {
                var dir = (this.$input.css("direction") || "ltr").toLowerCase();
                if (this.dir !== dir) {
                  this.dir = dir;
                  this.$hint.attr("dir", dir);
                  this.trigger("langDirChanged", dir);
                }
              },
              _setQuery: function setQuery(val, silent) {
                var areEquivalent, hasDifferentWhitespace;
                areEquivalent = areQueriesEquivalent(val, this.query);
                hasDifferentWhitespace = areEquivalent ? this.query.length !== val.length : false;
                this.query = val;
                if (!silent && !areEquivalent) {
                  this.trigger("queryChanged", this.query);
                } else if (!silent && hasDifferentWhitespace) {
                  this.trigger("whitespaceChanged", this.query);
                }
              },
              bind: function() {
                var that = this,
                  onBlur, onFocus, onKeydown, onInput;
                onBlur = _.bind(this._onBlur, this);
                onFocus = _.bind(this._onFocus, this);
                onKeydown = _.bind(this._onKeydown, this);
                onInput = _.bind(this._onInput, this);
                this.$input.on("blur.tt", onBlur).on("focus.tt", onFocus).on("keydown.tt", onKeydown);
                if (!_.isMsie() || _.isMsie() > 9) {
                  this.$input.on("input.tt", onInput);
                } else {
                  this.$input.on("keydown.tt keypress.tt cut.tt paste.tt", function($e) {
                    if (specialKeyCodeMap[$e.which || $e.keyCode]) {
                      return;
                    }
                    _.defer(_.bind(that._onInput, that, $e));
                  });
                }
                return this;
              },
              focus: function focus() {
                this.$input.focus();
              },
              blur: function blur() {
                this.$input.blur();
              },
              getLangDir: function getLangDir() {
                return this.dir;
              },
              getQuery: function getQuery() {
                return this.query || "";
              },
              setQuery: function setQuery