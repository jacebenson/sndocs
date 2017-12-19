// Discovery

/**
 * Method API
 * setRanges(ranges)
 *     The input range can be comma separated in the following three formats
 *     1. IP addresses. (10.10.10.1, 10.10.10.2)
 *     2. IP networks. (10.10.10.0/23)
 *     3. IP ranges. (10.10.10.1-10.10.11.254)
 *     This sets the range of IPs that we're looking for.        
 *
 * setRangesByIPOrHostname(ipOrHostname)
 *     This method automatically distinguishes the input as a SINGLE IP or a hostname. If it's an IP address, it's simply fed into setRanges
 *     method, otherwise we look up the DNS table (cmdb_ip_address_dns_name) to try resolving the hostname. The result (an IP or multiple IPs)
 *     is then fed into the setRanges method.
 *
 * setCapabilities(capabilities)
 *     The input capabilities is an javascript array that contains a list of capabilities. It sets the technologies
 *     that we're looking for.
 *     For example, here's a list of potential choices for capabilities.
 *     capabilities = ["ssh","wmi","snmp",{"os_domain":"disco"},{"phase":1}];
 *
 * getMIDServers()
 *     This method returns an array of MID Server name(s) available for the given range and capability. If no MID servers
 *     are available, return an empty array.
 *
 * getMIDServersBySysId()
 *     This method returns an array of MID Server sys_id(s) available for the given range and capability. If no MID servers
 *     are available, return an empty array.
 *
 * setActive(flag)
 *     This method sets whether we look for active MID servers or non-active MID servers. By default, we only look for active
 *     MID servers unless specified otherwise by this method.
 *
 * getStatusMessage()
 *     Return the state of the finder operation.
 *
 * setDebug(value)
 *     The method turns debugging on. The input can be true or false.
 */

var MIDServerFinder = Class.create();

