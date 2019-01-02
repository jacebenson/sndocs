function getManagerUsers(){
	var users = {};
	var gr = new GlideRecord('sys_user_has_role');
	gr.addEncodedQuery('roleINe09d16f2c0a8016501281264b989e1db,2ea71c5a5f2111001c9b2572f2b4773c');
	gr.query();
	while (gr.next()) {
		users[gr.user.toString()] = true;
	}
	var ids = [];
	for (var id in users)
		ids.push(id);
	return ids.join(',');
}