function onSubmit() {
	var value = g_form.getValue("template");
	if (value.length > 0 && value.indexOf('href="#"') > 0) {
		g_form.showFieldMsg("template", "Do not use href=\"#\" in the Service Portal, use href=\"javascript:void(0)\" instead", "error");
		return false;
	}
}