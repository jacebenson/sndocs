var hr_license = Class.create();
hr_license.prototype = {
	initialize: function(){
		
	},
	
	hasHrAccess:function(table) {
		return gs.getProperty('sn_hr_core.inactive_tables',"").indexOf(table) == -1;
	},

    configureCOE: function(active_Coe, deactive_Coe){
		var changeMade = false;
		var HR_CORE = 'sn_hr_core';
		var HR_SP = 'sn_hr_sp';
		var HR_LE = 'sn_hr_le';
		var HR_INTEGRATIONS = 'sn_hr_integrations';
		var disableWorkflow = false;
		
		if(gs.hasRole('admin'))
			disableWorkflow = true;
		
		var enq = "id!=hr_lifecycle_events^ORid=NULL^id!=hr_case^ORid=NULL^app_id=com.sn_hr_core";
		var gr = new GlideRecord('ua_entitlement');
		gr.addEncodedQuery(enq);
		gr.query();
		
		while (gr.next()) {
			if (active_Coe.indexOf(gr.id.toString()) > -1 && gr.active.toString() == "false") {
				changeMade = true;
				
				if(GlidePluginManager.isActive('com.sn_hr_core'))
					sn_lef.GlideEntitlement.enableEntitlement(gr.id.toString(), HR_CORE, disableWorkflow);
				
				if(GlidePluginManager.isActive('com.sn_hr_integrations'))
					sn_lef.GlideEntitlement.enableEntitlement(gr.id.toString(), HR_INTEGRATIONS, disableWorkflow);
				
				if(GlidePluginManager.isActive('com.sn_hr_service_portal'))
					sn_lef.GlideEntitlement.enableEntitlement(gr.id.toString(), HR_SP, disableWorkflow);
				
				if(GlidePluginManager.isActive('com.sn_hr_lifecycle_events'))
					sn_lef.GlideEntitlement.enableEntitlement(gr.id.toString(), HR_LE, disableWorkflow);	
				
			} else if (deactive_Coe.indexOf(gr.id.toString()) > -1 && gr.active.toString() == "true") {
				changeMade = true;
				
				if(GlidePluginManager.isActive('com.sn_hr_core'))
					sn_lef.GlideEntitlement.disableEntitlement(gr.id.toString(), HR_CORE, disableWorkflow);
				
				if(GlidePluginManager.isActive('com.sn_hr_integrations'))
					sn_lef.GlideEntitlement.disableEntitlement(gr.id.toString(), HR_INTEGRATIONS, disableWorkflow);
				
				if(GlidePluginManager.isActive('com.sn_hr_service_portal'))
					sn_lef.GlideEntitlement.disableEntitlement(gr.id.toString(), HR_SP, disableWorkflow);
				
				if(GlidePluginManager.isActive('com.sn_hr_lifecycle_events'))
					sn_lef.GlideEntitlement.disableEntitlement(gr.id.toString(), HR_LE, disableWorkflow);
			}
		}

		if(changeMade == false)
			return "there is no change made";
		
		return this.resetCOEConfig();
	},
	
	resetCOEConfig: function(){
		var allInactiveTables = [];
		var allActiveTables = [];
		
		var enq = "id!=hr_lifecycle_events^ORid=NULL^id!=hr_case^ORid=NULL^app_id=com.sn_hr_core";
		var gr = new GlideRecord('ua_entitlement');
		gr.addEncodedQuery(enq);
		gr.query();
		
		while (gr.next()) {
			if (gr.active.toString() == "false")
				allInactiveTables.push(gr.getValue('table_names').toString());
			else 
				allActiveTables.push(gr.getValue('table_names').toString());
		}

		//setting the properties
		gs.setProperty('sn_hr_core.inactive_tables',allInactiveTables.join(","));
		
		//disable record producers
		try{
			new sn_hr_sp.hr_sp_coe_config().recordProducers(allActiveTables, allInactiveTables);
		}catch(err){
			return "sp not installed " + err;
		}
		try{
			new sn_hr_integrations.hr_integrations_coe_config().recordProducers(allActiveTables, allInactiveTables);
		}catch(err){
			return "Integrations plugin is not installed " + err;
		}
		
		try{
			new sn_hr_le.hr_le_coe_config().manageActivities(allActiveTables, allInactiveTables);
		}catch(err){
			return "LifeCycle Events plugin is not installed " + err;
		}
		
		return "success";
	},
	
	_getTables: function(coeList) {
		var matchingTables = [];
		var gr = new GlideRecord('sn_hr_core_coe_config_matching');
		var q = gr.addQuery('coe.coe_name', coeList[0]);
		for (var i = 1; i < coeList.length; i++) 
			q.addOrCondition('coe.coe_name', coeList[i]);
		gr.query();
		while (gr.next())
			matchingTables.push(gr.table.toString());
		
		return matchingTables;
	},
	
	_toggleTopicDetails: function(tableList, answer){
		var gr = new GlideRecord('sn_hr_core_topic_detail');
		var q = gr.addQuery('topic_category.coe', tableList[0]);
		for (var i = 1; i < tableList.length; i++) 
			q.addOrCondition('topic_category.coe', tableList[i]);
		
		gr.query();
		while (gr.next()) {
			gr.setValue('active', answer);
			gr.update();
		}
	},
	
	_toggleHrServices: function(tableList, answer) {
		var gr = new GlideRecord('sn_hr_core_service');
		var q = gr.addQuery('service_table', tableList[0]);
		for (var i = 1; i < tableList.length; i++) 
			q.addOrCondition('service_table', tableList[i]);
		gr.query();
		while (gr.next()) {
			gr.setValue('active', answer);
			gr.update();
		}
	},

	_toggleModules: function(tableList, answer) {
		var gr = new GlideRecord('sys_app_module');
		gr.addQuery('sys_scope', 'd4ac3fff5b311200a4656ede91f91af2');
		var q = gr.addQuery('name', tableList[0]);
		for (var i = 1; i < tableList.length; i++) 	
			q.addOrCondition('name', tableList[i]);
		gr.query();
		while (gr.next()) {
			gr.setValue('active', answer);
			gr.update();
		}
	},
	_toggleHRTemplates: function(tableList, answer) {
		var gr = new GlideRecord('sn_hr_core_template');
		gr.addQuery('sys_scope', 'd4ac3fff5b311200a4656ede91f91af2'); // Templates that are in HR core scope
		var q = gr.addQuery('table', tableList[0]);
		for (var i = 1; i < tableList.length; i++) 	
			q.addOrCondition('table', tableList[i]);
		gr.query();
		while (gr._next()) {
			gr.setValue('active', answer);
			gr.update();
		}
	},
	
	_toggleTopicCategories: function(tableList, answer) {
		var gr = new GlideRecord('sn_hr_core_topic_category');
		var q = gr.addQuery('coe', tableList[0]);
		for (var i = 1; i < tableList.length; i++) 
			q.addOrCondition('coe', tableList[i]);
		gr.query();
		while (gr.next()) {
			gr.setValue('active', answer);
			gr.update();
		}
	},
	
	_toggleInterceptor: function(activeCoes) {
		var gr = new GlideRecord('sys_wizard_answer');
		gr.addQuery('question.name', 'Hr case');
		gr.query();
		while (gr.next()) {
            var targetUrl = gr.target_url.replace("sn_hr_core_case_", "");
            var url = targetUrl.replace(".do", "");
			if(gr.target_url != 'sn_hr_le_case.do'){
				if (gr.target_url == 'sn_hr_core_case.do') {
						gr.setValue('active', true);
						gr.update();
				} else if (activeCoes.indexOf("hrit_operations") > -1 && url == "operations") {
					gr.setValue('active', true);
					gr.update();
				} else if (activeCoes.indexOf("employee_relations") > -1 && url == "relations") {
					gr.setValue('active', true);
					gr.update();	
				} else if (activeCoes.indexOf(url) > -1) {
					gr.setValue('active', true);
					gr.update();
				} else{
					gr.setValue('active', false);
					gr.update();
				}			
			}	
		}
	},
	
	type: 'hr_license'
};