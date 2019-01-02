var hr_CaseUtils = Class.create();
hr_CaseUtils.prototype = {
      initialize : function(_case, _gs) {
	    if (!_case)
		    return;

	    this._case = _case;
	    this._gs = _gs || gs;

	    // Other object scripts have a reference here as they are used throughout
	    this.hrProfile = new hr_Profile(this._case.hr_profile, this._gs);

	    this._ignoreFields = {
	        'opened_for' : '',
	        'priority' : '',
	        'short_description' : '',
	        'description' : ''
	    };
		this._requiresUserOrProfileCreation = {
			'request_onboarding':''
		};  
    },

	populateCase : function(service, questions, source) {
		var hrServiceGr = new GlideRecord(hr.TABLE_SERVICE);
		hrServiceGr.get(service);
		if(hrServiceGr.isValid() && hrServiceGr.getValue('active')) {
			var serviceName = hrServiceGr.getValue('name');
			var serviceValue = hrServiceGr.getValue('value');

		    this._logDebug("Creating new HR Case record for service name: " + serviceName);

			this._setServiceFields(hrServiceGr);
			this._setGeneralFields(serviceValue, questions);
			this._setCommonFields(hrServiceGr, questions, source);

		}
	},

    /*
    * Updates the HR Service related fields into the Case.
	* Note: template kicked off when case updated (after this script runs)
	*
    * @param hrServiceGr The service glide record
    */
	_setServiceFields : function(hrServiceGr) {
		this._case.hr_service = hrServiceGr.getUniqueValue();
		this._case.topic_detail = hrServiceGr.topic_detail;
		this._case.topic_category = hrServiceGr.topic_detail.topic_category;
		this._case.template = hrServiceGr.template;
	},

    /*
    * Updates the general HR Case related objects like the InfoMessage
    *
    * @param producer Holds questions/answers (Is not a record producer glide record)
    * @param category The category of the case, also drives the template used in case
    */
	_setGeneralFields : function(serviceValue, questions) {
		var parameters = this._getParametersFromQuestions(questions);
		
		// Create user and profile for the subject person
		if (this._requiresUserOrProfileCreation.hasOwnProperty(serviceValue)){
			var subject_person_profile = this.hrProfile.createOrGetProfileFromParameters(parameters); // create subject person user and profile
			this._case.subject_person = subject_person_profile.user.sys_id;
		} 			
			
		// Retrieve the profile of the 'opened_for' user
		// a question might have been mapped to opened_for, in which case we grab from case
		if (!parameters['opened_for']) {
			if (this._case.opened_for)
				parameters['opened_for'] = this._case.opened_for;
			else
				parameters['opened_for'] = gs.getUserID();
			}
		
		//Set opened for profile
		this._grProfile = this.hrProfile.getProfileFromParameters(parameters);
	},
	
	/*
    * Set the common Case fields across all categories.
    * Note: this._case is the new Case
    */
	_setCommonFields : function(hrServiceGr, questions, source) {
		var logged_in = gs.getUserDisplayName();
		var serviceName = hrServiceGr.getValue('name');
		var serviceValue = hrServiceGr.getValue('value');
		this._case.contact_type = source;
		
		// a question might have been mapped to opened_for and we do not want to override
		if (!this._case.opened_for)
			this._case.opened_for = this._grProfile.user.sys_id;

		this._case.hr_profile = this._grProfile.sys_id;
		
		var openedForPriority = this._getPriority(this._grProfile.user,  this._case.template);
		var subjectPersonPriority = this._getPriority(this._case.subject_person,  this._case.template);
		var highestPriority =  openedForPriority < subjectPersonPriority ? openedForPriority : subjectPersonPriority;
		this._case.priority = highestPriority;
		this._case.payload = new global.JSON().encode(this._getParametersFromQuestions(questions));
		this._case.comments = gs.getMessage('User {0} has initiated a {1} request', [ logged_in, serviceName ]);
		this._case.short_description = gs.getMessage("{0} case for {1}", [ serviceName, this._grProfile.user.name ]);
		this._case.description = this._getDescriptionFromAnswers(questions, serviceValue);
	},

	/*
    * Builds a description field with changed or new variables.  Has to determine the original value and
    * display value for each of the fields coming in.
    */
    _getDescriptionFromAnswers : function(questions, hrServiceValue) {
	    // Convert object to array so we can sort it by the order field - this allows
	    // us to replicate the order of the items on the Record Producer
	    var questionParameters = [];
	    for (var q in questions)
		    questionParameters.push(questions[q]);

	    // Sort the answers by order
	    questionParameters.sort(function(a, b) {
		    return (a.order - b.order);
	    });

	    var filledValues = '';
	    for (var key in questionParameters) {
			var question = questionParameters[key];

		    // Ignore the 'Opened for', 'priority' fields
		    if (!this._ignoreFields.hasOwnProperty(question.name) && question.question.trim() != "") {
			    // Checking that the answer does not match the fields original value
			    var originalDisplayValue = this.hrProfile.getDisplayValue(this._grProfile, question.name, true);
			    var originalValue = this.hrProfile.getDisplayValue(this._grProfile, question.name, false);

				/*
			    gs.info('>>>> >>>> >>>> hr_Case: key: ' + key + ', val: ' + originalValue +
			    	', dval: ' + originalDisplayValue + ', answer: ' + question.answer +
			    	', orig: ' + originalValue);
				*/

			    if ((question.answer != originalValue && question.answer != originalDisplayValue) || this._requiresUserOrProfileCreation.hasOwnProperty(hrServiceValue)) {
					
				    // Produces a string giving 'Field: newValue (original value: oldValue)'
				    filledValues += question.question + ': ' + question.answerDisplayValue;

					if((originalValue || originalDisplayValue) && !this._requiresUserOrProfileCreation.hasOwnProperty(hrServiceValue))
					    filledValues += ' (' + gs.getMessage('original value: ') + originalDisplayValue + ')';

				    filledValues += '\n';
			    }
		    }
	    }

		var additionalDescription = '';
	    if (filledValues) {
			var spacer = (gs.nil(this._case.description)) ? '': '\n\n' ;
			additionalDescription = spacer + gs.getMessage('The following fields have been provided:') + '\n' + filledValues;
		}

		return this._case.description + additionalDescription;
    },


	getQuestion : function(question, variableName, answer, fieldRaw, variableOrder, displayValue) {
		return {
			question : question+"",
			name : variableName+"",
			answer : answer+"",
			raw : fieldRaw+"",
			order : variableOrder+"",
			answerDisplayValue : displayValue+""
		};
	},

	/*
    * Retrieves all the variables in question form and values from the record
    * producer Returns a map of the questions and values
    */
    _getProducerQuestions : function(producer) {
	    var questions = {};
	    var parameters = {};

	    for ( var field in producer) {
		    if (field.match(/^IO/)) {
			    var variable = new GlideRecord("item_option_new");
			    if (variable.get(field.substring(2))) {
				    var question = variable.question_text;
				    var answer = this._getDisplayValue(variable, producer[field]);
				    var displayValue = this._getDisplayValue(variable, producer[field], producer[field].getDisplayValue());

				    /*
				    gs.print('>>>> >>>> >>>> hr_Case: _getProducerQuestions: question=' + question +
				    	', answer: ' + answer + ', default: ' +  producer[field]);
				    */

				    questions[question + ""] = {
				        question : question + "",
				        name : variable.name + "",
				        answer : answer + "",
				        raw : producer[field] + "",
				        order : variable.order + "",
				        answerDisplayValue : displayValue + ""
				    };
			    }
		    }
	    }

	    return questions;
    },

    /*
    * Simplify the complex question object into a simpler object
    */
    _getParametersFromQuestions : function(questions) {
	    var parameters = {};

	    for ( var question in questions) {
		    parameters[questions[question].name] = questions[question].raw;
	    }

	    return parameters;
    },


    _getPriority : function(user, templateId) {
	    if (user.vip == true) {
		    var defaultPriority = new hr_CaseAjax().getDefaultVIPPriority();
		    if (defaultPriority)
			    return defaultPriority;
		    else
			    return '2'; // high
	    } else {
		    var result = this._getTemplateProperty(templateId, 'priority');
		    if (!gs.nil(result))
			    return result;
		    else
			    return '4'; // low
	    }
    },

	_getTemplateProperty : function(templateSysId, field) {
	    return new sn_hr_core.hr_TemplateUtils()._getTemplateProperty(templateSysId, field);
    },

	/*
    * Convenience method to prevent the code becoming unreadable from the useful debug statements
    */
    _logDebug : function(str) {
	    if (gs.isDebugging())
		    gs.debug(gs.getMessage(str));
    },
	
	caseLink: function(caseGr) { 
		if (!caseGr || !caseGr.getUniqueValue()) 
			return;
		var sysId = caseGr.getUniqueValue();
		var tableName = caseGr.sys_class_name;
		var number = caseGr.number;
		var caseUrl = '<a href="/nav_to.do?uri=/' + tableName + '.do' + '?sys_id=' + sysId + '" target="_blank">' + number + '</a>';
		return caseUrl;
	},
	
    type: 'hr_CaseUtils'
};