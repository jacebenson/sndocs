function(scope, elem){
    scope.setFocusToAttachment = function () {
		setTimeout(function () {
			var inboxArray = elem.find("a.view-attachment");
			inboxArray.focus();
		}, 100);
	}
}
	