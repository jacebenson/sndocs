function openNewQuiz() {
	if (g_form.modified) {
        alert(new GwtMessage().getMessage('You have unsaved changes. Please save them to continue.'));
	} else {
		var url = new GlideURL('$ng_qd.do');
		url.addParam('sysparm_stack', 'no');
		url.addParam('sysparm_quiz', g_form.getUniqueValue());
		g_navigation.open(url.getURL(), 'quiz_designer');
	}
}