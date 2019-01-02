/*! RESOURCE: /scripts/doctype/condition14_new.js */
NOW.msg = new GwtMessage();
NOW.c14 = (function() {
  "use strict";
  return {
    setup: function(name) {
      name = name || firstTable;
      if (!name) {
        alert("Choose a table before adding filters");
        return false;
      }
      g_current_table = name;
      columns = queueColumns[name];
      if (!columns) {
        var tname = (name.split("."))[0];
        columns = queueColumns[tname];
        if (!columns) {
          columnsGet(name, setup);
          columns = queueColumns[tname];
          if (columns == null)
            return false;
        }
      }
      currentTable = name;
      return true;
    },
    shouldShowDynamicReferenceOperator: function(type, elementDef, tableNameFull) {
      if (type != "reference" && type != "string" && type != "journal_input")
        return false
      if (!window.g_dynamic_filter_options)
        return false;
      var table = elementDef.getReference();
      var gotOne = false;
      var arr = g_dynamic_filter_options.split("##");
      for (var i = 0; i < arr.length; i++) {
        var aItem = arr[i];
        if (aItem.length == 0)
          continue;
        var aItemArr = aItem.split("::");
        if (aItemArr.length < 3)
          continue;
        var contextTableName = tableNameFull.split(".")[1];
        var isExclusive = typeof gtf_exclusive_dynamics != 'undefined' && gtf_exclusive_dynamics == 'true';
        if (!isExclusive && table == aItemArr[2] || contextTableName == aItemArr[3]) {
          gotOne = true;
          break;
        }
      }
      return gotOne;
    },
    enterKey: function(event) {
      if (event.keyCode == 13 || event.keyCode == 3) {
        var timeout;
        if (slushbucketDOMcheck()) {
          var elem = Event.element(getEvent(event)).up(".list_name");
          if (elem && elem.getAttribute) {
            var name = elem.getAttribute("name");
            if (name)
              timeout = name + "acRequest();";
          }
          if (!timeout)
            timeout = "acRequest();";
        } else {
          var name = listDOMcheck(Event.element(getEvent(event)));
          if (name)
            timeout = "runFilter('" + name + "');";
        }
        if (timeout)
          setTimeout(timeout, 0);
        Event.stop(event);
        return false;
      }
      return true;
    },
    setShowRelated: function(fieldName, idx, name, select) {
      if (fieldName == '...Show Related Fields...') {
        gotShowRelated = true;
        showRelated = 'yes';
        setPreference("filter.show_related", "yes");
      }
      if (fieldName == '...Remove Related Fields...') {
        gotShowRelated = true;
        showRelated = 'no';
        setPreference("filter.show_related", "no");
      }
      var f = fieldName.substring(0, idx);
      if (f != name)
        f = name + "." + f;
      f += ".";
      addFirstLevelFields(select, f, '', null, fieldName);
      return f;
    },
    conditionColumnResponse: function(columns, tableName, mfunc) {
      decodeFilter(tableName);
      queueFilters[tableName] = null;
      if (typeof mfunc === "function")
        mfunc(tableName);
    }
  }
})();

function slushbucketDOMcheck() {
  var epObject;
  if (epObject = gel("ep")) {
    var tdArr = epObject.getElementsByTagName("TD");
    for (var tdArrIndex = 0; tdArrIndex < tdArr.length; tdArrIndex++) {
      if (tdArr[tdArrIndex].className == "slushbody")
        return true;
    }
  }
  return false;
}

function listDOMcheck(el) {
  while (el) {
    el = findParentByTag(el, "div");
    if (!el)
      return null;
    if (el.id.endsWith(MAIN_LAYER))
      return el.id.substring(0, el.id.length - MAIN_LAYER.length);
  }
  return null;
}

function setup(name) {
  return NOW.c14.setup(name);
}

function getThing(table, name) {
  var thing = gel(table + name);
  if (thing)
    return thing;
  thing = gel(name);
  if (thing)
    return thing;
  if (table != null) {
    var fperiod = table.indexOf(".");
    if (fperiod > 0) {
      table = table.substring(fperiod + 1);
      thing = gel(table + name);
    }
  }
  return thing;
}

