gs.include("PrototypeServer");

var Diagnostics = Class.create();
Diagnostics.prototype = {
   
   initialize: function() {
      this.fillConditions();
      this.fillNodes();
      this.fillEventCounts();
      this.fillLogCounts();
      this.fillEmailCounts();
      this.fillLogSizes();
      this.nodeIndex = -1;
   },
   
   nextNode: function() {
      if (this.nodeIndex <= this.nodes.length)
          this.nodeIndex++;
          
      return (this.nodeIndex < this.nodes.length);
   },
   
   getNode: function() {
      if (this.nodeIndex < this.nodes.length)
         return this.nodes[this.nodeIndex];
         
      return null;
   },

   fillConditions: function() {
      this.conditions = {};
      var gr = new GlideRecord('sys_properties');
      gr.addQuery('name', 'STARTSWITH', 'diagnostics.condition.');
      gr.query();
      while (gr.next()) {
         var n = gr.name.toString().substring(22);
         var v = gr.value.toString();
         this.conditions[n] = v;
      } 
   },
   
   fillNodes: function() {
      this.nodes = [];
      var gr = new GlideRecord('sys_cluster_state');
      gr.query();
      while (gr.next()) {
         var node = this._fillNode(gr);
         if (node)
            this.nodes.push(node);
      }
   },
   
   _fillNode: function(gr) {
      var systemId = gr.system_id.toString();
      var node;

      if (systemId == GlideServlet.getSystemID()) {
          node = this._fillFromLocal(gr);
      } else {
          node = this._fillFromClusterState(gr);
      }

      node.nameLink = "<a class='linked' href='sys_cluster_state.do?sys_id=" + gr.sys_id.toString() +
                      "&sys_target=stats&XML=&sysparm_stack=no' target='_new'>" + node.name + "</a>";

      return node;
   },

   _fillFromLocal: function(gr) {
      var node = {};
      node.name = gr.system_id.toString();
      node.status = gr.status.toString();
      node.lastDate = gr.nowDateTime();
      node.lastDateDiff = gs.dateDiff(node.lastDate, gs.nowDateTime(), true);

      try {
         var xml = new XMLHelper(new GlideXMLStats().toStringWithInclude(gs.getProperty("glide.cluster.xmlstats")));
         node.stats = xml.toObject();
         return node;
      } catch (ex) {
         gs.log("ERROR: " + ex);
         return null;
      }
   },

   _fillFromClusterState: function(gr) {
      // ignore nodes with empty xml stats
      if (gr.stats.nil())
         return null;

      var node = {};
      node.name = gr.system_id.toString();
      node.status = gr.status.toString();
      node.lastDate = gr.most_recent_message.getDisplayValue();
      node.lastDateDiff = gs.dateDiff(node.lastDate, gs.nowDateTime(), true);
      try {
         var xml = new XMLHelper(gr.stats.toString());
         node.stats = xml.toObject();
         return node;
      } catch (ex) {
         return null;
      }

   },
   
   fillEventCounts: function() {
      var agg = new GlideAggregate('sysevent');
      agg.addQuery('state', '=', 'ready');
      agg.addAggregate("COUNT");
      agg.query();
      this.eventCount = 0;
      if (agg.next())
         this.eventCount = agg.getAggregate("COUNT");
   },
   
   fillLogCounts: function() {
      var agg = new GlideAggregate('syslog');
      agg.addQuery('sys_created_on', '>', gs.minutesAgo(60));
      agg.addAggregate("COUNT");
      this.logCount = 0;
      agg.query();
      if (agg.next())
         this.logCount = agg.getAggregate("COUNT");
   },
   
   fillEmailCounts: function() {
      var oneHourAgo = gs.minutesAgo(60);
      var agg = new GlideAggregate('sys_email');
      agg.addQuery('type', 'received');
      agg.addQuery('sys_created_on', '>', oneHourAgo);
      agg.addAggregate("COUNT");
      agg.query();
      this.emailReceivedCount = 0;
      if (agg.next())
         this.emailReceivedCount = agg.getAggregate("COUNT");
         
      agg = new GlideAggregate('sys_email');
      agg.addQuery('type', 'sent');
      agg.addQuery('sys_created_on', '>', oneHourAgo);
      agg.addAggregate("COUNT");
      agg.query();
      this.emailSentCount = 0;
      if (agg.next())
         this.emailSentCount = agg.getAggregate("COUNT");
         
      this.pop3Status = '';
      this.smtpStatus = '';
      var gr = new GlideRecord('sys_status');
      gr.addQuery('name', 'glide.pop3.status');
      gr.query();
      if (gr.next())
         this.pop3Status = gr.value.toString();

      gr.initialize(); 
      gr.addQuery('name', 'glide.smtp.status');
      gr.query();
      if (gr.next())
         this.smtpStatus = gr.value.toString();
      else
         this.smtpStatus = gs.getMessage('No emails sent yet');
   },
   
   fillLogSizes: function() {
      
   },

   type: 'Diagnostics'
}