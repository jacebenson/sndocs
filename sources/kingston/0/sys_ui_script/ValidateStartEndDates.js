function validateStartEndDate(startDateField, endDateField, processErrorMsg){
	var startDate = g_form.getValue(startDateField);
	var endDate = g_form.getValue(endDateField);

	var format = g_user_date_format;

	if (startDate === "" || endDate === "")
		return true;

	// format the date using getDateFromFormat
	var startDateFormat = getDateFromFormat(startDate, format);
	var endDateFormat = getDateFromFormat(endDate, format);
	
	if (startDateFormat < endDateFormat)
		return true;
	
	// 0 from "getDateFormat" means an invalid date string was passed to it
	if (startDateFormat === 0 || endDateFormat === 0){
		processErrorMsg(new GwtMessage().getMessage("{0} is invalid", g_form.getLabelOf(startDate === 0? startDateField : endDateField)));
		return false;
	}

	if (startDateFormat > endDateFormat){
		processErrorMsg(new GwtMessage().getMessage("{0} must be after {1}", g_form.getLabelOf(endDateField), g_form.getLabelOf(startDateField)));
		return false;
	}
	
	return true;
}