var ReplicationStatus = Class.create();

ReplicationStatus.prototype = {
  initialize : function() {
  },

  process : function(ecc) {
    var system_id = ecc.source;
    var gr = new GlideRecord('sys_replication_slave');
    gr.addQuery('system_id', system_id);
    gr.query();
    var update = gr.next();
    gr.system_id = system_id;
    var util = GlideXMLUtil;
    var d = util.parse(ecc.payload + '');
    var pc = util.getElementValueByTagName(d, 'processed_count');
    var last_date = util.getElementValueByTagName(d, 'replicate_utc_date');
    var last_sequence = util.getElementValueByTagName(d, 'last_sequence');
    gr.setValue('total', pc);
    gr.setValue('last_date', last_date);
    gr.setValue('last_sequence', last_sequence);
    gr.setValue('last_checkin', ecc.getValue('sys_created_on'));
    if (update)
     gr.update();
    else
     gr.insert();
  }
}