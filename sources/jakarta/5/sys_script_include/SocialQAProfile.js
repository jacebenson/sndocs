var SocialQAProfile = Class.create();
SocialQAProfile.prototype = {
    initialize: function() {
		this.globalUtil = new global.GlobalKnowledgeUtil();
		this.socialQACommon = new SocialQACommon();
		this.tableNames = this.socialQACommon.getTableNames();
    },
	
	_getProfileRecord: function(id) {
		var gr = new GlideRecord(this.tableNames.table_profile);
		gr.addActiveQuery();
		gr.addQuery('sys_id', id);
		gr.query();
		return gr;
	},
	
	toJSON: function(params) {
		var profileGR = this._getProfileRecord(params.sys_id.toString());
		if (!profileGR.hasNext()) 
			return ;
		
		profileGR.next();
		return this.profileJSON(profileGR);
	},
	profileJSON: function(profileGR) {
		return this.globalUtil.getProfileDetails(profileGR.getValue('sys_id'));
	},

    type: 'SocialQAProfile'
}