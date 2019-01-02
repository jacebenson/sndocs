var DbImageNameCheck = Class.create();

DbImageNameCheck.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  process: function() {
     var name = this.getName();   

     var gr = new GlideRecord('db_image');
     gr.addQuery('name', name);
     gr.query();
     var exists = "false";
     if (gr.next())
        exists = "true";
     
     var item = this.newItem("match");
     item.setAttribute("exists", exists);
  },

  type: "DbImageNameCheck"
});