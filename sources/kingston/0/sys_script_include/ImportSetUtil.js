var ImportSetUtil = Class.create();

ImportSetUtil.prototype = {
  initialize : function() {

  },

  copyFields : function (source_table, target_table, extends_table) {
    var tgr = new GlideRecord(target_table);
    tgr.initialize();

    var attrs = new Packages.java.util.HashMap();

    var fields = tgr.getFields();
    for (var i = 0; i < fields.size(); i++) {
      var field = fields.get(i);
      var type = field.getED().getInternalType();
      var fname = field.getName();
      if (fname.startsWith('sys_'))
        continue;

      var dgr2 = new GlideRecord("sys_dictionary");
      dgr2.addQuery("name", source_table);
      dgr2.addQuery("element", fname);
      dgr2.query();
      if (!dgr2.next()) {
        if(fname.indexOf('u_') != 0)
		  fname = 'u_' + fname;

        var ca = new GlideColumnAttributes(fname);
        ca.setType("string");
        ca.setUsePrefix(false);
        attrs.put(fname, ca);
      }
    }

    var tc = new GlideTableCreator(source_table, source_table);
    tc.setColumnAttributes(attrs);
    if(typeof extends_table != 'undefined')
      	tc.setExtends(extends_table);
    tc.setOverrideUpdate(true);
    tc.update();
  },

  loadFromXML : function (xpath_root_node, xmlDoc, tableName) {
    var attrs = new Packages.java.util.HashMap();
    var nodeList = xmlDoc.getNodes(xpath_root_node);
    this._iterateNodeList(nodeList, null, attrs, null, tableName);

    // create or update the table schema
    var tc = new GlideTableCreator(tableName, tableName);
    tc.setColumnAttributes(attrs);
    tc.update();

    // second pass insert row
    var gr = new GlideRecord(tableName);
    gr.initialize();
    var nodeList = xmlDoc.getNodes(xpath_root_node);
    this._iterateNodeList(nodeList, null, null, gr, tableName);
    gr.insert();
  },

  _iterateNodeList : function (nodeList, parentName, attrs, gr, tableName) {
    var nodeCount = nodeList.getLength();

    for (var i = 0; i < nodeCount; i++) {
      var node = nodeList.item(i);

      if (node.getNodeType() != Packages.org.w3c.dom.Node.ELEMENT_NODE) {
        continue;
      }

      var nodeName = GlideXMLUtil.getNodeNameNS(node);
      if (parentName != null) {
        nodeName = parentName + "_" + nodeName;
      }

      var nodeValue = this._getNodeValue(node, attrs, gr, tableName);
      if (nodeValue == null) {
        continue;
      }

	  if (attrs == null && gr != null) {
	  	var ca = new GlideColumnAttributes(nodeName);
		ca.setUsePrefix(false);
		// set gr values
		gr[ca.getDBName()] = nodeValue;
		continue;
	  }

	  attrs.put(nodeName, nodeValue);
    }

	  if(attrs != null)
	    attrs = this._filterExistingColumnAttributes(attrs, tableName);
  },

  _filterExistingColumnAttributes:function (attrs, tableName) {
      //stores the existing column names to be exluded from attrs later
	  var existingAttributes = new Packages.java.util.ArrayList();

	  //stores the column names provided by a user
	  var inputAttributes = new Packages.java.util.ArrayList();
	  var keys = '';

	  var keysIterator = attrs.keySet().iterator();
	  while(keysIterator.hasNext()) {
		var key = keysIterator.next();
		keys += key + ',';
		inputAttributes.add(key);
	  }

	  if(GlideStringUtil.nil(keys))
		return;

	  //query for existing column names
	  var gr = new GlideRecord("sys_dictionary");
	  gr.addQuery("name", tableName);
	  gr.addQuery("element", "IN", keys);
	  gr.query();
	  while (gr.next())
		  existingAttributes.add(gr.getValue("element"));

      //for each column name provided by a user remove from attrs the one
      //which already exists, create a GlideColumnAttributes object
      //for a new one
	  for(var i=0; i<inputAttributes.size(); i++) {
	    var attrName = inputAttributes.get(i);
		if(existingAttributes.contains(attrName))
		  attrs.remove(attrName);
		else {
		  var attr = new GlideColumnAttributes(attrName);
		  attr.setType("string");
		  attr.setUsePrefix(false);
		  attrs.put(attrName, attr);
		}
	  }
  },

  _getNodeValue : function (node, attrs, gr, tableName) {
    var fieldValue = GlideXMLUtil.getAllText(node);
    var nodeName = GlideXMLUtil.getNodeNameNS(node);

    if (node.getChildNodes().getLength() > 1) {
      this._iterateNodeList (node.getChildNodes(), nodeName, attrs, gr, tableName);
      return null;
    }

    return fieldValue;
  }
}