var MIDServerFileSync = Class.create();
 
MIDServerFileSync.process = function() {
	var base = '' + GlideDBObjectManager.get().getBase(event.parm1);
    if (base != 'ecc_agent_sync_file')
        return;
    
    var msfs = new MIDServerFileSync();
    msfs.notifyMIDServers(event.parm1);
}

MIDServerFileSync.prototype = {
    initialize: function() {
    },

    notifyMIDServers: function(table) {
        var gr = new GlideRecord('ecc_queue');
        gr.initialize();
        gr.setValue( 'agent',  'mid.server.*'  );
        gr.setValue( 'source', 'FileChange'    );
        gr.setValue( 'name',   table           );
        gr.setValue( 'topic',  'SystemCommand' );
        gr.setValue( 'queue',  'output'        );
        gr.setValue( 'state',  'ready'         );
		gr.setValue( 'priority', '0'           );
        gr.insert();
        
    },
    
    type: MIDServerFileSync
}