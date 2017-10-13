/*! RESOURCE: /scripts/classes/SlushBucket.js */
var SlushBucket = Class.create({
  initialize: function(id) {
    this.id = id;
    this.leftSelectJustify = "";
    this.rightSelectJustify = "";
    this.rightValues = "";
    this.evenOddColoring = false;
    this.isTemplating = false;
    this.ignoreDuplicates = false;
  },
  getLeftSelectJustify: function() {
    return this.leftSelectJustify;
  },
  setLeftSelectJustify: function(justify) {
    this.leftSelectJustify = justify;
    this.getLeftSelect().style.textAlign = justify;
  },
  getRightSelectJustify: function() {
    return this.rightSelectJustify;
  },
  setRightSelectJustify: function(justify) {
    this.rightSelectJustify = justify;
    this.getRightSelect().style.textAlign = justify;
  },
  getEvenOddColoring: function() {
    return this.evenOddColoring;
  },
  setEvenOddColoring: function(evenOdd) {
    this.evenOddColoring = evenOdd;
  },
  addLeftChoice: function(value, text) {
    var opt = cel("option");
    opt.value = value;
    opt.text = text;
    this.getLeftSelect().options.add(opt);
  },
  addRightChoice: function(value, text) {
    var opt = cel("option");
    opt.value = value;
    opt.text = text;
    this.getRightSelect().options.add(opt);
  },
  clear: function() {
    this.clearSelect(this.getLeftSelect());
    this.clearSelect(this.getRightSelect());
  },
  clearSelect: function(selectBox) {
    selectBox.options.length = 0;
  },
  getValues: function(selectBox) {
    var values = new Array();
    var options = selectBox.options;
    for (var i = 0; i < options.length; i++) {
      values[i] = options[i].value;
    }
    return values;
  },
  saveRightValues: function(values) {
    this.rightValues = values;
  },
  getRightValues: function() {
    return this.rightValues;
  },
  getSelected: function(selectBox) {
    var selectedIds = [];
    var sourceOptions = selectBox.options;
    for (var i = 0; i < sourceOptions.length; i++) {
      option = sourceOptions[i];
      if (!option.selected)
        continue;
      selectedIds.push(i);
    }
    return selectedIds;
  },
  getRightSelect: function() {
    return gel(this.id + "_right");
  },
  getLeftSelect: function() {
    return gel(this.id + "_left");
  },
  moveLeftToRight: function() {
    this.moveOptions(this.getLeftSelect(), this.getRightSelect());
  },
  moveRightToLeft: function() {
    this.moveOptions(this.getRightSelect(), this.getLeftSelect());
  },
  copyLeftToRight: function() {
    this.moveOptions(this.getLeftSelect(), this.getRightSelect(), true);
  },
  moveOptions: function(sourceSelect, targetSelect, copyFlag) {
    var selectedIds = this.getSelected(sourceSelect);
    if (selectedIds.length < 1)
      return;
    var sourceOptions = sourceSelect.options;
    var targetOptions = targetSelect.options;
    targetSelect.selectedIndex = -1;
    for (var i = 0; i < selectedIds.length; i++) {
      var soption = sourceOptions[selectedIds[i]];
      var label = soption.text;
      if ((this.ignoreDuplicates) && (this._isDuplicate(targetOptions, soption.value)))
        continue;
      option = new Option(label, sourceOptions[selectedIds[i]].value);
      option.cl = label;
      option.style.color = sourceOptions[selectedIds[i]].style.color;
      targetOptions[targetOptions.length] = option;
      targetOptions[targetOptions.length - 1].selected = true;
    }
    if (!copyFlag) {
      for (var i = selectedIds.length - 1; i > -1; i--)
        sourceSelect.remove(selectedIds[i]);
    }
    this.evenOddColorize();
    if (targetSelect["onchange"])
      targetSelect.onchange();
    if (sourceSelect["onchange"])
      sourceSelect.onchange();
    sourceSelect.disabled = true;
    sourceSelect.disabled = false;
    if (selectedIds.length > 0 && !this.isTemplating) {
      targetSelect.focus();
    }
    var rightElem = [gel(this.id + "_right").options];
    if (rightElem[0].length > 0) {
      var e = gel(this.id);
      var newVal = new Array;
      var rightElementOptions = rightElem[0];
      for (var i = 0; i < rightElementOptions.length; i++)
        newVal[i] = rightElementOptions[i].value;
      var newVal = newVal.join(',');
      var oldValue = e.value;
      if (oldValue != newVal) {
        e.value = newVal;
        multiModified(e);
      }
    } else {
      gel(this.id).value = "";
    }
  },
  moveUp: function() {
    sourceSelect = this.getRightSelect();
    var selectedIds = this.getSelected(sourceSelect);
    var options = sourceSelect.options;
    for (var i = 0; i < selectedIds.length; i++) {
      var selId = selectedIds[i];
      if (selId == 0)
        break;
      if (window['privateMoveUp'])
        privateMoveUp(options, selId);
      else
        this.swap(options[selId], options[selId - 1]);
      options[selId].selected = false;
      options[selId - 1].selected = true;
    }
    this.evenOddColorize();
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
  },
  moveDown: function() {
    var sourceSelect = this.getRightSelect();
    var selectedIds = this.getSelected(sourceSelect);
    selectedIds.reverse();
    var options = sourceSelect.options;
    for (var i = 0; i < selectedIds.length; i++) {
      var selId = selectedIds[i];
      if (selId + 1 == options.length)
        break;
      if (window['privateMoveDown'])
        privateMoveDown(options, selId);
      else
        this.swap(options[selId], options[selId + 1]);
      options[selId].selected = false;
      options[selId + 1].selected = true;
    }
    this.evenOddColorize();
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
  },
  swap: function(option1, option2) {
    if (!option2)
      return;
    var t = $j(option1).clone();
    t = t[0];
    t.text = option1.text;
    option1.value = option2.value;
    option1.text = option2.text;
    option2.value = t.value;
    option2.text = t.text;
  },
  evenOddColorize: function() {
    if (!this.evenOddColoring)
      return;
    rightSelect = this.getRightSelect();
    if (rightSelect.length < 1)
      return;
    var options = rightSelect.options;
    for (var i = 0; i < rightSelect.length; i++) {
      if ((i % 2) == 0)
        rightSelect.options[i].style.background = "white";
      else
        rightSelect.options[i].style.background = "#dddddd";
    }
  },
  _isDuplicate: function(options, value) {
    for (var i = 0; i < options.length; i++) {
      if (options[i].value == value)
        return true;
    }
    return false;
  },
  getClassName: function() {
    return "SlushBucket";
  },
  type: "Slushbucket"
});;