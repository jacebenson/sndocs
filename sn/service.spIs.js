/*! RESOURCE: /scripts/app.$sp/service.spIs.js */
angular.module('sn.$sp').factory('spIs', function() {
    function email(input) {
        var regex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return regex.test(input);
    }
    return {
        an: {
            email: email
        }
    }
});;