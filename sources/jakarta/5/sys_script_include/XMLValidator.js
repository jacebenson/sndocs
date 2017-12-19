var XMLValidator = Class.create();

XMLValidator.prototype = Object.extendsObject( AbstractAjaxProcessor, {
   validate: function() {
      return GlideXMLUtil().validateXML(this.getParameter('sysparm_xml'), false, true);
   }
});