var CacheBuster = {
	getValue : function() {
		if("true" == gs.getProperty("glide.installation.developer","false")) 
			return GlideDateTime().getDisplayValue();
		return gs.getProperty("sn_devstudio.css.version", GlideDateTime().getDisplayValue());
	},
	
	getEncodedValue : function() {
		return encodeURIComponent(this.getValue());
	},
	
	addNoCacheHeaders : function(g_response) {
		g_response.setHeader("Cache-Control", "no-cache,no-store,must-revalidate,max-age=-1");
		g_response.setHeader("Pragma", "no-store,no-cache");
		g_response.setHeader("Expires","Thu, 01 Jan 1970 00:00:00");
	}
}