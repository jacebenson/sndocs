// Class Imports  



var TimelineItem = GlideTimelineItem;
var StringUtil = GlideStringUtil;

// String Constants (These are all injected using gs.getMessage)
var MOVE_CONFIRM = gs.getMessage('<strong>Move</strong> the following task:');
var REL_CONFIRM = gs.getMessage('<strong>Create</strong> the following relationship:');
var START_CONFIRM = gs.getMessage('Change the <strong>start date</strong> of the following task:');
var END_CONFIRM = gs.getMessage('Change the <strong>end date<strong> of the following task:');
var ITEM_MOVE_1 = gs.getMessage('Make task');
var ITEM_MOVE_2 = gs.getMessage('(and it\'s children tasks) a child of:');
var ERROR_TITLE = gs.getMessage('Error');
var GANTT_REQUIREMENT = gs.getMessage('This is required for displaying a gantt chart.');
var ERROR_NO_TASK_ID = gs.getMessage('No "sysparm_timeline_task_id" specified in the original Url. This is required for displaying a gantt chart.');
var ERROR_NO_GR_TASK = gs.getMessage('Unable to find a matching task record with the specified system Id.');
var ERROR_INVALID_1 = gs.getMessage("That action is not allowed because it would place a child task's start date prior to the start date of its parent.");
var ERROR_REL_EXISTS = gs.getMessage('That relationship already exists.');
var ERROR_REL_INVALID = gs.getMessage('That relationship is not allowed.');
var ERROR_MOVE_INVALID = gs.getMessage('This relationship is not allowed because the specified parent is already a nested child of the task.');
var ERROR_MOVE_DUP = gs.getMessage('The specified task is already an immediate child of the desired parent.');
var CONFIRM_TITLE = gs.getMessage('Confirm Action');
var REL_IS_PRED = gs.getMessage('will now be a predecessor of');
var ERROR_NO_NAME = gs.getMessage('You must specify a name for the planned task you wish to add.');
var START_LABEL = gs.getMessage('Start');
var END_LABEL = gs.getMessage('End');
var SCHEDULE_NOTICE = gs.getMessage('Project schedule may impact date calculation');
var MESSAGES = [ERROR_TITLE, ERROR_NO_TASK_ID];

