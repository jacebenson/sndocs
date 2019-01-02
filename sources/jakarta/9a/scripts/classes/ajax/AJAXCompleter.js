/*! RESOURCE: /scripts/classes/ajax/AJAXCompleter.js */
var AJAXCompleter = Class.create({
      KEY_BACKSPACE: 8,
      KEY_TAB: 9,
      KEY_RETURN: 13,
      KEY_ESC: 27,
      KEY_LEFT: 37,
      KEY_UP: 38,
      KEY_RIGHT: 39,
      KEY_DOWN: 40,
      KEY_DELETE: 46,
      KEY_HOME: 36,
      KEY_END: 35,
      KEY_PAGEUP: 33,
      KEY_PAGEDOWN: 34,
      initialize: function(name, elementName) {
        this.guid = guid();
        this.className = "AJAXCompleter";
        this.name = name;
        this.elementName = elementName;
        this.field = null;
        this.menuBorderSize = 1;
        this.resetSelected();
        this.ieIFrameAdjust = 4;
        this.initDropDown();
        this.initIFrame();
      },
      initDropDown: function() {
          var dd = gel(this.name);
          if (!dd) {
            dd = cel("div");
            dd.id = this.name;
            dd.className = "ac_dropdown";
            dd.setAttribute('role', 'listbox');
            var style = dd.style;
            style.border = "black " + this.menuBorderSize + "px solid";
            this._setCommonStyles(style);
            style.backgroundColor = "white";
            style.zIndex = 20000;
          }
          this.dropDown = $(dd);
          addChild(dd);
          this.clearDropDown();
          this.currentMenuItems = [];
          this.currentMenuCount = this.currentMenuItems.lengt