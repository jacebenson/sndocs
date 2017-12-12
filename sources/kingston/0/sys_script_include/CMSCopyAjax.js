var CMSCopyAjax = Class.create();

CMSCopyAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
   copySite: function() {
      var source = this.getParameter('sysparm_source_site');
      var name = this.getParameter('sysparm_new_name'); 
      var site = new ContentSiteClone(source, name); 
      return site.getSiteID();
   } 
});