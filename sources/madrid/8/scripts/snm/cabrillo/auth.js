/*! RESOURCE: /scripts/snm/cabrillo/auth.js */
(function(window, cabrillo, undefined) {
    'use strict';
    var PACKAGE = 'auth';
    var packageUtils = cabrillo.getPackageUtils(PACKAGE);
    cabrillo.extend(cabrillo, {
      auth: {
        reauthenticate: reauthenticate,
        reauthenticateComplete: reauthenticateComplete
      }
    });

    function reauthenticate(currentUser) {
      return packageUtils.call('reauthenticate', {
          user: {
            sysId: currentUser.userID,
            userName: currentUser.userName,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName
          }
        }).then(function(data) {
            var results = data.results;
            if (results.reauthenticated) {
              return {
                sysId: currentUser.userID,
                userName: currentUser.userName,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName
              };
            }
            return cabrillo.q.reject(data.error);
          }, function(err) {
            cabrillo.