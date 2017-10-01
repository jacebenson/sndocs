/*! RESOURCE: /scripts/sn/common/clientScript/angular/uiPolicyTypes.js */
angular.module('sn.common.clientScript').factory('uiPolicyTypes', function($window) {
    var factory = $window.UI_POLICY_TYPES;
    return factory;
});;
"datetime",
due_date: "datetime"
},
numberTypes: {
        decimal: "decimal",
        numeric: "numeric",
        integer: "integer",
        float: "float"
    },
    currencyTypes: {
        currency: "currency",
        price: "price"
    }
};
exports.UI_POLICY_TYPES = UI_POLICY_TYPES;
})(window);;