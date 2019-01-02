function getCategoryManagerRefQual() {
	if (current.department_or_group == 'department' && !current.department.nil())
		return 'active=true^department=' + current.department;
	
	if (current.department_or_group == 'group' && !current.group.nil()) {
		var members = GlideUserGroup.getMembers(current.group);
		var memberArr = [];
		while (members.next()) {
			if (members.user.active == true)
				memberArr.push(members.user.toString());
		}
		if (memberArr.length > 0)
			return 'sys_idIN' + memberArr;
	}
}