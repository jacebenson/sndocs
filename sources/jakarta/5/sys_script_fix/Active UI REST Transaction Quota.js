// This is the existing UI Transactions quota rule. We active the UI REST Transaction quota rule if this exits.
var uiTransQuota = new GlideRecord('sysrule_quota');
uiTransQuota.get('88fe39123701200024d1973ebebe5dfd');

if (uiTransQuota.isValid() && uiTransQuota.active){
    var uiRestTransQuota = new GlideRecord('sysrule_quota');
    uiRestTransQuota.get('1a5115e39f1122005cf3ffa4677fcfaa');
    uiRestTransQuota.active = true;
    uiRestTransQuota.setWorkflow(false);
    uiRestTransQuota.setUseEngines(false);
    uiRestTransQuota.update();

}




 

