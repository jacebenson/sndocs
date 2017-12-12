function($scope, el, attr) {
	var focusId;
	$(el).on('click', '.cxs-result-title>a', function($event) {
		focusId = $(this).attr('id');
	});

	$scope.onBackToResult = function() {
		setTimeout(function() {
			$('#' + focusId).focus();
		}, 500);
	};

	/*
		we can use angular expressions for the below funtionalities. But JAWS is reading angular expressions on live regions.
		so we are manipulating directly DOM.
	*/
	var timerPromise;
	$scope.cxs.ariaStatus = '';
	var $timeout = $injector.get('$timeout');
	function updateAriaStatus(msg) {
		var target = $(el).find('#sp_cxs_aria_status')[0];
		$scope.cxs.ariaStatus = msg; 
		target.innerHTML = '<div class="sr-only">' +$('<div>', { text:msg }).html() + '</div>';
	}

	$scope.setAriaStatus = function(msg, delay) {
		delay = delay || 0;
		if(delay == 0 || timerPromise)
			$timeout.cancel(timerPromise);

		(function(val) {
			timerPromise = $timeout(function() {
				timerPromise = undefined;
				updateAriaStatus(val);
		}, delay);})(msg);
	}

	$scope.setAriaStatus(scope.c.data.ariaMsgs.noResultsToDisplay);
}