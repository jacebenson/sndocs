/* jshint -W030 */
ArrayPolyfill;
var CloudCIReconciler;

(function() {
var reltypes = { };

CloudCIReconciler = {

	/*In this method, we will query the CMDB for existing CIs, combine the existing CI and discovery 
	result into one map, and set the correct staleness status.This method will do nothing to realtionships, 
	so if a child CI is moved to another parent, there will be a wrong relationship.
	
	parentList: A list of CI sys_ids or objects used to query the CMDB for existing CI information. It should contains
	all parents of all knownChildren.
	
	tableName: A string that represents the table we want to reconcile.
	
	knownChildren: A list of CI sys_ids or objects, represent the discovery result.
	*/
	updateStaleness: function(parentList, tableName, knownChildren){
		//Convert knownChildren and parentList to list of sys_ids.
		knownChildren = knownChildren.map(function(child) { return '' + (child.sys_id || child); });
		parentList = parentList.map(function(parent){return '' + (parent.sys_id || parent); });
		
		var stalenessMap = {};
		var i;
		for(i = 0; i < parentList.length; i++){
			var parent = parentList[i];
			
			//Query cmdb rel ci table to find all children of parent
			var grRel = new GlideRecord('cmdb_rel_ci');
			grRel.addQuery('parent', parent);
			grRel.query();
			
			//Check if child belongs to tableName
			while(grRel.next()){
				var child = grRel.child;
				var grChild = new GlideRecord(tableName);
				
				if(grChild.get(child))
					stalenessMap[child] = true;
				
			}
		}

		//go though knownChildren, and mark the staleness status to be false
		for(i = 0; i < knownChildren.length; i++){
			stalenessMap[knownChildren[i]] = false;
		}
				
		//Set the staleness status for those CIs
		SNC.DiscoveryCIReconciler.updateStaleness(JSON.stringify(stalenessMap), tableName);
	},
	
	/*This method will do reconciliation based on relationship. It first use all parents in 'rels' to get all
	the relationships in CMDB.Then compare the relationships with rels and figure out what child CIs are stale.
	Relationships for stale CIs aren't modified.  Incorrect relationships for fresh CIs will be removed and
	missing relationships for fresh CIs will be created.
	
	rels: relationships in such format: [{parent:parent_sys_id/parent_object, children:[child_sys_id_01/object, child_sys_id_02/object]}]
	parentTable: Table of the parent records
	childTable: Table of the child records
	typeName: Relationship type name, e.g. "Has Registered::registered on"
	*/
	updateStalenessWithRelationships: function(rels, parentTable, childTable, typeName) {

		//convert rel.parent to sys_id
		rels.forEach(function(rel) { rel.parent = rel.parent.sys_id || rel.parent; });

		var gr;
		var staleChildren = { };
		var staleParents = { };
		var parents = { };
		var i, j;
		var child, parent;
		var cPMap = {};
		var existingCPMap = { };
		var type = getRelType(typeName);
		var staleChildrenArray = [ ];
		
		//Traverse rels to get all parents, children, rel types. And use these to query cmdb to get all existing relationships
		for(i = 0; i < rels.length; i++){
			var children = rels[i].children;
			parent = rels[i].parent;
			
			//Convert children to list of sys_ids
			children.forEach(function(child, idx) { children[idx] = child.sys_id || child });

			// Get all parents of any child in the set
			gr = new GlideRecord('cmdb_rel_ci');
			gr.addQuery('parent.sys_class_name', parentTable);
			gr.addQuery('type', type);
			gr.addQuery('child', 'IN', children);
			addExisting(gr);

			// Get all children of this parent
			gr = new GlideRecord('cmdb_rel_ci');
			gr.addQuery('parent', parent);
			gr.addQuery('type', type);
			gr.addQuery('child.sys_class_name', childTable);
			addExisting(gr);
		}
		
		//Build child to parent map for rels
		for(i = 0; i < rels.length; i ++){
			var relChildren = rels[i].children;
			var relP = rels[i].parent;
			parents[relP] = 1;
			for(j = 0; j < relChildren.length; j++){
				var relC = relChildren[j];
				cPMap[relC] = cPMap[relC] || {};
				cPMap[relC][relP] = type;
			}
		}

		//Compare existing relationships with rels
		for(child in existingCPMap){
			//If child in existingRels, but not in rels, mark it as stale
			if(!cPMap[child]) {
				staleChildrenArray.push(child);
				staleChildren[child] = true;
			}
			else {
				//If child still exists, check the relationships
				for(parent in existingCPMap[child]){
					if (parents[parent]) {
						//If the relatinship doesn't, remove it.
						if(!cPMap[child][parent]) {
							gr = new GlideRecord('cmdb_rel_ci');
							gr.get(existingCPMap[child][parent]);
							gr.deleteRecord();
						}
					} else {
						//The parent no longer exists.  Leave the relationship but
						//mark the parent as stale
						staleParents[parent] = true;
					}
				}
			}
		}

		//Now walk desired relationships and create any that don't exist.
		for (child in cPMap) {
			staleChildren[child] = false;
			for (parent in cPMap[child]) {
				staleParents[parent] = false;
				if (!existingCPMap[child] || !existingCPMap[child][parent])
					g_disco_functions.createRelationshipIfNotExists(parent, child, typeName);
			}
		}

		//Mark stale records
		SNC.DiscoveryCIReconciler.updateStaleness(JSON.stringify(staleChildren), childTable);
		SNC.DiscoveryCIReconciler.updateStaleness(JSON.stringify(staleParents), parentTable);

		return staleChildrenArray;

		// 'gr' is a query set.  Map each child in the set to its parent.
		function addExisting(gr) {
			var children;
			gr.query();
			while (gr.next()) {
				children = existingCPMap[gr.child] = existingCPMap[gr.child] || { };
				children[gr.parent] = '' + gr.sys_id;
			}
		}
	},

	updateVmwareGuestStaleness: function(staleVms, updateInstanceStaleness) {
		var staleGuests = { },
			staleInstances = { },
			staleGuestCount = 0,
			relType = getRelType('Instantiates::Instantiated by');

		if (staleVms instanceof Array)
			staleVms.forEach(updateStaleness);
		else
			updateStaleness(staleVms);

		if (updateInstanceStaleness && staleVms.length)
			SNC.DiscoveryCIReconciler.updateStaleness(JSON.stringify(staleInstances), 'cmdb_ci_vmware_instance');

		if (staleGuestCount)
			SNC.DiscoveryCIReconciler.updateStaleness(JSON.stringify(staleGuests), 'cmdb_ci_computer');

		function updateStaleness(vmInstance) {
			var state,
				vmInstanceGr = vmInstance,
				vmInstanceSysId = vmInstance.sys_id || vmInstance,
				relGr = new GlideRecord('cmdb_rel_ci');

			staleInstances[vmInstanceSysId] = true;

			if (vmInstance.sys_id)
				vmInstanceGr = vmInstance;
			else {
				vmInstanceGr = new GlideRecord('cmdb_ci_vmware_instance');
				if (!vmInstanceGr.get(vmInstance))
					return;
			}

			state = '' + vmInstanceGr.state;
			if (state != 'terminated' && state !== '') {
				vmInstanceGr.setValue('state', '');
				vmInstanceGr.update();
			}

			// We don't want to mark the guest as stale if we're not sure it's the right guest
			if (!vmInstanceGr.guest_reconciled)
				return;

			// See if we have a relationship to our guest CI
			relGr.addQuery('child', vmInstanceSysId);
			relGr.addQuery('type', relType);
			relGr.query();

			// There should be exactly one relationship when guest_reconciled == true,
			// but make sure, just in case.
			if (relGr.getRowCount() == 1) {
				relGr.next();
				staleGuestCount++;
				staleGuests[relGr.parent] = true;
			}
		}
	},

	/*This method will update the CI staleness status based on field and value. We query the tableName with fields and values in fieldValueMap, 
	if the CI is not in known_children, we mark it as stale. Then we query cmdb_rel_ci, if the stale ci has relationships with 
	type and parent type, delete the relationship.
	
	relTypes and parentTypes are optional parameters.
	
	Returns an array of sys_ids that are stale
	*/
	updateStalenessWithField: function(fieldValueMap, tableName, knownChildren, relTypes, parentTypes){
		knownChildren = knownChildren.map(function(child){ return '' + (child.sys_id || child); });
		relTypes = (relTypes || []).map(function(type) {return '' + (type.sys_id || type);});
		parentTypes = (parentTypes || []).map(function(parent) {return '' + (parent.sys_id || parent);});
		
		var knownChildrenMap = {}, parentTypeMap = {};
		var stalenessMap = {};
		
		//Save the staled CI, later use it to query relationships.
		var staledCI = [];
		var grTableName, grRel, grCMDBCI;
		var i, j, field, ci;
		
		//Convert knownChildren and parentTypes to map, so that it's easy see if an element is in it.
		for(i = 0; i < knownChildren.length; i ++){
			knownChildrenMap[knownChildren[i]] = 1;
			
			//Mark everything in knownChildren as not stale;
			stalenessMap[knownChildren[i]] = false;
		}
		
		for(i = 0; i < parentTypes.length; i ++){
			parentTypeMap[parentTypes[i]] = 1;
		}
		
		grTableName = new GlideRecord(tableName);
		for(field in fieldValueMap){
			grTableName.addQuery(field, fieldValueMap[field]);
		}

		grTableName.query();
		while(grTableName.next()){
			ci = grTableName.sys_id + '';
			if(knownChildrenMap[ci] != 1){
				staledCI.push(ci);
				stalenessMap[ci] = true;
			}
		}

		//Query cmdb_rel_ci to delete wrong relationships
		grRel = new GlideRecord('cmdb_rel_ci');
		grRel.addQuery('child', 'IN', staledCI);
		grRel.addQuery('type', 'IN', relTypes);
		grRel.query();
		while(grRel.next()){
			var parentSysId = grRel.parent + '';
			grCMDBCI = new GlideRecord('cmdb_ci');
			if(grCMDBCI.get(parentSysId) && parentTypeMap[grCMDBCI.getRecordClassName()] == 1){
				grRel.deleteRecord();
			}
		}
		
		
		//If tableName is a cmdb table set the staleness status for those CIs
		if(CloudCIReconciler.isCMDBTable(tableName))
			SNC.DiscoveryCIReconciler.updateStaleness(JSON.stringify(stalenessMap), tableName);
		
		return staledCI;
	},
	
	//Return true if the pass in tableName is an descendant of cmdb_ci table
	isCMDBTable: function(tableName){
		var grUtil = new GlideRecordUtil();
		var tables = grUtil.getTables(tableName);
		for(var i = 0; i < tables.size(); i ++){
			if ((tables.get(i) + '') == 'cmdb_ci')
				return true;
		}
		
		return false;
 	},
 	
	type: 'CloudCIReconciler'
};

function getRelType(relationship) {
	reltypes[relationship] = (reltypes[relationship] || g_disco_functions.findCIRelationshipType('cmdb_rel_type', relationship));
	return reltypes[relationship];
}

})();