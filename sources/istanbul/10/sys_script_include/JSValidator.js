var JSValidator = Class.create();

JSValidator.prototype = Object.extendsObject( AbstractAjaxProcessor, {
   validate: function() {
       return GlideSystemUtilScript._getScriptError(this.getParameter('sysparm_js_expression'));
   }
});