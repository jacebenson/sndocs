function(scope) {
	if(scope.data.show_menu_entry && !$('#kb_user_subs_pref')[0] && $("a[ng-href*='id=actsub_notif_pref']").length ==0) {
		$('#sp-nav-bar ul li.hidden-xs.dropdown ul.dropdown-menu li:first').after('<li id="kb_user_subs_pref"><a role="link" href="?id=actsub_notif_pref&sysparm_domain_restore=false&sysparm_stack=no">${Notification Settings}</a></li>');
		$('#sp-nav-bar ul li.visible-xs-block:first').after('<li class="visible-xs-block" id="kb_user_subs_pref"><a role="link" href="?id=actsub_notif_pref&sysparm_domain_restore=false&sysparm_stack=no">${Notification Settings}</a></li>');
	}
}