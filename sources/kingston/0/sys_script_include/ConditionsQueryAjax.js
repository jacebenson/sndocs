var ConditionsQueryAjax = Class.create();

ConditionsQueryAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    ajaxFunction_getConditionQueryCount: function() {
		var secure = new ConditionsQuerySecure();
		return secure.getConditionQueryCount(this.getParameter('sysparm_table'), this.getParameter('sysparm_encoded_query'));
    }
});