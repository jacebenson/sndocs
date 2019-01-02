(function () {
	if (!options.table)
		return;
	
	data.filter = options.filter || 'sys_id!=NULL';
	var ga = new GlideRecordCounter(options.table);
	ga.addEncodedQuery(data.filter);
	data.count = ga.getCount();	
})()
