var AssociateCIsToChangeUtil = Class.create();
AssociateCIsToChangeUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    SESSION_KEY: 'com.snc.change_request.AssociateCIsToChangeUtil.selected_cis',

    ajaxFunction_storeCIsAndPostInfoMsg: function() {
        var cis = this.getParameter('sysparm_selected_cis');
        if (cis) {
            cis = cis.trim();
            gs.getSession().putClientData(this.SESSION_KEY, cis);
            gs.addInfoMessage(this.getMessageWithTableLabel('Your selected {0} will be related to this Change Request once saved',
                [this.getParameter('sysparm_table_label')] ));
            return this.SESSION_KEY;
        }
    },
    
    ajaxFunction_addManyRelatedAjax: function() {
        var taskSysId = this.getParameter('sysparm_task_sys_id');
        var cis = this.getParameter('sysparm_selected_cis');
        
        return new JSON().encode(this.addManyRelated(taskSysId, cis.split(",")));
    },
    
    getMessageWithTableLabel: function(msg, args) {
        if (!args || args.length == 0)
            args = [''];
        if (!args[0])
            args[0] = gs.getMessage('Configuration Items');
        return gs.getMessage(msg, args);
    },

    _addRelated: function (table, foreignKey, taskSysId, sysId) {
        var gr = new GlideRecord(table);
        gr.addQuery('task', taskSysId);
        gr.addQuery(foreignKey, sysId);
        gr.query();
        if (!gr.hasNext()) {
            gr.initialize();
            gr.task = taskSysId;
            gr[foreignKey] = sysId;
            gr.insert();
            return true;
        }
        return false;
    },

    addAffectedRelated: function (taskSysId, sysId) {
        return this._addRelated('task_ci', 'ci_item', taskSysId, sysId);
    },

    addImpactedRelated: function (taskSysId, sysId) {
        return this._addRelated('task_cmdb_ci_service', 'cmdb_ci_service', taskSysId, sysId);
    },

    addManyRelated: function addManyRelated(taskSysId, ciSysIds) {
        var count = 0;
        var processedCount = 0;
        var addedPrimaryCi = false;
        var isValid = false;
        var task = new GlideRecord('task');
        if (task.get(taskSysId) && task.canRead()) {
            isValid = true;
            var lastCiSysId;
            for (var i = 0; i < ciSysIds.length; i++) {
                var ciSysId = ciSysIds[i];
                if (ciSysId) {
                    var gr = new GlideRecord('cmdb_ci');
                    if (gr.get(ciSysId)) {
                        processedCount++;
                        var ret;
                        if (gr.getValue('sys_class_name') == 'cmdb_ci_service')
                            ret = this.addImpactedRelated(taskSysId, ciSysId);
                        else
                            ret = this.addAffectedRelated(taskSysId, ciSysId);
                        if (ret)
                            count++;
                        lastCiSysId = ciSysId;
                    }
                }
            }
            if (processedCount == 1 && lastCiSysId && task.canWrite()) {
                if (!task.getValue('cmdb_ci')) {
                    task.cmdb_ci = lastCiSysId;
                    task.update();
                    addedPrimaryCi = true;
                }
            }
        }
        
        return {
            count: count,
            processedCount: processedCount,
            addedPrimaryCi: addedPrimaryCi,
            displayValue: isValid ? task.getDisplayValue() : '',
            changeId: taskSysId
        };
    },

    type: 'AssociateCIsToChangeUtil'
});