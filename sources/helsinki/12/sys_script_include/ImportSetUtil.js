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
        //GlideDBUtil.createElement(source_table, fname, fname, "string", "40", null, true, false);
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
    this._iterateNodeList(nodeList, null, attrs);

    // create or update the table schema
    var tc = new GlideTableCreator(tableName, tableName);
    tc.setColumnAttributes(attrs);
    tc.update();

    // second pass insert row
    var gr = new GlideRecord(tableName);
    gr.initialize();
    var nodeList = xmlDoc.getNodes(xpath_root_node);
    this._iterateNodeList(nodeList, null, null, gr);
    gr.insert();
  },

  _iterateNodeList : function (nodeList, parentName, attrs, gr) {
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

      var nodeValue = this._getNodeValue(node, attrs, gr);
      if (nodeValue == null) {
        continue;
      }

      var ca = new GlideColumnAttributes(nodeName);
      ca.setUsePrefix(false);
      if (attrs == null && gr != null) {
        // set gr values
        gr[ca.getDBName()] = nodeValue;
        continue;
      }

      ca.setType("string");
      ca.setUsePrefix(false);
      attrs.put(nodeName, ca);
    }
  },

  _getNodeValue : function (node, attrs, gr) {
    var fieldValue = GlideXMLUtil.getAllText(node);
    var nodeName = GlideXMLUtil.getNodeNameNS(node);

    if (node.getChildNodes().getLength() > 1) {   
      this._iterateNodeList (node.getChildNodes(), nodeName, attrs, gr);
      return null;
    }

    return fieldValue;
  }
}