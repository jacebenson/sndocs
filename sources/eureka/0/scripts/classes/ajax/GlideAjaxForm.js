var GlideAjaxForm = Class.create(GlideAjax, {
  PROCESSOR: 'RenderInfo',
  initialize: function($super, templateName) {
    $super(this.PROCESSOR);
    this._formPreferences = {};
    this._templateName = templateName;
    this.setPreference('renderer', 'RenderForm');
    this.setPreference('type', 'direct');
    this.setPreference('table', templateName);
    this.addParam('sysparm_name', templateName);
    this.addParam('sysparm_value', this.getSysparmValue());
  },
  getRenderedBodyText: function(callback) {
    this._renderedBodyCallback = callback;
    this.getXML(this._parseTemplate.bind(this));
  },
  _parseTemplate: function(response) {
    s = response.responseText;
    s = s.substring(s.indexOf('<rendered_body>') + 15);
    s = s.substring(0, s.indexOf('</rendered_body>'));
    s = s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&apos;/g, "'");
    this._renderedBodyCallback(s);
  },
  setPreference: function(k, v) {
    this._formPreferences[k] = v;
  },
  getPreferences: function() {
    return this._formPreferences;
  },
  getSysparmValue: function() {
    var gxml = document.createElement('gxml');
    var sec = document.createElement('section');
    sec.setAttribute('name', this._templateName);
    gxml.appendChild(sec);
    for (var i in this._formPreferences) {
      var e = document.createElement('preference');
      e.setAttribute('name', i);
      e.setAttribute('value', this._formPreferences[i]);
      sec.appendChild(e);
    }
    return gxml.innerHTML;
  },
  toString: function() {
    return 'GlideAjaxForm';
  }
});