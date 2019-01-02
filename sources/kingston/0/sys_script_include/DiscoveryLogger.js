// Discovery class

/**
 * Provides methods for convenient logging of Discovery events.
 *
 * Tom Dilatush tom.dilatush@service-now.com
 */
var DiscoveryLogger = Class.create();

DiscoveryLogger.INFO = 0;
DiscoveryLogger.WARNING = 1;
DiscoveryLogger.ERROR = 2;
DiscoveryLogger.NO_RESULT_CODE = -1;
var HELP_LINK = 'Help link';

DiscoveryLogger.info = function(msg, source, sensor, ci, resultCode) {
	var dl = new DiscoveryLogger();
	dl.info(msg, source, sensor, ci, resultCode);
};

DiscoveryLogger.warn = function(msg, source, sensor, ci, resultCode) {
	var dl = new DiscoveryLogger();
	dl.warn(msg, source, sensor, ci, resultCode);
};

DiscoveryLogger.error = function(msg, source, sensor, ci, resultCode) {
	var dl = new DiscoveryLogger();
	dl.error(msg, source, sensor, ci, resultCode);
};

DiscoveryLogger.log = function(level, msg, source, sensor, ci, resultCode) {
	var dl = new DiscoveryLogger();
	dl.log(level, msg, source, sensor, ci, resultCode);
};

DiscoveryLogger.prototype = {
	/*
 	* Initializes a new instance of this class.  If an instance of DiscoveryStatus is given, that instance is used directly.  If a string is given,
 	* it is assumed to be the sys_id of the desired status record.  If no status is given, then the global variable "agent_correlator" is used.
 	* Similarly, if value is given for device, it is assumed to be a device history record sys_id.  If no device is given, then the device is
 	* is recovered from the global variable g_device, if present.
 	*/
	initialize: function(status, device) {
		this.level = DiscoveryLogger.INFO;
		this.msg = '';
		this.source = 'Unknown';
		this.ci = null;
		this.sensor = null;
		this.ip = null;
		this.resultCode = DiscoveryLogger.NO_RESULT_CODE;
		
		var ac = null;
		if (typeof agent_correlator != 'undefined')
			ac = agent_correlator;
		
		var gd = null;
		if (typeof g_device != 'undefined')
			gd = g_device;
		
		this.status = null;
		
		if (status) {
			if ((typeof status == 'object') && (status instanceof DiscoveryStatus))
				this.status = status.sysID;
			else
				this.status = '' + status;
		}
		
		if (!this.status && ac)
			this.status = '' + ac;
		
		this.device = null;
		if (device) {
			this.device = '' + device;
			var gr = new GlideRecord('discovery_device_history');
			if (gr.get(this.device)) {
				this.ci = gr.getValue('cmdb_ci');
				this.ip = gr.getValue('source');
			}
		} else {
			if (gd) {
				this.device = '' + gd.getSysID();
				this.ci = '' + gd.getSourceCmdbCi();
				this.ip = '' + gd.getSource();
			}
		}
	},
	
	info: function(msg, source, sensor, ci, resultCode) {
		this.log(DiscoveryLogger.INFO, msg, source, sensor, ci, resultCode);
	},
	
	warn: function(msg, source, sensor, ci, resultCode) {
		this.log(DiscoveryLogger.WARNING, msg, source, sensor, ci, resultCode);
	},
	
	error: function(msg, source, sensor, ci, resultCode) {
		this.log(DiscoveryLogger.ERROR, msg, source, sensor, ci, resultCode);
	},
	
	log: function(level, msg, source, sensor, ci, resultCode) {
		if (level)
			this.level = level;
        // Check if the msg is an Object, then get the associated result code
		if (msg) {
			if (typeof msg == 'object' && msg.msg) {
				this.msg = msg.msg;
				this.resultCode = msg.resultCode;
			}
			else
				this.msg = '' + msg;
		}
		if (source)
			this.source = source;
		if (sensor)
			this.sensor = sensor;
		if (ci)
			this.ci = ci;
		if (resultCode)
			this.resultCode = resultCode;
		
		this._log();
	},
		
	setSource: function(source) {
		this.source = source;
	},
	
	setLevel: function(level) {
		this.level = level;
	},
	
	setSensor: function(sensor) {
		this.sensor = sensor;
	},
	
	_log: function() {
		if (!this.status)
			return;
		
		this.insertRecord('discovery_log');
		if (this.level == DiscoveryLogger.ERROR)
			SNC.DiscoveryActiveError.insert(this.status, this.msg, this.truncateMsg(this.msg), this.device, this.sensor, this.ci, this.ip, this.getLink(this.resultCode), this.resultCode);
	},
	
	insertRecord: function(table) {
		var gr = new GlideRecord(table),
			status = this.status;

		// status is the payload's agent_correlator.  For orchestration, this is typically prefixed
		// by "rba.".  discovery_log.status is a reference field and can only be 32 characters.
		// Take the last 32 characters of whatever is there.
		if (status)
			status = status.substr(status.length - 32);

		gr.setValue( 'short_message',  this.truncateMsg(this.msg) );
		gr.setValue( 'message',        this.msg    );
		gr.setValue( 'source',         this.source );
		gr.setValue( 'level',          this.level  );
		gr.setValue( 'status',         status );
		gr.setValue( 'device_history', this.device );
		gr.setValue( 'sensor',         this.sensor );
		gr.setValue( 'cmdb_ci',        this.ci     );
		if (this.resultCode != DiscoveryLogger.NO_RESULT_CODE)
			gr.setValue( 'result_code',    this.resultCode);
		if (this.level == DiscoveryLogger.ERROR)
			gr.setValue( 'help', '[code]<a href="' + this.getLink(this.resultCode) + '" target="_blank">' + HELP_LINK + '</a>[/code]');
		
		gr.insert();
	},
	
	/*
	 * Truncates the log messages based on the limit set in sys properties.
	 * If there are any [code] tags, return the original message.
	 */
	truncateMsg: function(message) {
		var max_log_length = gs.getProperty('glide.discovery.log_message_length', 200);
		if (max_log_length <= 0 || message.length <= max_log_length || message.indexOf("[code]") > -1)
			return message;
		else return message.substring(0, max_log_length) + '...'; 
	},
	
	/*
	 * Returns the relevant documentation URL based on the log message
	 *
	 */
	getLink: function(resultCode) {
			return SNC.DiscoveryHelpLink.getLink(resultCode);
	},
	
	type: "DiscoveryLogger"
};
