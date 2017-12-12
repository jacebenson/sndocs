var TableAugmentationFinder = Class.create();
TableAugmentationFinder.prototype = {
    initialize: function () {},

    getTableExtensions: /*[{},...]*/ function (/*GlideRecord:sys_app*/ sys_app) {
        var extensions = [];
        var appScopeId = sys_app.getUniqueValue();
        var dbObj = new GlideRecord("sys_db_object");
        dbObj.addQuery("sys_scope", appScopeId);
        dbObj.addNotNullQuery("super_class");
        dbObj.addQuery("super_class.sys_scope", "!=", appScopeId);
        dbObj.query();
        while (dbObj.next()) {
            extensions.push({
                table: dbObj.super_class.name + "",
                scope_sys_id: dbObj.super_class.sys_scope + "",
                scope_name: dbObj.super_class.sys_scope.getDisplayValue(),
                pkg_id: dbObj.super_class.sys_package.source + "",
                child: dbObj.getValue("name")
            });
        }
        return extensions;
    },

    getTableColumns: /*[{},...]*/ function (/*GlideRecord:sys_app*/ sys_app) {
        var columns = [];
        var dbObj, columnInfo;
        var appScopeId = sys_app.getUniqueValue();
        var scopeTables = this._getInScopeTableNames(appScopeId);
        var col = new GlideRecord("sys_dictionary");
        col.addQuery("sys_scope", appScopeId);
        col.addQuery("name", "NOT IN", scopeTables);
        col.addQuery("internal_type", "!=", "collection");
        col.query();
        while (col.next()) {
            columnInfo = {
                table: col.getValue("name"),
                field: col.getValue("element")
            };
            dbObj = this._getDbObjectByTableName(columnInfo.table);
            if (dbObj.isValidRecord()) {
                columnInfo.scope_sys_id = dbObj.getValue("sys_scope");
                columnInfo.scope_name = dbObj.getDisplayValue("sys_scope");
                columnInfo.pkg_id = dbObj.sys_package.source + "";
            }
            columns.push(columnInfo);
        }
        return columns;
    },

    _getInScopeTableNames: /*[]*/ function (/*string*/ appId) {
        var tables = [];
        var dbObj = new GlideRecord("sys_db_object");
        dbObj.addQuery("sys_scope", appId);
        dbObj.query();
        while (dbObj.next()) {
            tables.push(dbObj.getValue("name"));
        }
        return tables;
    },

    _getDbObjectByTableName: /*GlideRecord:sys_db_object*/ function (/*string*/ tableName) {
        var dbObj = new GlideRecord("sys_db_object");
        dbObj.get("name", tableName);
        return dbObj;
    },

    type: "TableAugmentationFinder"
};