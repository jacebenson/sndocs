var LoadVariableAjax = Class.create();
LoadVariableAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	loadVariableTemplate: function() {
		var jr =  new GlideJellyRunner();
		jr.setTwoPhase(true);
		jr.setEscaping(false);
		jr.setRenderProperties(new GlideRenderProperties());
		jr.setVariable("jvar_id", this.getParameter('jvar_id'));
		jr.setVariable("jvar_value", this.getParameter('jvar_value'));
		jr.setVariable("jvar_type", this.getParameter('jvar_type'));
		var template = jr.runMacro("variable_template");
		var result = this.newItem("result");
		result.setAttribute("template", template);
		return result;
	}
});