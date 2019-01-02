angular.module("sn.change_management.cab.agenda")
	.service("agendaNotification", ['CAB', 'modelUtil', '$http', '$log', function(CAB, modelUtil, $http, $log) {
		var agendaNotification = this;
			
		agendaNotification.notifyAvailable = function(agendaItem) {
			if (!agendaItem)
				return false;

			return agendaItem.state.value == "pending" && agendaItem.notification_sent.value != "true";
		};
			
		agendaNotification.alreadyBeingNotified = function(agendaItem, userId) {
				
			if (!agendaItem.notification_recipients.value || agendaItem.notification_recipients.value.length == 0)
				return false;
				
			return agendaItem.notification_recipients.value.indexOf(userId) >= 0;
		};
				
		agendaNotification.updateRecipients = function(agendaItem, userId, action, cb) {
			if (!agendaItem)
				return;

			$http.post("/api/sn_change_cab/cab/agenda/item/" + agendaItem.sys_id.value + "/notification_recipients",
					   {"action": action, "userId": userId})
				.then(function () {
				if (cb)
					cb();
			}, modelUtil.failNicely);
		};
			
		agendaNotification.cleanup = function() {
			// cleanup code.
		};
	}]);