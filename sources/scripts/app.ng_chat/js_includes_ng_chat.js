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
      name: '@'
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
        if (previousView.cacheKey) {
          element.find(findPrefix + previousView.cacheKey).show();
        } else {
          element.find(findPrefix + scope.history.length).show();
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
        if (snTabActivity.isVisible && a