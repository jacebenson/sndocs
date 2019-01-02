function(scope, elm) {
	// Set the focus back on the input for IE11
	scope.setFocus = function() {
		var input = $(elm[0]).find('textarea#post-input');
		if (input[0])
			input[0].focus();
	}

}