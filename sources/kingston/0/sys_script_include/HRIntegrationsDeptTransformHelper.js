var hrIntegrationsHelper = new HRIntegrationsHelper();
var HRIntegrationsDeptTransformHelper = Class.create();
HRIntegrationsDeptTransformHelper.prototype = {
    initialize: function() {
    },
	
	
	transform: function(source, target) {
		// Don't do any transformations for dry run.
		
		/*if (gs.getProperty("sn_hr_wday.dryrun") === "true") {
			gs.info("Dry run. If non-dry run mode, we will create department: "+source.name, hrIntegrations.HR_INT_LOADER_LOG);
			ignore = true;
			return;
		}*/

		var departmentQuery;
		var ccQuery;
		var deptID;

		if (action == "insert" && source.external_id ) {
			
			departmentQuery = new GlideRecord(hrIntegrations.DEPARTMENT_TABLE); 
			// action is 'insert', so let's create it and then set 'ignore = true'
			departmentQuery.initialize();
			
			// copy the target values to departmentQuery object manually.
			for(var colKey in target) {
				if (typeof colKey == 'string' && !(colKey.substring(0,"sys_".length) === "sys_")) {
					var colValue = target[colKey];
					if(colValue) 
						departmentQuery.setValue(colKey,target[colKey]);
				}
			}
			// Set the cost_center
			if (source.cost_center) {
				ccQuery = new GlideRecord("cmn_cost_center");
				ccQuery.addQuery("code", source.cost_center);
				ccQuery.query();
				if (ccQuery.next())
					departmentQuery.setValue("cost_center",ccQuery.sys_id);
			} 

			// need to get the sys_id of the new location for the cross-reference table				
			deptID = departmentQuery.update();
		
			// ask the transform to skip as we manually handled the insert case
			ignore = true;
		} else if (action == "update") {
			// Set the cost_center
			if (source.cost_center) {
				ccQuery = new GlideRecord("cmn_cost_center");
				ccQuery.addQuery("code", source.cost_center);
				ccQuery.query();
				if (ccQuery.next())
					target.cost_center = ccQuery.sys_id;
			} 
		}
		
		if (target.sys_id && target.sys_id.trim().length > 0)
			deptID = target.sys_id;
	},

    type: 'HRIntegrationsDeptTransformHelper'
};