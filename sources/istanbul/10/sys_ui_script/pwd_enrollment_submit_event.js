var onSubmitEventHandlers = [];
var onSubmitEventHandlerIndex = 0;

/** Map of form ID to a value of true if the form is valid (otherwise undefined). Forms that are marked as valid will be 
	saved even if there are some required enrollments that are not filled out, or if some forms are not complete. 
	This allows for "partial enrollment" and the user can come back later to finish enrolling. 
 */
var validFormsMap;

/* Used to determine whether to redirect to the "Success" page after submission. If this number is less than the
   length of onSubmitEventHandlers then there will be no page redirect and any validation errors will appear on the 
   current page.
 */
var validFormsCount;

function addSubmitEvent(onSubmit, formId) {
	onSubmitEventHandlers[onSubmitEventHandlerIndex++] = {onSubmit: onSubmit, formId: formId};
}
/**
 * Process the form and submit for enrollment(s)
 */
function onSubmit() {
	validFormsMap = {};
	validFormsCount = 0;
	
	if (executeOnSubmitEventHandlers())
		sendRequest(); // This is on the UI page client script (e.g. $pwd_enrollment_form_container)
	
	return false;
}

/**
 * Execute the on submit event handlers in order and keep track of how many forms pass validation.
 * Returns true if at least one form is valid. 
 */
function executeOnSubmitEventHandlers() {
	var handler;	
	for(var i = 0; i < onSubmitEventHandlerIndex; i++) {
		
		handler = onSubmitEventHandlers[i];
		
		if (!handler || !handler.onSubmit)
			continue;
		
		try {
			var result = handler.onSubmit();
			if (result) {
				validFormsMap[handler.formId] = true;
				++validFormsCount;
			}
		}
		catch (err) {
			alert(err.message);
		}
	}
	return validFormsCount !== 0;
}

