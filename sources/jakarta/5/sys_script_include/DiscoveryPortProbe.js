// Discovery class

/**
 * Encapsulates the notion of a Discovery Port Probe.  Instances where isValid() returns true have the 
 * following properties initialized:
 * 
 * sysID:                  sys_id of this port probe record
 * name:                   name of this port probe
 * description:            description of this port probe
 * active:                 true if this port probe is active
 * discoverCIs             true if this port probe is active for discover CIs
 * discoverIPs             true if this port probe is active for discover IPs
 * triggersProbeID:        sys_ID of probe triggered by this port probe
 * classy:                 table name to use for classification when this port probe is active
 * services:               a JavaScript Array of the IPService instances associated with this port probe
 * script:                 the optional script associated with this port probe
 * scanner:                the name of the Java class (on the MID server) to use as a scanner
 * conditional:            a boolean, true if this is a conditional scanner
 * classificationPriority: an integer, smaller is higher priority
 * 
 * Tom Dilatush tom.dilatush@service-now.com
 */
var DiscoveryPortProbe = Class.create();

DiscoveryPortProbe.TABLE = 'discovery_port_probe';
DiscoveryPortProbe.ENTRY_CACHE = new SNC.DiscoveryPortProbeCache();
DiscoveryPortProbe.USE_CACHE = true;

/*
 * Get an array of DiscoveryPortProbe instances specified by a Java ArrayList of sysIDs.
 */
DiscoveryPortProbe.getFromArrayList = function(list) {
	if(DiscoveryPortProbe.USE_CACHE)
		return AbstractDBObject._getCachedFromArrayList(list, DiscoveryPortProbe.TABLE, DiscoveryPortProbe, DiscoveryPortProbe.ENTRY_CACHE);
	else
    	return AbstractDBObject._getFromArrayList(list, DiscoveryPortProbe.TABLE, DiscoveryPortProbe);
}

DiscoveryPortProbe.prototype = Object.extend(new AbstractDBObject(), {    
    /*
     * Initializes this instance from the given source, which must be either a GlideRecord instance or a sysID string.
     */
    initialize: function(source) {
        var record = null;
        this.valid = false;
        
		if(source instanceof SNC.DiscoveryPortProbeCacheEntry){
		    record = source;
		} else if (source instanceof GlideRecord){
		    record = new SNC.DiscoveryPortProbeCacheEntry(source);
		} else if (typeof source == "string" && DiscoveryPortProbe.USE_CACHE) {
		    record = DiscoveryPortProbe.ENTRY_CACHE.getEntry(source);
		} else if (typeof source == "string") {
			var gr = this._getRecord(source, DiscoveryPortProbe.TABLE);
			if (gr)
				record = new SNC.DiscoveryPortProbeCacheEntry(gr);
		}
		
		if(record == null)
		    return;
            
        // we've got our record, so record our information...
        this.valid = true;
        this.active                 = record.active;
        this.discoverCIs            = record.active_discover_cis;
        this.discoverIPs            = record.active_discover_ips;
		this.supplementary          = record.supplementary;
        this.sysID                  = record.sys_id;
        this.name                   = record.name;
        this.description            = record.description;
        this.triggersProbeID        = record.triggers_probe;
        this.classy                 = record.classy;
        this.script                 = record.script;
        this.scanner                = record.scanner;
        this.conditional            = record.conditional;
        this.classificationPriority = record.classification_priority;
        
        // get our list of IP services...
        this.services = IPService.getFromArrayList(record.services);
        
        this.serviceRegistryQueries = ServiceRegistryQuery.findForPortProbe(this); // retrieve service registry query mappings
    },
    
    type: "DiscoveryPortProbe"
});