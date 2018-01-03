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
          this.elem.writeAttribute("conte