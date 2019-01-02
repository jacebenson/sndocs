function($scope, runtimeState, vcabDataSource, spUtil, $log, snRecordWatcher) {
	var c = this;
	var isAlreadyWarned = false;
	var meetingId = c.data.sys_id;
	var RELEVANT_FIELDS = ['start_date', 'end_date', 'short_description',
												 'number', 'assigned_to', 'assignment_group'];
	c.configOptions = {};
	c.keyNav = true;
	runtimeState.get(meetingId).then(function (rst) {
		$scope.rst = rst;
	});
	var wChan;
	function watchCurrentChange() {
		if (wChan)
			wChan.unsubscribe();
		wChan = snRecordWatcher.initChannel('change_request', "sys_id=" + c.change.sys_id.value);
		wChan.subscribe(function (resp) {
			// We are not ignoring the changes even when made by current user.
			// This is because the current user might very well open this change's
			// form in modal (from form widget) and update its details. And we expect
			// to see those changes in calendar. However, we do not want to get into
			// a race-like condition, where calendar changes the data and when that
			// triggers the watch we again refetch the data, since calendar would already
			// have refetched the data.
			if (resp.data.action === 'change') {
				if (resp.data.changes.some(function (a) {
					return RELEVANT_FIELDS.indexOf(a) > -1;
				})) {
					if (c.change && parseInt(resp.data.record.sys_mod_count.value) !== parseInt(c.change.sys_mod_count.value)) {
						fetchChange(c.change.sys_id.value);
					}
				}
			} else {
				c.change = null;
				wChan.unsubscribe();
				wChan = null;
			}
		});
	}
	function fetchChangeForAgenda(agendaId) {
		if (!agendaId) {
			c.change = null;
			return;
		}
		c.server.get({agendaId: agendaId}).then(function (resp) {
			c.canRead = resp.data.canRead;
			c.canWrite = resp.data.canWrite;
			if (c.canRead) {
				// We use REST instead of spUtil to get change data since it gets
				// all attributes and their values & display values.
				fetchChange(resp.data.changeId);
			}
		});
	}
	function fetchChange(changeId) {
		vcabDataSource.change.get(changeId).then(function (change) {
			c.change = change;
			watchCurrentChange();
		});
	}
	$scope.$watch('rst.current_agenda_item.value', fetchChangeForAgenda);
	$scope.$watch('rst.localState.viewing', fetchChangeForAgenda);
	c.onWarn = function (msg) {
		if (!isAlreadyWarned) {
			$log.warn(msg);
			spUtil.addErrorMessage(msg);
			isAlreadyWarned = true;
		}
	};
}