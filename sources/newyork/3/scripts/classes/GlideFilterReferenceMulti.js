/*! RESOURCE: /scripts/classes/GlideFilterReferenceMulti.js */
var GlideFilterReferenceMulti = Class.create(GlideFilterReference, {
  _setup: function(values) {
    this.maxValues = 20;
    this.id = this.tr.tableField + "." + guid();
    this.listenForOperChange = true;
  },
  _initAutoCompleter: function() {
    if (!this.inputs[1].ac) {
      if (this.item.getReference("reference") == "sys_user") {
        $(this.inputs[1]).setAttribute('allow_invalid', true)
        $(this.inputs[1]).setAttribute('reference', "sys_user");
      }
      this.inputs[1].ac = new AJAXReferenceCompleterMulti(this.inputs[1], this.id, '');
      this.inputs[1].ac.elementName = this.tr.tableField;
      this.inputs[1].ac.clearDerivedFields = true;
    }
  },
  _onFocus: function(evt) {
    this._initAutoCompleter();
  },
  _onRefListOpen: function() {
    this._initAutoCompleter();
  },
  _resolveReference: function() {
    if (this.values) {
      var ajax = new GlideAjax("ResolveRefMulti");
      ajax.addParam("sysparm_name", this.tr.tableField);
      ajax.addParam("sysparm_value", this.values);
      ajax.getXML(this._resolveReferenceResponse.bind(this));
    }
  },
  _resolveReferenceResponse: function(request) {
    if (!request)
      return;
    var xml = request.responseXML;
    if (!xml)
      return;
    if (xml) {
      var items = xml.getElementsByTagName("item");
      if (items && items.length > 0) {
        this._initAutoCompleter();
        this.inputs[1].ac.resetHash();
        for (var i = 0; i < items.length; i++) {
          this.inputs[1].ac.setHash(items[i].getAttribute("label"), items[i].getAttribute("name"));
        }
        this.inputs[1].ac._setFormValues();
      }
    }
  },
  getValues: function() {
    this._initAutoCompleter();
    if (this._isMappingEnabled)
      return this.getMappingValue();
    return this.inputs[1].ac.getKeyValue();
  },
  _initValues: function(values) {
    if (!values)
      this.values = [];
    else
      this.values = values;
  }
});;