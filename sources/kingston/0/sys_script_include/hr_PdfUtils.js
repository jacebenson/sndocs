var hr_PdfUtils = Class.create();
hr_PdfUtils.prototype = {
	initialize: function() {},

	isFillable: function(dmsDocumentRevisionSysId) {
		var isPdfFillable = false;
		var sysAttachment = new GlideSysAttachment();
		var attachmentGR = sysAttachment.getAttachments('dms_document_revision', dmsDocumentRevisionSysId);
		var pdfUtils = new global.GeneralPdfUtils();
		if (attachmentGR.next())
			isPdfFillable = pdfUtils.isFillable(attachmentGR.sys_id);

		return isPdfFillable;
	},

	preview : function(pdfTemplateRevisionSysId) {
		return this.prefillPdf(pdfTemplateRevisionSysId, true, null, null, null);
	},

	prefillPdf: function(pdfTemplateRevisionSysId, isPreview, caseSysId, targetTable, targetTableSysId) {
		if (gs.nil(pdfTemplateRevisionSysId))
			return null;
		
		var pdfDocRevisionGR = new GlideRecord('sn_hr_core_pdf_template');
		pdfDocRevisionGR.get(pdfTemplateRevisionSysId);
		
		var forTaskAsignee = false;
		
		if (targetTable == hr.TABLE_TASK) {
			var taskGr = new GlideRecord(targetTable);
			taskGr.get(targetTableSysId);
			caseSysId = taskGr.parent;
			forTaskAsignee = true;
		}

		var map = this._getMapping(pdfTemplateRevisionSysId, isPreview, caseSysId);
		var originalAttachmentSysId = this._getOriginalAttachment(pdfDocRevisionGR);

		var mapString = JSON.stringify(map);
		var pdfName = "";
		var tableName = "";
		var sysId = "";
		var attachment;
		//if previewed then newly created pdf can be attached to pdf document revision else
		//if viewed by end user then it should be attached to pdf_draft table
		if (isPreview) {
			pdfName = "preview";
			tableName = "sn_hr_core_pdf_template";
			sysId = pdfTemplateRevisionSysId;
			//Remove existing preview pdfs before creating a new one
			new global.HRSecurityUtils().removeSysAttachmentRecords(tableName, pdfTemplateRevisionSysId);
		} else {
			pdfName = pdfDocRevisionGR.name;
			// If the current pdf draft has a associated signature image and an attachment
			// then the sysid of the attachment would be used to prefillpdf
			// New Pdf draft would be created only if target table does not have the associated pdf draft and
			// the original document revision would be used to pre fill pdf
			// task Assignee will be using the existing pdf draft but the ownership of the
			// current pdf draft would be changed
			tableName = "pdf_draft";
			var currentPdfDraft = this._getPdfDraft(targetTable, targetTableSysId);
			if (!gs.nil(currentPdfDraft)) {
				currentPdfDraft.setValue('user', gs.getUserID());
				currentPdfDraft.setValue('table', targetTable);
				currentPdfDraft.setValue('active', true);
				currentPdfDraft.setValue('document', targetTableSysId);
				currentPdfDraft.update();
				var signatures = this._getSignatureImageGR(targetTable, targetTableSysId, false);
				attachment = this.getAttachmentGR('pdf_draft', currentPdfDraft.getUniqueValue());
				if (!gs.nil(signatures) && !gs.nil(attachment))
					originalAttachmentSysId = attachment.getUniqueValue();
				sysId = currentPdfDraft.getUniqueValue();
			} else {
				var pdfDraft = new GlideRecord('pdf_draft');
				pdfDraft.setValue('user', gs.getUserID());
				pdfDraft.setValue('table', targetTable);
				pdfDraft.setValue('active', true);
				pdfDraft.setValue('document', targetTableSysId);
				var pdfSysId = pdfDraft.insert();
				sysId = pdfSysId;
			}
		}
		var pdfUtils = new global.GeneralPdfUtils();
		if (forTaskAsignee && !gs.nil(attachment))
			return attachment.getUniqueValue();
		else {
			var editedAttachmentSysId = pdfUtils.prefillPdf(mapString, sysId, originalAttachmentSysId, tableName, pdfName + '.pdf');
			//remove older attachment from pdf draft
			if (!gs.nil(attachment))
				new global.HRSecurityUtils().removeSysAttachmentsBySysId(attachment.getUniqueValue());
			return editedAttachmentSysId;
		}
	},
	
	/*
	 * Get GlideRecord by sys_id or use query
	 * @param tablel - @string table name
	 * @param sys_id - @string sys_id of table
	 * @param query - @object {prop: value}
	 */
	_getGlideRecord: function (table, sys_id) {
		var gr = new GlideRecord(table);
		
		return function (query) {			
			if (sys_id) 
				gr.get(sys_id);
			else {
				gr.addActiveQuery();
				
				Object.keys(query).map(function(q) {
					gr.addQuery(q, query[q]);
				});
				
				gr.query();
			}
			
			return gr;
		};
	},
	
	/*
	 * Method to offset date by days, weeks, months, and redefine date format
	 * @param dmgr: "sn_hr_core_pdf_template_mapping" glide record
	 */
	_dateOffset: function (dmgr) {
		
		var dateOffsetType = dmgr.getValue("date_offset_type");
		var dateOffsetUnits = dmgr.getValue("date_offset_units");
		var dateOffsetQuantity = dmgr.getValue("date_offset_quantity");
		var sysDateFormat = gs.getProperty("glide.sys.date_format");
		
		var selectDateFormat = dmgr.getValue("select_date_format") || sysDateFormat;
		var specificDateFormat = dmgr.getValue("specific_date_format") || selectDateFormat;
		
		var sysUserGr = this._getGlideRecord('sys_user', gs.getUserID())();
		
		/* 
		 * Using closure to access private variable and expose private functions
		 * @param ge: dmgr.mapping_field element of dmgr.mapping_table glide record
		 */
		return function (ge) {
			return {
				regex: {
					before: /^(before)$/i,
					beforeAfter: /^(before|after)$/i,
					dateFormat: /[M|d]{2}|y{4}/g,
					firstLetter: /^(\w)/,
					notLetter: /\W|_/g,
					notNum: /\D/g,
					other: /other/i,
					units: /^(days|weeks|months)$/i,
					type: /^(date|glide_date|glide_date_time)$/i
				},
				
				// returns the internalType as string
				internalType: function () {
					var glideMappingTable = new GlideRecord(dmgr.mapping_table);
					return glideMappingTable.getElement(dmgr.mapping_field).getED().getInternalType();
				},

				// return amount to multiply quantity by
				getOffsetDirection: function () {
					// if not before or after, return 0
					if (!this.regex.beforeAfter.test(dateOffsetType))
						return 0;

					// -1 will subtract from date, 1 will add
					return this.regex.before.test(dateOffsetType) ? -1 : 1;
				},

				// @param dv: Date string
				setDateFormat: function (dv) {
					
					var sysUserDateFormatArr = sysUserGr.date_format || sysDateFormat;
					var specificUserDateFormatArr = specificDateFormat.split(this.regex.notLetter);
					
					// if user didn't include a seperator, split by match
					if (specificUserDateFormatArr.length < 2)
						specificUserDateFormatArr = specificDateFormat.match(this.regex.dateFormat);
					
					var dateFormatSpecialChar = specificDateFormat.match(this.regex.notLetter);
					var dvArr = dv.split(this.regex.notNum);
					var formattedDv = "";
					
					sysUserDateFormatArr = sysUserDateFormatArr.split(this.regex.notLetter);

					/* 
					 * construct a new date format by iterating through specific_date_format
					 * and grabbing the index of the actual date using the default date format
					 * e.g. MM[0]/dd[1]/yyyy[2] => dd[1]/MM[0]/yyyy[2]
					 */				  
					specificUserDateFormatArr.map(function (o, i) {
						formattedDv += dvArr[sysUserDateFormatArr.indexOf(o)];
						if (dateFormatSpecialChar && dateFormatSpecialChar[i])
							formattedDv += dateFormatSpecialChar[i];
					});
					
					return formattedDv;
				},

				// Calculate and return the offset GlideDate string value
				offsetValue: function () {	
					if (!ge.getDisplayValue())
						return "";

					var glideDateTime = new GlideDateTime();
					glideDateTime.setDisplayValue(ge.getDisplayValue());

					// check for isNaN to ensure data quality
					if (!isNaN(dateOffsetQuantity) && this.regex.units.test(dateOffsetUnits)) {
						var offsetAmount = this.getOffsetDirection() * dateOffsetQuantity;

						// capitalize the unit - 'days' to 'Days' for method name. i.e. 'addDaysLocalTime'
						var capitalizedUnit = dateOffsetUnits.replace(this.regex.firstLetter, dateOffsetUnits.charAt(0).toUpperCase());
						glideDateTime['add' + capitalizedUnit + 'LocalTime'](offsetAmount);
					}
					
					var gdtLocalDateValue = glideDateTime.getLocalDate().getDisplayValue();

					if (this.regex.other.test(selectDateFormat))
						return this.setDateFormat(gdtLocalDateValue);
					
					return gdtLocalDateValue;
				}
			};
		};
	},

	_getMapping: function(pdfTemplateRevisionSysId, isPreview, caseSysId) {

		var documentMapGR = this._getGlideRecord('sn_hr_core_pdf_template_mapping')({
			"document": pdfTemplateRevisionSysId
		});

		// object to return
		var map = {};
		
		while (documentMapGR.next()) {
			var key = documentMapGR.getValue('document_field');
			var value = "";

			if (isPreview && !gs.nil(documentMapGR.getValue('preview_value')))
				value = documentMapGR.getValue('preview_value');

			else if (!gs.nil(documentMapGR.mapping_table) && !gs.nil(documentMapGR.mapping_field) && !documentMapGR.use_signing_date) {
				var gr = new GlideRecord(documentMapGR.mapping_table);

				if (gr.get(caseSysId)) {
					if (!gs.nil(documentMapGR.mapping_field)) {
						var ge = gr.getElement(documentMapGR.mapping_field);
						var offsets = this._dateOffset(documentMapGR)(ge);
						
						value = !gs.nil(ge) ? ge.getDisplayValue() : "";

						if (documentMapGR.advanced_script_toggle)
							value = this._evaluateTemplateMapping(documentMapGR, gr, value);

						// if internal type is date/glide_date/glide_date_time, check for and apply the date offset
						else if (offsets.regex.type.test(offsets.internalType()))
							value = offsets.offsetValue();

					} else if (this._isNonTextField(documentMapGR))
						value = this._evaluateTemplateMapping(documentMapGR, gr, value);
				}
			}

			map[key] = value || "";
		}

		return map;
	},

	_isNonTextField: function(documentMapGR) {
		return (documentMapGR.document_field_type == 'checkbox') || (documentMapGR.document_field_type == 'radio');
	},

	_evaluateTemplateMapping : function(documentMapGr, caseGr, mappingField) {
		var evaluator = new GlideScopedEvaluator();
		evaluator.putVariable("caseGr", caseGr);
		evaluator.putVariable("mappingField", mappingField);
		return evaluator.evaluateScript(documentMapGr, "script", null);
	},

	mergeSignatureImageToPdf : function(docTableName, docTableSysId, pdfDraftSysId, pdfFileName, generateDocument) {
		var attachmentGR = this.getAttachmentGR('pdf_draft', pdfDraftSysId);
		//resolve if docTable is task get the parent document for filtering
		var document;
		if (docTableName == hr.TABLE_TASK) {
			var hrTask = new GlideRecord(docTableName);
			hrTask.get(docTableSysId);
			document = new GlideRecord(hrTask.parent.sys_class_name);
			document.get(hrTask.parent.sys_id);
		} else {
			document = new GlideRecord(docTableName);
			document.get(docTableSysId);
		}
		var signatureImage = this._getSignatureImageGR(docTableName, docTableSysId, true);
		var list = this._getMappingInfoList(document.pdf_template.sys_id);
		var isAllSignaturesCollected = false;
		var sysId = '';
		var jsonArrayString = '';
		var validatorJson = {};
		validatorJson.generateDocument = generateDocument;
		if (!generateDocument && !gs.nil(signatureImage)) {
			//filter the signature info list mapping with the mapped users
			var filteredList = this._filterSignatureMappingBasedOnSignedUser(document, list, signatureImage.getValue('user'));
			var filteredDateList = this._filterDateMappingBasedOnSignedUser(document, list, signatureImage);
			var mappingInfoJson = {};
			mappingInfoJson["signatureMapping"] = filteredList;
			mappingInfoJson["dateMapping"] = filteredDateList;

			jsonArrayString = JSON.stringify(mappingInfoJson);
			//this json will contain signature image sys id and generate document param ,
			// based on this param API will either generate document or maintain the pdf_draft attachments
			if (!gs.nil(signatureImage))
				validatorJson.signatureImageSysId = signatureImage.getUniqueValue();
			else
				validatorJson.signatureImageSysId = "";

			// find whether all signatures has been collected for the document
			isAllSignaturesCollected = this._allSignaturesCollected(docTableName, docTableSysId, document, list);
		}

		if (!validatorJson.signatureImageSysId)
			validatorJson.signatureImageSysId = "";

		if (!validatorJson.isAllSignaturesCollected)
			validatorJson.isAllSignaturesCollected = isAllSignaturesCollected;

		var jsonStr = JSON.stringify(validatorJson);

		var pdfUtils = new global.GeneralPdfUtils();
		if (generateDocument || isAllSignaturesCollected)
			sysId = pdfUtils.mergeImageToPdf(docTableName, docTableSysId, jsonArrayString, attachmentGR.getUniqueValue(), pdfFileName + '.pdf', jsonStr);
		else {
			sysId = pdfUtils.mergeImageToPdf("pdf_draft", pdfDraftSysId, jsonArrayString, attachmentGR.getUniqueValue(), pdfFileName + '.pdf', jsonStr);
			//remove older attachment from pdf draft only when not generating document
			new global.HRSecurityUtils().removeSysAttachmentsBySysId(attachmentGR.getUniqueValue());
		}
		return sysId;
	},

	_filterSignatureMappingBasedOnSignedUser : function(document, signatureMappingList, signedUser) {
		var filteredSignatureMapping = [];
		for (var i = 0; i < signatureMappingList.length; i++) {
			var signatureMapping = signatureMappingList[i];
			if (!gs.nil(signatureMapping.mappingField) && !signatureMapping.useSigningDate) {
				var ge = document.getElement(signatureMapping.mappingField);
				if (!gs.nil(ge) && ge.toString() == signedUser)
					filteredSignatureMapping.push(signatureMapping);
			}
		}
		return filteredSignatureMapping;
	},

	_filterDateMappingBasedOnSignedUser : function(document, mappingList, signatureImage) {
		var filteredDateMapping = [];
		for (var i=0, max=mappingList.length; i < max; i++) {
			var mapping = mappingList[i];
			if (mapping.useSigningDate){
				var ge = document.getElement(mapping.mappingField);
				if (!gs.nil(ge) && ge.toString() == signatureImage.getValue('user')) {
					var dateMappingJson = {};
					
					dateMappingJson.fieldName = mapping.documentField;
					
					var pdfTemplateGR = this._getGlideRecord('sn_hr_core_pdf_template_mapping')({
						"document": document.pdf_template.sys_id,
						"document_field": dateMappingJson.fieldName
					});
					var signDateOffset = this._dateOffset(pdfTemplateGR)(signatureImage.signed_on);
					
					// ensure parsing the time by user's tz and format
					dateMappingJson.signedOnDate = signDateOffset.offsetValue();
					
					//add format value to json
					filteredDateMapping.push(dateMappingJson);
				}
			}
		}
		return filteredDateMapping;
	},

	_allSignaturesCollected : function(docTableName, docTableSysId, document, signatureMappingList) {
		//get signature for all signatures under the document
		var usersSignatureList = this._getSignatureUsersList(docTableName, docTableSysId);
		// signatures are collected if user as per the mapping
		// should have the signature in signature_image table
		var isAllSignaturesCollected = true;
		for (var i = 0; i < signatureMappingList.length; i++) {
			var signatureMapping = signatureMappingList[i];
			if (signatureMapping.useSigningDate)
				continue;
			if (gs.nil(signatureMapping.mappingField))
				continue;
			var ge = document.getElement(signatureMapping.mappingField);
			if (gs.nil(ge))
				isAllSignaturesCollected =  false;
			var usersStr = usersSignatureList.toString();
			if (usersStr.indexOf(ge.toString()) < 0)
				isAllSignaturesCollected = false;
		}
		return isAllSignaturesCollected;
	},

	/*
		Get the latest signature image Record for teh document.
	*/
	_getSignatureUsersList : function(tableName, tableSysId) {
		var userArray = [];
		if (tableName == hr.TABLE_TASK){
			var grTask = new GlideRecord(tableName);
			grTask.get(tableSysId);
			//first fecth is signature Image Exists For Parent
			var sigImageFromParent = this._getSignatureImage(grTask.parent.sys_class_name, grTask.parent.sys_id, false);
			if (!gs.nil(sigImageFromParent))
				userArray.push(sigImageFromParent.user.sys_id);

			var tasks = new GlideRecord(grTask.sys_class_name);
			tasks.addQuery('parent', grTask.parent.sys_id);
			tasks.addQuery('hr_task_type','sign_document');
			tasks.query();
			while (tasks.next()) {
				var sigImageFromTask =  this._getSignatureImage(tasks.sys_class_name, tasks.sys_id, false);
				if(!gs.nil(sigImageFromTask))
					userArray.push(sigImageFromTask.user.sys_id);
			}
		} else {
			//first fetch it from the HR Case
			var sigImageFromCase =  this._getSignatureImage(tableName, tableSysId, false);
			if (!gs.nil(sigImageFromCase))
				userArray.push(sigImageFromCase.user.sys_id);

			var childTask = new GlideRecord(hr.TABLE_TASK);
			childTask.addQuery('parent', tableSysId);
			childTask.addQuery('hr_task_type','sign_document');
			childTask.query();
			while (childTask.next()) {
				var sigImageFromChild =  this._getSignatureImage(childTask.sys_class_name, childTask.sys_id, false);
				if (!gs.nil(sigImageFromChild))
					userArray.push(sigImageFromChild.user.sys_id);
			}
		}
		return userArray;
	},

	/*
		Get the latest signature image Record for teh document.
	*/
	_getSignatureImageGR : function(tableName, tableSysId, queryForUser){
		if (tableName == hr.TABLE_TASK){
			var grTask = new GlideRecord(tableName);
			grTask.get(tableSysId);
			//first fecth is signature Image Exists For Parent
			var sigImageFromParent = this._getSignatureImage(grTask.parent.sys_class_name, grTask.parent.sys_id, queryForUser);
			if (gs.nil(sigImageFromParent)){
				var tasks = new GlideRecord(grTask.sys_class_name);
				tasks.addQuery('parent', grTask.parent.sys_id);
				tasks.addQuery('hr_task_type','sign_document');
				tasks.query();
				while (tasks.next()) {
					var sigImageFromTask =  this._getSignatureImage(tasks.sys_class_name, tasks.sys_id, queryForUser);
					if(!gs.nil(sigImageFromTask))
						return sigImageFromTask;
				}
			} else
				return sigImageFromParent;
		} else {
			//first fetch it from the HR Case
			var sigImageFromCase =  this._getSignatureImage(tableName, tableSysId, queryForUser);
			if (gs.nil(sigImageFromCase)){
				var childTask = new GlideRecord(hr.TABLE_TASK);
				childTask.addQuery('parent', tableSysId);
				childTask.addQuery('hr_task_type','sign_document');
				childTask.query();
				while (childTask.next()) {
					var sigImageFromChild =  this._getSignatureImage(childTask.sys_class_name, childTask.sys_id, queryForUser);
					if (!gs.nil(sigImageFromChild))
						return sigImageFromChild;
				}
			} else
				return sigImageFromCase;
		}
		return null;
	},

	_getSignatureImage : function(tableName, tableSysId, queryForUser){
		var signatureGR = new GlideRecord("signature_image");
		signatureGR.addQuery("document", tableSysId);
		signatureGR.addQuery("table", tableName);
		if (queryForUser)
			signatureGR.addQuery("user", gs.getUserID());
		signatureGR.orderByDesc("sys_updated_on");
		signatureGR.addActiveQuery();
		signatureGR.query();
		if (signatureGR.next())
			return signatureGR;
		return null;
	},

	_getOriginalAttachment: function(pdfDocumentRevisionGR) {
		var dmsDocumentSysId = pdfDocumentRevisionGR.getValue('document_revision');
		var dmsDocumentRevisionGR = new GlideRecord('dms_document_revision');
		dmsDocumentRevisionGR.get(dmsDocumentSysId);
		return dmsDocumentRevisionGR.getValue('attachment');
	},

	createDocumentMap: function(pdfTemplateRevisionSysId, dmsDocumentRevisionSysId) {
		var attachment = this.getAttachmentGR('dms_document_revision', dmsDocumentRevisionSysId);
		var documentSysId = '';
		if (!gs.nil(attachment)) {
			documentSysId = attachment.sys_id;
			var jsonString = this.getPdfFields(documentSysId);
			var propertiesString = this._getFieldType(documentSysId);
			var properties = JSON.parse(propertiesString);
			var fields = JSON.parse(jsonString);
			var fieldProperty;
			for (var f in fields)  {
				fieldProperty = JSON.parse(properties[f]);
				var id = this._createDocumentMapHelper(pdfTemplateRevisionSysId, f, fieldProperty);
			}
		}
	},

	getAttachmentGR: function(tableName, sysId) {
		var attachments = new GlideRecord('sys_attachment');
		attachments.addQuery('table_name', tableName);
		attachments.addQuery('table_sys_id', sysId);
		attachments.orderByDesc('sys_updated_on');
		attachments.query();
		return attachments.next() ? attachments : null;
	},

	_createDocumentMapHelper: function(document, document_field, fieldProperty) {
		var fieldLabel = document_field.substring(document_field.lastIndexOf('.') + 1, document_field.length);
		var gr = new GlideRecord('sn_hr_core_pdf_template_mapping');

		gr.document_field_type = this._getDocFieldType(fieldProperty.field_type);
		gr.document_field = document_field;
		gr.document_field_label= fieldLabel;

		if (fieldProperty['field_type'] == 2)
			if (fieldProperty.true_value)
				gr.true_value = fieldProperty.true_value.slice(1,-1);

		gr.preview_value = fieldLabel.substring(0, fieldLabel.indexOf("["));
		gr.document=document;
		var id = gr.insert();
		return id;
	},
	
	_removeExistingDocuments: function(tableName, recordSysId) {
		var sysAttachment = new GlideSysAttachment();
		var attachmentGR = sysAttachment.getAttachments(tableName, recordSysId);
		while (attachmentGR.next())
			attachmentGR.deleteRecord();
	},
	
	_getDocFieldType: function(type) {
		if (type == 2)
			return 'checkbox';
		if (type == 3)
			return 'radio';
		if (type == 6)
			return 'combo';

		return 'text';
	},
	
	containsDocumentMap: function(pdfDocumentSysId){
		var documentMapGR = new GlideRecord('sn_hr_core_pdf_template_mapping');
		documentMapGR.addQuery('document', pdfDocumentSysId);
		documentMapGR.addQuery('document_field_type', "!=", 'signature');
		documentMapGR.query();
		return documentMapGR.hasNext();
	},

	getPdfFields: function(attachmentSysId) {
		var jsonString = new global.GeneralPdfUtils().getPDFFields(attachmentSysId);
		return jsonString;
	},

	_getFieldType: function(attachmentSysId) {
		var jsonString = new global.GeneralPdfUtils().getFieldType(attachmentSysId);
		return jsonString;
	},

	/*
		Condition if document can be generated and signature image can be merged.
	*/
	isValidPdfTemplate : function(documentTableName, documentSysId){
		var pdfTemplate = this._getPdfTemplate(documentTableName, documentSysId);
		if (gs.nil(pdfTemplate) || gs.nil(pdfTemplate.document_revision))
			return false;
		return !gs.nil(this._getPdfDraft(documentTableName, documentSysId)) ? true : false;
	},

	/*
		Condition if the template has a pdf document revision,
		then it can be prefilled.
	*/
	isValidPdfTemplateForPreFill : function(pdfTemplateSysId){
		var pdfTemplate = new GlideRecord("sn_hr_core_pdf_template");
		pdfTemplate.get(pdfTemplateSysId);
		if (!gs.nil(pdfTemplate) && !gs.nil(pdfTemplate.document_revision))
			return true;
		return false;
	},

	/*
		Return PDF template associated with the table based
		on condition if the table is child task or HR Case.
	*/
	_getPdfTemplate : function(documentTableName, documentSysId){
		var pdfSysId = null;
		if (documentTableName == hr.TABLE_TASK) {
			var task = new GlideRecord(documentTableName);
			task.get(documentSysId);
			pdfSysId = task.parent.pdf_template.sys_id;
		} else {
			var hrcase = new GlideRecord(documentTableName);
			hrcase.get(documentSysId);
			pdfSysId = hrcase.pdf_template.sys_id;
		}
		if (!pdfSysId)
			return null;
		var pdfTemplate = new GlideRecord("sn_hr_core_pdf_template");
		pdfTemplate.get(pdfSysId);
		return pdfTemplate;
	},

	/**
		Uses the logic to retrieve the correct pdf_draft for the document or the child task beneath the document
	**/
	_getPdfDraft: function(tableName, tableSysId){
		if (tableName == hr.TABLE_TASK) {
			var grTask = new GlideRecord(tableName);
			grTask.get(tableSysId);
			//first fetch is signature Image Exists For Parent
			var pdfDraftFromParent = this._getPdfDraftRecord(grTask.parent.sys_class_name, grTask.parent.sys_id);
			if (gs.nil(pdfDraftFromParent)) {
				var tasks = new GlideRecord(grTask.sys_class_name);
				tasks.addQuery('parent', grTask.parent.sys_id);
				tasks.query();
				while (tasks.next()) {
					var pdfDraftFromTask =  this._getPdfDraftRecord(tasks.sys_class_name, tasks.sys_id);
					if (!gs.nil(pdfDraftFromTask))
						return pdfDraftFromTask;
				}
			} else
				return pdfDraftFromParent;
		} else {
			//first fetch it from the HR Case
			var pdfDraftFromCase =  this._getPdfDraftRecord(tableName, tableSysId);
			if (gs.nil(pdfDraftFromCase)) {
				var childTask = new GlideRecord(hr.TABLE_TASK);
				childTask.addQuery('parent', tableSysId);
				childTask.query();
				while (childTask.next()) {
					var pdfDraftFromChild =  this._getPdfDraftRecord(childTask.sys_class_name, childTask.sys_id);
					if (!gs.nil(pdfDraftFromChild))
						return pdfDraftFromChild;
				}
			} else
				return pdfDraftFromCase;
		}
		return null;
	},

	_getPdfDraftRecord : function(tableName, tableSysId){
		var pdfDraft = new GlideRecord('pdf_draft');
		pdfDraft.addQuery('table', tableName);
		pdfDraft.addQuery('document', tableSysId);
		pdfDraft.query();
		return pdfDraft.next() ? pdfDraft : null;
	},

	/*
		Public api that merge signature_image for the
		passed table with the associated pdf template.
	*/
	createPdfForDocument : function(tableName, tableSysId, generateDocument){
		var pdfDraft = this._getPdfDraft(tableName, tableSysId);
		var pdfTemplate = this._getPdfTemplate(tableName, tableSysId);
		var pdfName = pdfTemplate.name + " - " + gs.getUserDisplayName();
		var response = this.mergeSignatureImageToPdf(tableName, tableSysId, pdfDraft.getUniqueValue(), pdfName, generateDocument);
		return response;
	},

	/*
		Public Api to be used for the pdf document revision template
		if the case need to be prefilled with the mapping.
	*/
	prefillPdfTemplate : function(pdfTemplateRevisionSysId, isPreview, caseSysId, targetTable, targetTableSysId){
		if (gs.nil(pdfTemplateRevisionSysId) || gs.nil(caseSysId) || gs.nil(targetTable) || gs.nil(targetTableSysId)) {
			gs.addErrorMessage(gs.getMessage('PDF template parameters are empty'));
			return;
		}
		var previewSysId = this.prefillPdf(pdfTemplateRevisionSysId, isPreview, caseSysId, targetTable, targetTableSysId);
		return previewSysId;
	},

	/*
		Iterates through all Mapping associated with the documentRevisionSysId and filter the one having
		field type as signature.
	*/
	_getMappingInfoList: function(pdfTemplateSysId) {
		var list = [];
		var pdfDocumentRevGR = new GlideRecord("sn_hr_core_pdf_template");
		if (!pdfDocumentRevGR.get(pdfTemplateSysId))
			return list;

		var documentMap = new GlideRecord("sn_hr_core_pdf_template_mapping");
		documentMap.addQuery("document", pdfDocumentRevGR.getUniqueValue());
		documentMap.query();
		while (documentMap.next()) {
			//not to include the mapping if inactive
			if (!documentMap.active)
				continue;

			if (documentMap.getValue("document_field_type") == "signature" || documentMap.use_signing_date) {
				var mappingInfo = {};
				mappingInfo.pageNumber = parseInt(documentMap.getValue("page_number"));
				mappingInfo.docTop = parseInt(documentMap.getValue("doc_top"));
				mappingInfo.docLeft = parseInt(documentMap.getValue("doc_left"));
				mappingInfo.signTop = parseInt(documentMap.getValue("sign_top"));
				mappingInfo.signLeft = parseInt(documentMap.getValue("sign_left"));
				mappingInfo.boxHeight = parseInt(documentMap.getValue("box_height"));
				mappingInfo.boxWidth = parseInt(documentMap.getValue("box_width"));
				mappingInfo.mappingField = documentMap.getValue("mapping_field");
				if (documentMap.use_signing_date) {
					mappingInfo.useSigningDate = documentMap.getValue("use_signing_date");
					mappingInfo.documentField = documentMap.getValue("document_field");
					//
				}
				list.push(mappingInfo);
			}
		}
		return list;
	},

	type: 'hr_PdfUtils'
};