/*! RESOURCE: /scripts/Uploader.js */
var Uploader = Class.create({
  initialize: function(containerName, tableName, sys_id) {
    this.containerName = containerName;
    this.height = 20;
    this._createInput();
    this.sys_id = sys_id;
    this.tableName = tableName;
    this.fieldName;
    this.callback;
    Event.observe(window, 'unload', this._reset.bind(this));
    this.startLoading;
    this.tempSpot;
    this.mouseDown = false;
  },
  setCallback: function(fDefinition) {
    this.callback = fDefinition;
  },
  setStartLoading: function(fDefinition) {
    this.startLoading = fDefinition;
  },
  setFieldName: function(fieldName) {
    this.fieldName = fieldName;
  },
  setTitle: function(title) {
    this.input.title = title;
  },
  setHeight: function(height) {
    if (this.height == height)
      return;
    this.height = height;
    this.input.parentNode.removeChild(this.input);
    delete(this.input);
    this._createInput();
  },
  _createInput: function() {
    var parent = this.containerName;
    if (this.tempSpot)
      parent = this.tempSpot;
    parent = $(parent);
    this.input = new Element("input");
    var input = this.input;
    input.setAttribute("type", "file");
    input.className = "upload_input_file";
    input.name = this.containerName + "_input_file";
    input.setStyle({
      display: 'inline',
      height: this.height + "px",
      width: this.height + "px",
      fontSize: this.height + "px",
      opacity: "0 !important",
      filter: "alpha(opacity=0) !important",
      cursor: "pointer !important",
      zIndex: (isMSIE7) ? "100" : "100 !important"
    });
    Event.observe(input, 'change', this._onFileChange.bind(this, input));
    parent.appendChild(input);
  },
  _onFileChange: function(input) {
    if (this.startLoading)
      this.startLoading.call();
    var iframe = this._createIFrame();
    var form = this._createForm();
    form.appendChild(this.input);
    Event.observe(iframe, 'load', this._uploaded.bind(this));
    form.submit();
  },
  _uploaded: function() {
    var f = this.iframe;
    var doc = null;
    if (isMSIE)
      doc = f.contentWindow.document.XMLDocument ? f.contentWindow.document.XMLDocument : f.contentWindow.document;
    else
      doc = f.contentDocument;
    var root = doc.documentElement;
    if (this.callback) {
      var uri = root.getAttribute('attachment_uri');
      var name = root.getAttribute('file_name');
      var sys_id = root.getAttribute('sys_id');
      this.callback.call(this, uri, name, sys_id);
    }
    this.form.parentNode.removeChild(this.form);
    delete this.form;
    this.form = null;
    var iframe = this.iframe;
    this.iframe = null;
    setTimeout(function() {
      iframe.parentNode.removeChild(iframe);
      delete iframe;
    }, 1000);
    this._createInput();
  },
  _createIFrame: function() {
    var name = this.containerName + "_iframe";
    var s = "<iframe src='javascript: false' name='" + name + "'/>";
    this.iframe = toElement(s);
    this.iframe.style.display = 'none';
    this.iframe.style.position = 'absolute';
    this.iframe.style.left = '-999px';
    document.body.appendChild(this.iframe);
    return this.iframe;
  },
  _createForm: function() {
    this.containerName + "_form";
    var s = "<form method='post' enctype='multipart/form-data' name='" + this.containerName + "' ></form>";
    var form = toElement(s)
    this._addInput(form, "sysparm_table", this.tableName);
    this._addInput(form, "sysparm_xml", "true");
    if (this.fieldName)
      this._addInput(form, "sysparm_fieldname", this.fieldName);
    this._addInput(form, "sysparm_sys_id", this.sys_id);
    if (typeof g_ck != 'undefined')
      this._addInput(form, "sysparm_ck", g_ck);
    form.setAttribute("action", "sys_attachment.do");
    form.setAttribute("target", this.containerName + "_iframe");
    form.style.display = 'none';
    form.style.position = 'absolute';
    form.style.left = '-999px';
    this.form = form;
    document.body.appendChild(this.form);
    return form;
  },
  _addInput: function(form, name, value) {
    var input = cel("input");
    input.value = value;
    input.name = name;
    form.appendChild(input);
  },
  _reset: function() {
    this.input = null;
  },
  moveInputTo: function(elementName) {
    this.tempSpot = elementName;
    if (elementName == null)
      elementName = this.containerName;
    var input = this.input;
    var p = input.parentNode;
    var parent = gel(elementName);
    if (p == parent)
      return;
    input.parentNode.removeChild(input);
    parent.appendChild(input);
  },
  toString: function() {
    return 'Uploader';
  }
});

function toElement(innerHTML) {
  var div = cel('div');
  div.innerHTML = innerHTML;
  var element = div.firstChild;
  div.removeChild(element);
  return element;
};