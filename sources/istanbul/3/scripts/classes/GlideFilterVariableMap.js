/*! RESOURCE: /scripts/classes/GlideFilterVariableMap.js */
var GlideFilterVariableMap = Class.create(GlideFilterHandler, {
  _setup: function(values) {
    this.maxValues = 1;
    this.id = this.tr.tableField + "." + guid();
    this.selectedOption = values;
    this.usedFields = {};
    this.varTypes = {
      1: ['string']
    };
  },
  _build: function() {
    this.queryID = this.tr.tdValue.queryID;
    clearNodes(this.tr.tdValue);
    this.inputCnt = 0;
    if (this._isEmptyOper())
      return;
    this._hideOperators();
    this.select = this._addSelect(380, false, 1);
    this.select.onchange = this._updateFields.bind(this);
    var displayValue = gel('fancy.' + this.values[0]);
    if (displayValue && displayValue.value != '')
      this.select.value = displayValue.value;
    else if (this.values) {
      this.select.value = this.values;
    }
    this._buildVariableSelect();
    $(this.select).addClassName('filter_type');
    var $select = $j(this.select);
    if (!$select.data('select2'))
      $select.select2();
  },
  _buildVariableSelect: function() {
    if (this.values.length == 0 || this.values == '-- value --')
      addOption(this.select, this.values, getMessage("-- Select Variable --"), true);
    if (this.item == null)
      return;
    var arr = g_dynamic_filter_variable_options.split("##");
    for (var i = 0; i < arr.length; i++) {
      var aItem = arr[i];
      if (aItem.length == 0)
        continue;
      var aItemArr = aItem.split("::");
      if (aItemArr.length < 3)
        continue;
      var arrInput = [];
      arrInput.push(aItemArr[1]);
      var translated = getMessages(arrInput);
      addOption(this.select, aItemArr[0], translated[aItemArr[1]], this.selectedOption == aItemArr[0]);
    }
  },
  _hideOperators: function() {
    if (this.tr.tdOper)
      this.tr.tdOper.style.display = "none";
  },
  getValues: function() {
    this._clearValues();
    if (this._isMappingEnabled)
      return this.getMappingValue();
    var oper = this._getOperator();
    var input = this.inputs[0];
    if (input) {
      return input.value;
    } else
      return '';
  },
  _updateFields: function() {},
  _clearFieldUsed: function(name, condition) {
    this.usedFields[name] = false;
  },
  _buildType: function(gr) {
    this.vItem = new TableElement(gr.type, gr.type);
    if (gr.type == "1")
      this.vItem.setType("boolean");
    else if (gr.type == "8") {
      this.vItem.setType("reference");
      this.vItem.setReference(gr.reference);
    } else if (gr.type == "10") {
      this.vItem.setType("calendar");
    } else if (gr.type == "7") {
      this.vItem.setType("checkbox");
    } else if (gr.type == "18" || gr.type == "22" || gr.type == "3") {
      this.vItem.setType("multiple_choice");
    } else if (gr.type == "5") {
      this.vItem.setType("select");
    } else if (gr.type == "4") {
      this.vItem.setType("numeric_scale");
    } else if (gr.type == "9") {
      this.vItem.setType("calendar");
    }
  },
  z: null
});;