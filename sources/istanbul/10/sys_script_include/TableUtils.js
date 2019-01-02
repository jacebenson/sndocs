gs.include("PrototypeServer");

var TableUtils = Class.create();
TableUtils.prototype = {
	
	initialize: function (tableName) {
		this.tableName = tableName;
	},
	
	canStage: function () {
		if (!GlidePluginManager.isRegistered('com.glideapp.staged_tables')) {
			return false;
		}
		
		if (new StagingEngine().isStaged(this.tableName)) {
			return false;
		}
		
		return true;
	},
	
	drop: function (tableName) {
		this.tableName = tableName;
		this._dropFromDatabase();
	},
	
	tableExists: function () {
		return this.tableName && gs.tableExists(this.tableName);
	},
	
	isValidField: function (fieldName) {
		var td = new GlideTableDescriptor(this.tableName);
		return (td != null && td.isValidField(fieldName));
	},
	
	createClassField: function (tableName, scopeId) {
		if (!this.isSoloClass(tableName)) {
			return;
		}
		
		SncTableEditor.createElement(tableName, "Class", "sys_class_name", "sys_class_name", "80", "", 
									 "javascript:current.getTableName();", scopeId);
		
		// give all existing records the base class
		var gr = new GlideRecord(tableName);
		gr.setValue("sys_class_name", tableName);
		gr.setWorkflow(false);
		gr.updateMultiple();
		
		return tableName;
	},
	
	_dropFromDatabase: function () {
		gs.dropTable(this.tableName);
	},
	
	dropAndClean: function (tableName) {
		new TableDrop().drop(tableName);
	},
	
	dropTableAndExtensions: function (tableName) {
		var tables = GlideDBObjectManager.get().getTableExtensions(tableName);
		for (var i = 0; i < tables.size(); i++) {
			this.dropAndClean(tables.get(i));
		}
		
		this.dropAndClean(tableName);
	},
	
	/*
 	* Function to truncate table names to adhere to the database restrictions.
 	* We limit all of the physical table names to 80 characters.  
	* So, truncate and log any table names that get shortened.
 	* Also change table name to lowercase and alphanumeric and underscores for database.
 	*/
	sanitizeTableName: function (tableName) {
		return SNC.TableEditor.sanitizeTableName(tableName);
	},
	
	/*
 	* Function to change table name to lowercase, prefix with u_ or the passed application scope
	 * for custom tables, and to adhere to the database restrictions.
	 */
	getValidTableName: function (sys_scope, tableName) {
		if (typeof tableName == 'undefined') { // function was called wi only 1 arg, must be tableName
			return SNC.TableEditor.getValidTableName(sys_scope);
		} else
			return SNC.TableEditor.getValidScopedTableName(sys_scope, tableName);
	},

	/**
 	* Called during dynamic creation of a table from a non-extent reference field value.
	
 	* @param current the table record to be created
 	* @param value the value provided in the reference field to be set as the label of the new table
 	* @param parent the dictionary field record with the dynamic reference
 	* @param grandparent the sys_db_object table record of the dictionary field
 	*/
	createTableFromDynamicReference: function (current, value, parent, grandparent, scopeParam) {
		// Catch the case where by hook or by crook, the reference field holds the display value of an existing table.  We
		// do not want to create a new table with the same label as an existing table.  Not from the dynamic reference, anyway.
		var existing = new GlideRecord('sys_db_object');
		existing.query('label', value);
		if (existing.next()) {
			var existingName = existing.name.toString();
			if (existingName.startsWith('imp_') && existing.next())
				existingName = existing.name.toString();
			gs.log("Found existing table with label " + value + ". Using " + existingName + " instead of creating a new one.");
			return existingName;			
		}		
		
		var scope = current.sys_scope.toString();
		if (!scope && typeof parent != "undefined" && parent != null) {
			scope = parent.sys_scope.toString();
			current.sys_scope = scope;
		}
		if (!scope && typeof grandparent != "undefined" && grandparent != null) {
			scope = grandparent.sys_scope.toString();
			current.sys_scope = scope;
		}

		// First, make sure we are not referencing ourself.
		
		var newName = this.getValidTableName(scope, value);

		if (typeof grandparent != "undefined" && grandparent != null) {
			var gscope = grandparent.sys_scope.toString();
			var grandparentName = this.getValidTableName(gscope, grandparent.name || grandparent.label);
			if (grandparentName == newName) {
				// We are referencing ourself, so flee
				return newName;
			}
		}
		
		// Next, make sure we did not already create this table in this transaction
		var gr = new GlideRecord(newName);
		if (gr.isValid()) {
			return newName;
		}
		
		current.label = value;
		
		// setup module metadata so a module will be created when current table is inserted if the original
		// table has a module.  If so, then both module's will be assigned to the same menu.
		// Also sets up user user role metadata to ensure the ACLs are autocreated as expected
		this.setUpModuleAndUserRoleForDynamicReferenceTableCreate(current, parent, grandparent, newName);
		
		current.insert();
		
		var msg = gs.getMessage("Created new table named {0}.", current.getDisplayValue());
		var link =
		" <a href=\"#\" onclick=\"var url = new GlideURL('sys_db_object.do');"
		+ " url.addParam('sys_id', '" + current.sys_id + "');"
		+ " var frame = top.gsft_main;"
		+ "	if (!frame) frame = top;"
		+ " frame.location = url.getURL();\">"
		+ gs.getMessage("Click here to view it")
		+ "</a>";
		
		gs.addInfoMessage(msg + link);
		
		return newName;
	},
	
	/**
	 * This is only be called by the method above, with current.sys_scope already set.
	 *
	 * Sets up necessary metadata to create a module when the dynamic refernce table is created only
 	* if the original table itself has a module.  If the original table has a module the new table
 	* will have a module in the same menu.
 	*
 	* Furthermore, sets the dyanmic table (current) with the same "create_access_controls" and "user_role" settings as its base table
 	*
 	* @param current the table record to be created
 	* @param parent the dictionary field record with the dynamic reference
 	* @param grandparent the sys_db_object table record of the dictionary field
 	* @param newTableName the valid table name of the dynamic table being created
 	*/
	setUpModuleAndUserRoleForDynamicReferenceTableCreate: function (current, parent, grandparent, newTableName) {
		// grandparent is set if dynamic table create is initiated during the
		// insert/edit of a sys_db_object table record via the table editor;
		// however, we are only concerned when grandparent is being inserted
		var validGrandparent = typeof grandparent != 'undefined' && grandparent != null && !grandparent.nil() && grandparent.getTableName() == 'sys_db_object';
		var app = current.sys_scope;

		if (validGrandparent && grandparent.operation() == 'insert') {
			// currently creating sys_db_object table record (grandparent)
			// so see what menu its module is going to be assigned to
			var menu = SNC.TableEditor.getSelectedMenu(grandparent);
			if (menu != null) {
				// found menu so create a module for new dynamic table assigned to the same menu
				SNC.TableEditor.setTableModule(newTableName, true, menu, app);
			}
			// now lets set current's create_access_controls and user role the same as the grandparent
			current.create_access_controls = grandparent.create_access_controls;
			current.user_role = grandparent.user_role;
		} else {
			// check if original table is assigned a module
			var tableName = !parent.name.nil() ? parent.name.toString() : (validGrandparent ? grandparent.name.toString() : null);
			if (tableName != null) {
				var moduleRecord = new GlideRecord('sys_app_module');
				moduleRecord.addQuery('name', tableName);
				moduleRecord.query();
				if (moduleRecord.next()) {
					// original table has a module, so create module for this new dynamic table with the same menu
					SNC.TableEditor.setTableModule(newTableName, true, moduleRecord.application.toString(), app);
				}
				// retrieve the base table and assign current its create_access_controls and user_role setting
				var tableRecord = validGrandparent ? grandparent : new GlideRecord('sys_db_object');
				if(!tableRecord.isValidRecord() && tableName != null) {
					tableRecord.addQuery('name', tableName);
					tableRecord.query();
					tableRecord.next();
				}
				if(tableRecord.isValidRecord()) {
					// we found a valid base table so lets use it
					current.create_access_controls = tableRecord.create_access_controls;
					current.user_role = tableRecord.user_role;
				}
			}
		}
	},
	
	/*
 	* Return an array of table names in the table parent hierarchy
 	* @return ArrayList
 	*/
	getTables: function () {
		return GlideDBObjectManager.get().getTables(this.tableName);
	},
	
	/*
 	* Return an array of table extensions
 	* @return ArrayList
 	*/
	getTableExtensions: function () {
		return GlideDBObjectManager.get().getTableExtensions(this.tableName);
	},
	
	/*
 	* Return an array of table extensions, includes base table
 	* @return ArrayList
 	*/
	getAllExtensions: function () {
		return GlideDBObjectManager.get().getAllExtensions(this.tableName);
	},
	
	/**
 	* given a class (like cmdb_ci_server), recurse up the tree until we find our root class
 	* e.g. cmdb_ci
 	* @return String
 	*/
	getAbsoluteBase: function () {
		return GlideDBObjectManager.get().getAbsoluteBase(this.tableName);
	},
	
	/**
 	* Returns a list of all classes participating in the hierarchy of the given table.
 	* For example, given cmdb_ci_netgear this method will return cmdb_ci, cmdb_ci_netgear,
 	* cmdb_ci_ip_router, and cmdb_ci_ip_switch.
 	* @return List
 	*/
	getHierarchy: function () {
		return GlideDBObjectManager.get().getHierarchy(this.tableName);
	},
	
	/**
 	* returns true if the given object has extensions e.g. task has extensions, but incident does not
 	* @return Boolean
 	*/
	hasExtensions: function () {
		return GlideDBObjectManager.get().hasExtensions(this.tableName);
	},
	
	/**
 	* Returns true if the given class has no parents and has extensions. Thus "task" is a base
 	* class (since it has no parents but does have extensions), but sys_user is not (since it
 	* has no parents, but does not have extensions).
 	* @return Boolean
 	*/
	isBaseClass: function () {
		return GlideDBObjectManager.get().isBaseClass(this.tableName);
	},
	
	/**
 	* Returns true if the given class has no parents and no extensions.  Thus "task" is not a
 	* solo class, but "sys_user" is.
 	* @return Boolean
 	*/
	isSoloClass: function () {
		return GlideDBObjectManager.get().isSoloClass(this.tableName);
	},
	
	/**
 	* For tables in a tree (TPC) structure, use this method to cleanup any potential orphaned rows
 	* before dropping a table. For flattened tables (TPH) this method is a no-op.
 	*/
	cleanHierarchicalData: function(tableName) {
		if (!tableName)
			return;
            
		GlideTableCleanupAPI.cleanupHierarchicalData(tableName);
	},
	
	_z: function () {
		return "TableUtils";
	}
	
};