function buildMap(values, position) {
  "use strict";
  var keys = [];
  values.forEach(function(thisOp) {
    var thisMsg = thisOp[position];
    keys.push(thisMsg);
  })
  return keys;
}

function _createFilterSelect(width, multi, size) {
  var s = cel('select');
  s.className = "filerTableSelect";
  s.title = getMessage("Choose Input");
  if (width)
    s.style.width = width + "px";
  if (multi) {
    s.multiple = true;
  } else {
    s.className = s.className + ' select2';
  }
  s.style.verticalAlign = "top";
  s.className += " form-control";
  return s;
}

function getTableReference(tableName, parentTable) {
  if (firstTable == '')
    firstTable = tableName;
  return Table.get(tableName, parentTable);
}

function allowConditionsForJournal(type, filter) {
  if (type != "journal" && type != "journal_input")
    return false;
  if (filter && filter.type == "GlideTemplateFilter" && filter.allowJournal)
    return true;
  if (!filter || filter.getUsageContext() != "element_conditions")
    return false;
  var ie = filter.getIncludeExtended();
  if (ie["VALCHANGES"])
    return true;
  return false;
}

function updateFields(name, select, fOper, fValue, includeExtended, filterClass) {
  if (!NOW.c14.setup(name))
    return;
  var tableNameFull = name;
  name = currentTable;
  var o = getSelectedOption(select);
  var fieldName = o.value;
  name = name.split(".")[0];
  var idx = fieldName.indexOf("...");
  if (idx != -1)
    NOW.c14.setShowRelated(fieldName, idx, name, select);
  name = currentTable = getTableFromOption(o);
  var options = select.options;
  for (var i = 0; i < options.length; i++) {
    var option = options[i];
    if (optionWasSelected(option)) {
      option.innerHTML = getNormalLabel(option);
      option.style.color = 'black';
      option.wasSelected = 'false';
      break;
    }
  }
  if (!NOW.c14.setup(name))
    return;
  var tr = select.parentNode.parentNode;
  o.normalLabel = o.innerHTML;
  o.innerHTML = getFullLabel(o);
  o.style.color = 'green';
  o.wasSelected = 'true';
  $(select).addClassName('filter_type');
  var $select = $j(select);
  if (!$select.data('select2'))
    $select.select2();
  buildFieldsPerType(name, tr, fieldName, fOper, fValue, includeExtended, tableNameFull, filterClass);
}

function columnsGet(mft, nu) {
  loadFilterTableReference(mft);
  NOW.c14.conditionColumnResponse(columns, mft, nu);
}

function optionWasSelected(option) {
  return option.wasSelected === 'true';
}

function getFullLabel(option) {
  return option.fullLabel || "";
}

function addOperators(td, type, dValue, isChoice, includeExtended, showDynamicReferenceOperator, filterClass, restrictI18NOpers) {
  var msg = NOW.msg;
  var s = _createFilterSelect("150");
  s.title = 'choose operator';
  if (td.parentNode.conditionObject)
    if (td.parentNode.conditionObject.isPlaceHolder())
      s.disabled = true;
  var opers;
  if (isChoice)
    opers = sysopers[type + "_choice"];
  var translated = type == 'translated_field' || type == 'translated_html' || type == 'translated_text';
  if (!opers && translated && restrictI18NOpers)
    opers = sysopers['translated_basic'];
  if (!opers && sysopers[type])
    opers = sysopers[type];
  if (type && type.indexOf(':') > 0) {
    var complexTypeArray = type.split(':');
    if (null != complexTypeArray[0])
      opers = sysopers[complexTypeArray[0]];
  }
  if (!opers)
    opers = sysopers['default'];
  if (noOps)
    dValue = '=';
  if (filterClass == "GlideTemplateFilter") {
    if (typeof gtfOperators != 'undefined' && gtfOperators.length != 0)
      opers = gtfOperators;
    else
      opers = sysopers_template['default'];
  }
  var keys = buildMap(opers, 1);
  map = msg.getMessages(keys);
  for (var ii = 0; ii < opers.length; ii++) {
    var opInfo = opers[ii];
    if (opInfo[0] == 'SINCE') {
      var base = new GlideRecord('cmdb_baseline');
      base.query();
      if (!base.hasNext())
        continue;
    }
    if (extopers[opInfo[0]] && !includeExtended[opInfo[0]])
      continue;
    if (opInfo[0] == "DYNAMIC" && !showDynamicReferenceOperator)
      continue;
    addOption(s, opInfo[0], map[opInfo[1]], dValue && opInfo[0] == dValue);
  }
  var so = getSelectedOption(s);
  if (dValue && (!so || so.value != dValue)) {
    addOption(s, dValue, msg.getMessage(dValue));
    s.selectedIndex = s.length - 1;
  }
  td.fieldType = "select";
  if (so)
    td.currentOper = getSelectedOption(s).value;
  td.subType = type;
  td.appendChild(s);
  return s;
}

