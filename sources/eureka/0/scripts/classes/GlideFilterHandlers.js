var GlideFilterHandler = Class.create({
  filterClass: "",
  initialize: function(tableName, item) {
    this.maxValues = 0;
    this.tableName = tableName;
    this.item = item;
    this.isRightOperandShowingRelatedFields = false;
    this.lastOperator = null;
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
  },
  create: function(tr, values, filterClass) {
    this.tr = tr;
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
    this._initInputs();
  },
  _initValues: function(values) {
    if (!values)
      this.values = [];
    else
      this.values = values.split("@");
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
    if ((el.tagName.toUpperCase() == "INPUT") || (el.tagName.toUpperCase() == "TEXTAREA"))
      return el.value;
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
  _addTextInput: function(type, td) {
    if (!td)
      td = this.tr.tdValue;
    var input = addTextInput(td, this.values[this.inputCnt], type);
    this.inputs[this.inputCnt] = input;
    this.inputCnt++;
    return input;
  },
  _addTextArea: function() {
    var input = addTextArea(this.tr.tdValue, this.values[this.inputCnt]);
    this.inputs[this.inputCnt] = input;
    this.inputCnt++;
    return input;
  },
  _addSelect: function(width, multi, size) {
    var s = _createFilterSelect(width, multi, size);
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
      if (!isExclusiveDynamic && this.item.getReference() == aItemArr[2] || this.originalTableName == aItemArr[3]) {
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
      if (this.isRightOperandShowingRelatedFields || selection.indexOf(".") >= 0)
        showRelatedFields = "yes";
      this.addChoices(s, completeSelection, "", this._filterRightOperand, selection, null, showRelatedFields, this.item);
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
        t.addChoices(this, f, "", t._filterRightOperand, fieldName, null, "yes", t.item);
      } else if (fieldName == '...Remove Related Fields...') {
        t.isRightOperandShowingRelatedFields = false;
        t.addChoices(this, f, "", t._filterRightOperand, fieldName, null, "no", t.item);
      } else {
        t.isRightOperandShowingRelatedFields = true;
        t.addChoices(this, f, "", t._filterRightOperand, fieldName, null, "yes", t.item);
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
        o = addOption(s, tableDef.getName() + "...", tableLabel + " " + messages['lowercase_fields'], false);
        o.tableName = tableDef.getName();
        o.style.color = 'blue';
      }
      if (parts[1] == PLACEHOLDERFIELD) {
        o = addOption(s, PLACEHOLDER, messages['-- choose field --'], true);
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
        var clabel = sPeriod + elementDef.getLabel() + "-->" + elementDef.getRefLabel() + " " + messages['lowercase_fields'];
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
        if (filterMethod(leftOperandElement, item, this.isRightOperandShowingRelatedFields) == true) {
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
      if ((!elementDef || elementDef.getType() != "glide_var") && !item.isReference()) {
        savedItems[label] = t;
        savedLabels[savedLabels.length] = label;
      }
      if (item.isReference() && leftOperandElement.isReference()) {
        if (item.getReference() == leftOperandElement.getReference()) {
          savedItems[label] = t;
          savedLabels[savedLabels.length] = label;
        }
      }
      if (item.isReference() && !item.isRefRotated() && item.getType() != 'glide_list' && filterExpanded && showRelated == 'yes') {
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
    if (!onlyRestrictedFields && ((fValue == TEXTQUERY || textIndex) && filterMethod == null || forFilter)) {
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
    if ("SAMEAS" == operation || "NSAMEAS" == operation || "GT_FIELD" == operation ||
      "LT_FIELD" == operation || "GT_OR_EQUALS_FIELD" == operation || "LT_OR_EQUALS_FIELD" == operation)
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
  setFilterClass: function(filterClass) {
    this.filterClass = filterClass;
  },
  getFilterClass: function() {
    return this.filterClass;
  }
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
    if (this._isEmptyOper())
      return;
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
    return value;
  },
  _initValues: function(values) {
    this.values = [];
    if (values)
      this.values[0] = values;
  }
});
var GlideFilterDuration = Class.create(GlideFilterHandler, {
  _setup: function(values) {
    this.maxValues = 1;
    this.duration = new GlideDuration(values, this.item);
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
    return "javascript:gs.getDurationDate('" + answer + "')";
  },
  _build: function() {
    clearNodes(this.tr.tdValue);
    this.inputCnt = 0;
    if (this._isEmptyOper())
      return;
    if (this._renderRightOperandAsFieldList(this._getOperator())) {
      this._addSameAsLabels(this, this._getOperator());
      this._populateRightOperandChoices();
    } else {
      this.inputCnt = 1;
      this.duration.buildHTML(this.tr.tdValue);
    }
  }
});
var GlideFilterStringMulti = Class.create(GlideFilterString, {
  _setup: function(values) {
    this.maxValues = 1;
    this.listenForOperChange = true;
  },
  _build: function() {
    clearNodes(this.tr.tdValue);
    this.inputCnt = 0;
    if (this._isEmptyOper())
      return;
    if (this._renderDynamicOperandInput(this._getOperator()))
      return;
    if (this._renderRightOperandAsFieldList(this._getOperator())) {
      this._addSameAsLabels(this, this._getOperator());
      this._populateRightOperandChoices();
    } else
      this._addTextArea();
  }
});
var GlideFilterChoice = Class.create(GlideFilterHandler, {
  _setup: function(values) {
    this.maxValues = 1;
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
    if (this._isEmptyOper())
      return;
    if (this._renderRightOperandAsFieldList(this._getOperator())) {
      this._addSameAsLabels(this, this._getOperator());
      this._populateRightOperandChoices();
    } else {
      var s = this._addSelect(this.width, this.multi, this.size);
      this._fillSelect();
    }
  },
  _fillSelect: function() {
    var vars = {};
    if (this.values[0]) {
      var valSplit = this.values[0].split(',');
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
      var selected = (vars[option[0]] != null);
      var o = addOption(this.inputs[0], option[0], option[1], selected);
    }
  }
});
var GlideFilterChoiceDynamic = Class.create(GlideFilterChoice, {
  _setup: function(values) {
    this.size = 4;
    this.maxValues = 1;
    this.listenForOperChange = true;
  },
  setChoices: function(choices) {
    this.choices = choices;
  },
  _build: function() {
    clearNodes(this.tr.tdValue);
    this.inputCnt = 0;
    if (this._isEmptyOper())
      return;
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
      var response = ajax.getXMLWait();
      this._addChoices(response);
    }
  },
  _addChoices: function(xml) {
    var msg = new GwtMessage();
    var select = this.inputs[0];
    select.disabled = false;
    select.options.length = 0;
    this.choices = [];
    this.hasChoices = true;
    this.choices[0] = ['', msg.getMessage('-- None --')];
    if (!xml)
      return;
    var root = xml.documentElement;
    var dep = root.getAttribute("dependent");
    var items = xml.getElementsByTagName("item");
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var v = item.getAttribute("value");
      var l = item.getAttribute("label");
      var option = [v, l];
      this.choices.push(option);
    }
    if (dep != null) {
      this.choices = this.choices.sort(
        function(a, b) {
          if ((a[1].toLowerCase() + "") < (b[1].toLowerCase() + "")) {
            return -1;
          }
          if ((a[1].toLowerCase() + "") > (b[1].toLowerCase() + "")) {
            return 1;
          }
          return 0;
        }
      );
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
  }
});