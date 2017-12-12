function() {

	var c = this;
	c.options.glyph = c.options.glyph || 'search';
	c.options.title = c.options.title || "${Welcome to Knowledge}";
	c.keyword = "";

	$( "#kb_home_search_form").submit(function( event ) {
		if((!c.data.allow_empty_search && c.keyword == "") || (c.keyword && c.keyword.length < c.data.min_search_char)){
			event.preventDefault();
			return false;
		}
	});
}