function getTableFromOption(option) {
  return option.tableName || "";
}

function isFilterExtension(type) {
  return g_filter_extension_map[type] != undefined;
}

function initFilterExtension(type, tableName, elementDef) {
  var o = g_filter_extension_map[type];
  return o.call(this, tableName, elementDef);
}

function addTextInput(td, dValue, type) {
  var input = cel("input");
  if (type)
    input.type = type;
  if (td.parentNode.conditionObject)
    if (td.parentNode.conditionObject.isPlaceHolder())
      input.disabled = true;
  if (isMSIE) {
    input.onkeypress = function() {
      return NOW.c14.enterKey(event)
    }
  } else
    input.onkeypress = NOW.c14.enterKey;
  td.fieldType = "input";
  if (dValue)
    input.value = dValue;
  input.className = "filerTableInput form-control";
  input.title = 'input value';
  if (useTextareas) {
    input.style.width = "80%";
    input.style.resize = "vertical";
    input.maxlength = 80;
  }
  input.style.verticalAlign = "top";
  td.appendChild(input);
  return input;
}

function loadFilterTableReference(mft) {
  var tablepart = mft.split(".")[0];
  currentTable = mft;
  if (typeof g_filter_description != 'undefined')
    if (g_filter_description.getMainFilterTable() == null ||
      g_filter_description.getMainFilterTable() == "")
      g_filter_description.setMainFilterTable(mft);
  var tableDef = getTableReference(tablepart);
  var columns = tableDef.getColumns();
  queueColumns[mft] = columns;
  queueColumns[tablepart] = columns;
  return tableDef;
}

function decodeFilter(tableName) {
  currentTable = tableName;
  var query = queueFilters[tableName];
  queueFilters[tableName] = null;
  var fDiv = getThing(tableName, 'gcond_filters');
  if (query == null) {
    query = fDiv.initialQuery;
    if (query != null && fDiv.filterObject != null) {
      var fo = fDiv.filterObject;
      if (fo.isQueryProcessed())
        return;
    }
  }
  var runable = false;
  var defaultPH = true;
  var sync = false;
  var filter = fDiv.filterObject;
  if (filter) {
    if (filter.tableName == tableName && filter.query == query)
      return;
    runable = filter.isRunable();
    defaultPH = filter.defaultPlaceHolder;
    sync = filter.synchronous;
    filter.destroy();
  }
  new GlideFilter(tableName, query, null, runable, sync, function(filter) {
    filter.setDefaultPlaceHolder(defaultPH);
  });
}

function refreshFilter(name) {
  var fDiv = getThing(name, 'gcond_filters');
  var fQueries = fDiv.getElementsByTagName("tr");
  for (var i = 0; i < fQueries.length; i++) {
    var queryTR = fQueries[i];
    if (queryTR.queryPart != 'true')
      continue;
    var queryID = queryTR.queryID;
    var query = getThing(name, queryID);
    refreshQuery(query);
  }

  function refreshQuery(query) {
    var tableTRs = query.getElementsByTagName("tr");
    for (var i = 1; i < tableTRs.length; i++) {
      var tr = tableTRs[i];
      if (!tr)
        continue;
      if (tr.basePart != 'true')
        continue;
      var fieldValue = tr.tdValue;
      refreshSelect(tr, fieldValue);
    }
  }

  function refreshSelect(tr, td) {
    if (typeof td == 'undefined')
      return;
    var fType = td.fieldType ? td.fieldType : "select";
    var tags = td.getElementsByTagName(fType);
    if (tags == null || tags.length == 0)
      return;
    var field = tags[0];
    if (fType == "select") {
      var options = field.options;
      if (field.multiple == true) {
        var choices = field.choices;
        choicesGet(tr.tableField, field, choices);
      }
    }
  }
}

