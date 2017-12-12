(function(sncStdChg) {

	var _MODIFY_RP_CR_LABEL = 'label_IO:b548bf8d9f6002002920bde8132e7039';
	var _NEW_RP_CR_LABEL = 'label_IO:9fb19f3b9fb002002920bde8132e70dd';

	//prepare a name , value array from encodedQuery
	function parseEncodedQuery(query) {
		if (query) {
			query = query.trim();
			var attributeList = query.split('^');
			var parsedAttributeNames = [];
			var parsedAttributeVals = [];
			for (var i = 0; attributeList && i < attributeList.length; i++) {
				var firstIndex = attributeList[i].indexOf('=');
				if (firstIndex > -1) {
					parsedAttributeNames.push(attributeList[i].substring(0, firstIndex));
					parsedAttributeVals.push(attributeList[i].substring(firstIndex + 1).trim());
				}
			}
			return {names: parsedAttributeNames, vals: parsedAttributeVals};
		}
		return;
	}
	function containsName(arr, what) {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i].name == what)
				return i;
		}
		return -1;
	}
	//function to check if restricted fields are set
	function checkRestrictedFields(q) {
		var attemptedSet = ' ';
		var unmodifiable = sncStdChg.unmodifiable;
		if (q && unmodifiable) {
			for (var i = 0; i < q.names.length; i++) {
				var f = q.names[i];
				var idx = containsName(unmodifiable, f);
				if (idx !== -1)
					attemptedSet = attemptedSet + unmodifiable[idx].label + ', ';
			}
		}
		if (attemptedSet !== ' ') {
			var msg = formatMessage(getMessage('The following "Change Request values" are not allowed to be set in a template:{0}'), attemptedSet.substring(0, attemptedSet.length - 2));
			alert(msg);
			return false;
		} else {
			return true;
		}
	}
	function isMandatoryFieldsSet(q) {
		var unfilledValues = ' ';
		var mandatory = sncStdChg.mandatory;
		if (mandatory) {
			for (var i = 0; i < mandatory.length; i++) {
				var m = mandatory[i];
				if (q) {
					var idx = q.names.indexOf(m.name);
					if (idx === -1 || q.vals[idx] === '')
						unfilledValues = unfilledValues + m.label + ', ';
				} else {
					unfilledValues = unfilledValues + m.label + ', ';
				}
			}
		}
		if (unfilledValues !== ' ') {
			var msg = formatMessage(getMessage('"Change Request values" have not been provided:{0}'), unfilledValues.substring(0, unfilledValues.length - 2));
			alert(msg);
			return false;
		} else {
			return true;
		}
	}
	function defaultTemplateValue() {
		//processFields is defined in std_chg_template_handler
		if(sncStdChg.orig_templ_values) {
			processFields(sncStdChg.orig_templ_values);
		} else {
			processFields(sncStdChg.default_values);
		}
	}
	function setRequiredMarkerForRP() {
		var label = gel(_MODIFY_RP_CR_LABEL) || gel(_NEW_RP_CR_LABEL);
		if(label && sncStdChg.mandatory && sncStdChg.mandatory.length>0) {
			label.className = label.className + ' is-required';
		}
	}
	function standardChangeHiddenVars() {
		g_form.setDisplay('variables.template_value', false);
		g_form.setDisplay('variables.state', false);
	}
	function progressFormSubmit(cartParam, finalEncodedQuery) {
		try {
			//this field is set in sample change macro
			if (sncSampleChangesPlaceHolder) {
				g_form.setValue('variables.change_requests', gel(sncSampleChangesPlaceHolder)
					.value);
			}
		} catch (e) {
			// This is needed as sample change is optional and macro is
			// not rendered in case of modify producer
			if (e instanceof ReferenceError) {
				; //noop
			}
		}
		g_form.setValue('variables.template_value', finalEncodedQuery);
		saveProducer(cartParam);
	}
	/* Used by submit actions in produce_button.xml */
	window.submitStdChgProposalInNew = function submitStdChgProposalInNew(cartParam) {
		var e = gel('submit_button_std_chg_new');
		if (hasClassName(e, 'disabled')) {
			return;
		}
		g_form.setValue('variables.state', '1');
		//interpretQuery is defined in std_chg_template_handler
		var finalEncodedQuery = interpretQuery();
		progressFormSubmit(cartParam,finalEncodedQuery);
	};
	window.submitStdChgProposal = function submitStdChgProposal(cartParam) {
		var e = gel('submit_button_std_chg_approval');
		if (hasClassName(e, 'disabled')) {
			return;
		}
		g_form.setValue('variables.state', '2');
		//interpretQuery is defined in std_chg_template_handler
		var finalEncodedQuery = interpretQuery();
		var q = parseEncodedQuery(finalEncodedQuery);
		if(isMandatoryFieldsSet(q) && checkRestrictedFields(q)){
			progressFormSubmit(cartParam, finalEncodedQuery);
		}
	};
	/* End used by submit actions in produce_button.xml */

	addRenderEvent(function() {
		standardChangeHiddenVars();
		setRequiredMarkerForRP();
		defaultTemplateValue();
	});

}(g_sncStdChg));