function applyTemplate(sysID) {
  var t = new TemplateRecord(sysID);
  t.apply();
}
var TemplateRecord = Class.create({
  NAME: "name",
  VALUE: "value",
  ITEM: "item",
  DEPENDENT: "dependent",
  initialize: function(sysID) {
    this.sysID = sysID;
  },
  apply: function() {
    var ga = new GlideAjax('AjaxClientHelper');
    ga.addParam('sysparm_name', 'getValues');
    ga.addParam('sysparm_sys_id', this.sysID);
    ga.getXML(this._applyResponse.bind(this));
  },
  _applyResponse: function(response) {
    if (!response || !response.responseXML)
      return;
    this.template = response.responseXML;
    this.applyRecord();
  },
  applyRecord: function() {
    var items = this.template.getElementsByTagName(this.ITEM);
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var name = item.getAttribute(this.NAME);
      var e = g_form.getGlideUIElement(name);
      if (e && (e.getType() == "currency" || e.getType() == "price"))
        if (e.getChildElementById(e.getID() + ".display"))
          name += ".display";
      var widget = g_form.getControl(name);
      if (!widget)
        continue;
      if (!g_form.isEditableField(e, widget))
        continue;
      this.applyItem(name, item.getAttribute(this.VALUE));
    }
  },
  applyItem: function(element, value) {
    if (value == null || value == 'null')
      return;
    g_form.setTemplateValue(element, value);
  }
});
TemplateRecord.save = function(id) {
  var fields = g_form.getEditableFields();
  var f = g_form.getFormElement();
  addHidden(f, 'sysparm_template_editable', fields.join());
  gsftSubmit(id);
}