/*! RESOURCE: /scripts/classes/GlideFilterHandlers.js */
var GlideFilterHandler = Class.create({
  MAP_OPEN: "$" + "{",
  filterClass: "",
  initialize: function(tableName, item, mappingId) {
    this.maxValues = 0;
    this.tableName = tableName;
    this.item = item;
    this.isRightOperandShowingRelatedFields = false;
    this.lastOperator = null;
    this.mappingId = mappingId;
  },
  destroy: function() {
    if (this.tr) {
      if (this.tr.operSel)
        this.tr.operSel.onchange = null;
      this.tr = null;
    }
    for (i = 0; i < this.inputCnt; i++) {
      this.inputs[i].onkeypress = null;
      this.inputs[i].onchange = null;
      this.inputs[i] = null;
    }
    this.destroyMappingSupport();
  },
  create: function(tr, values, filterClass) {
    this.tr = tr;
    if (values && values.indexOf(this.MAP_OPEN) != -1) {
      console.log("implement GlideFilterHandler#create mapping support");
    }
    this._setup(values);
    this._init(values);
    this._build(filterClass);
    if (this.listenForOperChange)
      this.tr.operSel.onchange = this._operOnChange.bind(this);
    this.isRightOperandShowingRelatedFields = false;
    this.lastOperator = this._getOperator();
  },
  _setup: function(values) {},
  getTableName: function() {
    return this.tableName;
  },
  getFilterText: function(oper) {
    return '';
  },
  _init: function(values) {
    this._initValues(values);
    this._initialMappingValue = values;
    this._initInputs();
  },
  _initValues: function(values) {
    var op = this._getOperator();
    if (!values) {
      this.values = [];
    } else if (this.tr && this.tr.varType === "variables" && !this.userDateFormat) {
      this.values = [values];
    } else {
      if (this.tr && this.tr.varType === "boolean") {
        if (values === "0")
          values = "false";
        else if (values === "1")
          values = "true";
      }
      this.values = values.split("@");
    }
    for (var i = this.values.length; i < this.maxValues; i++)
      this.values[i] = "";
  },
  _initInputs: function() {
    this.inputCnt = 0;
    this.inputs = [];
    for (var i = 0; i < this.maxValues; i++)
      this.inputs[i] = null;
  },
  _clearValues: function() {
    this.values = [];
    for (var i = 0; i < this.maxValues; i++)
      this.values[i] = "";
  },
  _isEmptyOper: function() {
    var op = this._getOperator();
    if (op == 'ISEMPTY' || op == 'ISNOTEMPTY' || op == 'ANYTHING' || op == 'EMPTYSTRING' || op == 'VALCHANGES') {
      this._clearValues();
      return true;
    }
    return false;
  },
  _getOperator: function() {
    return getSelectedOption(this.tr.operSel).value;
  },
  _getInputValue: function(el) {
    var value = "";
    if (el == null)
      return value;
    if (el.tagName.toUpperCase() == "TEXTAREA")
      return el.value;
    if (el.tagName.toUpperCase() == "INPUT")
      return this._escapeIfRequired(el.value);
    var options = el.options;
    if (el.multiple) {
      var vals = [];
      for (var i = 0; i < options.length; i++) {
        if (options[i].selected)
          vals.push(options[i].value);
      }
      return vals.join(",");
    }
    return options[el.selectedIndex].value;
  },
  _escapeIfRequired: function(value) {
    if (this._getOperator() == "BETWEEN") {
      if (value == null) {
        for (var i = 0; i < this.values; i++)
          this.values[i] = this._escape(this.values[i]);
        return this.values;
      }
      return this._escape(value);
    }
    return value;
  },
  _escape: function(value) {
    if (value == null)
      return;
    value = value.replace(/\\/g, "\\\\")
    value = value.replace(/@/g, "\\@")
    return value;
  },
  _unescapeIfRequired: function() {
    if (this._getOperator() == "BETWEEN")
      for (var i = 0; i < this.values.length; i++)
        this.values[i] = this._unescape(this.values[i]);
  },
  _unescape: function(value) {
    return this._parseValues(value, '@')[0];
  },
  _addTextInput: function(type, td) {
    if (!td)
      td = this.tr.tdValue;
    if (!this._isEmptyOper()) {
      if (this.tr.tdMapping)
        this.tr.tdMapping.show();
    }
    var associatedField = this.item && this.item.label;
    var input = addTextInput(td, this.values[this.inputCnt], type, associatedField);
    this.inputs[this.inputCnt] = input;
    this.inputCnt++;
    return input;
  },
  _addInvisibleTextInput: function(type, td) {
    var input = $(this._addTextInput(type, td));
    input.addClassName('sr-only');
    input.setAttribute('disabled', 'disabled');
    this.inputCnt--;
    this.inputs.pop();
    getMessage('No value needed', function(msg) {
      input.value = msg;
    });
  },
  _addBetweenTextInput: function(type, td) {
    if (!td)
      td = this.tr.tdValue;
    var associatedField = this.item && this.item.label;
    var input = addTextInput(td, this.values[this.inputCnt], type, associatedField);
    this.inputs[this.inputCnt] = input;
    this.inputCnt++;
    return input;
  },
  _addTextArea: function() {
    if (!this._isEmptyOper()) {
      if (this.tr.tdMapping)
        this.tr.tdMapping.show();
    }
    var associatedField = this.item && this.item.label;
    var input = addTextArea(this.tr.tdValue, this.values[this.inputCnt], associatedField);
    this.inputs[this.inputCnt] = input;
    this.inputCnt++;
    return input;
  },
  _addSelect: function(width, multi, size) {
    var associatedField = this.item && this.item.label;
    var s = _createFilterSelect(width, multi, associatedField);
    this.tr.tdValue.setAttribute("data-value", associatedField);
    this.tr.tdValue.appendChild(s);
    this.inputs[this.inputCnt] = s;
    this.inputCnt++;
    return s;
  },
  _operOnChange: function() {
    var lastOp = this.lastOperator;
    this.lastOperator = this._getOperator();
    if ((fieldComparisonOperators.indexOf(lastOp) >= 0) != (fieldComparisonOperators.indexOf(this.lastOperator) >= 0) || lastOp == "DYNAMIC") {
      this.inputCnt = 0;
      this.input = [];
    }
    this.getValues();
    this._unescapeIfRequired();
    this._build();
  },
  _isTemplate: function() {
    var t = this.tr;
    while (t) {
      t = findParentByTag(t, 'table');
      if (t) {
        var id = t.id + '';
        if (id.indexOf('filters_table') != -1)
          break;
      }
    }
    if (!t)
      return false;
    return t.getAttribute('gsft_template') == 'true';
  },
  _renderDynamicOperandInput: function(op) {
    if (typeof g_dynamic_filter_options == "undefined")
      return false;
    if (op != "DYNAMIC")
      return false;
    var addedReferenceInput = false;
    var arr = g_dynamic_filter_options.split("##");
    for (var i = 0; i < arr.length; i++) {
      var aItem = arr[i];
      if (aItem.length == 0)
        continue;
      var aItemArr = aItem.split("::");
      if (aItemArr.length < 3)
        continue;
      var isExclusiveDynamic = typeof gtf_exclusive_dynamics != 'undefined' && gtf_exclusive_dynamics == "true";
      if (!isExclusiveDynamic && this.item && this.item.getReference() == aItemArr[2] || this.originalTableName == aItemArr[3]) {
        if (!addedReferenceInput)
          var input = this._addSelect(180, false, 1);
        var arrInput = [];
        arrInput.push(aItemArr[1]);
        var translated = getMessages(arrInput);
        addOption(input, aItemArr[0], translated[aItemArr[1]], this.rightOperand == aItemArr[0]);
        addedReferenceInput = true;
      }
    }
    return addedReferenceInput;
  },
  setOriginalTable: function(tableNameFull) {
    if (tableNameFull.indexOf(".") == -1)
      this.originalTableName = tableNameFull;
    else
      this.originalTableName = tableNameFull.split(".")[1];
  },
  getValues: function() {
    this._clearValues();
    if (this.inputCnt == 0)
      return "";
    for (var i = 0; i < this.maxValues; i++)
      this.values[i] = this._getInputValue(this.inputs[i]);
    if (this._isMappingEnabled)
      return this.getMappingValue();
    if (this.inputCnt == 1)
      return this.values[0];
    else
      return this.values.join("@");
  },
  _populateRightOperandChoices: function() {
    var field = this.item.name;
    var table = "";
    if (typeof mainFilterTable == "undefined")
      table = firstTable;
    else
      table = mainFilterTable;
    var selection = this.values[0];
    if (null != table && "" != table && null != field && "" != field) {
      var s = this._addSelect(this.width, false, 1);
      s.onchange = this.rightOperandfieldOnChange.bind(s, table, this);
      var completeSelection = "";
      if (selection)
        completeSelection = table + '.' + selection;
      else
        completeSelection = table;
      var showRelatedFields = "no";
      if (this.isRightOperandShowingRelatedFields || (selection && selection.indexOf(".") >= 0))
        showRelatedFields = "yes";
      this.addChoices(s, completeSelection, "",
        this._filterRightOperand, selection, null,
        showRelatedFields, this.item);
      if (null != selection)
        this.selectRightOperand(s, selection);
    }
  },
  selectRightOperand: function(select, selection) {
    var o = getSelectedOption(select);
    var options = select.options;
    for (var i = 0; i < options.length; i++) {
      var option = options[i];
      if (null != option && option.value == selection) {
        option.innerHTML = getFullLabel(option);
        option.style.color = 'green';
        option.wasSelected = 'true';
        select.style.width = "240px";
        option.selected = true;
        select.selectedIndex = i;
        break;
      }
    }
  },
  _getReportTable: function() {
    return firstTable;
  },
  rightOperandfieldOnChange: function(table, t) {
    var fieldName = this.value;
    var idx = fieldName.indexOf("...");
    var f = fieldName.substring(0, idx);
    if (f != table)
      f = table + "." + f;
    f = f + ".";
    if (idx != -1) {
      if (fieldName == '...Show Related Fields...') {
        t.isRightOperandShowingRelatedFields = true;
        t.addChoices(this, f, "", t._filterRightOperand,
          fieldName, null, "yes", t.item);
      } else if (fieldName == '...Remove Related Fields...') {
        t.isRightOperandShowingRelatedFields = false;
        t.addChoices(this, f, "", t._filterRightOperand,
          fieldName, null, "no", t.item);
      } else {
        t.isRightOperandShowingRelatedFields = true;
        t.addChoices(this, f, "", t._filterRightOperand,
          fieldName, null, "yes", t.item);
      }
      return;
    }
    var o = getSelectedOption(this);
    var fieldName = o.value;
    var name = currentTable = getTableFromOption(o);
    var options = this.options;
    for (var i = 0; i < options.length; i++) {
      var option = options[i];
      if (optionWasSelected(option)) {
        option.innerHTML = getNormalLabel(option);
        option.style.color = 'black';
        option.wasSelected = 'false';
        break;
      }
    }
    if (setup(name) == false)
      return;
    var tr = this.parentNode.parentNode;
    o.normalLabel = o.innerHTML;
    o.innerHTML = getFullLabel(o);
    o.style.color = 'green';
    o.wasSelected = 'true';
    this.style.width = "240px";
  },
  addChoices: function(s, target, fValue, filterMethod, fieldName, filter, showRelated, leftOperandElement) {
    var forFilter;
    var onlyRestrictedFields;
    if (filter) {
      forFilter = filter.getOpsWanted();
      onlyRestrictedFields = filter.onlyRestrictedFields;
    }
    var messages = getMessages(MESSAGES_CONDITION_RELATED_FILES);
    while (s.length > 0)
      s.remove(0);
    var placeholder = false;
    var selindex = 0;
    var indentLabel = false;
    var savedItems = new Object();
    var savedLabels = new Array();
    var labelPrefix = '';
    var headersAdded = false;
    var parts = target.split(".");
    var tableName = parts[0];
    var tableDef = getTableReference(tableName);
    var extension = '';
    var prefix = '';
    if (parts.length > 1 && parts[1] != null && parts[1] != '') {
      var o = null;
      if (filterExpanded && parts.length > 2) {
        var tableLabel = tableDef.getLabel();
        if (tableLabel == null)
          tableLabel = "Parent";
        o = addOption(s, tableDef.getName() + "...", tableLabel +
          " " + messages['lowercase_fields'], false);
        o.tableName = tableDef.getName();
        o.style.color = 'blue';
      }
      if (parts[1] == PLACEHOLDERFIELD) {
        o = addOption(s, PLACEHOLDER,
          messages['-- choose field --'], true);
        o.style.color = 'blue';
        o.tableName = tableDef.getName();
        o.fullLabel = messages['-- choose field --'];
        placeholder = true;
      }
      var sPeriod = "";
      var cname = '';
      for (var i = 1; i < parts.length - 1; i++) {
        var f = parts[i];
        if (f == null || f == '')
          break;
        var elementDef = tableDef.getElement(parts[i]);
        if (elementDef == null)
          break;
        var childTable = tableName;
        if (elementDef.isReference()) {
          childTable = elementDef.getReference();
          if (elementDef.isExtensionElement())
            extension = childTable;
          else
            extension = '';
        } else {
          if (fieldName != null && fieldName.indexOf("...") > -1) {
            childTable = parts[0];
          } else {
            break;
          }
        }
        var parentTable = (extension != '') ? extension : elementDef.getTable().getName();
        var tableDef = getTableReference(childTable, parentTable);
        if (cname.length)
          cname = cname + ".";
        cname += elementDef.getName();
        sPeriod = "." + sPeriod;
        var clabel = sPeriod + elementDef.getLabel() + "-->" +
          elementDef.getRefLabel() + " " +
          messages['lowercase_fields'];
        o = addOption(s, cname + "...", clabel, false);
        o.tablename = tableDef.getName();
        o.style.color = 'blue';
        selindex++;
        indentLabel = true;
        headersAdded = true;
        if (labelPrefix.length)
          labelPrefix += ".";
        labelPrefix += elementDef.getLabel();
        if (prefix.length)
          prefix += ".";
        prefix += elementDef.getName();
      }
    }
    columns = tableDef.getColumns();
    queueColumns[tableDef.getName()] = columns;
    var textIndex = false;
    if (!noOps && !indentLabel) {
      var root = columns.getElementsByTagName("xml");
      if (root != null && root.length == 1) {
        root = root[0];
        textIndex = root.getAttribute("textIndex");
      }
    }
    var items = (extension != '') ? tableDef.getTableElements(extension) : tableDef.getElements();
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var t = item.getName();
      if (filterMethod != null && t != fValue) {
        if (filterMethod(leftOperandElement, item,
            this.isRightOperandShowingRelatedFields) == true) {
          continue;
        }
      }
      var t = item.getName();
      if (prefix != '')
        t = prefix + '.' + t;
      if (!noOps && item.getAttribute("filterable") == "no" && !allowConditionsForJournal(item.getAttribute("type"), filter))
        continue;
      if (!item.canRead()) {
        if (t != fValue) {
          continue;
        } else {
          item.setCanRead('yes');
        }
      }
      if (!item.isActive()) {
        if (t != fValue) {
          continue;
        } else {
          item.setActive('yes');
        }
      }
      var label = item.getLabel();
      if ((!elementDef || elementDef.getType() != "glide_var") &&
        !item.isReference()) {
        savedItems[label] = t;
        savedLabels[savedLabels.length] = label;
      }
      if (item.isReference() && leftOperandElement.isReference()) {
        if (item.getReference() == leftOperandElement.getReference()) {
          savedItems[label] = t;
          savedLabels[savedLabels.length] = label;
        }
      }
      if (item.isReference() && !item.isRefRotated() &&
        item.getType() != 'glide_list' && filterExpanded &&
        showRelated == 'yes') {
        label += "-->" + item.getRefLabel();
        label += " " + messages['lowercase_fields'];
        t += "...";
        savedItems[label] = t;
        savedLabels[savedLabels.length] = label;
      }
    }
    items = tableDef.getExtensions();
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var label = item.getLabel() + " (+)";
      t = item.getExtName() + "...";
      if (prefix != '')
        t = prefix + '.' + t;
      savedItems[label] = t;
      savedLabels[savedLabels.length] = label;
    }
    if (!onlyRestrictedFields &&
      ((fValue == TEXTQUERY || textIndex) &&
        filterMethod == null || forFilter)) {
      o = addOption(s, TEXTQUERY, messages['Keywords'], (fValue == TEXTQUERY));
      o.fullLabel = messages['Keywords'];
    }
    for (var i = 0; i < savedLabels.length; i++) {
      var sname = savedLabels[i];
      var o = addOption(s, savedItems[sname], sname, savedItems[sname] == fValue);
      o.tableName = tableDef.getName();
      if (labelPrefix != '')
        o.fullLabel = labelPrefix + "." + sname;
      else
        o.fullLabel = sname;
      if (indentLabel) {
        var yyy = o.innerHTML;
        o.innerHTML = "&nbsp;&nbsp;&nbsp;" + yyy;
      }
      var v = o.value;
      if (v.indexOf("...") != -1)
        if (o.fullLabel.indexOf("(+)") == -1)
          o.style.color = 'blue';
        else
          o.style.color = 'darkred';
    }
    if (filterExpanded && !onlyRestrictedFields) {
      if (showRelated != 'yes') {
        var o = addOption(s, "...Show Related Fields...", messages['Show Related Fields'], false);
        o.style.color = 'blue';
      } else {
        var o = addOption(s, "...Remove Related Fields...", messages['Remove Related Fields'], false);
        o.style.color = 'blue';
      }
    }
    if (!placeholder && (s.selectedIndex == 0 && ((textIndex && fValue != TEXTQUERY) || headersAdded)))
      s.selectedIndex = selindex;
    if (s.selectedIndex >= 0) {
      fValue = getSelectedOption(s).value;
    }
    return s;
  },
  _filterRightOperand: function(leftOperandElement, rightOperandElement, isRightOperandShowingRelatedFields) {
    var filterOut = true;
    if (null != leftOperandElement && null != rightOperandElement) {
      var leftType = leftOperandElement.getType();
      var rightType = rightOperandElement.getType();
      if ('reference' != leftType) {
        if ('reference' == rightType && isRightOperandShowingRelatedFields)
          filterOut = false;
        if (leftType == rightType)
          filterOut = false;
      } else {
        if ('reference' == rightType)
          filterOut = false;
      }
    }
    return filterOut;
  },
  _renderRightOperandAsFieldList: function(operation) {
    if ("SAMEAS" == operation || "NSAMEAS" == operation ||
      "GT_FIELD" == operation || "LT_FIELD" == operation ||
      "GT_OR_EQUALS_FIELD" == operation ||
      "LT_OR_EQUALS_FIELD" == operation)
      return true;
    return false;
  },
  _addSameAsLabels: function(t, op) {
    if (op == 'SAMEAS' || op == 'NSAMEAS') {
      var ASMSG = getMessage('as');
      var FROMMSG = getMessage('from');
      var span = cel("span", t.tr.tdValue);
      span.style.marginLeft = "3px";
      span.style.marginRight = "5px";
      if (op == 'SAMEAS')
        span.innerHTML = ASMSG;
      else
        span.innerHTML = FROMMSG;
    }
  },
  _parseValues: function(value, delimiter) {
    var sb = "";
    var parts = [];
    if (value == null)
      value = ""
    var escapeChar = '\\';
    var escaped = false;
    for (var i = 0; i < value.length; i++) {
      var checkChar = value.substr(i, 1);
      if (!escaped) {
        if (checkChar == escapeChar) {
          escaped = true;
          continue;
        }
        if (checkChar == delimiter) {
          parts.push(sb);
          sb = "";
          continue;
        }
      } else
        escaped = false;
      sb += checkChar;
    }
    parts.push(sb);
    return parts;
  },
  setFilterClass: function(filterClass) {
    this.filterClass = filterClass;
  },
  getFilterClass: function() {
    return this.filterClass;
  },
  initMappingSupport: function(shouldEnable, type, mappingMgr) {
    var that = this;
    var td = this.tr.tdMapping;
    this._parentMappingMgr = mappingMgr;
    if (!td || !mappingMgr)
      return;
    this.mappingType = type;
    if (shouldEnable) {
      td.innerHTML = '<input type="hidden" class="mapping_condition_input" >';
    } else {
      td.innerHTML = "";
    }
    this.mappingInput = td.querySelector(".mapping_condition_input");
    var value = this._initialMappingValue || "";
    this._initMappingValue(value);
    this._initialMappingValue = null;
    this._parentMappingMgr.initElement(this);
  },
  _initMappingValue: function(value) {
    if (value.indexOf("{{") !== -1) {
      this.setMappingValue(value);
      this.activateMapping();
    } else {
      this.deactivateMapping();
    }
  },
  destroyMappingSupport: function() {
    if (this._parentMappingMgr && typeof this._parentMappingMgr.destroyElement === "function")
      this._parentMappingMgr.destroyElement(this);
  },
  activateMapping: function() {
    this._isMappingEnabled = true;
    if (!this.tr)
      return;
    this.tr.tdValue.style.display = "none";
    addClassName(this.tr.tdMapping, "active");
    if (this._parentMappingMgr && typeof this._parentMappingMgr.notifyStateChange === "function")
      this._parentMappingMgr.notifyStateChange(this);
  },
  deactivateMapping: function() {
    this._isMappingEnabled = false;
    if (!this.tr)
      return;
    this.tr.tdValue.style.display = "";
    removeClassName(this.tr.tdMapping, "active");
    if (this._parentMappingMgr && typeof this._parentMappingMgr.notifyStateChange === "function")
      this._parentMappingMgr.notifyStateChange(this);
  },
  _getMappingInput: function() {
    return this.tr.tdMapping.querySelector(".mapping_condition_input");
  },
  getMappingValue: function() {
    return this._getMappingInput().value;
  },
  setMappingValue: function(value) {
    this._getMappingInput().value = value;
  },
  type: "GlideFilterHandlers"
});
var GlideFilterString = Class.create(GlideFilterHandler, {
  _setup: function(values) {
    this.maxValues = 2;
    this.listenForOperChange = true;
    this.rightOperand = values;
  },
  _build: function() {
    clearNodes(this.tr.tdValue);
    this.inputCnt = 0;
    if (this._isEmptyOper()) {
      this._addInvisibleTextInput();
      if (this.tr.tdMapping)
        this.tr.tdMapping.hide();
      return;
    }
    var op = this._getOperator();
    if (this._renderDynamicOperandInput(op))
      return;
    if (this._renderRightOperandAsFieldList(op)) {
      this._addSameAsLabels(this, op);
      this._populateRightOperandChoices();
    } else if (op == 'IN') {
      var saveMe = useTextareas;
      useTextareas = true;
      var inp = this._addTextArea();
      inp.style.width = '20em';
      var v = this.values[this.inputCnt - 1];
      if (this._isTemplate()) {
        inp.value = v;
      } else {
        if (v) {
          if (isMSIE)
            v = v.replace(/,/g, '\n\r');
          else
            v = v.replace(/,/g, '\n');
          inp.value = v;
        }
      }
      useTextareas = saveMe;
    } else
      this._addTextInput();
    if (op == "BETWEEN") {
      var txt = document.createTextNode(" " + getMessage('and') + " ");
      this.tr.tdValue.appendChild(txt);
      this._addTextInput();
    }
  },
  _getInputValue: function(el) {
    if (el == null)
      return '';
    if (!(el.tagName.toUpperCase() == "TEXTAREA"))
      return GlideFilterHandler.prototype._getInputValue.call(this, el);
    var value = el.value + '';
    if (!this._isTemplate()) {
      value = value.replace(/[\n\t]/g, ',');
      value = value.replace(/\r/g, '');
    }
    return this._escapeIfRequired(value);
  },
  _initMappingValue: function(value) {
    this.setMappingValue(value);
    this.activateMapping();
  },
  getValues: function() {
    this._clearValues();
    if (this.inputCnt == 0)
      return "";
    for (var i = 0; i < this.maxValues; i++)
      this.values[i] = this._getInputValue(this.inputs[i]);
    if (this._isMappingEnabled)
      return this.getMappingValue();
    if (this.inputCnt == 1)
      return this.values[0];
    else {
      this._escapeIfRequired();
      return this.values.join("@");
    }
  },
  _initInputs: function() {
    if (this._getOperator() == "DYNAMIC") {
      this.inputCnt = 1;
      this.maxValues = 1;
    } else
      this.inputCnt = 0;
    this.inputs = [];
    for (var i = 0; i < this.maxValues; i++)
      this.inputs[i] = null;
  },
  _initValues: function(values) {
    var op = this._getOperator();
    if (op == "BETWEEN") {
      if (!values)
        this.values = [];
      else
        this.values = this._parseValues(values, "@");
      for (var i = this.values.length; i < this.maxValues; i++)
        this.values[i] = "";
    } else {
      this.values = [];
      this.values[0] = values;
    }
  },
  type: "GlideFilterString"
});
var GlideFilterNumber = Class.create(GlideFilterString, {
  _initValues: function(values) {
    var op = this._getOperator();
    if (op == "BETWEEN") {
      if (!values)
        this.values = [];
      else
        this.values = values.split("@");
      for (var i = this.values.length; i < this.maxValues; i++)
        this.values[i] = "";
    } else {
      this.values = [];
      this.values[0] = values;
    }
  },
  type: "GlideFilterNumber"
});
var GlideFilterDuration = Class.create(GlideFilterHandler, {
  _setup: function(values) {
    this.maxValues = 2;
    var valueArray = this._parseValues(values, "@");
    this.duration = new GlideDuration(valueArray[0], this.item);
    if (this._getOperator() == "BETWEEN") {
      this.maxValues = 2;
      if (valueArray.length > 1)
        this.durationTo = new GlideDuration(valueArray[1], this.item);
      else
        this.durationTo = new GlideDuration(valueArray[0], this.item);
    }
    this.listenForOperChange = true;
  },
  destroy: function() {
    if (this.tr)
      this.tr.tdValue.innerHTML = "";
    this.inputCnt = 0;
    GlideFilterHandler.prototype.destroy.call(this);
  },
  _initValues: function(values) {
    this.values = new Array();
    this.values[0] = this.duration.getDays();
    this.values[1] = this.duration.getHours();
    this.values[2] = this.duration.getMinutes();
    this.values[3] = this.duration.getSeconds();
    this.inputCnt = 4;
    if (this._getOperator() == "BETWEEN") {
      this.values[4] = this.duration.getDays();
      this.values[5] = this.duration.getHours();
      this.values[6] = this.duration.getMinutes();
      this.values[7] = this.duration.getSeconds();
      this.inputCnt = 8;
    }
  },
  getValues: function() {
    this._clearValues();
    if (this.inputCnt == 0)
      return "";
    var answer = this.duration.getValue();
    this.values[0] = this.duration.getDays();
    this.values[1] = this.duration.getHours();
    this.values[2] = this.duration.getMinutes();
    this.values[3] = this.duration.getSeconds();
    if (this._isMappingEnabled)
      return this.getMappingValue();
    if (this._getOperator() == "BETWEEN") {
      if (this.durationTo) {
        var answer1 = this.durationTo.getValue();
        this.values[4] = this.durationTo.getDays();
        this.values[5] = this.durationTo.getHours();
        this.values[6] = this.durationTo.getMinutes();
        this.values[7] = this.durationTo.getSeconds();
        return "javascript:gs.getDurationDate('" + answer + "')@javascript:gs.getDurationDate('" + answer1 + "')";
      }
    }
    return "javascript:gs.getDurationDate('" + answer + "')";
  },
  _build: function() {
    clearNodes(this.tr.tdValue);
    this.inputCnt = 0;
    if (this._isEmptyOper()) {
      this._addInvisibleTextInput();
      if (this.tr.tdMapping)
        this.tr.tdMapping.hide();
      return;
    } else if (this.tr.tdMapping)
      this.tr.tdMapping.show();
    if (this._renderRightOperandAsFieldList(this._getOperator())) {
      this._addSameAsLabels(this, this._getOperator());
      this._populateRightOperandChoices();
    } else {
      this.inputCnt = 1;
      this.duration.buildHTML(this.tr.tdValue);
      if (this._getOperator() == "BETWEEN" && this.maxValues == 2) {
        var txt = document.createTextNode(" " + getMessage('and') + " ");
        this.tr.tdValue.appendChild(txt);
        if (!this.durationTo)
          this.durationTo = new GlideDuration();
        this.durationTo.buildHTML(this.tr.tdValue);
      }
    }
  },
  type: "GlideFilterDuration"
});
var GlideFilterStringMulti = Class.create(GlideFilterString, {
  _setup: function(values) {
    this.maxValues = 1;
    this.listenForOperChange = true;
  },
  _build: function() {
    clearNodes(this.tr.tdValue);
    this.inputCnt = 0;
    if (this._isEmptyOper()) {
      this._addInvisibleTextInput();
      return;
    }
    if (this._renderDynamicOperandInput(this._getOperator()))
      return;
    if (this._renderRightOperandAsFieldList(this._getOperator())) {
      this._addSameAsLabels(this, this._getOperator());
      this._populateRightOperandChoices();
    } else
      this._addTextArea();
  },
  type: "GlideFilterStringMulti"
});
var GlideFilterChoice = Class.create(GlideFilterHandler, {
  _setup: function(values) {
    this.maxValues = 2;
    this.listenForOperChange = true;
  },
  setChoices: function(choices) {
    this.choices = choices;
  },
  setWidth: function(width) {
    this.width = width;
  },
  setMulti: function(multi) {
    this.multi = multi;
  },
  setSize: function(size) {
    this.size = size;
  },
  _build: function() {
    clearNodes(this.tr.tdValue);
    this.inputCnt = 0;
    if (this._isEmptyOper()) {
      this._addInvisibleTextInput();
      if (this.tr.tdMapping)
        this.tr.tdMapping.hide();
      return;
    }
    if (this._renderRightOperandAsFieldList(this._getOperator())) {
      this._addSameAsLabels(this, this._getOperator());
      this._populateRightOperandChoices();
    } else {
      var s = this._addSelect(this.width, this.multi, this.size);
      this._fillSelect();
    }
  },
  _fillSelect: function(inputIndex) {
    if (inputIndex == null)
      inputIndex = 0;
    if (!this._isEmptyOper() && this.tr.tdMapping)
      this.tr.tdMapping.show();
    var vars = {};
    if (this.values[inputIndex]) {
      var valSplit = this.values[inputIndex].split(',');
      for (var i = 0; i < valSplit.length; i++) {
        vars[valSplit[i]] = true;
      }
    }
    var removeNone = false;
    var oper = this._getOperator();
    if ((oper == 'IN') || (oper == 'NOT IN'))
      removeNone = true;
    if (isMSIE && this.inputs[0].multiple) {
      var isIE6 = /MSIE 6/.test(navigator.userAgent);
      if (isIE6)
        this.inputs[0].focus();
    }
    for (var i = 0; i < this.choices.length; i++) {
      var option = this.choices[i];
      if (option[0] == '' && removeNone)
        continue;
      var selected = (vars[option[0]] != null || this.values[inputIndex] == option[0]);
      addOption(this.inputs[inputIndex], option[0], option[1], selected);
    }
  },
  type: "GlideFilterChoice"
});
var GlideFilterChoiceDynamic = Class.create(GlideFilterChoice, {
  _initValues: function(values) {
    this.values = (typeof values !== "undefined") ? [values] : [];
  },
  _setup: function(values) {
    this.size = 4;
    this.maxValues = 2;
    this.listenForOperChange = true;
  },
  setChoices: function(choices) {
    this.choices = choices;
  },
  _initMappingValue: function(value) {
    this.mappingType = 'choice';
    if (value.indexOf("{{") !== -1) {
      this.setMappingValue(value);
      this.activateMapping();
    } else {
      this.deactivateMapping();
    }
  },
  _build: function() {
    clearNodes(this.tr.tdValue);
    this.inputCnt = 0;
    if (this._isEmptyOper()) {
      this._addInvisibleTextInput();
      if (this.tr.tdMapping)
        this.tr.tdMapping.hide();
      return;
    }
    var oper = this._getOperator();
    if (this._renderRightOperandAsFieldList(oper)) {
      this._addSameAsLabels(this, oper);
      this._populateRightOperandChoices();
    } else if ((oper == 'LIKE') || (oper == 'STARTSWITH') || (oper == 'ENDSWITH') || (oper == 'NOT LIKE')) {
      if (this.prevOper && (this.prevOper != 'LIKE') && (this.prevOper != 'STARTSWITH') && (this.prevOper != 'ENDSWITH'))
        this._clearValues();
      this._addTextInput();
    } else if ((oper == 'IN') || (oper == 'NOT IN')) {
      this.multi = true;
      var s = this._addSelect(this.width, this.multi, this.size);
      if (!this.hasChoices) {
        s.disabled = true;
        this._getChoices();
      } else
        this._fillSelect();
    } else if (oper == 'BETWEEN') {
      this.multi = false;
      var s = this._addSelect(this.width, this.multi, 1);
      if (!this.hasChoices) {
        s.disabled = true;
        this._getChoices();
      } else
        this._fillSelect();
      var txt = document.createTextNode(" " + getMessage('and') + " ");
      this.tr.tdValue.appendChild(txt);
      this.multi = false;
      var s = this._addSelect(this.width, this.multi, 1);
      if (!this.hasChoices) {
        s.disabled = true;
        this._getChoices();
      } else
        this._fillSelect(1);
    } else {
      this.multi = false;
      var s = this._addSelect(this.width, this.multi, 1);
      if (!this.hasChoices) {
        s.disabled = true;
        this._getChoices();
      } else
        this._fillSelect();
    }
    this.prevOper = oper;
  },
  _getChoices: function() {
    if (typeof g_filter_description != 'undefined' && g_filter_description.getChoiceList(this.tr.tableField) != null) {
      var response = loadXML(g_filter_description.getChoiceList(this.tr.tableField));
      this._addChoices(response);
    } else {
      var ajax = new GlideAjax('PickList');
      ajax.addParam('sysparm_chars', '*');
      ajax.addParam('sysparm_nomax', 'true');
      ajax.addParam('sysparm_name', this.tr.tableField);
      if (this.tr.includeExtendedChoices === 'false')
        ajax.addParam('sysparm_include_extended_choices', 'false');
      var response = ajax.getXMLWait();
      this._addChoices(response);
    }
  },
  _addChoices: function(xml) {
    if (!xml)
      return;
    var msg = new GwtMessage();
    var select = this.inputs[0];
    select.disabled = false;
    select.options.length = 0;
    this.choices = [];
    this.hasChoices = true;
    var root = xml.documentElement;
    var dep = root.getAttribute("dependent");
    var items = xml.getElementsByTagName("item");
    var addNone = (root.getAttribute("include_none") === "false") ? false : true;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (item.getAttribute("value") == '')
        addNone = false;
    }
    if (addNone)
      this.choices[0] = ['', msg.getMessage('-- None --')];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var v = item.getAttribute("value");
      var l = item.getAttribute("label");
      var option = [v, l];
      this.choices.push(option);
    }
    if (dep != null) {
      this.choices = this.choices
        .sort(function(a, b) {
          if ((a[1].toLowerCase() + "") < (b[1]
              .toLowerCase() + "")) {
            return -1;
          }
          if ((a[1].toLowerCase() + "") > (b[1]
              .toLowerCase() + "")) {
            return 1;
          }
          return 0;
        });
      for (var i = 0; i < this.choices.length - 1; i++) {
        if (this.choices[i][1] == this.choices[i + 1][1])
          i = this.amendLabel(i);
      }
    }
    this._fillSelect();
  },
  amendLabel: function(i) {
    var dupe = this.choices[i][1];
    while (i < this.choices.length && this.choices[i][1] == dupe) {
      var c = this.choices[i];
      c[1] = c[1] + " - " + c[0];
      i++;
    }
    return i - 1;
  },
  type: "GlideFilterChoiceDynamic"
});
var GlideFilterSnapshotChoice = Class.create(GlideFilterChoiceDynamic, {
  _getChoices: function() {
    this._addChoices(this.item.attributes.options);
  },
  _addChoices: function(options) {
    if (!options)
      return;
    var select = this.inputs[0];
    select.disabled = false;
    select.options.length = 0;
    this.hasChoices = true;
    this.choices = JSON.parse(options);
    this._fillSelect();
  },
  type: "GlideFilterSnapshotChoice"
});
var GlideFilterCurrency = Class.create(GlideFilterString, {
  initialize: function(tableName, item) {
    GlideFilterHandler.prototype.initialize.call(this, tableName, item);
  },
  _operOnChange: function() {
    var lastOp = this.lastOperator;
    this.lastOperator = this._getOperator();
    if ((fieldComparisonOperators.indexOf(lastOp) >= 0) != (fieldComparisonOperators.indexOf(this.lastOperator) >= 0)) {
      this.inputCnt = 0;
      this.input = [];
    }
    this.getValues();
    if (lastOp != 'BETWEEN' && this._getOperator() == 'BETWEEN') {
      this.values[2] = this.values[1];
      this.values[1] = '';
    }
    this._unescapeIfRequired();
    this._build();
  },
  _setup: function(values) {
    this.maxValues = 2;
    this.id = this.tr.tableField + "." + guid();
    this.listenForOperChange = true;
  },
  _build: function() {
    GlideFilterString.prototype._build.call(this);
    var s = this._addSelect(60, false, 1);
    this._getCurrencies(s);
  },
  _getCurrencies: function(s) {
    var currencies = new Array();
    if (currencies.length != 0)
      return currencies;
    var ajax = new GlideAjax("CurrencyConverter");
    ajax.addParam("sysparm_name", "getCurrencies");
    ajax.getXMLAnswer(this._getCurrenciesResponse.bind(this), null, s);
  },
  _getCurrenciesResponse: function(answer, s) {
    var values = answer;
    var currencies = values.split(",");
    var cache = this._getCache();
    cache.put("currencies", values);
    for (var i = 0; i < currencies.length; i++)
      addOption(s, currencies[i], currencies[i]);
    this.currency_widget = s;
    this._parseValue();
  },
  _resolveFromCache: function() {
    var cache = this._getCache();
    var value = cache.get("currencies");
    if (value)
      return value.split(",");
    return [];
  },
  _getCache: function() {
    if (typeof(g_cache_currency) != "undefined")
      return g_cache_currency;
    g_cache_currency = new GlideClientCache(1);
    return g_cache_currency;
  },
  _parseValue: function() {
    if (this.inputs.length == 0)
      return;
    var processSelect = false;
    for (var i = 0; i < this.inputs.length; i++) {
      var v = this.inputs[i].value;
      if (!v)
        continue;
      if (v.indexOf('javascript') < 0)
        continue;
      processSelect = true;
      var sa = v.split(';');
      var first = sa[0].split('\'');
      var currency = first[first.length - 1];
      var price = sa[sa.length - 1];
      var priceIndex = price.indexOf('\'');
      price = price.substring(0, priceIndex);
      this.inputs[i].value = price;
    }
    if (!processSelect)
      return;
    var sel = new Select(this.currency_widget);
    sel.selectValue(currency);
  },
  getValues: function() {
    if (this._isMappingEnabled)
      return this.getMappingValue();
    if (!this.currency_widget)
      return '';
    var v = GlideFilterString.prototype.getValues.call(this);
    var tn = this.item.table.tableName;
    var fn = this.item.name;
    var valList = v.split('@');
    var fromVal = 'javascript:global.getCurrencyFilter(\'' + tn + '\',\'' + fn + '\', \'' + this.currency_widget.value + ';' + valList[0] + '\')'
    if ((valList.length > 1 && this._getOperator() == 'BETWEEN') || (valList.length > 2))
      return fromVal + '@javascript:global.getCurrencyFilter(\'' + tn + '\',\'' + fn + '\', \'' + this.currency_widget.value + ';' + valList[1] + '\')'
    return fromVal;
  },
  destroy: function() {
    GlideFilterString.prototype.destroy.call(this);
    this.currency_widget = null;
  },
  type: "GlideFilterCurrency",
  z: null
});;