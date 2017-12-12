function() {
  /* widget controller */
  var c = this;
  c.options.title = c.options.title || $rootScope.messages.AFFECTED_PRODUCTS; 	
	c.max_display_count = c.options.max_display_count ? c.options.max_display_count * 1 : 10;
	if(c.max_display_count < 0){
		c.max_display_count = 10;
	}
	c.affectedProducts = $rootScope.affectedProducts ? $rootScope.affectedProducts.slice(0, c.max_display_count) : [];
}