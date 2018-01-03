/*! RESOURCE: /scripts/depends.js */
function getNameFromElement(elementName) {
  var names = elementName.split(".");
  names = names.slice(1);
  return names.join(".");
}

function loadFilterColumns(fname, dependent) {
  var value = resolveDependentValue(fname, dependent);
  var names = fname.split(".");
  serverRequest("xmlhttp.do?sysparm_include_sysid=true&sysparm_processor=SysMeta&sysparm_table_name=false&sysparm_type=column&sysparm_nomax=true&sysparm_value=" + names[0], getFilterColumnsResponse, [fname, dependent]);
  CustomEvent.fire('conditions:dependent_change');
}

function getFilterColumnsResponse(evt, args) {
  var fname = args[0];
  var dep = args[1];
  var hinput = document.getElementById(fname);
  filterExpanded = true;
  var table = resolveDependentValue(fname, dep);
  var xfilter = unescape(hinput.value);
  var form = findParentByTag(hinput, "FORM");
  if (table) {
    firstTable = table;
    createCondFilter(table + "." + fname, xfilter, fname);
  }
}

function onSelChange(elementName) {
  var vName = "ni.dependent." + getNameFromElement(elementName);
  var eDeps = document.getElementsByName(vName);
  jslog("*************---->" + eDeps.length);
  for (var i = 0; i < eDeps.length; i++) {
    var eDep = eDeps[i];
    if (eDep == null)
      continue;
    var f = eDep.attributes.getNamedItem('onDependentChange');
    if (f) {
      eval(f.nodeValue);
      continue;
    }
    var name = eDep.value;
    var eChanged = gel(elementName);
    var value;
    if (eChanged.options) {
      var selected = eChanged.selectedIndex;
      value = eChanged.options[selected].value;
    } else
      value = eChanged.value;
    var retFunc = selResponse;
    var ajax = new GlideAjax("set_from_attributes");
    var argCnt = 0;
    for (var ac = 0; ac < eDep.attributes.length; ac++) {
      var itemName = eDep.attributes[ac].name;
      if (itemName.substring(0, 7).toLowerCase() == "sysparm") {
        var pvalue = eDep.attributes[ac].value;
        ajax.addParam(itemName, pvalue);
        argCnt++;
      } else if (itemName == "function") {
        var fdef = eDep.attributes[ac].value;
        var index = fdef.indexOf("(");
        if (index == -1)
          retFunc = eval(eDep.attributes[ac].value);
        else
          retFunc = fdef;
      }
    }
    if (argCnt == 0)
      continue;
    ajax.addParam("sysparm_value", value);
    ajax.addParam("sysparm_name", name);
    ajax.addParam("sysparm_chars", "*");
    ajax.addParam("sysparm_nomax", "true");
    var scopeElement = gel('sysparm_domain_scope');
    if (scopeElement && scopeElement.value) {
      ajax.addParam("sysparm_domain_scope", scopeElement.value);
    }
    var domainElement = gel('sysparm_domain');
    if (domainElement && domainElement.value) {
      ajax.addParam("sysparm_domain", domainElement.value);
    }
    ajax.getXML(retFunc, null, eChanged);
  }
}

function selResponse(request) {
  if (!request || !request.responseXML)
    return;
  var e = request.responseXML.documentElement;
  var elementName = e.getAttribute("sysparm_name");
  var processorName = e.getAttribute("sysparm_processor");
  var defaultOption = e.getAttribute("default_option");
  var selectedItem = e.getAttribute("select_option");
  var select = gel(elementName);
  var currentValue = select.value;
  try {
    select.options.length = 0;
  } catch (e) {}
  if (processorName == "PickList")
    appendSelectOption(select, "", document.createTextNode((defaultOption ? defaultOption : getMessage('-- None --'))));
  var items = request.responseXML.getElementsByTagName("item");
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var t = item.getAttribute("value");
    var label = item.getAttribute("label");
    var hint = item.getAttribute("hint");
    var opt = appendSelectOption(select, t, document.createTextNode(label));
    if (hint != '')
      opt.title = hint;
    if (selectedItem && label == selectedItem)
      opt.selected = true;
    else if (currentValue && t == currentValue) {
      opt.selected = true;
      currentValue = '';
    }
  }
  if (select['onchange'])
    select.onchange();
}

function hasDepends(elementName) {
  var vName = "ni.dependent." + getNameFromElement(elementName);
  var eDep = document.getElementsByName(vName)[0];
  return eDep;
}