function getNormalLabel(option) {
  return option.normalLabel || ""
}

function getFilter(name, doEscape, fDiv) {
  var fullFilter = "";
  orderBy = "";
  var spanName = ".encoded_query";
  var fSpan = getThing(name, spanName);
  if (fSpan)
    return fSpan.innerHTML;
  var divName = "gcond_filters";
  if (fDiv)
    divName = fDiv + divName;
  var fDiv = getThing(name, divName);
  if (!fDiv)
    return "";
  if ('gcond_filters' == divName)
    addOrderBy();
  var fQueries = fDiv.getElementsByTagName("tr");
  for (var i = 0; i < fQueries.length; i++) {
    var queryTR = fQueries[i];
    if (queryTR.queryPart != 'true')
      continue;
    var queryID = queryTR.queryID;
    var query = getThing(name, queryID);
    filter = "";
    var queryString = getQueryString(query);
    if (fullFilter.length > 0 && queryString.length > 0)
      fullFilter += "^NQ";
    fullFilter = fullFilter + queryString;
  }
  if (fullFilter.length > 0)
    fullFilter += "^EQ";
  fullFilter += orderBy;
  filter = fullFilter;
  if (doEscape)
    filter = encodeURIComponent(filter);
  return filter;

  function addOrderBy() {
    'use strict';
    var fDiv = $('gcond_sort_order');
    if (!fDiv)
      return;
    var fQueries = fDiv.getElementsByTagName("tr");
    for (var i = 0; i < fQueries.length; i++) {
      var queryTR = fQueries[i];
      if (queryTR.queryPart != 'true')
        continue;
      var queryID = queryTR.queryID;
      var query = getThing(name, queryID);
      if (!query)
        continue;
      getQueryString(query);
    }
  }
}

function getQueryString(query) {
  var tableTRs = query.getElementsByTagName("tr");
  for (var i = 0; i < tableTRs.length; i++) {
    var tr = tableTRs[i];
    if (!tr)
      continue;
    if (tr.basePart != 'true')
      continue;
    getQueryForTR(tr);
  }
  return filter;
}

function getQueryForTR(trItem) {
  "use strict";
  var trs = trItem.getElementsByTagName("tr");
  for (var i = 0; i < trs.length; i++) {
    var tr = trs[i];
    var type = tr.varType;
    var field = getTDFieldValue(tr.tdField);
    if (field == PLACEHOLDER || !tr.operSel)
      continue;
    var oper = getSelectedOption(tr.operSel).value;
    if (!tr.sortSpec && !tr.aggSpec) {
      var filterPart = getTRFilter(tr, field, oper);
      if (filter.length > 0)
        filter += "^";
      if (tr.gotoPart)
        filter += "GOTO";
      if (i != 0)
        filter += "OR";
      filter += filterPart;
      var ips = tr.getElementsByTagName("input");
      for (var ti = 0; ti < ips.length; ti++) {
        var iput = ips[ti];
        if (iput.type == "hidden" && iput.name == "subcon") {
          filter += "^" + iput.jop + iput.field + iput.oper +
            iput.value;
        }
      }
    } else if (!tr.aggSpec) {
      if (oper == 'ascending')
        orderBy += "^" + "ORDERBY" + field;
      else if (oper == 'descending')
        orderBy += "^" + "ORDERBYDESC" + field;
    }
  }

  function getTDFieldValue(td) {
    if (!td) {
      return;
    }
    var fType = td.fieldType || "select";
    var field = td.getElementsByTagName(fType)[0];
    if (fType != "select")
      return field.value;
    var options = field.options;
    if (!field.multiple)
      return options[field.selectedIndex].value;
    var retVal = [];
    for (var i = 0; i < options.length; i++) {
      if (options[i].selected)
        retVal[retVal.length] = options[i].value;
    }
    return retVal.join(",");
  }

  function getTRFilter(tr, field, oper) {
    if (tr.handler) {
      var answer = tr.handler.getFilterText(oper);
      if (answer != '')
        return answer;
      var val = tr.handler.getValues();
      if (oper == 'SINCE')
        oper = '>';
    }
    return field + oper + escapeEmbeddedQueryTermSeparator(val);
  }

  function escapeEmbeddedQueryTermSeparator(val) {
    return val.replace(/(\w)\^(\w)/g, "$1^^$2");
  }
}

