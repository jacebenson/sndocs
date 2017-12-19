var FormStateAjax = Class.create();

FormStateAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  process: function() {
      var rm = new GlideRequestMap(this.request);
      session.putProperty("client_record_current_map", rm);
  },

  type: "FormStateAjax"
});