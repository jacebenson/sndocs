var WidgetNavTables = Class.create();
WidgetNavTables.prototype = {
    initialize: function() {
    },
    
    process: function() {
        var result = [];
        var dict = new GlideRecord("sys_dictionary");
        dict.addNullQuery("element");
        var gc = dict.addQuery("name", "pa_widgets");
        gc.addOrCondition("name", "sys_report");
        dict.orderBy("name");
        dict.query();
        
        while (dict.next()) {
        	result.push("" + dict.name);
        }
       
        return result;
    }
};