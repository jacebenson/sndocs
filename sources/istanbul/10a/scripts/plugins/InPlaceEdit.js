/*! RESOURCE: /scripts/plugins/InPlaceEdit.js */
Plugin.create('inPlaceEdit', {
  initialize: function(elem, options) {
    if (elem.retrieve('inPlaceEdit'))
      return;
    this.options = Object.extend({
      editOnSingleClick: false,
      turnClickEditingOff: false,
      onBeforeEdit: function() {},
      onAfterEdit: function() {},
      selectOnStart: false,
      convertNbspToSpaces: true,
      titleText: null
    }, options || {});
    this.elem = elem;
    this.elem.setAttribute('class', 'content_editable');
    var mouseEvent;
    if (!this.options.turnClickEditingOff) {
      if (this.options.editOnSingleClick)
        mouseEvent = 'click';
      else
        mouseEvent = 'dblclick';
      this.elem.observe(mouseEvent, this.beginEdit.bind(this));
    }
    this.elem.onselectstart = function() {
      return true;
    };
    this.elem.style.MozUserSelect = 'text';
    if (this.options.titleText)
      this.elem.writeAttribute('title', this.options.titleText);
    this.keyPressHandler = this.keyPress.bind(this);
    this.keyDownHandler = this.keyDown.bind(this);
    this.endEditHandler = this.endEdit.bind(this);
    this.elem.beginEdit = this.beginEdit.bind(this);
    this.elem.store('inPlaceEdit', this);
  },
  beginEdit: function(event) {
    this.options.onBeforeEdit.call(this);
    this.elem.writeAttribute("contentEditable", "true");
    this.elem.addClassName("contentEditing");
    this.elem.observe('keypress', this.keyPressHandler);
    this.elem.observe('keydown', this.keyDownHandler);
    this.elem.observe('blur', this.endEditHandler);
    this.elem.focus();
    if (this.options.selectOnStart) {
      this.elem.select();
      var range;
      if ((range = document.createRange)) {
        if (range.selectNodeContents) {
          range.selectNodeContents(this.elem);
          window.getSelection().addRange(range);
        }
      } else if (document.body.createTextRange) {
        range = document.body.createTextRange();
        if (range.moveToElementText) {
          range.moveToElementText(this.elem);
          range.collapse(true);
          range.select();
        }
      }
    }
    this.oldValue = this.elem.innerHTML;
    if (typeof event != 'undefined' && event)
      Event.stop(event);
  },
  keyPress: function(event) {
    return this._submitEdit(event);
  },
  keyDown: function(event) {
    return this._submitEdit(event);
  },
  endEdit: function(event) {
    this.elem.writeAttribute("contentEditable", "false");
    this.elem.removeClassName("contentEditing");
    this.elem.stopObserving('keypress', this.keyPressHandler);
    this.elem.stopObserving('blur', this.endEditHandler);
    var newValue = this.elem.innerHTML.replace(/<br>$/, '');
    if (this.options.convertNbspToSpaces)
      newValue = newValue.replace(/&nbsp;/g, ' ');
    if (newValue != this.oldValue) {
      newValue = newValue.replace(/^\s+|\s+$/g, '');
      this.elem.update(newValue);
      this.options.onAfterEdit.call(this, newValue);
    }
    return false;
  },
  _submitEdit: function(event) {
    var key = event.which || event.keyCode;
    var e = Event.element(event);
    if (key == Event.KEY_RETURN) {
      e.blur();
      Event.stop(event);
      return false;
    }
    if (key == Event.KEY_ESC) {
      this.elem.innerHTML = this.oldValue;
      e.blur();
      return false;
    }
    return true;
  }
});;