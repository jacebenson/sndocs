/*! RESOURCE: /scripts/sn/common/glide/service.queryFilter.js */
angular.module('sn.common.glide').factory('queryFilter', function() {
    "use strict";
    return {
        create: function() {
            var that = {};
            that.conditions = [];

            function newCondition(field, operator, value, label, displayValue, type) {
                var condition = {
                    field: field,
                    operator: operator,
                    value: value,
                    displayValue: displayValue,
                    label: label,
                    left: null,
                    right: null,
                    type: null,
                    setValue: function(value, displayValue) {
                        this.value = value;
                        this.displayValue = displayValue ? displayValue : value;
                    }
                };
                if (type)
                    condition.type = type;
                return condition;
            }

            function addCondition(condition) {
                that.conditions.push(condition);
                return condition;
            }

            function removeCondition(condition) {
                for (var i = that.conditions.length - 1; i >= 0; i--) {
                    if (that.conditions[i] === condition)
                        that.conditions.splice(i, 1);
                }
            }

            function getConditionsByField(conditions, field) {
                var conditionsToReturn = [];
                for (var condition in conditions) {
                    if (conditions.hasOwnProperty(condition)) {
                        if (conditions[condition].field == field)
                            conditionsToReturn.push(conditions[condition]);
                    }
                }
                return conditionsToReturn;
            }

            function encodeCondition(condition) {
                var output = "";
                if (condition.hasOwnProperty("left") && condition.left) {
                    output += encodeCondition(condition.left);
                }
                if (condition.hasOwnProperty("right") && condition.right) {
                    var right = encodeCondition(condition.right);
                    if (right.length > 0) {
                        output += "^" + condition.type + right;
                    }
                }
                if (condition.field) {
                    output += condition.field;
                    output += condition.operator;
                    if (condition.value !== null && typeof condition.value !== "undefined")
                        output += condition.value;
                }
                return output;
            }

            function createEncodedQuery() {
                var eq = "";
                var ca = that.conditions;
                for (var i = 0; i < ca.length; i++) {
                    var condition = ca[i];
                    if (eq.length)
                        eq += '^';
                    eq += encodeCondition(condition);
                }
                eq += "^EQ";
                return eq;
            }
            that.addCondition = addCondition;
            that.newCondition = newCondition;
            that.createEncodedQuery = createEncodedQuery;
            that.getConditionsByField = getConditionsByField;
            that.removeCondition = removeCondition;
            return that;
        }
    };
});;