var cxs_TableActions = Class.create();
cxs_TableActions.prototype = {
    DEFAULT_LIMIT: 10,

    initialize: function(actionName, gr) {
        this._gr = gr;
    },

    getTableConfig: function(tableName, recordSysId) {
        var searchConfig = {};

        if (!tableName)
            return searchConfig;

        var tableConfigGr = new GlideRecord("cxs_table_config");
        tableConfigGr.addQuery("table", tableName);
        tableConfigGr.addActiveQuery();
        tableConfigGr.query();
        if (!tableConfigGr.next())
            return searchConfig;

        var tableConfig = cxs_App.getBusiness(tableConfigGr);

        searchConfig = tableConfig.getTableConfigObject();
        searchConfig.record_matches_condition = tableConfig.matchesCondition(recordSysId);

        return searchConfig;
    },

    getEmailSearchRequest: function(emailActionGr) {
        if (!this._gr || !this._gr.getTableName() || !emailActionGr)
            return null;

        var searchConfigGr = new GlideRecord("cxs_table_config");
        if (!searchConfigGr.get("table", this._gr.getTableName()))
            return null;

        var searchConfig = cxs_App.getBusiness(searchConfigGr);
        var searchText = this._gr.getValue(searchConfig.getDefaultSearchField().field);
        if (!searchText)
            return null;

        var searchLimit = parseInt(searchConfigGr.getValue("limit"), 10) || this.DEFAULT_LIMIT;
        var searchRequestObj = {
            meta: {
                limit: searchLimit,
                results_header_text: searchConfigGr.results_header_text.getDisplayValue()
            },
            context: searchConfigGr.getValue("cxs_context_config"),
            query: {
                freetext: searchText
            }
        };

        var searchEmailConfigGr = new GlideRecord("cxs_table_email_config");
        searchEmailConfigGr.addQuery("sysevent_email_action", emailActionGr.getUniqueValue());
        searchEmailConfigGr.addQuery("cxs_table_config", searchConfigGr.getUniqueValue());
        searchEmailConfigGr.query();

        if (!searchEmailConfigGr.hasNext())
            return null;

        if (searchEmailConfigGr.next()) {
            var limit = searchEmailConfigGr.getValue("limit");

            if (limit && !isNaN(limit))
                searchRequestObj.meta.limit = parseInt(limit, 10);

            var userField = searchEmailConfigGr.getValue("user_field");
            var runAsUser;
            if (userField)
                runAsUser = this._gr.getValue(userField);

            if (runAsUser)
                searchRequestObj.meta.runAsUser = runAsUser;
        }

        var searchRequestJSON = new JSON().encode(searchRequestObj);
        return new SNC.SearchRequest().fromJSON(searchRequestJSON);
    },

    type: "cxs_TableActions"
}