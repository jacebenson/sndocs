fixMandatory();
fixMinVerifications();

function fixMandatory() {
	var mapGr = new GlideRecord('pwd_map_proc_to_verification');
	mapGr.query();
	
	while (mapGr.next()) {
		mapGr.mandatory = true;
		mapGr.update();
	}
}

function fixMinVerifications() {
	var processGr = new GlideRecord('pwd_process');
	processGr.addQuery('active', true);
	processGr.query();
	while (processGr.next()) {
		var count = new GlideAggregate('pwd_map_proc_to_verification');
		count.addQuery('process', processGr.sys_id);
		count.addAggregate('COUNT');
		count.query();
		if (count.next()) {
			processGr.min_verifications = count.getAggregate('COUNT');
			processGr.update();
		}
	}
}
