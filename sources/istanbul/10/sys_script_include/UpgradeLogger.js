gs.include("PrototypeServer");

var UpgradeLogger = Class.create();

UpgradeLogger.prototype = {
    LOG_SOURCE : 'Upgrade',
    LOGGER : GlideSysLog,

    initialize : function() {
    },

    log : function(s) {
       this.LOGGER.info(this.LOG_SOURCE, s);
    },

    warn : function(s) {
    this.LOGGER.warn(this.LOG_SOURCE, s);
    },

    error : function(s) {
    this.LOGGER.error(this.LOG_SOURCE, s);
    }
}