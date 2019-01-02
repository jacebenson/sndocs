var KBCatTables = Class.create();

KBCatTables.prototype = {
    initialize: function() {
    },
    
    process: function() {
        var result = [];
        var dict = new GlideRecord("sys_dictionary");
        dict.addNullQuery("element");
        var gc = dict.addQuery("name", "kb_category");
        gc.addOrCondition("name", "kb_knowledge_base");
        dict.orderBy("name");
        dict.query();
        
        while (dict.next()) {
        	result.push("" + dict.name);
        }
       
        return result;
    }
}