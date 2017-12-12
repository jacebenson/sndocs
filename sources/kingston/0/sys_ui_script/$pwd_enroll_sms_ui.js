// Get the user ID
function getUserID() {
	var user_id =  gel("userId").value;
	return user_id;
}

// call back for container on load
function sms_on_load(formId) {
	var currForm = document.getElementById(formId);
	var verificationId = currForm.elements['verification_id'].value;
	var useNotify = currForm.elements['use_notify'].value;

	if (useNotify == 'true') {
		getCountryCodes(currForm);
	}
	else {
		getProviders(currForm);
	}
	getDevices(currForm);
}

// call back for container on submit
function sms_on_submit(formId) {
	var currForm = document.getElementById(formId);	
	var mandatory = currForm.elements['mandatory'].value == 'true';
	
	currForm.elements['can_submit'].value = 'true';
	var valid = verifyAtleastOneDeviceIsSubscribed(null, currForm);	
	if (!valid) {
		// If form is invalid and mandatory, show message and select the tab to draw the user's attention.
		if (mandatory) {
			var tabId = 'tablabel' + currForm.elements['tab_index'].value;
		    var tab = gel(tabId);
		    tab.click();
		    displayErrorMessage(getMessage('You must authorize at least one device'));
		    return false;
		}
		// if not mandatory we dont want the form submitted and enrollment inserted
		else {
			currForm.elements['can_submit'].value = 'false';
		}
	}
	
	return true;
}

// get all service providers ajax call
function getProviders(currentForm) {
	var ga = new GlideAjax('PwdAjaxEnrollSMS');
	ga.addParam('sysparm_name', 'getProviders');
	ga.getXML(handleProviderResponse, null, currentForm);
}

// populate service provider dropdown options based on what's returned
function handleProviderResponse(response, currentForm) {
	var verificationId = currentForm.elements['verification_id'].value;
	var providers = response.responseXML.getElementsByTagName("provider");
	for (var i = 0; i != providers.length; i++) {
		var provider = providers[i];
		var option = document.createElement("option");
		
		if (Prototype.Browser.IE) {
			option.innerText = provider.getAttribute("name");
		}
		else {
			option.text = provider.getAttribute("name");
		}
		option.value = provider.getAttribute("sys_id");
		var select = currentForm.elements["sys_select.service_provider_" + verificationId];
		select.appendChild(option);
	}
	/*
	if (providers.length == 0) {
		var msg = getMessage('There should be at least one active service provider');
		displayMessage(msg, currentForm);
	}
	*/
}

// get all country codes ajax call
function getCountryCodes(currentForm) {
	var ga = new GlideAjax('PwdAjaxEnrollSMS');
	ga.addParam('sysparm_name', 'getCountryCodes');
	ga.getXML(handleCountryCodeResponse, null, currentForm);
}

// populate country code dropdown options based on what's returned
function handleCountryCodeResponse(response, currentForm) {
	var verificationId = currentForm.elements['verification_id'].value;
	var countryCodes = response.responseXML.getElementsByTagName("country");
	
	var ul = $j("#sys_ul_country_"+verificationId);
	
	for (var i = 0; i != countryCodes.length; i++) {
		var countryCode = countryCodes[i];
		var name = countryCode.getAttribute('name');
		var code = countryCode.getAttribute('code');
		var li = $j("<li></li>")
		            .addClass("countrycode-dropdown-li")
		            .on("click", {'name': name, 'code': code, 'verificationId': verificationId}, updateCountry)	
					.append($j("<span></span>").text(name).css("text-align", "left"))
					.append($j("<span></span>").text(code).css("float", "right"));
		ul.append(li);
	}
}

// Get the list of devices for the user
// Subscription info is also received and ui is updated accordingly.
function getDevices(currentForm) {
	// clean up first
	var verificationId = currentForm.elements['verification_id'].value;
	clearAllDevices('sms_devices_' + verificationId);
	var ga = new GlideAjax('PwdAjaxEnrollSMS');
	ga.addParam('sysparm_name', 'getDevices');
	ga.addParam('sysparm_user_id', getUserID());
	ga.getXML(handleGetDevicesResponse, null, currentForm);
}

// remove all generated device details
function clearAllDevices(element) {
	var myNode = document.getElementById(element);
	while (myNode.firstChild) {
		myNode.removeChild(myNode.firstChild);
	}
}

