// Get the user ID
function getUserID() {
	var user_id =  gel("userId").value;
	return user_id;
}

// call back for container on load
function sms_on_load(formId) {
	var currForm = document.getElementById(formId);
	var verificationId = currForm.elements['verification_id'].value;
	getProviders(currForm);
	getDevices(currForm);
}

// call back for container on submit
function sms_on_submit(formId) {
	var currForm = document.getElementById(formId);	
	if (!verifyAtleastOneDeviceIsSubscribed(null, currForm)) {
		displayErrorMessage(getMessage('You must authorize at least one device'));
		return false;
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
	if (providers.length == 0) {
		var msg = getMessage('There should be at least one active service provider');
		displayMessage(msg, currentForm);
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
	if (count == 0) {
		displayHeader(getMessage('There is no device registered for this user'), currentForm);
	} else {
		displayHeader(getMessage('Available Devices'), currentForm);
	}
	
	// if there is no device checked, put a note
	verifyAtleastOneDeviceIsSubscribed(null, currentForm);
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
	// Column: Enrolled
	var thCellUsed = document.createElement('th');
	thCellUsed.id = 'sms_device_table_th_used_' + verificationId;
	setText(thCellUsed, 'Enrolled');
	tableHeaderRow.appendChild(thCellUsed);
	
	// Column: Empty title
	var thCellDelete = document.createElement('th');
	thCellDelete.id = 'sms_device_table_th_delete_' + verificationId;
	setText(thCellDelete, '');
	tableHeaderRow.appendChild(thCellDelete);
	
	// Column: Name
	var thCellName = document.createElement('th');
	thCellName.id = 'sms_device_table_th_name_' + verificationId;
	setText(thCellName, 'Name');
	thCellName.align='left';
	tableHeaderRow.appendChild(thCellName);
	
	// Column: Number
	var thCellNumber = document.createElement('th');
	thCellNumber.id = 'sms_device_table_th_number_' + verificationId;
	setText(thCellNumber, 'Number');
	thCellNumber.align = 'left';
	tableHeaderRow.appendChild(thCellNumber);
	
	// column: Provider
	var thCellProvider = document.createElement('th');
	thCellProvider.id = 'sms_device_table_th_provider_' + verificationId;
	setText(thCellProvider, 'Provider');
	thCellProvider.align = 'left';
	tableHeaderRow.appendChild(thCellProvider);
	
	// Column: Verified
	var thCellVerified = document.createElement('th');
	thCellVerified.id = 'sms_device_table_th_verified_' + verificationId;
	setText(thCellVerified, 'Verified');
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
	// Create the checkbox
	var checkbox = document.createElement('input');
	checkbox.className = 'device'; // Used by the tests
	checkbox.type = 'checkbox'; // Used to lookup checkboxes in verifyAtleastOneDeviceIsSubscribed
	// Displayed to user in the message when selecting/unselecting a device
	checkbox.name = device.getAttribute("name") + ' (' + device.getAttribute("phone") + ')';
	checkbox.id = 'sms_device_checkbox_' + deviceId;
	checkbox.value = deviceId; // The value is deviceId so we can use it later in updateSubscriptionToDevice
	checkbox.onclick = function() { updateSubscriptionToDevice(this); };
	checkbox.disabled = !deviceVerified;
	checkboxCell.appendChild(checkbox);
	checkbox.checked = device.getAttribute("isSubscribed").toLowerCase() === 'true' && deviceVerified;
	
	// Delete device image
	var deleteDeviceCell = document.createElement('td')
	deleteDeviceCell.align = 'center';
	var a = document.createElement('a');
	a.title = "Delete device";
	a.style.visibility = 'visible';
	a.onclick = function() { deleteDevice(this, currentForm); };
	a.id = 'sms_device_delete_link_' + deviceId;
	
	var deleteDeviceImg = document.createElement("img");
	deleteDeviceImg.id = 'sms_device_delete_img' + deviceId;
	deleteDeviceImg.src = 'images/icons/error_12x12.jpg';
	a.appendChild(deleteDeviceImg);
	deleteDeviceCell.appendChild(a);
	deviceRow.appendChild(deleteDeviceCell);
	
	// Device label cell
	var deviceLabelCell = document.createElement('td');
	deviceLabelCell.align = 'left';
	deviceRow.appendChild(deviceLabelCell);
	
	// Device label
	var deviceLabel = document.createElement("label");
	deviceLabel.id = 'sms_device_name_' + deviceId;
	setText(deviceLabel, device.getAttribute("name"));
	deviceLabelCell.appendChild(deviceLabel);
	
	// Device phone number label cell
	var devicePhoneLabelCell = document.createElement('td');
	devicePhoneLabelCell.align = 'left';
	deviceRow.appendChild(devicePhoneLabelCell);
	// Device phone number label
	var devicePhoneLabel = document.createElement("label");
	devicePhoneLabel.id = 'sms_device_number_' + deviceId;
	setText(devicePhoneLabel, device.getAttribute("phone"));
	devicePhoneLabelCell.appendChild(devicePhoneLabel);
	
	// Device provider
	var deviceProviderCell = document.createElement('td');
	deviceProviderCell.align = 'left';
	deviceRow.appendChild(deviceProviderCell);
	var deviceProvider = document.createElement("label");
	deviceProvider.id = 'sms_device_provider_' + deviceId;
	setText(deviceProvider, device.getAttribute("provider"));
	deviceProviderCell.appendChild(deviceProvider);
	
	// Verification status cell
	var verStatusCell = document.createElement('td');
	verStatusCell.align = 'center';
	deviceRow.appendChild(verStatusCell);
	// Verification status image
	var verStatusImg = document.createElement("img");
	verStatusImg.id = 'sms_device_ver_status_' + deviceId;
	// clear = yes green; critical = no red icon
	verStatusImg.src = deviceVerified ? 'images/icon_clear.gifx' : 'images/icon_critical.gifx';
	verStatusCell.appendChild(verStatusImg);
	
	// if device is not verified, add the Verify button, code message, code textbox and ok button
	if (!deviceVerified) {
		// Verify button cell
		var verifyButtonCell = document.createElement('td');
		deviceRow.appendChild(verifyButtonCell);
		// Verify button
		var verifyButton = document.createElement("input");
		verifyButton.type = 'button';
		verifyButton.id = 'sms_device_verify_button_' + deviceId;
		verifyButton.value = 'Verify';
		verifyButton.style.whiteSpace = 'nowrap';
		verifyButton.onclick = function() { sendEnrollmentCodeToDevice(this); };
		verifyButtonCell.appendChild(verifyButton);
		
		// Verification code message label cell
		var verCodeMsgCell = document.createElement('td');
		deviceRow.appendChild(verCodeMsgCell);
		// Verification code message label
		var verCodeMsg = document.createElement("label");
		verCodeMsg.id = 'sms_device_ver_code_msg_' + deviceId;
		setText(verCodeMsg, 'Enter code');
		verCodeMsg.style.whiteSpace = 'nowrap';
		verCodeMsgCell.appendChild(verCodeMsg);
		
		// Verification code textbox cell
		var verCodeTextboxCell = document.createElement('td');
		deviceRow.appendChild(verCodeTextboxCell);
		// Verification code textbox
		var verCodeTextbox = document.createElement("input");
		verCodeTextbox.name = device.getAttribute("name");
		verCodeTextbox.id = 'sms_device_ver_code_' + deviceId;
		verCodeTextbox.size = '10';
		verCodeTextboxCell.appendChild(verCodeTextbox);
		verCodeMsg['for'] = verCodeTextbox.id;
		
		// Ok button cell
		var okButtonCell = document.createElement('td');
		deviceRow.appendChild(okButtonCell);
		// Ok button
		var okButton = document.createElement("input");
		okButton.type = 'button';
		okButton.id = 'sms_device_ok_button_' + deviceId;
		okButton.value = 'Ok';
		okButton.onclick = function() { verifyDeviceWithEnrollmentCode(this); };
		okButtonCell.appendChild(okButton);
	}
}

// Add a new device and subscription
function  addNewDevice(elem) {
	var currentForm = elem.form;
	var verificationId = currentForm.elements['verification_id'].value;
	var phone = currentForm.elements['sysparm_phone_number_' + verificationId].value.trim();
	var name = currentForm.elements['sysparm_device_name_' + verificationId].value.trim();
	var provider = currentForm.elements['service_provider_' + verificationId].value.trim();
	
	if (name == "") {
		var divId = 'retype_device_name_' + verificationId;
		displayFieldError(divId, getMessage("Invalid device name"));
		return;
	}

	var phoneBare = String(phone);
	phoneBare = phoneBare.replace(/\D/g,''); // strip non-digits
	var validLength = /^[0-9]{6,14}$/.test(phoneBare); // 6 - 14 digits
	
	//Must end with a digit, can begin with + or a digit, and may contain digit, - or space
	var validPhone = /^[\d|\+][\d|\s|-]*[\d]$/.test(phone);
	
	if (phone == "" || !validPhone || !validLength ) {
		var divId = 'retype_phone_number_' + verificationId;
		displayFieldError(divId, getMessage("Invalid phone number"));
		return;
	}
	if (provider == null || provider == 0) {
		var divId = 'select_service_provider_again_' + verificationId;
		displayFieldError(divId, getMessage("Select provider"));
		return;
	}
	
	var ga = new GlideAjax('PwdAjaxEnrollSMS');
	ga.addParam('sysparm_name', 'addDevice');
	ga.addParam('sysparm_user_id', getUserID());
	ga.addParam('sysparm_phone_number', phone);
	ga.addParam('sysparm_device_name', name);
	ga.addParam('sysparm_service_provider', provider);
	ga.getXML(handleAddDeviceResponse, null, currentForm);
}

function handleAddDeviceResponse(response, currentForm) {
	var verificationId = currentForm.elements['verification_id'].value;
	
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
		displayHeader(getMessage('Available Devices'), currentForm);
	}
	
	// the device info for newly added phones
	displayMessage(message, currentForm);
}

// Update subscription of a device, represented by the checkbox.
function updateSubscriptionToDevice(box) {
	if (!verifyAtleastOneDeviceIsSubscribed(box, box.form))
		return;
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
		displayMessage("", currentForm);
		return true;
	} else {
		displayMessage(getMessage('You must authorize at least one device'), currentForm);
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
	
	// make sure we are not deleting the last checked device.
	var enrolled = box.checked;
	box.checked = false;
	if (enrolled && !verifyAtleastOneDeviceIsSubscribed(box, currentForm)) {
		box.checked = enrolled;
		return;
	}
	
	var dd = new GlideDialogWindow("glide_confirm_basic");
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
	dd.setWidth(200);
	dd.render();
	
}

function handleDeleteDeviceResponse(response, currentForm) {
	var res =  response.responseXML.getElementsByTagName("response");
	var message = res[0].getAttribute("message");
	displayMessage(message, currentForm);
	handleDeviceResponse(response, currentForm);
}
// Send a code to the device for verifying it
function sendEnrollmentCodeToDevice(verifyButton) {
	var buttonId = verifyButton.id;
	// Extract deviceId from the buttonId. ButtonId is sms_device_verify_button_ + deviceId
	var deviceId = buttonId.replace('sms_device_verify_button_', '');
	var currentForm = verifyButton.form;
	var verificationId = currentForm.elements['verification_id'].value;
	
	var ga = new GlideAjax('PwdAjaxSMSProcessor');
	ga.addParam('sysparm_name', 'generateEnrollmentCode');
	ga.addParam('sysparm_verification_id', verificationId);
	ga.addParam('sysparm_device_id', deviceId);	
	ga.getXML(handledEnrollmentCodeResponse, null, currentForm);
}

// after the enrollment code is sent to the device, show success msg
function handledEnrollmentCodeResponse(response, currentForm) {
	handleResponseAndShowMessage(response, currentForm);
	var res =  response.responseXML.getElementsByTagName("response");
	var status = res[0].getAttribute("status");
	if (status == 'fail') {
		return;
	}
	var deviceId = res[0].getAttribute("value");
	document.getElementById('sms_device_ver_status_' + deviceId).src = 'images/icon_warning.gifx';
}

// Verify if the code entered matches the code sent to verify the device
function verifyDeviceWithEnrollmentCode(okButton) {
	var buttonId = okButton.id;
	// Extract deviceId from the buttonId. ButtonId is sms_device_ok_button_ + deviceId
	var deviceId = buttonId.replace('sms_device_ok_button_', '');
	var currentForm = okButton.form;
	var verificationId = currentForm.elements['verification_id'].value;
	
	var ga = new GlideAjax('PwdAjaxSMSProcessor');
	ga.addParam('sysparm_name', 'verifyEnrollmentCode');
	var code = currentForm.elements['sms_device_ver_code_' + deviceId].value;
	ga.addParam('sysparm_device_id', deviceId);
	ga.addParam('sysparm_verification_id', verificationId);
	ga.addParam('sysparm_sms_code', code);
	ga.addParam('sysparm_user_id', getUserID());
	
	ga.getXML(handledEnrollmentVerifyResponse, null, currentForm);
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
	// Remove the verification fields
	currentForm.elements['sms_device_verify_button_' + deviceId].style.display = "none";
	document.getElementById('sms_device_ver_code_msg_' + deviceId).style.display = "none";
	currentForm.elements['sms_device_ver_code_' + deviceId].style.display = "none";
	currentForm.elements['sms_device_ok_button_' + deviceId].style.display = "none";
	
	// Update the device verification status, enable the checkbox and also select it
	// select green yes icon
	document.getElementById('sms_device_ver_status_' + deviceId).src = 'images/icon_clear.gifx';
	currentForm.elements['sms_device_checkbox_' + deviceId].disabled = false;
	currentForm.elements['sms_device_checkbox_' + deviceId].checked = true;
}

function handleResponseAndShowMessage(response, currentForm) {
	var res =  response.responseXML.getElementsByTagName("response");
	var message = res[0].getAttribute("message");
	displayMessage(message, currentForm);
}

// Display the message to the user for an ajax action
function displayMessage(msg, currentForm) {
	var verificationId = currentForm.elements['verification_id'].value;
	var divElem = document.getElementById('device_msg_' + verificationId);
	displayHelper(divElem, msg);
}

function displayHeader(msg, currentForm) {
	var verificationId = currentForm.elements['verification_id'].value;
	var divElem = document.getElementById('device_header_' + verificationId);
	displayHelper(divElem, msg);
}

function displayHelper(elem, msg) {
	var oldNode = elem.firstChild;
	var newNode = document.createTextNode(msg);
	if (oldNode == null) {
		elem.appendChild(newNode);
	}else {
		elem.replaceChild(newNode, oldNode);
	}
	
}
function setText(elem, txt){
	var node = document.createTextNode(txt);
	elem.appendChild(node);
}

function errorImage() {
	return '<img src="images/outputmsg_error.gifx" alt="Error Message" />';
}
function displayFieldError(fieldId, message) {
	var fieldElem = document.getElementById(fieldId);
	if (fieldElem != undefined) {
		fieldElem.innerHTML = errorImage() + message;
		fieldElem.style.display = 'inline';
	}
}

function clearFieldError(fieldId) {
	var fieldElem = document.getElementById(fieldId);
	if (fieldElem != undefined) {
		fieldElem.innerHTML = '';
		fieldElem.style.display = 'none';
	}
}