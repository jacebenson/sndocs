var GuidedTourFindRelatedTableAjax = Class.create();
GuidedTourFindRelatedTableAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getTable: function() {
		var relationship = this.getParameter('jvar_relationship');
		var result = this.newItem("result");
		
		var gr = new GlideRecord('sys_relationship');
		var sysId = relationship.split('REL:')[1];
		if (gr.get(sysId)) {
			result.setAttribute("table" , gr.basic_query_from);
		}
		else {
			result.setAttribute("table" , "");
		}
	},
	
    type: 'GuidedTourFindRelatedTableAjax'
});