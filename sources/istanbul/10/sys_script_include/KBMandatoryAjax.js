var KBMandatoryAjax = Class.create();
KBMandatoryAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	ajaxFunction_processTypeSelection: function() {
		var kb = this.getParameter("sysparm_kb");
		
		var payload = this.newItem('mandatory');
		
		if(JSUtil.notNil(kb)){
			var kbKnowledgeBase = new GlideRecord("kb_knowledge_base");
			kbKnowledgeBase.get(kb);
			payload.setAttribute('fields', kbKnowledgeBase.getDisplayValue("kb_knowledge_base.mandatory_fields"));
		}
	},
});