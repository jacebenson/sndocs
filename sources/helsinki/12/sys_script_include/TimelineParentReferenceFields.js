var TimelineParentReferenceFields = Class.create();
TimelineParentReferenceFields.prototype = {
    initialize: function() {
    },

    process: function(table, containing_table, value) {
        var result = [];
        var gr = new GlideRecord("cmn_timeline_page");
        gr.addQuery("sys_id", value)
        gr.query();
        if (gr.next()){
            result.push('' + gr.table);
        }
        return result;
    },

    type: 'TimelineParentReferenceFields'
}