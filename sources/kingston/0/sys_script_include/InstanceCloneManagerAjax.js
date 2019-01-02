var InstanceCloneManagerAjax = Class.create();

InstanceCloneManagerAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
   canClone: function() {
      var instanceId = this.getParameter('sysparm_instance_id');      

      var cloneAPI = new CloneAPI();
      if (cloneAPI.isCloneRunning()) {
          this.setError("An active clone is already running");
          return false;
      }
 
      if (!cloneAPI.isSameVersion(instanceId)) {
          this._addResponse('version_error', cloneAPI.getErrorMessage());
          this.setError(cloneAPI.getErrorMessage());
          return false;
      }

      return true;
   },

   // deprecated
   determineNodeOrder: function() {      
	   // deprecated
   },

   getMinDate: function() {
      var response = {};
      var instanceId = this.getParameter('sysparm_instance_id');
      var tokenId = this.getParameter('sysparm_security_token');
      var isAuthenticated = !gs.nil(tokenId);
	  var scheduleDisplayValue = this.getParameter('sysparm_schedule_date');	   	  
	  var scheduled = new GlideDateTime();
	  if (!gs.nil(scheduleDisplayValue))
		  scheduled.setDisplayValue(scheduleDisplayValue);
		  
	  // gs.log("scheduleDisplayValue == " + scheduleDisplayValue + ", scheduled == " + scheduled.getDisplayValue());
	   
      var cloneRecord = new GlideRecord("clone_instance");
      cloneRecord.initialize();
      cloneRecord.setWorkflow(false); // don't run business rules, this is a temporary record
      cloneRecord.setValue("name", instanceId);
      cloneRecord.setValue("scheduled", scheduled);
      cloneRecord.setValue("state", "Draft");
      cloneRecord.setValue("target_instance", instanceId);
      cloneRecord.setValue("security_token", tokenId);
      var sysId = cloneRecord.insert();
     //After this call scheduled will be updated from webservice response
      try {
        if (new InstanceCloneScheduler().notifyServer(cloneRecord)) {
          // if the user has successfully authenticated the target,
          // check if the server is not letting us proceed and possibly just error out.
          // This could happen if the server rejects certain client requests, war version mismatch, etc
          if (isAuthenticated && cloneRecord.state == 'Hold') {			
            this.error = cloneRecord.message;
            this.setError(this.error);
            return;
          }

          // otherwise we're good to go
		 //Changing the type of response object from string to object
		  response.scheduledStartTime = cloneRecord.scheduled.getDisplayValue();
			// send as user time zone
		  response.cloneEstimationMessage = cloneRecord.getValue('clone_estimation_message');
		  response.cloneRecordSysId = sysId;
		  response.minimumCloneStartTime = new GlideDateTime().getDisplayValue();//user time zone	
        }
      } catch(e) {
        gs.log("Error checking clone schedule:" + e.toString());
        this.error = "Exception while checking clone schedule: " + e.toString();
        this.setError(this.error);
      }
      var json = new JSON();
      var encodedResponseString = json.encode(response);
      return encodedResponseString;
   },

   startClone: function() {
      var instanceId = this.getParameter('sysparm_instance_id');
      var scheduled = "" + this.getParameter('sysparm_scheduled');
      var preserveTheme = this.getParameter('sysparm_preserve_theme');
      var excludeLargeData = this.getParameter('sysparm_exclude_large_data');
      var sourceInstance = this.getParameter('sysparm_source_instance');
      var clusterNode = this.getParameter('sysparm_cluster_node');
      var email = this.getParameter('sysparm_email');
      return this.scheduleClone(instanceId, scheduled, preserveTheme, excludeLargeData, sourceInstance, clusterNode, email);
   },

   scheduleClone: function(instanceId, scheduled, preserveTheme, excludeLargeData, sourceInstance, clusterNode, email) {
      if (gs.nil(instanceId)) {
          this.setError("Invalid instance");
          return false;
      }

      var igr = this.getInstanceRecord(instanceId);
      if (igr == null) {
          this.setError("Invalid instance record");
          return false;
      }

      var instanceName = igr.database_name;
      gs.log("InstanceClone: Scheduling instance clone to " + instanceName + " (" + instanceId + " on " + scheduled + ")");

      var newClone = new GlideRecord("clone_instance");
      newClone.setValue("name", instanceName);
      newClone.setValue("target_instance", instanceId);
      newClone.setValue("preserve_theme", preserveTheme);
      newClone.setValue("exclude_large_data", excludeLargeData);
      if (!gs.nil(sourceInstance))
        newClone.setValue("source_instance", sourceInstance);
      if (!gs.nil(clusterNode))
        newClone.setValue("cluster_node", clusterNode);
      newClone.setValue("email", email);
      newClone.setDisplayValue("scheduled", scheduled);
      newClone.setValue("state", "Requested");
      var newCloneId = newClone.insert();

      return newCloneId;
   },
	
	isReservationAvailable: function() {
	  var response = {};
	  var scheduleDisplayValue = this.getParameter('sysparm_clone_start_date');
	  var cloneSysId = this.getParameter('sysparam_clone_record_sys_id');
	  var scheduled = new GlideDateTime();
	  if (!gs.nil(scheduleDisplayValue))
		  scheduled.setDisplayValue(scheduleDisplayValue);
		  
      var cloneRecord = new GlideRecord("clone_instance");
	  if (cloneRecord.get(cloneSysId)) {
		  var oldCloneStartTime = cloneRecord.getDisplayValue('scheduled');
		  if (scheduled.getDisplayValue() != oldCloneStartTime) {
			  cloneRecord.setValue("scheduled", scheduled);
			  cloneRecord.update();
			  try {
				  //After this call scheduled will be updated from webservice response
				  if (new InstanceCloneScheduler().notifySchedulingServerForCheckingReservation(cloneRecord)) {
					  // if the user has successfully authenticated the target,
					  // check if the server is not letting us proceed and possibly just error out.
					  // This could happen if the server rejects certain client requests, war version mismatch, etc
					  if (isAuthenticated && cloneRecord.state == 'Hold') {			
							this.error = cloneRecord.message;
							this.setError(this.error);
							return;
						  }
					  } else {
						  //cloneRecord.get(cloneSysId);
						  response.scheduledStartTime = cloneRecord.scheduled.getDisplayValue();
						  gs.log("After Update Message " + cloneRecord.getValue('clone_estimation_message'));
						  gs.log("Is Reservation " + cloneRecord.getValue('is_reservation_available'));
						  response.cloneEstimationMessage = cloneRecord.getValue('clone_estimation_message');
						  response.isReservationAvailable = cloneRecord.getValue('is_reservation_available');			  
					  }
				  } catch(e) {
					  gs.log("Error checking clone schedule:" + e.toString());
					  this.error = "Exception while checking clone schedule: " + e.toString();
					  this.setError(this.error);
				  }
			  }  
		  }
	
		  var json = new JSON();
		  var encodedResponseString = json.encode(response);
		  return encodedResponseString;
	},

   getInstanceRecord: function(instanceId) {
      var gr = new GlideRecord('instance');
      if (gr.get(instanceId))
          return gr;

      return null;
   },

   rollback: function() {
      var table = this.getParameter("sysparm_table");
      var sysId = this.getParameter("sysparm_sys_id");
      return new CloneAPI().rollback(table, sysId);
   },
       
   _addResponse: function(name, node) {
      var item = this.newItem(name);
      var tn = this.getDocument().createTextNode(new JSON().encode(node));
      item.appendChild(tn);
   },
   
   isPublic: function() {
      return false;
   },
   
   type: "InstanceCloneManagerAjax"
});