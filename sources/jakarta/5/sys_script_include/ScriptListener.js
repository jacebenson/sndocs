gs.include("PrototypeServer");

var ScriptListener = Class.create();

ScriptListener.prototype = {
  initialize: function() {
     this.listener = null;
     this.record = null;  
     this.script = 'Generic ECC Queue Update';
     this.fields = new Array();
  },

  create: function() {
     this.listener = new GlideScriptListener();
  },

  attach: function() {
     this.listener.setScriptName(this.script);
     this.listener.setRecord(this.record);
     if (this.fields.length == 0)
        this.fields.push("*");

     this.listener.attachListener(this.fields.join(","));
  },

  setListener: function(listener) {
     this.listener = listener;
  },

  setRecord: function(record) {
     if (this.listener == null)
        this.create();

     this.record = record;
  },

  getAttribute: function(attr) {
     return this.listener.getAttribute(attr);
  },

  addAttribute: function(attr, value) {
     this.listener.addAttribute(attr, value);
  },

  addField: function(field) {
     this.fields.push(field);
  },

  serializeAll: function() {
     var serializer = new GlideRecordXMLSerializer();
     return serializer.serialize(this.record, this.record.getTableName());
  },

  serializeDelta: function() {
     var list = this.listener.getDelta(); 
     gs.log("Changed fields: " + list);
     var xml = new GlideXMLDocument(this.record.getTableName());
     var parent = xml.getDocumentElement();
     var xs = new GlideElementXMLSerializer();
     for (var i = 0; i < list.size(); i++) {
        var element = list.get(i);
        xs.serialize(this.record, element, parent);
     }
     return xml.toString();
  },

  z: function() {}
}