function deleteFilterByID(tablename, id) {
  var td = getThing(tablename, id);
  deleteTD(tablename, td);
  _frameChanged();

  function deleteTD(tableName, butTD) {
    var butTR = butTD.parentNode;
    var orTR = butTR.previousSibling;
    if (butTR.conditionObject)
      butTR.conditionObject.remove();
    else {
      var parent = butTR.parentNode;
      if (parent.conditionObject) {
        parent.conditionObject.remove();
      }
    }
    if (orTR && $(orTR).hasClassName('orRow')) {
      orTR.remove();
    }
  }
}

function buildFieldsPerType(tableName, tr, descriptorName, fOper, fValue, includeExtended, tableNameFull, filterClass) {
  var tableName = tableName.split(".")[0];
  var tableDef = getTableReference(tableName);
  if (!tableDef)
    return;
  var parts = descriptorName.split('.');
  descriptorName = parts[parts.length - 1];
  var type;
  var multi;
  var isChoice;
  var restrictI18NOpers;
  var usingEnglish = g_lang == 'en';
  var elementDef = tableDef.getElement(descriptorName);
  var msg = NOW.msg;
  if (elementDef == null) {
    if (descriptorName != TEXTQUERY && descriptorName != PLACEHOLDER)
      return;
    if (descriptorName == TEXTQUERY) {
      type = 'keyword';
      multi = true;
      isChoice = false;
    } else {
      type = 'placeholder';
      multi = false;
      isChoice = false;
      fValue = msg.getMessage('-- value --');
    }
  } else {
    type = elementDef.getType();
    multi = elementDef.getMulti();
    isChoice = elementDef.isChoice();
    restrictI18NOpers = !usingEnglish && !elementDef.canSortI18N();
    if (!elementDef.getBooleanAttribute("canmatch")) {
      if (type != "variables" && type != "related_tags")
        type = "string_clob";
    } else if (elementDef.isEdgeEncrypted())
      type = elementDef.canSort() ? "edgeEncryptionOrder" : "edgeEncryptionEq";
  }
  var tdField = tr.tdField;
  var tdOperator = tr.tdOper;
  var tdValue = tr.tdValue;
  tr.varType = type;
  tr.gotoPart = gotoPart;
  if (tr.handler)
    tr.handler.destroy();
  tr.handler = null;
  if (tr.sortSpec == true) {
    tr.varType = 'sortspec';
    type = 'sortspec';
  } else if (tr.aggSpec == true) {
    tr.varType = 'aggspec';
    type = 'aggspec';
  }
  tr.tableField = tableName + "." + descriptorName;
  tdOperator.innerHTML = "";
  tdValue.innerHTML = "";
  tdValue.style.minWidth = "";
  if (type == "float")
    type = "integer";
  else if (type == 'domain_number')
    type = "integer";
  else if (type == "wide_text" || type == "ref_ext")
    type = "string";
  else if (dateTypes[type]) {
    type = "calendar";
    if (fValue && fValue.indexOf("datePart") > -1)
      fOper = 'DATEPART';
    else if (fValue && (fValue.indexOf('getBaseFilter') > 0))
      fOper = "SINCE";
  }
  var showDynamicReferenceOperator = NOW.c14.shouldShowDynamicReferenceOperator(type, elementDef, tableNameFull);
  var operSel = addOperators(tdOperator, type, fOper, isChoice, includeExtended,
    showDynamicReferenceOperator, filterClass, restrictI18NOpers);
  if (operSel) {
    operSel.observe('change', function(e) {
      var form = operSel.up('form');
      if (form) {
        var nameWithoutTablePrefix = tableNameFull.substring(tableNameFull.indexOf(".") + 1);
        form.fire("glideform:onchange", {
          id: nameWithoutTablePrefix,
          value: unescape(getFilter(tableNameFull)),
          modified: true
        });
      }
    });
  }
  tr.operSel = operSel;
  if (fOper == null && operSel)
    fOper = tdOperator.currentOper;
  tr.setAttribute("type", type);
  if ((type == "boolean") || (type == 'string_boolean')) {
    tr.handler = new GlideFilterChoice(tableName, elementDef);
    var keys = [];
    for (var i = 0; i < sysvalues[type].length; i++)
      keys.push(sysvalues[type][i][0]);
    var map = msg.getMessages(keys);
    for (var i = 0; i < sysvalues[type].length; i++) {
      var v = sysvalues[type][i][0];
      sysvalues[type][i][1] = map[v];
    }
    tr.handler.setChoices(sysvalues[type]);
  } else if (type == 'calendar')
    tr.handler = new GlideFilterDate(tableName, elementDef);
  else if (type == "reference") {
    tr.handler = new GlideFilterReference(tableName, elementDef);
    tr.handler.setOriginalTable(tableNameFull);
  } else if (type == "related_tags") {
    tr.handler = new GlideFilterLabels(tableName, elementDef);
    tr.handler.setOriginalTable(tableNameFull);
  } else if (type == "variables") {
    if (tableName == 'sc_task')
      tr.handler = new GlideFilterItemVariables(tableName, elementDef);
    else
      tr.handler = new GlideFilterVariables(tableName, elementDef);
    tr.handler.setOriginalTable(tableNameFull);
  } else if (type == "questions") {
    tr.handler = new GlideFilterQuestions(tableName, elementDef);
    tr.handler.setOriginalTable(tableNameFull);
  } else if (type == "glide_list")
    tr.handler = tableNameFull.endsWith(".template") ?
    new GlideFilterReferenceMulti(tableName, elementDef) :
    new GlideFilterReference(tableName, elementDef);
  else if (type == 'sortspec' || type == 'aggspec') {} else if (type == 'mask_code' || isChoice)
    tr.handler = new GlideFilterChoiceDynamic(tableName, elementDef);
  else if (type == 'glide_duration' || type == 'timer')
    tr.handler = new GlideFilterDuration(tableName, elementDef);
  else if (isFilterExtension(type))
    tr.handler = initFilterExtension(type, tableName, elementDef);
  else if ((multi == 'yes') && (useTextareas)) {
    tr.handler = new GlideFilterStringMulti(tableName, elementDef);
    tr.handler.setOriginalTable(tableNameFull);
  } else if (type == 'integer')
    tr.handler = new GlideFilterNumber(tableName, elementDef);
  else if (type == 'currency' || type == 'price')
    tr.handler = new GlideFilterCurrency(tableName, elementDef);
  else {
    tr.handler = new GlideFilterString(tableName, elementDef);
    tr.handler.setOriginalTable(tableNameFull);
  }
  if (tr.handler) {
    tr.handler.setFilterClass(filterClass);
    tr.handler.create(tr, fValue);
  }
}

