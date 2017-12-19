var GSLog = Class.create();

GSLog.prototype = {

    /* GSLog(traceProperty,caller): Instanciates a logging instance
     *
     * traceProperty: The name of the property containing the logging level for the targeted script/object
     * caller: The name of the script, object etc. calling the logger
     *
     * To use Log4J style logging:
     *      [this]._log = (new GSLog(traceProperty,caller))).setLog4J();
     */
    initialize : function(traceProperty,caller) {
        this.whoami = '';
        if (caller !== null)
            this.whoami = caller;
         
        this._logLevel = (typeof gs.logWarning == 'function');
        this._devel = true; // Look up the dev instance property?

        // support properties
        if (traceProperty)
            this.setLevel(gs.getProperty(traceProperty, ''));
        else
            this.setLevel(this._getCallerThreshold(caller));

        // Want to use log4j style logging?
        this._log4j = false;
        
        //Default logging to gs.log and not gs.print
        this._printLog = false;
		
		//Option to prefix each log message with a milliseconds value
		this._timestampPrefix = false;

        // gs.print('GSLog.initialize: [' + this.whoami + '] level=' + this.logLevel + ' [' + this._levelOrder[this.logLevel] + ']');
    },

    // System Log has Debug, Error, Information, Warning
     
    logDebug: function(msg) {
         this.log('debug', msg);
    },

    logInfo: function(msg) {
         this.log('info', msg);
    },

    logNotice: function(msg) {
         this.log('notice', msg);
    },

    logWarning: function(msg) {
         this.log('warning', msg);
    },

    logErr: function(msg) {
         this.log('err', msg);
    },

    logError: function(msg) {
         this.log('err', msg);
    },
     
    logCrit: function(msg) {
         this.log('crit', msg);
    },

    logAlert: function(msg) {
         this.log('alert', msg);
    },

    logEmerg: function(msg) {
         this.log('emerg', msg);
    },

    // Log4j style logging
    trace: function(msg) {
        this.log('trace', msg);
    }, // If you're logging trace, you're probably logging too much.

    debug: function(msg) {
         this.log('debug', msg);
    },

    info: function(msg){
        this.log('info', msg);
    },

    warn: function(msg){
        this.log('warning', msg);
    },

    error: function(msg){
        this.log('err', msg);
    },

    fatal: function(msg){
        this.log('fatal', msg);
    },

    /* log(level,msg): Log a message at the specified level
     *
     * level: The level at which to log
     * msg: The message
     */
    log: function(level, msg) {
        // (always log a message at an invalid log level)
        if (typeof this._levelOrder[level] !== undefined && this._levelOrder[level] > this._levelOrder[this.logLevel] )
             return;

        var whomsg='';
        var scriptPrefix='*** Script';
        if (!this._logLevel && this._devel)
            scriptPrefix = '*** Script [' + this._logPrefix[level] + ']';
        else if (this.whoami) {
            whomsg = '[' + this.whoami + '] ';
            scriptPrefix = '*** Script [' + this.whoami + ']';
        }
         
        // override 'Script: ' prefix in log, and log at the given level if the right function exists 
        if (this._printLog)
			//Removal of '*** Script' as gs.print prefixes this on.
        	gs.print(scriptPrefix.replace('*** Script','') + ': [' + this._logPrefix[level] + '] ' + msg);
        else {
        	var logFunction = gs.log;
        	switch (level) {
            	case 'debug': 
            		msg = '[' + this._logPrefix[level] + '] ' + msg;
            		break;
            	case 'warning':
            		if (typeof gs.logWarning == 'function')
            			logFunction = gs.logWarning;
            		break;
            	case 'err':
            	case 'error':
            		if (typeof gs.logError == 'function')
            			logFunction = gs.logError;
                    break;
                // case 'info':
            	default:
            		if (typeof gs.log == 'function')
            			logFunction = gs.log;
        	}
			
			if (this._timestampPrefix) {
				var gdt = new GlideDateTime();
				var gdtMs = gdt.getNumericValue().toString();
				msg = gdt.getDisplayValueInternal() + "." + gdtMs.substr(gdtMs.length - 3) + " " + msg;
			}

        	logFunction(msg, scriptPrefix);
        }
    },

    setLevel: function(level) {

        if (level.toString() == 'true')
             level = 'debug';    // compatibility with true|false logging properties
        else if (!level || level.toString() == 'false')
             level = 'notice'; // default
        else if (!this._levelOrder[level]) {
             level = 'notice'; // invalid, so set to default
        }

        /* If you want to use log4j style logging we have to cut down some of the error states.
         * Everything higher than an error -> FATAL, NOTICE -> INFO
         * We also have to disallow FATAL and TRACE for BSD style logging.  FATAL -> EMERG, TRACE->DEBUG
         */
        if (this._log4j) { //Only allow Log4J log levels
            switch (level) {
                case GSLog.EMERG:
                case GSLog.ALERT:
                case GSLog.CRIT:
                    level=GSLog.FATAL;
                    break;
                case GSLog.NOTICE:
                    level = GSLog.INFO;
                    break;
                default:
                    break;
            }
        } else {  //Only allow BSD log levels
            switch (level) {
                case GSLog.FATAL:
                    level=GSLog.EMERG;
                    break;
                case GSLog.TRACE:
                    level=GSLog.DEBUG;
                    break;
                default:
                    break;
            }
        }
        // gs.print('GSLog.setLevel: ' + level);
        this.logLevel = level; 
    },

    /* getLevel(): Returns the current logging level */
    getLevel: function(level) {
        return this.logLevel;
    },

    /* debugOn(): sets the log level to GSLog.DEBUG */
    debugOn: function() {
        return (this.logLevel == 'debug');
    },

    /* atLevel(logLevel) : Returns true if the logging level of the logger is the same as or above minLogLevel
     *
     * minLogLevel: The minimum logging level to compare against.
     */
    atLevel: function(minLogLevel) {
        if (!this._levelOrder[minLogLevel]) {
            return false;
        }

        if (this._levelOrder[minLogLevel]<=this._levelOrder[this.logLevel]) {
            return true;
        }
        return false;
    },

    /* setLog4J(): Switches the logging class into Log4J mode */
    setLog4J: function() {
        this._log4J = true;
        this.setLevel(this.logLevel); //Checking that the log levels are OK for Log4J style logging
        return this; // allows type to be set at instanciation without a sepperate parameter in the constructor.  Easier to understand.
    },
	
	/* disableDatabaseLogs(): Switches the output of the GSLog to use gs.print instead of gs.log */
    disableDatabaseLogs: function() {
        this._printLog = true;
        return this; // allows type to be set at instanciation without a separate parameter in the constructor.  Easier to understand.
    },
	
	includeTimestamp: function() {
		this._timestampPrefix = true;
	},

    ///

    // logging levels
    _levelOrder: {
        fatal:   0,
        emerg:   1,
        alert:   2,
        crit:    3,
        err:     4,
        warning: 5,
        notice:  6,
        info:    7,
        debug:   8,
        trace:   9
    },
     
    // logging prefixes
     _logPrefix: {
         fatal:   'FATAL',
         emerg:   'EMERG',
         alert:   'ALERT',
         crit:    'CRIT ',
         err:     'ERROR',
         warning: 'WARN ',
         notice:  'NOTIC',
         info:    'INFO ',
         debug:   'DEBUG',
         trace:   'TRACE'
     },

    _getCallerThreshold: function(caller) {
         // TODO: consider performing a record lookup, on the caller name, to pick a log level
         return 'notice';
    },

    type: 'GSLog'

};

// BSD style log level constants
GSLog.EMERG  = "emerg";
GSLog.ALERT  = "alert";
GSLog.CRIT   = "crit";
GSLog.ERR    = "err";
GSLog.WARNING= "warning";
GSLog.NOTICE = "notice";
GSLog.INFO   = "info";
GSLog.DEBUG  = "debug";

// Additions for Log4j style logging
GSLog.FATAL = "fatal";
GSLog.TRACE = "trace";
GSLog.ERROR = GSLog.ERR;
GSLog.WARN  = GSLog.WARNING;
