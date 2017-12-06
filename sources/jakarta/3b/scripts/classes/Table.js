/*! RESOURCE: /scripts/classes/Table.js */
var Table = Class.create({
  REF_ELEMENT_PREFIX: 'ref_',
  REFERENCE: "reference",
  initialize: function(tableName, parentTable, cols, callback, accessTable, isTemplate, loadExtensions) {
    this.tableName = tableName;
    this.parentTable = parentTable;
    this.label = tableName;
    this.callback = callback;
    this.accessTable = accessTable;
    this.columns = null;
    this.elements = {};
    this.elementsArray = [];
    this.extensions = {};
    this.extensionsArray = [];
    this.choiceExtensions = {};
    this.choiceExtensionsArray = [];
    this.tablesArray = [];
    this.sys_id = null;
    this.set_id = null;
    this.vars_id = null;
    this.glide_var = null;
    this.isTemplate = isTemplate;
    this.loadExtensions = loadExtensions;
    Table.setCachable(this);
    if (cols && this.cacheable)
      this.readResponse(cols);
    else
      this.readColumns();
    this.textIndex = null;
  },
  readColumns: function() {
    var ajax = new GlideAjax("SysMeta");
    ajax.addParam("sysparm_type", "column");
    ajax.addParam("sysparm_include_sysid", "true");
    ajax.addParam("sysparm_table_name", "false");
    ajax.addParam("sysparm_is_template", this.isTemplate ? 'true' : 'false');
    ajax.addParam("sysparm_value", this.tableName);
    if (this.sys_id)
      ajax.addParam("sysparm_sys_id", this.sys_id);
    if (this.set_id)
      ajax.addParam("sysparm_set_id", this.set_id);
    if (this.vars_id)
      ajax.addParam("sysparm_vars_id", this.vars_id);
    if (this.parentTable)
      ajax.addParam("sysparm_parent_table", this.parentTable);
    if (this.accessTable)
      ajax.addParam("sysparm_access_table", this.accessTable);
    if (this.loadExtensions)
      ajax.addParam("sysparm_load_extended_fields", this.loadExtensions);
    if (this.callback)
      ajax.getXML(this.readColumnsResponse.bind(this));
    else {
      var xml = ajax.getXMLWait();
      this.readResponse(xml);
    }
  },
  readColumnsResponse: function(response) {
    if (!response || !response.responseXML)
      return;
    var xml = response.responseXML;
    this.readResponse(xml);
    this.callback(this);
  },
  readResponse: function(xml) {
    this.columns = xml;
    var root = this.columns.getElementsByTagName("xml");
    if (root == null || root.length == 0)
      root = this.columns;
    if (root != null && root.length == 1) {
      root = root[0];
      this.textIndex = root.getAttribute("textIndex");
      this.label = root.getAttribute("label");
    }
    var childNodes = root.childNodes;
    this.elements = {};
    this.elementsArray = [];
    for (var i = 0; i < childNodes.length; i++) {
      if (childNodes[i].tagName == 'extensions')
        this.setExtensions(childNodes[i]);
      if (childNodes[i].tagName == 'tables')
        this.setTables(childNodes[i]);
      if (childNodes[i].tagName == 'sys_choice_extensions')
        this.setChoiceExtensions(childNodes[i]);
      if (childNodes[i].tagName != 'item')
        continue;
      var item = childNodes[i];
      var t = item.getAttribute("value");
      var label = item.getAttribute("label");
      var e = new TableElement(t, label);
      e.setClearLabel(item.getAttribute("cl"));
      e.setType(item.getAttribute("type"));
      e.setReference(item.getAttribute("reference"));
      e.setDynamicCreation(item.getAttribute("dynamic_creation") == "true");
      e.setRefQual(item.getAttribute("reference_qual"));
      e.setRefKey(item.getAttribute("reference_key"));
      e.setArray(item.getAttribute("array"));
      e.setChoice(item.getAttribute("choice"));
      e.setMulti(item.getAttribute("multitext"));
      e.setDependent(item.getAttribute("dependent"));
      e.setMaxLength(item.getAttribute("max_length"));
      e.setDisplayChars(item.getAttribute("display_chars"));
      e.setNamedAttributes(item.getAttribute("attributes"));
      e.setTableName(item.getAttribute("table"));
      e.setTable(this);
      if (e.isReference()) {
        e.setRefLabel(item.getAttribute("reflabel"));
        e.setRefDisplay(item.getAttribute("refdisplay"));
        e.setRefRotated(item.getAttribute("reference_rotated"));
      }
      this.elements[t] = e;
      this.elementsArray[this.elementsArray.length] = e;
      var attrs = item.attributes;
      for (var x = 0; x < attrs.length; x++)
        e.addAttribute(attrs[x].nodeName, attrs[x].nodeValue);
    }
    this.setDependencies();
  },
  setExtensions: function(extensions) {
    var items = extensions.childNodes;
    if (this.loadExtensions) {
      Table.getCache().ensureMaxEntries(items.length);
    }
    this.extensionsArray = [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var t = item.getAttribute("name");
      var label = item.getAttribute("label");
      var e = new TableExtension(t, label);
      e.setTable(this);
      if (item.getElementsByTagName('item') && this.loadExtensions) {
        Table.setColumns(t, null, item);
      }
      this.extensions[t] = e;
      this.extensionsArray[this.extensionsArray.length] = e;
    }
  },
  setChoiceExtensions: function(choices) {
    items = choices.childNodes;
    this.choiceExtensionsArray = [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var t = item.getAttribute("name");
      var label = item.getAttribute("label");
      var e = new TableExtension(t, label);
      e.setTable(this);
      this.choiceExtensions[t] = e;
      this.choiceExtensionsArray[this.choiceExtensionsArray.length] = e;
    }
  },
  setDependencies: function() {
    for (var i = 0; i < this.elementsArray.length; i++) {
      var element = this.elementsArray[i];
      if (element.isDependent()) {
        var parent = this.getElement(element.getDependent());
        if (parent)
          parent.addDependentChild(element.getName())
      }
    }
  },
  setTables: function(tables) {
    var tableList = tables.getAttribute("table_list");
    this.tablesArray = [];
    this.tablesArray = tableList.split(',');
  },
  getColumns: function() {
    return this.columns;
  },
  getElements: function() {
    return this.elementsArray;
  },
  getTableElements: function(tableName) {
    jslog("Getting fields for table " + tableName);
    var elements = [];
    var items = this.getElements();
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (item.getTableName() != tableName)
        continue;
      elements.push(item);
    }
    return elements;
  },
  getElement: function(elementName) {
    if (this.elements[elementName])
      return this.elements[elementName];
    if (this._nameIsExtension(elementName))
      return this._genExtensionElement(elementName);
    return null;
  },
  _genExtensionElement: function(name) {
    name = name.substring(this.REF_ELEMENT_PREFIX.length);
    var ext = this.extensions[name];
    var e = new TableElement(ext.getExtName(), ext.getLabel());
    e.setType(this.REFERENCE);
    e.setReference(ext.getName());
    e.setRefLabel(ext.getLabel());
    e.setExtensionElement(true);
    return e;
  },
  _nameIsExtension: function(name) {
    if (name.indexOf(this.REF_ELEMENT_PREFIX) != 0)
      return false;
    name = name.substring(this.REF_ELEMENT_PREFIX.length);
    return this.extensions[name];
  },
  getExtensions: function() {
    return this.extensionsArray;
  },
  getChoiceExtensions: function() {
    return this.choiceExtensionsArray;
  },
  getTables: function() {
    return this.tablesArray;
  },
  getName: function() {
    return this.tableName;
  },
  getLabel: function() {
    return this.label;
  },
  getDisplayName: function(column) {
    return this.getElement(column).getRefDisplay();
  },
  getSysId: function() {
    return this.sys_id;
  },
  setSysId: function() {
    return this.sys_id;
  },
  type: function() {
    return "Table";
  }
});
Table.get = function(tableName, parentTable, isTemplate, loadExtensions, callback) {
  var topWindow = getTopWindow();
  return (topWindow.Table || Table).getInTopWindow(tableName, parentTable, isTemplate, loadExtensions, callback);
};
Table.setColumns = function(tableName, parentTable, xmlString) {
  var cachedName = Table.getCacheKey(tableName, parentTable);
  var parentCache = Table.getCache();
  if (parentCache) {
    var table = parentCache.get(cachedName);
    if (table)
      return table;
  }
  var xml = typeof xmlString == 'string' ? loadXML(xmlString) : xmlString;
  var answer = new Table(tableName, parentTable, xml);
  if (parentCache && answer.cacheable)
    parentCache.put(cachedName, answer);
};
Table.isCached = function(tableName, parentTable, isTemplate) {
  var cachedName = Table.getCacheKey(tableName, parentTable, isTemplate);
  var parentCache = Table.getCache();
  if (parentCache) {
    var table = parentCache.get(cachedName);
    if (table)
      return true;
  }
  return false;
};
Table.getInTopWindow = function(tableName, parentTable, isTemplate, loadExtensions, callback) {
  var t = {};
  Table.setCachable(t);
  if (t.cacheable) {
    var cachedName = Table.getCacheKey(tableName, parentTable, isTemplate, loadExtensions);
    var parentCache = Table.getCache();
    if (parentCache) {
      var table = parentCache.get(cachedName);
      if (table) {
        if (callback)
          callback(table);
        return table;
      }
    }
  }
  var answer = new Table(tableName, parentTable, null, callback, null, isTemplate, loadExtensions);
  if (parentCache && answer.cacheable)
    parentCache.put(cachedName, answer);
  return answer;
};
Table.setCachable = function(t) {
  t.cacheable = true;
  if (typeof g_table_sys_id != 'undefined') {
    t.sys_id = getTopWindow().g_table_sys_id;
    t.cacheable = false;
  }
  if (typeof g_table_set_id != 'undefined') {
    t.set_id = getTopWindow().g_table_set_id;
    t.cacheable = false;
  }
  if (typeof g_table_vars_id != 'undefined') {
    t.vars_id = getTopWindow().g_table_vars_id;
    t.cacheable = false;
  }
  if (typeof g_table_glide_var != 'undefined') {
    t.glide_var = getTopWindow().g_table_glide_var;
    t.cacheable = false;
  }
};
Table.getCacheKey = function(tableName, parentTable, isTemplate) {
  return (parentTable ? parentTable + "." : "") + tableName + "." + !!isTemplate;
};
Table.getCache = function() {
  var cache = getTopWindow().g_cache_td;
  if (cache)
    return cache;
  if (!window.g_cache_td)
    window.g_cache_td = new GlideClientCache(400);
  return window.g_cache_td;
};;