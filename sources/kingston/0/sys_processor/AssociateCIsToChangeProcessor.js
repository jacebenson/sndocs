var actionVerb = j2js(g_request.getParameter('sysparm_returned_action'));
var changeSysId = j2js(g_request.getParameter('sysparm_returned_sysid'));
var tableLabel = j2js(g_request.getParameter('sysparm_table_label'));

var gu = new GlideURL('change_request.do');
gu.set('sys_id', changeSysId);
var createdChangeUrl = j2js(gu.toString());

var urlOnStack;
var suffix = '_and_stay';
if (actionVerb.indexOf(suffix, actionVerb.length - suffix.length) !== -1) {
	// If the action verb ends with _and_stay then the user intends to submit
	// the form and stack back on that page. However, the goto url overrides
	// that behavior and user is taken to this processor. So, the onus is
	// on processor to redirect the user back to Change form.
	urlOnStack = createdChangeUrl;
} else {
	// This processor's url is not added to back stack, and before the user
	// is redirected to this, the Change Request's form url is popped from
	// back stack. So the stack top contains the page we want to goto.
	urlOnStack = gs.getSession().getStack().pop();
	if (!urlOnStack)
		urlOnStack = 'welcome.do';
}

var util = new AssociateCIsToChangeUtil();
var selectedCis = gs.getSession().getClientData(util.SESSION_KEY);
if (selectedCis) {
	gs.getSession().clearClientData(util.SESSION_KEY);
}

if (changeSysId && selectedCis && actionVerb != 'sysverb_back') {
	var answer = util.addManyRelated(changeSysId, selectedCis.split(','));

	if (answer.count > 0) {
		tableLabel = tableLabel || gs.getMessage('Configuration Items');
		gs.addInfoMessage(
			gs.getMessage(
				'{0} were related to Change Request <a href="{1}">{2}</a>',
				[tableLabel, createdChangeUrl, answer.displayValue]));
	}
}

g_response.sendRedirect(urlOnStack);
