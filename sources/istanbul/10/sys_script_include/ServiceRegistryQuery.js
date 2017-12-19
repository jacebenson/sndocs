// Discovery
/***********************************************************************************************************************
 * Discovery - Service Registry Query
 * Maps Shazzam! service registry query results against a port probe. Child classes provide specifics on mapping.
 * @author Roy Laurie <roy.laurie@service-now.com>
 * @abstract
 **********************************************************************************************************************/
var ServiceRegistryQuery = Class.create();

ServiceRegistryQuery.TABLE = 'service_reg_query';
ServiceRegistryQuery.FIELD_PORT_PROBE = 'port_probe';
ServiceRegistryQuery.ENTRY_CACHE = new SNC.ServiceRegQueryCache();
ServiceRegistryQuery.USE_CACHE = true;

/**
 * Parses an array of ids.
 * @param PortProbe portProbe
 * @return ServiceRegistryQuery[]
 */
ServiceRegistryQuery.findForPortProbe = function(portProbe) {
    var related, registries = [];
    if(ServiceRegistryQuery.USE_CACHE){
        related = ServiceRegistryQuery.ENTRY_CACHE.getForPortProbe(portProbe.sysID);
		
        for (var i = 0; i < related.length; i++)
            registries.push(ServiceRegistryQuery.get(related[i].sys_id));
    } else {
        var related = new GlideRecord(ServiceRegistryQuery.TABLE);
        related.addQuery(ServiceRegistryQuery.FIELD_PORT_PROBE, portProbe.sysID);
        related.query();
        
        while (related.next())
    	    registries.push(ServiceRegistryQuery.get(related));
    }

    return registries; 
};

/**
 * Factory method to retrieve a registry service by id, regardless of child class.
 * @param GlideRecord|string Record or sys id
 * @return ServiceRegistryQuery
 */
ServiceRegistryQuery.get = function(source) {
    if (!source) 
        throw new IllegalArgumentException('Service Registry Query source not specified.');
        
    var baseRecord = null;
    if (source instanceof GlideRecord)
        baseRecord = source;
    else if (ServiceRegistryQuery.USE_CACHE && typeof source == "string")
        baseRecord = ServiceRegistryQuery.ENTRY_CACHE.getEntry(source);
    
    if  (baseRecord == null) {
        var baseId = '' + source;
        baseRecord = new GlideRecord(ServiceRegistryQuery.TABLE);
        if (!baseRecord.get(baseId))
            throw new IllegalArgumentException('Service Registry Query `' + baseId + '` does not exist.');
    }
    
    var table = '' + baseRecord.sys_class_name;
	var childSource = ( table == baseRecord.getTableName() ? baseRecord : '' + baseRecord.sys_id );
    switch (table) {
    case SLPServiceRegistryQuery.TABLE:
        return new SLPServiceRegistryQuery(childSource);
    default:
        throw new IllegalArgumentException('Service Registry Query `' + baseRecord.sys_id + '` uses an invalid child class `' + table + '`.');
    }
};

ServiceRegistryQuery.prototype = Object.extend(new AbstractDBObject(), {
    /**
     * Override in child.
     * @param GlideRecord|string source The record or id
     */
    initialize: function(source) {
        if (source === undefined) // extend properly
            return;
        if (!source)
            throw new IllegalArgumentException('Invalid Service Registry Query source.');
        
        var record = (source instanceof GlideRecord || source instanceof ServiceRegQueryCacheEntry) ? source : this._getRecord(source, ServiceRegistryQuery.TABLE);
            
        if (record === null)
            throw new IllegalArgumentException('Invalid Service Registry Query source.');

        this._sysID = '' + record.sys_id;
    },
    
    /**
     * Creates XML output for Shazzam! port probes.
     * @return string
     */
    toPortProbeXml: function() {
        var xml = '<serviceRegistryQuery querierClassname=\'' + this.getShazzamQuerierClassname() + '\'>';
        var map = this.toPortProbeMap();
        for (var key in map) {
            var value = map[key];
            if (value instanceof Array)
                for (var i = 0, n = value.length; i < n; ++i)
                    xml += this._createXmlElement(key, value);
            else
                xml += this._createXmlElement(key, value);
        }
        
        xml += '</serviceRegistryQuery>';
        return xml;
    },
    
    _createXmlElement: function(name, value) {
        return '<' + name + '>' + value + '</' + name + '>';
    },
    
    /**
     * Retrieves an XML.
     * Contract: Child calls super first.
     * @abstract
     */
    toPortProbeMap: function() {
        var map = {};
        return map;
    },
    
    /**
     * @abstract
     * @return string
     */
    getShazzamQuerierClassname: function() {
        throw new UnimplimentedOperationException();
    },
    
    type: 'ServiceRegistryQuery'
});