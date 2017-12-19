// Discovery class

/**
 * Parses the output of ifconfig.
 */
var IDSensorUtil = Class.create();

IDSensorUtil.prototype = {
	
	getAdapters: function(output, skipStr, partsExpr, ipv4Expr, ipv6Expr, macAddressFunc) {
		var joinedOutput = output.replace(/\n\n/mg, "\n").replace(/\n\s+/mg, " ");
		var lines = joinedOutput.split(/\n/);
		var adapters = {};
		
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			
			// Reset the RegExp object - without this, because the object is being reused, it
			// won't start at the beginning of the new line
			partsExpr.lastIndex = 0;
			var parts = partsExpr.exec(line);
			
			if (JSUtil.nil(parts))
				continue;
			
			var adapterName = parts[1].split(":")[0];
			var adapterOpts = parts[2];
			
			if (JSUtil.notNil(skipStr) && adapterOpts.match(skipStr))
				continue;
			
			// See if we already have the NIC - if not, we'll create one when we have an IP address to
			// associate with it
			var adapter = adapters[adapterName];
			
			// Get the IPV4 address info
			ipv4Expr.lastIndex = 0;
			while ((networkInfo = ipv4Expr.exec(adapterOpts)) != null) {
				if (!SncIPAddressV4.get(networkInfo[1]) || networkInfo[1] == "0.0.0.0" ||
					networkInfo[1] == "255.255.255.255" || networkInfo[1] == "127.0.0.1")
				continue;
				
				if (!adapter) {
					adapter = this.createAdapter(adapterName,
					macAddressFunc(joinedOutput, adapterName, networkInfo[1]));
					adapters[adapterName] = adapter;
				}
				
				this.addIP(adapter, networkInfo[1], 4, networkInfo[2]);
			}
			
			// Get IPV6 addresses
			if (JSUtil.notNil(ipv6Expr)) {
				ipv6Expr.lastIndex = 0;
				while ((ipv6Info = ipv6Expr.exec(adapterOpts)) != null) {
					var ipv6 = SncIPAddressV6.get(ipv6Info[1]);
					if (!ipv6 || ipv6.isLocalhost() || ipv6.isUnspecified())
						continue;
					
					if (!adapter) {
						this.createAdapter(adapterName, macAddressFunc(joinedOutput, adapterName, ipv6Info[1]));
						adapters[adapterName] = adapter;
					}
					
					this.addIP(adapter, ipv6Info[1], 6, ipv6Info[2]);
				}
			}
			
			// Finished fetching IP addresses - if we have one, set the adapter values to the first ones in the list
			if (adapter) {
				adapter.ip_address = (adapter.ip_addresses.length > 0) ? adapter.ip_addresses[0].ip_address : null;
				adapter.netmask = (adapter.ip_addresses.length > 0) ? adapter.ip_addresses[0].netmask : null;
			}
		}
		
		var adapterList = [];
		for (var nicName in adapters)
			adapterList.push(adapters[nicName]);
		return adapterList;
	},
	
	getAdapterGateways: function(output, adapters, gwExpr) {
		var joinedOutput = output.replace(/\n\n/mg, "\n").replace(/\n\s+/mg, " ");
		var lines = joinedOutput.split(/\n/);
		var default_gateway;
		
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			
			gwExpr.lastIndex = 0;
			var parts = gwExpr.exec(line);
			
			if (JSUtil.nil(parts))
				continue;
			
			for (var n in adapters)
				if (adapters[n].name == parts[2]) {
				adapters[n].ip_default_gateway = parts[1];
				default_gateway = parts[1];
			}
		}
		
		return default_gateway;
	},
	
	getAdapterRoutes: function(output, adapters) {
		var joinedOutput = output.replace(/\n\n/mg, "\n").replace(/\n\s+/mg, " ");
		var lines = joinedOutput.split(/\n/);
		var routeExpr = /^([0-9]\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(?:\S+\s+){3}(\S+)$/g;
		// e.g.
		// Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
		// 0.0.0.0         10.4.15.1       0.0.0.0         UG    0      0        0 eth0
		// 10.4.15.0       0.0.0.0         255.255.255.192 U     0      0        0 eth0
		// ...
		
		var result = {};
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			
			routeExpr.lastIndex = 0;
			var parts = routeExpr.exec(line);
			
			if (JSUtil.nil(parts))
				continue;
			
			var destination = parts[1];
			var netmask = parts[3];
			var flags = parts[4];
			var ifName = parts[5];
			
			var route = {
				dest_ip_network: destination + '/' + this.maskToCidr(netmask)
			};
			
			if (! result.hasOwnProperty(ifName))
				result[ifName] = {ifRoutes: [], gwRoutes: []};
			
			if (flags.indexOf('G') == -1) {
				route.router_interface = ifName;
				result[route.router_interface].ifRoutes.push(route);
				
			} else {
				route.next_hop_ip_address = parts[2];
				route.route_interface = ifName;
				result[route.route_interface].gwRoutes.push(route);
			}
		}
		
		for (var n in adapters) {
			if (result.hasOwnProperty(adapters[n].name)) {
				adapters[n].routes = result[adapters[n].name];
			}
		}
		
		return result;
	},
	
	// Takes a netmask (e.g. '255.255.255.255') and returns the cidr representation (e.g. '32')
	maskToCidr: function (mask) {
		var cidr = 0;
		var parts = mask.split('.');
		for (var i=0; i < parts.length; i++) {
			part = Number(parts[i]);
			while (0x80 == (part & 0x80)) {
				++cidr;
				part = part << 1 & 0xff;
			}
		}
		return(String(cidr));
	},
	
	addIP: function(adapter, address, version, netmask) {
		if (!adapter)
			return;
		
		var ip = {};
		ip.ip_address = address;
		ip.ip_version = version;
		ip.netmask = netmask;
		adapter.ip_addresses.push(ip);
	},
	
	createAdapter: function(name, macAddress) {
		var adapter = {};
		adapter.name = name;
		adapter.mac_address = macAddress;
		adapter.ip_addresses = [];
		return adapter;
	},
	
	calculateSnmpSerialNumber: function(result, serialNumberOid, fallbackValue, identityString) {
		
		var snmp = new SNMPResponse(result);
		var serialNumber = snmp.getOIDText(serialNumberOid);
		if (JSUtil.nil(serialNumber) || serialNumber.toUpperCase().startsWith('N/A')) {
			gs.log(' '+new Date().getTime()+'==================in ' + identityString + ' Identity - could not find Serial using snmp. Switching to fallback value');
			serialNumber = fallbackValue;
		}
		
		serialNumber = ''+serialNumber.trim();
		
		if (!serialNumber){
			gs.log(' '+new Date().getTime()+'==================exiting ' + identityString + ' Identity - because no serial number and no fallback value could be found');	
			return;
		}
		
		return serialNumber;
		
	},
	
	addToSerialNumberTable: function(serialNumber, ciData) {
	
		ciData.getData()['serial_number'] = serialNumber; // this should be the primary serial number.
	
		// add to the serials table as well
		var serials = ciData.addRelatedList('cmdb_serial_number', 'cmdb_ci');
        var sr = {
			serial_number_type: 'chassis',
        	serial_number: serialNumber,
        	valid: true
        };
        	
		serials.addRec(sr);
	},
	
	type: "IDSensorUtil"
};