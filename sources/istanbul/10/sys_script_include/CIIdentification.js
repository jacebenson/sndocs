// CI Identification class

/**
 * Main class for Discovery CI Identification.
 * 
 * Aleck Lin aleck.lin@service-now.com
 */
var CIIdentification = Class.create();

CIIdentification.prototype = {
    
    initialize: function(ciData, logger) {
        this.ciData = ciData;
        this.debug_flag = GlideProperties.getBoolean('glide.discovery.debug.ci_identification', false);
        this.logger = JSUtil.notNil(logger) ? logger : new DiscoveryLogger();
        this.debug('CIIdentification.initialize()');
    },
    
    /*
     * Identify the CI.  This is the entry point for the entire CI Identification process.
     */
    process: function() {
        this.debug('CIIdentification.process()');
        try { 
            this.debug('The ciData object contains the following information' + this.ciData.toString());

            // load up the identifiers and run them!
            var identifier = new CIIdentifier(this.ciData, this.logger, this.debug_flag);
            identifier.load(this.ciData.getData().sys_class_name);

            return identifier.run();
        } catch (ex) {
            this._log_error(ex);
        }
    },
    
    _log_error: function(ex) {
        this.logger.error('Unhandled exception: ' + ex + ' (CIIdentification)');
    },
    
    /*
     * Log a message to the CI Identification log, but only if we've got debug logging turned on...
     */
    debug: function(msg) {
        if (this.debug_flag)
            this.logger.info(msg + ' (CIIdentification)');
    },
    
    type: 'CIIdentification'
}