function handleGetDevicesResponse(response, currentForm) {
	var res =  response.responseXML.getElementsByTagName("response");
	var count = handleDeviceResponse(response, currentForm);
	/*
	if (count == 0) {
		displayHeader(getMessage('There is no device registered for this user'), currentForm);
	} else {
		displayHeader(getMessage('Available Devices'), currentForm);
	}
	*/
}

// Get the list of devices and add to the device list
function handleDeviceResponse(response, currentForm) {
	var devices = response.responseXML.getElementsByTagName("device");
	if (devices.length > 0) {
		// If the table already exists, dont add again
		var verificationId = currentForm.elements['verification_id'].value;
		var table = document.getElementById('sms_device_table_' + verificationId);
		if (table == null) {
			table = addDeviceHeaderRow(currentForm);
		}
		var body = document.createElement('tbody');
		table.appendChild(body);
		for (var i = 0; i != devices.length; i++) {
			addDeviceDetailRow(devices[i], currentForm, body);
		}
	}
	return devices.length;
}

// add device detail row - makes the checkbox, device name and the device verification fields
function addDeviceHeaderRow(currentForm) {
	var useNotify = currentForm.elements['use_notify'].value;
	var verificationId = currentForm.elements['verification_id'].value;
	var divElem = document.getElementById('sms_devices_' + verificationId);
	
	// Create a table
	var tableRow = document.createElement('table');
	tableRow.id = 'sms_device_table_' + verificationId;
	var head = document.createElement('thead');
	tableRow.appendChild(head);
	
	// Create a table header
	var tableHeaderRow = document.createElement('tr');
	tableHeaderRow.id = 'sms_device_table_header_' + verificationId;
	head.appendChild(tableHeaderRow);
	
	// Create the table header th tags
	// Column: Authorized
	var thCellUsed = document.createElement('th');
	thCellUsed.id = 'sms_device_table_th_used_' + verificationId;
	setText(thCellUsed, getMessage('Authorized'));
	tableHeaderRow.appendChild(thCellUsed);
	
	// Column: Empty title
	var thCellDelete = document.createElement('th');
	thCellDelete.id = 'sms_device_table_th_delete_' + verificationId;
	setText(thCellDelete, '');
	tableHeaderRow.appendChild(thCellDelete);
	
	// Column: Name
	var thCellName = document.createElement('th');
	thCellName.id = 'sms_device_table_th_name_' + verificationId;
	setText(thCellName, getMessage('Name'));
	thCellName.align='left';
	tableHeaderRow.appendChild(thCellName);
	
	// Column: Country
	if (useNotify == 'true') {
		var thCellCountryCode = document.createElement('th');
	    thCellCountryCode.id = 'sms_device_table_th_country_' + verificationId;
 	    setText(thCellCountryCode, getMessage('Country'));
	    thCellCountryCode.align = 'left';
  	    tableHeaderRow.appendChild(thCellCountryCode);
	}
	
	// Column: Number
	var thCellNumber = document.createElement('th');
	thCellNumber.id = 'sms_device_table_th_number_' + verificationId;
	setText(thCellNumber, getMessage('Number'));
	thCellNumber.align = 'left';
	tableHeaderRow.appendChild(thCellNumber);
	
	// Column: provider
	if (useNotify == 'false') { 
		var thCellProvider = document.createElement('th');
	    thCellProvider.id = 'sms_device_table_th_provider_' + verificationId;
 	    setText(thCellProvider, getMessage('Provider'));
	    thCellProvider.align = 'left';
  	    tableHeaderRow.appendChild(thCellProvider);
	}
	
	// Column: Verified
	var thCellVerified = document.createElement('th');
	thCellVerified.id = 'sms_device_table_th_verified_' + verificationId;
	setText(thCellVerified, getMessage('Status'));
	tableHeaderRow.appendChild(thCellVerified);
	
	divElem.appendChild(tableRow);
	return tableRow;
}

