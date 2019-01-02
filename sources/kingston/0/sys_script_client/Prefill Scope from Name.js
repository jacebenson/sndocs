function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var TRIM_LENGTH = 18;
	
	if (!g_form.isNewRecord() || isLoading) {		
		return;
	}
	
	// Bail early if scope is already set by the user
	var currentScope = trim(g_form.getValue("scope"));
	if (isUserModifiedScope(currentScope))
		return;
	
	var candidateScope = (newValue != '') ? candidateScope = g_scratchpad.vendor_prefix + newValue : '';	
	g_scratchpad._xxyy_prev_app_name = newValue;
	candidateScope = candidateScope.substring(0, TRIM_LENGTH);
	g_form.setValue("scope", cleanScope(candidateScope));
	g_form.flash("scope", "rgb(229, 255, 229)", 2);
}

//Check the old scope against what the default old scope should be. If they are
//not the same, the user has modified the scope and it should not be changed.
function isUserModifiedScope(currentScope) {
	var prevName = g_scratchpad._xxyy_prev_app_name;
	var defaultPrevScope = (prevName != '') ? 
		g_scratchpad.vendor_prefix + prevName : '';
		
	if (currentScope != '' && 
		cleanScope(currentScope) != cleanScope(defaultPrevScope))
		return true;
	return false;
}

function cleanScope(prefix) {
	var scope = prefix.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');
	
	// Compact any multiple sequential underscores
	while (scope.indexOf("__") != -1)
		scope = scope.replace(/__/g, "_");
	
	// Replace any trailing underscores
	while (scope != '' && scope.charAt(scope.length - 1) == '_')
		scope = scope.substring(0, scope.length - 1);
	
	return scope;
}