/*! RESOURCE: /scripts/classes/GlideFilterDate.js */
var GlideFilterDate = Class.create(GlideFilterHandler, {
  SYS_DATE_FORMAT: "yyyy-MM-dd",
  SYS_TIME_FORMAT: "HH:mm:ss",
  SYS_DATE_TIME_FORMAT: "yyyy-MM-dd HH:mm:ss",
  _setup: function(values) {
    this.maxValues = 4;
    this.listenForOperChange = true;
    this.userDateFormat = g_user_date_format;
    this.userTimeFormat = g_user_date_time_format.substring(g_user_date_format.length + 1);
    this.userDateTimeFormat = g_user_date_time_format;
    this.id = "GwtGFD_" + guid();
    this.allowTime = this.item.isDateTime();
  },
  _build: function() {
    this.ANDMSG = getMessage('and');
    this.FROMMSG = getMessage('from');
    this.ASMSG = getMessage('as');
    clearNodes(this.tr.tdValue);
    this.inputCnt = 0;
    if (this._isEmptyOper())
      return;
    var oper = this._getOperator();
    if (this.prevOper && (this.prevOper != oper))
      this._clearValues();
    switch (oper) {
      case 'SAMEAS':
      case 'NSAMEAS':
        if (this.getFilterClass() != "GlideTemplateFilter") {
          this._addDateSelect("1", sysvalues['calendar']['TRENDVALUES_WITH_FIELDS'], this.values[1], [1]);
          var span = cel("span", this.tr.tdValue);
          span.style.marginLeft = "3px";
          span.style.marginRight = "5px";
          if (oper == 'SAMEAS')
            span.innerHTML = this.ASMSG;
          else
            span.innerHTML = this.FROMMSG;
        }
        this._populateRightOperandChoices();
        break;
      case '=':
        var input = this._addCalendar("1");
        this.inputs = [input];
        input.type = "text";
        input.value = (this.values[0].indexOf("{{") !== -1 ? "" : this.values[0]);
        input.id = this.id + "_input_1";
        input.allowTime = this.allowTime
        this.inputCnt = 1;
        break;
      case '!=':
      case 'ON':
      case 'NOTON':
        var val = this.values[0];
        if (val)
          val += "@" + this.values[1] + "@" + this.values[2];
        this._addDateChoices("1", val, [0, 1, 2], false);
        break;
      case '<':
      case '>=':
        var pos = 1;
        this._addDateChoices("1", this.values[0], [pos], this.allowTime, 'start');
        break;
      case '>':
      case '<=':
        var pos = 3;
        this._addDateChoices("1", this.values[0], [pos], this.allowTime, 'end');
        break;
      case 'BETWEEN':
        this._addDateChoices("1", this.values[0], [1], this.allowTime, 'start');
        var span = cel("span", this.tr.tdValue);
        span.style.marginLeft = "3px";
        span.style.marginRight = "5px";
        span.className = "filter-inline-label";
        span.innerHTML = this.ANDMSG;
        this._addDateChoices("2", this.values[1], [3], this.allowTime, 'end');
        this.initBetweenMapping(this.values[0], this.values[1]);
        break;
      case 'DATEPART':
        var trendOper = "EE";
        if (this.values[1]) {
          var parts = this.values[1].split(",");
          if (parts.length == 3)
            trendOper = parts[2].substring(1, 3);
        }
        this._addDateSelect("1", sysvalues['calendar']['RELATIVE'], trendOper, [1]);
        this._addDateSelect("2", sysvalues['calendar']['DATEPART'], this.values[0], [0]);
        break;
      case 'RELATIVE':
        this._addDateSelect("1", sysvalues['calendar']['RELATIVE'], this.values[0], [1]);
        var input = this._addTextInput();
        input.value = this.values[3];
        input.style.width = "30px";
        input.maxLength = 5;
        this._addDateSelect("2", sysvalues['calendar']['TRENDVALUES'], this.values[1], [1]);
        this._addDateSelect("3", sysvalues['calendar']['WHEN'], this.values[2], [1]);
        break;
      case 'MORETHAN':
      case 'LESSTHAN':
        var input = this._addTextInput();
        if (null == this.values[3] || "" == this.values[3])
          this.values[3] = 0;
        if (isMSIE)
          input.style.marginTop = "-1px";
        input.value = this.values[3];
        input.style.width = "30px";
        input.style.marginRight = "2px";
        input.maxLength = 2;
        this._addDateSelect("2", sysvalues['calendar']['TRENDVALUES_WITH_FIELDS_PLURIAL'], this.values[1], [1]);
        this._addDateSelect("3", sysvalues['calendar']['WHEN_WITH_FIELDS'], this.values[2], [1]);
        this._populateRightOperandChoices();
        break;
      case 'SINCE':
        var s = this._addSelect(this.width, this.multi, this.size);
        s.style.marginRight = "3px";
        s.id = this.id + "_select_1";
        var base = new GlideRecord('cmdb_baseline');
        base.addOrderBy('name');
        base.query();
        while (base.next()) {
          var selected = false;
          var value = "javascript:getBaseFilter('" + base.name + "')";
          if (value == this.values[0])
            selected = true;
          var o = addOption(s, value, base.name, selected);
        }
        break;
      case 'ANYTHING':
        break;
    }
    this.prevOper = oper;
    if (notOneOf('BETWEEN ANYTHING RELATIVE SINCE MORETHAN LESSTHAN SAMEAS NSAMEAS DATEPART')) {
      this.initAlphaMapping(this.values[0]);
    }

    function notOneOf(str) {
      return str.split(' ').indexOf(oper) == -1;
    }
  },
  getValues: function() {
    if (this.inputCnt == 0)
      return "";
    for (var i = 0; i < this.maxValues; i++)
      this.values[i] = this._getInputValue(this.inputs[i]);
    if (this.supportsMapping) {
      if (this._getOperator() == 'BETWEEN') {
        var $td = $j(this.tr.tdValue);
        var $in1 = $td.find('#em_input_1');
        var $in2 = $td.find('#em_input_2');
        if ($in1.val() || $in2.val()) {
          return (
            ($in1.val() || this._getDateGenerate(this._convertDate(this.values[0]), 'start')) +
            "@" +
            ($in2.val() || this._getDateGenerate(this._convertDate(this.values[1]), 'end'))
          );
        }
      } else {
        var gemVal = $j(this.tr.tdValue).find('#em_input_1').val();
        if (gemVal) {
          return gemVal;
        }
      }
    }
    switch (this._getOperator()) {
      case 'ON':
      case 'NOTON':
        if (this.values[0].indexOf('@') != -1)
          return this.values[0];
        var value = this._convertDate(this.values[0]);
        return value + "@" + this._getDateGenerate(value, 'start') + "@" + this._getDateGenerate(value, 'end');
      case '<':
      case '<=':
        var value = this._convertDate(this.values[0]);
        return this._getDateGenerate(value, 'start');
      case '>':
      case '>=':
        var value = this._convertDate(this.values[0]);
        return this._getDateGenerate(value, 'end');
      case 'BETWEEN':
        var start = this._convertDate(this.values[0]);
        start = this._getDateGenerate(start, 'start');
        var end = this._convertDate(this.values[1]);
        end = this._getDateGenerate(end, 'end');
        return start + "@" + end;
      case 'DATEPART':
        var trendOper = this.values[0];
        var datePart = this.values[1];
        var values = sysvalues['calendar']['DATEPART'];
        for (var i = 0; i < values.length; i++) {
          if (datePart == values[i][0]) {
            datePart = values[i][1];
            break;
          }
        }
        datePart = datePart.split(")")[0] + ",'" + trendOper + "')";
        return this.values[1] + "@" + datePart;
        break;
      case '=':
      case '!=':
        return this.values[0];
        break;
      case 'RELATIVE':
        return this.values[0] + "@" + this.values[2] + "@" + this.values[3] + "@" + this.values[1];
        break;
      case 'SAMEAS':
      case 'NSAMEAS':
        if (this.values[1] == "")
          return this.values[0];
        return this.values[1] + "@" + this.values[0];
        break;
      case 'MORETHAN':
      case 'LESSTHAN':
        if (isNaN(this.values[0]))
          this.values[0] = 0;
        return this.values[3] + "@" + this.values[1] + "@" + this.values[2] + "@" + this.values[0];
        break;
      case 'SINCE':
        return this.values[0];
        break;
      case 'ANYTHING':
        return "";
        break;
      default:
        if (this.inputCnt == 1)
          return this.values[0];
        else
          return this.values.join("@");
    }
  },
  _addDateSelect: function(id, values, matchValue, positions, dynamicOptions) {
    var s = this._addSelect(this.width, this.multi, this.size);
    s.style.marginRight = "3px";
    s.id = this.id + "_select_" + id;
    this._addDateSelectOptions(s, values, matchValue, positions);
    if (dynamicOptions)
      this._addDateSelectOptions(s, dynamicOptions, matchValue, positions);
    return s;
  },
  _addDateSelectOptions: function(select, values, matchValue, positions) {
    if (!values)
      return;
    var map = getMessages(buildMap(values, 0));
    var previousValue = null;
    for (var i = 0; i < values.length; i++) {
      var option = values[i];
      var value = "";
      for (var pos = 0; pos < positions.length; pos++) {
        if (pos > 0)
          value += "@";
        value += option[positions[pos]];
      }
      if (previousValue == null || previousValue != value)
        addOption(select, value, map[option[0]], value == matchValue);
      previousValue = value;
    }
  },
  _addDateChoices: function(id, matchValue, positions, allowTime, defaultTime) {
    var dynamicOptions = this._getDynamicCalendarOption();
    var select = this._addDateSelect(id, sysvalues['calendar'], matchValue, positions, dynamicOptions);
    this._addDatePicker(id, select, matchValue, allowTime, defaultTime);
  },
  _getDynamicCalendarOption: function() {
    if (typeof g_dynamic_filter_options_calendar == 'undefined' || g_dynamic_filter_options_calendar == '')
      return [];
    var dynamicOptions = [];
    var items = g_dynamic_filter_options_calendar.split('##');
    for (var i = 0; i < items.length; i++) {
      if (items[i].length <= 0)
        continue;
      var option = items[i].split('::');
      dynamicOptions.push(option);
    }
    return dynamicOptions;
  },
  _addDatePicker: function(id, select, value, allowTime, defaultTime) {
    var found = (select.selectedIndex != -1);
    if ((select.selectedIndex == 0) && (value) && (value != select.options[0].value))
      found = false;
    if (!found) {
      value = this._getDateFromValue(value);
      addOption(select, value, value, true);
    }
    select.allowTime = allowTime;
    select.defaultTime = defaultTime;
    this._addCalendar(id);
  },
  _addCalendar: function(id) {
    var chooseDate = getMessage('Choose date...');
    if (document.documentElement.getAttribute('data-doctype') == 'true') {
      var input = addTextInput(this.tr.tdValue, "", "hidden");
      var cal = cel("button", this.tr.tdValue);
      cal.id = "cal_" + id;
      cal.name = cal.id;
      cal.alt = chooseDate;
      cal.title = chooseDate;
      cal.onclick = this._calendarPopup.bind(this, id, cal);
      cal.style.marginRight = "1px";
      cal.style.verticalAlign = "top";
      cal.className = "btn btn-default icon-calendar";
      input.id = this.id + "_input_" + id;
      input.onchange = this._dateTimeComplete.bind(this, id);
    } else {
      var cal = cel("img", this.tr.tdValue);
      cal.id = "cal_" + id;
      cal.name = cal.id;
      cal.src = "images/small_calendar.gifx";
      cal.alt = chooseDate;
      cal.title = chooseDate;
      cal.onclick = this._calendarPopup.bind(this, id);
      cal.style.marginLeft = "2px";
      cal.className = "button";
      var input = addTextInput(this.tr.tdValue, "", "hidden");
      input.id = this.id + "_input_" + id;
      input.onchange = this._dateTimeComplete.bind(this, id);
    }
    return input;
  },
  _getDateFromValue: function(value) {
    var value = value.split("@")[0];
    var prefixString = "javascript:gs.dateGenerate(";
    if (value.indexOf(prefixString) == 0) {
      var parts = value.split("'");
      if (parts.length == 5) {
        value = parts[1];
        if (isDate(parts[3], this.SYS_TIME_FORMAT)) {
          var dt = getDateFromFormat(parts[3], this.SYS_TIME_FORMAT);
          value += " " + formatDate(new Date(dt), this.SYS_TIME_FORMAT);
        }
      }
    }
    if (isDate(value, this.SYS_DATE_TIME_FORMAT)) {
      var dt = getDateFromFormat(value, this.SYS_DATE_TIME_FORMAT);
      value = formatDate(new Date(dt), this.userDateTimeFormat);
    } else if (isDate(value, this.SYS_DATE_FORMAT)) {
      var dt = getDateFromFormat(value, this.SYS_DATE_FORMAT);
      value = formatDate(new Date(dt), this.userDateFormat);
    }
    return value;
  },
  _getDateGenerate: function(value, tag) {
    if (value.indexOf("javascript:") != -1)
      return value;
    if (isDate(value, this.SYS_DATE_TIME_FORMAT)) {
      var dt = getDateFromFormat(value, this.SYS_DATE_TIME_FORMAT);
      value = formatDate(new Date(dt), this.SYS_DATE_FORMAT);
      tag = formatDate(new Date(dt), this.SYS_TIME_FORMAT);
    }
    return "javascript:gs.dateGenerate('" + value + "','" + tag + "')";
  },
  _convertDate: function(value) {
    if (value.indexOf("javascript:") != -1)
      return value;
    if (isDate(value, this.userDateTimeFormat)) {
      var dt = getDateFromFormat(value, this.userDateTimeFormat);
      value = formatDate(new Date(dt), this.SYS_DATE_TIME_FORMAT);
    } else if (isDate(value, this.userDateFormat)) {
      var dt = getDateFromFormat(value, this.userDateFormat);
      value = formatDate(new Date(dt), this.SYS_DATE_FORMAT);
    }
    return value;
  },
  _calendarPopup: function(id, btn) {
    var select = gel(this.id + "_select_" + id);
    var currentDate = '';
    var defaultTime = "start";
    var allowTime = this.allowTime;
    if (select) {
      if (select && select.value.indexOf('javascript') == -1)
        currentDate = select.value;
      defaultTime = select.defaultTime
      allowTime = select.allowTime;
    }
    var format;
    if (allowTime) {
      format = this.userDateTimeFormat;
      if (!isDate(currentDate, format)) {
        var dt = new Date();
        if (isDate(currentDate, this.userDateFormat))
          dt = new Date(getDateFromFormat(currentDate, this.userDateFormat));
        if (defaultTime == 'end')
          dt.setHours(23, 59, 59);
        else
          dt.setHours(0, 0, 0);
        currentDate = formatDate(dt, this.userDateTimeFormat);
      }
    } else {
      format = this.userDateFormat;
    }
    var input = gel(this.id + "_input_" + id);
    input.value = currentDate;
    ScriptLoader.getScripts('scripts/classes/GwtDateTimePicker.js', function() {
      new GwtDateTimePicker(input.id, format, allowTime, select || input);
    })
    return false;
  },
  _dateTimeComplete: function(id) {
    var select = gel(this.id + "_select_" + id);
    var input = gel(this.id + "_input_" + id);
    if (!select)
      return;
    var option = select.options[select.selectedIndex];
    var value = option.value;
    if (isDate(value, this.userDateFormat) || isDate(value, this.userDateTimeFormat)) {
      option.value = input.value;
      option.text = input.value;
    } else
      addOption(select, input.value, input.value, true);
  },
  initBetweenMapping: function(value1, value2) {
    if (!window.$j)
      return;
    var $td = $j(this.tr.tdValue);
    var $btn1 = this.emTemplate.makeBtn();
    var $field1 = this.emTemplate.makeField();
    var $input1 = this.emTemplate.makeInput('em_input_1', value1);
    var $nativeInput1 = $j(this.inputs[0]);
    var $dateBtn = $td.find('#cal_1');
    $dateBtn.after($btn1);
    $dateBtn.after($field1);
    $dateBtn.after($input1);
    this._initMappingComponent($field1, $btn1, {
      glideType: 'calendar',
      isMultiText: false,
      originalMapping: value1.indexOf("{{") !== -1 ? value1 : "",
      parent: {
        show: function() {
          $td.find('#cal_1, select[id*="_select_1"]').show();
        },
        hide: function() {
          $td.find('#cal_1, select[id*="_select_1"]').hide();
        },
        onValue: function(msg) {
          var value = msg.wrappedValue;
          $input1.val(value);
          if (value.indexOf("{{") == -1) {
            $nativeInput1.val($nativeInput1.find("option:first").val());
          }
        }
      }
    });
    var $btn2 = this.emTemplate.makeBtn();
    var $field2 = this.emTemplate.makeField();
    var $input2 = this.emTemplate.makeInput('em_input_2', value2);
    var $nativeInput2 = $j(this.inputs[1]);
    $btn2.css({
      "margin-right": "90px"
    })
    $td.append($input2);
    $td.append($field2);
    $td.append($btn2);
    this._initMappingComponent($field2, $btn2, {
      glideType: 'calendar',
      isMultiText: false,
      originalMapping: value2.indexOf("{{") !== -1 ? value2 : "",
      parent: {
        show: function() {
          $td.find('#cal_2, select[id*="_select_2"]').show();
        },
        hide: function() {
          $td.find('#cal_2, select[id*="_select_2"]').hide();
        },
        onValue: function(msg) {
          var value = msg.wrappedValue;
          $input2.val(value);
          if (value.indexOf("{{") == -1) {
            $nativeInput2.val($nativeInput2.find("option:first").val());
          }
        }
      }
    });
    $j(this.tr.tdValue)[this.supportsMapping ? 'removeClass' : 'addClass']("gem-unsupported");
    this._removePlaceholderBtn();
  },
  initAlphaMapping: function(value) {
    if (!window.$j)
      return;
    value = value.indexOf("{{") !== -1 ? value : "";
    var $td = $j(this.tr.tdValue);
    var $btn = this.emTemplate.makeBtn();
    var $field = this.emTemplate.makeField();
    var $input = this.emTemplate.makeInput('em_input_1', value);
    $td.append($field).append($btn).append($input);
    var $nativeInput = $j(this.inputs[0]);
    var oper = this._getOperator();
    this._initMappingComponent($field, $btn, {
      glideType: 'calendar',
      isMultiText: false,
      originalMapping: value.indexOf("{{") !== -1 ? value : "",
      parent: {
        show: function() {
          $td.find('#cal_1, select[id*="_select_1"]').show();
          if (oper == "=")
            $td.find('input[id*="_input_1"]').show();
        },
        hide: function() {
          $td.find('#cal_1, select[id*="_select_1"]').hide();
          if (oper == "=")
            $td.find('input[id*="_input_1"]').hide();
        },
        onValue: function(msg) {
          var value = msg.wrappedValue;
          $input.val(value);
          if (value.indexOf("{{") == -1) {
            $nativeInput.val($nativeInput.find("option:first").val());
          }
        }
      }
    });
    $j(this.tr.tdValue)[this.supportsMapping ? 'removeClass' : 'addClass']("gem-unsupported");
    this._removePlaceholderBtn();
  },
  _removePlaceholderBtn: function() {
    $j(this.tr.tdMapping).html("")
  },
  emTemplate: {
    makeBtn: function() {
      return $j(
        '<button role="button" class="btn btn-default em-field-toggle em-alt-btn em-icon-em gem-unsupported-target" ' +
        'title="Set date from a contextual value"' +
        'style="vertical-align: top;">' +
        '</button>'
      );
    },
    makeField: function() {
      return $j(
        '<em-alt-input class="hidden gem-unsupported-target"></em-alt-input>'
      );
    },
    makeInput: function(id, value) {
      var x = $j('<input type="hidden" id="' + id + '">');
      x.val(value || "");
      return x;
    }
  },
  _initMappingComponent: function($field, $btn, opts) {
    if (window.g_elementMappingMgr) {
      g_elementMappingMgr.initSubField($field, $btn, this.mappingId, opts)
    }
  },
  initMappingSupport: function(shouldEnable, type, mappingMgr) {
    var td = this.tr.tdMapping;
    if (!td || !mappingMgr)
      return;
    this.mappingType = type;
    this.supportsMapping = !!shouldEnable;
    $j(this.tr.tdValue)[this.supportsMapping ? 'removeClass' : 'addClass']("gem-unsupported");
  },
  destroyMappingSupport: function() {},
  activateMapping: function() {},
  deactivateMapping: function() {},
  _initMappingValue: function(value) {},
  type: 'GlideFilterDate'
});;