/*! RESOURCE: /scripts/sn/common/controls/js_includes_controls.js */
/*! RESOURCE: /scripts/sn/common/controls/_module.js */
angular.module('sn.common.controls', []);;
/*! RESOURCE: /scripts/sn/common/controls/directive.snChoiceList.js */
angular.module('sn.common.controls').directive('snChoiceList', function($timeout) {
    "use strict";
    return {
        restrict: 'E',
        replace: true,
        scope: {
            snModel: "=",
            snTextField: "@",
            snValueField: "@",
            snOptions: "=?",
            snItems: "=?",
            snOnChange: "&",
            snDisabled: "=",
            snDialogName: "="
        },
        template: '<select ng-disabled="snDisabled" ' +
            '        ng-model="model" ' +
            '        ng-options="item[snValueField] as item[snTextField] for item in snItems">' +
            '  <option value="" ng-show="snOptions.placeholder">{{snOptions.placeholder}}</option>' +
            '</select>',
        link: function(scope, element, attrs) {
            if (scope.snDialogName)
                scope.$on("dialog." + scope.snDialogName + ".close", function() {
                    $timeout(function() {
                        $(element).select2("destroy");
                    })
                });
            $(element).css("opacity", 0);
            var config = {
                width: "100%"
            };
            if (scope.snOptions) {
                if (scope.snOptions.placeholder) {
                    config.placeholder = scope.snOptions.placeholder;
                    config.placeholderOption = "first";
                }
                if (scope.snOptions.hideSearch && scope.snOptions.hideSearch === true) {
                    config.minimumResultsForSearch = -1;
                }
            }

            function init() {
                scope.model = scope.snModel;
                render();
            }

            function render() {
                if (!attrs) {
                    $timeout(function() {
                        render();
                    });
                    return;
                }
                $timeout(function() {
                    $(element).css("opacity", 1);
                    $(element).select2("destroy");
                    $(element).select2(config);
                });
            }
            init();
            scope.$watch("snItems", function(newValue, oldValue) {
                if (newValue !== oldValue) {
                    init();
                }
            }, true);
            scope.$watch("snModel", function(newValue) {
                if (newValue !== undefined && newValue !== scope.model) {
                    init();
                }
            });
            scope.$watch("model", function(newValue, oldValue) {
                if (newValue !== oldValue) {
                    scope.snModel = newValue;
                    if (scope.snOnChange)
                        scope.snOnChange({
                            selectedValue: newValue
                        });
                }
            });
            scope.$on('$destroy', function() {
                $(element).select2("destroy");
            });
        },
        controller: function($scope) {}
    }
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snReferencePicker.js */
angular.module('sn.common.controls').directive('snReferencePicker', function($timeout, $http, urlTools, filterExpressionParser, $sanitize, i18n) {
    "use strict";
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ed: "=?",
            field: "=",
            refTable: "=?",
            refId: "=?",
            snOptions: "=?",
            snOnChange: "&",
            snOnBlur: "&",
            snOnClose: "&",
            snOnOpen: '&',
            minimumInputLength: "@",
            snDisabled: "=",
            snPageSize: "@",
            dropdownCssClass: "@",
            formatResultCssClass: "&",
            overlay: "=",
            additionalDisplayColumns: "@",
            displayColumn: "@",
            recordValues: '&',
            getGlideForm: '&glideForm',
            domain: "@",
            snSelectWidth: '@',
        },
        template: '<input type="text" name="{{field.name}}" ng-disabled="snDisabled" style="min-width: 150px;" ng-model="field.displayValue" />',
        link: function(scope, element, attrs, ctrl) {
            scope.ed = scope.ed || scope.field.ed;
            scope.selectWidth = scope.snSelectWidth || '100%';
            element.css("opacity", 0);
            var fireReadyEvent = true;
            var g_form;
            if (angular.isDefined(scope.getGlideForm))
                g_form = scope.getGlideForm();
            var fieldAttributes = {};
            if (angular.isDefined(scope.field) && angular.isDefined(scope.field.attributes) && typeof scope.ed.attributes == 'undefined')
                if (Array.isArray(scope.field.attributes))
                    fieldAttributes = scope.field.attributes;
                else
                    fieldAttributes = parseAttributes(scope.field.attributes);
            else
                fieldAttributes = parseAttributes(scope.ed.attributes);
            if (!angular.isDefined(scope.additionalDisplayColumns) && angular.isDefined(fieldAttributes['ref_ac_columns']))
                scope.additionalDisplayColumns = fieldAttributes['ref_ac_columns'];
            var select2AjaxHelpers = {
                formatSelection: function(item) {
                    return $sanitize(getDisplayValue(item));
                },
                formatResult: function(item) {
                    var displayValues = getDisplayValues(item);
                    if (displayValues.length == 1)
                        return $sanitize(displayValues[0]);
                    if (displayValues.length > 1) {
                        var width = 100 / displayValues.length;
                        var markup = "";
                        for (var i = 0; i < displayValues.length; i++)
                            markup += "<div style='width: " + width + "%;' class='select2-result-cell'>" + $sanitize(displayValues[i]) + "</div>";
                        return markup;
                    }
                    return "";
                },
                search: function(queryParams) {
                    if ('sysparm_include_variables' in queryParams.data) {
                        var url = urlTools.getURL('ref_list_data', queryParams.data);
                        return $http.get(url).then(queryParams.success);
                    } else {
                        var url = urlTools.getURL('ref_list_data');
                        return $http.post(url, queryParams.data).then(queryParams.success);
                    }
                },
                initSelection: function(elem, callback) {
                    if (scope.field.displayValue)
                        callback({
                            sys_id: scope.field.value,
                            name: scope.field.displayValue
                        });
                }
            };
            var config = {
                width: scope.selectWidth,
                minimumInputLength: scope.minimumInputLength ? parseInt(scope.minimumInputLength, 10) : 0,
                overlay: scope.overlay,
                containerCssClass: 'select2-reference ng-form-element',
                placeholder: '   ',
                formatSearching: '',
                allowClear: attrs.allowClear !== 'false',
                id: function(item) {
                    return item.sys_id;
                },
                sortResults: (scope.snOptions && scope.snOptions.sortResults) ? scope.snOptions.sortResults : undefined,
                ajax: {
                    quietMillis: NOW.ac_wait_time,
                    data: function(filterText, page) {
                        var q = _getReferenceQuery(filterText);
                        var params = {
                            start: (scope.pageSize * (page - 1)),
                            count: scope.pageSize,
                            sysparm_target_table: scope.refTable,
                            sysparm_target_sys_id: scope.refId,
                            sysparm_target_field: scope.ed.dependent_field || scope.ed.name,
                            table: scope.ed.reference,
                            qualifier: scope.ed.qualifier,
                            data_adapter: scope.ed.data_adapter,
                            attributes: scope.ed.attributes,
                            dependent_field: scope.ed.dependent_field,
                            dependent_table: scope.ed.dependent_table,
                            dependent_value: scope.ed.dependent_value,
                            p: scope.ed.reference + ';q:' + q + ';r:' + scope.ed.qualifier
                        };
                        if (scope.domain) {
                            params.sysparm_domain = scope.domain;
                        }
                        if (angular.isDefined(scope.field) && scope.field['_cat_variable'] === true) {
                            delete params['sysparm_target_table'];
                            params['sysparm_include_variables'] = true;
                            params['variable_ids'] = scope.field.sys_id;
                            var getFieldSequence = g_form.$private.options('getFieldSequence');
                            if (getFieldSequence) {
                                params['variable_sequence1'] = getFieldSequence();
                            }
                            var itemSysId = g_form.$private.options('itemSysId');
                            params['sysparm_id'] = itemSysId;
                            var getFieldParams = g_form.$private.options('getFieldParams');
                            if (getFieldParams) {
                                angular.extend(params, getFieldParams());
                            }
                        }
                        if (scope.recordValues)
                            params.sysparm_record_values = scope.recordValues();
                        return params;
                    },
                    results: function(data, page) {
                        return ctrl.filterResults(data, page, scope.pageSize);
                    },
                    transport: select2AjaxHelpers.search
                },
                formatSelection: select2AjaxHelpers.formatSelection,
                formatResult: select2AjaxHelpers.formatResult,
                initSelection: select2AjaxHelpers.initSelection,
                dropdownCssClass: attrs.dropdownCssClass,
                formatResultCssClass: scope.formatResultCssClass || null
            };
            if (scope.snOptions) {
                if (scope.snOptions.placeholder) {
                    config.placeholder = scope.snOptions.placeholder;
                }
                if (scope.snOptions.width) {
                    config.width = scope.snOptions.width;
                }
            }

            function _getReferenceQuery(filterText) {
                var filterExpression = filterExpressionParser.parse(filterText, scope.ed.defaultOperator);
                var colToSearch = getReferenceColumnsToSearch();
                var excludedValues = getExcludedValues();
                return colToSearch.map(function(column) {
                    return column + filterExpression.operator + filterExpression.filterText +
                        '^' + column + 'ISNOTEMPTY' + excludedValues;
                }).join("^NQ");
            }

            function getReferenceColumnsToSearch() {
                var colName = ['name'];
                if (scope.ed.searchField) {
                    colName = scope.ed.searchField.split(";");
                } else if (fieldAttributes['ref_ac_columns_search'] == 'true' && 'ref_ac_columns' in fieldAttributes && fieldAttributes['ref_ac_columns'] != '') {
                    colName = fieldAttributes['ref_ac_columns'].split(';');
                } else if (fieldAttributes['ref_ac_order_by']) {
                    colName = [fieldAttributes['ref_ac_order_by']];
                }
                return colName;
            }

            function getExcludedValues() {
                if (scope.ed.excludeValues && scope.ed.excludeValues != '') {
                    return '^sys_idNOT IN' + scope.ed.excludeValues;
                }
                return '';
            }

            function parseAttributes(strAttributes) {
                var attributeArray = (strAttributes && strAttributes.length ? strAttributes.split(',') : []);
                var attributeObj = {};
                for (var i = 0; i < attributeArray.length; i++) {
                    if (attributeArray[i].length > 0) {
                        var attribute = attributeArray[i].split('=');
                        attributeObj[attribute[0]] = attribute.length > 1 ? attribute[1] : '';
                    }
                }
                return attributeObj;
            }

            function init() {
                scope.model = scope.snModel;
                render();
            }

            function render() {
                $timeout(function() {
                    i18n.getMessage('Searching...', function(searchingMsg) {
                        config.formatSearching = function() {
                            return searchingMsg;
                        };
                    });
                    element.css("opacity", 1);
                    element.select2("destroy");
                    var select2 = element.select2(config);
                    select2.bind("change", select2Change);
                    select2.bind("select2-removed", select2Change);
                    select2.bind("select2-blur", function() {
                        scope.$apply(function() {
                            scope.snOnBlur();
                        });
                    });
                    select2.bind("select2-close", function() {
                        scope.$apply(function() {
                            scope.snOnClose();
                        });
                    });
                    select2.bind("select2-open", function() {
                        scope.$apply(function() {
                            if (scope.snOnOpen)
                                scope.snOnOpen();
                        });
                    });
                    select2.bind('select2-focus', function() {
                        redirectLabel(element);
                    });
                    if (fireReadyEvent) {
                        scope.$emit('select2.ready', element);
                        fireReadyEvent = false;
                    }
                });
            }

            function select2Change(e) {
                e.stopImmediatePropagation();
                if (e.added) {
                    if (scope.$$phase || scope.$root.$$phase)
                        return;
                    var selectedItem = e.added;
                    var value = selectedItem.sys_id;
                    var displayValue = value ? getDisplayValue(selectedItem) : '';
                    if (scope.snOptions && scope.snOptions.useGlideForm === true) {
                        g_form.setValue(scope.field.name, value, displayValue);
                        scope.rowSelected();
                        e.displayValue = displayValue;
                        triggerSnOnChange();
                    } else {
                        scope.$apply(function() {
                            scope.field.value = value;
                            scope.field.displayValue = displayValue;
                            scope.rowSelected();
                            e.displayValue = displayValue;
                            triggerSnOnChange();
                        });
                    }
                } else if (e.removed) {
                    if (scope.snOptions && scope.snOptions.useGlideForm === true) {
                        g_form.clearValue(scope.field.name);
                        triggerSnOnChange();
                    } else {
                        scope.$apply(function() {
                            scope.field.displayValue = '';
                            scope.field.value = '';
                            triggerSnOnChange();
                        });
                    }
                }

                function triggerSnOnChange() {
                    if (scope.snOnChange)
                        scope.snOnChange(e);
                }
            }

            function redirectLabel($select2) {
                if (NOW.select2LabelWorkaround)
                    NOW.select2LabelWorkaround($select2);
            }

            function getDisplayValue(selectedItem) {
                var displayValue = '';
                if (selectedItem && selectedItem.sys_id) {
                    if (scope.displayColumn && typeof selectedItem[scope.displayColumn] != "undefined")
                        displayValue = selectedItem[scope.displayColumn];
                    else if (selectedItem.$$displayValue)
                        displayValue = selectedItem.$$displayValue;
                    else if (selectedItem.name)
                        displayValue = selectedItem.name;
                    else if (selectedItem.title)
                        displayValue = selectedItem.title;
                }
                return displayValue;
            }

            function getDisplayValues(selectedItem) {
                var displayValues = [];
                if (selectedItem && selectedItem.sys_id) {
                    var current = "";
                    if (scope.displayColumn && typeof selectedItem[scope.displayColumn] != "undefined")
                        current = selectedItem[scope.displayColumn];
                    else if (selectedItem.$$displayValue)
                        current = selectedItem.$$displayValue;
                    else if (selectedItem.name)
                        current = selectedItem.name;
                    else if (selectedItem.title)
                        current = selectedItem.title;
                    displayValues.push(current);
                }
                if (scope.additionalDisplayColumns) {
                    var columns = scope.additionalDisplayColumns.split(",");
                    for (var i = 0; i < columns.length; i++) {
                        var column = columns[i];
                        if (selectedItem[column])
                            displayValues.push(selectedItem[column]);
                    }
                }
                return displayValues;
            }
            scope.$watch("field.displayValue", function(newValue, oldValue) {
                if (newValue != oldValue && newValue !== scope.model) {
                    init();
                }
            });
            scope.$on("snReferencePicker.activate", function(evt, parms) {
                $timeout(function() {
                    element.select2("open");
                })
            });
            init();
        },
        controller: function($scope, $rootScope) {
            $scope.pageSize = 20;
            if ($scope.snPageSize)
                $scope.pageSize = parseInt($scope.snPageSize);
            $scope.rowSelected = function() {
                $rootScope.$broadcast("@page.reference.selected", {
                    field: $scope.field,
                    ed: $scope.ed
                });
            };
            this.filterResults = function(data, page) {
                return {
                    results: data.data.items,
                    more: (page * $scope.pageSize < data.data.total)
                };
            };
        }
    };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snRecordPicker.js */
angular.module('sn.common.controls').directive('snRecordPicker', function($timeout, $http, urlTools, filterExpressionParser, $sanitize, i18n) {
    "use strict";
    var cache = {};

    function cleanLabel(val) {
        if (typeof val == "object")
            return "";
        return typeof val == "string" ? val.trim() : val;
    }
    return {
        restrict: 'E',
        replace: true,
        scope: {
            field: '=',
            table: '=',
            defaultQuery: '=?',
            startswith: '=?',
            searchFields: '=?',
            valueField: '=?',
            displayField: '=?',
            displayFields: '=?',
            pageSize: '=?',
            onChange: '&',
            snDisabled: '=',
            multiple: '=?',
            options: '=?',
            placeholder: '@'
        },
        template: '<input type="text" ng-disabled="snDisabled" style="min-width: 150px;" name="{{field.name}}" ng-model="field.value" />',
        controller: function($scope) {
            if (!angular.isNumber($scope.pageSize))
                $scope.pageSize = 20;
            if (!angular.isDefined($scope.valueField))
                $scope.valueField = 'sys_id';
            this.filterResults = function(data, page) {
                return {
                    results: data.data.result,
                    more: (page * $scope.pageSize < parseInt(data.headers('x-total-count'), 10))
                };
            };
        },
        link: function(scope, element, attrs, ctrl) {
            var isExecuting = false;
            var select2Helpers = {
                formatSelection: function(item) {
                    return $sanitize(getDisplayValue(item));
                },
                formatResult: function(item) {
                    var displayFields = getdisplayFields(item);
                    if (displayFields.length == 1)
                        return $sanitize(cleanLabel(displayFields[0]));
                    if (displayFields.length > 1) {
                        var markup = $sanitize(displayFields[0]);
                        var width = 100 / (displayFields.length - 1);
                        markup += "<div>";
                        for (var i = 1; i < displayFields.length; i++)
                            markup += "<div style='width: " + width + "%;' class='select2-additional-display-field'>" + $sanitize(cleanLabel(displayFields[i])) + "</div>";
                        markup += "</div>";
                        return markup;
                    }
                    return "";
                },
                search: function(queryParams) {
                    var url = '/api/now/table/' + scope.table + '?' + urlTools.encodeURIParameters(queryParams.data);
                    if (scope.options && scope.options.cache && cache[url])
                        return queryParams.success(cache[url]);
                    return $http.get(url).then(function(response) {
                        if (scope.options && scope.options.cache) {
                            cache[url] = response;
                        }
                        return queryParams.success(response)
                    });
                },
                initSelection: function(elem, callback) {
                    if (scope.field.displayValue) {
                        if (scope.multiple) {
                            var items = [],
                                sel;
                            var values = scope.field.value.split(',');
                            var displayValues = scope.field.displayValue.split(',');
                            for (var i = 0; i < values.length; i++) {
                                sel = {};
                                sel[scope.valueField] = values[i];
                                sel[scope.displayField] = displayValues[i];
                                items.push(sel);
                            }
                            callback(items);
                        } else {
                            var sel = {};
                            sel[scope.valueField] = scope.field.value;
                            sel[scope.displayField] = scope.field.displayValue;
                            callback(sel);
                        }
                    } else
                        callback([]);
                }
            };
            var config = {
                width: '100%',
                containerCssClass: 'select2-reference ng-form-element',
                placeholder: scope.placeholder || '    ',
                formatSearching: '',
                allowClear: (scope.options && typeof scope.options.allowClear !== "undefined") ? scope.options.allowClear : true,
                id: function(item) {
                    return item[scope.valueField];
                },
                ajax: {
                    quietMillis: NOW.ac_wait_time,
                    data: function(filterText, page) {
                        var params = {
                            sysparm_offset: (scope.pageSize * (page - 1)),
                            sysparm_limit: scope.pageSize,
                            sysparm_query: buildQuery(filterText, scope.searchFields, scope.defaultQuery)
                        };
                        return params;
                    },
                    results: function(data, page) {
                        return ctrl.filterResults(data, page, scope.pageSize);
                    },
                    transport: select2Helpers.search
                },
                formatSelection: select2Helpers.formatSelection,
                formatResult: select2Helpers.formatResult,
                formatResultCssClass: function() {
                    return '';
                },
                initSelection: select2Helpers.initSelection,
                multiple: scope.multiple
            };

            function buildQuery(filterText, searchFields, defaultQuery) {
                var queryParts = [];
                var operator = "CONTAINS";
                if (scope.startswith)
                    operator = "STARTSWITH";
                if (filterText.startsWith("*")) {
                    filterText = filterText.substring(1);
                    operator = "CONTAINS";
                }
                if (defaultQuery)
                    queryParts.push(defaultQuery);
                var filterExpression = filterExpressionParser.parse(filterText, operator);
                if (searchFields != null) {
                    var fields = searchFields.split(',');
                    if (filterExpression.filterText != '') {
                        var OR = "";
                        for (var i = 0; i < fields.length; i++) {
                            queryParts.push(OR + fields[i] + filterExpression.operator + filterExpression.filterText);
                            OR = "OR";
                        }
                    }
                    for (var i = 0; i < fields.length; i++)
                        queryParts.push('ORDERBY' + fields[i]);
                    queryParts.push('EQ');
                }
                return queryParts.join('^');
            }
            scope.field = scope.field || {};
            var initTimeout = null;
            var value = scope.field.value;
            var oldValue = scope.field.value;
            var $select;

            function init() {
                element.css("opacity", 0);
                $timeout.cancel(initTimeout);
                initTimeout = $timeout(function() {
                    i18n.getMessage('Searching...', function(searchingMsg) {
                        config.formatSearching = function() {
                            return searchingMsg;
                        };
                    });
                    element.css("opacity", 1);
                    element.select2("destroy");
                    $select = element.select2(config);
                    $select.bind("change", onChanged);
                    $select.bind("select2-removed", onChanged);
                    $select.bind("select2-selecting", onSelecting);
                    $select.bind("select2-removing", onRemoving);
                    scope.$emit('select2.ready', element);
                });
            }

            function onSelecting(e) {
                isExecuting = true;
                oldValue = scope.field.value;
                var selectedItem = e.choice;
                if (scope.multiple && selectedItem[scope.valueField] != '') {
                    var values = !scope.field.value ? [] : scope.field.value.split(',');
                    var displayValues = !scope.field.displayValue ? [] : scope.field.displayValue.split(',');
                    values.push(selectedItem[scope.valueField]);
                    displayValues.push(getDisplayValue(selectedItem));
                    scope.field.value = values.join(',');
                    scope.field.displayValue = displayValues.join(',');
                    e.preventDefault();
                    $select.select2('val', values).select2('close');
                    scope.$apply(function() {
                        callChange(oldValue, e);
                    });
                }
            }

            function onRemoving(e) {
                isExecuting = true;
                oldValue = scope.field.value;
                var removed = e.choice;
                if (scope.multiple) {
                    var values = scope.field.value.split(',');
                    var displayValues = scope.field.displayValue.split(',');
                    for (var i = values.length - 1; i >= 0; i--) {
                        if (removed[scope.valueField] == values[i]) {
                            values.splice(i, 1);
                            displayValues.splice(i, 1);
                            break;
                        }
                    }
                    scope.field.value = values.join(',');
                    scope.field.displayValue = displayValues.join(',');
                    e.preventDefault();
                    $select.select2('val', scope.field.value.split(','));
                    scope.$apply(function() {
                        callChange(oldValue, e);
                    });
                }
            }

            function callChange(oldValue, e) {
                var f = scope.field;
                var p = {
                    field: f,
                    newValue: f.value,
                    oldValue: oldValue,
                    displayValue: f.displayValue
                }
                scope.$emit("field.change", p);
                scope.$emit("field.change." + f.name, p);
                if (scope.onChange)
                    try {
                        scope.onChange(e);
                    } catch (ex) {
                        console.log("directive.snRecordPicker error in onChange")
                        console.log(ex)
                    }
                isExecuting = false;
            }

            function onChanged(e) {
                e.stopImmediatePropagation();
                if (scope.$$phase || scope.$root.$$phase) {
                    console.warn('in digest, returning early');
                    return;
                }
                if (e.added) {
                    var selectedItem = e.added;
                    if (!scope.multiple) {
                        scope.field.value = selectedItem[scope.valueField];
                        if (scope.field.value) {
                            scope.field.displayValue = getDisplayValue(selectedItem);
                        } else
                            scope.field.displayValue = '';
                    }
                } else if (e.removed) {
                    if (!scope.multiple) {
                        scope.field.displayValue = '';
                        scope.field.value = '';
                    }
                }
                scope.$apply(function() {
                    callChange(oldValue, e);
                });
            }

            function getDisplayValue(selectedItem) {
                var displayValue = selectedItem[scope.valueField];
                if (selectedItem) {
                    if (scope.displayField && angular.isDefined(selectedItem[scope.displayField]))
                        displayValue = selectedItem[scope.displayField];
                    else if (selectedItem.name)
                        displayValue = selectedItem.name;
                    else if (selectedItem.title)
                        displayValue = selectedItem.title;
                }
                return cleanLabel(displayValue);
            }

            function getdisplayFields(selectedItem) {
                var displayFields = [];
                if (selectedItem && selectedItem[scope.valueField]) {
                    var current = "";
                    if (scope.displayField && angular.isDefined(selectedItem[scope.displayField]))
                        current = selectedItem[scope.displayField];
                    else if (selectedItem.name)
                        current = selectedItem.name;
                    else if (selectedItem.title)
                        current = selectedItem.title;
                    displayFields.push(current);
                }
                if (scope.displayFields) {
                    var columns = scope.displayFields.split(",");
                    for (var i = 0; i < columns.length; i++) {
                        var column = columns[i];
                        if (selectedItem[column])
                            displayFields.push(selectedItem[column]);
                    }
                }
                return displayFields;
            }
            scope.$watch("field.value", function(newValue) {
                if (isExecuting) return;
                if (angular.isDefined(newValue) && $select) {
                    if (scope.multiple)
                        $select.select2('val', newValue.split(',')).select2('close');
                    else
                        $select.select2('val', newValue).select2('close');
                }
            });
            if (attrs.displayValue) {
                attrs.$observe('displayValue', function(value) {
                    scope.field.value = value;
                });
            }
            init();
        }
    };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snSelectBasic.js */
angular.module('sn.common.controls').directive('snSelectBasic', function($timeout) {
    return {
        restrict: 'C',
        priority: 1,
        require: '?ngModel',
        scope: {
            'snAllowClear': '@',
            'snSelectWidth': '@',
            'snChoices': '=?'
        },
        link: function(scope, element, attrs, ngModel) {
            if (angular.isFunction(element.select2)) {
                element.css("opacity", 0);
                scope.selectWidth = scope.snSelectWidth || '100%';
                scope.selectAllowClear = scope.snAllowClear === "true";
                $timeout(function() {
                    element.css("opacity", 1);
                    element.select2({
                        allowClear: scope.selectAllowClear,
                        width: scope.selectWidth
                    });
                    if (ngModel === null)
                        return;
                    ngModel.$render = function() {
                        element.select2('val', ngModel.$viewValue);
                        element.val(ngModel.$viewValue);
                    };
                });
                element.on('change', function() {
                    scope.$evalAsync(setModelValue);
                });
                scope.$watch('snChoices', function(newValue, oldValue) {
                    if (angular.isDefined(newValue) && newValue != oldValue) {
                        $timeout(function() {
                            setModelValue();
                        });
                    }
                }, true);

                function setModelValue() {
                    if (ngModel === null)
                        return;
                    ngModel.$setViewValue(element.val());
                }
            }
        }
    };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snTableReference.js */
angular.module('sn.common.controls').directive('snTableReference', function($timeout) {
    "use strict";
    return {
        restrict: 'E',
        replace: true,
        scope: {
            field: "=",
            snChange: "&",
            snDisabled: "="
        },
        template: '<select ng-disabled="snDisabled" style="min-width: 150px;" name="{{::field.name}}" ng-model="fieldValue" ng-model-options="{getterSetter: true}" ng-options="choice.value as choice.label for choice in field.choices"></select>',
        controller: function($scope) {
            $scope.fieldValue = function(selected) {
                if (angular.isDefined(selected)) {
                    $scope.snChange({
                        newValue: selected
                    });
                }
                return $scope.field.value;
            }
        },
        link: function(scope, element) {
            var initTimeout = null;
            var fireReadyEvent = true;
            element.css("opacity", 0);

            function render() {
                $timeout.cancel(initTimeout);
                initTimeout = $timeout(function() {
                    element.css("opacity", 1);
                    element.select2("destroy");
                    element.select2();
                    if (fireReadyEvent) {
                        scope.$emit('select2.ready', element);
                        fireReadyEvent = false;
                    }
                });
            }
            scope.$watch("field.displayValue", function(newValue, oldValue) {
                if (newValue !== undefined && newValue != oldValue) {
                    render();
                }
            });
            render();
        }
    };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snFieldReference.js */
angular.module('sn.common.controls').directive('snFieldReference', function($timeout, $http, nowServer) {
    "use strict";
    return {
        restrict: 'E',
        replace: true,
        scope: {
            field: "=",
            snChange: "&",
            snDisabled: "=",
            getGlideForm: '&glideForm'
        },
        template: '<select ng-disabled="snDisabled" name="{{field.name}}" style="min-width: 150px;" ng-model="fieldValue" ng-model-options="{getterSetter: true}" ng-options="choice.name as choice.label for choice in field.choices"></select>',
        controller: function($scope) {
            $scope.fieldValue = function(selected) {
                if (angular.isDefined(selected))
                    $scope.snChange({
                        newValue: selected
                    });
                return $scope.field.value;
            }
            $scope.$watch('field.dependentValue', function(newVal, oldVal) {
                if (!angular.isDefined(newVal))
                    return;
                var src = nowServer.getURL('table_fields', 'exclude_formatters=true&fd_table=' + newVal);
                $http.post(src).success(function(response) {
                    $scope.field.choices = response;
                    $scope.render();
                });
            });
        },
        link: function(scope, element) {
            var initTimeout = null;
            var fireReadyEvent = true;
            scope.render = function() {
                $timeout.cancel(initTimeout);
                initTimeout = $timeout(function() {
                    element.select2("destroy");
                    element.select2();
                    if (fireReadyEvent) {
                        scope.$emit('select2.ready', element);
                        fireReadyEvent = false;
                    }
                });
            };
            scope.$watch("field.displayValue", function(newValue, oldValue) {
                if (newValue !== undefined && newValue != oldValue) {
                    scope.render();
                }
            });
            scope.render();
        }
    };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snSyncWith.js */
angular.module("sn.common.controls").directive('snSyncWith', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr) {
            var journalField = scope.$eval(attr.snSyncWith);
            var journalValue = scope.$eval(attr.ngModel);
            if (attr.snSyncWithValueInFn)
                scope.$eval(attr.ngModel + "=" + attr.snSyncWithValueInFn, {
                    text: scope.value
                });
            scope.$watch(function() {
                return scope.$eval(attr.snSyncWith);
            }, function(nv, ov) {
                if (nv !== ov)
                    journalField = nv;
            });
            scope.$watch(function() {
                return scope.$eval(attr.ngModel);
            }, function(nv, ov) {
                if (nv !== ov)
                    journalValue = nv;
            });
            if (!window.g_form)
                return;
            scope.$watch(function() {
                return journalValue;
            }, function(n, o) {
                if (n !== o)
                    setFieldValue();
            });

            function setFieldValue() {
                setValue(journalField, journalValue);
            }

            function setValue(field, value) {
                value = !!value ? value : '';
                var control = g_form.getControl(field);
                if (attr.snSyncWithValueOutFn)
                    value = scope.$eval(attr.snSyncWithValueOutFn, {
                        text: value
                    })
                control.value = value;
                onChange(control.id);
            }
            scope.$watch(function() {
                return journalField;
            }, function(newValue, oldValue) {
                if (newValue !== oldValue) {
                    if (oldValue)
                        setValue(oldValue, '');
                    if (newValue)
                        setFieldValue();
                }
            }, true);
        }
    };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.contenteditable.js */
angular.module('sn.common.controls').directive('contenteditable', function($timeout, $sanitize) {
    return {
        require: 'ngModel',
        link: function(scope, elem, attrs, ctrl) {
            var changehandler = scope.changehandler;
            scope.usenewline = scope.usenewline + "" != "false";
            var newLine = "\n";
            var nodeBR = "BR";
            var nodeDIV = "DIV";
            var nodeText = "#text";
            var nbspRegExp = new RegExp(String.fromCharCode(160), "g");
            if (!scope.usenewline)
                elem.keypress(function(event) {
                    if (event.which == "13") {
                        if (scope.entercallback)
                            scope.entercallback(elem);
                        event.preventDefault();
                    }
                });

            function processNodes(nodes) {
                var val = "";
                for (var i = 0; i < nodes.length; i++) {
                    var node = nodes[i];
                    var follow = true;
                    switch (node.nodeName) {
                        case nodeText:
                            val += node.nodeValue.replace(nbspRegExp, " ");
                            break;
                        case nodeDIV:
                            val += newLine;
                            if (node.childNodes.length == 1 && node.childNodes[0].nodeName == nodeBR)
                                follow = false;
                            break;
                        case nodeBR:
                            val += scope.usenewline ? newLine : "";
                    }
                    if (follow)
                        val += processNodes(node.childNodes)
                }
                return val;
            }

            function readHtml() {
                var val = processNodes(elem[0].childNodes);
                ctrl.$setViewValue(val);
            }

            function writeHtml() {
                var val = ctrl.$viewValue;
                if (!val || val === null)
                    val = "";
                val = val.replace(/\n/gi, scope.usenewline ? "<br/>" : "");
                val = val.replace(/  /gi, " &nbsp;");
                try {
                    if (attrs.contenteditableEscapeHtml == "true")
                        val = $sanitize(val);
                } catch (err) {
                    var replacement = {
                        '&': '&amp;',
                        '<': '&lt;',
                        '>': '&gt;',
                        '"': '&quot;',
                        "'": '&#x27;',
                        '/': '&#x2F;'
                    };
                    val = val.replace(/[&<>"'\/]/g, function(pattern) {
                        return replacement[pattern]
                    });
                };
                elem.html(val);
            }

            function processPlaceholder() {
                if (elem[0].dataset) {
                    if (elem[0].textContent)
                        elem[0].dataset.divPlaceholderContent = 'true';
                    else if (elem[0].dataset.divPlaceholderContent)
                        delete(elem[0].dataset.divPlaceholderContent);
                }
            }
            elem.bind('keyup', function() {
                scope.$apply(function() {
                    readHtml();
                    processPlaceholder();
                });
            });

            function selectText(elem) {
                var range;
                var selection;
                if (document.body.createTextRange) {
                    range = document.body.createTextRange();
                    range.moveToElementText(elem);
                    range.select();
                } else if (window.getSelection) {
                    selection = window.getSelection();
                    range = document.createRange();
                    range.selectNodeContents(elem);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
            elem.bind('focus', function() {
                if (scope[attrs.tracker] && scope[attrs.tracker]['isDefault_' + attrs.trackeratt])
                    $timeout(function() {
                        selectText(elem[0]);
                    });
                elem.original = ctrl.$viewValue;
            });
            elem.bind('blur', function() {
                scope.$apply(function() {
                    readHtml();
                    processPlaceholder();
                    if (elem.original != ctrl.$viewValue && changehandler) {
                        if (scope[attrs.tracker] && typeof scope[attrs.tracker]['isDefault_' + attrs.trackeratt] != "undefined")
                            scope[attrs.tracker]['isDefault_' + attrs.trackeratt] = false;
                        changehandler(scope[attrs.tracker], attrs.trackeratt);
                    }
                });
            });
            elem.bind('paste', function() {
                scope.$apply(function() {
                    setTimeout(function() {
                        readHtml();
                        writeHtml();
                    }, 0);
                    return false;
                });
            });
            ctrl.$render = function() {
                writeHtml();
            };
            scope.$watch('field.readonly', function() {
                elem[0].contentEditable = !scope.$eval('field.readonly');
            });
            scope.$watch(
                function() {
                    return {
                        val: elem[0].textContent
                    };
                },
                function(newValue, oldValue) {
                    if (newValue.val != oldValue.val)
                        processPlaceholder();
                },
                true);
            writeHtml();
        }
    };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snGlyph.js */
angular.module("sn.common.controls").directive("snGlyph", function() {
    "use strict";
    return {
        restrict: 'E',
        replace: true,
        scope: {
            char: "@",
        },
        template: '<span class="glyphicon glyphicon-{{char}}" />',
        link: function(scope) {}
    }
});
angular.module("sn.common.controls").directive('fa', function() {
        return {
            restrict: 'E',
            template: '<span class="fa" aria-hidden="true"></span>',
            replace: true,
            link: function(scope, element, attrs) {
                'use strict';
                var currentClasses = {};

                function _observeStringAttr(attr, baseClass) {
                    var className;
                    attrs.$observe(attr, function() {
                        baseClass = baseClass || 'fa-' + attr;
                        element.removeClass(currentClasses[attr]);
                        if (attrs[attr]) {
                            className = [baseClass, attrs[attr]].join('-');
                            element.addClass(className);
                            currentClasses[attr] = className;
                        }
                    });
                }
                _observeStringAttr('name', 'fa');
                _observeStringAttr('rotate');
                _observeStringAttr('flip');
                _observeStringAttr('stack');
                attrs.$observe('size', function() {
                    var className;
                    element.removeClass(currentClasses.size);
                    if (attrs.size === 'large') {
                        className = 'fa-lg';
                    } else if (!isNaN(parseInt(attrs.size, 10))) {
                        className = 'fa-' + attrs.size + 'x';
                    }
                    element.addClass(className);
                    currentClasses.size = className;
                });
                attrs.$observe('stack', function() {
                    var className;
                    element.removeClass(currentClasses.stack);
                    if (attrs.stack === 'large') {
                        className = 'fa-stack-lg';
                    } else if (!isNaN(parseInt(attrs.stack, 10))) {
                        className = 'fa-stack-' + attrs.stack + 'x';
                    }
                    element.addClass(className);
                    currentClasses.stack = className;
                });

                function _observeBooleanAttr(attr, className) {
                    var value;
                    attrs.$observe(attr, function() {
                        className = className || 'fa-' + attr;
                        value = attr in attrs && attrs[attr] !== 'false' && attrs[attr] !== false;
                        element.toggleClass(className, value);
                    });
                }
                _observeBooleanAttr('border');
                _observeBooleanAttr('fw');
                _observeBooleanAttr('inverse');
                _observeBooleanAttr('spin');
                element.toggleClass('fa-li',
                    element.parent() &&
                    element.parent().prop('tagName') === 'LI' &&
                    element.parent().parent() &&
                    element.parent().parent().hasClass('fa-ul') &&
                    element.parent().children()[0] === element[0] &&
                    attrs.list !== 'false' &&
                    attrs.list !== false
                );
                attrs.$observe('alt', function() {
                    var altText = attrs.alt,
                        altElem = element.next(),
                        altElemClass = 'fa-alt-text';
                    if (altText) {
                        element.removeAttr('alt');
                        if (!altElem || !altElem.hasClass(altElemClass)) {
                            element.after('<span class="sr-only fa-alt-text"></span>');
                            altElem = element.next();
                        }
                        altElem.text(altText);
                    } else if (altElem && altElem.hasClass(altElemClass)) {
                        altElem.remove();
                    }
                });
            }
        };
    })
    .directive('faStack', function() {
        return {
            restrict: 'E',
            transclude: true,
            template: '<span ng-transclude class="fa-stack fa-lg"></span>',
            replace: true,
            link: function(scope, element, attrs) {
                var currentClasses = {};

                function _observeStringAttr(attr, baseClass) {
                    var className;
                    attrs.$observe(attr, function() {
                        baseClass = baseClass || 'fa-' + attr;
                        element.removeClass(currentClasses[attr]);
                        if (attrs[attr]) {
                            className = [baseClass, attrs[attr]].join('-');
                            element.addClass(className);
                            currentClasses[attr] = className;
                        }
                    });
                }
                _observeStringAttr('size');
                attrs.$observe('size', function() {
                    var className;
                    element.removeClass(currentClasses.size);
                    if (attrs.size === 'large') {
                        className = 'fa-lg';
                    } else if (!isNaN(parseInt(attrs.size, 10))) {
                        className = 'fa-' + attrs.size + 'x';
                    }
                    element.addClass(className);
                    currentClasses.size = className;
                });
            }
        };
    });;
/*! RESOURCE: /scripts/sn/common/controls/directive.snImageUploader.js */
angular.module('sn.common.controls').directive('snImageUploader', function($window, $rootScope, $timeout, getTemplateUrl, i18n, snAttachmentHandler) {
    var DRAG_IMAGE_SELECT = i18n.getMessage('Drag image or click to select');
    return {
        restrict: 'E',
        replace: true,
        templateUrl: getTemplateUrl('directive.snImageUploader'),
        transclude: true,
        scope: {
            readOnly: '@',
            tableName: '@',
            sysId: '@',
            fieldName: '@',
            onUpload: '&',
            onDelete: '&',
            uploadMessage: '@',
            src: '='
        },
        controller: function($scope) {
            $scope.uploading = false;
            $scope.getTitle = function() {
                if ($scope.readOnly !== 'true')
                    return DRAG_IMAGE_SELECT;
                return '';
            }
        },
        link: function(scope, element) {
            function isValidImage(file) {
                if (file.type.indexOf('image') != 0) {
                    $alert(i18n.getMessage('Please select an image'));
                    return false;
                }
                if (file.type.indexOf('tiff') > 0) {
                    $alert(i18n.getMessage('Please select a common image format such as gif, jpeg or png'));
                    return false;
                }
                return true;
            }

            function $alert(message) {
                alert(message);
            }
            scope.onFileSelect = function($files) {
                if (scope.readOnly === 'true')
                    return;
                if ($files.length == 0)
                    return;
                var file = $files[0];
                if (!isValidImage(file))
                    return;
                var uploadParams = {
                    sysparm_fieldname: scope.fieldName
                };
                scope.uploading = true;
                snAttachmentHandler.create(scope.tableName, scope.sysId).uploadAttachment(file, uploadParams).then(function(response) {
                    $timeout(function() {
                        scope.uploading = false;
                    });
                    if (scope.onUpload)
                        scope.onUpload({
                            thumbnail: response.thumbnail
                        });
                    $rootScope.$broadcast("snImageUploader:complete", scope.sysId, response);
                });
            }
            scope.openFileSelector = function($event) {
                $event.stopPropagation();
                var input = element.find('input[type=file]');
                input.click();
            }
            scope.activateUpload = function($event) {
                if (scope.readOnly !== 'true')
                    scope.openFileSelector($event);
                else
                    scope.showUpload = !scope.showUpload;
            }
            scope.deleteAttachment = function() {
                var sys_id = scope.src.split(".")[0];
                snAttachmentHandler.deleteAttachment(sys_id).then(function() {
                    scope.src = null;
                    if (scope.onDelete)
                        scope.onDelete();
                    $rootScope.$broadcast("snImageUploader:delete", scope.sysId, sys_id);
                });
            }
        }
    }
});;;