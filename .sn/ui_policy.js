/*! RESOURCE: /scripts/ui_policy.js */
var ui_policy_dateTypes = {};
ui_policy_dateTypes['glide_date_time'] = "datetime";
ui_policy_dateTypes['glide_date'] = "date";
ui_policy_dateTypes['date'] = "date";
ui_policy_dateTypes['datetime'] = "datetime";
ui_policy_dateTypes['due_date'] = "datetime";
var ui_policy_numberTypes = {};
ui_policy_numberTypes["decimal"] = "decimal";
ui_policy_numberTypes["numeric"] = "numeric";
ui_policy_numberTypes["integer"] = "integer";
ui_policy_numberTypes["float"] = "float";
var ui_policy_currencyTypes = {};
ui_policy_numberTypes["currency"] = "currency";
ui_policy_numberTypes["price"] = "price";
var GlideFieldPolicy = Class.create();
GlideFieldPolicy.prototype = {
    initialize: function(fp) {
        this.className = "GlideFieldPolicy";
        this.fp = fp;
        this.tableName = fp.table;
        this.description = fp.short_description;
        this.lastResult = "none";
        this.debugFlag = fp.debug;
        this._getFields();
        this.info = {};
        this.sys_id = fp.sys_id;
        this.source_table = fp.source_table;
    },
    runPolicyOnLoad: function() {
        if (this.fp.onload)
            this.runPolicy();
    },
    runPolicy: function() {
        CustomEvent.fire('glide_optics_inspect_put_context', 'ui_policy', '"' + this.description + '"', this.sys_id, this.source_table);
        this.debug('Running "' + this.description + '" UI Policy on "' + this.tableName + '" table');
        this.runActions(!!this.evaluateCondition());
        CustomEvent.fire('glide_optics_inspect_pop_context');
    },
    hasPolicy: function(field) {
        var cf = this.fp.condition_fields;
        for (var i = 0; i < cf.length; i++)
            if (field == cf[i])
                return true;
        return false;
    },
    evaluateCondition: function() {
        this.debug(">>> evaluating conditions:");
        var result = "?";
        var conditionResult = true;
        var conditions = this.fp.conditions;
        for (var i = 0, clength = conditions.length; i < clength; i++) {
            var condition = conditions[i];
            if (condition.newquery) {
                if (result === true) {
                    this.debug("<<< condition exited with: TRUE");
                    return true;
                } else {
                    this.debug("OR (next condition)");
                    conditionResult = true;
                }
            }
            if (!conditionResult)
                continue;
            if (condition.or) {
                if (result !== true)
                    result = !!this.evaluateTerm(condition);
            } else {
                if ((result === false) && (!condition.newquery)) {
                    conditionResult = false;
                } else {
                    result = !!this.evaluateTerm(condition);
                }
            }
        }
        result = (!!result).toString().toUpperCase();
        this.debug("<<< condition exited with: " + result);
        return result == "TRUE";
    },
    evaluateTerm: function(term) {
        var result = evalTerm.call(this, term);
        this._debugTerm(term, result);
        return result;

        function evalTerm(term) {
            var type = term.type;
            if (type == "__preevaluated__")
                return term.value;
            if (ui_policy_dateTypes[type])
                return this.evaluateTermDate(term);
            if (ui_policy_numberTypes[type] || ui_policy_currencyTypes[type])
                return this.evaluateTermNumber(term);
            var field = term.field;
            if (!field)
                return false;
            var oper = term.oper;
            var value = term.value;
            var userValue = g_form.getValue(field) + '';
            if (type == 'glide_duration')
                value = this._parseDurationValue(value);
            var mappingField = this._getVariableMappingField(field);
            if (mappingField) {
                var fieldElement = gel(mappingField);
                if (fieldElement && fieldElement.value.trim() && fieldElement.value.trim() !== '') {
                    value = mappingField.value;
                    userValue = g_form.getValue(mappingField) + '';
                }
            }
            switch (oper) {
                case '=':
                    return userValue === value;
                case '!=':
                    return userValue != value;
                case '<':
                    return userValue < value;
                case '<=':
                    return userValue <= value;
                case '>':
                    return userValue > value;
                case '>=':
                    return userValue >= value;
                case 'IN':
                    var values = value.split(',');
                    return userValue && (values.indexOf(userValue) !== -1);
                case 'NOT IN':
                    var values = value.split(',');
                    return values.indexOf(userValue) === -1;
                case 'STARTSWITH':
                    if (type == 'reference')
                        userValue = this.getReferenceDisplayValue(field);
                    return userValue.startsWith(value);
                case 'ENDSWITH':
                    if (type == 'reference')
                        userValue = this.getReferenceDisplayValue(field);
                    return userValue.endsWith(value);
                case 'LIKE':
                    if (type == 'reference')
                        userValue = this.getReferenceDisplayValue(field);
                    return userValue.indexOf(value) != -1;
                case 'NOT LIKE':
                    if (type == 'reference')
                        userValue = this.getReferenceDisplayValue(field);
                    return userValue.indexOf(value) == -1;
                case 'ISEMPTY':
                    return userValue == '';
                case 'ISNOTEMPTY':
                    return userValue != '';
                case 'BETWEEN':
                    var values = value.split('@');
                    return userValue && userValue >= values[0] && userValue <= values[1];
                case 'SAMEAS':
                    userValue = (type == 'reference') ?
                        this.getReferenceDisplayValue(term.field) :
                        g_form.getValue(term.field);
                    value = (type == 'reference') ? this.getReferenceDisplayValue(term.value) : g_form.getValue(term.value);
                    return userValue == value;
                case 'NSAMEAS':
                    userValue = (type == 'reference') ?
                        this.getReferenceDisplayValue(term.field) :
                        g_form.getValue(term.field);
                    value = (type == 'reference') ? this.getReferenceDisplayValue(term.value) : g_form.getValue(term.value);
                    return userValue != value;
                default:
                    return false;
            }
        }
    },
    getReferenceDisplayValue: function(field) {
        var el = g_form.getDisplayBox(field);
        if (el)
            return el.value;
        return '';
    },
    evaluateTermNumber: function(term) {
        var field = term.field;
        if (!field)
            return false;
        var oper = term.oper;
        var value = term.value;
        if (value != '' && value.indexOf(',') == -1)
            value = parseFloat(value);
        var userValue = this.getUserValue(term);
        switch (oper) {
            case '=':
                return userValue === value;
            case '!=':
                return userValue != value;
            case '<':
                return userValue < value;
            case '<=':
                return userValue <= value;
            case '>':
                return userValue > value;
            case '>=':
                return userValue >= value;
            case 'IN':
                var values = (value + "").split(',');
                return userValue.toString() && (values.indexOf(userValue.toString()) !== -1);
            case 'NOT IN':
                var values = (value + "").split(',');
                return values.indexOf(userValue.toString()) === -1;
            case 'ISEMPTY':
                return userValue.toString() == '';
            case 'ISNOTEMPTY':
                return userValue.toString() != '';
            case "GT_FIELD":
                userValue = parseInt(g_form.getValue(term.field));
                value = parseInt(g_form.getValue(term.value));
                return userValue > value;
            case "LT_FIELD":
                userValue = parseInt(g_form.getValue(term.field));
                value = parseInt(g_form.getValue(term.value));
                return userValue < value;
            case "GT_OR_EQUALS_FIELD":
                userValue = parseInt(g_form.getValue(term.field));
                value = parseInt(g_form.getValue(term.value));
                return userValue >= value;
            case "LT_OR_EQUALS_FIELD":
                userValue = parseInt(g_form.getValue(term.field));
                value = parseInt(g_form.getValue(term.value));
                return userValue <= value;
            default:
                return false;
        }
    },
    evaluateTermDate: function(term) {
        var value = term.value;
        var userValue = g_form.getValue(term.field) + '';
        var values = value.split('@');
        var userFormat;
        var isDateTime = false;
        if (ui_policy_dateTypes[term.type] == "datetime") {
            userFormat = g_user_date_time_format;
            isDateTime = true;
        } else
            userFormat = g_user_date_format;
        if (term.oper == 'ISEMPTY')
            return userValue == '';
        var userDate = getDateFromFormat(userValue, userFormat);
        if (userDate == 0) {
            this.debug("evaluateTermDate - invalid date, returning false");
            return false;
        }
        if (term.oper == "RELATIVE")
            return this._evaluateTermDateRelative(userDate, value, isDateTime);
        if (term.oper == "DATEPART")
            return this._evaluateTermDateTrend(userDate, value);
        switch (term.oper) {
            case '=':
                return userValue === value;
            case '!=':
                return userValue != value;
            case 'ISNOTEMPTY':
                return userValue != '';
            case '<':
                var valueDate = getDateFromFormat(value, g_user_date_time_format);
                return (valueDate != 0) && (userDate < valueDate);
            case '>':
                var valueDate = getDateFromFormat(value, g_user_date_time_format);
                return (valueDate != 0) && (userDate > valueDate);
            case 'ON':
                var valueDate1 = getDateFromFormat(values[1], g_user_date_time_format);
                var valueDate2 = getDateFromFormat(values[2], g_user_date_time_format);
                return (valueDate1 != 0) && (valueDate2 != 0) && (userDate >= valueDate1) && (userDate <= valueDate2);
            case 'NOTON':
                var valueDate1 = getDateFromFormat(values[1], g_user_date_time_format);
                var valueDate2 = getDateFromFormat(values[2], g_user_date_time_format);
                return (valueDate1 != 0) && (valueDate2 != 0) && ((userDate < valueDate1) || (userDate > valueDate2));
            case 'BETWEEN':
                var valueDate1 = getDateFromFormat(values[0], g_user_date_time_format);
                var valueDate2 = getDateFromFormat(values[1], g_user_date_time_format);
                return (valueDate1 != 0) && (valueDate2 != 0) && (userDate >= valueDate1) && (userDate <= valueDate2);
            case 'LESSTHAN':
                return this._dateComparisonHelper(term.field, term.value, 'LT');
            case 'MORETHAN':
                return this._dateComparisonHelper(term.field, term.value, 'GT');
            default:
                this.debug("evaluateTermDate - unsupported operator '" + term.oper + "'. Returning FALSE.");
                return false;
        }
    },
    _dateComparisonHelper: function(left, right, comparison) {
        var parsed = this._parseField2FieldValue(right);
        var userValue = g_form.getValue(left);
        var value = g_form.getValue(parsed.fieldName);
        if (this._isNullField(value) || this._isNullField(userValue)) {
            this.debug("ui policy could not find a valid field to compare against. Returning FALSE.");
            return false;
        }
        var userDate = this._stringToDate(userValue);
        var theDate = this._stringToDate(value);
        if (parsed.interval == 'quarter') {
            userDate = this._roundDateToQuarter(userDate);
            theDate = this._roundDateToQuarter(theDate);
        }
        var diff = userDate - theDate;
        if (parsed.beforeAfter == 'before' && diff > 0)
            return false;
        if (parsed.beforeAfter == 'after' && diff < 0)
            return false;
        var xDiff;
        if (parsed.interval == 'quarter') {
            var Qdiff = Math.abs(this._getAbsQuarter(theDate) - this._getAbsQuarter(userDate));
            xDiff = Qdiff - parsed.intervalValue;
        } else {
            var timeSpan = this._getIntervalInMilliSeconds(parsed.interval, parsed.intervalValue);
            xDiff = Math.abs(diff) - Math.abs(timeSpan);
        }
        if (comparison === 'GT')
            return xDiff > 0;
        if (comparison === 'LT')
            return xDiff < 0;
    },
    _getAbsQuarter: function(theDate) {
        var quarters = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4];
        var Q = quarters[theDate.getMonth()];
        var Y = theDate.getFullYear() * 4;
        return Y + Q;
    },
    _roundDateToQuarter: function(theDate) {
        var quarters = [0, 0, 0, 3, 3, 3, 6, 6, 6, 9, 9, 9];
        var Q = quarters[theDate.getMonth()];
        var d = new Date();
        d.setFullYear(theDate.getFullYear(), Q, 0);
        d.setHours(0, 0, 0);
        return d;
    },
    _isNullField: function(fieldValue) {
        return typeof fieldValue == 'undefined' || fieldValue == null || fieldValue == '';
    },
    _parseField2FieldValue: function(daString) {
        var daArray = daString.split('@');
        return {
            fieldName: daArray[0],
            interval: daArray[1],
            intervalValue: parseInt(daArray[3], 10),
            beforeAfter: daArray[2]
        };
    },
    _stringToDate: function(input) {
        var parts = input.split(' ');
        var dateParts = parts[0].split('-');
        var timeParts = parts[1].split(':');
        var date = new Date();
        date.setFullYear(dateParts[0], dateParts[1], dateParts[2]);
        date.setHours(timeParts[0], timeParts[1], timeParts[2]);
        return date;
    },
    _getIntervalInMilliSeconds: function(interval, value) {
        var ms = {};
        ms.hour = 1000 * 60 * 60;
        ms.day = ms.hour * 24;
        ms.week = ms.day * 7;
        ms.month = ms.day * 30;
        ms.year = ms.day * 365;
        return ms[interval] * value;
    },
    _evaluateTermDateTrend: function(userDateMilliseconds, trendValueString) {
        var userDate = new Date(userDateMilliseconds);
        var trendParams = trendValueString.split("@");
        if (trendParams.length != 2 || !trendParams[1])
            return;
        var trendParamParts = trendParams[1].split(",");
        if (trendParamParts.length != 3)
            return;
        var trendType = trendParamParts[0];
        var trendValue = trendParamParts[1];
        var trendOper = trendParamParts[2];
        var checkVals;
        switch (trendType) {
            case 'dayofweek':
                checkVals = this._trendDayOfWeek(userDate, trendValue, trendOper);
                break;
            case 'month':
                checkVals = this._trendMonth(userDate, trendValue, trendOper);
                break;
            case 'year':
                checkVals = this._trendYear(userDate, trendValue, trendOper);
                break;
            case 'week':
                checkVals = this._trendWeek(userDate, trendValue, trendOper);
                break;
            case 'hour':
                checkVals = this._trendHour(userDate, trendValue, trendOper);
                break;
            case 'quarter':
                checkVals = this._trendQuarter(userDate, trendValue, trendOper);
                break;
            default:
                this.debug("_evaluateTermDateTrend - unsupported trend type '" + trendType + "'. Returning FALSE.");
                return false;
        }
        return this._evaluateDateValues(checkVals, trendOper);
    },
    _evaluateTermDateRelative: function(userDateMilliseconds, relativeValueString, isDateTime) {
        var relativeValues = relativeValueString.split('@');
        if (!relativeValues || relativeValues.length != 4 || isNaN(relativeValues[3]))
            return false;
        var oper = relativeValues[0];
        var termType = relativeValues[1];
        var termWhen = relativeValues[2];
        var termValue = parseInt(relativeValues[3], 10);
        var modifier = 1;
        if (termWhen == "ahead")
            modifier = -1;
        var relativeValueMilliseconds;
        switch (termType) {
            case 'hour':
                relativeValueMilliseconds = this.hoursAgoInMilliseconds(modifier * termValue);
                break;
            case 'minute':
                relativeValueMilliseconds = this.minutesAgoInMilliseconds(modifier * termValue);
                break;
            case 'dayofweek':
                relativeValueMilliseconds = this.daysAgoInMilliseconds(modifier * termValue);
                break;
            case 'month':
                relativeValueMilliseconds = this.monthsAgoInMilliseconds(modifier * termValue);
                break;
            case 'quarter':
                relativeValueMilliseconds = this.quartersAgoInMilliseconds(modifier * termValue);
                break;
            case 'year':
                relativeValueMilliseconds = this.yearsAgoInMilliseconds(modifier * termValue);
                break;
            default:
                this.debug("_evaluateTermDateRelative - unsupported type '" + termType + "'. Returning FALSE.");
                return false;
        }
        if (isDateTime) {
            var checkVals = {
                checkValue: relativeValueMilliseconds,
                userValue: userDateMilliseconds
            };
        } else {
            var checkVals = {
                checkValue: this._removeTime(relativeValueMilliseconds),
                userValue: this._removeTime(userDateMilliseconds)
            };
        }
        return this._evaluateDateValues(checkVals, oper);
    },
    _evaluateDateValues: function(checkVals, oper) {
        if (!checkVals)
            return;
        switch (oper) {
            case 'EE':
                return checkVals.userValue === checkVals.checkValue;
            case 'LT':
                return checkVals.userValue < checkVals.checkValue;
            case 'LE':
                return checkVals.userValue <= checkVals.checkValue;
            case 'GT':
                return checkVals.userValue > checkVals.checkValue;
            case 'GE':
                return checkVals.userValue >= checkVals.checkValue;
            default:
                this.debug("_evaluateDateValues - unsupported operator '" + oper + "'. Returning FALSE.");
                return false;
        }
    },
    _removeTime: function(dateInMilliseconds) {
        var newDate = new Date(dateInMilliseconds);
        newDate.setHours(0);
        newDate.setMinutes(0);
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);
        return newDate.getTime();
    },
    _trendDayOfWeek: function(userDate, trendValue) {
        var trendDays = ['monday', 'tuesday', 'wednesday', 'thurday', 'friday', 'saturday', 'sunday'];
        var foundIn = -1;
        for (var i = 0; i < 7; i++)
            if (trendDays[i] == trendValue) {
                foundIn = i;
                break;
            }
        if (foundIn < 0)
            return;
        var userDOW = userDate.getDay();
        userDOW = userDOW - 1;
        if (userDOW < 0)
            userDOW = 6;
        return {
            checkValue: foundIn,
            userValue: userDOW
        };
    },
    _trendMonth: function(userDate, trendValue) {
        var trendMonths = ['jan', 'feb', 'mar', 'apr', 'may', 'june', 'july', 'aug', 'sep', 'oct', 'nov', 'dec'];
        var foundIn = -1;
        for (var i = 0; i < 12; i++)
            if (trendMonths[i] == trendValue) {
                foundIn = i;
                break;
            }
        if (foundIn < 0)
            return;
        return {
            checkValue: foundIn,
            userValue: userDate.getMonth()
        };
    },
    _trendYear: function(userDate, trendValue) {
        return {
            checkValue: trendValue,
            userValue: userDate.getFullYear()
        };
    },
    _trendHour: function(userDate, trendValue) {
        return {
            checkValue: trendValue,
            userValue: userDate.getHour()
        };
    },
    _trendQuarter: function(userDate, trendValue) {
        var quarters = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4];
        return {
            checkValue: trendValue,
            userValue: quarters[userDate.getMonth()]
        };
    },
    _trendWeek: function(userDate, trendValue) {
        var checkDate = new Date(userDate.getFullYear(), 0, 1);
        var userWeek = (Math.ceil((((userDate.getTime() - checkDate) / 86400000) + checkDate.getDay() + 1) / 7)) - 1;
        return {
            checkValue: trendValue,
            userValue: userWeek
        };
    },
    quartersAgoInMilliseconds: function(quarters) {
        var now = new Date();
        var quartersModifier = [0, 1, 1, 1, 4, 4, 4, 7, 7, 7, 10, 10, 10];
        var month = now.getMonth() + 1;
        var quarterBegin = quartersModifier[month];
        var monthsBack = month - quarterBegin + (quarters * 3);
        return this.monthsAgoInMilliseconds(monthsBack);
    },
    yearsAgoInMilliseconds: function(years) {
        var now = new Date();
        var yearsAgo = now.getFullYear() - years;
        now.setFullYear(yearsAgo);
        return now.getTime(now);
    },
    monthsAgoInMilliseconds: function(months) {
        var now = new Date();
        var monthsAgo = now.getMonth() - months;
        now.setMonth(monthsAgo);
        return now.getTime(now);
    },
    daysAgoInMilliseconds: function(days) {
        return this.hoursAgoInMilliseconds(days * 24);
    },
    hoursAgoInMilliseconds: function(hours) {
        return this.minutesAgoInMilliseconds(hours * 60);
    },
    minutesAgoInMilliseconds: function(minutes) {
        return this.secondsAgoInMilliseconds(minutes * 60);
    },
    secondsAgoInMilliseconds: function(seconds) {
        return new Date().getTime() - (seconds * 1000);
    },
    getUserValue: function(term) {
        if (typeof g_form == "undefined")
            return '';
        var userValue = g_form.getValue(term.field + ".storage") + '';
        if (userValue)
            return g_form.getDecimalValue(term.field + ".storage");
        var uv = g_form.getValue(term.field);
        if (!uv || uv.length == 0)
            return '';
        return g_form.getDecimalValue(term.field);
    },
    runActions: function(result) {
        if (result == this.lastResult) {
            this.debug("No change - not running any actions");
            return;
        }
        this.lastResult = result;
        if (result) {
            for (var i = 0; i < this.fp.actions.length; i++) {
                var action = this.fp.actions[i];
                if (action.disabled == "true") {
                    var elem = gel('ni.' + action.name);
                    if (elem && elem.getAttribute('role_read_only') == "true")
                        action.disabled = "ignore";
                }
                this._runAction(action, result);
            }
            this.scriptRun = true;
            this._runScript(this.fp.script_true)
        } else if (this.fp.reverse) {
            for (var i = 0; i < this.fp.actions.length; i++) {
                var action = this.fp.actions[i];
                if (action.disabled == "true") {
                    var elem = gel('ni.' + action.name);
                    if (elem && elem.getAttribute('role_read_only') == "true")
                        action.disabled = "ignore";
                }
                this._runAction(action, result);
            }
            this.scriptRun = false;
            this._runScript(this.fp.script_false)
        }
    },
    _runScript: function(script) {
        if (!script || script == "null")
            return;
        eval(script + "()");
    },
    _runAction: function(action, result) {
        if (typeof g_form == "undefined")
            return;
        var field = action.name;
        mandatory = action.mandatory;
        visible = action.visible;
        disabled = action.disabled;
        var mappingField = this._getVariableMappingField(field);
        if (mappingField) {
            var uiPolicyActions = {
                mandatory: mandatory,
                visible: visible,
                disabled: disabled,
                result: result
            };
            CustomEvent.fire("sys_mapping.ui_policy_action_fired::" + field, uiPolicyActions);
        }
        if (mandatory == 'true') {
            g_form.setMandatory(field, result);
            this._debugAction(field, "mandatory", result);
        } else if (mandatory == 'false') {
            g_form.setMandatory(field, !result);
            this._debugAction(field, "mandatory", !result);
        }
        if (visible == 'true') {
            g_form.setDisplay(field, result);
            this._debugAction(field, "visible", result);
        } else if (visible == 'false') {
            g_form.setDisplay(field, !result);
            this._debugAction(field, "visible", !result);
        }
        if (disabled == 'true') {
            g_form.setReadonly(field, result);
            this._debugAction(field, "disabled", result);
        } else if (disabled == 'false') {
            g_form.setReadonly(field, !result);
            this._debugAction(field, "disabled", !result);
        }
        if (mandatory == 'true') {
            opticsLog(this.tableName, field, "Setting Mandatory again");
            g_form.setMandatory(field, result);
            this._debugAction(field, "mandatory", result);
        }
    },
    _getVariableMappingField: function(fieldName) {
        for (var i = 0; i < g_form.elements.length; i++) {
            var element = g_form.elements[i];
            if (!element.supportsMapping)
                continue;
            var elementFieldName = element.tableName + '.' + element.fieldName;
            if (element.fieldName !== fieldName)
                continue;
            var mappingField = 'sys_mapping.' + elementFieldName;
            if (this._isMappingField(mappingField)) {
                return mappingField;
            }
        }
    },
    _isMappingField: function(fieldName) {
        var mappingField = gel(fieldName);
        return mappingField && mappingField !== '';
    },
    _parseDurationValue: function(value) {
        var valueParts = GlideDuration.parseDurationToParts(value);
        return valueParts.shift() + ' ' + valueParts.join(':');
    },
    _debugTerm: function(term, result) {
        if (this.debugFlag) {
            var userValue = !term.field ? "(null)" : (g_form.getValue(term.field) + '') || "<blank>";
            var dspValue = '';
            if (term.type == "reference") {
                var fieldObj = g_form.getDisplayBox(term.field);
                if (fieldObj)
                    dspValue = " [" + fieldObj.value + "] ";
            }
            var prefix = term.or ? ">  or " : "> ";
            var field = term.field;
            if (field.startsWith("IO:") && g_form.getAppliedFieldName)
                field = g_form.getAppliedFieldName(field);
            field = field + "\'s ";
            if (term.type == "__preevaluated__") {
                var value = "";
                var operation = "pre-evaluated condition ";
            } else {
                var value = "value of  \"" + userValue + dspValue + "\" ";
                var operation = "with the condition( " + term.oper + " " + term.value + ") ";
            }
            var result = "evaluates to " + result.toString().toUpperCase();
            this.debug(prefix + field + value + operation + result);
        }
    },
    _getFields: function() {
        if (typeof g_form == "undefined")
            return;
        var cf = this.fp.condition_fields;
        var maxi = this.fp.conditions.length;
        for (var i = 0; i < maxi; i++) {
            var condition = this.fp.conditions[i];
            if (condition.type != '__preevaluated__' && this._isField2FieldComparisonlOper(condition.oper))
                cf.push(condition.value.split('@')[0]);
        }
        for (var i = 0; i < cf.length; i++) {
            var field = cf[i];
            var e = g_form.getControl(field);
            if (!e)
                e = this._getFormVariableControl(field);
            if (e) {
                var tableName = "";
                var tableNameEvent = "";
                var tableNameField = "";
                if (!field.startsWith("IO:") && !field.startsWith("ni.VE") &&
                    !field.startsWith("ni.QS") && !field.startsWith("variables.")) {
                    tableName = g_form.getTableName();
                    tableNameEvent = tableName + "_";
                    tableNameField = tableName + ".";
                }
                var h = new GlideEventHandler("onChange_" + tableNameEvent + this._fixFieldName(field),
                    this._onFieldChange.bind(this),
                    tableNameField + field);
                g_event_handlers.push(h);
            }
        }
    },
    _isField2FieldComparisonlOper: function(oper) {
        var special = [
            "MORETHAN",
            "LESSTHAN",
            "GT_FIELD",
            "LT_FIELD",
            "GT_OR_EQUALS_FIELD",
            "LT_OR_EQUALS_FIELD",
            "SAMEAS",
            "NSAMEAS"
        ];
        return special.indexOf(oper) > -1;
    },
    _fixFieldName: function(fieldName) {
        var newName = fieldName.replace('\.', '_');
        return newName.replace(':', '_');
    },
    _getFormVariableControl: function(prettyName) {
        if (!prettyName.startsWith("variables."))
            return null;
        prettyName = prettyName.substr(prettyName.indexOf(".") + 1);
        var realName = g_form.resolveNameMap(prettyName);
        e = g_form.getControl(realName);
        if (!e)
            e = g_form.getControl("ni.VE" + realName);
        if (!e)
            e = g_form.getControl("ni.QS" + realName.substring(3));
        return e;
    },
    _onFieldChange: function(control, oldVal, newVal, onLoad) {
        if (onLoad)
            return;
        this.runPolicy();
    },
    _debugAction: function(field, action, flag) {
        if (field && field.startsWith("IO:") && g_form.getAppliedFieldName) {
            field = g_form.getAppliedFieldName(field);
        }
        var message = 'Setting \"' + action + '\" to \"' + flag + '\" on \"' + field + '\" field';
        if (this.debugFlag)
            this.debug(message);
    },
    debug: function(msg) {
        if (this.debugFlag)
            jslog(" " + this.className + ":   " + msg);
    }
}
var uiPolicies = [];

function ui_policy_onLoad() {
    var sw = new StopWatch();
    if (g_ui_policy && g_ui_policy.length)
        for (var i = 0; i < g_ui_policy.length; i++) {
            var fp = new GlideFieldPolicy(g_ui_policy[i]);
            uiPolicies.push(fp);
            var __ptmr = new Date();
            uiPolicies[i].runPolicyOnLoad();
            if (uiPolicies[i].scriptRun != null) {
                CustomEvent.fire('page_timing', {
                    name: 'UIOL',
                    child: {
                        description: uiPolicies[i].description,
                        type: uiPolicies[i].scriptRun,
                        sys_id: uiPolicies[i].sys_id,
                        source_table: uiPolicies[i].source_table
                    },
                    startTime: __ptmr,
                    win: window
                });
            }
        }
    sw.jslog("ui_policy loaded");
    CustomEvent.fire("ui_policy.loaded");
}

function ui_policy_add(policy) {
    if (typeof g_ui_policy == "undefined") {
        g_ui_policy = policy;
        return;
    }
    for (var i = 0; i < policy.length; i++)
        g_ui_policy.push(policy[i]);
};