var ExpertPanelVariablesAjax = Class.create();

ExpertPanelVariablesAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  process: function() {
	var gr = new GlideRecord('expert_panel_variable'); 
	gr.initialize();
	gr.addQuery('expert_panel', this.getName()); 
	gr.orderByDesc('expert_variable.name');
	gr.query();
	while (gr.next()) {
      		var item = this.newItem();
      		item.setAttribute('value', gr.getValue('expert_variable'));
      		item.setAttribute('label', gr.expert_variable.name);
	}
  },
	/**
	 * Allow public access to this AJAX script
	 */
    isPublic: function() {
		return true;
	},

  type: "ExpertPanelVariablesAjax"
});