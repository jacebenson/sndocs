var DiscoveryFunctions = Class.create();

DiscoveryFunctions.prototype = {
    initialize: function() {
    },

    getScheduleRecord: function() {
        var statusGR = this.getStatusRecord();
        if (!statusGR)
            return;

        var gr = new GlideRecord('discovery_schedule');
        gr.get(statusGR.dscheduler);
        return gr;
    },

    getStatusRecord: function() {
        var statusSysId = g_probe.getCorrelator();
        if (gs.nil(statusSysId)) {
            if (typeof agent_correlator != 'string' && agent_correlator)
                statusSysId = agent_correlator;
            else if (current) {
                if (current.agent_correlator)
                    statusSysId = current.agent_correlator;
                else if (current.getTableName() == "discovery_status")
                    return current;
            }
        }

        if (!statusSysId)
            return null;

        var gr = new GlideRecord('discovery_status');
        gr.get(statusSysId);
        return gr;
    },
    
    getDiscoveryType: function(statusID) {
        var statusGR = new GlideRecord('discovery_status');
        statusGR.get(statusID);
        var schedGR = new GlideRecord('discovery_schedule');
        schedGR.get(statusGR.dscheduler);
        return schedGR.discover;
    },

    getService: function(port) {
        var gr = new GlideRecord("cmdb_ip_service");
        if (!gr.get("port", port)) {
            gr.initialize();
            gr.setValue("port", port);
            gr.setValue("name", "unknown - port(" + port + ")");
            gr.insert();
        }

        return gr;
    },

    isInRange: function(ip) {
        var gr = this.getStatusRecord();
        if (gr != null) {
            var hostList = gr.scratchpad.host_list;

            if (hostList) {
                var hosts = StringUtil.split(hostList, ",");
                if (hosts.contains(ip))
                    return true;
            }

            return SncDiscoveryRangesDB.inRanges(ip, gr.dscheduler);
        }

        return false;
    },
    
    getXMLMemoryTable: function(tableName, doc, path) {
        var result = null;
        try {
            result = GlidesoftXMLMemoryTable.getFromDocAndXPath(tableName, doc, path);
        } catch (iae) {
            // do nothing; we'll return a null...
        }
        return result;
    },

    getFieldsThatChanged: function(gr) {
        var changes = [];
        
        if (gr == null || !gr.isValid())
            return changes;
      
        var gru = GlideScriptRecordUtil.get(gr);
        var ignoreables = new Packages.java.util.ArrayList();
        ignoreables.add("last_discovered");
    
        var whatChanged = gru.getChangedFields(ignoreables);
        for (var i = 0; i < whatChanged.size(); i++) {
            var f = whatChanged.get(i);
            changes.push(f);
        }

        return changes;
    },

    updatedHistory: function(gr, sensor, eccID) {
        var fieldsChanged = this.getFieldsThatChanged(gr);
        if (fieldsChanged.length > 0)
            g_device.log("Updated device fields " + fieldsChanged.join(", "), sensor, eccID);
    },

	/*
     *  Return the sys_id of the relationship created. Otherwise return null or undefined.
     */
	createRelationshipFromSysIds: function(parentId, childId, pDescription, cDescription) {
        if (JSUtil.nil(parentId) || JSUtil.nil(childId))
            return;
        
        if (!cDescription && pDescription.indexOf("::") > -1) {
            var parts = pDescription.split("::");
            pDescription = parts[0];
            cDescription = parts[1];
        }

		var ECMDBUtil = SncECMDBUtil;
        return ECMDBUtil.createCIRelationship('cmdb_rel_ci', parentId, childId, pDescription, cDescription);
    },
	
    //
    // Args:    parent <pDescription> child   /    child <cDescription> parent
    // Example: vmware   Runs on      sanops  /    sanops    Runs       vmware
    // parent, child input can either be GlideRecord or sys_id
    //
    createRelationship: function(parent, child, pDescription, cDescription) {
        if (JSUtil.nil(parent) || JSUtil.nil(child))
            return;

        var parentId = parent;
        var childId  = child;

        //If parent or child is a GlideRecord object, we need to extract the sys_id
        if (parent instanceof GlideRecord)
            parentId = parent.sys_id;
        if (child instanceof GlideRecord)
            childId  = child.sys_id;
        
		return this.createRelationshipFromSysIds(parentId, childId, pDescription, cDescription);
    },

    /*
     *  Return the sys_id of the relationship if found or created. Otherwise return null or undefined.
     */
    createRelationshipIfNotExists: function(parent, child, descriptor) {
        var result = this.relationshipExists(parent, child, descriptor);
        if (JSUtil.notNil(result))
            return result;

        return this.createRelationship(parent, child, descriptor);
    },

    /*
     *  Checks to see if a relationship already exists
     */
    relationshipExists: function(parent, child, descriptor) {
        if (JSUtil.nil(parent) || JSUtil.nil(child) || JSUtil.nil(descriptor))
            return;

        var parentId = parent;
        var childId  = child;

        //If parent or child is a GlideRecord object, we need to extract the sys_id
        if (parent instanceof GlideRecord)
            parentId = parent.sys_id;
        if (child instanceof GlideRecord)
            childId  = child.sys_id;

        var relationType = this.findCIRelationshipType("cmdb_rel_type", descriptor);
        
        var gr = new GlideRecord("cmdb_rel_ci");
        gr.addQuery("parent", parentId);
        gr.addQuery("child", childId);
        gr.addQuery("type", relationType);
        gr.query();
        if (gr.next())
            return gr;

        return;
    },
	
	
	/**
	  * get a child of this parent of type matched by the descriptor
	  *
	  * Descriptor is of form <Parent Relationship>::<Child Relationship>
	  * so, for example calling this method on a web server with descriptor "RunsOn::Runs" 
	  * returns the computer it runs on.  Thus, web server is the parent and computer is the child
	  */
	
	getChildCI: function(parent, descriptor) {
		var gr = new GlideRecord("cmdb_rel_ci");
		gr.addQuery("parent", parent.sys_id);
		if (descriptor) {
			var relationType = this.findCIRelationshipType("cmdb_rel_type", descriptor);
			if (relationType)
				gr.addQuery("type", relationType);
		}
		gr.query();

		if (gr.next()) {
			var cigr = new GlideRecord("cmdb_ci");
			if (cigr.get(gr.child)) {
				return cigr;
			}
		}
		return null;
	},

    reclassify: function(gr, newClassName, reason) {
        // we are already that class, just return
        if (gr.sys_class_name == newClassName)
            return gr;

        var rci = SncReclassifyCI.createFromGlideRecord(gr, newClassName);
        rci.setApplyDefaults(false);
        rci.setReason(reason);
        return rci.reclassify();
    },

    deleteCIBySysId: function(sysId, workflow) {
        var gr = new GlideRecord("cmdb_ci");
        if (!gr.get(sysId))
            return;
            
        this.deleteCI(gr, workflow);
    },

    deleteCI: function(gr, workflow) {
        var al = [];
        al.push(gr.getValue("sys_id"));

        //Check to see if it matches these two criteria
        if (!(gr.instanceOf("cmdb_ci_computer") || gr.instanceOf("cmdb_ci_appl"))) {
            gr.deleteRecord();
            return;
        }

        if (workflow && workflow != "false") {
            this.deleteCIAndRelationshipsRecursive(al);
            return;
        }
        
        try {
            var oldWorkflow = session.getWorkflow();
            this.deleteCIAndRelationshipsRecursive(al);
        } finally {
            session.setWorkflow(oldWorkflow);
        }

    },

    /*
    * This is where the heavy lifting of traversing through the relationship tree is done
    * We only traverse through the relatinoships that have RUNS_ON and HOSTED_ON relationships at this point
    * 
    * We basically look for all the parent CIs that runs on or is hosted on the child CI(s) and delete them.
    */

     deleteCIAndRelationshipsRecursive: function(appList) {
     if (appList.length == 0)
            return appList;
        
     var appListNew = [];
     var tempSysId;
     var sysID;
         for (var i = 0; i < appList.length; i++) {
             sysID = appList[i];
         var gr = new GlideRecord("cmdb_rel_ci");
         gr.addQuery("child", sysID);
         var qc = gr.addQuery("type", this.findCIRelationshipType("cmdb_rel_type", "Runs on::Runs"));
         qc.addOrCondition("type", this.findCIRelationshipType("cmdb_rel_type", "Hosted on::Hosts"));
         gr.query();
         while (gr.next()) {
         tempSysId = gr.getValue("parent");
                    
         //Check to see if same CI could runs-on or be hosted on same child (maybe possible?)
         if (!contains(appListNew, tempSysId))
            appListNew.push(tempSysId); 
         
                 gr.deleteRecord(); //delete the relationship entry
         }
                        
         var cigr = new GlideRecord("cmdb_ci");
         if (cigr.get(sysID))
        cigr.deleteRecord();
          }

      return this.deleteCIAndRelationshipsRecursive(appListNew);

          function contains(arr, value) {
             for (var i=0; i<arr.length; i++)
               if (arr[i] == value)
                  return true;
             return false;
          }

       },
	
	findOrCreateRelationshipType: function(refTable, descriptor) {
		var result = this.findCIRelationshipType(refTable, descriptor);
		if (JSUtil.notNil(result))
			return result;
		
		var al = descriptor.split("::");
        var gr = new GlideRecord(refTable);
        gr.parent_descriptor = al[0];
        gr.child_descriptor = al[1];
		return gr.insert()
	},
    
    findCIRelationshipType: function(refTable, descriptor) {
        var al = descriptor.split("::");
        return this.findCIRelationshipTypeByDesc(refTable, al[0], al[1]);
    },
    
    findCIRelationshipTypeByDesc: function(refTable, pDescriptor, cDescriptor) {
        var gr = new GlideRecord(refTable);
        gr.addQuery("parent_descriptor", pDescriptor);
        gr.addQuery("child_descriptor", cDescriptor);
        gr.query();
        if (gr.next())
            return gr.getValue("sys_id");

    	return "";
    },


    /* Manage the PIDs creation and update */
    insertPIDs: function(pids, app_sys_id, ci_sys_id) {
        if (StringUtil.nil(pids))
            return;
 
        var pid_array = pids.match(/\d+/g);
        var gr = new GlideRecord("cmdb_pid");
        gr.initialize();
        for (var i=0; i<pid_array.length; i++) {
           gr.pid = pid_array[i];
           gr.application = app_sys_id;
           gr.cmdb_ci = ci_sys_id;
           gr.insert();
        }
    },

    updatePIDs: function(pids, app_sys_id, ci_sys_id) {
        if (StringUtil.nil(pids))
            return;        
        
        var gr = new GlideRecord("cmdb_pid");
        gr.addQuery("application", app_sys_id);
        gr.query();
        gr.deleteMultiple();

        this.insertPIDs(pids, app_sys_id, ci_sys_id);
    },

    /********************************************** 
     * Manage the Windows installed software xml
     *
     * Example payload:
     *   <results probe_time="6313">
     *     <result>
     *       <Registry>
     *         <entry key="HKEY_LOCAL_MACHINE">
     *           <entry key="Software">
     *             <entry key="Microsoft">
     *               <entry key="Windows">
     *                 <entry key="Name">
     *                   <value>Just a name</value>
     *                 </entry>
     *               </entry>
     *             </entry>
     *           </entry>
     *         </entry>
     *       </Registry>
     *     </entry>
     *   </results>
     * 
     *   // To find the value of the key called "name", here's how these methods can be used.
     *   // registry is a variable representing the payload
     *   var node = findRegistryNode(registry, "HKEY_LOCAL_MACHINE.Software.Microsoft");
     *   var name = findNodeValueWithAttribute(node, "Name");
     *********************************************/
    findRegistryNode: function(currNode, regName){
    var node = currNode;
    var names = regName.split(".");

    for (var i=0; i<names.length; i++) {
        node = this.findNodeWithAttribute(node, names[i]);
            if (!node)
                return null;
        }

    return node;
    },

    findNodeWithAttribute: function(currNode, attrName) {
        if (JSUtil.nil(currNode))
            return "";

        var nodeArray = g_array_util.ensureArray(currNode.entry);
    for (var i=0; i<nodeArray.length; i++)
        if (nodeArray[i]['@key'] == attrName)
            return nodeArray[i];

    return null;
    },

    findNodeValueWithAttribute: function(currNode, attrName) {
        if (JSUtil.nil(currNode))
            return "";

        var nodeArray = g_array_util.ensureArray(currNode.entry);
    for (var i=0; i<nodeArray.length; i++)
        if (nodeArray[i]['@key'] == attrName)
            return nodeArray[i].value;

        return "";
    },

    type: "DiscoveryFunctions"
}