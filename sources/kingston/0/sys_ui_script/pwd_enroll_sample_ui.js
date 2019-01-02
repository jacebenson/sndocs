function mysample_on_load (formId){
    //empty for now
}
/**
* Javascript that will be called before the submit.
*/
function mysample_on_submit (formId){
    
    var currForm = document.getElementById(formId);
    var elm = currForm.elements['sample_input'];
    var val = elm.value;
    if (val == '')
    {
		if (currForm.elements['mandatory'].value == "true") {
			displayErrorMessage(getMessage("Sample Input can't be empty"));
			elm.focus();
			return false;
		}
		// Don't submit optional enrollment when response is empty
		else
			currForm.elements['can_submit'].value = 'false';
    }
    return true;
}