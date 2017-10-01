/*! RESOURCE: /scripts/classes/GlideFilterReference.js */
var GlideFilterReference = Class.create(GlideFilterHandler, {
    _setup: function(values) {
        this.maxValues = 1;
        this.tableField = this.tr.tableField;
        this.id = this.tableField + "." + guid();
        this.listenForOperChange = true;
        this.rightOperand = values;
    },
    _initValues: function(values) {
        this.values = [];
        if (values)
            this.values[0] = values;
    },
    _build: function() {
        clearNodes(this.tr.tdValue);
        var inDoctypeMode = (document.documentElement.getAttribute('data-doctype') == 'true');
        this.inputCnt = 0;
        if (this._isEmptyOper()) {
            this._addInvisibleTextInput();
            return;
        }
        var op = this._getOperator();
        var input = this._addTextInput("hidden");
        input.id = this.id;
        if (this._renderRightOperandAsFieldList(op)) {
            this._addSameAsLabels(this, op);
            this._populateRightOperandChoices();
            return;
        }
        if (this._renderDynamicOperandInput(op))
            return;
        input = this._addTextInput();
        input.id = "sys_display." + this.id;
        input.onfocus = this._onFocus.bind(this);
        input.onkeydown = this._onKeyDown.bindAsEventListener(this);
        input.onkeypress = this._onKeyPress.bindAsEventListener(this);
        input.onkeyup = this._onKeyUp.bindAsEventListener(this);
        input.autocomplete = "off";
        input.ac_columns = "";
        input.ac_order_by = "";
        if (inDoctypeMode) {
            input.setAttribute("class", "pull-left form-control filter-reference-input");
        }
        setAttributeValue(input, 'autocomplete', 'off');
        var displayValue = gel('fancy.' + this.values[0]);
        if (displayValue && displayValue.value != '')
            this.inputs[1].value = displayValue.value;
        else if (this.values) {
            this.inputs[1].value = this.values;
            this._resolveReference();
        }
        var view = $$("[name='sysparm_view']")[0];
        if (view && (view.value == "sys_ref_list"))
            return;
        if (inDoctypeMode) {
            var btn = cel("button");
            btn.setAttribute("class", "icon-search btn btn-default filerTableAction");
            btn.setAttribute("style", "margin-left: 2px");
            btn.onclick = this._refListOpen.bindAsEventListener(this);
            this.tr.tdValue.style.minWidth = "200px";
            this.tr.tdValue.appendChild(btn);
        } else {
            var image = createImage("images/reference_list.gifx", "Lookup using list", this, this._refListOpen);
            image.setAttribute("class", "filerTableAction");
            this.tr.tdValue.appendChild(image);
        }
    },
    _refListOpen: function() {
        var target = this.id;
        if (target.indexOf("IO:") > -1)
            target = target.substring(target.indexOf("IO:"), target.length);
        reflistOpen(target, this.item.getName(), this.item.getReference());
        return false;
    },
    getValues: function() {
        this._clearValues();
        if (this._isMappingEnabled)
            return this.getMappingValue();
        if (this._isEmptyOper())
            return '';
        var oper = this._getOperator();
        var input = this.inputs[0];
        if (this.inputCnt == 2) {
            var userInput = this.inputs[1];
            var userInputVal = userInput.value;
            if (userInputVal != null && (userInputVal.indexOf("javascript:") > -1))
                input = userInput;
            else if (this._useDisplayValue(oper))
                input = userInput;
            else if (this.item.getType() == 'glide_list' && oper == "DYNAMIC")
                input = userInput;
        }
        if (input) {
            return input.value;
        } else
            return '';
    },
    _useDisplayValue: function(oper) {
        return this.item.getType() != 'glide_list' && oper != '=' && oper != '!=' && oper != "CHANGESFROM" && oper != "CHANGESTO";
    },
    _resolveReference: function() {
        if (this.values[0]) {
            var ajax = new GlideAjax("ResolveRef");
            ajax.addParam("sysparm_name", this.tableField);
            ajax.addParam("sysparm_value", this.values[0]);
            ajax.getXML(this._resolveReferenceResponse.bind(this));
        }
    },
    _resolveReferenceResponse: function(request) {
        if (!request)
            return;
        var xml = request.responseXML;
        if (!xml)
            return;
        if (xml) {
            var items = xml.getElementsByTagName("item");
            if (items && items.length > 0 && items[0] && this.inputs[1])
                this.inputs[1].value = items[0].getAttribute("label");
        }
    },
    _onFocus: function(evt) {
        if (!this.inputs[1].ac) {
            var partialSearchFilterTypes = ',STARTSWITH,ENDSWITH,LIKE,NOT LIKE,';
            var tdOper = this.inputs[1].up(1).tdOper;
            var currentFilterType = (tdOper.firstElementChild || tdOper.children[0] || {}).value;
            if (partialSearchFilterTypes.indexOf(',' + currentFilterType + ',') > -1)
                this.inputs[1].setAttribute('is_filter_using_contains', 'true');
            this.inputs[1].ac = new AJAXReferenceCompleter(this.inputs[1], this.id, '');
            this.inputs[1].ac.elementName = this.tableField;
            this.inputs[1].ac.clearDerivedFields = true;
            this.inputs[1].ac.setIgnoreRefQual(true);
        }
    },
    _onKeyDown: function(evt) {
        return acReferenceKeyDown(this.inputs[1], evt);
    },
    _onKeyPress: function(evt) {
        return acReferenceKeyPress(this.inputs[1], evt);
    },
    _onKeyUp: function(evt) {
        return acReferenceKeyUp(this.inputs[1], evt);
    },
    z: null
});;