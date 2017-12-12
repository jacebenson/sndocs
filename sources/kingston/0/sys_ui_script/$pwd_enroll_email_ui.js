// Get the user ID
function getUserID() {
	var user_id =  gel("userId").value;
	return user_id;
}

// call back for container on load
function email_on_load(formId) {
	var currForm = document.getElementById(formId);
	var verificationId = currForm.elements['verification_id'].value;
	
	getEmails(currForm);
}

// call back for container on submit
function email_on_submit(formId) {
	var currForm = document.getElementById(formId);	
	var mandatory = currForm.elements['mandatory'].value == 'true';
	
	currForm.elements['can_submit'].value = 'true';
	var valid = verifyAtleastOneEmailIsSubscribed(null, currForm);	
	if (!valid) {
		// If form is invalid and mandatory, show message and select the tab to draw the user's attention.
		if (mandatory) {
			var tabId = 'tablabel' + currForm.elements['tab_index'].value;
		    var tab = gel(tabId);
		    tab.click();
		    displayErrorMessage(getMessage('You must authorize at least one email'));
		    return false;
		}
		// if not mandatory we dont want the form submitted and enrollment inserted
		else {
			currForm.elements['can_submit'].value = 'false';
		}
	}
	
	return true;
}

// Get the list of Emails for the user
// Subscription info is also received and ui is updated accordingly.
function getEmails(currentForm) {
	// clean up first
	var verificationId = currentForm.elements['verification_id'].value;
	clearAllEmails('email_addresses_' + verificationId);
	var ga = new GlideAjax('PwdAjaxEnrollEmail');
	ga.addParam('sysparm_name', 'getEmails');
	ga.addParam('sysparm_user_id', getUserID());
	ga.getXML(handleGetEmailsResponse, null, currentForm);
}

// remove all generated Email details
function clearAllEmails(element) {
	var myNode = document.getElementById(element);
	while (myNode.firstChild) {
		myNode.removeChild(myNode.firstChild);
	}
}

function handleGetEmailsResponse(response, currentForm) {
	var res =  response.responseXML.getElementsByTagName("response");
	var count = handleEmailResponse(response, currentForm);
	/*
	if (count == 0) {
		displayHeader(getMessage('There is no email registered for this user'), currentForm);
	} else {
		displayHeader(getMessage('Available emails'), currentForm);
	}
	*/
}

// Get the list of emails and add to the email list
function handleEmailResponse(response, currentForm) {
	var containsUserProfileEmail = false;
	var emails = response.responseXML.getElementsByTagName("email");
	if (emails.length > 0) {
		// If the table already exists, dont add again
		var verificationId = currentForm.elements['verification_id'].value;
		var eTable = document.getElementById('email_address_table_' + verificationId);
		if (eTable == null) {
			eTable = addEmailHeaderRow(currentForm);
		}
		var eBody = document.createElement('tbody');
		eTable.appendChild(eBody);
		
		for (var i = 0; i != emails.length; i++) {
			addEmailsDetailRow(emails[i], currentForm, eBody);
			
			if (emails[i].getAttribute('isUserProfileEmail') === 'true')
				containsUserProfileEmail = true;
		}
	}
	
	// If the user is already enrolled with their user profile email, hide the shortcut button (or show it if they're not)
	var addProfEmailBtn = $j('#add_profile_email_btn');
	if (containsUserProfileEmail)
		addProfEmailBtn.hide();
	else
		addProfEmailBtn.show();	
	
	return emails.length;
}

