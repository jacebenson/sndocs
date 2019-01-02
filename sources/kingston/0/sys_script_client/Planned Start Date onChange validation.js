function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '')
		return;
	
	var showErrorMsg = function(errorMsg){
		g_form.showErrorBox("end_date",errorMsg);
	};

	g_form.hideFieldMsg("end_date", true);
	validateStartDateBeforeEndDate("start_date", "end_date", showErrorMsg);
}