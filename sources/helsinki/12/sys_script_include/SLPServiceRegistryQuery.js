// Discovery
/***********************************************************************************************************************
 * Discovery - Service Registry Query for SLP
 * Maps Shazzam! SLP query results to Port Probes.
 * @author Roy Laurie <roy.laurie@service-now.com>
 **********************************************************************************************************************/
var SLPServiceRegistryQuery = Class.create();

SLPServiceRegistryQuery.TABLE = 'service_reg_query_slp';
SLPServiceRegistryQuery.SLP_QUERY = 'SLPQuery';
SLPServiceRegistryQuery.SERVICE_TYPE_TABLE = 'service_reg_query_slp_service_type';
SLPServiceRegistryQuery.SERVICE_TYPE_FIELD_SLP_QUERY = 'slp_query';
			
SLPServiceRegistryQuery.prototype = Object.extend(new ServiceRegistryQuery(), {
    /**
     * @param GlideRecord|string source The record or id
     */
    initialize: function(source) {
        var record;
        
        if(source instanceof ServiceRegQueryCacheEntry)
            record = source;
        else if(ServiceRegistryQuery.USE_CACHE && typeof source == "string")
            record = ServiceRegistryQuery.ENTRY_CACHE.getEntry(source);
            
        record = record || this._getRecord(source, SLPServiceRegistryQuery.TABLE);
        
        if (!record)
            throw new IllegalArgumentException('Invalid SLP Service Registry Query source.');

        ServiceRegistryQuery.prototype.initialize.call(this, record);
        this._serviceTypes = this._queryServiceTypes();
    },

    /**
     * Creates a scalar map for port probes to use in XML output to Shazzam!.
     * @return Object
     * @override
     */
    toPortProbeMap: function() {
        var map = ServiceRegistryQuery.prototype.toPortProbeMap.call(this);
        map.serviceType = this._serviceTypes;
        return map;
    },

    /**
    * @return string
    * @override
    */
    getShazzamQuerierClassname: function() {
        return SLPServiceRegistryQuery.SLP_QUERY;
    },

	_queryServiceTypes: function() {
        var related = new GlideRecord(SLPServiceRegistryQuery.SERVICE_TYPE_TABLE)
        related.addQuery(SLPServiceRegistryQuery.SERVICE_TYPE_FIELD_SLP_QUERY, this._sysID)
        related.query();
		
	    var types = [];
        while (related.next())
            types.push(related.service_type + "");

        return types;
	},
	
    type: 'SLPServiceRegistryQuery'
});