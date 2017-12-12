fixRestQuotaRules();

function fixRestQuotaRules() {
	var active, order, max_duration, max_queries, max_db_time, max_stmt_time, max_rules, max_events, max_jobs, max_outbound_http_requests, max_outbound_http_time;
	var oldQuotaRuleSysid = '20c02b419f232100ef4afa7dc67fcf9e';

	var oldGr = new GlideRecord('sysrule_quota');
	
	if (oldGr.get(oldQuotaRuleSysid)) {
		active = oldGr.active;
		max_duration = oldGr.max_duration;
		max_queries = oldGr.max_queries;
		max_db_time = oldGr.max_db_time;
		max_stmt_time = oldGr.max_stmt_time;
		max_rules = oldGr.max_rules;
		max_events = oldGr.max_events;
		max_jobs = oldGr.max_jobs;
		max_outbound_http_requests = oldGr.max_outbound_http_requests;
		max_outbound_http_time = oldGr.max_outbound_http_time;
		order = oldGr.order;
		
		createRestQuotaRule('REST Import Set API','type=rest^urlMATCH_RGX.*/api/now(/v[0-9]+)?/import.*^EQ');
		createRestQuotaRule('REST Table API','type=rest^urlMATCH_RGX.*/api/now(/v[0-9]+)?/table.*^EQ');
		createRestQuotaRule('REST Aggregate API','type=rest^urlMATCH_RGX.*/api/now(/v[0-9]+)?/stats.*^EQ');
		createRestQuotaRule('REST Attachment API','type=rest^urlMATCH_RGX.*/api/now(/v[0-9]+)?/attachment.*^EQ');
    	
    	oldGr.active = false;	
		var description = '[DO NOT ACTIVATE THIS RULE - It has been replaced by 3 separate rules: REST Aggregate API request timeout, REST Import Set API request timeout, and REST Table API request timeout] - ' + oldGr.description;
		oldGr.description = description;
	  	oldGr.setWorkflow(false);
		oldGr.setUseEngines(false);
		oldGr.update();
	} 
	
	function createRestQuotaRule(api_name,condition){
		var name = api_name + ' request timeout';
		var description = 'This quota rule applies to all incoming ' + api_name + ' transactions. Any transaction exceeding the maxium duration set here will be cancelled.';
	
		var gr = new GlideRecord('sysrule_quota');
		gr.query('condition',condition);
		if(gr.next()){
			gs.log('quota rule already exist for: ' + api_name);
			return; //quota already exists
		}
		
		gr.initialize();
		gr.name = name;
		gr.description = description;
		gr.condition = condition;
		
		// copied from old rest quota rule 
		gr.active = active;
		gr.order = order;
		gr.max_duration = max_duration;
		gr.max_queries = max_queries;
		gr.max_db_time = max_db_time;
		gr.max_stmt_time = max_stmt_time;
		gr.max_rules = max_rules;
		gr.max_events = max_events;
		gr.max_jobs = max_jobs;
		gr.max_outbound_http_requests = max_outbound_http_requests;
		gr.max_outbound_http_time = max_outbound_http_time;
	  	gr.setWorkflow(false);
		gr.setUseEngines(false);
		gr.insert();
	}
}
