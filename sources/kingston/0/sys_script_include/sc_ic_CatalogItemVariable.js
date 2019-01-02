var sc_ic_CatalogItemVariable = Class.create();
sc_ic_CatalogItemVariable.prototype = Object.extendsObject(sc_ic_Base, {
    initialize: function(_gr,_gs) {
		sc_ic_Base.prototype.initialize.call(this,_gr,_gs);
    },

	/**
	 * Refreshes the meta information for the variable.  Anything that doesn't change it's definition.
	 */
	refresh: function(source) {
		var preconfigured = false;
		if (JSUtil.notNil(source[sc_ic.QUESTION_TYPE]))
			preconfigured = (source[sc_ic.QUESTION_TYPE].preconfigured+"" == "true");
		
		if (preconfigured && JSUtil.nil(source.help_text))
			this._gr.help_text = source[sc_ic.QUESTION_TYPE].help_text;
		else
			this._gr.help_text = source.help_text;
		
		if (preconfigured && source[sc_ic.QUESTION_TYPE].read_only+"" == "true") {
			this.write_roles = "admin";
			this.create_roles = "admin";
			this._gr.read_only = source[sc_ic.QUESTION_TYPE].read_only;
		}
		else {
			if (source.read_only+"" == "true") {
				this.write_roles = "admin";
				this.create_roles = "admin";
			}
			else {
				this.write_roles = "";
				this.create_roles = "";
			}
			this._gr.read_only = source.read_only;
		}
		
		this._gr.order = source.order;
		this._gr.update();
	},

	_copyFields: function(source) {
		
		// Copy the variable type from the question type.
		this._gr.type = source[sc_ic.QUESTION_CLASS][sc_ic.TYPE];
		
		//Copy fields from question record unless predefined, in which case copy from question type table.
		if (JSUtil.notNil(source[sc_ic.QUESTION_TYPE]) && source[sc_ic.QUESTION_TYPE].preconfigured+"" == "true") {
			this._fldCp(source[sc_ic.QUESTION_TYPE]);

			// If we have fields overloaded in the question copy those.
			if (JSUtil.notNil(source.question_text))
				this._gr.question_text = source.question_text;
		
			// read_only on the variable gr will not be persisted but we can use it here.
			if (this._gr.read_only+"" != "true") {
				if (source.read_only+"" == "true") {
					this._gr.write_roles = "admin";
					this._gr.create_roles = "admin";
				}
				else {
					this._gr.write_roles = "";
					this._gr.create_roles = "";
				}
				this._gr.read_only = source.read_only;
			}
			
			if (JSUtil.notNil(source.help_text)) {
				this._gr.show_help = true;
				this._gr.help_text = source.help_text;
			}
		}
		else
			this._fldCp(source);

		// Copy the data always taken from the question
		this._gr.order = source.order;
		this._gr.mandatory = source.mandatory;
		this._gr.name = source.name;
		
		// Hardcoded values
		if (this._gr.type == "3") {
			this._gr.do_not_select_first = true;
			this._gr.include_none = false;
		}
		
		return this;
		
	},
	
	/**
	 * Simple internal field copy function to do the bulk of the heavy lifting.
	 */
	_fldCp: function fldCp(src) {
		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[_copyFields] fldCpy from: " + src.name + " <" + src.getUniqueValue() + ">");

		this._gr.question_text = src.question_text;
		this._gr.default_value = src.default_value;

		if (JSUtil.notNil(src.help_text)) {
			this._gr.show_help = true;
		    this._gr.help_text = src.help_text;
		}
		
		//Set a temporary read_only, for convenience, and the roles
		this._gr.read_only = src.read_only;
		if (src.read_only + "" == "true") {
			this._gr.write_roles = "admin";
			this._gr.create_roles = "admin";
		}
		else {
			this._gr.write_roles = "";
			this._gr.create_roles = "";
		}
		
		this._gr.reference = (JSUtil.notNil(src.reference) ? src.reference : "");
		if (JSUtil.notNil(src.reference_qual)) {
			this._gr.use_reference_qualifier = "advanced";
			this._gr.reference_qual = src.reference_qual;
		} else
			this._gr.reference_qual = "";
			
		this._gr.scale_min = src.scale_min;
		this._gr.scale_max = src.scale_max;
		
		this._gr.include_none = true;
			
		// If we have a price
		if (parseFloat(src.cost.getCurrencyValue()+"") > 0 || parseFloat(src.recurring_cost.getCurrencyValue()+"") > 0) {					
			this._gr.pricing_implications = true;
			this._gr.price_if_checked = src.cost.getCurrencyValue();
			this._gr.rec_price_if_checked = src.recurring_cost.getCurrencyValue();
		}
	},

	_copyChoices: function(source) {
		//Copy choices from question choices record unless predefined in which case copy tom type choice table.
		var qcGr;
		
		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[_copyChoices] Copying choices for variable: " + source.name);
		
		if (JSUtil.notNil(source[sc_ic.QUESTION_TYPE]) && source[sc_ic.QUESTION_TYPE].preconfigured+"" == "true") {
			this._log.debug("[_copyChoices] Copying preconfigured choices");
			//Query the sc_ic_question_type_choice table
			qcGr = new GlideRecord(sc_ic.QUESTION_TYPE_CHOICE);
			qcGr.addQuery(sc_ic.QUESTION_TYPE,source[sc_ic.QUESTION_TYPE]);
		}
		else {
			//Query the sc_ic_question_choice table
			qcGr = new GlideRecord(sc_ic.QUESTION_CHOICE);
			qcGr.addQuery(sc_ic.QUESTION,source.getUniqueValue());
		}
		
		qcGr.query();
		
		// Copy fields into the variable choice table.
		// grab the wrapper, call create with the source and the question
		var questChoice = sc_ic_Factory.getWrapperClass(sc_.QUESTION_CHOICE);
		
		while (qcGr.next())
			questChoice.create(this._gr,qcGr);
	},
	
    type: 'sc_ic_CatalogItemVariable'
});

/**
 * Creates a variable (item option) for the given Catalog Item
 * based on them creator question provided
 */
sc_ic_CatalogItemVariable.create = function(prnt,source) {
	var ioGr = new GlideRecord(sc_.ITEM_OPTION);
	ioGr.cat_item = prnt.getUniqueValue(); // Set up the cat item reference
	
	var itemOption = sc_ic_Factory.wrap(ioGr);
	itemOption._copyFields(source);
	ioGr.insert();
	itemOption._copyChoices(source);
	
	return ioGr;
};

sc_ic_CatalogItemVariable.createContainerVar = function(prnt,type,index,label) {
	var ioGr = new GlideRecord(sc_.ITEM_OPTION);
	ioGr.initialize();
	ioGr.cat_item = prnt.getUniqueValue();
	ioGr.name = "container_" + ('00' + index).slice(-02);
	ioGr.type = type;
	ioGr.order = index;
	if (label) {
		ioGr.display_title = true;
		ioGr.question_text = label;
	}
	ioGr.insert();
	return ioGr;
};

sc_ic_CatalogItemVariable.createContainerStart = function(prnt,index,label) {
	return sc_ic_CatalogItemVariable.createContainerVar(prnt, 19, index, label);
};

sc_ic_CatalogItemVariable.createContainerEnd = function(prnt,index) {
	return sc_ic_CatalogItemVariable.createContainerVar(prnt, 20, index);
};

sc_ic_CatalogItemVariable.createContainerSplit = function(prnt,index) {
	return sc_ic_CatalogItemVariable.createContainerVar(prnt, 24, index);
};