var ElementDocumentIdAjax = Class.create();

ElementDocumentIdAjax.prototype =  Object.extendsObject(AbstractAjaxProcessor, {
  process: function() {
      if (this.getType() == "resolveDocumentId")
          this.resolveDocumentId(this.getName(), this.getValue());
	  this.getRootElement().setAttribute("sysparm_ref", this.getParameter("sysparm_ref"));
  },

  resolveDocumentId: function(name, value) {
      var gr = new GlideRecord(name);
      gr.get(value);

      this.getRootElement().setAttribute("answer", gr.sys_meta.label + ': ' + gr.getDisplayValue());
  },

  type: "ElementDocumentIdAjax"
});