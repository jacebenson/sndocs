var WikiHelperAjax = Class.create();

WikiHelperAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  wikiToHTML: function() {
     var element = this.getValue();
     var wikiText = this.getChars();

     if (wikiText == '')
         return "(Wiki text empty)";

     var gwm = new GlideWikiModel();
     gwm.setLinkBaseURL(gwm.getLinkBaseURL() + "&sysparm_field=" + element);
     return gwm.render(wikiText);
  },

  type: "WikiHelperAjax"
});