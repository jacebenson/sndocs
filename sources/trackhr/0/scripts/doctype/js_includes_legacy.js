/*! RESOURCE: /scripts/doctype/js_includes_legacy.js */
/*! RESOURCE: /scripts/doctype/legacy_adjust.js */
addTopRenderEvent(function() {
  $j(document.body).addClass('non_standard_lists');
});;
/*! RESOURCE: /scripts/slushbucket.js */
var slushbucketFieldsAdded = false;
if (typeof isMSIE6 === 'undefined')
  var isMSIE6 = false;

function moveSelectElement3(
  sourceSelect,
  targetSelect,
  sourceLabel,
  targetLabel,
  keepTarget) {
  if (sourceSelect.selectedIndex > -1) {
    for (i = 0; i < sourceSelect.length; ++i) {
      var selectedOption = sourceSelect.options[i];
      if (selectedOption.selected) {
        if (selectedOption.text != sourceLabel) {
          var newOption = new Option(selectedOption.text, selectedOption.value);
          if (targetSelect.options.length > 0 &&
            targetSelect.options[0].text == targetLabel) {
            targetSelect.options[0] = newOption;
            targetSelect.selectedIndex = 0;
          } else {
            targetSelect.options[targetSelect.options.length] = newOption;
            targetSelect.selectedIndex = targetSelect.options.length - 1;
          }
        } else {
          sourceSelect.selectedIndex = -1;
        }
      }
    }
    if (!keepTarget) {
      removeSelectElement3(sourceSelect, sourceLabel);
    }
  }
}

function moveOptionToSelected(
  sourceSelect,
  targetSelect,
  keepSourceLabel,
  unmovableSourceValues,
  keepTargetLabel) {
  moveOption(sourceSelect, targetSelect, keepSourceLabel, unmovableSourceValues, keepTargetLabel, "to");
}
var SLUSHBUCKET_LABELED_PREFIX = ".labeled.";
var SLUSHBUCKET_LABELED_DISPLAY = "* ";

function moveOptionToSelectedLabeled(
  sourceSelect,
  targetSelect,
  keepSourceLabel,
  unmovableSourceValues,
  keepTargetLabel) {
  moveOption(sourceSelect, targetSelect, keepSourceLabel, unmovableSourceValues, keepTargetLabel, "to", SLUSHBUCKET_LABELED_PREFIX);
}

function moveOptionFromSelected(
  sourceSelect,
  targetSelect,
  keepSourceLabel,
  unmovableSourceValues,
  keepTargetLabel) {
  moveOption(sourceSelect, targetSelect, keepSourceLabel, unmovableSourceValues, keepTargetLabel, "from");
}

function moveCorrespondingOption(sourceSelect, targetSelect,
  correspondingSelect, correspondingTarget,
  keepSourceLabel,
  unmovableSourceValues,
  keepTargetLabel) {
  var selectedIds = moveOptionReturnIdArray(sourceSelect, targetSelect, keepSourceLabel, unmovableSourceValues, keepTargetLabel);
  moveSelectedOptions(selectedIds, correspondingSelect, correspondingTarget, keepSourceLabel, unmovableSourceValues, keepTargetLabel);
}

function moveOption(
  sourceSelect,
  targetSelect,
  keepSourceLabel,
  unmovableSourceValues,
  keepTargetLabel,
  direction,
  property,
  sort) {
  moveOptionReturnIdArray(sourceSelect, targetSelect, keepSourceLabel,
    unmovableSourceValues, keepTargetLabel, direction, property, sort);
}

function moveOptionReturnIdArray(
  sourceSelect,
  targetSelect,
  keepSourceLabel,
  unmovableSourceValues,
  keepTargetLabel,
  direction,
  property,
  sort) {
  var sourceOptions = sourceSelect.options;
  var canMove;
  var option;
  var selectedIds = new Array();
  var index = 0;
  for (var i = 0; i < sourceOptions.length; i++) {
    option = sourceOptions[i];
    if (option.selected) {
      var optText = option.text;
      canMove = (option.text != keepSourceLabel);
      if (canMove && getHeaderAttr(option))
        canMove = false;
      if (canMove && getDoNotMove(option) == 'true')
        canMove = false;
      if (canMove && unmovableSourceValues != null) {
        for (var j = 0; j < unmovableSourceValues.length; j++) {
          if (unmovableSourceValues[j] == option.value) {
            canMove = false;
            break;
          }
        }
      }
      if (canMove) {
        selectedIds[index] = i;
        index++;
      } else {
        option.selected = false;
      }
    }
  }
  moveSelectedOptions(selectedIds, sourceSelect, targetSelect, keepSourceLabel, unmovableSourceValues, keepTargetLabel,
    direction, property, sort);
  return selectedIds;
}

function moveSelectedOptions(selectedIds, sourceSelect, targetSelect, keepSourceLabel, unmovableSourceValues, keepTargetLabel,
  direction, property, sort) {
  var targetSelectedIndex = targetSelect.selectedIndex;
  targetSelect.selectedIndex = -1;
  var sourceOptions = sourceSelect.options;
  var group = targetSelect.getElementsByTagName("optgroup");
  if (group != null && group.length > 1)
    group = document.getElementById('ac');
  else
    group = null;
  if (selectedIds.length > 0) {
    var targetOptions = targetSelect.options;
    for (var i = 0; i < selectedIds.length; i++) {
      var soption = sourceOptions[selectedIds[i]];
      if (group == null) {
        var label = getTrueLabel(soption);
        if (label === undefined || label == null)
          label = soption.text;
        var optionValue = soption.value;
        if (typeof property != "undefined" && property != null) {
          if (optionValue.substring(0, 1) != ".") {
            optionValue = property + optionValue;
            if (property == SLUSHBUCKET_LABELED_PREFIX)
              label = SLUSHBUCKET_LABELED_DISPLAY + label;
          }
        }
        if (direction == "from" && optionValue.startsWith(SLUSHBUCKET_LABELED_PREFIX)) {
          optionValue = optionValue.substring(SLUSHBUCKET_LABELED_PREFIX.length);
          label = label.substring(SLUSHBUCKET_LABELED_DISPLAY.length);
        }
        option =
          new Option(
            label,
            optionValue);
        option.cl = label;
        var title = getTitle(soption);
        if (title)
          option.title = title;
        if (option.value.indexOf("ref_") != -1)
          option.style.color = 'darkred';
        else
          option.style.color = soption.style.color;
        if (getCopyAttributes(soption)) {
          option = soption.cloneNode();
          option.text = label;
        } else if (getMultipleAllowed(soption)) {
          option.setAttribute("multipleAllowed", true);
        }
        if (getShowAnnotation(soption)) {
          option.setAttribute("showAnnotation", true);
          option.setAttribute("annotationText", "");
        }
        if (getShowChart(soption))
          option.setAttribute("showChart", true);
        var skipAdd = false;
        var ov = option.value;
        if ((direction != "to") || !getMultipleAllowed(soption)) {
          for (var ti = 0; ti < targetOptions.length; ti++) {
            var toption = targetOptions[ti];
            if (toption.value == ov || (ov.substr(0, 2) !== "u_" && (ov.indexOf(".annotation.") == 0 || ov.indexOf(".chart.") == 0))) {
              skipAdd = true;
              break;
            }
          }
        }
        if (skipAdd)
          continue;
        if (targetOptions.length == 1 && targetOptions[0].text == keepTargetLabel) {
          targetOptions[0] = option;
          targetOptions[0].setAttribute('selected', true);
        } else {
          var position = targetSelectedIndex >= 0 ? targetSelectedIndex + 1 : targetSelect.length;
          if (direction == 'from')
            position = targetSelect.length;
          if (sort)
            position = getInsertIndex(targetSelect, option);
          copySelectOptionToIndex(targetSelect, option, position);
          if (!isMSIE6)
            targetOptions[position].selected = true;
          else
            targetOptions[position].setAttribute("selected", true);
        }
      } else {
        var t = soption.value;
        var label = soption.text;
        if (sort)
          appendSelectOption(group, t, document.createTextNode(label), getInsertIndex(group, soption)).setAttribute('selected', true);
        else
          appendSelectOption(group, t, document.createTextNode(label)).setAttribute('selected', true);
      }
    }
  }
  removeSelectedOptions(selectedIds, sourceSelect, direction);
  if (sourceSelect.options.length == 0)
    addOption(sourceSelect, "", "--" + getMessage("None") + "--");
  if (selectedIds.length > 0)
    try {
      targetSelect.focus();
    } catch (e) {}
  if (targetSelect["onLocalMoveOptions"])
    targetSelect.onLocalMoveOptions();
  if (sourceSelect["onLocalMoveOptions"])
    sourceSelect.onLocalMoveOptions();
}

