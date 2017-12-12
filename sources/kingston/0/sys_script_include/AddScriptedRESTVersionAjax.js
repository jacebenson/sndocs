var AddScriptedRESTVersionAjax = Class.create();
AddScriptedRESTVersionAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	addNewVersion : function(){
		var set_default = this.getParameter('sysparm_set_default');
		var service_definition = this.getParameter('sysparm_service_definition');
		var copy_version_sys_id = this.getParameter('sysparm_version_id');
		var new_version_sys_id = this._addVersion(service_definition);
		if(set_default == 'true'){
			this._enableDefault(new_version_sys_id);
			this._ensureOnlyOneDefault(service_definition,new_version_sys_id);
		}
		if(copy_version_sys_id != 'none'){
			this._copyVersionOperations(new_version_sys_id,copy_version_sys_id,service_definition);
		}
		return new_version_sys_id;
	},
	
	enableVersion : function(){
		var set_default = this.getParameter('sysparm_set_default');
		var service_definition_id = this.getParameter('sysparm_service_definition');
		var new_version_sys_id = this._addVersion(service_definition_id);
		if(set_default == 'true'){
			this._enableDefault(new_version_sys_id);
		}
		var svc_def = new GlideRecord("sys_ws_definition");
		svc_def.get(service_definition_id)
		svc_def.is_versioned=true;
		svc_def.update();
		this._applyVersionToOperations(new_version_sys_id, service_definition_id);
	},
	
	_applyVersionToOperations : function(versionSysId, service_definition_id) {
		var gr = new GlideRecord('sys_ws_operation');
		gr.addQuery('web_service_definition', service_definition_id);
		gr.query();
		while (gr.next()) {
			gr.web_service_version = versionSysId;
			gr.update();
		}
	},
	
	_enableDefault : function(new_version_sys_id){
		var gr = new GlideRecord("sys_ws_version");
		gr.get(new_version_sys_id);
		gr.is_default = '1';
		gr.update();
	},
	
	_copyVersionOperations : function(new_version_sys_id, copy_version_sys_id, service_definition){
		var operations_gr = new GlideRecord("sys_ws_operation");
		operations_gr.addQuery("web_service_definition",service_definition);
		operations_gr.addQuery("web_service_version",copy_version_sys_id);
		operations_gr.query();
		while(operations_gr.next()){
			var existing_operation_sys_id = operations_gr.getValue('sys_id');
			operations_gr.web_service_version = new_version_sys_id;
			operations_gr.name = this._getVersionedOperationName(operations_gr.name, new_version_sys_id);
			var operation_sys_id = operations_gr.insert();
			
			this._copyParametersMap("sys_ws_query_parameter_map",operation_sys_id,existing_operation_sys_id);
			this._copyParametersMap("sys_ws_header_map",operation_sys_id,existing_operation_sys_id);
		}
	},
	
	_getVersionedOperationName : function(current_op_name, new_version_sys_id) {
		var new_version = new GlideRecord("sys_ws_version");
		new_version.get(new_version_sys_id);
		
		// if operation already named "xxxxxx (v3)", then replace v3 with version_id from new_version
		if (/^.*\s\(v\d+\)$/.test(current_op_name))
			return current_op_name.replace(/^(.*)\s\(v\d+\)$/, '$1 (' + new_version.version_id + ')');
		 
		// otherwise just append version_id to operation name
		return current_op_name + ' (' + new_version.version_id + ')';
	},
	
	_copyParametersMap : function(table,operation_sys_id, existing_operation_sys_id){
		var param_map_gr = new GlideRecord(table);
		param_map_gr.addQuery("web_service_operation", existing_operation_sys_id);
		param_map_gr.query();
		while(param_map_gr.next()){
			param_map_gr.web_service_operation = operation_sys_id;
			param_map_gr.insert();
		}
	},
	
	_addVersion : function(service_definition){
		var gr = new GlideRecord("sys_ws_version");
		gr.addQuery("web_service_definition",service_definition);
		gr.orderByDesc("version");
		gr.query();
		if (gr.next()){
			var existing_version_number = gr.getValue("version");
			var version_number = parseInt(existing_version_number)+1
		}
		else {
			var version_number = 1;
		}
		gr.initialize();
		gr.setValue("version", version_number);
		gr.setValue("web_service_definition", service_definition);
		return gr.insert();
	},
	
	_ensureOnlyOneDefault : function(service_definition, version_id){
		var gr = new GlideRecord("sys_ws_version");
		gr.addQuery('web_service_definition',service_definition);
		gr.query();
		while(gr.next()){
			if(gr.sys_id != version_id && gr.is_default == '1'){
				gr.is_default = '0';
				gr.update();
			}
		}
	},
	
	type: 'AddScriptedRESTVersionAjax'
});