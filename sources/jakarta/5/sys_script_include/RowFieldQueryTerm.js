var RowFieldQueryTerm = Class.create();

RowFieldQueryTerm.prototype = {

    initialize : function() {
		this.initialized = false;
    },

    process : function() {
        var item = document.createElement("item");
        item.setAttribute("term", this.getQueryTerm());
        root.appendChild(item);
    },

	processQueryTerm : function(table, field, operator, sysId) {
		this.table = table;
        this.sys_id = sysId;
        this.field = field;
        this.oper = operator;
        this.value = "";
		this.initialized = true;

		return this.getQueryTerm();
	},

    // Create a query term for table.field_name by getting the value from the
    // record identified by sys_id
    getQueryTerm : function() {
		if (!this.initialized)
			this._init();

        // if the field is 'sys_id', is it as is
        if (this.field == 'sys_id')
            return 'sys_id' + this.oper + this.sys_id;

        // Get the information about the field
        var gr = this._getRecord();
        if (gr == null)
            return this.field + this.oper;

        var fieldElement = gr.getElement(this.field);
        if (fieldElement == null)
            return this.field + this.oper;

        var ed = fieldElement.getED();
        var term = "";
        this.value = this._getValue(gr, this.field);

        // Show Matching/Filter Out on date/time type really means just the
        // date, not date and time
        if (ed.isDateType())
            term = this._getDateTimeTerm(gr, ed.isDateOnly());

        // Make sure choice list that has overridden label only queries within
        // the specific table class
        else if (ed.isChoiceTable())
            term = this._getChoiceTerm(gr);

		else if (ed.getInternalType() == "conditions")
			this.value = this._escapeConditionsValue(this.value);

		else if (ed.getInternalType() == "currency" || ed.getInternalType() == "price")
			this.value = this._getCurrencyValue(fieldElement);

        else if (ed.getInternalType() == "currency2")
			term = this._getCurrency2Term(fieldElement);

        if (!this.value)
            this.value = "NULL";

        if (!term)
            term = this.field + this.oper + this.value;

        // NULL values should also be included for these non-boolean fields:
        // a filter out on a non-zero scalar field
        // a show matching on a zero-value scalar field
		if (!ed.isBoolean()){
			if (this._filterOutExplicitValue(ed) || this._showMatchingZero(ed))
				term += "^OR" + this.field + "=NULL";
		}

        return term;
    },

	_escapeConditionsValue : function(val) {
		return GlideStringUtil.escapeQueryTermSeparator(val);
	},

    _filterOutExplicitValue : function(ed) {
        if (this.oper != "!=")
            return false;

        // if null is explicitly requested on a non-numeric, allow it to work.
        if (!ed.isTrulyNumber() && this.value != "NULL")
            return true;

        return ((this.value != "NULL") && (this.value != "0"));
    },

    _showMatchingZero : function(ed) {
        if (this.oper != "=")
            return false;

        // don't apply to non-numeric fields, since null and zero aren't
        // equivalent.
        if (!ed.isTrulyNumber())
            return false;

        return ((this.value == "NULL") || (this.value == "0"));
    },

    _init : function() {
        this.table = request.getParameter('table');
        this.sys_id = request.getParameter('sys_id');
        this.field = request.getParameter('field_name');
        this.oper = request.getParameter('oper');
        this.value = "";
    },
    
    _getRecord : function() {
        var gr = new GlideRecordSecure(this.table);
        if (!gr.get(this.sys_id))
            return null;
        
        return gr;
    },
    
    _getValue : function(/* GlideRecord */gr, field) {
        // to handle dot walked field names, we need to get the element and then
        // get the value from the element
        // GlideRecord.getValue does not work for dot walked fields
        var e = gr.getElement(field);
        if (!e && e != 0)
            return null;
        
        return e + '';
    },
    
    // Use date portion only for date/time fields
    _getDateTimeTerm : function(/* GlideRecord */gr, /* boolean */isDateOnly) {
		var ge = gr.getElement(this.field);
        if (ge == null)
            return null;

        var gdt = ge.getGlideObject();
        if (gdt == null)
            return null;

        // filter out or in on a null date
        if (gdt.getDate() == null)
            return null;

        // If gdt is already a glide_date just get the value
        var date = isDateOnly ? gdt.getValue() : gdt.getLocalDate().getValue();

        var term = this.field;
        if (this.oper == "=")
            term += "ON";
        else if (this.oper == ">" || this.oper == "<" || this.oper == ">=" || this.oper == "<=") {
            term += this.oper;
            this.useDateTime = true;

            if (isDateOnly)
                this.startEnd = this.oper == "<" || this.oper == ">=" ? "start" : "end";
        } else
            term += "NOTON";

        if (this.useDateTime) {
            if (isDateOnly)
                term += "javascript:gs.dateGenerate('" + date + "','" + this.startEnd + "')";
            else {
				term += "javascript:gs.dateGenerate('" + date + "','" + gdt.getInternalFormattedLocalTime() + "')";
            }
        } else
            term += date + "@javascript:gs.dateGenerate('" + date + "','start')@javascript:gs.dateGenerate('" + date + "','end')";

        return term;
    },

	_getCurrencyValue: function(ge) {
		return "javascript:global.getCurrencyFilter('" + this.table + "','" + this.field + "', '" +
			ge.getSessionCurrencyCode() + ";" + this.value + "')";
	},

    /**
     * Generally a match on a choice term is identical to a match on a non
     * choice term. However, in the case of overloaded choice lists (where
     * different child tables have different labels for the same choice values),
     * we want to make sure we filter in/out the appropriate entries from the
     * list by using the label along with the sys_class_name to do the filtering
     */
    _getChoiceTerm : function(/* GlideRecord */gr) {
        var tableName = gr.getRecordClassName();
        var field = this.field + '';
        var oc = new GlideOverLoadedChoices(tableName, field);
        if (!oc.hasDups(this.value))
            return null; // normal processing
        var classes = oc.findPeerGroup(tableName, this.value);
        if (!classes)
            return null;

        var setop = "IN";
        var bridge = "^";
        if (this.oper == "!=") {
            setop = "NOT IN";
            bridge = "^OR";
        }

        return this.field + this.oper + this.value + bridge + "sys_class_name" + setop + GlideStringUtil.join(classes);
    },

    _getCurrency2Term : function(fieldElement) {
        // For both '=' and '!=' operators, there is no special query term. Comparison with the value which is
        // NULL yields the correct results
        if (!fieldElement.hasValue())
            return;

        var config = new sn_currency.GlideCurrencyConfig(fieldElement.getED());
        var displayDigits = config.getDisplayDigits();
        var term;

        // For other operators, get the bounds [lower, upper] such that the values in that range
        // round to what is visible on screen
        var roundedValue = this._round(fieldElement.amount, displayDigits);
        var offset = Math.pow(10, -displayDigits) / 2;
        var lowerBound = this._round(roundedValue - offset, displayDigits+1);
        var upperBound = this._round(roundedValue + offset, displayDigits+1);

        if (this.oper == '=') {
            term = this.field + '>=' + fieldElement.currency + ',' + lowerBound
				+ '^' + this.field + '<' + fieldElement.currency + ',' + upperBound;
        } else if (this.oper == '!=') {
			var code = fieldElement.currency.split(',')[0];
            term = this.field + '<' + fieldElement.currency + ',' + lowerBound
				+ '^OR' + this.field + '>=' + fieldElement.currency + ',' + upperBound
				+ '^OR' + this.field + '.currency!=' + code;
		}

        return term;
    },

    _round : function(value, digits) {
        return Number(Math.round(value + 'e' + digits) + 'e-' + digits);
    },

    type : 'RowFieldQueryTerm'
}