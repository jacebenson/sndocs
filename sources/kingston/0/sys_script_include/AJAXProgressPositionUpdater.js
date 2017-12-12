var AJAXProgressPositionUpdater = Class.create();
AJAXProgressPositionUpdater.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	updatePositionMessage : function() {
		var jobId = this.getParameter('sysparm_execution_id');
		var trackerRecord = new GlideRecord('sys_execution_tracker');
		trackerRecord.get(jobId);

		if (!trackerRecord.isValid() || trackerRecord.state != '0')
			return false;

		var position = this._getCurrentJobPosition(jobId);
		trackerRecord.setValue('message', this._getMessage(position));
		trackerRecord.setValue('detail_message', this._getMessage(position));
		trackerRecord.update();
		return true;
	},

	_getCurrentJobPosition : function(jobId) {
		return GlideScheduler.getJobPosition(jobId);
	},

	_getMessage: function(position) {
		if (position === -1)
			return gs.getMessage("Job is not in the queue yet");

		if (position === 0)
			return gs.getMessage("Starting the background job");

		return gs.getMessage("Waiting for the background job to start, Current position is ") + position;
	},

    type: 'AJAXProgressPositionUpdater'
});