function removeSelectedOptions(selectedIds, sourceSelect, direction) {
  for (var i = selectedIds.length - 1; i > -1; i--) {
    var option = sourceSelect[selectedIds[i]];
    if (!getDoNotDelete(option) && (direction != "to" || !getMultipleAllowed(option))) {
      sourceSelect.remove(selectedIds[i]);
    }
  }
  if (sourceSelect["onchange"])
    sourceSelect.onchange();
  sourceSelect.disabled = true;
  sourceSelect.disabled = false;
}

function getACForSlushBucket(collectionKey, displayField, select0) {
  var displayField;
  var invisibleField;
  var elementName = displayField;
  var type = collectionKey;
  var noMax = 'M2MList';
  var useInvisible = true;
  var uFieldName = select0;
  if (type == "Reference") {
    displayField = gel("sys_display." + elementName);
    if (useInvisible)
      invisibleField = gel(elementName);
  } else {
    displayField = gel(elementName);
    if (useInvisible)
      invisibleField = gel("sys_display." + elementName);
  }
  var updateField;
  if (uFieldName != null)
    updateField = gel(uFieldName);
  var ac = displayField.ac;
  if (ac == null) {
    ac = getAC(displayField.name);
    if (ac == null) {
      ac = newAC(displayField, invisibleField, updateField, elementName, type);
      if (ac.isOTM())
        ac.refField = refField;
    }
  }
  return ac;
}

function acRequestSlushBucket(event, listName, collectionRelatedFileJS, displayCol2, useContains, collectionIdJS, collectionKeyJS, m2mSelect1, domain, displayField, collectionKey, m2mSelect0, m2mCatalogVariable, questionName) {
  var query = '';
  var qry = gel(listName + '_' + collectionRelatedFileJS);
  if (qry != null && qry.value.indexOf("**") != 0) {
    if (qry.value != '') {
      if (qry.value.indexOf("*") == 0 && qry.value.length > 1)
        query = displayCol2 + "CONTAINS" + qry.value.substring(1);
      else if (useContains == "true")
        query = displayCol2 + "CONTAINS" + qry.value;
      else
        query = displayCol2 + "STARTSWITH" + qry.value;
    }
  }
  if (!event)
    event = window.event;
  var additional = "sysparm_collectionID=" + collectionIdJS;
  additional += "&sysparm_collection_key=" + collectionKeyJS;
  if (m2mCatalogVariable)
    additional += "&m2m_catalog_variable_id=" + questionName;
  var target = gel('sys_target');
  if (target) {
    additional += "&sys_target=" + target.value;
  }
  target = gel(m2mSelect1);
  if (target) {
    var ids = [];
    var options = target.options;
    for (var i = 0; i != options.length; i++)
      ids.push(options[i].value);
    additional += "&m2m_selected_ids=" + ids.join(',');
  }
  if (domain)
    additional += "&sysparm_domain=" + domain;
  fieldChangeSlush2(event, displayField, collectionKey, 'M2MList', true,
    m2mSelect0, query, additional, listName);
}

function moveOptionAndSort(
  sourceSelect,
  targetSelect,
  keepSourceLabel,
  unmovableSourceValues,
  keepTargetLabel,
  ac) {
  if (ac)
    ac.emptyResults = {};
  moveOption(sourceSelect, targetSelect, keepSourceLabel,
    unmovableSourceValues, keepTargetLabel, null, null,
    sortSupported(targetSelect));
}

function removeSelectElement3(sourceSelect, sourceLabel) {
  if (sourceSelect.selectedIndex > -1) {
    for (i = sourceSelect.length - 1; i > -1; i--) {
      if (sourceSelect.options[i].selected)
        sourceSelect.options[i] = null;
    }
    if (sourceSelect.length == 0)
      addOption(sourceSelect, "", sourceLabel);
  }
}

function removeSection(sourceSelect) {
  var option = getSingleSelectedOption(sourceSelect);
  if (option) {
    var gajax = new GlideAjax("RemoveFormSectionAjax");
    gajax.addParam("sysparm_value", option.value);
    gajax.getXML();
  }
}

function moveUp(sourceSelect) {
  if (sourceSelect.length > 1) {
    var options = sourceSelect.options;
    var selectedIds = new Array();
    var index = 0;
    for (var i = 1; i < sourceSelect.length; i++) {
      if (options[i].selected) {
        selectedIds[index] = i;
        index++;
      }
    }
    var selId;
    for (var i = 0; i < selectedIds.length; i++) {
      selId = selectedIds[i];
      privateMoveUp(options, selId);
      options[selId].selected = false;
      options[selId - 1].selected = true;
    }
    sourceSelect.focus();
    if (sourceSelect["onLocalMoveUp"])
      sourceSelect.onLocalMoveUp();

    function resetFields() {
      sourceSelect.removeAttribute("multiple");
      setTimeout(function() {
        sourceSelect.setAttribute("multiple", "multiple");
        $(sourceSelect).stopObserving('click', resetFields);
      });
    }
    if (isMSIE8 || isMSIE9 || isMSIE10 || isMSIE11)
      $(sourceSelect).observe('click', resetFields);
  }
}

function moveDown(sourceSelect) {
  if (sourceSelect.length > 1) {
    var options = sourceSelect.options;
    var selectedIds = new Array();
    var index = 0;
    for (var i = sourceSelect.length - 2; i >= 0; i--) {
      if (sourceSelect.options[i].selected) {
        selectedIds[index] = i;
        index++;
      }
    }
    var selId;
    for (var i = 0; i < selectedIds.length; i++) {
      selId = selectedIds[i];
      privateMoveDown(options, selId);
      options[selId].selected = false;
      options[selId + 1].selected = true;
    }
    sourceSelect.focus();
    if (sourceSelect["onLocalMoveDown"])
      sourceSelect.onLocalMoveDown();

    function resetFields() {
      sourceSelect.removeAttribute("multiple");
      setTimeout(function() {
        sourceSelect.setAttribute("multiple", "multiple");
        $(sourceSelect).stopObserving('click', resetFields);
      });
    }
    if (isMSIE8 || isMSIE9 || isMSIE10 || isMSIE11)
      $(sourceSelect).observe('click', resetFields);
  }
}

function moveTop(sourceSelect) {
  var selIndex = sourceSelect.selectedIndex;
  if (sourceSelect.length > 1 && selIndex > 0) {
    var options = sourceSelect.options;
    for (var i = selIndex; i > 0; i--) {
      privateMoveUp(options, i);
    }
    sourceSelect.focus();
    sourceSelect.selectedIndex = 0;
    if (sourceSelect["onLocalMoveTop"])
      sourceSelect.onLocalMoveTop();
  }
}

function moveBottom(sourceSelect) {
  var selIndex = sourceSelect.selectedIndex;
  if (sourceSelect.length > 1 && selIndex > -1 && selIndex < sourceSelect.length - 1) {
    var options = sourceSelect.options;
    for (var i = selIndex; i < sourceSelect.length - 1; i++) {
      privateMoveDown(options, i);
    }
    sourceSelect.focus();
    sourceSelect.selectedIndex = sourceSelect.length - 1;
    if (sourceSelect["onLocalMoveBottom"])
      sourceSelect.onLocalMoveBottom();
  }
}

