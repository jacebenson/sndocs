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
      onKeyMoveLeftToRight: function(evt) {
        var desiredKeyCode = this._isRTL() ? 37 : 39;
        if (evt.keyCode != desiredKeyCode)
          return;
        this.moveOptions(this.getLeftSelect(), this.getRightSelect());
      },
      onKeyMoveRightToLeft: function(evt) {
        var desiredKeyCode = this._isRTL() ? 39 : 37;
        if (evt.keyCode != desiredKeyCode)
          return;
        this.moveOptions(this.getRightSelect(), this.getLeftSelect());
      },
      moveLeftToRight: function() {
        this.moveOptions(this.getLeftSelect(), this.getRightSelect());
      },
      moveRightToLeft: function() {
        this.moveOptions(this.getRightSelect(), this.getLeftSelect());
      },
      copyLeftToRight: function() {
          this.moveOptions(this.getLeftSelect(), this.getRightS