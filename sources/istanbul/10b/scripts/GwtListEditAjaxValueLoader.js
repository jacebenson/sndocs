/*! RESOURCE: /scripts/GwtListEditAjaxValueLoader.js */
var GwtListEditAjaxValueLoader = Class.create({
  _iso: new ISO9075(),
  PROCESSOR: 'com.glide.ui_list_edit.AJAXListEdit',
  initialize: function(changes, tableController) {
    this.changes = changes;
    this.tableController = tableController;
    this._clearErrorMsg();
    this.generatedSysId = null;
  },
  loadValues: function(sysIds, fields, callback) {
    var ajax = new GlideAjax(this.PROCESSOR);
    ajax.addParam('sysparm_type', 'get_value');
    ajax.addParam('sysparm_table', this.tableController.tableName);
    if ((sysIds.length == 1) && (sysIds[0] == "-1"))
      ajax.addParam("sysparm_default_query", this.tableController.query);
    if (this._buildIdList(ajax, sysIds, fields)) {
      this._waitForAjax(ajax, callback, 5000);
    } else
      callback();
  },
  loadDefaults: function(callback) {
    this.changes.clearDefaults();
    this.loadValues(["-1"], this.tableController.getFields(), callback);
  },
  loadTable: function(callback) {
    var ajax = new GlideAjax(this.PROCESSOR);
    ajax.addParam('sysparm_type', 'get_value');
    ajax.addParam('sysparm_table', this.tableController.tableName);
    ajax.addParam('sysparm_query', this.tableController.query);
    var fields = this.tableController.getFields();
    ajax.addParam("sysparm_fields", fields.join(','));
    this._waitForAjax(ajax, callback, 5000);
  },
  getErrorMsg: function() {
    return this.errorMsg;
  },
  _buildIdList: function(ajax, sysIds, fields) {
    var needFields = false;
    for (var i = 0; i < sysIds.length; i++) {
      var id = sysIds[i];
      var fieldList = [];
      for (var j = 0; j < fields.length; j++) {
        if (!this.changes.getField(id, fields[j]))
          fieldList.push(fields[j]);
      }
      if (fieldList.length > 0) {
        needFields = true;
        ajax.addParam('sysparm_sys_id_' + id, fieldList.join(','));
      }
    }
    return needFields;
  },
  _waitForAjax: function(ajax, callback, timeout) {
    if (timeout < 0)
      return;
    if (!this.ajax) {
      this.ajax = true;
      ajax.getXML(this._getValuesResponse.bind(this, callback));
    } else {
      setTimeout(this._waitForAjax.bind(this, ajax, callback), 10, timeout - 10);
    }
  },
  _getValuesResponse: function(callback, response) {
    this.ajax = false;
    if (!response || !response.responseXML) {
      this.errorMsg = getMessage("No response from server - try again later");
      callback();
      return;
    }
    var xml = response.responseXML;
    var items = xml.getElementsByTagName("item");
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var sysId = item.getAttribute("sys_id");
      this.generatedSysId = item.getAttribute("new_sys_id");
      var fieldList = item.getAttribute("field_list");
      var fields;
      if (fieldList)
        fields = fieldList.split(',');
      else
        fields = [];
      for (var j = 0; j < fields.length; j++) {
        var n = fields[j];
        var fieldItem = this._getXMLFieldItem(item, n);
        if (!fieldItem)
          continue;
        var canWrite = true;
        if (fieldItem.getAttribute("can_write") == "false")
          canWrite = false;
        var mandatory = false;
        if (fieldItem.getAttribute("mandatory") == "true")
          mandatory = true;
        var okExtension = true;
        if (fieldItem.getAttribute("ok_extension") == "false")
          okExtension = false;
        if (!this.changes.getField(sysId, n)) {
          var f = this._addField(sysId, n);
          f.setInitialValues(this._getXMLValue(fieldItem, "value"), this._getXMLValue(fieldItem, "displayvalue"));
          f.setWritable(canWrite);
          f.setMandatory(mandatory);
          f.setOKExtension(okExtension);
          f.setLabel(fieldItem.getAttribute("label"));
        }
      }
    }
    this._clearErrorMsg();
    callback();
  },
  _getXMLFieldItem: function(parent, n) {
    for (var i = 0; i < parent.childNodes.length; i++) {
      var item = parent.childNodes[i];
      if (this._iso.decode(item.nodeName.toLowerCase()) == n)
        return item;
    }
    return null;
  },
  _getXMLValue: function(item, type) {
    var value = null;
    var e = item.getElementsByTagName(type);
    if (e && e.length > 0)
      value = getTextValue(e[0]);
    if (!value)
      value = "";
    return value;
  },
  _addField: function(sysId, field) {
    var record = this.changes.get(sysId);
    if (!record)
      record = this.changes.addRecord(sysId)
    return record.addField(field);
  },
  _clearErrorMsg: function() {
    this.errorMsg = "";
  },
  toString: function() {
    return 'GwtListEditAjaxValueLoader';
  }
});;