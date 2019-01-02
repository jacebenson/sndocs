var DocumentManagement = Class.create();

//document states
DocumentManagement.draft = "draft"; 
DocumentManagement.active = "active";
DocumentManagement.inactive = "inactive";
DocumentManagement.cancelled = "cancelled";

//Prefix given to a given document
DocumentManagement.prefix_copy = "Copy ";

//revisions stages
DocumentManagement.awaiting_review = "awaiting_review";
DocumentManagement.published = "published";
DocumentManagement.retired = "retired";
DocumentManagement.rejected = "rejected";
DocumentManagement.approved = "approved";


DocumentManagement.prototype = {
	initialize : function() {
		this.documentManagementDB = new DocumentManagementDB();
	},

	generateRevisionName : function(documentId) {
		var document = this.documentManagementDB.getDocumentById(documentId,true);

		var revisionName = "";

		var separator = document.name_format.separator;
		var components = this.documentManagementDB.getComponentIdsByNameFormatId(document.name_format);

		for ( var i = 0; i < components.length; i++) {
			component = this.documentManagementDB.getComponentById(components[i]);
			if (component.value == "revision") {
				revisionName += this.getNextRevisionNumber(documentId);
			} else if (component.value.indexOf("document") >= 0) {
				revisionName += eval(component.value);
			}

			if (i < (components.length - 1)) 
				revisionName += separator;
		}

		return revisionName;

	},

	getNextRevisionNumber : function(documentId) {
		var document = this.documentManagementDB.getDocumentById(documentId,true);
		var latestRevision = this.documentManagementDB.getLatestRevisionByDocument(documentId);

		if (!document.auto_increment_revision && latestRevision)
			return latestRevision.revision_number;

		if (latestRevision) {
			var revisionNumberArray = latestRevision.revision_number.split(".");
			if(parseInt(revisionNumberArray[(revisionNumberArray.length - 1)]) >= 9){
				revisionNumberArray[(revisionNumberArray.length - 1)] = 0;
				if(parseInt(revisionNumberArray[(revisionNumberArray.length - 2)]) >= 9 && revisionNumberArray.length == 3){
					revisionNumberArray[(revisionNumberArray.length - 2)] = 0;
					revisionNumberArray[(revisionNumberArray.length - 3)] = parseInt(revisionNumberArray[(revisionNumberArray.length - 3)])+ 1;
				} else{		
			    	revisionNumberArray[(revisionNumberArray.length - 2)] = parseInt(revisionNumberArray[(revisionNumberArray.length - 2)]) + 1 ;			   		  
			}
			} else{
				revisionNumberArray[(revisionNumberArray.length - 1)] = parseInt(revisionNumberArray[(revisionNumberArray.length - 1)]) + 1;
			}
			var dot = "";
			var nextRevisionNumber = "";
			for ( var i = 0; i < revisionNumberArray.length; i++) {
				if (i > 0)
					dot = ".";
				nextRevisionNumber += dot + revisionNumberArray[i];
			}
			return nextRevisionNumber;
		}
		return document.revision_format;
	},

	checkOutDocument : function(documentId, revisionId, userId) {
		var document = this.documentManagementDB.getDocumentById(documentId);
		if (!document.checked_out_by) {
			document.checked_out_by = userId;
			this.documentManagementDB.updateDocument(document);
			this.checkOutRevision(revisionId, userId);
			return true;
		}
		return false;
	},

	checkInDocument : function(revisionObject, userId) {
		var documentGR = this.documentManagementDB.getDocumentById(revisionObject.document, true);
		if ((documentGR.checked_out_by == userId)|| gs.getUser().hasRole("document_management_admin")) {
			documentGR.setValue("checked_out_by", "NULL");
			documentGR.update();
			this.clearRevisionsCheckedOutByField(revisionObject.document, userId);
			return true;
		}
		return false;
	},

	checkOutRevision : function(revisionId, userId) {
		var revision = this.documentManagementDB.getRevisionById(revisionId);
		revision.checked_out_by = userId;
		this.documentManagementDB.updateRevision(revision);
		return true;
	},

	clearRevisionsCheckedOutByField : function(documentId) {
		var revisions = this.documentManagementDB.getRevisionsByDocumentId(documentId);
		for ( var i = 0; i < revisions.length; i++) {
			var currentRevision = revisions[i];
			if (currentRevision.checked_out_by) {
				currentRevision.checked_out_by = "NULL";
				this.documentManagementDB.updateRevision(currentRevision);
			}
		}
	},

	copyDocument : function(sourceDocumentId) {
		var sourceDocumentGR = this.documentManagementDB.getDocumentById(sourceDocumentId, true);
		sourceDocumentGR.sys_id = null;
		sourceDocumentGR.number = getNextObjNumberPadded();
		sourceDocumentGR.name = DocumentManagement.prefix_copy + sourceDocumentGR.name;
		sourceDocumentGR.state = this.draft;
		sourceDocumentGR.checked_out_by = null;
		newDocumentId = sourceDocumentGR.insert();
	    
		if (newDocumentId) {
			var sourceDocumentLatestRevision = this.documentManagementDB.getLatestRevisionByDocument(sourceDocumentId);

			var revision = new Object();
			revision.name = sourceDocumentLatestRevision.name;
			revision.revision = sourceDocumentLatestRevision.revision;
			revision.document = newDocumentId;
			revision.revision_number = sourceDocumentLatestRevision.revision_number;
			revision.note = sourceDocumentLatestRevision.note;

			revision.sys_id = this.documentManagementDB.insertRevision(revision);

			GlideSysAttachment.copy(
					this.documentManagementDB.document_revision_table,
					sourceDocumentLatestRevision.sys_id,
					this.documentManagementDB.document_revision_table,
					revision.sys_id);
			
			var attch  = new GlideRecord("sys_attachment");
			attch.addQuery("table_sys_id", revision.sys_id);
			attch.addQuery("table_name",this.documentManagementDB.document_revision_table);
			attch.query();
			attch.next();
			revision.attachment = attch.getValue("sys_id");
			this.documentManagementDB.updateRevision(revision);
			
			return newDocumentId;
		}
		
		return false;
	},

	publishRevision : function(revisionId) {
		
		var workflow = new Workflow();
		
		var revision = this.documentManagementDB.getRevisionById(revisionId);
		revision.stage = "published";
		this.documentManagementDB.updateRevision(revision);
		 
		var revisions = this.documentManagementDB.getRevisionsByDocumentId(revision.document);
		
		for(var i=0; i<revisions.length; i++){
			if(revisions[i].sys_id == revision.sys_id)
				continue;
			
			var revisionGR = this.documentManagementDB.getRevisionById(revisions[i].sys_id, true);
			workflow.cancel(revisionGR);
			
			revisionGR.setValue("stage",DocumentManagement.retired);
			revisionGR.update();
		}
	},
	
	

	type : "DocumentManagement"
};

DocumentManagement.canRevisionBeSubmitted = function(documentGR) {
	if(documentGR.stage=="draft" && (documentGR.checked_out_by=="" || documentGR.checked_out_by==gs.getUserID()))
		return true;
	return false;
};

DocumentManagement.doesDocumentHavePublishedRevision = function(documentId) {
	var db = new DocumentManagementDB();
	var revision = db.getPublishedRevisionByDocument(documentId);
	if (revision)
		return true;
	else
		return false;
};

DocumentManagement.doesDocumentHaveRevision = function(documentId) {
	var db = new DocumentManagementDB();
	var revisions = db.getRevisionsByDocumentId(documentId);
	if (revisions.length>0)
		return true;
	else
		return false;
};

DocumentManagement.isLatestRevision = function(revisionId, documentId) {
	var db = new DocumentManagementDB();
	var latestRevision = db.getLatestRevisionByDocument(documentId);
	if (latestRevision.sys_id == revisionId)
		return true;
	else
		return false;
};