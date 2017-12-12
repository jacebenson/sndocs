function(scope, elem) {
	$(elem).on('keydown','.header-menu-item',function(e){
		var target = e.target;
		if (target.localName == 'a') {
			if(e.keyCode == 37) {
				e.preventDefault();
				$(target).parents('li').removeClass('open');
				$(target).parents('li').prev('li').find('a').focus();
			} else if(e.keyCode == 39) {
				e.preventDefault();
				$(target).parents('li').removeClass('open');
				$(target).parents('li').next('li').find('a').focus();
				
			}
			if(e.keyCode == 9) {
				$(target).parents('li').removeClass('open');
			}
		}
		});
	}