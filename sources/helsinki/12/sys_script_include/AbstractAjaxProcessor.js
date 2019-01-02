// Base ajax processor class that other ajax processors extend
// 
// note that some methods return Java values, not JavaScript values

var AbstractAjaxProcessor = Class.create();

AbstractAjaxProcessor.prototype = {
    CALLABLE_PREFIX : 'ajaxFunction_',

    initialize : function(request, responseXML, gc) {
        this.request = request;
        this.responseXML = responseXML;
        this.gc = gc;
    },

    process : function() {
        var functionName = this.getName();
        if (!functionName)
            return;

        if (functionName.indexOf('_') == 0)
            return;
        
        var f = this[functionName];
        if (!f) {         
            functionName = this.CALLABLE_PREFIX + functionName;
            var f = this[functionName];
            if (!f)
                return;
        }
        if (typeof f != 'function')
            return;

        return f.call(this);
    },

    newItem: function(name) {
        if (!name)
            name = "item";

        var item = this.getDocument().createElement(name);
        this.getRootElement().appendChild(item);
        return item;
    },

    // returns value of parameter as a Java String instance
    getParameter: function(name) {
        return this.request.getParameter(name)
    },

    getDocument: function() {
        return this.responseXML;
    },

    getRootElement: function() {
        return this.responseXML.getDocumentElement();
    },

    // returns value of "sysparm_name" as a Java String instance
    getName: function() {
        return this.getParameter("sysparm_name");
    },

    // returns value of "sysparm_value" as a Java String instance
    getValue: function() {
        return this.getParameter("sysparm_value");
    },

    // returns value of "sysparm_type" as a Java String instance
    getType: function() {
        return this.getParameter("sysparm_type");
    },

    getChars: function() {
        return this.getParameter("sysparm_chars");
    },

    setAnswer: function(value) {
        this.getRootElement().setAttribute("answer", value);
    },

    setError: function(error) {
        this.getRootElement().setAttribute("error", error);
    },

    type: "AbstractAjaxProcessor"
}