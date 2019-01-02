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

function moveOptionAndSort(
  sourceSelect,
  targetSelect,
  keepSourceLabel,
  unmovableSourceValues,
  keepTargetLabel) {
  moveOption(sourceSelect, targetSelect, keepSourceLabel, unmovableSourceValues, keepTargetLabel, null, null, sortSupported(targetSelect));
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