// add email detail row - makes the checkbox, email name and the email verification fields
function addEmailHeaderRow(currentForm) {
	var verificationId = currentForm.elements['verification_id'].value;
	var emailDivElem = document.getElementById('email_addresses_' + verificationId);
	
	// Create a table
	var emailTableRow = document.createElement('table');
	emailTableRow.id = 'email_address_table_' + verificationId;
	var eHead = document.createElement('thead');
	emailTableRow.appendChild(eHead);
	
	// Create a table header
	var eTableHeaderRow = document.createElement('tr');
	eTableHeaderRow.id = 'email_address_table_header_' + verificationId;
	eHead.appendChild(eTableHeaderRow);
	
	// Create the table header th tags
	// Column: Authorized
	var ethCellUsed = document.createElement('th');
	ethCellUsed.id = 'email_address_table_th_used_' + verificationId;
	setText(ethCellUsed, getMessage('Authorized'));
	eTableHeaderRow.appendChild(ethCellUsed);
	
	// Column: Name
	var ethCellName = document.createElement('th');
	ethCellName.id = 'email_address_table_th_name_' + verificationId;
	setText(ethCellName, getMessage('Name'));
	ethCellName.align='left';
	eTableHeaderRow.appendChild(ethCellName);
	
	// Column: Email
	var ethEmailAddr = document.createElement('th');
	ethEmailAddr.id = 'email_address_table_th_email_' + verificationId;
	setText(ethEmailAddr, getMessage('Email'));
	ethEmailAddr.align = 'left';
	eTableHeaderRow.appendChild(ethEmailAddr);
	
	// Column: Verified
	var ethCellVerified = document.createElement('th');
	ethCellVerified.id = 'email_address_table_th_verified_' + verificationId;
	setText(ethCellVerified, getMessage('Status'));
	eTableHeaderRow.appendChild(ethCellVerified);
	
	emailDivElem.appendChild(emailTableRow);
	return emailTableRow;
}

// add email detail row - makes the checkbox, email name and the email verification fields
function addEmailsDetailRow(email, currentForm, body) {
	var emailId = email.getAttribute("sys_id");
	var verificationId = currentForm.elements['verification_id'].value;
	var devicesElem = document.getElementById('email_address_table_' + verificationId);
	var emailVerified = email.getAttribute("isVerified") === 'true';
		
	// Create a table row
	var emailRow = document.createElement('tr');
	body.appendChild(emailRow);
	
	// Create a checkbox cell
	var checkboxCell = document.createElement('td');
	checkboxCell.align = 'center';
	emailRow.appendChild(checkboxCell);
	
    var cbSpan = document.createElement('span');
	cbSpan.className ="input-group-checkbox";
	checkboxCell.appendChild(cbSpan);
	
	// Create the checkbox
	var checkbox = document.createElement('input');
	checkbox.className = 'checkbox device'; // "device" is used by the tests
	checkbox.type = 'checkbox';
	// Displayed to user in the message when selecting/unselecting an email
	checkbox.name = email.getAttribute("name") + ' (' + email.getAttribute("email") + ')';
	checkbox.id = 'email_address_checkbox_' + emailId;
	checkbox.value = emailId; // The value is emailId so we can use it later in updateSubscriptionToEmail
	checkbox.onclick = function() { updateSubscriptionToEmail(this); };
	checkbox.disabled = !emailVerified;
	checkbox.checked = email.getAttribute("isSubscribed").toLowerCase() === 'true' && emailVerified;
	
	cbSpan.appendChild(checkbox);
	
	var checkboxLabel = document.createElement('label');
	checkboxLabel.className = "checkbox-label";
	checkboxLabel.setAttribute('for', checkbox.id);	
	cbSpan.appendChild(checkboxLabel);
	
	// Email label cell
	var emailAddrLabelCell = document.createElement('td');
	emailAddrLabelCell.className = 'pwd-enroll-email-name-cell';
	emailRow.appendChild(emailAddrLabelCell);
	
	// Email label
	var emailAddrLabel = document.createElement("span");
	emailAddrLabel.id = 'email_address_name_' + emailId;
	setText(emailAddrLabel, email.getAttribute("name"));
	emailAddrLabelCell.appendChild(emailAddrLabel);
	
	//  Email Address
	var emailLabelCell = document.createElement('td');
	emailLabelCell.className = 'pwd-enroll-email';
	emailRow.appendChild(emailLabelCell);
	var emailLabel = document.createElement("span");
	emailLabel.id = 'email_address_' + emailId;
	setText(emailLabel, email.getAttribute("email"));
	emailLabelCell.appendChild(emailLabel);
	
    var verifyButtonCell = document.createElement('td');
    emailRow.appendChild(verifyButtonCell);
	
	// if email is not verified, add the Verify button, code message, code textbox and ok button
	// Verify button cell
    if (emailVerified) {
		var verifyButton = document.createElement("button");
		verifyButton.id = 'email_address_verify_button_' + emailId;
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
		resetButton.setAttribute('data-target', '#verify_email_address_dlg');
		resetButton.setAttribute('data-toggle', 'modal');
		resetButton.className = "btn btn-primary";
		resetButton.id = "email_address_verify_button_" + emailId;
		resetButton.style.whiteSpace = "nowrap";
		resetButton.style.width = "70px";
		resetButton.innerHTML = getMessage('Verify');
		resetButton.onclick = function() {
			initVerifyEmailDialog(this);
			return false;
		};
	}
}

