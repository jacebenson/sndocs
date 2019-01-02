gs.include("PrototypeServer");

var AbstractList = Class.create();

AbstractList.prototype = {
    SYS_USER : 'sys_user',
    NAME : 'name',
    VIEW : 'view',
    PARENT : 'parent',
    SYS_UI_LIST : 'sys_ui_list',
    RELATIONSHIP : 'relationship',
    DOMAIN : 'sys_domain',
    NOT_FOUND_ID: "-1",

    initialize : function(table, view, viewName) {
        this.tableName = table;
        this.view = view;
        this.parentName = '';
        this.relationshipID = '';
        this.user = gs.getUserID();
        this.defaultViewID = new GlideScriptViewManager("").getID();
        this.domainID = GlideDomainSupport.getCurrentDomainValueOrGlobal();

        // mobile always gets the mobile view, regardless of what we asked for
        if (GlideMobileExtensions.getDeviceType() == 'mobile')
            this.viewName = 'Mobile';

        if (viewName)
            this.viewName = viewName.toLowerCase();
    },

    setParent : function(parent) {
        this.parentName = parent;
    },

    setRelationshipID : function(relID) {
        this.relationshipID = relID;
    },

    addParentQuery : function(gr) {
        if (this.parentName != '')
            gr.addQuery(this.PARENT, this.parentName);
        else
            gr.addNullQuery(this.PARENT);
    },

    addRelationshipQuery : function(gr) {
        if (this.relationshipID != '')
            gr.addQuery(this.RELATIONSHIP, this.relationshipID);
        else
            gr.addNullQuery(this.RELATIONSHIP);
    },

    domainQuery : function(gr, domainID) {
        GlideDomainSupport.queryLowestLevelDomain(gr,domainID);
    },

    getParents : function() {
        var answer = this._getParentArray(this.tableName);

        if (!GlidePluginManager.isRegistered('com.glideapp.staged_tables'))
            return answer;

        var s = new StagingEngine();
        var staged = s.getStagedTable(this.tableName);
        if (staged == null)
            return answer;

        var merged = new Array();
        merged.push(staged);
        var list = this._getParentArray(staged);
        if (list == null || answer == null)
            return merged;

        var maxlength = list.length;
        if (maxlength < answer.length)
            maxlength = answer.length;

        for (var i = 0; i < maxlength; i++) {
            if (i < answer.length)
                merged.push(answer[i]);

            if (i < list.length)
                merged.push(list[i]);
        }

        return merged;
    },

    _getParentArray : function(tableName) {
        var list = GlideDBObjectManager.getActionTables(tableName);
        if (list == null || list.size() < 2)
            return null;

        var answer = new Array();
        for (var i = 1; i < list.size(); i++)
            answer[i-1] = list.get(i);

        return answer;
    }
}        