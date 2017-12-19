/* 
 *	GeneralFormAPI : API to generate a PDF document from an HTML template
 */

var GeneralFormAPI = Class.create();

GeneralFormAPI.prototype = {
	/**
	 * After initialization, call setDocument and createPDF methods
	 * the generated PDF will be attached to the target record
	 */
	initialize : function(fileName, targetTable, targetId) {
		this.fileName = fileName;
		this.document = null;
		
		this.targetTable = targetTable;
		this.targetId = targetId;
	},
	
	setDocument : function(headerImage, footerImage, footnote, headerPosition, footerPosition, pageSize) {
			// This allows us to control the properties for the Document,
			// size, margins, portrait-landscape, etc.
			var pdfDoc = new GeneralPDF.Document(null, null, null, null, pageSize, headerImage);
			
			// This contains many options for creating PDFs in different ways.
			// Here we pass in just a Document object with the properties we
			// want
			this.document = new GeneralPDF(pdfDoc);
			this.document.setDocTempleInfo(headerImage, footerImage, footnote, headerPosition, footerPosition, pageSize);
		
			// Creates a new document open for writing then we will parse HTML
			// and add it to the document. This allows us to control things such
			// as
			// page break based on a certain GeneralFormAPIElement type as one
			// example.
			// It also helps improve PDF creation performance because small
			// blocks
			// of HTML tables are added for each element in the form versus
			// creating
			// a single huge table and adding that to the document one time.
			this.document.startHTMLParser();
	},

		
	createPDF : function(body, pages) {

		body = this._parseBodyForAttachmentSysId(body);
		body = this._parseBodyForImagesFromLib(body);

		if(!gs.nil(body))
			this.document.addHTML(body);
		if(!gs.nil(pages)){
			for(var i in pages){
				if(i != 0)
					this.document.addNewPage();
				if(!gs.nil(pages[i].heading))
					this.document.addHTML(pages[i].heading);
				if(!gs.nil(pages[i].svg) && !gs.nil(pages[i].svg.content))
					this.document.addSVG(pages[i].svg.content, pages[i].svg.position);
				if(!gs.nil(pages[i].table))
					this.document.addCells(pages[i].table.cells, pages[i].table.row_length);
			}
		}

		// At this point iteration through GeneralFormAPITable(s) has finished
		// and all HTML has been parsed now we just close the document and
		// stop the writer
		this.document.stopHTMLParser();

		// Now the finished PDF file is ready to be used
		var pdfFile = this.document.get();

		// Create attachment with commands that can run inside logic
		var a = new GeneralPDF.Attachment();
		a.setTableName(this.targetTable);
		a.setTableId(this.targetId);		
		a.setName(this.fileName);
		a.setType('application/pdf');
		a.setBody(pdfFile);

		// This will commit the new file to the database
		var aId = GeneralPDF.attach(a);
	},
	
	_parseBodyForAttachmentSysId : function(body) {
		
		//get all matched src that starts with sys_attachment.do
		var srcList = body.match(/src="sys_attachment.do((?:\\.|[^"\\])*)"/g);
		
		for (var i in srcList) {
			
			var attachmentSysId;
			//get only those src that contains sys_attachment url
			var matchedAttachment = srcList[i].match(/sys_attachment.do\?sys_id=(\w{32})/);
			if(!matchedAttachment) {
				matchedAttachment = srcList[i].match(/sys_attachment.do\?sys_id&#61;(\w{32})/);
				if(matchedAttachment)
					attachmentSysId = matchedAttachment.pop();
			} else 
				attachmentSysId = matchedAttachment.pop();
			
			//if sysattachment id cannot be retrieved then continue
			if(!attachmentSysId)
				continue;
			
			var imageAttachment = new GlideRecord('sys_attachment');
			if (!imageAttachment.get(attachmentSysId))
				continue;
			
			var base64ImageStr = this._getBase64ImageFromSysAttachment(imageAttachment);
			if (base64ImageStr)
				body = body.replace(srcList[i], "src=\"" + base64ImageStr + "\"");
		}
		return body;
	},
	
	_parseBodyForImagesFromLib : function(body) {
		var imageSrcList = body.match(/src="[^data:image\/png;base64]((?:\\.|[^"\\])*)"/g);
		var instance = gs.getProperty('glide.servlet.uri');
		for (var i in imageSrcList) {
			var imageContainingHttp = imageSrcList[i].match(/"http((?:\\.|[^"\\])*)(\w{32})\.iix"/);
			if (imageContainingHttp) {
				var attachmentId = imageContainingHttp.pop();
				if(!attachmentId)
					continue;
				var imageAttachment = new GlideRecord('sys_attachment');
				if (!imageAttachment.get(attachmentId))
					continue;
				var base64ImageStr = this._getBase64ImageFromSysAttachment(imageAttachment);
				if(base64ImageStr)
					body = body.replace(imageSrcList[i], "src=\"" + base64ImageStr + "\"");
			} else {
				var imageName = imageSrcList[i].match(/"((?:\\.|[^"\\])*)"/);
				if (imageName) {
					var escapedImageName = imageName.pop();
					if (escapedImageName && instance) {
						var imageUrl = instance + escapedImageName ; 
						body = body.replace(imageSrcList[i], "src=\"" + imageUrl + "\"");
					}
				}
			}
		}
		return body;
	},
	
	_getBase64ImageFromSysAttachment : function(attachmentGR) {
		if(!gs.nil(attachmentGR)) {
			var base64ImageStr = GlideStringUtil.base64Encode(new GlideSysAttachment().getBytes(attachmentGR));
			return "data:image/png;base64," + base64ImageStr + "";
		}
		return "";
	},

	type : 'GeneralFormAPI'
};
