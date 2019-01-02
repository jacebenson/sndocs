var ExportDefinitionHelper = Class.create();
ExportDefinitionHelper.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    ED_VIEW_TEMP_PREFIX: "exp_dtmp",
    ED_VIEW_PREFIX: "exp_d",

    /*
     * Creates a ui view for Export Definition.
     *
     * Eg. for export definition sys_id='50eaa041478331004695d7527c9a7102' ,
     * view 'exp_d50eaa041478331004695d7527c9a7102' is created.
     *
     * exp_d is prefix for Export Definition view, followed by sys_id.
     */
    createViewED: function(ed_id, table_name, field_list) {
        var name = this.ED_VIEW_PREFIX + ed_id;
        var manager = new SNC.ExportDefinitionViewManager();
        var sysId = manager.createView(name, table_name, field_list);

        return sysId;
    },

    /*
     * Creates a temporary Export Definition view for current logged user,
     * created before changes to Export Definition is persisted.
     *
     * Eg. for incident table and user name = 'admin' , name of the temporary view created is 'exp_dtmpadminincident'.
     * exp_dtmp is prefix for temporary Export Definition view, incident is table name, admin is user_name.
     */
    createTmpViewED: function() {
        var name = this.ED_VIEW_TEMP_PREFIX + this.getParameter('sysparm_table_name') + gs.getUserName();
        var manager = new SNC.ExportDefinitionViewManager();
        var sysId = manager.createView(name, this.getParameter('sysparm_table_name'), this.getParameter('sysparm_field_list'));

        return name;
    },

    /*
     * Deletes all the temporary views for current logged user.
     */
    deleteTmpViewED: function() {
        var manager = new SNC.ExportDefinitionViewManager();

        var gr = new GlideRecord('sys_ui_view');
        gr.addQuery('name', 'ENDSWITH', gs.getUserName());
        gr.addQuery('name', 'CONTAINS', this.EXPORT_DEF_VIEW_TEMP_PREFIX);
        gr.query();

        while (gr.next()) {
            manager.deleteView(gr.getValue('name'));
        }
    },

    /*
     *	Get list of fields for a view,  sysparm_view_name, on a table, sysparm_table_name.
     *  params , sysparm_view_name , sysparm_table_name
     *
     *  For calling from client side scripts.
     */
    getFieldsCS: function() {
        var viewName = this.getParameter('sysparm_view_name');
        var tableName = this.getParameter('sysparm_table_name');

        var fieldsString = this.getFields(tableName, viewName).toString();
        return fieldsString;
    },

    /*
     *	Get list of fields for a view,  view_name, on a table, table_name.
     *
     *  For calling from server side scripts.
     */
    getFields: function(table_name, view_name) {
        //sys_id of default view is 'Default View'
        var viewSysId = "Default View";
        if (GlideStringUtil.notNil(view_name))
            viewSysId = this._getViewId(view_name);

        var uiListGR = new GlideRecord('sys_ui_list');
        uiListGR.addQuery('name', table_name);
        uiListGR.addQuery('view', viewSysId);
        uiListGR.query();
        uiListGR.next();
        var uiListSysId = uiListGR.sys_id;

        var uiListElemGR = new GlideRecord('sys_ui_list_element');
        uiListElemGR.addQuery('list_id', uiListSysId);
        uiListElemGR.query();

        var elems = [];
        while (uiListElemGR.next()) {
            elems.push(uiListElemGR.getValue('element'));
        }
        return elems;
    },

    _getViewId: function(view_name) {
        var uiViewGR = new GlideRecord('sys_ui_view');
        uiViewGR.addQuery('name', view_name);
        uiViewGR.query();
        uiViewGR.next();
        return uiViewGR.sys_id;
    },
    type: 'ExportDefinitionHelper'
});
