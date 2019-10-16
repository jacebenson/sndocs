/*! RESOURCE: /scripts/classes/TemplateRecord.js */
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
            var name = item.getAttribute(