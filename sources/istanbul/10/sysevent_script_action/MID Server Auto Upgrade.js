gs.info('Auto upgrading all MID Servers');

var mm = new MIDServerManage();

var gr = new GlideRecord('ecc_agent');
gr.query();

while (gr.next()) {
    mm.autoUpgrade(gr.getValue('name'));
}
