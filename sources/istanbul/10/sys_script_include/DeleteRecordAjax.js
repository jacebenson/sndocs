var DeleteRecordAjax = Class.create();
DeleteRecordAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
   
   getCascadeDeleteTables: function() {
      var confNeeded = gs.getProperty('glide.ui.confirm_cascade_delete');
      if(confNeeded == null || confNeeded != "true") {
         return '';
      }
      var objSysId = this.getParameter('sysparm_obj_id');
      var tblName = this.getParameter('sysparm_table_name');
      var stackName = this.getParameter('sysparm_nameofstack');
	  var gotoUrl = this.getParameter('sysparm_goto_url');
      
      var dMap = GlideCascadeFromDelete.getCascadeTables(tblName, objSysId, stackName);
      var retUrl = dMap.remove("return_url");

      // Use the more explicit sysparm_goto_url if it exists
      if (gotoUrl && gotoUrl != "")
          retUrl = gotoUrl;
	   
      var dList = '';
      if(retUrl != null) dList += retUrl + ';';
         else dList += 'null;';
         
      if( dMap.isEmpty()) {
         return dList;
      }
      
      // translate returned Java Map to a string format that client page can understand
      var objName = dMap.remove("name");
      dList += objName + ';';
      var itr = dMap.keySet().iterator();
      while(itr.hasNext()) {
         var dTbl = itr.next();
         var count = dMap.get(dTbl).intValue();
         dList = dList + count + ':' + dTbl + ',';
      }
      return dList;
   },
   
   isDomainUsed: function() {
   	var domainSysID = this.getParameter('sysparm_domain_id');
   	return GlideDomainSupport.isDomainUsed(domainSysID);
   },
	
   areDomainsUsed: function() {
		var selDomains = this.getParameter('sysparm_domain_ids');
	    var selDomainsList = selDomains.split(",");
		for(i = 0; i<selDomainsList.length; i++){
			if(GlideDomainSupport.isDomainUsed(selDomainsList[i]))
				return true;
		}
		return false;
	},
   
   proceedWithDeleteFromForm: function() {
      var objSysId = this.getParameter('sysparm_obj_id');
      var tblName = this.getParameter('sysparm_table_name');
	  var disableWf = this.getParameter('sysparm_disable_wf');
	   
      var gRecord = new GlideRecord(tblName);
	  if(JSUtil.notNil(disableWf) && disableWf == 'true') {
		 gRecord.setWorkflow(false);
	  }
	  if(gRecord.get(objSysId)) {
		  if (gRecord.canDelete())
	         gRecord.deleteRecord();
      }
      return true;
   },
   
   proceedWithDeleteFromList: function() {
      var objSysIds = this.getParameter('sysparm_obj_list');
      var tblName = this.getParameter('sysparm_table_name');
	   
      var objList = objSysIds.split(',');
      
      // PRB570448, remove records that cannot be deleted because of ACL restrictions first
	  // then call deleteMultiple(), since it uses DBQuery and bypasses ACL checks.
	  var sysIdsToDel = '';
      for(var i=0; i<objList.length; i++) {
		 
         if(objList[i] == null || objList[i] == '') {
            continue;
         }
         var gr = new GlideRecord(tblName);
         gr.get('sys_id', objList[i]);
         if(gr.canDelete()) {
			if(i > 0) sysIdsToDel += ',';
            sysIdsToDel += objList[i];
         }
      }
	  if(sysIdsToDel != '') {
		 var gRecord = new GlideRecord(tblName);
         gRecord.addQuery('sys_id','IN', sysIdsToDel);
		 if (GlideDomainSupport.getCurrentDomainValueOrGlobal() == 'global')
			 gRecord.queryNoDomain();
		 else
         	gRecord.query();
         gRecord.deleteMultiple();
	  }
      return true;
   },
   
   toString: function() { return 'DeleteRecordAjax'; }
});
