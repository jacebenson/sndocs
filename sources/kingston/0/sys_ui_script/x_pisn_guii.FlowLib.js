angular.module('FlowLib', [])
.service('FlowManager', function ($http, $q) {
	
	var data,
		server,
		actionsVisible,
		isLoading = false,
		flowSysID;
	
	function reset () {
		data = {};
		actionsVisible = true;
		isLoading = false;
	}
	
	return {
		init: function (fsid, svr) {
			flowSysID = fsid;
			server = svr;
			reset();
		},
		getIsLoading: function () {
			return isLoading;
		},
		reset: reset,
		setActionsVisible: function (state) {
			actionsVisible = (state === true);
		},
		getActionsVisible: function () {
			return actionsVisible;
		},
		setData: function (key, value) {
			data[key] = value;
		},
		setRecord: function (recordID, recordTable) {
			if (typeof data.records === 'undefined') {
				data.records = [];
			}

			data.records.push({
				id: recordID,
				table: recordTable
			});
		},
		submit: function () {
			
			isLoading = true;
		
			return $q(function (resolve, reject) {

				$http({
					method: 'POST',
					url: '/api/x_pisn_guii/flow/' + flowSysID + '/submit',
					data: data
				}).then(function (response) {
					server.refresh().then(function (res) {
						reset();
						resolve(response, res);
					});
					
				}, function (response) {
					isLoading = false;
					reject(response);
				});
			});
			
		}
	};
});