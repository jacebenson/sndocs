(function ($) {
	'use strict';
	var ESC = 27, F6 = 117, TAB = 9;

	angular.module('sn.itsm.vcab.misc').directive('snFloatBox', function (getTemplateUrl, $timeout, isAccessibilityEnabled, getAllFocussableElements) {
		return {
			restrict: 'E',
			transclude: true,
			scope: {
				show: '=',
				title: '@?',
				width: '@?',
				count: '@?',
				onFocusOutside: '&'
			},
			templateUrl: getTemplateUrl('vcab_sn_float_box.xml'),
			controller: function ($scope) {
				this.close = function close(event) {
					event.stopPropagation();
					$scope.show = false;
				};
				$scope.close = this.close;

				this.open = function open() {
					$scope.show = true;
				};
			},
			link: function ($scope, el, attrs, Ctrl) {
				var dom = $('.sn-float-box', el).detach().appendTo('body');
				var headerDom = $('.modal-header', dom);
				if ($scope.width)
					dom.css('width', $scope.width);
				dom.css({
					right: '20px',
					top: el.offset().top + 10 + 'px'
				});
				
				$scope.isAccessibilityEnabled = isAccessibilityEnabled();

			var left = 0,
				top = 0,
				prevX = 0,
				prevY = 0,
				deltaX = 0,
				deltaY = 0;
			var winWidth = $(document).outerWidth();
			var winHeight = $(document).outerHeight();
			var elWidth = dom.outerWidth();
			var elHeight = dom.outerHeight();

			function onMouseDown(event) {
				// remove the text selected . otherwise mouse drags the text instead of float box.
				// we are not clearing the text automatically. when user clicks the header part, we are clearing the selected text.
				if (document.selection)
					document.selection.empty();
				else if (window.getSelection)
					window.getSelection().removeAllRanges();
				deltaX = 0;
				deltaY = 0;
				prevX = event.pageX;
				prevY = event.pageY;
				var offset = dom.offset();
				left = offset.left;
				top = offset.top;
				winWidth = $(window).outerWidth();
				winHeight = $(window).outerHeight();
				elWidth = dom.outerWidth();
				elHeight = dom.outerHeight();
				$(document).on('mousemove', onMouseMove);
				$(document).on('mouseleave mouseout mouseup dragstart', onMouseLost);
			}

			function onMouseMove(event) {
				/*
				 moves the float box across the window
				 restrict the window to offset left,right,bottom not for top.
				 so that it will not go out of window and user has the ability to drag back into view.
				 */
				var offset = 40;
				deltaX += (event.pageX - prevX);
				deltaY += (event.pageY - prevY);
				prevX = event.pageX;
				prevY = event.pageY;
				// Box can go up to -boxWidth + offset of window
				var finalX = Math.max(-elWidth + offset, left + deltaX);
				// Box can go up to top 0th position of window
				var finalY = Math.max(0, top + deltaY);
				// Box can go it's right up to current windowWidth - offset .
				var finalX = Math.min(winWidth - offset, finalX);
				// Box can go it's bottom up to current windowHeight - offset.
				var finalY = Math.min(winHeight - offset, finalY);
				dom.css({
					left: (finalX + 'px'),
					top: (finalY + 'px')
				});
			}

			function onMouseLost(event) {
				if (event.type == 'mouseout') {
					var from = event.relatedTarget || event.toElement;
					// mouseout will be triggered by every element . so we are checking only HTML element.
					var isMouseOutOfWindow = !from || from.nodeName == 'HTML';
					if (!isMouseOutOfWindow)
						return;
				}
				$(document).off('mousemove', onMouseMove);
				$(document).off('mouseleave mouseout mouseup dragstart', onMouseLost);
			}

			$scope.startMove = function (event) {
					onMouseDown(event);
			};

			$scope.onDialogKeyDown = function ($event) {
				if ($event.keyCode == ESC) {
					Ctrl.close($event);
					$scope.onFocusOutside();
					$event.stopPropagation();
				} else if ($event.keyCode == F6) {
					$scope.onFocusOutside();
					$event.stopPropagation();
				}
			};
			
			$('body').on('keydown.snFloatBox' + $scope.$$id, function (event) {
				if ($scope.show) {
					if (event.keyCode == F6) {
						dom.focus();
						event.preventDefault();
					}
				}
			});

			var all = getAllFocussableElements(dom);
			var firstDom = all.first(), lastDom = all.last();
			all = undefined;
			firstDom.on('keydown.snFloatBox', function (event) {
				if (event.keyCode == TAB && event.shiftKey) {
					lastDom.focus();
					event.preventDefault();
				}
			});
			// Widgets which are displayed within the floatbox
			// must ensure to provide a static last focussable dom.
			lastDom.on('keydown.snFloatBox', function (event) {
				if (event.keyCode == TAB && !event.shiftKey) {
					firstDom.focus();
					event.preventDefault();
				}
			});

			$scope.$on('$destroy', function () {
					$('body').off('.snFloatBox' + $scope.$$id);
					dom.remove();
			});

			}
		};
	});
} (jQuery));