var GlideManager = Class.create({
  initialize: function(options) {
    this.options = Object.extend({
      preferences: {},
      properties: {},
      settings: {}
    }, options || {});
    this._browserFocused = true;
    CustomEvent.observe(GlideEvent.WINDOW_BLURRED, function() {
      this._browserFocused = false;
    }.bind(this));
    CustomEvent.observe(GlideEvent.WINDOW_FOCUSED, function() {
      this._browserFocused = true;
    }.bind(this));
  },
  hasPreference: function(prefName) {
    return this.options.preferences.hasOwnProperty(prefName);
  },
  getPreference: function(prefName, defaultValue) {
    if (!this.hasPreference(prefName))
      return defaultValue;
    var v = this.options.preferences[prefName];
    if (v !== undefined && typeof v == 'string')
      return v.match(/^true$/i) ? true : (v.match(/^false$/i) ? false : v);
    return v;
  },
  setPreference: function(name, value) {
    setPreference(name, value);
    this.options.preferences[name] = value;
  },
  loadPreferences: function(o) {
    this.options.preferences = Object.extend(this.options.preferences, o);
  },
  hasProperty: function(key) {
    return this.options.properties.hasOwnProperty(key);
  },
  getProperty: function(key, defaultValue) {
    if (!this.hasProperty(key))
      return defaultValue;
    var v = this.options.properties[key];
    if (v !== undefined && typeof v == 'string')
      return v.match(/^true$/i) ? true : (v.match(/^false$/i) ? false : v);
    return v;
  },
  setProperty: function(name, value) {
    setProperty(name, value);
    this.options.properties[name] = value;
  },
  loadProperties: function(o) {
    this.options.properties = Object.extend(this.options.properties, o);
  },
  hasSetting: function(setting) {
    return this.options.settings.hasOwnProperty(setting);
  },
  getSetting: function(setting) {
    var v = this.options.settings[setting];
    if (v !== undefined && typeof v == 'string')
      return v.match(/^true$/i) ? true : (v.match(/^false$/i) ? false : v);
    return v;
  },
  loadSettings: function(o) {
    this.options.settings = Object.extend(this.options.settings, o);
  },
  isBrowserFocused: function() {
    return this._browserFocused;
  },
  toString: function() {
    return 'GlideManager';
  }
});
GlideManager.init = function(options) {
  var topWindow = getTopWindow();
  if (topWindow == window.self)
    window.g_glideManager = new GlideManager(options);
  else
    window.g_glideManager = topWindow.g_glideManager;
};
GlideManager.get = function() {
  return window.g_glideManager || getTopWindow().g_glideManager;
};