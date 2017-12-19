var CMDBRelationshipAjax = Class.create();
CMDBRelationshipAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
    getRelationships: function() {
		this.dataMap = {};
		this.parentDescriptors = [];
		var tableNames = this.getParameter('sysparm_table_names');
		if(tableNames) {
			tableNames = tableNames.split(',');
			var numTables = tableNames.length;
			for(var i = 0; i < numTables; i++) {
				var tableName = tableNames[i];
				this._getRelationshipsFromTable(tableName);
			}
			this._formatRelationships();
		}
	},
	
	_getRelationshipsFromTable: function(tableName) {
		var gr = new GlideRecordSecure(tableName);
		gr.query();
		while(gr.next()) {
			this.parentDescriptors.push(gr.parent_descriptor.toString());
			this.dataMap[gr.parent_descriptor.toString()] =
				[gr.sys_id.toString(), gr.child_descriptor.toString(), tableName];
		}
	},
	
	_formatRelationships: function() {
		this.parentDescriptors.sort();
		var numDescriptors = this.parentDescriptors.length;
		for(var i = 0; i < numDescriptors; i++) {
			var parentDescriptor = this.parentDescriptors[i];
			var sysId = this.dataMap[parentDescriptor][0];
			var childDescriptor = this.dataMap[parentDescriptor][1];
			var tableName = this.dataMap[parentDescriptor][2];
			
			var item = this.newItem('relationship');
			item.setAttribute('parent_descriptor', parentDescriptor);
			item.setAttribute('child_descriptor', childDescriptor);
			item.setAttribute('sys_id', sysId);
			item.setAttribute('table', tableName);
		}
	},

    type: 'CMDBRelationshipAjax'
});