gs.include("PrototypeServer");

var TableChoiceList = Class.create();

TableChoiceList.prototype = {
    initialize : function(ajaxProcessor) {
	   this.selectedOnly = ajaxProcessor != null ? ajaxProcessor.getParameter('sysparm_selectedOnly') == 'true' : false;
	   this.selectedField = ajaxProcessor != null ? ajaxProcessor.getParameter('sysparm_selectedField') : null;
	   this.selected = ajaxProcessor != null ? ajaxProcessor.getParameter('sysparm_selected') : null;
	   this.forceSelected = ajaxProcessor != null ? ajaxProcessor.getParameter('sysparm_forceSelected') == 'true' : false;
	   this.noViews = ajaxProcessor != null ? ajaxProcessor.getParameter('sysparm_noViews') == 'true' : false;
	   this.noSystemTables = ajaxProcessor != null ? ajaxProcessor.getParameter('sysparm_noSystemTables') == 'true' : false;
	   this.currentTableName = ajaxProcessor != null ? ajaxProcessor.getParameter('sysparm_currentTableName') : null;
    },

    generate : function() {
      var tl = new GlideTableChoiceList();
      tl.setAll(true);
      tl.setCanRead(true);
      tl.setShowLabels(false);
	  tl.setSelectedOnly(this.selectedOnly);
	  tl.setSelectedField(this.selectedField);
	  tl.setSelected(this.selected);
	  tl.setForceSelected(this.forceSelected);
	  tl.setNoViews(this.noViews);
	  tl.setNoSystemTables(this.noSystemTables);
	  tl.setCurrentTableName(this.currentTableName);
      tl.generateChoices();
	  if(!tl.getSelectedOnly()) {
         tl.addNone();
	  }
      this._toXML(tl);
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