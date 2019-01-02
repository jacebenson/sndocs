var KeylinesBsmAJAX = Class.create();
KeylinesBsmAJAX.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	/*
	* Call to insert a new link
	*/
	insertLink: function() {
		var type = this.getParameter('sysparm_type');
		var parent = this.getParameter('sysparm_parent');
		var child = this.getParameter('sysparm_child');
		var cmdbCiRelGr = this.getRelationshipLink(parent, child, type);
		
		if (cmdbCiRelGr.next()) 
			return;
		else {
			cmdbCiRelGr.type = type;
			cmdbCiRelGr.parent = parent;
			cmdbCiRelGr.child = child;
			return cmdbCiRelGr.insert();
		}
	},
	
	/*
	* Call to delete a link
	*/
	deleteLink: function() {
		var parent = this.getParameter('sysparm_parent');
		var sys_id = this.getParameter('sysparm_sys_id');
		var child = this.getParameter('sysparm_child');
		var parent_desc = this.getParameter('sysparm_parent_value');
		var child_desc = this.getParameter('sysparm_child_value');
		
		// ajax return values 
		var result = this.newItem("result");
		result.setAttribute("link_exists", "false");
		result.setAttribute("type_exists", "false");
		result.setAttribute("parent_descriptor", "");
		result.setAttribute("child_descriptor", "");
		result.setAttribute("delete_return", "");		
		
		// check that this link exists
		var ciRelGr = new GlideRecord('cmdb_rel_ci');
		ciRelGr.get(sys_id);
		
		if (ciRelGr.getRowCount() != 1)
			return result;
		
		result.setAttribute("link_exists", "true");
		
		// check that this relationship type exists
		var relTypeGr = this.getRelationshipType(parent_desc, child_desc);
		if (relTypeGr.getRowCount() != 1)
			return result;
		
		result.setAttribute("type_exists", "true");
		relTypeGr.next();
		
		// Verify that the database and the map link data are still in sync
		if (ciRelGr.parent != parent  || ciRelGr.child != child || ciRelGr.type != relTypeGr.sys_id) {
			result.setAttribute("parent_descriptor", ciRelGr.type.parent_descriptor);
			result.setAttribute("child_descriptor", ciRelGr.type.child_descriptor);
			return result;
		}
		
		var deleteReturn = ciRelGr.deleteRecord();
		result.setAttribute("delete_return", deleteReturn);
	},
	
	/*
	* Call to edit a link
	*/
	editLink: function() {
		var link_id = this.getParameter('sysparm_link_id');
		var old_parent_desc = this.getParameter('sysparm_old_parent_desc');
		var old_child_desc = this.getParameter('sysparm_old_child_desc');
		var parent = this.getParameter('sysparm_parent');
		var child = this.getParameter('sysparm_child');
		var type = this.getParameter('sysparm_type');
		
		// ajax return values 
		var result = this.newItem("result");
		result.setAttribute("link_exists", "false");
		result.setAttribute("type_exists", "false");
		result.setAttribute("parent_descriptor", "");
		result.setAttribute("child_descriptor", "");
		result.setAttribute("sys_id", "");
		
		var ciRelGr = new GlideRecord('cmdb_rel_ci');
		ciRelGr.get(link_id);
		
		// Relationship link not found.  Cannot edit
		if (ciRelGr.getRowCount() != 1)
			return result;
		
		result.setAttribute("link_exists", "true");
		
		// check that this relationship type exists
		var relTypeGr = this.getRelationshipType(old_parent_desc, old_child_desc);
		if (relTypeGr.getRowCount() != 1) 
			return result;

		result.setAttribute("type_exists", "true");
		relTypeGr.next();		
		
		// Verify that the database and the map link data are still in sync
		if (ciRelGr.parent != parent  || ciRelGr.child != child || ciRelGr.type != relTypeGr.sys_id) {
			result.setAttribute("parent_descriptor", ciRelGr.type.parent_descriptor);
			result.setAttribute("child_descriptor", ciRelGr.type.child_descriptor);
			return result;
		}
		
		ciRelGr.type = type;
		var retVal = ciRelGr.update();
		result.setAttribute("sys_id", retVal);
	},
	
	getRelationshipType: function(parent_desc, child_desc) {
		var relTypeGr = new GlideRecord('cmdb_rel_type');
		relTypeGr.addQuery('parent_descriptor', parent_desc);
		relTypeGr.addQuery('child_descriptor', child_desc);
		relTypeGr.orderBy('sys_created_on', true);
		relTypeGr.query();
		return relTypeGr;
	},
	
	getRelationshipLink: function(parent, child, type) {
		var cmdbCiRelGr = new GlideRecord('cmdb_rel_ci');
		cmdbCiRelGr.addQuery('parent', parent);
		cmdbCiRelGr.addQuery('child', child);	
		cmdbCiRelGr.addQuery('type', type);
		cmdbCiRelGr.orderBy('sys_created_on', true);
		cmdbCiRelGr.query();
		return cmdbCiRelGr;
	}
});