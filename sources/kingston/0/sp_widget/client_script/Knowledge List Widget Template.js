function() {
	/* widget controller */
	var c = this;

	c.openArticleAttachment = function(url, name,  external) {
		if(external) {
			var params = 'toolbar=no,menubar=no,personalbar=no,height='+screen.height + ',' + 'width='+screen.width + ',' + 'scrollbars=yes,resizable=yes,fullscreen=yes';
			window.open(url, name, params);
		}
		else
			window.open(url, name, "toolbar=no,menubar=no,personalbar=no,width=800,height=600,scrollbars=yes,resizable=yes");
	};
	c.roundOff = function(val){
		if(val)
			return Math.round(val);
		else
			return 0;
	};
}