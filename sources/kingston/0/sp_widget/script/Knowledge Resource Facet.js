(function() {
	//set instance sys_id to be used as unique id for collapse
	data.instanceid = $sp.getDisplayValue('sys_id');
	options.dynamic = options.dynamic ? options.dynamic == 'true' : false;
	options.alt_url_params = options.alt_url_params || "";
	data.socialqa_enabled = false;

	if(isSocialQAEnabled())
		data.socialqa_enabled = true;

	function isSocialQAEnabled(){
		if (!GlidePluginManager().isActive('com.sn_kb_social_qa') && !GlidePluginManager().isActive('sn_kb_social_qa'))
			return false;

		if(!new global.GlobalKnowledgeUtil().canCreateNewQuestion())
			return false;

		return true;
	}
})();