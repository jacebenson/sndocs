var ElementModelDependentAjax = Class.create();

ElementModelDependentAjax.prototype =  Object.extendsObject(AbstractAjaxProcessor, {
  process: function() {
      if (this.getType() == "resolveModelDependent")
          this.resolveDocumentId();
  },

  resolveDocumentId: function() {
      var gr = new GlideRecord(this.getParameter("sysparm_table"));
	  gr.initialize();
	  gr[this.getParameter("sysparm_dep")] = this.getValue();
      var el = gr.getElement(this.getParameter("sysparm_field"));

      this.getRootElement().setAttribute("answer", el.getDependentTable());
  },

  type: "ElementModelDependentAjax"
});