function addFirstLevelFields(s, target, fValue, filterMethod, fieldName, filter) {
  "use strict";
  var forFilter;
  var onlyRestrictedFields;
  if (filter) {
    forFilter = filter.getOpsWanted();
    onlyRestrictedFields = filter.onlyRestrictedFields;
  }
  var messages = getMessages(MESSAGES_CONDITION_RELATED_FILES);
  s.options.length = 0;
  if (!gotShowRelated) {
    gotShowRelated = true;
    if (typeof g_filter_description != 'undefined')
      showRelated = g_filter_description.getShowRelated();
    else
      showRelated = getPreference("filter.show_related");
  }
  var placeholder = false;
  var selindex = 0;
  var indentLabel = false;
  var savedItems = {};
  var savedLabels = [];
  var labelPrefix = '';
  var headersAdded = false;
  var parts = target.split(".");
  var tableName = parts[0];
  var tableDef = getTableReference(tableName);
  var extension = '';
  var prefix = '';
  if (parts.length > 1 && parts[1] != null && parts[1] != '')
    var elementDef = fixParts();
  columns = tableDef.getColumns();
  queueColumns[tableDef.getName()] = columns;
  var textIndex = false;
  if (!noOps && !indentLabel) {
    var root = columns.getElementsByTagName("xml");
    if (root && root.length == 1) {
      root = root[0];
      textIndex = root.getAttribute("textIndex");
    }
  }
  var items = (extension != '') ? tableDef.getTableElements(extension) : tableDef.getElements();
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var t = item.getName();
    if (filterMethod && t != fValue) {
      if (!filterMethod(item))
        continue;
    }
    var t = item.getName();
    if (prefix != '')
      t = prefix + '.' + t;
    if (!noOps && item.getAttribute("filterable") == "no" &&
      !allowConditionsForJournal(item.getAttribute("type"), filter))
      continue;
    if (!item.canRead()) {
      if (t != fValue)
        continue;
      item.setCanRead('yes');
    }
    if (!item.isActive()) {
      if (t != fValue)
        continue;
      item.setActive('yes');
    }
    var label = item.getLabel();
    if (!elementDef || elementDef.getType() != "glide_var") {
      savedItems[label] = t;
      savedLabels.push(label);
    }
    if (item.isReference() && !item.isRefRotated() &&
      item.getType() != 'glide_list' && filterExpanded &&
      showRelated == 'yes') {
      label += " ⟹ " + item.getRefLabel();
      label += " " + messages['lowercase_fields'];
      t += "...";
      savedItems[label] = t;
      savedLabels.push(label);
    }
  }
  items = tableDef.getExtensions();
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var label = item.getLabel() + " (+)";
    t = item.getExtName() + "...";
    if (prefix != '')
      t = prefix + '.' + t;
    savedItems[label] = t;
    savedLabels.push(label);
  }
  if (!onlyRestrictedFields &&
    ((fValue == TEXTQUERY || textIndex) && filterMethod == null || forFilter)) {
    o = addOption(s, TEXTQUERY, messages['Keywords'], (fValue == TEXTQUERY));
    o.fullLabel = messages['Keywords'];
  }
  savedLabels.forEach(function(sname) {
    var o = addOption(s, savedItems[sname], sname, savedItems[sname] == fValue);
    o.tableName = tableDef.getName();
    if (labelPrefix != '')
      o.fullLabel = labelPrefix + "." + sname;
    else
      o.fullLabel = sname;
    if (indentLabel)
      o.innerHTML = "&nbsp;&nbsp;&nbsp;" + o.innerHTML;
    if (o.value.indexOf("...") != -1)
      if (o.fullLabel.indexOf("(+)") == -1)
        o.style.color = 'blue';
      else
        o.style.color = 'darkred';
  })
  if (filterExpanded && !onlyRestrictedFields) {
    if (showRelated != 'yes')
      var o = addOption(s, "...Show Related Fields...", messages['Show Related Fields'], false);
    else
      o = addOption(s, "...Remove Related Fields...", messages['Remove Related Fields'], false);
    o.style.color = 'blue';
  }
  if (!placeholder && (s.selectedIndex == 0 && ((textIndex && fValue != TEXTQUERY) || headersAdded)))
    s.selectedIndex = selindex;
  return s;

  function fixParts() {
    var o = null;
    if (filterExpanded && parts.length > 2) {
      var tableLabel = tableDef.getLabel();
      if (tableLabel == null)
        tableLabel = "Parent";
      o = addOption(s, tableDef.getName() + "...", tableLabel + " " + messages['lowercase_fields'], false);
      o.tableName = tableDef.getName();
      o.style.color = 'blue';
    }
    if (parts[1] == PLACEHOLDERFIELD) {
      o = addOption(s, PLACEHOLDER, messages['-- choose field --'], true);
      o.style.color = 'blue';
      o.tableName = tableDef.getName();
      o.fullLabel = messages['-- choose field --'];
      placeholder = true;
    }
    var sPeriod = "";
    var cname = '';
    for (var i = 1; i < parts.length - 1; i++) {
      var f = parts[i];
      if (f == null || f == '')
        break;
      var elementDef = tableDef.getElement(parts[i]);
      if (elementDef == null)
        break;
      var childTable = tableName;
      if (elementDef.isReference()) {
        childTable = elementDef.getReference();
        if (elementDef.isExtensionElement())
          extension = childTable;
        else
          extension = '';
      } else {
        if (fieldName != null && fieldName.indexOf("...") > -1)
          childTable = parts[0];
        else
          break;
      }
      var parentTable = (extension != '') ? extension : elementDef.getTable().getName();
      tableDef = getTableReference(childTable, parentTable);
      if (cname.length)
        cname = cname + ".";
      cname += elementDef.getName();
      sPeriod = "." + sPeriod;
      var clabel = sPeriod + elementDef.getLabel() + " \u00bb " +
        elementDef.getRefLabel() + " " +
        messages['lowercase_fields'];
      o = addOption(s, cname + "...", clabel, false);
      o.tablename = tableDef.getName();
      o.style.color = 'blue';
      selindex++;
      indentLabel = true;
      headersAdded = true;
      if (labelPrefix.length)
        labelPrefix += ".";
      labelPrefix += elementDef.getLabel();
      if (prefix.length)
        prefix += ".";
      prefix += elementDef.getName();
    }
    return elementDef;
  }
}

