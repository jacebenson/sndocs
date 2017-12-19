(function () {
	// grab names of available dependencies
	data.all = [];
	var gr = new GlideRecord('sp_dependency');
	gr.orderBy('name');
	gr.query();
	while (gr.next()) {
		var t = $sp.getRecordElements(gr, 'name,sys_id');
		data.all.push(t);
	}
})();