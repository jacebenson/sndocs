
/**
 * The class that parses the ECC queue payload
 * Aleck Lin aleck.lin@servicenow.com
 */

var ECCPayloadParser = Class.create();

ECCPayloadParser.prototype = {
    initialize: function(payload) {
		if (JSUtil.nil(payload))
			return;
		
		this.payload = payload;		
		this.parameters = {};
		
		this._paresParameters();
    },

	setSysId: function(sys_id) {
		var gr = new GlideRecord("ecc_queue");
		if (gr.get(sys_id))
			this.payload = gr.payload + '';		
	},
	
	getParameters: function() {
		return this.parameters;
	},

	_paresParameters: function() {
		var XMLUtil = GlideXMLUtil;
		var g_doc = XMLUtil.parse(this.payload);

		var parent = g_doc.getDocumentElement();
		var topTagName = parent.getTagName();

		if (topTagName == "parameters") {
			var nodeList = parent.getElementsByTagName("parameter");
		} else if (topTagName == "probes" || topTagName == "results") {
			var element = XMLUtil.getChildByTagName(parent, "parameters");
			var nodeList = element.getElementsByTagName("parameter")
		} else
			return;
	
		if (JSUtil.nil(nodeList)) {
			gs.log("Unable to find any parameter xml tags from the output payload");
			return;
		}
	
		for (i=0; i<nodeList.getLength(); i++) {
			var attribute = XMLUtil.getAttributesAsMap(nodeList.item(i));
			this.parameters[attribute.get("name")] = attribute.get("value") + '';
		} 
	},
	

	
	
    type: 'ECCPayloadParser'
}