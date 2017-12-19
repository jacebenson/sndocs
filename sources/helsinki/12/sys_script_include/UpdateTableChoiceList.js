gs.include("PrototypeServer");
gs.include("TableChoiceList");

var UpdateTableChoiceList = Class.create();
UpdateTableChoiceList.prototype = Object.extendsObject(TableChoiceList, {
    initialize : function() {
		
    },

    generate : function() {
      var tl = new GlideUpdateTableChoiceList();
      tl.setAll(false);
      tl.setCanRead(false);
	  tl.setShowTableNames(true);
      tl.generateChoices();
      this._toXML(tl);
    }
});