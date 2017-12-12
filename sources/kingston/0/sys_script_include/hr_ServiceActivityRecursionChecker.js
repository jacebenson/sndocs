var hr_ServiceActivityRecursionChecker = Class.create();
hr_ServiceActivityRecursionChecker.prototype = {
    initialize: function(child, parent) {
		this.child = child + '';
		this.parent = parent + '';
		this.recursive = false;
    },

	isRecursive: function() {
		if (gs.nil(this.child) || gs.nil(this.parent))
			return false;
		if (this.child == this.parent)
			return true;

		var checked = [];
		checked.push(this.parent);
		this._walkTree(checked, this.child);
		return this.recursive;
	},

	_walkTree: function(myChecked, hrServiceId) {
		// use GlideAggregate to get unique child HR services (in case, for whatever reason, there are multiple of the same child for the given parent)
		var ga = new GlideAggregate('sn_hr_core_service_activity');
		ga.addQuery('parent_service', hrServiceId);
		ga.addQuery('activity_type', 'child');
		ga.addNotNullQuery('child_hr_service');
		ga.addAggregate('count');
		ga.groupBy('child_hr_service');
		ga.query();

        myChecked.push(hrServiceId);
		while (!this.recursive && ga.next()) {
			if (myChecked.indexOf(ga.getValue('child_hr_service')) > -1) {
				this.recursive = true;
				return;
			}
			this._walkTree(myChecked.slice(), ga.getValue('child_hr_service'));
		}

	},

    type: 'hr_ServiceActivityRecursionChecker'
};