/**
 * sc_ic_Base
 *
 * Base class used for the creation of components of the Service Catalog Item Creator.
 *
 * This class should never be instanciated directly.  It should only be extedned.
 *
 * @author Chris Henson <chris.henson@service-now.com>
 */
var sc_ic_Base = Class.create();

sc_ic_Base.prototype = {
    initialize: function(_gr,_gs) {
        this._log = (new GSLog(sc_ic.LOG_LEVEL,this.type)).setLog4J();

		// Assume current if not defined.  This can only ever work if you're instantiating objects directly.
		this._gr = (typeof _gr !== "undefined" ? _gr : current);
		 // Assume gs if not defined
		this._gs = (typeof _gs !== "undefined" ? _gs : gs);
		
		// Assume null if global action not defined
		try {
			this._action = (JSUtil.notNil(action) ? action : null);
		} catch(e) {
			this._action = null;
		}
		
        if (this.type == "sc_ic_Base")
            this._log.error("[initialise] You shouldn't be instanciating objects of type sc_ic_Base");
    },

    /**
     * Returns the GlideRecord object this object wraps
     */
    get_gr: function() {
        return this._gr;
    },
	
	/**
	 * Returns the GlideSystem object this was instantiated with
	 */
	get_gs: function() {
		return this._gs;
	},

	// A lot of the following methods could be moved to a mixin script include and simply referenced in this class.
	
	convertToJSONString: function(anObj){
		if (GlideStringUtil.nil(anObj))
			return "{}";
		
		var myJSON = new JSON();
		return myJSON.encode(anObj);
	},

	/**
	 * Turns off engines sys fields and business rules for the GlideRecord
	 */
	_enableQuietUpdate: function() {
		this._gr.setWorkflow(false);
		this._gr.autoSysFields(false);
		this._gr.useEngines(false);
	},

	/**
	 * Turns on engines, sys fields and business rules for the GlideRecord
	 */
	_disableQuietUpdate: function() {
		this._gr.useEngines(true);
		this._gr.autoSysFields(true);
		this._gr.setWorkflow(true);
	},

	/**
	 * Copies all translation data between source and target glide element
	 * Source and target should both be of type GlideElement
	 * This only copies values in the translation tables, not the base value.
	 */
	copyElementTranslations: function(sourceGr, sourceFld, targetFld) {
		var TRANSLATED_FIELD = "translated_field";
		var TRANSLATED_TEXT = "translated_text";
		var TRANSLATED_HTML = "translated_html";
		
		var Translation = function() {
			return {"sys_id" : "",
					"tableName" : "",
					"fieldName" : "",
					"key" : "",
					"translation" : "",
					"language" : ""
			};
		};
		
		var sourceType = sourceGr[sourceFld].getED().getInternalType()+"";
		var targetType = this._gr[targetFld].getED().getInternalType()+"";
		
		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[copyElementTranslations] Source field " + sourceFld + " is: " + sourceType + ", Target field " + targetFld + " is: " + targetType);
		
		var sourceTrans = [];
		var transFld = "";
		var sysTrans = null;
		
		//Query the appropriate table.
		if (sourceType == TRANSLATED_FIELD) {
			transFld = "label";
			sysTrans = new GlideRecord("sys_translated");
			sysTrans.addQuery("name",sourceGr.getTableName());
			sysTrans.addQuery("element",sourceFld);
			sysTrans.addQuery("value",sourceGr[sourceFld+""].getValue());
			sysTrans.query();
		}
		else if (sourceType == TRANSLATED_TEXT || sourceType == TRANSLATED_HTML) {
			transFld = "value";
			sysTrans = new GlideRecord("sys_translated_text");
			sysTrans.addQuery("tablename",sourceGr.getTableName());
			sysTrans.addQuery("fieldname",sourceFld);
			sysTrans.addQuery("documentkey",sourceGr.getUniqueValue());
			sysTrans.query();
		}
		
		// If there's no translations for this field put in a log entry.
		if (this._log.atLevel(GSLog.DEBUG) && (sysTrans == null || !sysTrans.hasNext()))
			this._log.debug("[copyElementTranslations] No translations found for " + sourceGr.getTableName() + "." + sourceFld + " <" + sourceGr.getUniqueValue() + ">");
		
		while (sysTrans.next()) {
			var nt = new Translation();
			nt.sys_id = sourceGr.getUniqueValue()+"";
			nt.tableName = sourceGr.getTableName()+"";
			nt.fieldName = sourceFld;
			nt.key = sourceGr[sourceFld];
			nt.translation = sysTrans[transFld]+"";
			nt.language = sysTrans.language+"";				
			sourceTrans.push(nt);
			
			if (this._log.atLevel(GSLog.DEBUG))
				this._log.debug("[copyElementTranslations] Found translation: " + nt.language + ":" + nt.translation + " <" + nt.sys_id + ">");
		}
		
		// Determine target field type
		if (targetType == TRANSLATED_FIELD) {
			sysTrans = new GlideRecord("sys_translated");
			sysTrans.addQuery("name",this._gr.getTableName());
			sysTrans.addQuery("element",targetFld);
			sysTrans.addQuery("value",this._gr[targetFld]);
			sysTrans.query();
			
			//Update any that already exist and delete any orphans
			while (sysTrans.next()) {
				var transItem = null;
				for (var i=0; i < sourceTrans.length; i++) {
					var st = sourceTrans[i];
					
					if (sysTrans.language+"" == st.language && sysTrans.label+"" != st.translation) {
						sysTrans.label = st.translation;
						sysTrans.update();

						transItem = st;
						sourceTrans.splice(i,1);
						
						if (this._log.atLevel(GSLog.DEBUG))
							this._log.debug("[copyElementTranslations] Updated (sys_translated): " + transItem.key + ":" + transItem.language + ":" + transItem.translation + " <" + transItem.sys_id + ">");
						break;
					}
					else if (sysTrans.language+"" == st.language && sysTrans.label+"" == st.translation) {
						if (this._log.atLevel(GSLog.DEBUG))
							this._log.debug("[copyElementTranslations] " + st.language + " Translation is up to date");
						
						transItem = st;
						sourceTrans.splice(i,1);
						break;
					}
				}
				
				if (transItem == null) {
					if (this._log.atLevel(GSLog.DEBUG))
						this._log.debug("[copyElementTranslations] Delete (sys_translated): " + sysTrans.language + ":" + sysTrans.value);
					
					sysTrans.deleteRecord();
				}
			}
			
			//At this point we have an object with any new translations in.
			if (this._log.atLevel(GSLog.DEBUG))
				this._log.debug("[copyElementTranslations] " + sourceTrans.length + " translations to insert");
			
			for (var i = 0; i < sourceTrans.length; i++) {
				sysTrans = new GlideRecord("sys_translated");
				sysTrans.name = this._gr.getTableName();
				sysTrans.element = targetFld;
				sysTrans.value = sourceTrans[i].key;
				sysTrans.label = sourceTrans[i].translation;
				sysTrans.language = sourceTrans[i].language;
				
				if (this._log.atLevel(GSLog.DEBUG))
					this._log.debug("[copyElementTranslations] Insert (sys_translated): " + sysTrans.name + ":" + sysTrans.element + ":" + sysTrans.language + ":" + sysTrans.value);
				
				sysTrans.insert();
			}
		}
		else if (targetType == TRANSLATED_HTML || targetType == TRANSLATED_TEXT) {
			sysTrans = new GlideRecord("sys_translated_text");
			sysTrans.addQuery("tablename",this._gr.getTableName());
			sysTrans.addQuery("fieldname",targetFld);
			sysTrans.addQuery("documentkey",this._gr.getUniqueValue());
			sysTrans.query();
			
			//Update any that already exist
			while (sysTrans.next()) {
				var transItem = null;
				for (var i=0; i < sourceTrans.length; i++) {
					var st = sourceTrans[i];
					if (sysTrans.language+"" == st.language && sysTrans.value+"" != st.translation) {
						sysTrans.value = st.translation;
						sysTrans.update();
						
						if (this._log.atLevel(GSLog.DEBUG))
							this._log.debug("[copyElementTranslations] Update (sys_translated_text): " + transItem.key + ":" + transItem.language + ":" + transItem.translation + " <" + transItem.sys_id + ">");
						
						transItem = st;
						sourceTrans.splice(i,1); //Remove the used element
						break;
					}
					else if (sysTrans.language+"" == st.language && sysTrans.value+"" == st.translation) {
						if (this._log.atLevel(GSLog.DEBUG))
							this._log.debug("[copyElementTranslations] " + st.language + " Translation is up to date");
						
						transItem = st;
						sourceTrans.splice(i,1);
						break;
					}
				}
				
				if (transItem == null) {
					if (this._log.atLevel(GSLog.DEBUG))
						this._log.debug("[copyElementTranslations] Delete (sys_translated_text): " + sysTrans.tablename + ":" + sysTans.fieldname + ":" + sysTrans.documentkey + ":" + sysTrans.language + ":" + sysTrans.value);
					sysTrans.deleteRecord();
				}
			}
			
			//Insert any new ones
			if (this._log.atLevel(GSLog.DEBUG))
				this._log.debug("[copyElementTranslations] " + sourceTrans.length + " translations to insert");
			 
			for (var i = 0; i < sourceTrans.length; i++) {
				sysTrans = new GlideRecord("sys_translated_text");
				sysTrans.documentkey = this._gr.getUniqueValue();
				sysTrans.tablename = this._gr.getTableName();
				sysTrans.fieldname = targetFld;
				sysTrans.value = sourceTrans[i].translation;
				sysTrans.language = sourceTrans[i].language;
							
				if (this._log.atLevel(GSLog.DEBUG))
					this._log.debug("[copyElementTranslations] Insert (sys_translated_text): " + sysTrans.tablename + ":" + sysTrans.fieldname + ":" + sysTrans.language + ":" + sysTrans.value + ":" + sysTrans.documentkey);
				
				sysTrans.insert();
			}
		}
	},
	
	redirect: function() {
		if (this._action != null && !JSUtil.nil(this._action.getActionSysId()))
			this._action.setRedirectURL(this._gr);
	},
	
    type: "sc_ic_Base"
};