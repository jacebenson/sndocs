gs.include("PrototypeServer");
gs.include("SOAPEnvelope");
gs.include("SOAPRequest");

var RegisterInstanceClient = Class.create();

RegisterInstanceClient.prototype = {
  initialize: function() {

  },

  process: function() {
    if (this._shouldSkip()) {
        this.setStatus("skipped instance registration");
        return;
    }

    gs.log("Starting instance registration");  

    var instance_name = this.getInstanceName();
    this.log("got instance name: " + instance_name);

    var instance_id = this.getInstanceID(instance_name);
    this.log("got instance id: " + instance_id);

    try {
      var new_instance_name = this.registerInstance(instance_id, instance_name);

      if (new_instance_name == null) {
        this.log("unsuccessful: trying again in 5 minutes", "warning");
        this.updateTriggerType("10"); // Interval
        return;
      }

      gs.log("register instance returned instance name: " + new_instance_name);

      // always set instance information... (When zbooting we want to make sure we
      // set the instance_id the same as before we zbooted)
      gs.setProperty("instance_name", new_instance_name);
      gs.setProperty("instance_id", instance_id);

      this.log("completed");
      this.updateTriggerType("9"); // Run at Startup
    } catch (e) {
      this.log("failed: " + e + " (" + gs.getProperty("glide.register_server_url") + ")", "error");
      this.updateTriggerType("10"); // Interval
    }
  },

  log: function(msg, type) {
    gs.log("instance registration: " + msg);
    this.setStatus(msg, type);
  },

  updateTriggerType: function(type) {
    // schedule a run once to update myself because at 
    // end of job execution, my trigger type is preserved
    var job = new GlideRunScriptJob();
    job.scheduleScript("var sgr = new GlideRecord('sys_trigger');\n" +
                              "sgr.addQuery('name', 'Register Instance');\n" +
                              "sgr.query();\n" +
                              "if (sgr.next()) {\n" +
                              "gs.log('Updating trigger to type: " + type + "');\n" + 
                              "sgr.trigger_type = '" + type + "';\n" +
                              "sgr.update();}\n");
  },

  registerInstance: function(id, name) {
    var register_server_url = gs.getProperty("glide.register_server_url");

    // create the soap document
    var soapdoc = new SOAPEnvelope("RegisterInstance", "http://www.service-now.com/");
    soapdoc.setFunctionName("execute");
    soapdoc.addFunctionParameter("instance_name", name);
    soapdoc.addFunctionParameter("instance_id", id);
    soapdoc.addFunctionParameter("current_build_date", gs.getProperty("glide.builddate"));
    soapdoc.addFunctionParameter("current_build_tag", gs.getProperty("glide.buildtag"));

    // post the request
    var soapRequest = new SOAPRequest(register_server_url + "RegisterInstance.do?SOAP");
    var soapResponse = soapRequest.post(soapdoc);
    var new_instance_name = gs.getXMLText(soapResponse, "//executeResponse/instance_name");

    return new_instance_name;
  },

  getInstanceName: function() {
    var iname = gs.getProperty("instance_name");
    if (iname == null || iname == "")
      iname = gs.getProperty("glide.db.name");

    var instance_name = this._cleanName(iname);
    gs.setProperty("instance_name", instance_name, "Instance name");
    return instance_name;
  },

  getDBName: function() {
    var iname = gs.getProperty("glide.db.name");
    return this._cleanName(iname);
  },

  _cleanName: function (iname) {
    if (iname.indexOf("_") == -1)
      return iname;

      var names = iname.split("_");
      var port = names[names.length - 1];
      if(isNaN(port)) {
        return iname;
      } else {
        // its a number - must be port, strip it
        names = names.slice(0, names.length - 1);
        return names.join('_');
      }

    return iname;
  },

  getInstanceID: function(instance_name) {
    var instance_id = gs.getProperty("instance_id");
    if (instance_id == null || instance_id == "") {
      // generate an instance_id
      instance_id = gs.generateGUID(instance_name);
      gs.log("saving instance_id property: " + instance_id);
      gs.setProperty("instance_id", instance_id, "Instance ID");
    }

    return instance_id;
  },

  setStatus: function(msg, type) {
    if (!type)
      type = "info";

    var s = GlideStatus;
    s.set("instance_registration", msg, type);
  },

  _shouldSkip: function() {
    return GlideUtil.isDeveloperInstance();
  },

  type: "RegisterInstanceClient"
};
