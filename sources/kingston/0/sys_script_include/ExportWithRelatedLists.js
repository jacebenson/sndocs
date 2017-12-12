var ExportWithRelatedLists = Class.create();

ExportWithRelatedLists.prototype = {
    initialize: function(parent_table, sys_id){
        this.parent_table = parent_table;
        this.sys_id = sys_id;
        this.related_lists = [];
        this.query_sets = [];
    },
    /**
     * Add related records
     * @param String child_table - table to query
     * @param String reference_field - field to query on
     */
    addRelatedList: function(child_table, reference_field){
        var related_list = [child_table, reference_field];
        this.related_lists.push(related_list);
    },
    /**
     * Add a query definition to define a collection of records to export, allows for custom queries that cannot be met with addRelatedList
     * @param String table
     * @param String query - encoded query string
     */
    addQuerySet: function(table, query){
        var set = [table, query];
        this.query_sets.push(set);
    },
    getFileName: function(){
        return (this.parent_table + '_' + this.sys_id + '.xml');
    },
    /**
     * Enable attachment support for all records being exported
     * @param boolean b
     */
    setAttachments: function(b){
        this.includeAttachments = b;
    },
    /**
     * Required XML Headers
     */
    setHeaders: function(response){
        response.setHeader('Pragma', 'public');
        response.addHeader('Cache-Control', 'max-age=0');
        // setting the content type
        response.setContentType('application/octet-stream');
        response.addHeader('Content-Disposition', "attachment;filename=\"" + this.getFileName() + "\"");
    },
    /**
     * Process the request
     * @param {Object} response
     */
    exportRecords: function(response){
        this.setHeaders(response);
        var outputStream = response.getOutputStream();
        this.hd = this.beginExport(outputStream);
        var gr = new GlideRecord(this.parent_table);
        gr.get(this.sys_id);
        this.exportRecord(gr);
        this.exportChildren();
        this._exportQuerySets();
        this.endExport(outputStream);
    },
    /**
     * Export an individual GlideRecord
     * @param GlideRecord record
     */
    exportRecord: function(record){
        record = new GlideScriptRecordUtil.get(record).getRealRecord();
        var recordSerializer = new GlideRecordXMLSerializer();
        recordSerializer.setApplySecurity(true);
        recordSerializer.serialize(record, this.hd, new Packages.java.lang.String('INSERT_OR_UPDATE'));
        if (this.includeAttachments && record.getTableName().substring(0, 14) != "sys_attachment") {
            this.exportAttachments(record);
        }
    },
    /**
     * Export attachments for a given GlideRecord
     * @param GlideRecord target
     */
    exportAttachments: function(target){
        var sa = new GlideSysAttachment();
        //get sys_attachments
        var attach = new GlideRecord("sys_attachment");
        attach.addQuery("table_name", target.getTableName());
        attach.addQuery("table_sys_id", target.getUniqueValue());
        attach.query();
        while (attach.next()) {
            this.exportRecord(attach);
            var parts = sa.getAttachmentParts(attach.getUniqueValue());
            while (parts.next()) {
                this.exportRecord(parts);
            }
        }
    },
    /**
     * Get attachment document parts
     * @param GlideRecord attach - sys_attachment record
     */
    _exportAttachDoc: function(attach){
        var doc = new GlideRecord("sys_attachment_doc");
        doc.addQuery("sys_attachment", attach.getUniqueValue());
        doc.query();
    },
    /**
     * Process related lists
     */
    exportChildren: function(){
        for (var key = 0; key < this.related_lists.length; key++) {
            var table = this.related_lists[key];
            this.exportTableChildren(table);
        }
    },
    /**
     * Get the records from the related list entries
     * @param Array table - array of tableName, fieldName
     */
    exportTableChildren: function(table){
        var child = new GlideRecord(table[0]);
        child.addQuery(table[1], this.sys_id);
        child.query();
        while (child.next()) {
            this.exportRecord(child);
        }
    },
    /**
     * Process query sets and export results
     */
    _exportQuerySets: function(){
        for (var i = this.query_sets.length - 1; i >= 0; i--) {
            var querySet = this.query_sets[i];
            var table = querySet[0];
            var query = querySet[1];
            var gr = new GlideRecord(table);
            gr.addEncodedQuery(query);
            gr.query();
			while (gr._next())
				this.exportRecord(gr);
        }
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
}

