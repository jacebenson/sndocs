/*! RESOURCE: /scripts/concourse/directive.requestManager.js */
angular.module("sn.concourse").directive("requestManager", ["$http", "snCustomEvent", "getTemplateUrl", "$timeout", "MessagesStack", "$interval", function($http, snCustomEvent, getTemplateUrl, $timeout, MessagesStack, $interval) {
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
      var transactionCheckDelay = 2000;
      $scope.cancelling = false;
      $scope.showAlert = false;
      $scope.hideButton = false;
      $scope.statusMessage = '';
      $scope.timer = 0;
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
        timeOut = $timeout(checkTransaction, delayTime);
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
          $scope.timer = getTime();
          if ($scope.cancelling)
            setStatus("Transaction cancelled after");
          else
            setStatus("Transaction completed in");
          $scope.hideAlertButton(true);
          $scope.cancelling = false;
          clearTimers();
          if (startTime == 0) {
            clearMessage();
            return;
          }
          setTimerMessage();
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
        interval = setInterval(handleInterval, transactionCheckDelay);
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
        if (timer >= transactionCheckDelay)
          checkTransaction();
        $scope.timer = getTime();
        if ($scope.cancelling)
          setStatus("Transaction cancelling:");
        else
          setStatus("Running Transaction:");
        setTimerMessage();
        if ($scope.timer == 0) {
          handleRequestComplete();
        }
      }

      function getTime() {
        if (startTime == 0)
          return 0;
        var timer = new Date() - startTime;
        return Math.round(timer / 100) / 10;
      }

      function setStatus(message) {
        if ($scope.statusMessage === message || $scope.timer < $scope.timerDelay)
          return;
        $scope.statusMessage = message;
        angular.element('#request_status_message').text(message);
      }

      function setTimerMessage() {
        if ($scope.timer < $scope.timerDelay)
          return;
        var timerMessage = $scope.timer + ' seconds';
        angular.element('#request_timer').text(timerMessage);
      }
      $scope.handleRequestCancel = function() {
        if ($scope.cancelling)
          return;
        $scope.cancelling = true;
        $scope.hideAlertButton(true);
        setStatus("Transaction cancelling:");
        $http.get("cancel_my_transaction.do?sysparm_output=xml").then(checkTransactionResponse);
      };
      $scope.hideAlertButton = function(disabled) {
        $scope.hideButton = disabled;
      };
      $scope.showAlertBar = function(enabled) {
        if ($scope.showAlert === enabled)
          return;
        if (enabled)
          MessagesStack.push("request-manager");
        $scope.showAlert = enabled;
        if (!enabled)
          setTimeout(function() {
            MessagesStack.pop("request-manager");
          }, 1300);
      };
    }
  }
}]);;