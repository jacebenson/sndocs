var UpdateXMLPayloadParser = (function() {	
	return {
		parse: function(xmlString) {
			var doc = new XMLDocument2();
			doc.parseXML(xmlString);
			var recordNode = doc.getNode('record_update').getFirstChild();
			
			// sys_documentation records have an extra node, 
			// also named sys_documentation, because why not
			if (recordNode.getNodeName() === 'sys_documentation')
				recordNode = recordNode.getFirstChild();
			
			var recordIterator = recordNode.getChildNodeIterator();
			
			var result = {}, n;
			while (recordIterator.hasNext()) {
				n = recordIterator.next();
				result[n.getNodeName()] = n.getTextContent();
			}
			
			return result;
		}
	};
	
})();