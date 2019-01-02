gs.include("PrototypeServer");

/**
 * Utility class to turn a record in a table into HTML.
 * 
 * Tom Dilatush tom.dilatush@service-now.com
 */
var RecordToHTML = Class.create();

RecordToHTML.prototype = {
    
    /*
     * Initializes a new instance of this class.
     * 
     * table: the name of the table from which this record comes
     * sys_id: the sys_id of the record
     * pattern: the pattern of the string we want to generate.  The pattern may include ${} escapes for fields whose values should
     *          be included.  For instance, the pattern "sys_id: ${sys_id}" would substitute the actual sys_id's value for the escape.
     * link: a boolean, true if the pattern is to be surrounded by an "a" tag to link to the object in question.
     */
    initialize: function(table, sys_id, pattern, link) {
        this.table = table;
        this.sys_id = sys_id;
        this.pattern = pattern;
        this.values = {};
        this.link = link;
        this.values['sys_id'] = sys_id;
    },
    
    /*
     * Set a field value.  This is useful if the calling code has already read the underlying GlideRecord, and wants to avoid
     * the overhead of another database read.
     */
    setValue: function(name, value) {
        this.values[name] = value;
    },
    
    /*
     * Converts this instance to a string.
     */
    toString: function() {
        // some setup...
        var gr = new GlideRecord(this.table);
        var gr_read = false;
        var regex = /^(.*?)\$\{([^\}]+?)\}(.*)$/;
        
        // make all our escape substitutions...
        var rr = regex.exec(this.pattern);
        while (rr) {
            var fn = rr[2];
            var fv = this.values[fn];
            if (!fv) {
                if (!gr_read) {
                    gr.get(this.sys_id);
                    gr_read = true;
                }
                fv = gr.getValue(fn);
                this.values[fn] = fv;
            }
            this.pattern = rr[1] + fv + rr[3];
            rr = regex.exec(this.pattern);
        }
        
        // surround with an "a" tag, if this is to be a link...
        if (this.link)
            this.pattern = '<a href="' + this.table + '.do?sys_id=' + this.sys_id + '"><u>' + this.pattern + '</u></a>';
        
        return this.pattern;
    },
    
    type: 'RecordToHTML'
}
