function serviceCreatorHasRoleOrInGroup(table, group) {
	var answer = "roles=" + table + "_user";
	if (group != "undefined" && group != "") {
		answer += "^ORsys_idIN";
		var members = new GlideRecord("sys_user_grmember");
		members.addQuery("group", group);
		members.query();
		var arr = [];
		while (members.next())
			answer += members.user + ",";
	}
	return answer;
}