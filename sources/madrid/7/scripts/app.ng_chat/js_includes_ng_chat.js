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
                  (
                    !isActive ||
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
})();;
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
      setQuery: function setQuery(val, silent) {
        this.setInputValue(val);
        this._setQuery(val, silent);
      },
      hasQueryChangedSinceLastFocus: function hasQueryChangedSinceLastFocus() {
        return this.query !== this.queryWhenFocused;
      },
      getInputValue: function getInputValue() {
        return this.$input.val();
      },
      setInputValue: function setInputValue(value) {
        this.$input.val(value);
        this.clearHintIfInvalid();
        this._checkLanguageDirection();
      },
      resetInputValue: function resetInputValue() {
        this.setInputValue(this.query);
      },
      getHint: function getHint() {
        return this.$hint.val();
      },
      setHint: function setHint(value) {
        this.$hint.val(value);
      },
      clearHint: function clearHint() {
        this.setHint("");
      },
      clearHintIfInvalid: function clearHintIfInvalid() {
        var val, hint, valIsPrefixOfHint, isValid;
        val = this.getInputValue();
        hint = this.getHint();
        valIsPrefixOfHint = val !== hint && hint.indexOf(val) === 0;
        isValid = val !== "" && valIsPrefixOfHint && !this.hasOverflow();
        !isValid && this.clearHint();
      },
      hasFocus: function hasFocus() {
        return this.$input.is(":focus");
      },
      hasOverflow: function hasOverflow() {
        var constraint = this.$input.width() - 2;
        this.$overflowHelper.text(this.getInputValue());
        return this.$overflowHelper.width() >= constraint;
      },
      isCursorAtEnd: function() {
        var valueLength, selectionStart, range;
        valueLength = this.$input.val().length;
        selectionStart = this.$input[0].selectionStart;
        if (_.isNumber(selectionStart)) {
          return selectionStart === valueLength;
        } else if (document.selection) {
          range = document.selection.createRange();
          range.moveStart("character", -valueLength);
          return valueLength === range.text.length;
        }
        return true;
      },
      destroy: function destroy() {
        this.$hint.off(".tt");
        this.$input.off(".tt");
        this.$overflowHelper.remove();
        this.$hint = this.$input = this.$overflowHelper = $("<div>");
      }
    });
    return Input;

    function buildOverflowHelper($input) {
      return $('<pre aria-hidden="true"></pre>').css({
        position: "absolute",
        visibility: "hidden",
        whiteSpace: "pre",
        fontFamily: $input.css("font-family"),
        fontSize: $input.css("font-size"),
        fontStyle: $input.css("font-style"),
        fontVariant: $input.css("font-variant"),
        fontWeight: $input.css("font-weight"),
        wordSpacing: $input.css("word-spacing"),
        letterSpacing: $input.css("letter-spacing"),
        textIndent: $input.css("text-indent"),
        textRendering: $input.css("text-rendering"),
        textTransform: $input.css("text-transform")
      }).insertAfter($input);
    }

    function areQueriesEquivalent(a, b) {
      return Input.normalizeQuery(a) === Input.normalizeQuery(b);
    }

    function withModifier($e) {
      return $e.altKey || $e.ctrlKey || $e.metaKey || $e.shiftKey;
    }
  }();
  var Dataset = function() {
    "use strict";
    var keys, nameGenerator;
    keys = {
      val: "tt-selectable-display",
      obj: "tt-selectable-object"
    };
    nameGenerator = _.getIdGenerator();

    function Dataset(o, www) {
      o = o || {};
      o.templates = o.templates || {};
      o.templates.notFound = o.templates.notFound || o.templates.empty;
      if (!o.source) {
        $.error("missing source");
      }
      if (!o.node) {
        $.error("missing node");
      }
      if (o.name && !isValidName(o.name)) {
        $.error("invalid dataset name: " + o.name);
      }
      www.mixin(this);
      this.highlight = !!o.highlight;
      this.name = o.name || nameGenerator();
      this.limit = o.limit || 5;
      this.displayFn = getDisplayFn(o.display || o.displayKey);
      this.templates = getTemplates(o.templates, this.displayFn);
      this.source = o.source.__ttAdapter ? o.source.__ttAdapter() : o.source;
      this.async = _.isUndefined(o.async) ? this.source.length > 2 : !!o.async;
      this._resetLastSuggestion();
      this.$el = $(o.node).addClass(this.classes.dataset).addClass(this.classes.dataset + "-" + this.name);
    }
    Dataset.extractData = function extractData(el) {
      var $el = $(el);
      if ($el.data(keys.obj)) {
        return {
          val: $el.data(keys.val) || "",
          obj: $el.data(keys.obj) || null
        };
      }
      return null;
    };
    _.mixin(Dataset.prototype, EventEmitter, {
      _overwrite: function overwrite(query, suggestions) {
        suggestions = suggestions || [];
        if (suggestions.length) {
          this._renderSuggestions(query, suggestions);
        } else if (this.async && this.templates.pending) {
          this._renderPending(query);
        } else if (!this.async && this.templates.notFound) {
          this._renderNotFound(query);
        } else {
          this._empty();
        }
        this.trigger("rendered", this.name, suggestions, false);
      },
      _append: function append(query, suggestions) {
        suggestions = suggestions || [];
        if (suggestions.length && this.$lastSuggestion.length) {
          this._appendSuggestions(query, suggestions);
        } else if (suggestions.length) {
          this._renderSuggestions(query, suggestions);
        } else if (!this.$lastSuggestion.length && this.templates.notFound) {
          this._renderNotFound(query);
        }
        this.trigger("rendered", this.name, suggestions, true);
      },
      _renderSuggestions: function renderSuggestions(query, suggestions) {
        var $fragment;
        $fragment = this._getSuggestionsFragment(query, suggestions);
        this.$lastSuggestion = $fragment.children().last();
        this.$el.html($fragment).prepend(this._getHeader(query, suggestions)).append(this._getFooter(query, suggestions));
      },
      _appendSuggestions: function appendSuggestions(query, suggestions) {
        var $fragment, $lastSuggestion;
        $fragment = this._getSuggestionsFragment(query, suggestions);
        $lastSuggestion = $fragment.children().last();
        this.$lastSuggestion.after($fragment);
        this.$lastSuggestion = $lastSuggestion;
      },
      _renderPending: function renderPending(query) {
        var template = this.templates.pending;
        this._resetLastSuggestion();
        template && this.$el.html(template({
          query: query,
          dataset: this.name
        }));
      },
      _renderNotFound: function renderNotFound(query) {
        var template = this.templates.notFound;
        this._resetLastSuggestion();
        template && this.$el.html(template({
          query: query,
          dataset: this.name
        }));
      },
      _empty: function empty() {
        this.$el.empty();
        this._resetLastSuggestion();
      },
      _getSuggestionsFragment: function getSuggestionsFragment(query, suggestions) {
        var that = this,
          fragment;
        fragment = document.createDocumentFragment();
        _.each(suggestions, function getSuggestionNode(suggestion) {
          var $el, context;
          context = that._injectQuery(query, suggestion);
          $el = $(that.templates.suggestion(context)).data(keys.obj, suggestion).data(keys.val, that.displayFn(suggestion)).addClass(that.classes.suggestion + " " + that.classes.selectable);
          fragment.appendChild($el[0]);
        });
        this.highlight && highlight({
          className: this.classes.highlight,
          node: fragment,
          pattern: query
        });
        return $(fragment);
      },
      _getFooter: function getFooter(query, suggestions) {
        return this.templates.footer ? this.templates.footer({
          query: query,
          suggestions: suggestions,
          dataset: this.name
        }) : null;
      },
      _getHeader: function getHeader(query, suggestions) {
        return this.templates.header ? this.templates.header({
          query: query,
          suggestions: suggestions,
          dataset: this.name
        }) : null;
      },
      _resetLastSuggestion: function resetLastSuggestion() {
        this.$lastSuggestion = $();
      },
      _injectQuery: function injectQuery(query, obj) {
        return _.isObject(obj) ? _.mixin({
          _query: query
        }, obj) : obj;
      },
      update: function update(query) {
        var that = this,
          canceled = false,
          syncCalled = false,
          rendered = 0;
        this.cancel();
        this.cancel = function cancel() {
          canceled = true;
          that.cancel = $.noop;
          that.async && that.trigger("asyncCanceled", query);
        };
        this.source(query, sync, async);
        !syncCalled && sync([]);

        function sync(suggestions) {
          if (syncCalled) {
            return;
          }
          syncCalled = true;
          suggestions = (suggestions || []).slice(0, that.limit);
          rendered = suggestions.length;
          that._overwrite(query, suggestions);
          if (rendered < that.limit && that.async) {
            that.trigger("asyncRequested", query);
          }
        }

        function async (suggestions) {
          suggestions = suggestions || [];
          if (!canceled && rendered < that.limit) {
            that.cancel = $.noop;
            that._append(query, suggestions.slice(0, that.limit - rendered));
            rendered += suggestions.length;
            that.async && that.trigger("asyncReceived", query);
          }
        }
      },
      cancel: $.noop,
      clear: function clear() {
        this._empty();
        this.cancel();
        this.trigger("cleared");
      },
      isEmpty: function isEmpty() {
        return this.$el.is(":empty");
      },
      destroy: function destroy() {
        this.$el = $("<div>");
      }
    });
    return Dataset;

    function getDisplayFn(display) {
      display = display || _.stringify;
      return _.isFunction(display) ? display : displayFn;

      function displayFn(obj) {
        return obj[display];
      }
    }

    function getTemplates(templates, displayFn) {
      return {
        notFound: templates.notFound && _.templatify(templates.notFound),
        pending: templates.pending && _.templatify(templates.pending),
        header: templates.header && _.templatify(templates.header),
        footer: templates.footer && _.templatify(templates.footer),
        suggestion: templates.suggestion || suggestionTemplate
      };

      function suggestionTemplate(context) {
        return $("<div>").text(displayFn(context));
      }
    }

    function isValidName(str) {
      return /^[_a-zA-Z0-9-]+$/.test(str);
    }
  }();
  var Menu = function() {
    "use strict";

    function Menu(o, www) {
      var that = this;
      o = o || {};
      if (!o.node) {
        $.error("node is required");
      }
      www.mixin(this);
      this.$node = $(o.node);
      this.query = null;
      this.datasets = _.map(o.datasets, initializeDataset);

      function initializeDataset(oDataset) {
        var node = that.$node.find(oDataset.node).first();
        oDataset.node = node.length ? node : $("<div>").appendTo(that.$node);
        return new Dataset(oDataset, www);
      }
    }
    _.mixin(Menu.prototype, EventEmitter, {
      _onSelectableClick: function onSelectableClick($e) {
        this.trigger("selectableClicked", $($e.currentTarget));
      },
      _onRendered: function onRendered(type, dataset, suggestions, async) {
        this.$node.toggleClass(this.classes.empty, this._allDatasetsEmpty());
        this.trigger("datasetRendered", dataset, suggestions, async);
      },
      _onCleared: function onCleared() {
        this.$node.toggleClass(this.classes.empty, this._allDatasetsEmpty());
        this.trigger("datasetCleared");
      },
      _propagate: function propagate() {
        this.trigger.apply(this, arguments);
      },
      _allDatasetsEmpty: function allDatasetsEmpty() {
        return _.every(this.datasets, isDatasetEmpty);

        function isDatasetEmpty(dataset) {
          return dataset.isEmpty();
        }
      },
      _getSelectables: function getSelectables() {
        return this.$node.find(this.selectors.selectable);
      },
      _removeCursor: function _removeCursor() {
        var $selectable = this.getActiveSelectable();
        $selectable && $selectable.removeClass(this.classes.cursor);
      },
      _ensureVisible: function ensureVisible($el) {
        var elTop, elBottom, nodeScrollTop, nodeHeight;
        elTop = $el.position().top;
        elBottom = elTop + $el.outerHeight(true);
        nodeScrollTop = this.$node.scrollTop();
        nodeHeight = this.$node.height() + parseInt(this.$node.css("paddingTop"), 10) + parseInt(this.$node.css("paddingBottom"), 10);
        if (elTop < 0) {
          this.$node.scrollTop(nodeScrollTop + elTop);
        } else if (nodeHeight < elBottom) {
          this.$node.scrollTop(nodeScrollTop + (elBottom - nodeHeight));
        }
      },
      bind: function() {
        var that = this,
          onSelectableClick;
        onSelectableClick = _.bind(this._onSelectableClick, this);
        this.$node.on("click.tt", this.selectors.selectable, onSelectableClick);
        _.each(this.datasets, function(dataset) {
          dataset.onSync("asyncRequested", that._propagate, that).onSync("asyncCanceled", that._propagate, that).onSync("asyncReceived", that._propagate, that).onSync("rendered", that._onRendered, that).onSync("cleared", that._onCleared, that);
        });
        return this;
      },
      isOpen: function isOpen() {
        return this.$node.hasClass(this.classes.open);
      },
      open: function open() {
        this.$node.addClass(this.classes.open);
      },
      close: function close() {
        this.$node.removeClass(this.classes.open);
        this._removeCursor();
      },
      setLanguageDirection: function setLanguageDirection(dir) {
        this.$node.attr("dir", dir);
      },
      selectableRelativeToCursor: function selectableRelativeToCursor(delta) {
        var $selectables, $oldCursor, oldIndex, newIndex;
        $oldCursor = this.getActiveSelectable();
        $selectables = this._getSelectables();
        oldIndex = $oldCursor ? $selectables.index($oldCursor) : -1;
        newIndex = oldIndex + delta;
        newIndex = (newIndex + 1) % ($selectables.length + 1) - 1;
        newIndex = newIndex < -1 ? $selectables.length - 1 : newIndex;
        return newIndex === -1 ? null : $selectables.eq(newIndex);
      },
      setCursor: function setCursor($selectable) {
        this._removeCursor();
        if ($selectable = $selectable && $selectable.first()) {
          $selectable.addClass(this.classes.cursor);
          this._ensureVisible($selectable);
        }
      },
      getSelectableData: function getSelectableData($el) {
        return $el && $el.length ? Dataset.extractData($el) : null;
      },
      getActiveSelectable: function getActiveSelectable() {
        var $selectable = this._getSelectables().filter(this.selectors.cursor).first();
        return $selectable.length ? $selectable : null;
      },
      getTopSelectable: function getTopSelectable() {
        var $selectable = this._getSelectables().first();
        return $selectable.length ? $selectable : null;
      },
      update: function update(query) {
        var isValidUpdate = query !== this.query;
        if (isValidUpdate) {
          this.query = query;
          _.each(this.datasets, updateDataset);
        }
        return isValidUpdate;

        function updateDataset(dataset) {
          dataset.update(query);
        }
      },
      empty: function empty() {
        _.each(this.datasets, clearDataset);
        this.query = null;
        this.$node.addClass(this.classes.empty);

        function clearDataset(dataset) {
          dataset.clear();
        }
      },
      destroy: function destroy() {
        this.$node.off(".tt");
        this.$node = $("<div>");
        _.each(this.datasets, destroyDataset);

        function destroyDataset(dataset) {
          dataset.destroy();
        }
      }
    });
    return Menu;
  }();
  var DefaultMenu = function() {
    "use strict";
    var s = Menu.prototype;

    function DefaultMenu() {
      Menu.apply(this, [].slice.call(arguments, 0));
    }
    _.mixin(DefaultMenu.prototype, Menu.prototype, {
      open: function open() {
        !this._allDatasetsEmpty() && this._show();
        return s.open.apply(this, [].slice.call(arguments, 0));
      },
      close: function close() {
        this._hide();
        return s.close.apply(this, [].slice.call(arguments, 0));
      },
      _onRendered: function onRendered() {
        if (this._allDatasetsEmpty()) {
          this._hide();
        } else {
          this.isOpen() && this._show();
        }
        return s._onRendered.apply(this, [].slice.call(arguments, 0));
      },
      _onCleared: function onCleared() {
        if (this._allDatasetsEmpty()) {
          this._hide();
        } else {
          this.isOpen() && this._show();
        }
        return s._onCleared.apply(this, [].slice.call(arguments, 0));
      },
      setLanguageDirection: function setLanguageDirection(dir) {
        this.$node.css(dir === "ltr" ? this.css.ltr : this.css.rtl);
        return s.setLanguageDirection.apply(this, [].slice.call(arguments, 0));
      },
      _hide: function hide() {
        this.$node.hide();
      },
      _show: function show() {
        this.$node.css("display", "block");
      }
    });
    return DefaultMenu;
  }();
  var Typeahead = function() {
    "use strict";

    function Typeahead(o, www) {
      var onFocused, onBlurred, onEnterKeyed, onTabKeyed, onEscKeyed, onUpKeyed, onDownKeyed, onLeftKeyed, onRightKeyed, onQueryChanged, onWhitespaceChanged;
      o = o || {};
      if (!o.input) {
        $.error("missing input");
      }
      if (!o.menu) {
        $.error("missing menu");
      }
      if (!o.eventBus) {
        $.error("missing event bus");
      }
      www.mixin(this);
      this.eventBus = o.eventBus;
      this.minLength = _.isNumber(o.minLength) ? o.minLength : 1;
      this.input = o.input;
      this.menu = o.menu;
      this.enabled = true;
      this.active = false;
      this.input.hasFocus() && this.activate();
      this.dir = this.input.getLangDir();
      this._hacks();
      this.menu.bind().onSync("selectableClicked", this._onSelectableClicked, this).onSync("asyncRequested", this._onAsyncRequested, this).onSync("asyncCanceled", this._onAsyncCanceled, this).onSync("asyncReceived", this._onAsyncReceived, this).onSync("datasetRendered", this._onDatasetRendered, this).onSync("datasetCleared", this._onDatasetCleared, this);
      onFocused = c(this, "activate", "open", "_onFocused");
      onBlurred = c(this, "deactivate", "_onBlurred");
      onEnterKeyed = c(this, "isActive", "isOpen", "_onEnterKeyed");
      onTabKeyed = c(this, "isActive", "isOpen", "_onTabKeyed");
      onEscKeyed = c(this, "isActive", "_onEscKeyed");
      onUpKeyed = c(this, "isActive", "open", "_onUpKeyed");
      onDownKeyed = c(this, "isActive", "open", "_onDownKeyed");
      onLeftKeyed = c(this, "isActive", "isOpen", "_onLeftKeyed");
      onRightKeyed = c(this, "isActive", "isOpen", "_onRightKeyed");
      onQueryChanged = c(this, "_openIfActive", "_onQueryChanged");
      onWhitespaceChanged = c(this, "_openIfActive", "_onWhitespaceChanged");
      this.input.bind().onSync("focused", onFocused, this).onSync("blurred", onBlurred, this).onSync("enterKeyed", onEnterKeyed, this).onSync("tabKeyed", onTabKeyed, this).onSync("escKeyed", onEscKeyed, this).onSync("upKeyed", onUpKeyed, this).onSync("downKeyed", onDownKeyed, this).onSync("leftKeyed", onLeftKeyed, this).onSync("rightKeyed", onRightKeyed, this).onSync("queryChanged", onQueryChanged, this).onSync("whitespaceChanged", onWhitespaceChanged, this).onSync("langDirChanged", this._onLangDirChanged, this);
    }
    _.mixin(Typeahead.prototype, {
      _hacks: function hacks() {
        var $input, $menu;
        $input = this.input.$input || $("<div>");
        $menu = this.menu.$node || $("<div>");
        $input.on("blur.tt", function($e) {
          var active, isActive, hasActive;
          active = document.activeElement;
          isActive = $menu.is(active);
          hasActive = $menu.has(active).length > 0;
          if (_.isMsie() && (isActive || hasActive)) {
            $e.preventDefault();
            $e.stopImmediatePropagation();
            _.defer(function() {
              $input.focus();
            });
          }
        });
        $menu.on("mousedown.tt", function($e) {
          $e.preventDefault();
        });
      },
      _onSelectableClicked: function onSelectableClicked(type, $el) {
        this.select($el);
      },
      _onDatasetCleared: function onDatasetCleared() {
        this._updateHint();
      },
      _onDatasetRendered: function onDatasetRendered(type, dataset, suggestions, async) {
        this._updateHint();
        this.eventBus.trigger("render", suggestions, async, dataset);
      },
      _onAsyncRequested: function onAsyncRequested(type, dataset, query) {
        this.eventBus.trigger("asyncrequest", query, dataset);
      },
      _onAsyncCanceled: function onAsyncCanceled(type, dataset, query) {
        this.eventBus.trigger("asynccancel", query, dataset);
      },
      _onAsyncReceived: function onAsyncReceived(type, dataset, query) {
        this.eventBus.trigger("asyncreceive", query, dataset);
      },
      _onFocused: function onFocused() {
        this._minLengthMet() && this.menu.update(this.input.getQuery());
      },
      _onBlurred: function onBlurred() {
        if (this.input.hasQueryChangedSinceLastFocus()) {
          this.eventBus.trigger("change", this.input.getQuery());
        }
      },
      _onEnterKeyed: function onEnterKeyed(type, $e) {
        var $selectable;
        if ($selectable = this.menu.getActiveSelectable()) {
          this.select($selectable) && $e.preventDefault();
        }
      },
      _onTabKeyed: function onTabKeyed(type, $e) {
        var $selectable;
        if ($selectable = this.menu.getActiveSelectable()) {
          this.select($selectable) && $e.preventDefault();
        } else if ($selectable = this.menu.getTopSelectable()) {
          this.autocomplete($selectable) && $e.preventDefault();
        }
      },
      _onEscKeyed: function onEscKeyed() {
        this.close();
      },
      _onUpKeyed: function onUpKeyed() {
        this.moveCursor(-1);
      },
      _onDownKeyed: function onDownKeyed() {
        this.moveCursor(+1);
      },
      _onLeftKeyed: function onLeftKeyed() {
        if (this.dir === "rtl" && this.input.isCursorAtEnd()) {
          this.autocomplete(this.menu.getTopSelectable());
        }
      },
      _onRightKeyed: function onRightKeyed() {
        if (this.dir === "ltr" && this.input.isCursorAtEnd()) {
          this.autocomplete(this.menu.getTopSelectable());
        }
      },
      _onQueryChanged: function onQueryChanged(e, query) {
        this._minLengthMet(query) ? this.menu.update(query) : this.menu.empty();
      },
      _onWhitespaceChanged: function onWhitespaceChanged() {
        this._updateHint();
      },
      _onLangDirChanged: function onLangDirChanged(e, dir) {
        if (this.dir !== dir) {
          this.dir = dir;
          this.menu.setLanguageDirection(dir);
        }
      },
      _openIfActive: function openIfActive() {
        this.isActive() && this.open();
      },
      _minLengthMet: function minLengthMet(query) {
        query = _.isString(query) ? query : this.input.getQuery() || "";
        return query.length >= this.minLength;
      },
      _updateHint: function updateHint() {
        var $selectable, data, val, query, escapedQuery, frontMatchRegEx, match;
        $selectable = this.menu.getTopSelectable();
        data = this.menu.getSelectableData($selectable);
        val = this.input.getInputValue();
        if (data && !_.isBlankString(val) && !this.input.hasOverflow()) {
          query = Input.normalizeQuery(val);
          escapedQuery = _.escapeRegExChars(query);
          frontMatchRegEx = new RegExp("^(?:" + escapedQuery + ")(.+$)", "i");
          match = frontMatchRegEx.exec(data.val);
          match && this.input.setHint(val + match[1]);
        } else {
          this.input.clearHint();
        }
      },
      isEnabled: function isEnabled() {
        return this.enabled;
      },
      enable: function enable() {
        this.enabled = true;
      },
      disable: function disable() {
        this.enabled = false;
      },
      isActive: function isActive() {
        return this.active;
      },
      activate: function activate() {
        if (this.isActive()) {
          return true;
        } else if (!this.isEnabled() || this.eventBus.before("active")) {
          return false;
        } else {
          this.active = true;
          this.eventBus.trigger("active");
          return true;
        }
      },
      deactivate: function deactivate() {
        if (!this.isActive()) {
          return true;
        } else if (this.eventBus.before("idle")) {
          return false;
        } else {
          this.active = false;
          this.close();
          this.eventBus.trigger("idle");
          return true;
        }
      },
      isOpen: function isOpen() {
        return this.menu.isOpen();
      },
      open: function open() {
        if (!this.isOpen() && !this.eventBus.before("open")) {
          this.menu.open();
          this._updateHint();
          this.eventBus.trigger("open");
        }
        return this.isOpen();
      },
      close: function close() {
        if (this.isOpen() && !this.eventBus.before("close")) {
          this.menu.close();
          this.input.clearHint();
          this.input.resetInputValue();
          this.eventBus.trigger("close");
        }
        return !this.isOpen();
      },
      setVal: function setVal(val) {
        this.input.setQuery(_.toStr(val));
      },
      getVal: function getVal() {
        return this.input.getQuery();
      },
      select: function select($selectable) {
        var data = this.menu.getSelectableData($selectable);
        if (data && !this.eventBus.before("select", data.obj)) {
          this.input.setQuery(data.val, true);
          this.eventBus.trigger("select", data.obj);
          this.close();
          return true;
        }
        return false;
      },
      autocomplete: function autocomplete($selectable) {
        var query, data, isValid;
        query = this.input.getQuery();
        data = this.menu.getSelectableData($selectable);
        isValid = data && query !== data.val;
        if (isValid && !this.eventBus.before("autocomplete", data.obj)) {
          this.input.setQuery(data.val);
          this.eventBus.trigger("autocomplete", data.obj);
          return true;
        }
        return false;
      },
      moveCursor: function moveCursor(delta) {
        var query, $candidate, data, payload, cancelMove;
        query = this.input.getQuery();
        $candidate = this.menu.selectableRelativeToCursor(delta);
        data = this.menu.getSelectableData($candidate);
        payload = data ? data.obj : null;
        cancelMove = this._minLengthMet() && this.menu.update(query);
        if (!cancelMove && !this.eventBus.before("cursorchange", payload)) {
          this.menu.setCursor($candidate);
          if (data) {
            this.input.setInputValue(data.val);
          } else {
            this.input.resetInputValue();
            this._updateHint();
          }
          this.eventBus.trigger("cursorchange", payload);
          return true;
        }
        return false;
      },
      destroy: function destroy() {
        this.input.destroy();
        this.menu.destroy();
      }
    });
    return Typeahead;

    function c(ctx) {
      var methods = [].slice.call(arguments, 1);
      return function() {
        var args = [].slice.call(arguments);
        _.each(methods, function(method) {
          return ctx[method].apply(ctx, args);
        });
      };
    }
  }();
  (function() {
    "use strict";
    var old, keys, methods;
    old = $.fn.typeahead;
    keys = {
      www: "tt-www",
      attrs: "tt-attrs",
      typeahead: "tt-typeahead"
    };
    methods = {
      initialize: function initialize(o, datasets) {
        var www;
        datasets = _.isArray(datasets) ? datasets : [].slice.call(arguments, 1);
        o = o || {};
        www = WWW(o.classNames);
        return this.each(attach);

        function attach() {
          var $input, $wrapper, $hint, $menu, defaultHint, defaultMenu, eventBus, input, menu, typeahead, MenuConstructor;
          _.each(datasets, function(d) {
            d.highlight = !!o.highlight;
          });
          $input = $(this);
          $wrapper = $(www.html.wrapper);
          $hint = $elOrNull(o.hint);
          $menu = $elOrNull(o.menu);
          defaultHint = o.hint !== false && !$hint;
          defaultMenu = o.menu !== false && !$menu;
          defaultHint && ($hint = buildHintFromInput($input, www));
          defaultMenu && ($menu = $(www.html.menu).css(www.css.menu));
          $hint && $hint.val("");
          $input = prepInput($input, www);
          if (defaultHint || defaultMenu) {
            $wrapper.css(www.css.wrapper);
            $input.css(defaultHint ? www.css.input : www.css.inputWithNoHint);
            $input.wrap($wrapper).parent().prepend(defaultHint ? $hint : null).append(defaultMenu ? $menu : null);
          }
          MenuConstructor = defaultMenu ? DefaultMenu : Menu;
          eventBus = new EventBus({
            el: $input
          });
          input = new Input({
            hint: $hint,
            input: $input
          }, www);
          menu = new MenuConstructor({
            node: $menu,
            datasets: datasets
          }, www);
          typeahead = new Typeahead({
            input: input,
            menu: menu,
            eventBus: eventBus,
            minLength: o.minLength
          }, www);
          $input.data(keys.www, www);
          $input.data(keys.typeahead, typeahead);
        }
      },
      isEnabled: function isEnabled() {
        var enabled;
        ttEach(this.first(), function(t) {
          enabled = t.isEnabled();
        });
        return enabled;
      },
      enable: function enable() {
        ttEach(this, function(t) {
          t.enable();
        });
        return this;
      },
      disable: function disable() {
        ttEach(this, function(t) {
          t.disable();
        });
        return this;
      },
      isActive: function isActive() {
        var active;
        ttEach(this.first(), function(t) {
          active = t.isActive();
        });
        return active;
      },
      activate: function activate() {
        ttEach(this, function(t) {
          t.activate();
        });
        return this;
      },
      deactivate: function deactivate() {
        ttEach(this, function(t) {
          t.deactivate();
        });
        return this;
      },
      isOpen: function isOpen() {
        var open;
        ttEach(this.first(), function(t) {
          open = t.isOpen();
        });
        return open;
      },
      open: function open() {
        ttEach(this, function(t) {
          t.open();
        });
        return this;
      },
      close: function close() {
        ttEach(this, function(t) {
          t.close();
        });
        return this;
      },
      select: function select(el) {
        var success = false,
          $el = $(el);
        ttEach(this.first(), function(t) {
          success = t.select($el);
        });
        return success;
      },
      autocomplete: function autocomplete(el) {
        var success = false,
          $el = $(el);
        ttEach(this.first(), function(t) {
          success = t.autocomplete($el);
        });
        return success;
      },
      moveCursor: function moveCursoe(delta) {
        var success = false;
        ttEach(this.first(), function(t) {
          success = t.moveCursor(delta);
        });
        return success;
      },
      val: function val(newVal) {
        var query;
        if (!arguments.length) {
          ttEach(this.first(), function(t) {
            query = t.getVal();
          });
          return query;
        } else {
          ttEach(this, function(t) {
            t.setVal(newVal);
          });
          return this;
        }
      },
      destroy: function destroy() {
        ttEach(this, function(typeahead, $input) {
          revert($input);
          typeahead.destroy();
        });
        return this;
      }
    };
    $.fn.typeahead = function(method) {
      if (methods[method]) {
        return methods[method].apply(this, [].slice.call(arguments, 1));
      } else {
        return methods.initialize.apply(this, arguments);
      }
    };
    $.fn.typeahead.noConflict = function noConflict() {
      $.fn.typeahead = old;
      return this;
    };

    function ttEach($els, fn) {
      $els.each(function() {
        var $input = $(this),
          typeahead;
        (typeahead = $input.data(keys.typeahead)) && fn(typeahead, $input);
      });
    }

    function buildHintFromInput($input, www) {
      return $input.clone().addClass(www.classes.hint).removeData().css(www.css.hint).css(getBackgroundStyles($input)).prop("readonly", true).removeAttr("id name placeholder required").attr({
        autocomplete: "off",
        spellcheck: "false",
        tabindex: -1
      });
    }

    function prepInput($input, www) {
      $input.data(keys.attrs, {
        dir: $input.attr("dir"),
        autocomplete: $input.attr("autocomplete"),
        spellcheck: $input.attr("spellcheck"),
        style: $input.attr("style")
      });
      $input.addClass(www.classes.input).attr({
        autocomplete: "off",
        spellcheck: false
      });
      try {
        !$input.attr("dir") && $input.attr("dir", "auto");
      } catch (e) {}
      return $input;
    }

    function getBackgroundStyles($el) {
      return {
        backgroundAttachment: $el.css("background-attachment"),
        backgroundClip: $el.css("background-clip"),
        backgroundColor: $el.css("background-color"),
        backgroundImage: $el.css("background-image"),
        backgroundOrigin: $el.css("background-origin"),
        backgroundPosition: $el.css("background-position"),
        backgroundRepeat: $el.css("background-repeat"),
        backgroundSize: $el.css("background-size")
      };
    }

    function revert($input) {
      var www, $wrapper;
      www = $input.data(keys.www);
      $wrapper = $input.parent().filter(www.selectors.wrapper);
      _.each($input.data(keys.attrs), function(val, key) {
        _.isUndefined(val) ? $input.removeAttr(key) : $input.attr(key, val);
      });
      $input.removeData(keys.typeahead).removeData(keys.www).removeData(keys.attr).removeClass(www.classes.input);
      if ($wrapper.length) {
        $input.detach().insertAfter($wrapper);
        $wrapper.remove();
      }
    }

    function $elOrNull(obj) {
      var isValid, $el;
      isValid = _.isJQuery(obj) || _.isElement(obj);
      $el = isValid ? $(obj).first() : [];
      return $el.length ? $el : null;
    }
  })();
});;
/*! RESOURCE: /scripts/sn.angularstrap/js_includes_angular_strap_aside.js */
/*! RESOURCE: /scripts/thirdparty/angular.strap.2.2.2/modules/dimensions.js */
angular.module('mgcrea.ngStrap.helpers.dimensions', []).factory('dimensions', ['$document', '$window', function($document, $window) {
  var jqLite = angular.element;
  var fn = {};
  var nodeName = fn.nodeName = function(element, name) {
    return element.nodeName && element.nodeName.toLowerCase() === name.toLowerCase();
  };
  fn.css = function(element, prop, extra) {
    var value;
    if (element.currentStyle) {
      value = element.currentStyle[prop];
    } else if (window.getComputedStyle) {
      value = window.getComputedStyle(element)[prop];
    } else {
      value = element.style[prop];
    }
    return extra === true ? parseFloat(value) || 0 : value;
  };
  fn.offset = function(element) {
    var boxRect = element.getBoundingClientRect();
    var docElement = element.ownerDocument;
    return {
      width: boxRect.width || element.offsetWidth,
      height: boxRect.height || element.offsetHeight,
      top: boxRect.top + (window.pageYOffset || docElement.documentElement.scrollTop) - (docElement.documentElement.clientTop || 0),
      left: boxRect.left + (window.pageXOffset || docElement.documentElement.scrollLeft) - (docElement.documentElement.clientLeft || 0)
    };
  };
  fn.setOffset = function(element, options, i) {
    var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition, position = fn.css(element, 'position'),
      curElem = angular.element(element),
      props = {};
    if (position === 'static') {
      element.style.position = 'relative';
    }
    curOffset = fn.offset(element);
    curCSSTop = fn.css(element, 'top');
    curCSSLeft = fn.css(element, 'left');
    calculatePosition = (position === 'absolute' || position === 'fixed') && (curCSSTop + curCSSLeft).indexOf('auto') > -1;
    if (calculatePosition) {
      curPosition = fn.position(element);
      curTop = curPosition.top;
      curLeft = curPosition.left;
    } else {
      curTop = parseFloat(curCSSTop) || 0;
      curLeft = parseFloat(curCSSLeft) || 0;
    }
    if (angular.isFunction(options)) {
      options = options.call(element, i, curOffset);
    }
    if (options.top !== null) {
      props.top = options.top - curOffset.top + curTop;
    }
    if (options.left !== null) {
      props.left = options.left - curOffset.left + curLeft;
    }
    if ('using' in options) {
      options.using.call(curElem, props);
    } else {
      curElem.css({
        top: props.top + 'px',
        left: props.left + 'px'
      });
    }
  };
  fn.position = function(element) {
    var offsetParentRect = {
        top: 0,
        left: 0
      },
      offsetParentElement, offset;
    if (fn.css(element, 'position') === 'fixed') {
      offset = element.getBoundingClientRect();
    } else {
      offsetParentElement = offsetParent(element);
      offset = fn.offset(element);
      if (!nodeName(offsetParentElement, 'html')) {
        offsetParentRect = fn.offset(offsetParentElement);
      }
      offsetParentRect.top += fn.css(offsetParentElement, 'borderTopWidth', true);
      offsetParentRect.left += fn.css(offsetParentElement, 'borderLeftWidth', true);
    }
    return {
      width: element.offsetWidth,
      height: element.offsetHeight,
      top: offset.top - offsetParentRect.top - fn.css(element, 'marginTop', true),
      left: offset.left - offsetParentRect.left - fn.css(element, 'marginLeft', true)
    };
  };
  var offsetParent = function offsetParentElement(element) {
    var docElement = element.ownerDocument;
    var offsetParent = element.offsetParent || docElement;
    if (nodeName(offsetParent, '#document')) return docElement.documentElement;
    while (offsetParent && !nodeName(offsetParent, 'html') && fn.css(offsetParent, 'position') === 'static') {
      offsetParent = offsetParent.offsetParent;
    }
    return offsetParent || docElement.documentElement;
  };
  fn.height = function(element, outer) {
    var value = element.offsetHeight;
    if (outer) {
      value += fn.css(element, 'marginTop', true) + fn.css(element, 'marginBottom', true);
    } else {
      value -= fn.css(element, 'paddingTop', true) + fn.css(element, 'paddingBottom', true) + fn.css(element, 'borderTopWidth', true) + fn.css(element, 'borderBottomWidth', true);
    }
    return value;
  };
  fn.width = function(element, outer) {
    var value = element.offsetWidth;
    if (outer) {
      value += fn.css(element, 'marginLeft', true) + fn.css(element, 'marginRight', true);
    } else {
      value -= fn.css(element, 'paddingLeft', true) + fn.css(element, 'paddingRight', true) + fn.css(element, 'borderLeftWidth', true) + fn.css(element, 'borderRightWidth', true);
    }
    return value;
  };
  return fn;
}]);;
/*! RESOURCE: /scripts/thirdparty/angular.strap.2.2.2/modules/modal.js */
angular.module('mgcrea.ngStrap.modal', ['mgcrea.ngStrap.helpers.dimensions']).provider('$modal', function() {
  var defaults = this.defaults = {
    animation: 'am-fade',
    backdropAnimation: 'am-fade',
    prefixClass: 'modal',
    prefixEvent: 'modal',
    placement: 'top',
    template: 'modal/modal.tpl.html',
    contentTemplate: false,
    container: false,
    element: null,
    backdrop: true,
    keyboard: true,
    html: false,
    show: true
  };
  this.$get = ['$window', '$rootScope', '$compile', '$q', '$templateCache', '$http', '$animate', '$timeout', '$sce', 'dimensions', function($window, $rootScope, $compile, $q, $templateCache, $http, $animate, $timeout, $sce, dimensions) {
    var forEach = angular.forEach;
    var trim = String.prototype.trim;
    var requestAnimationFrame = $window.requestAnimationFrame || $window.setTimeout;
    var bodyElement = angular.element($window.document.body);
    var htmlReplaceRegExp = /ng-bind="/gi;

    function ModalFactory(config) {
      var $modal = {};
      var options = $modal.$options = angular.extend({}, defaults, config);
      $modal.$promise = fetchTemplate(options.template);
      var scope = $modal.$scope = options.scope && options.scope.$new() || $rootScope.$new();
      if (!options.element && !options.container) {
        options.container = 'body';
      }
      $modal.$id = options.id || options.element && options.element.attr('id') || '';
      forEach(['title', 'content'], function(key) {
        if (options[key]) scope[key] = $sce.trustAsHtml(options[key]);
      });
      scope.$hide = function() {
        scope.$$postDigest(function() {
          $modal.hide();
        });
      };
      scope.$show = function() {
        scope.$$postDigest(function() {
          $modal.show();
        });
      };
      scope.$toggle = function() {
        scope.$$postDigest(function() {
          $modal.toggle();
        });
      };
      $modal.$isShown = scope.$isShown = false;
      if (options.contentTemplate) {
        $modal.$promise = $modal.$promise.then(function(template) {
          var templateEl = angular.element(template);
          return fetchTemplate(options.contentTemplate).then(function(contentTemplate) {
            var contentEl = findElement('[ng-bind="content"]', templateEl[0]).removeAttr('ng-bind').html(contentTemplate);
            if (!config.template) contentEl.next().remove();
            return templateEl[0].outerHTML;
          });
        });
      }
      var modalLinker, modalElement;
      var backdropElement = angular.element('<div class="' + options.prefixClass + '-backdrop"/>');
      backdropElement.css({
        position: 'fixed',
        top: '0px',
        left: '0px',
        bottom: '0px',
        right: '0px',
        'z-index': 1038
      });
      $modal.$promise.then(function(template) {
        if (angular.isObject(template)) template = template.data;
        if (options.html) template = template.replace(htmlReplaceRegExp, 'ng-bind-html="');
        template = trim.apply(template);
        modalLinker = $compile(template);
        $modal.init();
      });
      $modal.init = function() {
        if (options.show) {
          scope.$$postDigest(function() {
            $modal.show();
          });
        }
      };
      $modal.destroy = function() {
        if (modalElement) {
          modalElement.remove();
          modalElement = null;
        }
        if (backdropElement) {
          backdropElement.remove();
          backdropElement = null;
        }
        scope.$destroy();
      };
      $modal.show = function() {
        if ($modal.$isShown) return;
        var parent, after;
        if (angular.isElement(options.container)) {
          parent = options.container;
          after = options.container[0].lastChild ? angular.element(options.container[0].lastChild) : null;
        } else {
          if (options.container) {
            parent = findElement(options.container);
            after = parent[0] && parent[0].lastChild ? angular.element(parent[0].lastChild) : null;
          } else {
            parent = null;
            after = options.element;
          }
        }
        modalElement = $modal.$element = modalLinker(scope, function(clonedElement, scope) {});
        if (scope.$emit(options.prefixEvent + '.show.before', $modal).defaultPrevented) {
          return;
        }
        modalElement.css({
          display: 'block'
        }).addClass(options.placement);
        if (options.animation) {
          if (options.backdrop) {
            backdropElement.addClass(options.backdropAnimation);
          }
          modalElement.addClass(options.animation);
        }
        if (options.backdrop) {
          $animate.enter(backdropElement, bodyElement, null);
        }
        var promise = $animate.enter(modalElement, parent, after, enterAnimateCallback);
        if (promise && promise.then) promise.then(enterAnimateCallback);
        $modal.$isShown = scope.$isShown = true;
        safeDigest(scope);
        var el = modalElement[0];
        requestAnimationFrame(function() {
          el.focus();
        });
        bodyElement.addClass(options.prefixClass + '-open');
        if (options.animation) {
          bodyElement.addClass(options.prefixClass + '-with-' + options.animation);
        }
        if (options.backdrop) {
          modalElement.on('click', hideOnBackdropClick);
          backdropElement.on('click', hideOnBackdropClick);
          backdropElement.on('wheel', preventEventDefault);
        }
        if (options.keyboard) {
          modalElement.on('keyup', $modal.$onKeyUp);
        }
      };

      function enterAnimateCallback() {
        scope.$emit(options.prefixEvent + '.show', $modal);
      }
      $modal.hide = function() {
        if (!$modal.$isShown) return;
        if (scope.$emit(options.prefixEvent + '.hide.before', $modal).defaultPrevented) {
          return;
        }
        var promise = $animate.leave(modalElement, leaveAnimateCallback);
        if (promise && promise.then) promise.then(leaveAnimateCallback);
        if (options.backdrop) {
          $animate.leave(backdropElement);
        }
        $modal.$isShown = scope.$isShown = false;
        safeDigest(scope);
        if (options.backdrop) {
          modalElement.off('click', hideOnBackdropClick);
          backdropElement.off('click', hideOnBackdropClick);
          backdropElement.off('wheel', preventEventDefault);
        }
        if (options.keyboard) {
          modalElement.off('keyup', $modal.$onKeyUp);
        }
      };

      function leaveAnimateCallback() {
        scope.$emit(options.prefixEvent + '.hide', $modal);
        bodyElement.removeClass(options.prefixClass + '-open');
        if (options.animation) {
          bodyElement.removeClass(options.prefixClass + '-with-' + options.animation);
        }
      }
      $modal.toggle = function() {
        $modal.$isShown ? $modal.hide() : $modal.show();
      };
      $modal.focus = function() {
        modalElement[0].focus();
      };
      $modal.$onKeyUp = function(evt) {
        if (evt.which === 27 && $modal.$isShown) {
          $modal.hide();
          evt.stopPropagation();
        }
      };

      function hideOnBackdropClick(evt) {
        if (evt.target !== evt.currentTarget) return;
        options.backdrop === 'static' ? $modal.focus() : $modal.hide();
      }

      function preventEventDefault(evt) {
        evt.preventDefault();
      }
      return $modal;
    }

    function safeDigest(scope) {
      scope.$$phase || scope.$root && scope.$root.$$phase || scope.$digest();
    }

    function findElement(query, element) {
      return angular.element((element || document).querySelectorAll(query));
    }
    var fetchPromises = {};

    function fetchTemplate(template) {
      if (fetchPromises[template]) return fetchPromises[template];
      return fetchPromises[template] = $http.get(template, {
        cache: $templateCache
      }).then(function(res) {
        return res.data;
      });
    }
    return ModalFactory;
  }];
}).directive('bsModal', ['$window', '$sce', '$modal', function($window, $sce, $modal) {
  return {
    restrict: 'EAC',
    scope: true,
    link: function postLink(scope, element, attr, transclusion) {
      var options = {
        scope: scope,
        element: element,
        show: false
      };
      angular.forEach(['template', 'contentTemplate', 'placement', 'backdrop', 'keyboard', 'html', 'container', 'animation', 'id', 'prefixEvent', 'prefixClass'], function(key) {
        if (angular.isDefined(attr[key])) options[key] = attr[key];
      });
      var falseValueRegExp = /^(false|0|)$/i;
      angular.forEach(['backdrop', 'keyboard', 'html', 'container'], function(key) {
        if (angular.isDefined(attr[key]) && falseValueRegExp.test(attr[key])) options[key] = false;
      });
      angular.forEach(['title', 'content'], function(key) {
        attr[key] && attr.$observe(key, function(newValue, oldValue) {
          scope[key] = $sce.trustAsHtml(newValue);
        });
      });
      attr.bsModal && scope.$watch(attr.bsModal, function(newValue, oldValue) {
        if (angular.isObject(newValue)) {
          angular.extend(scope, newValue);
        } else {
          scope.content = newValue;
        }
      }, true);
      var modal = $modal(options);
      element.on(attr.trigger || 'click', modal.toggle);
      scope.$on('$destroy', function() {
        if (modal) modal.destroy();
        options = null;
        modal = null;
      });
    }
  };
}]);;
/*! RESOURCE: /scripts/thirdparty/angular.strap.2.2.2/modules/aside.js */
angular.module('mgcrea.ngStrap.aside', ['mgcrea.ngStrap.modal']).provider('$aside', function() {
  var defaults = this.defaults = {
    animation: 'am-fade-and-slide-right',
    prefixClass: 'aside',
    prefixEvent: 'aside',
    placement: 'right',
    template: 'aside/aside.tpl.html',
    contentTemplate: false,
    container: false,
    element: null,
    backdrop: true,
    keyboard: true,
    html: false,
    show: true
  };
  this.$get = ['$modal', function($modal) {
    function AsideFactory(config) {
      var $aside = {};
      var options = angular.extend({}, defaults, config);
      $aside = $modal(options);
      return $aside;
    }
    return AsideFactory;
  }];
}).directive('bsAside', ['$window', '$sce', '$aside', function($window, $sce, $aside) {
  var requestAnimationFrame = $window.requestAnimationFrame || $window.setTimeout;
  return {
    restrict: 'EAC',
    scope: true,
    link: function postLink(scope, element, attr, transclusion) {
      var options = {
        scope: scope,
        element: element,
        show: false
      };
      angular.forEach(['template', 'contentTemplate', 'placement', 'backdrop', 'keyboard', 'html', 'container', 'animation'], function(key) {
        if (angular.isDefined(attr[key])) options[key] = attr[key];
      });
      var falseValueRegExp = /^(false|0|)$/i;
      angular.forEach(['backdrop', 'keyboard', 'html', 'container'], function(key) {
        if (angular.isDefined(attr[key]) && falseValueRegExp.test(attr[key])) options[key] = false;
      });
      angular.forEach(['title', 'content'], function(key) {
        attr[key] && attr.$observe(key, function(newValue, oldValue) {
          scope[key] = $sce.trustAsHtml(newValue);
        });
      });
      attr.bsAside && scope.$watch(attr.bsAside, function(newValue, oldValue) {
        if (angular.isObject(newValue)) {
          angular.extend(scope, newValue);
        } else {
          scope.content = newValue;
        }
      }, true);
      var aside = $aside(options);
      element.on(attr.trigger || 'click', aside.toggle);
      scope.$on('$destroy', function() {
        if (aside) aside.destroy();
        options = null;
        aside = null;
      });
    }
  };
}]);;;
/*! RESOURCE: /scripts/sn.angularstrap/js_includes_angular_strap_components.js */
/*! RESOURCE: /scripts/sn.angularstrap/_module.js */
angular.module('sn.angularstrap', [
  'mgcrea.ngStrap.aside'
]);;
/*! RESOURCE: /scripts/sn.angularstrap/directive.snAside.js */
angular.module('sn.angularstrap').directive('snAside', function(getTemplateUrl, $aside, $animate, $timeout) {
  'use strict';
  return {
    replace: true,
    restrict: 'E',
    template: '<div />',
    scope: {
      name: '@',
      role: '@'
    },
    link: function(scope, element, attrs) {
      var broadcastPrefix = 'sn.aside' + (attrs.name ? '.' + attrs.name : '');
      scope.options = {
        title: '',
        content: '',
        placement: 'right',
        backdrop: false,
        keyboard: false,
        element: element,
        scope: scope,
        show: false,
        template: getTemplateUrl('sn_aside.xml')
      };
      scope.aside = $aside(scope.options);
      scope.$on(broadcastPrefix + '.open', _openAside);
      scope.$on(broadcastPrefix + '.deferred.open', function(e, view, widthOverride) {
        scope.aside.$promise.then(function() {
          _openAside(e, view, widthOverride);
        });
      });
      scope.role = scope.role || 'dialog';

      function _openAside(e, view, widthOverride) {
        if (!scope.$isShown) {
          scope.aside.show();
          scope.$isShown = true;
          scope.aside.$element.addClass('sn-aside_open');
          scope.aside.$element.addClass('sn-aside-hide');
          $timeout(function() {
            scope.aside.$element.removeClass('sn-aside-hide');
          }, 0, false);
        }
        applyManualWidth(widthOverride);
        if (view)
          scope.$broadcast(broadcastPrefix + '.load', view);
      }
      scope.$on(broadcastPrefix + '.resize', function(e, width) {
        applyManualWidth(width);
      });
      scope.$on(broadcastPrefix + '.close', function(e, killAnimation) {
        if (!scope.$isShown)
          return;
        scope.$isShown = false;
        var element = scope.aside.$element;
        if (killAnimation === true) {
          element.addClass('disableAnimations');
          scope.$broadcast(broadcastPrefix + '.unload');
        } else {
          $animate.addClass(element, 'sn-aside-hide', function() {
            scope.$broadcast(broadcastPrefix + '.unload');
          });
        }
        element.removeClass('disableAnimations');
      });
      scope.$on('aside.hide.before', function() {
        scope.aside.$element.removeClass('sn-aside_open');
      });
      scope.$on('aside.hide', function() {
        scope.$isShown = false;
        scope.aside.$element.addClass('sn-aside-hide');
      });

      function applyManualWidth(width) {
        if (angular.isString(width))
          return scope.aside.$element.css('width', width).find('.aside-dialog').css('min-width', width);
        if (angular.isNumber) {
          var newWidth = Math.max(320, width);
          return scope.aside.$element.innerWidth(newWidth).find('.aside-dialog').css('min-width', newWidth);
        }
      }
    }
  };
});;
/*! RESOURCE: /scripts/sn.angularstrap/directive.snAsideContent.js */
angular.module('sn.angularstrap').directive('snAsideContent', function(getTemplateUrl, $compile, $templateCache, $timeout, $window) {
  'use strict';
  return {
    replace: true,
    restrict: 'E',
    template: '<div class="aside-content" />',
    link: function(scope, element, attrs) {
      var broadcastPrefix = 'sn.aside' + (attrs.name ? '.' + attrs.name : '');
      scope.history = [];
      var findPrefix = '#snAsideContent_',
        viewPrefix = findPrefix.slice(1),
        cachedViews = {},
        cachedViewScopes = {},
        cachedViewKeys = [],
        asideContainer = element.parent().parent();
      var asideTransitionDuration = parseFloat(asideContainer.css('transition-duration'), 10) * 1000 || 500;

      function stringFunction(stringOrFunction) {
        if (angular.isFunction(stringOrFunction))
          return stringOrFunction();
        return stringOrFunction;
      }
      scope.loadView = function(view) {
        var container;
        if (!view)
          return;
        if (view.cacheKey && cachedViewKeys.indexOf(stringFunction(view.cacheKey)) >= 0) {
          if (!view.isChild)
            unloadView(true);
          var escapedKey = stringFunction(view.cacheKey).replace(/\./g, '\\.');
          container = element.find(findPrefix + escapedKey);
          container.show().siblings().hide();
          focusOnFirstChild(container);
          return;
        }
        var subScope = scope.$new();
        var historyObj = {
          view: view,
          cacheKey: stringFunction(view.cacheKey),
          subScope: subScope
        };
        if (view.scope) {
          if (view.scope.constructor === scope.constructor) {
            subScope.$destroy();
            delete historyObj.subScope;
            subScope = view.scope.$new();
            historyObj.subScope = subScope;
          } else {
            for (var prop in view.scope) {
              if (view.scope.hasOwnProperty(prop) && !subScope.hasOwnProperty(prop))
                subScope[prop] = view.scope[prop];
            }
          }
        }
        var template = view.templateUrl ? $templateCache.get(view.templateUrl) : stringFunction(view.template);
        var compiledTemplate = $compile(template)(subScope);
        if (!view.isChild)
          unloadView(true);
        scope.history.push(historyObj);
        if (view.cacheKey)
          cachedViewKeys.push(stringFunction(view.cacheKey));
        var containerID = viewPrefix;
        containerID += view.cacheKey ? stringFunction(view.cacheKey) : scope.history.length;
        element.append('<div id="' + containerID + '" />');
        containerID = containerID.replace(/\./g, '\\.');
        container = element.find('#' + containerID);
        container.html(compiledTemplate).siblings().hide();
        if (asideContainer.hasClass("sn-aside-hide")) {
          $timeout(function() {
            focusOnFirstChild(container);
          }, asideTransitionDuration, false);
        } else {
          focusOnFirstChild(container);
        }
      };
      scope.$on(broadcastPrefix + '.historyBack', function() {
        scope.historyBack();
      });
      scope.historyBack = function(evt) {
        if (scope.history.length <= 1 || (evt && evt.keyCode === 9))
          return;
        unloadView();
        var previousView = scope.history[scope.history.length - 1];
        var previousElement;
        if (previousView.cacheKey)
          previousElement = element.find(findPrefix + previousView.cacheKey);
        else
          previousElement = element.find(findPrefix + scope.history.length);
        if (previousElement.length > 0) {
          previousElement.show();
          if (findPrefix.indexOf('snAsideContent') > -1) {
            var previousCloseButton = previousElement.find('.icon-cross');
            if (previousCloseButton.length > 0)
              previousCloseButton.focus();
          }
        }
        scope.$emit(broadcastPrefix + '.historyBack.completed', previousView.view);
      };

      function unloadView(unloadAll) {
        if (!scope.history.length)
          return;
        var numViews = scope.history.length,
          historyView = scope.history.pop(),
          escapedKey = '',
          contentDiv;
        if (historyView.cacheKey) {
          escapedKey = historyView.cacheKey.replace(/\./g, "\\.");
          contentDiv = element.find(findPrefix + escapedKey);
          contentDiv.hide();
          cachedViews[historyView.cacheKey] = historyView.view;
          if (historyView.subScope)
            cachedViewScopes[historyView.cacheKey] = historyView.subScope;
        } else {
          contentDiv = element.find(findPrefix + numViews);
          contentDiv.remove();
          if (historyView.subScope)
            historyView.subScope.$destroy();
        }
        if (unloadAll)
          unloadView(unloadAll);
      }

      function clearCache(key) {
        var keys = cachedViewKeys.slice();
        for (var i = 0, len = keys.length; i < len; i++) {
          if (keys[i].indexOf(key) !== 0)
            continue;
          if (cachedViews[keys[i]])
            delete cachedViews[keys[i]];
          if (cachedViewScopes[keys[i]]) {
            cachedViewScopes[keys[i]].$destroy();
            delete cachedViewScopes[keys[i]];
          }
          var escapedKey = keys[i].replace(/\./g, '\\.');
          element.find(findPrefix + escapedKey).remove();
          cachedViewKeys.splice(cachedViewKeys.indexOf(keys[i]), 1);
        }
      }

      function focusOnFirstChild(container) {
        if (!$window.tabbable)
          return;
        $timeout(function() {
          var firstFocusable = $window.tabbable(container[0])[0];
          if (firstFocusable)
            firstFocusable.focus();
        }, 0, false);
      }
      scope.close = function(evt) {
        if (evt.keyCode === 9)
          return;
        scope.$emit(broadcastPrefix + '.close');
      };
      scope.$on(broadcastPrefix + '.unload', function() {
        unloadView(true);
      });
      scope.$on(broadcastPrefix + '.load', function(e, view) {
        if (!view)
          return;
        if (scope.history.length) {
          var currentView = scope.history[scope.history.length - 1];
          if (angular.equals(currentView.view, view) && currentView.key === stringFunction(view.cacheKey))
            return;
        }
        scope.loadView(view);
      });
      scope.$on(broadcastPrefix + '.clearCache', function(e, cacheKey) {
        clearCache(cacheKey);
      })
    }
  }
});;;
/*! RESOURCE: /scripts/sn/common/accessibility/js_includes_common_accessibility.js */
/*! RESOURCE: /scripts/sn/common/accessibility/_module.js */
angular.module('sn.common.accessibility', []);;
/*! RESOURCE: /scripts/sn/common/accessibility/service.screenReaderStatus.js */
angular.module('sn.common.accessibility').service('screenReaderStatus', function($document) {
  function getAnnouncer() {
    var el = $document[0].getElementById('ngStatus');
    if (el)
      return el;
    el = $document[0].createElement('span')
    el.id = 'ngStatus';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.classList.add('sr-only');
    $document[0].body.appendChild(el);
  }

  function cleanOldMessages(el) {
    var nodes = el.childNodes;
    for (var i = 0; i < nodes.length; i++) {
      el.removeChild(nodes[i]);
    }
  }

  function announce(text) {
    var statusEl = getAnnouncer();
    cleanOldMessages(statusEl);
    var textNode = $document[0].createTextNode(text);
    statusEl.appendChild(textNode);
    statusEl.style.display = 'none';
    statusEl.style.display = 'inline';
  }
  getAnnouncer();
  return {
    announce: announce
  }
});;;
/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/js_includes_attachments.js */
/*! RESOURCE: /scripts/angularjs-1.4/thirdparty/angular-file-upload/angular-file-upload-all.js */
(function() {
  function patchXHR(fnName, newFn) {
    window.XMLHttpRequest.prototype[fnName] = newFn(window.XMLHttpRequest.prototype[fnName]);
  }
  if (window.XMLHttpRequest && !window.XMLHttpRequest.__isFileAPIShim) {
    patchXHR('setRequestHeader', function(orig) {
      return function(header, value) {
        if (header === '__setXHR_') {
          var val = value(this);
          if (val instanceof Function) {
            val(this);
          }
        } else {
          orig.apply(this, arguments);
        }
      }
    });
  }
  var angularFileUpload = angular.module('angularFileUpload', []);
  angularFileUpload.version = '3.1.2';
  angularFileUpload.service('$upload', ['$http', '$q', '$timeout', function($http, $q, $timeout) {
    function sendHttp(config) {
      config.method = config.method || 'POST';
      config.headers = config.headers || {};
      config.transformRequest = config.transformRequest || function(data, headersGetter) {
        if (window.ArrayBuffer && data instanceof window.ArrayBuffer) {
          return data;
        }
        return $http.defaults.transformRequest[0](data, headersGetter);
      };
      var deferred = $q.defer();
      var promise = deferred.promise;
      config.headers['__setXHR_'] = function() {
        return function(xhr) {
          if (!xhr) return;
          config.__XHR = xhr;
          config.xhrFn && config.xhrFn(xhr);
          xhr.upload.addEventListener('progress', function(e) {
            e.config = config;
            deferred.notify ? deferred.notify(e) : promise.progress_fn && $timeout(function() {
              promise.progress_fn(e)
            });
          }, false);
          xhr.upload.addEventListener('load', function(e) {
            if (e.lengthComputable) {
              e.config = config;
              deferred.notify ? deferred.notify(e) : promise.progress_fn && $timeout(function() {
                promise.progress_fn(e)
              });
            }
          }, false);
        };
      };
      $http(config).then(function(r) {
        deferred.resolve(r)
      }, function(e) {
        deferred.reject(e)
      }, function(n) {
        deferred.notify(n)
      });
      promise.success = function(fn) {
        promise.then(function(response) {
          fn(response.data, response.status, response.headers, config);
        });
        return promise;
      };
      promise.error = function(fn) {
        promise.then(null, function(response) {
          fn(response.data, response.status, response.headers, config);
        });
        return promise;
      };
      promise.progress = function(fn) {
        promise.progress_fn = fn;
        promise.then(null, null, function(update) {
          fn(update);
        });
        return promise;
      };
      promise.abort = function() {
        if (config.__XHR) {
          $timeout(function() {
            config.__XHR.abort();
          });
        }
        return promise;
      };
      promise.xhr = function(fn) {
        config.xhrFn = (function(origXhrFn) {
          return function() {
            origXhrFn && origXhrFn.apply(promise, arguments);
            fn.apply(promise, arguments);
          }
        })(config.xhrFn);
        return promise;
      };
      return promise;
    }
    this.upload = function(config) {
      config.headers = config.headers || {};
      config.headers['Content-Type'] = undefined;
      var origTransformRequest = config.transformRequest;
      config.transformRequest = config.transformRequest ?
        (Object.prototype.toString.call(config.transformRequest) === '[object Array]' ?
          config.transformRequest : [config.transformRequest]) : [];
      config.transformRequest.push(function(data, headerGetter) {
        var formData = new FormData();
        var allFields = {};
        for (var key in config.fields) allFields[key] = config.fields[key];
        if (data) allFields['data'] = data;
        if (config.formDataAppender) {
          for (var key in allFields) {
            config.formDataAppender(formData, key, allFields[key]);
          }
        } else {
          for (var key in allFields) {
            var val = allFields[key];
            if (val !== undefined) {
              if (Object.prototype.toString.call(val) === '[object String]') {
                formData.append(key, val);
              } else {
                if (config.sendObjectsAsJsonBlob && typeof val === 'object') {
                  formData.append(key, new Blob([val], {
                    type: 'application/json'
                  }));
                } else {
                  formData.append(key, JSON.stringify(val));
                }
              }
            }
          }
        }
        if (config.file != null) {
          var fileFormName = config.fileFormDataName || 'file';
          if (Object.prototype.toString.call(config.file) === '[object Array]') {
            var isFileFormNameString = Object.prototype.toString.call(fileFormName) === '[object String]';
            for (var i = 0; i < config.file.length; i++) {
              formData.append(isFileFormNameString ? fileFormName : fileFormName[i], config.file[i],
                (config.fileName && config.fileName[i]) || config.file[i].name);
            }
          } else {
            formData.append(fileFormName, config.file, config.fileName || config.file.name);
          }
        }
        return formData;
      });
      return sendHttp(config);
    };
    this.http = function(config) {
      return sendHttp(config);
    };
  }]);
  angularFileUpload.directive('ngFileSelect', ['$parse', '$timeout', '$compile',
    function($parse, $timeout, $compile) {
      return {
        restrict: 'AEC',
        require: '?ngModel',
        link: function(scope, elem, attr, ngModel) {
          handleFileSelect(scope, elem, attr, ngModel, $parse, $timeout, $compile);
        }
      }
    }
  ]);

  function handleFileSelect(scope, elem, attr, ngModel, $parse, $timeout, $compile) {
    function isInputTypeFile() {
      return elem[0].tagName.toLowerCase() === 'input' && elem.attr('type') && elem.attr('type').toLowerCase() === 'file';
    }
    var watchers = [];

    function watchForRecompile(attrVal) {
      $timeout(function() {
        if (elem.parent().length) {
          watchers.push(scope.$watch(attrVal, function(val, oldVal) {
            if (val != oldVal) {
              recompileElem();
            }
          }));
        }
      });
    }

    function recompileElem() {
      var clone = elem.clone();
      if (elem.attr('__afu_gen__')) {
        angular.element(document.getElementById(elem.attr('id').substring(1))).remove();
      }
      if (elem.parent().length) {
        for (var i = 0; i < watchers.length; i++) {
          watchers[i]();
        }
        elem.replaceWith(clone);
        $compile(clone)(scope);
      }
      return clone;
    }

    function bindAttr(bindAttr, attrName) {
      if (bindAttr) {
        watchForRecompile(bindAttr);
        var val = $parse(bindAttr)(scope);
        if (val) {
          elem.attr(attrName, val);
          attr[attrName] = val;
        } else {
          elem.attr(attrName, null);
          delete attr[attrName];
        }
      }
    }
    bindAttr(attr.ngMultiple, 'multiple');
    bindAttr(attr.ngAccept, 'ng-accept');
    bindAttr(attr.ngCapture, 'capture');
    if (attr['ngFileSelect'] != '') {
      attr.ngFileChange = attr.ngFileSelect;
    }

    function onChangeFn(evt) {
      var files = [],
        fileList, i;
      fileList = evt.__files_ || (evt.target && evt.target.files);
      updateModel(fileList, attr, ngModel, scope, evt);
    };
    var fileElem = elem;
    if (!isInputTypeFile()) {
      fileElem = angular.element('<input type="file">')
      if (elem.attr('multiple')) fileElem.attr('multiple', elem.attr('multiple'));
      if (elem.attr('accept')) fileElem.attr('accept', elem.attr('accept'));
      if (elem.attr('capture')) fileElem.attr('capture', elem.attr('capture'));
      for (var key in attr) {
        if (key.indexOf('inputFile') == 0) {
          var name = key.substring('inputFile'.length);
          name = name[0].toLowerCase() + name.substring(1);
          fileElem.attr(name, attr[key]);
        }
      }
      fileElem.css('width', '0px').css('height', '0px').css('position', 'absolute').css('padding', 0).css('margin', 0)
        .css('overflow', 'hidden').attr('tabindex', '-1').css('opacity', 0).attr('__afu_gen__', true);
      elem.attr('__refElem__', true);
      fileElem[0].__refElem__ = elem[0];
      elem.parent()[0].insertBefore(fileElem[0], elem[0])
      elem.css('overflow', 'hidden');
      elem.bind('click', function(e) {
        if (!resetAndClick(e)) {
          fileElem[0].click();
        }
      });
    } else {
      elem.bind('click', resetAndClick);
    }

    function resetAndClick(evt) {
      if (fileElem[0].value != null && fileElem[0].value != '') {
        fileElem[0].value = null;
        if (navigator.userAgent.indexOf("Trident/7") === -1) {
          onChangeFn({
            target: {
              files: []
            }
          });
        }
      }
      if (!elem.attr('__afu_clone__')) {
        if (navigator.appVersion.indexOf("MSIE 10") !== -1 || navigator.userAgent.indexOf("Trident/7") !== -1) {
          var clone = recompileElem();
          clone.attr('__afu_clone__', true);
          clone[0].click();
          evt.preventDefault();
          evt.stopPropagation();
          return true;
        }
      } else {
        elem.attr('__afu_clone__', null);
      }
    }
    fileElem.bind('change', onChangeFn);
    elem.on('$destroy', function() {
      for (var i = 0; i < watchers.length; i++) {
        watchers[i]();
      }
      if (elem[0] != fileElem[0]) fileElem.remove();
    });
    watchers.push(scope.$watch(attr.ngModel, function(val, oldVal) {
      if (val != oldVal && (val == null || !val.length)) {
        if (navigator.appVersion.indexOf("MSIE 10") !== -1) {
          recompileElem();
        } else {
          fileElem[0].value = null;
        }
      }
    }));

    function updateModel(fileList, attr, ngModel, scope, evt) {
      var files = [],
        rejFiles = [];
      var accept = $parse(attr.ngAccept)(scope);
      var regexp = angular.isString(accept) && accept ? new RegExp(globStringToRegex(accept), 'gi') : null;
      var acceptFn = regexp ? null : attr.ngAccept;
      for (var i = 0; i < fileList.length; i++) {
        var file = fileList.item(i);
        if ((!regexp || file.type.match(regexp) || (file.name != null && file.name.match(regexp))) &&
          (!acceptFn || $parse(acceptFn)(scope, {
            $file: file,
            $event: evt
          }))) {
          files.push(file);
        } else {
          rejFiles.push(file);
        }
      }
      $timeout(function() {
        if (ngModel) {
          $parse(attr.ngModel).assign(scope, files);
          ngModel && ngModel.$setViewValue(files != null && files.length == 0 ? '' : files);
          if (attr.ngModelRejected) {
            $parse(attr.ngModelRejected).assign(scope, rejFiles);
          }
        }
        if (attr.ngFileChange && attr.ngFileChange != "") {
          $parse(attr.ngFileChange)(scope, {
            $files: files,
            $rejectedFiles: rejFiles,
            $event: evt
          });
        }
      });
    }
  }
  angularFileUpload.directive('ngFileDrop', ['$parse', '$timeout', '$location', function($parse, $timeout, $location) {
    return {
      restrict: 'AEC',
      require: '?ngModel',
      link: function(scope, elem, attr, ngModel) {
        handleDrop(scope, elem, attr, ngModel, $parse, $timeout, $location);
      }
    }
  }]);
  angularFileUpload.directive('ngNoFileDrop', function() {
    return function(scope, elem, attr) {
      if (dropAvailable()) elem.css('display', 'none')
    }
  });
  angularFileUpload.directive('ngFileDropAvailable', ['$parse', '$timeout', function($parse, $timeout) {
    return function(scope, elem, attr) {
      if (dropAvailable()) {
        var fn = $parse(attr['ngFileDropAvailable']);
        $timeout(function() {
          fn(scope);
        });
      }
    }
  }]);

  function handleDrop(scope, elem, attr, ngModel, $parse, $timeout, $location) {
    var available = dropAvailable();
    if (attr['dropAvailable']) {
      $timeout(function() {
        scope.dropAvailable ? scope.dropAvailable.value = available : scope.dropAvailable = available;
      });
    }
    if (!available) {
      if ($parse(attr.hideOnDropNotAvailable)(scope) != false) {
        elem.css('display', 'none');
      }
      return;
    }
    var leaveTimeout = null;
    var stopPropagation = $parse(attr.stopPropagation)(scope);
    var dragOverDelay = 1;
    var accept = $parse(attr.ngAccept)(scope) || attr.accept;
    var regexp = angular.isString(accept) && accept ? new RegExp(globStringToRegex(accept), 'gi') : null;
    var acceptFn = regexp ? null : attr.ngAccept;
    var actualDragOverClass;
    elem[0].addEventListener('dragover', function(evt) {
      evt.preventDefault();
      if (stopPropagation) evt.stopPropagation();
      if (navigator.userAgent.indexOf("Chrome") > -1) {
        var b = evt.dataTransfer.effectAllowed;
        evt.dataTransfer.dropEffect = ('move' === b || 'linkMove' === b) ? 'move' : 'copy';
      }
      $timeout.cancel(leaveTimeout);
      if (!scope.actualDragOverClass) {
        actualDragOverClass = calculateDragOverClass(scope, attr, evt);
      }
      elem.addClass(actualDragOverClass);
    }, false);
    elem[0].addEventListener('dragenter', function(evt) {
      evt.preventDefault();
      if (stopPropagation) evt.stopPropagation();
    }, false);
    elem[0].addEventListener('dragleave', function(evt) {
      leaveTimeout = $timeout(function() {
        elem.removeClass(actualDragOverClass);
        actualDragOverClass = null;
      }, dragOverDelay || 1);
    }, false);
    if (attr['ngFileDrop'] != '') {
      attr.ngFileChange = attr['ngFileDrop'];
    }
    elem[0].addEventListener('drop', function(evt) {
      evt.preventDefault();
      if (stopPropagation) evt.stopPropagation();
      elem.removeClass(actualDragOverClass);
      actualDragOverClass = null;
      extractFiles(evt, function(files, rejFiles) {
        $timeout(function() {
          if (ngModel) {
            $parse(attr.ngModel).assign(scope, files);
            ngModel && ngModel.$setViewValue(files != null && files.length == 0 ? '' : files);
          }
          if (attr['ngModelRejected']) {
            if (scope[attr.ngModelRejected]) {
              $parse(attr.ngModelRejected).assign(scope, rejFiles);
            }
          }
        });
        $timeout(function() {
          $parse(attr.ngFileChange)(scope, {
            $files: files,
            $rejectedFiles: rejFiles,
            $event: evt
          });
        });
      }, $parse(attr.allowDir)(scope) != false, attr.multiple || $parse(attr.ngMultiple)(scope));
    }, false);

    function calculateDragOverClass(scope, attr, evt) {
      var valid = true;
      if (regexp || acceptFn) {
        var items = evt.dataTransfer.items;
        if (items != null) {
          for (var i = 0; i < items.length && valid; i++) {
            valid = valid && (items[i].kind == 'file' || items[i].kind == '') &&
              ((acceptFn && $parse(acceptFn)(scope, {
                  $file: items[i],
                  $event: evt
                })) ||
                (regexp && (items[i].type != null && items[i].type.match(regexp)) ||
                  (items[i].name != null && items[i].name.match(regexp))));
          }
        }
      }
      var clazz = $parse(attr.dragOverClass)(scope, {
        $event: evt
      });
      if (clazz) {
        if (clazz.delay) dragOverDelay = clazz.delay;
        if (clazz.accept) clazz = valid ? clazz.accept : clazz.reject;
      }
      return clazz || attr['dragOverClass'] || 'dragover';
    }

    function extractFiles(evt, callback, allowDir, multiple) {
      var files = [],
        rejFiles = [],
        items = evt.dataTransfer.items,
        processing = 0;

      function addFile(file) {
        if ((!regexp || file.type.match(regexp) || (file.name != null && file.name.match(regexp))) &&
          (!acceptFn || $parse(acceptFn)(scope, {
            $file: file,
            $event: evt
          }))) {
          files.push(file);
        } else {
          rejFiles.push(file);
        }
      }
      if (items && items.length > 0 && $location.protocol() != 'file') {
        for (var i = 0; i < items.length; i++) {
          if (items[i].webkitGetAsEntry && items[i].webkitGetAsEntry() && items[i].webkitGetAsEntry().isDirectory) {
            var entry = items[i].webkitGetAsEntry();
            if (entry.isDirectory && !allowDir) {
              continue;
            }
            if (entry != null) {
              traverseFileTree(files, entry);
            }
          } else {
            var f = items[i].getAsFile();
            if (f != null) addFile(f);
          }
          if (!multiple && files.length > 0) break;
        }
      } else {
        var fileList = evt.dataTransfer.files;
        if (fileList != null) {
          for (var i = 0; i < fileList.length; i++) {
            addFile(fileList.item(i));
            if (!multiple && files.length > 0) break;
          }
        }
      }
      var delays = 0;
      (function waitForProcess(delay) {
        $timeout(function() {
          if (!processing) {
            if (!multiple && files.length > 1) {
              var i = 0;
              while (files[i].type == 'directory') i++;
              files = [files[i]];
            }
            callback(files, rejFiles);
          } else {
            if (delays++ * 10 < 20 * 1000) {
              waitForProcess(10);
            }
          }
        }, delay || 0)
      })();

      function traverseFileTree(files, entry, path) {
        if (entry != null) {
          if (entry.isDirectory) {
            var filePath = (path || '') + entry.name;
            addFile({
              name: entry.name,
              type: 'directory',
              path: filePath
            });
            var dirReader = entry.createReader();
            var entries = [];
            processing++;
            var readEntries = function() {
              dirReader.readEntries(function(results) {
                try {
                  if (!results.length) {
                    for (var i = 0; i < entries.length; i++) {
                      traverseFileTree(files, entries[i], (path ? path : '') + entry.name + '/');
                    }
                    processing--;
                  } else {
                    entries = entries.concat(Array.prototype.slice.call(results || [], 0));
                    readEntries();
                  }
                } catch (e) {
                  processing--;
                  console.error(e);
                }
              }, function() {
                processing--;
              });
            };
            readEntries();
          } else {
            processing++;
            entry.file(function(file) {
              try {
                processing--;
                file.path = (path ? path : '') + file.name;
                addFile(file);
              } catch (e) {
                processing--;
                console.error(e);
              }
            }, function(e) {
              processing--;
            });
          }
        }
      }
    }
  }

  function dropAvailable() {
    var div = document.createElement('div');
    return ('draggable' in div) && ('ondrop' in div);
  }

  function globStringToRegex(str) {
    if (str.length > 2 && str[0] === '/' && str[str.length - 1] === '/') {
      return str.substring(1, str.length - 1);
    }
    var split = str.split(','),
      result = '';
    if (split.length > 1) {
      for (var i = 0; i < split.length; i++) {
        result += '(' + globStringToRegex(split[i]) + ')';
        if (i < split.length - 1) {
          result += '|'
        }
      }
    } else {
      if (str.indexOf('.') == 0) {
        str = '*' + str;
      }
      result = '^' + str.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + '-]', 'g'), '\\$&') + '$';
      result = result.replace(/\\\*/g, '.*').replace(/\\\?/g, '.');
    }
    return result;
  }
  var ngFileUpload = angular.module('ngFileUpload', []);
  for (var key in angularFileUpload) {
    ngFileUpload[key] = angularFileUpload[key];
  }
})();
(function() {
  var hasFlash = function() {
    try {
      var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
      if (fo) return true;
    } catch (e) {
      if (navigator.mimeTypes['application/x-shockwave-flash'] != undefined) return true;
    }
    return false;
  }

  function patchXHR(fnName, newFn) {
    window.XMLHttpRequest.prototype[fnName] = newFn(window.XMLHttpRequest.prototype[fnName]);
  };
  if ((window.XMLHttpRequest && !window.FormData) || (window.FileAPI && FileAPI.forceLoad)) {
    var initializeUploadListener = function(xhr) {
      if (!xhr.__listeners) {
        if (!xhr.upload) xhr.upload = {};
        xhr.__listeners = [];
        var origAddEventListener = xhr.upload.addEventListener;
        xhr.upload.addEventListener = function(t, fn, b) {
          xhr.__listeners[t] = fn;
          origAddEventListener && origAddEventListener.apply(this, arguments);
        };
      }
    }
    patchXHR('open', function(orig) {
      return function(m, url, b) {
        initializeUploadListener(this);
        this.__url = url;
        try {
          orig.apply(this, [m, url, b]);
        } catch (e) {
          if (e.message.indexOf('Access is denied') > -1) {
            this.__origError = e;
            orig.apply(this, [m, '_fix_for_ie_crossdomain__', b]);
          }
        }
      }
    });
    patchXHR('getResponseHeader', function(orig) {
      return function(h) {
        return this.__fileApiXHR && this.__fileApiXHR.getResponseHeader ? this.__fileApiXHR.getResponseHeader(h) : (orig == null ? null : orig.apply(this, [h]));
      };
    });
    patchXHR('getAllResponseHeaders', function(orig) {
      return function() {
        return this.__fileApiXHR && this.__fileApiXHR.getAllResponseHeaders ? this.__fileApiXHR.getAllResponseHeaders() : (orig == null ? null : orig.apply(this));
      }
    });
    patchXHR('abort', function(orig) {
      return function() {
        return this.__fileApiXHR && this.__fileApiXHR.abort ? this.__fileApiXHR.abort() : (orig == null ? null : orig.apply(this));
      }
    });
    patchXHR('setRequestHeader', function(orig) {
      return function(header, value) {
        if (header === '__setXHR_') {
          initializeUploadListener(this);
          var val = value(this);
          if (val instanceof Function) {
            val(this);
          }
        } else {
          this.__requestHeaders = this.__requestHeaders || {};
          this.__requestHeaders[header] = value;
          orig.apply(this, arguments);
        }
      }
    });

    function redefineProp(xhr, prop, fn) {
      try {
        Object.defineProperty(xhr, prop, {
          get: fn
        });
      } catch (e) {}
    }
    patchXHR('send', function(orig) {
      return function() {
        var xhr = this;
        if (arguments[0] && arguments[0].__isFileAPIShim) {
          var formData = arguments[0];
          var config = {
            url: xhr.__url,
            jsonp: false,
            cache: true,
            complete: function(err, fileApiXHR) {
              xhr.__completed = true;
              if (!err && xhr.__listeners['load'])
                xhr.__listeners['load']({
                  type: 'load',
                  loaded: xhr.__loaded,
                  total: xhr.__total,
                  target: xhr,
                  lengthComputable: true
                });
              if (!err && xhr.__listeners['loadend'])
                xhr.__listeners['loadend']({
                  type: 'loadend',
                  loaded: xhr.__loaded,
                  total: xhr.__total,
                  target: xhr,
                  lengthComputable: true
                });
              if (err === 'abort' && xhr.__listeners['abort'])
                xhr.__listeners['abort']({
                  type: 'abort',
                  loaded: xhr.__loaded,
                  total: xhr.__total,
                  target: xhr,
                  lengthComputable: true
                });
              if (fileApiXHR.status !== undefined) redefineProp(xhr, 'status', function() {
                return (fileApiXHR.status == 0 && err && err !== 'abort') ? 500 : fileApiXHR.status
              });
              if (fileApiXHR.statusText !== undefined) redefineProp(xhr, 'statusText', function() {
                return fileApiXHR.statusText
              });
              redefineProp(xhr, 'readyState', function() {
                return 4
              });
              if (fileApiXHR.response !== undefined) redefineProp(xhr, 'response', function() {
                return fileApiXHR.response
              });
              var resp = fileApiXHR.responseText || (err && fileApiXHR.status == 0 && err !== 'abort' ? err : undefined);
              redefineProp(xhr, 'responseText', function() {
                return resp
              });
              redefineProp(xhr, 'response', function() {
                return resp
              });
              if (err) redefineProp(xhr, 'err', function() {
                return err
              });
              xhr.__fileApiXHR = fileApiXHR;
              if (xhr.onreadystatechange) xhr.onreadystatechange();
              if (xhr.onload) xhr.onload();
            },
            fileprogress: function(e) {
              e.target = xhr;
              xhr.__listeners['progress'] && xhr.__listeners['progress'](e);
              xhr.__total = e.total;
              xhr.__loaded = e.loaded;
              if (e.total === e.loaded) {
                var _this = this
                setTimeout(function() {
                  if (!xhr.__completed) {
                    xhr.getAllResponseHeaders = function() {};
                    _this.complete(null, {
                      status: 204,
                      statusText: 'No Content'
                    });
                  }
                }, FileAPI.noContentTimeout || 10000);
              }
            },
            headers: xhr.__requestHeaders
          }
          config.data = {};
          config.files = {}
          for (var i = 0; i < formData.data.length; i++) {
            var item = formData.data[i];
            if (item.val != null && item.val.name != null && item.val.size != null && item.val.type != null) {
              config.files[item.key] = item.val;
            } else {
              config.data[item.key] = item.val;
            }
          }
          setTimeout(function() {
            if (!hasFlash()) {
              throw 'Adode Flash Player need to be installed. To check ahead use "FileAPI.hasFlash"';
            }
            xhr.__fileApiXHR = FileAPI.upload(config);
          }, 1);
        } else {
          if (this.__origError) {
            throw this.__origError;
          }
          orig.apply(xhr, arguments);
        }
      }
    });
    window.XMLHttpRequest.__isFileAPIShim = true;
    var addFlash = function(elem) {
      if (!hasFlash()) {
        throw 'Adode Flash Player need to be installed. To check ahead use "FileAPI.hasFlash"';
      }
      var el = angular.element(elem);
      if (!el.attr('disabled')) {
        var hasFileSelect = false;
        for (var i = 0; i < el[0].attributes.length; i++) {
          var attrib = el[0].attributes[i];
          if (attrib.name.indexOf('file-select') !== -1) {
            hasFileSelect = true;
            break;
          }
        }
        if (!el.hasClass('js-fileapi-wrapper') && (hasFileSelect || el.attr('__afu_gen__') != null)) {
          el.addClass('js-fileapi-wrapper');
          if (el.attr('__afu_gen__') != null) {
            var ref = (el[0].__refElem__ && angular.element(el[0].__refElem__)) || el;
            while (ref && !ref.attr('__refElem__')) {
              ref = angular.element(ref[0].nextSibling);
            }
            ref.bind('mouseover', function() {
              if (el.parent().css('position') === '' || el.parent().css('position') === 'static') {
                el.parent().css('position', 'relative');
              }
              el.css('position', 'absolute').css('top', ref[0].offsetTop + 'px').css('left', ref[0].offsetLeft + 'px')
                .css('width', ref[0].offsetWidth + 'px').css('height', ref[0].offsetHeight + 'px')
                .css('padding', ref.css('padding')).css('margin', ref.css('margin')).css('filter', 'alpha(opacity=0)');
              ref.attr('onclick', '');
              el.css('z-index', '1000');
            });
          }
        }
      }
    };
    var changeFnWrapper = function(fn) {
      return function(evt) {
        var files = FileAPI.getFiles(evt);
        for (var i = 0; i < files.length; i++) {
          if (files[i].size === undefined) files[i].size = 0;
          if (files[i].name === undefined) files[i].name = 'file';
          if (files[i].type === undefined) files[i].type = 'undefined';
        }
        if (!evt.target) {
          evt.target = {};
        }
        evt.target.files = files;
        if (evt.target.files != files) {
          evt.__files_ = files;
        }
        (evt.__files_ || evt.target.files).item = function(i) {
          return (evt.__files_ || evt.target.files)[i] || null;
        }
        if (fn) fn.apply(this, [evt]);
      };
    };
    var isFileChange = function(elem, e) {
      return (e.toLowerCase() === 'change' || e.toLowerCase() === 'onchange') && elem.getAttribute('type') == 'file';
    }
    if (HTMLInputElement.prototype.addEventListener) {
      HTMLInputElement.prototype.addEventListener = (function(origAddEventListener) {
        return function(e, fn, b, d) {
          if (isFileChange(this, e)) {
            addFlash(this);
            origAddEventListener.apply(this, [e, changeFnWrapper(fn), b, d]);
          } else {
            origAddEventListener.apply(this, [e, fn, b, d]);
          }
        }
      })(HTMLInputElement.prototype.addEventListener);
    }
    if (HTMLInputElement.prototype.attachEvent) {
      HTMLInputElement.prototype.attachEvent = (function(origAttachEvent) {
        return function(e, fn) {
          if (isFileChange(this, e)) {
            addFlash(this);
            if (window.jQuery) {
              angular.element(this).bind('change', changeFnWrapper(null));
            } else {
              origAttachEvent.apply(this, [e, changeFnWrapper(fn)]);
            }
          } else {
            origAttachEvent.apply(this, [e, fn]);
          }
        }
      })(HTMLInputElement.prototype.attachEvent);
    }
    window.FormData = FormData = function() {
      return {
        append: function(key, val, name) {
          if (val.__isFileAPIBlobShim) {
            val = val.data[0];
          }
          this.data.push({
            key: key,
            val: val,
            name: name
          });
        },
        data: [],
        __isFileAPIShim: true
      };
    };
    window.Blob = Blob = function(b) {
      return {
        data: b,
        __isFileAPIBlobShim: true
      };
    };
    (function() {
      if (!window.FileAPI) {
        window.FileAPI = {};
      }
      if (FileAPI.forceLoad) {
        FileAPI.html5 = false;
      }
      if (!FileAPI.upload) {
        var jsUrl, basePath, script = document.createElement('script'),
          allScripts = document.getElementsByTagName('script'),
          i, index, src;
        if (window.FileAPI.jsUrl) {
          jsUrl = window.FileAPI.jsUrl;
        } else if (window.FileAPI.jsPath) {
          basePath = window.FileAPI.jsPath;
        } else {
          for (i = 0; i < allScripts.length; i++) {
            src = allScripts[i].src;
            index = src.search(/\/angular\-file\-upload[\-a-zA-z0-9\.]*\.js/)
            if (index > -1) {
              basePath = src.substring(0, index + 1);
              break;
            }
          }
        }
        if (FileAPI.staticPath == null) FileAPI.staticPath = basePath;
        script.setAttribute('src', jsUrl || basePath + 'FileAPI.min.js');
        document.getElementsByTagName('head')[0].appendChild(script);
        FileAPI.hasFlash = hasFlash();
      }
    })();
    FileAPI.disableFileInput = function(elem, disable) {
      if (disable) {
        elem.removeClass('js-fileapi-wrapper')
      } else {
        elem.addClass('js-fileapi-wrapper');
      }
    }
  }
  if (!window.FileReader) {
    window.FileReader = function() {
      var _this = this,
        loadStarted = false;
      this.listeners = {};
      this.addEventListener = function(type, fn) {
        _this.listeners[type] = _this.listeners[type] || [];
        _this.listeners[type].push(fn);
      };
      this.removeEventListener = function(type, fn) {
        _this.listeners[type] && _this.listeners[type].splice(_this.listeners[type].indexOf(fn), 1);
      };
      this.dispatchEvent = function(evt) {
        var list = _this.listeners[evt.type];
        if (list) {
          for (var i = 0; i < list.length; i++) {
            list[i].call(_this, evt);
          }
        }
      };
      this.onabort = this.onerror = this.onload = this.onloadstart = this.onloadend = this.onprogress = null;
      var constructEvent = function(type, evt) {
        var e = {
          type: type,
          target: _this,
          loaded: evt.loaded,
          total: evt.total,
          error: evt.error
        };
        if (evt.result != null) e.target.result = evt.result;
        return e;
      };
      var listener = function(evt) {
        if (!loadStarted) {
          loadStarted = true;
          _this.onloadstart && _this.onloadstart(constructEvent('loadstart', evt));
        }
        if (evt.type === 'load') {
          _this.onloadend && _this.onloadend(constructEvent('loadend', evt));
          var e = constructEvent('load', evt);
          _this.onload && _this.onload(e);
          _this.dispatchEvent(e);
        } else if (evt.type === 'progress') {
          var e = constructEvent('progress', evt);
          _this.onprogress && _this.onprogress(e);
          _this.dispatchEvent(e);
        } else {
          var e = constructEvent('error', evt);
          _this.onerror && _this.onerror(e);
          _this.dispatchEvent(e);
        }
      };
      this.readAsArrayBuffer = function(file) {
        FileAPI.readAsBinaryString(file, listener);
      }
      this.readAsBinaryString = function(file) {
        FileAPI.readAsBinaryString(file, listener);
      }
      this.readAsDataURL = function(file) {
        FileAPI.readAsDataURL(file, listener);
      }
      this.readAsText = function(file) {
        FileAPI.readAsText(file, listener);
      }
    }
  }
})();;
/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/_module.js */
angular.module('sn.common.attachments', [
  'angularFileUpload',
  'sn.common.util'
]);;
/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/factory.nowAttachmentHandler.js */
angular.module("sn.common.attachments").factory("nowAttachmentHandler", function($http, nowServer, $upload, $rootScope, $timeout,
  snNotification) {
  "use strict";
  return function(setAttachments, appendError) {
    var self = this;
    self.cardUploading = '';
    self.setAttachments = setAttachments;
    self.appendError = appendError;
    self.ADDED = 'added';
    self.DELETED = 'deleted';
    self.RENAMED = 'renamed';
    self.getAttachmentList = function(action) {
      var url = nowServer.getURL('ngk_attachments', {
        action: 'list',
        sys_id: self.tableId,
        table: self.tableName
      });
      $http.get(url).then(function(response) {
        var attachments = response.data.files || [];
        self.setAttachments(attachments, action);
        if (self.startedUploadingTimeout || self.errorTimeout) {
          self.stopAllUploading();
          $rootScope.$broadcast('board.uploading.end');
        }
      });
    };
    self.stopAllUploading = function() {
      $timeout.cancel(self.errorTimeout);
      $timeout.cancel(self.startedUploadingTimeout);
      hideProgressBar();
      $rootScope.$broadcast("attachment.upload.stop");
    };
    self.onFileSelect = function($files) {
      if (!$files.length)
        return;
      var url = nowServer.getURL('ngk_attachments', {
        sys_id: self.tableId,
        table: self.tableName,
        action: 'add'
      });
      self.cardUploading = self.tableId;
      self.maxfiles = $files.length;
      self.fileCount = 1;
      self.filesUploaded = self.maxfiles;
      self.startedUploadingTimeout = $timeout(showUploaderDialog, 1500);
      for (var i = 0; i < self.maxfiles; i++) {
        if (parseInt($files[i].size) > parseInt(self.fileUploadSizeLimit)) {
          self.stopAllUploading();
          $rootScope.$broadcast('dialog.upload_too_large.show');
          return;
        }
      }
      for (var i = 0; i < self.maxfiles; i++) {
        $rootScope.$broadcast("attachment.upload.start");
        var file = $files[i];
        self.filesUploaded--;
        self.upload = $upload.upload({
          url: url,
          fields: {
            attachments_modified: 'true',
            sysparm_table: self.tableName,
            sysparm_sys_id: self.tableId,
            sysparm_nostack: 'yes',
            sysparm_encryption_context: '',
            sysparm_ck: window.g_ck
          },
          fileFormDataName: 'attachFile',
          file: file
        }).progress(function(evt) {
          var percent = parseInt(100.0 * evt.loaded / evt.total, 10);
          updateProgress(percent);
        }).success(function(data, status, headers, config) {
          processError(data);
          self.stopAllUploading();
          self.getAttachmentList(self.ADDED);
          if (self.filesUploaded <= 0) {
            self.cardUploading = '';
          }
        });
      }
    };
    self.downloadAttachment = function(attachment) {
      window.location.href = '/sys_attachment.do?sys_id=' + attachment.sys_id;
    };
    self.viewAttachment = function($event, attachment) {
      var url = window.location.protocol + '//' + window.location.host;
      url += '/sys_attachment.do?sysparm_referring_url=tear_off&view=true&sys_id=' + attachment.sys_id;
      window.open(url, attachment.sys_id,
        "toolbar=no,menubar=no,personalbar=no,width=800,height=600,scrollbars=yes,resizable=yes");
    };
    self.editAttachment = function($event, attachment) {
      var parent = $($event.currentTarget).closest('.file-attachment');
      var thumbnail = parent.find('.thumbnail');
      var input = parent.find('input');
      var tools = parent.find('.tools');
      var fileName = attachment.file_name;
      if (attachment.file_name.indexOf('.') !== -1) {
        attachment.ext = fileName.match(/(\.[^\.]+)$/i)[0];
        fileName = attachment.file_name.replace(/(\.[^\.]+)$/i, '');
      }
      input.val(fileName);
      var w = input.prev().width();
      input.width(w);
      input.prev().hide();
      input.css('display', 'block');
      thumbnail.addClass('state-locked');
      tools.find('.delete-edit').hide();
      tools.find('.rename-cancel').css('display', 'inline-block');
      input.focus();
    }
    self.onKeyDown = function($event, attachment) {
      var keyCode = $event.keyCode;
      if (keyCode === 13) {
        $event.stopPropagation();
        $event.preventDefault();
        self.updateAttachment($event, attachment);
      } else if (keyCode === 27) {
        $event.stopPropagation();
        $event.preventDefault();
        self.updateAttachment($event);
      }
    };
    self.updateAttachment = function($event, attachment) {
      var el = $($event.currentTarget);
      var parent = el.closest('.file-attachment');
      var thumbnail = parent.find('.thumbnail');
      var input = parent.find('input');
      var link = parent.find('a');
      var tools = parent.find('.tools');
      if (attachment) {
        var fileName = input.val();
        if (fileName.length) {
          fileName += attachment.ext;
          if (fileName !== attachment.file_name) {
            link.text(fileName);
            self.renameAttachment(attachment, fileName);
          }
        }
      }
      input.hide();
      input.prev().show();
      tools.find('.rename-cancel').hide();
      thumbnail.removeClass('state-locked');
      tools.find('.delete-edit').css('display', 'inline-block');
    };
    self.dismissMsg = function($event, $index, errorMessages) {
      var msg = $($event.currentTarget);
      msg.addClass('remove');
      setTimeout(function() {
        msg.remove();
        errorMessages.splice($index, 1);
      }, 500);
    };
    $rootScope.$on("dialog.comment_form.close", function() {
      hideProgressBar();
    });
    self.openSelector = function($event) {
      $event.stopPropagation();
      $event.preventDefault();
      var target = $($event.currentTarget);
      var input = target.parent().find('input[type=file]');
      input.click();
    }
    self.deleteAttachment = function(attachment) {
      if (attachment && attachment.sys_id) {
        $('#' + attachment.sys_id).hide();
        var url = nowServer.getURL('ngk_attachments', {
          action: 'delete',
          sys_id: attachment.sys_id
        });
        $http.get(url).then(function(response) {
          processError(response.data);
          self.getAttachmentList(self.DELETED);
        });
      }
    };
    self.renameAttachment = function(attachment, newName) {
      $http({
        url: nowServer.getURL('ngk_attachments'),
        method: 'POST',
        params: {
          action: 'rename',
          sys_id: attachment.sys_id,
          new_name: newName
        }
      }).then(function(response) {
        processError(response.data);
        self.getAttachmentList(self.RENAMED);
      });
    };

    function showUploaderDialog() {
      $rootScope.$broadcast('board.uploading.start', self.tableId);
    }

    function updateProgress(percent) {
      if (self.prevPercent === percent && self.fileCount <= self.maxfiles)
        return;
      if (self.fileCount <= self.maxfiles) {
        if (percent > 99)
          self.fileCount++;
        if (self.fileCount <= self.maxfiles) {
          $timeout.cancel(self.errorTimeout);
          self.errorTimeout = $timeout(broadcastError, 15000);
          $('.progress-label').text('Uploading file ' + self.fileCount + ' of ' + self.maxfiles);
          $('.upload-progress').val(percent);
          $('.progress-wrapper').show();
        }
      }
      self.prevPercent = percent;
    }

    function hideProgressBar() {
      try {
        $('.progress-wrapper').hide();
      } catch (e) {}
    }
    self.setParams = function(tableName, tableId, fileUploadSizeLimit) {
      self.tableName = tableName;
      self.tableId = tableId;
      self.fileUploadSizeLimit = fileUploadSizeLimit;
    };

    function broadcastError() {
      $rootScope.$broadcast('board.uploading.end');
      snNotification.show('error', 'An error occured when trying to upload your file. Please try again.');
      self.stopAllUploading();
    }

    function processError(data) {
      if (!data.error)
        return;
      var fileName = data.fileName || data.file_name;
      self.appendError({
        msg: data.error + ' : ',
        fileName: '"' + fileName + '"'
      });
    }
  };
});;
/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/directive.nowAttachmentsList.js */
angular.module('sn.common.attachments').directive('nowAttachmentsList', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl("attachments_list.xml"),
    link: function(scope, elem, attrs, $parse) {
      scope.icons = {
        preview: attrs.previewIcon,
        edit: attrs.editIcon,
        delete: attrs.deleteIcon,
        ok: attrs.okIcon,
        cancel: attrs.cancelIcon
      };
      scope.listClass = "list-group";
      var inline = scope.$eval(attrs.inline);
      if (inline)
        scope.listClass = "list-inline";
      scope.entryTemplate = getTemplateUrl(attrs.template || "attachment");
    }
  };
});;
/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/factory.snAttachmentHandler.js */
angular.module('sn.common.attachments').factory('snAttachmentHandler', function(urlTools, $http, $upload, $window, $q) {
  "use strict";
  return {
    getViewUrl: getViewUrl,
    create: createAttachmentHandler,
    deleteAttachment: deleteAttachmentBySysID,
    renameAttachment: renameAttachmentBySysID
  };

  function getViewUrl(sysId) {
    return '/sys_attachment.do?sys_id=' + sysId;
  }

  function deleteAttachmentBySysID(sysID) {
    var url = urlTools.getURL('ngk_attachments', {
      action: 'delete',
      sys_id: sysID
    });
    return $http.get(url);
  }

  function renameAttachmentBySysID(sysID, newName) {
    var url = urlTools.getURL('ngk_attachments', {
      action: 'rename',
      sys_id: sysID,
      new_name: newName
    });
    return $http.post(url);
  }

  function createAttachmentHandler(tableName, sysID, options) {
    var _tableName = tableName;
    var _sysID = sysID;
    var _files = [];

    function getTableName() {
      return _tableName;
    }

    function getSysID() {
      return _sysID;
    }

    function getAttachments() {
      var url = urlTools.getURL('ngk_attachments', {
        action: 'list',
        sys_id: _sysID,
        table: _tableName
      });
      return $http.get(url).then(function(response) {
        var files = response.data.files;
        if (_files.length == 0) {
          files.forEach(function(file) {
            if (file && file.sys_id) {
              _transformFileResponse(file);
              _files.push(file);
            }
          })
        } else {
          _files = files;
        }
        return _files;
      });
    }

    function addAttachment(attachment) {
      _files.unshift(attachment);
    }

    function deleteAttachment(attachment) {
      var index = _files.indexOf(attachment);
      if (index !== -1) {
        return deleteAttachmentBySysID(attachment.sys_id).then(function() {
          _files.splice(index, 1);
        });
      }
    }

    function uploadAttachments(files, uploadFields) {
      var defer = $q.defer();
      var promises = [];
      var fileData = [];
      angular.forEach(files, function(file) {
        promises.push(uploadAttachment(file, uploadFields).then(function(response) {
          fileData.push(response);
        }));
      });
      $q.all(promises).then(function() {
        defer.resolve(fileData);
      });
      return defer.promise;
    }

    function uploadAttachment(file, uploadFields, uploadMethods) {
      var url = urlTools.getURL('ngk_attachments', {
        action: 'add',
        sys_id: _sysID,
        table: _tableName,
        load_attachment_record: 'true'
      });
      var fields = {
        attachments_modified: 'true',
        sysparm_table: _tableName,
        sysparm_sys_id: _sysID,
        sysparm_nostack: 'yes',
        sysparm_encryption_context: ''
      };
      if (typeof $window.g_ck !== 'undefined') {
        fields['sysparm_ck'] = $window.g_ck;
      }
      if (uploadFields) {
        angular.extend(fields, uploadFields);
      }
      var upload = $upload.upload({
        url: url,
        fields: fields,
        fileFormDataName: 'attachFile',
        file: file
      });
      if (uploadMethods !== undefined) {
        if (uploadMethods.hasOwnProperty('progress')) {
          upload.progress(uploadMethods.progress);
        }
        if (uploadMethods.hasOwnProperty('success')) {
          upload.success(uploadMethods.success);
        }
        if (uploadMethods.hasOwnProperty('error')) {
          upload.error(uploadMethods.error);
        }
      }
      return upload.then(function(response) {
        var sysFile = response.data;
        if (sysFile.error) {
          return $q.reject("Exception when adding attachment: " + sysFile.error);
        }
        if (typeof sysFile === "object" && sysFile.hasOwnProperty('sys_id')) {
          _transformFileResponse(sysFile);
          addAttachment(sysFile);
        }
        if (options && options.onUploadComplete) {
          options.onUploadComplete(sysFile);
        }
        return sysFile;
      });
    }

    function _transformFileResponse(file) {
      file.isImage = false;
      file.canPreview = false;
      if (file.content_type.indexOf('image') !== -1) {
        file.isImage = true;
        if (!file.thumbSrc) {} else if (file.thumbSrc[0] !== '/') {
          file.thumbSrc = '/' + file.thumbSrc;
        }
        file.canPreview = file.content_type.indexOf('tiff') === -1;
      }
      file.viewUrl = getViewUrl(file.sys_id);
    }
    return {
      getSysID: getSysID,
      getTableName: getTableName,
      getAttachments: getAttachments,
      addAttachment: addAttachment,
      deleteAttachment: deleteAttachment,
      uploadAttachment: uploadAttachment,
      uploadAttachments: uploadAttachments
    };
  }
});;
/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/directive.snFileUploadInput.js */
angular.module('sn.common.attachments').directive('snFileUploadInput', function(cabrillo, $document) {
  'use strict';
  return {
    restrict: 'E',
    scope: {
      attachmentHandler: '=',
      customClassNames: '@classNames'
    },
    template: function() {
      var inputTemplate;
      if (cabrillo.isNative()) {
        inputTemplate = '<button class="{{classNames}}" ng-click="showAttachOptions($event)" aria-labelledby="attach-label-{{ ::$id }}"><span class="upload-label" id="attach-label-{{ ::$id }}"><translate key="Add Attachment" /></span></button>';
      } else {
        inputTemplate = '<button class="{{classNames}}" ng-file-select="onFileSelect($files)" aria-labelledby="attach-label-{{ ::$id }}"><span class="upload-label" id="attach-label-{{ ::$id }}"><translate key="Add Attachment" /></span></button>';
      }
      return [
        '<div class="file-upload-input" role="button" aria-labelledby="attach-label-{{ ::$id }}">',
        '<div role="group" class="injected-contents-break-accessibility" aria-hidden="true">',
        inputTemplate,
        '</div>',
        '</div>'
      ].join('');
    },
    controller: function($element, $scope) {
      var classNames = 'btn btn-icon attachment-btn icon-paperclip';
      if ($scope.customClassNames) {
        classNames += ' ' + $scope.customClassNames;
      }
      $scope.classNames = classNames;
      $scope.showAttachOptions = function($event) {
        var handler = $scope.attachmentHandler;
        var target = angular.element($event.currentTarget);
        var elRect = target[0].getBoundingClientRect();
        var body = $document[0].body;
        var rect = {
          x: elRect.left + body.scrollLeft,
          y: elRect.top + body.scrollTop,
          width: elRect.width,
          height: elRect.height
        };
        var options = {
          sourceRect: rect
        };
        cabrillo.attachments.addFile(
          handler.getTableName(),
          handler.getSysID(),
          null,
          options
        ).then(function(data) {
          console.log('Attached new file', data);
          handler.addAttachment(data);
        }, function() {
          console.log('Failed to attach new file');
        });
      };
      $scope.onFileSelect = function($files) {
        $scope.attachmentHandler.uploadAttachments($files);
      };
      $scope.showFileSelector = function($event) {
        $event.stopPropagation();
        var target = angular.element($event.currentTarget);
        var input = target.parent().find('input');
        input.triggerHandler('click');
      };
    }
  }
});;
/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/directive.snPasteFileHandler.js */
angular.module('sn.common.attachments').directive('snPasteFileHandler', function($parse) {
  'use strict';
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var snPasteFileHandler = $parse(attrs.snPasteFileHandler);
      element.bind("paste", function(event) {
        event = event.originalEvent || event;
        var item = event.clipboardData.items[0];
        if (!item)
          return;
        var file = item.getAsFile();
        if (!file)
          return;
        snPasteFileHandler(scope, {
          file: file
        });
        event.preventDefault();
        event.stopPropagation();
      });
    }
  };
});;
/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/directive.snAttachmentList.js */
angular.module('sn.common.attachments').directive('snAttachmentList', function(getTemplateUrl, snAttachmentHandler, $rootScope, $window, $timeout, $q) {
    'use strict';
    return {
      restrict: 'E',
      replace: true,
      templateUrl: getTemplateUrl("sn_attachment_list.xml"),
      scope: {
        tableName: "=?",
        sysID: "=?sysId",
        attachmentList: "=?",
        uploadFileFn: "&",
        deleteFileFn: "=?",
        canEdit: "=?",
        canRemove: "=?",
        canAdd: "=?",
        canDownload: "=?",
        showHeader: "=?",
        clickImageFn: "&?",
        confirmDelete: "=?"
      },
      controller: function($scope) {
        $scope.canEdit = $scope.canEdit || false;
        $scope.canDownload = $scope.canDownload || false;
        $scope.canRemove = $scope.canRemove || false;
        $scope.canAdd = $scope.canAdd || false;
        $scope.showHeader = $scope.showHeader || false;
        $scope.clickImageFn = $scope.clickImageFn || function() {};
        $scope.confirmDelete = $scope.confirmDelete || false;
        $scope.filesInProgress = {};
        $scope.attachmentToDelete = null;

        function refreshResources() {
          var handler = snAttachmentHandler.create($scope.tableName, $scope.sysID);
          handler.getAttachments().then(function(files) {
            $scope.attachmentList = files;
          });
        }
        if (!$scope.attachmentList) {
          $scope.attachmentList = [];
          refreshResources();
        }
        $scope.$on('attachments_list.update', function(e, tableName, sysID) {
          if (tableName === $scope.tableName && sysID === $scope.sysID) {
            refreshResources();
          }
        });

        function removeFromFileProgress(fileName) {
          delete $scope.filesInProgress[fileName];
        }

        function updateFileProgress(file) {
          if (!$scope.filesInProgress[file.name])
            $scope.filesInProgress[file.name] = file;
        }
        $scope.$on('attachments_list.upload.progress', function(e, file) {
          updateFileProgress(file);
        });
        $scope.$on('attachments_list.upload.success', function(e, file) {
          removeFromFileProgress(file.name);
        });
        $scope.attachFiles = function(files) {
          if ($scope.tableName && $scope.sysID) {
            var handler = snAttachmentHandler.create($scope.tableName, $scope.sysID);
            var promises = [];
            files.forEach(function(file) {
              var promise = handler.uploadAttachment(file, null, {
                progress: function(e) {
                  var file = e.config.file;
                  file.progress = 100.0 * event.loaded / event.total;
                  updateFileProgress(file);
                },
                success: function(data) {
                  removeFromFileProgress(data.file_name);
                }
              });
              promises.push(promise);
            });
            $q.all(promises).then(function() {
              refreshResources();
            });
          } else {
            if ($scope.uploadFileFn)
              $scope.uploadFileFn({
                files: files
              });
          }
        };
        $scope.getProgressStyle = function(fileName) {
          return {
            'width': $scope.filesInProgress[fileName].progress + '%'
          };
        };
        $scope.openSelector = function($event) {
          $event.stopPropagation();
          var target = angular.element($event.currentTarget);
          $timeout(function() {
            target.parent().find('input').click();
          });
        };
        $scope.confirmDeleteAttachment = function(attachment) {
          $scope.attachmentToDelete = attachment;
          $scope.$broadcast('dialog.confirm-delete.show');
        };
        $scope.deleteAttachment = function() {
          snAttachmentHandler.deleteAttachment($scope.attachmentToDelete.sys_id).then(function() {
            var index = $scope.attachmentList.indexOf($scope.attachmentToDelete);
            $scope.attachmentList.splice(index, 1);
          });
        };
      }
    };
  })
  .directive('snAttachmentListItem', function(getTemplateUrl, snAttachmentHandler, $rootScope, $window, $timeout, $parse) {
    'use strict';
    return {
      restrict: "E",
      replace: true,
      templateUrl: getTemplateUrl("sn_attachment_list_item.xml"),
      link: function(scope, element, attrs) {
        function translateAttachment(att) {
          return {
            content_type: att.content_type,
            file_name: att.file_name,
            image: (att.thumbSrc !== undefined),
            size_bytes: att.size,
            sys_created_by: "",
            sys_created_on: "",
            sys_id: att.sys_id,
            thumb_src: att.thumbSrc
          };
        }
        scope.attachment = ($parse(attrs.attachment.size_bytes)) ?
          scope.$eval(attrs.attachment) :
          translateAttachment(attrs.attachment);
        var fileNameView = element.find('.sn-widget-list-title_view');
        var fileNameEdit = element.find('.sn-widget-list-title_edit');

        function editFileName() {
          fileNameView.hide();
          fileNameEdit.show();
          element.find('.edit-text-input').focus();
        }

        function viewFileName() {
          fileNameView.show();
          fileNameEdit.hide();
        }
        viewFileName();
        scope.editModeToggle = function($event) {
          $event.preventDefault();
          $event.stopPropagation();
          scope.editMode = !scope.editMode;
          if (scope.editMode)
            editFileName();
          else
            viewFileName();
        };
        scope.updateName = function() {
          scope.editMode = false;
          viewFileName();
          snAttachmentHandler.renameAttachment(scope.attachment.sys_id, scope.attachment.file_name);
        };
      },
      controller: function($scope, snCustomEvent) {
        $scope.editMode = false;
        $scope.buttonFocus = false;
        $scope.removeAttachment = function(attachment, index) {
          if ($scope.deleteFileFn !== undefined && $scope.deleteFileFn instanceof Function) {
            $scope.deleteFileFn.apply(null, arguments);
            return;
          }
          if ($scope.confirmDelete) {
            $scope.confirmDeleteAttachment($scope.attachment);
            return;
          }
          snAttachmentHandler.deleteAttachment($scope.attachment.sys_id).then(function() {
            $scope.attachmentList.splice($scope.$index, 1);
          });
        };
        var contentTypeMap = {
          "application/pdf": "icon-document-pdf",
          "text/plain": "icon-document-txt",
          "application/zip": "icon-document-zip",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "icon-document-doc",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation": "icon-document-ppt",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "icon-document-xls",
          "application/vnd.ms-powerpoint": "icon-document-ppt"
        };
        $scope.getDocumentType = function(contentType) {
          return contentTypeMap[contentType] || "icon-document";
        };
        $scope.handleAttachmentClick = function(event) {
          if (event.keyCode === 9)
            return;
          if ($scope.editMode)
            return;
          if (!$scope.attachment)
            return;
          if ($scope.attachment.image)
            openImageInLightBox(event);
          else
            downloadAttachment();
        };

        function downloadAttachment() {
          if (!$scope.attachment.sys_id)
            return;
          $window.location.href = 'sys_attachment.do?sys_id=' + $scope.attachment.sys_id;
        }

        function openImageInLightBox(event) {
          if (!$scope.attachment.size)
            $scope.attachment.size = $scope.getSize($scope.attachment.size_bytes, 2);
          $scope.clickImageFn({
            file: $scope.attachment
          });
          snCustomEvent.fire('sn.attachment.preview', event, $scope.attachment);
        }
        $scope.getSize = function(bytes, precision) {
          if (typeof bytes === 'string' && bytes.slice(-1) === 'B')
            return bytes;
          var kb = 1024;
          var mb = kb * 1024;
          var gb = mb * 1024;
          if ((bytes >= 0) && (bytes < kb))
            return bytes + ' B';
          else if ((bytes >= kb) && (bytes < mb))
            return (bytes / kb).toFixed(precision) + ' KB';
          else if ((bytes >= mb) && (bytes < gb))
            return (bytes / mb).toFixed(precision) + ' MB';
          else if (bytes >= gb)
            return (bytes / gb).toFixed(precision) + ' GB';
          else
            return bytes + ' B';
        }
        $scope.onButtonFocus = function() {
          $scope.buttonFocus = true;
        }
        $scope.onButtonBlur = function() {
          $scope.buttonFocus = false;
        }
      }
    };
  });;;
/*! RESOURCE: /scripts/app.ng_chat/_ng_chat.js */
(function() {
  'use strict';
  var dependencies = [
    'sn.connect.profile',
    'sn.connect.presence',
    'sn.connect.conversation',
    'sn.connect.document',
    'sn.connect.queue',
    'ng.amb',
    'sn.angularstrap',
    'mentio',
    'sn.dragdrop'
  ];
  if (window.concoursePluginInstalled) {
    dependencies.unshift('sn.concourse');
    dependencies.push('sn.overviewhelp');
  }
  if (window.notificationPluginInstalled) {
    dependencies.push('sn.notification_preference');
  }
  angular.module('sn.connect', dependencies)
    .run(function(i18n) {
      i18n.preloadMessages();
    });
})();;
/*! RESOURCE: /scripts/app.ng_chat/controller.chat.js */
angular.module('sn.connect').controller('chat', function(
  $scope, $rootScope, $location, $window, $q, $element, $timeout, conversations, userPreferences, profiles, queues,
  liveProfileID, snTabActivity, snPresence, snConversationAsideHistory, activeConversation, snNotification,
  screenWidth, messageNotifier, snCustomEvent, audioNotifier, connectDropTargetService) {
  'use strict';
  $scope.dropTargetService = connectDropTargetService;
  snTabActivity.setAppName("sn.connect");
  messageNotifier.registerMessageServiceWatch(shouldSendNotification);
  audioNotifier.registerMessageServiceWatch(activeConversation, shouldSendNotification);

  function shouldSendNotification(message) {
    if (snTabActivity.isVisible && activeConversation.sysID !== message.conversationID) {
      return true;
    }
    return !snTabActivity.isVisible;
  }
  $scope.activeConversation = activeConversation;
  $scope.isTopWindow = true;
  $scope.hasQueues = queues.hasQueues;
  $timeout(function() {
    conversations.loaded.then(function() {
      $element.removeClass("loading");
    })
  }, 1000, false);
  try {
    $scope.isTopWindow = window.top == window.self;
    if (!$scope.isTopWindow) {
      $timeout(function() {
        window.top.location = "/$c.do"
      }, 3000)
    }
  } catch (IGNORED) {
    $scope.isTopWindow = false;
  }
  $scope.redirectFrame = function() {
    window.location = "/home.do";
  };
  $rootScope.$on('http-error.retry', function() {
    location.reload();
  });
  $scope.$on("connect.conversation.attachment_errors", function(evt, data) {
    if (!activeConversation.isActive(data.conversation))
      return;
    $scope.attachmentErrors = data.errors;
    angular.forEach(data.errors, function(error) {
      snNotification.show("error", error)
    })
  });
  var loadPromises = [];
  loadPromises.push(conversations.refreshAll());
  var pageLoadPromise = $q.all(loadPromises).then(function() {
    profiles.getAsync(liveProfileID).then(function(profile) {
      $scope.currentUser = profile;
      snPresence.init();
    });
    $scope.resourcesWidth = 285;
    $scope.resourcesWidthHelpDesk = '49%';
  });
  $scope.$on('pane.collapsed', function(event, position, collapsed) {
    userPreferences.setPreference('collaboration.' + position + '.collapsed', collapsed.toString());
  });
  var initialLocationHandled = false;
  $scope.$on('$locationChangeSuccess', function() {
    pageLoadPromise.then(function() {
      initialLocationHandled = true;
      var location = activeConversation.location;
      activeConversation.tab = location.tab || activeConversation.tab;
      $rootScope.$broadcast("connect.conversation.select", activeConversation.tab, location.conversationID);
      if (activeConversation.isEmpty)
        $scope.$broadcast("sn.aside.close", true);
      else
        $scope.$broadcast('connect.pane.close');
      if (location.profileID) {
        profiles.openConversation(location.profileID);
        changeLocation();
      }
    });
  });
  $scope.$watch(function() {
    return activeConversation.sysID;
  }, function(sysID, old) {
    if (sysID === old)
      return;
    if (!initialLocationHandled)
      return;
    changeLocation();
  });

  function changeLocation() {
    var path = activeConversation.tab;
    if (!activeConversation.isEmpty)
      path += '/' + activeConversation.sysID;
    $location.path(path);
  }
  $scope.$watch(function() {
    return activeConversation.tab;
  }, function(tab, old) {
    if (tab === old)
      return;
    if (!initialLocationHandled)
      return;
    if (!activeConversation.isEmpty)
      return;
    $location.path(activeConversation.tab);
  });
  CustomEvent.observe("glide:nav_open_url", function(data) {
    $window.open(data.url, "_blank");
  });
  CustomEvent.observe("connect:open_group", function(data) {
    conversations.followDocumentConversation(data).then(function(conversation) {
      activeConversation.conversation = conversation;
    })
  });
  CustomEvent.observe("connect:follow_document", conversations.followDocumentConversation);
  CustomEvent.observe("connect:unfollow_document", conversations.unfollowDocumentConversation);

  function passAlongAsideEventInfo(e, view, widthOverride) {
    if (angular.equals(e.targetScope, $scope))
      return;
    $scope.$broadcast(e.name, view, widthOverride);
    if (view && !view.isChild && e.name === "sn.aside.open") {
      snConversationAsideHistory.saveHistory(activeConversation.sysID, view);
    } else if (e.name === "sn.aside.close")
      snConversationAsideHistory.clearHistory(activeConversation.sysID);
  }
  $scope.$on("sn.aside.open", passAlongAsideEventInfo);
  $scope.$on("sn.aside.close", passAlongAsideEventInfo);
  $scope.$on("sn.aside.resize", passAlongAsideEventInfo);
  $scope.$on("sn.aside.historyBack", passAlongAsideEventInfo);
  $scope.$on("sn.aside.controls.active", function(e, data) {
    if (!angular.equals(e.targetScope, $scope))
      $scope.$broadcast("sn.aside.controls.active", data);
  });
  $scope.isWideEnough = function() {
    return screenWidth.isAbove(800);
  };
  screenWidth.threshold(800, function(above) {
    if (above)
      $scope.$broadcast('connect.pane.close');
  });
});;
/*! RESOURCE: /scripts/app.ng_chat/controller.chatFloating.js */
angular.module('sn.connect').controller('chatFloating', function(
  $scope, $rootScope, userPreferences, snTabActivity, snConnectAsideManager, messageNotifier, conversations,
  audioNotifier, isRTL, activeConversation, paneManager, $timeout) {
  'use strict';
  paneManager.registerPane('connect:conversation_list');
  $scope.conversationListCollapsed = true;
  snTabActivity.setAppName("sn.connect");
  messageNotifier.registerMessageServiceWatch(shouldSendNotification);
  audioNotifier.registerMessageServiceWatch(activeConversation, shouldSendNotification);
  userPreferences.getPreference('glide.ui.accessibility', false).then(function(val) {
    if (!!window.MSInputMethodContext && !!document.documentMode) {
      $scope.useIE11AccessibilitySpecialCase = val === "true" ? true : false;
    }
  });

  function shouldSendNotification(message) {
    if (!snTabActivity.isVisible)
      return true;
    var conversation = conversations.indexed[message.conversationID];
    if (snTabActivity.isIdle)
      return (conversation && conversation.isFrameStateOpen) ? false : true;
    if (conversation && conversation.isFrameStateOpen)
      return false;
    return $scope.conversationListCollapsed;
  }
  $scope.$watch("conversationListCollapsed", function(listCollapsed) {
    CustomEvent.fireTop("connect:conversation_list:state", (listCollapsed) ? "closed" : "open");
  });
  CustomEvent.observe("connect:conversation_list.toggle", function(manualSave, autoFocusPane) {
    $scope.conversationListCollapsed = !$scope.conversationListCollapsed;
    $rootScope.$broadcast("pane.collapsed", 'right', $scope.conversationListCollapsed, autoFocusPane);
    if (manualSave)
      userPreferences.setPreference("connect:conversation_list.opened", !$scope.conversationListCollapsed);
  });
  snConnectAsideManager.setup();
  $scope.$on('pane.collapsed', function(event, position, collapsed, autoFocusPane) {
    var UI15Layout = angular.element(document.body).data().layout,
      $snConnect = angular.element('.sn-connect-content'),
      $layout = angular.element('.navpage-layout'),
      $pageRight = angular.element('.navpage-right');
    var pane = isRTL ? 'west' : 'east';

    function focusInput() {
      if ($snConnect.hasClass('sn-pane-visible')) {
        var el = $snConnect.find('input').filter(':first');
        el.focus();
      }
    }
    if (collapsed) {
      if (UI15Layout) {
        UI15Layout.hide(pane);
      } else {
        $layout.addClass('navpage-right-hidden');
        $pageRight.css('visibility', 'hidden');
      }
      $snConnect.addClass('sn-pane-hidden');
      $snConnect.removeClass('sn-pane-visible');
    } else {
      if (UI15Layout) {
        UI15Layout.show(pane);
        UI15Layout.sizePane(pane, 285);
      } else {
        $layout.removeClass('navpage-right-hidden');
        $pageRight.css('visibility', 'visible');
      }
      $snConnect.removeClass('sn-pane-hidden');
      $snConnect.addClass('sn-pane-visible');
      if (autoFocusPane) {
        if ($scope.useIE11AccessibilitySpecialCase) {
          $timeout(function() {
            focusInput();
          }, 425);
        } else {
          $snConnect.one('transitionend', function() {
            focusInput();
          });
        }
      }
    }
  });
});;
/*! RESOURCE: /scripts/app.ng_chat/message/js_includes_connect_message.js */
/*! RESOURCE: /scripts/app.ng_chat/message/_module.js */
angular.module("sn.connect.message", ["ng.common", "sn.connect.util", "sn.connect.profile"]);;
/*! RESOURCE: /scripts/app.ng_chat/message/directive.snAriaChatMessage.js */
angular.module('sn.connect.message').directive('snAriaChatMessage', function(getTemplateUrl, $templateCache, $interpolate, $sanitize) {
  'use strict';
  var ariaTemplate = $templateCache.get(getTemplateUrl('snAriaChatMessage.xml'));
  return {
    restrict: 'E',
    replace: true,
    template: "<div></div>",
    scope: {
      message: '='
    },
    link: function(scope, element) {
      var node = $interpolate(ariaTemplate)(scope);
      element.html($sanitize(node));
    },
    controller: function($scope) {
      $scope.displayedText = function() {
        if (!$scope.message.isMessageShowing) {
          return "";
        }
        return $scope.message.displayText;
      };
      $scope.attachmentMessage = function() {
        if (!$scope.message.attachments || !$scope.message.attachments.length) {
          return "";
        }
        var output = "";
        for (var i = 0, len = $scope.message.attachments.length; i < len; i++) {
          var attachment = $scope.message.attachments[i];
          output += i > 0 ? ' . ' : '';
          output += attachment.fileName + ', ' + attachment.byteDisplay;
        }
        return output;
      }
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/message/directive.snCreateMessage.js */
angular.module('sn.connect.message').directive('snCreateMessage', function(
  $timeout, $rootScope, getTemplateUrl, i18n, messageFactory, messageService, activeConversation, conversations,
  snTypingTracker, snNotification, inFrameSet, isLoggedIn) {
  "use strict";
  var i18nText;
  i18n.getMessages([
    'Worknote',
    'Comment (customer visible)',
    'Message',
    'Attachments cannot be uploaded',
    'Upload attachment'
  ], function(results) {
    i18nText = results;
  });
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl("snCreateMessage.xml"),
    replace: true,
    scope: {
      conversation: "=",
      autofocusOnInput: "=?"
    },
    link: function(scope, element) {
      var lastTypeaheadSuggestion;
      var preventSubmitAfterMentioSelection;
      var input = element.find('.new-message');
      if (navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i)) {
        scope.autofocusOnInput = false;
      }
      if (scope.autofocusOnInput === undefined)
        scope.autofocusOnInput = true;
      input.typeahead({
        hint: true,
        highlight: false,
        minLength: 1
      }, {
        name: 'commands',
        displayKey: 'hint',
        source: function(q, cb) {
          if (scope.conversation.pendingMessage && scope.conversation.pendingMessage.indexOf("/") === 0)
            cb(scope.conversation.chatActions.getCommands(q));
          else
            cb([]);
        },
        templates: {
          suggestion: function(command) {
            return '<div class="command-row"><div class="col-sm-4 command-key">' + command.shortcut + '</div><div class="col-sm-8 command-description">' + command.description + '</div></div>';
          }
        }
      });
      input[0].spellcheck = true;
      var ttTypeahead = input.data("ttTypeahead");
      ttTypeahead.input.off("blurred");
      ttTypeahead.input.$hint.css('display', 'none');
      input.on("typeahead:render", function(event, suggestion) {
        lastTypeaheadSuggestion = suggestion;
      });
      input.on("typeahead:cursorchange", function(event, suggestion) {
        lastTypeaheadSuggestion = suggestion;
      });
      ttTypeahead.input._managePreventDefault = function managePreventDefaultModified(keyName, $e) {
        var preventDefault = false;
        if (keyName === "up" || keyName === "down")
          preventDefault = !ttTypeahead.menu._allDatasetsEmpty();
        if (preventDefault)
          $e.preventDefault();
      };
      input.on("keydown", function(event) {
        if (event.keyCode === 13 && !event.shiftKey)
          event.preventDefault();
        var openMenus = angular.element("mentio-menu").filter(function(index, element) {
          return element.style.display === "block";
        });
        preventSubmitAfterMentioSelection = openMenus.length > 0;
        if (event.keyCode === 27 && !preventSubmitAfterMentioSelection) {
          if (!scope.conversation.isPending)
            scope.$emit("connect.floatingConversationEscape");
          else
            scope.$emit("connect.message_control_key", "escape");
        }
        if (event.keyCode === 13 && !event.shiftKey && !preventSubmitAfterMentioSelection) {
          input.trigger("enterkey-pressed");
          if (!scope.conversation.pendingMessage)
            return;
          if (!handleSlashCommand()) {
            addMessage();
            if (activeConversation.pendingConversation && activeConversation.pendingConversation.sysID === scope.conversation.sysID) {
              conversations.get(activeConversation.pendingConversation.sysID).then(function(conversation) {
                if ((inFrameSet && conversation.isFrameStateOpen) || (!inFrameSet && conversation.visible)) {
                  $rootScope.$broadcast("connect.new_conversation.cancelled");
                }
              });
            }
          }
          closeTypeahead();
        } else {
          snTypingTracker.typing()
        }
      });

      function handleSlashCommand() {
        var pendingMessage = scope.conversation.pendingMessage;
        if (pendingMessage[0] !== "/")
          return false;
        if (lastTypeaheadSuggestion) {
          var lastSuggestionIsValid = lastTypeaheadSuggestion.canRun(pendingMessage);
          $timeout(function() {
            if (lastSuggestionIsValid) {
              scope.conversation.pendingMessage = lastTypeaheadSuggestion.shortcut + " ";
              input.triggerHandler("blur")
            }
            lastTypeaheadSuggestion = void(0);
          });
          return true;
        }
        if (scope.conversation.chatActions.hasMatchingAction(pendingMessage)) {
          if (scope.conversation.chatActions.hasRequiredArguments(pendingMessage)) {
            scope.conversation.chatActions.run(pendingMessage);
            scope.conversation.pendingMessage = "";
            scope.$apply();
          } else {
            scope.$emit("connect.chat_action.require_options", scope.conversation);
          }
          return true;
        }
        return false;
      }

      function closeTypeahead() {
        ttTypeahead.input.query = "";
        ttTypeahead.menu.empty();
        ttTypeahead.input.resetInputValue();
        ttTypeahead.input.trigger("blurred");
        input.typeahead('close');
      }

      function addMessage() {
        $rootScope.$broadcast("connect.auto_scroll.jump_to_bottom");
        snTypingTracker.cancelTyping();
        var newMessageText = scope.conversation.pendingMessage;
        if (!newMessageText)
          return;
        var message = messageFactory.newPendingMessage(scope.conversation, newMessageText, scope.messageType);
        scope.sendMessage(message);
        scope.conversation.pendingMessage = "";
      }
      var waitForConversationCreation = false;
      scope.sendMessage = function(message) {
        if (!message) {
          return;
        }
        if (!activeConversation.pendingConversation || (message.conversationID === activeConversation.sysID)) {
          messageService.send(message);
          return;
        }
        var conversation = activeConversation.pendingConversation;
        if (!conversation.isPending) {
          message.conversationID = conversation.sysID;
          messageService.send(message);
          done(conversation, false);
          return;
        }
        if (waitForConversationCreation)
          return;
        waitForConversationCreation = true;
        var newConversation = conversations.newConversation;
        if (newConversation.pendingRecipients.length === 0)
          return;
        var recipients = newConversation.pendingRecipients;
        var groupName = newConversation.getGroupName();
        conversations.beginNewConversation(groupName, recipients, message)
          .then(function(conversation) {
            waitForConversationCreation = false;
            done(conversation, true);
          });
      };

      function done(conversation, isNew) {
        activeConversation.conversation = conversation;
        $rootScope.$broadcast("connect.new_conversation.complete", conversation, isNew);
        $rootScope.$broadcast("connect.focus", conversation);
      }
      input.on("blur", function() {
        input.val(scope.conversation.pendingMessage);
      });
      scope.$on("connect.message.focus", function(event, conversation) {
        if (inFrameSet) {
          if (!conversation)
            return;
          if (!scope.conversation)
            return;
          if (conversation.sysID !== scope.conversation.sysID)
            return;
          if (conversation !== scope.conversation &&
            scope.conversation.isPending) {
            return;
          }
        }
        focus();
      });
      scope.$on("connect.message.focus.type", function(event, newInputType) {
        if (newInputType !== "chat")
          return;
        focus();
      });

      function focus() {
        if (window.getSelection().toString())
          return;
        $timeout(function() {
          input.focus();
        }, 0, false);
      }
      scope.focus = focus;
      scope.$on("connect.attachment_dialog.open", function(e, sysID) {
        if (sysID !== scope.conversation.sysID)
          return;
        $timeout(function() {
          element.find('.message-attach-file').click();
        }, 0, false);
      });
      if (element.find(".document-message-type .dropup").hideFix)
        element.find(".document-message-type .dropup").hideFix();
      $timeout(focus, 0, false);
    },
    controller: function($scope, liveProfileID, messageService, messageFactory, uploadAttachmentService,
      snConnectMention, inSupportClient) {
      $scope.members = [];
      $scope.members.loading = false;
      $scope.searchMembers = function(term) {
        if ($scope.conversation.isDirectMessage) {
          $scope.members = [];
        } else {
          if (!$scope.conversation.document || !$scope.conversation.table)
            return snConnectMention.retrieveMembers($scope.conversation, term).then(function(members) {
              $scope.members = members;
            });
          $scope.members.loading = true;
          if (term.length === 0) {
            $scope.members = [{
              termLengthIsZero: true
            }];
            $scope.members.loading = false;
          } else {
            snConnectMention.retrieveMembers($scope.conversation, term).then(function(members) {
              $scope.members = members;
              $scope.members.loading = false;
            });
          }
        }
      };
      $scope.selectAtMention = function(item) {
        if (item.termLengthIsZero)
          return item.name;
        return "@[" + item.name + "]";
      };
      $scope.openAttachFileDialog = function($event) {
        if ($scope.isAttachmentDisabled())
          return;
        if ($scope.conversation.amMember || $scope.conversation.isPending)
          uploadAttachmentService.openFileSelector.apply(this, arguments);
      };
      $scope.$on("connect.drop.files", function(event, files, conversationID) {
        var isDropable = $scope.conversation.isPending ?
          !$scope.conversation.isPendingNoRecipients :
          conversationID === $scope.conversation.sysID;
        if (isDropable)
          $scope.sendFiles(files);
      });
      $scope.sendFiles = function(files) {
        if ($scope.conversation.isHelpDesk && $scope.conversation.queueEntry.isTransferringToMe) {
          $scope.$broadcast('dialog.attachment-transfer.show');
          return;
        }
        if ($scope.isWorknote()) {
          $scope.okAttachmentsAsComment = function() {
            attachFiles(files);
          };
          $scope.$broadcast('dialog.attachment-work-notes.show');
          return;
        }
        attachFiles(files);
      };

      function attachFiles(files) {
        $rootScope.$broadcast("connect.auto_scroll.scroll_to_bottom");
        messageService.uploadAttachments($scope.conversation, files).then(function(message) {
          return $scope.sendMessage(message);
        }).then(function() {
          $timeout(function() {
            if (activeConversation.conversation.sysID === $scope.conversation.sysID)
              $scope.focus();
          }, 0, false);
        });
      }
      $scope.isAttachmentDisabled = function() {
        return $scope.isWorknote() ||
          ($scope.conversation.isHelpDesk && $scope.conversation.queueEntry.isTransferringToMe) || !isLoggedIn;
      };
      $scope.getAttachmentTitle = function() {
        return $scope.isAttachmentDisabled() ?
          i18nText['Attachments cannot be uploaded'] :
          i18nText['Upload attachment'];
      };
      $scope.$watch("conversation.sysID", function() {
        initializeMessageType();
      });
      $scope.$watch('conversation.queueEntry.sysID', function() {
        initializeMessageType();
      });
      $scope.setAsWorkNote = function() {
        $scope.messageType = "work_notes";
      };
      $scope.setAsComment = function() {
        $scope.messageType = "comments";
      };
      $scope.isWorknote = function() {
        return $scope.messageType === "work_notes";
      };

      function isComment() {
        return $scope.messageType === 'comments';
      }
      $scope.isDocumentGroup = function() {
        return $scope.conversation.isDocumentGroup && !inSupportClient;
      };
      $scope.isMessageTypeVisible = function() {
        return $scope.isDocumentGroup() && !hasPendingTransferToMe() && $scope.conversation.canSaveWorkNotes && $scope.conversation.canSaveComments;
      };
      $scope.isEndChatVisible = function() {
        return $scope.conversation.isHelpDesk && $scope.conversation.queueEntry.isAssignedToMe;
      };

      function hasPendingTransferToMe() {
        return $scope.conversation.isHelpDesk &&
          $scope.conversation.queueEntry.isTransferringToMe &&
          $scope.conversation.queueEntry.isTransferPending;
      }
      $scope.placeholderText = function() {
        if ($scope.isDocumentGroup() && $scope.conversation.canSaveWorkNotes && $scope.conversation.canSaveComments) {
          if (isComment())
            return i18nText['Comment (customer visible)'];
          if ($scope.isWorknote())
            return i18nText['Worknote'];
        }
        return i18nText['Message'];
      };

      function initializeMessageType() {
        if (hasPendingTransferToMe()) {
          $scope.setAsWorkNote();
          return;
        }
        if ($scope.isDocumentGroup() &&
          !$scope.conversation.isHelpDesk &&
          $scope.conversation.table !== "vtb_board" &&
          $scope.conversation.canSaveWorkNotes) {
          $scope.setAsWorkNote();
          return;
        }
        if ($scope.isDocumentGroup() &&
          !$scope.conversation.isHelpDesk &&
          $scope.conversation.table !== "vtb_board" &&
          $scope.conversation.canSaveComments) {
          $scope.setAsComment();
          return;
        }
        if ($scope.conversation.isDirectMessage || $scope.conversation.isGroup) {
          $scope.messageType = undefined;
          return;
        }
      }
      $scope.closeSupportConversation = function() {
        conversations.closeSupport($scope.conversation.sysID, false);
      };

      function addLinkMessage(link) {
        $scope.sendMessage(messageFactory.newPendingMessage($scope.conversation, link));
      }
      $scope.$on("conversation.resource.add", function(event, data) {
        addLinkMessage(data.link);
      });
      $scope.$on("connect.drop", function(event, data, conversationID) {
        if (conversationID !== $scope.conversation.sysID && !$scope.conversation.isPending)
          return;
        var link;
        if (data.type === "document") {
          link = data.href;
        } else if (data.type === "record") {
          link = data.payload.url;
        } else if (data.type === "link") {
          link = data.payload;
        } else if (data.icon && data.icon === "form" && data.url) {
          link = data.url;
        } else {
          return;
        }
        addLinkMessage(link);
      });
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/message/directive.snMessageBatch.js */
angular.module('sn.connect.message').directive('snMessageBatch', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('snMessageBatch.xml'),
    scope: {
      batch: '=',
      isGroupConversation: '=',
      disableAvatarPopovers: '=?'
    },
    controller: function($scope, showAgentAvatar, inSupportClient) {
      $scope.isSystemMessage = function() {
        return $scope.batch.isSystemMessage;
      };
      $scope.inSupportClient = inSupportClient;
      $scope.isQueueAvatarShowing = function() {
        return (inSupportClient && !showAgentAvatar && $scope.batch.isFromPeer) || $scope.isFromQueue();
      };
      $scope.isFromQueue = function() {
        return $scope.batch.profileData && $scope.batch.profileData.table === 'chat_queue_entry';
      };
      $scope.isTextShowing = function(message) {
        return message.isMessageShowing && !message.uploadingFiles;
      };
      if (!$scope.batch.profileData) {
        var unwatch = $scope.$watch('batch.profileData', function(newVal) {
          if (newVal) {
            $scope.profileData = newVal;
            unwatch();
          }
        })
      } else {
        $scope.profileData = $scope.batch.profileData;
      }
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/message/directive.snUploadAttachmentList.js */
angular.module('sn.connect.message').directive('snUploadAttachmentList', function(getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl("snUploadAttachmentList.xml"),
    scope: {
      uploadingFiles: "="
    },
    controller: function($scope) {
      $scope.isFileNameShowing = function(file) {
        return file.state !== 'error';
      };
      $scope.isProgressBarShowing = function(file) {
        return file.state === 'progress';
      };
      $scope.getProgressStyle = function(file) {
        return {
          'width': file.progress + '%'
        };
      };
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/message/factory.Message.js */
angular.module('sn.connect.message').factory("messageFactory", function(
  liveProfileID, profiles, liveLinkFactory, attachmentFactory, resourcePersister) {
  "use strict";

  function buildMessageFromJSONObject(jsonObject) {
    jsonObject = jsonObject || {};
    var mentions = jsonObject.mentions || [];
    var links = [];
    var attachments = [];
    var isSystem = jsonObject.created_by === "system";
    angular.forEach((jsonObject.links || []), function(rawLink) {
      var link = liveLinkFactory.fromObject(rawLink, !isSystem);
      resourcePersister.addLink(jsonObject.group, link);
      this.push(link);
    }, links);
    angular.forEach((jsonObject.attachments || []), function(rawAttachment) {
      var attachment = attachmentFactory.fromObject(rawAttachment);
      resourcePersister.addAttachment(jsonObject.group, attachment);
      this.push(attachment)
    }, attachments);
    var text = jsonObject.formatted_message;
    var escapedText = htmlEscape(text);
    var displayText = replaceText(escapedText,
        "<a class='at-mention at-mention-user-$1'>@$2</a>",
        linkFormatter)
      .replace(/\r/g, "")
      .replace(/\n/g, "<br>");
    var cleanText = replaceText(escapedText, "@$2", "$2");

    function linkFormatter(wholeMatch, urlOrSysID, linkText) {
      var isSysID = urlOrSysID.match(/^[0-9A-F]{32}$/i);
      var matchedLink;
      var url;
      if (isSysID) {
        matchedLink = links.filter(function(link) {
          return link.sysID === urlOrSysID;
        })[0];
        url = matchedLink && matchedLink.url;
      } else {
        url = urlOrSysID;
        matchedLink = links.filter(function(link) {
          var escapedUrl = htmlEscape(link.url);
          return link.url === url || escapedUrl === url || htmlEscape(escapedUrl) === url;
        })[0];
      }
      if (matchedLink) {
        try {
          return matchedLink.aTag(linkText);
        } catch (unused) {}
      }
      return linkText;
    }
    return {
      sysID: jsonObject.sys_id,
      text: text,
      createdOn: jsonObject.created_on,
      conversationID: jsonObject.group,
      profile: jsonObject.profile,
      timestamp: jsonObject.timestamp,
      reflectedField: jsonObject.reflected_field,
      hasLinks: links.length > 0,
      id: jsonObject.id,
      pending: false,
      get cleanText() {
        return cleanText;
      },
      get profileData() {
        if (this.profile)
          return profiles.get(this.profile);
      },
      get isSystemMessage() {
        return isSystem;
      },
      get isFromPeer() {
        return this.profile !== liveProfileID;
      },
      get attachments() {
        return attachments;
      },
      get links() {
        return links;
      },
      get mentions() {
        return mentions;
      },
      get isMessageShowing() {
        if (!this._isMessageShowing)
          this._isMessageShowing = !shouldHide(this);
        return this._isMessageShowing;
      },
      get hasSystemLink() {
        return this.isSystemMessage && links[0];
      },
      get displayText() {
        return displayText;
      }
    }
  }

  function shouldHide(message) {
    if (onlyAttachmentMessage(message))
      return true;
    var links = message.links;
    return (links.length === 1) &&
      links[0].isHideable &&
      (replaceText(message.text, "X", "X").trim().length === 1);
  }

  function onlyAttachmentMessage(message) {
    var attachments = message.attachments;
    if (attachments.length === 0)
      return false;
    var text = message.text;
    message.attachments.forEach(function(attachment) {
      text = text.replace("File: " + attachment.fileName, "");
    });
    return text.trim().length === 0;
  }

  function replaceText(text, mentions, links) {
    if (!text)
      return "";
    return text
      .replace(/@M\[([^|]+?)\|([^\]]+?)]/gi, mentions)
      .replace(/@\[([^:\]]+?):([^\]]+)]/g, mentions)
      .replace(/@L\[([^|]+?)\|([^\]]*)]/gi, links);
  }

  function newPendingAttachmentMessage(conversation, files) {
    var message = newPendingMessage(conversation, "");
    message.uploadingFiles = files;
    return message;
  }

  function newPendingMessage(conversation, text, journalType) {
    var timestamp = new Date().getTime();
    var message = buildMessageFromJSONObject({
      sys_id: timestamp + Math.random(),
      profile: liveProfileID,
      group: conversation.sysID,
      created_on: getLocalCreatedOn(timestamp),
      formatted_message: text,
      reflected_field: journalType || "comments",
      timestamp: timestamp
    });
    message.pending = true;
    return message;
  }

  function getLocalCreatedOn(timestamp) {
    return new Date(timestamp)
      .toISOString()
      .replace(/(.*?)T(.*?)[.].*/g, "$1 $2");
  }

  function htmlEscape(str) {
    return angular.element("<textarea/>").text(str).html();
  }
  return {
    fromObject: buildMessageFromJSONObject,
    newPendingMessage: newPendingMessage,
    newPendingAttachmentMessage: newPendingAttachmentMessage
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/message/service.messageBatcher.js */
angular.module('sn.connect.message').service("messageBatcherService", function(i18n, $filter, liveProfileID) {
  "use strict";
  var yesterday = "Yesterday";
  var today = "Today";
  i18n.getMessages([yesterday, today], function(results) {
    yesterday = results[yesterday];
    today = results[today];
  });
  var MINIMUM_TIME = 20 * 60 * 1000;

  function getMonthCount(date) {
    return (date.getFullYear() * 12 + date.getMonth());
  }

  function getDayCount(date) {
    return (date.getFullYear() * 365 + date.getMonth() * 30 + date.getDate());
  }

  function MessageBatch(messages, isLastBatchFn) {
    return {
      messages: messages,
      get firstMessage() {
        return this.messages[0];
      },
      get lastMessage() {
        return this.messages[this.messages.length - 1]
      },
      get batchID() {
        return this.firstMessage.sysID + "" + this.lastMessage.sysID;
      },
      get isFromPeer() {
        return !!this.firstMessage.isFromPeer;
      },
      get isSystemMessage() {
        return !!this.firstMessage.isSystemMessage;
      },
      get profileData() {
        return this.firstMessage.profileData;
      },
      get createdOn() {
        return this.lastMessage.createdOn;
      },
      get timestamp() {
        return this.lastMessage.timestamp;
      },
      get isLastBatch() {
        return isLastBatchFn(this);
      },
      get systemMessageLink() {
        if (this.lastMessage.hasSystemLink)
          return this.lastMessage.links[0];
      },
      getSeparator: function() {
        var timestamp = new Date(this.lastMessage.timestamp);
        var now = new Date();
        var hasYear = now.getFullYear() - timestamp.getFullYear() > 0;
        if (hasYear && getMonthCount(now) - getMonthCount(timestamp) > 12)
          return $filter('date')(timestamp, 'yyyy');
        var hasMonth = now.getMonth() - timestamp.getMonth() > 0;
        if ((hasMonth || hasYear) && getDayCount(now) - getDayCount(timestamp) > 30)
          return $filter('date')(timestamp, 'MMMM yyyy');
        var hasDay = now.getDate() - timestamp.getDate() > 0;
        if (hasMonth || hasYear || hasDay) {
          if (now.getDate() - timestamp.getDate() === 1)
            return yesterday;
          return $filter('date')(timestamp, 'longDate');
        }
        return today;
      }
    }
  }
  var messageBatchers = {};
  var ariaMessages = {};

  function compare(message1, message2) {
    if (message1.id && message2.id)
      return message1.id < message2.id ? -1 : 1;
    return message1.timestamp - message2.timestamp;
  }

  function MessageBatcher() {
    var messageBatchMap = {};
    var batches = [];

    function isLastBatchFn(batch) {
      return lastBatch() === batch;
    }

    function lastBatch() {
      return batches[batches.length - 1];
    }

    function add(message) {
      if (batches.length == 0) {
        insertNewBatch(0, [message]);
        return true;
      }
      var batch = messageBatchMap[message.sysID];
      if (batch) {
        update(batch, message);
        return false;
      }
      for (var i = 0; i < batches.length; ++i) {
        batch = batches[i];
        var insert = insertAt(batch, message);
        if (insert === "after")
          continue;
        if (insert === "before") {
          insertNewBatch(i, [message]);
          return true;
        }
        var isLast = (insert === batch.messages.length);
        if (isBatchable(batch, message)) {
          if (isLast) {
            var next = batches[i + 1];
            if (next && compare(message, next.firstMessage) > 0)
              continue;
          }
          batch.messages.splice(insert, 0, message);
          messageBatchMap[message.sysID] = batch;
          coalesce(i);
          return true;
        }
        if (insert === 0) {
          insertNewBatch(i, [message]);
          return true;
        }
        if (!isLast) {
          split(i, insert);
          insertNewBatch(i + 1, [message]);
          return true;
        }
      }
      insertNewBatch(batches.length, [message]);
      return true;
    }

    function update(batch, message) {
      if (message.isPlaceholder)
        return;
      for (var i = 0; i < batch.messages.length; ++i) {
        if (batch.messages[i].sysID === message.sysID) {
          batch.messages[i] = message;
          break;
        }
      }
    }

    function insertAt(batch, message) {
      if (!isInRange(message, batch.firstMessage))
        return "before";
      if (!isInRange(batch.lastMessage, message))
        return "after";
      var messages = batch.messages;
      for (var i = 0; i < messages.length; ++i) {
        if (compare(message, messages[i]) < 0)
          return i;
      }
      return messages.length;
    }

    function isBatchable(batch, message) {
      if (message.isSystemMessage)
        return false;
      var first = batch.firstMessage;
      return !first.isSystemMessage &&
        (message.profile === first.profile);
    }

    function mapMessageToBatch(batch, messages) {
      messages.forEach(function(message) {
        messageBatchMap[message.sysID] = batch;
      });
    }

    function coalesce(batchIndex) {
      var curr = batches[batchIndex];
      var remove = batchIndex + 1;
      var next = batches[remove];
      if (!next)
        return;
      if (!isBatchable(curr, next.firstMessage))
        return;
      if (!isInRange(curr.lastMessage, next.firstMessage))
        return;
      batches.splice(remove, 1);
      curr.messages = curr.messages.concat(next.messages);
      mapMessageToBatch(curr, next.messages);
    }

    function split(batchIndex, messageIndex) {
      var batch = batches[batchIndex];
      insertNewBatch(batchIndex + 1, batch.messages.slice(messageIndex));
      batch.messages = batch.messages.slice(0, messageIndex);
    }

    function insertNewBatch(batchIndex, messages) {
      var batch = new MessageBatch(messages, isLastBatchFn);
      batches.splice(batchIndex, 0, batch);
      mapMessageToBatch(batch, messages);
    }

    function isInRange(message1, message2) {
      return message1.timestamp + MINIMUM_TIME >= message2.timestamp;
    }

    function removeFromBatch(batch, messageIndex) {
      var messages = batch.messages;
      messages.splice(messageIndex, 1);
      var batchIndex = batches.indexOf(batch);
      var length = messages.length;
      if (length === 0) {
        batches.splice(batchIndex, 1);
        return;
      }
      if (messageIndex === length)
        return;
      var prev = messages[messageIndex - 1];
      if (!prev)
        return;
      var curr = messages[messageIndex];
      if (isInRange(prev, curr))
        return;
      split(batchIndex, messageIndex);
    }

    function remove(message) {
      var batch = messageBatchMap[message.sysID];
      if (!batch)
        return false;
      for (var i = 0; i < batch.messages.length; ++i) {
        if (batch.messages[i].sysID === message.sysID) {
          removeFromBatch(batch, i);
          break;
        }
      }
      delete messageBatchMap[message.sysID];
      return true;
    }

    function isSeparator(index) {
      var currTimestamp = new Date(batches[index].timestamp);
      if (index === 0) {
        var now = new Date();
        return getDayCount(now) - getDayCount(currTimestamp) > 0;
      }
      var prevTimestamp = new Date(batches[index - 1].timestamp);
      var hasYear = currTimestamp.getFullYear() - prevTimestamp.getFullYear() > 0;
      var hasMonth = currTimestamp.getMonth() - prevTimestamp.getMonth() > 0;
      var hasDay = currTimestamp.getDate() - prevTimestamp.getDate() > 0;
      return hasYear || hasMonth || hasDay;
    }
    return {
      get batches() {
        return batches;
      },
      get lastBatch() {
        return lastBatch();
      },
      isSeparator: isSeparator,
      addMessage: add,
      removeMessage: remove
    }
  }

  function add(message, results) {
    if (!message.conversationID)
      return results;
    var batcher = messageBatchers[message.conversationID];
    if (!batcher)
      batcher = messageBatchers[message.conversationID] = new MessageBatcher();
    var added = batcher.addMessage(message);
    if (added) {
      results.added.push(message);
      if (message.profile !== liveProfileID || message.isSystemMessage) {
        ariaMessages[message.conversationID] = ariaMessages[message.conversationID] || [];
        ariaMessages[message.conversationID].push(message);
        ariaMessages[message.conversationID].sort(compare);
      }
    } else {
      results.existing.push(message);
    }
    return results;
  }

  function remove(message, results) {
    var batcher = messageBatchers[message.conversationID];
    if (!batcher)
      return results;
    var removed = batcher.removeMessage(message);
    if (removed)
      results.push(message);
    return results;
  }

  function callActionFn(messages, isPlaceholder, results, fn) {
    if (angular.isArray(messages)) {
      messages
        .sort(compare)
        .forEach(function(message) {
          message.isPlaceholder = isPlaceholder;
          fn(message, results);
        });
      return results;
    }
    messages.isPlaceholder = isPlaceholder;
    return fn(messages, results);
  }
  return {
    addMessages: function(messages, doNotUpdate) {
      return callActionFn(messages, doNotUpdate, {
        added: [],
        existing: []
      }, add);
    },
    removeMessages: function(messages) {
      return callActionFn(messages, undefined, [], remove);
    },
    getBatcher: function(conversationID) {
      var batcher = messageBatchers[conversationID];
      if (!batcher)
        batcher = messageBatchers[conversationID] = new MessageBatcher();
      return batcher;
    },
    removeMessageBatcher: function(conversationID) {
      delete messageBatchers[conversationID];
      delete ariaMessages[conversationID];
    },
    clearAriaMessages: function(conversationID) {
      ariaMessages[conversationID] = [];
    },
    getAriaMessages: function(conversationID, count) {
      if (angular.isUndefined(count))
        count = 1;
      count = -Math.abs(count);
      ariaMessages[conversationID] = ariaMessages[conversationID] || [];
      return ariaMessages[conversationID].slice(count);
    },
    getLastMessage: function(conversationID) {
      var batcher = this.getBatcher(conversationID);
      var lastBatch = batcher.lastBatch;
      return lastBatch && lastBatch.lastMessage;
    },
    getFirstMessage: function(conversationID) {
      var batcher = this.getBatcher(conversationID);
      var firstBatch = batcher.batches[0];
      return firstBatch && firstBatch.firstMessage;
    },
    _wipeOut_: function() {
      messageBatchers = {};
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/message/service.unreadCount.js */
angular.module('sn.connect.message').service('unreadCountService', function(conversationPersister, messageBatcherService) {
  'use strict';
  var unreadCountObjects = {};

  function setCount(conversationID, lastViewed, count) {
    if (!conversationID)
      return;
    if (angular.isUndefined(lastViewed))
      return;
    unreadCountObjects[conversationID] = {
      timestamp: lastViewed,
      count: count
    }
  }

  function resetCount(conversationID, doNotPersist) {
    var batches = messageBatcherService.getBatcher(conversationID).batches;
    var lastMessageTime = (batches.length > 0) ?
      batches[batches.length - 1].lastMessage.timestamp :
      new Date().getTime();
    var old = unreadCountObjects[conversationID];
    unreadCountObjects[conversationID] = {
      timestamp: lastMessageTime
    };
    if (doNotPersist)
      return;
    if (old && (old.timestamp === lastMessageTime))
      return;
    conversationPersister.lastViewed(conversationID, lastMessageTime);
  }

  function getCount(conversationID) {
    var unreadCountObject = unreadCountObjects[conversationID];
    if (!unreadCountObject)
      return 0;
    var batches = messageBatcherService.getBatcher(conversationID).batches;
    var count = 0;
    batches.forEach(function(batch) {
      if (count > 0) {
        count += batch.messages.length;
        return;
      }
      if (unreadCountObject.timestamp < batch.lastMessage.timestamp) {
        var messages = batch.messages;
        for (var i = 0; i < messages.length; ++i) {
          if (unreadCountObject.timestamp < messages[i].timestamp) {
            count = messages.length - i;
            break;
          }
        }
      }
    });
    return unreadCountObject.count ?
      Math.max(count, unreadCountObject.count) :
      count;
  }

  function getTimestamp(conversationID) {
    var unreadCounts = unreadCountObjects[conversationID];
    return unreadCounts ?
      unreadCounts.timestamp :
      0;
  }
  return {
    set: setCount,
    get: getCount,
    reset: resetCount,
    getLastTimestamp: getTimestamp
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/message/service.messages.js */
angular.module('sn.connect.message').value('CONNECT_CONTEXT', Date.now() + "" + Math.random() * Math.pow(10, 19));
angular.module('sn.connect.message').service("messageService", function(
  $q, $rootScope, snHttp, amb, userID, liveProfileID, messageFactory, unreadCountService, messageBatcherService,
  uploadAttachmentService, CONNECT_CONTEXT, snNotification, $timeout, isLoggedIn, sessionID) {
  "use strict";
  var CONVERSATIONS_URL = isLoggedIn ? "/api/now/connect/conversations/" : "/api/now/connect/support/anonymous/conversations/";
  var context = CONNECT_CONTEXT;
  var allHistoryLoaded = {};
  var watches = [];
  var channelId = isLoggedIn ? userID : sessionID;
  amb.getChannel("/connect/message/" + channelId).subscribe(function(response) {
    addRawMessage(response.data);
  });
  amb.connect();

  function retrieveMessages(conversation, time) {
    if (!conversation)
      return $q.when([]);
    if (!conversation.sysID)
      return $q.when([]);
    if (conversation.isPending)
      return $q.when([]);
    if (time && allHistoryLoaded[conversation.sysID])
      return $q.when([]);
    var conversationID = conversation.sysID;
    var url = CONVERSATIONS_URL + conversationID + "/messages";
    if (time)
      url += "?before=" + time;
    return snHttp.get(url).then(function(response) {
      var processedMessages = [];
      angular.forEach(response.data.result, function(messageData) {
        processedMessages.push(messageFactory.fromObject(messageData));
      });
      if (time && processedMessages.length === 0)
        allHistoryLoaded[conversationID] = true;
      conversation.restricted = conversation.restricted || false;
      var added = messageBatcherService.addMessages(processedMessages).added;
      $rootScope.$broadcast('sn.TimeAgo.tick');
      return added;
    }, function(response) {
      if (response.status === 403)
        conversation.restricted = true;
      return $q.reject(response)
    });
  }

  function addRawMessage(messageData) {
    var message = messageFactory.fromObject(messageData);
    var isOldMessage = unreadCountService.getLastTimestamp(message.conversationID) > message.timestamp;
    $rootScope.$apply(function() {
      messageBatcherService.addMessages(message);
      $timeout(function() {
        $rootScope.$broadcast('sn.TimeAgo.tick');
      }, 0, false);
    });
    if (isOldMessage)
      return message;
    if (message.profileID === liveProfileID)
      return message;
    angular.forEach(watches, function(watch) {
      watch(message);
    });
    return message;
  }

  function send(message) {
    messageBatcherService.addMessages(message);
    unreadCountService.reset(message.conversationID, true);
    return snHttp.post(CONVERSATIONS_URL + message.conversationID + "/messages", {
      group: message.conversationID,
      message: message.text,
      reflected_field: message.reflectedField || "comments",
      attachments: message.attachmentSysIDs,
      context: context
    }).then(function(response) {
      var newMessage = messageFactory.fromObject(response.data.result);
      $rootScope.$evalAsync(function() {
        messageBatcherService.removeMessages(message);
        messageBatcherService.addMessages(newMessage);
        unreadCountService.reset(message.conversationID);
      });
      return newMessage;
    }, function(response) {
      if (response.status === 403)
        snNotification.show("error", response.data.result);
      return $q.reject(response)
    });
  }

  function uploadAttachments(conversation, fileList) {
    if (fileList.length === 0)
      return $q.when({});
    var files = [];
    for (var i = 0; i < fileList.length; ++i)
      files.push(fileList[i]);
    var message = messageFactory.newPendingAttachmentMessage(conversation, files);
    messageBatcherService.addMessages(message);
    unreadCountService.reset(message.conversationID, true);
    return uploadAttachmentService.attachFiles(conversation, files, {
      error: function(file) {
        $rootScope.$broadcast("connect.conversation.attachment_errors", {
          conversation: conversation,
          errors: [file.name + ": " + file.error]
        });
      }
    }).then(function(files) {
      var array = files.filter(function(file) {
        return !file.error;
      });
      if (array.length === 0) {
        messageBatcherService.removeMessages(message);
        return;
      }
      message.attachmentSysIDs = array.map(function(file) {
        return file.sysID;
      });
      var text = "";
      array.forEach(function(file) {
        text += "File: " + file.name + "\n";
      });
      message.text = text.trim();
      return message;
    });
  }
  return {
    retrieveMessages: retrieveMessages,
    uploadAttachments: uploadAttachments,
    send: send,
    watch: function(callback) {
      watches.push(callback)
    }
  };
});;;
/*! RESOURCE: /scripts/app.ng_chat/document/js_includes_connect_document.js */
/*! RESOURCE: /scripts/app.ng_chat/document/_module.js */
angular.module("sn.connect.document", []);;
/*! RESOURCE: /scripts/app.ng_chat/document/directive.snLinkCardList.js */
angular.module('sn.connect.document').directive('snLinkCardList', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('snLinkCardList.xml'),
    scope: {
      links: '='
    },
    controller: function($scope) {}
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/document/service.documentLinkMatcher.js */
angular.module('sn.connect.document').service('documentLinkMatcher', function() {
  "use strict";

  function match(str) {
    if (str.match) {
      return str.match(/([\w_]+).do\?sys_id=(\w{32})/);
    }
    return null;
  }
  return {
    isLink: function(href) {
      return match(href) !== null;
    },
    getRecordData: function(href) {
      var linkMatch = match(href);
      if (!linkMatch)
        return {}
      return {
        table: linkMatch[1],
        sysID: linkMatch[2]
      }
    }
  }
});
/*! RESOURCE: /scripts/app.ng_chat/document/service.documents.js */
angular.module('sn.connect.document').service('documentsService', function(
  $rootScope, $q, nowServer, snHttp, snCustomEvent, documentFactory, snConversationAsideHistory, inFrameSet) {
  'use strict';
  var documents = {};

  function getDocument(documentsSysID) {
    return documents[documentsSysID];
  }

  function retrieve(table, sysId) {
    if (!table || !sysId) {
      var deferred = $q.defer();
      deferred.reject("Invalid document parameters -- table: " + table + " sysId: " + sysId);
      return deferred.promise
    }
    var src = nowServer.getURL('record_data', 'table=' + table + '&sys_id=' + sysId);
    return snHttp.get(src).then(function(response) {
      var data = response.data;
      if (!data.sys_id)
        return;
      return documents[data.sys_id] = documentFactory.fromObject(data);
    });
  }

  function show(table, sysID) {
    if (!inFrameSet) {
      $rootScope.$broadcast("sn.aside.trigger_control", "record");
    } else {
      var url = (table === 'vtb_board') ?
        '/$vtb.do?sysparm_board=' + sysID :
        '/' + table + '.do?sys_id=' + sysID;
      snCustomEvent.fire('glide:nav_open_url', {
        url: url,
        openInForm: true
      });
    }
  }

  function create(conversation, data) {
    conversation.pendingRecord = true;
    var redirectUrl = encodeURIComponent('/$connect_record_created.do?sysparm_conversation=' + conversation.sysID +
      '&sysparm_table=' + data.table +
      '&sysparm_sys_id=$sys_id' +
      '&sysparm_nostack=yes');
    var url = data.table + '.do?sys_id=-1';
    if (data.view)
      url += ('&sysparm_view=' + data.view);
    url += ('&sysparm_goto_url=' + redirectUrl + '&sysparm_query=' + data.query + "&sysparm_clear_stack=true");
    if (inFrameSet) {
      snCustomEvent.fire('glide:nav_open_url', {
        url: url,
        openInForm: true
      })
    } else {
      var view = {
        template: '<sn-aside-frame name="pending_record" url="/' + url + '" title="New Record"></sn-aside-frame>',
        width: '50%',
        cacheKey: conversation.sysID + '.pending_record.' + data.table
      };
      $rootScope.$broadcast('sn.aside.open', view, "50%");
      snConversationAsideHistory.saveHistory(conversation.sysID, view);
    }
  }
  return {
    getDocument: getDocument,
    retrieve: retrieve,
    show: show,
    create: create
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/document/factory.Document.js */
angular.module('sn.connect.document').factory('documentFactory', function(liveLinkFactory) {
  "use strict";

  function getFieldByName(fields, name) {
    for (var i = 0; i < fields.length; i++)
      if (fields[i].name == name)
        return fields[i];
    return {};
  }

  function fromObject(data) {
    var fields = data.fields || [];
    var sysID = data.sys_id;
    var table = data.table;
    var number = getFieldByName(fields, 'number').displayValue;
    var url = (data.table === "vtb_board") ?
      '/' + "$vtb" + '.do?sysparm_board=' + data.sys_id :
      '/' + data.table + '.do?sys_id=' + data.sys_id + '&sysparm_nameofstack=' + data.sys_id;
    var link = liveLinkFactory.linkObject(url);
    return {
      get table() {
        return table;
      },
      get sysID() {
        return sysID;
      },
      get fields() {
        return fields;
      },
      get number() {
        return number;
      },
      get link() {
        return link;
      }
    };
  }
  return {
    fromObject: fromObject
  }
});;;
/*! RESOURCE: /scripts/app.ng_chat/util/js_includes_connect_util.js */
/*! RESOURCE: /scripts/app.ng_chat/util/_module.js */
angular.module("sn.connect.util", ["sn.connect.resource", "sn.common.attachments", "sn.common.accessibility"]);;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.connectConversationBarToggle.js */
angular.module('sn.connect').directive('connectConversationBarToggle', [
  'getTemplateUrl',
  function(getTemplateUrl) {
    "use strict";
    return {
      templateUrl: getTemplateUrl('connectConversationBarToggle.xml'),
      restrict: 'E',
      replace: true,
      controller: ['$scope', 'paneManager', function($scope, paneManager) {
        $scope.unreadMessages = 0;
        $scope.state = "closed";
        $scope.toggleConversationList = function() {
          paneManager.togglePane('connect:conversation_list', true);
        };
        CustomEvent.observe("connect:conversation_list:state", function(state) {
          $scope.state = state;
        });
        CustomEvent.observe('connect:message_notification.update', function(val) {
          $scope.unreadMessages = val;
        });
        $scope.formattedUnreadCount = function(count) {
          return (count <= 99) ? count : "99+";
        }
      }],
      link: function(scope, element) {
        scope.$on('pane.collapsed', function($event, position, isCollapsed, autoFocus) {
          if (isCollapsed && autoFocus) {
            element.focus();
          }
        });
      }
    }
  }
]);;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snConnectHeader.js */
angular.module('sn.connect').directive('snConnectHeader', function(getTemplateUrl, activeConversation) {
  'use strict';
  return {
    templateUrl: getTemplateUrl('snConnectHeader.xml'),
    restrict: 'E',
    replace: true,
    controller: function($scope) {
      var asideTab = 'members';
      $scope.toggleAside = function(side) {
        $scope.$root.$broadcast('connect.pane.toggle.' + side);
        if (side === 'right') {
          $scope.$root.$broadcast('sn.aside.trigger_control', asideTab);
        }
      };
      $scope.$on('sn.aside.trigger_control', function(event, newAsideTab) {
        asideTab = newAsideTab;
      });
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snConnectContent.js */
angular.module('sn.connect').directive('snConnectContent', function(getTemplateUrl) {
  'use strict';
  return {
    templateUrl: getTemplateUrl('snConnectContent.xml'),
    restrict: 'E',
    replace: true,
    transclude: true,
    link: function(scope) {
      function togglePane(pane) {
        return function() {
          if (scope.activePane !== pane)
            scope.activePane = pane;
          else
            delete scope.activePane;
        };
      }

      function closePane() {
        delete scope.activePane;
      }
      scope.$on('connect.pane.toggle.left', togglePane('left'));
      scope.$on('connect.pane.toggle.right', togglePane('right'));
      scope.$on('connect.pane.close', closePane);
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snActions.js */
angular.module('sn.connect.util').directive('snActions', function(getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl("snActions.xml"),
    replace: true
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snActionsMenu.js */
angular.module("sn.connect.util").directive("snActionsMenu", function(getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl("snActionsMenu.xml"),
    scope: {
      conversation: "="
    },
    replace: true,
    link: function(scope, elem) {
      if (elem.hideFix)
        elem.hideFix();
    },
    controller: function($scope, $timeout, $rootScope) {
      $scope.runAction = function($event, chatAction) {
        if (chatAction.isActive) {
          $event.preventDefault();
          $event.stopPropagation();
          return;
        }
        if (chatAction.requiresArgs) {
          $timeout(function() {
            $scope.conversation.chatActions.currentAction = chatAction;
            $scope.$emit("connect.chat_action.require_options", $scope.conversation);
          }, 0, false)
        } else {
          chatAction.trigger($scope.conversation);
        }
      };
      $scope.addAttachment = function() {
        $rootScope.$broadcast("connect.attachment_dialog.open", $scope.conversation.sysID);
      }
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snDropTargetPopup.js */
angular.module("sn.connect.util").directive("snDropTargetPopup", function(getTemplateUrl, $window) {
  "use strict";
  return {
    restrict: "E",
    templateUrl: getTemplateUrl('snDropTargetPopup.xml'),
    replace: true,
    scope: {
      conversation: "="
    },
    link: function(scope, element) {
      var messageElement = element.find(".drop-target-message");
      scope.showDropTarget = false;
      scope.$on("connect.drop_target_popup.show", function(e, conversationID) {
        if ($window.navigator.userAgent.indexOf("Firefox") > -1)
          return;
        if (conversationID !== scope.conversation.sysID)
          return;
        scope.showDropTarget = true;
        element.css({
          "z-index": 10
        });
        element.velocity({
          opacity: 1
        }, {
          duration: 300,
          easing: "easeOutCubic"
        });
        messageElement.velocity({
          "padding-top": "0px"
        }, {
          duration: 300,
          easing: "easeOutCubic"
        });
      });
      scope.$on("connect.drop_target_popup.hide", function(e, conversationID) {
        if ($window.navigator.userAgent.indexOf("Firefox") > -1)
          return;
        if (conversationID !== scope.conversation.sysID)
          return;
        element.velocity({
          opacity: 0
        }, {
          duration: 300,
          easing: "easeOutCubic",
          complete: function() {
            scope.showDropTarget = false;
            element.css({
              "z-index": -1
            })
          }
        });
        messageElement.velocity({
          paddingTop: "40px"
        }, {
          duration: 300,
          easing: "easeOutCubic"
        });
      });
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snLoadingBar.js */
angular.module('sn.connect.util').directive('snLoadingBar', function() {
  "use strict";
  return {
    restrict: 'E',
    template: "<div class='sn-loading-bar'></div>",
    replace: true,
    link: function(scope, element) {
      scope.$on("connect.loading-bar.start", function() {
        element.velocity({
          width: 90 + "%"
        }, {
          easing: "linear",
          duration: 450
        });
      });
      scope.$on("connect.loading-bar.finish", function() {
        element.velocity({
          width: 100 + "%"
        }, {
          easing: "linear",
          duration: 50
        }).velocity({
          opacity: 0
        }, {
          easing: "linear",
          duration: 300
        }).velocity({
          width: 0,
          opacity: 1
        }, {
          duration: 0
        })
      });
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snPulse.js */
angular.module('sn.connect.util').directive('snPulse', function($timeout) {
  "use strict";
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var timeouts = scope.pulseTimeouts ? angular.fromJson(attrs.pulseTimeouts) : [10000, 10000, 10000, 10000];
      var classes = ['pulse-off', 'pulse-positive', 'pulse-warning', 'pulse-danger'];
      var index = 0;
      var timeout;
      var enabled = true;
      scope.$watch(function() {
        return attrs.pulseEnabled;
      }, function() {
        enabled = attrs.pulseEnabled === 'true';
        if (!enabled) {
          $timeout.cancel(timeout);
          element.removeClass(classes.join(' '));
        }
      });
      scope.$watch(function() {
        return attrs.pulseTimestamp;
      }, function() {
        index = 0;
        $timeout.cancel(timeout);
        if (attrs.pulseTimestamp && enabled) {
          var start = parseInt(attrs.pulseTimestamp, 10);
          var now = Date.now();
          var diff = now - start;
          var elapsedTime = 0;
          for (var i = 0; i < timeouts.length; i++) {
            if (diff >= elapsedTime) {
              index = i;
              elapsedTime += timeouts[i];
            }
          }
          updateClass();
        }
      });

      function updateClass() {
        element.removeClass(classes.join(' '));
        if (index > 0) {
          element.addClass(classes[index]);
        }
        if (index < timeouts.length - 1) {
          timeout = $timeout(updateClass, timeouts[index + 1]);
          index++;
        }
      }
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.liveIntroduction.js */
angular.module('sn.connect').directive('liveIntroduction', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('liveIntroduction.xml'),
    replace: true,
    scope: {},
    controller: function($scope, activeConversation) {
      $scope.activeConversation = activeConversation;
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/service.messageNotifier.js */
angular.module('sn.connect.util').service('messageNotifier', function(
  $window, $q, snNotifier, i18n, profiles, pageLoadTimestamp, liveProfileID, snTabActivity,
  conversations, userPreferences, notificationPreferences, activeConversation, messageService, titleFlasher) {
  "use strict";
  var lastMessageTime = pageLoadTimestamp || 0;
  var glideNotificationText;
  var securedLinkNotificationText;
  i18n.getMessages(["New Message From {0}: {1}", "You don't have permission to access this document/content"],
    function(results) {
      glideNotificationText = results["New Message From {0}: {1}"];
      securedLinkNotificationText = results["You don't have permission to access this document/content"];
    });

  function notify(message) {
    var shouldExit = !(message.isFromPeer || message.isSystemMessage) ||
      messageIsOlderThanMostRecentNotification(message);
    if (shouldExit)
      return;
    if (!notificationPreferences.globalPreferences.desktop)
      return;
    lastMessageTime = message.timestamp + 1;
    if (!snTabActivity.isPrimary)
      return;
    var promises = [];
    var allowWebNotifications = false;
    var conversationID = message.conversationID;
    promises.push(userPreferences.getPreference("connect.notifications.desktop").then(function(value) {
      allowWebNotifications = angular.isString(value) ? value === "true" : value;
    }));
    $q.all(promises).then(function() {
      if (!allowWebNotifications)
        return;
      var preferences = notificationPreferences.get(message.conversationID);
      if (preferences.desktop === "off")
        return;
      if (preferences.desktop === "mention") {
        if (!message.mentions || message.mentions.length === 0)
          return;
        var mentioned = message.mentions.some(function(mention) {
          return mention.mention === liveProfileID;
        });
        if (!mentioned)
          return;
      }
      if (message.isSystemMessage && !preferences.systemMessage)
        return;
      titleFlasher.flash();
      var notifyAvatar = null;
      conversations.get(conversationID).then(function(conversation) {
        var promise;
        if (message.conversationID && message.isSystemMessage) {
          var profile = (conversation.profileData || conversation.profile);
          if (profile)
            promise = $q.when(profile.name);
          else {
            promise = profiles.getAsync(message.profile).then(function(profile) {
              return (profile && profile.name) ? profile.name : "Unknown User";
            });
          }
        } else {
          promise = profiles.getAsync(message.profile).then(function(profile) {
            if (conversation.isGroup) {
              notifyAvatar = conversation.avatar || null;
              return (profile && profile.name) ? profile.name + " in " + conversation.name : "Unknown User" + " in " + conversation.name;
            } else {
              notifyAvatar = profile.avatar || null;
              return (profile && profile.name) ? profile.name : "Unknown User";
            }
          });
        }
        promise.then(function(title) {
          var body;
          if (snNotifier().canUseNativeNotifications()) {
            body = message.cleanText;
          } else {
            body = glideNotificationText.replace(/\{0\}/, title).replace(/\{1\}/, message.cleanText);
          }
          snNotifier().notify(title, {
            body: body,
            lifespan: 7000,
            icon: notifyAvatar || '/native_notification_icon.png',
            tag: message.sysID,
            onClick: function() {
              activeConversation.conversation = conversation;
            }
          });
        });
      });
    });
  }

  function messageIsOlderThanMostRecentNotification(message) {
    return message.timestamp < lastMessageTime;
  }
  return {
    notify: notify,
    registerMessageServiceWatch: function(additionalRequirements) {
      messageService.watch(function(message) {
        if (activeConversation.sysID === message.conversationID &&
          snTabActivity.idleTime < snTabActivity.defaultIdleTime &&
          snTabActivity.isVisible)
          return;
        if (angular.isFunction(additionalRequirements) && !additionalRequirements(message))
          return;
        notify(message);
      });
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/service.audioNotifier.js */
angular.module('sn.connect.util').service('audioNotifier', function(
  notifySound, $timeout, messageService, snTabActivity, pageLoadTimestamp,
  notificationPreferences, userPreferences, $q, liveProfileID) {
  "use strict";
  var audio = new Audio(notifySound),
    AUDIO_COOLDOWN = Math.max(1000, (audio.duration * 1000 + 100)),
    cdTimer,
    notifyQueued = false,
    notifyAvailable = true,
    lastMessageTime = pageLoadTimestamp || 0;

  function notify(message) {
    if (angular.isString(message))
      message = {
        conversationID: message,
        timestamp: lastMessageTime + 1
      };
    if (message.timestamp < lastMessageTime)
      return;
    if ('isFromPeer' in message && !message.isFromPeer)
      return;
    if (!notifyAvailable)
      return notifyQueued = true;
    lastMessageTime = message.timestamp + 1;
    if (!snTabActivity.isPrimary)
      return;
    notifyAvailable = false;
    notifyQueued = false;
    var promises = [],
      allowAudioNotifications = false;
    promises.push(userPreferences.getPreference("connect.notifications.audio").then(function(value) {
      allowAudioNotifications = angular.isString(value) ? value === "true" : value;
    }));
    $q.all(promises).then(function() {
      if (!allowAudioNotifications)
        return;
      if (message.conversationID) {
        var preferences = notificationPreferences.get(message.conversationID);
        if (preferences.audio === "off")
          return;
        if (preferences.audio === "mention") {
          if (!message.mentions || message.mentions.length === 0)
            return;
          var mentioned = message.mentions.some(function(mention) {
            return mention.mention = liveProfileID;
          });
          if (!mentioned)
            return;
        }
      }
      audio.play();
      cdTimer = $timeout(function() {
        notifyAvailable = true;
        if (notifyQueued)
          notify(message);
      }, AUDIO_COOLDOWN, false);
    });
  }
  return {
    notify: notify,
    registerMessageServiceWatch: function(activeConversation, additionalRequirements) {
      messageService.watch(function(message) {
        if ((!activeConversation.sysID || activeConversation.sysID === message.conversationID) &&
          snTabActivity.idleTime < snTabActivity.defaultIdleTime &&
          snTabActivity.isVisible)
          return;
        if (angular.isFunction(additionalRequirements) && !additionalRequirements(message))
          return;
        notify(message);
      });
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/service.uploadAttachment.js */
angular.module('sn.connect.util').service('uploadAttachmentService', function(
  $q, $rootScope, $timeout, snAttachmentHandler, maxAttachmentSize, liveProfileID, i18n, screenReaderStatus) {
  "use strict";
  var MAX_SIZE = maxAttachmentSize * 1024 * 1024;
  var attachmentHandlers = [];
  var filesInProgress = [];
  var uploadSuccess = "{0} successfully uploaded";
  var uploadFailure = "Failed to upload {0}: {1}";
  i18n.getMessages([uploadSuccess, uploadFailure], function(results) {
    uploadSuccess = results[uploadSuccess];
    uploadFailure = results[uploadFailure];
  });

  function remove(file) {
    var index = filesInProgress.indexOf(file);
    if (index < 0)
      return;
    return filesInProgress.splice(index, 1)[0];
  }

  function apply(fileFns, fnType, file) {
    var fn = fileFns[fnType];
    if (fn)
      fn(file);
    file.state = fnType;
    $rootScope.$broadcast('attachments_list.upload.' + fnType, file);
  }

  function progress(fileFns, file, loaded, total) {
    total = total || file.size;
    if (angular.isDefined(loaded)) {
      file.loaded = loaded;
      file.progress = Math.min(100.0 * loaded / total, 100.0);
    } else {
      file.loaded = total;
      file.progress = 100.0;
    }
    apply(fileFns, "progress", file);
  }

  function getAttachmentHandler(conversation) {
    var sysID = conversation.sysID;
    var attachmentHandler = attachmentHandlers[sysID];
    if (!attachmentHandler)
      attachmentHandler = attachmentHandlers[sysID] = conversation.isPending ?
      snAttachmentHandler.create("live_profile", liveProfileID) :
      snAttachmentHandler.create("live_group_profile", sysID);
    return attachmentHandler;
  }

  function attachFile(conversation, file, fileFns) {
    if (file.size > MAX_SIZE) {
      file.error = file.name + ' size exceeds the limit of ' + maxAttachmentSize + ' MB';
      apply(fileFns, "error", file);
      return $q.when(file);
    }
    filesInProgress.push(file);
    apply(fileFns, "start", file);
    progress(fileFns, file, 0);
    return getAttachmentHandler(conversation).uploadAttachment(file, null, {
      progress: function(event) {
        progress(fileFns, event.config.file, event.loaded, event.total);
      }
    }).then(function(response) {
      remove(file);
      file.sysID = response.sys_id;
      progress(fileFns, file);
      apply(fileFns, "success", file);
      screenReaderStatus.announce(i18n.format(uploadSuccess, file.name));
      return file;
    }, function(errorMessage) {
      remove(file);
      file.error = errorMessage;
      apply(fileFns, "error", file);
      screenReaderStatus.announce(i18n.format(uploadFailure, file.name, errorMessage));
      return file;
    });
  }

  function openFileSelector($event) {
    $event.stopPropagation();
    var target = angular.element($event.currentTarget);
    $timeout(function() {
      target.parent().find('input').click();
    });
  }
  return {
    get filesInProgress() {
      return Object.keys(filesInProgress).map(function(key) {
        return filesInProgress[key];
      });
    },
    attachFiles: function(conversation, files, fileFns) {
      fileFns = fileFns || {};
      var promises = [];
      angular.forEach(files, function(file) {
        promises.push(attachFile(conversation, file, fileFns));
      });
      return $q.all(promises);
    },
    openFileSelector: openFileSelector
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/service.fileSizeConverter.js */
angular.module("sn.connect.util").service("fileSizeConverter", function() {
  "use strict";
  return {
    getByteCount: function(bytes, precision) {
      if (bytes.slice(-1) === 'B')
        return bytes;
      var kb = 1024;
      var mb = kb * 1024;
      var gb = mb * 1024;
      if ((bytes >= 0) && (bytes < kb))
        return bytes + ' B';
      else if ((bytes >= kb) && (bytes < mb))
        return (bytes / kb).toFixed(precision) + ' KB';
      else if ((bytes >= mb) && (bytes < gb))
        return (bytes / mb).toFixed(precision) + ' MB';
      else if (bytes >= gb)
        return (bytes / gb).toFixed(precision) + ' GB';
      else
        return bytes + ' B';
    }
  };
});
/*! RESOURCE: /scripts/app.ng_chat/util/service.notificationPreferences.js */
angular.module('sn.common.glide').factory("notificationPreferences", function(
  snHttp, $q, amb, unwrappedHTTPPromise, snNotifier, initGlobalNotificationPreferences, urlTools, snCustomEvent, isLoggedIn) {
  "use strict";
  var BASE_URL = isLoggedIn ? "/api/now/connect/conversations/" : "/api/now/connect/support/anonymous/conversations/";
  var preferencesCache = {};

  function fromGlobalObject(rawGlobalPreference) {
    function update(field, preferenceValue) {
      rawGlobalPreference[field] = preferenceValue;
      var eventName = 'connect.notifications.' + field;
      var targetURL = urlTools.getURL('user_preference', {
        "sysparm_pref_name": eventName,
        "sysparm_action": "set",
        "sysparm_pref_value": "" + !!preferenceValue
      });
      snHttp.get(targetURL).then(function() {
        snCustomEvent.fireAll(eventName + '.update', preferenceValue);
      });
    }
    snCustomEvent.on('connect.notifications.mobile.update', function(newVal) {
      rawGlobalPreference.mobile = newVal;
    });
    snCustomEvent.on('connect.notifications.desktop.update', function(newVal) {
      rawGlobalPreference.desktop = newVal;
      updateDesktopNotificationPermission();
    });
    snCustomEvent.on('connect.notifications.email.update', function(newVal) {
      rawGlobalPreference.email = newVal;
    });
    snCustomEvent.on('connect.notifications.audio.update', function(newVal) {
      rawGlobalPreference.audio = newVal;
    });

    function updateDesktopNotificationPermission() {
      if (!rawGlobalPreference.desktop)
        return;
      if (snNotifier().canUseNativeNotifications())
        return;
      snNotifier().requestNotificationPermission();
    }
    updateDesktopNotificationPermission();
    return {
      get mobile() {
        return rawGlobalPreference.mobile
      },
      get desktop() {
        return rawGlobalPreference.desktop;
      },
      get email() {
        return rawGlobalPreference.email;
      },
      get audio() {
        return rawGlobalPreference.audio;
      },
      set mobile(value) {
        return update('mobile', value);
      },
      set desktop(value) {
        return update('desktop', value);
      },
      set email(value) {
        return update('email', value);
      },
      set audio(value) {
        return update('audio', value);
      }
    }
  }
  var globalPreferences = fromGlobalObject(initGlobalNotificationPreferences);

  function fromObject(rawPreferences) {
    function update(field, value) {
      rawPreferences[field] = value;
      if (rawPreferences.loading)
        return;
      snHttp.post(BASE_URL + rawPreferences.sys_id + "/notifications", rawPreferences).then(function(response) {
        addRaw(response.data.result);
      });
    }
    return {
      get loading() {
        return rawPreferences.loading;
      },
      get mobile() {
        return rawPreferences.push_notification_preference;
      },
      get desktop() {
        return rawPreferences.browser_notification_preference;
      },
      get email() {
        return rawPreferences.email_notification_preference;
      },
      get audio() {
        return rawPreferences.audio_notification_preference;
      },
      get canEmail() {
        return rawPreferences.can_email;
      },
      get systemMessage() {
        return rawPreferences.system_message_notification_preference;
      },
      set mobile(value) {
        update('push_notification_preference', value);
      },
      set desktop(value) {
        update('browser_notification_preference', value);
      },
      set email(value) {
        update('email_notification_preference', value);
      },
      set audio(value) {
        update('audio_notification_preference', value);
      },
      set canEmail(value) {
        update('can_email', value);
      },
      set systemMessage(value) {
        update('system_message_notification_preference', value);
      }
    }
  }

  function getPreferences(conversationID) {
    if (!preferencesCache[conversationID]) {
      addRaw({
        sys_id: conversationID,
        push_notification_preference: 'all',
        browser_notification_preference: 'all',
        email_notification_preference: 'all',
        audio_notification_preference: 'all',
        can_email: true,
        system_message_notification_preference: true,
        loading: true
      });
      snHttp.get(BASE_URL + conversationID + "/notifications").then(function(response) {
        addRaw(response.data.result);
      });
    }
    return preferencesCache[conversationID];
  }

  function addRaw(preference) {
    preferencesCache[preference.sys_id] = fromObject(preference);
  }
  return {
    get: getPreferences,
    addRaw: addRaw,
    globalPreferences: globalPreferences
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snAutoScroll.js */
angular.module("sn.connect.util").directive('snAutoScroll', function($timeout, $window, $q, inFrameSet, activeConversation) {
  "use strict";

  function throttle(func, wait) {
    var initialCall = true,
      deferred = $q.defer(),
      timerId;
    if (typeof func != 'function') {
      return;
    }

    function throttled() {
      if (timerId) {
        return;
      }
      if (initialCall) {
        initialCall = false;
        deferred.resolve(func());
        return deferred.promise;
      }
      timerId = $timeout(function() {
        timerId = undefined;
        deferred.resolve(func());
      }, wait, false);
      return deferred.promise;
    }
    return throttled;
  }
  return {
    restrict: 'A',
    scope: {
      onScrollToTop: "&"
    },
    link: function(scope, element) {
      var HISTORY_THROTTLE_MS = 100;
      var SCROLL_THROTTLE_MS = 500;
      var RESIZE_THROTTLE_MS = 500;
      var STICKY_ZONE_HEIGHT = 32;
      var shouldStick = true;
      var activeTopRequest = false;
      var resizeTrigger = false;
      var el = element[0];
      var prevScrollPos = el.scrollTop;
      var lastScrollHeight = el.scrollHeight;
      var onScrollTop, heightAdjustUnwatch;

      function enforceSticky() {
        if (shouldStick) {
          el.scrollTop = el.scrollHeight;
        }
      }

      function forceScroll() {
        shouldStick = true;
        enforceSticky();
      }
      var scrollHandler = throttle(function() {
        if (resizeTrigger) {
          resizeTrigger = false;
          return;
        }
        var scrollPos = el.scrollTop;
        var scrollHeight = el.scrollHeight;
        var scrollUp = prevScrollPos > scrollPos;
        prevScrollPos = scrollPos;
        if (scrollUp) {
          shouldStick = false;
          if (angular.isFunction(scope.onScrollToTop) && !onScrollTop) {
            onScrollTop = throttle(scope.onScrollToTop, HISTORY_THROTTLE_MS);
          }
          if (scrollPos === 0) {
            var oldScrollHeight = scrollHeight;
            if (!activeTopRequest) {
              activeTopRequest = true;
              var topBatch = element.find(".sn-feed-message-holder:first-child");
              var topBatchLastMessage = topBatch.scope().batch.lastMessage;
              onScrollTop().finally(function(result) {
                activeTopRequest = false;
                if (!heightAdjustUnwatch) {
                  heightAdjustUnwatch = scope.$on("ngRepeat.complete", function() {
                    var heightAdjust = 0;
                    var potentialConflict = topBatch.prev();
                    var newTopBatch = element.find(".sn-feed-message-holder:first-child");
                    if (potentialConflict.length && potentialConflict.scope().batch.lastMessage.sysID === topBatchLastMessage.sysID) {
                      heightAdjust = topBatch[0].clientHeight;
                    } else if (topBatch[0] !== newTopBatch[0]) {
                      heightAdjust = topBatch.find('.sn-feed-message_date').outerHeight(true);
                    }
                    el.scrollTop = el.scrollHeight - oldScrollHeight - heightAdjust;
                    heightAdjustUnwatch();
                    heightAdjustUnwatch = void(0);
                  });
                }
                return result;
              });
            }
          }
          return;
        }
        if (scrollPos + el.clientHeight + STICKY_ZONE_HEIGHT >= scrollHeight) {
          shouldStick = true;
          enforceSticky();
        }
        lastScrollHeight = scrollHeight;
      }, SCROLL_THROTTLE_MS);
      var resizeHandler = throttle(function() {
        resizeTrigger = true;
        if (el.scrollTop <= STICKY_ZONE_HEIGHT) {
          shouldStick = true;
        }
        enforceSticky();
      }, RESIZE_THROTTLE_MS);
      el.scrollTop = el.scrollHeight;
      $timeout(function() {
        el.scrollTop = el.scrollHeight;
        prevScrollPos = el.scrollTop;
      }, 0, false);
      angular.element(el).on('scroll', scrollHandler);
      angular.element($window).on('resize', resizeHandler);
      scope.$on('connect.auto_scroll.scroll_to_bottom', forceScroll);
      scope.$on('connect.auto_scroll.jump_to_bottom', forceScroll);
      scope.$watch(enforceSticky);
      if (!inFrameSet)
        scope.$watch(function() {
          return activeConversation.sysID;
        }, function(newVal, oldVal) {
          if (newVal === oldVal)
            return;
          forceScroll();
        });
      scope.$on("$destroy", function() {
        angular.element(el).off('scroll', scrollHandler);
        angular.element($window).off('resize', resizeHandler);
      });
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snClickToEdit.js */
angular.module('sn.connect.util').directive('snClickToEdit', function($timeout, getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    scope: {
      currText: "=text",
      onSaveText: "&onsavetext",
      canEdit: "=condition"
    },
    transclude: true,
    templateUrl: getTemplateUrl("snClickToEdit.xml"),
    replace: true,
    controller: function($scope) {
      $scope.editingText = false;
      $scope.inputClick = function($event) {
        $event.stopPropagation();
        if (!$scope.canEdit) return;
        $scope.editingText = true;
        $scope.prevText = $scope.currText;
      }
      $scope.saveText = function() {
        if (!$scope.editingText || ($scope.prevText === $scope.currText) || !$scope.canEdit) {
          $scope.editingText = false
          return;
        }
        $scope.editingText = false;
        if ($scope.onSaveText) $scope.onSaveText({
          text: $scope.currText
        });
      }
      $scope.cancelEdit = function() {
        $scope.editingText = false;
        $scope.currText = $scope.prevText;
      }
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snEscape.js */
angular.module('sn.connect.util').directive('snEscape', function() {
  'use strict';
  return function(scope, element, attrs) {
    element.bind("keyup", function(event) {
      if (event.which !== 27)
        return;
      scope.$apply(function() {
        scope.$eval(attrs.snEscape);
      });
      event.preventDefault();
    });
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snFocusOnConversation.js */
angular.module('sn.connect.util').directive('snFocusOnConversation', function($timeout, $parse, $window, activeConversation) {
  'use strict';
  return {
    restrict: "A",
    link: function(scope, element, attr) {
      if (attr.disableAutofocus)
        return;
      scope.snFocusOnConversation = $parse(attr.snFocusOnConversation)(scope);
      scope.$watch(function() {
        return activeConversation.conversation;
      }, function(conversation) {
        if (window.getSelection().toString() !== "")
          return;
        if (!scope.snFocusOnConversation)
          return;
        if (!conversation)
          return;
        if (conversation.sysID !== scope.snFocusOnConversation.sysID)
          return;
        $timeout(function() {
          focusOnMessageInput();
        });
      });

      function focusOnMessageInput() {
        if ($window.ontouchstart)
          return;
        $timeout(function() {
          element.focus();
        });
      }
      focusOnMessageInput();
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snLoadingIndicator.js */
angular.module('sn.connect.util').directive('snLoadingIndicator', function(getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    scope: {
      active: "="
    },
    transclude: true,
    templateUrl: getTemplateUrl("snLoadingIndicator.xml"),
    replace: true
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snOnload.js */
angular.module('sn.connect.util').directive('snOnload', function() {
  return {
    scope: {
      callBack: '&snOnload'
    },
    link: function(scope, element) {
      element.on('load', function() {
        scope.callBack();
        scope.$apply();
      });
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snOptions.js */
angular.module('sn.connect.util').directive('snOptions', function(getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl("snOptions.xml"),
    replace: true
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snPane.js */
angular.module('sn.connect.util').directive('snPane', function($timeout, getTemplateUrl, paneManager) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    templateUrl: getTemplateUrl('snPane.xml'),
    scope: {
      paneCollapsed: '=',
      panePosition: '@',
      paneResizeable: '@',
      paneWidth: '=',
      paneToggle: '@'
    },
    link: function(scope, element) {
      var scrollPromise;
      var mouseHeldDown = false;
      var mouseClicked = true;
      scope.toggleConversationList = function($event) {
        if ($event && $event.keyCode === 9)
          return;
        paneManager.togglePane('connect:conversation_list', true);
      };
      scope.$watch('paneWidth', function() {
        if (scope.paneWidth) {
          element.width(scope.paneWidth);
        }
      });
      scope.isMobile = function() {
        return angular.element('html').width() <= 800;
      };
      scope.scrollMousedown = function(moveBy) {
        scrollPromise = $timeout(function() {
          mouseHeldDown = true;
          mouseClicked = false;
          updateScrollPosition(moveBy);
        }, 300);
      };
      scope.scrollMouseup = function() {
        $timeout.cancel(scrollPromise);
        scrollPromise = void(0);
        if (!mouseClicked) {
          mouseHeldDown = false;
        }
      };
      scope.scrollUpCick = function() {
        if (mouseClicked) {
          var scrollContainer = element.find('.pane-scroll-container');
          updateScrollPosition(-scrollContainer.height());
        }
        mouseClicked = true;
        mouseHeldDown = false;
      };
      scope.scrollDownCick = function() {
        if (mouseClicked) {
          var scrollContainer = element.find('.pane-scroll-container');
          updateScrollPosition(scrollContainer.height());
        }
        mouseClicked = true;
        mouseHeldDown = false;
      };
      scope.openConnect = function($event) {
        $event.stopPropagation();
        if ($event && $event.keyCode === 9)
          return;
        window.open("$c.do", "_blank");
      };

      function updateScrollPosition(moveBy) {
        var scrollContainer = element.find('.pane-scroll-container');
        scrollContainer.animate({
          scrollTop: scrollContainer[0].scrollTop + moveBy
        }, 300, 'linear', function() {
          if (mouseHeldDown) {
            updateScrollPosition(moveBy);
          }
        });
      }

      function updateScrollButtons() {
        var scrollContainer = element.find('.pane-scroll-container');
        if (scope.paneCollapsed && !scope.isMobile() && scrollContainer.get(0)) {
          if (scrollContainer.outerHeight() < scrollContainer.get(0).scrollHeight) {} else {}
        } else {}
      }
      scope.togglePane = function() {
        scope.paneCollapsed = !scope.paneCollapsed;
        scope.$root.$broadcast('pane.collapsed', scope.panePosition, scope.paneCollapsed);
        updateScrollButtons();
      }
      angular.element(window).on('resize', function() {
        updateScrollButtons();
      });
      $timeout(updateScrollButtons);
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snPaneManager.js */
angular.module('sn.connect.util').directive('snPaneManager', function() {
  'use strict';
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      scope.resourcePaneClass = attrs.snPaneManager;
      scope.resourcePaneClasses = {
        'closed': 'pane-closed',
        'large': 'pane-large large-resource-pane',
        'compact': 'pane-compact compact-resource-pane'
      };
      scope.$on('conversation.resource.open', function($evt, data) {
        scope.$broadcast('conversation.resource.show', data);
        scope.resizePane(data.type);
      });
      scope.$on('conversation.resource.close', function() {
        scope.resizePane('closed');
      });
      scope.resizePane = function(type) {
        angular.forEach(scope.resourcePaneClasses, function(resourcePaneClass) {
          element.removeClass(resourcePaneClass);
        });
        scope.resourcePaneClass = scope.resourcePaneClasses[type || 'closed'];
        element.addClass(scope.resourcePaneClass);
      };
      scope.resizePane(attrs.snPaneManager);
    }
  }
});
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snPod.js */
angular.module('sn.connect.util').directive('snPod', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl("snPod.xml"),
    replace: true,
    scope: {
      user: '=',
      label: '=label',
      showLabel: '=showLabel',
      removeTitle: '@removeTitle',
      removeClick: '&removeClick'
    },
    controller: function($scope) {
      $scope.onRemove = function($event) {
        if ($scope.removeClick) {
          $event.stopPropagation();
          $scope.removeClick({
            $event: $event
          });
        }
      };
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snPopOver.js */
angular.module('sn.connect.util').directive('snPopover', function($window, $rootScope) {
  'use strict';
  if ($window.jQuery)
    $window.jQuery('html').on('click', function(e) {
      $rootScope.$broadcast("popover-html-click", e);
    });
  return {
    restrict: 'A',
    scope: {
      options: '=snPopover',
      enabled: '=snPopoverEnabled'
    },
    link: function(scope, element) {
      scope.popoverID = scope.$id;

      function getContent() {
        if (!$content) {
          if (angular.isObject(scope.options) && scope.options.target) {
            $content = angular.element(scope.options.target).detach().show();
          } else if (typeof scope.options == "string") {
            $content = angular.element(scope.options).detach().show();
          } else {
            $content = element.siblings('.popover-body').eq(0).detach().show();
          }
        }
        return $content;
      }
      var $content = getContent();
      if (!angular.element('html').hasClass('touch')) {
        if (scope.options && scope.options.popoverID)
          scope.popoverID = scope.options.popoverID;
        var options = {
          placement: 'left',
          html: true,
          content: getContent,
          container: 'body',
          template: '<div scope-id="' + scope.popoverID + '" class="popover" role="tooltip" onClick="event.stopPropagation();"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
          trigger: 'hover',
          hideOnBlur: true,
          onShow: function() {},
          onHide: function() {}
        };
        angular.extend(options, scope.options);
        var oldHide = element[0].hide;
        if (oldHide) {
          element[0].prototypeHide = oldHide;
          element[0].hide = function() {
            if (!jQuery.event.triggered && this.prototypeHide) {
              this.prototypeHide();
            }
          }
        }
        if (!element.popover)
          return;
        scope.$popover = element.popover(options);
        scope.$popover.on("hidden.bs.popover", function(e) {
          options.onHide(e);
        });
        scope.$popover.on("shown.bs.popover", function(e) {
          options.onShow(e);
        });
        scope.$watch('enabled', function() {
          element.popover(scope.enabled || scope.enabled == undefined ? 'enable' : 'disable');
        });
        scope.$on('$destroy', function() {
          angular.element('[scope-id=' + scope.popoverID + ']').remove();
        });
        scope.$on('popover-html-click', function($evt, e) {
          if (element.find(e.target).length > 0 || options.hideOnBlur === false)
            return;
          element.popover('hide');
        });
      }
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snAriaUnreadNotifications.js */
angular.module('sn.connect.util').directive('snAriaUnreadNotifications', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('snAriaUnreadNotifications.xml'),
    controller: function($scope, $timeout) {
      $scope.messages = [];
      $scope.$on("connect.aria.new_unread_message", function(evt, message) {
        $scope.messages.push(message);
        $timeout(function() {
          $scope.messages.shift();
        }, 5000, false);
      });
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snRepeatEventEmitter.js */
angular.module('sn.connect.util').directive('snRepeatEventEmitter', function() {
  'use strict';
  return {
    restrict: 'A',
    link: function(scope) {
      if (scope.$first === true) {
        scope.$evalAsync(function() {
          scope.$emit("ngRepeat.complete");
        });
      }
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/filter.truncate.js */
angular.module('sn.connect.util').filter('truncate', function() {
  "use strict";
  var MAX_LENGTH = 75;
  return function(text) {
    if (text) {
      if (text.length <= MAX_LENGTH) {
        return text;
      }
      return text.substring(0, MAX_LENGTH).trim() + "...";
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/service.snHttp.js */
angular.module('sn.connect.util').factory('snHttp', function($http, $q, $rootScope, $timeout) {
  $http.defaults.headers.common["Cache-Control"] = "no-cache";
  $http.defaults.headers.common["Pragma"] = "no-cache";
  var http = function() {
    if (arguments.length) {
      var deferred = $q.defer();
      $http.apply($http, arguments).then(success(deferred), error(deferred));
      return deferred.promise;
    }
  };
  var retryCodes = [0];
  var errorCount = 0;
  var responseWithError;
  var retryPromise;
  var pollPeriods = [10, 20, 30, 60, 90, 120];
  var retryListener;

  function success(deferred) {
    return function(response) {
      if (errorCount > 0) {
        errorCount = 0;
        responseWithError = void(0);
        $rootScope.$broadcast('http-error.hide');
        pollPeriods = [10, 20, 30, 60, 90, 120];
        if (retryListener)
          retryListener();
      }
      deferred.resolve(response);
    };
  }

  function error(deferred) {
    return function(response) {
      if (retryCodes.indexOf(response.status) < 0) {
        deferred.reject(response);
        return;
      }
      errorCount++;
      if (errorCount === 2 || (response.config && response.config.retry)) {
        responseWithError = response;
        var pollTime = pollPeriods.shift() || 120;
        $rootScope.$broadcast('http-error.show', pollTime);
        retryPromise = $timeout(function() {
          response.config.retry = true;
          http(response.config);
        }, pollTime * 1000);
        retryListener = $rootScope.$on('http-error.retry', function() {
          $timeout.cancel(retryPromise);
          retryPromise = void(0);
          responseWithError.config.retry = true;
          http(responseWithError.config);
          retryListener();
        });
      }
      deferred.reject(response);
    };
  }
  var methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'jsonp', 'trace'];
  angular.forEach(methods, function(method) {
    http[method] = function() {
      var deferred = $q.defer();
      $http[method].apply($http, arguments).then(success(deferred), error(deferred));
      return deferred.promise;
    };
  });
  return http;
});;
/*! RESOURCE: /scripts/app.ng_chat/util/service.sysNumberData.js */
angular.module("sn.connect.util").factory("sysNumberData", function(snHttp, nowServer) {
  "use strict";
  return {
    getListPrefixes: function() {
      var url = nowServer.getURL("number_data");
      return snHttp.get(url).then(function(result) {
        return result.data
      });
    }
  }
});
/*! RESOURCE: /scripts/app.ng_chat/util/factory.commandFactory.js */
angular.module('sn.connect.util').factory('commandFactory', function($http, $rootScope) {
  var service = {};
  var SN_Commands = {
    "commands": {
      'key': 'commands',
      'args': 0,
      'value': function() {
        angular.element("#commandPopupModal").detach().appendTo("body").modal()
      },
      'description': "Displays a list of all available commands. If unknown command is entered, defaults to this."
    },
    "snip": {
      'key': 'snip',
      'args': 0,
      'value': function() {
        $rootScope.$broadcast("conversation.enable_snippet_search", true);
      },
      'description': "Opens snippet search window"
    }
  };
  var Customer_Commands = {};
  var commands = angular.extend(SN_Commands, Customer_Commands);
  service.commands = commands;
  service.commandNames = [];
  service.arr = Object.keys(commands);
  for (var i = 0; i < service.arr.length; i++)
    service.arr[i] = "/" + service.arr[i];
  service.commandNames = Object.keys(commands);
  service.setMessageFilter = function(m) {
    service.messageFilter = m;
  };
  service.getMessageFilter = function() {
    return service.messageFilter;
  }
  service.addSNCommand = function(key, args, value, description) {
    if (commands[key])
      return false;
    commands[key] = {
      'key': key,
      'args': args,
      'value': value,
      'official': true,
      'description': description
    };
    return true;
  };
  service.getCommand = function(entry) {
    var tokens = entry.split(" ");
    tokens[0] = tokens[0].slice(1);
    var key = tokens[0] || "commands";
    var comm = commands[key] || commands["commands"];
    var f = comm['value'];
    return f(entry);
  };
  return service;
});;
/*! RESOURCE: /scripts/app.ng_chat/util/factory.snHotKey.js */
angular.module("sn.connect.util").factory("snHotKey", function() {
  "use strict";
  var commonKeys = {
    "ENTER": 13,
    "TAB": 9,
    "ESC": 27,
    "ESCAPE": 27,
    "SPACE": 32,
    "LEFT": 37,
    "UP": 38,
    "RIGHT": 39,
    "DOWN": 40
  };
  var modKeys = {
    "SHIFT": "shiftKey",
    "CTRL": "ctrlKey",
    "CONTROL": "ctrlKey",
    "ALT": "altKey",
    "OPT": "altKey",
    "OPTION": "altKey",
    "CMD": "metaKey",
    "COMMAND": "metaKey",
    "APPLE": "metaKey",
    "META": "metaKey"
  };

  function HotKey(options) {
    options = options || {};
    this.callback = angular.isFunction(options.callback) ? options.callback : void(0);
    this.modifiers = {
      shiftKey: false,
      ctrlKey: false,
      altKey: false,
      metaKey: false
    };
    if (typeof options.key === "number")
      this.key = options.key;
    else if (typeof options.key === "string") {
      if (options.key.length === 1)
        this.key = options.key.toUpperCase().charCodeAt(0);
      else
        this.key = commonKeys[options.key.toUpperCase()];
    }
    if (options.modifiers) {
      var modifier;
      if (typeof options.modifiers === "string") {
        modifier = modKeys[options.modifiers.toUpperCase()];
        this.modifiers[modifier] = true;
      } else if (angular.isArray(options.modifiers)) {
        for (var i = 0, len = options.modifiers.length; i < len; i++) {
          modifier = modKeys[options.modifiers[i].toUpperCase()];
          this.modifiers[modifier] = true;
        }
      }
    }
  }
  HotKey.prototype.trigger = function(e) {
    for (var key in this.modifiers)
      if (this.modifiers.hasOwnProperty(key))
        if (this.modifiers[key] !== e[key])
          return;
    this.callback(e);
  };
  return HotKey;
});
/*! RESOURCE: /scripts/app.ng_chat/util/service.hotKeyHandler.js */
angular.module("sn.connect.util").factory("hotKeyHandler", function(snHotKey) {
  "use strict";
  var activeHotKeys = {};
  var html = angular.element('html')[0];
  var oldKeyDown = html.onkeydown;

  function addHotKey(hotKey) {
    if (!arguments.length)
      return false;
    if (!hotKey instanceof snHotKey)
      hotKey = new snHotKey(hotKey);
    activeHotKeys[hotKey.key] = activeHotKeys[hotKey.key] || [];
    activeHotKeys[hotKey.key].push(hotKey);
    return hotKey;
  }

  function removeHotKey(hotKey) {
    if (!hotKey instanceof snHotKey || !activeHotKeys[hotKey.key].length)
      return false;
    var loc = activeHotKeys[hotKey.key].indexOf(hotKey);
    if (loc !== -1)
      return activeHotKeys[hotKey.key].splice(loc, 1);
    return false;
  }
  html.onkeydown = function(e) {
    if (typeof oldKeyDown === "function")
      oldKeyDown();
    angular.forEach(activeHotKeys[e.keyCode], function(handler) {
      handler.trigger(e)
    })
  };
  return {
    add: addHotKey,
    remove: removeHotKey
  }
});
/*! RESOURCE: /scripts/app.ng_chat/util/factory.snChatAction.js */
angular.module("sn.connect.util").factory("snChatAction", function(snHotKey) {
  "use strict";
  var order = 100;

  function defaultOrder() {
    return order += 10;
  }

  function ChatAction(config) {
    this.name = config.name || "";
    this.id = config.id || this.name;
    this.icon = config.icon || "";
    if (config.order && typeof config.order === "string")
      config.order = parseInt(config.order);
    this.$order = typeof config.order === "number" ? config.order : defaultOrder();
    this.numArgs = config.numArgs || 0;
    this.requiresArgs = !!config.requiresArgs;
    this.description = config.description || "";
    this.isActive = config.isActive || false;
    this.showInMenu = angular.isUndefined(config.showInMenu) ? true : !!config.showInMenu;
    if (angular.isFunction(config.isVisible))
      this.isVisible = config.isVisible;
    else {
      var isVisibleValue = angular.isUndefined(config.isVisible) ? true : config.isVisible;
      this.isVisible = function() {
        return isVisibleValue;
      };
    }
    this.shortcut = "/" + config.shortcut;
    this.hint = this.shortcut;
    this.argumentHint = config.argumentHint || '';
    if (this.requiresArgs)
      this.hint += "     " + this.argumentHint;
    this.action = angular.isFunction(config.action) ? config.action : void(0);
    if (config.hotKey) {
      if (config.hotKey instanceof snHotKey)
        this.hotKey = config.hotKey;
      else
        this.hotKey = new snHotKey(config.hotKey);
      this.hotKey.callback = this.trigger;
    }
  }
  ChatAction.prototype.trigger = function() {
    if (this.isValid() && this.isVisible(arguments[0]))
      this.action.apply(this, arguments);
  };
  ChatAction.prototype.isValid = function() {
    return this.action && this.id;
  };
  ChatAction.prototype.canRun = function(commandText) {
    return this.shortcut.toLowerCase().indexOf(commandText.trim().toLowerCase()) === 0;
  };
  return ChatAction;
});;
/*! RESOURCE: /scripts/app.ng_chat/util/service.ChatActionHandler.js */
angular.module("sn.connect.util").factory("ChatActionHandler", function(
  $http, $q, $rootScope, i18n, snChatAction, hotKeyHandler, isLoggedIn) {
  "use strict";
  var i18nDeferred = $q.defer();
  i18n.getMessages([
    'Transfer', 'Transfer the support conversation to another agent or queue',
    'Escalate', 'Escalate the support conversation to another queue',
    'End Session', 'End the support conversation session',
    'Create VTB Task', 'Creates a VTB Task on the conversations VTB'
  ], function(i18nNames) {
    var actions = [
      new snChatAction({
        id: 'transfer',
        name: i18nNames['Transfer'],
        shortcut: "transfer",
        description: i18nNames['Transfer the support conversation to another agent or queue'],
        icon: 'icon-arrow-right',
        order: 70,
        isVisible: function(conversation) {
          return conversation.isHelpDesk &&
            conversation.queueEntry.isAssignedToMe &&
            !conversation.queueEntry.isTransferPending;
        },
        action: function(conversation) {
          $rootScope.$broadcast('connect.support.conversation.transfer', conversation);
        }
      }),
      new snChatAction({
        id: 'escalate',
        name: i18nNames['Escalate'],
        shortcut: "escalate",
        description: i18nNames['Escalate the support conversation to another queue'],
        icon: 'icon-my-feed',
        order: 60,
        isVisible: function(conversation) {
          if (!conversation.isHelpDesk)
            return false;
          var queueEntry = conversation.queueEntry;
          if (!queueEntry.isAssignedToMe)
            return false;
          if (queueEntry.isTransferPending)
            return false;
          var queue = queueEntry.queue;
          return queue && queue.escalateTo && queue.escalationQueue.available;
        },
        action: function() {
          $rootScope.$broadcast('dialog.escalation-confirm.show');
        }
      }),
      new snChatAction({
        id: 'End Session',
        name: i18nNames['End Session'],
        shortcut: "end",
        description: i18nNames['End the support conversation session'],
        icon: 'icon-cross',
        order: 9999,
        isVisible: function(conversation) {
          return conversation.isHelpDesk &&
            conversation.queueEntry.isAssignedToMe;
        },
        action: function(conversation) {
          $rootScope.$broadcast('connect.support_conversation.close_prompt', conversation, false);
        }
      })
    ];
    i18nDeferred.resolve(actions);
  });
  var actionHandlers = {};

  function createHandler(conversation) {
    var actionHandler = actionHandlers[conversation.sysID];
    if (!actionHandler)
      actionHandler = actionHandlers[conversation.sysID] = new Handler(conversation);
    actionHandler.reload();
    return actionHandler;
  }

  function Handler(conversation) {
    if (!conversation)
      throw "conversation object must be set";
    var shortcutMap = {};
    var idMap = {};
    var actions = [];
    var currentAction;
    var loading;
    i18nDeferred.promise.then(function(actions) {
      angular.forEach(actions, function(action) {
        add(action);
      });
    });

    function reload() {
      if (!conversation.sysID)
        return;
      if (loading)
        return;
      loading = true;
      var url = isLoggedIn ? 'api/now/connect/conversations/' + conversation.sysID + '/actions' :
        'api/now/connect/support/anonymous/conversations/' + conversation.sysID + '/actions';
      $http.get(url).then(function(response) {
        loading = false;
        shortcutMap = {};
        idMap = {};
        actions = [];
        currentAction = undefined;
        i18nDeferred.promise.then(function(actions) {
          angular.forEach(actions, function(action) {
            add(action);
          });
        });
        angular.forEach(response.data.result, function(actionData) {
          actionData.action = function(conversation, argString) {
            $http.post(url, {
              action: actionData.sys_id,
              text: argString
            }).then(function(resp) {
              if (!resp.data)
                return;
              if (!resp.data.result)
                return;
              var result = resp.data.result;
              $rootScope.$emit(result.event, result.data, conversation);
            });
          };
          actionData.name = actionData.name || actionData.title;
          add(new snChatAction(actionData));
        });
      });
    }

    function add(action) {
      if (!arguments.length)
        return false;
      if (!action instanceof snChatAction)
        action = new snChatAction(action);
      actions.push(action);
      idMap[action.id] = action;
      if (action.shortcut) {
        shortcutMap[action.shortcut] = shortcutMap[action.shortcut] || [];
        shortcutMap[action.shortcut].push(action);
      }
      if (action.hotKey)
        hotKeyHandler.add(action.hotKey);
      return action;
    }

    function clearAction() {
      currentAction = undefined;
    }

    function getVisible() {
      return actions
        .filter(function(chatAction) {
          return chatAction.isVisible(conversation);
        });
    }
    return {
      reload: reload,
      get: function(id) {
        return idMap[id];
      },
      run: function(cmdString) {
        cmdString = cmdString.toLowerCase();
        var cmdArray = cmdString.split(" ");
        var possibleActions = shortcutMap[cmdArray[0]];
        var args = cmdArray.slice(1);
        var argString = args.join(" ");
        if (currentAction) {
          currentAction.trigger.call(currentAction, conversation, argString);
          currentAction = void(0);
          return true;
        }
        if (possibleActions && possibleActions.length) {
          var selectedAction = possibleActions[0];
          selectedAction.trigger.call(selectedAction, conversation, argString);
          clearAction();
          return true;
        }
        return false;
      },
      hasRequiredArguments: function(cmdString) {
        cmdString = cmdString.toLowerCase();
        var cmdArray = cmdString.split(" ");
        var possibleActions = shortcutMap[cmdArray[0]];
        var args = cmdArray.slice(1);
        if (!possibleActions || !possibleActions.length)
          return false;
        currentAction = possibleActions[0];
        if (currentAction.requiresArgs)
          return args.length > 0;
        return true;
      },
      hasMatchingAction: function(text) {
        if (!text)
          return false;
        text = text.trim().toLowerCase();
        return getVisible().some(function(action) {
          var shortcut = action.shortcut.toLowerCase();
          return text === shortcut || text.indexOf(shortcut + " ") === 0;
        })
      },
      getCommands: function(filterText) {
        if (filterText)
          filterText = filterText.toLowerCase();
        return getVisible()
          .filter(function(command) {
            return filterText ? command.shortcut.toLowerCase().indexOf(filterText) === 0 : true;
          })
          .sort(function(a, b) {
            return a.shortcut > b.shortcut;
          });
      },
      getMenuActions: function() {
        return getVisible()
          .filter(function(chatAction) {
            return chatAction.showInMenu;
          })
          .sort(function(a, b) {
            return a.$order - b.$order;
          });
      }
    }
  }
  return {
    create: createHandler
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/service.connectDropTarget.js */
angular.module('sn.connect.util').service('connectDropTargetService', function($rootScope, activeConversation) {
  'use strict';

  function isIgnoreDrop(conversation) {
    if (!conversation.amMember)
      return false;
    if (conversation.isPending && !conversation.isPendingNoRecipients)
      return false;
    return (conversation.isHelpDesk && conversation.queueEntry.isPermanentlyClosed)
  }
  return {
    activateDropTarget: function(conversation) {
      conversation = conversation || activeConversation.conversation;
      if (isIgnoreDrop(conversation))
        return;
      $rootScope.$broadcast("connect.drop_target_popup.show", conversation.sysID);
    },
    deactivateDropTarget: function(conversation) {
      conversation = conversation || activeConversation.conversation;
      if (isIgnoreDrop(conversation))
        return;
      $rootScope.$broadcast("connect.drop_target_popup.hide", conversation.sysID);
    },
    onFileDrop: function(files, conversation) {
      conversation = conversation || activeConversation.conversation;
      if (isIgnoreDrop(conversation))
        return;
      this.deactivateDropTarget(conversation);
      $rootScope.$broadcast("connect.drop.files", files, conversation.sysID);
    },
    handleDropEvent: function(data, conversation) {
      conversation = conversation || activeConversation.conversation;
      if (isIgnoreDrop(conversation))
        return;
      this.deactivateDropTarget(conversation);
      $rootScope.$broadcast("connect.drop", data, conversation.sysID);
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/service.durationFormatter.js */
angular.module('sn.connect.util').service('durationFormatter', function($filter, i18n) {
  'use strict';
  var units = {
    years: 365 * 24 * 60 * 60 * 1000,
    months: 30 * 24 * 60 * 60 * 1000,
    weeks: 7 * 24 * 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    hours: 60 * 60 * 1000,
    minutes: 60 * 1000,
    seconds: 1000
  };
  var names;
  i18n.getMessages([
      'month', 'months',
      'week', 'weeks',
      'day', 'days',
      'hour', 'hours'
    ],
    function(results) {
      names = results;
    });

  function durationYearFn(duration, startTimestamp, endTimestamp) {
    return function() {
      if (duration.years > 0) {
        var start = Math.abs(Date.now() - startTimestamp);
        var end = Math.abs(Date.now() - endTimestamp);
        var date = new Date((start > end) ? startTimestamp : endTimestamp);
        return $filter('date')(date, 'mediumDate');
      }
    };
  }

  function durationGeneralFn(duration, single, plural, format) {
    return function() {
      if (duration)
        return stringFormat(duration + ' ' + ((duration === 1) ? single : plural), format);
    }
  }

  function stringFormat(value, format) {
    return format.replace(/\{0}/, value);
  }
  return {
    format: function(timestamp, format) {
      return this.formatWithRange(Date.now(), timestamp, format);
    },
    formatWithRange: function(startTimestamp, endTimestamp, format) {
      format = format || "{0}";
      var duration = {};
      var remaining = Math.abs(startTimestamp - endTimestamp);
      angular.forEach(units, function(value, key) {
        duration[key] = Math.floor(remaining / value);
        remaining -= duration[key] * value;
      });
      var durationFunction = [
        durationYearFn(duration.years, startTimestamp, endTimestamp),
        durationGeneralFn(duration.months, names['month'], names['months'], format),
        durationGeneralFn(duration.weeks, names['week'], names['weeks'], format),
        durationGeneralFn(duration.days, names['day'], names['days'], format),
        durationGeneralFn(duration.hours, names['hour'], names['hours'], format)
      ];
      for (var i = 0; i < durationFunction.length; ++i) {
        var value = durationFunction[i]();
        if (value)
          return value;
      }
      return stringFormat(duration.minutes + ':' +
        (duration.seconds < 10 ? '0' + duration.seconds : duration.seconds), format);
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snConnectDuration.js */
angular.module('sn.connect.util').directive('snConnectDuration', function($interval, $sanitize, durationFormatter) {
  'use strict';
  var listenerCount = 0;
  var listeners = {};
  $interval(tick, 1000, 0, false);

  function tick() {
    angular.forEach(listeners, function(listenerFn) {
      if (typeof listenerFn !== "function")
        return;
      listenerFn();
    })
  }

  function onTick(fn) {
    listenerCount++;
    listeners[listenerCount] = fn;
    return listenerCount;
  }

  function remove(listenerCount) {
    delete listeners[listenerCount];
  }
  return {
    template: '<span></span>',
    restrict: 'E',
    replace: true,
    scope: {
      startTimestamp: '=?',
      endTimestamp: '=?',
      placeholder: '@'
    },
    link: function(scope, element, attrs) {
      var listenerIndex;

      function calculate() {
        var duration = attrs.placeholder || '';
        if (scope.startTimestamp && scope.endTimestamp) {
          duration = durationFormatter.formatWithRange(scope.startTimestamp, scope.endTimestamp);
        } else if (scope.startTimestamp) {
          duration = durationFormatter.format(scope.startTimestamp);
        } else if (scope.endTimestamp) {
          duration = durationFormatter.format(scope.endTimestamp);
        }
        element.html($sanitize(duration));
      }
      listenerIndex = onTick(calculate);
      scope.$on('$destroy', function() {
        remove(listenerIndex);
      });
      calculate();
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/service.snConversationAsideHistory.js */
angular.module("sn.connect.util").service("snConversationAsideHistory", function() {
  "use strict";
  var conversationAsides = {};

  function getHistory(conversation) {
    if (conversationAsides.hasOwnProperty(conversation))
      return conversationAsides[conversation];
    return false;
  }

  function saveAsideHistory(conversation, view) {
    conversationAsides[conversation] = view;
  }

  function clearAsideHistory(conversation) {
    delete conversationAsides[conversation];
  }
  return {
    getHistory: getHistory,
    saveHistory: saveAsideHistory,
    clearHistory: clearAsideHistory
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/service.snConnectAsideManager.js */
angular.module("sn.connect.util").service("snConnectAsideManager", function(paneManager) {
  "use strict";
  return {
    setup: function() {
      if (angular.element('body').data().layout)
        paneManager.registerPane('connect:conversation_list');
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/service.snTypingTracker.js */
angular.module('sn.connect.util').service("snTypingTracker", function($rootScope, $timeout) {
  "use strict";
  var typingTimeout;
  var newKeystroke = false;

  function notifyTyping() {
    newKeystroke = true;
    if (!typingTimeout) {
      $rootScope.$broadcast("record.typing", {
        status: "typing"
      });
      waitForTypingToStop();
    }
  }

  function cancelTypingTimer() {
    $rootScope.$broadcast("record.typing", {
      status: "viewing"
    });
    newKeystroke = false;
    if (!typingTimeout)
      return;
    $timeout.cancel(typingTimeout);
    typingTimeout = void(0);
  }

  function waitForTypingToStop() {
    newKeystroke = false;
    typingTimeout = $timeout(function() {
      if (newKeystroke) {
        waitForTypingToStop()
      } else {
        cancelTypingTimer();
      }
    }, 3000)
  }
  return {
    typing: notifyTyping,
    cancelTyping: cancelTypingTimer
  }
});
/*! RESOURCE: /scripts/app.ng_chat/util/service.screenWidth.js */
angular.module("sn.connect.util").service("screenWidth", function($window, $timeout) {
  "use strict";
  var window = angular.element($window);
  var thresholdTimeout;
  return {
    get width() {
      return window.width();
    },
    onResize: function(fn) {
      var self = this;
      window.on('resize', function() {
        fn(self.width);
      });
    },
    isAbove: function(width) {
      return this.width > width;
    },
    threshold: function(threshold, fn, debounce) {
      var lastState;
      this.onResize(function(curr) {
        $timeout.cancel(thresholdTimeout);
        thresholdTimeout = $timeout(function() {
          var state = curr >= threshold;
          if (state === lastState)
            return;
          fn(state, curr);
          lastState = state;
        }, debounce);
      });
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/service.titleFlasher.js */
angular.module('sn.connect.util').service('titleFlasher', function($document, $window, i18n, snTabActivity) {
  "use strict";
  var singleMessage = "1 New Message",
    manyMessages = "{0} New Messages";
  i18n.getMessages(["1 New Message", "{0} New Messages"], function(results) {
    singleMessage = results[singleMessage];
    manyMessages = results[manyMessages];
  });
  var initialTitle,
    FLASH_DELAY = 500,
    numMessages = 0,
    changedTitle = false,
    flashTimer;

  function flash(doNotIncrement) {
    if (snTabActivity.isVisible || !snTabActivity.isPrimary)
      return reset();
    if (!doNotIncrement)
      numMessages++;
    if (doNotIncrement && changedTitle)
      setTitle(initialTitle);
    else if (numMessages - 1)
      setTitle(manyMessages);
    else
      setTitle(singleMessage);
    if (flashTimer)
      $window.clearTimeout(flashTimer);
    flashTimer = $window.setTimeout(function() {
      flash(true);
    }, FLASH_DELAY);
  }

  function reset() {
    if (!flashTimer) {
      return;
    }
    numMessages = 0;
    setTitle(initialTitle);
    $window.clearTimeout(flashTimer);
    flashTimer = void(0);
  }

  function setTitle(newTitle) {
    if (newTitle.indexOf("{0}") >= 0)
      newTitle = newTitle.replace("{0}", numMessages);
    changedTitle = newTitle !== initialTitle;
    $document[0].title = newTitle;
  }
  snTabActivity.on("tab.primary", reset);
  snTabActivity.on("tab.secondary", reset);
  return {
    flash: function() {
      if (!flashTimer) {
        initialTitle = $document[0].title;
      }
      flash(false);
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/service.snConnectMention.js */
angular.module("sn.connect.util").factory("snConnectMention", function(liveProfileID, $q, snMention) {
  "use strict";

  function retrieveMembers(conversation, term) {
    if (!conversation.table || !conversation.document) {
      var deferred = $q.defer();
      deferred.resolve(conversation.members.filter(function(mem) {
        return (mem.name.toUpperCase().indexOf(term.toUpperCase()) >= 0 && liveProfileID !== mem.sysID);
      }).slice(0, 5));
      return deferred.promise;
    }
    return snMention.retrieveMembers(conversation.table, conversation.document, term);
  }
  return {
    retrieveMembers: retrieveMembers
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/util/directive.snInfiniteScroll.js */
angular.module("sn.connect.util").directive('snInfiniteScroll', function($q, $interval, $window, $timeout, infiniteScrollFactory) {
  var SCROLL_THROTTLE_MS = 50;
  var LOOK_AHEAD = 0.15;
  var snInfiniteScrollService;

  function throttle(func, wait) {
    var initialCall = true,
      deferred = $q.defer(),
      timerId;
    if (typeof func != 'function') {
      return;
    }

    function throttled() {
      if (timerId) {
        return;
      }
      if (initialCall) {
        initialCall = false;
        deferred.resolve(func());
        return deferred.promise;
      }
      timerId = $timeout(function() {
        timerId = undefined;
        deferred.resolve(func());
      }, wait, false);
      return deferred.promise;
    }
    return throttled;
  }
  return {
    restrict: 'A',
    scope: {
      scrollConfig: '='
    },
    bindToController: true,
    controllerAs: '$ctrl',
    link: function(scope, element) {
      var el = element[0];
      var scrollHandler = function() {
        snInfiniteScrollService.onScroll(el.scrollTop, el.scrollHeight, el.clientHeight);
      };
      el.onscroll = scrollHandler;
      angular.element($window).on('resize', scrollHandler);
    },
    controller: function() {
      this.scrollConfig = this.scrollConfig || {};
      this.scrollConfig.lookAhead = LOOK_AHEAD;
      this.scrollConfig.throttleFunc = throttle;
      this.scrollConfig.scrollThrottleInMs = SCROLL_THROTTLE_MS;
      snInfiniteScrollService = infiniteScrollFactory.get(this.scrollConfig);
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/util/service.infiniteScrollFactory.js */
"use strict";
var _createClass = function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
var InfiniteScrollService = function() {
  function InfiniteScrollService(_ref) {
    var onScrollUp = _ref.onScrollUp,
      onScrollDown = _ref.onScrollDown,
      onScrollMissing = _ref.onScrollMissing,
      throttleFunc = _ref.throttleFunc,
      scrollThrottleInMs = _ref.scrollThrottleInMs,
      lookAhead = _ref.lookAhead;
    _classCallCheck(this, InfiniteScrollService);
    this.onScrollUp = onScrollUp;
    this.onScrollDown = onScrollDown;
    this.onScrollMissing = onScrollMissing;
    this.lookAhead = lookAhead;
    this.throttleFunc = throttleFunc;
    this.scrollThrottleInMs = scrollThrottleInMs;
    this.prevScrollPos = 0;
  }
  _createClass(InfiniteScrollService, [{
    key: "onScroll",
    value: function onScroll(scrollPos, scrollHeight, clientHeight) {
      var _this = this;
      this.throttleFunc(function() {
        if (_this.isScrollBarMissing(scrollHeight, clientHeight)) {
          _this.onScrollMissing();
          return;
        }
        var scrollUp = _this.prevScrollPos > scrollPos;
        var scrollDown = _this.prevScrollPos < scrollPos;
        _this.prevScrollPos = scrollPos;
        var upperBoundary = Math.ceil(scrollHeight * _this.lookAhead);
        var lowerBoundary = Math.ceil(scrollHeight * (1 - _this.lookAhead));
        if (scrollPos + clientHeight >= lowerBoundary && scrollDown) {
          _this.onScrollDown();
        } else if (scrollPos <= upperBoundary && scrollUp) {
          _this.onScrollUp();
        }
      }, this.scrollThrottleInMs)();
    }
  }, {
    key: "isScrollBarMissing",
    value: function isScrollBarMissing(scrollHeight, clientHeight) {
      if (scrollHeight > clientHeight) {
        return false;
      } else {
        return true;
      }
    }
  }]);
  return InfiniteScrollService;
}();
angular.module('sn.connect.util').factory('infiniteScrollFactory', function() {
  return {
    get: function(options) {
      return new InfiniteScrollService(options);
    }
  }
});;;
/*! RESOURCE: /scripts/app.ng_chat/profile/js_includes_connect_profile.js */
/*! RESOURCE: /scripts/app.ng_chat/profile/_module.js */
angular.module("sn.connect.profile", []);;
/*! RESOURCE: /scripts/app.ng_chat/profile/service.profiles.js */
angular.module('sn.connect.profile').service('profiles', function(snHttp, $q, i18n, snCustomEvent, snNotification, isLoggedIn) {
  "use strict";
  var errorText = "User profile was not found";
  i18n.getMessages([errorText], function(array) {
    errorText = array[errorText];
  });
  var PROFILES_URL = isLoggedIn ? '/api/now/live/profiles/' : '/api/now/connect/support/anonymous/live/profiles/';
  var activeRequests = {};
  var profiles = {};

  function fromObject(config) {
    if (!config)
      return;
    if (!profiles[config.sys_id]) {
      config.name = config.name || '';
      config.sysID = config.sys_id;
      config.avatar = config.avatar || '';
      config.userID = config.document;
      profiles[config.sys_id] = config;
    }
    profiles[config.sys_id].supportConversationCount = config.supportConversationCount;
    return profiles[config.sys_id];
  }

  function getAsync(id) {
    if (!id)
      return $q.when(null);
    if (angular.isObject(id))
      id = id.sysID || id.userID;
    if (profiles[id])
      return $q.when(profiles[id]);
    var url = PROFILES_URL + id;
    if (!activeRequests[url]) {
      activeRequests[url] = snHttp.get(url).then(function(response) {
        delete activeRequests[url];
        return fromObject(response.data.result);
      });
    }
    return activeRequests[url];
  }

  function openConversation(profileID) {
    getAsync(profileID).then(function(profile) {
      snCustomEvent.fireTop('chat:open_conversation', profile);
    }, function(response) {
      if (response.status === 404)
        snNotification.show("error", errorText);
    });
  }
  return {
    fromObject: fromObject,
    get: function(id) {
      if (!profiles[id])
        this.getAsync(id);
      return profiles[id];
    },
    getAsync: getAsync,
    addMembers: function(members) {
      angular.forEach(members, fromObject);
    },
    openConversation: openConversation
  };
});;;
/*! RESOURCE: /scripts/app.ng_chat/presence/js_includes_connect_presence.js */
/*! RESOURCE: /scripts/app.ng_chat/presence/_module.js */
angular.module("sn.connect.presence", []);;;
/*! RESOURCE: /scripts/app.ng_chat/conversation/js_includes_connect_conversation.js */
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
/*! RESOURCE: /scripts/app.ng_chat/conversation/_module.js */
angular.module("sn.connect.conversation", ["ng.common", "sn.connect.util", "sn.connect.profile", "sn.connect.message", "sn.connect.resource", 'sn.connect.presence', 'sn.common.ui.popover']);;
/*! RESOURCE: /scripts/app.ng_chat/conversation/factory.Conversation.js */
angular.module('sn.connect.conversation').factory('conversationFactory', function(
  conversationPersister, unreadCountService, profiles, messageFactory, ChatActionHandler, liveProfileID,
  notificationPreferences, queueEntries, documentsService, resourcePersister, messageBatcherService, inSupportClient, isLoggedIn) {
  'use strict';

  function formatUnreadCount(count) {
    return count > 99 ? "99+" : count;
  }

  function fromObject(data) {
    var frameState = data.frame_state || 'open';
    var frameOrder = data.frame_order || 0;
    var amMember = true;
    var visible = data.visible;
    var pendingMessage = "";
    try {
      pendingMessage = sessionStorage.getItem("messagePersist." + data.sys_id) || "";
    } catch (ignored) {}
    unreadCountService.set(data.sys_id, data.last_viewed, data.unread_messages);
    messageBatcherService.addMessages(messageFactory.fromObject(data.last_message), true);

    function getMemberIndexByID(id) {
      for (var i = 0, len = data.members.length; i < len; i++)
        if (data.members[i].sys_id === id)
          return i;
      return -1;
    }

    function setFrameState(value) {
      if (frameState === value)
        return;
      frameState = value;
      conversationPersister.frameState(data.sys_id, value);
    }
    if (!data.members) {
      data.members = [];
    }
    var memberProfiles = [];
    profiles.addMembers(data.members);
    if (data.queueEntry)
      queueEntries.addRaw(data.queueEntry);
    return {
      get name() {
        return (!data.group && this.peer) ? this.peer.name : data.name;
      },
      set name(newName) {
        if (!data.group)
          return;
        data.name = newName;
      },
      get access() {
        return data.access || "unlisted";
      },
      set access(newAccess) {
        data.access = newAccess;
      },
      get peer() {
        if (data.group || !this.members || this.members.length < 2) {
          return null;
        }
        return (this.members[0].sysID === liveProfileID) ? this.members[1] : this.members[0];
      },
      get members() {
        if (memberProfiles.length !== data.members.length) {
          memberProfiles.length = 0;
          angular.forEach(data.members, function(member) {
            if (member.table !== 'sys_user')
              return;
            var memberProfile = isLoggedIn ?
              profiles.get(member.sys_id || member) :
              profiles.fromObject(member);
            if (!memberProfile)
              return;
            if (memberProfiles.indexOf(memberProfile) >= 0)
              return;
            memberProfiles.push(memberProfile);
          });
        }
        return memberProfiles;
      },
      get avatarMembers() {
        if (!data.isHelpDesk)
          return this.members;
        return this.members.filter(function(member) {
          return member.sys_id !== liveProfileID;
        });
      },
      get pendingMessage() {
        return pendingMessage
      },
      set pendingMessage(message) {
        pendingMessage = message;
        try {
          sessionStorage.setItem("messagePersist." + this.sysID, message);
        } catch (ignored) {}
      },
      get description() {
        return data.description;
      },
      set description(newDescription) {
        data.description = newDescription;
      },
      resetUnreadCount: function() {
        if (this.sysID)
          unreadCountService.reset(this.sysID);
      },
      get messageBatcher() {
        return messageBatcherService.getBatcher(this.sysID);
      },
      get ariaMessages() {
        var messages = messageBatcherService.getAriaMessages(this.sysID, 5);
        return messages.filter(function(message) {
          return message.timestamp >= data.last_viewed;
        });
      },
      get lastMessage() {
        return messageBatcherService.getLastMessage(this.sysID) || {};
      },
      get firstMessage() {
        return messageBatcherService.getFirstMessage(this.sysID) || {};
      },
      get hasUnreadMessages() {
        return this.unreadCount > 0;
      },
      get unreadCount() {
        return unreadCountService.get(this.sysID);
      },
      get lastReadMessageTime() {
        return unreadCountService.getLastTimestamp(this.sysID);
      },
      get formattedUnreadCount() {
        return formatUnreadCount(this.unreadCount);
      },
      get isDirectMessage() {
        return !(this.isGroup || this.isDocumentGroup || this.isHelpDesk);
      },
      get isGroup() {
        return data.group;
      },
      get isHelpDesk() {
        return !!this.queueEntry && !!this.queueEntry.sysID;
      },
      get queueEntry() {
        return queueEntries.get(this.sysID);
      },
      get isDocumentGroup() {
        return !!data.document || this.isHelpDesk;
      },
      restricted: data.restricted,
      avatar: data.avatar,
      get sysID() {
        return data.sys_id;
      },
      get href() {
        return '/$c.do#/' + (this.isHelpDesk ? 'support' : 'chat') + '/' + this.sysID;
      },
      get document() {
        return data.document;
      },
      get table() {
        return data.table;
      },
      get type() {
        return data.type;
      },
      get hasRecord() {
        var documentDetails = this.documentDetails;
        return documentDetails && !!documentDetails.sysID;
      },
      get documentDetails() {
        if (data.table === 'chat_queue_entry')
          return;
        if (!this._documentsServiceRetrieve) {
          this._documentsServiceRetrieve = true;
          documentsService.retrieve(data.table, data.document);
        }
        return documentsService.getDocument(data.document);
      },
      get resources() {
        return resourcePersister.get(this.sysID);
      },
      get preferences() {
        return notificationPreferences.get(this.sysID);
      },
      get chatActions() {
        if (!this.chatActionHandler)
          this.chatActionHandler = ChatActionHandler.create(this);
        return this.chatActionHandler;
      },
      frameOrder: frameOrder,
      openFrameState: function() {
        setFrameState('open');
      },
      get isFrameStateOpen() {
        return frameState === 'open';
      },
      minimizeFrameState: function() {
        setFrameState('minimized');
      },
      get isFrameStateMinimize() {
        return frameState === 'minimized';
      },
      closeFrameState: function() {
        setFrameState('closed');
      },
      get isFrameStateClosed() {
        return frameState === 'closed';
      },
      get amMember() {
        return amMember || getMemberIndexByID(liveProfileID) !== -1;
      },
      get visible() {
        return visible;
      },
      set visible(value) {
        if (visible === value)
          return;
        visible = value;
        conversationPersister.visible(this.sysID, visible);
      },
      get sortIndex() {
        if (inSupportClient && this.isHelpDesk) {
          var queueEntry = this.queueEntry;
          if (queueEntry.workEnd)
            return queueEntry.workEnd;
          if (queueEntry.workStart)
            return queueEntry.workStart;
        }
        return this.lastMessage.timestamp || 0;
      },
      get canSaveWorkNotes() {
        return data.can_save_work_notes;
      },
      addMember: function(member) {
        if (getMemberIndexByID(member.sys_id) < 0) {
          data.members.push(member);
          if (member.sys_id === liveProfileID)
            amMember = true;
        }
      },
      removeMember: function(member) {
        var memberIndex = getMemberIndexByID(member.sys_id);
        if (memberIndex < 0)
          return;
        data.members.splice(memberIndex, 1);
        memberProfiles.splice(memberIndex, 1);
        if (member.sys_id === liveProfileID)
          amMember = false;
      },
      get canSaveComments() {
        return data.can_save_comments;
      },
    };
  }
  return {
    fromObject: fromObject,
    fromRawConversation: function(data) {
      data.memberData = data.members;
      var preference = data.notification_preference;
      preference.sys_id = data.sys_id;
      notificationPreferences.addRaw(preference);
      return fromObject(data);
    },
    formatUnreadCount: formatUnreadCount
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/service.activeConversation.js */
angular.module('sn.connect.conversation').service('activeConversation', function(
  $rootScope, $filter, $location, $q, i18n, userPreferences, conversations, documentsService, messageService,
  snTabActivity, startingTab, inFrameSet, inSupportClient, supportEnabled, chatEnabled, supportAddMembers, messageBatcherService,
  snNotification) {
  "use strict";
  var WINDOW_TYPE = inFrameSet ? 'frameSet' : 'standAlone';
  var PREFERENCE_ROOT = 'connect.conversation_list.active_list.' + WINDOW_TYPE;
  var restrictedConversationText = 'The conversation you requested could not be found';
  i18n.getMessages([restrictedConversationText], function(array) {
    restrictedConversationText = array[restrictedConversationText];
  });

  function ConversationHandler(preferenceName, isSupport) {
    var conversationID;

    function contains(conversation) {
      if (!conversation)
        return false;
      if (!conversation.sysID)
        return false;
      if (conversation.isPending)
        return false;
      var isSupportConv = (supportEnabled || !supportAddMembers) ? isSupport : undefined;
      var conversationList = $filter('conversation')(conversations.all, true, isSupportConv);
      return conversations.find(conversation, conversationList).index >= 0;
    }
    return {
      get sysID() {
        return conversationID;
      },
      set sysID(newSysID) {
        if (conversationID === newSysID) {
          return;
        }
        conversationID = newSysID;
        setPreference(preferenceName, conversationID);
      },
      get conversation() {
        return conversations.indexed[this.sysID] || conversations.emptyConversation;
      },
      set conversation(newConversation) {
        this.sysID = contains(newConversation) ? newConversation.sysID : undefined;
      }
    };
  }
  var inFrameSetConversationHandler;
  if (inFrameSet)
    inFrameSetConversationHandler = new ConversationHandler(PREFERENCE_ROOT + ".id");

  function TabData(isSupport) {
    var tab = isSupport ? "support" : "chat";
    var preferenceName = PREFERENCE_ROOT + '.' + tab + '.id';
    var conversationHandler = inFrameSetConversationHandler || new ConversationHandler(preferenceName, isSupport);
    if (!inSupportClient) {
      var startingLocation = location();
      if (!inFrameSet && (startingLocation.tab === tab) && startingLocation.conversationID) {
        initialize(startingLocation.conversationID, true).catch(function() {
          snNotification.show('error', restrictedConversationText);
          setPreference(preferenceName);
        });
      } else {
        userPreferences.getPreference(preferenceName).then(initialize).catch(function() {
          setPreference(preferenceName);
        });
      }
    }

    function initialize(id, makeVisible) {
      if (!id || id === "null")
        return $q.when();
      return conversations.get(id).then(function(conversation) {
        if (!conversation)
          return;
        if (!conversation.visible && !makeVisible)
          return;
        conversationHandler.sysID = conversation.sysID;
      });
    }
    return {
      get tab() {
        return tab;
      },
      get isSupport() {
        return isSupport;
      },
      get sysID() {
        return conversationHandler.sysID;
      },
      get conversation() {
        return conversationHandler.conversation;
      },
      set conversation(conv) {
        conversationHandler.conversation = conv;
      }
    };
  }
  var tabDataList = {
    chat: new TabData(false),
    support: new TabData(true)
  };
  var tab = checkedLocation().tab || (inSupportClient ? tabDataList.support.tab : startingTab[WINDOW_TYPE]);
  if (tab == "chat" && !chatEnabled)
    tab = "support";
  else if (tab == "support" && !supportEnabled)
    tab = "chat";
  var activeTabData = tabDataList[tab];
  $rootScope.$on("connect.action.create_record", function(evt, data, conversation) {
    if (conversation) {
      API.conversation = conversation;
    }
    documentsService.create(activeTabData.conversation, data);
  });

  function setPreference(name, value) {
    if (inSupportClient)
      return;
    userPreferences.setPreference(name, value || '');
  }
  messageService.watch(function(message) {
    if (activeTabData.sysID !== message.conversationID)
      $rootScope.$broadcast("connect.aria.new_unread_message", message);
    conversations.get(message.conversationID).then(function(conversation) {
      if (!conversation)
        return;
      if (conversation.isGroup)
        message.groupName = conversation.name;
      if (!message.isSystemMessage && (message.timestamp > conversation.lastReadMessageTime))
        conversation.visible = true;
      if (conversation.sysID !== activeTabData.sysID)
        return;
      if (snTabActivity.idleTime >= snTabActivity.defaultIdleTime)
        return;
      if (!snTabActivity.isVisible)
        return;
      conversation.resetUnreadCount();
    });
  });
  snTabActivity.on("tab.primary", function() {
    if (snTabActivity.isActive())
      activeTabData.conversation.resetUnreadCount();
  });

  function location() {
    var path = $location.path().split('/');
    return {
      tab: path[1],
      conversationID: path[2]
    };
  }

  function checkedLocation() {
    var path = location();
    if (path.tab === 'with')
      return {
        profileID: path.conversationID
      };
    return isValidTab(path.tab) ? path : {};
  }

  function isValidTab(tab) {
    return angular.isDefined(tabDataList[tab])
  }
  var pendingConversation;
  var API = {
    get tab() {
      return activeTabData.tab;
    },
    get sysID() {
      return activeTabData.sysID;
    },
    get conversation() {
      return activeTabData.conversation;
    },
    get isEmpty() {
      return !this.sysID || this.conversation.isEmpty;
    },
    get isSupport() {
      return activeTabData.isSupport;
    },
    get location() {
      return checkedLocation();
    },
    getTab: function(tab) {
      if (!isValidTab(tab))
        throw "Not a valid tab name";
      return tabDataList[tab];
    },
    set conversation(conv) {
      if (conv)
        conv.visible = true;
      else
        conv = conversations.emptyConversation;
      var old = activeTabData.conversation;
      if (!old.isEmpty) {
        old.resetUnreadCount();
        if (conv.sysID !== old.sysID)
          messageBatcherService.clearAriaMessages(old.sysID);
      }
      activeTabData.conversation = conv;
      if (this.isEmpty)
        return;
      if (inFrameSet)
        conv.openFrameState();
      this.conversation.resetUnreadCount();
      $rootScope.$broadcast("connect.message.focus", this.conversation);
    },
    set tab(newTab) {
      if (this.tab === newTab)
        return;
      activeTabData = this.getTab(newTab);
      if (!this.isEmpty)
        this.conversation.resetUnreadCount();
      setPreference(PREFERENCE_ROOT, newTab);
    },
    clear: function(check) {
      if (!check || check.sysID === this.sysID)
        this.conversation = undefined;
    },
    isActive: function(conversation) {
      return !this.pendingConversation && !this.isEmpty && conversation && conversation.sysID === this.sysID;
    },
    get pendingConversation() {
      return pendingConversation;
    },
    set pendingConversation(pending) {
      pendingConversation = pending;
    }
  };
  return API;
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/service.conversationPersister.js */
angular.module('sn.connect.conversation').service('conversationPersister', function(
  snHttp, CONNECT_CONTEXT, isLoggedIn) {
  "use strict";
  var REST_API_PATH = isLoggedIn ? '/api/now/connect/conversations' : '/api/now/connect/support/anonymous/conversations';

  function createGroup(optionalParams) {
    optionalParams = optionalParams || {};
    return snHttp.post(REST_API_PATH, optionalParams).then(extractResult);
  }

  function addUser(conversationID, profileID) {
    return snHttp.post(REST_API_PATH + '/' + conversationID + '/members', {
      "member_id": profileID
    }).then(extractResult);
  }

  function removeUser(conversationID, profileID) {
    return snHttp.delete(REST_API_PATH + '/' + conversationID + '/members/' + profileID).then(extractResult);
  }

  function update(conversationID, data) {
    return snHttp.put(REST_API_PATH + '/' + conversationID, data).then(extractResult);
  }

  function extractResult(response) {
    return response.data.result;
  }
  var conversationURL = REST_API_PATH;
  return {
    createGroup: createGroup,
    addUser: addUser,
    removeUser: removeUser,
    update: update,
    getConversations: function(queueID) {
      if (queueID) {
        conversationURL = isLoggedIn ? '/api/now/connect/support/queues/' + queueID + '/sessions' :
          '/api/now/connect/support/anonymous/queues/' + queueID + '/sessions';
      }
      return snHttp.get(conversationURL).then(extractResult);
    },
    getConversation: function(conversationID) {
      return snHttp.get(REST_API_PATH + '/' + conversationID)
        .then(extractResult)
    },
    lastViewed: function(conversationID, timestamp) {
      return update(conversationID, {
        last_viewed: timestamp
      })
    },
    visible: function(conversationID, visible) {
      return update(conversationID, {
        visible: visible
      });
    },
    frameState: function(conversationID, state) {
      var data = {
        frame_state: state
      };
      if (state === 'closed')
        data.frame_order = -1;
      return update(conversationID, data);
    },
    changeFrameOrder: function(conversations) {
      var data = {
        frame_order: conversations.join(',')
      };
      return snHttp.post(REST_API_PATH + '/order', data).then(extractResult);
    },
    createConversation: function(groupName, recipients, message) {
      var recipientJIDs = recipients.map(function(recipient) {
        return recipient.jid;
      });
      var data = {
        group_name: groupName,
        recipients: recipientJIDs,
        message: message.text,
        reflected_field: message.reflectedField || "comments",
        attachments: message.attachmentSysIDs,
        context: CONNECT_CONTEXT
      };
      return snHttp.post(REST_API_PATH, data).then(extractResult);
    },
    createDocumentConversation: function(table, sysID) {
      var data = {
        table: table,
        sys_id: sysID
      };
      return snHttp.post(REST_API_PATH + '/records', data).then(extractResult);
    },
    setDocument: function(profileID, table, document) {
      var data = {
        table: table,
        document: document
      };
      return snHttp.put(REST_API_PATH + '/' + profileID + '/records', data);
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/service.conversations.js */
angular.module('sn.connect.conversation').service('conversations', function(
  $rootScope, $q, $timeout, amb, i18n, conversationFactory, conversationPersister, documentsService, liveProfileID,
  userID, snHttp, queueEntries, snComposingPresence, snCustomEvent, snTabActivity, snNotification, profiles,
  snNotifier, userPreferences, messageBatcherService, isLoggedIn, sessionID, supportEnabled) {
  "use strict";
  var i18nText;
  i18n.getMessages(['and', 'more', 'You have been mentioned', "New Conversation"], function(i18nNames) {
    i18nText = i18nNames;
  });
  var currentLiveProfile;
  profiles.getAsync(liveProfileID).then(function(liveProfile) {
    currentLiveProfile = liveProfile;
  });
  var conversationsIndex = {};
  var onNextUpdate = function() {};
  var lastRefresh = $q.when();
  var firstRefresh = $q.defer();
  var loaded = false;
  var channelId = isLoggedIn ? userID : sessionID;
  amb.getChannel("/connect/" + channelId).subscribe(function(response) {
    var event = response.data;
    var type = event.event_type;
    var data = event.event_data;
    var conversationID = event.event_target || event.group || data.conversation_id;
    var conversation = conversationsIndex[conversationID];
    if (!conversation)
      return;
    if (type === "conversation_member_removed") {
      conversation.removeMember(data);
      if (data.sys_id !== liveProfileID)
        return;
      if (conversation.isPending)
        return;
      snComposingPresence.set(conversation.sysID, [], []);
      delete conversationsIndex[conversation.sysID];
      return;
    }
    if (type === "conversation_member_added") {
      conversation.addMember(data);
      if (data.sys_id === liveProfileID) {
        $rootScope.$broadcast("conversation.refresh_messages", conversation);
      }
      return;
    }
    if (type === "conversation_deauthorized") {
      conversation.restricted = true;
      return;
    }
    if (type === "conversation_updated")
      refreshConversation(conversationID).then(onNextUpdate).then(function() {
        onNextUpdate = function() {};
      });
  });
  amb.getChannel("/notifications/" + liveProfileID).subscribe(function(message) {
    userPreferences.getPreference("connect.notifications.desktop").then(function(value) {
      var allowWebNotifications = angular.isString(value) ? value === "true" : value;
      if (allowWebNotifications && snTabActivity.isPrimary) {
        var body = i18nText[message.data.message] || message.data.message;
        snNotifier().notify(message.data.title, {
          body: body,
          lifespan: 7000,
          onClick: function() {
            window.open("/nav_to.do?uri=/" + message.data.table + ".do?sys_id=" + message.data.document, "_blank");
          }
        });
      }
    });
  });
  amb.connect();
  snCustomEvent.observe('connect:set_document', function(data) {
    conversationPersister.setDocument(data.conversation, data.table, data.document)
      .then(function() {
        onNextUpdate = function(conversation) {
          documentsService.show(conversation.table, conversation.document);
        };
      });
  });
  $rootScope.$on("amb.connection.recovered", function() {
    refreshAll();
  });
  snTabActivity.on("tab.primary", function() {
    refreshAll();
  });

  function refreshAll(queueID) {
    var deferred = $q.defer();
    lastRefresh = deferred.promise;
    conversationPersister.getConversations(queueID).then(function(conversations) {
      if (!loaded) {
        loaded = true;
        firstRefresh.resolve();
      }
      conversationsIndex = {};
      angular.forEach(conversations, addRawConversation);
      deferred.resolve();
    });
    return lastRefresh;
  }

  function refreshConversation(id) {
    return conversationPersister.getConversation(id).then(addRawConversation,
      function(response) {
        if (response.status === 403)
          snNotification.show("error", response.data.result);
        return $q.reject(response)
      });
  }

  function addRawConversation(conversationData) {
    if (!conversationData)
      return;
    var conversation = new conversationFactory.fromRawConversation(conversationData);
    return conversationsIndex[conversation.sysID] = conversation;
  }

  function _get(conversationID) {
    if (conversationsIndex[conversationID])
      return $q.when(conversationsIndex[conversationID]);
    return refreshConversation(conversationID).then(function() {
      if (conversationID === 'pending')
        return NewConversation();
      if (!conversationsIndex[conversationID])
        throw "Conversation " + conversationID + " does not exist";
      return conversationsIndex[conversationID];
    })
  }

  function get(conversationID) {
    return lastRefresh.then(function() {
      return _get(conversationID);
    }, function() {
      return _get(conversationID);
    })
  }

  function getCachedPeerConversations(userSysID) {
    return allConversations().filter(function(conversation) {
      return conversation.isDirectMessage && conversation.members.some(function(member) {
        return member.userID === userSysID;
      });
    });
  }

  function allConversations() {
    return Object.keys(conversationsIndex).map(function(key) {
      return conversationsIndex[key];
    });
  }

  function find(conversation, conversationList) {
    conversationList = conversationList || allConversations();
    var sysID = conversation.sysID || conversation;
    for (var i = 0; i < conversationList.length; ++i) {
      var conv = conversationList[i];
      if (conv.sysID === sysID)
        return {
          conversation: conv,
          index: i
        };
    }
    return {
      index: -1
    };
  }

  function close(conversationID) {
    var conversation = conversationsIndex[conversationID];
    if (!conversation)
      return false;
    if (!conversation.isHelpDesk) {
      remove(conversation);
      return true;
    }
    var queueEntry = conversation.queueEntry;
    if (queueEntry.isWaiting || queueEntry.isEscalated || queueEntry.isTransferRejected || queueEntry.isTransferCancelled) {
      removeSupport(conversation.sysID);
      return true;
    }
    if (queueEntry.isClosedByAgent || !queueEntry.isAssignedToMe) {
      if (!supportEnabled && !conversation.restricted) {
        $rootScope.$broadcast('connect.non_agent_conversation.close_prompt', conversation);
        return false;
      }
      closeSupport(conversationID, true);
      return true;
    }
    $rootScope.$broadcast('connect.support_conversation.close_prompt', conversation, true);
    return false;
  }

  function remove(conversation) {
    conversation.closeFrameState();
    conversation.resetUnreadCount();
    conversation.visible = false;
  }

  function closeSupport(conversationID, agentLeave) {
    queueEntries.close(conversationID, agentLeave);
    if (agentLeave)
      removeSupport(conversationID);
  }

  function removeSupport(conversationID) {
    queueEntries.remove(conversationID);
    delete conversationsIndex[conversationID];
  }

  function removeUser(conversationID, userID) {
    var conversation = conversationsIndex[conversationID];
    if (userID === liveProfileID) {
      remove(conversation);
      if (conversation.isHelpDesk)
        removeSupport(conversation.sysID);
    }
    conversationPersister.removeUser(conversationID, userID);
  }

  function exists(conversationID) {
    return conversationID in conversationsIndex;
  }
  var NewConversation = function() {
    messageBatcherService.removeMessageBatcher("pending");

    function listRecipients(recipients, shorten) {
      var names = recipients.map(function(recipient) {
        return shorten ?
          recipient.name.split(" ")[0] :
          recipient.name;
      });
      var and = shorten ?
        " & " :
        (" " + i18nText["and"] + " ");
      var more = shorten ?
        (" +" + (recipients.length - 3)) :
        (and + (recipients.length - 3));
      more += " " + i18nText["more"];
      switch (recipients.length) {
        case 0:
          return "";
        case 1:
          return names[0];
        case 2:
          return names[0] + and + names[1];
        case 3:
          return names[0] + ", " + names[1] + ", " + and + names[2];
        case 4:
          return names[0] + ", " + names[1] + ", " + names[2] + ", " + and + names[3];
        default:
          return names[0] + ", " + names[1] + ", " + names[2] + ", " + more;
      }
    }
    return {
      sysID: "pending",
      isPending: true,
      pendingRecipients: [],
      name: i18nText["New Conversation"],
      frameState: 'open',
      frameOrder: 0,
      get messageBatcher() {
        return messageBatcherService.getBatcher(this.sysID);
      },
      get firstMessage() {
        return messageBatcherService.getFirstMessage(this.sysID);
      },
      get isPendingNoRecipients() {
        return this.pendingRecipients.length === 0;
      },
      getGroupName: function() {
        var nameArray = this.pendingRecipients.slice();
        nameArray.unshift(currentLiveProfile);
        return listRecipients(nameArray, true);
      },
      get displayRecipients() {
        return listRecipients(this.pendingRecipients, false);
      },
      closeFrameState: function() {},
      openFrameState: function() {},
      $reset: function() {
        return newConversation = new NewConversation();
      }
    };
  };
  var newConversation = new NewConversation();
  var emptyConversation = conversationFactory.fromObject({});
  emptyConversation.isEmpty = true;
  return {
    get all() {
      return allConversations();
    },
    get indexed() {
      return conversationsIndex;
    },
    loaded: firstRefresh.promise,
    get: get,
    getCachedPeerConversations: getCachedPeerConversations,
    refreshAll: refreshAll,
    refreshConversation: refreshConversation,
    exists: exists,
    find: find,
    addUser: function(conversationID, userID) {
      return conversationPersister.addUser(conversationID, userID).then(get, function(response) {
        if (response.status === 403)
          snNotification.show("error", response.data.result);
        return $q.reject(response)
      });
    },
    removeUser: removeUser,
    followDocumentConversation: function(data) {
      return conversationPersister.createDocumentConversation(data.table, data.sysID).then(addRawConversation);
    },
    unfollowDocumentConversation: function(data) {
      var conversationID = data.conversationID;
      if (conversationID === "undefined")
        conversationID = undefined;
      if (!conversationID) {
        for (var id in conversationsIndex) {
          if (!conversationsIndex.hasOwnProperty(id))
            continue;
          var conversation = conversationsIndex[id];
          if (conversation.document === data.sysID) {
            conversationID = conversation.sysID;
            break;
          }
        }
      }
      return removeUser(conversationID, liveProfileID);
    },
    close: close,
    closeSupport: closeSupport,
    update: function(conversationID, data) {
      var conversation = conversationsIndex[conversationID];
      data.name = data.name.trim();
      if (data.name.length === 0)
        data.name = conversation.name;
      data.description = data.description.trim();
      if (data.description.length === 0)
        data.description = conversation.description;
      if ((data.name === conversation.name) &&
        (data.description === conversation.description) &&
        (data.access === conversation.access))
        return;
      conversation.name = data.name;
      conversation.description = data.description;
      conversation.access = data.access;
      var element = {
        name: data.name,
        short_description: data.description,
        access: data.access
      };
      return conversationPersister.update(conversationID, element).then(addRawConversation);
    },
    beginNewConversation: function(groupName, recipients, message) {
      messageBatcherService.addMessages(message);
      return conversationPersister.createConversation(groupName, recipients, message).then(addRawConversation);
    },
    get newConversation() {
      return newConversation;
    },
    get emptyConversation() {
      return emptyConversation;
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversation.js */
angular.module('sn.connect.conversation').directive('snConversation', function(
  getTemplateUrl, $rootScope, $timeout, messageService, activeConversation, profiles) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl("snConversation.xml"),
    replace: true,
    scope: {
      conversation: "=",
      shouldAnnounce: "=readmessages",
      showSenderPresence: "@"
    },
    link: function(scope, element) {
      scope.loading = false;
      scope.$watch("messagesLoadedOnce", function() {
        var isConversationActive = !activeConversation.pendingConversation;
        if (isConversationActive)
          $timeout(function() {
            var el = element.find('.new-message');
            el.focus()
          }, 0, false);
        $timeout(function() {
          scope.loading = !scope.messagesLoadedOnce && isConversationActive;
        }, 0, true);
      });
      scope.checkForUnloadedMessages = function() {
        $timeout(function() {
          var scrollHeight = element.find(".sn-feed-messages")[0].scrollHeight;
          var containerHeight = element.find(".sn-feed-messages").height();
          if (scrollHeight < containerHeight) {
            scope.retrieveMessageHistory().then(function(retrievedMessages) {
              if (retrievedMessages.length === 30)
                scope.checkForUnloadedMessages();
              else
                $timeout(function() {
                  scope.$broadcast('connect.auto_scroll.jump_to_bottom');
                }, 0, false);
            });
          }
        });
      };

      function onClick(evt) {
        $timeout(function() {
          var profileID = angular.element(evt.target).attr('class').substring("at-mention at-mention-user-".length);
          profiles.getAsync(profileID).then(function(profile) {
            scope.showPopover = true;
            scope.mentionPopoverProfile = profile;
            scope.clickEvent = evt;
          });
        }, 0, false);
      }
      element.on("click", ".at-mention", function(evt) {
        if (scope.showPopover) {
          var off = scope.$on("snMentionPopover.showPopoverIsFalse", function() {
            onClick(evt);
            off();
          });
        } else {
          onClick(evt);
        }
      });
      element.on("click", function(evt) {
        scope.focusOnConversation();
      });
    },
    controller: function($scope, $element, $q, snRecordPresence, queueEntries, hotKeyHandler, snHotKey,
      snComposingPresence, userID, inFrameSet) {
      $scope.messagesLoadedOnce = false;
      $scope.showLoading = true;
      $scope.rawMessages = [];
      $scope.asideOpen = false;
      $scope.$on("sn.aside.open", function() {
        $scope.asideOpen = true;
      });
      $scope.$on("sn.aside.close", function() {
        $scope.asideOpen = false;
      });
      $scope.isComposingHidden = function() {
        return $scope.conversation.isHelpDesk && !$scope.conversation.queueEntry.isActive;
      };
      var closeHotKey = new snHotKey({
        key: "ESC",
        callback: function() {
          $scope.$broadcast("snippets.hide", $scope.conversation);
          hotKeyHandler.remove(closeHotKey);
        }
      });
      $scope.escalateOk = function() {
        queueEntries.escalate($scope.conversation);
      };
      $rootScope.$on('http-error.hide', function() {
        messageService.retrieveMessages($scope.conversation);
      });
      $scope.isNoRecipientsMessageShowing = function() {
        return hasNoMessage() && $scope.conversation.pendingRecipients.length === 0;
      };
      $scope.isOneRecipientsMessageShowing = function() {
        return hasNoMessage() && $scope.conversation.pendingRecipients.length === 1;
      };
      $scope.isGroupMessageShowing = function() {
        return hasNoMessage() && $scope.conversation.pendingRecipients.length > 1;
      };

      function hasNoMessage() {
        return !$scope.conversation.firstMessage;
      }

      function isVisible() {
        return ($element[0].offsetWidth !== 0) && ($element[0].offsetHeight !== 0);
      }
      $scope.$watch(isVisible, function(visible) {
        if (!visible || $scope.conversation.isPending)
          return;
        if (inFrameSet && $scope.conversation.isFrameStateMinimize)
          return;
        $scope.conversation.resetUnreadCount();
      });
      $scope.$watch("conversation.sysID", function(newSysID) {
        if (!newSysID)
          return;
        if ($scope.conversation.isPending)
          return;
        $scope.messagesLoadedOnce = false;
        $scope.conversationAlreadyViewed = $scope.conversation.unreadCount > 0;
        $scope.rawMessages = [];
        $scope.previousProfileID = void(0);
        if (!$scope.conversation)
          return;
        if ($scope.conversation.sysID) {
          snComposingPresence.set($scope.conversation.sysID, {
            viewing: [],
            typing: []
          });
          snRecordPresence.initPresence("live_group_profile", $scope.conversation.sysID);
        }
        refreshMessages().then(function(loadedMessages) {
          if (loadedMessages.length === 30)
            $scope.checkForUnloadedMessages();
        });
      });
      $scope.$root.$on("sn.sessions", function(name, data) {
        if (!$scope.conversation || !$scope.conversation.members)
          return;
        var viewing = {};
        var typing = {};
        angular.forEach(data, function(value) {
          if (value.user_id === userID)
            return;
          var conversationID = $scope.conversation.sysID;
          if (value.sys_id === conversationID) {
            if (value.status === "typing") {
              typing[value.user_id] = true;
              delete viewing[value.user_id];
            } else if ((value.status === "viewing" || value.status === "entered") && !typing[value.user_id]) {
              viewing[value.user_id] = true;
            }
          }
        });
        var conversationViewing = [];
        var conversationTyping = [];
        if ($scope.conversation.amMember) {
          angular.forEach($scope.conversation.members, function(member) {
            if (viewing[member.document])
              conversationViewing.push(member);
            if (typing[member.document])
              conversationTyping.push(member);
          });
          snComposingPresence.set($scope.conversation.sysID, {
            viewing: conversationViewing,
            typing: conversationTyping
          });
        }
      });
      $scope.$on("conversation.refresh_messages", function(e, data) {
        if ($scope.conversation.sysID !== data.sysID)
          return;
        refreshMessages();
      });
      $scope.$on("amb.connection.recovered", refreshMessages);

      function refreshMessages() {
        return messageService.retrieveMessages($scope.conversation)
          .then(function(loadedMessages) {
            $timeout(function() {
              $scope.$broadcast('connect.auto_scroll.jump_to_bottom');
            }, 500);
            $scope.messagesLoadedOnce = true;
            return loadedMessages;
          })
          .catch(function() {
            $scope.messagesLoadedOnce = true;
            return [];
          });
      }
      $scope.focusOnConversation = function() {
        if (activeConversation.pendingConversation)
          $rootScope.$broadcast("connect.message.focus", this.conversation);
        else
          activeConversation.conversation = $scope.conversation;
      };
      $scope.retrieveMessageHistory = function() {
        if ($scope.conversation.isPending ||
          $scope.conversation.restricted ||
          !$scope.conversation.messageBatcher.batches.length)
          return $q.when([]);
        var earliestReceivedTime = $scope.conversation.firstMessage.timestamp;
        var promise = messageService.retrieveMessages($scope.conversation, earliestReceivedTime);
        if (!promise)
          return $q.when([]);
        var deferred = $q.defer();
        promise.then(function(retrievedMessages) {
          $scope.messagesLoadedOnce = false;
          $scope.rawMessages = [];
          $scope.messagesLoadedOnce = true;
          deferred.resolve(retrievedMessages);
        });
        return deferred.promise;
      };
      $scope.$on("ngRepeat.complete", function(e) {
        if (angular.equals(e.targetScope, $scope))
          return;
        $scope.$broadcast("ngRepeat.complete");
      });
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversationFooter.js */
angular.module('sn.connect.conversation').directive('snConversationFooter', function(getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl("snConversationFooter.xml"),
    replace: true,
    scope: {
      conversation: "="
    },
    controller: function($scope, $rootScope, amb, uploadAttachmentService, queueEntries, inSupportClient, showActionsForClosedCases) {
      $scope.amb = amb;
      var snHttpError = false;
      $scope.$on('http-error.show', function() {
        snHttpError = true;
      });
      $scope.$on('http-error.hide', function() {
        snHttpError = false;
      });

      function getNoticeType() {
        if (isQueueEntry("isClosedByAgent") || isQueueEntry("isClosedByClient"))
          return "closed session";
        if ($scope.conversation.restricted)
          return "restricted";
        if (amb.interrupted || snHttpError)
          return "connection error";
        if (inSupportClient && isQueueEntry("isReOpenable"))
          return "rejoin";
        if (!inSupportClient && isQueueEntry("isWaiting"))
          return "agent waiting";
        if ($scope.conversation.isPendingNoRecipients)
          return "no recipients";
        if (uploadAttachmentService.filesInProgress.length > 0)
          return "upload in progress";
      }
      $scope.isNoticeShowing = function() {
        return !!getNoticeType();
      };
      $scope.isClosedSessionShowing = function() {
        return getNoticeType() === "closed session";
      };
      $scope.isConnectionErrorShowing = function() {
        return getNoticeType() === "connection error";
      };
      $scope.isRestrictedShowing = function() {
        return getNoticeType() === "restricted";
      };
      $scope.isRejoinShowing = function() {
        return getNoticeType() === "rejoin";
      };
      $scope.isAgentWaitingShowing = function() {
        return getNoticeType() === "agent waiting";
      };
      $scope.isNewConversationNoRecipientsShowing = function() {
        return getNoticeType() === "no recipients";
      };
      $scope.isUploadInProgressShowing = function() {
        return getNoticeType() === "upload in progress";
      };
      $scope.isError = function() {
        return $scope.isRestrictedShowing() || $scope.isConnectionErrorShowing();
      };
      $scope.isQueueNameShowing = function() {
        return isQueueEntry("queue");
      };
      $scope.isQueueNumberShowing = function() {
        return $scope.conversation.table == 'chat_queue_entry';
      };
      $scope.isDocumentNumberShowing = function() {
        return $scope.conversation.hasRecord;
      };

      function isQueueEntry(field) {
        return $scope.conversation.isHelpDesk && $scope.conversation.queueEntry[field];
      }
      $scope.selectSnippet = function(snippet) {
        $scope.$broadcast("connect.conversation.insert_snippet", snippet);
      };
      $scope.rejoin = function() {
        queueEntries.rejoin($scope.conversation.sysID);
      };
      $scope.isMenuVisible = function() {
        return !inSupportClient &&
          !$scope.conversation.isEmpty &&
          $scope.conversation.chatActions &&
          $scope.conversation.chatActions.getMenuActions().length > 0 &&
          (!isQueueEntry("isClosedByAgent") || showActionsForClosedCases);
      };
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversationAddUserButton.js */
angular.module('sn.connect.conversation').directive('snConversationAddUserButton', function(getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    scope: {
      conversation: "="
    },
    templateUrl: getTemplateUrl("snConversationAddUserButton.xml"),
    controller: function($scope, $rootScope, conversations, activeConversation) {
      $scope.userSelected = function(user) {
        conversations.addUser($scope.conversation.sysID, user)
          .then(function(conversation) {
            activeConversation.conversation = conversation;
          })
      };
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversationContainer.js */
angular.module('sn.connect.conversation').directive('snConversationContainer', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('snConversationContainer.xml'),
    replace: true,
    scope: {},
    controller: function($scope, $timeout, conversations, activeConversation, screenWidth) {
      $scope.activeConversation = activeConversation;
      var loading = true;
      conversations.loaded.then(function() {
        loading = false;
      });
      $scope.$on("connect.new_conversation.cancelled", function() {
        activeConversation.pendingConversation = undefined;
      });
      $scope.$on("connect.new_conversation.complete", function() {
        activeConversation.pendingConversation = undefined;
      });
      $scope.$on("connect.show_create_conversation_screen", function(unused, preloadedMember) {
        activeConversation.pendingConversation = conversations.newConversation.$reset();
        activeConversation.tab = 'chat';
        if (preloadedMember)
          $timeout(function() {
            $scope.$emit("connect.member_profile.direct_message", preloadedMember);
          });
      });
      $scope.showLoading = function() {
        return loading;
      };
      $scope.showIntroduction = function() {
        return !loading && activeConversation.isEmpty;
      };
      $scope.showConversation = function() {
        return !loading && !activeConversation.isEmpty;
      };
      $scope.showSidePanel = function() {
        return $scope.showConversation() && screenWidth.isAbove(800);
      };
      $scope.isCloseNewConversationShowing = function() {
        return !conversations.newConversation.firstMessage;
      };
      $scope.closeNewConversation = function() {
        $scope.$emit("connect.new_conversation.cancelled");
      };
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversationHeader.js */
angular.module('sn.connect').directive('snConversationHeader', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('snConversationHeader.xml'),
    replace: true,
    scope: {
      conversation: '='
    },
    controller: function($scope, $element, $timeout, conversations, snAttachmentHandler, userID) {
      $scope.conversationTemp = {};
      $scope.middleAlignName = false;
      $scope.userID = userID;
      $scope.canEdit = function() {
        return $scope.conversation && $scope.conversation.isGroup;
      };
      $scope.getPrimaryUser = function() {
        return $scope.conversation.isGroup ?
          $scope.conversation.lastMessage.profileData :
          $scope.conversation.peer;
      };
      $scope.onlyShowName = function() {
        if ($scope.conversation.isHelpDesk)
          return false;
        if ($scope.conversation.isGroup)
          return !$scope.showDescription();
        if (!$scope.conversation.peer)
          return true;
        var detail = $scope.conversation.peer.detail;
        return !detail || !(detail.department || detail.city);
      };
      $scope.showDescription = function() {
        return $scope.conversation.isGroup && !(!$scope.conversation.description || $scope.conversation.description === "") &&
          !($scope.conversation.isHelpDesk && $scope.conversation.queueEntry.isTransferPending);
      };
      $scope.isEditable = function() {
        return $scope.conversation.isGroup && !$scope.conversation.isHelpDesk && $scope.conversation.amMember;
      };
      $scope.saveGroupEdit = function() {
        conversations.update($scope.conversation.sysID, $scope.conversationTemp);
      };
      $scope.openModal = function(evt) {
        if (evt.keyCode === 9 || !$scope.isEditable())
          return;
        $scope.conversationTemp = {
          name: $scope.conversation.name,
          description: $scope.conversation.description,
          access: $scope.conversation.access
        };
        angular.element("#chatGroupPopupModal").modal('show').find("#groupName").focus();
      };
      $scope.stopProp = function(event) {
        event.stopPropagation();
      };
      $scope.uploadNewGroupImage = function() {
        if ($scope.conversation.amMember)
          $timeout(function() {
            $element.find(".message-attach-file").click();
          }, 0, false);
      };
      $scope.getImageBackground = function() {
        return {
          'background-image': "url('" + $scope.conversation.avatar + "')"
        }
      };
      $scope.attachFiles = function(files) {
        $scope.uploading = true;
        snAttachmentHandler.create("live_group_profile", $scope.conversation.sysID).uploadAttachment(files.files[0], {
          sysparm_fieldname: "photo"
        }).then(function(response) {
          conversations.refreshConversation($scope.conversation.sysID);
          $scope.conversation.avatar = response.sys_id + ".iix";
          $scope.uploading = false;
        });
      }
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversationHeaderControls.js */
angular.module('sn.connect').directive('snConversationHeaderControls', function(getTemplateUrl, i18n) {
  'use strict';
  var knowledgeBaseTitle = "";
  var documentTitle = "";
  i18n.getMessages(["Knowledge Base", "Document"], function(results) {
    knowledgeBaseTitle = results["Knowledge Base"];
    documentTitle = results["Document"];
  });
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('snConversationHeaderControls.xml'),
    replace: true,
    scope: {
      conversation: '=',
      collapsible: '@'
    },
    link: function(scope, element, attrs) {
      attrs.$observe('collapsible', function(value) {
        scope.collapsible = scope.$eval(value || 'true');
      });
    },
    controller: function($scope, $element, $animate, snConversationAsideHistory, $timeout) {
      $scope.expandDirection = "left";
      $scope.activeAside = "";
      $scope.buttons = $element.find('#conversationAsideButtons');
      var activeAsideButton;
      var helpDeskAsides = ["knowledge", "record", "pending_record"];
      var pendingRecordKeys = {};
      var defaultAsideScope = $scope.$new();
      var asideViews = {
        members: {
          template: "<sn-aside-member-list></sn-aside-member-list>",
          scope: defaultAsideScope
        },
        info: {
          template: "<sn-aside-info></sn-aside-info>",
          scope: defaultAsideScope
        },
        attachments: {
          template: "<sn-aside-attachments></sn-aside-attachments>",
          scope: defaultAsideScope
        },
        notifications: {
          template: "<sn-aside-notifications></sn-aside-notifications>",
          scope: defaultAsideScope
        },
        knowledge: {
          template: function() {
            return "<sn-aside-frame name='knowledge' url=\"/$knowledge.do\" title='" + knowledgeBaseTitle + "'></sn-aside-frame>";
          },
          width: "50%",
          cacheKey: function() {
            return $scope.conversation.sysID + ".knowledgeBase";
          }
        },
        record: {
          template: function() {
            return "<sn-aside-frame name='record' url=\"/" + $scope.conversation.table + ".do?sys_id=" + $scope.conversation.document + "\" title=\"" + documentTitle + "\"></sn-aside-frame>";
          },
          width: "50%",
          cacheKey: function() {
            return $scope.conversation.sysID + ".record";
          }
        },
        pending_record: {
          template: "",
          width: "50%",
          cacheKey: function() {
            return pendingRecordKeys[$scope.conversation.sysID] ? pendingRecordKeys[$scope.conversation.sysID] : $scope.conversation.sysID + ".pending_record";
          }
        }
      };
      $scope.isShowInfo = function() {
        return !$scope.conversation.isHelpDesk && ($scope.conversation.document || $scope.conversation.resources.links.length > 0 || $scope.conversation.resources.records.length > 0);
      };
      $scope.isShowRecord = function() {
        return $scope.conversation.isHelpDesk && $scope.conversation.document && $scope.conversation.table != 'chat_queue_entry'
      };

      function stringFunction(stringOrFunction) {
        if (angular.isFunction(stringOrFunction))
          return stringOrFunction();
        return stringOrFunction;
      }
      $scope.$on("sn.aside.open", function(e, view) {
        var cacheKey = stringFunction(view.cacheKey);
        if (cacheKey && cacheKey.indexOf("pending_record") > -1) {
          pendingRecordKeys[$scope.conversation.sysID] = cacheKey;
        }
      });
      $scope.$watch("conversation.sysID", function() {
        var historicalAside = snConversationAsideHistory.getHistory($scope.conversation.sysID);
        if ($scope.conversation.restricted) {
          $scope.$emit("sn.aside.close");
          return;
        }
        var historicalAsideScopeValid = (historicalAside && historicalAside.scope && historicalAside.scope.$parent && !historicalAside.scope.$parent["$$destroyed"]);
        if (historicalAside && historicalAsideScopeValid) {
          $scope.$evalAsync(function() {
            $scope.$emit("sn.aside.open", historicalAside);
          });
          return;
        }
        if (!$scope.activeAside)
          return;
        if (!$scope.showInfo && $scope.activeAside === "info") {
          $scope.$emit("sn.aside.close");
          return;
        }
        if (helpDeskAsides.indexOf($scope.activeAside) >= 0 && !$scope.conversation.isHelpDesk) {
          $scope.$emit("sn.aside.close");
          return;
        }
        if ($scope.activeAside === "record" && $scope.conversation.table === "chat_queue_entry") {
          $scope.$emit("sn.aside.close");
          return;
        }
        if ($scope.activeAside === "pending_record" && !$scope.conversation.pendingRecord) {
          $scope.$emit("sn.aside.close");
          return;
        }
        $scope.$emit("sn.aside.open", asideViews[$scope.activeAside], asideWidth($scope.activeAside));
      });

      function asideWidth(view) {
        return asideViews[view].width || $scope.buttons.width();
      }
      $scope.$on("sn.aside.trigger_control", function(e, view) {
        if (!asideViews.hasOwnProperty(view))
          return;
        if ($scope.activeAside === view) {
          if ($scope.collapsible)
            $scope.$emit("sn.aside.close");
          return;
        }
        $scope.activeAside = view;
        $timeout(function() {
          $scope.$emit("sn.aside.open", asideViews[view], asideWidth(view));
        }, 0, false);
      });
      $scope.openAside = function(view) {
        $scope.$emit("sn.aside.trigger_control", view);
      };
      $scope.$on("sn.aside.controls.active", function(e, data) {
        activeAsideButton = $element.find('[aside-view-name="' + data + '"]');
        $scope.activeAside = data;
      });
      $scope.$on("sn.aside.close", function() {
        if (activeAsideButton) {
          activeAsideButton.focus();
        }
        $scope.activeAside = void(0);
        activeAsideButton = void(0);
      });

      function resizeAside(unused, phase) {
        if (phase === "close" && $scope.activeAside && asideViews[$scope.activeAside]) {
          $scope.$emit("sn.aside.resize", asideWidth($scope.activeAside));
        }
      }
      $animate.on('addClass', $scope.buttons, resizeAside);
      $animate.on('removeClass', $scope.buttons, resizeAside);
      $scope.close = function(evt) {
        if (evt.keyCode === 9)
          return;
        $scope.$emit("sn.aside.close");
      }
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversationItem.js */
angular.module('sn.connect.conversation').directive('snConversationItem', function(
  getTemplateUrl, inSupportClient, conversations, activeConversation) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl(inSupportClient ? 'snConversationItem-SupportClient.xml' : 'snConversationItem.xml'),
    replace: true,
    scope: {
      conversation: '='
    },
    controller: function($scope, $rootScope) {
      $scope.isBadgeVisible = function() {
        return ($scope.conversation.unreadCount > 0) && !$scope.isTransferPending();
      };
      $scope.getUserFromProfile = function(conversation) {
        return conversation.isGroup ? conversation.lastMessage.profileData : conversation.peer;
      };
      $scope.remove = function($event) {
        if ($event && $event.keyCode === 9)
          return;
        $event.stopPropagation();
        closeConversation();
      };

      function closeConversation() {
        if (conversations.close($scope.conversation.sysID)) {
          $rootScope.$broadcast("sn.aside.clearCache", $scope.conversation.sysID);
          activeConversation.clear($scope.conversation);
        }
      }
      return {
        closeConversation: closeConversation
      }
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snSupportConversationItem.js */
angular.module('sn.connect.conversation').directive('snSupportConversationItem', function(getTemplateUrl, inSupportClient) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl(inSupportClient ? 'snConversationItem-SupportClient.xml' : 'snSupportConversationItem.xml'),
    replace: true,
    require: 'snConversationItem',
    scope: {
      conversation: '='
    },
    controller: function($scope, $rootScope, activeConversation, queueEntries,
      queueEntryNotifier, supportEnabled, inFrameSet, snConversationItemDirective) {
      var parent = snConversationItemDirective[0].controller.apply(this, arguments);
      $scope.supportEnabled = supportEnabled || false;
      for (var i = 0; i < $scope.conversation.members.length; i++)
        if ($scope.conversation.members[i].document === $scope.conversation.queueEntry.openedBy)
          $scope.openedBy = $scope.conversation.members[i];
      $scope.acceptTransfer = function($event) {
        $event.stopPropagation();
        $scope.conversation.queueEntry.clearTransferState();
        queueEntries.accept($scope.conversation.sysID);
        activeConversation.conversation = $scope.conversation;
      };
      $scope.rejectTransfer = function($event) {
        $event.stopPropagation();
        $scope.conversation.queueEntry.clearTransferState();
        queueEntries.reject($scope.conversation.sysID);
        if ($scope.conversation.queueEntry.transferShouldClose)
          parent.closeConversation();
      };
      $scope.cancelTransfer = function($event) {
        $event.stopPropagation();
        $scope.conversation.queueEntry.clearTransferState();
        queueEntries.cancel($scope.conversation.sysID);
      };
      $scope.isTransferPending = function() {
        return !!$scope.conversation.isHelpDesk && $scope.conversation.queueEntry.isTransferPending;
      };
      $scope.isSendingTransfer = function() {
        return $scope.isTransferPending() && $scope.conversation.queueEntry.isTransferringFromMe;
      };
      $scope.isReceivingTransfer = function() {
        return $scope.isTransferPending() && $scope.conversation.queueEntry.isTransferringToMe;
      };
      $rootScope.$on("connect.queueEntry.updated", queueEntryUpdated);
      queueEntryUpdated(undefined, $scope.conversation.queueEntry);

      function queueEntryUpdated(event, queueEntry, old) {
        if (queueEntry.conversationID !== $scope.conversation.sysID)
          return;
        if (!queueEntry)
          return;
        var initial = angular.isUndefined(old);
        if (!queueEntry.isTransferStateChanged && !initial)
          return;
        if ((inFrameSet || activeConversation.isEmpty) &&
          queueEntry.isTransferringToMe && queueEntry.isTransferPending)
          activeConversation.conversation = $scope.conversation;
        var isTransferNegative = queueEntry.isTransferCancelled || queueEntry.isTransferRejected;
        if (queueEntry.isTransferringToMe &&
          queueEntry.transferShouldClose &&
          isTransferNegative)
          parent.closeConversation();
        queueEntryNotifier.notify($scope.conversation);
      }
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snChatTab.js */
angular.module('sn.connect.conversation').directive('snChatTab', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('snChatTab.xml'),
    replace: true,
    scope: {},
    controller: function($scope, $rootScope, $filter, conversations, activeConversation,
      inFrameSet, supportEnabled, supportAddMembers) {
      $scope.isSupportListEnabled = !supportEnabled && supportAddMembers;
      if (!inFrameSet) {
        var index = 0;
        $scope.$watch(function() {
          return activeConversation.sysID;
        }, function(sysID) {
          if (!sysID)
            return;
          index = conversations.find(activeConversation.conversation, filterConversations(true)).index;
          if (index < 0)
            index = 0;
        });
        $scope.$watchCollection(function() {
          return filterConversations(true);
        }, function(conversationList) {
          if (activeConversation.isSupport)
            return;
          if (conversationList.length === 0)
            return;
          if (!activeConversation.isEmpty)
            return;
          activeConversation.conversation = getIndexConversation(conversationList);
        });
        $scope.$on('connect.conversation.select', function(unused, tab, conversationID) {
          if (activeConversation.getTab(tab).isSupport)
            return;
          conversationID = conversationID || activeConversation.sysID;
          var conversationList = filterConversations(!conversationID);
          var conversation;
          if (conversationID)
            conversation = conversations.find(conversationID, conversationList).conversation;
          activeConversation.conversation = conversation || getIndexConversation(conversationList);
        });
        var getIndexConversation = function(conversationList) {
          if (index >= conversationList.length)
            index = conversationList.length - 1;
          if (index < 0)
            index = 0;
          return conversationList[index];
        }
      }
      $scope.supportConversationsFilter = function(conversations) {
        return supportEnabled ?
          [] :
          getConversations(conversations, true, true, $scope.searchTerm);
      };
      $scope.openConversationsFilter = function(conversations) {
        return getConversations(conversations, true, false, $scope.searchTerm);
      };
      $scope.closedConversationsFilter = function(conversations) {
        return getConversations(conversations, false, false, $scope.searchTerm);
      };

      function getConversations(conversations, visible, support, searchTerm) {
        var searchFiltered = $filter('searchTerm')(conversations, searchTerm);
        if (searchFiltered.length === 0)
          return [];
        return $filter('conversation')(searchFiltered, visible, support);
      }

      function filterConversations(visible) {
        if (!visible)
          return getConversations(conversations.all);
        return $scope.supportConversationsFilter(conversations.all)
          .concat($scope.openConversationsFilter(conversations.all));
      }
      $scope.triggerCreateConversation = function(evt) {
        if (evt && evt.keyCode === 9)
          return;
        $rootScope.$broadcast("connect.show_create_conversation_screen");
        $rootScope.$broadcast('connect.pane.close');
      };
      $scope.clearFilterText = function() {
        $scope.searchTerm = "";
      };
      $scope.hasSearchText = function() {
        return $scope.searchTerm && $scope.searchTerm.length > 0;
      };
      $scope.showOpenHeader = function() {
        return ($scope.hasSearchText() || hasSupportConversations()) &&
          hasOpenConversations();
      };
      $scope.showClosedHeader = function() {
        return $scope.hasSearchText() &&
          hasClosedConversations();
      };
      $scope.showMessageBlock = function() {
        return ($scope.showNoChatConversations() ||
          $scope.showNoSearchResults());
      };
      $scope.showNoChatConversations = function() {
        return !$scope.hasSearchText() &&
          filterConversations(true).length === 0;
      };
      $scope.showNoSearchResults = function() {
        return $scope.hasSearchText() &&
          !hasSupportConversations() &&
          !hasOpenConversations() &&
          !hasClosedConversations();
      };

      function hasSupportConversations() {
        return $scope.supportConversationsFilter(conversations.all).length > 0;
      }

      function hasOpenConversations() {
        return $scope.openConversationsFilter(conversations.all).length > 0;
      }

      function hasClosedConversations() {
        return $scope.closedConversationsFilter(conversations.all).length > 0;
      }
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snSupportTab.js */
angular.module('sn.connect.conversation').directive('snSupportTab', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('snSupportTab.xml'),
    replace: true,
    scope: {},
    controller: function($scope, $filter, conversations, activeConversation, inFrameSet) {
      if (!inFrameSet) {
        $scope.$watchCollection(function() {
          return filterConversations();
        }, function(conversationList) {
          if (!activeConversation.isSupport)
            return;
          if (conversationList.length === 0)
            return;
          if (activeConversation.isEmpty)
            activeConversation.conversation = conversationList[0];
        });
      }
      $scope.primarySupportConversationsFilter = function(conversations) {
        return supportConversationsFilter(conversations, true);
      };
      $scope.secondarySupportConversationsFilter = function(conversations) {
        return supportConversationsFilter(conversations, false);
      };

      function supportConversationsFilter(conversations, primary) {
        return $filter('conversation')(conversations, true, true).filter(function(conversation) {
          var queueEntry = conversation.queueEntry;
          return primary === (queueEntry.isAssignedToMe || queueEntry.isTransferringToMe);
        });
      };

      function filterConversations() {
        return $scope.primarySupportConversationsFilter(conversations.all)
          .concat($scope.secondarySupportConversationsFilter(conversations.all));
      }
      $scope.$on('connect.conversation.select', function(unused, tab, conversationID) {
        if (!activeConversation.getTab(tab).isSupport)
          return;
        if (!activeConversation.isEmpty && activeConversation.sysID === conversationID)
          return;
        conversationID = conversationID || activeConversation.sysID;
        var conversationList = filterConversations();
        var conversation;
        if (conversationID)
          conversation = conversations.find(conversationID, conversationList).conversation;
        activeConversation.conversation = conversation || conversationList[0];
      });
      $scope.showNoSupportSession = function() {
        return filterConversations().length === 0;
      };
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversationList.js */
angular.module('sn.connect.conversation').directive('snConversationList', function(getTemplateUrl, i18n) {
  'use strict';
  var unreadMessage = 'Unread Messages';
  i18n.getMessages([unreadMessage], function(i18nNames) {
    unreadMessage = i18nNames[unreadMessage];
  });
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('snConversationList.xml'),
    scope: {
      headerText: '@',
      isHelpDesk: '=?',
      filter: '&?',
      isHeaderVisible: '&?'
    },
    controller: function($scope, $rootScope, conversations, activeConversation, inSupportClient, inFrameSet) {
      var focusedConversation;
      $scope.isHelpDesk = $scope.isHelpDesk || false;
      $scope.conversations = [];
      $scope.inFrameSet = inFrameSet;
      if (angular.isUndefined($scope.isHeaderVisible)) {
        $scope.isHeaderVisible = function() {
          return function() {
            return $scope.conversations.length > 0;
          };
        }
      } else {
        var value = $scope.isHeaderVisible();
        if (!angular.isFunction(value)) {
          $scope.isHeaderVisible = function() {
            return function() {
              return value;
            };
          }
        }
      }
      $scope.$watchCollection(function() {
        if ($scope.filter)
          return $scope.filter()(conversations.all);
        return conversations.all;
      }, function(conversations) {
        $scope.conversations = conversations || [];
      });
      $scope.isActive = function(conversation) {
        return activeConversation.isActive(conversation) || conversation === focusedConversation;
      };
      $scope.selectConversation = function(conversation) {
        $rootScope.$broadcast('connect.open.floating', conversation);
        $rootScope.$broadcast("connect.new_conversation.cancelled");
        activeConversation.conversation = conversation;
      };
      $scope.focusConversation = function(conversation, reverse) {
        if (reverse && focusedConversation === conversation) {
          focusedConversation = undefined;
        } else {
          focusedConversation = conversation;
        }
      };
      $scope.getAriaText = function(conversation) {
        var text = inSupportClient ?
          conversation.description :
          conversation.name;
        text += conversation.unreadCount ?
          ' ' + conversation.formattedUnreadCount + ' ' + unreadMessage :
          '';
        return text;
      }
      $scope.conversationDelta = function(conversation) {
        return conversation.sysID + conversation.avatar + conversation.name;
      }
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversationListContainer.js */
angular.module('sn.connect.conversation').directive('snConversationListContainer', function(
  getTemplateUrl, conversations, i18n) {
  'use strict';
  var supportTabAriaLabel = "Support Conversations - {0} Unread Messages";
  i18n.getMessages([supportTabAriaLabel], function(results) {
    supportTabAriaLabel = results[supportTabAriaLabel];
  });
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('snConversationListContainer.xml'),
    replace: true,
    scope: {},
    link: function(scope, element) {
      conversations.loaded.then(function() {
        element.removeClass("loading");
      })
    },
    controller: function($scope, $rootScope, $filter, snCustomEvent, conversationFactory, queues,
      activeConversation, supportEnabled, inFrameSet, chatEnabled) {
      $scope.inFrameSet = inFrameSet;
      $scope.supportEnabled = supportEnabled;
      $scope.chatEnabled = chatEnabled;
      $scope.showTabs = function() {
        return supportEnabled && chatEnabled;
      };
      $scope.getSupportTabAriaLabel = function() {
        return i18n.format(supportTabAriaLabel, $scope.getSupportUnreadCount());
      };
      $scope.isUsersWaitingIndicatorShowing = function() {
        return (queues.getAllWaitingCount() > 0) && !$scope.isSupport();
      };
      snCustomEvent.observe('chat:open_conversation', function(profile) {
        var cachedPeerConversations = conversations.getCachedPeerConversations(profile.userID || profile.sys_id);
        if (cachedPeerConversations[0]) {
          activeConversation.tab = 'chat';
          activeConversation.conversation = cachedPeerConversations[0];
        } else {
          $rootScope.$broadcast("connect.show_create_conversation_screen", profile);
        }
      });
      $scope.isSupport = function() {
        return activeConversation.isSupport;
      };
      $scope.openChat = openTab('chat');
      $scope.openSupport = openTab('support');

      function openTab(tab) {
        return function() {
          activeConversation.tab = tab;
        }
      }
      $scope.getChatUnreadCount = getUnreadCount(false);
      $scope.getSupportUnreadCount = getUnreadCount(true);

      function getUnreadCount(isSupport) {
        return function() {
          var unreadCount = 0;
          $filter('conversation')(conversations.all, true, isSupport)
            .forEach(function(conversation) {
              if (isSupport && conversation.queueEntry && conversation.queueEntry.isTransferringToMe)
                return;
              unreadCount += conversation.unreadCount;
            });
          return conversationFactory.formatUnreadCount(unreadCount);
        }
      }
      $scope.$watch(function() {
        return $scope.getChatUnreadCount() + $scope.getSupportUnreadCount();
      }, function(unreadCount) {
        CustomEvent.fireTop('connect:message_notification.update', unreadCount);
      });
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snConversationSearch.js */
angular.module('sn.connect.conversation').directive('snConversationSearch', function(getTemplateUrl, $timeout) {
  "use strict";
  return {
    restrict: 'E',
    scope: {
      title: "@",
      table: "=",
      name: "=",
      icon: "@",
      qualifier: "=?",
      searchField: "=?",
      onSelect: "&"
    },
    templateUrl: getTemplateUrl('snConversationSearch.xml'),
    replace: true,
    link: function(scope, element) {
      scope.search = function(evt) {
        $timeout(function() {
          element.find(".select2-choice").triggerHandler("mousedown");
          evt.preventDefault();
        }, 0, false);
        return false;
      }
    },
    controller: function($scope) {
      $scope.descriptor = {
        reference: $scope.table,
        attributes: '',
        name: $scope.name,
        searchField: $scope.searchField,
        qualifier: $scope.qualifier
      };
      $scope.valueSelected = function() {
        $scope.onSelect({
          value: "live_profile." + $scope.field.value
        })
      };
      $scope.field = {};
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snCreateNewConversationHeader.js */
angular.module('sn.connect.conversation').directive('snCreateNewConversationHeader', function(getTemplateUrl, $timeout) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('snCreateNewConversationHeader.xml'),
    replace: true,
    link: function(scope, elem) {
      var input;
      scope.focusOnInput = function() {
        if (!input)
          input = elem.find("input");
        input.focus();
      };
      scope.scrollRecipientListToBottom = function() {
        $timeout(function() {
          var recipientListElem = document.getElementById("create-conversation-recipient-list");
          recipientListElem.scrollTop = recipientListElem.scrollHeight;
        }, 0, false);
      };
      var unWatch = scope.$on("live.search.control.ready", function(evt, control) {
        if (control)
          input = control;
        $timeout(scope.focusOnInput, 0, false);
        unWatch();
      });
    },
    controller: function($scope, $rootScope, activeConversation, conversations, snCustomEvent) {
      snCustomEvent.observe('connect:member_profile.direct_message', function(suggestion) {
        $scope.selectedMember(null, suggestion);
        if (suggestion)
          $scope.$broadcast("connect.message.focus", $scope.newConversation);
      });
      $rootScope.$on("connect.member_profile.direct_message", function(evt, suggestion) {
        $scope.selectedMember(null, suggestion);
        if (suggestion)
          $scope.$broadcast("connect.message.focus", $scope.newConversation);
      });

      function updatePendingConversation() {
        var conversation = conversations.newConversation;
        var pendingRecipients = conversation.pendingRecipients;
        if (pendingRecipients.length === 1) {
          var userSysID = pendingRecipients[0].sysID;
          var cachedPeerConversation = conversations.getCachedPeerConversations(userSysID)[0];
          if (cachedPeerConversation) {
            conversation = angular.copy(cachedPeerConversation);
            conversation.isPending = true;
          }
        }
        activeConversation.pendingConversation = conversation;
      }
      $scope.pendingRecipients = function() {
        return conversations.newConversation.pendingRecipients;
      };
      $scope.isAddUserShowing = function() {
        return !conversations.newConversation.firstMessage;
      };
      $scope.ignoreList = function() {
        return conversations.newConversation.pendingRecipients.map(function(recipient) {
          return recipient.sysID;
        }).join(',');
      };
      $scope.selectedMember = function(id, suggestion) {
        var sys_id = suggestion.sys_id || suggestion.userID || suggestion.jid.split(".")[1];
        var recipient = {
          name: suggestion.name,
          jid: suggestion.jid || (suggestion.table + "." + sys_id),
          sysID: sys_id
        };
        var alreadyAdded = conversations.newConversation.pendingRecipients
          .some(function(obj) {
            return angular.equals(obj, recipient);
          });
        if (!alreadyAdded) {
          conversations.newConversation.pendingRecipients.push(recipient);
          updatePendingConversation();
        }
        $scope.scrollRecipientListToBottom();
      };
      $scope.removeRecipient = function(event, index) {
        if (event && event.keyCode === 9)
          return;
        conversations.newConversation.pendingRecipients.splice(index, 1);
        updatePendingConversation();
        $scope.focusOnInput();
      };
      $scope.$on("connect.search_control_key", function(evt, key) {
        $scope.$evalAsync(function() {
          if (key === "backspace") {
            conversations.newConversation.pendingRecipients.pop();
            updatePendingConversation();
          } else if (key === "enter")
            $rootScope.$broadcast("connect.message.focus", activeConversation.pendingConversation);
          else if (key === "escape")
            $scope.$emit("connect.new_conversation.cancelled");
        });
      });
      $scope.$on("connect.message_control_key", function(evt, key) {
        if (key === "escape")
          $scope.$emit("connect.new_conversation.cancelled");
      });
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snFloatingConversation.js */
angular.module('sn.connect.conversation').directive('snFloatingConversation', function(getTemplateUrl, $timeout, $animate, isRTL) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('snFloatingConversation.xml'),
    replace: true,
    scope: {
      position: '=',
      conversation: '='
    },
    link: function(scope, element) {
      scope.$watch('position', function() {
        $timeout(function() {
          var property = isRTL ? 'left' : 'right';
          element.css(property, scope.position);
          element.addClass('loaded');
        }, 0, false);
      });
      scope.animateClose = function() {
        return $animate.addClass(element, "state-closing");
      };
      scope.$watch('conversation.isFrameStateOpen', function(value, old) {
        if (value === old)
          return;
        scope.$broadcast('connect.auto_scroll.scroll_to_bottom', scope.conversation);
      });
      element.on("click", function(evt) {
        scope.focusOnConversation();
      });
    },
    controller: function($scope, $rootScope, activeConversation, resourcePersister, profiles, queueEntries,
      documentsService, userID, $timeout, snCustomEvent, audioNotifier, supportAddMembers,
      connectDropTargetService) {
      $scope.activeConversation = activeConversation;
      $scope.userID = userID;
      $scope.popoverOpen = function(evt) {
        var el = angular.element(evt.target).closest(".sn-navhub-content").find(".sub-avatar");
        $timeout(function() {
          angular.element(el).trigger('click')
        }, 0);
      };
      CustomEvent.observe('glide:nav_sync_list_with_form', function(conversation) {
        $scope.$apply(function() {
          setSpotlighted(conversation);
        })
      });
      $scope.$on("connect.spotlight", function(evt, conversation) {
        setSpotlighted(conversation);
      });

      function setSpotlighted(conversation) {
        $scope.isSpotlighted =
          conversation.table === $scope.conversation.table &&
          conversation.sysID === $scope.conversation.document;
      }
      $scope.focusOnConversation = function(event) {
        activeConversation.conversation = $scope.conversation;
        if (!event)
          return;
        if (!$scope.conversation.isPending)
          return;
        if (angular.element(event.target).parents(".sn-add-users").length !== 0)
          return;
        $rootScope.$broadcast("connect.message.focus", $scope.conversation);
      };
      $scope.isCurrentConversation = function() {
        return activeConversation.isActive($scope.conversation);
      };
      $scope.isReadMessages = function() {
        return $scope.isCurrentConversation() && $scope.conversation.isFrameStateOpen;
      };
      $scope.isTransferPending = function() {
        var queueEntry = $scope.conversation.queueEntry;
        return queueEntry && queueEntry.isTransferPending && queueEntry.isTransferringToMe;
      };
      $scope.isCloseButtonShowing = function() {
        return !$scope.conversation.isPending || !$scope.conversation.firstMessage;
      };
      if ($scope.isTransferPending())
        audioNotifier.notify($scope.conversation.sysID);
      $scope.$on("connect.floatingConversationEscape", function(evt) {
        $scope.removeConversation(evt);
      });
      $scope.removeConversation = function($event) {
        if ($event && $event.keyCode === 9)
          return;
        snCustomEvent.fireTop('snAvatar.closePopover');
        $rootScope.$broadcast('mentio.closeMenu');
        $scope.stopPropagation($event);
        $scope.animateClose().then(function() {
          if ($scope.conversation.isPending) {
            $rootScope.$broadcast("connect.new_conversation.cancelled");
            return;
          }
          $scope.conversation.closeFrameState();
          activeConversation.clear($scope.conversation);
        })
      };
      $scope.getWindowTarget = function() {
        return '_blank';
      };
      $scope.showDocument = function(table, sysID, $event) {
        $scope.stopPropagation($event);
        documentsService.show(table, sysID);
      };
      $scope.showDocumentIfExists = function($event) {
        if ($scope.isDocumentConversation())
          $scope.showDocument($scope.conversation.table, $scope.conversation.document, $event);
      };
      $scope.stopPropagation = function($event) {
        if ($event)
          $event.stopPropagation();
      };
      var toggleOpenLock;
      $scope.toggleOpen = function($event) {
        $scope.stopPropagation($event);
        if (toggleOpenLock && $event.timeStamp === toggleOpenLock) {
          toggleOpenLock = null;
          return;
        } else
          toggleOpenLock = $event.timeStamp;
        if ($scope.conversation.isFrameStateOpen) {
          snCustomEvent.fireTop('snAvatar.closePopover');
          $scope.conversation.minimizeFrameState();
          if (activeConversation.isActive($scope.conversation))
            activeConversation.clear();
        } else {
          $scope.conversation.openFrameState();
          $timeout(function() {
            activeConversation.conversation = $scope.conversation;
          }, 0, false);
        }
      };
      $scope.isPendingVisible = function() {
        return $scope.isTransferPending() || $scope.conversation.isPending;
      };
      $scope.isAddUserButtonVisible = function() {
        var conversation = $scope.conversation;
        if (!conversation.isHelpDesk)
          return conversation.isGroup;
        return supportAddMembers &&
          conversation.queueEntry.isActive;
      };
      $scope.activateDropTarget = function() {
        connectDropTargetService.activateDropTarget($scope.conversation);
      };
      $scope.deactivateDropTarget = function() {
        connectDropTargetService.deactivateDropTarget($scope.conversation);
      };
      $scope.onFileDrop = function(files) {
        connectDropTargetService.onFileDrop(files, $scope.conversation);
      };
      $scope.handleDropEvent = function(data) {
        connectDropTargetService.handleDropEvent(data, $scope.conversation);
      };
      $scope.getPrimary = function() {
        return $scope.conversation.isGroup ?
          $scope.conversation.lastMessage.profileData :
          $scope.conversation.peer;
      };
      $scope.$watch('conversation', function(conversation) {
        if (activeConversation.isActive(conversation) && !conversation.isFrameStateOpen)
          activeConversation.clear();
      });
      $scope.$watch('conversation.queueEntry', function updateAssignedToProfile() {
        if (!$scope.conversation.isHelpDesk)
          return;
        profiles.getAsync('sys_user.' + $scope.conversation.queueEntry.assignedTo).then(function(profile) {
          $scope.assignedToProfile = profile;
        });
      });
      $scope.acceptTransfer = function($event) {
        $scope.stopPropagation($event);
        queueEntries.accept($scope.conversation.sysID);
      };
      $scope.rejectTransfer = function($event) {
        $scope.stopPropagation($event);
        queueEntries.reject($scope.conversation.sysID);
        $scope.removeConversation();
      };
      $scope.isDocumentConversation = function() {
        return $scope.conversation.document !== '';
      }
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snFloatingConversationCompressed.js */
angular.module('sn.connect.conversation').directive('snFloatingConversationCompressed', function(getTemplateUrl, $timeout, isRTL) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl("snFloatingConversationCompressed.xml"),
    replace: true,
    scope: {
      start: '=',
      position: '='
    },
    link: function(scope, element) {
      var positionProperty = isRTL ? 'left' : 'right';
      if (element.hideFix) {
        element.hideFix();
      }
      scope.$watch("start", setRightCoordinate);

      function setRightCoordinate() {
        $timeout(function() {
          element.css(positionProperty, scope.position);
        }, 0, false);
      }
      setRightCoordinate();
    },
    controller: function($scope, $rootScope, $filter, conversations, activeConversation) {
      $scope.filterConversations = function() {
        return $filter('frameSet')(conversations.all);
      };
      $scope.isVisible = function() {
        return $scope.compressConversations.length > 0;
      };
      $scope.openConversation = function(conversation, $event) {
        if ($event && $event.keyCode === 9)
          return;
        $rootScope.$broadcast('connect.open.floating', conversation);
      };
      $scope.closeConversation = function(conversation, $event) {
        if ($event && $event.keyCode === 9)
          return;
        conversation.closeFrameState();
        activeConversation.clear();
      };
      $scope.toggleOpen = function() {
        $scope.open = !$scope.open;
      };
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/directive.snFloatingConversationContainer.js */
angular.module('sn.connect.conversation').directive('snFloatingConversationContainer', function(
  getTemplateUrl, $rootScope, documentLinkMatcher, conversations, activeConversation) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('snFloatingConversationContainer.xml'),
    scope: {},
    link: function(scope) {
      var mainFrame = angular.element("#gsft_main");
      if (mainFrame.length > 0) {
        scope.$watch(function() {
          return mainFrame[0].contentDocument.location.href;
        }, checkForRecord);
        mainFrame.on("load", function() {
          scope.$digest();
        });
        mainFrame.on("click", function() {
          scope.$apply(function() {
            checkForRecord(mainFrame[0].contentDocument.location.href)
          })
        })
      }
      CustomEvent.observe("connect:open_group", function(data) {
        conversations.followDocumentConversation(data).then(function(conversation) {
          activeConversation.conversation = conversation;
        })
      });
      CustomEvent.observe("connect:follow_document", conversations.followDocumentConversation);
      CustomEvent.observe("connect:unfollow_document", conversations.unfollowDocumentConversation);

      function checkForRecord(newValue) {
        if (!documentLinkMatcher.isLink(newValue))
          return;
        $rootScope.$broadcast("connect.spotlight", documentLinkMatcher.getRecordData(newValue));
      }
    },
    controller: function($scope, $element, $filter, $timeout, $window, snRecordPresence, conversationPersister, isRTL) {
      angular.element('document').append($element);
      var FRAME_SPACING = 350;
      var FRAME_COMPRESSED = 60;
      var FRAME_SEPARATOR = 10;
      var ASIDE_WIDTH = 285;
      $scope.activeConversation = activeConversation;
      conversations.refreshAll().then(function() {
        activeConversation.conversation = getFirstFocusConversation();
      });
      $scope.filterConversations = function() {
        return $filter('frameSet')(conversations.all);
      };
      $scope.visibleFilterConversations = function() {
        var convs = $scope.filterConversations();
        return convs.slice(0, $scope.getConversationDisplayCount()).reverse();
      };
      var isAsideOpen = false;
      CustomEvent.observe("connect:conversation_list:state", function(state) {
        isAsideOpen = state === "open";
        resize();
      });
      angular.element($window).bind('resize', resize);
      var conversationDisplayCount = calculateConversationDisplayCount();
      var resizeTimeout;

      function resize() {
        if (resizeTimeout)
          $timeout.cancel(resizeTimeout);
        resizeTimeout = $timeout(function() {
          conversationDisplayCount = calculateConversationDisplayCount();
        }, 100);
      }

      function calculateConversationDisplayCount() {
        var frameWidth = $window.innerWidth;
        if (isAsideOpen)
          frameWidth -= ASIDE_WIDTH;
        var allWidth = $scope.filterConversations().length * FRAME_SPACING;
        frameWidth -= (allWidth > frameWidth) ? FRAME_COMPRESSED : FRAME_SEPARATOR;
        return Math.max(Math.floor(frameWidth / FRAME_SPACING), 1);
      }
      $scope.getConversationDisplayCount = function() {
        return conversationDisplayCount - (activeConversation.pendingConversation ? 1 : 0);
      };
      $scope.getCompressPosition = function() {
        return $scope.getContainerPosition(conversationDisplayCount);
      };
      $scope.getContainerPosition = function(index) {
        return index * FRAME_SPACING + FRAME_SEPARATOR;
      };
      $scope.newConversation = function() {
        return conversations.newConversation;
      };
      $scope.$watch(function() {
        return activeConversation.sysID;
      }, function(sysID) {
        if (!sysID) {
          activeConversation.conversation = getFirstFocusConversation();
          sysID = activeConversation.sysID;
        }
        if (sysID)
          snRecordPresence.initPresence("live_group_profile", sysID);
      });

      function getFirstFocusConversation() {
        if (activeConversation.pendingConversation)
          return activeConversation.pendingConversation;
        var first = undefined;
        $scope.filterConversations()
          .some(function(conversation, index) {
            if (!conversation.isFrameStateOpen)
              return false;
            if (index > conversationDisplayCount)
              return false;
            first = conversation;
            return true;
          });
        return first;
      }
      $scope.$on("connect.show_create_conversation_screen", function(evt, preloadedMember) {
        if (activeConversation.pendingConversation)
          return;
        activeConversation.pendingConversation = conversations.newConversation.$reset();
        if (preloadedMember)
          $timeout(function() {
            $rootScope.$broadcast("connect.member_profile.direct_message", preloadedMember);
            $timeout(function() {
              $rootScope.$broadcast("connect.member_profile.direct_message", preloadedMember)
            }, 0, false);
          });
      });
      $scope.$on("connect.new_conversation.cancelled", function() {
        activeConversation.pendingConversation = undefined;
        if (activeConversation.isEmpty)
          activeConversation.conversation = getFirstFocusConversation();
      });
      $scope.$on("connect.new_conversation.complete", function(event, conversation) {
        activeConversation.pendingConversation = undefined;
        moveToTop(conversation);
      });
      $scope.$on("connect.open.floating", function(event, conversation) {
        moveToTop(conversation);
      });

      function moveToTop(conversation) {
        if (conversation.isPending)
          return;
        if (!conversation)
          return;
        conversation.openFrameState();
        var conversationList = $scope.filterConversations();
        var position = conversations.find(conversation, conversationList).index;
        if (position < 1) {
          activeConversation.conversation = conversation;
          $scope.$broadcast('connect.auto_scroll.jump_to_bottom');
          return;
        }
        conversationList.splice(position, 1);
        conversationList.unshift(conversation);
        conversationPersister.changeFrameOrder(conversationList.map(function(conversation, index) {
          conversation.frameOrder = index;
          return conversation.sysID;
        }));
        activeConversation.conversation = conversation;
        $scope.$broadcast('connect.auto_scroll.jump_to_bottom');
      }
      if (angular.element(document.body).data().layout) {
        var $connectFloating = $element.find('.sn-connect-floating');
        var positionProperty = isRTL ? 'left' : 'right';
        $connectFloating.css(positionProperty, "5px");
        $scope.$on("pane.collapsed", function(evt, position, collapsed) {
          $connectFloating.css(positionProperty, collapsed ? "5px" : "290px");
        });
      }
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/filter.searchTerm.js */
angular.module('sn.connect.conversation').filter('searchTerm', function() {
  'use strict';
  return function(input, searchTerm) {
    if (!searchTerm || searchTerm.length === 0)
      return input;
    var directMessages = [],
      groupMessages = [];
    input.filter(function(item) {
      if (item.isGroup)
        groupMessages.push(item);
      else
        directMessages.push(item);
    });
    var tempA = [],
      tempB = [];
    directMessages.filter(function(item) {
      if (item.name.indexOf(searchTerm) === 0) {
        tempA.push(item);
      } else {
        tempB.push(item);
      }
    });
    directMessages = tempA.concat(tempB);
    tempA = [];
    tempB = [];
    groupMessages.filter(function(item) {
      if (item.name.indexOf(searchTerm) === 0 || item.description.indexOf(searchTerm) === 0) {
        tempA.push(item);
      } else {
        tempB.push(item);
      }
    });
    groupMessages = tempA.concat(tempB);
    var newInput = directMessages.concat(groupMessages);

    function contains(s, t) {
      var s2 = s.toUpperCase();
      var t2 = t.toUpperCase();
      return s2.indexOf(t2) > -1;
    }
    return newInput.filter(function(entry) {
      return contains(entry.name, searchTerm) || contains(entry.description, searchTerm)
    });
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/filter.conversation.js */
angular.module('sn.connect.conversation').filter('conversation', function(
  inSupportClient, supportEnabled, supportAddMembers, closedConversationLimit) {
  'use strict';

  function isConversationDisplayable(conversation, isHelpDesk) {
    if (conversation.type == "interaction") {
      return false;
    }
    if (inSupportClient)
      return conversation.isHelpDesk && conversation.queueEntry.isOpenedByMe;
    if (isHelpDesk !== conversation.isHelpDesk)
      return false;
    if (!isHelpDesk)
      return true;
    return (supportEnabled || supportAddMembers) &&
      !conversation.queueEntry.isOpenedByMe;
  }

  function isOpenSession(conversation, isOpenSession) {
    if (!conversation.isHelpDesk)
      return false;
    return !isOpenSession ===
      (conversation.queueEntry.isClosedByAgent || conversation.queueEntry.isAbandoned);
  }

  function isVisible(conversation, visible) {
    return conversation.visible === visible;
  }

  function filter(input, filter, fn) {
    return angular.isUndefined(filter) ?
      input :
      input.filter(function(conversation) {
        return fn(conversation, filter);
      });
  }
  return function(input, visible, helpDesk, openSession) {
    if (angular.isObject(visible)) {
      var object = visible;
      visible = object.visible;
      helpDesk = object.helpDesk;
      openSession = object.openSession;
    }
    input = filter(input, visible, isVisible);
    input = filter(input, helpDesk, isConversationDisplayable);
    input = filter(input, openSession, isOpenSession);
    input.sort(function(conv1, conv2) {
      return conv2.sortIndex - conv1.sortIndex;
    });
    if (angular.isDefined(openSession) && !openSession && closedConversationLimit)
      input = input.slice(0, closedConversationLimit);
    return input;
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/conversation/filter.frameSet.js */
angular.module('sn.connect.conversation').filter('frameSet', function() {
  'use strict';
  return function(input) {
    return input.filter(function(conversation) {
      return !conversation.isFrameStateClosed && conversation.visible;
    }).sort(function(conv1, conv2) {
      return conv1.frameOrder - conv2.frameOrder;
    });
  }
});;;
/*! RESOURCE: /scripts/app.ng_chat/resource/js_includes_connect_resource.js */
/*! RESOURCE: /scripts/app.ng_chat/resource/_module.js */
angular.module("sn.connect.resource", ["ng.common"]);;
/*! RESOURCE: /scripts/app.ng_chat/resource/factory.LiveLink.js */
angular.module("sn.connect.resource").factory("liveLinkFactory", function(
  $sce, $window, attachmentFactory, inFrameSet, enforceFrameSetLinking) {
  "use strict";

  function linkObject(link, external, type) {
    var isConnectType = (type === 'connect');
    external |= isConnectType;
    var url = (inFrameSet || external || !enforceFrameSetLinking) ?
      link :
      "/nav_to.do?uri=" + encodeURIComponent(link);
    var target =
      (!inFrameSet && isConnectType) ? "_self" :
      (inFrameSet && !external) ? 'gsft_main' :
      "_blank";
    var classType = external ? "external-link" : "internal-link";
    return {
      url: url,
      target: target,
      classType: classType
    }
  }

  function fromObject(data, visible) {
    if (angular.isUndefined(visible))
      visible = true;
    var attachment = data.type_metadata && data.type_metadata.attachment;
    if (attachment)
      attachment = attachmentFactory.fromObject(attachment);
    return {
      sysID: data.sys_id,
      type: data.type,
      url: data.url,
      display: data.title || data.url,
      displayUrl: data.url.replace(/^(?:https?:\/)?\//, ''),
      title: data.title,
      shortDescription: data.short_description,
      siteName: data.site_name,
      timestamp: data.timestamp,
      external: data.external,
      displayFields: data.type_metadata && data.type_metadata.display_fields,
      embedLink: data.type_metadata && data.type_metadata.embed_link,
      imageLink: data.type_metadata && data.type_metadata.image_link,
      avatarID: data.type_metadata && data.type_metadata.avatar_id,
      avatarDisplay: data.type_metadata && data.type_metadata.avatar_display,
      createdOn: data.type_metadata && data.type_metadata.sys_created_on,
      updatedOn: data.type_metadata && data.type_metadata.sys_updated_on,
      isActive: data.state === "active",
      isPending: data.state === "pending",
      isError: data.state === "error",
      isUnauthorized: data.state === "unauthorized",
      isDeleted: data.state === "deleted",
      visible: visible,
      isRecord: data.type == "record",
      isImage: data.type === "image",
      attachment: attachment,
      get isHideable() {
        return ((attachment || this.isRecord) && this.isActive) || this.isImage;
      },
      open: function(event) {
        if (event.keyCode === 9)
          return;
        var link = linkObject(this.url, this.external, this.type);
        var newWindow = $window.open(link.url, link.target);
        newWindow.opener = null;
      },
      aTag: function(text) {
        var link = linkObject(this.url, this.external, this.type);
        var aTag = angular.element("<a />");
        aTag.attr('class', link.classType);
        aTag.attr('rel', "noreferrer");
        aTag.attr('target', link.target);
        aTag.attr('href', link.url);
        aTag[0].innerHTML = text;
        return $sce.getTrustedHtml(aTag[0].outerHTML);
      }
    };
  }
  return {
    fromObject: fromObject,
    linkObject: linkObject
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/resource/factory.attachment.js */
angular.module("sn.connect.resource").factory("attachmentFactory", function(fileSizeConverter, $window) {
  "use strict";

  function fromObject(data) {
    data.size = fileSizeConverter.getByteCount("" + data.size_bytes, 2);
    var downloadSource = "/sys_attachment.do?sys_id=" + data.sys_id;
    var newTabSource = "/" + data.sys_id + ".iix";
    return {
      rawData: data,
      sysID: data.sys_id,
      timestamp: data.sys_created_on,
      name: data.file_name || "Image",
      byteDisplay: data.size,
      canRead: data.can_read,
      fileName: data.file_name,
      sizeInBytes: data.size_bytes,
      compressSize: data.size_compressed,
      contentType: data.content_type,
      thumbSource: data.thumb_src,
      createdBy: data.sys_created_by,
      isImage: data.image,
      height: data.image_height,
      width: data.image_width,
      averageColor: data.average_image_color,
      newTabSource: newTabSource,
      downloadSource: downloadSource,
      open: function(event) {
        if (event.keyCode === 9)
          return;
        $window.open(newTabSource, "_blank");
      },
      download: function(event) {
        if (event.keyCode === 9)
          return;
        $window.open(downloadSource, "_self");
      }
    }
  }
  return {
    fromObject: fromObject
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/resource/service.resourcePersister.js */
angular.module('sn.connect.resource').service('resourcePersister', function(
  $q, snHttp, liveLinkFactory, attachmentFactory, $timeout, isLoggedIn) {
  "use strict";
  var CONVERSATION_PATH = isLoggedIn ? "/api/now/connect/conversations/" : "/api/now/connect/support/anonymous/conversations/";
  var FETCH_THRESHOLD = 25;
  var conversations = {};
  var limit = FETCH_THRESHOLD;

  function addLink(conversationID, link) {
    var field = (link.isRecord) ? "records" : "links";
    addToArray(conversationID, field, link, linkEquals);
  }

  function linkEquals(link1, link2) {
    return link1.url === link2.url;
  }

  function addAttachment(conversationID, attachment) {
    addToArray(conversationID, "attachments", attachment, attachmentEquals);
  }

  function attachmentEquals(attachment1, attachment2) {
    function cmp(field) {
      var field1 = attachment1[field];
      var field2 = attachment2[field];
      return !!field1 && field1 === field2;
    }
    return attachment1.isImage &&
      cmp("sizeInBytes") &&
      cmp("compressSize") &&
      cmp("contentType") &&
      cmp("height") &&
      cmp("width") &&
      cmp("averageColor");
  }

  function addToArray(conversationID, field, element, equalsFn) {
    var resources = conversations[conversationID];
    if (!resources) {
      conversations[conversationID] = newResource();
      conversations[conversationID][field] = [element];
      return;
    }
    var array = resources[field];
    for (var i = 0; i < array.length; i += 1) {
      var item = array[i];
      if (item.sysID === element.sysID) {
        array[i] = element;
        return;
      }
      if (equalsFn(item, element)) {
        if (item.timestamp > element.timestamp)
          return;
        array.splice(i, 1);
        break;
      }
    }
    for (i = 0; i < array.length; ++i) {
      if (array[i].timestamp <= element.timestamp) {
        array.splice(i, 0, element);
        return;
      }
    }
    array.push(element);
  }

  function newResource() {
    return {
      links: [],
      records: [],
      attachments: []
    };
  }

  function retrieve(conversationID) {
    var resources = conversations[conversationID];
    if (resources && (resources.loading || resources.retrieved))
      return;
    if (!resources) {
      resources = conversations[conversationID] = newResource();
    }
    resources.loading = true;
    $timeout(function() {
      snHttp.get(CONVERSATION_PATH + conversationID + "/resources?sysparm_limit=" + limit).then(function(response) {
        delete conversations[conversationID].loading;
        conversations[conversationID].retrieved = true;
        limit = limit + FETCH_THRESHOLD;
        var result = response.data.result;
        result.links.forEach(function(rawLink) {
          addLink(conversationID, liveLinkFactory.fromObject(rawLink));
        });
        result.attachments.forEach(function(rawAttachment) {
          addAttachment(conversationID, attachmentFactory.fromObject(rawAttachment));
        });
        resources.retrieved = true;
      });
    })
  }
  return {
    get: function(conversationID) {
      retrieve(conversationID);
      return conversations[conversationID];
    },
    addLink: addLink,
    addAttachment: addAttachment
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/resource/service.supportTabHandler.js */
angular.module('sn.connect.resource').service('supportTabHandler', function() {
  'use strict';
  var tabs = {};
  var watches = {};
  var globalWatches = [];

  function addTab(channelID, tab) {
    if (!channelID || !tab)
      return false;
    tabs[channelID] = tabs[channelID] || [];
    if (ngObjectIndexOf(tabs[channelID], tab) !== -1)
      return tab;
    tabs[channelID].push(tab);
    callWatches(channelID, tab);
    return tab;
  }

  function removeTab(channelID, tab) {
    if (!channelID || !tab || !tabs[channelID])
      return false;
    var loc = ngObjectIndexOf(tabs[channelID], tab);
    if (loc !== -1) {
      var removedTab = tabs[channelID].splice(loc, 1)[0];
      callWatches(channelID, removedTab);
      return removedTab;
    }
    return false;
  }

  function removeChannel(channelID) {
    if (!channelID || !tabs[channelID])
      return false;
    tabs[channelID] = [];
    callWatches(channelID, []);
    return true;
  }

  function getTabs(channelID, sort) {
    if (!tabs[channelID])
      return [];
    return sort ? tabs[channelID].sort(function(a, b) {
      return a.$order - b.$order;
    }) : tabs[channelID];
  }

  function ngObjectIndexOf(arr, obj) {
    for (var i = 0, len = arr.length; i < len; i++)
      if (angular.equals(arr[i], obj))
        return i;
    return -1;
  }

  function watch(func, channelID) {
    if (channelID) {
      watches[channelID] = watches[channelID] || [];
      watches[channelID].push(func)
    } else {
      globalWatches.push(func);
    }
    return func;
  }

  function unwatch(func, channelID) {
    var i, len;
    if (channelID && watches[channelID]) {
      for (i = 0, len = watches[channelID].length; i < len; i++) {
        var watchLoc = watches[channelID].indexOf(func);
        if (watchLoc !== -1)
          watches[channelID].splice(watchLoc, 1);
      }
    } else {
      for (i = 0, len = globalWatches.length; i < len; i++) {
        var globalWatchLoc = globalWatches.indexOf(func);
        if (globalWatchLoc !== -1)
          globalWatches.splice(globalWatchLoc, 1);
      }
    }
  }

  function callWatches(channelID, response) {
    var i, len;
    if (channelID && watches[channelID] && watches[channelID].length) {
      for (i = 0, len = watches[channelID].length; i < len; i++)
        watches[channelID][i](response);
    }
    for (i = 0, len = globalWatches.length; i < len; i++)
      globalWatches[i](response);
  }
  return {
    add: addTab,
    remove: removeTab,
    get: getTabs,
    removeChannel: removeChannel,
    watch: watch,
    unwatch: unwatch
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/resource/directive.snAsideMemberList.js */
angular.module('sn.connect.resource').directive('snAsideMemberList', function(
  getTemplateUrl, $timeout, activeConversation) {
  'use strict';
  return {
    replace: true,
    restrict: 'E',
    templateUrl: getTemplateUrl('snAsideMemberList.xml'),
    link: function(scope, element) {
      scope.$on("sn.aside.open", function() {
        $timeout(function() {
          if (element.is(":visible"))
            scope.$emit("sn.aside.controls.active", "members");
        }, 0, false);
      });
      scope.changeMode = function(evt, mode) {
        if (!scope.conversation.amMember || evt.keyCode === 9)
          return;
        scope.mode = mode;
        if (mode == 'add') {
          $timeout(function() {
            element.find('.form-control-search.tt-input').focus();
          }, 200);
        }
      };
    },
    controller: function($scope, conversations, liveProfileID, supportAddMembers) {
      $scope.mode = 'view';
      $scope.$emit("sn.aside.controls.active", "members");
      $scope.viewProfile = function(evt, member) {
        if (evt.keyCode === 9)
          return;
        $scope.$emit("sn.aside.open", {
          templateUrl: getTemplateUrl("snAsideMemberList_profile.xml"),
          isChild: true,
          scope: {
            profile: member,
            showDirectMessage: !$scope.conversation.isDirectMessage && !$scope.conversation.isHelpDesk
          }
        });
      };
      $scope.isAddUserButtonVisible = function() {
        if ($scope.mode !== 'view')
          return false;
        return isButtonVisible(function() {
          return true;
        });
      };
      $scope.isLeaveButtonVisible = function() {
        var queueEntryCheckFn = function(queueEntry) {
          return !queueEntry.isAssignedToMe;
        };
        return isButtonVisible(queueEntryCheckFn);
      };
      $scope.isRemoveUserButtonVisible = function(userID) {
        var queueEntryCheckFn = function(queueEntry) {
          return queueEntry.openedBy !== userID &&
            queueEntry.assignedTo !== userID;
        };
        return isButtonVisible(queueEntryCheckFn);
      };

      function isButtonVisible(queueEntryCheckFn) {
        var conversation = $scope.conversation;
        if (!conversation.isHelpDesk)
          return conversation.isGroup;
        var queueEntry = conversation.queueEntry;
        return supportAddMembers &&
          queueEntryCheckFn(queueEntry) &&
          queueEntry.isActive;
      }
      $scope.user = false;
      $scope.findUser = function() {
        for (var i = 0; i < $scope.conversation.members.length; i++) {
          if ($scope.conversation.members[i].sysID === liveProfileID) {
            $scope.user = $scope.conversation.members[i];
            return;
          }
        }
        $scope.user = false;
      };
      $scope.findUser();
      $scope.$watch('conversation.sysID', function() {
        $scope.findUser();
      });
      $scope.addMember = function(memberID) {
        conversations.addUser($scope.conversation.sysID, memberID);
        $scope.mode = 'view';
        if (!$scope.user)
          $scope.findUser();
      };
      $scope.showRemoveMember = function() {
        return $scope.conversation.amMember && $scope.conversation.isGroup;
      };
      $scope.removeMember = function($event, memberID) {
        if ($event && $event.keyCode === 9)
          return;
        $event.stopPropagation();
        conversations.removeUser($scope.conversation.sysID, memberID);
        if (memberID === liveProfileID) {
          activeConversation.clear($scope.conversation);
          $scope.user = null;
        }
      };
      $scope.showAddMembers = function() {
        return !$scope.conversation.isHelpDesk && $scope.conversation.isGroup && $scope.mode == 'view'
      };
      $scope.showUser = function() {
        return user && $scope.memberFilterText && user.name.indexOf($scope.memberFilterText) > -1;
      }
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/resource/directive.snAsideInfo.js */
angular.module('sn.connect.resource').directive('snAsideInfo', function(getTemplateUrl, $timeout) {
  'use strict';
  return {
    replace: true,
    restrict: 'E',
    templateUrl: getTemplateUrl('snAsideInfo.xml'),
    link: function(scope, element) {
      scope.$on("sn.aside.open", function() {
        $timeout(function() {
          if (element.is(":visible"))
            scope.$emit("sn.aside.controls.active", "info");
        }, 0, false);
      });
    },
    controller: function($scope) {
      $scope.$emit("sn.aside.controls.active", "info");
      $scope.isFieldVisible = function(field) {
        return field.displayValue && field.type !== 'journal_input' && field.type !== 'journal_list';
      };
      $scope.historyBack = function(evt) {
        if (evt && evt.keyCode === 9)
          return;
        $scope.$emit("sn.aside.historyBack");
      };
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/resource/directive.snAsideInfoItem.js */
angular.module('sn.connect.resource').directive('snAsideInfoItem', function(getTemplateUrl) {
  'use strict';
  var iconMap = {
    record: "icon-article-document",
    link: "icon-link",
    connect: "icon-collaboration",
    uipage: "icon-document",
    search: "icon-search",
    list: "icon-list",
    chart: "icon-poll",
    update: "icon-form",
    image: "icon-image",
    video: "icon-video",
    unauthorized: "icon-locked sn-highlight_negative",
    error: "icon-alert-triangle",
    pending: "icon-loading"
  };
  return {
    replace: true,
    restrict: 'E',
    templateUrl: getTemplateUrl('snAsideInfoItem.xml'),
    scope: {
      isLink: "=",
      title: "@",
      description: "@",
      link: "="
    },
    controller: function($scope) {
      $scope.isExternalIcon = function() {
        return !$scope.link.isPending && $scope.link.external;
      };
      $scope.getExternalIcon = function() {
        return "https://www.google.com/s2/favicons?domain=" + $scope.link.url.toLowerCase();
      };
      $scope.getIcon = function() {
        if ($scope.link.isUnauthorized)
          return iconMap.unauthorized;
        if ($scope.link.isError)
          return iconMap.error;
        if ($scope.link.isPending)
          return iconMap.pending;
        return iconMap[$scope.link.type] || iconMap.link;
      };
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/resource/directive.snAsideInfoViewAllItem.js */
angular.module('sn.connect.resource').directive('snAsideInfoViewAllItem', function(getTemplateUrl) {
  'use strict';
  return {
    replace: true,
    restrict: 'E',
    templateUrl: getTemplateUrl('snAsideInfoViewAllItem.xml'),
    scope: {
      title: "@",
      templateUrl: "@",
      minCount: "@",
      links: "="
    },
    controller: function($scope) {
      $scope.isShowing = function() {
        return $scope.links.length > $scope.minCount;
      };
      $scope.openView = function(evt) {
        if (evt.keyCode === 9)
          return;
        $scope.$emit("sn.aside.open", {
          templateUrl: getTemplateUrl($scope.templateUrl),
          isChild: true,
          scope: $scope.$parent
        });
      };
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/resource/directive.snAsideAttachments.js */
angular.module('sn.connect.resource').directive('snAsideAttachments', function(getTemplateUrl, $timeout) {
  'use strict';
  return {
    replace: true,
    restrict: 'E',
    templateUrl: getTemplateUrl('snAsideAttachments.xml'),
    link: function(scope, element) {
      scope.$on("sn.aside.open", function() {
        $timeout(function() {
          if (element.is(":visible"))
            scope.$emit("sn.aside.controls.active", "attachments");
        }, 0, false);
      });
    },
    controller: function($scope, $rootScope, resourcePersister) {
      $scope.$emit("sn.aside.controls.active", "attachments");
      $scope.$watch("conversation.sysID", rawifyAttachments);
      $scope.$watchCollection("conversation.resources.attachments", rawifyAttachments);

      function rawifyAttachments() {
        $scope.attachments = $scope.conversation.resources.attachments.map(function(attachment) {
          return attachment.rawData;
        });
      }
      rawifyAttachments();
      $scope.attachFiles = function(evt) {
        if (evt.keyCode === 9)
          return;
        if ($scope.conversation.amMember)
          $rootScope.$broadcast("connect.attachment_dialog.open", $scope.conversation.sysID);
      };
      $scope.isAddButtonShowing = function() {
        return !$scope.conversation.isHelpDesk || !$scope.conversation.queueEntry.isClosedByAgent;
      }
      $scope.scrollConfig = {
        onScrollUp: function() {
          console.info("Up!");
        },
        onScrollDown: function() {
          console.info("Down!");
          $scope.conversation.resources.retrieved = false;
          resourcePersister.get($scope.conversation.sysID);
        },
        onScrollMissing: function() {
          console.info("Missing!");
        }
      };
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/resource/directive.snAsideNotifications.js */
angular.module('sn.connect.resource').directive('snAsideNotifications', function(getTemplateUrl, $timeout) {
  'use strict';
  return {
    replace: true,
    restrict: 'E',
    templateUrl: getTemplateUrl('snAsideNotifications.xml'),
    link: function(scope, element) {
      scope.$on("sn.aside.open", function() {
        $timeout(function() {
          if (element.is(":visible"))
            scope.$emit("sn.aside.controls.active", "notifications");
        }, 0, false);
      });
    },
    controller: function($scope, notificationPreferences) {
      $scope.$emit("sn.aside.controls.active", "notifications");
      $scope.showSystemMessage = function() {
        return !$scope.conversation.isDirectMessage &&
          notificationPreferences.globalPreferences.mobile &&
          $scope.conversation.preferences.mobile === "all";
      };
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/resource/directive.snAsideNotificationItem.js */
angular.module('sn.connect.resource').directive('snAsideNotificationItem', function(getTemplateUrl) {
  'use strict';
  return {
    replace: true,
    restrict: 'E',
    templateUrl: getTemplateUrl('snAsideNotificationItem.xml'),
    scope: {
      conversation: "=",
      section: "@",
      disableText: "@",
      disableLinkText: "@",
      description: "@",
      type: '@'
    },
    controller: function($scope, notificationPreferences) {
      $scope.globalPreferences = notificationPreferences.globalPreferences;
      $scope.enable = function(event) {
        if (event.keyCode === 9)
          return;
        $scope.globalPreferences[$scope.type] = true;
      };
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/resource/directive.snAsideFrame.js */
angular.module('sn.connect.resource').directive('snAsideFrame', function(getTemplateUrl, $timeout) {
  'use strict';
  return {
    replace: true,
    restrict: 'E',
    templateUrl: getTemplateUrl('snAsideFrame.xml'),
    link: function(scope, element, attrs) {
      scope.title = attrs.title;
      scope.url = attrs.url + (attrs.url.indexOf('?') < 0 ? '?' : '&') + "sysparm_clear_stack=true";
      scope.name = attrs.name;
      scope.$on("sn.aside.open", function() {
        $timeout(function() {
          if (element.is(":visible"))
            scope.$emit("sn.aside.controls.active", scope.name);
        }, 0, false);
      });
    },
    controller: function($scope) {
      $timeout(function() {
        $scope.$emit('sn.aside.controls.active', $scope.name);
      }, 0, false);
      $scope.close = function(evt) {
        if (evt.keyCode === 9)
          return;
        $scope.$emit("sn.aside.close");
      }
    }
  }
});;;
/*! RESOURCE: /scripts/app.ng_chat/queue/js_includes_connect_queue.js */
/*! RESOURCE: /scripts/app.ng_chat/queue/_module.js */
angular.module("sn.connect.queue", ["sn.connect.profile", "sn.connect.conversation"]);;
/*! RESOURCE: /scripts/app.ng_chat/queue/directive.snQueueList.js */
angular.module('sn.connect.queue').directive('snQueueList', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('snQueueList.xml'),
    replace: true,
    scope: {},
    controller: function($scope, $filter, queues, conversations, supportConversationLimit) {
      $scope.agents = queues.agents;
      $scope.hasQueues = queues.hasQueues;
      $scope.isLimitReached = function() {
        if (supportConversationLimit === -1)
          return false;
        var supportConversations = $filter('conversation')(conversations.all, true, true)
          .filter(function(conversation) {
            var queueEntry = conversation.queueEntry;
            return queueEntry.isAssignedToMe && !queueEntry.isPermanentlyClosed;
          });
        return supportConversationLimit <= supportConversations.length;
      };
      $scope.$on('dialog.queue-error.show', function(evt, data) {
        $scope.queueErrorData = data;
      });
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/queue/directive.snQueueItem.js */
angular.module('sn.connect.queue').directive('snQueueItem', function(getTemplateUrl, $timeout, i18n) {
  'use strict';
  var acceptButtonLabel = "Accept Ticket From {0}";
  i18n.getMessages([acceptButtonLabel], function(translations) {
    acceptButtonLabel = translations[acceptButtonLabel];
  });
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('snQueueItem.xml'),
    replace: true,
    scope: {
      queue: '=',
      canAnswer: '='
    },
    link: function(scope, element) {
      var flashCoolDown = 1000;
      var onCoolDown = false;
      var queueItem = element.find('.queue-item');
      scope.flashQueue = function() {
        if (onCoolDown)
          return;
        onCoolDown = true;
        queueItem.addClass("highlight-flash");
        $timeout(function() {
          queueItem.removeClass("highlight-flash");
        }, 250);
        $timeout(function() {
          onCoolDown = false;
        }, flashCoolDown);
      }
    },
    controller: function($scope, $rootScope, queueEntries, queueNotifier, conversations, activeConversation) {
      $scope.isEmpty = function() {
        return $scope.queue.waitingCount == 0;
      };
      $scope.getAcceptAriaLabel = function() {
        return i18n.format(acceptButtonLabel, $scope.queue.name);
      };
      $scope.answer = function() {
        if ($scope.isEmpty())
          return;
        if (!$scope.canAnswer)
          return;
        queueEntries.requestNext($scope.queue.id).then(function(queueEntry) {
          conversations.get(queueEntry.conversationID).then(function(conversation) {
            activeConversation.conversation = conversation;
          });
        }, function(response) {
          if (response.status !== 404 || !response.data || !response.data.result || !response.data.result.error)
            return;
          $rootScope.$broadcast('dialog.queue-error.show', {
            queue: $scope.queue,
            message: response.data.result.error
          });
        })
      };
      $scope.$watch('queue.waitingCount', function() {
        $scope.flashQueue();
        queueNotifier.notify($scope.queue);
      });
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/queue/directive.snNonAgentClose.js */
angular.module('sn.connect.queue').directive('snNonAgentClose', function(
  getTemplateUrl, conversations, activeConversation) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('snNonAgentClose.xml'),
    scope: {},
    controller: function($scope) {
      $scope.$on('connect.non_agent_conversation.close_prompt', function(event, conversation) {
        $scope.conversation = conversation;
        $scope.$broadcast('dialog.queue-non-agent-modal.show');
      });
      $scope.close = function() {
        conversations.closeSupport($scope.conversation.sysID, true);
        activeConversation.clear($scope.conversation);
      };
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/queue/directive.snQueueEntryClose.js */
angular.module('sn.connect.queue').directive('snQueueEntryClose', function(
  getTemplateUrl, conversations, activeConversation) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('snQueueEntryClose.xml'),
    scope: {},
    controller: function($scope) {
      var hideConversation = true;
      $scope.$on('connect.support_conversation.close_prompt', function(event, conversation, shouldHide) {
        $scope.conversation = conversation;
        hideConversation = shouldHide;
        $scope.$broadcast('dialog.queue-entry-close-modal.show');
      });
      $scope.close = function() {
        conversations.closeSupport($scope.conversation.sysID, hideConversation);
        if (hideConversation)
          activeConversation.clear($scope.conversation);
      };
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/queue/directive.snQueueEntryTransfer.js */
angular.module('sn.connect.queue').directive('snQueueEntryTransfer', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('snQueueEntryTransfer.xml'),
    scope: {},
    controller: function($scope, queues, queueEntries, userID, supportConversationLimit) {
      $scope.queues = [];

      function reset() {
        $scope.queue = {};
        $scope.agents = [];
      }
      $scope.$on('connect.support.conversation.transfer', function(event, conversation) {
        reset();
        $scope.conversation = conversation;
        $scope.queues.length = 0;
        queueEntries.requestByConversation(conversation.sysID).then(function(queueEntry) {
          queues.getQueue(queueEntry.queueID).then(function(queue) {
            $scope.queue = queue;
          });
          queues.getAgents(queueEntry.queueID).then(function(agents) {
            $scope.agents = agents.filter(function(agent) {
              return (agent.userID !== queueEntry.openedBy) &&
                (agent.userID !== userID);
            }).sort(function(a, b) {
              return a.name.localeCompare(b.name);
            });
          });
          queues.refresh().then(function() {
            angular.forEach(queues.all, function(value, key) {
              if (key !== queueEntry.queueID)
                $scope.queues.push(value)
            });
          });
          $scope.$broadcast('dialog.transfer-modal.show');
        });
      });
      $scope.close = reset;
      $scope.startsWith = function(actual, expected) {
        return actual.toLowerCase().indexOf(expected.toLowerCase()) > -1;
      };
      $scope.canTransferToAgent = function(agent) {
        if (supportConversationLimit === -1)
          return true;
        if (!agent.supportConversationCount)
          return true;
        return agent.supportConversationCount < supportConversationLimit;
      };
      $scope.transferToAgent = function(agent) {
        queueEntries.transfer($scope.conversation.sysID, agent.userID);
        $scope.$broadcast('dialog.transfer-modal.close');
        reset();
      };
      $scope.transferToQueue = function(queue) {
        $scope.transferQueue = queue;
        $scope.$broadcast('dialog.transfer-modal.close');
        reset();
        $scope.$broadcast('dialog.queue-transfer-confirm.show');
      };
      $scope.transferQueueOk = function() {
        queueEntries.escalate($scope.conversation, $scope.transferQueue.id);
      };
      $scope.cancelTransfer = function() {
        queueEntries.cancel($scope.conversation.sysID);
      };
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/queue/directive.snQueueEntryTransferAccepted.js */
angular.module('sn.connect.queue').directive('snQueueEntryTransferAccepted', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('snQueueEntryTransferAccepted.xml'),
    scope: {},
    controller: function($scope, $rootScope, $timeout, $filter, activeConversation, conversations, queueEntries,
      profiles) {
      var transferOrder = [];
      $scope.$watchCollection(function() {
        return $filter('transferAccepted')(conversations.all).map(function(conversation) {
          return conversation.sysID;
        });
      }, function(newCollection) {
        transferOrder = newCollection.sort(function(sysID1, sysID2) {
          return sortIndex(sysID1) - sortIndex(sysID2);
        });
        if (transferOrder.length > 0)
          show();
        else
          hide();
      });

      function sortIndex(sysID) {
        var index = transferOrder.indexOf(sysID);
        return (index < 0) ? 1000 : index;
      }
      $scope.leave = closeModal(true);
      $scope.stay = closeModal(false);

      function closeModal(removeConversation) {
        return function() {
          var conversation = conversations.indexed[currentSysID];
          queueEntries.complete(currentSysID);
          conversation.queueEntry.clearTransferState();
          if (removeConversation) {
            conversations.closeSupport(conversation.sysID, true);
            activeConversation.clear(conversation);
          }
          hide();
        }
      }
      var currentSysID;

      function show() {
        var sysID = transferOrder[0];
        if (currentSysID === sysID)
          return;
        currentSysID = sysID;
        var conversation = conversations.indexed[currentSysID];
        var queueEntry = conversation.queueEntry;
        delete $scope.profileForSession;
        delete $scope.transferToProfile;
        profiles.getAsync('sys_user.' + queueEntry.openedBy).then(function(profile) {
          $scope.profileForSession = profile;
          profiles.getAsync('sys_user.' + queueEntry.transferTo).then(function(profile) {
            $scope.transferToProfile = profile;
            $scope.$broadcast('dialog.transfer-accepted-modal.show');
            activeConversation.conversation = conversation;
          });
        });
      }

      function hide() {
        $scope.$broadcast('dialog.transfer-accepted-modal.close');
        if (currentSysID === transferOrder[0])
          transferOrder.shift();
        currentSysID = undefined;
        if (transferOrder.length === 0)
          return;
        $timeout(function() {
          show();
        }, 400);
      }
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/queue/factory.queue.js */
angular.module('sn.connect.queue').factory('queueFactory', function() {
  'use strict';
  return {
    fromObject: function(data) {
      return {
        get id() {
          return data.sys_id;
        },
        get name() {
          return data.name;
        },
        get question() {
          return data.question;
        },
        get waitTime() {
          return data.average_wait_time.replace(/ Minute(s?)/g, "m").replace(/ Hour(s?)/g, "h").replace(/ Second(s?)/g, "s");
        },
        get waitTimeLong() {
          return data.average_wait_time;
        },
        get waitingCount() {
          return data.waiting_count;
        },
        get available() {
          return angular.isUndefined(data.not_available);
        },
        get unavailableMessage() {
          return data.not_available;
        },
        get escalateTo() {
          return data.escalate_to;
        },
        get isAgentsQueue() {
          return data.is_agent_for;
        },
        __rawData: data
      };
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/queue/factory.queueEntry.js */
angular.module('sn.connect.queue').factory('queueEntryFactory', function(profiles, userID, queues) {
  'use strict';
  var WAITING = 1;
  var WORK_IN_PROGRESS = 2;
  var CLOSED_COMPLETE = 3;
  var CLOSED_ESCALATED = 4;
  var CLOSED_BY_CLIENT = 7;
  var CLOSED_ABANDONED = 8;
  var TRANSFER_PENDING = 'pending';
  var TRANSFER_CANCELLED = 'cancelled';
  var TRANSFER_ACCEPTED = 'accepted';
  var TRANSFER_REJECTED = 'rejected';
  return {
    fromObject: function(data) {
      return {
        equals: function(rawQueueEntry) {
          return angular.equals(data, rawQueueEntry);
        },
        get averageWaitTime() {
          return data.average_wait_time;
        },
        get sysID() {
          return data.sys_id;
        },
        get queueID() {
          return data.queue;
        },
        get queue() {
          return queues.all[data.queue];
        },
        get conversationID() {
          return data.group;
        },
        get assignedTo() {
          return data.assigned_to;
        },
        get isAssignedToMe() {
          return this.assignedTo === userID;
        },
        get number() {
          return data.number;
        },
        get position() {
          return data.position;
        },
        get profile() {
          return profiles.get(data.sys_id);
        },
        get shortDescription() {
          return data.short_description;
        },
        get state() {
          return data.state;
        },
        set state(value) {
          data.state = value;
        },
        get waitTime() {
          return data.wait_time;
        },
        get workStart() {
          return data.work_start;
        },
        get workEnd() {
          return data.work_end;
        },
        get isTransferStateChanged() {
          return data.transfer_change;
        },
        clearTransferState: function() {
          data.transfer_state = undefined;
        },
        get hasTransfer() {
          return !!data.transfer_state;
        },
        get isTransferPending() {
          return data.transfer_state === TRANSFER_PENDING;
        },
        get isTransferCancelled() {
          return data.transfer_state === TRANSFER_CANCELLED;
        },
        get isTransferAccepted() {
          return data.transfer_state === TRANSFER_ACCEPTED;
        },
        get isTransferRejected() {
          return data.transfer_state === TRANSFER_REJECTED;
        },
        get openedBy() {
          return data.opened_by;
        },
        get isOpenedByMe() {
          return this.openedBy === userID;
        },
        get transferTo() {
          return data.transfer_to;
        },
        get isTransferringToMe() {
          return this.transferTo === userID;
        },
        get isTransferringFromMe() {
          return data.transfer_from === userID;
        },
        get transferShouldClose() {
          if (this.isAssignedToMe)
            return false;
          return data.transfer_should_close;
        },
        get transferUpdatedOn() {
          return new Date(data.transfer_updated_on);
        },
        get updatedOn() {
          return new Date(data.sys_updated_on);
        },
        get isActive() {
          return this.isWaiting || this.isAccepted || (!this.isOpenedByMe && this.isClosedByClient);
        },
        get isPermanentlyClosed() {
          return this.isClosedByAgent || this.isEscalated || this.isClosedByClient;
        },
        get isReOpenable() {
          return this.isAbandoned;
        },
        get isWaiting() {
          return this.state === WAITING;
        },
        get isAccepted() {
          return this.state === WORK_IN_PROGRESS;
        },
        get isEscalated() {
          return this.state === CLOSED_ESCALATED;
        },
        get isAbandoned() {
          return this.state === CLOSED_ABANDONED;
        },
        get isClosedByAgent() {
          return this.state === CLOSED_COMPLETE;
        },
        get isClosedByClient() {
          return this.state === CLOSED_BY_CLIENT;
        },
        escalate: function() {
          this.state = CLOSED_ESCALATED;
        }
      };
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/queue/service.queues.js */
angular.module('sn.connect.queue').service('queues', function(
  $q, amb, snHttp, queueFactory, profiles, supportAddMembers, supportEnabled, inSupportClient, isLoggedIn, alertOnQueueEnter, audioNotifier) {
  'use strict';
  var AMB_CHANNEL = '/connect/support/queues';
  var REST_API_PATH = isLoggedIn ? "/api/now/connect/support/queues" : "/api/now/connect/support/anonymous/queues";
  var queues = {};
  var agentsQueues = {};
  var ambChannel;

  function refresh() {
    return snHttp.get(REST_API_PATH).then(function(response) {
      queues = {};
      ambUnsubscribe();
      if (response.data) {
        addRawQueues(response.data.result);
        ambSubscribe();
      }
      return queues;
    });
  }

  function ambSubscribe() {
    if (!ambChannel) {
      ambChannel = amb.getChannel(AMB_CHANNEL).subscribe(function(response) {
        var queue = addRawQueue(response.data);
        addEscalationQueue(queue);
        return queue;
      });
      amb.connect();
    }
    return ambChannel;
  }

  function ambUnsubscribe() {
    if (ambChannel) {
      ambChannel.unsubscribe();
      ambChannel = void(0);
    }
  }

  function addRawQueues(rawQueuesData) {
    angular.forEach(rawQueuesData, function(queueData) {
      addRawQueue(queueData);
    });
    angular.forEach(queues, function(queue) {
      addEscalationQueue(queue);
    });
    return queues;
  }

  function addRawQueue(rawQueueData) {
    if (!rawQueueData)
      return;
    if (queues[rawQueueData.sys_id]) {
      var existingItem = queues[rawQueueData.sys_id];
      rawQueueData = angular.extend({}, existingItem.__rawData, rawQueueData);
    }
    var queue = queueFactory.fromObject(rawQueueData);
    if (queue.isAgentsQueue) {
      if (shouldAlertOnQueueEnter(queue)) {
        audioNotifier.notify({
          timestamp: Date.now()
        });
      }
      agentsQueues[queue.id] = queue;
    }
    return queues[queue.id] = queue;
  }

  function shouldAlertOnQueueEnter(queue) {
    var staleQueue = agentsQueues[queue.id];
    if (!staleQueue) {
      return false;
    }
    return alertOnQueueEnter && queue.waitingCount > staleQueue.waitingCount;
  }

  function addEscalationQueue(queue) {
    if (!queue.escalateTo)
      return;
    requestQueue(queue.escalateTo).then(function(escalationQueue) {
      queue.escalationQueue = escalationQueue;
    });
  }

  function requestHttpQueue(queueID) {
    return snHttp.get(REST_API_PATH + '/' + queueID).then(function(response) {
      var queue = addRawQueue(response.data.result);
      addEscalationQueue(queue);
      return queue;
    });
  }

  function requestQueue(queueID) {
    if (!queueID)
      return $q.when();
    if (queues[queueID])
      return $q.when(queues[queueID]);
    return requestHttpQueue(queueID);
  }
  if ((supportAddMembers || supportEnabled) && !inSupportClient)
    refresh();
  return {
    get all() {
      return queues;
    },
    get agents() {
      return agentsQueues;
    },
    hasQueues: function() {
      return Object.keys(agentsQueues).length > 0;
    },
    refresh: refresh,
    getAgents: function(queueID) {
      return snHttp.get(REST_API_PATH + '/' + queueID + '/agents').then(function(response) {
        return response.data.result.map(profiles.fromObject);
      });
    },
    getQueue: requestQueue,
    getAllWaitingCount: function() {
      var waitingCount = 0;
      angular.forEach(agentsQueues, function(queue) {
        waitingCount = waitingCount + queue.waitingCount;
      });
      return waitingCount;
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/queue/service.queueNotifier.js */
angular.module('sn.connect.queue').service('queueNotifier', function($window, snNotifier, i18n, userPreferences, queues) {
  'use strict';
  var LOCAL_STORAGE_KEY = 'sn.connect.queueNotifier.lastUpdatedOn';
  var queueWaitingCountUpdated;
  i18n.getMessages([
    'A new customer has joined your support queue'
  ], function(results) {
    queueWaitingCountUpdated = results['A new customer has joined your support queue'];
  });
  var lastWaitingCounts = {};
  angular.forEach(queues.all, function(queue) {
    updateWaitingCounts(queue);
  });
  angular.element($window).on('storage', function(e) {
    if (e.originalEvent.key !== LOCAL_STORAGE_KEY)
      return;
    var lastWaitingCountsJson = $window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (lastWaitingCountsJson) {
      lastWaitingCounts = angular.fromJson(lastWaitingCountsJson);
    }
  });

  function updateWaitingCounts(queue) {
    lastWaitingCounts[queue.id] = queue.waitingCount;
    $window.localStorage.setItem(LOCAL_STORAGE_KEY, angular.toJson(lastWaitingCounts));
  }
  return {
    notify: function(queue) {
      userPreferences.getPreference('connect.notifications.desktop').then(function(value) {
        if (value === 'false')
          return;
        if (queue.waitingCount <= lastWaitingCounts[queue.id]) {
          updateWaitingCounts(queue);
          return;
        }
        updateWaitingCounts(queue);
        snNotifier().notify(queueWaitingCountUpdated);
      });
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/queue/service.queueEntries.js */
angular.module('sn.connect.queue').service('queueEntries', function(
  $q, $rootScope, snHttp, amb, queueEntryFactory, queues, inSupportClient, isLoggedIn, snNotification, i18n, supportEnabled) {
  'use strict';
  var QUEUE_AMB = '/connect/support/queues';
  var GROUP_AMB = '/connect/support/group/';
  var queueEntries = {};
  var ambWatchers = {};
  amb.connect();
  if (inSupportClient || supportEnabled) {
    amb.getChannel(QUEUE_AMB).subscribe(function(response) {
      var queueID = response.data.sys_id;
      if (queues.agents[queueID]) {
        requestFiltered({
          'closed': !inSupportClient,
          'queue_id': queueID
        });
      }
    });
  }
  var messageUnknownError = "Unable to complete your request: An unknown error occurred";
  i18n.getMessages([messageUnknownError],
    function(results) {
      messageUnknownError = results[messageUnknownError];
    });

  function requestFiltered(filter) {
    var url = '/api/now/connect/support/sessions';
    if (filter) {
      url += '?';
      for (var item in filter)
        if (filter.hasOwnProperty(item))
          url += item + "=" + encodeURIComponent(filter[item]) + "&";
      url = url.slice(0, -1);
    }
    return snHttp.get(url).then(function(response) {
      if (!response.data.result)
        return;
      angular.forEach(response.data.result, function(rawQueueEntry) {
        addRawQueueEntry(rawQueueEntry);
      });
    });
  }

  function addRawQueueEntry(rawQueueEntry) {
    var oldQueueEntry = queueEntries[rawQueueEntry.sys_id];
    if (oldQueueEntry && oldQueueEntry.equals(rawQueueEntry))
      return oldQueueEntry;
    var queueEntry = queueEntryFactory.fromObject(rawQueueEntry);
    queueEntries[queueEntry.conversationID] = queueEntries[queueEntry.sysID] = queueEntry;
    if (ambWatchers[queueEntry.conversationID]) {
      if (queueEntry.isPermanentlyClosed)
        removeAMBWatch(queueEntry.conversationID);
    } else if (!queueEntry.isPermanentlyClosed && (queueEntry.isOpenedByMe === inSupportClient)) {
      ambWatchers[queueEntry.conversationID] = amb.getChannel(GROUP_AMB + queueEntry.conversationID)
        .subscribe(function(response) {
          addRawQueueEntry(response.data);
        });
    }
    $rootScope.$broadcast("connect.queueEntry.updated", queueEntry, oldQueueEntry);
    return queueEntry;
  }

  function removeAMBWatch(conversationID) {
    if (ambWatchers[conversationID]) {
      ambWatchers[conversationID].unsubscribe();
      delete ambWatchers[conversationID];
    }
  }

  function remove(id) {
    var queueEntry = queueEntries[id];
    if (!queueEntry)
      return;
    delete queueEntries[queueEntry.conversationID];
    delete queueEntries[queueEntry.sysID];
    removeAMBWatch(queueEntry.conversationID);
  }

  function postAction(conversationID, action, data) {
    data = data || {};
    if (!conversationID)
      throw 'conversationID cannot be undefined';
    var sessionsApiUri = isLoggedIn ? '/api/now/connect/support/sessions/' : '/api/now/connect/support/anonymous/sessions/';
    return snHttp.post(sessionsApiUri + conversationID + action, data).then(function(response) {
      return addRawQueueEntry(response.data.result);
    });
  }

  function requestByConversation(conversationID) {
    if (!conversationID)
      throw 'conversationID cannot be undefined';
    var queueEntry = queueEntries[conversationID];
    if (queueEntry)
      return $q.when(queueEntry);
    return requestFiltered({
      'group_id': conversationID
    }).then(function() {
      return queueEntries[conversationID];
    });
  }

  function requestNext(queueID) {
    return snHttp.post('/api/now/connect/support/queues/' + queueID + '/accept', {}).then(function(response) {
      return addRawQueueEntry(response.data.result);
    });
  }
  return {
    addRaw: addRawQueueEntry,
    get: function(id) {
      return queueEntries[id];
    },
    requestByConversation: requestByConversation,
    create: function(queueID, message, fromRecord) {
      if (!queueID)
        throw 'queue ID cannot be undefined';
      if (!message)
        throw 'message cannot be undefined';
      var url = isLoggedIn ? '/api/now/connect/support/queues/' + queueID + '/sessions' :
        '/api/now/connect/support/anonymous/queues/' + queueID + '/sessions';
      var data = {
        message: message
      };
      if (fromRecord && fromRecord.table && fromRecord.sysId) {
        data.from_table = fromRecord.table;
        data.from_sysid = fromRecord.sysId;
      }
      return snHttp.post(url, data).then(function(response) {
        return addRawQueueEntry(response.data.result);
      }, function(response) {
        if (response.status === 403 || response.status === 503) {
          snNotification.show("error", response.data.result);
        } else {
          snNotification.show("error", messageUnknownError);
        }
        return $q.reject(response)
      });
    },
    remove: remove,
    close: function(conversationID, agentLeave) {
      return postAction(conversationID, '/close', {
        agent_leave: !!agentLeave
      });
    },
    leave: function(conversationID) {
      return postAction(conversationID, '/leave');
    },
    rejoin: function(conversationID) {
      return postAction(conversationID, '/rejoin');
    },
    escalate: function(conversation, queueID) {
      queueID = queueID || conversation.queueEntry.queue.escalateTo;
      if (!queueID)
        throw "queueID must be set";
      conversation.queueEntry.escalate();
      return postAction(conversation.sysID, '/escalate/' + queueID);
    },
    transfer: function(conversationID, agentID) {
      if (!agentID)
        throw 'agentID cannot be undefined';
      return postAction(conversationID, '/transfer/' + agentID);
    },
    accept: function(conversationID) {
      return postAction(conversationID, '/transfer/accept');
    },
    reject: function(conversationID) {
      var complete = this.complete;
      return postAction(conversationID, '/transfer/reject').then(function() {
        return complete(conversationID);
      });
    },
    cancel: function(conversationID) {
      var complete = this.complete;
      return postAction(conversationID, '/transfer/cancel').then(function() {
        return complete(conversationID);
      });
    },
    complete: function(conversationID) {
      return postAction(conversationID, '/transfer/complete');
    },
    requestNext: requestNext
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/queue/service.queueEntryNotifier.js */
angular.module('sn.connect.queue').service('queueEntryNotifier', function(
  $window, snNotifier, i18n, profiles, userPreferences, activeConversation, snNotification, inFrameSet) {
  'use strict';
  var A_TAG = '<a href="/$c.do#/support" target="_self">{0}</a>';
  var LOCAL_STORAGE_KEY = 'sn.connect.queueEntryNotifier.lastUpdatedOn';
  var NOTIFICATION_TEMPLATE = ['You have an incoming case transfer from {0}.',
    'To view the conversation, accept or decline the request,'
  ].join(' ');
  var transferPendingText,
    transferAcceptedText,
    transferRejectedText,
    transferCancelledText,
    transferPendingNotificationText;
  i18n.getMessages([
    'Incoming chat transfer',
    'Accepted {0}',
    'Rejected {0}',
    'Cancelled transfer {0}',
    'click here',
    NOTIFICATION_TEMPLATE
  ], function(results) {
    transferPendingText = results['Incoming chat transfer'];
    transferAcceptedText = results['Accepted {0}'];
    transferRejectedText = results['Rejected {0}'];
    transferCancelledText = results['Cancelled transfer {0}'];
    transferPendingNotificationText = results[NOTIFICATION_TEMPLATE] + " " + A_TAG.replace(/(\{0})/g, results['click here']);
  });
  var lastUpdatedOn;
  angular.element($window).on('storage', function(e) {
    if (e.originalEvent.key !== LOCAL_STORAGE_KEY)
      return;
    lastUpdatedOn = $window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (lastUpdatedOn) {
      lastUpdatedOn = new Date(lastUpdatedOn)
    }
  });
  return {
    notify: function(conversation) {
      var queueEntry = conversation.queueEntry;
      if (!inFrameSet && !activeConversation.isSupport && queueEntry.isTransferringToMe) {
        profiles.getAsync('sys_user.' + queueEntry.assignedTo).then(function(profile) {
          snNotification.show('info', i18n.format(transferPendingNotificationText, profile.name))
            .then(function(element) {
              element.on('click', function() {
                snNotification.hide(element);
                activeConversation.conversation = conversation;
              });
            });
        });
      }
      userPreferences.getPreference('connect.notifications.desktop').then(function(value) {
        if (value === 'false')
          return;
        if (!queueEntry.isTransferStateChanged)
          return;
        if (queueEntry.transferUpdatedOn <= lastUpdatedOn)
          return;
        var body, userID;
        if (queueEntry.isTransferringToMe) {
          if (queueEntry.isTransferPending) {
            userID = queueEntry.assignedTo;
            body = transferPendingText + "\n" + queueEntry.number + " - " + queueEntry.shortDescription;
          }
          if (queueEntry.isTransferCancelled) {
            userID = queueEntry.assignedTo;
            body = transferCancelledText.replace(/\{0\}/, queueEntry.number);
          }
        } else if (queueEntry.isTransferringFromMe) {
          if (queueEntry.isTransferAccepted) {
            userID = queueEntry.assignedTo;
            body = transferAcceptedText.replace(/\{0\}/, queueEntry.number);
          }
          if (queueEntry.isTransferRejected) {
            userID = queueEntry.transferTo;
            body = transferRejectedText.replace(/\{0\}/, queueEntry.number);
          }
        }
        if (!body)
          return;
        $window.localStorage.setItem(LOCAL_STORAGE_KEY, queueEntry.transferUpdatedOn);
        profiles.getAsync('sys_user.' + userID).then(function(profile) {
          snNotifier().notify(profile.name, {
            body: body,
            onClick: function() {
              activeConversation.conversation = conversation;
            }
          });
        });
      });
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/queue/filter.transferAccepted.js */
angular.module('sn.connect.queue').filter('transferAccepted', function() {
  'use strict';
  return function(input) {
    return input.filter(function(conversation) {
      var queueEntry = conversation.queueEntry;
      return queueEntry && queueEntry.isTransferringFromMe && queueEntry.isTransferAccepted;
    });
  }
});;;
/*! RESOURCE: /scripts/app.ng_chat/search/directive.liveSearch.js */
angular.module('sn.connect').directive('liveSearch', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('liveSearch.xml'),
    replace: true,
    scope: {
      type: '@',
      limit: '@',
      placeholder: '@',
      expandDirection: '@',
      onSelect: '&'
    },
    link: function(scope) {
      scope.forwardOnSelect = function(id) {
        scope.onSelect({
          id: id
        });
      };
    }
  }
});;
/*! RESOURCE: /scripts/app.ng_chat/search/directive.liveSearchControl.js */
angular.module('sn.connect').directive('liveSearchControl', function(
  $compile, $timeout, getTemplateUrl, snHttp, userJID, $rootScope, i18n) {
  'use strict';
  var MINIMUM_TYPING_WAIT = 250;
  var CACHE_TIME_LIMIT = 15 * 60 * 1000;
  var liveSearchTranslatedStrings;
  i18n.getMessages([
    'People', 'No matching people',
    'Groups', 'No matching groups',
    'Messages', 'No matching messages'
  ], function(result) {
    liveSearchTranslatedStrings = result;
  });
  return {
    restrict: 'E',
    templateUrl: function(tElement, tAttrs) {
      if (tAttrs.templateUrl)
        return getTemplateUrl(tAttrs.templateUrl);
      else
        return getTemplateUrl('liveSearchControl.xml');
    },
    replace: true,
    scope: {
      type: '@',
      limit: '@',
      placeholder: '@',
      expandDirection: '@',
      onSelect: '&',
      templateOverride: '=?',
      ignoreBlur: '@',
      onBlur: "&?",
      ignoreList: "="
    },
    link: function(scope, element) {
      scope.triggerCreateConversation = function() {
        $rootScope.$broadcast("connect.show_create_conversation_screen");
        $rootScope.$broadcast('connect.pane.close');
        $rootScope.$broadcast("sn.aside.close", true);
      };
      var suggestionScopes = [];
      var limit = scope.limit || 5;
      var searchURL = '/api/now/connect/search/' + scope.type + '?keywords={query}&limit=' + limit;
      if (!scope.onBlur)
        scope.onBlur = function() {};

      function Search(table) {
        Search.promises = Search.promises || {};
        var that = this;
        this.table = table;
        return function(query, sync, async) {
          that.debounce(function() {
            suggestionScopes.forEach(function(suggestionScope) {
              suggestionScope.$destroy();
            });
            that.getPromise(query).then(function(response) {
              if (response.data.result) {
                angular.forEach(response.data.result, function(result) {
                  if (that.table !== result.table)
                    return;
                  async (result.searchResults);
                });
              } else {
                async ();
              }
              return response;
            });
          });
        };
      }
      Search.prototype.debounce = function(func) {
        $timeout.cancel(this.timeout);
        this.timeout = $timeout(func, MINIMUM_TYPING_WAIT);
      };
      Search.prototype.removeStaleEntries = function() {
        var now = new Date();
        for (var key in Search.promises) {
          if (!Search.promises.hasOwnProperty(key))
            continue;
          var elapsed = now - Search.promises[key].time;
          if (elapsed > CACHE_TIME_LIMIT) {
            delete Search.promises[key];
          }
        }
      };
      Search.prototype.getPromise = function(query) {
        this.removeStaleEntries();
        var url = searchURL.replace("{query}", query);
        if (scope.ignoreList)
          url += "&ignore=" + scope.ignoreList;
        var data = Search.promises[url];
        if (!data) {
          data = Search.promises[url] = {
            promise: snHttp.get(url),
            time: new Date()
          };
        }
        return data.promise;
      };
      var templates = {
        sys_user: '<div class="sn-widget-list_v2"><div class="suggestion-user sn-widget-list-item"><div class="sn-widget-list-content sn-widget-list-content_static"><sn-avatar primary="::profile" class="avatar-small" nopopover="true"></sn-avatar></div><div class="sn-widget-list-content"><span class="name sn-widget-list-title">{{::profile.name}}</span><span class="suggestion-detail sn-widget-list-subtitle">{{::profile.email}}</span></div></div></div>',
        live_message: '<div class="sn-widget-list_v2"><div class="suggestion-message sn-widget-list-item"><div class="sn-widget-list-content sn-widget-list-content_static"><sn-avatar primary="::profile" class="avatar-small" nopopover="true"></sn-avatar></div><div class="details sn-widget-list-content"><span class="body sn-widget-list-title">{{::suggestion.formattedBody}}</span><span class="name sn-widget-list-subtitle">{{::profile.name}}</span></div></div></div>',
        live_group_profile: '<div class="sn-widget-list_v2"><div class="suggestion-group sn-widget-list-item"><div class="sn-widget-list-content sn-widget-list-content_static"><sn-avatar primary="::profile" members="::members" class="avatar-small" nopopover="true"></sn-avatar></div><div class="sn-widget-list-content"><span class="name sn-widget-list-title">{{::suggestion.name}}</span></div></div></div>'
      };
      if (scope.templateOverride)
        angular.extend(templates, scope.templateOverride);
      var buildInitials = function(name) {
        if (!name)
          return "--";
        var initials = name.split(" ").map(function(word) {
          return word.toUpperCase();
        }).filter(function(word) {
          return word.match(/^[A-Z]/);
        }).map(function(word) {
          return word.substring(0, 1);
        }).join("");
        return initials.substr(0, 3);
      };
      var isMember = function(member) {
        return (member && member.jid === userJID);
      };
      var dataSet = function(table, displayKey, header, emptySuggestion) {
        return {
          name: table,
          limit: scope.limit,
          displayKey: displayKey,
          source: new Search(table),
          templates: {
            header: '<div class="header sn-aside-group-title">' + header + '</div>',
            empty: '<div class="empty-suggestion sn-wiget sn-widget-textblock sn-widget-textblock_center">' + emptySuggestion + '</div>',
            suggestion: function(suggestion) {
              var suggestionScope = scope.$new();
              suggestionScopes.push(suggestionScope);
              suggestionScope.suggestion = suggestion;
              if (!isMember(suggestion.from) &&
                !isMember(suggestion.to) &&
                suggestion.to &&
                suggestion.from) {
                suggestionScope.profile = {
                  avatar: suggestion.from.avatarID,
                  initials: buildInitials(suggestion.from.name),
                  name: 'From: ' + suggestion.from.name
                };
              } else if (isMember(suggestion.from) &&
                suggestion.to &&
                suggestion.to.name) {
                suggestionScope.profile = {
                  avatar: suggestion.from.avatarID,
                  initials: buildInitials(suggestion.from.name),
                  name: 'To: ' + suggestion.to.name
                };
              } else if (isMember(suggestion.to) &&
                suggestion.from &&
                suggestion.from.name) {
                suggestionScope.profile = {
                  avatar: suggestion.from.avatarID,
                  initials: buildInitials(suggestion.from.name),
                  name: 'From: ' + suggestion.from.name
                };
              } else {
                suggestionScope.profile = {
                  avatar: suggestion.avatarID,
                  initials: buildInitials(suggestion.name),
                  name: suggestion.name,
                  email: suggestion.email
                };
              }
              if (suggestion.members) {
                suggestionScope.members = [];
                angular.forEach(suggestion.members, function(member) {
                  suggestionScope.members.push({
                    avatar: member.avatarID,
                    initials: buildInitials(suggestion.name),
                    name: name
                  });
                });
              }
              if (suggestion.body) {
                suggestion.formattedBody = suggestion.body.replace(/@\[[a-z0-9]{32}:([^\]]+?)\]/gi, "@$1");
              }
              return $compile(templates[table])(suggestionScope);
            }
          }
        };
      };
      var selected = function(event, suggestion) {
        var id = '';
        if (suggestion.jid.indexOf('live_message') === 0) {
          if (!isMember(suggestion.from) &&
            !isMember(suggestion.to) &&
            suggestion.to &&
            suggestion.from) {
            id = suggestion.to.jid;
          } else if (isMember(suggestion.from) && suggestion.to) {
            id = suggestion.to.jid;
          } else if (isMember(suggestion.to) && suggestion.from) {
            id = suggestion.from.jid;
          }
        } else {
          id = suggestion.jid;
        }
        scope.onSelect({
          id: id,
          suggestion: suggestion
        });
        scope.$apply();
        var target = angular.element(event.target);
        target.typeahead('close');
        target.typeahead('val', '');
      };
      var options = [{
          autoselect: 'first',
          hint: true,
          highlight: false,
          minLength: 2
        },
        dataSet('sys_user', 'name', liveSearchTranslatedStrings['People'], liveSearchTranslatedStrings['No matching people'])
      ];
      if (scope.type !== 'user') {
        options.push(dataSet('live_message', 'body', liveSearchTranslatedStrings['Messages'], liveSearchTranslatedStrings['No matching messages']));
        options.push(dataSet('live_group_profile', 'body', liveSearchTranslatedStrings['Groups'], liveSearchTranslatedStrings['No matching groups']));
      }
      $timeout(function() {
        var input = element.find("input");
        input.on("keydown", function(e) {
          if (input.val() !== "")
            return;
          if (e.keyCode === 8)
            scope.$emit("connect.search_control_key", "backspace");
          else if (e.keyCode === 13)
            scope.$emit("connect.search_control_key", "enter");
          else if (e.keyCode === 27)
            scope.$emit("connect.search_control_key", "escape");
        });
        input.typeahead.apply(input, options);
        input.on('typeahead:selected', selected);
        input.on('typeahead:autocomplete', selected);
        input.on('keydown', function(e) {
          if (e.keyCode === 13) {
            var newEvent = angular.element.Event("keydown");
            newEvent.keyCode = 9;
            input.trigger(newEvent);
          }
        });
        scope.$emit("live.search.control.ready", input);
        if (scope.ignoreBlur) {
          var api = input.data('ttTypeahead');
          api.input.off("blurred");
          api._onBlurred = function() {
            this.isActivated = false;
          };
          api.input.onSync("blurred", api._onBlurred, api);
        }
      });
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/search/directive.liveSearchPopover.js */
angular.module('sn.connect').directive('liveSearchPopover', function($timeout, $document, getTemplateUrl) {
  'use strict';
  var VK_ESC = 27;
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('liveSearchPopover.xml'),
    replace: true,
    scope: {
      type: '@',
      limit: '@',
      buttonId: '@',
      placeholder: '@',
      expandDirection: '@',
      onSelect: '&'
    },
    link: function(scope, element) {
      element.detach();
      var popoverButton;
      var getPopoverButton = function() {
        if (!popoverButton) {
          popoverButton = $document.find("#" + scope.buttonId);
          var toggleIgnore = function(event) {
            popoverButton.ignoreBlurHide = (event.type === 'mousedown');
          };
          popoverButton.mousedown(toggleIgnore);
          popoverButton.mouseup(toggleIgnore);
        }
        return popoverButton;
      };
      scope.onSelectHidePopover = function(id) {
        scope.onSelect({
          id: id
        });
        getPopoverButton().popover('hide');
      };
      scope.$on('live.search.control.ready', function(event, popoverInput) {
        popoverInput.data('ttTypeahead').input.off('blurred');
        var hidePopover = function() {
          var popoverButton = getPopoverButton();
          if (popoverButton.ignoreBlurHide) {
            return;
          }
          popoverButton.popover('hide');
        };
        popoverInput.on('blur', hidePopover);
        popoverInput.keyup(function(event) {
          var code = event.keyCode || event.which;
          if (code !== VK_ESC) {
            return;
          }
          hidePopover();
        });
        getPopoverButton().on('shown.bs.popover', function() {
          popoverInput.focus();
        });
        getPopoverButton().on('hidden.bs.popover', function() {
          popoverInput.typeahead('val', '');
        });
      });
      $timeout(function() {
        getPopoverButton().popover({
          container: 'body',
          placement: scope.expandDirection || 'right',
          html: true,
          content: function() {
            return angular.element('<div />').append(element);
          },
          template: '<div class="sn-live-search-popover popover" role="tooltip">' +
            '<div class="arrow"></div>' +
            '<h3 class="popover-title"></h3>' +
            '<div class="popover-content"></div>' +
            '</div>'
        });
      });
    }
  };
});;
/*! RESOURCE: /scripts/app.ng_chat/search/directive.snSearchButton.js */
angular.module('sn.connect').directive('snSearchButton', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('snSearchButton.xml'),
    replace: true,
    scope: {
      blockAside: '=',
      conversation: '='
    },
    controller: function($scope) {
      $scope.isActive = false;
      var asideView = {
        template: "<sn-aside-search></sn-aside-search>"
      };
      $scope.openAside = function() {
        if (!$scope.buttons)
          $scope.buttons = angular.element('#conversationAsideButtons');
        if ($scope.blockAside || !$scope.conversation.sysID || $scope.conversation.isPending)
          return;
        if ($scope.isActive)
          $scope.$emit("sn.aside.close");
        else
          $scope.$emit("sn.aside.open", asideView, false, $scope.buttons.width());
      };
      $scope.$on("sn.aside.controls.active", function(e, data) {
        $scope.isActive = (data === "search");
      });
      $scope.$on("sn.aside.close", function() {
        $scope.isActive = false;
      });
    }
  };
});;
/*! RESOURCE: /scripts/doctype/CustomEventManager.js */
var NOW = NOW || {};
var CustomEventManager = (function(existingCustomEvent) {
  "use strict";
  var events = (existingCustomEvent && existingCustomEvent.events) || {};
  var isFiringFlag = false;
  var trace = false;
  var suppressEvents = false;
  var NOW_MSG = 'NOW.PostMessage';

  function observe(eventName, fn) {
    if (trace)
      jslog("$CustomEventManager observing: " + eventName);
    on(eventName, fn);
  }

  function on(name, func) {
    if (!func || typeof func !== 'function')
      return;
    if (typeof name === 'undefined')
      return;
    if (!events[name])
      events[name] = [];
    events[name].push(func);
  }

  function un(name, func) {
    if (!events[name])
      return;
    var idx = -1;
    for (var i = 0; i < events[name].length; i++) {
      if (events[name][i] === func) {
        idx = i;
        break;
      }
    }
    if (idx >= 0)
      events[name].splice(idx, 1)
  }

  function unAll(name) {
    if (events[name])
      delete events[name];
  }

  function fire(eventName, args) {
    if (trace)
      jslog("$CustomEventManager firing: " + eventName + " args: " + arguments.length);
    return fireEvent.apply(null, arguments);
  }

  function fireUp(eventName, args) {
    var win = window;
    while (win) {
      try {
        if (win.CustomEvent.fireEvent.apply(null, arguments) === false)
          return;
        win = win.parent === win ? null : win.parent;
      } catch (e) {
        return;
      }
    }
  }

  function fireEvent() {
    if (suppressEvents)
      return true;
    var args = Array.prototype.slice.apply(arguments);
    var name = args.shift();
    var eventList = events[name];
    if (!eventList)
      return true;
    var event = eventList.slice();
    isFiringFlag = true;
    for (var i = 0, l = event.length; i < l; i++) {
      var ev = event[i];
      if (!ev)
        continue;
      if (ev.apply(null, args) === false) {
        isFiringFlag = false;
        return false;
      }
    }
    isFiringFlag = false;
    return true;
  }

  function isFiring() {
    return isFiringFlag;
  }

  function forward(name, element, func) {
    on(name, func);
    element.addEventListener(name, function(e) {
      fireEvent(e.type, this, e);
    }.bind(api));
  }

  function isOriginInWhiteList(origin, whitelistStr) {
    if (!whitelistStr) {
      return false;
    }
    var delimiterRegex = /[\n, ]/;
    var whitelist = whitelistStr.split(delimiterRegex)
      .filter(function(whiteListedOrigin) {
        return whiteListedOrigin;
      })
      .map(function(whiteListedOrigin) {
        return whiteListedOrigin.toLowerCase();
      });
    if (~whitelist.indexOf(origin.toLowerCase())) {
      return true;
    }
    return false;
  }

  function shouldProcessMessage(sourceOrigin) {
    if (!window.g_concourse_onmessage_enforce_same_origin || sourceOrigin === window.location.origin) {
      return true;
    }
    return isOriginInWhiteList(sourceOrigin, window.g_concourse_onmessage_enforce_same_origin_whitelist);
  }

  function registerPostMessageEvent() {
    if (NOW.registeredPostMessageEvent) {
      return;
    }
    if (!window.postMessage) {
      return;
    }
    window.addEventListener('message', function(event) {
      if (!shouldProcessMessage(event.origin)) {
        console.warn('Incoming message ignored due to origin mismatch.');
        return;
      }
      var nowMessageJSON = event.data;
      var nowMessage;
      try {
        nowMessage = JSON.parse(nowMessageJSON.toString());
      } catch (e) {
        return;
      }
      if (!nowMessage.type == NOW_MSG) {
        return;
      }
      fire(nowMessage.eventName, nowMessage.args);
    }, false);
    NOW.registeredPostMessageEvent = true;
  }

  function doPostMessage(win, event, msg, targetOrigin) {
    var nowMessage = {
      type: NOW_MSG,
      eventName: event,
      args: msg
    };
    var nowMessageJSON;
    if (!win || !win.postMessage) {
      return
    }
    nowMessageJSON = JSON.stringify(nowMessage);
    win.postMessage(nowMessageJSON, targetOrigin);
  }

  function fireTop(eventName, args) {
    if (trace)
      jslog("$CustomEventManager firing: " + eventName + " args: " + arguments.length);
    fireEvent.apply(null, arguments);
    var t = getTopWindow();
    if (t !== null && window !== t)
      t.CustomEvent.fire(eventName, args);
  }

  function fireAll(eventName, args) {
    if (trace)
      jslog("$CustomEventManager firing: " + eventName + " args: " + arguments.length);
    var topWindow = getTopWindow();
    notifyAllFrom(topWindow);

    function notifyAllFrom(rootFrame) {
      var childFrame;
      rootFrame.CustomEvent.fireEvent(eventName, args);
      for (var i = 0; i < rootFrame.length; i++) {
        try {
          childFrame = rootFrame[i];
          if (!childFrame)
            continue;
          if (childFrame.CustomEvent && typeof childFrame.CustomEvent.fireEvent === "function") {
            notifyAllFrom(childFrame);
          }
        } catch (e) {}
      }
    }
  }

  function fireToWindow(targetWindow, eventName, args, usePostMessage, targetOrigin) {
    if (trace)
      jslog("$CustomEventManager firing: " + eventName + " args: " + args.length);
    if (usePostMessage) {
      doPostMessage(targetWindow, eventName, args, targetOrigin);
    } else {
      targetWindow.CustomEvent.fireEvent(eventName, args);
    }
  }

  function getTopWindow() {
    var topWindow = window.self;
    try {
      while (topWindow.CustomEvent.fireEvent && topWindow !== topWindow.parent && topWindow.parent.CustomEvent.fireEvent) {
        topWindow = topWindow.parent;
      }
    } catch (e) {}
    return topWindow;
  }

  function isTopWindow() {
    return getTopWindow() == window.self;
  }

  function jslog(msg, src, dateTime) {
    try {
      if (!src) {
        var path = window.self.location.pathname;
        src = path.substring(path.lastIndexOf('/') + 1);
      }
      if (window.self.opener && window != window.self.opener) {
        if (window.self.opener.jslog) {
          window.self.opener.jslog(msg, src, dateTime);
        }
      } else if (parent && parent.jslog && jslog != parent.jslog) {
        parent.jslog(msg, src, dateTime);
      } else {
        if (window.console && window.console.log)
          console.log(msg);
      }
    } catch (e) {}
  }
  var api = {
    set trace(value) {
      trace = !!value;
    },
    get trace() {
      return trace;
    },
    set suppressEvents(value) {
      suppressEvents = !!value;
    },
    get suppressEvents() {
      return suppressEvents;
    },
    get events() {
      return events;
    },
    set events(value) {
      events = value;
    },
    on: on,
    un: un,
    unAll: unAll,
    forward: forward,
    isFiring: isFiring,
    fireEvent: fireEvent,
    observe: observe,
    fire: fire,
    fireTop: fireTop,
    fireAll: fireAll,
    fireToWindow: fireToWindow,
    isTopWindow: isTopWindow,
    fireUp: fireUp,
    toString: function() {
      return 'CustomEventManager';
    }
  };
  registerPostMessageEvent();
  return api;
})(NOW.CustomEvent);
NOW.CustomEvent = CustomEventManager;
if (typeof CustomEvent !== "undefined") {
  CustomEvent.observe = NOW.CustomEvent.observe.bind(NOW.CustomEvent);
  CustomEvent.fire = NOW.CustomEvent.fire.bind(NOW.CustomEvent);
  CustomEvent.fireUp = NOW.CustomEvent.fireUp.bind(NOW.CustomEvent);
  CustomEvent.fireTop = NOW.CustomEvent.fireTop.bind(NOW.CustomEvent);
  CustomEvent.fireAll = NOW.CustomEvent.fireAll.bind(NOW.CustomEvent);
  CustomEvent.fireToWindow = NOW.CustomEvent.fireToWindow.bind(NOW.CustomEvent);
  CustomEvent.on = NOW.CustomEvent.on.bind(NOW.CustomEvent);
  CustomEvent.un = NOW.CustomEvent.un.bind(NOW.CustomEvent);
  CustomEvent.unAll = NOW.CustomEvent.unAll.bind(NOW.CustomEvent);
  CustomEvent.forward = NOW.CustomEvent.forward.bind(NOW.CustomEvent);
  CustomEvent.isFiring = NOW.CustomEvent.isFiring.bind(NOW.CustomEvent);
  CustomEvent.fireEvent = NOW.CustomEvent.fireEvent.bind(NOW.CustomEvent);
  CustomEvent.events = NOW.CustomEvent.events;
  CustomEvent.isTopWindow = NOW.CustomEvent.isTopWindow.bind(NOW.CustomEvent);
} else {
  window.CustomEvent = NOW.CustomEvent;
};;