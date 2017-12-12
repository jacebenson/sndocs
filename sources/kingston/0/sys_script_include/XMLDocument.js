var XMLDocument = Class.create();

XMLDocument.prototype = {
  initialize: function(xml, namespaceAware) {
    if (typeof xml == 'string' || (typeof xml == 'object' && xml && xml.trimLeft)) {
        this.xmlDoc = new GlideXMLDocument();
        if (namespaceAware) {
          this.xmlDoc.setNamespaceAware(true);
        }

        this.xmlDoc.parse(xml);
    } else {
        this.xmlDoc = new GlideXMLDocument(); // it is a new XML document
    }

     this.setCurrent(this.xmlDoc.getDocumentElement());
  },

  createElement : function(name, value) {
    if (value)
      return this.xmlDoc.createElement(name, value);

    return this.xmlDoc.createElement(name);
  },

  createCDATAElement : function(name, value) {
 
      return this.xmlDoc.createCDATAElement(name, value);
  },
	
  setCurrent : function(el) {
    this.xmlDoc.setCurrent(el);
  },

  setAttribute : function(name, value) {
    this.xmlDoc.setAttribute(name, value);
  },

  getChildTextByTagName: function(parent, tagName) {
    return this.getDocument().getChildTextByTagName(parent, tagName);
  },

  getElementByTagName: function(tagName) {
    return this.getDocument().getElementByTagName(tagName); // returns org.w3c.dom.Element
  },

  getElementValueByTagName: function(tagName) {
    return this.getDocument().getElementValueByTagName(tagName);
  },

  getDocument: function() {
    return this.xmlDoc;
  },

  getDocumentElement: function() {
    return this.getDocument().getDocumentElement(); // returns org.w3c.dom.Element
  },

  getNodeText: function(xpath) {
    return this.xmlDoc.selectSingleNodeText(xpath);
  },

  getNodeInt: function(xpath) {
    var str = this.getDocument().selectSingleNodeText(xpath);
    return Packages.java.lang.Integer.parseInt(str);
  },

  getNode: function(xpath) {
    return this.getDocument().selectSingleNode(xpath); // returns org.w3c.dom.Node
  },

  getNodeName: function(xpath) {
    return this.getDocument().selectSingleNode(xpath).getNodeName();
  },

  getNodeType: function(xpath) {
    return this.getDocument().selectSingleNode(xpath).getNodeType();
  },

  getNodes: function(xpath) {
    return this.getDocument().selectNodes(xpath); // returns org.w3c.dom.NodeList
  },

  getAttribute: function(xpath, attributeName) {
    var node = this.getNode(xpath);
    if (node == null) {
      return null;
    }

    var atts = node.getAttributes();
    for(i = 0; i < atts.getLength(); i++) {
      var att = atts.item(i);
      if (att.getNodeName() == attributeName) {
        return att.getNodeValue();
      }
    }

    return null;
  },

  isValid: function() {
    return this.getDocument().isValid();
  },

  load: function(f) {
    this.getDocument().load(f);
  },

  toIndentedString: function() {
    return this.getDocument().toIndentedString();
  },

  toString: function() {
    return this.getDocument().toString();
  }
}