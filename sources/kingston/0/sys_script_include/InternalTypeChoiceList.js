gs.include("PrototypeServer");

var InternalTypeChoiceList = Class.create();

InternalTypeChoiceList.prototype = {
    initialize : function() {
		
    },

    generate : function() {
      var tl = new GlideInternalElementTypeChoiceList();
	  if (this.selectedValue != null) {
	  	tl.setSelected(this.selectedValue);
	  }
      tl.generateChoices();
      this._toXML(tl);
    },
   
    setSelected : function(selectedValue) {
        this.selectedValue = selectedValue;
    },
  
    _toXML : function(tl) {
      for (var i =0; i < tl.size(); i++) {
         var c = tl.getChoice(i);
         var value = c.getValue();
         var label = c.getLabel();
         var item = document.createElement('item');
         item.setAttribute('name', label);
         item.setAttribute('label', label);
         item.setAttribute('value', value);
         root.appendChild(item);
      }
    }
}