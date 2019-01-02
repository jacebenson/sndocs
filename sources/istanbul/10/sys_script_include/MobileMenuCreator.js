var MobileMenuCreator = Class.create();
MobileMenuCreator.prototype = {
	initialize: function(current, name) {
		if(current) {
			if(name)
				current.name = name;
			
			this.current = current;
		}
	},
	
	create: function(addInfoMsg) {
		if(!this.current)
			return;
		
		var id = this.current.insert();
		if(addInfoMsg)
			this._addInfoMessage(id, !this.current.name.nil() ? this.current.name : '');
		
		return id;
	},
	
	_addInfoMessage: function(id, name) {
		var msg = gs.getMessage("Created new mobile application menu named {0}.", name);
		var link =
		" <a href=\"#\" onclick=\"var url = new GlideURL('sys_ui_application.do');"
		+ " url.addParam('sys_id', '" + id + "');"
		+ " var frame = top.gsft_main;"
		+ "	if (!frame) frame = top;"
		+ " frame.location = url.getURL();\">"
		+ gs.getMessage("Click here to view it")
		+ "</a>"
		
		gs.addInfoMessage(msg + link);
	},
	
	type: 'MobileMenuCreator'
}