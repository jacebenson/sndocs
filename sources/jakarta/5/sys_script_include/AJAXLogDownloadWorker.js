var AJAXLogDownloadWorker = Class.create();
AJAXLogDownloadWorker.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	downloadNow: function(tableSysId, parentTrackerSysID, emailAddress, dateRange, downloadUrl) {
		var worker = new NodeLogDownloadWorker(tableSysId, parentTrackerSysID, emailAddress, dateRange, downloadUrl);
		worker.setBackground(true);
		worker.start();
		return worker.getProgressID();
	},
	cancellParentTracker: function(tableSysID, parentTrackerSysID, emailAddress, dateRange, downloadUrl) {
		new NodeLogDownloadWorker(tableSysID, parentTrackerSysID, emailAddress, dateRange, downloadUrl).cancelExecutionTracker();
	},
	type: 'AJAXLogDownloadWorker'
});