// add device detail row - makes the checkbox, device name and the device verification fields
function addDeviceDetailRow(device, currentForm, body) {
	var deviceId = device.getAttribute("sys_id");
	var verificationId = currentForm.elements['verification_id'].value;
	var devicesElem = document.getElementById('sms_device_table_' + verificationId);
	var deviceVerified = device.getAttribute("isVerified") === 'true';
	
	// Create a table row
	var deviceRow = document.createElement('tr');
	body.appendChild(deviceRow);
	
	// Create a checkbox cell
	var checkboxCell = document.createElement('td');
	checkboxCell.align = 'center';
	deviceRow.appendChild(checkboxCell);
	
    var cbSpan = document.createElement('span');
	cbSpan.className ="input-group-checkbox"	
	checkboxCell.appendChild(cbSpan);
	
	// Create the checkbox
	var checkbox = document.createElement('input');
	checkbox.className = 'checkbox device'; // "device" is used by the tests
	checkbox.type = 'checkbox';
	// Displayed to user in the message when selecting/unselecting a device
	checkbox.name = device.getAttribute("name") + ' (' + device.getAttribute("phone") + ')';
	checkbox.id = 'sms_device_checkbox_' + deviceId;
	checkbox.value = deviceId; // The value is deviceId so we can use it later in updateSubscriptionToDevice
	checkbox.onclick = function() { updateSubscriptionToDevice(this); };
	checkbox.disabled = !deviceVerified;
	checkbox.checked = device.getAttribute("isSubscribed").toLowerCase() === 'true' && deviceVerified;
	
	cbSpan.appendChild(checkbox);
	
	var checkboxLabel = document.createElement('label');
	checkboxLabel.className = "checkbox-label";
	checkboxLabel.setAttribute('for', checkbox.id);	
	cbSpan.appendChild(checkboxLabel);
	
	// Delete device image
	var deleteDeviceCell = document.createElement('td')
	deleteDeviceCell.align = 'center';

	var deleteDeviceImg = document.createElement("i");
	deleteDeviceImg.id = 'sms_device_delete_link_' + deviceId;
	deleteDeviceImg.className = "icon-delete pwd-icon-small pwd-icon-error";
	deleteDeviceImg.onclick = function() { deleteDevice(this, currentForm); };
	deleteDeviceCell.appendChild(deleteDeviceImg);
	deviceRow.appendChild(deleteDeviceCell);
	
	// Device label cell
	var deviceLabelCell = document.createElement('td');
	deviceLabelCell.className = 'pwd-enroll-sms-name-cell';
	deviceRow.appendChild(deviceLabelCell);
	
	// Device label
	var deviceLabel = document.createElement("span");
	deviceLabel.id = 'sms_device_name_' + deviceId;
	setText(deviceLabel, device.getAttribute("name"));
	deviceLabelCell.appendChild(deviceLabel);
	
	// Device country code
	if (currentForm.elements['use_notify'].value == 'true') {
		var deviceCountryCodeCell = document.createElement('td');
	    deviceCountryCodeCell.className = 'pwd-enroll-sms-country-code-cell';
	    deviceRow.appendChild(deviceCountryCodeCell);
	    var deviceCountryCode = document.createElement("span");
	    deviceCountryCode.id = 'sms_device_country_' + deviceId;
	    setText(deviceCountryCode, device.getAttribute("countryName") + ' (' + device.getAttribute("countryCode") + ')');
	    deviceCountryCodeCell.appendChild(deviceCountryCode);
	}
	
	// Device phone number
	var devicePhoneLabelCell = document.createElement('td');
	devicePhoneLabelCell.className = 'pwd-enroll-sms-phone-cell';
	deviceRow.appendChild(devicePhoneLabelCell);
	var devicePhoneLabel = document.createElement("span");
	devicePhoneLabel.id = 'sms_device_number_' + deviceId;
	setText(devicePhoneLabel, device.getAttribute("phone"));
	devicePhoneLabelCell.appendChild(devicePhoneLabel);
	
	
	// Device provider
	if (currentForm.elements['use_notify'].value == 'false') {
		var deviceProviderCell = document.createElement('td');
	    deviceProviderCell.className = 'pwd-enroll-sms-provider-cell';
	    deviceRow.appendChild(deviceProviderCell);
	    var deviceProvider = document.createElement("span");
	    deviceProvider.id = 'sms_device_provider_' + deviceId;
	    setText(deviceProvider, device.getAttribute("provider"));
	    deviceProviderCell.appendChild(deviceProvider);
	}
	

    var verifyButtonCell = document.createElement('td');
    deviceRow.appendChild(verifyButtonCell);
	
	// if device is not verified, add the Verify button, code message, code textbox and ok button
	// Verify button cell
    if (deviceVerified) {
		var verifyButton = document.createElement("button");
		verifyButton.id = 'sms_device_verify_button_' + deviceId;
		verifyButton.style.whiteSpace = 'nowrap';
		verifyButton.style.width = "70px";
		verifyButton.className = 'btn btn-default';
		verifyButton.disabled = true;
		verifyButton.innerHTML = getMessage('Verified');
		verifyButtonCell.appendChild(verifyButton);
	}
	
	else {
		// Verify button
		var resetButton = document.createElement("button");
		verifyButtonCell.appendChild(resetButton);
		resetButton.setAttribute('data-target', '#verify_device_dlg');
		resetButton.setAttribute('data-toggle', 'modal');
		resetButton.className = "btn btn-primary";
		resetButton.id = "sms_device_verify_button_" + deviceId;
		resetButton.style.whiteSpace = "nowrap";
		resetButton.style.width = "70px";
		resetButton.innerHTML = getMessage('Verify');
		resetButton.onclick = function() {
			initVerifyDeviceDialog(this);
			return false;
		};
	}
}


