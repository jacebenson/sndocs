(function ($) {
	'use strict';
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

	angular.module('sn.itsm.vcab.common').directive('snCabLineClamp', function ($timeout) {
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
				var $el = $(element).children('div');
				var isWidthSet = false;
				if($(element).closest('.snc-common-calendar').length == 0)
					isWidthSet = true;
				function tryText() {
					if(!isWidthSet) {
						var $calHeader = $('.dhx_cal_header > div > div:first-child');
						if($calHeader.length > 0) {
							isWidthSet = true;
							var marginRight = 10;
							var left = $calHeader.position().left;
							var maxWidth = left - element.position().left - marginRight;
							$el.closest('td').css({
								'width': (left + 1) + 'px'
							});
							$el.closest('p').css({
								'width': maxWidth + 'px',
								'margin-right': marginRight + 'px'
							});
						}
					}

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
}(jQuery));