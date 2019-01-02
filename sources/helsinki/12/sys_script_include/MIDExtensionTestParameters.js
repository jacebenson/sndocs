var MIDExtensionTestParameters = Class.create();
MIDExtensionTestParameters.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	ajaxFunction_testParameters: function() {
		var context_sys_id = this.getParameter('sysparm_context_sys_id');
		var parser = new JSONParser();
		var form_data = parser.parse(this.getParameter('sysparm_form_data'));

		// make sure MID server or cluster is specified
		var choice = form_data.execute_on;
		if (choice == MIDExtensionConstants.CHOICE_MID_SERVER && JSUtil.nil(form_data.mid_server))
			return 'error:A MID server must be selected';
		if (choice == MIDExtensionConstants.CHOICE_MID_SERVER_CLUSTER && JSUtil.nil(form_data.mid_server_cluster))
			return 'error:A MID server cluster must be selected';

		var gr = new GlideRecord(MIDExtensionConstants.CONTEXT_TABLE);
		gr.get(context_sys_id);
		var context = new MIDExtensionContext(gr, form_data);
		var ecc_message_sys_id = context.testParameters();
		return JSUtil.notNil(ecc_message_sys_id) ? ecc_message_sys_id : 'error:MID Server down';
	},

	ajaxFunction_checkProgress: function() {
		var ecc_message_sys_id = this.getParameter('sysparm_ecc_message_sys_id');
		var gr = new GlideRecord('ecc_queue');
		gr.get(ecc_message_sys_id);
		return gr.state + ':' + gr.error_string;
	},

	type: 'MIDExtensionTestParameters'
});