// Add a new email and subscription
function  addNewEmail(elem) {
	var currentForm = elem.form;
	var verId = currentForm.elements['verification_id'].value;
	var gMsg = new GwtMessage();
	
	// email name
	var name = getFieldValue(currentForm, 'sysparm_email_address_name_' + verId, 
			'email_name_form_group_' + verId, 'retype_email_address_name_' + verId, gMsg.getMessage("You must specify a name to associate with the email address"));  // I18N_OK 08-04-16
	if (name == "")
		return false;
	
	//email address
	var emailAddr = getFieldValue(currentForm, 'sysparm_email_addr_' + verId, 'email_form_group_' + verId, 'retype_email_addr_' + verId, gMsg.getMessage("You must specify an email address"));
	var validEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(emailAddr);
	
	if(!validEmail){
		var formGroupId = 'email_form_group_' + verId;
		var helpBlockId = 'retype_email_addr_' + verId;
		displayFieldError(helpBlockId, getMessage("Invalid Email address"), formGroupId);
		return false;
	}

	var ga = new GlideAjax('PwdAjaxEnrollEmail');
	ga.addParam('sysparm_name', 'addEmail');
	ga.addParam('sysparm_user_id', getUserID());
	ga.addParam('sysparm_email_addr', emailAddr);
	ga.addParam('sysparm_email_name', name);
	
	ga.getXML(handleAddEmailResponse, null, currentForm);
	
	return true;
}

function addProfileEmail(elem) {
	var ga = new GlideAjax('PwdAjaxEnrollEmail');
	ga.addParam('sysparm_name', 'addProfileEmail');
	ga.addParam('sysparm_user_id', getUserID());
	ga.getXML(handleAddEmailResponse, null, elem.form);
}

function getFieldValue(currentForm, fieldId, formGroupId, helpBlockId, message) {
	var ele = currentForm.elements[fieldId];
	ele.value = ele.value.trim();
	if (ele.value == "") {
		displayFieldError(helpBlockId, message, formGroupId);
	}
	return ele.value;
}


function handleAddEmailResponse(response, currentForm) {
	var verificationId = currentForm.elements['verification_id'].value;
	
	var res =  response.responseXML.getElementsByTagName("response");
	var status = res[0].getAttribute("status");
	var message = res[0].getAttribute("message");
	var value = res[0].getAttribute("value");
	
	clearAllEmails('email_addresses_' + verificationId);
	handleEmailResponse(response, currentForm);
	
	// if added clear up the input field. It's already added.
	if (status == 'success') {
		currentForm.elements['sysparm_email_addr_' + verificationId].value = '';
		currentForm.elements['sysparm_email_address_name_' + verificationId].value = '';

	}
	
	// the record info for newly added email addresses
	// displayMessage(message, currentForm);
	g_form.clearMessages();
	g_form.addInfoMessage(message);
}

// Update subscription of a email, represented by the checkbox.
function updateSubscriptionToEmail(box) {
	// if (!verifyAtleastOneEmailIsSubscribed(box, box.form))
	//	return;
	var ga = new GlideAjax('PwdAjaxEnrollEmail');
	ga.addParam('sysparm_name', 'updateEmailSubscription');
	ga.addParam('sysparm_user_id', getUserID());
	ga.addParam('sysparm_device_id', box.value);
	ga.addParam('sysparm_email_name', box.name);
	ga.addParam('sysparm_subscribed', box.checked);
	
	ga.getXML(handleUpdateEmailSubscriptionResponse, null, box.form);
}

function handleUpdateEmailSubscriptionResponse(response, currentForm) {
	handleEmailResponseAndShowMessage(response, currentForm);
	handleIfNoDeviceSubscribed(response, currentForm);
}

