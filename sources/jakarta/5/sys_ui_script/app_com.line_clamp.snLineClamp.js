angular.module('sn.app_common.line_clamp', [])
.directive('snLineClamp', function ($timeout) {
	return {
		restrict: 'E',
		scope: {
			text: '@',
			maxLines: '@'
		},
		template: '<div>{{truncatedText}}</div>',
			link: function (scope, element, attrs) {
				var maxLines = parseInt(scope.maxLines || 1);
				var isClamped = false;
				var $el = angular.element(element).children('div');
				
				function removeLastWords(txt, count) {
					if (txt && count) {
						txt = txt.replace(/[\t\n\r\s]+/g, ' ').trim();
						var idx = txt.length;
						for (var i = txt.length - 1; i >= 0; i--) {
							var c = txt.charAt(i);
							if (c === ' ')
								count--;
							if (count === 0) {
								return txt.substring(0, i);
							}
						}
					}
					return txt;
				}
				
				
				function tryText() {
					$timeout(function () {
						if ($el.get(0).scrollHeight > (scope.maxAllowedHt + 5)) {
							scope.truncatedText = removeLastWords(scope.text, ++scope.counter) + ' …';
							$el.attr('title', scope.text);
							tryText();
						} else if (scope.counter === 0) {
							scope.truncatedText = scope.text;
							$el.removeAttr('title');
						}
					}, 1);
				}
				
				function clamp () {
					if (!isClamped) {
						scope.maxAllowedHt = parseInt($el.css('line-height')) * maxLines;
						$el.css({
							'max-height': scope.maxAllowedHt + 'px',
						});
						isClamped = true;
					}
					scope.counter = 0;
					scope.truncatedText = scope.text;
					tryText();
				}
				scope.$watch('text', clamp);
			}
		};
	});