/*
 * given a GlideRecord table, sys_id and currency field get the various currency
 * field values for the client
 */
var AJAXCurrencyValues = Class.create();

AJAXCurrencyValues.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	process : function() {
		if (gs.getProperty("glide.i18n.single_currency") == "true")
				this.singleCurrencyEnabled = true;
		this.singleCurrencyCode = gs.getProperty("glide.i18n.single_currency.code");
		
		if (this.getName() == 'getCurrencyValues') {
			var table = this.getParameter("sysparm_table");
			var sysid = this.getParameter("sysparm_id");
			var field = this.getParameter("sysparm_field");
			return this.getCurrencyValues(table, sysid, field);
		}
	},

	getCurrencyValues : function(table, sysid, element) {
		var record = new GlideRecordSecure(table);
		record.get(sysid);
		if (!record.isValid()) {
			this.setError("Invalid GlideRecord " + table + ":" + sysid);
			return;
		}

		if (record.isValidField(element) == false) {
			this.setError("Invalid field: " + element + " on table " + table);
			return;
		}

		var field = record.getElement(element);

		if (field == null || typeof field.getCurrencyString != "function") {
			this.setError("Field " + element
					+ " doesn't appear to be a currency/price field");
			return;
		}

		var values = this.newItem("values");
		//system
		values.setAttribute("reference_value", field.getReferenceValue()); // 12500 decimal stored value in system currency
		values.setAttribute("reference_display", field.getReferenceDisplayValue()); //$ 12.500,00 stored value and currency
		values.setAttribute("reference_currency", field.getReferenceCurrencyCode()); // USD stored currency
		values.setAttribute("currency_string", field.getCurrencyString()); //USD;12500 stored value
		
		//session formats
		values.setAttribute("display_value", field.getDisplayValue());  // € 8.789,20 converted to user currency/format
		values.setAttribute("session_value", field.getSessionValue()); // 8789.20 decimal converted to user currency
		values.setAttribute("session_display", field.getSessionDisplayValue()); // € 8.789,20
		values.setAttribute("session_currency", field.getSessionCurrencyCode());  // EUR
		
		var config = this.newItem("config");
		config.setAttribute("single_currency_enabled", this.isSingleCurrency());
		config.setAttribute("single_currency_code", this.getSingleCurrencyCode());
		
	},

	isSingleCurrency: function() {
		return this.singleCurrencyEnabled;
	},
	
	getSingleCurrencyCode: function() {
		return this.singleCurrencyCode;
	},
	
	isPublic: function() {
		return false;
	}
});
