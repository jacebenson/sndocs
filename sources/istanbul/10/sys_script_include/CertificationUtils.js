var CertificationUtils = Class.create();
CertificationUtils.prototype = {

	hasChildren: function(recordId, childTable, childColumn) {
		if (!gs.tableExists(childTable))
			return false;
		var children = new GlideRecord(childTable);
		children.addQuery(childColumn, recordId);
		children.setLimit(1);
		children.query();
		return children.getRowCount() > 0;
	},
		   
	  getTriggerNextRunTime: function(isExecutionUpdate, documentName, documentKey){
      
          var associatedTrigger = new GlideRecord("sys_trigger");
          associatedTrigger.addQuery("document", documentName);
          associatedTrigger.addQuery("document_key", documentKey);
          // trigger is not on on demand or start up
          associatedTrigger.addQuery("trigger_type", "!=", 2);
          associatedTrigger.addQuery("trigger_type", "!=", 9);
          if (isExecutionUpdate) {
              // if this is an update from an execution of the script
              // do not include once only triggers (trigger_type == 0)
              // since that trigger would have been the one to cause
              // the update. we don't want to use it again.
              associatedTrigger.addQuery("trigger_type", "!=", 0);
          }
          associatedTrigger.query();
          if (associatedTrigger.next()) {
              if (isExecutionUpdate) {
                  // if this is an update from an execution of the script
                  // the trigger's next action has not yet been updated (that happens
                  // after the execution of the script). so, instead get the calculated
                  // next recurrence of the trigger
                  // (this is the same operation that is done when the trigger
                  // is complete. see com.glide.schedule.JobExecutor.reschedule)
                  var m = GlideARecurrence.get(associatedTrigger);
                  if(m != null) {
                    var nextOccurence = m.next();
                    return nextOccurence;
                  }
              }
              else {
                  // if this is not an update from an execution of the script
                  // the synchronizer has already run, so the trigger's next
                  // action has been updated.
                  return associatedTrigger.next_action;
              }
          }
          return "";
	  },
	  
	  managerHasCertificationRole : function(manager) {
	  	//Get sys_id for the certification role
   		var certificationRole = new GlideRecord("sys_user_role");
   		// If Certification role exists
   		if (certificationRole.get('name', 'certification')) {
   			var hasRole = new GlideRecord('sys_user_has_role');
   			hasRole.addQuery('user', manager);
   			hasRole.addQuery('role', certificationRole.sys_id);
   			hasRole.query();
   			return (hasRole.next());
   		}
   		return false;
	  },

    type: 'CertificationUtils'
}