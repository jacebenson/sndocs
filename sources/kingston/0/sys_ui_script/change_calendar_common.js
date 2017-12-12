(function ($) {
angular.module('sn.itsm.vcab.common', ['sn.common.auth', 'ng.amb', 'sn.change_management.cab'])
.constant('Tables', {
	MEETING: 'cab_meeting',
	AGENDA: 'cab_agenda_item',
	AGENDA_BASE: 'mtg_agenda_item',
	ATTENDEE: 'cab_attendee',
	CHANGE: 'change_request'
})
.constant('CtrlIds', { // List of all controller ids which can be used to fetch respective controller's instances.
	MEETING_HEADER: 'mtg_header'
}).
value('isAccessibilityEnabled', function () {
	return window.g_accessibility == 'true';
}).
value('isMobile', function() {
	var ua = window.navigator.userAgent;
	if( ua.match(/Android/i) ||
		ua.match(/webOS/i) ||
		ua.match(/iPhone/i) ||
		ua.match(/iPad/i) ||
		ua.match(/iPod/i) ||
		ua.match(/BlackBerry/i) ||
		ua.match(/Windows Phone/i))
			return true;

			return false;
})
.directive('snCabFocusInOut', function ($timeout) {
	return {
		restrict: 'A',
		scope: {
			snCabFocusInOut: '&'
		},
		link: function ($scope, el, attrs) {
			var $el = $(el);
			var fin = false, fout = false;
			$el.on('focusin.snCabFocusInOut', function () {
				checkForEvent();
				fin = true;
			});
			$el.on('focusout.snCabFocusInOut', function () {
				checkForEvent();
				fout = true;
			});
			var timer;
			function checkForEvent() {
				fout = false;
				fin = false;
				if (timer)
					$timeout.cancel(timer);
				timer = $timeout(function () {
					if (fout)
						$scope.snCabFocusInOut({$isFocusIn: false});
					if (fin)
						$scope.snCabFocusInOut({$isFocusIn: true});
					fin = false;
					fout = false;
					timer = undefined;
			  }, 100);
			}
			$scope.$on('$destroy', function () {
				$el.off('.snCabFocusInOut');
			});
		}
	};
})
.directive('snFocusContainer', function () {
	var TAB = 9;
	return {
		restrict: 'A',
		scope: false,
		link: function ($scope, el, attrs) {
			var $el = $(el);
			$el.on('keydown.snFocusContainer', '[first-focussable-element="true"]', function (event) {
				if (event.keyCode == TAB && event.shiftKey) {
					$('[last-focussable-element="true"]', $el).focus();
					event.preventDefault();
				}
			});
			$el.on('keydown.snFocusContainer', '[last-focussable-element="true"]', function (event) {
				if (event.keyCode == TAB && !event.shiftKey) {
					$('[first-focussable-element="true"]', $el).focus();
					event.preventDefault();
				}
			});
			$scope.$on('$destroy', function () {
				$el.off('.snFocusContainer');
			});
		}
	};
});
}(jQuery));