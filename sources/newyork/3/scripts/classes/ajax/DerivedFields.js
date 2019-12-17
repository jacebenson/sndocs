/*! RESOURCE: /scripts/classes/ajax/DerivedFields.js */
var DerivedFields = Class.create({
  initialize: function(elementName) {
    this.elementName = elementName;
  },
  clearRelated: function() {
    if (typeof g_form === 'undefined')
      return;
    var list = g_form.getDerivedFields(this.elementName);
    if (list == null)
      return;
    var prefix = this.elementName.split(".");
    prefix.shift();
    prefix = prefix.join(".");
    for (var i = 0; i < list.length; i++) {
      var elname = prefix + "." + list[i];
      g_form._addDerivedWaiting(elname, g_form.isDisabled(elname));
      g_form.clearValue(elname);
    }
  },
  updateRelated: function(key) {
    if (typeof key === 'undefined' || typeof g_form === 'undefined')
      return;
    var list = g_form.getDerivedFields(this.elementName);
    if (list == null)
      return;
    if (key === '') {
      list.forEach(function(fieldName) {
        var shortFieldName = g_form._removeTableName(this.elementName + '.' + fieldName);
        g_form._resetDerivedField(shortFieldName);
      }, this);
      return;
    }
    list.forEach(function(fieldName) {
      var widgetName = 'sys_original.' + this.elementName + '.' + fieldName;
      var widget = gel(widgetName);
      if (widget)
        widget.value = '';
    }, this);
    var url = "xmlhttp.do?sysparm_processor=GetReferenceRecord" +
      "&sysparm_name=" + this.elementName +
      "&sysparm_value=" + key +
      "&sysparm_derived_fields=" + list.join(',');
    var args = new Array(this.elementName, list.join(','));
    serverRequest(url, refFieldChangeResponse, args);
  },
  toString: function() {
    return 'DerivedFields';
  }
});;