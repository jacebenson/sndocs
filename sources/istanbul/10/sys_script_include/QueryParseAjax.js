var QueryParseAjax = Class.create();

QueryParseAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  process: function() {
      var tableName = this.getName();

      if (gs.nil(tableName)) {
          gs.log("QueryParseAjax.process() called with null table name");
          return;
      }

      var parts = tableName.split("\\.");
      var qs = new GlideQueryString(parts[0], this.getChars());
      qs.toXML(this.getRootElement());
  },

  type: "QueryParseAjax"
});