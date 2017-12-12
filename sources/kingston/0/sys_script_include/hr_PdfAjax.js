var hr_PdfAjax = Class.create();
hr_PdfAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

	initialize : function(request, responseXML, gc) {
		global.AbstractAjaxProcessor.prototype.initialize.call(this, request, responseXML, gc);
	},

	ajaxFunction_saveCoordinatesToDocumentMap : function() {
		var pageNumber = parseInt(this.getParameter('sysparm_pageNumber'));
		var docTop = parseInt(this.getParameter('sysparm_docTop'));
		var docLeft = parseInt(this.getParameter('sysparm_docLeft'));
		var signTop = parseInt(this.getParameter('sysparm_signTop'));
		var signLeft = parseInt(this.getParameter('sysparm_signLeft'));
		var boxHeight = parseInt(this.getParameter('sysparm_boxHeight'));
		var boxWidth = parseInt(this.getParameter('sysparm_boxWidth'));
		var documentFieldLabel = this.getParameter('sysparm_documentField');
		var mappingField = this.getParameter('sysparm_documentFieldMap');
		var pdfDocSysId = this.getParameter('sysparm_pdfDocRevId');

		// Check have access to passed in pdf template
		var pdfdocRevGr = new GlideRecordSecure('sn_hr_core_pdf_template');
		if(!pdfdocRevGr.get(pdfDocSysId))
			return "false";

		var documentMap = new GlideRecordSecure('sn_hr_core_pdf_template_mapping');
		documentMap.setValue('document', pdfDocSysId);
		documentMap.setValue('document_field_type', "signature");
		documentMap.setValue('page_number', pageNumber);
		documentMap.setValue('mapping_field', mappingField);
		documentMap.setValue('document_field_label', documentFieldLabel);
		documentMap.setValue('doc_top', docTop);
		documentMap.setValue('doc_left', docLeft);
		documentMap.setValue('sign_top', signTop);
		documentMap.setValue('sign_left', signLeft);
		documentMap.setValue('box_height', boxHeight);
		documentMap.setValue('box_width', boxWidth);
		if (documentMap.insert())
			return "true";

		return "false";
	},

	ajaxFunction_getPDFTemplateMapping : function() {
		var pdfDocSysId = this.getParameter('sysparm_pdfDocRevId');

		// Function to return an object from a GlideRecord
		function objBuilder(mappingGr) {
			var fields = ["box_height", "box_width", "doc_top", "doc_left", "sign_top", "sign_left", "page_number", "document_field_label", "mapping_field", "sys_id"];
			var obj = {};
			for (var i = 0; i < fields.length; i++)
				obj[fields[i]] = mappingGr.getValue(fields[i]);

			return obj;
		}

		var maps = [];
		var templateMap = new GlideRecordSecure('sn_hr_core_pdf_template_mapping');
		templateMap.addQuery('document', pdfDocSysId);
		templateMap.query();
		while (templateMap.next())
			maps.push(objBuilder(templateMap));

		return new global.JSON().encode(maps);
	},

	ajaxFunction_removeTemplateMapping: function() {
		var pdfDocSysId = this.getParameter('sysparm_templateSysId');
		var templateMap = new GlideRecordSecure('sn_hr_core_pdf_template_mapping');
		if (templateMap.get(pdfDocSysId))
			return templateMap.deleteRecord();

		return false;
	},
	
	/* check field to see if type is glide_date_time and return true/false */
	ajaxFunction_isGlideDateTime: function () {
		var table = this.getParameter('sysparm_table');
		var mappingField = this.getParameter('sysparm_mappingField');
		
		try {
			var gr = new GlideRecord(table);
			return /^(date|glide_date|glide_date_time)$/i.test(gr.getElement(mappingField).getED().getInternalType());
		} catch(err) {
			return false;
		}
		
	},

    type: 'hr_PdfAjax'
});