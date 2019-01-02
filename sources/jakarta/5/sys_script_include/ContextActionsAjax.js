var ContextActionsAjax = Class.create();

ContextActionsAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

  getLabel : function() {
     var lbl = new GlideRecord('sys_documentation');
     lbl.addQuery('name', this.getType());
     lbl.addQuery('element', this.getValue());
     lbl.query();
     if (lbl.next())
         return lbl.label;
   
     return '';
  },
	
  setWatchField: function() {
	  gs.getSession().setWatchField(this.getParameter("sysparm_id"));
  },	
	
  clearWatchField: function() {
	  gs.getSession().clearWatchField();
  },

  type: "ContextActionsAjax"
});