function copyOption(sourceSelect, targetSelect,
  keepSourceLabel, unmovableSourceValues,
  keepTargetLabel) {
  var sourceOptions = sourceSelect.options;
  var canMove;
  var option;
  var selectedIds = new Array();
  var index = 0;
  for (var i = 0; i < sourceSelect.length; i++) {
    option = sourceOptions[i];
    if (option.selected) {
      canMove = (option.text != keepSourceLabel);
      if (canMove && unmovableSourceValues != null) {
        for (var j = 0; j < unmovableSourceValues.length; j++) {
          if (unmovableSourceValues[j] == option.value) {
            canMove = false;
            break;
          }
        }
      }
      if (canMove) {
        selectedIds[index] = i;
        index++;
      } else {
        option.selected = false;
      }
    }
  }
  var targetOptions = targetSelect.options;
  if (selectedIds.length > 0) {
    targetSelect.selectedIndex = -1;
    for (var i = 0; i < selectedIds.length; i++) {
      option = new Option(sourceOptions[selectedIds[i]].text, sourceOptions[selectedIds[i]].value);
      if (targetOptions.length == 1 && targetOptions[0].text == keepTargetLabel) {
        targetOptions[0] = option;
        targetOptions[0].selected = true;
      } else {
        targetOptions[targetOptions.length] = option;
        targetOptions[targetOptions.length - 1].selected = true;
      }
    }
  }
  if (targetSelect["onchange"]) {
    targetSelect.onchange();
  }
  if (sourceSelect["onchange"]) {
    sourceSelect.onchange();
  }
}

function removeOption(sourceSelect, targetSelect,
  keepSourceLabel, unmovableSourceValues,
  keepTargetLabel) {
  var sourceOptions = sourceSelect.options;
  var canMove;
  var option;
  var selectedIds = new Array();
  var index = 0;
  for (var i = 0; i < sourceSelect.length; i++) {
    option = sourceOptions[i];
    if (option.selected) {
      canMove = (option.text != keepSourceLabel);
      if (canMove && unmovableSourceValues != null) {
        for (var j = 0; j < unmovableSourceValues.length; j++) {
          if (unmovableSourceValues[j] == option.value) {
            canMove = false;
            break;
          }
        }
      }
      if (canMove) {
        selectedIds[index] = i;
        index++;
      } else {
        option.selected = false;
      }
    }
  }
  for (var i = selectedIds.length - 1; i > -1; i--) {
    var option = sourceSelect[selectedIds[i]];
    if (!getDoNotDelete(option))
      sourceSelect.remove(selectedIds[i]);
  }
  sourceSelect.disabled = true;
  sourceSelect.disabled = false;
  if (sourceOptions.length == 0)
    addOption(sourceOptions, "", keepSourceLabel);
}

function privateMoveUp(options, index) {
  privateSwapOptions(options[index - 1], options[index]);
}

function privateMoveDown(options, index) {
  privateSwapOptions(options[index], options[index + 1]);
}

function privateSwapOptions(option1, option2) {
  var newOption = new Option(option1.text, option1.value);
  newOption.cl = getTrueLabel(option1);
  newOption.cv = getCV(option1);
  newOption.multipleAllowed = getMultipleAllowed(option1);
  newOption.showAnnotation = getShowAnnotation(option1);
  newOption.annotationText = getAnnotationText(option1);
  newOption.annotationIsPlainText = getAnnotationTextType(option1);
  newOption.annotationType = getAnnotationType(option1);
  newOption.annotationID = getAnnotationID(option1);
  newOption.showChart = getShowChart(option1);
  newOption.chartID = getChartID(option1);
  newOption.chartLabel = getChartLabel(option1);
  newOption.style.color = option1.style.color;
  newOption.doNotMove = getDoNotMove(option1);
  newOption.title = getTitle(option1);
  newOption.dataScopeID = getDataScopeID(option1);
  newOption.dataScopeName = getDataScopeName(option1);
  newOption.dataScopeLabel = getDataScopeLabel(option1);
  newOption.dataScopeConfigurable = getDataScopeConfigurable(option1);
  newOption.dataParentId = getDataParentId(option1);
  option1.text = option2.text;
  option1.value = option2.value;
  option1.setAttribute("doNotMove", getDoNotMove(option2));
  option1.cl = getTrueLabel(option2);
  option1.cv = getCV(option2);
  option1.setAttribute("cl", getTrueLabel(option2));
  option1.setAttribute("cv", getCV(option2));
  option1.setAttribute("title", getTitle(option2));
  option1.multipleAllowed = getMultipleAllowed(option2);
  option1.showAnnotation = getShowAnnotation(option2);
  option1.annotationText = getAnnotationText(option2);
  option1.annotationIsPlainText = getAnnotationTextType(option2);
  option1.annotationType = getAnnotationType(option2);
  option1.annotationID = getAnnotationID(option2);
  option1.showChart = getShowChart(option2);
  option1.chartID = getChartID(option2);
  option1.chartLabel = getChartLabel(option2);
  option1.dataScopeID = getDataScopeID(option2);
  option1.dataScopeName = getDataScopeName(option2);
  option1.dataScopeLabel = getDataScopeLabel(option2);
  option1.dataScopeConfigurable = getDataScopeConfigurable(option2);
  option1.dataParentId = getDataParentId(option2);
  option1.setAttribute("multipleallowed", getMultipleAllowed(option2));
  option1.setAttribute("showannotation", getShowAnnotation(option2));
  option1.setAttribute("annotationtext", getAnnotationText(option2));
  option1.setAttribute("annotationisplaintext", getAnnotationTextType(option2));
  option1.setAttribute("annotationtype", getAnnotationType(option2));
  option1.setAttribute("annotationid", getAnnotationID(option2));
  option1.setAttribute("showchart", getShowChart(option2));
  option1.setAttribute("chartlabel", getChartLabel(option2));
  option1.setAttribute("chartid", getChartID(option2));
  option1.setAttribute("data-scope_id", getDataScopeID(option2));
  option1.setAttribute("data-scope_name", getDataScopeName(option2));
  option1.setAttribute("data-scope_label", getDataScopeLabel(option2));
  option1.setAttribute("data-scope_configurable", getDataScopeConfigurable(option2));
  option1.setAttribute("data-parent_id", getDataParentId(option2));
  option1.style.color = option2.style.color;
  option2.text = newOption.text;
  option2.value = newOption.value;
  option2.style.color = newOption.style.color;
  option2.setAttribute("doNotMove", getDoNotMove(newOption));
  option2.cl = getTrueLabel(newOption);
  option2.setAttribute("cl", getTrueLabel(newOption));
  option2.cv = getCV(newOption);
  option2.setAttribute("cv", getCV(newOption));
  option2.setAttribute("title", getTitle(newOption));
  option2.multipleAllowed = getMultipleAllowed(newOption);
  option2.showAnnotation = getShowAnnotation(newOption);
  option2.annotationText = getAnnotationText(newOption);
  option2.annotationIsPlainText = getAnnotationTextType(newOption);
  option2.annotationType = getAnnotationType(newOption);
  option2.annotationID = getAnnotationID(newOption);
  option2.showChart = getShowChart(newOption);
  option2.chartID = getChartID(newOption);
  option2.chartLabel = getChartLabel(newOption);
  option2.dataScopeID = getDataScopeID(newOption);
  option2.dataScopeName = getDataScopeName(newOption);
  option2.dataScopeLabel = getDataScopeLabel(newOption);
  option2.dataScopeConfigurable = getDataScopeConfigurable(newOption);
  option2.dataParentId = getDataParentId(newOption);
  option2.setAttribute("multipleallowed", getMultipleAllowed(newOption));
  option2.setAttribute("showannotation", getShowAnnotation(newOption));
  option2.setAttribute("annotationtext", getAnnotationText(newOption));
  option2.setAttribute("annotationisplaintext", getAnnotationTextType(newOption));
  option2.setAttribute("annotationtype", getAnnotationType(newOption));
  option2.setAttribute("annotationid", getAnnotationID(newOption));
  option2.setAttribute("showchart", getShowChart(newOption));
  option2.setAttribute("chartlabel", getChartLabel(newOption));
  option2.setAttribute("chartid", getChartID(newOption));
  option2.setAttribute("data-scope_id", getDataScopeID(newOption));
  option2.setAttribute("data-scope_name", getDataScopeName(newOption));
  option2.setAttribute("data-scope_label", getDataScopeLabel(newOption));
  option2.setAttribute("data-scope_configurable", getDataScopeConfigurable(newOption));
  option2.setAttribute("data-parent_id", getDataParentId(newOption));
}

