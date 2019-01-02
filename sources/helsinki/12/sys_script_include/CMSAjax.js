var CMSAjax = Class.create();

CMSAjax.prototype =  Object.extendsObject(AbstractAjaxProcessor, {

  pageLink: function() {
      var v = this.getValue();
      var answer =  new GlideCMSPageLink().getPageLink(v);
      return answer;
  },
  
  type: "CMSAjax"
});