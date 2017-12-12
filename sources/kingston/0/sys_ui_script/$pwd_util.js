// To be invoked by JS events, in order to update the red asterisk to grey if a field is filled or vice versa
function updateMandatoryMarker(fieldElem, requiredMarkerId) {

    var valueToCheck = fieldElem.value.trim();

	// Special case for select elements with a -- None -- value such as the selector on the $pwd_change page
	if (fieldElem.tagName.toLowerCase() == 'select') {
	    var selectedOption = fieldElem.options[fieldElem.selectedIndex];
	    valueToCheck = selectedOption.value === '0'? '' : selectedOption.value;
    }

    var requiredElem = $j('#' + requiredMarkerId);
	if (valueToCheck != "")
		requiredElem.addClass("is-filled");
	else
		requiredElem.removeClass("is-filled");
}