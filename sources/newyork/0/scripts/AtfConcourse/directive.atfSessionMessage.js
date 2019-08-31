/*! RESOURCE: /scripts/AtfConcourse/directive.atfSessionMessage.js */
angular.module("sn.concourse").directive("atfSessionMessage", ["getTemplateUrl", "$timeout", "$interval", "MessagesStack", function(getTemplateUrl, $timeout, $interval, MessagesStack) {
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('concourse_atf_session_message.xml'),
    controller: function($scope) {
      var ATF_SESSION_COOKIE = "atf_context";
      $scope.showAlert = false;

      function renderLink() {
        var messageSpan = document.getElementById('atf_session_message_message_span_id');
        if (null === messageSpan)
          return;
        var messageHTML = messageSpan.innerHTML;
        messageHTML = messageHTML.replace(/&lt;/g, "<");
        messageHTML = messageHTML.replace(/&gt;/g, ">");
        messageSpan.innerHTML = messageHTML;
      }
      renderLink();
      $interval(checkAtfCookies, 1500);

      function checkAtfCookies() {
        var doesCookieExist = !!getCookie(ATF_SESSION_COOKIE);
        if ($scope.showAlert === doesCookieExist)
          return;
        if (doesCookieExist)
          MessagesStack.push("atf-session-message");
        $scope.showAlert = doesCookieExist;
        if (!doesCookieExist) {
          setTimeout(
            function() {
              MessagesStack.pop("atf-session-message");
            },
            1300
          );
        }
      }

      function getCookie(name) {
        var nameEQ = name + "=";
        var theCookie = document.cookie.split(';');
        for (var i = 0; i < theCookie.length; i++) {
          var c = theCookie[i];
          while (c.charAt(0) === ' ')
            c = c.substring(1, c.length);
          if (c.indexOf(nameEQ) === 0)
            return c.substring(nameEQ.length, c.length);
        }
        return null;
      }
    }
  }
}]);;