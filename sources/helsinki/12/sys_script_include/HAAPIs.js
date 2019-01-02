var HAAPIs = Class.create();

HAAPIs.prototype = {
  initialize : function() {
  },

  getPrimaryDatabase: function() {
      var dbc = GlideDBUtil.getPrimaryDBConfigurationParms();

      var dbConfig = {
		"name": dbc.getDatabaseName(),
        	"prefix": dbc.getPropertyPrefix(),
		"url": dbc.getURL(),
		"type": dbc.getRDBMS(),
		"user": dbc.getUser(),
        	"primary": true
      };

      return dbConfig;
  },

  getNodesAll: function() {
      return this._getNodes();
  },

  getNodesOnline: function() {
      return this._getNodes('online');
  },

  getNodesOffline: function() {
      return this._getNodes('offline');
  },

  getNodeById: function(sysId) {
      var nodes = this.getNodesAll();

      for(var i = 0; i < nodes.length; i++) {
          var node = nodes[i];

          if (node.sys_id == sysId)
              return node;
      }

      return null;
  },
 
  //
  // INTERNAL FUNCTIONS
  //

  _findLowLatency: function(checkGroup,skipFailures) {
      var gr = new GlideRecord('ha_connectivity_test');
      gr.addQuery('check_group', checkGroup);
      gr.addQuery('state', '3');
      gr.query();

      if (gr.next()) {
          // something failed, lets return null so things know we had an issue
          if (skipFailures)
            gs.print("Skipping failed connectivity tests, just looking for successful tests...");
          else
            return null;
      }

      gr = new GlideRecord('ha_connectivity_test');
      gr.addQuery('check_group', checkGroup);
      gr.addQuery('latency', '>', '-1');
      gr.orderBy('latency');
      gr.query();

      if (!gr.hasNext())
          return null;

      var nodes = new Array();

      while(gr.next()) {
          nodes.push(this.getNodeById(gr.cluster_node.sys_id.toString()));
      }

      return nodes;
  },

  _isGreaterThanZero: function(n) {
      if (n == "") {
          return false;
      }

      var num = parseInt(n, 10);
      return num > 0;
  },

  _getNodes: function(status) {
      var gr = new GlideRecord('sys_cluster_state');

      if (status)
          gr.addQuery('status', status);

      gr.orderByDesc('status');
      gr.query();

      var nodeList = new Array();

      while(gr.next()) {
          var lastDate = gr.most_recent_message.getGlideObject().getRaw();
          var lastDateSecs = (new Packages.java.util.Date().getTime() - lastDate.getTime()) / 1000;

          var nodeConfig = {
              sys_id: gr.sys_id.toString(),
              system_id: gr.system_id.toString(),
              status: gr.status.toString(),
              last_checkin: gr.most_recent_message.toString(),
              last_checkin_friendly: GlideDateUtil.getDateTimeString(lastDateSecs, true)
          };

          try {
              this._addNodeAdditionals(gr.stats, nodeConfig);
          } catch(e) {
              gs.log("ERROR: getting additional node attributes: " + e);
          }

          nodeList.push(nodeConfig);
      }

      return nodeList;
  },

  _addNodeAdditionals: function(stats, nodeConfig) {
      var xd = new XMLDocument(stats);

      nodeConfig['url'] = 'http://' + xd.getNodeText('//servlet.hostname') + ':' + xd.getNodeText('//servlet.port');
      nodeConfig['version'] = xd.getNodeText('//instance_assigned_version');
      nodeConfig['primary'] = xd.getNodeText('//db.prefix');
  },

  type: "HAAPIs"
}