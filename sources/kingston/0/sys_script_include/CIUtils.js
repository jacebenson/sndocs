var CIUtils = Class.create();

CIUtils.prototype = {

   initialize : function() {
      this.maxDepth = gs.getProperty('glide.relationship.max_depth',10);  // how deep to look
      this.currentDepth = 0;

      this.services = new Object();  // list of affected services
	  this.parents = new Object();   // already checked parents
      this.maxSize = gs.getProperty('glide.relationship.threshold',1000);  // how many records to return
      this.added = 0;  // track how many added, since can't get size() for an Object
   },

   /**
    * Determine which business services are affected by a specific CI
    * 
    * Inputs:
    *    id is the sys_id of a configuration item (cmdb_ci)
    *
    * Returns:
    *    an array of sys_id values for cmdb_ci_server records downstream of
    *    (or affected by) the input item
    */
 
   servicesAffectedByCI: function(id) {
      var ci = new GlideRecord("cmdb_ci");
      if (ci.get(id)) {
      	if (ci.sys_class_name == "cmdb_ci_service" || ci.sys_class_name == "cmdb_ci_service_discovered")
         	this._addService(id, this.services);
      
      	this._addParentServices(id, this.services, this.currentDepth);
      }

   	  // Add services associated by service mapping
	  this.addServicesAssociatedByServiceMapping(id);

	  var svcarr = new Array(); // services is an Object, convert to Array for final query
      for (var i in this.services)
         svcarr.push(i);
    
      return svcarr; // list of affected services
   },
   
   /**
   * Add business services associated to the CI by service mapping. Service mapping
   *  maintains service models using the CMDB service model API
   *  Input: 
   *      id - the CI sys_id 
   *  Output:
   *      svcarr - list of associated services 
   */
   addServicesAssociatedByServiceMapping: function(id) {
	   if (!GlidePluginManager.isRegistered('com.snc.service-mapping'))
		   return;
	   
       // Add service associations created by service mapping
       var bsm = new SNC.BusinessServiceManager();
       var svcList = bsm.getServicesAssociatedWithCi(id);
       for (var iterator = svcList.iterator(); iterator.hasNext();) {
            var svc = iterator.next();
		    this._addService(svc, this.services);
       }
   },
   /**
    * Determine which business services are affected by a task
    * 
    * Inputs:
    *    task is a task GlideRecord (e.g., incident, change_request, problem)
    *
    * Returns:
    *    an array of sys_id values for cmdb_ci_server records downstream of
    *    (or affected by) the configuration item referenced by the task's cmdb_ci field
    */

   servicesAffectedByTask: function(task) {
      var id = task.cmdb_ci.toString();
      return this.servicesAffectedByCI(id);
   },

   _addParentServices : function(value, services, currentDepth) {
	  if (this.parents[value])  // already checked?
		 return;
	  else this.parents[value] = true;
		 
     if (this.added >= this.maxSize)
       return;
     else {
       currentDepth++;
       var al = SNC.CMDBUtil.getRelatedRecords(value, "", "cmdb_ci", "cmdb_ci", "child"); // returns ArrayList
   	   if (al.size() > 0) {
          // first add the unique services
          var kids = new GlideRecord('cmdb_ci_service');
          kids.addQuery('sys_id', al);
          kids.query();
          while (kids.next()) {
             var str = kids.sys_id;
             if (!services[str]) {
               this._addService(str, services);
               if (this.added >= this.maxSize)
                  return;
               if (currentDepth < this.maxDepth)
                   this._addParentServices(str, services, currentDepth);
             }
          }
   
          // now check parents of non-services
          for (var i=0; i < al.size(); i++) {
		     var parent = al.get(i);
 		     if (parent) {
                var str = parent + "";
          	    if (!services[str])  // if already in "services", we already checked its parents
                   if (currentDepth < this.maxDepth)  
                     this._addParentServices(str, services, currentDepth);
             }
		  }
       }			
     }
   },
   
   _addService: function(id, services) {
      services[id] = true;
      this.added++;
   },
   
   /**
    * Returns an array of IP addresses belonging to the given CI (including 127.0.0.1).
	*/
   getIPs: function(ci_sys_id) {
      var ipgr = new GlideRecord('cmdb_ci_ip_address');
      ipgr.addQuery('nic.cmdb_ci', ci_sys_id);
      ipgr.addQuery('ip_version', '4');
      ipgr.addQuery('install_status', '<>', 100);
      ipgr.addQuery('nic.install_status', '<>', 100);
      ipgr.query();
	  var result = [];
      while (ipgr.next())
		 result.push(ipgr.getValue('ip_address'));
	  result.push('127.0.0.1');
	  return result;
   },

   type: 'CIUtils'
   
};