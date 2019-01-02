// Discovery class

/**
 * Encapsulates the notion of a MID server.  Instances where isValid() returns true have the 
 * following properties initialized:
 * 
 * sysID:         sys_id of the MID server record
 * name:          name of the MID server
 * url:           URL the MID server uses to contact the instance
 * hostname:      hostname of the MID server's host
 * hostOS:        operating system of the MID server's host
 * version:       version of the MID server (WAR name)
 * ip:            IP address of the MID server host
 * routerIP:      IP address of the MID server host's default router
 * network:       network the MID server's host is part of (like '10.10.10.0/24' or '10.10.10.0/255.255.255.0')
 * windowsDomain: Windows domain the MID server's host is part of (if it's a Windows box)
 * status:        MID server's status ('Up' or 'Down')
 * 
 * Tom Dilatush tom.dilatush@service-now.com
 */
var MIDServer = Class.create();

MIDServer.getByName = function(name) {
    var mungedName = name;
    if (mungedName.indexOf('mid.server.') == 0)
        mungedName = mungedName.substr(11);
    var gr = new GlideRecord('ecc_agent');
    gr.addQuery('name', mungedName);
    gr.query();
    return gr.next() ? new MIDServer(gr) : null;
};

MIDServer.getForPing = function(schedule, range) {
    var midServer = null;
    if (schedule) {
        if (schedule.isAdvanced()) {
            // get our behavior reference from the range set, or if none there, from the schedule...
            var behaviorID = range.getBehavior();
            if (!behaviorID)
                behaviorID = schedule.behaviorID;
            
            // if we found a behavior, go get the pinger value...
            if (behaviorID) {
                var behavior = new DiscoveryBehaviorRecord(behaviorID);
                if (behavior)
                    midServer = behavior.midServer;
            }
        } else {
            var midServerID = range.getMIDServer();
            if (midServerID)
                midServer = new MIDServer(midServerID);
            if (!midServer)
                midServer = schedule.midServer;
        }
    }
    
    if (!midServer)
        midServer = MIDServer.getDefault(schedule);
    
    return midServer;
};

MIDServer.getDefault = function(schedule) {
	var mid;
	
	if (JSUtil.notNil(schedule))
	    mid = MIDServer.getDefaultForApp(schedule.getAppName());
	else
	    mid = MIDServer.getDefaultForApp('Discovery');
	
	if (mid == null)
        mid = MIDServer.getDefaultForApp('ALL');
	
	return mid;
};

MIDServer.getDefaultForApp = function(appName) {
	if (JSUtil.nil(appName))
		return null;
	
	//TODO: Use ECCAgentApplicationCache
	var app = new GlideRecord('ecc_agent_application');
	if (!app.get('name', appName))
		return null;
	
	var midSysId = app.getValue('default_mid_server');
	if (!midSysId)
		return null;
	
	var mid = new GlideRecord('ecc_agent');
	return mid.get(midSysId) ? new MIDServer(mid) : null;
};

MIDServer.prototype = Object.extend(new AbstractDBObject(), {
    versionRegex: /^(\d{4})-(\d{2})-(\d{2})-(\d{2})(\d{2})$/,

    initialize: function(source) {
        this.valid = false;
        var gr = this._getRecord(source, 'ecc_agent');
        if (!gr)
            return;
            
        // we've got a real MID server record, so record our information...
        this.valid = true;
        this.sysID         = gr.getValue( 'sys_id'     );
        this.name          = gr.getValue( 'name'       );
        this.url           = gr.getValue( 'url'        );
        this.hostname      = gr.getValue( 'host_name'  );
        this.hostOS        = gr.getValue( 'host_type'  );
        this.version       = gr.getValue( 'version'    );
        this.ip            = gr.getValue( 'ip_address' );
        this.routerIP      = gr.getValue( 'router'     );
        this.network       = gr.getValue( 'network'    );
        this.windowsDomain = gr.getValue( 'win_domain' );
        this.status        = gr.getValue( 'status'     );
        this.validated     = gr.getValue( 'validated'  );
        this.userName      = gr.getValue( 'user_name'  );
    },
	
	getName: function() {
		return this.name;
	},

    isPreGeneva: function() {
        return this.versionRegex.test(this.version);
    },
    
    type: "MIDServer"
});
