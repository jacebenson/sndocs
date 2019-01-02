// Class Imports
var TimelineItem = GlideTimelineItem;
var StringUtil = GlideStringUtil;

var ERROR_TITLE = 'Error';
var GANTT_REQUIREMENT = 'This is required for displaying a timeline.';
var ERROR_NO_TASK_ID = 'No "sysparm_task_id" specified in the original Url. ' + GANTT_REQUIREMENT;
var ERROR_NO_GR_TASK = 'Unable to find a matching task record with the specified system id.';
var START_LABEL = gs.getMessage('Start');
var END_LABEL = gs.getMessage('End');
var MESSAGES = [ ERROR_TITLE, ERROR_NO_TASK_ID ];

var MetricsTimeline = Class.create();
MetricsTimeline.prototype = Object.extendsObject(AbstractTimelineSchedulePage, {

	// ////////////////////////////////////////////////////////////////////////////////////////////////
	// GET_ITEMS
	// ////////////////////////////////////////////////////////////////////////////////////////////////

	getItems : function() {
		// this starts everything
		this._getParameters();
		this._getRecord();
		this.setPageTitle(StringUtil.escapeHTML(this.record.getDisplayValue()) + gs.getMessage(' Metrics'));
		this._getDefinitions();
		this._processMetrics();
	},

	_getParameters : function() {
		this.table = this.getParameter("sysparm_timeline_table");
		this.table_id = this.getParameter("sysparm_timeline_id");
	},

	_getRecord : function() {
		var gr = new GlideRecord(this.table);
		gr.get(this.table_id);
		this.record = gr;
	},

	_getDefinitions : function() {
		var def = new GlideRecord("metric_definition");
		def.addQuery("table", this.table);
		def.addQuery("timeline", true);
		def.addActiveQuery();
		def.query();
		this.definitions = def;
	},

	_processMetrics : function() {
		var def = this.definitions;
		while (def.next()) {
			var defItem = new TimelineItem("metric_definition", def.getUniqueValue());
			defItem.setLeftLabelText(def.getDisplayValue());
			var valueInstances = {};

			var dur = new GlideDuration();
			var totalDuration;
			var durationAgg = new GlideAggregate("metric_instance");
			durationAgg.addQuery("definition", def.getUniqueValue());
			durationAgg.addQuery("table", this.table);
			durationAgg.addQuery("id", this.table_id);
			durationAgg.addAggregate("SUM", "duration");
			durationAgg.groupBy("definition");
			durationAgg.query();
			if (durationAgg.next()) {
				dur.setValue(durationAgg.getAggregate("SUM", "duration"));
				totalDuration = dur.getNumericValue();

			}

			// create value spans
			var instance = new GlideRecord("metric_instance");
			instance.addQuery("definition", def.getUniqueValue());
			instance.addQuery("table", this.table);
			instance.addQuery("id", this.table_id);
			instance.orderBy("start");
			instance.query();
			var predecessor = null;
			while (instance.next()) {
				var value = instance.value;
				if (value == "")
					value = "(" + gs.getMessage("empty") + ")";
				var instanceID = instance.getUniqueValue();
				gs.print("instanceID: " + instanceID);
				var instanceItem = valueInstances[value];
				if (!instanceItem) {
					instanceItem = new TimelineItem("metric_instance", value);
					instanceItem.setParent(def.getUniqueValue());
					instanceItem.setLeftLabelText(value);
					valueInstances[value] = instanceItem;
				}

				var instanceSpan = instanceItem.createTimelineSpan("value_span", instanceID);
				instanceSpan.setSpanText(value);
				if (predecessor)
					instanceSpan.addPredecessor(predecessor);

				predecessor = instanceID;

				var start = instance.start.getGlideObject().getNumericValue();
				var end = instance.end.getGlideObject().getNumericValue();
				var duration = instance.duration.getGlideObject().getNumericValue();
				var durationPercent = Math.round(duration / totalDuration * 100);

				if (start == 0)
					continue;

				if (end > 0) {
					// span start and end
					instanceSpan.setTimeSpan(start, end);
					instanceSpan.setTooltip(instance.value + " (" + instance.duration.getDisplayValue() + " - " + durationPercent + "%)");
				} else {
					// still open, use point instead of span
					instanceSpan.setTimeSpan(start, start);
					instanceSpan.setPointIconClass("green_circle");
					instanceSpan.setTooltip("current value");
				}
			}

			for ( var i in valueInstances)
				this.add(valueInstances[i]);

			this.add(defItem);
		}
	},

	_noSpanTaskId : function() {
		return this.setStatusError(gs.getMessage(ERROR_TITLE), gs.getMessage(ERROR_NO_GR_TASK));
	}

});
