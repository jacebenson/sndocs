// ******* It is highly recommended that you do not modify this record! *******

///////////////////////////////////////////////////////////////////////////////////////////////////
// IMPORTS
///////////////////////////////////////////////////////////////////////////////////////////////////
var HashSet = Packages.java.util.HashSet;

// /////////////////////////////////////////////////////////////////////////////////////////////////
// UTILITY FUNCTIONS
// /////////////////////////////////////////////////////////////////////////////////////////////////
function indexOf(obj, array) {
    for ( var i = 0; i < array.length; i++) {
        if (array[i] == obj)
            return i;
    }
    return -1;
}

function inArray(obj, array) {
    return indexOf(obj, array) >= 0 ? true : false;
}

function empty(a) {
    return JSUtil.nil(a) || a.length == 0;
}

function notEmpty(a) {
    return !empty(a);
}

function getTimeDisplay(timeMs) {
    if (!timeMs)
        return "null";

    var gdt = new GlideDateTime();
    gdt.setNumericValue(timeMs);
    return gdt.getDisplayValueInternal();
}

var PlannedTaskCalculator = Class.create();
PlannedTaskCalculator.prototype = {

    // Status code constants that can be used for adding a relationship or other functions that return a value that is
    // dynamic.
    STATUS_CODE : {
        SUCCESS : 1,
        DUPLICATE : 2,
        RECURSIVE : 3,
        INVALID : 4
    },

    START_ON : "start_on",
    ASAP : "asap",

    initialize : function() {
        if (gs.getProperty("com.snc.planned_task.debug") == "true")
            this.debug = true;

        delete this.projectTasks;
        this.projectTasks = {};

        this.top_task = '';
        this.onUpdateRelationshipsToRemove = []; // Object {successor_sys_id: , predecessor_sys_id: }
        this.onUpdateRelationshipsToAdd = []; // Object {successor_sys_id: , predecessor_sys_id: }
        this.count = 0;
        this.changes = 0;
        this.schedule = null;
        this.timezone = '';
        this._loadComplete = false;
    },

    setDebug : function(value) {
        this.debug = value;
    },

    load : function(originalRecord) {
        this._loadComplete = false;
        
        if (JSUtil.nil(originalRecord)) {
            gs.log("Can't load with an invalid record, aborting.", "PlannedTaskCalculator");
            this._loadFailureReason = "Parameter 'originalRecord' was null.";
            return;
        }

        var topTask = originalRecord.top_task.getRefRecord();
        if (!topTask.isValidRecord())
            topTask = originalRecord;
        
	   if (JSUtil.nil(topTask.getUniqueValue())) {
            gs.log("Can't load with a null sys_id, aborting.", "PlannedTaskCalculator");
            this._loadFailureReason = "topTask found but getUniqueValue() is null.";
            return;
        }
        
        this.top_task = topTask.getUniqueValue();

        var sw;
        if (this.debug) {
            sw = new GlideStopWatch();
            this._debugPrint('load: ' + ' :: Loading project ' + topTask.getDisplayValue());
        }

        // only for project top task
        if (topTask.sys_class_name == "pm_project")
            this._setScheduleAndTimezone(topTask);

        this._iterateRecords(topTask);
        this._iteratePredecessors();
        this._iterateSuccessors();
        this._iterateChildren();

        if (this.debug) {
            this.printProject(false);
            sw.log(this.type + ' :: Finished loading project.');
        }
        
        this._loadComplete = true;
    },
    
    loadValid: function(){
        if (!this._loadComplete)
            gs.log("Execution cancelled, PlannedTaskCalculator has not been loaded correctly.", "PlannedTaskCalculator");
        
        return this._loadComplete;
    },

    getTopTaskShortDescription : function() {
        return this.projectTasks[this.top_task].short_description;
    },

    printProject : function(boolPrintProperties) {
        this._debugPrint("printProject: Printing project ...");
        // Iterate through project objects
        for ( var task in this.projectTasks) {
            var currentProjectTask = this.projectTasks[task];
            this._debugPrint('printProject: Project task - ' + currentProjectTask.short_description);

            if (boolPrintProperties)
                this.printTask(this.projectTasks[task]);
        }
    },

    printTask : function(task) {
        this._debugPrint('printTask: Printing properties for task [' + task.short_description + ' ] ----');
        for ( var prop in task)
            this._debugPrint('printTask : > ' + prop + ': ' + task[prop]);
    },

    changeProjectTask : function(taskSysID, fieldName, newValue) {
        if (!this.loadValid())
            return;
        
        this._debugPrint("-----> changeProjectTask " + taskSysID + ", " + fieldName + ", " + newValue);
        var task = this.projectTasks[taskSysID];
        task.changed = 'true';

        // If the value is for a date we need to update the display and duration
        // times as well.
        if (fieldName == 'start_date') {
            task.start_date = newValue > task.end_date ? task.end_date : parseInt(newValue);

            // if schedule see if new date is in schedule otherwise default to
            // latest work time
            if (this.schedule) {
                var startGDT = new GlideDateTime();
                startGDT.setNumericValue(task.start_date);
                if (!this.schedule.isInSchedule(startGDT)) {
                    // get first work time after startGDT
                    var diff = this.schedule.whenNext(startGDT);
                    this._debugPrint("      changeProjectTask: found schedule difference of " + diff + " for a date of " + startGDT.getDisplayValue());
                    // if successful then use schedule date, otherwise take what
                    // we were given
                    if (diff != -1) {
                        startGDT.add(diff);
                        task.start_date = startGDT.getNumericValue();
                    }
                }
            }

            task.duration = Math.max(0, this._calcDurationFromSchedule(parseInt(task.start_date), parseInt(task.end_date)));

        } else if (fieldName == 'end_date') {
            task.end_date = newValue < task.start_date ? task.start_date : parseInt(newValue);

            // if schedule see if new date is in schedule otherwise default to latest work time
            if (this.schedule) {
                var endGDT = new GlideDateTime();
                endGDT.setNumericValue(task.end_date);
                if (!this.schedule.isInSchedule(endGDT)) {
                    // get latest work time before endGDT
                    var diff = this.schedule.whenLast(endGDT);
                    this._debugPrint("      changeProjectTask: found schedule difference of " + diff + " for a date of " + endGDT.getDisplayValue());
                    // if successful then use schedule date, otherwise take what we were given
                    if (diff != -1) {
                        endGDT.add(diff);
                        task.end_date = endGDT.getNumericValue();
                    }
                }
            }

            if (task.work_start != '') {
                task.duration = Math.max(0, this._calcDurationFromSchedule(parseInt(task.work_start), parseInt(task.end_date)));
                this._debugPrint("          changeProjectTask: calc duration from actual end date, new duration = " + task.duration);
            } else {
                task.duration = Math.max(0, this._calcDurationFromSchedule(parseInt(task.start_date), parseInt(task.end_date)));
                this._debugPrint("          changeProjectTask: calc duration from planned end date, new duration = " + task.duration);
            }
        } else if (fieldName == 'duration') {
            task.end_date = parseInt(this._calcEndDateFromSchedule(task.start_date, task.duration));
            task.duration = parseInt(newValue);
        } else if (fieldName == 'parent') {
			this.validateRelationships();
        }
        else {
            task[fieldName] = newValue;
        }
    },

    shiftProjectTask : function(taskSysID, newStartTimeMs) {
        if (!this.loadValid())
            return;
        
        this._debugPrint("shiftProjectTask " + taskSysID + ", " + newStartTimeMs);
        var task = this.projectTasks[taskSysID];

        // There is one pre-check that needs to be done for
        task.time_constraint = this.START_ON;
        task.changed = 'true';
        task.start_date = parseInt(newStartTimeMs);
        task.end_date = this._calcEndDateFromSchedule(parseInt(newStartTimeMs), parseInt(task.duration));
    },

    isNewRelationshipValid : function(predecessorId, successorId) {
        if (!this.loadValid())
            return;
        
        var pred = this.projectTasks[predecessorId];

        // Check to see if this relationship already exists?
        for ( var i in pred.successors) {
            if (pred.successors[i] == successorId)
                return this.STATUS_CODE.DUPLICATE;
        }
        return this.isExistingRelationshipValid(predecessorId, successorId);
    },

    /**
     * Returns a value specified by the [ this.STATUS_CODE ] constant that specifies whether the actual existing relationship or theoretical (not yet
     * created) relationship is valid. It is up to the caller to appropriately handle the recourse action.
     */
    isExistingRelationshipValid : function(predecessorId, successorId) {
        var pred = this.projectTasks[predecessorId];

        // Check to see if this relationship creates a recursive relationship?
        // This is a very complicated loop that determines all the nodes that affect the successor. If the successor
        // matches any of the found nodes, recursion will result.
        var setInvalidNodes = this._getAffectedChildrenNodes(pred, new HashSet());
        var currentTask = pred;
        while (true) {
            setInvalidNodes = this._getAffectedPredChildrenNodes(currentTask, setInvalidNodes);
            if (currentTask.parent == '')
                break;

            currentTask = this.projectTasks[currentTask.parent];
        }

        if (this.debug) {
            this._debugPrint('isExistingRelationshipValid ---- List of Invalid Successor Nodes For [' + pred.short_description + '] ----');
            var it = setInvalidNodes.iterator();
            while (it.hasNext())
                this._debugPrint('isExistingRelationshipValid :: [+] ' + this.projectTasks[it.next()].short_description);
        }

        if (setInvalidNodes.contains(successorId))
            return this.STATUS_CODE.RECURSIVE;

        return this.STATUS_CODE.SUCCESS;
    },

    /**
     * This function adds the specified relationship. Note it does not check to see if the relationship is valid. It is up to the caller to execute [
     * this.isNewRelationshipValid() ] and handle the appropriate action prior to adding a relationship.
     */
    addRelationship : function(predecessorId, successorId) {
        var succ = this.projectTasks[successorId];
        var pred = this.projectTasks[predecessorId];

        // Update the internal object.
        pred.successors.push(successorId.toString());
        succ.predecessors.push({
            relationship_sys_id : '',
            predecessor_sys_id : predecessorId.toString()
        });
        this.onUpdateRelationshipsToAdd.push({
            successor_sys_id : successorId.toString(),
            predecessor_sys_id : predecessorId.toString()
        });

        // Mark both as changed and shift the successor (if necessary)
        pred.changed = 'true';
        succ.changed = 'true';
        if (parseInt(succ.start_date) < parseInt(pred.end_date)) {
            succ.time_constraint = this.ASAP;
            succ.start_date = pred.end_date;
            succ.end_date = this._calcEndDateFromSchedule(parseInt(succ.start_date), parseInt(succ.duration));
        }
    },

    /**
     * Removes the specified relationship from the current object and adds this relationship to the array that holds relationships to delete on
     * update().
     */
    removeRelationship : function(predecessorId, successorId) {
        // Remove the successor from the predecessor
        var index = indexOf(this.projectTasks[predecessorId].successors, successorId);
        this.projectTasks[predecessorId].successors.splice(index, 1);
        this.projectTasks[predecessorId].changed = 'true';
        this.projectTasks[successorId].changed = 'true';

        // Remove the predecessor from the successor and store the sys_id
        for ( var i = 0; i < this.projectTasks[successorId].predecessors.length; i++) {
            if (this.projectTasks[successorId].predecessors[i].predecessor_sys_id == predecessorId) {
                // Add the IDs to the list to remove
                this.onUpdateRelationshipsToRemove.push(this.projectTasks[successorId].predecessors[i].relationship_sys_id);
                this.projectTasks[successorId].predecessors.splice(i, 1);
                break;
            }
        }
    },

    changeParent : function(itemTaskSysId, newParentSysId) {
        this._debugPrint("changeParent " + itemTaskSysId + ", " + newParentSysId);
        var status = this.checkNewParentValidity(itemTaskSysId, newParentSysId);
        if (status != this.STATUS_CODE.SUCCESS)
        	return status;
        var task = this.projectTasks[itemTaskSysId];

        // See if the new parent is a child of the current task. If this is the case, then we have a problem.
        if (this._isParentAChildOfTask(itemTaskSysId, newParentSysId))
            return this.STATUS_CODE.INVALID;
        else if (task.parent == newParentSysId)
            return this.STATUS_CODE.DUPLICATE;

        // Update the old parent's [ children Array ] ..(Splice after finding index. IndexOf doesn't work)
        var oldParent = this.projectTasks[task.parent];
        for ( var i in oldParent.children) {
            if (itemTaskSysId == oldParent.children[i]) {
                oldParent.changed = 'true';
                oldParent.children.splice(i, 1);
                if (empty(oldParent.children))
                    oldParent.rollup = false;

                break;
            }
        }

        // Update the new parent's [ children Array ] with the newly added
        // child.
        var newParent = this.projectTasks[newParentSysId];
        newParent.children.push(itemTaskSysId);
        newParent.rollup = true;
        newParent.changed = 'true';

        // Update the current task with new parent
        task.parent = newParentSysId;
        task.changed = 'true';
        task.start_date = newParent.start_date;
        task.end_date = this._calcEndDateFromSchedule(task.start_date, task.duration);
        task.time_constraint = this.ASAP;
        if (this.debug)
            this._debugPrint('changeParent: > Setting [' + task.short_description + ']\'s parent to: [' + this.projectTasks[task.parent].short_description + ']');
    },

    getTask : function(id) {
        return this.projectTasks[id];
    },

    recalcProject : function() {
        if (!this.loadValid())
            return;
        
        this._recalcProject(false);
    },

    recalcProjectEndDates : function() {
        this._recalcProject(true);
    },

    _addPreBubbleChange : function() {
        this.impactedChanges++;
    },

    _addBubbleChange : function() {
        this.bubbleChanges++;
        this.impactedChanges++;
    },

    _recalcProject : function(boolCalcEndDates) {
        this._debugPrint("_recalcProject " + boolCalcEndDates);
        if (this.debug) {
            var sw = new GlideStopWatch();
            this._debugPrint('_recalcProject: Begin recalcProject()' + (boolCalcEndDates ? ' (including end dates)' : ''));
        }
        this.bubbleChanges = 0;
        this.impactedChanges = 0;

        this._recalcProjectBubble(boolCalcEndDates);
        this._processCriticalPath();

        if (this.debug) {
            var count = 0; // Get the total number of changed items
            for ( var i in this.projectTasks) {
                if (this.projectTasks[i].changed == 'true')
                    count++;
            }
            sw.log(this.type + ' :: Finished recalcProject() -- Updated ' + count + ' tasks (' + this.impactedChanges + ' impacted changes)');
        }
        return this.STATUS_CODE.SUCCESS;
    },

    _recalcProjectBubble : function(boolCalcEndDates) {
        this.bubbleChanges = 0;
        this._debugPrint("");
        this._debugPrint("");
        this._debugPrint("");
        this._debugPrint("");
        this._debugPrint("_recalcProjectBubble " + boolCalcEndDates);

        var json = new JSON();
        var text = json.encode(this.projectTasks);
        this._debugPrint("_recalcProjectBubble - JSON= " + text);

        for ( var i in this.projectTasks) {
            if (boolCalcEndDates)
                this._recalcScheduleEndDate(this.projectTasks[i]);

            this._recalcStartDate(this.projectTasks[i]);
            this._recalcEndDate(this.projectTasks[i]);
        }
        this._debugPrint("_recalcProjectBubble - bubbleChanges = " + this.bubbleChanges);
        if (this.bubbleChanges > 0 && (this._validData(this.projectTasks[i])))
            this._recalcProjectBubble();
    },
        
    _validData : function(task) {
        if (isNaN(task.start_date) || isNaN(task.end_date)) {
            this._debugPrint("_validData - task.start_date = " + task.start_date + ", end_date=" + task.start_date);
            return false;
        }
        if (task.countRecalcProjectBubble > 5) {
            this._debugPrint("_validData - _recalcProjectBubble is ignored now for " + task.number + " countRecalcProjectBubble=" + task.countRecalcProjectBubble);
        	return false;
        } else {
	        this._debugPrint("_validData - _recalcProjectBubble unexpected for task=" + task.number + " countRecalcProjectBubble=" + task.countRecalcProjectBubble);
        	task.countRecalcProjectBubble++;
        }
        return true;
    },
        
    _setScheduleAndTimezone : function(parentRecord) {
        var project = new GlideRecord("pm_project");
        if (project.get(parentRecord.getUniqueValue())) {
            if (!JSUtil.nil(project.schedule)) {
                this._debugPrint("_setScheduleAndTimezone: using schedule " + project.schedule.getDisplayValue() + ":" + project.schedule);

                this.schedule = new GlideSchedule(project.schedule);

                if (!this.schedule.isValid())
                    this.schedule = null;
            } else
                this._debugPrint("_setScheduleAndTimezone: no project schedule specified");
        }
    },

    _iterateRecords : function(parentRecord) {
        // Query for all tasks within this project
        var projectTask = new GlideRecord('planned_task');
        projectTask.addQuery('top_task', parentRecord.getUniqueValue());
        projectTask.orderBy('start_date');
        projectTask.query();
        this._debugPrint("_iterateRecords query: " + projectTask.getEncodedQuery() + " = " + projectTask.getRowCount());
        while (projectTask.next()) {
            // Create an object for each task
            this._createProjectTask(projectTask);
        }
    },

    _createProjectTask : function(projectTask) {
        var newProjectTask = {};
        newProjectTask.short_description = projectTask.short_description.toString();
        newProjectTask.children = [];
        newProjectTask.predecessors = [];
        newProjectTask.successors = [];
        newProjectTask.state = projectTask.state.toString();
        newProjectTask.state_display = projectTask.state.getDisplayValue();
        newProjectTask.number = projectTask.number.toString();
        newProjectTask.assigned_to = projectTask.assigned_to.getDisplayValue().toString();
        newProjectTask.sys_id = projectTask.getUniqueValue();
        newProjectTask.schedule = projectTask.schedule;
        newProjectTask.timezone = projectTask.timezone;
        newProjectTask.start_date = projectTask.start_date.getGlideObject().getNumericValue(); // planned start
        newProjectTask.work_start = projectTask.work_start.getGlideObject().getNumericValue(); // actual start
        newProjectTask.end_date = projectTask.end_date.getGlideObject().getNumericValue(); // planned end
        newProjectTask.work_end = projectTask.work_end.getGlideObject().getNumericValue(); // actual end
        newProjectTask.duration = projectTask.duration.getGlideObject().getNumericValue();
        newProjectTask.duration_display = projectTask.duration.getDisplayValue();
        newProjectTask.work_duration = projectTask.work_duration.getGlideObject().getNumericValue();

        // newProjectTask.work_duration_display = projectTask.work_duration.getDisplayValue();
        try {
            newProjectTask.work_duration_display = projectTask.work_duration.getDisplayValue();
        } catch (e) {
            newProjectTask.work_duration_display = "Undetermined";
            gs.print("Unable to determine work duration display value for: " + projectTask.sys_id);
        }

        newProjectTask.time_constraint = projectTask.time_constraint.toString();
        newProjectTask.parent = projectTask.parent.toString();
        newProjectTask.rollup = projectTask.getValue("rollup");
        newProjectTask.active = projectTask.active.toString();
        newProjectTask.critical_path = projectTask.critical_path.toString();
        newProjectTask.percent_complete = projectTask.percent_complete.toString();
        newProjectTask.changed = 'false';
		newProjectTask.countRecalcProjectBubble = 0;
        // Add the new task object to the big projectTasks object
        this.projectTasks[projectTask.sys_id.toString()] = newProjectTask;
    },

    _iteratePredecessors : function() {
        // Create an array of tasks first
        var taskArray = [];
        for ( var task in this.projectTasks)
            taskArray.push(this.projectTasks[task].sys_id);

        // Now make a single query
        var rel = new GlideRecord('planned_task_rel_planned_task');
        rel.addQuery('child', taskArray);
        rel.addQuery('type.name', 'Predecessor of::Successor of');
        rel.query();
        this._debugPrint("_iteratePredecessors Query: " + rel.getEncodedQuery() + " = " + rel.getRowCount());
        while (rel.next())
            this.projectTasks[rel.child].predecessors.push({
                relationship_sys_id : rel.getUniqueValue(),
                relationship_table : "planned_task_rel_planned_task",
                predecessor_sys_id : rel.parent.toString(),
                relationship_lag : rel.lag.getGlideObject().getNumericValue().toString()
            });
    },

    _iterateSuccessors : function() {
        // Create an array of tasks first
        var taskArray = [];
        for ( var task in this.projectTasks)
            taskArray.push(this.projectTasks[task].sys_id);

        // Now make a single query
        var rel = new GlideRecord('planned_task_rel_planned_task');
        rel.addQuery('parent', taskArray);
        rel.addQuery('type.name', 'Predecessor of::Successor of');
        rel.query();
        this._debugPrint("_iterateSuccessors Query: " + rel.getEncodedQuery() + " = " + rel.getRowCount());
        while (rel.next())
            this.projectTasks[rel.parent].successors.push(rel.child.toString());
    },

    _iterateChildren : function() {
        for ( var task in this.projectTasks) {
            var currentProjectTask = this.projectTasks[task];
            if (currentProjectTask.parent != '' && currentProjectTask.parent != currentProjectTask.sys_id)
                this.projectTasks[currentProjectTask.parent].children.push(currentProjectTask.sys_id.toString());
        }
    },

    _isParentAChildOfTask : function(taskId, newParentSysId) {
        var task = this.projectTasks[taskId];
        for ( var i in task.children) {
            if (task.children[i] == newParentSysId || this._isParentAChildOfTask(task.children[i], newParentSysId))
                return true;
        }
        return false;
    },

    _getAffectedChildrenNodes : function(t, set) {
        // short-circuit if t is already in set
        if (inArray(t.sys_id.toString(), set))
            return set;
        for ( var i in t.children)
            set = this._getAffectedChildrenNodes(this.projectTasks[t.children[i]], set);

        set.add(t.sys_id.toString());
        return set;
    },

    _getAffectedPredChildrenNodes : function(t, set) {
        // short-circuit if t is already in set
        if (inArray(t.sys_id.toString(), set))
            return set;
        for ( var i in t.predecessors) {
            var task = this.projectTasks[t.predecessors[i].predecessor_sys_id];
            if (notEmpty(task.predecessors))
                set = this._getAffectedPredChildrenNodes(task, set);

            set.add(task.sys_id);
            if (notEmpty(task.children))
                set = this._getAffectedChildrenNodes(task, set);
        }

        set.add(t.sys_id.toString());
        return set;
    },

    validateRelationships : function() {
        if (this.debug) {
            var sw = new GlideStopWatch();
            this._debugPrint('validateRelationships: Begin validateRelationships()');
        }

        // Since the removeRelationship() method clears out items inside the
        // appropriate tasks predecessors and successors
        // array, the looping of a tasks predecessors and successors is
        // extremely dangerous. Therefore, we store the relationships
        // to delete in this temporary cleanList array during pred/succ
        // enumeration ... and then delete afterwards.
        var tmpCleanList = [];
        var removedRelationships = []; // [] = "predecessor.sys_id
        // successor.sys_id"
        for ( var i in this.projectTasks) {
            var t = this.projectTasks[i];
            for ( var j = 0; j < t.successors.length; j++) {
                var s = this.projectTasks[t.successors[j]];

                // ==== Check Invalid Relationship Condition
                // ==========================================+
                var ret = this.isExistingRelationshipValid(t.sys_id, s.sys_id);
                if (ret == this.STATUS_CODE.RECURSIVE)
                    tmpCleanList.push({
                        pred_sys_id : t.sys_id,
                        succ_sys_id : s.sys_id,
                        desc : this.type + ' :: > Removing [' + t.short_description + ']\'s successor [' + s.short_description + '] because it is an invalid relationship.'
                    });
                // =====================================================================================+

            } // ~end successors loop
        } // ~end task loop
        // Iterate through the list of items that need to be cleaned and clean
        // them.
        for ( var i = 0; i < tmpCleanList.length; i++) {
            var obj = tmpCleanList[i];

            // Has this been removed?
            if (inArray(obj.pred_sys_id + ' ' + obj.succ_sys_id, removedRelationships))
                continue;

            // Remove the relationship
            this.removeRelationship(obj.pred_sys_id, obj.succ_sys_id);

            // Output debug information
            this._debugPrint("validateRelationships: obj.desc = " + obj.desc);

            // Add this to the array of removed relationships
            removedRelationships.push(obj.pred_sys_id + ' ' + obj.succ_sys_id);
        }

        if (this.debug)
            sw.log(this.type + ' :: End validateRelationships()');
    },

    /**
     * 0 -
     */
    _recalcScheduleEndDate : function(task) {
        this._debugPrint("_recalcScheduleEndDate " + task.number);
        if (notEmpty(task.children))
            return;

        var start;
        if (task.work_start > 0)
            start = task.work_start;
        else
            start = task.start_date;

        var schEndDate = this._calcEndDateFromSchedule(parseInt(start), parseInt(task.duration));
        if (schEndDate != parseInt(task.end_date)) {
            this._addBubbleChange();
            task.changed = 'true';
            task.end_date = schEndDate;

            if (this.debug)
                this._debugPrint('_recalcScheduleEndDate: > Adjusting [' + task.short_description + '] to end date to reflect the current schedule.');
        }
    },

    /**
     * Adjust the start date for all tasks. A tasks start date is defined as: [time_constraint == 'start_on'] = > Task's current start date for fixed
     * start date rollup tasks (with children) set start to earliest child start
     * 
     * All asap rollup task's dates are derived from their children.
     * 
     * [time_constraint == 'asap' ] > Latest between predecessor's end date and first parent with predecessor's start date [If no predecessor, then] >
     * First parent with predecessor or project start date if no parent exists [If no parent or predecessor's exist,then: ] > Task's current start
     * date
     */
    _recalcStartDate : function(task) {
        this._debugPrint("_recalcStartDate " + task.number + "(" + task.short_description + ")");

        // no need to calc fixed start date tasks with no children
        if (this._isStartDateFixed(task) && empty(task.children))
            return;

        // for fixed start rollup tasks, override the start with the earliest
        // child task
        if (this._isStartDateFixed(task) && task.changed != "true") {

            this._debugPrint("--->_recalcStartDate: fixed start task rollup, check children for earliest start: " + task.number + "(" + task.short_description + ")"
                    + " starts on " + task.start_date);
            this.printTask(task);

            this._debugPrint("--->_recalcStartDate: Fixed date rollup task, get earliest child: " + task.number);
            var earliestChildStart = null;

            this._forEach(task.children, function(elem) {
                var childTask = this.projectTasks[elem];
                if (earliestChildStart == null || this._getStartDate(childTask) < earliestChildStart) {
                    earliestChildStart = this._getStartDate(childTask);

                    this._debugPrint("------>_recalcStartDate: setting fixed task " + task.number + "(" + task.short_description + ")" + " start date from " + childTask.number);
                }
            });

            if (task.start_date != earliestChildStart) {
                this._debugPrint("--->_recalcStartDate setting start to " + earliestChildStart + " it was " + task.start_date);

                task.start_date = earliestChildStart;
                task.duration = this._calcDurationFromSchedule(parseInt(this._getStartDate(task)), parseInt(this._getEndDate(task)));
                this._addBubbleChange();
                task.changed = 'true';
            }
            return;
        }

        if (this._isStartDateFixed(task) && task.changed == "true") {
            this._debugPrint("--->_recalcStartDate fixed task " + task.number + "(" + task.short_description + ")" + " was already changed, skipping start date calc");
            return;
        }

        // Set parent start date to the earliest child
        if (notEmpty(task.children)) {
            // set planned start from children
            this._debugPrint("--->_recalcStartDate set rollup start based on children of: " + task.number + "(" + task.short_description + ")");
            var earliestChildStart = null; // planned start from children
            var earliestChildWorkStart = 0; // actual start from children

            // Steps over all children taking note of start_date or work_start
            this._forEach(task.children, function(elem) {
                var childTask = this.projectTasks[elem];
                var childStart = parseInt(childTask.start_date);
                var childWorkStart = parseInt(childTask.work_start);

                if (this.debug) {
                    this._debugPrint("------>_recalcStartDate checking child " + childTask.number + "(" + childTask.short_description + ")" + " starts on "
                            + getTimeDisplay(childStart) + " compared to " + getTimeDisplay(earliestChildStart));
                    this._debugPrint("------>_recalcStartDate checking child " + childTask.number + "(" + childTask.short_description + ")" + " work start on "
                            + getTimeDisplay(childWorkStart) + " compared to " + getTimeDisplay(earliestChildWorkStart));
                }

                if (earliestChildStart == null || childTask.start_date < earliestChildStart) {
                    earliestChildStart = childTask.start_date;
                    if (this.debug)
                        this._debugPrint("------>_recalcStartDate moving earliestChildStart to " + getTimeDisplay(earliestChildStart));
                }

                if (childWorkStart > 0) {
                    if (earliestChildWorkStart == 0 || (earliestChildWorkStart > 0 && childWorkStart < earliestChildWorkStart)) {
                        earliestChildWorkStart = childWorkStart;
                        if (this.debug)
                            this._debugPrint("------>_recalcStartDate moving earliestChildWorkStart to " + getTimeDisplay(earliestChildWorkStart));
                    }
                }
            });

            // If a change was made above we register the and bubble it
            if (task.start_date != earliestChildStart) {
                if (this.debug)
                    this._debugPrint("------> _recalcStartDate setting start to " + getTimeDisplay(earliestChildStart) + " it was " + getTimeDisplay(task.start_date));

                task.start_date = earliestChildStart;
                task.duration = this._calcDurationFromSchedule(parseInt(this._getStartDate(task)), parseInt(this._getEndDate(task)));
                this._addBubbleChange();
                task.changed = 'true';
            }
            if (task.work_start != earliestChildWorkStart) {
                if (this.debug)
                    this._debugPrint("------> _recalcStartDate setting work_start to " + getTimeDisplay(earliestChildWorkStart) + " it was " + getTimeDisplay(task.work_start));

                task.work_start = earliestChildWorkStart;
                this._addBubbleChange();
                task.changed = 'true';
            }

            return;
        }

        // If the current task doesn't have a parent and predecessor don't change it!
        if (JSUtil.nil(task.parent) && empty(task.predecessors))
            return;

        /*
         * For all other ASAP (non-rollup) tasks!
         */
        this._debugPrint("--->_recalcStartDate: RECALCING PLANNED TASK PREDECESSORS, count= " + task.predecessors.length);

        // Get the next parent that has a predecessor, or the top task.
        var parent = this._getSignificantParent(task);

        // If the task has no predecessors go and find the next parent in its hierarchy that has a predecessor.
        if (empty(task.predecessors)) {
            // Check if the parent's start_date is it's predecessors end_date. If not, move child's
            // start_date and return. The parent's dates will be modified in the next iteration.
            if (notEmpty(parent.predecessors)) {
                var latest = this._getLatestPredecessor(parent);
                if (parent.start_date != latest.endDate) {
                    if (this.debug)
                        this._debugPrint("------>_recalcStartDate: Parent has a predecessor, setting " + task.number + "(" + task.short_description + ")" + " from "
                                + getTimeDisplay(task.start_date) + " to " + parent.number + " (" + parent.short_description + ")" + " end_date - "
                                + getTimeDisplay(latest.endDate));

                    task.start_date = latest.endDate;
                    task.changed = 'true';
                    return;
                }
            }

            // Set task's start date to parent's.
            if (task.start_date != parent.start_date) {
                if (this.debug)
                    this._debugPrint("------>_recalcStartDate: Setting task " + task.number + "(" + task.short_description + ")" + " from " + getTimeDisplay(task.start_date)
                            + " to a parent's (" + parent.number + " (" + parent.short_description + ")" + ") start_date - " + getTimeDisplay(parent.start_date));

                task.start_date = parent.start_date;
                task.changed = 'true';
            }

            return;
        }

        // Get the latest predecessor task and date and check/set the tasks.
        // If the the tasks's parent has a predecessor the task needs to be set to the latest of the two.
        var latest = this._getLatestPredecessor(task);
        if (notEmpty(parent.predecessors) && parent.start_date > latest.endDate) {
            if (this.debug)
                this._debugPrint("------>_recalcStartDate: Parent has a pred later than task's pred, setting " + task.number + "(" + task.short_description + ")" + " from "
                        + getTimeDisplay(task.start_date) + " to " + parent.number + " (" + parent.short_description + ")" + " end_date - " + getTimeDisplay(latest.endDate));

            task.start_date = parent.start_date;
            task.end_date = this._calcEndDateFromSchedule(parseInt(this._getStartDate(task)), parseInt(task.duration));
            task.changed = 'true';
        } else {
            if (this.debug)
                this._debugPrint("--->_recalcStartDate: comparing parent start " + getTimeDisplay(this._getParentTask(task.parent).start_date) + " to latest predecessor "
                        + getTimeDisplay(latest.endDate));

            if (task.start_date != latest.endDate) {
                if (this.debug)
                    this._debugPrint('--->_recalcStartDate: > Setting [' + task.short_description + '] to begin at the end of its latest predecessor ['
                            + latest.task.short_description + ' - ' + getTimeDisplay(latest.endDate) + '].');

                this._addBubbleChange();
                task.changed = 'true';
                task.start_date = latest.endDate;
                task.end_date = this._calcEndDateFromSchedule(parseInt(this._getStartDate(task)), parseInt(task.duration));
            }
        }
    },

    /**
     * 2 - Adjust the end date for all tasks. A tasks start date is defined as: > [no children] = Task's current end date > [has children] = Latest
     * of: > Task's immediate children > Task's start date
     */
    _recalcEndDate : function(task) {
        this._debugPrint("_recalcEndDate " + task.number);
        this._debugPrint(" _recalcEndDate start_date: " + task.start_date);
        this._debugPrint(" _recalcEndDate work_start: " + task.work_start);

        // calc end date from actual start if we have it
        startDate = this._getStartDate(task);
        // if (task.work_start > 0)
        // var startDate = task.work_start;
        // else
        // var startDate = task.start_date;

        // no children, calc end date from actual start + planned duration
        if (empty(task.children)) {
            endDate = this._calcEndDateFromSchedule(startDate, task.duration);
            this._debugPrint("_recalcEndDate - no children, calc endDate from start or actual start, endDate = " + endDate + ", duration = " + task.duration);
            if (task.end_date != endDate) {
                this._addBubbleChange();
                task.changed = 'true';
                task.end_date = endDate;
                this._debugPrint('_recalcEndDate: > Adjusting [' + task.short_description + ']\'s end date, calculated from either planned start or actual start plus duration');
            }
            return;
        }

        // check children for latest end date
        var endDate = startDate;
        var endDateTask;
        for ( var i = 0; i < task.children.length; i++) {
            var childTask = this.projectTasks[task.children[i]];
            if (this._getEndDate(childTask) > endDate) {
                endDate = this._getEndDate(childTask);
                endDateTask = childTask;
            }
        }

        this._debugPrint("_recalcEndDate endDate = " + endDate);
        if (task.end_date != endDate) {
            this._addBubbleChange();
            task.changed = 'true';
            task.end_date = endDate;
            task.duration = this._calcDurationFromSchedule(parseInt(this._getStartDate(task)), parseInt(this._getEndDate(task)));
            if (this.debug)
                this._debugPrint('_recalcEndDate: > Adjusting [' + task.short_description + ']\'s end date to the latest end date of it\'s immediate children: ['
                        + endDateTask.short_description + ']');
        }
    },

    // Returns the latest predecessor and it's date including any lag time specified
    _getLatestPredecessor : function(task) {
        var latestPredEndDate = 0;
        var latestPredTask = null;
        var predEndDate = null;

        this._forEach(task.predecessors, function(elem) {
            var predTask = this.projectTasks[elem.predecessor_sys_id];
            var predLag = elem.relationship_lag;

            predEndDate = parseInt(this._getEndDate(predTask));
            if (predLag)
                predEndDate += parseInt(predLag);

            // Compare against latest predecessor
            if (latestPredEndDate < predEndDate) {
                latestPredEndDate = predEndDate;
                latestPredTask = predTask;
            }

            if (this.debug)
                this._debugPrint("------>_recalcStartDate: found latest predecessor: " + latestPredTask.number + "(" + latestPredTask.short_description + ")" + " end date of "
                        + getTimeDisplay(latestPredEndDate));
        });

        return !latestPredTask ? null : {
            task : latestPredTask,
            endDate : latestPredEndDate
        };
    },

    // Returns the first significant parent in a tasks hierarchy.
    // A significant parent is one that has a precedessor or has a "start_on" time constraint.
    _getSignificantParent : function(task) {
        var latestStartDate = 0;
        var latestID = null;

        var parent = null;
        while (task.parent) {
            parent = this.projectTasks[task.parent];

            if (notEmpty(parent.predecessors) || this._isStartDateFixed(parent))
                if (parent.start_date > latestStartDate) {
                    latestStartDate = parent.start_date;
                    latestID = parent.sys_id;
                }

            task = parent;
        }

        if (!latestID || !parent)
            latestID = this.top_task;

        return this.projectTasks[latestID];
    },

    _calcEndDateFromSchedule : function(startDateMS, durationMS) {
        this._debugPrint("_calcEndDateFromSchedule - start=" + startDateMS + ", duration=" + durationMS);
        if (isNaN(startDateMS)) {
            this._debugPrint('_calcEndDateFromSchedule - overwrite with 0 when invalid startDateMS=' + startDateMS + ', durationMS=' + durationMS );
            return 0;
        }
        var endDateMS = 0;
        if (this.schedule) {
            var startDateGDT = new GlideDateTime();
            startDateGDT.setNumericValue(startDateMS);

            var durationGD = new GlideDuration(durationMS);
            var newEndDateGDT = this.schedule.add(startDateGDT, durationGD);
            endDateMS = newEndDateGDT.getNumericValue();

            // var dc = this._getDurationCalc();
            // dc.setStartDateTime(startDateGDT);
            // dc.calcDuration(parseInt(durationMS) / 1000);
            // var newEndDate = dc.getEndDateTime();
            // var newEndDateGDT = new GlideDateTime(newEndDate);
            // endDateMS = newEndDateGDT.getNumericValue();
        } else {
            endDateMS = startDateMS + durationMS;
        }
        this._debugPrint("_calcEndDateFromSchedule returning " + endDateMS.toString());
        return endDateMS;
    },

    _calcDurationFromSchedule : function(startDateMS, endDateMS) {
        this._debugPrint("_calcDurationFromSchedule start=" + startDateMS + ", end=" + endDateMS);
        var currentDuration = endDateMS - startDateMS;
        var durationMS = currentDuration;
        if (this.schedule) {
            var startDateGDT = new GlideDateTime();
            startDateGDT.setNumericValue(startDateMS);
            var endDateGDT = new GlideDateTime();
            endDateGDT.setNumericValue(endDateMS);

            var durationGD = this.schedule.duration(startDateGDT, endDateGDT);
            durationMS = durationGD.getNumericValue();
        }
        this._debugPrint("_calcDurationFromSchedule: durationMS=" + durationMS);
        return durationMS;
    },

    _isRollup : function(task) {
        return this.projectTask[task].rollup;
    },

    updateProject : function(insertRel) {
        if (this.debug) {
            var sw = new GlideStopWatch();
            this._debugPrint('updateProject: Begin updateProject()');
        }

        if (typeof (insertRel) === 'undefined')
            insertRel = true; // default - insert the entry

        // Update individual tasks that have changed start times
        var updateCount = 0; // Get the total number of changed items
        for ( var i in this.projectTasks) {
            if (this.projectTasks[i].changed != 'true')
                continue;

            var task = this.projectTasks[i];
            this._debugPrint("updateProject: saving " + task.number);
            this.printTask(task);

            var gr = new GlideRecord('planned_task');
            if (gr.get(task.sys_id)) {
                gr.setWorkflow(false);
                gr.time_constraint = task.time_constraint;
                if (!isNaN(task.start_date))
                    gr.start_date.getGlideObject().setNumericValue(task.start_date);
                if (!JSUtil.nil(task.work_start) && task.work_start != 0)
                    gr.work_start.getGlideObject().setNumericValue(task.work_start);
                gr.end_date.getGlideObject().setNumericValue(task.end_date);
                gr.critical_path = task.critical_path;
                gr.duration.setDateNumericValue(task.duration);
                gr.parent = task.parent;
                gr.rollup = task.rollup;
                gr.update();
                updateCount++;
            }
        }

        // Update relationships that need to be deleted
        for ( var i = 0; i < this.onUpdateRelationshipsToRemove.length; i++) {
            var gr = new GlideRecord('planned_task_rel_planned_task');
            if (gr.get(this.onUpdateRelationshipsToRemove[i])) {
                gr.setWorkflow(false);
                gr.deleteRecord();
            }
        }

        // Add relationships that need to be added
        if (insertRel)
            for ( var i = 0; i < this.onUpdateRelationshipsToAdd.length; i++) {
                var gr = new GlideRecord('planned_task_rel_planned_task');
                gr.initialize();
                gr.type.setDisplayValue('Predecessor of::Successor of');
                gr.setValue('parent', this.onUpdateRelationshipsToAdd[i].predecessor_sys_id);
                gr.setValue('child', this.onUpdateRelationshipsToAdd[i].successor_sys_id);
                gr.setWorkflow(false);
                gr.insert();
            }

        this._debugPrint('updateProject: > Updated ' + updateCount + ' existing planned tasks.');
        this._debugPrint('updateProject: > Removed ' + this.onUpdateRelationshipsToRemove.length + ' planned task relationships.');
        this._debugPrint('updateProject: > Added ' + this.onUpdateRelationshipsToAdd.length + ' planned task relationships.');

        if (this.debug)
            sw.log(this.type + ' :: End updateProject()');
    },

    _processCriticalPath : function() {
        if (this.debug) {
            var sw = new GlideStopWatch();
            this._debugPrint('_processCriticalPath: Begin of Critical Path Processing ...');
        }

        // Create array to hold changed tasks
        var criticalTasks = Array();

        // Now process the tasks starting with the top level task
        this._markCritical(this.top_task, criticalTasks);

        // Update tasks that have changed
        for ( var i in this.projectTasks) {
            var task = this.projectTasks[i];
            if (task.critical_path == 'true' && !inArray(task.sys_id, criticalTasks)) {
                task.critical_path = 'false';
                task.changed = 'true';
                this._addBubbleChange();
                this._debugPrint('_processCriticalPath: > [' + task.short_description + '] is no longer apart of the critical path.');
            } else if (task.critical_path != 'true' && inArray(task.sys_id, criticalTasks)) {
                task.critical_path = 'true';
                task.changed = 'true';
                this._addBubbleChange();
                this._debugPrint('_processCriticalPath: > [' + task.short_description + '] is now apart of the critical path.');
            }
        }

        if (this.debug)
            sw.log(this.type + ' :: Finished Processing Critical Path');
    },

    _markCritical : function(projectTaskId, criticalTasks) {
        var projectTask = this.projectTasks[projectTaskId];

        // Mark this task as critical
        criticalTasks.push(projectTask.sys_id);

        // Now process your children
        if (notEmpty(projectTask.children)) {
            for ( var i = 0; i < projectTask.children.length; i++) {
                var childTask = this.projectTasks[projectTask.children[i]];

                // If the child has the same end date as its parent, reprocess
                // it as critical
                if (childTask.end_date == projectTask.end_date)
                    this._markCritical(childTask.sys_id, criticalTasks);
            }
        }

        // Now process task's predecessors
        if (notEmpty(projectTask.predecessors)) {
            for ( var i = 0; i < projectTask.predecessors.length; i++) {
                var predTask = this.projectTasks[projectTask.predecessors[i].predecessor_sys_id];

                // If the predecessor has the same end date as your start date,
                // reprocess it as critical
                if (predTask.end_date == projectTask.start_date)
                    this._markCritical(predTask.sys_id, criticalTasks);
            }
        }
    },

    /*
     * get a tasks start date, actual wins if exists
     */
    _getStartDate : function(task) {
        if (!JSUtil.nil(task.work_start) && task.work_start > 0)
            return task.work_start;

        return task.start_date;
    },

    /*
     * get a tasks start date, actual wins if exists
     */
    _getEndDate : function(task) {
        if (!JSUtil.nil(task.work_end) && task.work_end > 0)
            return task.work_end;

        return task.end_date;
    },

    _getDurationCalc : function() {
        var dc = new DurationCalculator();
        dc.setSchedule(this.schedule);
        return dc;
    },

    _getParentTask : function(parentID) {
        if (!parentID)
            return null;

        var parent = this.projectTasks[parentID];

        return !parent ? null : parent;
    },

    _isStartDateFixed : function(task) {
        return task.time_constraint == this.START_ON;
    },

    /*
     * Output to console when debug enabled
     */
    _debugPrint : function(msg) {
        if (!this.debug)
            return;

        gs.log(this.type + ":: " + msg, this.type);
    },

    /*
     * Sick of writing array iteration loops! This function does that FOR you (weak). Pass in the array and a function that you want to iteratate
     * over. If you need the loop to break return true from your function.
     * 
     * The current element and index are passed into the function call.
     */
    _forEach : function(arr, func) {
        var l = arr.length;
        for ( var i = 0; i < l; i++)
            if (func.call(this, arr[i], i))
                break;
    },
    
    /*
	 * Any of the itemTask's successor (successor's successors) should not be new parent
	 * Any of the itemTask's children's successor should not be new parent
	 */ 
    checkNewParentValidity : function(itemTaskSysId, newParentSysId) {
    	if (typeof this.projectTasks[newParentSysId] == "undefined") {
        	this._debugPrint("checkNewParentValidity PTC has no effect on non planned_task parent for task " + this._info(itemTaskSysId));
        	return this.STATUS_CODE.SUCCESS; //From PTC perspective no effect
		} 
   		
        this._debugPrint("checkNewParentValidity " + this._info(itemTaskSysId) + " with new parent " + this._info(newParentSysId));
        if (!this.loadValid())
            return this.STATUS_CODE.INVALID;
    	if (this._parentInSuccessor(itemTaskSysId, newParentSysId))
    		return this.STATUS_CODE.INVALID;
    	var itemTask = this.projectTasks[itemTaskSysId];
        for ( var i in itemTask.children) {
        	if (this._parentInSuccessor(itemTask.children[i], newParentSysId))
    			return this.STATUS_CODE.INVALID;
        }
        return this.STATUS_CODE.SUCCESS;
	},
	_parentInSuccessor : function(itemTaskSysId, newParentSysId) {
		var itemTask = this.projectTasks[itemTaskSysId];
        for ( var i in itemTask.successors) {
            if (itemTask.successors[i] == newParentSysId) {
            	this._debugPrint("_parentInSuccessor found as predecessor " + this._info(itemTaskSysId) + " with successor " + this._info(newParentSysId));
                return true;
            }
            if (this._parentInSuccessor(itemTask.successors[i], newParentSysId))
            	return true;    
        }
        return false;	
	},
	
	_info : function(id) {
		var itemTask = this.projectTasks[id];
		return itemTask.number + ":" + itemTask.short_description;
	},

    type : 'PlannedTaskCalculator',
};