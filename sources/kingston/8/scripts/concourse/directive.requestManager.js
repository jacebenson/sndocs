/*! RESOURCE: /scripts/concourse/directive.requestManager.js */
angular.module("sn.concourse").directive("requestManager", ["$http", "snCustomEvent", "getTemplateUrl", "$timeout", function($http, snCustomEvent, getTemplateUrl, $timeout) {
  return {
    restrict: 'E',
    scope: {
      timerDelay: '@'
    },
    templateUrl: getTemplateUrl('concourse_request_manager.xml'),
    controller: function($scope, $http) {
      var interval = 0;
      var timeOut;
      var loadingStartTime = 0;
      var startTime = 0;
      var finalMsgTimeOut = 0;
      var checkingWithServer = false;
      var serverCheckTime = 0;
      var loadCancelValidation = false;
      $scope.cancelling = false;
      $scope.showAlert = false;
      $scope.hideButton = false;
      if (!$scope.timerDelay) {
        $scope.timerDelay = 15;
      }
      var delayTime = $scope.timerDelay * 1000;
      snCustomEvent.observe("request_start", function() {
        if (timeOut)
          return;
        startTime = new Date();
        if (finalMsgTimeOut)
          $timeout.cancel(finalMsgTimeOut);
        finalMsgTimeOut = 0;
        timeOut = $timeout(checkTransaction, $scope.timerDelay * 1000);
      });
      snCustomEvent.observe("load_page_request_start", function() {
        loadCancelValidation = true;
        if (loadingStartTime)
          return;
        startTime = new Date();
        if (finalMsgTimeOut)
          $timeout.cancel(finalMsgTimeOut);
        finalMsgTimeOut = 0;
        timeOut = $timeout(checkTransaction, delayTime);
      });
      snCustomEvent.observe("request_complete", handleRequestComplete);
      snCustomEvent.observe("load_page_request_complete", function() {
        loadCancelValidation = false;
        handleRequestComplete();
      });
      snCustomEvent.observe("request_cancel", $scope.handleRequestCancel);
      snCustomEvent.observe("clear_message", clearMessage);

      function checkTransaction() {
        if (checkingWithServer)
          return;
        checkingWithServer = true;
        serverCheckTime = new Date();
        $http.get("/cancel_my_transaction.do?status=true&sysparm_output=json").then(function(response) {
          checkTransactionResponse(response);
        });
      }

      function checkTransactionResponse(response) {
        if (response && response.data && response.data.status) {
          checkingWithServer = false;
          var message = response.data.status;
          if ("No session, nothing to cancel" == message)
            clearMessage();
          else if ("complete" == message)
            handleRequestComplete();
          else
            startIntervalTimer();
        } else
          clearMessage();
      }

      function clearMessage() {
        $scope.showAlertBar(false);
      }

      function handleRequestComplete() {
        if (loadCancelValidation == false) {
          if ($scope.cancelling)
            setStatus("Cancelled after");
          else
            setStatus("Completed in");
          $scope.hideAlertButton(true);
          $scope.cancelling = false;
          clearTimers();
          if (startTime == 0) {
            clearMessage();
            return;
          }
          $scope.timer = getTime();
          finalMsgTimeOut = $timeout(clearMessage, 2500);
          startTime = 0;
          serverCheckTime = 0;
        }
      }

      function startIntervalTimer() {
        if (interval)
          return;
        $scope.showAlertBar(true);
        $scope.hideAlertButton(false);
        handleInterval();
        interval = setInterval(handleInterval, 300);
      }

      function clearTimers() {
        if (interval)
          clearInterval(interval);
        if (timeOut)
          $timeout.cancel(timeOut);
        interval = 0;
        timeOut = 0;
      }

      function handleInterval() {
        var timer = new Date() - serverCheckTime;
        if (timer > 2000)
          checkTransaction();
        if ($scope.cancelling)
          setStatus("Cancelling:");
        else
          setStatus("Running Transaction:");
        $scope.timer = getTime();
        if ($scope.timer == 0) {
          handleRequestComplete();
        }
      }

      function getTime() {
        if (startTime == 0)
          return 0;
        var timer = new Date() - startTime;
        return Math.round(timer / 100) / 10 + 's';
      }

      function setStatus(message) {
        $scope.statusMessage = message;
      }
      $scope.handleRequestCancel = function() {
        if ($scope.cancelling)
          return;
        $scope.cancelling = true;
        $scope.hideAlertButton(true);
        $scope.statusMessage = "Cancelling:";
        $http.get("cancel_my_transaction.do?sysparm_output=xml").then(checkTransactionResponse);
      };
      $scope.hideAlertButton = function(disabled) {
        $scope.hideButton = disabled;
      };
      $scope.showAlertBar = function(enabled) {
        $scope.showAlert = enabled;
      };
    }
  }
}]);;