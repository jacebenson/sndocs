(function() {
  /* populate the 'data' object */
  /* e.g., data.table = $sp.getValue('table'); */
	data.services = [];
	var services = new GlideRecord('x_8821_jmesh_service');
	services.addQuery('active','true');
	services.orderBy('name');
	services.query();
	while(services.next()){
		data.services.push({
			name: services.getValue('name'),
			active: services.getValue('active'),
			sys_id: services.getValue('sys_id')
		});
	}
	if(input && input.service){
		data.triggers = [];
		var triggers = new GlideRecord('x_8821_jmesh_trigger')
		triggers.addQuery('service', input.service);
		triggers.orderBy('name');
		triggers.query();
		if(triggers.next()){
			data.triggers.push({
				name: triggers.getValue('name'),
				active: triggers.getValue('active'),
				sys_id: triggers.getValue('sys_id')
			});
		}
	}
})();
