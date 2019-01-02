var Syslog = Class.create();

Syslog.prototype = {
  /*
   * Creates a new instance of this class for sending messages to the given destination host (or IP), through the given MID server, to
   * the given syslog facility (numeric, 0 - 23).
   */
  initialize : function(dst_host, mid_server, facility) {
      this.port = 514;
      this.src_host = gs.getProperty('instance_name');
      this.bsd_style = 'true';
      this.dst_host = dst_host;
      this.app_name = 'Service-now';
      this.app_id = null;
      this.msg_id = null;
      this.mid_server = (mid_server.indexOf('mid.server.') == 0) ? mid_server : ('mid.server.' + mid_server);
      this.facility = (facility == null) ? 16 : facility - 0;
      this.timestamp = null;
      this.timezone = null;
  },

  /*
   * Sends the given message via syslog, at the given priority (default priority is 6, informational).
   */
  log: function(msg, priority) {
      var priority = (priority == null) ? 6 : priority - 0;
      var probe = new SncProbe();
      probe.setTopic('Syslog');

	  probe.addParameter(	  'skip_sensor', 	  'true' );
      probe.addParameter(     'syslog_facility',  '' + this.facility );
      probe.addParameter(     'syslog_priority',  '' + priority      );
      probe.addParameter(     'syslog_bsd_style', this.bsd_style     );
      probe.addParameter(     'syslog_port',      '' + this.port     );
      probe.addParameter(     'syslog_dst_host',  this.dst_host      );
      probe.addParameter(     'syslog_message',   msg                );
      probe.addParameter(     'syslog_app_name',  this.app_name      );
      if (this.src_host)
          probe.addParameter( 'syslog_src_host',  this.src_host      );
      if (this.app_id)
          probe.addParameter( 'syslog_app_id',    this.app_id        );
      if (this.msg_id)
          probe.addParameter( 'syslog_msg_id',    this.msg_id        );
      if (this.timestamp)
          probe.addParameter( 'syslog_timestamp', this.timestamp     );
      if (this.timezone)
          probe.addParameter( 'syslog_timezone',  this.timezone      );
      probe.insert(this.mid_server);
  },

  useMidTimeZone: function() {
      this.timezone = 'mid_time_zone';
  },

  setSpecificTimeZone: function(timeZone) {
      this.timezone = timeZone;
  },

  setSourceHost: function(srcHost) {
      this.src_host = srcHost;
  },

  setAppID: function(id) {
      this.app_id = id;
  },

  setAppName: function(name) {
      this.app_name = name;
  },

  setMsgID: function(id) {
      this.msg_id = id;
  },

  setRFC5424Style: function() {
      this.bsd_style = 'false';
  },

  setBSDStyle: function() {
      this.bsd_style = 'true';
  },

  type: 'Syslog'
}