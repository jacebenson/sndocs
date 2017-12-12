var JavascriptProbe = Class.create();

JavascriptProbe.prototype = {
  initialize : function(mid_server) {
    this.midServer = mid_server;
    this.source = "";
    this.name = "JavascriptProbe"; // optional probe name
    this.payloadDoc = new GlideXMLDocument("parameters");
  },

  setName : function(name) {
    this.name = name;
  },

  setSource : function(s) {
    this.source = s;
  },

  addParameter : function(name, value) {
    var el = this.payloadDoc.createElement("parameter");
    el.setAttribute("name", name);
    el.setAttribute("value", value);
  },

  setJavascript : function(script) {
    this.addParameter("script", script);
  },

  create : function() {
    var egr = new GlideRecord("ecc_queue");
    egr.agent = "mid.server." + this.midServer;
    egr.queue = "output";
    egr.state = "ready";
    egr.topic = "JavascriptProbe";
    egr.name = this.name;
    egr.source = this.source;
    egr.payload = this.payloadDoc.toString();
    return egr.insert();
  },

  type: 'JavascriptProbe'
}