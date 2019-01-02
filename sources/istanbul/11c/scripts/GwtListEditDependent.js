/*! RESOURCE: /scripts/GwtListEditDependent.js */
var GwtListEditDependent = Class.create(GwtListEditWindow, {
  initialize: function($super, editor, gridEdit, fields) {
    this.fields = fields;
    $super(editor, gridEdit);
  },
  createEditControls: function() {
    this.preferredWidth = 0;
    this.controlsCount = 0;
    this._renderContainer();
    this._renderControls();
    return false;
  },
  onKeyTab: function(evt) {
    evt.stop();
    if (evt.shiftKey) {
      if (!this._previousChoice(evt)) {
        this.saveAndClose();
        this.prevColumn();
      }
    } else if (!this._nextChoice(evt)) {
      this.saveAndClose();
      this.nextColumn();
    }
  },
  _previousChoice: function(e) {
    var previous = this.focusElement.parentNode.parentNode.previousSibling;
    if (previous == null)
      return false;
    this.focusElement = $(previous).select("select")[0];
    this.focusEditor();
    return true;
  },
  _nextChoice: function(e) {
    var next = this.focusElement.parentNode.parentNode.nextSibling;
    if (next == null)
      return false;
    this.focusElement = $(next).select("select")[0];
    this.focusEditor();
    return true;
  },
  _renderControls: function() {
    var clickedField = this.refName;
    for (var i = 0; i < this.fields.length; i++) {
      var field = this.fields[i];
      var elName = this.editor.table + '.' + field;
      var tableElement = TableElement.get(elName);
      if (!tableElement || !tableElement.isChoice())
        continue;
      var focus = (elName == clickedField);
      var el = this._renderControl(tableElement, field, focus);
    }
  },
  _resizeControls: function() {
    var editControls = gel("editControls");
    if (editControls) {
      var choiceLists = editControls.getElementsByTagName("select");
      for (var i = 0; i < choiceLists.length; i++) {
        if (choiceLists[i].clientWidth > this.preferredWidth)
          this.preferredWidth = choiceLists[i].clientWidth;
      }
      for (var i = 0; i < choiceLists.length; i++) {
        choiceLists[i].style.width = this.preferredWidth + 'px';
      }
    }
  },
  _renderContainer: function() {
    var table = cel("table");
    table.cellPadding = 2;
    table.style.backgroundColor = "EEEEEE";
    var tbody = cel("tbody", table);
    tbody.id = "editControls";
    this.setTitle(table);
  },
  _renderControl: function(tableElement, fieldName, focus) {
    this.refName = this.editor.table + "." + fieldName;
    var id = "LIST_EDIT_" + this.refName;
    if (gel(id))
      return;
    var tbody = gel("editControls");
    var tr = cel("tr", tbody);
    var td = cel("td", tr);
    td.id = "container_" + this.refName;
    td.innerHTML = tableElement.label + ":<br>";
    var select = cel("select");
    select.id = id;
    if (this.doctype)
      select.className = 'form-control list-edit-input';
    select.name = this.refName;
    select.setAttribute("dbVal", this.editor.getValue(fieldName));
    select.onchange = this._handleOnChange.bindAsEventListener(this);
    td.appendChild(select)
    this.controlsCount++;
    var dependent = tableElement.getDependent();
    var depVal = '';
    if (dependent)
      depVal = this.editor.getValue(this._getTargetName(fieldName, dependent));
    this._addOptions(select, depVal);
    if (focus)
      this.focusElement = select;
  },
  _handleOnChange: function(e) {
    var parent = Event.element(e);
    var tableElement = TableElement.get(parent.name);
    var children = tableElement.getDependentChildren();
    for (var k in children) {
      var focusElement = gel("LIST_EDIT_" + this._getTargetName(parent.name, k));
      if (!focusElement)
        return;
      focusElement.setAttribute("dbVal", "");
      this._addOptions(focusElement, parent.options[parent.options.selectedIndex].value);
    }
  },
  _getTargetName: function(base, field) {
    var parts = base.split(".");
    parts[parts.length - 1] = field;
    return parts.join(".");
  },
  _addOptions: function(element, depValue) {
    var ajax = new GlideAjax('PickList');
    ajax.addParam('sysparm_chars', '*');
    ajax.addParam('sysparm_name', element.name);
    if (depValue)
      ajax.addParam('sysparm_value', depValue);
    ajax.addParam('sysparm_nomax', 'true');
    ajax.addParam('sysparm_id_list', this.gridEdit.getSelectedSysIds().join());
    ajax.getXML(this._createOptions.bind(this, element));
  },
  _createOptions: function(element, response) {
    element.options.length = 0;
    element.style.width = '';
    var xml = response.responseXML;
    var items = xml.getElementsByTagName("item");
    var value = element.getAttribute("dbVal");
    var nullOverride = xml.documentElement.getAttribute("default_option");
    if (nullOverride != null && nullOverride.length > 0) {
      addOption(element, "", nullOverride, true);
    } else {
      var msg = getMessage("-- None --");
      addOption(element, "", msg, true);
    }
    for (var i = 0; i < items.length; i++) {
      var v = items[i].getAttribute("value");
      var l = items[i].getAttribute("label");
      if (!this._checkDuplicateOptions(element, v, l))
        addOption(element, v, l, (v == value));
    }
    if (this.controlsCount > 0)
      this.controlsCount--;
    if (this.controlsCount == 0) {
      setTimeout(this._resizeControls.bind(this), 0);
      this.createEditControlsComplete();
    }
  },
  _checkDuplicateOptions: function(element, value, label) {
    if (!element.length)
      return false;
    var opts = element.options;
    for (var i = 0; i < opts.length; i++)
      if (opts[i].value == value && opts[i].text === label)
        return true;
    return false;
  },
  save: function() {
    var tbody = gel("editControls");
    var choiceLists = tbody.getElementsByTagName("select");
    if (choiceLists) {
      for (var i = 0; i < choiceLists.length; i++) {
        var element = choiceLists[i];
        var option = element.options[element.selectedIndex];
        var fName = element.name.substring(this.editor.table.length + 1);
        this.editor.setFieldValue(fName, option.value);
        var dspValue;
        if (!option.value)
          dspValue = '';
        else
          dspValue = option.text;
        this.editor.setFieldRenderValue(fName, dspValue);
      }
    }
  },
  toString: function() {
    return "GwtListEditDependent";
  }
});;