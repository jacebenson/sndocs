var CABSNC = Class.create();

CABSNC.LOG_PROP = "com.snc.change_management.cab.log";
CABSNC.APPROVAL = "sysapproval_approver";
CABSNC.DEMO_DATA_CAB_DEFINITION_SYS_ID = "30b99b3d93a0220050bef157b67ffb2e";

CABSNC.prototype = {
    initialize: function(_gr, _gs) {
		this._gr = _gr || current;
		this._gs = _gs || gs;
		this._log = new global.GSLog(CABSNC.LOG_PROP, this.type).setLog4J();
    },

    /**
     * Wrapped GlideRecord convenience methods
     */
    setValue: function(name, value) {
        this._gr.setValue(name, value);
    },

    getValue: function(name) {
        return this._gr.getValue(name);
    },

    insert: function() {
		if (!this._gr.insert())
			return;

        this.refreshGlideRecord();

		if (!(typeof this._gr !== "undefined" && this._gr != null))
			return;

		return this._gr.getUniqueValue();
    },

    update: function() {
        return this._gr.update();
    },

	insertUpdate: function() {
		return (this._gr.isNewRecord() ? this.insert() : this.update());
	},

    refreshGlideRecord: function() {
		var tn = this._gr ? this._gr.getTableName() : null;
		
		if (tn == null)
			return;
		
        var gr = new GlideRecord(tn);
        if (!gr.get(this._gr.getUniqueValue()))
            this._gr = null;
		else
			this._gr = gr;
    },

    getGlideRecord: function() {
        return this._gr;
    },

	/**
	 * Converts a i18n'd GlideRecord to a JS object taking into account credentials
	 */
	toJS: function() {
		return this._toJS(this._gr);
	},

	_toJS: function(_gr) {
		if (typeof _gr === "undefined")
			return;

		if (!_gr.canRead())
			return;

		// Always exclude meta fields
		var exclude = {
			sys_scope: true,
			sys_replace_on_upgrade: true,
			sys_policy: true,
			sys_package: true,
			sys_customer_update: true
		};

		var obj = {};

		var el = _gr.getElements();

		for (var i=0; i < el.length; i++) {
			var elName = el[i].getName()+"";
			
			if (!el[i].canRead() || exclude[elName])
				continue;
			
			obj[elName] = {};
			obj[elName].display_value = el[i].getDisplayValue();
			obj[elName].value = el[i].toString();
			
			var fieldType = el[i].getED().getInternalType();
			if (fieldType == "glide_date_time" || fieldType == "glide_date" || fieldType == "glide_time")
				obj[elName].tz_name = this._gs.getSession().getTimeZoneName();
		}
		
		return obj;
	},

	toJSON: function(pretty) {
		return this._toJSON(this.toJS(), pretty);
	},

	_toJSON: function(jsObj, pretty) {
		var json = new global.JSON();
		if (pretty)
			json.prettify();
		return json.encode(jsObj);
	},

	_canRead: function(tableName, sysId) {
		var gr = new GlideRecord(tableName);
		if(gr.get(sysId))
			return gr.canRead();
		return false;
	},

    type: 'CABSNC'
};