workflow.includeActivityDefinition('Run Probe');

var VMwareActivityBase = Class.create();
VMwareActivityBase.prototype = Object.extendsObject(Run_ProbeActivityHandler, {

    initialize: function() {
        Run_ProbeActivityHandler.prototype.initialize.call(this);
    },

    configureRequiredCapabilities: function() {
        this._addRequiredCapability("vmware");
    },

    type: 'VMwareActivityBase'
});