var DiscoveryResult = Class.create();
DiscoveryResult.prototype = {
    initialize: function(status) {
		this.status = status;
    },

	createResult: function(schedule) {
		var dr = new GlideRecord("discovery_result");
		dr.setValue('status', this.status);
		if (schedule)
			dr.setValue('schedule', schedule);

		dr.setValue('started', new GlideDateTime());
		dr.setValue('state', 'Starting');
		dr.insert();
	},

	_getResultGr: function() {
		var dr = new GlideRecord("discovery_result");
		dr.addQuery('status', this.status);
		dr.query();
		if (!dr.next())
			return null;

		return dr;
	},

	_getDeviceHistoryGrs: function() {
		var dh = new GlideRecord("discovery_device_history");
		dh.addQuery('status', this.status);
		dh.query();
		if (!dh.hasNext())
			return null;

		return dh;
	},

	incrementField: function(field, num) {
		var dr = this._getResultGr();
		if (!dr)
			return;

		var mu = GlideMultipleUpdate("discovery_result");
		mu.setIncrement(field, num);
		mu.addQuery('sys_id', dr.sys_id);
		mu.execute();
	},

	markCompleted: function() {
		var activeNoClassify = 0;
		var duplicate = 0;
		var created = 0;
		var updated = 0;
		
		var dr = this._getResultGr();
		if (!dr)
			return;

		// There is a case where discovery completes before there
		// is a device history record (scan 1 IP that does not return)
		var dh = this._getDeviceHistoryGrs();
		if (dh) {
			while (dh.next()) {
				switch ('' + dh.last_state) {
					case "Updated CI":
						updated += 1;
						break;
					case "Created CI":
						created += 1;
						break;
					case "Identified, ignored extra IP":
						duplicate += 1;
						break;
					default:
						activeNoClassify += 1;
						break;
				}
			}
		}

		dr.setValue('n_created_devices', created);
		dr.setValue('n_updated_devices', updated);
		dr.setValue('n_active_nc_ips', activeNoClassify);
		dr.setValue('n_duplicate_ips', duplicate);
		dr.setValue('ended', new GlideDateTime());
		dr.setValue('state', 'Completed');
		dr.update();
	},

	markActive: function() {
		var dr = this._getResultGr();
		if (!dr)
			return;

		dr.setValue('state', 'Active');
		dr.update();
	},

	markCanceled: function() {
		var activeNoClassify = 0;
		var duplicate = 0;
		var created = 0;
		var updated = 0;

		var dr = this._getResultGr();
		if (!dr)
			return;

		var dh = this._getDeviceHistoryGrs();
		if (dh) {
			while (dh.next()) {
				switch ('' + dh.last_state) {
					case "Updated CI":
						updated += 1;
						break;
					case "Created CI":
						created += 1;
						break;
					case "Identified, ignored extra IP":
						duplicate += 1;
						break;
					default:
						activeNoClassify += 1;
						break;
				}
			}
		}

		dr.setValue('n_created_devices', created);
		dr.setValue('n_updated_devices', updated);
		dr.setValue('n_active_nc_ips', activeNoClassify);
		dr.setValue('n_duplicate_ips', duplicate);
		dr.setValue('ended', new GlideDateTime());
		dr.setValue('state', 'Canceled');
		dr.update();
	},

    type: 'DiscoveryResult'
};

DiscoveryResult.deleteAllByStatus = function(status) {
	var gr = new GlideRecord('discovery_result');
	gr.addQuery('status', status);
	gr.deleteMultiple();
};

DiscoveryResult.deleteAllBySchedule = function(schedule) {
	var gr = new GlideRecord('discovery_result');
	gr.addQuery('schedule', schedule);
	gr.deleteMultiple();
};