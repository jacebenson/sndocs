var CloneAPI = Class.create();
CloneAPI.prototype = {
    initialize: function() {
      this._errorMessage = null;
    },

    type: 'CloneAPI',

    /**
     * Schedule/start a clone (with an existing clone record) 
     *
     * @param table clone table - either 'ha_clone' or 'clone_instance'
     * @return true if success
     */
    scheduleClone: function(table, sysId, notifyServer) {
        var gr = new GlideRecord(table);
        if( !gr.get(sysId) ) {
          gs.logError( "Clone record " + sysId + " not found in " + table );
          return false;
        }
     
        if( !this._isReadyState(gr) ) {
          gs.logError( "CloneAPI: Clone cannot be started (current state " + gr.state + " is not in a ready state )" );
          return false;          
        }
    
        if ( this.isCloneRunning() ) {
          gs.logError( "CloneAPI: Clone cannot be started - an active clone is already running" );
          return false;
        }

        var scheduled = gr.scheduled;
        if ( this._shouldStartImmediately(scheduled) ) {
          return this._startClone(table, sysId, notifyServer, gr);
        } else {
          var jobId = this._scheduleClone(table, sysId, scheduled);
          gs.log("CloneAPI: scheduled clone " + sysId + " on " + table + " for " + scheduled + ", job id: " + jobId );
          return jobId !== null;
        }
    },

    pollForScheduleClone: function(table, sysId) {
      var gr = new GlideRecord(table);
      if ( !gr.get(sysId) ) {
        gs.logError( "CloneAPI: Clone record " + sysId + " not found in " + table );
        return;
      }
     
      // try to contact the scheduling service
      var notifiedServer = this._beforeStartClone(gr);

      // see if we were put on hold
      if ( !this._isReadyState(gr) ) {
        SncCloneLogger.log("InstanceClone", gr.sys_id, null, /*warn*/1, "Clone was not in ready state, exiting without running clone (state: " + gr.state + ")");
        return;
      }

      // see if the server allowed us to proceed by putting us in the scheduled state
      if ( (this._isRequestedState(gr) && notifiedServer) || !this.isSameVersion(gr.target_instance) ) {
        // we're not in a scheduled state and our timer isn't up yet, keep polling
		this._schedulePollForScheduleClone(table, sysId, gr);
        return;
      }

      // schedule the clone - no need to notify the web service
      this.scheduleClone(table, sysId, false);
    },

    _startClone: function(table, sysId, notifyServer, gr) {
      if (table === 'ha_clone')
        SncHAClone.startCloneViaClusterMessage(gr);
      else {
        // try to contact the scheduling service
        var notifiedServer = false;
        if (typeof(notifyServer) == 'undefined' || notifyServer == true)
          notifiedServer = this._beforeStartClone(gr);

        // see if we were put on hold
        if ( !this._isReadyState(gr) ) {
          SncCloneLogger.log("InstanceClone", gr.sys_id, null, /*warn*/1, "Clone was not in ready state, exiting without running clone (state: " + gr.state + ")");
      	  return false;
        }
		  
        // see if the server allowed us to proceed by putting us in the scheduled state
        if ( (this._isRequestedState(gr) && notifiedServer) || !this.isSameVersion(gr.target_instance) ) {
          // we're not in a scheduled state and our timer isn't up yet, keep polling
		  this._schedulePollForScheduleClone(table, sysId, gr);
          return false;
        }
		
		this._ensurePreferredNode(gr);
        SncInstanceClone.startCloneViaClusterMessage(gr);
      }

      gs.log("CloneAPI: started clone " + sysId + " on " + table);
      return true;
    },

    _shouldStartImmediately: function(scheduledString) {
        if( gs.nil(scheduledString) )
          return true;

        var schedule = new GlideDateTime(scheduledString);
        var now = new GlideDateTime(); 
        if( now.compareTo(schedule) >= 0 )
          return true;

        return false;
    },

    /** @return job sys_id */
    _scheduleClone: function(table, sysId, scheduled) {
      var schedule = new ScheduleOnce();
      schedule.setLabel( "Start clone " + sysId );
      schedule.setTime( scheduled );
	  schedule.setSystemID( this._getSystemID(table, sysId) );
      schedule.script = "new CloneAPI().scheduleClone('" + table + "','" + sysId + "');";
      return schedule.schedule();
    },

    /** @return job sys_id */    
    _schedulePollForScheduleClone: function(table, sysId, cloneRecord) {
      // 30 minutes default polling timer if we're not in a valid/ready cloning state
      var minutes = gs.getProperty("glide.db.clone.schedule_clone_poll_minutes", 30);
      gs.log("CloneAPI: next schedule clone check to run in " + minutes + " minutes");

      var nextTime = new GlideDateTime();
      nextTime.addSeconds(60 * minutes);

      var schedule = new ScheduleOnce();
      schedule.setLabel( "Poll for schedule clone " + sysId );
      schedule.setTime( nextTime );
	  schedule.setSystemID( this._getSystemID(table, sysId) );
      schedule.script = "new CloneAPI().pollForScheduleClone('" + table + "','" + sysId + "');";
      return schedule.schedule();
    }, 

    rollback: function(table, sysId) {
        var gr = new GlideRecord(table);
        if( !gr.get(sysId) ){
          gs.logError( "Clone record " + sysId + " not found in " + table );
          return false;
        } 

        var instanceClone =  new SncInstanceClone(sysId);  
        if (instanceClone.canRollback() == false)
            return false;

        gs.log("CloneAPI: Scheduled Rolling back cloned database " + sysId + " on " + table);        
        SncInstanceRollback.rollback(sysId);
        
        return true;
    },
    
	_ensurePreferredNode: function(gr) {
		var clusterNode = gr.getValue("cluster_node");
		if (!gs.nil(clusterNode))
			return;
		
		var instanceId = gr.getValue("target_instance");
		gs.log("CloneAPI: ensurePreferredNode against target instance " + instanceId);
		var nodeList = this.getNodesOnlineByLatency(instanceId);
		if (nodeList == null)
          return;
		
		clusterNode = nodeList[0];
		gs.log("CloneAPI: ensurePreferredNode against target instance " + instanceId + " got best node " + new global.JSON().encode(clusterNode));
		
		var clusterNodeID = typeof clusterNode === 'string' ? clusterNode : clusterNode.sys_id;
		gr.setValue("cluster_node", clusterNodeID);
		gr.setWorkflow(false); // don't fire business rules; we're updating some metadata fields
		gr.update();
	},
	
    getNodesOnlineByLatency: function(instanceId) {
      var sleepTime = 2000; // 2s
      var maxWait = 60000;  // max we'll wait is 60 seconds (60,000 milliseconds)
      var shouldWait = true;

      var checkGroup = this.runConnectionTest(instanceId, true);

      if (!checkGroup)
          return null;

      gs.sleep(sleepTime); // wait for cluster nodes to pick up message
      var startTime = new Date().getTime();

      while (shouldWait) {
          var currentTime = new Date().getTime();

          if ((currentTime - startTime) > maxWait) {
              gs.log("Max wait time reached when finding closest node... Exiting");
              break;
          }
          var gr = new GlideRecord('ha_connectivity_test');
          gr.addQuery('check_group', checkGroup);
          gr.addQuery('latency', '');
          gr.query();

          // if we're not waiting on any results, return the lowest latency
          if (gr.next() == false) {
              gs.log("CloneAPI: Results done - finding node with lowest latency...");
              return new HAAPIs()._findLowLatency(checkGroup);
          }

          gs.sleep(sleepTime); // wait 3 seconds
      }

      gs.log("Max wait time reached, not all nodes checked in. Returning fastest successful node...");
      return new HAAPIs()._findLowLatency(checkGroup, true);
    },
  	
    runConnectionTest: function(instanceId) {
      var checkGroup = gs.generateGUID();
      var nodeList = new HAAPIs().getNodesOnline();
      for(var i = 0; i < nodeList.length; i++) {
          var node = nodeList[i];
          var ctgr = new GlideRecord("ha_connectivity_test");
          ctgr.state = 1;
          ctgr.check_group = checkGroup;
          ctgr.message = "Starting";
          ctgr.fast_check = true;
          ctgr.target_instance = instanceId;
          ctgr.cluster_node = node.sys_id;
          ctgr.insert();
      }
      return checkGroup;
    },

    isDBValid: function(instanceid) {
      return true;
    },

    getErrorMessage: function() {
      return this._errorMessage;
    },

    isCloneRunning: function() {
      return SncCloneUtils.isCloneRunning();
    },

    isSameVersion: function(instanceId) {
      var igr = new GlideRecord("instance"); 
      if ( !igr.get(instanceId) ) {
        gs.logError( "Instance record " + instanceId + " not found" );
        return false;
      }

      var remoteVersion = igr.getValue("war_version") + "";
      var myVersion = gs.getProperty("glide.war") + "";
      if ( !this._isSameVersion(myVersion, remoteVersion) ) {
        this._errorMessage = 'Instance "' + igr.instance_name + '" is currently on version "' + remoteVersion + '". The target instance needs to be upgraded to version "' + myVersion + '" before a clone request can be submitted.';
        return false;
      }

      return true;
    },

    _isSameVersion: function(myVersion, remoteVersion) {
      gs.log("CloneAPI isSameVersion: remoteVersion=" + remoteVersion + " vs myVersion=" + myVersion);

      if (!gs.nil(remoteVersion) && remoteVersion == 'null')
          remoteVersion = null;

      if (!gs.nil(myVersion) && myVersion == 'null')
          myVersion = null;

      if (gs.nil(remoteVersion) && gs.nil(myVersion))
          return true;

      if (!gs.nil(myVersion) && myVersion.indexOf('.') > -1)
          myVersion = myVersion.substring(0, myVersion.length-4);

      if (!gs.nil(remoteVersion) && remoteVersion.indexOf('.') > -1)
          remoteVersion = remoteVersion.substring(0, remoteVersion.length-4);

      if (myVersion == remoteVersion)
          return true;
      
      return false;
    },

    _beforeStartClone: function(cloneRecord) {
      // Fetch the war version from target and store it in source db
      this._updateWarVersion(cloneRecord.getValue("target_instance"));

      // contact clone web service
      var notifiedServer = this._notifyServer(cloneRecord);
      return notifiedServer;
    },
   
    _updateWarVersion: function(instanceId) {
      if (gs.nil(instanceId))
        return;

      var instanceGR = new GlideRecord("instance");
      if ( !instanceGR.get(instanceId) ) {
        gs.logError( "CloneAPI: Instance record " + instanceId + " not found in instance table" );
        return;
      }
      instanceGR.setWorkflow(false); // don't fire business rules; we're updating some metadata fields

	  var instanceUrl = instanceGR.getValue("instance_url");
	  var instanceName = instanceGR.getValue("instance_name");
	  var user = instanceGR.getValue("admin_user");
	  var secret = instanceGR.getValue("admin_password");
	  var clearText = new GlideEncrypter().decrypt(secret);
		
      // Fetch the war version from target and store it in source db
	  try {
		  var version = this._getWarVersion(instanceUrl, user, clearText);
		  instanceGR.setValue("war_version", version);
		  instanceGR.setValue("validation_error", "");
		  gs.log("Retrieved instance version: " + instanceName + " = " + version);
	  } catch(e) {
		  instanceGR.setValue("validation_error", "Failed to retrieve instance version: " + e.toString());
		  gs.warn("Failed to obtain instance version: " + instanceName);
	  }
	  instanceGR.update();
    },

	_getWarVersion: function(instanceUrl, user, pwd) {
		var getPropertyUrl = this._buildWSURL(instanceUrl, "GetProperty.do?SOAP");		
		
		var soapdoc = new SOAPEnvelope("GetProperty", "http://www.service-now.com/");
		soapdoc.setFunctionName("execute");
		soapdoc.addFunctionParameter("property", "glide.war");
 
		var soapRequest = new GlideInternalSoapClient(getPropertyUrl, user, pwd);
		soapRequest.setSOAPAction(soapdoc.functionName);
		soapRequest.postRequest(soapdoc.toString());
		var xmlStr = soapRequest.getResponseXML();
		gs.log("CloneAPI._getWarVersion getHTTPStatus=" + soapRequest.getHTTPStatus());		
		gs.log("CloneAPI._getWarVersion == " + xmlStr);
		
		if (soapRequest.getHTTPStatus() == 200) {
			var property = gs.getXMLText(xmlStr, "//executeResponse/property");
			if (!gs.nil(property))
				return property;
		}
		
		throw "httpStatus == " + soapRequest.getHTTPStatus() + ", httpResponse == " + xmlStr;
	},
	
	_buildWSURL: function(instance_url, page) {
		var url = instance_url+"";
		var http = "";
		var slash = "";
		if (url.charAt(url.length-1, 1) != '/')
		  slash = "/";
    
		if (url.indexOf("http") != 0) {
			http = "http://";
			if (url.indexOf("localhost") == -1)
				http = "https://";
		}

		return http + url + slash + page;
	},
	
    _notifyServer: function(cloneRecord) {
      var answer = false;
      try {
        if (new InstanceCloneScheduler().notifyServer(cloneRecord))
	  answer = true;
      } catch(e) {
      	 SncCloneLogger.log("InstanceClone", cloneRecord.sys_id, null, /*warn*/1, "Unable to contact server for confirmation: " + e.description);
      }
      return answer;
    }, 
   
    _isReadyState: function(cloneRecord) {
      return cloneRecord.getValue('state') == 'Requested' || cloneRecord.getValue('state') == 'Scheduled';
    },

    _isRequestedState: function(cloneRecord) {
      return cloneRecord.getValue('state') == 'Requested';
    },

    restartClone: function(cloneRecord) {
      var table = cloneRecord.sys_class_name+'';
      if( table != 'clone_instance' ) {
        gs.addErrorMessage( "Unable to restart clone: only Instance Clone records can be restarted (expected table 'clone_instance', actual table '" + table + "')" );
        return false;
      }
      
      var newCloneId = this._copyCloneRecord(cloneRecord);
      gs.log("CloneAPI: restartClone created new clone_instance record '" + newCloneId + "'");
      return newCloneId !== null;
    },      

    _copyCloneRecord: function(model) {
      var newClone = new GlideRecord("clone_instance");
      newClone.initialize();
      newClone.name = model.name;
      newClone.source_instance = model.source_instance;	
      newClone.target_instance = model.target_instance;
      newClone.exclude_large_data = model.exclude_large_data;	
      newClone.preserve_theme = model.preserve_theme;	
      newClone.filter_attachment_data = model.filter_attachment_data;
      newClone.security_token = model.security_token;	
      newClone.cluster_node = model.cluster_node;	
      newClone.email = model.email;
      newClone.setValue("scheduled", new GlideDateTime()); // now GMT
      newClone.state = 'Requested';
      newClone.megabytes_to_copy = model.megabytes_to_copy;
      newClone.duration = model.duration;
      newClone.retries = Math.max(model.retries, 0) + 1; // indicates this is a restart
      var newCloneId = newClone.insert();
	
      var sourceCloneId = model.getUniqueValue();
      this._copyPreservedData(sourceCloneId, newCloneId);
	
      return newCloneId;
    },
    
    _copyPreservedData: function(sourceCloneId, targetCloneId) {
      var preservedCount = 0;
      var grSourceData = new GlideRecord("clone_preserved_data");
      grSourceData.addQuery("clone", sourceCloneId);
      grSourceData.query();
      while (grSourceData.next()) {
    	++preservedCount;
	var payload = grSourceData.getValue("payload");
    	var newPreservedData = new GlideRecord("clone_preserved_data");
	newPreservedData.initialize();
    	newPreservedData.clone = targetCloneId;
	newPreservedData.payload = payload;
    	newPreservedData.insert();
      }
      gs.print("CloneAPI: inserted " + preservedCount + " preserved data records for restarted clone " + targetCloneId);
    },
   
	_getSystemID: function(table, sysId) {
    	var systemID = null;
		var cloneRecord = new GlideRecord(table);
		if (cloneRecord.get(sysId)) {
			var preferredNode = cloneRecord.getValue("cluster_node");
			if (!gs.nil(preferredNode)) {
		    	var clusterStateRecord = GlideClusterSynchronizer.getNodeById(preferredNode);
				if (clusterStateRecord != null && clusterStateRecord.status == "online")
					systemID = clusterStateRecord.system_id;
			}
        }
		return systemID;
	}
};