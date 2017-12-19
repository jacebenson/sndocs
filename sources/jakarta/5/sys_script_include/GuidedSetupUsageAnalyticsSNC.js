var GuidedSetupUsageAnalyticsSNC = Class.create();
GuidedSetupUsageAnalyticsSNC.prototype = {

	ATTR_UA_EVENT_TYPE: 'event.type',
	ATTR_UA_VISITED: 'no_of_visited',
	ATTR_UA_CONFIGURED: 'no_of_configured',
	ATTR_UA_MORE_INFO_VISITED: 'no_of_more_page_visited',
	ATTR_UA_IS_BEGIN: 'is_begin',
	ATTR_UA_COMPLETION_TIME: 'completion_time',
	ATTR_UA_SYS_ID: 'change_log_sys_id',
	STREAM_ID: 'snc_guided_setup',
	EVENT_NAME: 'change_log',
	ATTR_UA_CONTENT_TYPE: 'content_type',

	LOG_TYPE: {
		VISITED: 'Visited',
		COMPLETED: 'Completed',
		UNCOMPLETED: 'Uncompleted',
		INITIATED: 'Initiated',
		DEACTIVATED: 'Deactivated',
		REACTIVATED: 'Reactivated',
		CONFIGURED: 'Configured',
		BEST_PRACTICE_ACCEPTED: 'Best Practice Accepted',
		MORE_INFO_VISITED: 'More info visited'
	},

	initialize: function() {
		this.gswUtil = new GuidedSetupUtilSNC();
		this.ATTR_UA_RELATED_CHANGE_LOG_ENTRY = this.gswUtil.ATTR_RELATED_CHANGE_LOG_ENTRY;
		this.ATTR_UA_CONTENT = this.gswUtil.ATTR_CONTENT;
		this.ATTR_UA_TITLE = this.gswUtil.ATTR_TITLE;
		this.ATTR_UA_CHANGE_DATE = this.gswUtil.ATTR_CHANGE_DATE;
		this.ATTR_UA_CHANGED_BY = this.gswUtil.ATTR_CHANGED_BY;
		this.ATTR_UA_LOG_TYPE = this.gswUtil.ATTR_TYPE;
		this.ATTR_UA_PARENTS = this.gswUtil.ATTR_PARENTS;
		this.ATTR_UA_IS_ROOT_CONTENT = this.gswUtil.ATTR_IS_ROOT_CONTENT;
		this.data = {};
	},

	sendDataToAnalytics: function(changeLogGr) {
		if (sn_uapaf.ScopedAnalyticsFramework.isDisabled()) {
			gs.info('Scoped Analytics Framework is disabled');
			return;
		}

		var type = changeLogGr.getValue(this.gswUtil.ATTR_TYPE);
		var noOfVisited = 0;
		var firstVisitedId;
		var isBegin = false;
		var beginGr;

		//To find out whether it is visited for first time
		if (type == this.gswUtil.LOG_TYPE.COMPLETED || type == this.gswUtil.LOG_TYPE.BEST_PRACTICE_ACCEPTED || type == this.gswUtil.LOG_TYPE.VISITED) { // if-clause allows for COMPLETED/BEST_PRACTICE_ACCEPTED since beginGr initialized here is used below.
			beginGr = new GlideRecord(this.gswUtil.TABLE_CHANGE_LOG);
			beginGr.addQuery(this.gswUtil.ATTR_CONTENT, changeLogGr.getValue(this.gswUtil.ATTR_CONTENT));
			beginGr.addQuery(this.gswUtil.ATTR_TYPE, this.gswUtil.LOG_TYPE.VISITED);
			beginGr.orderBy(this.gswUtil.ATTR_CHANGE_DATE);
			beginGr.setLimit(1);
			beginGr.query();
			if (beginGr.next()) {
				firstVisitedId = beginGr.getUniqueValue();
			}
			if (firstVisitedId == changeLogGr.getUniqueValue()) {
				isBegin = true;
			}
		}


		if (type == this.gswUtil.LOG_TYPE.COMPLETED || type == this.gswUtil.LOG_TYPE.BEST_PRACTICE_ACCEPTED || type == this.gswUtil.LOG_TYPE.UNCOMPLETED || type == this.gswUtil.LOG_TYPE.DEACTIVATED || type == this.gswUtil.LOG_TYPE.REACTIVATED || isBegin) {
			var streamId = this.STREAM_ID;
			var obfuscationList = [this.gswUtil.ATTR_CHANGED_BY];
			var status = sn_uapaf.ScopedAnalyticsFramework.open(streamId);

			this._setCommonAttributes(changeLogGr);

			if (type == this.gswUtil.LOG_TYPE.COMPLETED || type == this.gswUtil.LOG_TYPE.BEST_PRACTICE_ACCEPTED) {
				this._setCompletedAttributes(changeLogGr, beginGr);
			} else {
				this.data[this.ATTR_UA_IS_BEGIN] = isBegin;
				this.data[this.ATTR_UA_VISITED] = "";
				this.data[this.ATTR_UA_CONFIGURED] = "";
				this.data[this.ATTR_UA_MORE_INFO_VISITED] = "";
				this.data[this.ATTR_UA_COMPLETION_TIME] = "";
				this.data[this.gswUtil.ATTR_ASSIGNED_TO] = "";
			}

			if (status === 0) {
				status = sn_uapaf.ScopedAnalyticsFramework.sendJSON(streamId, obfuscationList, JSON.stringify(this.data));
				status = sn_uapaf.ScopedAnalyticsFramework.close(streamId);
			}
		}
	},

	_setCommonAttributes: function(changeLogGr) {
		this.data[this.ATTR_UA_EVENT_TYPE] = this.EVENT_NAME;
		this.data[this.ATTR_UA_CONTENT] = changeLogGr.getValue(this.gswUtil.ATTR_CONTENT);
		this.data[this.ATTR_UA_CHANGED_BY] = changeLogGr.getValue(this.gswUtil.ATTR_CHANGED_BY);
		this.data[this.ATTR_UA_CHANGE_DATE] = changeLogGr.getValue(this.gswUtil.ATTR_CHANGE_DATE);
		this.data[this.ATTR_UA_RELATED_CHANGE_LOG_ENTRY] = changeLogGr.getValue(this.gswUtil.ATTR_RELATED_CHANGE_LOG_ENTRY);
		this.data[this.ATTR_UA_SYS_ID] = changeLogGr.getUniqueValue();
		this._setLogType(changeLogGr);

		var contentGr = changeLogGr[this.gswUtil.ATTR_CONTENT].getRefRecord();
		if (contentGr) {
			this.data[this.ATTR_UA_TITLE] = contentGr.getValue(this.gswUtil.ATTR_TITLE);
			this.data[this.ATTR_UA_CONTENT_TYPE] = contentGr.getValue(this.gswUtil.ATTR_SYS_CLASS_NAME);
			this.data[this.ATTR_UA_PARENTS] = contentGr.getValue(this.gswUtil.ATTR_PARENTS);
			if (!contentGr.getValue(this.gswUtil.ATTR_PARENT)) {
				this.data[this.ATTR_UA_IS_ROOT_CONTENT] = true;
			} else {
				this.data[this.ATTR_UA_IS_ROOT_CONTENT] = false;
			}
		}
	},

	_setCompletedAttributes: function(changeLogGr, beginGr) {
		var visitedGr = new GlideAggregate(this.gswUtil.TABLE_CHANGE_LOG);
		visitedGr.addQuery(this.gswUtil.ATTR_CONTENT, changeLogGr.getValue(this.gswUtil.ATTR_CONTENT));
		visitedGr.addQuery(this.gswUtil.ATTR_TYPE, this.gswUtil.LOG_TYPE.VISITED);
		visitedGr.addAggregate('COUNT');
		visitedGr.query();
		if (visitedGr.next()) {
			this.data[this.ATTR_UA_VISITED] = visitedGr.getAggregate('COUNT');
		} else {
			this.data[this.ATTR_UA_VISITED] = "";
		}

		if (this.data[this.ATTR_UA_CONTENT_TYPE] == this.gswUtil.TABLE_CONTENT_INFORMATION) {
			var configuredGr = new GlideAggregate(this.gswUtil.TABLE_CHANGE_LOG);
			configuredGr.addQuery(this.gswUtil.ATTR_CONTENT, changeLogGr.getValue(this.gswUtil.ATTR_CONTENT));
			configuredGr.addQuery(this.gswUtil.ATTR_TYPE, this.gswUtil.LOG_TYPE.CONFIGURED);
			configuredGr.addAggregate('COUNT');
			configuredGr.query();
			if (configuredGr.next()) {
				this.data[this.ATTR_UA_CONFIGURED] = configuredGr.getAggregate('COUNT');
			} else {
				this.data[this.ATTR_UA_CONFIGURED] = "";
			}
		} else {
			this.data[this.ATTR_UA_CONFIGURED] = "";
		}

		if (this.data[this.ATTR_UA_CONTENT_TYPE] == this.gswUtil.TABLE_CONTENT_INFORMATION) {
			var moreInfoGr = new GlideAggregate(this.gswUtil.TABLE_CHANGE_LOG);
			moreInfoGr.addQuery(this.gswUtil.ATTR_CONTENT, changeLogGr.getValue(this.gswUtil.ATTR_CONTENT));
			moreInfoGr.addQuery(this.gswUtil.ATTR_TYPE, this.gswUtil.LOG_TYPE.MORE_INFO_VISITED);
			moreInfoGr.addAggregate('COUNT');
			moreInfoGr.query();
			if (moreInfoGr.next()) {
				this.data[this.ATTR_UA_MORE_INFO_VISITED] = moreInfoGr.getAggregate('COUNT');
			} else {
				this.data[this.ATTR_UA_MORE_INFO_VISITED] = "";
			}
		} else {
			this.data[this.ATTR_UA_MORE_INFO_VISITED] = "";
		}

		var beginDate = new GlideDateTime(beginGr.getValue(this.gswUtil.ATTR_CHANGE_DATE));
		var completedDate = new GlideDateTime(changeLogGr.getValue(this.gswUtil.ATTR_CHANGE_DATE));
		var dur = new GlideDuration();
		dur = GlideDateTime.subtract(beginDate, completedDate);
		if (dur) {
			this.data[this.ATTR_UA_COMPLETION_TIME] = dur.getDisplayValue();
		} else {
			this.data[this.ATTR_UA_COMPLETION_TIME] = "";
		}

		var taskGr = new GlideRecord(this.gswUtil.TABLE_TASK);
		taskGr.addQuery(this.gswUtil.TABLE_CONTENT, changeLogGr.getValue(this.gswUtil.ATTR_CONTENT));
		taskGr.query();
		if (taskGr.next() && taskGr.getValue(this.gswUtil.ATTR_ASSIGNED_TO))
			this.data[this.gswUtil.ATTR_ASSIGNED_TO] = true;
		else
			this.data[this.gswUtil.ATTR_ASSIGNED_TO] = false;
	},

	_setLogType: function(changeLogGr) {
		var type = changeLogGr.getValue(this.gswUtil.ATTR_TYPE);
		if (type == this.gswUtil.LOG_TYPE.VISITED) {
			this.data[this.ATTR_UA_LOG_TYPE] = this.LOG_TYPE.VISITED;
		} else if (type == this.gswUtil.LOG_TYPE.COMPLETED) {
			this.data[this.ATTR_UA_LOG_TYPE] = this.LOG_TYPE.COMPLETED;
		} else if (type == this.gswUtil.LOG_TYPE.UNCOMPLETED) {
			this.data[this.ATTR_UA_LOG_TYPE] = this.LOG_TYPE.UNCOMPLETED;
		} else if (type == this.gswUtil.LOG_TYPE.DEACTIVATED) {
			this.data[this.ATTR_UA_LOG_TYPE] = this.LOG_TYPE.DEACTIVATED;
		} else if (type == this.gswUtil.LOG_TYPE.REACTIVATED) {
			this.data[this.ATTR_UA_LOG_TYPE] = this.LOG_TYPE.REACTIVATED;
		} else if (type == this.gswUtil.LOG_TYPE.BEST_PRACTICE_ACCEPTED) {
			this.data[this.ATTR_UA_LOG_TYPE] = this.LOG_TYPE.BEST_PRACTICE_ACCEPTED;
		}
	},

	type: 'GuidedSetupUsageAnalyticsSNC'
};