var hr_Login_Authenticator = Class.create();
hr_Login_Authenticator.prototype = {
    initialize: function() {
    },
	
	success : function(task_id, table_name, doc_revision_id){
		// this routine adds document to sn_hr_core_task_type and 
		//close the task with status 'closeComplete'
		
		var doc = new GlideRecord('sn_hr_core_document_acknowledgement');
		doc.initialize();
		
		doc.setValue('acknowledgement_type', 'credential');
		doc.setValue('acknowledged','true');
		doc.setValue('table_name', table_name);
		doc.setValue('table_sys_id', task_id);
		doc.setValue('document_revision', doc_revision_id);
		doc.setValue('user', gs.getUserID());
		doc.insert();
	},

    type: 'hr_Login_Authenticator'
};