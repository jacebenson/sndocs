// Class Imports
var TimelineItem = GlideTimelineItem;

ERROR_TITLE = gs.getMessage('ERROR');
ERROR_NO_PAGE_ID = gs.getMessage('One of the required fields was not specified. Make sure "sysparm_timeline_page_id" is specified.');
ERROR_INTERACTIVE = gs.getMessage('One of the required parameters was not properly specified');
ERROR_SECURITY = gs.getMessage('Modification of this record is not allowed');
ERROR_INVALID_PAGE_ID = gs.getMessage('Unable to find a timeline page with the specified ID');
ERROR_INVALID_SUB_ID = gs.getMessage('Unable to find a timeline page sub item with the specified ID');

var SuccessorRange = Class.create();
SuccessorRange.prototype = {
	initialize : function() {
		this.min = -1;
		this.max = -1;
		this.leftIDs = "";
		this.rightIDs = "";
	},
	
	setMin: function(timeMs, id) {
		if (this.min == -1 || timeMs <= this.min) {
			if (timeMs != this.min)
				this.leftIDs = "";
			this.min = timeMs;
			this.leftIDs = this.leftIDs + "," + id;
		}
	},
	
	setMax: function(timeMs, id) {
		if (this.max == -1 || timeMs >= this.max) {
			if (timeMs != this.max)
				this.rightIDs = "";
			this.max = timeMs;
			this.rightIDs = this.rightIDs + "," + id;
		}
	},
	
	merge: function(other) {
		if (other.min < this.min) {
			this.min = other.min;
			this.leftIDs = other.leftIDs;
		}else if (other.min == this.min) {
			this.leftIDs = this.leftIDs + "," + other.leftIDs;
		}
		if (other.max > this.max) {
			this.max = other.max;
			this.rightIDs = other.rightIDs;
		}else if (other.max == this.max) {
			this.rightIDs = this.rightIDs + "," + other.rightIDs;
		}
	}
};