MIDServerFinder.prototype = {
    SUCCESS_MSG: "MID Servers found successfully.",

    initialize: function() {
        this.capabilities = [];
        this.ranges = [];
        this.rangesSet = false;
        this.debugParam = false;
        this.active = true;
        this.statusMsg = "";
    },

    setRanges: function(ranges) {
        if (JSUtil.nil(ranges))
            return;

        this.rangesSet = true;
        var ipAddress = SncIPAddressV4;
        var ipNetwork = SncIPNetworkV4;
        var ipRange   = SncIPRangeV4;

        var elements = ranges.toString().split(',');
        var ipList = new SncIPList();
        var nRanges = [];
        for (var i = 0; i < elements.length; i++) {
            var elem = elements[i];
            var coll = ipNetwork.getIPNetworkInstance(elem);
            if (coll) {
                nRanges.push(coll);
                continue;
            }
            coll = ipRange.getIPRangeV4Instance(elem);
            if (coll) {
                nRanges.push(coll);       
                continue;
            }
            coll = ipAddress.getIPAddressV4Instance(elem);
            if (coll) {
                ipList.add(coll);
                nRanges.push(ipList);
                continue;
            }
        }

        this.ranges = nRanges;
    },

    setRangesByIPOrHostname: function(ipOrHostname) {
        if (this._isValidIPAddress(ipOrHostname))
            return this.setRanges(ipOrHostname);

        this.rangesSet = true;
        var ret = this._findIPsByDNSName(ipOrHostname);

        // This is basically for our internal use for ops. This is the authority if property is turned on.
        if (JSUtil.toBoolean(gs.getProperty("glide.runbook.hostname.look_up_by_instance", "false")))
            ret = new String(SncIPAddressV4.getString(ipOrHostname));
       
        if (JSUtil.notNil(ret))
            this.setRanges(ret);
        else
            this.addStatusMsg("Unable to resolve the hostname (in MID Server Finder): " + ipOrHostname);
    },

    setCapabilities: function(capabilities) {
        if (JSUtil.nil(capabilities) || capabilities.length == 0)
            return;

        this.capabilities = capabilities;
    },

    setActive: function(flag) {
        this.active = flag;
    },

    getMIDServersBySysId: function() {
        var hasCap = (this.capabilities.length != 0);
        var hasRanges = this.rangesSet;
        var res = [];

        if (hasCap && hasRanges) {
            var mids1 = this.findByCapabilities();
            var mids2 = this.findByRanges();
            res = new ArrayUtil().intersect(mids1, mids2);
            if (res.length == 0)
                this.addStatusMsg("No MID servers are found based on the range and capability criteria.");
            else
                this.addStatusMsg(this.SUCCESS_MSG);
            return res;
        } else if (hasRanges) {
            res = this.findByRanges();
            if (res.length == 0)
                this.addStatusMsg("No MID servers are found based on the range criteria.");
            else
                this.addStatusMsg(this.SUCCESS_MSG);
            return res;
        } else if (hasCap) {
            res = this.findByCapabilities();
            if (res.length == 0)
                this.addStatusMsg("No MID servers are found based on the capability criteria.");
            else
                this.addStatusMsg(this.SUCCESS_MSG);
            return res;
        } 


        this.addStatusMsg("No ranges or capabilities specified!");
        return res;
    },

    getMIDServers: function() {
        var mids = this.getMIDServersBySysId();

        var results = [];
        var gr = new GlideRecord("ecc_agent");
        gr.addQuery('sys_id', mids);
		gr.addQuery('validated', true);
        gr.query();
        while (gr.next())
            results.push(gr.name + '');
           
        return results;
    },

    getStatusMessage: function() {
        return this.statusMsg;
    },

    setDebug: function(value) {
        this.debugParam = value;
    },

    /* *****************************************************************
     * PRIVATE METHODS
     *******************************************************************/

    /*
     *  return a list of MID server sys_ids 
     */
    findByCapabilities: function() {
        var agentCaps = this.gatherMIDServerCapabilities();
        var capabilityTests = this.gatherValueTestScripts();

        var midMatched = [];
        var capsLength = this.capabilities.length;
        for (var agent in agentCaps) {
            for (var i=0; i<capsLength; i++) {
                var capability = this.capabilities[i];

                var res = this.getCapNameAndValue(capability);
                var capName = res[0];
                var capValue = res[1];
                
                if (JSUtil.nil(capName))
                    continue;

                var agentCapValue = agentCaps[agent][capName];
                // If the capability doesn't even exist, then forget this MID server.
                if (agentCapValue == undefined)
                    break;
 
                // If the capability requires a match on value, but doesn't match MID server's capability value, then forget it too.
                if (JSUtil.notNil(agentCapValue)) {
                    if (capabilityTests[capName]) {
                        try {
                            var test = eval("(" + capabilityTests[capName] + ")");
                            if (!test(agentCapValue, capValue))
                                break;
                        } catch(ex) {
                            // if there was a script problem, don't pick this guy...
                            this.addStatusMsg("Problem in script for capability: " + capName + "\n" + ex + "\n");
                            break;
                        }
                        
                    } else if (agentCapValue != capValue)
                        break;
                }

                // If we got here, then that means the MID server met all the capability requirement!
                if (i == (capsLength-1))
                    midMatched.push(agent);
            }        
        }
        return midMatched;
    },

    gatherMIDServerCapabilities: function() {
        var agentCaps = {};
        var cgr = new GlideRecord("ecc_agent_capability_m2m");
        if (this.active)
            cgr.addQuery("agent.status", "Up");
        cgr.orderBy("agent");
        cgr.query();
        while (cgr.next()) {
            var cap = cgr.capability.capability.toString().toLowerCase();
            var value = cgr.capability.value.toString().toLowerCase();
            if (JSUtil.nil(cap))
                continue;

            var agent = agentCaps[cgr.agent];
            if (!agent) {
                agent = {};
                agentCaps[cgr.agent] = agent;
            }
            agent[cap] = value;
        }
        return agentCaps;
    },
    
    gatherValueTestScripts: function() {
        var results = {};
        var gr = new GlideRecord("ecc_agent_capability_value_test");
        gr.addActiveQuery();
        gr.query();
        while (gr.next()) {
            var cap = '' + gr.capability.toString().toLowerCase();
            var script = '' + gr.script;
            if (JSUtil.nil(cap) || JSUtil.nil(script))
                continue;
            
            results[cap] = script;
        }
        return results;
    },


    findByRanges: function() {
        var ipMetaCollection = SncIPMetaCollection;
        var ipmc = new ipMetaCollection();
        for (var i = 0; i < this.ranges.length; i++)
            ipmc.add(this.ranges[i]);

        var midMatched = [];
        var midServerRangesDB = SncMIDServerRangesDB;
        var gr = new GlideRecord("ecc_agent");
        if (this.active)
            gr.addQuery("status", "Up");
        gr.query();
        while (gr.next()) {
            var agent = gr.sys_id.toString();
            if (midServerRangesDB.inRanges(ipmc, agent))
                midMatched.push(agent);
        }
    
        return midMatched;
    },

    getCapNameAndValue: function(capability) {
        var capName;
        var capValue;
        if (typeof capability == 'object') {   
            for (var name in capability) {
                capName = name;
                capValue = capability[name];
            }
        } else if (typeof capability == 'string')
            capName = capability;
        else {
            this.debug("Invalid capability type: " + typeof capability);
            this.addStatusMsg("Capability: " + capName + "(" + capValue + ") is not a valid capability."); 
        }

        if (JSUtil.notNil(capName))
            capName = capName.toLowerCase();
        if (JSUtil.notNil(capValue))
            capValue = capValue.toLowerCase();
        
        return [capName, capValue];
    },

    _findIPsByDNSName: function(dnsName) {
        var ips = [];
        var gr = new GlideRecord("cmdb_ip_address_dns_name");
        gr.addQuery("dns_name.name", dnsName);
        gr.query();
        while (gr.next())
            ips.push(gr.ip_address.ip_address + '');

        if (ips.length == 0)
            return;

        return ips.join(',');
    },

    _isValidIPAddress: function(ipAddress) {
        var ipAddressUtil = GlideIPAddressUtil;
        if (ipAddressUtil.isValid(ipAddress))
            return true;
  
        return false;
    },

    addStatusMsg: function(msg) {
        if (JSUtil.notNil(this.statusMsg))
            this.statusMsg += "\n";

        this.statusMsg += msg;
    },

    debug: function(msg) {
        if (this.debugParam == true)
            gs.log(msg);
    }
}