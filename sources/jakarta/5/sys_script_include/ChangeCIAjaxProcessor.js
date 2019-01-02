var ChangeCIAjaxProcessor = Class.create();
ChangeCIAjaxProcessor.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getCiClass: function() {
		var ciIds = "0," + this.getParameter("sysparm_ci_ids");
		var classNames = {};
		var ciGr = new GlideRecord("cmdb_ci");
		ciGr.addQuery("sys_id", "IN", ciIds);
		ciGr.query();
		while (ciGr.next())
			classNames[ciGr.sys_id + ""] = ciGr.sys_class_name + "";
		
		return new JSON().encode(classNames);
	},
	
	ajaxFunction_getProposedChangeCIPopupURL: function(){
		var taskciId = this.getParameter("sysparm_task_ci");
		return this._getProposedChangeCIPopupURL(taskciId);
	} ,

	_getProposedChangeCIPopupURL: function(taskciId){
		var taskci = new GlideRecord("task_ci");
		if (!taskci.get(taskciId))
			return "";
		
		var link = taskci.ci_item.getRefRecord().getLink(true);
		
		var url = new GlideURL(link);
		url.set('sysparm_changeset', taskciId);
		url.set('sysparm_form_only', 'true');
		url.set('sysparm_titleless', 'false');
		url.set('sysparm_domain_restore', 'false');
		url.set('sysparm_propose_change', 'true');
		url.set('sysparm_link_less', 'true');
		url.set('sysparm_clear_stack', 'true');
		url.set('sysparm_nameofstack', 'ciDialog');
		
		return url;
	},
	
    type: 'ChangeCIAjaxProcessor'
});