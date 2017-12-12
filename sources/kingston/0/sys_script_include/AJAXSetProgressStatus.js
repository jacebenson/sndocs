var AJAXSetProgressStatus = Class.create();
AJAXSetProgressStatus.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	setProgressStatus: function() {
        var executionID =  this.getParameter('sysparm_execution_id');
		var gr = new GlideRecord('sys_execution_tracker');
		
		gr.addQuery('parent', executionID);
		gr.query();

		while (gr.next()) {
			if (gr.state == "0") {
				gr.state = "3";
				gr.update();
			}
		}

    },

    type: 'AJAXSetProgressStatus'
});