function validateStartDateBeforeEndDate(startDateField, endDateField, processErrorMsg){
	var startDate = g_form.getValue(startDateField);
	var endDate = g_form.getValue(endDateField);

	var format = g_user_date_time_format;

	if (startDate === "" || endDate === "")
		return true;

	// get date strings into a number of milliseconds since 1970-01-01
	var startDateMs = getDateFromFormat(startDate, format);
	var endDateMs = getDateFromFormat(endDate, format);
	
	if (startDateMs < endDateMs)
		return true;
	
	// 0 from "getDateFormat" means an invalid date string was passed to it
	if (startDate === 0 || endDate === 0){
		processErrorMsg(new GwtMessage().getMessage("{0} is invalid", g_form.getLabelOf(startDate === 0? startDateField : endDateField)));
		return false;
	}

	if (startDateMs > endDateMs){
		processErrorMsg(new GwtMessage().getMessage("{0} must be after {1}", g_form.getLabelOf(endDateField), g_form.getLabelOf(startDateField)));
		return false;
	}
	
	return true;
}

function areDatesWithinRange(startRangeDate, endRangeDate, dates){
	var format = g_user_date_time_format;
	var startRangeDateMs = getDateFromFormat(startRangeDate, format);
	var endRangeDateMs = getDateFromFormat(endRangeDate, format);

	if (!Array.isArray(dates))
		dates = [dates];

	for (var i=0; i < dates.length; i++){
		var dateMs = getDateFromFormat(dates[i], format);
		if (dateMs == 0)
			continue;
		if (dateMs < startRangeDateMs || (endRangeDateMs > 0 && dateMs > endRangeDateMs))
			return false;
	}
	return true;
}