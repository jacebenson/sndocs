var ExportNonDBBackedRecord = Class.create();
ExportNonDBBackedRecord.prototype = {
    initialize: function(tableName, record) {
		this.tableName = tableName;
		this.record = record;
    },
	
	getFileName: function(){
        return (this.tableName + '_' + this.record.sys_id + '.xml');
    },

	setHeaders: function(response){
        response.setHeader('Pragma', 'public');
        response.addHeader('Cache-Control', 'max-age=0');
        // setting the content type
        response.setContentType('application/octet-stream');
        response.addHeader('Content-Disposition', "attachment;filename=\"" + this.getFileName() + "\"");
    },

	exportRecord: function(response) {
		this.setHeaders(response);
		var outputStream = response.getOutputStream();
		this.hd = this.beginExport(outputStream);
		
		var recordSerializer = new GlideRecordXMLSerializer();
        recordSerializer.setApplySecurity(true);
        recordSerializer.serialize(this.record, this.hd, new Packages.java.lang.String('INSERT_OR_UPDATE'));
		
		this.endExport(outputStream);
	},

	/**
     * Initialize the result
     * @param {Object} outputStream
     */
    beginExport: function(outputStream){
        var streamResult = new Packages.javax.xml.transform.stream.StreamResult(outputStream);
        var tf = Packages.javax.xml.transform.sax.SAXTransformerFactory.newInstance();
        var hd = tf.newTransformerHandler();
        var serializer = hd.getTransformer();
        serializer.setOutputProperty(Packages.javax.xml.transform.OutputKeys.ENCODING, 'UTF-8');
        serializer.setOutputProperty(Packages.javax.xml.transform.OutputKeys.INDENT, 'yes');
        hd.setResult(streamResult);
        hd.startDocument();
        var attr = new GlidesoftGlideAttributesImpl();
        attr.addAttribute("unload_date", GlideSysDateUtil.getUMTDateTimeString());
        hd.startElement("", "", 'unload', attr);
        return hd;
    },
    
    endExport: function(outputStream){
        this.hd.endElement("", "", 'unload');
        this.hd.endDocument();
        outputStream.close();
    },	
	
    type: 'ExportNonDBBackedRecord'
};