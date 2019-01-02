angular.module("sn.change_management.cab.approval")
	.service("approval", ['CAB', 'modelUtil', 'snRecordWatcher', '$http', '$q', '$log', function(CAB, modelUtil, snRecordWatcher, $http, $q, $log) {
		var approval = this;
		
		var tId = "";
		var aInf = {};
		var defReq;
		var wChan;
		
		var rwMod = {
			"sysapproval_approver": null
		};

		function onFail(response) {
			modelUtil.failNicely(response);
			return $q.reject(response);
		}
		
		approval.approve = function(taskId, comment) {
			return $http.post(CAB.APPROVAL_SERVICE + "approve/" + taskId, {'comment': comment}).then(null, onFail);
		};

		approval.reject = function(taskId, comment) {
			return $http.post(CAB.APPROVAL_SERVICE + "reject/" + taskId, {'comment': comment}).then(null, onFail);
		};
		
		// LIFE CYCLE
		function refreshUserApproval(taskId) {
			return $http.get(CAB.APPROVAL_SERVICE + taskId)
				.then(function(response) {
					modelUtil.patchObject(aInf, response.data.result);
					return $q.resolve(response);
				},
				onFail);
		}
		
		function clearWatcher() {
			if (wChan)
				wChan.unsubscribe();
		}
		
		function setupWatcher() {
			wChan = snRecordWatcher.initChannel("sysapproval_approver", "sysapproval=" + aInf.taskId);
			wChan.subscribe(function(response) {
				refreshUserApproval(aInf.taskId);
				rwMod["sysapproval_approver"] = response;
			});
		}
		
		function init(taskId) {
			tId = taskId;
			defReq = $q.defer();
			var deferred = defReq;
			
			clearWatcher();
			
			refreshUserApproval(taskId)
				.then(function(response) {
					setupWatcher();
					defReq = null;
					deferred.resolve(aInf);
				},
				function(response) {
					//Cleanup on failure.
					for (var prop in aInf)
						if (aInf.hasOwnProperty(prop))
							delete aInf[prop];
				
					defReq = null;
					deferred.reject(response);
				});
			
			return deferred.promise;
		}
		
		approval.get = function(taskId) {
			if (tId == taskId) { // If the same approval info is being requested.
				if (defReq)
					return defReq.promise;

				return $q.resolve(aInf);
			}
			
			return init(taskId);
		};
		
		/**
		 * Returns the Record Watcher modifications object.
		 * Record watcher responses are set against named values to determine when data from record watcher
		 * was received.  Name of the element is the table name of the modified table.
		 */
		approval.getRWMod = function() {
			return rwMod;
		};

	}]);