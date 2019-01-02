var HomePageAjax = Class.create();

HomePageAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

  ajaxFunction_homeCreate: function() {
      return GlideappHome.createPage();
  },

  ajaxFunction_homeDelete: function() {
      return GlideappHome.deletePage(this.getValue());
  },

  type: "HomePageAjax"
});