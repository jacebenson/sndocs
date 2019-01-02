var TourBuilderGenericDataFactory = Class.create();
TourBuilderGenericDataFactory.prototype = {
	
	_dictionary : new TourBuilderDictionary(),
	
	initialize: function() {
	},
	
	/* get all objects that satisfy query paramters **
	** input: args.table - object under consideration
	** input: args.query_params - object with additional query params 
	** returns: sys_id's of objects in comma separated string
	*/
	getObjects : function (args ) {
		
		var table = args.table;
		var query_params = args.query_params;
		
		var objects = [];
		
		gs.debug("START: getObjects");
		
		if(gs.nil(table)){
			gs.debug("No table defined for query");
			return "error";
		}
		
		var hasRows = false;
		var gr_objects = new GlideRecord(table);
			
		if(!gr_objects.isValid()){
			gs.debug("Table " + table + " does not exist or is invalid");
			return "error";
		} 
				
		if(!gr_objects.canRead()){
			gs.debug("ACLs prevent reading the table " + table);
			return "error";
		}
			
		if(!gs.nil(query_params)) {
			var i;
			for(i = 0; i < query_params.length; i++) 
				if(gr_objects.isValidField(query_params[i].column))
					gr_objects.addQuery(query_params[i].column, query_params[i].value);
				else
					gs.debug("Column defined by " + (query_params[i].column) + " does not exist or is invalid for table "+ table);
		}
			
		if(args.hasOwnProperty('order_by') && gr_objects.isValidField(args.order_by))
			gr_objects.orderBy(args.order_by);
		else if(gr_objects.isValidField('step_no')) 
			gr_objects.orderBy('step_no');
		else if(gr_objects.isValidField('order')) 
			gr_objects.orderBy('order');
			
		gr_objects.query();
			
		while(gr_objects.next()) {
			objects.push(gr_objects.sys_id.toString());
			hasRows = true;
		}
			
		if(!hasRows)
			gs.debug("Table " + table + " has no rows");
		
		gs.debug("Object sys_id: " + objects.toString());
		
		gs.debug("END: calling getObjects - {0}", objects.toString());
			
		return objects.toString();	
	},
		
	/* get the object data from the sys_id 
	** input: args.table - table for the object under consideration
	** input: args.sys_id -  sys_id of the object under consideration
	** input: args.override_columns - columns as array to override default columns returned
	** returns: 
	*/	
	getObjectData : function(args) {
		var sys_id = args.sys_id;
		var table = args.table;
		var override_columns = args.override_columns;
		var reference_fields = args.extract_reference_fields;
		var reference_table_name = args.reference_table_name;
		var data = {};
				
		gs.debug("START: getObjectData");
		
		if(gs.nil(sys_id) || (typeof sys_id === 'undefined')){
			gs.debug("ERROR: getObjectData - sys_id is not defined");
			return;
		}
		
		if(gs.nil(table)){
			gs.debug("ERROR: getObjectData: table is a mandatory parameter");
			return;
		}
			
		var gr = new GlideRecord(table);
		gr.addQuery('sys_id', sys_id);
		gr.query();
		
		if(!gr.hasNext()){
			gs.debug("END: getObjectData: error");
			return;
		}else
			gr.next();
			
					
		var columns;
					
		if(!gs.nil(override_columns) && override_columns!={})
			columns = override_columns; 
		else 
			columns = this._dictionary.getColumnsFromDictionary(table);
				
		var tableFieldName;
						
		for(tableFieldName in columns) {
			if(!columns.hasOwnProperty(tableFieldName))
				continue;
							
			if(this._isColumnInRefField(columns['_extractReferenceFields'], tableFieldName)){
				gs.debug('Found Reference Field: Field Name = '
							 + tableFieldName + ', Table Name = ' + columns['_extractReferenceFields'][tableFieldName] + ', SysId:'+ gr[tableFieldName].toString());
							
				data[columns[tableFieldName]] = 
						this.getObjectData({'table': columns['_extractReferenceFields'][tableFieldName],'sys_id':gr[tableFieldName].toString()});
								
				continue;
			}
							
			if(gr.isValidField(tableFieldName)) 
				data[columns[tableFieldName]] = gr[tableFieldName].toString();
			else 
				gs.debug( "Column defined by '" + tableFieldName + "' does not exist or is invalid for table " + table);
		}
					
		gs.debug("END: getObjectData: success");
					
		return data;		
	},
		
	/*
	** 
	*/
	_getRefObjectDataFromTable : function(sys_id, reference_table_name){
	},
		
	/* check if column is a reference field
	** input: reference_fields - object containing details of reference fields
	** input: colName - name of column under consideration
	** returns: true/false
	*/
	_isColumnInRefField : function(reference_fields, colName){
		if(gs.nil(reference_fields))
			return false;
				
		var colNameDictionary;
		for(colNameDictionary in reference_fields){
			if(!reference_fields.hasOwnProperty(colNameDictionary))
				continue;
			if(colNameDictionary == colName){
				return true;
			}
		}
		return false;
	},
	
	/* create an object
	** input: args.table - table name in which object should be created
	** input: args.object_params - object containing field names 
	**                             and corresponding values
	** returns: sys_id of created object if creation is successful
	**          error string if creation is not successful
	*/
	createObject: function(args){
		var table = args.table;	
		var object_params = args.object_params;
		
		gs.debug("START: createObject");
		
		if(gs.nil(table)){
			gs.debug("No table defined for creation");
			return "error";
		}
		
		if(gs.nil(object_params)){
			gs.debug("No object parameters defined for creation");
			return "error";
		}
		
		var gr_object = new GlideRecord(table);
		
		if(!gr_object.isValid()) {
			gs.debug("Table " + table + " does not exist or is invalid");
			return "error";
		}
			
		if(!gr_object.canCreate()) {
			gs.debug("ACLs prevent inserts to the table " + table);
			return "error";
		}
		
		gr_object.initialize();
		
		for(var i = 0; i < object_params.length; i++)
			if(gr_object.isValidField(object_params[i].column))
				gr_object[object_params[i].column] = object_params[i].value;
			else
				gs.debug( "Column defined by '" + object_params[i].column + "' does not exist or is invalid for table " + table);
		
		var sysId = gr_object.insert();
		
		gs.debug("END: calling createObject - {0}", sysId.toString());
		
		return sysId;
	},
	
	/* update an object
	** input: args.table - table name of the object under consideration
	** input: args.sys_id - sys_id of the object under consideration
	** input: args.update_params - object containing field names 
	**                             and corresponding values
	** returns: true if deletion is successful
	**          false if deletion is not successful
	*/
	updateObject: function(args){
		var table = args.table;
		var sys_id = args.sys_id;
		var update_params = args.update_params;
		
		gs.debug("START: updateObject");
		
		if(gs.nil(sys_id)){
			gs.debug("No sys_id defined for update");
			return false;
		}
		
		if(gs.nil(table)){
			gs.debug("No table defined for update");
			return false;
		}
		
		if(gs.nil(update_params)){
			gs.debug("No update parameters defined for update");
			return false;
		}
		
		var gr_object = new GlideRecord(table);
			
		if(!gr_object.isValid()) {
			gs.debug("Table " + table + " does not exist or is invalid");
			return false;
		}
			
		if(!gr_object.canWrite()) {
			gs.debug("ACLs prevent updates to the table " + table);
			return false;
		}
			
		gr_object.get(sys_id);
		
		var sysId="";
		if(!gs.nil(update_params)) {
			for(var i = 0; i < update_params.length; i++){
				if(gr_object.isValidField(update_params[i].column))
				   gr_object[update_params[i].column] = update_params[i].value;
				else 
				   gs.debug("Column " + (update_params[i].column) + " does not exist or is invalid");
			}
				
			sysId = gr_object.update();
		}
		
		gs.debug("END: calling updateObject - {0}", sys_id.toString());
		
		if(sysId!=="")
			return true;
		else
			return false;
	},
			
	/* delete an object
	** input: args.table - table name of the object under consideration
	** input: args.sys_id - sys_id of the object under consideration
	** input: args.update_params - object containing field names 
	**                             and corresponding values
	** returns: true if deletion is successful
	**          false if deletion is not successful
	*/
	deleteObjects : function (args) {
		
		var table = args.table;
		var query_params = args.query_params;
		
		gs.debug("START: deleteObjects");
		
		if(gs.nil(table)){
			gs.debug("No table defined for query");
			return false;
		}
		
		var gr_objects = new GlideRecord(table);
		
		if(!gr_objects.isValid()) {
			gs.debug("Table " + table + " does not exist or is invalid");
			return false;	
		}
			
		if(!gr_objects.canDelete()) {
			gs.debug("ACLs prevent deleting from the table " + table);
			return false;
		}
			
		if(!gs.nil(query_params)) {
			for(var i = 0; i < query_params.length; i++) 
				if(gr_objects.isValidField(query_params[i].column))
					gr_objects.addQuery(query_params[i].column, query_params[i].value);
				else
					gs.debug( "Column defined by '" + query_params[i].column + "' does not exist or is invalid for table " + table);
			
			gr_objects.deleteMultiple();
		}
		
		gs.debug("END: calling deleteObjects");
		
		return true;
	},
			
	type: 'TourBuilderGenericDataFactory'
};