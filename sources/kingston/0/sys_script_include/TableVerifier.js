var TableVerifier = Class.create();

TableVerifier.prototype =  Object.extendsObject(AbstractAjaxProcessor, {
    ajaxFunction_tableExists: function() {
        return gs.tableExists(this.getParameter('sysparm_table_name'));
    }

});