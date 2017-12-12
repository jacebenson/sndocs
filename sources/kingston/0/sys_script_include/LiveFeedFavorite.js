var LiveFeedFavorite = Class.create();
LiveFeedFavorite.prototype = {
	LIVE_FAVORITE: "live_favorite",
	
	DOCUMENT: "document",
	TABLE: "table",
	USER: "user",
	
	initialize: function() {
		this.util = new LiveFeedUtil();
	},
	
	getSessionProfile: function() {
		return this.util.getSessionProfile();
	},
	
	getFavorite: function(table, sys_id) {
		if(!sys_id)
			return;
		var gr = new GlideRecord(this.LIVE_FAVORITE);
		gr.addQuery(this.TABLE, table);
		gr.addQuery(this.DOCUMENT, sys_id);
		gr.addQuery(this.USER, this.getSessionProfile());
		gr.query();
		if(gr.next())
			return gr;
	},
	
	favorite: function(table, sys_id) {
		var fav = this.getFavorite(table, sys_id);
		if(fav)
			return false;
		var gr = new GlideRecord(table);
		if(!gr.get(sys_id))
			return false;
		var domain = gr.getValue(this.util.SYS_DOMAIN);
		fav = new GlideRecord(this.LIVE_FAVORITE);
		fav.initialize();
		fav.user = this.getSessionProfile();
		fav.table = table;
		fav.document = sys_id;
		fav.sys_domain = domain;
		fav.insert();
		return true;
	},
	
	unfavorite: function(table, sys_id) {
		var fav = this.getFavorite(table, sys_id);
		if(fav) {
			fav.deleteRecord();
			return true;
		}
		return false;
	},
	
	deleteFavorites: function(table, sys_id) {
		var fav = new GlideRecord(this.LIVE_FAVORITE);
		fav.addQuery(this.TABLE, table);
		fav.addQuery(this.DOCUMENT, sys_id);
		fav.query();
		while(fav.next())
			fav.deleteRecord();
	},
	
	type: 'LiveFeedFavorite'
}