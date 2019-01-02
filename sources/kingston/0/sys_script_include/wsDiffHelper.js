/**
 * Class wrapping the ootb DiffHelper and providing additional features.
 * @ignore
 */
var wsDiffHelper = Class.create();
	
/**
* Retrieve a string which contains a HTML table for display on a UI Page or 
* Form formatter. The full_diff flag indicates whether we should return all
* differences (true) or only the significant ones (false; the default).
*
* @param  {GlideRecord} ua - The Upgrade Assistant Log record
* @param  {boolean} full_diff - Indicates the set of differences required.
* @return {string} - An HTML table showing the requested differences.
*/
wsDiffHelper.getDiffTemplate = function(ua,full_diff) {
		
	if ( !ua || !ua.isValidRecord() ) { 
		return ''; 
	}
	
	var diffHelper = new DiffHelper();
	var xml = '';
	
	if ( full_diff ) {
		xml = '' + ua.u_diff_xml;
	} else {
		var diff = JSON.parse( '' + ua.u_diff_json );
		var i, field_count = diff.field_list.length;
		for ( i=0; i < field_count; i++ ) {
			xml += diff.fields[diff.field_list[i]].xml;
		}
	}
	
	var html = '' + diffHelper.getTemplate(xml, 'Base System', 'Current');
	
	return html.replace(/,?<\?xml version="1.0" encoding="UTF-8"\?>/g,'').replace(/colspan=5/g,'colspan="5"');
};
	
