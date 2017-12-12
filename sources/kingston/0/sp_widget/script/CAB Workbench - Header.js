(function () {
    var sys_id = $sp.getParameter('sys_id');
	data.meetingId = sys_id;
    data.sys_id = sys_id;
    data.msg = {};
    data.msg.conf_info = '${Conference Information}';
    data.msg.agenda_progress = gs.getMessage('{0} of {1} agendas done');// SPTranslate messes up messages with tokens!
	data.msg.dialog_shown = gs.getMessage('{0} dialog shown. Use F6 to switch to it.');
	data.msg.dialog_hidden = gs.getMessage('{0} dialog hidden');
    var navs = JSON.parse(options.nav_items);
    var userOb = gs.getUser();

    for (var i = navs.length - 1; i >= 0; i--) {
			var discardThisItem = false;
			var navItem = navs[i];

			if (navItem.roles) {
				for (var j = 0; !discardThisItem && j < navItem.roles.length; j++) {
					if (!userOb.hasRole(navItem.roles[j]))
						discardThisItem = true;
				}
			}

			if (discardThisItem) {
				navs.splice(i, 1);
				continue;
			}

			if (!navItem.widget_opt)
				navItem.widget_opt = {};

			if (navItem.show_in_modal)
				navItem.id = navItem.widget_opt.modal_id = Math.floor(Math.random() * 100);

			if (navItem.widget_id)
				navItem.widget_data = $sp.getWidget(navItem.widget_id, navItem.widget_opt);
    }

    data.navs = navs;
})();
