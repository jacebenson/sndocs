var DocumentManagementDB = Class.create();

DocumentManagementDB.prototype = {
		
	document_table: "dms_document",
	revision_table: "dms_revision",
	document_revision_table: "dms_document_revision",
	type_table: "dms_type",
	classification_table: "dms_classification",
	audience_table: "dms_audience",
	department_table: "cmn_department",
	document_user_permission: "dms_document_user_permission",
	document_group_permission: "dms_document_group_permission",
	component_table: "dms_component",
	type_workflow_table: "m2m_type_workflow",
	name_component_table: "m2m_name_component",
	attachment_table: "sys_attachment",
	approval_rule_table: "dms_approval_rule",
	approval_rule_user_table: "m2m_approval_rule_user",
	approval_rule_group_table: "m2m_approval_rule_group",
//	document_user_approver_table: "m2m_document_user_approver",
//	document_group_approver_table: "m2m_document_group_approver",
	approval_sequence_table: "approval_sequence",
	
	
		
	initialize: function() {
		this.tableDescriptors = new Array();
	},

	getDocumentById: function(documentId,returnGlideRecord) {
		return this.getById(documentId, this.document_table, returnGlideRecord);
	},
	
	updateDocument: function(document) {

		if(!document.sys_id) 
			gs.log("No sys_id provided");
		
		var documentGR = new GlideRecord(this.document_table);
		documentGR.addQuery("sys_id",document.sys_id);
		documentGR.query();
		if(documentGR.next()){
			this._populateGlideRecordAttributesWithObjectAttributes(documentGR,document);
			documentGR.update();
			return document.sys_id;
		}
		return false;
	},
	
	getRevisionsByDocumentId: function(documentId) {
		var revisions = new Array();
		var revisionGR = new GlideRecord(this.document_revision_table);
		revisionGR.addQuery("document",documentId);
		revisionGR.query();
		while(revisionGR.next()){
			revisions.push(this._createObject(revisionGR));
		}
		return revisions;
	},
	
	updateRevision: function(revision) {
		return this.update(revision, this.document_revision_table);
	},
	
	insertRevision: function(revision) {
		var revisionGR = new GlideRecord(this.document_revision_table);
		this._populateGlideRecordAttributesWithObjectAttributes(revisionGR,revision);
		return revisionGR.insert();
	},
	
	getLatestRevisionByDocument: function(documentId) {
		var revisionGR = new GlideRecord(this.document_revision_table);
		revisionGR.addQuery("document",documentId);
		revisionGR.orderByDesc("sys_created_on");
		revisionGR.query();
		if(revisionGR.next())
			return this._createObject(revisionGR);
		
		return false;
	},
	
	getPublishedRevisionByDocument: function(documentId) {
		var revisionGR = new GlideRecord(this.document_revision_table);
		revisionGR.addQuery("document",documentId);
		revisionGR.addQuery("stage","published");
		revisionGR.orderByDesc("sys_created_on");
		revisionGR.query();
		if(revisionGR.next())
			return this._createObject(revisionGR);

		return false;
	},
	
	deleteRevisionById: function(revisionId) {
		var revisionGR = new GlideRecord(this.document_revision_table);
		revisionGR.addQuery('sys_id',revisionId);
		revisionGR.query();
		if(revisionGR.next())
			revisionGR.deleteRecord();
		
		return false;
	},
	
	deleteRevisionsNotAttachedToDocument: function() {
		var revisionGR = new GlideRecord(this.document_revision_table);
		revisionGR.addNullQuery("document");
		revisionGR.deleteMultiple();
	},
	
	getTypeById: function(typeId) {
		return this.getById(typeId, this.type_table, false);
	},
	
	getClassificationById: function(classificationId) {
		return this.getById(classificationId, this.classification_table, false);
	},
	
	getAudienceById: function(audienceId) {
		return this.getById(audienceId, this.audience_table, false);
	},
	
	getDepartmentById: function(departmentId) {
		return this.getById(departmentId, this.department_table, false);
	},
	
	getRevisionById: function(revisionId,returnGlideRecord) {
		return this.getById(revisionId, this.document_revision_table, returnGlideRecord);
	},
	
	getComponentById: function(componentId) {
		return this.getById(componentId, this.component_table, false);
	},
	
	/**
	 * 
	 * @param string document
	 * @param Array permissions 
	 * @returns boolean
	 */
	doesUserHavePermission: function(permission,document) {
		var userPermsGR = new GlideRecord(this.document_user_permission);
		userPermsGR.addQuery("document",document);	
		userPermsGR.addQuery("user",gs.getUser().getID());
		userPermsGR.addQuery(permission,"true");
		userPermsGR.query();
		if(userPermsGR.next()){
			return true;
		} else {
			var groups = gs.getUser().getMyGroups().toString(); //Java Array transform to string. Still need to remove the brackets
			groups = groups.replace("[","");
			groups = groups.replace("]","");
			var groupPermsGR = new GlideRecord(this.document_group_permission);
			groupPermsGR.addQuery("document",document);
			groupPermsGR.addQuery("group", "IN",groups);
			groupPermsGR.addQuery(permission,"true");
			groupPermsGR.query();
			if(groupPermsGR.next())
				return true;
			else
				return false;
		}
	},
	
	getUserPermissionsByDocumentId: function(documentId) {
		var userPerms = new Array();
		var userPermsGR = new GlideRecord(this.document_user_permission);
		userPermsGR.addQuery("document",documentId);
		userPermsGR.query();
		while(userPermsGR.next()){
			userPerms.push(this._createObject(userPermsGR));
		}
		return userPerms;
	},
	
	getGroupPermissionsByDocumentId: function(documentId) {
		var groupPerms = new Array();
		var groupPermsGR = new GlideRecord(this.document_group_permission);
		groupPermsGR.addQuery("document",documentId);
		groupPermsGR.query();
		while(groupPermsGR.next()){
			groupPerms.push(this._createObject(groupPermsGR));
		}
		return groupPerms;
	},
	
	getWorkflowGRByTypeId: function(typeId){
	    var workflowGR = new GlideRecord(this.type_workflow_table);
	    workflowGR.addQuery("type",typeId);
	    workflowGR.query();
	    if(workflowGR.hasNext())
	    	return workflowGR;
	    
	    return false;
	},
	
	getComponentIdsByNameFormatId: function(nameFormatId) {
		var componentIds = new Array();	
		var nameComponentGR = new GlideRecord(this.name_component_table);
		nameComponentGR.addQuery("name",nameFormatId);
		nameComponentGR.orderBy("order");
		nameComponentGR.query();
		while(nameComponentGR.next()){
			componentIds.push(nameComponentGR.component.toString());
		}
		return componentIds;
	},
	
	/**
	 * Get users from the m2m_approval_rule_user
	 *  
	 * @param Array approvalRuleIds
	 * @returns Array
	 */
	getUserByApprovalRuleIds: function(approvalRuleIds){
		var m2mApprovalRuleUser = new Array();
		var approvalUserGR = new GlideRecord(this.approval_rule_user_table);
		approvalUserGR.addQuery("approval_rule","IN",approvalRuleIds);
		approvalUserGR.query();
		while(approvalUserGR.next()){
			m2mApprovalRuleUser.push(this._createObject(approvalUserGR));
		}
		return m2mApprovalRuleUser;
	},
	
	getApprovers: function(documentId,generatedBy) {
		if(generatedBy && generatedBy!="system" && generatedBy!="user")
			return false;
		var approvers = new Array();
		var approverGR = new GlideRecord(this.approval_sequence_table);
		approverGR.addQuery("document_id",documentId);
		approverGR.addQuery("table_name",this.document_table);
		if(generatedBy) 
			approverGR.addQuery("generated_by", generatedBy);
                approverGR.orderBy('sequence');
		approverGR.query();
		while(approverGR.next()){
			approvers.push(this._createObject(approverGR));
		}
		return approvers;
	},

	/**
	 * Get users from the m2m_approval_rule_user
	 *  
	 * @param Array approvalRuleIds
	 * @returns Array
	 */
	getGroupByApprovalRuleIds: function(approvalRuleIds){
		var m2mApprovalRuleGroup = new Array();
		var approvalGroupGR = new GlideRecord(this.approval_rule_group_table);
		approvalGroupGR.addQuery("approval_rule","IN",approvalRuleIds);
		approvalGroupGR.query();
		while(approvalGroupGR.next()){
			m2mApprovalRuleGroup.push(this._createObject(approvalGroupGR));
		}
		return m2mApprovalRuleGroup;
	},
	
	/**
	 * Generic method that returns all the records of a table. 
	 * Returns GlideRecord if returnGlideRecord is set to true.
	 * 
	 * @param String tablename
	 * @param Boolean returnGlideRecord
	 * @returns Array|GlideRecord
	 */
	getAll: function(tablename,returnGlideRecord) {
		var records = new Array();
		var glideRecord = new GlideRecord(tablename);
		glideRecord.query();
		while(glideRecord.next()){
			if(returnGlideRecord)
				return glideRecord;
			else	
				records.push(this._createObject(glideRecord));
		}
		
		return records;
	},
	
	/**
	 * Generic method that gets a record from a database table (tableName) with the given sysId
	 * returnGlideRecord parameter should be set to true if you want to return a GlideRecord
	 *  
	 * @param String sysId
	 * @param String tableName
	 * @param Boolean returnGlideRecord
	 * @returns GlideRecord|Object
	 */
	getById: function(sysId,tableName,returnGlideRecord) {
		var glideRecord = new GlideRecord(tableName);
		glideRecord.addQuery('sys_id', sysId);
		glideRecord.query();
		if(glideRecord.next()){
			if(returnGlideRecord)
				return glideRecord;
			else	
				return this._createObject(glideRecord);
		}
		
		return false;
	},
	
	/**
	 * Generic function that inserts an record into a table based on the data contained in the object
	 * Object's field must match the table fields 
	 * 
	 * @param Object object
	 * @param String tableName
	 * @returns string|boolean (sys_id|false)
	 */
	insert: function(object,tablename) {
		var insertGR = new GlideRecord(tablename);
		this._populateGlideRecordAttributesWithObjectAttributes(insertGR,object);
		return insertGR.insert();
	},
	
	/**
	 * Generic function that updates an existing record
	 *  
	 * @param Object object
	 * @param String tablename
	 * @returns Boolean|String
	 */
	update: function(object,tablename) {
		
		if(!object.sys_id){
			gs.log("Object does not have sys_id attribute", "DocumentManagementDB.insert()");
			return false;
		}
		
		var updateGR = new GlideRecord(tablename);
		updateGR.addQuery("sys_id",object.sys_id);
		updateGR.query();
		if(updateGR.next()){
			this._populateGlideRecordAttributesWithObjectAttributes(updateGR,object);
			updateGR.update();
			return updateGR.sys_id;
		}
		return false;
		
	},
	
	/**
	 * Method to delete each record of table (tablename) 
	 * that has the value of the field (fieldname) in the array of values
	 * 
	 * @param String tablename
	 * @param String fieldName
	 * @param Array values
	 */
	deleteRecord: function(tablename, fieldName, values) {
		var deleteGR = new GlideRecord(tablename);
		deleteGR.addQuery(fieldName, 'IN', values);
		deleteGR.deleteMultiple();
	},
	
    /**
     * Returns a TableDescriptor Object contained in the tableDescriptor array for a given table name
     * If TableDesciptor is not found for the table, a new one is created, saved in the array and returned
     * 
     * @param String tablename
     * @returns TableDescriptor Object
     */
    _getTableDescriptor: function(tablename) {
    	if(this.tableDescriptors[tablename])
    		return this.tableDescriptors[tablename];

    	this.tableDescriptors[tablename] = new GlideTableDescriptor(tablename);
    	return this.tableDescriptors[tablename];
    },
		
	
    /**
     * Create an record Object from the GlideRecord
     * 
     * @param glideRecord
     * @returns Object
     */
    _createObject: function(glideRecord) {
    	var tableDescriptor = this._getTableDescriptor(glideRecord.getTableName());
    	var fields = this._getFieldNamesFromString(tableDescriptor.getSchema());
    	var object= new Object();
    	object.scriptType = glideRecord.getTableName();
    	for(var i=0; i<fields.length; i++){
    		object[fields[i]] = glideRecord.getValue(fields[i]);
    	}
    	return object;
    },
    
    /**
     * Populate a glide record object's attributes from the object's attributes
     * 
     * @param glideRecord
     * @param object
     * @returns glideRecord
     */
    _populateGlideRecordAttributesWithObjectAttributes: function(glideRecord, object) {
    	var tableDescriptor = this._getTableDescriptor(glideRecord.getTableName());
    	var fields = this._getFieldNamesFromString(tableDescriptor.getSchema());
    	object.scriptType = glideRecord.getTableName();
    	for(var i=0; i<fields.length; i++){
    		if(object[fields[i]])
    			glideRecord.setValue(fields[i],object[fields[i]]);
    		
    	}
    	return glideRecord;
    },
    
    /**
     * Create a array of field names from a string that contains the fields
     * 
     * @param fieldsString ("{field1,field2,....,fieldN}")
     * @returns array
     */
    _getFieldNamesFromString: function(fieldsString) {
    	var fields = new Array();
    	fieldsString = fieldsString.toString().replace("{","");
    	fieldsString = fieldsString.replace("}","");
    	var tmpfields = fieldsString.toString().split(",");
    	for(var i=0; i<tmpfields.length; i++){
    		var fieldNameArray = tmpfields[i].toString().split("=");
    		var fieldName = fieldNameArray[1].toString();
    		fields.push(fieldName);
    	}
    	return fields;
    },
    
    /**
     * Returns an array of all the tables that extends tablename
     * 
     * @param String tablename
     * @returns Array
     */
    getTableExtensions:function(tablename) {
    	var tables = new Array();
    	tables.push(tablename);
    	
    	this.dbo = new GlideDBObjectManager.get();
    	var tableExtensionString = this.dbo.getTableExtensions(tablename);
    	if(tableExtensionString!="[]"){
	    	tableExtensionString = tableExtensionString.toString().replace("[","");
	    	tableExtensionString = tableExtensionString.replace("]","");
	    	tableExtensionString = tableExtensionString.replace(" ","");
	    	var tmpTables = tableExtensionString.split(",");
	    	for(var i=0; i<tmpTables.length; i++){
	    		tables.push(tmpTables[i].toString());
	    	}
    	}
    	
    	return tables;
    }

	
};