function saveAllActuallySelected(fromSelectArray, toArray, delim, escape, emptyLabel, doEscape) {
  var i, j, escapedValue;
  var translatedEmptyLabel = getMessage(emptyLabel);
  for (i = 0; i < fromSelectArray.length; i++) {
    toArray[i].value = '';
    var count = 0;
    for (j = 0; j < fromSelectArray[i].length; j++) {
      var option = fromSelectArray[i].options[j];
      if (!option.selected)
        continue;
      if (!(fromSelectArray[i].length == 1 && fromSelectArray[i].options[0].value == translatedEmptyLabel)) {
        var val = fromSelectArray[i].options[j].value;
        if (doEscape) {
          val = encodeURIComponent(val);
        }
        val = val.replace(new RegExp(escape + escape, "g"), escape + escape);
        if (count != 0) {
          toArray[i].value += delim;
        }
        count = count + 1;
        toArray[i].value += val.replace(new RegExp(delim, "g"), escape + delim);
      }
    }
  }
}

function clearAllSelected(fromSelectArray) {
  var i, j, escapedValue;
  for (i = 0; i < fromSelectArray.length; i++) {
    var count = 0;
    for (j = 0; j < fromSelectArray[i].length; j++) {
      var option = fromSelectArray[i].options[j];
      option.selected = false;
    }
  }
}

function addNewField(selectBox, formElement) {
  var title = formElement.newOption.value;
  title = trim(title);
  formElement.newOption.value = "";
  if (title == '')
    return;
  var type = formElement.newType.value;
  var refTable = formElement.refTable.value;
  var length = formElement.lengthSelect.value;
  var fieldName = title;
  var fnid = formElement.fieldName;
  if (fnid != null) {
    fieldName = fnid.value;
    if (fieldName == '')
      fieldName = title;
    fnid.value = "";
  }
  var opt = document.createElement("option");
  opt.value = encodeNewField({
    length: length,
    label: title,
    name: fieldName,
    refTable: refTable,
    type: type
  });
  opt.text = escapeLabel(title);
  selectBox.options.add(opt);
  slushbucketFieldsAdded = true;
}

