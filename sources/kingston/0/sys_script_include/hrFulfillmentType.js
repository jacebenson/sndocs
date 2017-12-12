var hrFulfillmentType = Class.create();
hrFulfillmentType.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
	
	getWorkflowOnLoad : function(){
		
		var templateSysId = this.getParameter('sysparm_hrTemplateSysID');
		if(templateSysId!=""){
			var resultWF = this._getWFInternal(templateSysId);
			return resultWF;
		}
		return '';
	},
	
	_getWFInternal : function(templateSysId){
		var checkWorkFlow = new GlideRecord('sn_hr_core_template');
			checkWorkFlow.addQuery("sys_id",templateSysId);
			checkWorkFlow.query();
			if(checkWorkFlow._next()){
				var temp= checkWorkFlow.template;
				var workflowValue = temp.indexOf("workflow=");
				if(workflowValue>-1){
					var start = workflowValue + 9;
					var end = start+ 32;
					var wfId = temp.substring(start, end);
					var gr = new GlideRecord("wf_workflow");
					gr.addQuery("sys_id",wfId);
					gr.query();
					if(gr.next()){
						return gr.name;
					}
				}
			}
		return '';
	},
	
	type: 'hrFulfillmentType'
	
});