wsDiffHelper.prototype = {
	
	/**
	* @classdesc wsDiffHelper allows us to compare two update payloads and 
	* get an HTML representation of the differences found. It uses the standard
	* DiffHelper routines to carry out the differencing but then post-processes 
	* their returned HTML to optionally exclude 'noise' level fields such as 
	* the Updated on and Updated by field values.
	*
	* @description Initialise this object's properties
	*
	* @constructs wsDiffHelper
	*/
	initialize: function() {
		
		this.json = new JSON(); this.json.prettify();
		this.status = 'OK';
		
		this.diffHelper = new DiffHelper();
		
		this.ignore_fields = {
			sys_customer_update: true,
			sys_created_on: true,
			sys_created_by: true,
			sys_updated_on: true,
			sys_updated_by: true,
			sys_mod_count: true,
			sys_package: true
		};
		
	},
	
	/**
	* Access method to retrieve the object's status
	*
	* @return {boolean} The Object's status
	*/
	isValid: function isValid() {
		return (this.status == 'OK');
	},
	
	getTemplate: function() {
		
		var xml = '';
		var i, field_count = this.diff.field_list.length;
		for ( i=0; i < field_count; i++ ) {
			xml += this.diff.fields[this.diff.field_list[i]].xml;
		}
		return this.diffHelper.getTemplate(xml, 'Base System', 'Current');
	},
	
	getTemplateAll: function() {
		
		var xml = this.xml_list.join();
		return this.diffHelper.getTemplate(xml, 'Base System', 'Current');
	},
	
	/**
	* Access method to retrieve the object's status
	*
	* @return {string} The Object's status
	*/
	getStatus: function() {
		return this.status;
	},
	
	/**
	* Access method to retrieve the number of differences detected after 
	* excluding 'noise' level fields.
	*
	* @return {number} Count of field differences
	*/
	getFieldCount: function() {
		return this.diff.field_list.length;
	},
	
	/**
	* Access method to retrieve the number of differences detected by the 
	* standard diff helper. Includes 'noise' level fields.
	*
	* @return {number} Count of all field differences
	*/
	getFieldCountAll: function() {
		return this.diff.field_list_all.length;
	},
	
	/**
	* Access method to retrieve the XML (HTML) which shows the differences
	* between the two supplied payloads.
	*
	* @return {string} The Object's status
	*/
	getDiffXML: function getDiffXML() {
		return this.xml_list.length ? this.xml_list.join() : '';
	},
	
	/**
	* Access method to retrieve the object's status
	*
	* @return {string} The Object's status
	*/
	getDiffXMLList: function getDiffXMLList() {
		return this.xml_list.length ? this.json.encode(this.xml_list) : '';
	},
	
	/**
	* Access method to retrieve the JSON object which describes the differences
	* found between the two payloads. This is the primary data structure which
	* is created by this object.
	*
	* @return {string} A JSON string describing the state of this object.
	*/
	getDiffJSON: function getDiffJSON() {
		return ( this.diff_json || '' );
	},
	
	/**
	* Ensure that the supplied XML payload is in 'record update' format.
	* The root of this format is a record_update element containing a 'table'
	* attribute which gives the name of the primary element enclosed.
	*
	* If the supplied XML has a record_update root is is returned unchanged; 
	* if not the supplied XML is wrapped in a record_update element.
	*
	* @private
	* @param {string} base_payload - The XML string of the base update
	* @param {string} curr_payload - The XML string of the current update
	* @return {undefined}
	*/
	createDiff: function createDiff( base_payload, curr_payload ) {
		
		this.diff = {
			field_list_all: [],
			field_list: [],
			fields: {}
		};
		
		var xml = this.diffHelper.diffXMLString( 
			this.wrap_it( base_payload ),
			this.wrap_it( curr_payload )
		);
		
		this.xml_list = this.split_xml(xml);
		
		this.process_diff();
		
	},
	
	/**
	* Ensure that the supplied XML payload is in 'record update' format.
	* The root of this format is a record_update element containing a 'table'
	* attribute which gives the name of the primary element enclosed.
	*
	* If the supplied XML has a record_update root is is returned unchanged; 
	* if not the supplied XML is wrapped in a record_update element.
	*
	* @private
	* @param {string} xml - The XML to be processed, supplied as a string.
	* @return {string} An XML string in 'record update' format.
	*/
	wrap_it: function wrap_it(xml_text_in) {
		
		// Create an XML Doc and extract the root node name
		var xml_in = new XMLDocument(xml_text_in);
		var root = xml_in.getDocumentElement().getNodeName();
		
		// Nothing to do if it's a record_update element
		if ( root == 'record_update' ) {
			return xml_text_in;
		}
		
		// Get the string form of the XML
		var xml_text = '' + xml_in.toString();
		
		// Strip the processing instruction
		xml_text = xml_text.replace(/^<\?xml version="1.0" encoding="UTF-8"\?>/,'');
		
		// Wrap in a payload root
		xml_text = '<record_update table="' + root + '">' + xml_text + '</record_update>';
		
		// Convert to XML and back to string
		var xml_out = new XMLDocument(xml_text);
		return '' + xml_out.toString();
	},
	
	/**
	* Split the supplied string into multiple individual XML strings.
	* Uses the XML processing instruction line as the boundary on which
	* to split strings.
	*
	* @private
	* @param {string} xml - The XML source of the item being processed
	*                       supplied as a string.
	* @return {array} An array of XML strings.
	*/
	split_xml: function split_xml( xml ) {
		
		var xml_re = /,?<\?xml version="1.0" encoding="UTF-8"\?>/;
		var xml_pi = '<?xml version="1.0" encoding="UTF-8"?>';
		var xml_list = [];
		var i;
		
		if ( !xml_re.test(xml) ) { return xml_list; }
		
		// Split the diff into individual XML strings
		xml_list = xml.split(xml_re);
		
		// Remove the blank first entry
		if ( xml_list[0] == '' ) {
			xml_list.shift();
		}
		
		// Add the xml processing instruction back to each entry
		for ( i=0; i < xml_list.length; i++ ) {
			xml_list[i] = xml_pi + xml_list[i];
		}
		
		return xml_list;
	},
	
	/**
	* Process the list of XML text which made up the standard diff output.
	* Call the process_item method to handle individual fields.
	*
	* @private
	* @return {undefined}
	*/
	process_diff: function process_diff() {
		
		var xh  = new XMLHelper();
		var items = [];
		var i, xml_source, xml_text, item;
		
		for ( i=0; i < this.xml_list.length; i++ ) {
			xml_source = '' + this.xml_list[i];
			xml_text   = xml_source.replace(/<td class='zebra' colspan=5><\/td>/g,'');
			item = xh.toObject(xml_text);
			items.push(item);
			this.process_item(item,xml_source);
		}
		
		if ( this.diff.field_list_all.length ) {
			this.status = 'OK';
			this.diff_json = this.json.encode(this.diff);
		} else {
			this.status = 'failed';
			this.diff_json = this.json.encode(items);
		}
	},
	
	/**
	* Process a single diff field. If the field is formed of multiple rows, we 
	* call the process_item_array method.
	*
	* @private
	* @param {object} item - The object to test
	* @param {string} xml_source - The XML source of the item being processed
	*                              supplied as a string.
	* @return {undefined}
	*/
	process_item: function process_item(item,xml_source) {
		
		if ( !item || !item.tr ) { return; }
		var tr = item.tr;
		
		if ( this.is_array(tr) ) {
			return this.process_item_array(item,xml_source);
		}
		
		var th = tr.th;
		if ( !th || !th['#text'] ) { return; }
		var field_name = th['#text'];
		
		var td = tr.td;
		if ( !td || !td[0] || !td[1] ) { return; }
		var field = {
			xml: xml_source,
			base: td[0]['#text'],
			curr: td[1]['#text'],
		};
		
		this.diff.field_list_all.push(field_name);
		if ( !(field_name in this.ignore_fields) ) {
			this.diff.field_list.push(field_name);
		}
		this.diff.fields[field_name] = field;
		
	},
	
	/**
	* Processes multi-row diff fields
	*
	* @private
	* @param {object} item - The object to test
	* @param {string} xml_source - The XML source of the item being processed
	*                              supplied as a string.
	* @return {undefined}
	*/
	process_item_array: function process_item_array(item,xml_source) {
		
		if ( !item || !item.tr ) { return; }
		var tr_list = item.tr;
		var i;
		
		// The header of the first row is expected to hold the field_name
		var tr = tr_list[0];
		if ( !tr.th || !tr.th['#text'] ) { return; }
		var field_name = tr.th['#text'];
		
		var field = {
			xml: xml_source,
			base: [],
			curr: [],
		};
		
		for ( i=0; i< tr_list.length; i++ ) {
			tr = tr_list[i];
			field.base.push( [ tr.td[0]['#text'] || '', tr.td[1]['#text'] || '' ] );
			field.curr.push( [ tr.td[2]['#text'] || '', tr.td[3]['#text'] || '' ] );
		}
		
		this.diff.field_list_all.push(field_name);
		if ( !(field_name in this.ignore_fields) ) {
			this.diff.field_list.push(field_name);
		}
		this.diff.fields[field_name] = field;
		
	},
	
	/**
	* Utility method to check whather an object is a Javascript Array.
	*
	* @private
	* @param {object} o - The object to test
	* @return {boolean} True if an Array was suppied,; otherwise false.
	*/
	is_array: function( o ) {
		return o && typeof o === 'object' && o.constructor === Array;
	},
	
	type: 'wsDiffHelper'
};
