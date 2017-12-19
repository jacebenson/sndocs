var TableRotationCleanTime = Class.create();
TableRotationCleanTime.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	/*
	 * The current time, plus the shard duration time, times the number of shards, plus a day.
	 * For example:
	 *   now + 5 minutes per shard * 4 shards + 1 day -> 1 day, 20 minutes from now
	 */
	getCleanTime: function() {
		var now = new GlideDateTime();
		var count = this.getParameter('sysparm_rotation_count');
		var duration = this.getParameter('sysparm_rotation_duration');
		for (var i = 0; i < parseInt(count); ++i) {
			now.add(
				duration == '' ? 0 : this._calculateTimeDuration(duration)
			);
		}
		now.addDays(1);
		return now.getDisplayValue();
	},
	
	_calculateTimeDuration : function(duration) {
		var gd = new GlideDuration();
		gd.setValue(duration);

		var gdt = new GlideDateTime();
		gdt.setNumericValue(0);
		gdt.add(gd);
		return gdt.getNumericValue();
	}

});
