var GeneralPdfUtils = Class.create();
GeneralPdfUtils.prototype = {
	initialize: function() {
		this.pdfParser = new GeneralFormJava.PdfParser();
	},
	
	isFillable : function(attachmentSysId){
		return this.pdfParser.isFillable(attachmentSysId);
	},
	
	prefillPdf : function(jsonString, destinationTableSysId, pdfAttachmentSysId, destinationTableName, pdfName){
		return this.pdfParser.fillForm(jsonString, destinationTableSysId, pdfAttachmentSysId, destinationTableName, pdfName);
	},
	
	mergeImageToPdf : function(documentTableName, documentTableSysId, jsonArrayString, attachmentSysId, pdfName, signatureImage){
		return this.pdfParser.mergeSignatureImageToPdf(documentTableName, documentTableSysId, jsonArrayString, attachmentSysId, pdfName, signatureImage);
	},
	
	getPDFFields : function (attachmentSysId){
		//new global.JSON().encode(data);
		var fields = this.pdfParser.getPDFFields(attachmentSysId);
		return fields;
	},
	getFieldType: function (attachmentSysId) {
		var fields = this.pdfParser.getFieldType(attachmentSysId);
		return fields;
	},
	
	isValidPdfTemplateForPreFill : function(pdfTemplateSysId, pdfTemplateTableName){
		if(gs.nil(pdfTemplateTableName) || gs.nil(pdfTemplateSysId))
			return false;
		var pdfTemplate = new GlideRecord(pdfTemplateTableName);
		pdfTemplate.get(pdfTemplateSysId);
		if(!gs.nil(pdfTemplate) && !gs.nil(pdfTemplate.document_revision))
			  return true; 
		return false;
	},
	
	type: 'GeneralPdfUtils'
};