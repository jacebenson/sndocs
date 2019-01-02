var GetNextNumberAjax = Class.create();

GetNextNumberAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  process: function() {
      var parts = String(this.getName()).split(".");

      var nm = new NumberManager(parts[0]);
      var number = nm.getNextObjNumber();

      var item = this.newItem();
      item.setAttribute("value", number);
  },

  type: "GetNextNumberAjax"
});