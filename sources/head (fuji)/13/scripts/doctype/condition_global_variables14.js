/*! RESOURCE: /scripts/doctype/condition_global_variables14.js */
var MAIN_LAYER = "filterdiv";
var TEXTQUERY = "123TEXTQUERY321";
var PLACEHOLDER = "123PLACEHOLDER321";
var PLACEHOLDERFIELD = '-- choose field --';
var DEFAULT_NAME = "report";
var DEFAULT_WIDTH = "10px";
var DEFAULT_BORDER = 0;
var JS_GS = 'javascript:gs.';
var useTextareas = false;
var noConditionals = false;
var noOps = false;
var noSort = false;
var gotShowRelated = false;
var gotoPart = false;
var calendars = 0;
var refcount = 0;
var sortIndex = 0;
var queryNumber = 0;
var calendarPopups = [];
var filter;
var orderBy;
var columns = null;
var currentTable = '';
var firstTable = '';
var oldStatus = '';
var showRelated = '';
var filterExpanded = false;
var queueTables = new Array();
var queueFilters = new Array();
var queueColumns = new Array();
var operators = [
  "BETWEEN",
  "!=",
  ">=",
  "<=",
  "=",
  ">",
  "<",
  "NOT IN",
  "IN",
  "NOT LIKE",
  "LIKE",
  "ON",
  "NOTON",
  "DATEPART",
  "RELATIVE",
  "STARTSWITH",
  "ENDSWITH",
  "EMPTYSTRING",
  "ISEMPTY",
  "ISNOTEMPTY",
  "INSTANCEOF",
  "ANYTHING",
  "VALCHANGES",
  "CHANGESFROM",
  "CHANGESTO",
  "MATCH_PAT",
  "MATCH_RGX",
  "SAMEAS",
  "NSAMEAS",
  "MORETHAN",
  "LESSTHAN",
  "DYNAMIC",
  "GT_FIELD",
  "LT_FIELD",
  "GT_OR_EQUALS_FIELD",
  "LT_OR_EQUALS_FIELD",
  "HASVARIABLE",
  "HASITEMVARIABLE",
  "HASQUESTION",
  "HASLABEL"
];
var fieldComparisonOperators = ["SAMEAS", "NSAMEAS", "MORETHAN", "LESSTHAN", "GT_FIELD", "LT_FIELD", "GT_OR_EQUALS_FIELD", "LT_OR_EQUALS_FIELD"];
var dateTypes = new Array();
dateTypes['glide_date_time'] = 1;
dateTypes['glide_date'] = 1;
dateTypes['date'] = 1;
dateTypes['datetime'] = 1;
dateTypes['due_date'] = 1;
var dateOnlyTypes = new Object();
dateOnlyTypes['glide_date'] = 1;
dateOnlyTypes['date'] = 1;
var dateTimeTypes = new Object();
dateTimeTypes['glide_date_time'] = 1;
dateTimeTypes['datetime'] = 1;
dateTimeTypes['due_date'] = 1;
var numericTypes = new Array();
numericTypes['integer'] = 1;
numericTypes['decimal'] = 1;
numericTypes['numeric'] = 1;
numericTypes['float'] = 1;
numericTypes['domain_number'] = 1;
numericTypes['auto_increment'] = 1;
var opersNS = {};
opersNS.opdef = {
  'af': ['>', 'after'],
  'ataf': ['>=', 'at or after'],
  'any': ['ANYTHING', 'is anything'],
  'are': ['=', 'are'],
  'asc': ['ascending', 'a to z'],
  'avg': ['avg', 'average'],
  'bf': ['<', 'before'],
  'atbf': ['<=', 'at or before'],
  'btw': ['BETWEEN', 'between'],
  'dsc': ['descending', 'z to a'],
  'dtpt': ['DATEPART', 'trend'],
  'em': ['ISEMPTY', 'is empty'],
  'es': ['EMPTYSTRING', 'is empty string'],
  'enwt': ['ENDSWITH', 'ends with'],
  'eq': ['=', 'is'],
  'eqd': ['DYNAMIC', 'is (dynamic)'],
  'fvc': ['VALCHANGES', 'changes'],
  'fvf': ['CHANGESFROM', 'changes from'],
  'fvt': ['CHANGESTO', 'changes to'],
  'gt': ['>', 'greater than'],
  'gteq': ['>=', 'greater than or is'],
  'inna': ['IN', 'is one of'],
  'inst': ['INSTANCEOF', 'is a'],
  'lk': ['LIKE', 'contains'],
  'lt': ['<', 'less than'],
  'lteq': ['<=', 'less than or is'],
  'max': ['max', 'maximum'],
  'min': ['min', 'minimum'],
  'mpat': ['MATCH_PAT', 'matches pattern'],
  'mreg': ['MATCH_RGX', 'matches regex'],
  'ntem': ['ISNOTEMPTY', 'is not empty'],
  'nteq': ['!=', 'is not'],
  'ntin': ['NOT IN', 'is not one of'],
  'ntlk': ['NOT LIKE', 'does not contain'],
  'nton': ['NOTON', 'not on'],
  'on': ['ON', 'on'],
  'oper': ['-- oper --', '-- oper --'],
  'rltv': ['RELATIVE', 'relative'],
  'saas': ['SAMEAS', 'is same'],
  'nsas': ['NSAMEAS', 'is different'],
  'snc': ['SINCE', 'since baseline'],
  'stwt': ['STARTSWITH', 'starts with'],
  'sum': ['sum', 'Total'],
  'date_more': ['MORETHAN', 'is more than'],
  'date_less': ['LESSTHAN', 'is less than'],
  'gtfd': ['GT_FIELD', 'greater than field'],
  'ltfd': ['LT_FIELD', 'less than field'],
  'gteqfd': ['GT_OR_EQUALS_FIELD', 'greater than or is field'],
  'lteqfd': ['LT_OR_EQUALS_FIELD', 'less than or is field']
};
opersNS.opdef_template = {
  'eq': ['=', 'To'],
  'saas': ['SAMEAS', 'Same as'],
  'eqd': ['DYNAMIC', 'To (dynamic)']
}
opersNS.compile = function(ops_input, opsdef) {
  for (var fieldType in ops_input) {
    var proto = ops_input[fieldType];
    if (proto.charAt(0) == '=')
      continue;
    var opers = proto.split(",");
    var opArray = [];
    for (var i = 0; i < opers.length; i++) {
      var oper = opers[i];
      if (oper)
        opArray.push(opsdef[oper]);
    }
    ops_input[fieldType] = opArray;
  }
  for (var fieldType in ops_input) {
    var proto = ops_input[fieldType];
    if (typeof proto != 'string')
      continue;
    ops_input[fieldType] = ops_input[proto.substring(1)];
  }
}
var sysopers = {
  'auto_increment': '=integer',
  'aggspec': 'sum,avg,min,max,any,fvc,fvf,fvt',
  'boolean': 'eq,nteq,em,ntem,any,fvc,fvf,fvt,saas,nsas',
  'calendar': 'on,nton,bf,atbf,af,ataf,btw,dtpt,rltv,snc,em,ntem,any,fvc,saas,nsas,date_more,date_less',
  'choice': 'eq,nteq,inna,ntin,lk,stwt,enwt,ntlk,any,fvc,fvf,fvt,saas,nsas',
  'referencechoice': 'eq,nteq,inna,ntin,lk,stwt,enwt,ntlk,any',
  'composite_field': 'stwt,lk,ntlk,any',
  'composite_name': '=string',
  'conditions': '=string',
  'condition_string': '=string',
  'decimal': '=integer',
  'currency': 'eq,nteq,em,ntem,lt,gt,lteq,gteq,btw',
  'default': 'eq,nteq,any,fvc,fvf,fvt',
  'email': '=string',
  'email_script': '=string',
  'field_name': '=string',
  'glide_duration': 'eq,nteq,em,ntem,lt,gt,lteq,gteq,btw,any,fvc',
  'glide_list': 'lk,ntlk,em,ntem,fvc,fvf,fvt',
  'GUID': '=string',
  'html': 'lk,ntlk,em,ntem,any,fvc,fvf,fvt',
  'html_script': '=string',
  'integer': 'eq,nteq,em,ntem,lt,gt,lteq,gteq,btw,any,fvc,fvf,fvt,saas,nsas,gtfd,ltfd,gteqfd,lteqfd',
  'integer_choice': 'eq,nteq,inna,ntin,em,ntem,lt,gt,lteq,gteq,btw,any,fvc,fvf,fvt,saas,nsas',
  'journal': 'fvc',
  'journal_input': '=journal',
  'keyword': 'are',
  'multi_two_lines': '=string',
  'ph_number': '=string',
  'phone_number_e164': '=string',
  'placeholder': 'oper',
  'price': 'eq,nteq,em,ntem,lt,gt,lteq,gteq,btw',
  'reference': 'eq,nteq,em,ntem,stwt,enwt,lk,ntlk,any,saas,nsas,es,eqd,fvc,fvf,fvt',
  'referencevariable': 'eq,nteq,em,ntem',
  'replication_payload': '=string',
  'script': 'lk,ntlk,ntem,any,fvc,fvf,fvt',
  'script_plain': '=script',
  'sortspec': 'asc,dsc,fvc,fvf,fvt',
  'string': 'stwt,enwt,lk,ntlk,eq,nteq,em,ntem,mpat,mreg,any,inna,es,fvc,fvf,fvt,lteq,gteq,btw,saas,nsas',
  'string_choice': '=choice',
  'string_clob': 'lk,ntlk,stwt,enwt,em,ntem,any,fvc,fvf,fvt',
  'string_numeric': 'eq,nteq,lk,ntlk,stwt,enwt,btw,any,fvc,fvf,fvt,saas,nsas',
  'sys_class_name': 'eq,nteq,inst,any,fvc,fvf,fvt',
  'table_name': '=string',
  'timer': '=integer',
  'translated_field': '=string',
  'translated_html': '=html',
  'translated_text': '=string',
  'cons_translated': 'eq,nteq,em,ntem',
  'url': '=string',
  'workflow': '=choice',
  'xml': '=html',
  'domain_path': '=string',
  'tree_code': '=string',
  'tree_path': '=string',
  'source_id': '=string',
  'source_name': '=string',
  'source_table': '=string'
};
var sysopers_template = {
  'default': 'eq,saas,eqd'
}
opersNS.compile(sysopers, opersNS.opdef);
opersNS.compile(sysopers_template, opersNS.opdef_template);
var extopers = {};
extopers['MATCH_PAT'] = true;
extopers['MATCH_RGX'] = true;
extopers['VALCHANGES'] = true;
extopers['CHANGESTO'] = true;
extopers['CHANGESFROM'] = true;
var calNS = {};
calNS.protoVal = [
  'Today: [0d   ]0d  ]0d  ',
  'Yesterday: [1d   ]1d  ]1d  ',
  'Tomorrow: [-1d  ]-1d ]-1d ',
  'This week: [=w   ]=w  ]=w  ',
  'Last week: [<w   ]<w  ]<w  ',
  'Next week: [>w   ]>w  ]>w  ',
  'This month: [=m   ]=m  ]=m  ',
  'Last month: [<m   ]<m  ]<m  ',
  'Next month: [>m   ]>m  ]>m  ',
  'Last 3 months: [3m   ]=m  [3m  ',
  'Last 6 months: [6m   ]=m  [6m  ',
  'Last 9 months: [9m   ]=m  [9m  ',
  'Last 12 months: [12m  ]=m  [12m ',
  'This quarter: [=q   ]=q  ]=q  ',
  'Last quarter: [1q   ]1q  ]1q  ',
  'Last 2 quarters: [1q   ]=q  ]2q  ',
  'Next quarter: [-1q  ]-1q ]-1q ',
  'Next 2 quarters: [-1q  ]-2q ]-2q ',
  'This year: [=y   ]=y  ]=y  ',
  'Next year: [>y   ]>y  ]>y  ',
  'Last year: [<y   ]<y  ]<y  ',
  'Last 2 years: [<y   ]=y  [<y  ',
  'Last 7 days: [7d   ]0d  [7d  ',
  'Last 30 days: [30d  ]0d  [30d ',
  'Last 60 days: [60d  ]0d  [60d ',
  'Last 90 days: [90d  ]0d  [90d ',
  'Last 120 days: [120d ]0d  [120d',
  'Current hour: [0h   ]0h  ]0h  ',
  'Last hour: [1h   ]1h  ]1h  ',
  'Last 2 hours: |2h   |0h  |2h  ',
  'Current minute: [0n   ]0n  ]0n  ',
  'Last minute: [1n   ]1n  [1n  ',
  'Last 15 minutes: [15n  ]0n  [15n ',
  'Last 30 minutes: [30n  ]0n  [30n ',
  'Last 45 minutes: [45n  ]0n  [45n ',
  'One year ago: |12m  ]=m  |12m '
];
calNS.agoUnits = {
  d: 'days',
  m: 'months',
  q: 'quarters',
  h: 'hours',
  n: 'minutes'
};
calNS.agoStartEnd = {
  '[': 'Start',
  ']': 'End',
  '|': ''
};
calNS.ofUnits = {
  w: 'Week',
  m: 'Month',
  q: 'Quarter',
  y: 'Year'
};
calNS.ofBeginningEnd = {
  '[': 'beginning',
  ']': 'end',
  '|': ''
};
calNS.ofWhich = {
  '<': 'Last',
  '=': 'This',
  '>': 'Next'
};
calNS.compileCal = function compileCal() {
  var result = [];
  for (var i = 0; i < calNS.protoVal.length; i++) {
    var proto = calNS.protoVal[i];
    var parts = /^(.*?)\: *([^ ]*) *([^ ]*) *([^ ]*) *$/.exec(proto);
    var row = [];
    row.push(parts[1]);
    for (var j = 2; j <= 4; j++)
      row.push(encode(parts[j]));
    result.push(row);
  }
  result.BETWEEN = ['Now', JS_GS + 'nowNoTZ()', JS_GS + 'nowNoTZ()'];
  result.RELATIVE = [
    ['on or after', 'GE'],
    ['on or before', 'LE'],
    ['after', 'GT'],
    ['before', 'LT'],
    ['on', 'EE']
  ];
  result.TRENDVALUES = [
    ['Hours', 'hour'],
    ['Minutes', 'minute'],
    ['Days', 'dayofweek'],
    ['Months', 'month'],
    ['Quarters', 'quarter'],
    ['Years', 'year']
  ];
  result.WHEN = [
    ['ago', 'ago'],
    ['from now', 'ahead']
  ];
  result.TRENDVALUES_WITH_FIELDS_PLURIAL = [
    ['Days', 'day'],
    ['Weeks', 'week'],
    ['Months', 'month'],
    ['Quarters', 'quarter'],
    ['Years', 'year'],
    ['Hours', 'hour']
  ];
  result.TRENDVALUES_WITH_FIELDS = [
    ['Day', 'day'],
    ['Week', 'week'],
    ['Month', 'month'],
    ['Quarter', 'quarter'],
    ['Year', 'year'],
    ['Hour', 'hour']
  ];
  result.WHEN_WITH_FIELDS = [
    ['before', 'before'],
    ['after', 'after'],
    ['before or after', 'before or after']
  ];
  result.DATEPART = compileDatePart();
  return result;

  function encode(part) {
    var parts = /^([\[\]\|])([\-0-9]+)([dmqhn])$/.exec(part);
    return parts ?
      JS_GS + calNS.agoUnits[parts[3]] + 'Ago' + calNS.agoStartEnd[parts[1]] + '(' + parts[2] + ')' :
      JS_GS + calNS.ofBeginningEnd[part.charAt(0)] + 'Of' + calNS.ofWhich[part.charAt(1)] +
      calNS.ofUnits[part.charAt(2)] + '()';
  }

  function compileDatePart() {
    var result = [];
    compileDaysOfWeek(result);
    compileMonths(result);
    compileQuarters(result);
    compileYears(result);
    compileWeeks(result);
    compileHours(result);
    return result;

    function compileDaysOfWeek(result) {
      var dow = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      for (var i = 0; i < dow.length; i++)
        result.push([dow[i], JS_GS + "datePart('dayofweek','" + dow[i].toLowerCase() + "')"]);
    }

    function compileMonths(result) {
      var ml = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      var ms = ['jan', 'feb', 'mar', 'apr', 'may', 'june', 'july', 'aug', 'sep', 'oct', 'nov', 'dec'];
      for (var i = 0; i < ml.length; i++)
        result.push([ml[i], JS_GS + "datePart('month', '" + ms[i] + "')"]);
    }

    function compileQuarters(result) {
      for (var i = 1; i <= 4; i++)
        result.push(['Quarter ' + i, JS_GS + "datePart('quarter','" + i + "')"]);
    }

    function compileYears(result) {
      for (var i = 2000; i <= 2020; i++)
        result.push(['' + i, JS_GS + "datePart('year','" + i + "')"]);
    }

    function compileWeeks(result) {
      for (var i = 0; i <= 53; i++)
        result.push(['Week ' + i, JS_GS + "datePart('week','" + i + "')"]);
    }

    function compileHours(result) {
      for (var i = 0; i < 24; i++) {
        var hr = (i == 0) ? 'Midnight' : ((i < 12) ? '' + i + ' am' : ((i == 12) ? 'Noon' : '' + (i - 12) + ' pm'));
        result.push([hr, JS_GS + "datePart('hour', '" + i + "')"]);
      }
    }
  }
}
var sysvalues = {};
sysvalues['boolean'] = [
  ["true", "true"],
  ["false", "false"]
];
sysvalues['catalog_boolean'] = [
  ["Yes", "Yes"],
  ["No", "No"]
];
sysvalues['string_boolean'] = [
  ["1", "true"],
  ["0", "false"]
];
sysvalues['calendar'] = calNS.compileCal();
var MESSAGES_CONDITION_RELATED_FILES = ['lowercase_fields', 'Keywords', 'Show Related Fields', 'Remove Related Fields', '-- choose field --', '-- value --', '-- None --'];
var g_current_table = '';
var g_filter_extension_map = {};;