function currentAgendaItemLink(scope, element, attr){
	var focusTimerId;
	var EVENT_NAME = 'current_agenda_action_';
	var counter = 0;
	var CABActions = $injector.get("CAB");
	scope.focusEl = CABActions.ACTION_DUMMY;
	element.on('click', function($event) {
		var id = angular.element($event.target).attr('id');
		if(!id)
			return;
		if(id.indexOf(EVENT_NAME) < 0)
			return;
		scope.focusEl = CABActions.ACTION_DUMMY;
		$event.stopPropagation();
	});

	scope.focusToAgendaLinkControls = function(val) {
		setTimeout(function() {
			scope.focusEl = val;
		}, 100);
	}

	focusWatcher = scope.$watch('focusEl', function(newValue, oldValue){
		if(!newValue)
			return;
		if(newValue == CABActions.ACTION_DUMMY)
			return;
		clearTimeout(focusTimerId);
		focusTimerId = undefined;
		counter = 0;

		function focusToElement() {
			if(counter++ == 5)
				return;
			var el = element.find('#' + newValue);
			if(newValue == CABActions.ACTION_APPROVE || newValue == CABActions.ACTION_REJECT) {
				if(el.attr('disabled')) {
					newValue = CABActions.ACTION_CURRENT_AGENDA_ITEM;
					el = element.find('#' + newValue);
				}
			}

			el.focus();
			if(el.length == 0)
				focusTimerId = setTimeout(focusToElement, 100);
		}
		focusToElement();

	});
	}