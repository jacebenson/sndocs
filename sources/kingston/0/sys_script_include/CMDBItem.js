gs.include("PrototypeServer");

var CMDBItem = Class.create();

CMDBItem.prototype = {
    initialize : function(item) {
       this.item = item;	
       this.category = null;
       this.subcategory = null;
    },

    setCategory : function() {
       if (!this.item.category.isNil())
          return null;
       
       this._getCategory();
       if (this.category == null)
          return null;

       this.item.category = this.category;
       this.item.subcategory = this.subcategory;
       return this.category;
    },

    _getCategory : function() {
       var cat = new GlideRecord('cmdb_categories');
       var sysClass = this.item.sys_class_name.toString();
       if (this.item.sys_class_name.isNil())
          sysClass = this.item.getTableName();

       if (!cat.get('name', sysClass))
          return;

       this.category = cat.category.toString();
       this.subcategory = cat.subcategory.toString();
    },

    changeCategory : function(previous, cat) {
       var dbu = new GlideDBUpdate('cmdb_ci');
       var dbq = new GlideDBQuery('cmdb_ci');
       dbq.addQuery('category', previous.category.toString());
       dbq.addQuery('sys_class_name', cat.name.toString());
       dbu.setQuery(dbq);
       dbu.setMultiple(true);
       dbu.setValue('category', cat.category.toString());
       dbu.setValue('subcategory', cat.subcategory.toString());
       dbu.execute();
       dbu.close();
       dbq.close();
    },
};
