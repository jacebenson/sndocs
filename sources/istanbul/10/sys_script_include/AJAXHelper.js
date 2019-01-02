gs.include("PrototypeServer");

var AJAXHelper = Class.create();

AJAXHelper.prototype = {
  initialize: function() {
  },
  
  // create xml item elements for each row in the GlideRecord
  // an attribute for each element in the fields array
  createItemXML: function(gr, element, fields) {
     this.createItemXML(gr, element, fields, false);  
  },

  createItemXML0: function(gr, element, fields, sandbox) {
    var doc = element.getOwnerDocument();
    while (gr.next()) {
        var item = doc.createElement('item'); 
        element.appendChild(item);
        for (var i = 0; i < fields.length; i++) {
          var name = fields[i];
          if (sandbox && !gr[name].canRead())
              continue;

          item.setAttribute(name, gr.getValue(name));
        }
    }
  }
};