var TimelineGeneratorSchedulePage = Class.create();
TimelineGeneratorSchedulePage.prototype = Object.extendsObject(AbstractTimelineSchedulePage, {
	
	// ////////////////////////////////////////////////////////////////////////////////////////////////
	// GET_ITEMS
	// ////////////////////////////////////////////////////////////////////////////////////////////////
	ERROR_CODE_NO_ID: 1,
	ERROR_CODE_INVALID_ID: 2,
	ERROR_SUB_INVALID_ID: 3,
	
	_getPageRecord: function() {
		var timelinePageId = this.getParameter("sysparm_timeline_page_id");
		var timelineOldPageName = this.getParameter("sysparm_timeline");
		if (timelinePageId == null && timelineOldPageName == null)
			return this.ERROR_CODE_NO_ID;
		var pageRecord = new GlideRecord('cmn_timeline_page');
		if (timelinePageId != null)
			pageRecord.addQuery('sys_id', timelinePageId);
		else
			pageRecord.addQuery('name', timelineOldPageName);
		pageRecord.query();
		if (!pageRecord.next())
			return this.ERROR_CODE_INVALID_ID;
		else
			return pageRecord;
	},
	
	_setStatusError: function(code) {
		switch(code) {
			case this.ERROR_CODE_NO_ID:
			return this.setStatusError(ERROR_TITLE, ERROR_NO_PAGE_ID);
			case this.ERROR_CODE_INVALID_ID:
			return this.setStatusError(ERROR_TITLE, ERROR_INVALID_PAGE_ID);
			case this.ERROR_SUB_INVALID_ID:
			return this.setStatusError(ERROR_TITLE, ERROR_INVALID_SUB_ID);
		}
	},
	
	getItems : function() {
		var result = this._getPageRecord();
		if (typeof result == "number")
			return this._setStatusError(result);
		
		// Set page title
		if (result.name != '')
			this.setPageTitle(result.name);
		
		//Create range calculator if specified
		var calculator;
		if (result.range_calculator && result.range_calculator.name)
			eval("calculator = new " + result.range_calculator.name + "()");
		
		this.populateItems(result, null, -1, -1, null, calculator);
	},
	
	populateItems: function(result, parentID, parentMinMS, parentMaxMS, successorRange, calculator) {
		if (calculator)
			calculator.logMessage(parentID);

		var restricted = false;

		// Obtain the list of span styles associated with this timeline page.
		var styles = new GlideRecord("cmn_timeline_page_style");
		styles.addQuery("timeline_page", result.sys_id);
		styles.orderBy("order");
		styles.query();

		// Ok now lets create the spans
		var gr = new GlideRecordSecure(result.table);
		if (parentID)
			gr.addQuery(result.parent_col, parentID);

		// Do we have ordering query information?
		if (result.sort_by != null && result.sort_by != '' && result.sort_by_order == 'DESC')
			gr.orderByDesc(result.sort_by);
		else if (result.sort_by != null && result.sort_by != '')
			gr.orderBy(result.sort_by);
		else
			gr.orderBy(result.start_date_field);
		
		// Is there a query condition?
		if (result.condition != null)
			gr.addEncodedQuery(result.condition);

		gr.setQueryReferences(true);
		gr.query();

		while (gr.next()) {
			// check user has access to record date fields to avoid NPE later on
			if (JSUtil.nil(gr.getValue(result.start_date_field)) || JSUtil.nil(gr.getValue(result.end_date_field)))
				continue;

			var recordTable = result.table;
			var recordID = gr.sys_id;

			var item = new TimelineItem(recordTable, recordID);
			if (parentID)
				item.setParent(parentID);

			var span = item.createTimelineSpan(recordTable, recordID);
			if (parentID)
				span.addPredecessor(parentID);

			// ----- SPAN START/END TIME -----
			var sdo = gr[result.start_date_field].getGlideObject();
			var edo = gr[result.end_date_field].getGlideObject();

			// Ensure we have a start date; otherwise, do not display.
			if (!sdo.hasDate())
				continue;
			
			// If an item has no end date, we will set it to the start date for
			// all timeline pages
			// as it is common for tasks, incidents, changes, etc. to have only
			// a start date. These
			// will show up as points on the timeline.
			if (!edo.hasDate())
				edo = sdo;
			
			span.setTimeSpan(sdo, edo);
			
			if (calculator) {
				var maxResult = calculator.getMaxRangeDetails(recordID, result.table);
				span.setTimeSpanMaxRange(maxResult[0], maxResult[1]);
				span.setMaxRestrictorIDs(maxResult[2]);
			} else {
				if (successorRange && (result.restriction == "restrict_parent" || result.restriction == "update_parent")) {
					successorRange.setMin(span.getStartTimeMs(), recordID);
					successorRange.setMax(span.getEndTimeMs(), recordID);
				}
				if (result.restriction == "restrict_parent") {
					span.setTimeSpanMaxRange(parentMinMS, parentMaxMS);
					span.setMaxRestrictorIDs(parentID);
				}
			}
			
			// ----- SPAN COLOR -----
			if (result.css_span_color != '')
				span.setSpanColor(result.css_span_color);
			
			// ----- SPAN TEXT -----
			var strText = '';
			var cols = result.labels.split(',');
			var displayValue = '';
			var val = '';
			for (var i = 0, l = cols.length; i < l; i++) {
				val = cols[i];
				if (JSUtil.nil(val))
					continue;
				
				displayValue = gr.getDisplayValue(cols[i]);
				if (JSUtil.nil(displayValue))
					continue;
				
				strText += (i != 0 ? ', ' : '') + displayValue;
			}
			
			item.setLeftLabelText(strText);
			span.setSpanText(strText);
			
			// ----- SPAN TOOLTIP -----
			if (result.show_tooltips == true) {
				strText = '';
				cols = result.tooltip_label.split(',');
				for (var j = 0, k = cols.length; j < k; j++) {
					val = cols[j];
					if (JSUtil.nil(val))
						continue;
					
					displayValue = gr.getDisplayValue(cols[j]);
					if (JSUtil.nil(displayValue))
						continue;
					
					var label = gr.getElement(cols[j]).getLabel();
					strText += '<strong>' + SNC.GlideHTMLSanitizer.sanitize(label) + '</strong>: ' + SNC.GlideHTMLSanitizer.sanitize(displayValue) + '<br />';
				}
				span.setTooltip(strText);
			}
			
			// ----- INTERACTIVE OPTIONS -----
			if (calculator) {
				span.setRestriction("calculator");
			} else if (result.restriction) {
				if (result.restriction != "none")
					restricted = true;
				span.setRestriction(result.restriction);
			}
			span.setChildRestricted(false);
			
			if (result.allow_dragging == true)
				span.setAllowXMove(true);
			if (result.allow_drag_left == true)
				span.setAllowXDragLeft(true);
			if (result.allow_drag_right == true)
				span.setAllowXDragRight(true);
			
			// ----- OVERRIDE WITH SPAN STYLES -----
			var match = false;
			styles.restoreLocation();
			while (styles.next() && !match) {
				var conditions = styles.getValue("condition");
				if (!conditions || GlideFilter.checkRecord(gr, conditions))
					match = true;
				
				if (match) {
					var spanColorElement = styles.getElement("span_color");
					if (!spanColorElement.nil())
						span.setSpanColor(spanColorElement.getDisplayValue());
					
					span.setLabelDecoration(styles.label_decoration);
					var labelColorRecord = styles.label_color.getRefRecord();
					if (!labelColorRecord.nil())
						span.setLabelColor(labelColorRecord.color);
				}
			}
			
			var localSuccessorRange;
			if (!calculator)
				localSuccessorRange = new SuccessorRange();
			var sub = new GlideRecord("cmn_timeline_sub_item");
			sub.addQuery("parent", result.sys_id);
			sub.query();
			while(sub.next()) {
				if (this.populateItems(sub, recordID, span.getStartTimeMs(),
					span.getEndTimeMs(), localSuccessorRange, calculator)) {
					if (!calculator) {
						span.setChildRestricted(true);
						if (successorRange)
							successorRange.merge(localSuccessorRange);
					}
				}
			}
			if (calculator) {
				var minResult = calculator.getMinRangeDetails(recordID, result.table);
				span.setTimeSpanMinRange(minResult[0], minResult[1]);
				span.setMinRestrictorLeftIDs(minResult[2]);
				span.setMinRestrictorRightIDs(minResult[3]);
			}else if (span.getChildRestricted()) {
				span.setTimeSpanMinRange(localSuccessorRange.min, localSuccessorRange.max);
				span.setMinRestrictorLeftIDs(localSuccessorRange.leftIDs);
				span.setMinRestrictorRightIDs(localSuccessorRange.rightIDs);
			}
			this.add(item);
			
		}
		
		return restricted;
	},
	
	_searchForPageRecord: function(parentID) {
		var result = '';
		if (!parentID) {
			result = this._getPageRecord();
			if (typeof result == "number")
				return this._setStatusError(result);
			if (result.table == this.getParameter("sysparm_table_name"))
				return result;
			result = this._searchForPageRecord(result.sys_id);
			if (!result)
				return this._setStatusError(this.ERROR_SUB_INVALID_ID);
			else
				return result;
		} else{
			var subRecord = new GlideRecord('cmn_timeline_sub_item');
			subRecord.addQuery('parent', parentID);
			subRecord.query();
			while (subRecord.next()) {
				if (subRecord.table == this.getParameter("sysparm_table_name"))
					return subRecord;
				result = this._searchForPageRecord(subRecord.sys_id);
				if (result)
					return result;
			}
			return null;
		}
	},
	
	findTopTimelineRecord: function(timelineRecord) {
		if (!timelineRecord.parent)
			return timelineRecord;
		
		var result = new GlideRecord('cmn_timeline_sub_item');
		result.addQuery('sys_id', timelineRecord.parent);
		result.query();
		if (!result.next()) {
			result = new GlideRecord('cmn_timeline_page');
			result.addQuery('sys_id', timelineRecord.parent);
			result.query();
			result.next();
			return result;
		}
		return this.findTopTimelineRecord(result);
	},
	
	updateParentRecord: function(startDate, endDate, sysID, timelineRecord, recordID) {
		var topTimelineRecord = this.findTopTimelineRecord(timelineRecord);
		if (topTimelineRecord.range_calculator && topTimelineRecord.range_calculator.name) {
			var calculator;
			eval("calculator = new " + topTimelineRecord.range_calculator.name + "()");
			calculator.updateParents(recordID, timelineRecord.table, startDate, endDate);
		}else if (timelineRecord.parent && timelineRecord.restriction && timelineRecord.restriction == "update_parent") {
			var result = new GlideRecord('cmn_timeline_sub_item');
			result.addQuery('sys_id', timelineRecord.parent);
			result.query();
			var found = result.next();
			if (!found) {
				result = new GlideRecord('cmn_timeline_page');
				result.addQuery('sys_id', timelineRecord.parent);
				result.query();
				found = result.next();
			}
			if (found) {
				var gr = new GlideRecord(result.table);
				gr.addQuery('sys_id', sysID);
				gr.query();
				if (gr.next()) {
					var sd = parseInt(gr[result.start_date_field].getGlideObject().getNumericValue(), 10);
					var ed = parseInt(gr[result.end_date_field].getGlideObject().getNumericValue(), 10);
					var changed = false;
					if (startDate && startDate < sd) {
						changed = true;
						var gdtStart = new GlideDateTime();
						gdtStart.setNumericValue(startDate);
						gr.setValue(result.start_date_field, gdtStart);
					}
					if (endDate && endDate > ed) {
						changed = true;
						var gdtEnd = new GlideDateTime();
						gdtEnd.setNumericValue(endDate);
						gr.setValue(result.end_date_field, gdtEnd);
					}
					if (changed) {
						gr.update();
						if (result.parent_col && result.restriction != "none")
							this.updateParentRecord(startDate, endDate, gr[result.parent_col], result);
					}
				}
			}
		}
	},
	
	// ////////////////////////////////////////////////////////////////////////////////////////////////
	// ELEMENT_MOVE_X
	// ////////////////////////////////////////////////////////////////////////////////////////////////
	
	elementMoveX : function(spanId, newStartDateTimeMs) {
		if (!spanId || spanId == null || spanId == '')
			return this.setStatusError(ERROR_TITLE, ERROR_INTERACTIVE);
		var result = this._searchForPageRecord();
		if (typeof result == "number")
			return this._setStatusError(result);
		
		var gr = new GlideRecordSecure(result.table);
		gr.addQuery('sys_id', spanId);
		gr.query();
		if (gr.next()) {
			// Calculate duration
			var sd = parseInt(gr[result.start_date_field].getGlideObject().getNumericValue(), 10);
			var ed = parseInt(gr[result.end_date_field].getGlideObject().getNumericValue(), 10);
			var newEndDateTimeMs = parseInt(newStartDateTimeMs) + (ed - sd);
			var gdtStart = new GlideDateTime();
			gdtStart.setNumericValue(newStartDateTimeMs);
			var gdtEnd = new GlideDateTime();
			gdtEnd.setNumericValue(newEndDateTimeMs);
			if (this._auditDisabled())
				gr.setWorkflow(false);
			gr.setValue(result.start_date_field, gdtStart);
			gr.setValue(result.end_date_field, gdtEnd);
			if (!gr.update())
				return this.setStatusError(ERROR_TITLE, ERROR_SECURITY);
			this.updateParentRecord(newStartDateTimeMs, newEndDateTimeMs, gr[result.parent_col], result, spanId);
			return this.setDoReRenderTimeline(true);
		}
		return this.setStatusError(ERROR_TITLE, ERROR_INTERACTIVE);
	},
	
	findRecord: function(spanId) {
		
	},
	
	// ////////////////////////////////////////////////////////////////////////////////////////////////
	// ELEMENT_TIME_ADJUST START
	// ////////////////////////////////////////////////////////////////////////////////////////////////
	
	elementTimeAdjustStart : function(spanId, newStartDateTimeMs) {
		if (!spanId || spanId == null || spanId == '')
			return this.setStatusError(ERROR_TITLE, ERROR_INTERACTIVE);
		
		var result = this._searchForPageRecord();
		if (typeof result == "number")
			return this._setStatusError(result);
		
		var gr = new GlideRecordSecure(result.table);
		gr.addQuery('sys_id', spanId);
		gr.query();
		if (gr.next()) {
			var gdtStart = new GlideDateTime();
			gdtStart.setNumericValue(newStartDateTimeMs);
			if (this._auditDisabled())
				gr.setWorkflow(false);
			gr.setValue(result.start_date_field, gdtStart);
			if (!gr.update())
				return this.setStatusError(ERROR_TITLE, ERROR_SECURITY);
			this.updateParentRecord(newStartDateTimeMs, null, gr[result.parent_col], result, spanId);
			return this.setDoReRenderTimeline(true);
		}
		
		return this.setStatusError(ERROR_TITLE, ERROR_INTERACTIVE);
	},
	
	// ////////////////////////////////////////////////////////////////////////////////////////////////
	// ELEMENT_TIME_ADJUST END
	// ////////////////////////////////////////////////////////////////////////////////////////////////
	
	elementTimeAdjustEnd : function(spanId, newEndDateTimeMs) {
		if (!spanId || spanId == null || spanId == '')
			return this.setStatusError(ERROR_TITLE, ERROR_INTERACTIVE);
		
		var result = this._searchForPageRecord(null);
		if (typeof result == "number")
			return this._setStatusError(result);
		
		var gr = new GlideRecordSecure(result.table);
		gr.addQuery('sys_id', spanId);
		gr.query();
		if (gr.next()) {
			var gdtEnd = new GlideDateTime();
			gdtEnd.setNumericValue(newEndDateTimeMs);
			if (this._auditDisabled())
				gr.setWorkflow(false);
			gr.setValue(result.end_date_field, gdtEnd);
			if (!gr.update())
				return this.setStatusError(ERROR_TITLE, ERROR_SECURITY);
			this.updateParentRecord(null, newEndDateTimeMs, gr[result.parent_col], result, spanId);
			return this.setDoReRenderTimeline(true);
		}
		return this.setStatusError(ERROR_TITLE, ERROR_INTERACTIVE);
	},
	
	_auditDisabled : function() {
		// If property exists and its value is true, do not setWorkflow to false when updating a record.
		return !gs.getProperty('timeline.enable.audit', false);
	}
});