function resolveDependentValue(id, depname, deptable) {
  var systable = id.split(".")[0];
  var table = null;
  var dep = document.getElementById(systable + '.' + depname);
  if (dep != null) {
    if (dep.tagName == 'SELECT')
      table = dep.options[dep.selectedIndex].value
    else
      table = dep.value;
    table = table.split(".")[0];
  } else {
    table = deptable;
  }
  if (table == '*' || table == '' || table == 'null')
    table = null;
  return table;
}

function loadFields(fname, dependent, types, script_types, ref_types, script_ref_types, script_ref_types_dependent, field_choices_script, show_field_name_on_label, access_table) {
  var depValue = resolveDependentValue(fname, dependent, dependent);
  loadFieldsWithValue(fname, depValue, types, script_types, ref_types, script_ref_types, script_ref_types_dependent, field_choices_script, show_field_name_on_label, access_table);
}

function loadFieldsWithValue(fname, table, types, script_types, ref_types, script_ref_types, script_ref_types_dependent, field_choices_script, show_field_name_on_label, access_table) {
  var script_ref_types_dependent_value = "";
  if (script_ref_types_dependent) {
    var systable = fname.split(".")[0];
    var s_dep = gel(systable + '.' + script_ref_types_dependent);
    if (s_dep != null) {
      if (s_dep.tagName == 'SELECT')
        script_ref_types_dependent_value = s_dep.options[s_dep.selectedIndex].value;
      else
        script_ref_types_dependent_value = s_dep.value;
    }
  }
  if (table != null)
    getTableColumns(table, fname, types, script_types, ref_types, script_ref_types, script_ref_types_dependent_value, field_choices_script, show_field_name_on_label, access_table);
}

function getTableColumns(table, ref, types, script_types, ref_types, script_ref_types, script_ref_types_dependent_value, field_choices_script, show_field_name_on_label, access_table) {
  if (!types)
    types = "";
  if (!script_types)
    script_types = "";
  if (!ref_types)
    ref_types = "";
  if (!script_ref_types)
    script_ref_types = "";
  if (!script_ref_types_dependent_value)
    script_ref_types_dependent_value = "";
  var serverRequestString = "xmlhttp.do?sysparm_include_sysid=true&sysparm_processor=SysMeta&sysparm_table_name=false&sysparm_type=column&sysparm_nomax=true" +
    "&sysparm_value=" + table +
    "&sysparm_types=" + types +
    "&sysparm_script_types=" + script_types +
    "&sysparm_script_ref_types_dependent_value=" + script_ref_types_dependent_value +
    "&sysparm_script_ref_types=" + script_ref_types +
    "&sysparm_ref_types=" + ref_types +
    "&sysparm_containing_table=" + $('sys_target').value;
  if (field_choices_script && field_choices_script != "")
    serverRequestString += "&sysparm_field_choices_script=" + field_choices_script;
  if (show_field_name_on_label && show_field_name_on_label != "")
    serverRequestString += "&sysparm_show_field_name_on_label=" + show_field_name_on_label;
  if (access_table)
    serverRequestString += "&sysparm_access_table=" + access_table;
  serverRequestString += "&sysparm_ref_field=" + encodeURIComponent(ref);
  serverRequest(serverRequestString, getTableColumnsResponse, ref);
}

function getTableColumnsResponse(request, ref) {
  var fname = ref;
  var tcols = request.responseXML;
  var scols = gel(fname);
  var currentvis = scols.style.visibility;
  scols.style.visibility = "hidden";
  var cfield = gel('sys_original.' + fname);
  cValue = cfield.value;
  scols.options.length = 0;
  var includeNone = scols.attributes.getNamedItem('include_none');
  if (includeNone) {
    if (includeNone.nodeValue == 'true')
      scols.options[scols.options.length] = new Option(getMessage('-- None --'), '');
  }
  var items = tcols.getElementsByTagName("item");
  var sindex = 0;
  for (var i = 0; i != items.length; i++) {
    var item = items[i];
    var value = item.getAttribute("value");
    var label = item.getAttribute("label");
    scols.options[scols.options.length] = new Option(label, value);
    if (cValue == value)
      sindex = scols.options.length - 1;
  }
  scols.selectedIndex = sindex;
  scols.style.visibility = currentvis;
  CustomEvent.fire('getTableColumnsResponse.received');
  fireSetValueEvent();
}

function fireSetValueEvent() {
  if (typeof g_form != 'undefined') {
    var form = g_form.getFormElement();
    if (typeof form != 'undefined')
      $(form).fire('glideform:setvalue');
  }
};