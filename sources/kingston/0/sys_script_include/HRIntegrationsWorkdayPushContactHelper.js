var HRIntegrationsWorkdayPushContactHelper = Class.create();
HRIntegrationsWorkdayPushContactHelper.prototype = {
    initialize: function() {
    },
	
	getISOCountryCode: function (country) {
		var isoCountry = new GlideRecord('core_country');
		if (isoCountry.get(country)){
			if(!gs.nil(isoCountry.getValue('iso3166_3')))
				country = isoCountry.getValue("iso3166_3");
			else
				country = isoCountry.getValue("name");
		}
		return country;
	},
	
	createEmailTag: function (communication_type, emailAddress) {
		var envelope = new SOAPDocument2();
		var email_data = envelope.createBodyElement('bsvc:Email_Address_Data');
		//var emailAddress = communication_type == 'work'?"${work_email}":"${personal_email}";
		var email = envelope.createElement(email_data,"bsvc:Email_Address", emailAddress);
		//Usage Data
		this.createUsageTag(envelope, email_data, communication_type);
		var envBody = envelope.getBody().toString();
		var envTag = "<SOAP-ENV:Body>";
		var start = envBody.indexOf(envTag);
		var end = envBody.indexOf("</SOAP-ENV:Body>");
		var emailDataEnvelope = envBody.substring(start+envTag.length, end);
		emailDataEnvelope = emailDataEnvelope.replace(/"/g, "'");
		gs.info("Email Data Envelope " + emailDataEnvelope);
		return emailDataEnvelope;
	},

	createPhoneData : function (communication_type, device_type, phoneNumber, fieldName, profile) {
		
		var country = this.getISOCountryCode(profile.getValue("country"));
		if(gs.nil(country))
			return null;
		
		var envelope = new SOAPDocument2();
		var phone_data = envelope.createBodyElement('bsvc:Phone_Data');
		
		var isPrimary = false;
		if (communication_type == "home")
			isPrimary = this.getPrimaryHomePhoneDevice(profile) == fieldName;
		
		if (communication_type == "work")
			isPrimary = this.getPrimaryWorkPhoneDevice(profile) == fieldName;
		
		envelope.createElement(phone_data,"bsvc:Country_ISO_Code", country);
		
		var formattedNumber = this.getPhoneComponents(phoneNumber);
		if (formattedNumber['intl_code'])
			envelope.createElement(phone_data,'bsvc:International_Phone_Code', formattedNumber['intl_code']);
		if (formattedNumber['area_code'])
			envelope.createElement(phone_data,"bsvc:Area_Code", formattedNumber['area_code']);
		if (formattedNumber['phone_number'])
			envelope.createElement(phone_data,"bsvc:Phone_Number", formattedNumber['phone_number']);
		
		var device_type_ref_id = device_type=='mobile'?'1063.1':'1063.5';
		
		var device_type_ref = envelope.createElement(phone_data,'bsvc:Phone_Device_Type_Reference');
		this.createIdTag(envelope, device_type_ref, 'Phone_Device_Type_ID', device_type_ref_id);
		
		//Usage Data
		this.createUsageTag(envelope, phone_data, communication_type, isPrimary);
		var envBody = envelope.getBody().toString();
		var envTag = "<SOAP-ENV:Body>";
		var start = envBody.indexOf(envTag);
		var end = envBody.indexOf("</SOAP-ENV:Body>");
		var phoneDataEnvelope = envBody.substring(start+envTag.length, end);
		phoneDataEnvelope = phoneDataEnvelope.replace(/"/g, "'");
		gs.info("Phone Data Envelope " + phoneDataEnvelope);
		return phoneDataEnvelope;
	},
	
	getPhoneComponents : function (phoneNumber, updateSoapMsg, fieldName) {
		
		var intl_code = fieldName+'_intl_code';
		var area_code = fieldName+'_area_code';
		var phone_number = fieldName+'_phone_number';
		
		var format = (phoneNumber.split(/[ ]+/));
		var formattedNumber = [];
		for (var i=0;i<format.length;i++) {
			var part = (format[i]);
			if (part.indexOf('+')==0)
				formattedNumber['intl_code'] = part.replace('+','');
				else if (part.indexOf('(')==0)
				formattedNumber['area_code'] = part.replace(/[()]/g, '');
				else
				formattedNumber['phone_number'] = part.replace(/[-]/g, '');
		}
		return formattedNumber;
	},
	
	getPrimaryHomePhoneDevice : function (profile) {
		if (profile.getValue('mobile_phone') && profile.getValue('home_phone'))
			return 'home_phone';
		else
			return profile.getValue('mobile_phone') ? 'mobile_phone' : 'home_phone';
	},
	
	getPrimaryWorkPhoneDevice : function (profile) {
		if (profile.work_mobile && profile.work_phone)
			return 'work_phone';
		else
			return profile.work_mobile ? 'work_mobile' : 'work_phone';
	},
	
	createUsageTag : function (envelope, parent, communication_type, isPrimary) {
		var usage_data = envelope.createElement(parent, "bsvc:Usage_Data");
		var isPublic = (communication_type == 'work'?'1':'0');
		envelope.setAttribute(usage_data, 'bsvc:Public', isPublic);
		var type_data = envelope.createElement(usage_data,"bsvc:Type_Data");
		if (isPrimary || isPrimary == null)
			envelope.setAttribute(type_data, 'bsvc:Primary', "1");
		else
			envelope.setAttribute(type_data, 'bsvc:Primary', "0");
		var type_reference = envelope.createElement(type_data,"bsvc:Type_Reference");
		envelope.setAttribute(type_reference, 'bsvc:Descriptor', communication_type);
		this.createIdTag(envelope, type_reference, "Communication_Usage_Type_ID", communication_type);
	},
	
	createIdTag: function (envelope, parent, idType, id) {
		var idTag = envelope.createElement(parent, "bsvc:ID", id);
		envelope.setAttribute(idTag, 'bsvc:type', idType);
	},
	
    type: 'HRIntegrationsWorkdayPushContactHelper'
};