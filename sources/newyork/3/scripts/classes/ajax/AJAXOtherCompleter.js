/*! RESOURCE: /scripts/classes/ajax/AJAXOtherCompleter.js */
var AJAXOtherCompleter = Class.create(AJAXCompleter, {
      initialize: function(element, reference) {
        AJAXCompleter.prototype.initialize.call(this, 'AC.' + reference, reference);
        this.className = "AJAXReferenceCompleter";
        this.dirty = false;
        this.matched = false;
        this.fieldChanged = false;
        this.ignoreAJAX = false;
        this.type = null;
        this.refField = null;
        this.textValue = "";
        this.invisibleTextValue = "";
        this.savedTextValue = "";
        this.savedInvisibleTextValue = "";
        this.previousTextValue = "";
        this.resultsStorage = new Object();
        this.emptyResults = new Object();
        this.oldFunctionJunk();
      },
      setInvisibleField: function(f) {
        this.iField = f;
        this._setAC(f);
      },
      setField: function(f) {
          this.field = f;
          this.field.autocomplete = "off";
          this._setAC(