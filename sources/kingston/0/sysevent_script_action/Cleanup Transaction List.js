// react to logout and cleanup any sys_poll data that may be left over
cleanupResources(event.instance);

function cleanupResources(id) {
    var gr = new GlideRecord('v_transaction');
    gr.addQuery('snapshot_id', id);
    gr.deleteMultiple();
}
