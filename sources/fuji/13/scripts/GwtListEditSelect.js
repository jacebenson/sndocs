/*! RESOURCE: /scripts/GwtListEditSelect.js */
var GwtListEditSelect = Class.create(GwtListEditWindow, {
  createEditControls: function() {
    var select = '';
    if (this.doctype)
      select = "<select id = '" + GwtListEditWindow.inputID + "' class='form-control list-edit-input' />";
    else
      select = "<select id = '" + GwtListEditWindow.inputID + "' />";
    this.setTitle(select);
    this.focusElement = GwtListEditWindow.getCellEditValue();
    this.addOptions();
    if (!this.staticOptions)
      return false;
  },
  addOptions: function() {
    var rowSysId = this.getAnchorSysId();
    var allIDs = this.gridEdit.getSelectedSysIds();
    var ajax = new GlideAjax('PickList');
    ajax.addParam('sys_uniqueValue', rowSysId);
    ajax.addParam('sysparm_id_list', allIDs.join());
    ajax.addParam('sysparm_target', this.editor.tableElement.getTable().getName());
    ajax.addParam('sysparm_chars', '*');
    ajax.addParam('sysparm_name', this.refName);
    ajax.addParam('sysparm_nomax', 'true');
    ajax.getXML(this._createOptions.bind(this));
  },
  _createOptions: function(response) {
    if (this.state != 'initialize')
      return;
    var xml = response.responseXML;
    var items = xml.getElementsByTagName("item");
    var value = this.editor.getValue();
    this.focusElement.options.length = 0;
    if (this.editor.tableElement.choice != "3") {
      this.nullOverride = xml.documentElement.getAttribute("default_option");
      if (this.nullOverride)
        addOption(this.focusElement, "", this.nullOverride, this._isSelected(value, "", this.nullOverride));
      else if (!this.editor.selectedOnly)
        addOption(this.focusElement, "", getMessage('-- None --'), true);
    }
    for (var i = 0; i < items.length; i++) {
      var v = items[i].getAttribute("value");
      var l = items[i].getAttribute("label");
      addOption(this.focusElement, v, l, this._isSelected(value, v, l));
    }
    this.createEditControlsComplete();
  },
  _isSelected: function(value, v, l) {
    if (l == value || v == value)
      return true;
    else
      return false;
  },
  save: function() {
    var select = this.focusElement;
    var i = select.selectedIndex;
    var option = select.options[i];
    this.setValue(option.value);
    var text = option.text;
    if (!option.value)
      text = '';
    this.setRenderValue(text);
  },
  toString: function() {
    return "GwtListEditSelect";
  }
});;