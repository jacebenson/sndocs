gs.include("PrototypeServer");

var CatalogItem = Class.create();

CatalogItem.prototype = {
    initialize : function() {
		
    },

    getReferenceQual : function() {
        var table_name = current.table_name;
        if (table_name) {
            return 'table=' + table_name;
        }
        return '';
    }
};
