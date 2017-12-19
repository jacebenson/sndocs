
// Delete in batches
var BATCHSIZE = 1000;
removeDeletedVersions('List Layout');

function removeDeletedVersions(type) {
	for(var i = 0; i < 10000; i++) {
		var gr = new GlideRecord('sys_update_version');
		gr.addQuery('type', type);
		gr.addQuery('state', 'current');
		gr.addQuery('action', 'delete');
		gr.setLimit(BATCHSIZE);
		gr.query();
		
		var arr = [];
		while(gr.next()) {
			arr.push(gr.name.toString());
		}
		
		if (arr.length == 0)
			break;
			
		gr = new GlideRecord('sys_update_version');
		gr.addQuery("name", arr);
		gr.deleteMultiple();
		gs.print('Deleted batch of ' + gr.getRowCount() + ' versions of type ' + type);
	}
}