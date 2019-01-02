function getEditorUsers(){
	var users = {};
	var gr = new GlideRecord('sys_user_has_role');
	gr.addEncodedQuery('roleINd2b8c44a5f2111001c9b2572f2b47748');
	gr.query();
	while (gr.next()) {
		users[gr.user.toString()] = true;
	}
	var ids = [];
	for (var id in users)
		ids.push(id);
	return ids.join(',');
}