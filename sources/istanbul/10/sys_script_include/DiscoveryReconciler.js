var DiscoveryReconciler = Class.create();
DiscoveryReconciler.prototype = {
	initialize: function(cmdbGr, data) {
		this.cmdbGr = cmdbGr;
		this.data = data;
	},
	
	process: function() {
		for (var tableName in this.data){
			var obj = this.data[tableName];
			if (tableName == 'cmdb_ci_spkg') {
				var cmsoft = new GlideappCMDBSoftwareHelper(this.cmdbGr);
				cmsoft.reconcile(obj.data);
			} else if (tableName == 'cmdb_ci_network_adapter')
			this.networkAdapters(obj);
			else
				this.normalRelatedList(tableName, obj.data, obj.refName, obj.keyName);
		}
	},
	
	normalRelatedList: function(tableName, data, refName, keyName) {
		var dReconciler = SncDiscoveryReconciler;
		
		if (data) {
			var tr = new dReconciler(tableName, refName, this.cmdbGr);
			tr.reconcile(data, keyName);
		}
		
	},
	
	networkAdapters: function(obj) {
		var adapters = obj.data;
		var fixedAdapters = [];
		var nicsByName = {};
		var routesByName = {};
		var routerInterfaces = [];
		for (var i = 0; i < adapters.length; i++) {
			var adapter = adapters[i];
			if (gs.nil(adapter.name) || adapter.name.startsWith("lo") || this.isLocalhost(adapter))
				continue;
			
			if (!JSUtil.nil(adapter.mac_address)) {
				var ma = SncMACAddress.getMACAddressInstance(adapter.mac_address);
				adapter.mac_address = (ma) ? ma.getAddressAsString() : 'NULL';
			}
			
			fixedAdapters.push(adapter);
			nicsByName[adapter.name + ''] = adapter;
			routesByName[adapter.name] = adapter.routes;
			routerInterfaces.push({name: adapter.name, ip_address: adapter.ip_address, mac_address: adapter.mac_address});
		}
		adapters = fixedAdapters;
		
		this.normalRelatedList('cmdb_ci_network_adapter', adapters, obj.refName, obj.keyName);
		this.normalRelatedList('dscy_router_interface', routerInterfaces, obj.refName, obj.keyName);
		
		// handle new-style IP address reconciliation...
		var gr = new GlideRecord('cmdb_ci_network_adapter');
		gr.addQuery('cmdb_ci', this.cmdbGr.getUniqueValue());
		gr.query();
		while (gr.next()) {
			var nic_name = '' + gr.name;
			var nic_sys_id = '' + gr.sys_id;
			var adapter = nicsByName[nic_name];
			if (!adapter || !adapter.ip_addresses)
				continue;
			
			var rlr = new GlideRelatedListReconciler('cmdb_ci_ip_address', 'nic', nic_sys_id, null,
			null);
			rlr.reconcile(adapter.ip_addresses, 'ip_address');
		}
		
		// handle route reconciliation
		// get exit interfaces
		gr = new GlideRecord('dscy_router_interface');
		gr.addQuery('cmdb_ci', this.cmdbGr.getUniqueValue());
		gr.query();
		gr.saveLocation();
		
		while (gr.next()) {
			// reconcile exit interface routes
			var exitIfaceRoutes = routesByName[gr.name].ifRoutes;
			var fixedIfRoutes = [];
			for (var i = 0; i < exitIfaceRoutes.length; i++) {
				var route = exitIfaceRoutes[i];
				
				// no localhost routes
				if (route.dest_ip_network.indexOf('127.') == 0)
					continue;
				
				route.router_interface = gr.sys_id;
				fixedIfRoutes.push(route);
			}
			
			this.normalRelatedList('dscy_route_interface', fixedIfRoutes, obj.refName, obj.keyName);
		}
		
		// get exit interface routes
		var eigr = new GlideRecord('dscy_route_interface');
		eigr.addQuery('cmdb_ci', this.cmdbGr.getUniqueValue());
		eigr.query();
		
		var exitRoutesByIface = {};
		while (eigr.next()) {
			var iface = eigr.router_interface.getDisplayValue();
			if (! exitRoutesByIface.hasOwnProperty(iface)) {
				exitRoutesByIface[iface] = [];
			}
			var net = new SncIPNetworkV4(eigr.dest_ip_network);
			var routeInfo = {net: net, sysid: eigr.sys_id + ''};
			exitRoutesByIface[iface].push(routeInfo);
		}
		
		// iterate over interfaces again now that exit interface routes have been reconciled
		// reconcile next hop routes
		gr.restoreLocation();
		while (gr.next()) {
			if (! exitRoutesByIface.hasOwnProperty(gr.name))
				continue;
			
			var gwRoutes = routesByName[gr.name].gwRoutes;
			var fixedRoutes = [];
			for (var i=0; i < gwRoutes.length; i++) {
				var route = gwRoutes[i];
				
				// no localhost routes
				if (route.dest_ip_network.indexOf('127.') == 0)
					continue;
				
				var ip = new SncIPAddressV4(route.next_hop_ip_address);
				var exitRoutes = exitRoutesByIface[gr.name];
				for (var j=0; j < exitRoutes.length; j++) {
					var exitRoute = exitRoutes[j];
					if (exitRoute.net.contains(ip) || exitRoute.net.isBroadcastAddress(ip)) {
						route.route_interface = exitRoute.sysid;
						fixedRoutes.push(route);
						break;
					}
				}
			}
			
			this.normalRelatedList('dscy_route_next_hop', fixedRoutes, obj.refName, obj.keyName);
		}
	},
	
	isLocalhost: function(adapter) {
		if (adapter.ip_address != null && adapter.ip_address == '127.0.0.1')
			return true;
		
		if (!adapter.ip_addresses)
			return false;
		
		for (var i = 0; i < adapter.ip_addresses; i++) {
			if (adapter.ip_addresses[i].ip_address == '127.0.0.1')
				return true;
		}
		
		return false;
	},
	
	type: 'DiscoveryReconciler'
};
