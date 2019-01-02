var WFCreateTaskActivityUtils = Class.create();
WFCreateTaskActivityUtils.prototype = Object.extendsObject(WFActivityHandler, {
    
    initialize: function() {
        WFActivityHandler.prototype.initialize.call(this);
    },
    
   execute: function() {
        // did we pre-generate the task?
        var taskID;
        var genObj = this._getGenerateObj(activity.activity.toString());
        if (genObj && genObj.taskID) {
            taskID = genObj.taskID;
            if (!this._setTaskState(taskID, '1'))
                return;
        } else
            taskID = this._createTask('1');
        
       return taskID;
    },
    
    _getExistingTask: function() {
        var task = new GlideRecord(activity.vars.task_table);
        task.initialize();
        task.addQuery('parent', current.sys_id);
        task.addQuery('wf_activity', activity.activity.sys_id);
        task.query();
        if (task.next())
            return task;
        
        return null;
    },
    
    _createTask: function(state, order, startAt, noCreateFlag) {
        var task = this._getExistingTask();
        if (task) {
            task.state = state;
            if (startAt)
                task.expected_start.setValue(startAt);
            else
                task.expected_start = gs.nowDateTime();
            
            this._setDueDate(task, startAt);
            if (!noCreateFlag)
                task.update();
            
            return task.sys_id.toString();
        }
        task = new GlideRecord(activity.vars.task_table);
        task.initialize();
        this._setReferences(task);
        task.state = state;
        if (order) {
            task.order = order;
        }
        
        if (startAt) {
            task.expected_start.setValue(startAt);
        } else {
            task.expected_start = gs.nowDateTime();
        }
        
        this._setDueDate(task, startAt);
        this._setValues(task);
        if ((activity.vars.task_table == 'sc_task') && (current.getRecordClassName() == 'sc_req_item'))
            task.request_item = current.sys_id;
        
        if ((activity.vars.task_table == 'change_task') && (current.getRecordClassName() == 'change_request'))
            task.change_request = current.sys_id;
        
        if ((activity.vars.task_table == 'problem_task') && (current.getRecordClassName() == 'problem'))
            task.problem = current.sys_id;
        
        if ((activity.vars.advanced == true) && (activity.vars.advanced_script))
            this._setAdvanced(task);

        if (noCreateFlag)
            return "";
        
        task.wf_activity = activity.activity.sys_id;
        return task.insertOrUpdate('sys_id');
    },
    
    _setReferences: function(task) {
        task.parent = current.sys_id;
    },
    
    _setTaskState: function(taskID, state) {
        var gr = new GlideRecord('task');
        if (!gr.get(taskID)) {
            executing.result = 'deleted';
            return false;
        }
        
        gr.state = state;
        gr.update();
        
        // a business rule might cause the task to be closed when we open it, so check this condition
        if (!gr.active)
            executing.result = gr.state;
        
        return gr.active;
    },
    
    _setDueDate: function(task, startAt) {
        var wd = new WorkflowDuration();
        wd.setActivity(this);
        wd.setStartDateTime(startAt);
        wd.setWorkflow(context.schedule, context.timezone);
        wd.calculate(activity.vars.__var_record__);
        task.due_date.setValue(wd.getEndDateTime());
        this.duration = wd.getTotalSeconds() * 1000;
    },
    
    _setValues: function(task) {
        var type = activity.vars.task_value_type;
        if (type == 'Fields')
            this._setValuesFromFields(task);
        else if (type == 'Template')
            this._setValuesFromTemplate(task);
        else if (type == 'Values')
            this._setValuesFromValues(task);
        
        task.priority = activity.vars.task_priority;
    },
    
    _setValuesFromFields: function(task) {
        task.assignment_group = activity.vars.task_fulfillment_group;
        task.assigned_to = activity.vars.task_assigned_to;
        task.short_description = activity.vars.task_short_description;
        task.description = activity.vars.task_instructions;
    },
    
    _setValuesFromTemplate: function(task) {
        var t = GlideTemplate.get(activity.vars.task_template.toString());
        t.apply(task);
    },
    
    _setValuesFromValues: function(task) {
        task.applyEncodedQuery(activity.vars.task_set_values);
    },
    
    _setAdvanced: function(task) {
        var oldTask = workflow.getScriptVariable('task');
        workflow.prepareScriptVariable('task', task);
        this.runScript(activity.vars.advanced_script);
        workflow.prepareScriptVariable('task', oldTask);
    },
	
    type: 'WFCreateTaskActivityUtils'
});