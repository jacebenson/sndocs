var SLACacheManager = Class.create();

SLACacheManager.prototype = {
    SLA_DEF_TABLES_CACHE: "com.snc.sla.def_tables_cache",
	_GLOBAL: "global",

    initialize: function() {
		this._initPrivateCacheable(this.SLA_DEF_TABLES_CACHE);
	},
	
	flushDefinitionTables: function() {		
        GlideCacheManager.flush(this.SLA_DEF_TABLES_CACHE);
    },

    hasDefinitionForRecord: function(gr) {
		if (!gr || !gr.isValid())
			return false;

		var key = this._buildTableKey(gr.getRecordClassName(), gr.getValue("sys_domain"));
		var hasDefs = GlideCacheManager.get(this.SLA_DEF_TABLES_CACHE, key);
		if (hasDefs == null) {
			hasDefs = this.getDefinitionsForRecord(gr);
			GlideCacheManager.put(this.SLA_DEF_TABLES_CACHE, key, hasDefs);
		}
		
        return hasDefs;
    },

	getDefinitionsForRecord: function(gr) {
		var slaDefGr = new GlideAggregate("contract_sla");
		slaDefGr.addActiveQuery();
		slaDefGr.addQuery("collection", gr.getRecordClassName());
		slaDefGr.addDomainQuery(gr);
		slaDefGr.addAggregate("COUNT");
		slaDefGr.query();
		
		if (slaDefGr.next() && parseInt(slaDefGr.getAggregate("COUNT"), 10) > 0)
			return true;
		
		return false;
	},
	
	_initPrivateCacheable: function(name) {
		if (!name)
			return;

		if (GlideCacheManager.get(name, "_created_") != null)
			return;
		
		GlideCacheManager.addPrivateCacheable(name);
		GlideCacheManager.put(name, "_created_", new GlideDateTime().getNumericValue());
	},

    _buildTableKey: function(table, domain){
		if (!domain)
			domain = this._GLOBAL;
		
        return table + "_" + domain;
    },

    type: "SLACacheManager"
};