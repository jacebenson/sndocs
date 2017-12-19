var CMSEntryPage = Class.create();

CMSEntryPage.prototype = {
  initialize : function() {
  },

  getEntryPage : function() {
    var config = GlideContentConfig.get();
    if (!config.getLoginPage())
        return null;

    return new GlideCMSPageLink().getPageLink(config.getLoginPage());
  }
}