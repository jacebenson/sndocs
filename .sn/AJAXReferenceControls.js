/*! RESOURCE: /scripts/classes/ajax/AJAXReferenceControls.js */
var AJAXReferenceControls = Class.create({
    initialize: function(tableElement, id, parentElement, refSysId, rowSysId, refQualTag) {
        this.refName = id;
        this.id = "LIST_EDIT_" + id;
        this.tableElement = tableElement;
        this.dependent = null;
        this.refQual = "";
        this.refImageFocused = false;
        this.refSysId = refSysId;
        this.rowSysId = rowSysId;
        this.createAdditionalValues(refQualTag);
        this.createInput(parentElement);
        this.createLookup(parentElement);
        this.createInputGroup(parentElement);
        this.createDependent(parentElement);
    },
    clearDropDown: function() {
        if (this.ac)
            this.ac.clearDropDown();
    },
    createAdditionalValues: function(refQualTag) {
        this.additionalValues = {};
        this.additionalValues.sys_uniqueValue = this.rowSysId;
        this.additionalValues.sys_target = this.tableElement.getTable().getName();
        this.additionalValues.sysparm_list_edit_ref_qual_tag = refQualTag;
    },
    createInput: function(parentElement) {
        var doctype = document.documentElement.getAttribute('data-doctype');
        this._createHidden(parentElement, this.id, '');
        this.input = cel("input", parentElement);
        input = this.input;
        if (doctype)
            input.className = 'form-control list-edit-input';
        input.id = "sys_display." + this.id;
        input.onfocus = this._onFocus.bind(this);
        input.onkeydown = this._onKeyDown.bindAsEventListener(this);
        input.onkeypress = this._onKeyPress.bindAsEventListener(this);
        input.onkeyup = this._onKeyUp.bindAsEventListener(this);
        input.autocomplete = "off";
        input.ac_columns = "";
        input.ac_order_by = "";
        input.setAttribute("data-ref-dynamic", this.tableElement.isDynamicCreation());
    },
    resolveReference: function() {
        if (this.ac)
            this.ac.onBlur();
    },
    setDisplayValue: function(value) {
        this.input.value = value;
    },
    getInput: function() {
        return this.input;
    },
    getValue: function() {
        return gel(this.id).value;
    },
    getDisplayValue: function() {
        return this.input.value;
    },
    isResolving: function() {
        return (this.ac && this.ac.isResolving());
    },
    isReferenceValid: function() {
        if (this.ac) {
            return this.ac.isReferenceValid();
        }
        return true;
    },
    setResolveCallback: function(f) {
        if (!this.ac)
            return;
        this.ac.setResolveCallback(f);
    },
    setReferenceQual: function(refQual) {
        this.refQual = refQual;
    },
    createLookup: function(parent) {
        var doctype = document.documentElement.getAttribute('data-doctype');
        var image = $(createImage("images/reference_list.gifx", "Lookup using list"));
        if (doctype)
            image = $(createIcon("icon-search"));
        image.width = 18;
        image.height = 16;
        image.id = "ref_list." + this.id;
        image.observe("click", this._refListOpen.bind(this));
        if (window.g_accessibility) {
            image.observe("keydown", function(evt) {
                if (evt && evt.keyCode == Event.KEY_RETURN) {
                    evt.stop();
                    return this._refListOpen(evt);
                }
            }.bind(this));
        }
        image.style.marginLeft = "5px";
        image.setAttribute("tabindex", 0);
        image.setAttribute("role", "button");
        if (doctype)
            image = image.wrap('span', {
                'class': 'input-group-addon',
                'id': 'list-edit-span'
            });
        parent.appendChild(image);
    },
    createDependent: function(parent) {
        if (!this.tableElement.isDependent())
            return;
        var input = cel("input");
        input.type = "hidden";
        this.dependent = "sys_dependent";
        input.id = this.tableElement.getTable().getName() + "." + this.dependent;
        input.name = input.id;
        parent.appendChild(input);
        this.dependentInput = input;
    },
    createInputGroup: function(parent) {
        if (document.documentElement.getAttribute('data-doctype') != 'true')
            return;
        var divInputGroup = $('sys_display.' + this.id).wrap('div', {
            'class': 'input-group',
            'style': 'border-spacing:0'
        });
        var referenceIcon = $('list-edit-span')
        $('list-edit-span').remove();
        divInputGroup.appendChild(referenceIcon);
    },
    setRecord: function(record) {
        this.record = record;
    },
    _createHidden: function(parent, id, value) {
        var input = cel("input");
        input.type = "hidden";
        input.id = id;
        input.value = value;
        parent.appendChild(input);
        return input;
    },
    _setDependent: function() {
        if (this.dependent == null)
            return;
        var value = this.record.getValue(this.tableElement.getDependent());
        if ('NULL' === value)
            this.dependentInput.value = '';
        else
            this.dependentInput.value = value;
    },
    _onFocus: function(evt) {
        if (this.ac)
            return;
        this._setDependent();
        var dep = '';
        if (this.dependentInput)
            dep = "sys_dependent";
        var referenceValid = true;
        if (this.record && this.record.isReferenceValid)
            referenceValid = this.record.isReferenceValid();
        this.ac = new AJAXTableCompleter(this.input, this.id, dep, null, null, referenceValid);
        this.ac.elementName = this.refName;
        this.ac.setRefQual(this.refQual);
        this.ac.referenceSelect(this.refSysId, this.input.value, !referenceValid);
        this.ac.clearDerivedFields = false;
        for (var n in this.additionalValues)
            this.ac.setAdditionalValue(n, this.additionalValues[n]);
    },
    _onKeyDown: function(evt) {
        acReferenceKeyDown(this.input, evt);
    },
    _onKeyPress: function(evt) {
        acReferenceKeyPress(this.input, evt);
    },
    _onKeyUp: function(evt) {
        acReferenceKeyUp(this.input, evt);
    },
    _refListOpen: function(evt) {
        var te = this.tableElement;
        this._setDependent();
        var url = reflistOpenUrl(this.refName, this.id, te.getName(), te.getReference());
        for (var n in this.additionalValues)
            url += "&" + n + "=" + encodeText(this.additionalValues[n]);
        if (this.dependentInput)
            url += "&sysparm_dependent=" + escape(this.dependentInput.value);
        popupOpenStandard(url, "lookup");
        return false;
    },
    type: function() {
        return "AJAXReferenceControls";
    }
});;