// Verify if there is at least one email selected
// If not, give a message. Do not allow the last one to be unselected.
// Returns if atleast one email is selected or not
function verifyAtleastOneEmailIsSubscribed(box, currentForm) {
	var verificationId = currentForm.elements['verification_id'].value;
	var divElem = document.getElementById('email_addresses_' + verificationId);
	var checkboxElems = divElem.getElementsByTagName('input');
	var foundCheckedEmail = false;
	
	// if at least one is checked, we are good.
	for (var i = 0; i != checkboxElems.length; i++) {
		if (checkboxElems[i].type != 'checkbox') {
			continue;
		}
		if (checkboxElems[i].checked) {
			foundCheckedEmail = true;
			break;
		}
	}
	if (foundCheckedEmail) {
		// displayMessage("", currentForm);
		return true;
	} else {
		// displayMessage(getMessage('You must subscribe to at least one email'), currentForm);
		if (box != null)
			box.checked = true;
		return false;
	}
}
// PRB1160019 - Don't allow deletion of email addresses due to side effects involving the cmn_notif_device table which is
// outside of our "jurisdiction"
//function deleteEmailAddress(deleteItem, currentForm) {
//	var itemId = deleteItem.id;
//	// Extract emailId from the buttonId. ButtonId is email_address_verify_button_ + emailId
//	var emailId = itemId.replace('email_delete_link_', '');
//	var verificationId = currentForm.elements['verification_id'].value;
//	var box  = currentForm.elements['email_address_checkbox_' + emailId];
//	var emailName = document.getElementById('email_address_name_' + emailId).innerHTML;
//
//	/*
//	// make sure we are not deleting the last checked email.
//	var enrolled = box.checked;
//	box.checked = false;
//	if (enrolled && !verifyAtleastOneEmailIsSubscribed(box, currentForm)) {
//		box.checked = enrolled;
//		return;
//	}
//	*/
//
//	var dd = new GlideModal("glide_confirm_basic");
//	dd.setTitle(new GwtMessage().getMessage('Confirm deletion for email: {0}', emailName));
//	dd.setPreference('onPromptComplete', function() {
//		// clean up first
//		clearAllEmails('email_addresses_' + verificationId);
//		// get the result back
//		var ga = new GlideAjax('PwdAjaxEnrollEmail');
//		ga.addParam('sysparm_name', 'deleteEmail');
//		ga.addParam('sysparm_device_id', emailId);
//		ga.addParam('sysparm_user_id', getUserID());
//		ga.getXML(handleDeleteEmailResponse, null, currentForm);
//	});
//	dd.setPreference('onPromptCancel', function() {});
//	dd.render();
//
//}
//
//function handleDeleteEmailResponse(response, currentForm) {
//	handleEmailResponseAndShowMessage(response, currentForm);
//	handleEmailResponse(response, currentForm);
//	handleIfNoDeviceSubscribed(response, currentForm);
//}


function resendEmailEnrollmentCode(elem) {
	var currentForm = elem.form;
	var verificationId = currentForm.elements['verification_id'].value;
	var emailId = gel('verify_email_address_id_' + verificationId).value;
	sendEnrollmentCodeToEmail(currentForm, verificationId, emailId);
}

function initVerifyEmailDialog(elem) {
	var currentForm = elem.form;
	var verificationId = currentForm.elements['verification_id'].value;
	var buttonId = elem.id;
	// Extract emailId from the buttonId. ButtonId is email_address_verify_button + emailId
	var emailId = buttonId.replace('email_address_verify_button_', '');

	var name     = $j('#email_address_name_' + emailId).text();     // Use jquery to better handle both chrome and Firefox
	var email    = $j('#email_address_' + emailId).text();   // Use jquery to better handle both chrome and Firefox
	
	currentForm.elements['verify_email_address_id_' + verificationId].value = emailId;
	currentForm.elements['verify_email_address_name_' + verificationId].value = name;
	currentForm.elements['verify_email_address_email_' + verificationId].value = email;
	
	currentForm.elements['verify_dialog_email_code_' + verificationId].value = '';

	sendEnrollmentCodeToEmail(currentForm, verificationId, emailId);
}


// Send a code to the email for the purpose of verifying it
function sendEnrollmentCodeToEmail(currentForm, verificationId, emailId) {
	gel('verify_email_dialog_error_msg_' + verificationId).innerHTML = '';

	var ga = new GlideAjax('PwdAjaxEmailProcessor');
	ga.addParam('sysparm_name', 'generateEnrollmentCode');
	ga.addParam('sysparm_verification_id', verificationId);
	ga.addParam('sysparm_device_id', emailId);
	ga.getXML(handledEmailEnrollmentCodeResponse, null, currentForm);
}

