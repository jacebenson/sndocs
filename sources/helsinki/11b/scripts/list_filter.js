/*! RESOURCE: /scripts/list_filter.js */
var runFilterHandlers = {}

function setImage(element, src) {
  element = $(element);
  if (!element)
    return;
  element.src = src;
}

function swapImage(imgId, newSrc) {
  return function() {
    setImage(imgId, newSrc);
  };
}

function setDisplay(element, display) {
  var i = $(element);
  i.style.display = display;
}

function runFilter(name) {
  if (queueFilters[name]) {
    columnsGet(name, runFilterCallBack);
    return;
  }
  runFilter0(name);
}

function runFilterCallBack() {
  queueFilters[mainFilterTable] = null;
  runFilter0(mainFilterTable);
}

function runFilter0(name) {
  var filter = getFilter(name);
  if (name.endsWith('.'))
    name = name.substring(0, name.length - 1);
  if (!runFilterHandlers[name])
    return;
  runFilterHandlers[name](name, filter);
}

function saveFilterRadioChange() {
  var div = gel('savefiltergroupref');
  var grp = getMessage('Group');
  if (getGroupSaveOption() == grp)
    div.style.display = "inline";
  else
    div.style.display = "none";
}

function getFilterVisibility() {
  var vis = getGroupSaveOption();
  var me = getMessage('Me');
  var eone = getMessage('Everyone');
  var grp = getMessage('Group');
  if (vis == me)
    return vis;
  if (vis == eone)
    return "GLOBAL";
  if (vis != grp)
    return me;
  var vis = '';
  var e = gel('save_filter_ref_id').value;
  var e = gel(e);
  if (e)
    vis = e.value;
  if (!vis)
    return me;
  return vis;
}

function getGroupSaveOption() {
  var rb = gel('MeRadio');
  if (rb && rb.checked)
    return rb.value;
  rb = gel('EveryoneRadio');
  if (rb && rb.checked)
    return rb.value;
  rb = gel('GroupRadio');
  if (rb && rb.checked)
    return rb.value;
  return getMessage('Me');
};