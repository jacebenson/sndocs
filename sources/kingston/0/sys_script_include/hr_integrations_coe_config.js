var hr_integrations_coe_config = Class.create();
hr_integrations_coe_config.prototype = {
    initialize: function() {
    },
	
recordProducers:function(activeTables,inactiveTables){
		this._toggleRecordProducers(inactiveTables, false);
		this._toggleRecordProducers(activeTables, true);
	},
	
	_toggleRecordProducers:function(tables,answer){
		if (!tables || !tables.length)
			return;
		
		var producerGr = new GlideRecord('sc_cat_item_producer');
		producerGr.addQuery('sys_scope', 'aaa655c19f0322003be01050a57fcf65'); // HR Scoped: Integrations
		var q = producerGr.addQuery('table_name', tables[0]);
		for (var i = 1; i < tables.length; i++)
			q.addOrCondition('table_name', tables[i]);
		producerGr.query();
		while (producerGr.next()) {	
			if (!(producerGr.canRead() && producerGr.canWrite() && producerGr.getElement("active").canWrite()))
				continue;
			producerGr.active = answer;
			producerGr.update();
		}
	},
	
    type: 'hr_integrations_coe_config'
};