var RecordUtils = Class.create();

RecordUtils.prototype =  Object.extendsObject(AbstractAjaxProcessor, {
    process: function() {
        if (this.getType() == "deleteRecords")
            return this.deleteRecord(this.getName());
    },

    deleteRecord : function(table) {
        var gr = new GlideRecord(table);
        if (!gr.isValid())
            return;

        if (RhinoEnvironment.useSandbox() && !gr.canDelete())
            return;

        gr.query();
        var count = gr.getRowCount(); 
        gr.deleteMultiple();
        return count;
    }
});