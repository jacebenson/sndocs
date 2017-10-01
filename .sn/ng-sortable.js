/*! RESOURCE: /scripts/libs/ng-sortable-1.3.4/ng-sortable.js */
(function() {
    'use strict';
    angular.module('as.sortable', [])
        .constant('sortableConfig', {
            itemClass: 'as-sortable-item',
            handleClass: 'as-sortable-item-handle',
            placeHolderClass: 'as-sortable-placeholder',
            dragClass: 'as-sortable-drag',
            hiddenClass: 'as-sortable-hidden',
            dragging: 'as-sortable-dragging'
        });
}());
(function() {
    'use strict';
    var mainModule = angular.module('as.sortable');
    mainModule.factory('$helper', ['$document', '$window',
        function($document, $window) {
            return {
                height: function(element) {
                    return element[0].getBoundingClientRect().height;
                },
                width: function(element) {
                    return element[0].getBoundingClientRect().width;
                },
                offset: function(element, scrollableContainer) {
                    var boundingClientRect = element[0].getBoundingClientRect();
                    if (!scrollableContainer) {
                        scrollableContainer = $document[0].documentElement;
                    }
                    return {
                        width: boundingClientRect.width || element.prop('offsetWidth'),
                        height: boundingClientRect.height || element.prop('offsetHeight'),
                        top: boundingClientRect.top + ($window.pageYOffset || scrollableContainer.scrollTop - scrollableContainer.offsetTop),
                        left: boundingClientRect.left + ($window.pageXOffset || scrollableContainer.scrollLeft - scrollableContainer.offsetLeft)
                    };
                },
                eventObj: function(event) {
                    var obj = event;
                    if (event.targetTouches !== undefined) {
                        obj = event.targetTouches.item(0);
                    } else if (event.originalEvent !== undefined && event.originalEvent.targetTouches !== undefined) {
                        obj = event.originalEvent.targetTouches.item(0);
                    }
                    return obj;
                },
                isTouchInvalid: function(event) {
                    var touchInvalid = false;
                    if (event.touches !== undefined && event.touches.length > 1) {
                        touchInvalid = true;
                    } else if (event.originalEvent !== undefined &&
                        event.originalEvent.touches !== undefined && event.originalEvent.touches.length > 1) {
                        touchInvalid = true;
                    }
                    return touchInvalid;
                },
                positionStarted: function(event, target, scrollableContainer) {
                    var pos = {};
                    pos.offsetX = event.pageX - this.offset(target, scrollableContainer).left;
                    pos.offsetY = event.pageY - this.offset(target, scrollableContainer).top;
                    pos.startX = pos.lastX = event.pageX;
                    pos.startY = pos.lastY = event.pageY;
                    pos.nowX = pos.nowY = pos.distX = pos.distY = pos.dirAx = 0;
                    pos.dirX = pos.dirY = pos.lastDirX = pos.lastDirY = pos.distAxX = pos.distAxY = 0;
                    return pos;
                },
                calculatePosition: function(pos, event) {
                    pos.lastX = pos.nowX;
                    pos.lastY = pos.nowY;
                    pos.nowX = event.pageX;
                    pos.nowY = event.pageY;
                    pos.distX = pos.nowX - pos.lastX;
                    pos.distY = pos.nowY - pos.lastY;
                    pos.lastDirX = pos.dirX;
                    pos.lastDirY = pos.dirY;
                    pos.dirX = pos.distX === 0 ? 0 : pos.distX > 0 ? 1 : -1;
                    pos.dirY = pos.distY === 0 ? 0 : pos.distY > 0 ? 1 : -1;
                    var newAx = Math.abs(pos.distX) > Math.abs(pos.distY) ? 1 : 0;
                    if (pos.dirAx !== newAx) {
                        pos.distAxX = 0;
                        pos.distAxY = 0;
                    } else {
                        pos.distAxX += Math.abs(pos.distX);
                        if (pos.dirX !== 0 && pos.dirX !== pos.lastDirX) {
                            pos.distAxX = 0;
                        }
                        pos.distAxY += Math.abs(pos.distY);
                        if (pos.dirY !== 0 && pos.dirY !== pos.lastDirY) {
                            pos.distAxY = 0;
                        }
                    }
                    pos.dirAx = newAx;
                },
                movePosition: function(event, element, pos, container, containerPositioning, scrollableContainer) {
                    var bounds;
                    var useRelative = (containerPositioning === 'relative');
                    element.x = event.pageX - pos.offsetX;
                    element.y = event.pageY - pos.offsetY;
                    if (container) {
                        bounds = this.offset(container, scrollableContainer);
                        if (useRelative) {
                            element.x -= bounds.left;
                            element.y -= bounds.top;
                            bounds.left = 0;
                            bounds.top = 0;
                        }
                        if (element.x < bounds.left) {
                            element.x = bounds.left;
                        } else if (element.x >= bounds.width + bounds.left - this.offset(element).width) {
                            element.x = bounds.width + bounds.left - this.offset(element).width;
                        }
                        if (element.y < bounds.top) {
                            element.y = bounds.top;
                        } else if (element.y >= bounds.height + bounds.top - this.offset(element).height) {
                            element.y = bounds.height + bounds.top - this.offset(element).height;
                        }
                    }
                    element.css({
                        'left': element.x + 'px',
                        'top': element.y + 'px'
                    });
                    this.calculatePosition(pos, event);
                },
                dragItem: function(item) {
                    return {
                        index: item.index(),
                        parent: item.sortableScope,
                        source: item,
                        targetElement: null,
                        targetElementOffset: null,
                        sourceInfo: {
                            index: item.index(),
                            itemScope: item.itemScope,
                            sortableScope: item.sortableScope
                        },
                        canMove: function(itemPosition, targetElement, targetElementOffset) {
                            if (this.targetElement !== targetElement) {
                                this.targetElement = targetElement;
                                this.targetElementOffset = targetElementOffset;
                                return true;
                            }
                            if (itemPosition.dirX * (targetElementOffset.left - this.targetElementOffset.left) > 0 ||
                                itemPosition.dirY * (targetElementOffset.top - this.targetElementOffset.top) > 0) {
                                this.targetElementOffset = targetElementOffset;
                                return true;
                            }
                            return false;
                        },
                        moveTo: function(parent, index) {
                            this.parent = parent;
                            if (this.isSameParent() && this.source.index() < index && !this.sourceInfo.sortableScope.cloning) {
                                index = index - 1;
                            }
                            this.index = index;
                        },
                        isSameParent: function() {
                            return this.parent.element === this.sourceInfo.sortableScope.element;
                        },
                        isOrderChanged: function() {
                            return this.index !== this.sourceInfo.index;
                        },
                        eventArgs: function() {
                            return {
                                source: this.sourceInfo,
                                dest: {
                                    index: this.index,
                                    sortableScope: this.parent
                                }
                            };
                        },
                        apply: function() {
                            if (!this.sourceInfo.sortableScope.cloning) {
                                this.sourceInfo.sortableScope.removeItem(this.sourceInfo.index);
                                if (this.parent.options.allowDuplicates || this.parent.modelValue.indexOf(this.source.modelValue) < 0) {
                                    this.parent.insertItem(this.index, this.source.modelValue);
                                }
                            } else if (!this.parent.options.clone) {
                                this.parent.insertItem(this.index, angular.copy(this.source.modelValue));
                            }
                        }
                    };
                },
                noDrag: function(element) {
                    return element.attr('no-drag') !== undefined || element.attr('data-no-drag') !== undefined;
                },
                findAncestor: function(el, selector) {
                    el = el[0];
                    var matches = Element.matches || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;
                    while ((el = el.parentElement) && !matches.call(el, selector)) {}
                    return el ? angular.element(el) : angular.element(document.body);
                }
            };
        }
    ]);
}());
(function() {
    'use strict';
    var mainModule = angular.module('as.sortable');
    mainModule.controller('as.sortable.sortableController', ['$scope', function($scope) {
        this.scope = $scope;
        $scope.modelValue = null;
        $scope.callbacks = null;
        $scope.type = 'sortable';
        $scope.options = {
            longTouch: false
        };
        $scope.isDisabled = false;
        $scope.insertItem = function(index, itemData) {
            if ($scope.options.allowDuplicates) {
                $scope.modelValue.splice(index, 0, angular.copy(itemData));
            } else {
                $scope.modelValue.splice(index, 0, itemData);
            }
        };
        $scope.removeItem = function(index) {
            var removedItem = null;
            if (index > -1) {
                removedItem = $scope.modelValue.splice(index, 1)[0];
            }
            return removedItem;
        };
        $scope.isEmpty = function() {
            return ($scope.modelValue && $scope.modelValue.length === 0);
        };
        $scope.accept = function(sourceItemHandleScope, destScope, destItemScope) {
            return $scope.callbacks.accept(sourceItemHandleScope, destScope, destItemScope);
        };
    }]);
    mainModule.directive('asSortable',
        function() {
            return {
                require: 'ngModel',
                restrict: 'A',
                scope: true,
                controller: 'as.sortable.sortableController',
                link: function(scope, element, attrs, ngModelController) {
                    var ngModel, callbacks;
                    ngModel = ngModelController;
                    if (!ngModel) {
                        return;
                    }
                    ngModel.$render = function() {
                        scope.modelValue = ngModel.$modelValue;
                    };
                    scope.element = element;
                    element.data('_scope', scope);
                    callbacks = {
                        accept: null,
                        orderChanged: null,
                        itemMoved: null,
                        dragStart: null,
                        dragMove: null,
                        dragCancel: null,
                        dragEnd: null
                    };
                    callbacks.accept = function(sourceItemHandleScope, destSortableScope, destItemScope) {
                        return true;
                    };
                    callbacks.orderChanged = function(event) {};
                    callbacks.itemMoved = function(event) {};
                    callbacks.dragStart = function(event) {};
                    callbacks.dragMove = angular.noop;
                    callbacks.dragCancel = function(event) {};
                    callbacks.dragEnd = function(event) {};
                    scope.$watch(attrs.asSortable, function(newVal, oldVal) {
                        angular.forEach(newVal, function(value, key) {
                            if (callbacks[key]) {
                                if (typeof value === 'function') {
                                    callbacks[key] = value;
                                }
                            } else {
                                scope.options[key] = value;
                            }
                        });
                        scope.callbacks = callbacks;
                    }, true);
                    if (angular.isDefined(attrs.isDisabled)) {
                        scope.$watch(attrs.isDisabled, function(newVal, oldVal) {
                            if (!angular.isUndefined(newVal)) {
                                scope.isDisabled = newVal;
                            }
                        }, true);
                    }
                }
            };
        });
}());
(function() {
    'use strict';
    var mainModule = angular.module('as.sortable');
    mainModule.controller('as.sortable.sortableItemHandleController', ['$scope', function($scope) {
        this.scope = $scope;
        $scope.itemScope = null;
        $scope.type = 'handle';
    }]);

    function isParent(possibleParent, elem) {
        if (!elem || elem.nodeName === 'HTML') {
            return false;
        }
        if (elem.parentNode === possibleParent) {
            return true;
        }
        return isParent(possibleParent, elem.parentNode);
    }
    mainModule.directive('asSortableItemHandle', ['sortableConfig', '$helper', '$window', '$document', '$timeout',
        function(sortableConfig, $helper, $window, $document, $timeout) {
            return {
                require: '^asSortableItem',
                scope: true,
                restrict: 'A',
                controller: 'as.sortable.sortableItemHandleController',
                link: function(scope, element, attrs, itemController) {
                    var dragElement,
                        placeHolder,
                        placeElement,
                        itemPosition,
                        dragItemInfo,
                        containment,
                        containerPositioning,
                        dragListen,
                        scrollableContainer,
                        dragStart,
                        dragMove,
                        dragEnd,
                        dragCancel,
                        isDraggable,
                        placeHolderIndex,
                        bindDrag,
                        unbindDrag,
                        bindEvents,
                        unBindEvents,
                        hasTouch,
                        isIOS,
                        longTouchStart,
                        longTouchCancel,
                        longTouchTimer,
                        dragHandled,
                        createPlaceholder,
                        isPlaceHolderPresent,
                        isDisabled = false,
                        escapeListen,
                        isLongTouch = false;
                    hasTouch = 'ontouchstart' in $window;
                    isIOS = /iPad|iPhone|iPod/.test($window.navigator.userAgent) && !$window.MSStream;
                    if (sortableConfig.handleClass) {
                        element.addClass(sortableConfig.handleClass);
                    }
                    scope.itemScope = itemController.scope;
                    element.data('_scope', scope);
                    scope.$watchGroup(['sortableScope.isDisabled', 'sortableScope.options.longTouch'],
                        function(newValues) {
                            if (isDisabled !== newValues[0]) {
                                isDisabled = newValues[0];
                                if (isDisabled) {
                                    unbindDrag();
                                } else {
                                    bindDrag();
                                }
                            } else if (isLongTouch !== newValues[1]) {
                                isLongTouch = newValues[1];
                                unbindDrag();
                                bindDrag();
                            } else {
                                bindDrag();
                            }
                        });
                    scope.$on('$destroy', function() {
                        angular.element($document[0].body).unbind('keydown', escapeListen);
                    });
                    createPlaceholder = function(itemScope) {
                        if (typeof scope.sortableScope.options.placeholder === 'function') {
                            return angular.element(scope.sortableScope.options.placeholder(itemScope));
                        } else if (typeof scope.sortableScope.options.placeholder === 'string') {
                            return angular.element(scope.sortableScope.options.placeholder);
                        } else {
                            return angular.element($document[0].createElement(itemScope.element.prop('tagName')));
                        }
                    };
                    dragListen = function(event) {
                        event.preventDefault();
                        var unbindMoveListen = function() {
                            angular.element($document).unbind('mousemove', moveListen);
                            angular.element($document).unbind('touchmove', moveListen);
                            element.unbind('mouseup', unbindMoveListen);
                            element.unbind('touchend', unbindMoveListen);
                            element.unbind('touchcancel', unbindMoveListen);
                        };
                        var startPosition;
                        var moveListen = function(e) {
                            e.preventDefault();
                            var eventObj = $helper.eventObj(e);
                            if (!startPosition) {
                                startPosition = {
                                    clientX: eventObj.clientX,
                                    clientY: eventObj.clientY
                                };
                            }
                            if (Math.abs(eventObj.clientX - startPosition.clientX) + Math.abs(eventObj.clientY - startPosition.clientY) > 10) {
                                unbindMoveListen();
                                dragStart(event);
                            }
                        };
                        angular.element($document).bind('mousemove', moveListen);
                        angular.element($document).bind('touchmove', moveListen);
                        element.bind('mouseup', unbindMoveListen);
                        element.bind('touchend', unbindMoveListen);
                        element.bind('touchcancel', unbindMoveListen);
                        event.stopPropagation();
                    };
                    dragStart = function(event) {
                        var eventObj, tagName;
                        if (!hasTouch && (event.button === 2 || event.which === 3)) {
                            return;
                        }
                        if (hasTouch && $helper.isTouchInvalid(event)) {
                            return;
                        }
                        if (dragHandled || !isDraggable(event)) {
                            return;
                        }
                        dragHandled = true;
                        event.preventDefault();
                        eventObj = $helper.eventObj(event);
                        scope.sortableScope = scope.sortableScope || scope.itemScope.sortableScope;
                        scope.callbacks = scope.callbacks || scope.itemScope.callbacks;
                        if (scope.itemScope.sortableScope.options.clone || (scope.itemScope.sortableScope.options.ctrlClone && event.ctrlKey)) {
                            scope.itemScope.sortableScope.cloning = true;
                        } else {
                            scope.itemScope.sortableScope.cloning = false;
                        }
                        scrollableContainer = angular.element($document[0].querySelector(scope.sortableScope.options.scrollableContainer)).length > 0 ?
                            $document[0].querySelector(scope.sortableScope.options.scrollableContainer) : $document[0].documentElement;
                        containment = (scope.sortableScope.options.containment) ? $helper.findAncestor(element, scope.sortableScope.options.containment) : angular.element($document[0].body);
                        containment.css('cursor', 'move');
                        containment.css('cursor', '-webkit-grabbing');
                        containment.css('cursor', '-moz-grabbing');
                        containment.addClass('as-sortable-un-selectable');
                        containerPositioning = scope.sortableScope.options.containerPositioning || 'absolute';
                        dragItemInfo = $helper.dragItem(scope);
                        tagName = scope.itemScope.element.prop('tagName');
                        dragElement = angular.element($document[0].createElement(scope.sortableScope.element.prop('tagName')))
                            .addClass(scope.sortableScope.element.attr('class')).addClass(sortableConfig.dragClass);
                        dragElement.css('width', $helper.width(scope.itemScope.element) + 'px');
                        dragElement.css('height', $helper.height(scope.itemScope.element) + 'px');
                        placeHolder = createPlaceholder(scope.itemScope)
                            .addClass(sortableConfig.placeHolderClass).addClass(scope.sortableScope.options.additionalPlaceholderClass);
                        placeHolder.css('width', $helper.width(scope.itemScope.element) + 'px');
                        placeHolder.css('height', $helper.height(scope.itemScope.element) + 'px');
                        placeElement = angular.element($document[0].createElement(tagName));
                        if (sortableConfig.hiddenClass) {
                            placeElement.addClass(sortableConfig.hiddenClass);
                        }
                        itemPosition = $helper.positionStarted(eventObj, scope.itemScope.element, scrollableContainer);
                        if (!scope.itemScope.sortableScope.options.clone) {
                            scope.itemScope.element.after(placeHolder);
                        }
                        if (scope.itemScope.sortableScope.cloning) {
                            dragElement.append(scope.itemScope.element.clone());
                        } else {
                            scope.itemScope.element.after(placeElement);
                            dragElement.append(scope.itemScope.element);
                        }
                        containment.append(dragElement);
                        $helper.movePosition(eventObj, dragElement, itemPosition, containment, containerPositioning, scrollableContainer);
                        scope.sortableScope.$apply(function() {
                            scope.callbacks.dragStart(dragItemInfo.eventArgs());
                        });
                        bindEvents();
                    };
                    isDraggable = function(event) {
                        var elementClicked, sourceScope, isDraggable;
                        elementClicked = angular.element(event.target);
                        sourceScope = fetchScope(elementClicked);
                        isDraggable = (sourceScope && sourceScope.type === 'handle');
                        while (isDraggable && elementClicked[0] !== element[0]) {
                            if ($helper.noDrag(elementClicked)) {
                                isDraggable = false;
                            }
                            elementClicked = elementClicked.parent();
                        }
                        return isDraggable;
                    };

                    function insertBefore(targetElement, targetScope) {
                        if (placeHolder.css('display') !== 'table-row') {
                            placeHolder.css('display', 'block');
                        }
                        if (!targetScope.sortableScope.options.clone) {
                            targetElement[0].parentNode.insertBefore(placeHolder[0], targetElement[0]);
                            dragItemInfo.moveTo(targetScope.sortableScope, targetScope.index());
                        }
                    }

                    function insertAfter(targetElement, targetScope) {
                        if (placeHolder.css('display') !== 'table-row') {
                            placeHolder.css('display', 'block');
                        }
                        if (!targetScope.sortableScope.options.clone) {
                            targetElement.after(placeHolder);
                            dragItemInfo.moveTo(targetScope.sortableScope, targetScope.index() + 1);
                        }
                    }
                    dragMove = function(event) {
                        var eventObj, targetX, targetY, targetScope, targetElement;
                        if (hasTouch && $helper.isTouchInvalid(event)) {
                            return;
                        }
                        if (!dragHandled) {
                            return;
                        }
                        if (dragElement) {
                            event.preventDefault();
                            eventObj = $helper.eventObj(event);
                            if (scope.callbacks.dragMove !== angular.noop) {
                                scope.sortableScope.$apply(function() {
                                    scope.callbacks.dragMove(itemPosition, containment, eventObj);
                                });
                            }
                            targetX = eventObj.pageX - $document[0].documentElement.scrollLeft;
                            targetY = eventObj.pageY - ($window.pageYOffset || $document[0].documentElement.scrollTop);
                            targetElement = angular.element($document[0].elementFromPoint(targetX, targetY));
                            dragElement.addClass(sortableConfig.hiddenClass);
                            dragElement.removeClass(sortableConfig.hiddenClass);
                            $helper.movePosition(eventObj, dragElement, itemPosition, containment, containerPositioning, scrollableContainer);
                            dragElement.addClass(sortableConfig.dragging);
                            targetScope = fetchScope(targetElement);
                            if (!targetScope || !targetScope.type) {
                                return;
                            }
                            if (targetScope.type === 'handle') {
                                targetScope = targetScope.itemScope;
                            }
                            if (targetScope.type !== 'item' && targetScope.type !== 'sortable') {
                                return;
                            }
                            if (targetScope.type === 'item' && targetScope.accept(scope, targetScope.sortableScope, targetScope)) {
                                targetElement = targetScope.element;
                                var targetElementOffset = $helper.offset(targetElement, scrollableContainer);
                                if (!dragItemInfo.canMove(itemPosition, targetElement, targetElementOffset)) {
                                    return;
                                }
                                var placeholderIndex = placeHolderIndex(targetScope.sortableScope.element);
                                if (placeholderIndex < 0) {
                                    insertBefore(targetElement, targetScope);
                                } else {
                                    if (placeholderIndex <= targetScope.index()) {
                                        insertAfter(targetElement, targetScope);
                                    } else {
                                        insertBefore(targetElement, targetScope);
                                    }
                                }
                            }
                            if (targetScope.type === 'sortable') {
                                if (targetScope.accept(scope, targetScope) &&
                                    !isParent(targetScope.element[0], targetElement[0])) {
                                    if (!isPlaceHolderPresent(targetElement) && !targetScope.options.clone) {
                                        targetElement[0].appendChild(placeHolder[0]);
                                        dragItemInfo.moveTo(targetScope, targetScope.modelValue.length);
                                    }
                                }
                            }
                        }
                    };

                    function fetchScope(element) {
                        var scope;
                        while (!scope && element.length) {
                            scope = element.data('_scope');
                            if (!scope) {
                                element = element.parent();
                            }
                        }
                        return scope;
                    }
                    placeHolderIndex = function(targetElement) {
                        var itemElements, i;
                        if (targetElement.hasClass(sortableConfig.placeHolderClass)) {
                            return 0;
                        }
                        itemElements = targetElement.children();
                        for (i = 0; i < itemElements.length; i += 1) {
                            if (angular.element(itemElements[i]).hasClass(sortableConfig.placeHolderClass)) {
                                return i;
                            }
                        }
                        return -1;
                    };
                    isPlaceHolderPresent = function(targetElement) {
                        return placeHolderIndex(targetElement) >= 0;
                    };

                    function rollbackDragChanges() {
                        if (!scope.itemScope.sortableScope.cloning) {
                            placeElement.replaceWith(scope.itemScope.element);
                        }
                        placeHolder.remove();
                        dragElement.remove();
                        dragElement = null;
                        dragHandled = false;
                        containment.css('cursor', '');
                        containment.removeClass('as-sortable-un-selectable');
                    }
                    dragEnd = function(event) {
                        if (!dragHandled) {
                            return;
                        }
                        event.preventDefault();
                        if (dragElement) {
                            rollbackDragChanges();
                            dragItemInfo.apply();
                            scope.sortableScope.$apply(function() {
                                if (dragItemInfo.isSameParent()) {
                                    if (dragItemInfo.isOrderChanged()) {
                                        scope.callbacks.orderChanged(dragItemInfo.eventArgs());
                                    }
                                } else {
                                    scope.callbacks.itemMoved(dragItemInfo.eventArgs());
                                }
                            });
                            scope.sortableScope.$apply(function() {
                                scope.callbacks.dragEnd(dragItemInfo.eventArgs());
                            });
                            dragItemInfo = null;
                        }
                        unBindEvents();
                    };
                    dragCancel = function(event) {
                        if (!dragHandled) {
                            return;
                        }
                        event.preventDefault();
                        if (dragElement) {
                            rollbackDragChanges();
                            scope.sortableScope.$apply(function() {
                                scope.callbacks.dragCancel(dragItemInfo.eventArgs());
                            });
                            dragItemInfo = null;
                        }
                        unBindEvents();
                    };
                    bindDrag = function() {
                        if (hasTouch) {
                            if (isLongTouch) {
                                if (isIOS) {
                                    element.bind('touchstart', longTouchStart);
                                    element.bind('touchend', longTouchCancel);
                                    element.bind('touchmove', longTouchCancel);
                                } else {
                                    element.bind('contextmenu', dragListen);
                                }
                            } else {
                                element.bind('touchstart', dragListen);
                            }
                        }
                        element.bind('mousedown', dragListen);
                    };
                    unbindDrag = function() {
                        element.unbind('touchstart', longTouchStart);
                        element.unbind('touchend', longTouchCancel);
                        element.unbind('touchmove', longTouchCancel);
                        element.unbind('contextmenu', dragListen);
                        element.unbind('touchstart', dragListen);
                        element.unbind('mousedown', dragListen);
                    };
                    longTouchStart = function(event) {
                        longTouchTimer = $timeout(function() {
                            dragListen(event);
                        }, 500);
                    };
                    longTouchCancel = function() {
                        $timeout.cancel(longTouchTimer);
                    };
                    escapeListen = function(event) {
                        if (event.keyCode === 27) {
                            dragCancel(event);
                        }
                    };
                    angular.element($document[0].body).bind('keydown', escapeListen);
                    bindEvents = function() {
                        angular.element($document).bind('touchmove', dragMove);
                        angular.element($document).bind('touchend', dragEnd);
                        angular.element($document).bind('touchcancel', dragCancel);
                        angular.element($document).bind('mousemove', dragMove);
                        angular.element($document).bind('mouseup', dragEnd);
                    };
                    unBindEvents = function() {
                        angular.element($document).unbind('touchend', dragEnd);
                        angular.element($document).unbind('touchcancel', dragCancel);
                        angular.element($document).unbind('touchmove', dragMove);
                        angular.element($document).unbind('mouseup', dragEnd);
                        angular.element($document).unbind('mousemove', dragMove);
                    };
                }
            };
        }
    ]);
}());
(function() {
    'use strict';
    var mainModule = angular.module('as.sortable');
    mainModule.controller('as.sortable.sortableItemController', ['$scope', function($scope) {
        this.scope = $scope;
        $scope.sortableScope = null;
        $scope.modelValue = null;
        $scope.type = 'item';
        $scope.index = function() {
            return $scope.$index;
        };
        $scope.itemData = function() {
            return $scope.sortableScope.modelValue[$scope.$index];
        };
    }]);
    mainModule.directive('asSortableItem', ['sortableConfig',
        function(sortableConfig) {
            return {
                require: ['^asSortable', '?ngModel'],
                restrict: 'A',
                controller: 'as.sortable.sortableItemController',
                link: function(scope, element, attrs, ctrl) {
                    var sortableController = ctrl[0];
                    var ngModelController = ctrl[1];
                    if (sortableConfig.itemClass) {
                        element.addClass(sortableConfig.itemClass);
                    }
                    scope.sortableScope = sortableController.scope;
                    if (ngModelController) {
                        ngModelController.$render = function() {
                            scope.modelValue = ngModelController.$modelValue;
                        };
                    } else {
                        scope.modelValue = sortableController.scope.modelValue[scope.$index];
                    }
                    scope.element = element;
                    element.data('_scope', scope);
                }
            };
        }
    ]);
}());;