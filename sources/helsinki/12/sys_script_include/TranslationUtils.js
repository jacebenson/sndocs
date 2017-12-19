var TranslationUtils = Class.create();

/**
 * Used to convert translated columns from un-translated string types to translated_text and
 * manage conversion of translated_field type columns to translated_text
 *
 * Author: Chris Henson
 */
TranslationUtils.prototype =  {
	initialize: function() {
		this._log = new GSLog("com.glide.translation_utils.log",this.type).setLog4J();
		//this._log.setLevel(GSLog.DEBUG);
	},

	/**
	 * Convert a set of field in the given table to translated text
	 * table: the table name
	 * columns: Array of column names to check and convert
	 */
	convert: function(table,columns) {
		// Set state
		this._cvtData = false;
		this._cvtTbl = null;
		this._cvtCols = {};
		
		//Set up the table and column variables I'm going to need.
		this._cvtTbl = table;
		for (var i = 0; i < columns.length; i++)
			this._cvtCols[columns[i]] = false;

		this._convertColumns();
		this._convertTranslations();

	},

	/**
	 * Convert string and translated_field field types to translated_text identifies which translations
	 * need to be converted.
	 */
	_convertColumns: function() {
		// If we have nothing configured, just return.
		if (this._cvtTbl == null || JSUtil.nil(this._cvtTbl))
			return;

		var dict = new GlideRecord("sys_dictionary");
		dict.addQuery('name',this._cvtTbl);

		var firstCol = true;
		for (var col in this._cvtCols) {
			var qry;
			if (firstCol) {
				qry = dict.addQuery("element",col+"");
				firstCol = false;
			}
			else
				qry = qry.addOrCondition("element",col+"");
		}

		this._log.debug("sys_dictionary Encoded Query: " + dict.getEncodedQuery());
		dict.query();

		while (dict.next()) {
			// For translated_field types mark as needing translation
			if (dict.internal_type+"" == "translated_field") {
				dict.internal_type = "translated_text";
				var x = dict.update();
				this._log.info(dict.element + " field type changed from translated_field to translated_text");
				this._log.info("Marking " + dict.element + " as needing translation conversion");
				this._cvtCols[dict.element+""] = true;
				this._cvtData = true;
				continue;
			}

			// For string types just change the field type.
			if (dict.internal_type+"" == "string") {
				dict.internal_type = "translated_text";
				dict.update();
				this._log.info(dict.element + " field type changed from string to translated_text");
				continue;
			}
			
			if (dict.internal_type+"" == "translated_text") {
				this._log.info("Field " + dict.element + " is already a translated_text field");
				continue;
			}
			// If we get tis far it's an internal type we don't support. 
			this._log.error(dict.element + " is an unsupported field type: " + dict.internal_type);
		}
	},

	/**
	 * Manages the conversion from translated_field to translated_text
	 */
	_convertTranslations: function() {

		// Nothing to convert.
		if (!this._cvtData || this._cvtTbl == null || JSUtil.nil(this._cvtTbl))
			return;


		// Holds all translations for a given column key combination
		var transMatrix = {};

		// Select everything from the sys_translated table for the given table and columns
		var sysTrans = new GlideRecord("sys_translated");
		sysTrans.addQuery('name',this._cvtTbl);

		var firstCol = true;
		var qry = null;
		for (var col in this._cvtCols) {
			// If there's no need to convert
			if (!this._cvtCols[col])
				continue;

			if (firstCol) {
				qry = sysTrans.addQuery('element',col);
				firstCol = false;
				continue;
			}
			else
				qry.addOrCondition('element',col);
		}

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("sys_translated Encoded Query: " + sysTrans.getEncodedQuery()); 

		sysTrans.query();

		// Load the translation matrix
		while (sysTrans.next()) {
			if (typeof transMatrix[sysTrans.element+""] === "undefined")
				transMatrix[sysTrans.element+""] = {};

			if (typeof transMatrix[sysTrans.element+""][sysTrans.value+""] === "undefined")
				transMatrix[sysTrans.element+""][sysTrans.value+""] = [];

			transMatrix[sysTrans.element+""][sysTrans.value+""].push({"language":sysTrans.language+"", "translation":sysTrans.label+""});
		}

		// Now select all elements from the converted table and insert the appropriate translations
		var targetTbl = new GlideRecord(this._cvtTbl);
		targetTbl.setWorkflow(false);
		targetTbl.autoSysFields(false);
		targetTbl.useEngines(false);
		targetTbl.query();

		while (targetTbl.next()) {
			for (var col in this._cvtCols) {
				if (!this._cvtCols[col])
					continue;

				if (typeof transMatrix[col][targetTbl[col]+""] !== "undefined") {

					for (var i = 0; i < transMatrix[col][targetTbl[col]+""].length; i++) {
						var stt = new GlideRecord("sys_translated_text");
						stt.tablename = this._cvtTbl;
						stt.fieldname = col;
						stt.documentkey = targetTbl.getUniqueValue();
						stt.language = transMatrix[col][targetTbl[col]+""][i].language;
						stt.value = transMatrix[col][targetTbl[col]+""][i].translation;
						stt.insert();

						if (this._log.atLevel(GSLog.DEBUG))
							this._log.debug("Inserted translation for " + targetTbl.getDisplayValue() + " <" + targetTbl.getUniqueValue() + ">:" + col + " " + transMatrix[col][targetTbl[col]+""][i].language + ":" + transMatrix[col][targetTbl[col]+""][i].translation);
					}
				}
			}
		}
	},

	type: "TranslationUtils"
};