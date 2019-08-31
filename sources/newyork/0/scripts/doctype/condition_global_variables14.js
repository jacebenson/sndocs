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
numericTypes['percent_complete'] = 1;
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
var edge_order_Types = {
  'string': 'eq,nteq,em,ntem,lt,gt,lteq,gteq',
  'calendar': 'eq,nteq,em,ntem,bf,af,atbf,ataf'
};
var edge_equality_Types = {
  'string': 'eq,nteq,em,ntem',
  'calendar': 'eq,nteq,em,ntem'
};
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
  'css': '=html',
  'decimal': '=integer',
  'currency': 'eq,nteq,em,ntem,lt,gt,lteq,gteq,btw',
  'currency2': 'eq,nteq,em,ntem,lt,gt,lteq,gteq,btw',
  'default': 'eq,nteq,any,fvc,fvf,fvt',
  'email': '=string',
  'email_script': '=string',
  'field_name': '=string',
  'glide_duration': 'eq,nteq,em,ntem,lt,gt,lteq,gteq,btw,any,fvc',
  'glide_encrypted': 'eq,nteq,em,ntem',
  'glide_list': 'lk,ntlk,em,ntem,fvc,fvf,fvt,eqd',
  'GUID': '=string',
  'html': 'lk,ntlk,em,ntem,any,fvc,fvf,fvt',
  'html_script': '=string',
  'html_template': '=script',
  'integer': 'eq,nteq,em,ntem,lt,gt,lteq,gteq,btw,any,fvc,fvf,fvt,saas,nsas,gtfd,ltfd,gteqfd,lteqfd',
  'integer_choice': 'eq,nteq,inna,ntin,em,ntem,lt,gt,lteq,gteq,btw,any,fvc,fvf,fvt,saas,nsas',
  'journal': 'fvc',
  'journal_input': '=journal',
  'keyword': 'are',
  'multi_two_lines': '=string',
  'percent_complete': '=integer',
  'ph_number': '=string',
  'phone_number_e164': '=string',
  'placeholder': 'oper',
  'price': 'eq,nteq,em,ntem,lt,gt,lteq,gteq,btw',
  'reference': 'eq,nteq,em,ntem,stwt,enwt,lk,ntlk,any,saas,nsas,es,eqd,fvc,fvf,fvt',
  'referencevariable': 'eq,nteq,em,ntem',
  'replication_payload': '=string',
  'script': 'lk,ntlk,ntem,any,fvc,fvf,fvt',
  'script_plain': '=script',
  'script_server': '=script',
  'sortspec': 'asc,dsc,fvc,fvf,fvt',
  'string': 'stwt,enwt,lk,ntlk,eq,nteq,em,ntem,mpat,mreg,any,inna,es,fvc,fvf,fvt,lteq,gteq,btw,saas,nsas',
  'string_choice': '=choice',
  'string_clob': 'lk,ntlk,stwt,enwt,em,ntem,any,fvc,fvf,fvt',
  'string_full_utf8': '=string',
  'string_numeric': 'eq,nteq,lk,ntlk,stwt,enwt,btw,any,fvc,fvf,fvt,saas,nsas',
  'sys_class_name': 'eq,nteq,inst,any,fvc,fvf,fvt',
  'sysevent_name': '=string',
  'table_name': '=string',
  'timer': '=integer',
  'translated_field': '=string',
  'translated_html': '=html',
  'translated_text': '=string',
  'translated_basic': 'eq,nteq,em,ntem',
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
opersNS.compile(edge_order_Types, opersNS.opdef);
opersNS.compile(edge_equality_Types, opersNS.opdef);
opersNS.compile(sysopers_template, opersNS.opdef_template);
var extopers = {};
extopers['MATCH_PAT'] = true;
extopers['MATCH_RGX'] = true;
extopers['VALCHANGES'] = true;
extopers['CHANGESTO'] = true;
extopers['CHANGESFROM'] = true;
var calendarPromise = $j.Deferred();
(function() {
  var req = new XMLHttpRequest();
  req.open("GET", "/api/now/ui/date_time/legacy", true);
  req.setRequestHeader('Accept', 'application/json');
  if (typeof g_ck != 'undefined' && g_ck != "") {
    req.setRequestHeader('X-UserToken', g_ck);
  }

  function responseFunction(request) {
    var result = JSON.parse(request.response).result;
    var calendar = result.timeAgoDates;
    calendar.DATEPART = result.datePart;
    calendar.BETWEEN = result.between;
    calendar.RELATIVE = result.relative;
    calendar.TRENDVALUES = result.trendValues;
    calendar.WHEN = result.when;
    calendar.TRENDVALUES_WITH_FIELDS_PLURAL = result.trendValuesWithFieldsPlural;
    calendar.TRENDVALUES_WITH_FIELDS = result.trendValuesWithFields;
    calendar.WHEN_WITH_FIELDS = result.whenWithFields;
    sysvalues['calendar'] = calendar;
    calendarPromise.resolve(calendar);
  }
  req.onreadystatechange = function() {
    processReqChange(req, responseFunction);
  };
  req.send(null);
}());
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
var MESSAGES_CONDITION_RELATED_FILES = ['lowercase_fields', 'Keywords', 'Show Related Fields', 'Remove Related Fields', '-- choose field --', '-- value --', '-- None --'];
var g_current_table = '';
var g_filter_extension_map = {};;