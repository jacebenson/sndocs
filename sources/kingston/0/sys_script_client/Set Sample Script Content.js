function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
	
    if (newValue == "script") {
        var scriptText = g_form.getValue("script");
        if (scriptText.length == 0) {
            scriptText += "/**\n";
            scriptText += "* This script is used to retreive records from the table (mentioned in the table field)\n";
            scriptText += "* Input - 'users', 'startDate', 'endDate' ,'configId' \n";
            scriptText += "* Output - 'result' \n";
            scriptText += "*'result' is an array of JSON objects with the properties - 'start_date', 'end_date',\n";
            scriptText += "* 'start_date_display', 'end_date_display', 'user'\n";
            scriptText += "*/\n";

            g_form.setValue("script", scriptText);
        }
    }

}