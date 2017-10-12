/*! RESOURCE: /scripts/sn/common/clientScript/angular/uiPolicyFactory.js */
angular.module('sn.common.clientScript').factory('uiPolicyFactory', function($window) {
  var factory = $window.uiPolicyFactory;
  return factory;
});; function createUiPolicy(g_form, uiPolicyMap, scripts) {
    var _tableName = uiPolicyMap.table;
    var _description = uiPolicyMap.short_description;
    var _onLoad = uiPolicyMap.onload;
    var _fields = uiPolicyMap.condition_fields;
    var _conditions = uiPolicyMap.conditions;
    var _watchFields = {};
    var _lastResult = null;
    var _isDebug = false;
    initializePolicy();

    function initializePolicy() {
      _fields.forEach(function(field, i) {
        var condition = _conditions[i];
        _watchFields[field] = true;
        if (_isField2FieldComparisonlOper(condition.oper)) {
          var field2 = condition.value.split('@')[0];
          _watchFields[field2] = true;
        }
      });
      g_form.$private.events.on('change', onChangeForm);
      if (_onLoad) {
        runPolicy();
      }
    }

    function onChangeForm(fieldName, oldValue, newValue) {
      if (_watchFields[fieldName]) {
        runPolicy();
      }
    }

    function runPolicy() {
      _debug("Running policy on table: " + _tableName + " " + _description);
      runActions(!!evaluateCondition());
    }

    function evaluateCondition() {
      _debug("--->>> Evaluating condition:");
      var result = "?";
      var conditionResult = true;
      var terms = _conditions;
      for (var i = 0; i < terms.length; i++) {
        var t = terms[i];
        if (t.newquery) {
          if (result == "t") {
            _debug("---<<< condition exited with: TRUE");
            return true;
          } else {
            _debug(" OR (next condition)");
            conditionResult = true;
          }
        }
        if (!conditionResult)
          continue;
        if (t.or) {
          if (result != "t")
            result = _evaluateTermTF(t);
        } else {
          if ((result == "f") && (!t.newquery)) {
            conditionResult = false;
          } else {
            result = _evaluateTermTF(t);
          }
        }
      }
      var response = result != "f";
      _debug("---<<< End evaluating condition with result: " + response);
      return response;
    }

    function _evaluateTermTF(term) {
      var result = evaluateTerm(term);
      _debugTerm(term, result);
      if (result)
        return "t";
      else
        return "f";
    }

    function evaluateTerm(term) {
      var type = term.type;
      if (uiPolicyTypes.dateTypes[type])
        return evaluateTermDate(term);
      if (uiPolicyTypes.numberTypes[type] || uiPolicyTypes.currencyTypes[type])
        return evaluateTermNumber(term);
      var field = term.field;
      if (!field)
        return false;
      var oper = term.oper;
      var value = term.value;
      var userValue = g_form.getValue(field) + '';
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
          return userValue && (_inArray(userValue, values) !== -1);
        case 'NOT IN':
          var values2 = value.split(',');
          return _inArray(userValue, values2) === -1;
        case 'STARTSWITH':
          if (type == 'reference')
            userValue = g_form.getDisplayValue(field);
          return userValue.indexOf(value) === 0;
        case 'ENDSWITH':
          if (type == 'reference')
            userValue = g_form.getDisplayValue(field);
          return userValue.lastIndexOf(value) == userValue.length - value.length;
        case 'LIKE':
          if (type == 'reference')
            userValue = g_form.getDisplayValue(field);
          return userValue.indexOf(value) != -1;
        case 'NOT LIKE':
          if (type == 'reference')
            userValue = g_form.getDisplayValue(field);
          return userValue.indexOf(value) == -1;
        case 'ISEMPTY':
          return userValue === '';
        case 'ISNOTEMPTY':
          return userValue !== '';
        case 'BETWEEN':
          var values3 = value.split('@');
          return userValue && userValue >= values3[0] && userValue <= values3[1];
        case 'SAMEAS':
          userValue = (type == 'reference') ? g_form.getDisplayValue(term.field) : g_form.getValue(term.field);
          value = (type == 'reference') ? g_form.getDisplayValue(term.value) : g_form.getValue(term.value);
          return userValue == value;
        case 'NSAMEAS':
          userValue = (type == 'reference') ? g_form.getDisplayValue(term.field) : g_form.getValue(term.field);
          value = (type == 'reference') ? g_form.getDisplayValue(term.value) : g_form.getValue(term.value);
          return userValue != value;
        default:
          return false;
      }
    }

    function evaluateTermNumber(term) {
      var field = term.field;
      if (!field)
        return false;
      var oper = term.oper;
      var value = term.value;
      if (value !== '' && value.indexOf(',') === -1)
        value = parseFloat(value);
      var userValue = getUserValue(term);
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
          return userValue.toString() && (_inArray(userValue.toString(), values) !== -1);
        case 'NOT IN':
          var values2 = (value + "").split(',');
          return _inArray(userValue.toString(), values2) === -1;
        case 'ISEMPTY':
          return userValue.toString() === '';
        case 'ISNOTEMPTY':
          return userValue.toString() !== '';
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
    }

    function evaluateTermDate(term) {
      var value = term.value;
      var userValue = g_form.getValue(term.field) + '';
      var values = value.split('@');
      var isDateTime = uiPolicyTypes.dateTypes[term.type] == "datetime";
      if (!isDateTime)
        userValue += " 00:00:00";
      if (term.oper == 'ISEMPTY')
        return userValue === '';
      var userDate = _getDate(userValue);
      if (isNaN(userDate)) {
        _debug("evaluateTermDate - invalid date, returning false");
        return false;
      }
      if (term.oper == "RELATIVE")
        return _evaluateTermDateRelative(userDate, value, isDateTime);
      if (term.oper == "DATEPART")
        return _evaluateTermDateTrend(userDate, value);
      var valueDate, valueDate1, valueDate2;
      switch (term.oper) {
        case '=':
          return g_form.getValue(term.field) === value;
        case '!=':
          return g_form.getValue(term.field) != value;
        case 'ISNOTEMPTY':
          return userValue !== '';
        case '<=':
        case '<':
          valueDate = _getDate(value);
          return (valueDate !== 0) && (userDate < valueDate);
        case '>=':
        case '>':
          valueDate = _getDate(value);
          return (valueDate !== 0) && (userDate > valueDate);
        case 'ON':
          valueDate1 = _getDate(values[1]);
          valueDate2 = _getDate(values[2]);
          return (valueDate1 !== 0) && (valueDate2 !== 0) && (userDate >= valueDate1) && (userDate <= valueDate2);
        case 'NOTON':
          valueDate1 = _getDate(values[1]);
          valueDate2 = _getDate(values[2]);
          return (valueDate1 !== 0) && (valueDate2 !== 0) && ((userDate < valueDate1) || (userDate > valueDate2));
        case 'BETWEEN':
          valueDate1 = _getDate(values[0]);
          valueDate2 = _getDate(values[1]);
          return (valueDate1 !== 0) && (valueDate2 !== 0) && (userDate >= valueDate1) && (userDate <= valueDate2);
        case 'LESSTHAN':
          return _dateComparisonHelper(term.field, term.value, 'LT');
        case 'MORETHAN':
          return _dateComparisonHelper(term.field, term.value, 'GT');
        default:
          _debug("evaluateTermDate - unsupported operator '" + term.oper + "'. Returning FALSE.");
          return false;
      }
    }

    function _dateComparisonHelper(left, right, comparison) {
      var parsed = _parseField2FieldValue(right);
      var userValue = g_form.getValue(left);
      var value = g_form.getValue(parsed.fieldName);
      if (_isNullField(value) || _isNullField(userValue)) {
        _debug("ui policy could not find a valid field to compare against. Returning FALSE.");
        return false;
      }
      var userDate = _getDate(userValue);
      var theDate = _getDate(value);
      if (parsed.interval == 'quarter') {
        userDate = _roundDateToQuarter(userDate);
        theDate = _roundDateToQuarter(theDate);
      }
      var diff = userDate - theDate;
      if (parsed.beforeAfter == 'before' && diff > 0)
        return false;
      if (parsed.beforeAfter == 'after' && diff < 0)
        return false;
      var xDiff;
      if (parsed.interval == 'quarter') {
        var Qdiff = Math.abs(_getAbsQuarter(theDate) - _getAbsQuarter(userDate));
        xDiff = Qdiff - parsed.intervalValue;
      } else {
        var timeSpan = _getIntervalInMilliSeconds(parsed.interval, parsed.intervalValue);
        xDiff = Math.abs(diff) - Math.abs(timeSpan);
      }
      if (comparison === 'GT')
        return xDiff > 0;
      if (comparison === 'LT')
        return xDiff < 0;
    }

    function _getAbsQuarter(theDate) {
      var quarters = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4];
      var Q = quarters[theDate.getMonth()];
      var Y = theDate.getFullYear() * 4;
      return Y + Q;
    }

    function _roundDateToQuarter(theDate) {
      var quarters = [0, 0, 0, 3, 3, 3, 6, 6, 6, 9, 9, 9];
      var Q = quarters[theDate.getMonth()];
      var d = new Date();
      d.setFullYear(theDate.getFullYear(), Q, 0);
      d.setHours(0, 0, 0);
      return d;
    }

    function _isNullField(fieldValue) {
      return typeof fieldValue == 'undefined' || fieldValue == null || fieldValue == '';
    }

    function _parseField2FieldValue(daString) {
      var daArray = daString.split('@');
      return {
        fieldName: daArray[0],
        interval: daArray[1],
        intervalValue: parseInt(daArray[3], 10),
        beforeAfter: daArray[2]
      };
    }

    function _getIntervalInMilliSeconds(interval, value) {
      var ms = {};
      ms.hour = 1000 * 60 * 60;
      ms.day = ms.hour * 24;
      ms.week = ms.day * 7;
      ms.month = ms.day * 30;
      ms.year = ms.day * 365;
      return ms[interval] * value;
    }

    function _getDate(dateValue) {
      if (dateValue)
        dateValue = dateValue.replace(/\s/, 'T');
      return new Date(dateValue);
    }

    function _evaluateTermDateTrend(userDateMilliseconds, trendValueString) {
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
          checkVals = _trendDayOfWeek(userDate, trendValue, trendOper);
          break;
        case 'month':
          checkVals = _trendMonth(userDate, trendValue, trendOper);
          break;
        case 'year':
          checkVals = _trendYear(userDate, trendValue, trendOper);
          break;
        case 'week':
          checkVals = _trendWeek(userDate, trendValue, trendOper);
          break;
        case 'hour':
          checkVals = _trendHour(userDate, trendValue, trendOper);
          break;
        case 'quarter':
          checkVals = _trendQuarter(userDate, trendValue, trendOper);
          break;
        default:
          _debug("_evaluateTermDateTrend - unsupported trend type '" + trendType + "'. Returning FALSE.");
          return false;
      }
      return _evaluateDateValues(checkVals, trendOper);
    }

    function _evaluateTermDateRelative(userDateMilliseconds, relativeValueString, isDateTime) {
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
          relativeValueMilliseconds = hoursAgoInMilliseconds(modifier * termValue);
          break;
        case 'minute':
          relativeValueMilliseconds = minutesAgoInMilliseconds(modifier * termValue);
          break;
        case 'dayofweek':
          relativeValueMilliseconds = daysAgoInMilliseconds(modifier * termValue);
          break;
        case 'month':
          relativeValueMilliseconds = monthsAgoInMilliseconds(modifier * termValue);
          break;
        case 'quarter':
          relativeValueMilliseconds = quartersAgoInMilliseconds(modifier * termValue);
          break;
        case 'year':
          relativeValueMilliseconds = yearsAgoInMilliseconds(modifier * termValue);
          break;
        default:
          _debug("_evaluateTermDateRelative - unsupported type '" + termType + "'. Returning FALSE.");
          return false;
      }
      var checkVals;
      if (isDateTime) {
        checkVals = {
          checkValue: relativeValueMilliseconds,
          userValue: userDateMilliseconds
        };
      } else {
        checkVals = {
          checkValue: _removeTime(relativeValueMilliseconds),
          userValue: _removeTime(userDateMilliseconds)
        };
      }
      return _evaluateDateValues(checkVals, oper);
    }

    function _evaluateDateValues(checkVals, oper) {
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
          _debug("_evaluateDateValues - unsupported operator '" + oper + "'. Returning FALSE.");
          return false;
      }
    }

    function _removeTime(dateInMilliseconds) {
      var newDate = new Date(dateInMilliseconds);
      newDate.setHours(0);
      newDate.setMinutes(0);
      newDate.setSeconds(0);
      newDate.setMilliseconds(0);
      return newDate.getTime();
    }

    function _trendDayOfWeek(userDate, trendValue) {
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
    }

    function _trendMonth(userDate, trendValue) {
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
    }

    function _trendYear(userDate, trendValue) {
      return {
        checkValue: trendValue,
        userValue: userDate.getFullYear()
      };
    }

    function _trendHour(userDate, trendValue) {
      return {
        checkValue: trendValue,
        userValue: userDate.getHour()
      };
    }

    function _trendQuarter(userDate, trendValue) {
      var quarters = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4];
      return {
        checkValue: trendValue,
        userValue: quarters[userDate.getMonth()]
      };
    }

    function _trendWeek(userDate, trendValue) {
      var checkDate = new Date(userDate.getFullYear(), 0, 1);
      var userWeek = (Math.ceil((((userDate.getTime() - checkDate) / 86400000) + checkDate.getDay() + 1) / 7)) - 1;
      return {
        checkValue: trendValue,
        userValue: userWeek
      };
    }

    function quartersAgoInMilliseconds(quarters) {
      var now = new Date();
      var quartersModifier = [0, 1, 1, 1, 4, 4, 4, 7, 7, 7, 10, 10, 10];
      var month = now.getMonth() + 1;
      var quarterBegin = quartersModifier[month];
      var monthsBack = month - quarterBegin + (quarters * 3);
      return monthsAgoInMilliseconds(monthsBack);
    }

    function yearsAgoInMilliseconds(years) {
      var now = new Date();
      var yearsAgo = now.getFullYear() - years;
      now.setFullYear(yearsAgo);
      return now.getTime(now);
    }

    function monthsAgoInMilliseconds(months) {
      var now = new Date();
      var monthsAgo = now.getMonth() - months;
      now.setMonth(monthsAgo);
      return now.getTime(now);
    }

    function daysAgoInMilliseconds(days) {
      return hoursAgoInMilliseconds(days * 24);
    }

    function hoursAgoInMilliseconds(hours) {
      return minutesAgoInMilliseconds(hours * 60);
    }

    function minutesAgoInMilliseconds(minutes) {
      return secondsAgoInMilliseconds(minutes * 60);
    }

    function secondsAgoInMilliseconds(seconds) {
      return new Date().getTime() - (seconds * 1000);
    }

    function getUserValue(term) {
      if (typeof g_form == "undefined")
        return '';
      var userValue = g_form.getValue(term.field + ".storage") + '';
      if (userValue)
        return g_form.getDecimalValue(term.field + ".storage");
      var uv = g_form.getValue(term.field);
      if (!uv || uv.length === 0)
        return '';
      return g_form.getDecimalValue(term.field);
    }

    function runActions(result) {
      if (result === _lastResult) {
        _debug("No change - not running any actions");
        return;
      }
      _lastResult = result;
      if (result) {
        for (var i = 0; i < uiPolicyMap.actions.length; i++) {
          var action = uiPolicyMap.actions[i];
          _runAction(action, result);
        }
        _runScript(uiPolicyMap.script_true.name);
      } else if (uiPolicyMap.reverse) {
        for (var j = 0; j < uiPolicyMap.actions.length; j++) {
          var action2 = uiPolicyMap.actions[j];
          _runAction(action2, result);
        }
        _runScript(uiPolicyMap.script_false.name);
      }
    }

    function _runScript(name) {
      if (typeof name !== "string" || !name.length)
        return;
      try {
        scripts[name].execute();
      } catch (e) {
        console.log("UI policy script error: " + e);
      }
    }

    function _runAction(action, result) {
      if (typeof g_form == "undefined")
        return;
      var field = action.name,
        mandatory = action.mandatory,
        visible = action.visible,
        disabled = action.disabled;
      if (mandatory == 'true') {
        g_form.setMandatory(field, result);
        _debugAction(field, "mandatory", result);
      } else if (mandatory == 'false') {
        g_form.setMandatory(field, !result);
        _debugAction(field, "mandatory", !result);
      }
      if (visible == 'true') {
        g_form.setDisplay(field, result);
        _debugAction(field, "visible", result);
      } else if (visible == 'false') {
        g_form.setDisplay(field, !result);
        _debugAction(field, "visible", !result);
      }
      if (disabled == 'true') {
        g_form.setReadOnly(field, result);
        _debugAction(field, "disabled", result);
      } else if (disabled == 'false') {
        g_form.setReadOnly(field, !result);
        _debugAction(field, "disabled", !result);
      }
      if (mandatory == 'true') {
        g_form.setMandatory(field, result);
        _debugAction(field, "mandatory", result);
      }
    }

    function _isField2FieldComparisonlOper(oper) {
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
    }

    function _inArray(val, array) {
      if (Array.prototype.indexOf) {
        return Array.prototype.indexOf.call(array, val);
      }
      for (var i = 0, iM = array.length; i < iM; i++) {
        if (array[i] === val) {
          return i;
        }
      }
      return -1;
    }

    function _debugAction(field, action, flag) {
      if (!_isDebug) {
        return;
      }
      _debug('Setting ' + action + ' on field:' + field + ' to ' + flag);
    }

    function _debug(msg) {
      if (!_isDebug) {
        return;
      }
      console.log('(uiPolicyFactory)', msg);
    }

    function _debugTerm(term, result) {
      if (!_isDebug) {
        return;
      }
      var or = "";
      if (term.or)
        or = "  or ";
      var userValue;
      if (term.field)
        userValue = g_form.getValue(term.field) + '';
      else
        userValue = "(null)";
      if (!userValue)
        userValue = "<blank>";
      var dspValue = "";
      if (dspValue)
        dspValue = " [" + dspValue + "] ";
      if (result)
        result = "true";
      else
        result = "false";
      _debug(or + term.field + " " + "(" + userValue + dspValue + ") " + term.oper + " " + term.value + " -> " + result);
    }
  }
})(window);;