function addSortSpec(name, fField, fOper) {
  if (!NOW.c14.setup(name))
    return null;
  var fDiv = getThing(currentTable, 'gcond_filters');
  var e = $('gcond_sort_order');
  if (e) {
    e.filterObject = fDiv.filterObject;
    fDiv = e;
  }
  if (!checkFilterSize(fDiv.filterObject))
    return;
  fDiv.filterObject.addSortRow(fField, fOper);
  _frameChanged();
}

function addFields(tableName, fValue, isSort, extendedFields) {
  NOW.c14.setup(tableName);
  var s = _createFilterSelect();
  if (!isSort)
    s.onchange = function() {
      updateFields(tableName, this, null, null, extendedFields);
    };
  else
    s.onchange = function() {
      updateSortFields(tableName, this);
    };
  var sname = tableName.split(".")[0];
  if (fValue)
    sname = sname + "." + fValue;
  if (isSort)
    addFirstLevelFields(s, sname, fValue, sortByFilter);
  else
    addFirstLevelFields(s, sname, fValue);
  return s;
}

function sortByFilter(item) {
  return item.canSort() && (g_lang == 'en' || item.canSortI18N());
}

function updateSortFields(name, select) {
  if (!NOW.c14.setup(name))
    return;
  name = currentTable;
  var o = getSelectedOption(select);
  var fieldName = o.value;
  name = name.split(".")[0];
  var idx = fieldName.indexOf("...");
  if (idx != -1) {
    NOW.c14.setShowRelated(fieldName, idx, name, select);
    return;
  }
  name = currentTable = getTableFromOption(o);
  var options = select.options;
  for (var i = 0; i < options.length; i++) {
    var option = options[i];
    if (optionWasSelected(option)) {
      option.innerHTML = getNormalLabel(option);
      option.style.color = 'black';
      option.wasSelected = 'false';
      break;
    }
  }
  if (!NOW.c14.setup(name))
    return;
  var tr = select.parentNode.parentNode;
  o.normalLabel = o.innerHTML;
  o.innerHTML = getFullLabel(o);
  o.style.color = 'green';
  o.wasSelected = 'true';
  $(select).addClassName('filter_type');
  $j(select).select2();
}

function addCondition(name) {
  if (!NOW.c14.setup(name))
    return null;
  var fDiv = getThing(currentTable, 'gcond_filters');
  if (!checkFilterSize(fDiv.filterObject))
    return;
  fDiv.filterObject.addConditionRowToFirstSection();
  _frameChanged();
}

function addConditionSpec(name, queryID, field, oper, value, fDiv) {
  if (firstTable == null)
    firstTable = currentTable;
  if (!NOW.c14.setup(name))
    return null;
  var divName = "gcond_filters";
  if (fDiv != null)
    divName = fDiv + "gcond_filters";
  var fDiv = getThing(currentTable, divName);
  var filter = fDiv.filterObject;
  if (filter == null) {
    filter = new GlideFilter(currentTable, "");
    if (typeof field == "undefined") {
      return;
    }
  }
  if (!checkFilterSize(filter))
    return;
  var answer = filter.addConditionRow(queryID, field, oper, value);
  _frameChanged();
  return answer;
};