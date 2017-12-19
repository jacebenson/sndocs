function getCategoryEditorsRefQual() {
	if (current[current.department_or_group].nil())
		return 'active=true';
	
	if (gs.getProperty("glide.service_creator.restrict_editors") != "true")
		return 'active=true';
	
	if (current.department_or_group == 'department')
		return 'active=true^department=' + current.department;
	
	// it's for a group
	var members = GlideUserGroup.getMembers(current.group);
	var memberArr = [];
	while (members.next()) {
		if (members.user.active == true)
			memberArr.push(members.user.toString());
	}
	if (memberArr.length == 0)
		return 'active=true';

	return 'sys_idIN' + memberArr;
}