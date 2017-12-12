function($scope, runtimeState, meetingAgenda, vcabDataSource, CAB, i18n) {
	// widget controller
	var c = this;
	var RIGHT = 39, LEFT = 37, ENTER = 13, SPACE = 32, TAB = 9;
	if (c.data.tabs && c.data.tabs.length > 0)
		c.showing = c.data.tabs[0].id;

	var activeTabIndex  = 0;
	$scope.$on(CAB.FOCUS_TO_CHANGE_TAB, function(){
		$scope.focus('current-change-tab-' + activeTabIndex);
	});

	$scope.getTabWidgetAriaLabel = function (number) {
		if (number)
			return i18n.format(c.data.i18n.tabPanelAriaLabel, [number]);
		else
			return "${Current Change tab panel}";
	};

	$scope.focus = function (id) {
		angular.element('#'+id).focus();
	};

	var isFirstTime = true;
	$scope.onTabClick = function(id, index){
		activeTabIndex = index;
		c.showing = id;
		// when calendar is shown first time,
		// focus is going to body element.
		if(isFirstTime && (activeTabIndex == 1)) {
			isFirstTime = false;
			setTimeout(function(){
				$scope.focus('current-change-tab-' + id);
			},1000);
		}
	};

	$scope.navigateTabbar = function ($event, $index) {
		var valid = false;
		if ($event.keyCode == RIGHT) {
			$index++;
			valid = true;
		} else if ($event.keyCode == LEFT) {
			$index--;
			valid = true;
		}else if($event.which == TAB && !$event.shiftKey){
			var $target = $("#dhx_minical_icon");
			if($target.length == 0 || (activeTabIndex != 1))
				return;
			$event.stopPropagation();
			$event.preventDefault();
			$target.focus();
			return;
		}
		if (valid) {
			if ($index < 0)
				$index = c.data.tabs.length - 1;
			else if ($index > c.data.tabs.length - 1)
				$index = 0;
			$scope.focus('current-change-tab-' + $index);
			$event.preventDefault();
			$event.stopPropagation();
			return true;
		}
		return false;
	};

	var rs = runtimeState.get(c.data.sys_id).then(function (rst) {
		$scope.rst = rst;
	});
	function onNewAgenda(agendaId) {
		if (!agendaId) {
			c.change = null;
			if (!meetingAgenda.getNextPendingAgendaItem())
				c.showing = c.data.tabs[0].id; // if user is on calender and agenda items completed, then move to default form tab where message is shown
			return;
		}
		vcabDataSource.change.getByAgendaId(agendaId).then(function (change) {
			c.change = change;
		});
	}
	$scope.$watch('rst.current_agenda_item.value', function(agendaId) {
		if (runtimeState.isViewingCurrent()) {
			onNewAgenda(agendaId);
		}
	});
	$scope.$watch('rst.localState.viewing', onNewAgenda);
	$scope.$watch('rst.cab_meeting.record.state.value', function(recordState) {
		if (recordState == CAB.COMPLETE) {
			c.change = null;
			c.showing = c.data.tabs[0].id; // if user is on calender and meeting is finished, then move to default form tab where message is shown
		}
	});
}