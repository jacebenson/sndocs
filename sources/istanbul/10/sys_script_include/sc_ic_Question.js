var sc_ic_Question = Class.create();
sc_ic_Question.prototype = Object.extendsObject(sc_ic_Base, {
    initialize: function(_gr,_gs) {
		sc_ic_Base.prototype.initialize.call(this,_gr,_gs);
		
		this._defnChgFld = {
			"sc_ic_item_staging": true,
			"sc_ic_question_type": true,
			"question_text": true,
			"name" :true,
			"default_value": true,
			"mandatory": true,
			"max_length": true,
			"scale_min": true,
			"scale_max": true,
			"cost": true,
			"recurring_cost": true,
			"policy_payload": true
		};
		
		this._metaChgFld = {
			"sc_ic_section": true,
			"sc_ic_column": true,
			"help_text": true,
			"read_only": true,
			"order": true
		};

    },
	
	setDefinitionChangedOnItem: function() {
		var iGr = new GlideRecord(sc_ic.ITEM_STAGING);
		if (iGr.get(this._gr[sc_ic.ITEM_STAGING])) {
			this._log.debug("[setDefinitionChangedOnItem] Changed Item " + this._gr[sc_ic.ITEM_STAGING]);
			sc_ic_Factory.wrap(iGr).questionDefinitionChanged();
		}
	},
	
	setMetaChangedOnItem: function() {
		var iGr = new GlideRecord(sc_ic.ITEM_STAGING);
		if (iGr.get(this._gr[sc_ic.ITEM_STAGING])) {
			this._log.debug("[setMetaChangedOnItem] Changed Item " + this._gr[sc_ic.ITEM_STAGING]);
			sc_ic_Factory.wrap(iGr).questionMetaChanged();
		}
	},
	
	definitionChanged: function() {
		for (var key in this._defnChgFld)
			if (this._defnChgFld[key] && this._gr[key].changes()) {
				this._log.debug("[definitionChanged] Definition has changed");
				return true;
			}
		
		return false;
	},
	
	metaChanged: function() {
		for (var key in this._metaChgFld)
			if (this._metaChgFld[key] && this._gr[key].changes()) {
				this._log.debug("[metaChanged] Meta has changed");
				return true;
			}
		
		return false;
	},
	
	/**
	 * Sets the question name based on the question text.
	 */
	setQuestionName: function() {
		var name = "";
		
		if (this._gr[sc_ic.QUESTION_TYPE].preconfigured+"" == "true" && JSUtil.nil(this._gr.question_text))
			name = this._gr[sc_ic.QUESTION_TYPE].question_text+"";
		else
			name = this._gr.question_text+"";
		
		name = name.toLowerCase();
		name = name.replace(/\s/g,"_");
	    name = name.replace(/[^a-z0-9_]/g,"");
		
		if (name.match(/^[a-zA-Z]/) == null)
			name = "q_" + name;
		
		name = name.slice(0,36);
		name = this._suffixVarName(name);
		
		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[setQuestionName] Using name: " + name);
		
		this._gr.name = name;
	},
	
	setQuestionMetaFields: function() {
		this._gr.sc_ic_question_class = this._gr.sc_ic_question_type.sc_ic_question_class.getSysIdFromReferenceKey();
		this._gr.base_type = this._gr.sc_ic_question_type.sc_ic_question_class;
	},
	
	_suffixVarName: function(varPrefix) {
		var quest = new GlideRecord(sc_ic.QUESTION);
		quest.addQuery("sys_id","!=",this._gr.getUniqueValue());
		quest.addQuery(sc_ic.ITEM_STAGING, this._gr[sc_ic.ITEM_STAGING]);
		quest.addQuery("name","STARTSWITH",varPrefix);
		quest.orderByDesc("name");
		quest.query();
		
		this._log.debug("[_suffixVarName] Found " + quest.getRowCount() + " questions with the same name");
		
		var counter = 0;
		
		while (quest.next()) {
			this._log.debug("[_suffixVarName] checking" + quest.name);
			var cnt = parseInt((quest.name+"").slice(-2),10);
			this._log.debug("[_suffixVarName] Got number: " + cnt);
			if (!isNaN(cnt)) {
				counter = cnt + 1;
				break;
			}
		}
		
		return varPrefix + "_" + ('00' + counter).slice(-2);
	},
	
    type: 'sc_ic_Question'
});