function newLabelChanged(formElement) {
  formElement.newOption.value = formElement.newOption.value.replace(/[&<>\"]/g, '')
  formElement.fieldName.value = escapeColumnName(formElement.newOption.value)
}

function newColumnNameChanged(formElement) {
  formElement.fieldName.value = escapeColumnName(formElement.fieldName.value)
}

function escapeLabel(label) {
  return (
    label
    .replace(/[&<>\"]/g, '')
    .replace(/-/g, "!DASH!")
  )
}

function escapeColumnName(name) {
  return (
    name.toLowerCase()
    .replace(/[^a-zA-Z0-9_\$]/g, '_')
    .replace(/^\d/, '_')
    .replace(/_+/g, '_')
    .replace(/_$/, '')
  );
}

function encodeNewField(opts) {
  return encodeURIComponent([
    "TBD",
    opts.type,
    opts.length,
    escapeLabel(opts.label),
    opts.refTable,
    escapeColumnName(opts.name)
  ].join('-'));
}

function addChoiceKeyPress(event, input, selectBox, selectTable) {
  if (event.keyCode != 13)
    return true;
  addChoiceOption(selectBox, input, selectTable);
  return false;
}

function ignoreEnter(event) {
  if (event.keyCode != 13)
    return true;
  return false;
}

function addNumericChoiceKeyPress(event, formElement, selectBox) {
  if (event.keyCode != 13)
    return true;
  addNumericChoiceOption(selectBox, formElement);
  return false;
}

function addChoiceOption(selectBox, input, selectTable) {
  var title = input.value;
  input.value = "";
  var opt = document.createElement("option");
  opt.value = "TBD-" + title;
  opt.text = title;
  addTargetedChoice(selectBox, opt, selectTable);
}

function addChoice(selectBox, formElement, selectTable) {
  var input = formElement.newOption;
  var title = input.value;
  input.value = "";
  var opt = document.createElement("option");
  opt.value = "TBD-" + title;
  opt.text = title;
  addTargetedChoice(selectBox, opt, selectTable);
}

function addNumericChoice(selectBox, formElement, selectTable) {
  var input = formElement.newOption.value;
  formElement.newOption.value = '';
  var number = formElement.newOptionValue.value;
  formElement.newOptionValue.value = '';
  var opt = document.createElement("option");
  opt.value = "TBD-" + input + "-TBDVALUE-" + number;
  opt.text = input;
  addTargetedChoice(selectBox, opt, selectTable);
}

function addTargetedChoice(selectBox, opt, selectTable) {
  if (selectTable != null && selectTable.selectedIndex > -1) {
    opt.value += "-TBDTARGET-" + selectTable.options[selectTable.selectedIndex].value;
  }
  selectBox.options.add(opt);
}

function addChoiceFromInput(selectBox, inputElement) {
  var title;
  if (inputElement.tagName == 'SELECT') {
    title = inputElement.options[inputElement.selectedIndex].value;
    inputElement.selectedIndex = 0;
  } else {
    title = inputElement.value;
    inputElement.value = '';
  }
  var opt = document.createElement("option");
  opt.value = title;
  opt.text = title;
  selectBox.options.add(opt);
}

function addChoiceFromValue(selectBox, title) {
  var opt = document.createElement("option");
  opt.value = title;
  opt.text = title;
  selectBox.options.add(opt);
}

function addChoiceFromValueAndDisplay(selectBox, value, title, addOnlyIfNotExists) {
  if (!selectBox || !value)
    return;
  if (!addOnlyIfNotExists || !isValueAlreadyAdded(selectBox, value)) {
    var opt = document.createElement("option");
    opt.value = value;
    opt.text = title;
    selectBox.options.add(opt);
  }
}

function isValueAlreadyAdded(selectBox, value) {
  var options = selectBox.options;
  for (var i = 0; i < options.length; i++) {
    var option = options[i];
    if (option && option.value === value)
      return true;
  }
  return false;
}

function removeUsedSlush(avail, used, mainID) {
  var itemCnt = avail.options.length;
  for (var ib = 0; ib < itemCnt; ib++) {
    if (sortSupported(used))
      var exists = itemExistsInSorted(used, avail.options[ib]);
    else
      var exists = itemExists(used, avail.options[ib].value);
    if (exists || avail.options[ib].value == mainID) {
      avail.options[ib] = null;
      itemCnt--;
      ib--;
    }
  }
}

function itemExistsInSorted(sel, option) {
  return _bsearchOptions(sel, option, false);
}

function getInsertIndex(sel, option) {
  if (sel.length == 0)
    return 0;
  return _bsearchOptions(sel, option, true);
}

function _bsearchOptions(sel, option, returnIndex) {
  if (!sel)
    return false;
  if (!option)
    return false;
  var max = sel.length - 1;
  var min = 0;
  var i = Math.floor(max / 2);
  while (max >= min) {
    if (sel.options[i].text == option.text &&
      sel.options[i].value == option.value) {
      if (returnIndex)
        return i + 1;
      else
        return true;
    }
    if (sel.options[i].text.toLowerCase() < option.text.toLowerCase())
      min = i + 1;
    else
      max = i - 1;
    i = Math.floor((max - min) / 2) + min;
  };
  if (returnIndex)
    return i + 1;
  return false;
}

function itemExists(sel, value) {
  if (!sel || !value)
    return false;
  for (var i = 0; i < sel.options.length; i++) {
    if (sel.options[i].value == value)
      return true;
  }
  return false;
}

function slushChanged(avail, used, mainID) {
  removeUsedSlush(avail, used, mainID);
  populateIfEmpty(avail);
  populateIfEmpty(used);
}

function slushLoaded(fA, fB) {
  populateIfEmpty(fA);
  populateIfEmpty(fB);
}

function populateIfEmpty(sbox) {
  if (sbox.options && sbox.options.length == 0)
    addOption(sbox, "", "--" + getMessage("None") + "--")
}

function getColumns(select) {
  var sourceOptions = select.options;
  var index = 0;
  var selectedIndex = -1;
  for (var i = 0; i < select.length; i++) {
    option = sourceOptions[i];
    if (option.selected) {
      selectedIndex = i;
      index++;
      if (index > 1)
        break;
    }
  }
  if (index == 1) {
    var option = sourceOptions[selectedIndex];
    var colName = option.value;
    var colLabel = getTrueLabel(option);
    var tableName = getTablenameFromOption(option);
    if (tableName === undefined || tableName == null || tableName == '')
      tableName = "";
    if (tableName.length > 0) {
      var bt = getBaseTable(option);
      var btl = getBaseTableLabel(option);
      var tableLabel = getTablelabelFromOption(option);
      var tableParent = getParentTable(option);
      var ext = getHeaderAttr(option);
      Table.get(tableName, tableParent, false, false, function(tableDef) {
        processColumns(tableDef, new Array(colName, colLabel, tableName, tableLabel, bt, btl, 'replace', ext));
      });
    }
  }
}

function refreshAvailable() {
  var button = document.getElementById('expand_x0');
  if (button) {
    button.style.display = "none";
  }
  button = document.getElementById('expand_x0s');
  if (button) {
    button.style.display = "block";
  }
  var select = document.getElementById('select_0');
  var tableName = select.getAttribute("gsft_basetable");
  if (tableName.length > 0) {
    Table.get(tableName, tableName, false, false, function(tableDef) {
      var tableLabel = tableDef.getLabel();
      processColumns(tableDef, new Array(tableName, tableLabel + " fields", tableName, tableLabel, tableName, tableLabel, 'append', true));
    });
  }
}

function expandFile(select, prefix) {
  if (!prefix)
    prefix = "";
  var button = document.getElementById(prefix + 'expand_x0');
  if (button) {
    button.style.display = "none";
  }
  button = document.getElementById(prefix + 'expand_x0s');
  if (button) {
    button.style.display = "block";
  }
  var select = document.getElementById(prefix + 'select_0');
  var option = getSingleSelectedOption(select);
  if (option != null) {
    var colName = option.value;
    var colLabel = getTrueLabel(option);
    var tableName = getTablenameFromOption(option);
    var tableLabel = getTablelabelFromOption(option);
    var bt = getBaseTable(option);
    var btl = getBaseTableLabel(option);
    var ext = getHeaderAttr(option);
    var listItemId = gel(prefix + 'sc_list_item_id');
    if (isVariables(colName) && tableName == 'item_option_new' && listItemId) {
      reflistOpen(listItemId.id, 'cat_item', 'sc_cat_item');
      return;
    }
    if (tableName.length > 0) {
      var tableParent = getParentTable(option);
      var showExtensions = shouldShowExtendedFields();
      Table.get(tableName, tableParent, false, showExtensions, function(tableDef) {
        processColumns(tableDef, [colName, colLabel, tableName, tableLabel, bt, btl, 'append', ext, prefix]);
      });
    }
  }
}

function isVariables(colName) {
  return colName && (colName == 'variables' || colName.endsWith('.variables'));
}

function getScItemVariables(request) {
  var scItemVariables = [];
  if (request.responseXML.documentElement) {
    var items = request.responseXML.getElementsByTagName("item");
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      scItemVariables.push({
        variableId: 'variables.' + item.getAttribute('variable_id'),
        questionText: item.getAttribute('question_text')
      });
    }
  }
  return scItemVariables;
}

function appendHeaderOption(select, baseTable, baseTableLabel, label) {
  appendOption(select, baseTable, label);
  var addedOption = select.options[select.options.length - 1];
  addedOption.style.color = 'blue';
  addedOption.reference = baseTable;
  addedOption.tl = baseTableLabel;
  addedOption.cl = baseTableLabel + " fields";
  addedOption.btl = baseTableLabel;
  addedOption.bt = baseTable;
  addedOption.cv = '';
  addedOption.headerAttr = 'true';
}

function appendOption(select, baseTable, label) {
  appendSelectOption(select, baseTable, document.createTextNode(label));
  return select.options[select.options.length - 1];
}

function appendVariableOption(select, baseTable, label, scItemLabel) {
  var addedOption = appendOption(select, baseTable, label);
  addedOption.innerHTML = "&nbsp;&nbsp;&nbsp;" + addedOption.innerHTML;
  addedOption.cl = label;
  addedOption.title = label;
}

function processVariables(prefix) {
  if (!prefix)
    prefix = '';
  var scItemId = $(prefix + 'sc_list_item_id').value;
  if (scItemId) {
    var glideAjax = new GlideAjax("ServiceCatalogVariables");
    glideAjax.addParam("sysparm_type", "get_sc_item_variables");
    glideAjax.addParam("sysparm_sc_item_id", scItemId);
    glideAjax.getXML(setVariableOptions, null, [prefix, scItemId]);
  }
}

function setVariableOptions(request, args) {
  var prefix = args[0];
  var scItemId = args[1];
  var scItemLabel = $('sys_display.' + prefix + 'sc_list_item_id').value;
  var select = $(prefix + 'select_0');
  var option = getSingleSelectedOption(select);
  var baseTable = getBaseTable(option);
  var baseTableLabel = getBaseTableLabel(option);
  select.options.length = 0;
  appendHeaderOption(select, baseTable, baseTableLabel, baseTableLabel + " fields");
  appendHeaderOption(select, baseTable, baseTableLabel, ".Variables-->" + scItemLabel);
  var variables = getScItemVariables(request);
  var selectedOptions = document.getElementById(prefix + 'select_1').options;
  for (var i = 0; i < variables.length; i++) {
    var variableId = variables[i].variableId;
    var questionText = variables[i].questionText;
    if (isNotInSelectedOptions(variableId, selectedOptions))
      appendVariableOption(select, variableId, questionText, scItemLabel);
  }
  return true;
}

function isNotInSelectedOptions(variableId, selectedOptions) {
  for (var i = 0; i < selectedOptions.length; i++) {
    if (variableId == selectedOptions[i].value)
      return false;
  }
  return true;
}

function showExpandFile(select, prefix) {
  if (!prefix)
    prefix = "";
  var select = document.getElementById(prefix + 'select_0');
  var option = getSingleSelectedOption(select);
  if (option != null) {
    if (option.value == "ext_separator") {
      setPreference("show_extended_fields", "false");
      showExtFields = false;
      setSingleSelectOption(select.options[0], prefix + 'select_0');
      refreshAvailable();
      return;
    }
    if (option.value == "ext_separator_show") {
      deletePreference("show_extended_fields");
      showExtFields = true;
      setSingleSelectOption(select.options[0], prefix + 'select_0');
      refreshAvailable();
      return;
    }
    var tableName = getTablenameFromOption(option);
    var isHeader = getHeaderAttr(option);
    if (isHeader) {
      expandFile(select, prefix);
      return;
    }
    if (tableName.length > 0) {
      var button = document.getElementById(prefix + 'expand_x0');
      if (button) {
        button.style.display = "block";
      }
      button = document.getElementById(prefix + 'expand_x0s');
      if (button) {
        button.style.display = "none";
      }
      setSingleSelectOption(option, prefix + 'select_1');
      return;
    }
  }
}

function setSingleSelectOption(soption, sid) {
  var select = document.getElementById(sid);
  select.selectedIndex = -1;
  var sourceOptions = select.options;
  for (var i = 0; i < sourceOptions.length; i++) {
    option = sourceOptions[i];
    if (option.value == soption.value) {
      option.selected = true;
      select.disabled = true;
      select.disabled = false;
      break;
    }
  }
}

function getSingleSelectedOption(select) {
  var sourceOptions = select.options;
  var index = 0;
  var selectedIndex = -1;
  for (var i = 0; i < select.length; i++) {
    option = sourceOptions[i];
    if (option.selected) {
      selectedIndex = i;
      index++;
      if (index > 1)
        break;
    }
  }
  if (index == 1) {
    var option = sourceOptions[selectedIndex];
    return option;
  }
  return null;
}

function processColumns(tableDef, args) {
  var colName = args[0];
  var colLabel = args[1];
  var tableName = args[2];
  var tableLabel = args[3];
  var baseTable = args[4];
  var baseTableLabel = args[5];
  var append = args[6];
  var ext = args[7];
  var prefix = args[8];
  if (!prefix)
    prefix = "";
  var idx = colLabel.indexOf("-->");
  if (idx > -1)
    colLabel = colLabel.substring(0, idx);
  else if (colLabel.indexOf(" fields") > -1) {
    colLabel = '';
    colName = '';
  }
  var select = document.getElementById(prefix + 'select_0');
  var si = 0;
  var tFile = tableLabel + " fields";
  if (colLabel != '')
    tFile = colLabel + "-->" + tFile
  var si = 0;
  if (append == 'append') {
    for (si = 0; si < select.options.length; si++) {
      var option = select.options[si];
      var optValue = option.value;
      var optLabel = getTrueLabel(option);
      var isHeader = getHeaderAttr(option);
      if (!isHeader)
        break;
      if (optLabel == tFile)
        break;
    }
  }
  while (select.length > si) {
    select.remove(si);
  }
  var selectType = gel('sysparm_form');
  if (!selectType || selectType.value != 'list')
    ext = false;
  if (colLabel != '') {
    if (si == 0) {
      appendSelectOption(select, baseTable, document.createTextNode(baseTableLabel + " fields"));
      var xxx = select.options[select.options.length - 1];
      xxx.style.color = 'blue';
      xxx.reference = baseTable;
      xxx.tl = baseTableLabel;
      xxx.cl = baseTableLabel + " fields";
      xxx.btl = baseTableLabel;
      xxx.bt = baseTable;
      xxx.cv = '';
      xxx.headerAttr = 'true';
      si = 1;
    }
    var idx = tFile.lastIndexOf(".");
    if (idx > -1)
      tFile = tFile.substring(idx + 1);
    if (si > 6)
      si = 6;
    tFile = ".......".substring(0, si) + tFile;
    appendSelectOption(select, colName, document.createTextNode(tFile));
    var xxx = select.options[select.options.length - 1];
    var lastpart = colName.substring(colName.lastIndexOf('.') + 1);
    if (lastpart.indexOf("ref_") == 0) {
      xxx.style.color = 'darkred';
      xxx.title = "Extended fields from " + tableLabel + " table";
    } else {
      xxx.style.color = 'blue';
      xxx.title = "Derived fields from " + colLabel + " reference field";
    }
    xxx.reference = tableName;
    xxx.tl = tableLabel;
    xxx.cl = tFile;
    xxx.cv = colName;
    xxx.headerAttr = 'true';
  }
  var items;
  if (ext && si > 0)
    items = tableDef.getTableElements(tableName);
  else
    items = tableDef.getElements();
  if (selectType && selectType.value == 'section') {
    var reqFields = gel("required_fields");
    if (reqFields)
      var reqFieldsArray = reqFields.value.split(",");
  }
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var t = item.getName();
    if (t == 'sys_id')
      continue;
    if (colLabel != '')
      t = colName + "." + t;
    var label = item.getLabel();
    var leftLabel = item.getClearLabel();
    var rawLabel = item.getClearLabel();
    if (colLabel != '')
      rawLabel = colLabel + "." + rawLabel;
    while (rawLabel.indexOf(".") == 0)
      rawLabel = rawLabel.substring(1);
    var curOptions = document.getElementById(prefix + 'select_1').options;
    var ref = item.getReference();
    var type = item.getType();
    if (item.getNamedAttribute("slushbucket_ref_no_expand") == "true")
      ref = null;
    var skipAdd = false;
    if (ref == null || ref.length == 0) {
      for (var oi = 0; oi < curOptions.length; oi++) {
        var ov = curOptions[oi].value;
        if (t == ov) {
          skipAdd = true;
          break;
        }
      }
    }
    if (selectType && selectType.value == 'list' && item.getNamedAttribute("list_layout_ignore") == "true")
      skipAdd = true;
    if (skipAdd == false) {
      if (ref != null && ref.length) {
        label += " [+]";
        leftLabel += " [+]";
      }
      appendSelectOption(select, t, document.createTextNode(leftLabel));
      var opt = select.options[select.options.length - 1];
      var yyy = opt.innerHTML;
      if (colLabel != '')
        opt.innerHTML = "&nbsp;&nbsp;&nbsp;" + yyy;
      opt.cl = rawLabel;
      opt.cv = t;
      var title = item.getAttribute("title");
      opt.reference = ref;
      if (ref != null && ref.length) {
        opt.parentTable = tableDef.getName();
        opt.style.color = 'green';
        opt.doNotDelete = 'true';
        opt.tl = item.getAttribute("reflabel");
        opt.bt = baseTable;
        opt.btl = baseTableLabel;
      }
      if (typeof reqFieldsArray != 'undefined') {
        for (var r = 0; r < reqFieldsArray.length; r++) {
          if (reqFieldsArray[r] == opt.value) {
            opt.style.color = 'grey';
            if (title != "")
              title = title + " - " + "Required on form";
            else
              title = "Required on form";
          }
        }
      }
      opt.title = title;
    }
  }
  if (append != 'append')
    return;
  if (!selectType || selectType.value != 'list')
    return;
  items = tableDef.getExtensions();
  if (items.length > 0) {
    appendSelectOption(select, t, document.createTextNode("Extended field header"));
    var opt = select.options[select.options.length - 1];
    var extHeader = "-- Hide Extended Fields --";
    opt.value = "ext_separator";
    if (!shouldShowExtendedFields()) {
      extHeader = "-- Show Extended Fields --"
      opt.value = "ext_separator_show";
    }
    if (colLabel != '')
      extHeader = "&nbsp;&nbsp;&nbsp;" + extHeader;
    opt.innerHTML = extHeader;
    opt.style.color = "darkred";
    opt.doNotMove = 'true';
    opt.doNotDelete = 'true';
    if (shouldShowExtendedFields()) {
      var addMe = [];
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var exttable = item.getName();
        var tab = Table.get(exttable);
        var extfields = tab.getTableElements(exttable);
        for (var j = 0; j < extfields.length; j++) {
          var extfield = extfields[j];
          addMe.push({
            label: extfield.getLabel(),
            ext: item.getExtName(),
            extlabel: item.getLabel(),
            field: extfield,
            ref: extfield.isReference()
          });
        }
      }
      var sortedAddMe = addMe.sort(sortExtendedFieldsByLabel);
      for (var i = 0; i < sortedAddMe.length; i++) {
        var efield = sortedAddMe[i];
        var field = efield.field.getAttribute("value");
        var label = efield.field.getClearLabel() + " [" + efield.extlabel + "]";
        var ext;
        if (colName && colName != '')
          ext = colName + ".ref_";
        appendSelectOption(select, ext + field, document.createTextNode("extended field option"));
        var opt = select.options[select.options.length - 1];
        var innerHTML = label;
        if (efield.field.isReference()) {
          opt.reference = efield.field.getReference();
          opt.doNotDelete = 'true';
          innerHTML = innerHTML + " [+]"
        }
        if (colLabel != '')
          innerHTML = "&nbsp;&nbsp;&nbsp;" + innerHTML;
        opt.innerHTML = innerHTML;
        opt.style.color = 'darkred';
        if (colLabel && colLabel != '')
          opt.cl = colLabel + "." + label;
        else
          opt.cl = label;
        opt.bt = tableDef.getName();
        opt.btl = tableDef.getLabel();
      }
    }
  }
}

function sortExtendedFieldsByLabel(a, b) {
  if (a.label > b.label)
    return 1;
  if (a.label < b.label)
    return -1;
  return 0;
}

function switchOrder(sourceSelect, forceAscending) {
  if (sourceSelect.selectedIndex > -1) {
    var option = sourceSelect.options[sourceSelect.selectedIndex];
    var text = option.text;
    var newtext = text;
    var index = text.indexOf('(');
    if (index != -1)
      newtext = text.substring(0, index);
    if (forceAscending == 1 || text.indexOf('(z to a)') > -1) {
      newtext = newtext + '(a to z)';
    } else
      newtext = newtext + '(z to a)';
    option.text = newtext;
  } else
    alert('Please select an item from the list first');
}

function showSelected(element, divname, table) {
  if (element.selectedIndex > -1) {
    var option = element.options[element.selectedIndex];
    if (option.value == "")
      return;
    var url = "xmlhttp.do?sysparm_processor=SingleRecord" + "&sysparm_name=" +
      table + "&sysparm_sys_id=" + option.value;
    serverRequest(url, singleRecordResponse, new Array(divname));
  }
}

function singleRecordResponse(request, args) {
  var divname = args[0];
  var preview = document.getElementById(divname);
  clearNodes(preview);
  if (request.responseXML.documentElement) {
    var items = request.responseXML.getElementsByTagName("item");
    for (var iCnt = 0; iCnt < items.length; iCnt++) {
      var item = items[iCnt];
      var name = item.getAttribute("label");
      var tr = document.createElement('tr');
      var tdLabel = document.createElement('td');
      tdLabel.className = "label";
      tdLabel.setAttribute('noWrap', 'true');
      var label = document.createElement('label');
      label.appendChild(document.createTextNode(name));
      tdLabel.appendChild(label);
      tr.appendChild(tdLabel);
      var tdValue = document.createElement('td');
      tr.appendChild(tdValue);
      label = document.createElement('label');
      var evalue = item.getAttribute("value");
      label.appendChild(document.createTextNode(evalue));
      tdValue.appendChild(label);
      preview.appendChild(tr);
    }
    _frameChanged();
  }
}

function getTrueLabel(o) {
  return o.cl || o.getAttribute('cl');
}

function getCV(o) {
  return o.cv || o.getAttribute('cv');
}

function getTitle(o) {
  return o.title || o.getAttribute('title');
}

function getBaseTable(o) {
  return o.bt || o.getAttribute('bt');
}

function getBaseTableLabel(o) {
  return o.btl || o.getAttribute('btl');
}

function getParentTable(o) {
  return o.parentTable || o.getAttribute('parentTable') || o.getAttribute('parenttable');
}

function getHeaderAttr(o) {
  var isHeader = o.headerAttr || o.getAttribute('headerAttr') || o.getAttribute('headerattr');
  if ('true' == isHeader)
    return true;
  else
    return false;
}

function getDoNotDelete(o) {
  return o.doNotDelete || o.getAttribute("doNotDelete") || o.getAttribute("donotdelete") || "";
}

function getDoNotMove(o) {
  return o.doNotMove || o.getAttribute('doNotMove') || o.getAttribute('donotmove') || "";
}

function getMultipleAllowed(o) {
  return o.multipleAllowed || o.getAttribute('multipleAllowed') || o.getAttribute('multipleallowed') || "";
}

function getCopyAttributes(o) {
  return o.copyAttributes || o.getAttribute('copyAttributes') || o.getAttribute('copyattributes') || "";
}

function getShowAnnotation(o) {
  return o.showAnnotation || o.getAttribute('showAnnotation') || o.getAttribute('showannotation') || "";
}

function getAnnotationText(o) {
  return o.annotationText || o.getAttribute('annotationText') || o.getAttribute('annotationtext') || "";
}

function getAnnotationTextType(o) {
  return o.annotationIsPlainText || o.getAttribute('annotationIsPlainText') || o.getAttribute('annotationisplaintext') || "";
}

function getAnnotationType(o) {
  return o.annotationType || o.getAttribute('annotationType') || o.getAttribute('annotationtype') || "";
}

function getAnnotationID(o) {
  return o.annotationID || o.getAttribute('annotationID') || o.getAttribute('annotationid') || "";
}

function getAnnotationTextLabel(o) {
  return o.text_label || o.getAttribute('text_label') || "";
}

function getShowChart(o) {
  return o.showChart || o.getAttribute('showChart') || o.getAttribute('showchart') || "";
}

function getChartID(o) {
  return o.chartID || o.getAttribute('chartID') || o.getAttribute('chartid') || "";
}

function getChartLabel(o) {
  return o.chartLabel || o.getAttribute('chartLabel') || o.getAttribute('chartlabel') || "";
}

function getDataScopeID(o) {
  return o.dataScopeID || o.getAttribute('data-scope_id') || "";
}

function getDataScopeName(o) {
  return o.dataScopeName || o.getAttribute('data-scope_name') || "";
}

function getDataScopeLabel(o) {
  return o.dataScopeLabel || o.getAttribute('data-scope_label') || "";
}

function getDataScopeConfigurable(o) {
  return o.dataScopeConfigurable || o.getAttribute('data-scope_configurable') || "";
}

function getDataParentId(o) {
  return o.dataParentId || o.getAttribute('data-parent_id') || "";
}

function getTablelabelFromOption(option) {
  var tableName = option.tl || option.getAttribute('tl');
  if (tableName === undefined || tableName == null || tableName == '')
    tableName = "";
  return tableName;
}

function getTablenameFromOption(option) {
  var tableName = option.reference || option.getAttribute('reference');
  if (tableName === undefined || tableName == null || tableName == '')
    tableName = "";
  return tableName;
}

function slushbucket_onSelect(select) {
  var annotationSpan = gel("slushbucket_annotation_span");
  if (annotationSpan != null)
    hideObject(annotationSpan);
  var chartSpan = gel("slushbucket_chart_span");
  if (chartSpan != null)
    hideObject(chartSpan);
  var option = getSingleSelectedOption(select);
  if (option == null)
    return;
  var isAnnotationOption = getShowAnnotation(option);;
  var isChartOption = getShowChart(option);
  if (!isAnnotationOption && !isChartOption)
    slideRight();
  if (isAnnotationOption)
    slushbucket_annotation_onSelect(annotationSpan, select, option);
  else if (isChartOption)
    slushbucket_chart_onSelect(chartSpan, select, option);
}
var SLUSHBUCKET_ANNOTATION_PREFIX = ".annotation.";
var SLUSHBUCKET_ANNOTATION_LABEL_PREFIX = "* Annotation";

function slushbucket_annotation_onSelect(eSpan, select, option) {
  if (eSpan == null)
    return;
  var eTxt = gel("slushbucket_annotation_text");
  if (eTxt == null)
    return;
  var eType = gel("slushbucket_annotation_type");
  if (eType == null)
    return;
  var eIsPlainText = gel("slushbucket_annotation_text_plain");
  var eIsHtmlText = gel("slushbucket_annotation_text_html");
  if (eIsPlainText == null)
    return;
  var annotation = option.value.substring(SLUSHBUCKET_ANNOTATION_PREFIX.length);
  var typeIndex = 0;
  var text = option.getAttribute("annotationtext");
  var type = option.getAttribute("annotationtype");
  var isPlainText = option.getAttribute("annotationisplaintext");
  if (isPlainText == "true") {
    eIsPlainText.setAttribute("checked", "checked");
    eIsHtmlText.removeAttribute("checked");
  } else {
    eIsHtmlText.setAttribute("checked", "checked");
    eIsPlainText.removeAttribute("checked");
  }
  label = getAnnotationTextLabel(eType.options[0]);
  if (type != "") {
    for (var i = 0; i < eType.options.length; i++) {
      if (eType.options[i].value == type) {
        typeIndex = i;
        label = getAnnotationTextLabel(eType.options[i]);
        break;
      }
    }
  }
  eType.selectedIndex = typeIndex;
  eTxt.value = text;
  eTxt.setAttribute("selectindex", option.index);
  slushbucket_setAnnotationLabel(label);
  hideObject(eSpan);
  slideLeft(function() {
    showObject(eSpan);
  });
  if (!window.$j)
    showObject(eSpan);
  slushbucket_annotation_onChange(select);
}

function slushbucket_setAnnotationLabel(label) {
  var eTxtSpan = gel("slushbucket_annotation_text_span");
  if (eTxtSpan == null)
    return;
  eTxtSpan.innerHTML = label;
}

function slushbucket_annotation_onChange(select) {
  var eTxt = gel("slushbucket_annotation_text");
  if (eTxt == null)
    return;
  var eType = gel("slushbucket_annotation_type");
  if (eType == null)
    return;
  var eTextTypeHtml = gel("slushbucket_annotation_text_html");
  var eTextTypePlain = gel("slushbucket_annotation_text_plain");
  if (eTextTypeHtml == null || eTextTypePlain == null)
    return;
  var option = select[eTxt.getAttribute("selectindex")];
  if (option == null)
    return;
  var showAnnotation = getShowAnnotation(option);
  if (showAnnotation) {
    var type = eType.options[eType.selectedIndex].value;
    var typeLabel = eType.options[eType.selectedIndex].text;
    var text = eTxt.value;
    var isPlainText = eTextTypePlain.checked;
    option.setAttribute("annotationtype", type);
    option.annotationType = type;
    option.setAttribute("annotationtext", text);
    option.annotationText = text;
    option.setAttribute("annotationisplaintext", isPlainText);
    option.annotationIsPlainText = isPlainText;
    var id = option.getAttribute("annotationid");
    if (option.value == SLUSHBUCKET_ANNOTATION_PREFIX) {
      id = guid();
      option.setAttribute("annotationid", id);
    }
    option.value = SLUSHBUCKET_ANNOTATION_PREFIX + id + "." + type + "." + isPlainText + "." + text;
    option.text = getMessage(SLUSHBUCKET_ANNOTATION_LABEL_PREFIX) + " (" + typeLabel + ")";
    slushbucket_setAnnotationLabel(getAnnotationTextLabel(eType.options[eType.selectedIndex]));
  }
}
var SLUSHBUCKET_CHART_PREFIX = ".chart.";
var SLUSHBUCKET_CHART_LABEL_PREFIX = "* Chart";

function slushbucket_chart_onSelect(eSpan, select, option) {
  if (eSpan == null)
    return;
  var eLabel = gel("slushbucket_chart_label");
  if (eLabel == null)
    return;
  var label = option.getAttribute("chartlabel");
  eLabel.value = label;
  eLabel.setAttribute("selectindex", option.index);
  hideObject(eSpan);
  slideLeft(function() {
    showObject(eSpan);
  });
  if (!window.$j)
    showObject(eSpan);
  slushbucket_chart_onChange(select);
}

function slushbucket_chart_onChange(select) {
  var eLabel = gel("slushbucket_chart_label");
  if (eLabel == null)
    return;
  var option = select[eLabel.getAttribute("selectindex")];
  if (option == null)
    return;
  var showChart = getShowChart(option);
  if (showChart) {
    var label = eLabel.value;
    var id = option.getAttribute("chartid");
    if (option.value == SLUSHBUCKET_CHART_PREFIX) {
      id = guid();
      option.setAttribute("chartid", id);
    }
    option.setAttribute("chartlabel", label);
    option.value = SLUSHBUCKET_CHART_PREFIX + id + "." + label;
    option.text = getMessage(SLUSHBUCKET_CHART_LABEL_PREFIX);
  }
}

function getTarget() {
  var typeId = '';
  var el = gel('sys_target');
  if (el)
    typeId = el.value;
  return typeId;
}

function saveListInBackground() {
  var listId = getTarget();
  var dd = new GlideModal('hierarchical_progress_viewer', true);
  dd.setTitle("Saving Form List");
  dd.setPreference('sysparm_ajax_processor', 'AJAXSysListSaveWorker');
  dd.setPreference('sysparm_ajax_processor_list_id', listId);
  dd.setPreference('sysparm_ajax_processor_view_name', document.editPage.sysparm_view.value);
  dd.setPreference('sysparm_ajax_processor_fields_selected', document.editPage.lcodes_1.value);
  dd.setPreference('sysparm_renderer_expanded_levels', '0');
  dd.setPreference('sysparm_renderer_hide_drill_down', true);
  dd.setPreference('sysparm_button_close', 'Close');
  dd.on("executionStarted", function(response) {
    g_progress_id = response.responseXML.documentElement.getAttribute("answer");
  });
  dd.on("executionComplete", function(trackerObj) {
    g_progress_id = null;
    slushbucketFieldsAdded = false;
    var closeBtn = $("sysparm_button_close");
    if (closeBtn) {
      closeBtn.onclick = function() {
        dd.destroy();
      };
    }
  });
  dd.on("beforeclose", function() {
    if (typeof g_progress_id === 'string') {
      GlideUI.get().addOutputMessage({
        msg: "New fields are still being added in the background. <a href='/sys_execution_tracker.do?sys_id=" + g_progress_id + "' target='_blank'>Click here</a> to see status.",
        type: "info",
        id: 'schema_change_in_progress'
      });
    } else {
      setTimeout(function() {
        gsftSubmit($('sysverb_cancel'));
      }, 200);
    }
  });
  dd.render();
  $$("form #sysverb_save").forEach(function(el) {
    el.disable();
  });
}

function saveSectionInBackground() {
  var sectionId = getTarget();
  var dd = new GlideModal('hierarchical_progress_viewer', true);
  dd.setTitle("Saving Form Section");
  dd.setPreference('sysparm_ajax_processor', 'AJAXSysSectionSaveWorker');
  dd.setPreference('sysparm_ajax_processor_section_id', sectionId);
  dd.setPreference('sysparm_ajax_processor_view_name', document.editPage.sysparm_view.value);
  dd.setPreference('sysparm_ajax_processor_section_order', document.editPage.lcodes_2.value);
  dd.setPreference('sysparm_ajax_processor_fields_selected', document.editPage.lcodes_1.value);
  dd.setPreference('sysparm_renderer_expanded_levels', '0');
  dd.setPreference('sysparm_renderer_hide_drill_down', true);
  dd.setPreference('sysparm_button_close', 'Close');
  dd.on("executionStarted", function(response) {
    g_progress_id = response.responseXML.documentElement.getAttribute("answer");
  });
  dd.on("executionComplete", function(trackerObj) {
    g_progress_id = null;
    slushbucketFieldsAdded = false;
    var closeBtn = $("sysparm_button_close");
    if (closeBtn) {
      closeBtn.onclick = function() {
        dd.destroy();
      };
    }
  });
  dd.on("beforeclose", function() {
    if (typeof g_progress_id === 'string') {
      GlideUI.get().addOutputMessage({
        msg: "New fields are still being added in the background. <a href='/sys_execution_tracker.do?sys_id=" + g_progress_id + "' target='_blank'>Click here</a> to see status.",
        type: "info",
        id: 'schema_change_in_progress'
      });
    } else {
      setTimeout(function() {
        gsftSubmit($('sysverb_cancel'));
      }, 200);
    }
  });
  dd.render();
  $$("form #sysverb_save").forEach(function(el) {
    el.disable();
  });
}

function slushbucketSubmit(docEditPage) {
  saveAllSelected([
    docEditPage.select_0,
    docEditPage.select_1,
    docEditPage.sysparm_section
  ], [
    docEditPage.lcodes_0,
    docEditPage.lcodes_1,
    docEditPage.lcodes_2
  ], ',', '\\', '--None--');
  var formEl = $('sysparm_form');
  if (formEl && slushbucketFieldsAdded) {
    if (docEditPage.sys_action.value == 'sysverb_cancel')
      return true;
    if (formEl.value === 'section') {
      saveSectionInBackground();
      return false;
    }
    if (formEl.value === 'list') {
      saveListInBackground();
      return false;
    }
  }
  return true;
}

function slideLeft(onComplete) {
  doShift('left', onComplete);
}

function slideRight(onComplete) {
  doShift('right', onComplete);
}

function doShift(direction, onComplete) {
  if (!window.$j)
    return;
  var classToChange = 'col-xs-offset-2';
  var $leftColumn = $j('.slushbucket-col-left');
  if ((direction == 'left' && !$leftColumn.hasClass(classToChange)) ||
    (direction == 'right') && $leftColumn.hasClass(classToChange)) {
    if (onComplete)
      onComplete();
    return;
  }
  if (onComplete && !isMSIE9) {
    $leftColumn.bind('transitionend.slushslide', shiftCallback(onComplete));
  }
  var operation = direction == 'left' ? 'removeClass' : 'addClass';
  $leftColumn[operation](classToChange);
  if (onComplete && isMSIE9)
    onComplete();
}

function shiftCallback(onComplete) {
  return function(evt) {
    $j(evt.target).unbind('transitionend.slushslide');
    var propName = evt.originalEvent.propertyName;
    if (propName == 'margin-left')
      onComplete();
  }
}

function shouldShowExtendedFields() {
  if (window.showExtFields)
    return showExtFields == true;
  var extPref = getPreference("show_extended_fields");
  return extPref != 'false';
};
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
};;