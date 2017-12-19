updateEmailClientTemplateBodyLabel();
function updateEmailClientTemplateBodyLabel() {
	var doc = new GlideRecord("sys_documentation");
	doc.setWorkflow(false);
	doc.addQuery("label", "Body");
	doc.addQuery("name", "sys_email_client_template");
	doc.addQuery("element", "body");
	doc.query();

	if (doc.next()) {
		doc.setValue("label", "Body Text");
		doc.update();
	}
}