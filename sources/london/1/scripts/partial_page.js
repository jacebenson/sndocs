/*! RESOURCE: /scripts/partial_page.js */
var PARTIAL_PAGE_LOADING_HTML = "<img src='images/loading_anim.gifx' alt='Loading, one moment please...' /> Loading, one moment please... <br/>";

function determinePartial(el) {
  var element = el;
  if (el.srcElement)
    element = el.srcElement;
  else if (el.target)
    element = el.target;
  var spn = findParentByTag(element, 'span');
  while (spn) {
    if (spn.id.length > 12 && spn.id.substring(0, 12) == 'partialPage:')
      return spn.id.substring(12);
    spn = findParentByTag(spn, 'span');
  }
}

function serializeMinimal(form, fields) {
  if (fields == null)
    return Form.serialize(form);
  var elements = Form.getElements($(form));
  var queryComponents = new Array();
  for (var i = 0; i < elements.length; i++) {
    var thisElement = elements[i];
    var isin = false;
    for (var x = 0; x < fields.length; x++) {
      var fieldName = fields[x];
      if (thisElement.id == fieldName || thisElement.name == fieldName)
        isin = true;
    }
    if (isin) {
      var queryComponent = Form.Element.serialize(elements[i]);
      if (queryComponent)
        queryComponents.push(queryComponent);
    }
  }
  return queryComponents.join('&');
}

function refreshList(tableName) {
  var lists = GlideList2.getListsForTable(tableName);
  for (var i = 0; i < lists.length; i++)
    lists[i].refresh();
}

function getPartialSpan(partialPageId) {
  return document.getElementById('partialPage:' + partialPageId);
}

function fetchPartial(formId, partialPageId) {
  var seek = 'partialPage:' + partialPageId;
  var targetSpan = document.getElementById(seek);
  if (targetSpan == null || targetSpan == 'unknown') {
    alert('fetchPartial called for partial span : ' + partialPageId + ' but this page does not have such an element to replace!');
    return false;
  }
  form = document.getElementById(formId);
  if (form == null || form == 'unknown') {
    alert('You asked partialform to pseudo-submit form ' + form + ' identified by id ' + formId + ' but we cannot find it!');
    return false;
  }
  var url = form.action;
  var parms = Form.serialize(form);
  parms += "&partial_page=" + partialPageId;
  parms += "&sysparm_nostack=true";
  targetSpan.innerHTML = PARTIAL_PAGE_LOADING_HTML;
  CustomEvent.fireTop("request_start", document);
  var ga = new GlideAjax(null, url);
  ga.addEncodedString(parms);
  ga.preventCancelNotification();
  ga.setErrorCallback(function(response) {
    partialPageReplace(response, targetSpan);
  });
  ga.getXML(partialPageReplace, null, targetSpan);
  return false;
}

function partialPageReplace(response, targetSpan) {
  if (isMSIE)
    var scrollTop = document.body.scrollTop;
  var html = response.responseText;
  targetSpan.innerHTML = html;
  html.evalScripts();
  CustomEvent.fireTop("request_complete", document);
  CustomEvent.fire('partial.page.reload', targetSpan);
  if (isMSIE)
    document.body.scrollTop = scrollTop;
};