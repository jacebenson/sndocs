var TemplateUtil = Class.create();
TemplateUtil.prototype = {
    initialize: function(){
    },
    
    getApplicable: function(table) {
        var t =  new GlideTemplate();
        var gr = t.getApplicable(table);
        return gr;
    },

    apply: function(name, gr) {
        var t =  new GlideTemplate().getByName(name, gr.getTableName(), true);
        if (t != null)
            t.apply(gr);

        return gr;
    },
    
    type: "TemplateUtil"
}


