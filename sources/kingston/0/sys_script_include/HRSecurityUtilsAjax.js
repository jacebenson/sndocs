var HRSecurityUtilsAjax = Class.create();

HRSecurityUtilsAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

	initialize : function(request, responseXML, gc) {
		global.AbstractAjaxProcessor.prototype.initialize.call(this, request, responseXML, gc);
	},

	ajaxFunction_getDocumentBody : function() {
		var tableName = this.getParameter('sysparm_tableName');
		var tableId = this.getParameter('sysparm_tableId');
		var targetTable = this.getParameter('sysparm_targetTable');
		var targetId = this.getParameter('sysparm_targetId');
		var canEdit = this.getParameter('sysparm_canEdit');

		var hrform = new sn_hr_core.hr_CaseAjax().documentBody(tableName, tableId, targetTable, targetId, canEdit);
		return new global.JSON().encode({body:hrform.body, unEvaluatedVariables:hrform.unEvaluatedVariable, inaccessibleVariables:hrform.inaccessibleVariable});
	},
			
	ajaxFunction_setDocumentBody : function() {
		var documentBody = this.getParameter('sysparm_documentBody') + '';
		var tableName = this.getParameter('sysparm_table_name') + '';
		var tableId = this.getParameter('sysparm_table_id') + '';
		var targetTable = this.getParameter('sysparm_targetTable') + '';
		var targetId = this.getParameter('sysparm_targetId') + '';
		var canEdit = this.getParameter('sysparm_canEdit') + '';
		
		new sn_hr_core.hr_CaseAjax().setDocumentBody(documentBody, tableName, tableId, targetTable, targetId, canEdit);
	},
	
	ajaxFunction_generateDocument : function() {
		var tableName = this.getParameter('sysparm_table_name') + '';
		var tableId = this.getParameter('sysparm_table_id') + '';
		
		var gr = new GlideRecord(tableName);
		if (gr.get(tableId)) {
			if(new sn_hr_core.hr_PdfUtils().isValidPdfTemplate(gr.sys_class_name, gr.sys_id)) {
				var response = new sn_hr_core.hr_PdfUtils().createPdfForDocument(gr.sys_class_name, gr.sys_id, true);
				if(response.indexOf('Error') > 0)
					gs.addInfoMessage(response);
			} else {
				new sn_hr_core.GeneralHRForm(gr.sys_class_name, gr.sys_id, gr.sys_class_name, gr.sys_id).generate(true);
			}
		}
	},
	
	ajaxFunction_getPreFilledPDFSysId : function(){
		var pdfTemplateSysId = this.getParameter('sysparm_pdf_sysid') + '';
		var parentSysid = this.getParameter('sysparm_case_sysid') + '';
		var tableName = this.getParameter('sysparm_table_name') + '';
		var tableSysId = this.getParameter('sysparm_table_sysid') + '';
		
		if (gs.nil(pdfTemplateSysId) || gs.nil(parentSysid) || gs.nil(tableName) || gs.nil(tableSysId))
			return new global.JSON().encode({previewSysId:""});
		var previewSysId = new sn_hr_core.hr_PdfUtils().prefillPdfTemplate(pdfTemplateSysId, false, parentSysid, tableName, tableSysId);
		return new global.JSON().encode({previewSysId:previewSysId});
	},
	
	
	//this function is called in the view rules for urser selection directive.
	userSelectionStackPop : function()
	{
	    var stack = GlideSession.get().getStack();
		if(stack.size()>=0)
		stack.pop();
	},
	
	
	// returns true if user is a subordinate of manager
	userReportsTo: function(userId, managerId, managers) {
		var user = new GlideRecord('sys_user');
		if (!user.get(userId) || user.manager == '')
			return false;
		
		if (!managers)
			managers = '';
		if (managers.indexOf(userId) > -1)
			return false;	
		
		if (user.manager == managerId)
			return true;
		else
			return this.reportsTo(user.manager.sys_id, managerId, managers + ',' + userId);
	},

	removeUserRoles: function(userSysId, roles) {
		if(gs.nil(userSysId)){
			gs.error("userSysId shouldn't be null");
			return;
		}
		if(gs.nil(roles)){
			gs.error("roles shouldn't be null");
			return;
		}
		var gr = new GlideRecord('sys_user_has_role');
		gr.addQuery('role.name', 'IN', roles);
		gr.addQuery('user', userSysId);
		gr.query();
		gr.deleteMultiple();
	},

	getScheduleTimeSpans: function(/* GlideScheduleTimeSpan */ timeSpan, start, end) {
		var scheduleSpan = new GlideScheduleTimeSpan(timeSpan, '');
		var timeSpans = scheduleSpan.getSpans(new GlideScheduleDateTime(start), new GlideScheduleDateTime(end));
		var spans = [];
		for (var i = 0; i < timeSpans.size(); i++)
			spans.push({ name : scheduleSpan.getName(), 
						 start : timeSpans.get(i).getStart().getGlideDateTime()
			   });
				
		return spans;
	},
	
	getCalendarDateTime : function(dateTime){
		var gdt = new GlideDateTime(dateTime);
		var icalUtil = new GlideICALUtil();
		return icalUtil.formatLocalWithTzid(gdt.getRaw());
	},
	
	type: 'HRSecurityUtilsAjax'
});