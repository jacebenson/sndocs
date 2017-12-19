/**
 * This is the implementation script for the form generator. Use this script as
 * an example of how to create a script for a new implementation.
 * 
 * @author SERVICE-NOW\walter.brame
 */
var GeneralForm = Class.create();
GeneralForm.COMPANY_LOGO_IMAGE_URL = '{![|COMPANY_LOGO_IMAGE|]}';
var generalForm = {

	/**
	 * Any variables you set here will be set upon initialization if provided by
	 * the caller. After you initialize run start method.
	 */
	initialize : function() {

		this.viewId = null;
		//this.themeId = null;
		//this.mode = null;
		this.html = '';
		this.pdfTable = null;

		this.theme = null;
		this.glideRecord = null;
		this.fileName = null;
		this.document = null;
		this.template = null;
		
		this.generalDebug = null;
		this.tableId = null;
		this.tableName = null;
		this.themeId = null;
		this.mode = null;
		this.instance = null;
		this.targetTable = null;
		this.targetId = null;
		
		this.body = null;
		this.footerImage = null;
		this.headerImage = null;
		this.footnote = null;
		this.headerPosition = null;
		this.footerPosition = null;
		this.pageSize = null;
		
		this.setTheme = null;
		this.setGlideRecord = null;
		this.setDocument = null;
		this.setTemplate = null;
		this.setGeneralDebug = null;
		this.setTableId = null;
		this.setTableName = null;

		// These can be used to control default in production
		this.debugLevel = gs.getProperty('general.application.pdf.debug.level',
				null);
		this.debugPrefix = gs.getProperty('general.application.pdf.debug.prefix',
				null);

		General.prototype.init.apply(this, arguments);
	},

	/**
	 * Doing this allows us to easily change any variables either on object
	 * initialization, or after initializing this object and controlling the
	 * variables by running any logic before starting this application.
	 * 
	 * 
	 */
	start : function() {
		if (this.setTableId) {
			this.tableId = this.setTableId;
		}
		if (this.setTableName) {
			this.tableName = this.setTableName;
		}
		
		// Use the default view if one is not provided
		if (!this.viewId || (this.viewId && this.viewId == '')) {
			this.viewId = 'Default view';
		}
		
		if (!this.viewId || !this.tableId || !this.tableName) {
			var msg = 'Missing Required Information. ';
			if (!this.viewId) {
				msg += 'Missing View Id. ';
			}
			if (!this.tableId) {
				msg += 'Missing Table Id. ';
			}
			if (!this.tableName) {
				msg += 'Missing Table Name. ';
			}
			throw msg;
		}
		this._setDebug();
		this._setGlideRecord();
		this._setFileName();
		//leon this._setTheme();
		this._setDocument();
		//leon this._setTemplate();
		this._doAdditionalFormatting();
	},

	/**
	 * Optionally these variables for the level and prefix of the debug can be
	 * used by the caller to override the defaults for troubleshooting in
	 * production as an example. Otherwise the default debug will be in place.
	 * 
	 * 
	 */
	_setDebug : function() {
		if (this.setGeneralDebug) {
			this.setGeneralDebug();
		} else {
			if (this.generalDebug) {
				if (this.generalDebug.level) {
					this.debugLevel = this.generalDebug.level;
				} else {
					this.debugLevel = 0;
				}
				if (this.generalDebug.prefix) {
					this.debugPrefix = this.generalDebug.prefix;
				} else {
					this.debugPrefix = this.getType();
				}
			}
		}
	},

	/**
	 * This is the main GlideRecord used through out the Form generation
	 * process. The top level main form receives its data from this GlideRecord
	 * but some elements such as lists use other GlideRecords. List GlideRecords
	 * are related to this GlideRecord.
	 * 
	 */
	_setGlideRecord : function() {
		if (this.setGlideRecord) {
			this.setGlideRecord();
		} else {
			this.glideRecord = new GlideRecord(this.tableName);
			this.glideRecord.get(this.tableId);
		}
	},

	/**
	 * This is the file name that will be used when creating the PDF file.
	 * 
	 * 
	 */
	_setFileName : function() {
		this.fileName = 'Invalid file name';
		
		try {
			if ((!this.glideRecord.pdf_template))
				return;
			else 
				this.fileName = this.glideRecord.pdf_template.name + ' - ';
			
			if (this.glideRecord.opened_for)
				this.fileName += this.glideRecord.opened_for.name;
			else if (this.glideRecord.assigned_to)
				this.fileName += this.glideRecord.assigned_to.name;
			else { 
				//Especially for offer letter. Before the hiring process is approved, there is no user record for the onboarding employee.
				//The name has to be populated from payload which contains all information from the hiring procedure.
				var json_payload = this.glideRecord.payload;
				var payload = JSON.parse(json_payload);
				this.fileName += payload.new_employee_first_name + " " + payload.new_employee_middle_name + " " + payload.new_employee_last_name;
			}			
		} catch (e) {
			this.debug.log('GeneralForm._setFileName.Exception:' + e.message);
		}
		
	},

	/**
	 * Optionally this allows us to control the styles for the elements. These
	 * records contain all look and feel for all elements. If a theme is not
	 * provided we can still generate a Form and it will contain no formatting
	 * wit black text on a white background. All of the HTML structure, tables,
	 * lists etc are rendered correctly.
	 * 
	 * 
	 */
	
	/*leon	_setTheme : function() {
			if (this.setTheme) {
				this.setTheme();
			} else {
				if (this.themeId) {
					this.theme = new GeneralFormStyle('general_element');
					this.theme.get(this.themeId);
				}
			}
		},
	*/
	
	_setDocument : function() {
		if (this.setDocument)
			this.setDocument();
		else {
			// This allows us to control the properties for the Document,
			// size, margins, portrait-landscape, etc.
			var pdfDoc = new GeneralPDF.Document(null, null, null, null);
			
			// This contains many options for creating PDFs in different ways.
			// Here we pass in just a Document object with the properties we
			// want
			this.document = new GeneralPDF(pdfDoc);

			// Creates a new document open for writing then we will parse HTML
			// and add it to the document. This allows us to control things such
			// as
			// page break based on a certain GeneralFormElement type as one
			// example.
			// It also helps improve PDF creation performance because small
			// blocks
			// of HTML tables are added for each element in the form versus
			// creating
			// a single huge table and adding that to the document one time.
			this.document.startHTMLParser();
		}
	},
	
	_setTemplate : function() {
		if (this.setTemplate) {
			this.setTemplate();
		} else {
			
			// From here we can loop through the styles and attributes and
			// change
			// them dynamically to meet specific business logic. For example if
			// a certain field background color changes depending on some
			// criteria
/*leon
			this.template = new GeneralForm2({
				css : this.theme,
				viewId : this.viewId,
				glideRecord : this.glideRecord,
				debug : {
					prefix : this.debugPrefix,
					level : this.debugLevel
				},
				mode : this.mode,
				document : this.document
			});
			
			this.template.generateFormSections(); // Just using form sections
													// for now
			
			// this.template.generate(); // TODO: Everything
*/		
		}
		
	},

	preview : function() {
		this.html = this.template.html;

	},

	_doAdditionalFormatting : function() {
		
	},

	generate : function() {
		this.pdfTable = this.template.PDFTable;
	},

	createPDF : function() {
		// gs.print('HTML for PDF Template : ' + this.sf.html);

		// Create the Document object and pass in the content body as HTML
		// var pdfDoc = new GeneralPDF.Document(null, null, null, this.sf.html);

		// var pdfDoc = new GeneralPDF.Document(null, null, null, null);

		// Create the PDF File
		// var pdf = new GeneralPDF(pdfDoc);

		// Set page break events

		// Set header
		// pdf.setHeader()

		// set footer
		// pdf.setFooter(GeneralForm.Footer);

		// Set page size

		// Set rotation (landscape/portrait)

		// Set properties...
		// Author
		// Created by

		// Set pdf document marginsf

		// Set print margins behavior/properties

		// Set iTextPdf CSS StyleSheet

		// At this point iteration through GeneralFormTable(s) has finished
		// and all HTML has been parsed now we just close the document and
		// stop the writer
		this.document.stopHTMLParser();

		// Now the finished PDF file is ready to be used
		this.attach(this.document.get());
	},

	attach : function(pdfFile) {
		this.debug.log('attach');

		// Create attachment with commands that can run inside logic
		var a = new GeneralPDF.Attachment();
		a.setTableName(this.targetTable);
		a.setTableId(this.targetId);		
		a.setName(this.fileName);
		a.setType('application/pdf');
		a.setBody(pdfFile);

		// Or using the constructor
		// var a = new GeneralPDF.Attachment(tableid, tablename, fileName, pdf);

		// This will commit the new file to the database
		var aId = GeneralPDF.attach(a);

		this.debug.log('Attachment Id = <a href="/sys_attachment.do?sys_id='
				+ aId + '" target="_blank">' + aId + '</a>');
		this.debug.write();
	},

	type : 'GeneralForm'
};
GeneralForm.prototype = Object.extendsObject(General, generalForm);
