var UpdateSetPreviewer = Class.create();

UpdateSetPreviewer.prototype = {
	initialize:function () {
		this._databaseEntries = {};
		this._dictionary = {};
		this._doc = null;
		this._warnings = 0;
		this._errors = 0;
		this._nestedSysIdEntries = {};
		this._tracker = SNC.GlideExecutionTracker.getLastRunning();
		this._updateXmlScopeValidator = null;
	},

	process:function (setId, type) {
		this._tracker.run();
		if (type == "preview") {
			this.generatePreviewRecords(setId);
		}
		else {
			this.generateCollisionRecords(setId);
		}
	},

	previewExists:function (remoteSet) {
		var rus = new GlideRecord('sys_update_preview_xml');
		rus.addQuery('remote_update.remote_update_set', remoteSet);
		rus.query();
		if (rus.next()) {
			return true;
		}

		return false;
	},

	/* Deletes records from sys_update_preview and sys_update_preview_problem
	 for updates in the given remote update set.
	 Uses iterative delete, as opposed to multiple delete, because multiple delete
	 has an issue when used in conjunction with dot-walking.
	 */
	removePreviewRecords:function (remoteSet) {
		var rus = new GlideRecord('sys_update_preview_xml');
		rus.addQuery('remote_update.remote_update_set', remoteSet);
		rus.query();
		while (rus.next()) {
			rus.deleteRecord();
		}

		this._removePreviewProblems(remoteSet);
	},

	_removePreviewProblems:function (remoteSet) {
		var previewProblems = new GlideRecord("sys_update_preview_problem");
		previewProblems.addQuery("remote_update_set", remoteSet);
		previewProblems.deleteMultiple();
		previewProblems.close();
	},

	generatePreviewRecords:function (remoteSet) {
		/*Validate scope*/
		this._validateScope(remoteSet);
		/*Parse and load all dictionary elements from loaded/previewed updatesets*/
		var parser = new DictionaryUpdateParser("stateINloaded,previewed");
		this._dictionary = parser.parse(true);
		var updateCount = 0;
		var rus = new GlideRecord('sys_update_xml');
		rus.addQuery('remote_update_set', remoteSet);
		rus.query();
		while (rus.next()) {
			//PRB613968: If application field is null or empty update its value to 'global
			if (rus.application.isNil()) {
				rus.application = this._updateXmlScopeValidator.getGlobalScopeId();
				rus.update();
			}	
			
			//There is a corner case where the version might need to be coalesced
			//if the file was added between retrieving and previewing.
			new SNC.VersionCoalescerAPI().updateVersionWithCoalescing(rus);

			var document = GlideXMLUtil.parse(rus.payload);
			// PRB665621: null or invalid XML
			if(null == document) {
				// insert a invalid XML problem
				var ppr = new GlidePreviewProblemRecord();
				ppr.setRemoteUpdate(rus);
				ppr.insertInvalidXML(rus.table, rus.name);
				// update the error/warning count
				this._updateErrorWarningCount(ppr);
				continue;
			}
			var doc_first_child = document.getFirstChild();

			if (doc_first_child.getTagName() == "record_update" && !doc_first_child.hasAttribute("table")) {
				this._doc = GlideXMLUtil.newDocument(GlideXMLUtil.getFirstChildElement(doc_first_child));
			} else {
				this._doc = document;
			}

			if (rus.type == "Database field(s)") {
				this._databaseEntry(rus);
			}

			this._scopeValidationResult(rus);
			
			if (rus.action != "DELETE") {  // Don't show warnings on deletes as it is unimportant
				if (rus.type == 'List Layout' || rus.type == 'Form Layout') {
					this._layoutFieldsExists(rus);
				} else {
					if (rus.type == 'Dictionary') {
						this._handleDictionaryEntry(rus);
					} else {
						this._handleTableExists(rus);
					}
					this._allReferencesPresent(rus);
				}
			} else { //If deleting a table, then give warning
				if (rus.type == 'Table') {
					this._handleTableDelete(rus);
				}
			}
			
			updateCount++;
			var counter = 0;
			this._setProgress(updateCount, rus.getRowCount());

			// Check if an existing update for this record already exists
			var us = new GlideRecord('sys_update_xml');
			us.addQuery('name', rus.name);
			us.addNotNullQuery('update_set');
			us.orderByDesc("sys_updated_on");
			us.query();

			var preview;
			while (us.next()) {
				// We do not want to compare with our current remote update set
				if (us.remote_update_set == remoteSet) {
					continue;
				}
				// Initialize the new preview record
				preview = new GlideRecord('sys_update_preview_xml');
				preview.initialize();
				preview.remote_update = rus.sys_id;

				// Set the type to either collision or update
				var updateAction = this._getUpdateAction(rus);
				var updateType = this._getUpdateType(rus, us, this._getUpdateAction(us));
				preview.disposition = updateType + updateAction;
				problemType = this._getPreviewType(rus.sys_id);
				preview.proposed_action = "commit";
				preview.problem_type = problemType;
				preview.local_update = us.sys_id;
				preview.insert();
				counter++;
				break;
			}
			if (counter < 1) {
				// Initialize the new preview record
				preview = new GlideRecord('sys_update_preview_xml');
				preview.initialize();
				preview.remote_update = rus.sys_id;
				preview.disposition = this._getUpdateAction(rus);
				var problemType = this._getPreviewType(rus.sys_id);
				preview.proposed_action = "commit";
				preview.problem_type = problemType;
				preview.insert();
			}
		}

		var message;
		if (this._errors > 0 || this._warnings > 0) {
			var lParams = [ rus.remote_update_set.getDisplayValue(), this._errors.toString(), this._warnings.toString() ];
			message = gs.getMessage("Preview problems for {0}: {1} Errors | {2} Warnings.  To commit this update set you must address all problems.", lParams);
			this._tracker.fail(message);
		} else {
			message = gs.getMessage("Preview successful for {0}. Commit this update set to continue.", [rus.remote_update_set.getDisplayValue()]);
			this._tracker.success(message);
		}

		this._getSummary(remoteSet);
	},

	_validateScope:function (/*String*/ remoteUpdateSetId) {
		this._updateXmlScopeValidator = new SNC.UpdateXmlScopeValidatorWrapper(remoteUpdateSetId, this._tracker);
		this._tracker.updateMessage(gs.getMessage("Validating scope '{0}' for update set '{1}'", [this._updateXmlScopeValidator.getApplicationScope(), this._updateXmlScopeValidator.getUpdateSetName()]));
		//gs.log("Ready to call this._updateXmlScopeValidator.validateScope()", "UpdateSetPreviewer::_validateScope(/*String*/ remoteUpdateSetId).");
		this._updateXmlScopeValidator.validateScope();
		//gs.log("After calling this._updateXmlScopeValidator.validateScope()", "UpdateSetPreviewer::_validateScope(/*String*/ remoteUpdateSetId).");
		this._tracker.updateMessage(gs.getMessage("Finished validating scope '{0}' for update set '{1}'", [this._updateXmlScopeValidator.getApplicationScope(), this._updateXmlScopeValidator.getUpdateSetName()]));
	},

	_scopeValidationResult:function (/*sys_update_xml*/ rus) {
		//check if 'update_xml' record has same scope as 'update set'
		var ppr;
		if (!this._doUpdateSetAndUpdateXmlScopesMatch(rus)) {
			//insert scope validation problem
			ppr = new GlidePreviewProblemRecord();
			ppr.setRemoteUpdate(rus);
			//insert invalid scope update preview problem record
			var reason = gs.getMessage("Cannot commit Update Set '{0}' because: Update scope id '{1}' is different than update set scope id '{2}'. Resolve the problem before committing.",
				[rus.remote_update_set.getDisplayValue(), rus.application, this._updateXmlScopeValidator.getApplication()]);
			ppr.insertInvalidScope(this._updateXmlScopeValidator.getApplicationScope(), rus.sys_id, reason);
			//update the error/warning count
			this._updateErrorWarningCount(ppr);
			this._tracker.updateMessage(gs.getMessage("Failed to validate scope '{0}' for update '{1}'", [this._updateXmlScopeValidator.getApplicationScope(), rus.name]));
			return false;
		}

		if (this._updateXmlScopeValidator.getStatus() == "failed") {
			//insert scope validation problem
			ppr = new GlidePreviewProblemRecord();
			ppr.setRemoteUpdate(rus);
			//insert invalid scope update preview problem record
			ppr.insertInvalidScope(this._updateXmlScopeValidator.getApplicationScope(), rus.sys_id, this._updateXmlScopeValidator.getReason());
			//update the error/warning count
			this._updateErrorWarningCount(ppr);
			this._tracker.updateMessage(gs.getMessage("Failed to validate scope '{0}' for update '{1}'", [this._updateXmlScopeValidator.getApplicationScope(), rus.name]));
			return false;
		}
		this._tracker.updateMessage(gs.getMessage("Successfully validated scope '{0}' for update '{1}'", [this._updateXmlScopeValidator.getApplicationScope(), rus.name]));
		return true;
	},

	_doUpdateSetAndUpdateXmlScopesMatch:function (/*sys_update_xml*/ rus) {
		//If update set scope is not "global" update set and update xml "application" values must match
		if (!this._updateXmlScopeValidator.isScopeGlobal() && rus.application != this._updateXmlScopeValidator.getApplication())
			return false;
		
		//If update set scope is "global" update set scope and update xml scope must match
		if (this._updateXmlScopeValidator.isScopeGlobal() && !this._updateXmlScopeValidator.doUpdateSetAndUpdateXmlScopesMatch(rus.application, rus.payload))
			return false;
		
		return true;
	},
	
	_getPreviewType:function (remote_update) {
		var gr = new GlideRecord("sys_update_preview_problem");
		gr.addQuery("remote_update", remote_update);
		gr.query();
		var type = "";
		while (gr.next()) {
			if (gr.type == "error") {
				return gr.type;
			}
			else if (gr.type == "warning") {
				type = gr.type;
			}
		}
		return type;
	},

	_getUpdateAction:function (rus) {
		var action = rus.action;
		if (action == "UPDATE") {
			return "update";
		}

		if (action == "DELETE" || action == "delete_multiple") {
			return "delete";
		}

		if (action == "INSERT" || action == "INSERT_OR_UPDATE") {
			return "insert";
		}

		return "insert";
	},

	_getProblemDescription:function (updateRecord, element, tableName) {
		if (updateRecord && updateRecord.remote_update_set) {
			return gs.getMessage("Missing item: ") + element + gs.getMessage(" from table ") + tableName + gs.getMessage(" in update set ") + updateRecord.remote_update_set.name;
		}

		return gs.getMessage("Missing item: ") + element + " from table " + tableName;
	},

	generateCollisionRecords:function (keyset) {
		var counter = 1;
		var hashKey = new Packages.java.lang.String(keyset).hashCode();

		// Get/Generate a report number
		var rpt = this._generateReportNumber(hashKey);

		// Remove an existing collision records with the matching report number
		this._removeCollisionRecords(rpt);

		// Create/Refresh Collision Records
		var updateSets = keyset.split(',');
		var dups = new GlideAggregate('sys_update_xml');
		dups.addQuery('update_set', updateSets);
		dups.addAggregate('count', 'name');
		dups.addHaving('count', '>', 1);
		dups.query();
		while (dups.next()) {
			this._setProgressMessage(counter, dups.getRowCount());
			this._createCollisionRecord(dups.name, updateSets, rpt, counter++);
		}

		this._tracker.updateMessage(gs.getMessage("Collision Report {0} created", this._getReportNumber(rpt)));
		return rpt;
	},

	_createCollisionRecord:function (name, updateSets, rpt, counter) {
		for (var s = 0; s < updateSets.length; s++) {
			var us = new GlideRecord('sys_update_xml');
			us.addQuery('name', name);
			us.addQuery('update_set', updateSets[s]);
			us.query();
			if (us.next()) {
				var usc = new GlideRecord('sys_update_collision_xml');
				usc.initialize();
				usc.collision_number = counter;
				usc.report_number = rpt;
				usc.sys_update = us.sys_id;
				usc.insert();
			}
		}
	},

	_removeCollisionRecords:function (rpt) {
		var verify = new GlideRecord('sys_update_collision_xml');
		verify.addQuery('report_number', rpt);
		verify.query();
		verify.deleteMultiple();
	},

	_generateReportNumber:function (hashKey) {
		var cm = new GlideRecord('sys_update_cm');
		cm.addQuery('key_hash', hashKey);
		cm.query();
		if (cm.next()) {
			return cm.sys_id;
		}

		cm.initialize();
		cm.key_hash = hashKey;
		cm.insert();
		return cm.sys_id;
	},

	_getReportNumber:function (rpt) {
		var cm = new GlideRecord('sys_update_cm');
		cm.addQuery('sys_id', rpt);
		cm.query();
		if (cm.next()) {
			return cm.report_number;
		}

		return "";
	},

	_getUpdateType:function (rus, us, updateAction) {
		var rusDate = this._getUpdateDate(rus.payload);
		var usDate = this._getUpdateDate(us.payload);

		/* Deletes at times do not have date attribute so need to check if empty first */
		if (rusDate == '' || usDate == '') {
			return "";
		}
		
		/* If the 2 payloads are the same, then no need to create collision */
		var rusHash = GlideappUpdateVersion.calculatePayloadHash(rus.payload);
		var usHash = GlideappUpdateVersion.calculatePayloadHash(us.payload);
		if (rusHash === usHash)
			return "";

		var ppr;
		if (rusDate < usDate) {
			// Insert a new collision problem
			ppr = new GlidePreviewProblemRecord();
			ppr.setRemoteUpdate(rus);
			ppr.insertCollision(us);
			// update the error/warning count
			this._updateErrorWarningCount(ppr);
			return 'collision_';
		}

		/* We do not change the sys_updated_on time when a delete is done, so when comparing an update by the
		 sys_updated_on, an insert/update can have the exact same time stamp as a Delete.
		 So if a customer creates something in one set and then deletes it in a later set.
		 When both sets are brought over if the Second set is previewed and committed first the delete will not get applied otherwise.
		 Pls see PRB561078 for details */
		if (rusDate == usDate && updateAction == "delete") {
			// Insert a new collision problem
			ppr = new GlidePreviewProblemRecord();
			ppr.setRemoteUpdate(rus);
			ppr.insertCollision(us);
			// update the error/warning count
			this._updateErrorWarningCount(ppr);
			return 'collision_';
		}

		return "";
	},

	_getUpdateDate:function (xml) {
		var newestDate = '';
		var doc = GlideXMLUtil.parse(xml);
		var node = doc.getElementsByTagName('sys_updated_on');
		for (var i = 0; i < node.length; i++) {
			if (node.item(i).hasChildNodes()) {
				var tempDate = node.item(i).getChildNodes().item(0).getNodeValue();
				if (newestDate < tempDate) {
					newestDate = tempDate;
				}
			}
		}
		return newestDate;
	},

	_getSummary:function (remoteSet) {
		var DH = new DiffHelper();
		var inserted = 0;
		var updated = 0;
		var deleted = 0;
		var collisions = 0;
		var gr = new GlideRecord("sys_update_preview_xml");
		gr.query("remote_update.remote_update_set", remoteSet);
		while (gr.next()) {
			gr.diff_available = DH.diffAvailable(gr.remote_update);
			if (gr.disposition.indexOf("insert") != -1) {
				gr.disposition = gr.disposition.substring(0, gr.disposition.indexOf("insert")) + this._dispositionChange(gr.remote_update, gr.diff_available);
			}
			var type = gr.disposition;
			gr.update();
			if (type == "insert") {
				inserted++;
			}
			else if (type == "update") {
				updated++;
			}
			else if (type == "delete") {
				deleted++;
			}
			else if (type.indexOf("collision") != -1 || type == "table_not_found") {
				collisions++;
			}
		}

		gr = new GlideRecord("sys_remote_update_set");
		gr.query("sys_id", remoteSet + '');
		if (gr.next()) {

			gr.inserted = inserted;
			gr.updated = updated;
			gr.deleted = deleted;
			gr.collisions = collisions;
			gr.summary = inserted + deleted + updated + collisions;
			gr.update();
		}
	},

	_dispositionChange:function (gr, available) {
		var doc = GlideXMLUtil.parse(gr.payload);
		var root = doc.getFirstChild();
		if (root.getTagName() == "record_update") {
			root = GlideXMLUtil.getFirstChildElement(root);
		}

		var ei = root;
		var found = false;
		while (ei != null && root.getTagName() != "database") {
			var tableName = ei.getTagName();
			/* Check if its in present in the database or in the update set */
			gr = new GlideRecord(tableName);
			if (gr.isValid() || this._dictionary[tableName] != undefined) {
				found = true;
				break;
			}
			ei = GlideXMLUtil.getFirstChildElement(ei);
		}
		if (!ei || ei.getTagName() != "database" && !found) {
			return "table_not_found";
		}

		var table = ei.getTagName();
		if (this._dictionaryEntry(root) || table == "sys_ui_view" || table == "sys_ui_form_sections" || available) {
			return "update";
		}

		return "insert";
	},

	_dictionaryEntry:function (root) {
		if (root.getTagName() != "sys_dictionary" && root.getTagName() != "sys_documentation") {
			return false;
		}
		var table = root.getAttribute("table");
		var element = root.getAttribute("element");
		for (var i = 0; i < this._databaseEntries[table].length; i++) {
			if (this._databaseEntries[table][i] == element) {
				return true;
			}
		}

		return false;
	},
	_handleDictionaryEntry:function (rus) {
		var hasProblems = false;
		var root = this._doc.getFirstChild();
		var table = root.getAttribute("table");
		var element = root.getAttribute("element");
		var rus_internal_type = '';
		var internal_type = this._doc.getElementsByTagName('internal_type');
		//Each Dictionary entry is a separate sys_update_xml entry
		if (internal_type.item(0).hasChildNodes()) {
			rus_internal_type = internal_type.item(0).getChildNodes().item(0).getNodeValue();
		}

		//Check if it is different from what is in the local sys dict
		var gr = new GlideRecord('sys_dictionary');
		gr.addQuery('name', table);
		gr.addQuery('element', element);
		gr.query();
		if (gr.next()) {
			var payLoad = rus.getValue('payload');
			var previewProblemChecker = new SNC.PreviewProblemChecker(gr,payLoad);
			if(previewProblemChecker !== null && previewProblemChecker.hasInvalidType()) {
				// insert a field type conflict problem
				var ppr = new GlidePreviewProblemRecord();
				ppr.setRemoteUpdate(rus);
				ppr.insertInvalidFieldType(table, element, previewProblemChecker.getErrorMessage());
				// update the error/warning count
				this._updateErrorWarningCount(ppr);
				hasProblems = true;
			}
			if(previewProblemChecker !== null && previewProblemChecker.hasInvalidLength()) {
				var ppr = new GlidePreviewProblemRecord();
				ppr.setRemoteUpdate(rus);
				ppr.insertInvalidFieldLength(table, 'max_length', previewProblemChecker.getErrorMessage());
				this._updateErrorWarningCount(ppr);
				hasProblems = true;
			}
		}

		return hasProblems;

	},

	/*
	 * If deleting a table, then give warning
	 */
	_handleTableDelete:function (rus) {
		var tableName = '';
		var node = this._doc.getElementsByTagName('name');
		//Each Dictionary entry is a separate sys_update_xml entry
		if (node.item(0).hasChildNodes()) {
			tableName = node.item(0).getChildNodes().item(0).getNodeValue();
		}

		/* If no table name found, there is nothing to check */
		if (tableName.isNil())
			return false;

		/* Check if table is present. If not we aren't deleting anything, so it is fine. */
		gr = new GlideRecord(tableName);
		if (!gr.isValid()) {
			return false;
		}

		/*just return 1 record to see if there is data or not.  If no data, then do not need
		a warning to delete an empty table. */
		gr.setLimit(1);
		gr.query();
		if (!gr.next())
			return false;

		// insert a field type conflict problem
		var ppr = new GlidePreviewProblemRecord();
		ppr.setRemoteUpdate(rus);
		ppr.insertDeletingTable(tableName, rus.name);
		// update the error/warning count
		this._updateErrorWarningCount(ppr);

		return true;
	},

	/*
	 * Check to make sure table exists
	 */
	_handleTableExists:function (rus) {
		var ei = this._doc.getFirstChild();
		var tableName;
		if (ei.hasAttribute("table")) {
			tableName = ei.getAttribute("table");
		} else {
			tableName = ei.getTagName();
		}

		//old dictionary format.  Creating table so this check is unnecessary.
		//Choices can be used by other tables, so the table not existing is fine.
		if (tableName == "database" || ei.getTagName() == "sys_choice") {
			return false;
		}

		/* Check if its in present in the database or in the update set */
		gr = new GlideRecord(tableName);
		if (gr.isValid() || this._dictionary[tableName] != undefined) {
			return false;
		}

		// insert a field type conflict problem
		var ppr = new GlidePreviewProblemRecord();
		ppr.setRemoteUpdate(rus);
		ppr.insertMissingTable(tableName, rus.name);
		// update the error/warning count
		this._updateErrorWarningCount(ppr);

		return true;
	},

	_databaseEntry:function (rus) {
		var hasProblems = false;
		var element = GlideXMLUtil.getFirstChildElement(this._doc.getFirstChild());
		var table = element.getAttribute("name");
		var innerElements = element.getChildNodes();
		for (var i = 0; i < innerElements.getLength(); i++) {
			element = innerElements.item(i);
			var name = element.getAttribute("name");
			var type = element.getAttribute("type");
			var td = GlideTableDescriptor.get(table);
			if (td.isValidField(name)) {
				var ed = td.getElementDescriptor(name);
				if (type != ed.getInternalType()) {
					// insert a field type conflict problem
					var ppr = new GlidePreviewProblemRecord();
					ppr.setRemoteUpdate(rus);
					ppr.insertFieldTypeConflict(table, name, ed.getInternalType(), type);
					// update the error/warning count
					this._updateErrorWarningCount(ppr);
					hasProblems = true;
					continue;
				}
			}
			if (this._databaseEntries[table] == null) {
				this._databaseEntries[table] = [];
			}
			this._databaseEntries[table].push(name);
		}
		return hasProblems;
	},

	_setProgressMessage:function (updateCount, totalCount) {
		if (totalCount < 2) {
			this._tracker.updateMessage(gs.getMessage("Comparing update {0} of {1} update",
				[updateCount.toString(), totalCount.toString()]));
		} else {
			this._tracker.updateMessage(gs.getMessage("Comparing update {0} of {1} updates",
				[updateCount.toString(), totalCount.toString()]));
		}
	},


	/************************************************************************************************************************************************************************************************
	 *
	 *    Update Preview Reference Checking Code
	 *
	 ************************************************************************************************************************************************************************************************/


	/*
	 * Check reference fields to make sure that all references are present
	 * either in the update set or on the current system
	 * return a warning message if not
	 */
	_allReferencesPresent:function (rus) {
		var table = this._doc.getFirstChild().getAttribute("table");
		if (!table) {
			return true;
		}

		var td = GlideTableDescriptor.get(table);
		var root = this._doc.getFirstChild();
		var firstChild = GlideXMLUtil.getFirstChildElement(root);
		if (firstChild) {
			root = firstChild;
		}
		var elements = root.getChildNodes();
		var updateSetParent = rus.remote_update_set;
		this._populateNestedSysIdInUpdateSet(updateSetParent);
		return this._hasReferenceProblems(elements, td, rus);
	},

	_hasReferenceProblems:function (elements, td, rus) {
		var hasProblems = false;
		var remoteSysUpdatePayLoad = rus.payload.toString();
		for (var i = 0; i < elements.length; i++) {
			var element = elements.item(i);

			if (!element.getFirstChild()) {
				continue;
			}
			var value = element.getFirstChild().getNodeValue();
			if (value.length() != 32) {
				continue;
			}

			var ed = td.getElementDescriptor(element.getTagName());
			if (!ed || !ed.isReference() || this._checkForSysIdInPayload(value, remoteSysUpdatePayLoad) || this._ignoredTag(td.getName(), element.getTagName())) {
				continue;
			}

			/* PRB574705: Ensure that we do not do the reference check for the pseudo-domain called 'global'
			 Check both sys_domain (domain_id) and sys_overrides (reference) fields */
			if (value.indexOf("global") == 0 && (ed.getInternalType() == "domain_id" || ed.getInternalType() == "reference")) {
				continue;
			}

			var refTable = ed.getReference();
			/* Check if the reference is already present in the System */
			if (GlideUpdateSetPreviewer.updateOnSystem(element, td.getName(), value)) {
				continue;
			}

			/*If we get a sys_app_file reference, we will ignore here because
			 sys app files are generated only after committing updates with different sys ids.*/
			if (refTable == 'sys_app_file') {
				continue;
			}

			// ignore if refTable has a coalesce strategy
			if (SNC.CoalesceStrategies.hasCoalesceStrategy(refTable)) {
				continue;
			}

			/*if the refTable is sys_dictionary, use the map we already built */
			if (refTable == 'sys_dictionary') {
				/* if the reference is present in the loaded updatesets. This call also creates problems if needed*/
				hasProblems = this._handleElementInUpdateSets(refTable, value, rus);
			} else {
				// get the uncommitted remote update record that matches either the actual update name or the default update name
				var missingRemoteUpdate = this._getUpdateFromLoaded(refTable, value);
				// if retrieved a valid record, set the missing remote update id or null if an update record was not found
				var missingItemUpdate = missingRemoteUpdate.isValidRecord() ? missingRemoteUpdate.sys_id : null;

				if (missingItemUpdate != null && missingRemoteUpdate.remote_update_set == rus.remote_update_set) {
					continue;
				}

				// insert missing reference problem
				var ppr = new GlidePreviewProblemRecord();
				ppr.setRemoteUpdate(rus);
				ppr.insertMissingReference(refTable, value, missingItemUpdate);
				// update the error/warning count
				this._updateErrorWarningCount(ppr);
				hasProblems = true;
			}
		}
		return hasProblems;
	},

	/* Checks if the reference record is present in any of the remote update sets that are not in the committed state.
	 This  method also takes of a scenario if the record is record is referencing a base table and actual unloaded
	 record in the updateset is one of its children.
	 */
	_getUpdateFromLoaded:function (refTable, value) {
		/* Check if this element is added to any of the tables in the hierarchy in update sets */
		var tableList = GlideDBObjectManager.get().getAllExtensions(refTable);
		for (var i = 0; i < tableList.size(); i++) {
			var tName = tableList.get(i);
			var updateName = this._getUpdateName(tName, value);
			if (!updateName) {
				continue;
			}

			var missingRemoteUpdate = this._getUncommittedRemoteUpdate("name", updateName);
			//if it finds an update then return from this method
			if (missingRemoteUpdate.isValidRecord()) {
				return missingRemoteUpdate;
			}
		}

		return new GlideRecord("sys_update_xml");
	},

	_ignoredTag:function (tableName, tagName) {
		return  (tableName == "wf_workflow_version" && tagName == "start");
	},

	/* Given a nodelist, this function returns value of a particular node by its tag */
	_getValueFromNodeList:function (elements, tagName) {
		if (elements != null) {
			for (var i = 0; i < elements.length; i++) {
				var element = elements.item(i);
				if (element.getTagName() == tagName) {
					if (element.getFirstChild()) {
						return element.getFirstChild().getNodeValue();
					}
				}
			}
		}
		return null;
	},

	/*
	 * Populates a map of all the nested sys ids from the workflow version payloads in
	 * the update set
	 */
	_populateNestedSysIdInUpdateSet:function (updateSetParent) {

		var gr = new GlideRecord('sys_update_xml');
		gr.addQuery('remote_update_set', updateSetParent);
		gr.addQuery('name', 'STARTSWITH', 'wf_workflow');
		gr.query();
		while (gr.next()) {
			var ndocument = GlideXMLUtil.parse(gr.payload);
			var nestedNodeList = ndocument.getElementsByTagName('sys_id');
			for (var n = 0; n < nestedNodeList.length; n++) {
				var nestedNode = nestedNodeList.item(n);
				var nestedSysId = nestedNode.getFirstChild().getNodeValue();
				this._nestedSysIdEntries[nestedSysId] = '1';
			}

		}
	},


	/*
	 * If the GUID sysid is in the same payload or in another payload in the same update set then assume,
	 * the reference is referring to the not yet stored entry.
	 *
	 * returns: True if given sysId is found in the remoteSysUpdatePayLoad
	 *   as a sys id for another entity; false otherwise.
	 */
	_checkForSysIdInPayload:function (sysId, remoteSysUpdatePayLoad) {
		var sysIdElementStr = '<sys_id>' + sysId + '</sys_id>';

		if (remoteSysUpdatePayLoad.indexOf(sysIdElementStr) >= 0) {
			return true;
		}

		return this._nestedSysIdEntries[sysId] == '1';
	},


	/*
	 * Check list and form layouts and makes sure that all the items in the layout
	 * is either on the system or in the update set
	 */
	_layoutFieldsExists:function (rus) {
		var tableName = this._doc.getFirstChild().getAttribute("table");
		var node = this._doc.getElementsByTagName('element');

		for (var i = 0; i < node.length; i++) {
			if (node.item(i).hasChildNodes()) {
				var element = node.item(i).getChildNodes().item(0).getNodeValue() + "";

				/* Ignore type which is formatter, annotation, or split etc */
				var typeNode = node.item(i).parentNode.getElementsByTagName('type').item(0);
				if (typeNode != null && typeNode.textContent != "") {
					continue;
				}

				/* Ignore sysids and any dotwalk reference fields for example number_ref.prefix etc */
				if (element.indexOf(".") != -1 || GlideStringUtil.isEligibleSysID(element) || GlideSysField.isAuto(element)) {
					continue;
				}

				/* Check if the database if the element belongs to this tables or its parents */
				var gr = new GlideRecord(tableName);
				if (gr.isValid() && gr.isValidField(element)) {
					continue;
				}

				/* Check if any of the loaded/previewed update sets have it */
				this._handleElementInUpdateSets(tableName, element, rus);
			}
		}
	},

	/**
	 * Checks if the element is present in the updateset in a given table
	 *  or in it's parents.  If it finds, it returns update record for that.
	 */
	_findElementInUpdateSet:function (tableName, element) {
		var dict = this._dictionary[tableName];

		/* if table has no elements in loaded updatesets, check if
		 any of its parents are there */

		if (dict == undefined) {
			/* Gets the parent table name for a given table */
			var parentTableName = GlideDBObjectManager.get().getBase(tableName);
			if (parentTableName == tableName) { /*if no parent found, it returns its own name */
				return null;
			}
			return this._findElementInUpdateSet(parentTableName, element);
		}

		if (dict.columns[element] != undefined) {
			return { foundInDB:false, column:dict.columns[element]};
		} else {
			/* Table might have been extended from an existing one*/
			var gr = new GlideRecord(tableName);
			if (gr.isValid() && gr.isValidField(element)) {
				return { foundInDB:true, column:null };
			}
			/* Check if this element is added to any of the tables in the hierarchy in update sets */
			var tableList = GlideDBObjectManager.get().getHierarchy(tableName);
			for (var i = 0; i < tableList.size(); i++) {
				var tName = tableList.get(i);
				if (tableName != tName) {
					var tDict = this._dictionary[tName];
					if (tDict != undefined && tDict.columns[element] != undefined) {
						return { foundInDB:false, column:tDict.columns[element]};
					}
				}
			}
		}

		if (dict.parent == undefined) {
			return null;
		}
		/* Check if its parent has it */
		return this._findElementInUpdateSet(dict.parent.name, element);
	},

	/** Given a tablename and a column name, it checks if they are present in
	 * the generated table map from updateset entries
	 * Returns true if errors/warnings are found.
	 */
	_handleElementInUpdateSets:function (tableName, element, rus) {

		/* Check if any of the loaded/previewed update sets have it */
		var columnFound = this._findElementInUpdateSet(tableName, element);
		var ppr;
		if (columnFound == null) {
			// insert a missing field problem
			ppr = new GlidePreviewProblemRecord();
			ppr.setRemoteUpdate(rus);
			ppr.insertMissingField(tableName, element, null);
			// update the error/warning count
			this._updateErrorWarningCount(ppr);
			return false;
		}

		if (columnFound.foundInDB == true) {
			return true;
		}

		// column found but not in DB, so if in an uncommited remote update set that is not this remote update set, then create a problem
		var missingRemoteUpdate = this._getUncommittedRemoteUpdate("sys_id", columnFound.column.updateId);
		var missingItemUpdate = missingRemoteUpdate.isValidRecord() ? missingRemoteUpdate.sys_id : null;
		var isWarning = missingItemUpdate != null && missingRemoteUpdate.remote_update_set != rus.remote_update_set;

		if (isWarning) {
			// insert a missing field problem
			ppr = new GlidePreviewProblemRecord();
			ppr.setRemoteUpdate(rus);
			ppr.insertMissingField(tableName, element, missingItemUpdate);
			// update the error/warning count
			this._updateErrorWarningCount(ppr);
			return false;
		}
	},

	/*
	 * Check to see if the reference we are looking for is in a update set, based on the name value pair.
	 * If no value is provided, return and empty glide record, otherwise return the valid glide record
	 */
	_getUncommittedRemoteUpdate:function (name, value) {
		if (!value) {
			return new GlideRecord("sys_update_xml");
		}

		var gr = new GlideRecord("sys_update_xml");
		gr.addQuery(name, value);
		gr.addQuery("action", "!=", "DELETE").addOrCondition("action", "");
		gr.addNotNullQuery("remote_update_set"); // ensure only remote update sets are selected
		gr.addQuery("remote_update_set.state", "!=", "committed");
		gr.query();
		gr.next();
		return gr;
	},

	_getUpdateName:function (tableName, element) {
		if (tableName == "sys_dictionary") {
			return "sys_dictionary_" + tableName + "_" + element;
		}

		if (tableName == "sys_ui_form" || tableName == "sys_ui_form_section") {
			return "sys_ui_form_sections_" + element;
		}

		// attempt to generate the default update name from the tableName and value
		// if not applicable then this API will return null
		return new GlideUpdateManager2().getDefaultUpdateName(tableName, element);
	},

	_updateErrorWarningCount:function (ppr) {
		var problemType = ppr.getValue('type');
		this._errors += problemType == 'error' ? 1 : 0;
		this._warnings += problemType == 'warning' ? 1 : 0;
	}
};