// Add a new device and subscription
function  addNewDevice(elem) {
	var currentForm = elem.form;
	var useNotify = currentForm.elements['use_notify'].value;
	var verId = currentForm.elements['verification_id'].value;
	var gMsg = new GwtMessage();
	
	// device name
	var name = getFieldValue(currentForm, 'sysparm_device_name_' + verId, 
			'name_form_group_' + verId, 'retype_device_name_' + verId, gMsg.getMessage("You must specify a name to associate with your device"));
	if (name == "")
		return false;
	
	// country code
	var countryName = '';
	var countryCode = '';
	if (useNotify == 'true') {
		countryCode = getFieldValue(currentForm, 'country_' + verId,
					'phone_form_group_' + verId, 'select_country_code_again_' + verId, gMsg.getMessage("You must specify a country code"));
	    countryName = currentForm.elements['country_'+verId].name.trim();
		if (countryCode == "") {
			$j("#phone_form_group_" + verId).removeClass("show-overflow");
			return false;
		}
	}
	
	// phone number
	var phoneNumber = getFieldValue(currentForm, 'sysparm_phone_number_' + verId,
				'phone_form_group_' + verId, 'retype_phone_number_' + verId, gMsg.getMessage("You must specify a phone number"));
	if (phoneNumber == "")
		return false;	
	var phoneBare = String(phoneNumber);
	phoneBare = phoneBare.replace(/\D/g,''); // strip non-digits
	var validLength = /^[0-9]{6,14}$/.test(phoneBare); // 6 - 14 digits
	//Must end with a digit, can begin with a digit or (, and may contain (, ), digit, - or space
	var validPhone = /^[\d|\(][\d|\s|\(|\)|-]*[\d]$/.test(phoneNumber);
	
	if (!validPhone || !validLength ) {
		var formGroupId = 'phone_form_group_' + verId;
		var helpBlockId = 'retype_phone_number_' + verId;
		displayFieldError(helpBlockId, getMessage("Invalid phone number"), formGroupId);
		return false;
	}
	
	// get provider	
	var provider = '';
	if (useNotify != 'true') {
		provider = getFieldValue(currentForm, 'service_provider_' + verId,
				'provider_form_group_' + verId, 'select_service_provider_again_' + verId, gMsg.getMessage("You must specify a provider"));
		if (provider == "")
			return false;
	}
	/*
	if (provider == null || provider == 0) {
		var formGroupId = 'provider_form_group_' + verificationId;
		var divId = 'select_service_provider_again_' + verificationId;
		displayFieldError(divId, "Select provider", formGroupId);
		foundError = true;
	}
	*/

	var ga = new GlideAjax('PwdAjaxEnrollSMS');
	ga.addParam('sysparm_name', 'addDevice');
	ga.addParam('sysparm_user_id', getUserID());
	ga.addParam('sysparm_phone_number', phoneNumber);
	ga.addParam('sysparm_device_name', name);
	if (useNotify == 'true') {
		ga.addParam('sysparm_country_name', countryName);
		ga.addParam('sysparm_country_code', countryCode);
	}
	else {
		ga.addParam('sysparm_service_provider', provider);
	}
	ga.getXML(handleAddDeviceResponse, null, currentForm);
	
	return true;
}

function getFieldValue(currentForm, fieldId, formGroupId, helpBlockId, message) {
	var ele = currentForm.elements[fieldId];
	ele.value = ele.value.trim();
	if (ele.value == "") {
		displayFieldError(helpBlockId, message, formGroupId);
	}
	return ele.value;
}


function handleAddDeviceResponse(response, currentForm) {
	var verificationId = currentForm.elements['verification_id'].value;
	var useNotify = currentForm.elements['use_notify'].value;
	
	var res =  response.responseXML.getElementsByTagName("response");
	var status = res[0].getAttribute("status");
	var message = res[0].getAttribute("message");
	var value = res[0].getAttribute("value");
	
	clearAllDevices('sms_devices_' + verificationId);
	handleDeviceResponse(response, currentForm);
	
	// if added clear up the input field. It's already added.
	if (status == 'success') {
		currentForm.elements['sysparm_phone_number_' + verificationId].value = '';
		currentForm.elements['sysparm_device_name_' + verificationId].value = '';
		if(useNotify == 'true'){
			$j("#country_" + verificationId).val("");
			toggleAllListItems();
		}
		else
            currentForm.elements['sys_select.service_provider_' + verificationId].selectedIndex = 0;
		// displayHeader(getMessage('Available Devices'), currentForm);
	}
	
	// the device info for newly added phones
	// displayMessage(message, currentForm);
	g_form.clearMessages();
	g_form.addInfoMessage(message);
}

// Update subscription of a device, represented by the checkbox.
function updateSubscriptionToDevice(box) {
	// if (!verifyAtleastOneDeviceIsSubscribed(box, box.form))
	//	return;
	var ga = new GlideAjax('PwdAjaxEnrollSMS');
	ga.addParam('sysparm_name', 'updateDeviceSubscription');
	ga.addParam('sysparm_user_id', getUserID());
	ga.addParam('sysparm_device_id', box.value);
	ga.addParam('sysparm_device_name', box.name);
	ga.addParam('sysparm_subscribed', box.checked);
	
	ga.getXML(handleUpdateDeviceSubscriptionResponse, null, box.form);
}

function handleUpdateDeviceSubscriptionResponse(response, currentForm) {
	handleResponseAndShowMessage(response, currentForm);
	handleIfNoDeviceSubscribed(response, currentForm);
}

// Verify if there is at least one device selected
// If not, give a message. Do not allow the last one to be unselected.
// Returns if atleast one device is selected or not
function verifyAtleastOneDeviceIsSubscribed(box, currentForm) {
	var verificationId = currentForm.elements['verification_id'].value;
	var divElem = document.getElementById('sms_devices_' + verificationId);
	var checkboxElems = divElem.getElementsByTagName('input');
	var foundCheckedDevice = false;
	
	// if at least one is checked, we are good.
	for (var i = 0; i != checkboxElems.length; i++) {
		if (checkboxElems[i].type != 'checkbox') {
			continue;
		}
		if (checkboxElems[i].checked) {
			foundCheckedDevice = true;
			break;
		}
	}
	if (foundCheckedDevice) {
		// displayMessage("", currentForm);
		return true;
	} else {
		// displayMessage(getMessage('You must subscribe to at least one device'), currentForm);
		if (box != null)
			box.checked = true;
		return false;
	}
}

function deleteDevice(deleteItem, currentForm) {
	var itemId = deleteItem.id;
	// Extract deviceId from the buttonId. ButtonId is sms_device_verify_button_ + deviceId
	var deviceId = itemId.replace('sms_device_delete_link_', '');
	var verificationId = currentForm.elements['verification_id'].value;
	var box  = currentForm.elements['sms_device_checkbox_' + deviceId];
	var deviceName = document.getElementById('sms_device_name_' + deviceId).innerHTML;
	
	/*
	// make sure we are not deleting the last checked device.
	var enrolled = box.checked;
	box.checked = false;
	if (enrolled && !verifyAtleastOneDeviceIsSubscribed(box, currentForm)) {
		box.checked = enrolled;
		return;
	}
	*/
	
	var dd = new GlideModal("glide_confirm_basic");
	dd.setTitle(new GwtMessage().getMessage('Confirm deletion for device: {0}', deviceName));
	dd.setPreference('onPromptComplete', function() {
		// clean up first
		clearAllDevices('sms_devices_' + verificationId);
		// get the result back
		var ga = new GlideAjax('PwdAjaxEnrollSMS');
		ga.addParam('sysparm_name', 'deleteDevice');
		ga.addParam('sysparm_device_id', deviceId);
		ga.addParam('sysparm_user_id', getUserID());
		ga.getXML(handleDeleteDeviceResponse, null, currentForm);
		
	});
	dd.setPreference('onPromptCancel', function() {});
	dd.render();
	
}

function handleDeleteDeviceResponse(response, currentForm) {
	handleResponseAndShowMessage(response, currentForm);
	handleDeviceResponse(response, currentForm);
	handleIfNoDeviceSubscribed(response, currentForm);
}


function resendEnrollmentCode(elem) {
	var currentForm = elem.form;
	var verificationId = currentForm.elements['verification_id'].value;
	var deviceId = gel('verify_dialog_device_id_' + verificationId).value;
	sendEnrollmentCodeToDevice(currentForm, verificationId, deviceId);
}

function initVerifyDeviceDialog(elem) {
	var currentForm = elem.form;
	var useNotify = currentForm.elements['use_notify'].value;
	var verificationId = currentForm.elements['verification_id'].value;
	var buttonId = elem.id;
	// Extract deviceId from the buttonId. ButtonId is sms_device_verify_button_ + deviceId
	var deviceId = buttonId.replace('sms_device_verify_button_', '');

	var name     = $j('#sms_device_name_' + deviceId).text();     // Use jquery to better handle both chrome and Firefox
	var phone    = $j('#sms_device_number_' + deviceId).text();   // Use jquery to better handle both chrome and Firefox
	
	currentForm.elements['verify_dialog_device_id_' + verificationId].value = deviceId;
	currentForm.elements['verify_dialog_device_name_' + verificationId].value = name;
	currentForm.elements['verify_dialog_device_number_' + verificationId].value = phone;
	
	if (useNotify == 'true') {
		var countryCode = $j('#sms_device_country_' + deviceId).text();
		// the countryCode is actually like 'United State (+1)', here we only need to get the country code
		countryCode = countryCode.match(/\+\d+/i);
		currentForm.elements['verify_dialog_device_country_' + verificationId].value = countryCode;
	}
	else {
		var provider = $j('#sms_device_provider_' + deviceId).text();
		currentForm.elements['verify_dialog_device_provider_' + verificationId].value = provider;
	}
	
	currentForm.elements['verify_dialog_sms_code_' + verificationId].value = '';

	sendEnrollmentCodeToDevice(currentForm, verificationId, deviceId);
}


// Send a code to the device for verifying it
function sendEnrollmentCodeToDevice(currentForm, verificationId, deviceId) {
	gel('verify_dialog_error_msg_' + verificationId).innerHTML = '';

	var ga = new GlideAjax('PwdAjaxSMSProcessor');
	ga.addParam('sysparm_name', 'generateEnrollmentCode');
	ga.addParam('sysparm_verification_id', verificationId);
	ga.addParam('sysparm_device_id', deviceId);
	ga.getXML(handledEnrollmentCodeResponse, null, currentForm);
}

// after the enrollment code is sent to the device, show success msg
function handledEnrollmentCodeResponse(response, currentForm) {
	var verificationId = currentForm.elements['verification_id'].value;
	
	var res =  response.responseXML.getElementsByTagName("response");
	var message = res[0].getAttribute("message");
	var status = res[0].getAttribute("status");
	var deviceId = res[0].getAttribute("value");

	if (message) 
		gel('verify_dialog_error_msg_' + verificationId).innerHTML = message;
}

// Verify if the code entered matches the code sent to verify the device
function verifyDeviceWithEnrollmentCode(elem) {
	var currentForm = elem.form;
	var verificationId = currentForm.elements['verification_id'].value;
	var useNotify = currentForm.elements['use_notify'].value;
	
	var deviceId = currentForm.elements['verify_dialog_device_id_' + verificationId].value;

	var ga = new GlideAjax('PwdAjaxSMSProcessor');
	ga.addParam('sysparm_name', 'verifyEnrollmentCode');
	
	var code = currentForm.elements['verify_dialog_sms_code_' + verificationId].value.trim();
	currentForm.elements['verify_dialog_sms_code_' + verificationId].value = code;
	
	if (code == "") {
		displayFieldError('verify_dialog_error_msg_' + verificationId, 
						 new GwtMessage().getMessage('Code can not be empty'),
						 'verify_dialog_sms_code_form_group_' + verificationId);
		return false;
	}
	
	ga.addParam('sysparm_device_id', deviceId);
	ga.addParam('sysparm_verification_id', verificationId);
	ga.addParam('sysparm_sms_code', code);
	ga.addParam('sysparm_user_id', getUserID());
	
	ga.getXML(handledEnrollmentVerifyResponse, null, currentForm);
	
	return true;
}

// after the enrollment code is verified, update UI to remove verification related fields
function handledEnrollmentVerifyResponse(response, currentForm) {
	handleResponseAndShowMessage(response, currentForm);

	var res =  response.responseXML.getElementsByTagName("response");
	var status = res[0].getAttribute("status");
	if (status == 'fail') {
		return;
	}
	
	var deviceId = res[0].getAttribute("value");
	// Update the device verification status, enable the checkbox and also select it
	currentForm.elements['sms_device_checkbox_' + deviceId].disabled = false;
	currentForm.elements['sms_device_checkbox_' + deviceId].checked = true;
	
	currentForm.elements['sms_device_verify_button_' + deviceId].innerHTML = getMessage('Verified');  // I18N_OK 08-04-16
	currentForm.elements['sms_device_verify_button_' + deviceId].disabled = true;
	
	getDevices(currentForm);
}

function handleResponseAndShowMessage(response, currentForm) {
	var res = response.responseXML.getElementsByTagName("response");
	var message = res[0].getAttribute("message");
	var status = res[0].getAttribute("status");

	g_form.clearMessages();
	if (status == 'success') {
  	g_form.addInfoMessage(message);
	} else {
  	g_form.addErrorMessage(message);
	}
}

function handleIfNoDeviceSubscribed(response, currentForm) {
	var status = response.responseXML.getElementsByTagName("response")[0].getAttribute("status");
	if (status == "success" && !verifyAtleastOneDeviceIsSubscribed(null, currentForm))
		g_form.addErrorMessage(getMessage("You must authorize at least one device"));
}

function setText(elem, txt){
	var node = document.createTextNode(txt);
	elem.appendChild(node);
}

function openAddDeviceDialog(elem) {
	clearDeviceForm(elem);
}

function clearDeviceForm(elem) {
	var currentForm = elem.form;
	var verificationId = currentForm.elements['verification_id'].value;
	var useNotify = currentForm.elements['use_notify'].value;
	
	var fieldId = 'sysparm_device_name_' + verificationId;
	var formGroupId = 'name_form_group_' + verificationId;
	var errorId = 'retype_device_name_' + verificationId;
	currentForm.elements[fieldId].value = '';
	clearFieldError(errorId, formGroupId);
		
	fieldId = 'sysparm_phone_number_' + verificationId;
	formGroupId = 'phone_form_group_' + verificationId;
	errorId = 'retype_phone_number_' + verificationId;
	currentForm.elements[fieldId].value = '';
	clearFieldError(errorId, formGroupId);
	
	if (useNotify == 'false') {
		fieldId = 'sys_select.service_provider_' + verificationId;
		currentForm.elements[fieldId].selectedIndex = 0;
		currentForm.elements[fieldId].onchange();  // Manually changing the selectedIndex programatically does not trigger onChange event
	    formGroupId = 'provider_form_group_' + verificationId;
	    errorId = 'select_service_provider_again_' + verificationId;
		clearFieldError(errorId, formGroupId);
	}
	else {
		$j("#country_" + verificationId).val("");
		toggleAllListItems();
	}
}

function displayFieldError(fieldId, message, formGroupId) {
	var fieldElem = document.getElementById(fieldId);
	if (fieldElem != undefined) {
		fieldElem.innerHTML = message;

        $j("[aria-describedby='" + fieldId + "']").attr('aria-invalid', 'true');
	}
	$j('#' + formGroupId).addClass("has-error");
}

function clearFieldError(fieldId, formGroupId) {
	var fieldElem = document.getElementById(fieldId);
	if (fieldElem != undefined) {
		fieldElem.innerHTML = '';

        $j("[aria-describedby='" + fieldId + "']").attr('aria-invalid', 'false');
	}
	$j('#' + formGroupId).removeClass("has-error");
}

function updateCountry(event) {
	var verificationId = event.data.verificationId;
	var inputId = "country_" + verificationId;
	var code = event.data.code;
	var name = event.data.name;
	
	var input = $j('#' + inputId);
	input.attr("name", name);
	input.val(code);
	
	$j("#sysparm_phone_number_"+verificationId).focus();
}

function selectListItem(event, ele, verificationId) {
	var keycode = event.which;
	// Up and Down arrow key
	if (keycode == 38 || keycode == 40)
		navigateList(event, verificationId);
	// Enter key
	else if (keycode == 13) {
		// prevent submitting form
		event.preventDefault();
		$j(".countrycode-selected").click();
	}
	// Tab or Escape key, hide dropdown
	else if (keycode == 9 || keycode == 27) {
		$j('span.dropdown').removeClass('open');
		if(!$j(ele).attr("name")) {
			$j(ele).val("");
		}
	}
}

function filterOut(event, ele, verificationId){
	// Up, Down, Enter and Tab key
	var keycode = event.which;
	if (keycode == 38 || keycode == 40 || keycode == 13 || keycode == 9)
		return;
	
	var searchText = $j(ele).val().toUpperCase();
	var showItems = [];
	var hideItems = [];
	var listItems = $j('#sys_ul_country_'+ verificationId).children();
	listItems.each(function(){
		var countryName = $j(this).text().toUpperCase();
		var showCurrentLi = countryName.indexOf(searchText) !== -1;
		if (showCurrentLi){
			showItems.push($j(this));
		}
		else{
			hideItems.push($j(this));
		}
	});
	for (var i = 0; i < showItems.length; i++) {
		showItems[i].toggle(true);
	}
	for (var i = 0; i < hideItems.length; i++) {
		hideItems[i].toggle(false);
	}
	
	navigateToFirst(verificationId);
}

function navigateList(event, verificationId) {
	// prevent cursor moving between text in the input
	event.preventDefault();
	var ul = $j("#sys_ul_country_" + verificationId);
	var selected = $j(".countrycode-selected");
	if (event.which == 38) { //up
		var prev = selected.prevAll(":visible:first");
		if (prev.length != 0) {
			prev.addClass("countrycode-selected");
			selected.removeClass("countrycode-selected");
			scrollToItem(ul, prev);
		}
	}
	if (event.which == 40) { //down
		var next = selected.nextAll(":visible:first");
		if (next.length != 0) {
			next.addClass("countrycode-selected");
			selected.removeClass("countrycode-selected");
			scrollToItem(ul, next);
		}
	}
}

function scrollToItem(ul, item) {
	var firstItem = ul.children(":visible:first");
	if (firstItem.length != 0) {
		var firstItemTop = firstItem.offset().top;
	    ul.scrollTop(item.offset().top - firstItemTop - item.height()*5);
	}
}

function navigateToFirst(verificationId) {
	var ul = $j("#sys_ul_country_" + verificationId);
	ul.children().removeClass("countrycode-selected");	
	var firstItem = ul.children(":visible:first");
	if (firstItem.length !=  0) {
		firstItem.addClass("countrycode-selected");
	    scrollToItem(ul, firstItem);
	}
}

function toggleAllListItems(){
	$j('ul > li').each(function(){
		$j(this).toggle(true);
	});
}

function openDropdown(ele, verificationId){
	$j("#phone_form_group_"+verificationId).addClass("show-overflow");
	 clearFieldError('select_country_code_again_' + verificationId, 
					'phone_form_group_' + verificationId);
	$j(ele).attr("name", "");
    $j(ele).val("");
	$j('span.dropdown').addClass('open');
	toggleAllListItems();
	navigateToFirst(verificationId);
}

function hideDropdown(event, verificationId){
	var inputEle = $j("#country_" + verificationId);
	if(!inputEle.is(event.target) && $j("span.dropdown").hasClass('open')){
		$j("span.dropdown").removeClass('open');
		// avoid user just typing in country code
		if(!inputEle.attr("name")) {
			inputEle.val("");
		}
	}
}