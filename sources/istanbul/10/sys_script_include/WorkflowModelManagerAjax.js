WorkflowModelManagerAjax=Class.create();
WorkflowModelManagerAjax.WF_KEY_ID='sysparm_key_id';
WorkflowModelManagerAjax.WF_KEY_TABLE='sysparm_key_table';
WorkflowModelManagerAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    
    initialize: function(request, responseXML, gc) {
        this.request = request;
        this.responseXML = responseXML;
        this.gc = gc;
        this.grUtil=new GlideRecordUtil();
    },
    
    _getKey: function() {
        return this.getParameter(WorkflowModelManagerAjax.WF_KEY_ID);
    },
    
    _getKeyTable: function() {
        var keyTable = this.getParameter(WorkflowModelManagerAjax.WF_KEY_TABLE);
        if (keyTable == null) {
            keyTable = 'wf_history';
        }
        return keyTable;
    },

    _getContextId: function(sysId) {
        var contextId = sysId;
        var keyTable = this._getKeyTable();
        if (keyTable != 'wf_context') {
            gs.log('table=' + keyTable + ' : lookup=' + contextId, this.type);
            var gr = this.grUtil.getGR(keyTable, contextId);
            contextId = gr.context.sys_id;
        } 
        return String(contextId);
    },

    _getWMM: function(workflowContextId) {
        if (JSUtil.nil(this.wmm)) {
            gs.log('creating new WorkflowModelManager for context='+workflowContextId, this.type);
            this.wmm = new WorkflowModelManager(workflowContextId);
        }
        return this.wmm;
    },

    getExecutedHistory: function() {
        var contextId = this._getContextId(this._getKey());
        var eh = this._getWMM(contextId).getExecutedHistory();
        gs.log('returning ' + eh.length + ' ActivityHistoryRecords', this.type);
        return new JSON().encode(eh);
    },
    
    getRolledBackActivityIdList: function() {
        var contextId = this._getContextId(this._getKey());
        var wmm = this._getWMM(contextId);
        wmm.getExecutedHistory();
        var rollbackId = wmm.getRollBack(this._getKey());
        var rolledbackIds = wmm.getRolledBackActivityIdList(rollbackId);
        gs.log('returning ' + rolledbackIds.length + ' rolled back activities for ' + rollbackId, this.type);
        var result = {
            'rollbackId' : rollbackId,
            'ids' : rolledbackIds
        };
        return new JSON().encode(result);
    },
    
    getFinalExecutedActivityIdList: function() {
        var contextId = this._getContextId(this._getKey());
        var wmm = this._getWMM(contextId);
        wmm.getExecutedHistory();
        var executedIds = wmm.getFinalExecutedActivityIdList();
        gs.log('returning ' + executedIds.length + ' activities  in execution path for ' + contextId, this.type);
        var result = {
            'contextId' : contextId,
            'ids' : executedIds
        };
        return new JSON().encode(result);
    }, 
    
    type: 'WorkflowModelManagerAjax'
});