function moveToClosed(){
	var ga = new GlideAjax("ChangeRequestStateHandlerAjax");
	ga.addParam("sysparm_name", "getStateValue");
	ga.addParam("sysparm_state_name", "closed");
	ga.getXMLAnswer(function(stateValue) {
		g_form.setValue("state", stateValue);
		gsftSubmit(null, g_form.getFormElement(), "state_model_move_to_closed");
	});
}

if (typeof window == 'undefined')
   setRedirect();

function setRedirect() {
    current.update();
    action.setRedirectURL(current);
}