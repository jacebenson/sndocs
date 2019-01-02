function onLoad() {
	function setHints(elementName, labelHint, mandatoryHint) {
		var id = ['element', 'cmn_notif_device', elementName].join('.'),
			wrapper = document.getElementById(id),
			label,
			requiredMarker;

		if (wrapper) {
			label = wrapper.getElementsByClassName('label-text');
			requiredMarker = wrapper.getElementsByClassName('required-marker');

			if (label[0] && labelHint) {
				label[0].setAttribute('title', labelHint);
			}

			if (requiredMarker[0] && mandatoryHint) {
				requiredMarker[0].setAttribute('title', mandatoryHint);
				requiredMarker[0].setAttribute('aria-label', mandatoryHint);
			}
		}
	}

	setHints('name', getMessage('The display name of the channel'), getMessage('Mandatory'));
	setHints('type', getMessage('The type of channel'), getMessage('Mandatory'));
	setHints('email_address', getMessage('The email address where notifications will be sent'), getMessage('Mandatory'));
	setHints('push_app', getMessage('The push application where notifications will be sent'), getMessage('Mandatory'));
	setHints('phone_number', getMessage('The phone number where notifications will be sent'), getMessage('Mandatory'));
	setHints('service_provider', getMessage('The service provider of the phone'), getMessage('Mandatory'));
}