var TimelineGanttSchedulePage = Class.create();
TimelineGanttSchedulePage.prototype = Object.extendsObject(AbstractTimelineSchedulePage, {

    //////////////////////////////////////////////////////////////////////////////////////////////////
	// GET_ITEMS
	//////////////////////////////////////////////////////////////////////////////////////////////////
	isPublic: function() {
		return false;
	},
				
	getItems: function() {
		var task_id = this.getParameter("sysparm_timeline_task_id");
		var baseline = this.getParameter("sysparm_timeline_baseline_id");

		if (task_id == null)
			return this.setStatusError(ERROR_TITLE, ERROR_NO_TASK_ID);

		var gr = new GlideRecord('planned_task');
		if (!gr.get(task_id))
			return this.setStatusError(ERROR_TITLE, ERROR_NO_GR_TASK + ' ' + GANTT_REQUIREMENT);

		// We will utilize the PlannedTaskCalculator script include to perform the calculations.
		var ptc = new PlannedTaskCalculator();
		ptc.load(gr);

		// Specify the page title
		var pageTitle = ptc.getTopTaskShortDescription();
		if (JSUtil.nil(pageTitle) || pageTitle.length == 0) {
			this.setPageTitle(StringUtil.escapeHTML('Gantt Chart'));
		}
		else
			this.setPageTitle(StringUtil.escapeHTML(pageTitle));

		if (!JSUtil.nil(baseline))
			this.baselineItems = this._getBaselineItems(baseline);

		this._returnItemsFromPtc(ptc);
	},

	/*
	 * get baseline records for top task
	 */
	_getBaselineItems: function(baseline) {
		var baselineItems = new GlideRecord("planned_task_baseline_item");
		baselineItems.addQuery("baseline", baseline);
		baselineItems.query();
		if (baselineItems.hasNext())
			return baselineItems;
	},

	_returnItemsFromPtc: function(ptc, baseline) {
		for (var i in ptc.projectTasks) {
			var myTask = ptc.projectTasks[i];

			var item = new TimelineItem('planned_task', myTask.sys_id);
			item.setLeftLabelText(myTask.short_description);
			item.setParent(myTask.parent);
			item.setIsDraggable(true);

			var span = item.createTimelineSpan('planned_task', myTask.sys_id);

			//use actual dates when available
			if (myTask.work_start > 0) {
				var start = myTask.work_start;
				//prevent left drag if already started
				span.setAllowXDragLeft(false);
			}
			else {
				var start = myTask.start_date;
				span.setAllowXDragLeft(true);
				span.setAllowXMove(true);
			}

			if (myTask.work_end > 0) {
				var end = myTask.work_end;
				//prevent right drag if already ended
				span.setAllowXDragRight(false);
				item.setIsDraggable(false);
			}
			else {
				var end = myTask.end_date;
				span.setAllowXDragRight(true);
			}

			//don't allow asap tasks to be dragged
			if (myTask.time_constraint == "asap") {
				span.setAllowXDragLeft(false);
				span.setAllowXMove(false);
			}
			
			//don't allow parent dates to change since they are defined by the children
			if (myTask.rollup == 1) {
				span.setAllowXDragLeft(false);
				span.setAllowXDragRight(false);
				span.setAllowXMove(false);
			}
			
			span.setTimeSpan(start, end);
			// Set the inner span from the completion percentage
			var pc = parseFloat(myTask.percent_complete, 10) / 100;
			if (pc > 0) {
				span.setInnerSegmentTimeSpan(myTask.start_date, span.getStartTimeMs() + ((span.getEndTimeMs() - span.getStartTimeMs()) * pc));
			}

			span.setSpanText(myTask.short_description);
			span.addPredecessor(myTask.predecessors);
			span.setIsChanged(myTask.changed == 'true' ? true : false);

			if (myTask.children.length > 0) {
				span.setSpanColor("#898989"); // Has Children
                span.setSpanBorderColor("898989");
			    span.setHasChildren(true);
				span.setInnerSegmentClass('silver');
			}
			else if (myTask.state == "3") {
				span.setSpanColor("#7C98EA"); // Closed Complete
                span.setSpanBorderColor("#7C98EA");
				span.setInnerSegmentClass('blue');

			}
			else if (myTask.state == "2") {
				span.setSpanColor("#38E902"); // Work In Progress
                span.setSpanBorderColor("#38E902");
				span.setInnerSegmentClass('green');
			}
			else if (myTask.critical_path == "true") {
				span.setSpanColor("#DC6565"); // Critical path
				span.setInnerSegmentClass('red');
			}
			else if (myTask.state == "-5") {
				span.setSpanColor("#7C98EA");
                span.setSpanBorderColor("#7C98EA");
				span.setInnerSegmentClass('cyan');
			}
			// Pending

			span.setAllowYMove(false);
			span.setAllowYMovePredecessor(true);

			//don't move start if we have actual start
			if (myTask.work_start > 0) {
				span.setAllowXDragLeft(false);
				span.setAllowXMove(false);
			}

			//don't move end if we've completed
			if (myTask.work_end > 0)
				span.setAllowXDragRight(false);

			//TODO - get baseline value from client select
			if (this.baselineItems) {
				if (this.baselineItems.find("task", myTask.sys_id)) {
					var baseline = this.baselineItems;
					var baselineSpan = item.createTimelineSpan('planned_task_baseline_item', baseline.getUniqueValue());
					baselineSpan.setIsBaseline(true);
					var baseStart = baseline.start.getGlideObject().getNumericValue();
					var baseEnd = baseline.end.getGlideObject().getNumericValue();
					baselineSpan.setTimeSpan(baseStart, baseEnd);
					if (baseEnd > end) {
						//ahead of baseline
						var variance = (baseEnd - end)/1000/3600/24; //get days
						variance = Math.round(variance*10)/10;
						var baselineInfo = variance + " days ahead of baseline";
					}
					else {
						//later than baseline
						var variance = (end - baseEnd)/1000/3600/24; //get days
						variance = Math.round(variance*10)/10;
						var baselineInfo = variance + " days behind baseline";
					}
					baselineSpan.setTooltip(myTask.number + " is " + baselineInfo);
					myTask.baselineInfo = baselineInfo;
				}
			}
			span.setTooltip(this._generateTooltip(myTask));
			this.add(item);
		}
	},

	_generateTooltip: function(myTask) {
		var tt = '<div style="padding:2px;"><div style="font-size:10pt;border-bottom:1px solid #ccc;padding-bottom:5px;"><strong>' +
		StringUtil.escapeHTML(myTask.short_description) +
		'</strong><br />';
		tt += '</div>';
		tt += '<div style="padding-top:5px;">';
		tt += '<span class="tl_label_name">State </span> <span class="tl_label_value">'+ myTask.state_display +'</span><div style="clear:both;"></div>'; 
		if (myTask.assigned_to != '')
			tt += '<span class="tl_label_name">Assigned To </span> <span class="tl_label_value">' + myTask.assigned_to + '</span><div style="clear:both;"></div>';

		tt += '<span class="tl_label_name">Time Constraint </span> <span style="tl_label_value">' + (myTask.time_constraint == 'start_on' ? 'Specified' : 'ASAP') + '</span><div style="clear:both;"></div>';

		if (myTask.work_start > 0) {
			tt += '<span class="tl_label_name">Planned Start </span> <span class="tl_label_value">' + this._getDisplayTime(myTask.start_date) + '</span><div style="clear:both;"></div>';
			tt += '<span class="tl_label_name">Actual Start </span> <span class="tl_label_value">' + this._getDisplayTime(myTask.work_start) + '</span><div style="clear:both;"></div>';
		}
		else
			tt += '<span class="tl_label_name">Planned Start </span> <span class="tl_label_value">' + this._getDisplayTime(myTask.start_date) + '</span><div style="clear:both;"></div>';

		if (myTask.work_end > 0) {
			tt += '<span class="tl_label_name">Planned End </span> <span class="tl_label_value">' + this._getDisplayTime(myTask.end_date) + '</span><div style="clear:both;"></div>';
			tt += '<span class="tl_label_name">Actual End </span> <span class="tl_label_value">' + this._getDisplayTime(myTask.work_end) + '</span><div style="clear:both;"></div>';
		}
		else
			tt += '<span class="tl_label_name">Planned End </span> <span class="tl_label_value">' + this._getDisplayTime(myTask.end_date) + '</span><div style="clear:both;"></div>';

		if (myTask.work_duration > 0)
			tt += '<span class="tl_label_name">Actual Duration: </span> <span class="tl_label_value">' + myTask.work_duration_display + '</span><div style="clear:both;"></div>';
		else
			tt += '<span class="tl_label_name">Duration </span> <span class="tl_label_value">' + myTask.duration_display + '</span><div style="clear:both;"></div>';

		if (myTask.percent_complete && parseInt(myTask.percent_complete, 10) > 0)
			tt += '<span class="tl_label_name">% Complete </span> <span class="tl_label_value">' + myTask.percent_complete + '%</span><div style="clear:both;"></div>';

		tt += '<span class="tl_label_name">Critical </span> <span class="tl_label_value">' + (myTask.critical_path == 'true' ? 'Yes' : 'No') + '</span><div style="clear:both;"></div>';

		if (myTask.baselineInfo)
			tt += myTask.baselineInfo;

		tt += '</div></div>';
		return tt;
	},

	_getDisplayTime: function(timeMs) {
		var gdt = new GlideDateTime();
		gdt.setNumericValue(timeMs);
		return gdt.getDisplayValue();
	},

	_returnInvalidMoveStartBeforeParent: function() {
		return this.setStatusError(ERROR_TITLE, ERROR_INVALID_1);
	},

	//////////////////////////////////////////////////////////////////////////////////////////////////
	// HELPER
	//////////////////////////////////////////////////////////////////////////////////////////////////

	_getSpanTask: function(spanId) {
		// Get information about the current task
		var grTask = new GlideRecord('planned_task');
		grTask.addQuery('sys_id', spanId);
		grTask.query();
		return grTask;
	},

	_getPTCTask: function(id) {
		
	},
	
	_noSpanTaskId: function() {
		return this.setStatusError(ERROR_TITLE, ERROR_NO_GR_TASK);
	},

	//////////////////////////////////////////////////////////////////////////////////////////////////
	// ELEMENT_MOVE_X
	//////////////////////////////////////////////////////////////////////////////////////////////////

	elementMoveX: function(spanId, newStartDateTimeMs) {
		// Get information about the current task
		var gr = this._getSpanTask(spanId);
		if (!gr.next())
			return this._noSpanTaskId();

		// Set the dialog prompt message
		var gdt = new GlideDateTime();
		gdt.setNumericValue(newStartDateTimeMs);
		
		this.setStatusPrompt(CONFIRM_TITLE, MOVE_CONFIRM +
		'<div style="margin:10px 0 10px 14px;padding:4px;background-color:#EBEBEB;"><strong>' +
		StringUtil.escapeHTML(gr.short_description) +
		'</strong><br /><div class="font_smaller">' +
		gr.number + '<br/>' + 
		START_LABEL + ': ' + this._getDisplayTime(newStartDateTimeMs) + '<br/>' +
		'</div></div>', 'this._elementMoveX_Yes', 'this._elementMoveX_No', 'this._elementMoveX_No');

		this._elementMoveX_Handler(spanId, gr, newStartDateTimeMs, false);
	},

	_elementMoveX_Yes: function(spanId, newStartDateTimeMs) {
		// Get information about the current task
		var gr = this._getSpanTask(spanId);
		if (!gr.next())
			return this._noSpanTaskId();

		this._elementMoveX_Handler(spanId, gr, newStartDateTimeMs, true);
	},

	_elementMoveX_Handler: function(spanId, grTask, newStartDateTimeMs, boolDoUpdate) {
		var ptc = new PlannedTaskCalculator();
		ptc.load(grTask);
		ptc.shiftProjectTask(spanId, newStartDateTimeMs);
		ptc.recalcProject();
		if (!boolDoUpdate)
			return this._returnItemsFromPtc(ptc);

		ptc.updateProject();
		this.setDoReRenderTimeline(true);
	},

	_elementMoveX_No: function(spanId, newStartDateTimeMs) {
		this.setDoReRenderTimeline(true);
	},

	//////////////////////////////////////////////////////////////////////////////////////////////////
	// ELEMENT_SUCCESSOR
	//////////////////////////////////////////////////////////////////////////////////////////////////
	elementSuccessor: function(spanId, newSuccSpanId) {
		this._elementSuccessor_Handler(spanId, newSuccSpanId, false);
	},

	_elementSuccessor_Yes: function(spanId, newSuccSpanId) {
		this._elementSuccessor_Handler(spanId, newSuccSpanId, true);
	},

	_elementSuccessor_Handler: function(spanId, newSuccSpanId, boolDoUpdate) {
		// Get information about the predecessor task
		var grPred = this._getSpanTask(spanId);
		if (!grPred.next())
			return this._noSpanTaskId();

		// Get information about the successor task
		var grSucc = this._getSpanTask(newSuccSpanId);
		if (!grSucc.next())
			return this._noSpanTaskId();

		var ptc = new PlannedTaskCalculator();
		ptc.load(grPred);
		var statusCode = ptc.isNewRelationshipValid(spanId, newSuccSpanId);
		if (statusCode == ptc.STATUS_CODE.DUPLICATE)
			return this.setStatusError(ERROR_TITLE, ERROR_REL_EXISTS);
		if (statusCode == ptc.STATUS_CODE.RECURSIVE)
			return this.setStatusError(ERROR_TITLE, ERROR_REL_INVALID);

		ptc.addRelationship(spanId, newSuccSpanId);
		ptc.recalcProject();
		if (boolDoUpdate) {
			ptc.updateProject();
			return this.setDoReRenderTimeline(true);
		}

		// Set status prompt
		this.setStatusPrompt(CONFIRM_TITLE, REL_CONFIRM +
		'<div style="margin:10px 0 10px 14px;padding:4px;background-color:#EBEBEB;"><strong>' +
		StringUtil.escapeHTML(grPred.short_description) +
		'</strong><br /><div class="font_smaller">' +
		grPred.number +
		'</div></div>' +
		'<div>' +
		REL_IS_PRED +
		'</div>' +
		'<div style="margin:10px 0 10px 14px;padding:4px;background-color:#EBEBEB;"><strong>' +
		StringUtil.escapeHTML(grSucc.short_description) +
		'</strong><br /><div class="font_smaller">' +
		grSucc.number +
		'</div></div>', 'this._elementSuccessor_Yes', 'this._elementSuccessor_No', 'this._elementSuccessor_No');
		return this._returnItemsFromPtc(ptc);
	},

	_elementSuccessor_No: function(spanId, newSuccSpanId) {
		this.setDoReRenderTimeline(true);
	},

	//////////////////////////////////////////////////////////////////////////////////////////////////
	// ELEMENT_TIME_ADJUST START
	//////////////////////////////////////////////////////////////////////////////////////////////////
	elementTimeAdjustStart: function(spanId, newStartDateTimeMs) {
		this._elementTimeAdjustStart_Handler(spanId, newStartDateTimeMs, false);
	},

	_elementTimeAdjustStart_Yes: function(spanId, newStartDateTimeMs) {
		this._elementTimeAdjustStart_Handler(spanId, newStartDateTimeMs, true);
	},

	_elementTimeAdjustStart_Handler: function(spanId, newStartDateTimeMs, boolDoUpdate) {
		// Get information about the current task
		var gr = this._getSpanTask(spanId);
		if (!gr.next())
			return this._noSpanTaskId();

		var ptc = new PlannedTaskCalculator();
		ptc.load(gr);
		ptc.changeProjectTask(spanId, 'time_constraint', 'start_on');
		ptc.changeProjectTask(spanId, 'start_date', newStartDateTimeMs);

		//TODO - this method does not exist in ptc
		if (ptc.doesMoveStartPriorToParent(spanId))
			return this._returnInvalidMoveStartBeforeParent();

		ptc.recalcProject();
		if (boolDoUpdate) {
			ptc.updateProject();
			return this.setDoReRenderTimeline(true);
		}

		var task = ptc.getTask(spanId);
		// Set the Prompt box properties
		this.setStatusPrompt(CONFIRM_TITLE, START_CONFIRM +
		'<div style="margin:10px 0 10px 14px;padding:4px;background-color:#EBEBEB;"><strong>' +
		StringUtil.escapeHTML(gr.short_description) +
		'</strong><br /><div class="font_smaller">' +
		gr.number + '<br/>' + 
		START_LABEL + ': ' + this._getDateDisplay(task.start_date) + '<br/>' +
		'</div></div>', 'this._elementTimeAdjustStart_Yes', 'this._elementTimeAdjustStart_No', 'this._elementTimeAdjustStart_No');

		return this._returnItemsFromPtc(ptc);
	},

	_elementTimeAdjustStart_No: function(spanId, newStartDateTimeMs) {
		this.setDoReRenderTimeline(true);
	},

	//////////////////////////////////////////////////////////////////////////////////////////////////
	// ELEMENT_TIME_ADJUST END
	//////////////////////////////////////////////////////////////////////////////////////////////////
	elementTimeAdjustEnd: function(spanId, newEndDateTimeMs) {
		this._elementTimeAdjustEnd_Handler(spanId, newEndDateTimeMs, false);
	},

	_elementTimeAdjustEnd_Yes: function(spanId, newEndDateTimeMs) {
		this._elementTimeAdjustEnd_Handler(spanId, newEndDateTimeMs, true);
	},

	_elementTimeAdjustEnd_Handler: function(spanId, newEndDateTimeMs, boolDoUpdate) {
		// Get information about the current task
		var gr = this._getSpanTask(spanId);
		if (!gr.next())
			return this._noSpanTaskId();

		var ptc = new PlannedTaskCalculator();
		ptc.load(gr);
		ptc.changeProjectTask(spanId, 'end_date', newEndDateTimeMs);
		if (ptc.doesMoveStartPriorToParent(spanId))
			return this._returnInvalidMoveStartBeforeParent();

		ptc.recalcProject();
		if (boolDoUpdate) {
			ptc.updateProject();
			return this.setDoReRenderTimeline(true);
		}

		var scheduleNotice = "";
		if (ptc.schedule)
			scheduleNotice = '<font style="color:red">' + SCHEDULE_NOTICE + '</font><br/>';
		
		// Set the Prompt box properties
		this.setStatusPrompt(CONFIRM_TITLE, END_CONFIRM +
		'<div style="margin:10px 0 10px 14px;padding:4px;background-color:#EBEBEB;"><strong>' +
		StringUtil.escapeHTML(gr.short_description) +
		'</strong><br /><div class="font_smaller">' +
		gr.number + '<br/>' +
		END_LABEL + ': ' + this._getDisplayTime(newEndDateTimeMs) + '<br/>' +
		scheduleNotice + 
		'</div></div>', 'this._elementTimeAdjustEnd_Yes', 'this._elementTimeAdjustEnd_No', 'this._elementTimeAdjustEnd_No');

		return this._returnItemsFromPtc(ptc);
	},

	_elementTimeAdjustEnd_No: function(spanId, newEndDateTimeMs) {
		this.setDoReRenderTimeline(true);
	},

	//////////////////////////////////////////////////////////////////////////////////////////////////
	// INPUT_ADD
	//////////////////////////////////////////////////////////////////////////////////////////////////
	inputBox: function(strItemName) {
		var task_id = this.getParameter("sysparm_timeline_task_id");
		if (task_id == null)
			return this.setStatusError(ERROR_TITLE, ERROR_NO_TASK_ID);

		// Create a new planned task
		var gr = new GlideRecord('pm_project_task');
		gr.setValue('short_description', strItemName);
		gr.setValue('parent', task_id);
		gr.insert();

		return this.setDoReRenderTimeline(true);
	},

	//////////////////////////////////////////////////////////////////////////////////////////////////
	// ITEM_MOVE
	//////////////////////////////////////////////////////////////////////////////////////////////////
	itemMove: function(itemSysId, newItemSysId) {
		var result = this._itemMoveHandler(itemSysId.toString(), newItemSysId.toString(), false);
		gs.print("TimelineGanttSchedulePage::itemMove result= " + result);
	},

	_itemMoveYesClick: function(itemSysId, newItemSysId) {
		this._itemMoveHandler(itemSysId, newItemSysId, true);
	},

	_itemMoveNoClick: function(itemSysId, newItemSysId) {
		return this.setDoReRenderTimeline(true);
	},

	_itemMoveHandler: function(itemSysId, newItemSysId, boolDoUpdate) {
		var task_id = this.getParameter("sysparm_timeline_task_id");
		if (task_id == null)
			return this.setStatusError(ERROR_TITLE, ERROR_NO_TASK_ID);

		var gr = new GlideRecord('planned_task');
		gr.addQuery('sys_id', task_id);
		gr.query();
		if (!gr.next())
			return this.__noSpanTaskId();

		// Get information about the current Task and Parent
		var grChild = new GlideRecord('planned_task');
		grChild.addQuery('sys_id', itemSysId);
		grChild.query();
		grChild.next();
		var grParent = new GlideRecord('planned_task');
		grParent.addQuery('sys_id', newItemSysId);
		grParent.query();
		grParent.next();

		// We will utilize the PlannedTaskCalculator script include to perform the calculations.
		var ptc = new PlannedTaskCalculator();
		ptc.load(gr);
		var result = ptc.changeParent(itemSysId, newItemSysId);
		// Check the result
		if (result == ptc.STATUS_CODE.DUPLICATE)
			return this.setStatusError(ERROR_TITLE, ERROR_MOVE_DUP);
		else if (result == ptc.STATUS_CODE.INVALID)
			return this.setStatusError(ERROR_TITLE, ERROR_MOVE_INVALID);

		ptc.validateRelationships();
		ptc.recalcProject();
		if (boolDoUpdate) {
			ptc.updateProject();
			return this.setDoReRenderTimeline(true);
		}

		// Set status prompt
		this.setStatusPrompt(CONFIRM_TITLE, ITEM_MOVE_1 +
		'<div style="margin:10px 0 10px 14px;padding:4px;background-color:#EBEBEB;"><strong>' +
		StringUtil.escapeHTML(grChild.short_description) +
		'</strong><br /><div class="font_smaller">' +
		grChild.number +
		'</div></div>' +
		'<div>' +
		ITEM_MOVE_2 +
		'</div>' +
		'<div style="margin:10px 0 10px 14px;padding:4px;background-color:#EBEBEB;"><strong>' +
		StringUtil.escapeHTML(grParent.short_description) +
		'</strong><br /><div class="font_smaller">' +
		grParent.number +
		'</div></div>', 'this._itemMoveYesClick', 'this._itemMoveNoClick', 'this._itemMoveNoClick');
		return this._returnItemsFromPtc(ptc);
	}

});