// after the enrollment code is sent to the Email, show success msg
function handledEmailEnrollmentCodeResponse(response, currentForm) {
	var verificationId = currentForm.elements['verification_id'].value;
	
	var res =  response.responseXML.getElementsByTagName("response");
	var message = res[0].getAttribute("message");
	var status = res[0].getAttribute("status");
	var emailId = res[0].getAttribute("value");

    if (message)
        gel('verify_email_dialog_error_msg_' + verificationId).innerHTML = message;
}

// Verify if the code entered matches the code sent
function verifyEmailAddressWithEnrollmentCode(elem) {
	var currentForm = elem.form;
	var verificationId = currentForm.elements['verification_id'].value;
	
	var emailId = currentForm.elements['verify_email_address_id_' + verificationId].value;

	var ga = new GlideAjax('PwdAjaxEmailProcessor');
	ga.addParam('sysparm_name', 'verifyEnrollmentCode');
	
	var code = currentForm.elements['verify_dialog_email_code_' + verificationId].value.trim();
	currentForm.elements['verify_dialog_email_code_' + verificationId].value = code;
	
	if (code == "") {
		displayFieldError('verify_email_dialog_error_msg_' + verificationId, 
						 new GwtMessage().getMessage('Code cannot be empty'),
						 'verify_dialog_email_code_form_group_' + verificationId);
		return false;
	}
	
	ga.addParam('sysparm_device_id', emailId);
	ga.addParam('sysparm_verification_id', verificationId);
	ga.addParam('sysparm_email_code', code);
	ga.addParam('sysparm_user_id', getUserID());
	
	ga.getXML(handledEmailEnrollmentVerifyResponse, null, currentForm);
	
	return true;
}

// after the enrollment code is verified, update UI to remove verification related fields
function handledEmailEnrollmentVerifyResponse(response, currentForm) {
	handleEmailResponseAndShowMessage(response, currentForm);

	var res =  response.responseXML.getElementsByTagName("response");
	var status = res[0].getAttribute("status");
	if (status == 'fail') {
		return;
	}
	
	var emailId = res[0].getAttribute("value");
	
	// Update the email verification status, enable the checkbox and also select it
	currentForm.elements['email_address_checkbox_' + emailId].disabled = false;
	currentForm.elements['email_address_checkbox_' + emailId].checked = true;
	
	currentForm.elements['email_address_verify_button_' + emailId].innerHTML = getMessage('Verified');  // I18N_OK 08-04-16
	currentForm.elements['email_address_verify_button_' + emailId].disabled = true;
	
	getEmails(currentForm);
}

function handleEmailResponseAndShowMessage(response, currentForm) {
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
	if (status == "success" && !verifyAtleastOneEmailIsSubscribed(null, currentForm))
		g_form.addErrorMessage(getMessage("You must authorize at least one email"));
}

function setText(elem, txt){
	var node = document.createTextNode(txt);
	elem.appendChild(node);
}

function openAddEmailDialog(elem) {
	clearEmailAddressForm(elem);
}

function clearEmailAddressForm(elem) {
	var currentForm = elem.form;
	var verificationId = currentForm.elements['verification_id'].value;
	
	var fieldId = 'sysparm_email_address_name_' + verificationId;
	var formGroupId = 'email_name_form_group_' + verificationId;
	var errorId = 'retype_email_address_name_' + verificationId;
	currentForm.elements[fieldId].value = '';
	clearEmailFieldError(errorId, formGroupId);
		
	fieldId = 'sysparm_email_addr_' + verificationId;
	formGroupId = 'email_form_group_' + verificationId;
	errorId = 'retype_email_addr_' + verificationId;
	currentForm.elements[fieldId].value = '';
	clearEmailFieldError(errorId, formGroupId);

}

function displayFieldError(fieldId, message, formGroupId) {
	var fieldElem = document.getElementById(fieldId);
	if (fieldElem != undefined) {
		fieldElem.innerHTML = message;

        $j("[aria-describedby='" + fieldId + "']").attr('aria-invalid', 'true');
	}
	$j('#' + formGroupId).addClass("has-error");
}

function clearEmailFieldError(fieldId, formGroupId) {
	var fieldElem = document.getElementById(fieldId);
	if (fieldElem != undefined) {
		fieldElem.innerHTML = '';

        $j("[aria-describedby='" + fieldId + "']").attr('aria-invalid', 'false');
	}
	$j('#' + formGroupId).removeClass("has-error");
}
