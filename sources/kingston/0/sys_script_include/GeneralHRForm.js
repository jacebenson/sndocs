/**
 * Utility to generate a PDF from a template
 * @param table, table id, target table, target id
 */

var GeneralHRForm = Class.create();

GeneralHRForm.prototype = {
	initialize : function(tableName, tableId, targetTable, targetId, isPortalcontent) {
		
		/*
			REGEX:
			    /                                -     begin regex
				\${                              -     string starting with
				([a-zA-Z0-9_.]+)                 -     field name can contain 1 (+ at the end) or more
				(&nbsp;|&ensp;|&emsp;|\s|\t)*    -     zero or more combination of non-breaking space, en space, em space, space, or tab
				(\-|\+){1}                       -     exactly one occurence of either (-) or (+)
				(&nbsp;|&ensp;|&emsp;|\s|\t)*    -     zero or more combination of non-breaking space, en space, em space, space, or tab
				(\d{1,4})                        -     1 to 4 number long co-efficient for the offset
				([wdm]{1})                       -     exactly one occurence of w(week), d(day) or m(month)
				(&nbsp;|&ensp;|&emsp;|\s|\t)*    -     zero or more combination of non-breaking space, en space, em space, space, or tab
				}                                -     ending with
				/                                -     end regex
		*/
		
		this.ALL_FIELD_REGEX = /\${([a-zA-Z0-9_.]+)(&nbsp;|&ensp;|&emsp;|\s|\t)*([\-|\+]{1})(&nbsp;|&ensp;|&emsp;|\s|\t)*(\d{1,4})([wdm]{1})(&nbsp;|&ensp;|&emsp;|\s|\t)*}/;
		
		
				/*
			REGEX:
			    /                                -     begin regex
				\${                              -     string starting with
				(Date)                           -     current date 'Date'field 
				(&nbsp;|&ensp;|&emsp;|\s|\t)*    -     zero or more combination of non-breaking space, en space, em space, space, or tab
				(\-|\+){1}                       -     exactly one occurence of either (-) or (+)
				(&nbsp;|&ensp;|&emsp;|\s|\t)*    -     zero or more combination of non-breaking space, en space, em space, space, or tab
				(\d{1,4})                        -     1 to 4 number long co-efficient for the offset
				([wdm]{1})                       -     exactly one occurence of w(week), d(day) or m(month)
				(&nbsp;|&ensp;|&emsp;|\s|\t)*    -     zero or more combination of non-breaking space, en space, em space, space, or tab
				}                                -     ending with
				/                                -     end regex
		*/
		
		this.CURRENT_DATE_REGEX = /\${(Date)(&nbsp;|&ensp;|&emsp;|\s|\t)*([\-|\+]{1})(&nbsp;|&ensp;|&emsp;|\s|\t)*(\d{1,4})([wdm]{1})(&nbsp;|&ensp;|&emsp;|\s|\t)*}/;
		
		/* 
			Globally search for current date with offset 
		*/
		
		this.ALL_CURRENT_DATE_REGEX = /\${(Date)(&nbsp;|&ensp;|&emsp;|\s|\t)*([\-|\+]{1})(&nbsp;|&ensp;|&emsp;|\s|\t)*(\d{1,4})([wdm]{1})(&nbsp;|&ensp;|&emsp;|\s|\t)*}/g;
		
		this.tableId = tableId;
		this.tableName = tableName;
		if (this.tableName == hr.TABLE_TASK) {
			var gr = new GlideRecord(this.tableName);
			gr.get(this.tableId);
			this.parent = gr.parent.getRefRecord();
			if (!this.parent) {
				gs.addErrorMessage(gs.getMessage('Parent case cannot be accessed'));
				return;
			}
			this.targetTable = this.parent.sys_class_name;
			this.targetId = this.parent.sys_id;	
		} else {
			this.targetTable = targetTable || tableName;
			this.targetId = targetId || tableId;
		}

        this.unEvaluatedVariable = [];
        this.inaccessibleVariable = [];
        this.customVariables = ["${Signature}", "${Date}"];

		if (!isPortalcontent) {
			this.templateTableName = "sn_hr_core_document_template";

			if (!tableName)   // no point getting the template field
				return;

			this.templateSysId = this._getTemplateSysId();
			if (!this.templateSysId)
				return;

			var instance = gs.getProperty('glide.servlet.uri');
			this.maxImageBytes = 1*1024*1024;
			this._getTemplateInfo(this.templateTableName, this.templateSysId, instance);
			this._getFileName();
		}
	},
	
	generate : function(manual) {
		var generalFormAPI = new global.GeneralFormAPI(this.fileName, this.targetTable, this.targetId);
		generalFormAPI.setDocument(this.headerImage, this.footerImage, this.footnote, this.headerPosition, this.footerPosition, this.pageSize);
		if (! this._all_signatures_collected(this.body) && !manual) 
			return false;
		
		this.body = this.remove_all_variables(this.body);
		generalFormAPI.createPDF(this.body);
		if (!manual)
			this.inactivateRelatedDrafts();
		return true;
	},
	
	/**
	 * This is the file name that will be used when creating the PDF file.
	 */
	_getFileName : function() {
		var fileName;
		if (this.parent && this.parent.pdf_template)        //HR TASK
			fileName = this._getFileNameFromTask(this.parent);
		else if (this.glideRecord.pdf_template)             //HR CASE
			fileName = this._getFileNameFromTask(this.glideRecord);
		else
			fileName = this.glideRecord.short_description;
		this.fileName = fileName;
	},
	
	_getFileNameFromTask : function(glideRecord) {
		var fileName = glideRecord.pdf_template.name;
		if (glideRecord.subject_person)
			fileName += ' - ' + glideRecord.subject_person.name;
		else if (glideRecord.opened_for)
			fileName += ' - ' + glideRecord.opened_for.name;		
		else if (glideRecord.assigned_to)
			fileName += ' - ' + glideRecord.assigned_to.name;
		return fileName;
	},
	
	_getDocumentBody : function() {
		var signature = this._get_signature();  	//for legacy signature variable ${Signature}
		var signatures = this._get_signatures();	
		var instance = gs.getProperty('glide.servlet.uri');
		
		var gr = new GlideRecord("draft_document");
		var tableQuery = gr.addQuery('table', this.tableName);
		var recordQuery = gr.addQuery('document', this.tableId);
		if (this.parent) {
			tableQuery.addOrCondition('table', this.parent.sys_class_name);
			recordQuery.addOrCondition('document', this.parent.sys_id);
		}
		gr.orderByDesc('sys_created_on');
		gr.addActiveQuery();
		gr.query();
		if (gr.next()) {
			var parsedBody = gr.body + '';
			
			if (parsedBody.length < 1)   // The saved template body should not be empty.
				return '';
			
			// after previewing, the signature would be added to the document
			if (signature) {
				parsedBody = parsedBody.replace(/\${Signature\}/gi, signature);
				parsedBody = parsedBody.replace(/\{\{Signature\}\}/gi, signature);
			}
			if (signatures) {
				for (var property in signatures) {
				  var re = new RegExp("\\${"+property+"\\}","gi");
				  parsedBody = parsedBody.replace(re,  signatures[property]);
				}
			}
			return parsedBody;
		}
		return '';
	},
	
	_getTemplateSysId : function() {
		//If parent is set then this is a HR Task 
		if (this.parent) {
			if (this.parent.pdf_template)
				return this.parent.pdf_template + '';
			else {
				gs.addErrorMessage(gs.getMessage('PDF template cannot be found on parent case'));
				return null;
			}
		}
			
		this.glideRecord = new GlideRecord(this.tableName);
		if (this.glideRecord.get(this.tableId) && this.glideRecord.pdf_template)
			return this.glideRecord.pdf_template + '';
		else {
			gs.addErrorMessage(gs.getMessage('PDF template cannot be found'));
			return null;
		}
	},
	
	_getTemplateInfo : function(templateTableName, templateSysId, instance) {
		var gr = new GlideRecord(templateTableName);
		gr.get(templateSysId);
		
		var headerAttachmentSysId  = gr.header.getDisplayValue() ? gr.header.getDisplayValue().substring(0, gr.header.getDisplayValue().indexOf('.iix')) : '';
		var footerAttachmentSysId = gr.footer.getDisplayValue() ? gr.footer.getDisplayValue().substring(0, gr.footer.getDisplayValue().indexOf('.iix')) : '';
		this.headerImage = this._getImageUrl(headerAttachmentSysId);
		this.footerImage = this._getImageUrl(footerAttachmentSysId);
		this.footnote    = gr.footnote + '';
		this.headerPosition = gr.header_position + '';
		this.footerPosition = gr.footer_position + '';
		this.pageSize       = gr.page_size  + '';
		
        if (gr.getValue('html_script_body') != null && gr.getValue('html_script_body').trim().length > -1)
            this.body = this._parseHTMLScriptBody(gr.html_script_body, instance);
        else 
            this.body = this._parseBody(gr.body, instance);
	},
	
	//Legacy parsed body for HTML type body field
	_parseBody : function(docBody, instance) {
		var documentBody = this._getDocumentBody();
		if (documentBody)
			return documentBody;
		
		var parsedBody = docBody + '';
		var tableName = this.tableName; 
		var tableId = this.tableId;
		
		if (this.parent) {
			tableName = this.parent.sys_class_name;
			tableId = this.parent.sys_id;
		}
			
		var gr = new GlideRecord(tableName);
		if (gr.get(tableId)) {
			
			var grProfile = new GlideRecord('sn_hr_core_profile');
			// subject person isn't required though should always have a value for EVL. If it doesn't, we'll show opened for person
			if (gr.subject_person)
				grProfile.addQuery('user', gr.subject_person);
			else
				grProfile.addQuery('user', gr.opened_for);
			grProfile.query();
			if (grProfile.next()) {

				parsedBody = parsedBody.replace(/\{\{Name\}\}/gi, grProfile.user.name);
				parsedBody = parsedBody.replace(/\{\{Position\}\}/gi, grProfile.position.position);
				if (grProfile.employment_type != '')
					parsedBody = parsedBody.replace(/\{\{Time type\}\}/gi, grProfile.employment_type.getDisplayValue());

				parsedBody = parsedBody.replace(/\{\{Employment start date\}\}/gi, grProfile.employment_start_date);
				parsedBody = parsedBody.replace(/\{\{Work email\}\}/gi, grProfile.user.email);
				parsedBody = parsedBody.replace(/\{\{Work phone\}\}/gi, grProfile.work_phone);
				parsedBody = parsedBody.replace(/\{\{Prefix\}\}/gi, grProfile.user.introduction);
				parsedBody = parsedBody.replace(/\{\{Nationality\}\}/gi, grProfile.nationality);
				parsedBody = parsedBody.replace(/\{\{Manager\}\}/gi, grProfile.user.manager.name);
				parsedBody = parsedBody.replace(/\{\{Department\}\}/gi, grProfile.user.department.name);
				parsedBody = parsedBody.replace(/\{\{Employee number\}\}/gi, grProfile.user.employee_number);
				parsedBody = parsedBody.replace(/\{\{Employment status\}\}/gi, grProfile.employment_status);
				parsedBody = parsedBody.replace(/\{\{Employment type\}\}/gi, grProfile.employment_type);
				parsedBody = parsedBody.replace(/\{\{Gender\}\}/gi, grProfile.user.gender);
				
				var date = new GlideDateTime().getLocalDate();
				parsedBody = parsedBody.replace(/\{\{Date\}\}/gi, date);

				// convert to the right image path
				parsedBody = parsedBody.replace(/\/sys_attachment.do\?sys_id=(\w{32})/gi, '/$1.iix');
				parsedBody = parsedBody.replace(/\/sys_attachment.do\?sys_id&#61;(\w{32})/gi, '/$1.iix');
				parsedBody = parsedBody.replace(/src="\//gi, 'src="' + instance);
			} else
				this.body = gs.getMessage('HR Profile not found for subject person.');
		} else
			this.body = gs.getMessage('HR Profile not found.');
		
		return parsedBody;
	},
	
	//Parse routine for HTML script type body
	_parseHTMLScriptBody : function(docBody, instance) {
		var documentBody = this._getDocumentBody();
		if(documentBody)
			return documentBody;
		
		var parsedBody = docBody + '';
		parsedBody = this._setTemplateValues(parsedBody);
		
		// convert to the right image path
		parsedBody = parsedBody.replace(/\/sys_attachment.do\?sys_id=(\w{32})/gi, '/$1.iix');
		parsedBody = parsedBody.replace(/\/sys_attachment.do\?sys_id&#61;(\w{32})/gi, '/$1.iix');
		parsedBody = parsedBody.replace(/src="\//gi, 'src="' + instance);
		
		// set signatures
		var signatures = this._get_signatures();
		if (signatures) {
			for (var property in signatures) {
				var re = new RegExp("\\${"+property+"\\}","gi");
				parsedBody = parsedBody.replace(re,  signatures[property]);
			}
		}
		
		return parsedBody;
	},
	
	parseRichTextHtmlBody : function(docBody, tableName, tablesysId) {
		if (this.tableName)	
			this.tableName = tableName;
		if (this.tableId)
			this.tableId = tablesysId;
		var gr = new GlideRecord(tableName);
		if(!gr.get(tablesysId)){
			return;
		}
		
		docBody = this._setTemplateValues(docBody);
		return docBody;
	},
	
	_setTemplateValues: function(parsedBody){

		var regex = /\${([^}]*)}/g;
		var matched = parsedBody.match(regex);
		var date = new GlideDateTime().getLocalDate();
		var tableName = this.tableName;
		var tableId = this.tableId;
		var securityUtil = new global.HRSecurityUtils();
		
		if (this.parent) {
			tableName = this.parent.sys_class_name;
			tableId = this.parent.sys_id;
		}
		var gr = new GlideRecord(tableName);
		if (gr.get(tableId)) {
			for (var i in matched) {
				if (this.unEvaluatedVariable.indexOf(matched[i]) > -1 || this.inaccessibleVariable.indexOf(matched[i]) > -1 || this.customVariables.indexOf(matched[i]) > -1 || this._isCurrentDateWithOffset(matched[i])) 
					continue;
					
                var element = gr;
				var field;
				
				//Date processing
				var isOffsetDate = this._isOffsetDate(matched[i], gr);
				var str = "";
				var offsetData = this._offsetValues(matched[i]);

 				if(isOffsetDate) {
					str = offsetData.reference;
				} else {
					str = matched[i].match(/\${(.*)}/).pop();
				}
				
				str = str.trim();
				
				if (!str)
					continue;
				var references = str.split(/[\.]+/g);

				for (var j=0; j < references.length;j++) {
					field = references[j];
					if ( j == references.length-1)
						break;
					if (element.isValidField(field)) {
						if (element.getElement(field).canRead())
							element = element.getElement(field).getRefRecord();
						else {
							parsedBody = parsedBody.replace(matched[i], "<font color='#ff0000'>"+matched[i]+"</font>");
							this.inaccessibleVariable.push(matched[i]);
							break;
						}	
					}
					else 
						break;
				}

				if (element.isValidField(field)) { 
					if (element.getElement(field).canRead()) {
						if(isOffsetDate) {
							parsedBody = parsedBody.replace(matched[i], this._applyOffset(element.getDisplayValue(field), offsetData));
						} else {
							if (gs.nil(element.getElement(field)))
								parsedBody = parsedBody.replace(matched[i], '');
							else
								parsedBody = parsedBody.replace(matched[i], securityUtil.escapeHTML(element.getDisplayValue(field)));
						}
						
					}
					else {
						parsedBody = parsedBody.replace(matched[i], "<font color='#ff0000'>"+matched[i]+"</font>");
						this.inaccessibleVariable.push(matched[i]);
					}
				}
				else {
					if (field == "signature") {
						parsedBody = parsedBody.replace(matched[i], "${"+element.getValue("user_name")+'_signature'+"}");
					}
					else {
						parsedBody = parsedBody.replace(matched[i], "<font color='#ff0000'>"+matched[i]+"</font>");
						this.unEvaluatedVariable.push(matched[i]);
					}
				}
			}
			
			
			/*
				- Globally search for all the current date occurences (${Date}) with offset
				- Get offsetObject for each occurence
				- Replace each occurence with offset value
		
			*/ 
			
			var allDates = this.ALL_CURRENT_DATE_REGEX;
			var offsetCurrentDateOccurence = parsedBody.match(allDates);
			if(offsetCurrentDateOccurence != null) {
				for(var index in offsetCurrentDateOccurence) {
					var offsetObject = this._offsetValues(offsetCurrentDateOccurence[index]);
					var dateWithOffset = this._applyOffset(date, offsetObject);
					parsedBody = parsedBody.replace(offsetCurrentDateOccurence[index], dateWithOffset);
				}
			}
			
			/*
				- Replace current date tag ${Date} with current date value
			*/
			parsedBody = parsedBody.replace(/\${Date\}/gi, date);
		}
		else
			this.body = gs.getMessage('Record not found');
		return parsedBody;
	},
	
	_get_signature : function() {
		var gr = new GlideRecord('signature_image');
		gr.addQuery('user', gs.getUserID());
		gr.addQuery('table', this.tableName);
		gr.addQuery('document', this.tableId);
		gr.orderByDesc('sys_created_on');
		gr.addActiveQuery();
		gr.query();
		if (gr.next()) {
			var imageAttachment = this._getAttachment(gr.sys_id);
			var base64Image = new GlideSysAttachment().getContentBase64(imageAttachment);
			if (!gs.nil(imageAttachment)) 
				return '<img src=\"data:image/png;base64,'+ base64Image +  '"/>';
		}
		
		return '';
	},
	
	_getImageUrl : function(attachmentSysId) {
		if(gs.nil(attachmentSysId))
			return '';
		var imageAttachment = new GlideRecord('sys_attachment');
		if(!imageAttachment.get(attachmentSysId))
			return '';
		var base64Image = String(new GlideSysAttachment().getContentBase64(imageAttachment));
		var imageSize = (base64Image.length * 3)/4;
		if (imageSize > this.maxImageBytes) {
			gs.info('Image size is greater than ' + this.maxImageBytes + ' for SYSID ' + attachmentSysId);
			return '';
		}
		return 'data:image/png;base64,'+ base64Image;
	},

	_get_signatures : function() {
		var signMap = {};
		var gr = new GlideRecord('signature_image');
		var query = gr.addQuery('document', this.tableId);
		if (this.parent) {
			query.addOrCondition('document', this.parent.sys_id);
			var siblings = this._get_siblings(this.tableId);
			if (siblings)
				query.addOrCondition('document', 'IN', siblings);
		} else {
			var children = this._get_children(this.tableId);
			if (children)
				query.addOrCondition('document', 'IN', children);
		}
		
		gr.orderByDesc('sys_created_on');
		gr.addQuery('active', 'true');
		gr.query();
		while (gr.next()) {
			var imageAttachment = this._getAttachment(gr.sys_id);
			var base64Image = new GlideSysAttachment().getContentBase64(imageAttachment);
			if (!gs.nil(imageAttachment)) 
				signMap[gr.user.user_name+'_signature'] = '<img src=\"data:image/png;base64,'+ base64Image +  '"/>';
		}
		
		return signMap;
	},
	
	_get_children: function (parent) {
		var children;
		var gr = new GlideRecord(hr.TABLE_TASK);
		gr.addQuery('parent', parent);
		gr.addQuery('hr_task_type', 'sign_document');
		gr.query();
		while (gr.next()) 
			children ? children += ','+gr.getUniqueValue() : children = gr.getUniqueValue();

		return children;
	},
	
	_get_siblings: function (taskId) {
		var siblings;
		var record = new GlideRecord(hr.TABLE_TASK);
		if (record.get(taskId)) {
			var gr = new GlideRecord(hr.TABLE_TASK);
			gr.addQuery('parent', record.parent.sys_id);
			gr.addQuery('hr_task_type', 'sign_document');
			gr.query();
			while (gr.next()) 
				siblings ? siblings += ','+gr.getUniqueValue() : siblings = gr.getUniqueValue();
		}
		return siblings;
	},
	
	_all_signatures_collected: function (parsedBody) {
		var regex = /\${(.*?)_signature}/g;
		if (parsedBody.match(regex))
			return false;
		return true;
	},
	
	_getAttachment : function(id) {
		var gr = new GlideRecord('sys_attachment');
		gr.addQuery('table_name', 'signature_image');
		gr.addQuery('table_sys_id', id);
		gr.query();

		if (gr.next())
			return gr;
		else 
			return '';
	},
	
	remove_all_variables: function(parsedBody) {
		var regex = /\${(.*?)}/g;
		var matched = parsedBody.match(regex);

		for (var i in matched) 
			parsedBody = parsedBody.replace(matched[i], "");
			
		return parsedBody;
	},

	validateTemplate: function(parsedBody, tableName, isEmailTemplate){
		if (!tableName) 
		  return parsedBody;
		else {
			parsedBody = this.resetErroredSpanInDocument(parsedBody);
			var regex = /\${([^}]*)}/g;
			var matched = parsedBody.match(regex);
			var gr = new GlideRecord(tableName);
			gr.initialize();
			if (gr) {									//if the gliderecord cannot be initialized do not attempt validation 
				for (var i in matched) {
					if (this.unEvaluatedVariable.indexOf(matched[i]) > -1  || this.inaccessibleVariable.indexOf(matched[i]) > -1 || this.customVariables.indexOf(matched[i]) > -1 || this._isCurrentDateWithOffset(matched[i])) 
						continue;
					
					//Ignore special tokens in email templates
					if (isEmailTemplate && (matched[i] == '${URI_REF}' || (matched[i].startsWith('${mail_script:') && matched[i].endsWith('}'))))
						continue;
					
					var element = gr;
					var field;
					
					//Date processing
					var isOffsetDate = this._isOffsetDate(matched[i], gr);
					gs.info("PDUBS 548: " + isOffsetDate);
					var str = "";
					
					if (isOffsetDate) {
						var offsetDate = this._offsetValues(matched[i]);
						str = offsetDate.reference; 
					} else {
						str = matched[i].match(/\${(.*)}/).pop();
					}
					str = str.trim();
					
					if (!str)
						continue;
					var references = str.split(/[\.]+/g);
					for (var j=0; j< references.length;j++) {
						field = references[j];
						if ( j == references.length-1)
							break;
						if (element.isValidField(field)) {
							if (element.getElement(field).canRead()) 
								element = element.getElement(field).getRefRecord();
								
							else {
								parsedBody = parsedBody.replace(matched[i], '<span class="errored-field" style="color:#ff0000;">'+matched[i]+'</span>');
								this.inaccessibleVariable.push(matched[i]);
								break;
							}	
						}
						else 
							break;
					}
					if (element.isValidField(field)) { 
						if (!element.getElement(field).canRead() && !isEmailTemplate) {
							parsedBody = parsedBody.replace(matched[i], '<span class="errored-field" style="color:#ff0000;">'+matched[i]+'</span>');
							this.inaccessibleVariable.push(matched[i]);
						}
					}
					else {
						if (field == "signature") 
							continue;
						
						parsedBody = parsedBody.replace(matched[i], '<span class="errored-field" style="color:#ff0000;">' + matched[i] + '</span>');
						this.unEvaluatedVariable.push(matched[i]);
					}
				}
			}
			return parsedBody;
		}
	},
	
	resetErroredSpanInDocument : function(documentBody) {
		//regular expression that matches all the span pairs in the documentBody with class as errored-field	
		var spanRegex = /<\s*span\s*class="errored-field".*?>/g;
		var matchedSpanTags = documentBody.match(spanRegex);
		for (var i in matchedSpanTags) {
			documentBody = documentBody.replace(matchedSpanTags[i],"<span>");
		}
		return documentBody;
	},
	
	_isOffsetDate: function(field, gr) {
		var re = this.ALL_FIELD_REGEX;
		var dateWithOffset = field.match(re);
		var offsetDate = {};
		var isDateType = false;
		if(dateWithOffset != null && gr) {
			offsetDate = {
				"reference" : dateWithOffset[1], //field name
				"sign" : dateWithOffset[3], // add (+) or subtract (-) date
				"quantity" : dateWithOffset[5],
				"type" : dateWithOffset[6]
			};
			isDateType = this.isDateType(offsetDate.reference, gr);
		}
		return (dateWithOffset != null && isDateType);
	},
	
	_isCurrentDateWithOffset: function(field) {
		var re = this.CURRENT_DATE_REGEX;
		return (field.match(re) != null);
	},
	
	_applyOffset : function(elementValue, offsetValue) {
 		if(elementValue && !this._isOffsetObjectEmpty(offsetValue)) {
			
			var date = new GlideDateTime();
			date.setDisplayValue(elementValue);
			var sign = parseInt(offsetValue.sign + '1');
			var offset = sign * offsetValue.quantity; 
			
			switch(offsetValue.type) {
				case "w" : date.addWeeksLocalTime(offset);
					break;
				case "m" : date.addMonthsLocalTime(offset);
					break;
				case "d" : date.addDaysLocalTime(offset);
					break;
				default : break;
			}
			return date.getLocalDate().getDisplayValue();
		}
		return "";
	},
	
	_offsetValues: function(field) {
		
		var re = this.ALL_FIELD_REGEX;
		var dateWithOffset = field.match(re);
		
		if(dateWithOffset != null) {
			return {
				"reference" : dateWithOffset[1], //field name
				"sign" : dateWithOffset[3], // add (+) or subtract (-) date
				"quantity" : dateWithOffset[5],
				"type" : dateWithOffset[6]
			};
		}
		return {
			"reference" : "", //field name
			"sign" : "", // add (+) or subtract (-) date
			"quantity" : "",
			"type" : ""
		};
	},
	
	_isOffsetObjectEmpty: function(offsetObject) {
		if (offsetObject == null || offsetObject.reference == "" || offsetObject.sign == "" || offsetObject.quantity == "" || offsetObject.type == "") 
			return true;
		return false;
	},
	
	_draftDocumentQuery: function (tableName, tableId) {
		tableName = tableName || this.tableName;
		tableId = tableId || this.tableId;
		var gr = new GlideRecord("draft_document");
		var tableQuery = gr.addQuery('table', tableName);
		var recordQuery = gr.addQuery('document', tableId);
		if (tableName == hr.TABLE_TASK) {
			var task = new GlideRecord('task');
			task.get(tableId);
			tableQuery.addOrCondition('table', task.parent.sys_class_name);
			recordQuery.addOrCondition('document', task.parent.sys_id);
		}
		gr.addActiveQuery();
		gr.query();
		return gr;
	},
	
	getDraftDocument: function (tableName, tableId) {
		var gr = this._draftDocumentQuery(tableName, tableId);
		if (gr.next())
			return gr;
		else 
			return null;
	},
	
	inactivateRelatedDrafts: function (tableName, tableId) {
		tableName = tableName || this.tableName;
		tableId = tableId || this.tableId;
		var gr = this._draftDocumentQuery(tableName, tableId);
		gr.setValue('active', false);
		gr.updateMultiple();
		if (new sn_hr_core.hr_CoreUtils().isCase(tableName)) {
			var children = this._get_children(tableId);
			gr = new GlideRecord("draft_document");
			gr.addQuery('table', hr.TABLE_TASK);
			gr.addQuery('document', 'IN', children);
			gr.addActiveQuery();
			gr.query();
			gr.setValue('active', false);
			gr.updateMultiple();
		}
	},
	
	// Checks if an element is of known date types i.e. glide_date_time, date, glide_date
	isDateType: function (fieldName, tableGR) {
		var dateTypes = ['glide_date_time', 'date', 'glide_date', 'due_date'];
		var element = tableGR.getElement(fieldName);

		return ((element.toString() != null) && dateTypes.indexOf(element.getED().getInternalType()) > -1);
	},
	
	hasDraftDocument: function (tableName, tableId) {
		var gr = this._draftDocumentQuery(tableName, tableId);
		return gr.hasNext();
	},

	type : 'GeneralHRForm'
};