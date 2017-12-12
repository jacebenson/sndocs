(function ($) {
	'use strict';

	angular.module('sn.itsm.vcab.misc').factory('getAllFocussableElements', function () {
		var tabbableSelector = 'a[href], area[href], input:not([disabled]):not([tabindex=\'-1\']), '
		+ 'button:not([disabled]):not([tabindex=\'-1\']),select:not([disabled]):not([tabindex=\'-1\']),'
		+' textarea:not([disabled]):not([tabindex=\'-1\']), iframe, object, '
		+'embed, *[tabindex]:not([tabindex=\'-1\']), *[contenteditable=true]';
		return function (searchInEl) {
			return $(tabbableSelector, searchInEl);
		};
	});
} (jQuery));