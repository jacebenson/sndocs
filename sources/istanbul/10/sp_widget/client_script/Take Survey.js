function($http, $scope, i18n, nowAttachmentHandler, $timeout, $location) {
	// widget controller
	var c = this;
	var searchObject = $location.search();
	c.isPublic = ('id' in searchObject) && searchObject['id'].indexOf('public_survey') == 0;
	c.state = -1;

	c.startSurvey = function() {
		c.state = 0;
	};

	c.redirect = function(target) {
		window.location = target;
	};

	// Mark all categories as non collapsed
	if (!!c.data.categories && !!c.data.categories.idList && !!c.data.categories.idList.length)
		c.data.categories.idList.forEach(function(id){
			c.data.categories.idMap[id].collapsed = false;
		});

	c.setupAttachmentHandler = function(field){
		if (field.attachmentHandler)
			return;

		field.attachmentHandler = new nowAttachmentHandler(attachSuccess, appendError);

		function attachSuccess(attachments, action) {
			field.attachments = attachments;
		}

		function appendError(error) {
			c.showInlineErrorMessage(error);
		}

		$timeout(function() {
			field.attachmentHandler.setParams('asmt_assessment_instance_question', field.sys_id);
			field.attachmentHandler.getAttachmentList();
		})
	}

	c.isDependencySatisfied = function(field) {
		if (field.type == 'template') {
			var group = c.data.templateGroups[field.templateGroup];
			return group && group.questions && group.questions.reduce(function(x, y) {return x || c.isDependencySatisfiedHelper(c.data.questions.idMap[y])}, false);
		}

		return c.isDependencySatisfiedHelper(field);
	};

	c.isDependencySatisfiedHelper = function(field) {
		if (!field.depends_on)
			return true;

		var retVal = false;
		var dependencyId = c.data.questions.metricMap[field.depends_on];
		var dependency = c.data.questions.idMap[dependencyId];

		switch (dependency.type) {
			case 'scale':
			case 'choice':
			case 'template':
			case 'imagescale':
			case 'numericscale':
				var displayedWhen = (dependency.type != 'template') ? field.displayed_when.split(',') : field.displayed_when_template.split(',');
				var choices = (dependency.type == 'template') ? dependency.template.choices : dependency.choices;
				var selectedChoice = choices.filter(function(choice){return dependency.value == choice.value})[0];

				if (!selectedChoice)
					break;

				displayedWhen.forEach(function(sys_id) {
					if (selectedChoice.sys_id == sys_id)
						retVal = true;
				});
				break;
			case 'multiplecheckbox':
				var selectedChoices = dependency.choices.filter(function(choice) {return choice.selected}).map(function(c){return c.sys_id});
				var displayedWhen = field.displayed_when.split(',');

				displayedWhen.forEach(function(sys_id) {
					selectedChoices.forEach(function(choiceId) {
						if (choiceId == sys_id)
							retVal = true;
					});
				});
				break;
			case 'boolean':
				retVal = (dependency.value == field.displayed_when_yesno);
				break;
			case 'checkbox':
				var displayedWhen = (field.displayed_when_checkbox == '1') ? 'true' : 'false';
				retVal = (dependency.value == displayedWhen);
				break;
			default:
				break;
		}

		return retVal && c.isDependencySatisfied(dependency);;
	};

	c.showSignatureMessage = function() {
		c.showInlineErrorMessage(i18n.getMessage("You must complete the required signature"));
	};

	c.showMandatoryMessage = function() {
		c.showInlineErrorMessage(i18n.getMessage("All mandatory fields must be filled before submission"));
	};

	c.showInvalidResponseMessage = function() {
		c.showInlineErrorMessage(i18n.getMessage("Please fill all the fields with valid responses"));
	};

	c.hideInlineErrorMessage = function() {
		c.data.showInlineError = false;
	};

	c.isMandatoryFilled = function(field) {
		if (!field)
			return true;

		if (!!field.depends_on && field.depends_on.length == 32 && !c.isDependencySatisfied(field))
			return true;

		if (field.type == 'multiplecheckbox')
			return field.choices.map(function(choice) {return choice.selected}).reduce(function(x, y) {return x || y}, false);

		if (field.type == 'attachment')
			return field.attachments && field.attachments.length > 0;

		if (field.type == 'ranking')
			return field.choices.map(function(choice) {return !!choice.value && choice.value != '-1'}).reduce(function(x, y) {return x && y}, true);

		if (field.type == 'boolean')
			return field.value == 0 || field.value == 1 || field.value == -1;

		var fieldValue = (field.type != 'template') ? field.value : c.data.questions.idMap[field.sys_id].value;
		return fieldValue != null && fieldValue != undefined && fieldValue != '';
	};

	c.showInlineErrorMessage = function(msg) {
		if (typeof(msg) == 'string')
			c.data.inlineErrorMessage = [msg];
		else
			c.data.inlineErrorMessage = msg;

		c.data.showInlineError = true;
		$('section.page').scrollTop(0);
	};

	if (!c.data.questions || !c.data.questions.idList || !c.data.questions.idList.length) {
		c.showInlineErrorMessage(i18n.getMessage("Invalid Survey"));
		c.invalidSurvey = true;
		return;
	}

	if (c.data.state == 'complete' && !c.data.can_retake) {
		c.showInlineErrorMessage(i18n.getMessage("This survey has already been completed"));
		c.invalidSurvey = true;
	}

	c.updateQuestion = function(questionId, formdata) {
		var question = c.data.questions.idMap[questionId];
		if (!c.isDependencySatisfied(question)) {
			// Clear out any selected choices
			if (question.type != 'multiplecheckbox' &&  question.type != 'ranking' && question.type != 'attachment' )
				formdata[question.name] = '';

			else if (question.type == 'attachment') {
				if (!!question.attachments)
					question.attachments.forEach(function(attachment) {
						question.attachmentHandler.deleteAttachment(attachment);
					});
			}

			else {
				var prefix = question.type == 'multiplecheckbox'?'ASMTDEFINITION:':'ASMTDEFINITIONRANK:';
				question.choices.map(function(choice) {
					var key = prefix + choice.sys_id + '_' + question.metric;
					if(question.type == 'multiplecheckbox')
						formdata[key] = '';
					else
						formdata[key] = '';
				});
			}

			return;
		}

		if (question.type != 'multiplecheckbox' &&  question.type != 'ranking' )
			formdata[question.name] = question.value;
		else {
			var prefix = question.type == 'multiplecheckbox'?'ASMTDEFINITION:':'ASMTDEFINITIONRANK:';
			question.choices.map(function(choice) {
				var key = prefix + choice.sys_id + '_' + question.metric;
				if(question.type == 'multiplecheckbox')
					formdata[key] = (choice.selected || choice.selected == 'true') ? true : '';
				else
					formdata[key] = choice.value;
			});
		}
	};

	c.submitAjax = function(formdata) {
		$http({
			method: 'POST',
			url: '/sp_survey.do',
			data: formdata,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
			}
		})
		.success(successHandler);

		function successHandler(responseData) {
			if (responseData.success && (responseData.success || responseData.success == 'true')) {
				c.data.conclusion = (c.data.conclusion && c.data.conclusion.length) ? c.data.conclusion : i18n.getMessage("Your responses have been submitted, thanks for taking the survey!");

				if (formdata.sysparm_action == 'submit' || formdata.updateSuccessMessage)
					c.data.successMessage = (formdata.sysparm_action == 'submit') ? c.data.conclusion :
												(i18n.getMessage("Your responses have been saved. You can complete this survey before:") + c.data.instanceDuedate);
			} else {
				c.showInlineErrorMessage(i18n.getMessage("Something went wrong. Please try again later."));
				c.invalidSurvey = true;
			}

			c.data.showMessage = true;
		}
	};

	c.getPercentAnswered = function() {
		var totalCount = 0;
		var totalAnswered = 0;
		c.data.questions.idList.forEach(function(qid) {
			var question = c.data.questions.idMap[qid];
			if (c.isDependencySatisfied(question)) {
				totalCount++;
				if (question.type == 'multiplecheckbox' && question.choices.reduce(function(x, y) {return x || y.selected}, false)) {
					totalAnswered++;
				}
				else if (question.type == 'ranking' && question.choices.reduce(function(x, y){return x && !!y.value}, true)) {
					totalAnswered++;
				}
				else if (!!question.value) {
					totalAnswered++;
				}
			}
		});

		return (totalAnswered * 100.0) / totalCount;
	};

	c.showSignatureAuthModal = function() {
		c.signAuthFailure = false;
		var modal = jQuery('#sign-auth-modal');
		var left = (window.innerWidth - parseInt(modal.css('width'))) / 2;
		left = left ? (left + 'px') : '25%';
		modal.css('display', 'block').css('left', left);
	};

	c.hideSignatureAuthModal = function() {
		if ($scope.c.data.signature.validationCallback && c.signAuthFailure) {
			$scope.c.data.signature.validationCallback(false);
		}
		jQuery('#sign-auth-modal').css('display', 'none');
	};

	c.checkLogin = function() {
		c.signAuthFailure = false;
		$http({
			method: 'POST',
			url: '/sp_survey.do',
			data: {
				sysparm_request_type: 'verify_signature',
				sysparm_user: jQuery('#sign-auth-username').val(),
				sysparm_password: jQuery('#sign-auth-password').val()
			}
		}).then(function (response) {
			if (response.data == 'true') {
				c.hideSignatureAuthModal();
				$scope.c.data.signature.validated = true;
				if ($scope.c.data.signature.validationCallback) {
					$scope.c.data.signature.validationCallback(true);
					$scope.c.data.signature.validationCallback = null;
				}
				return;
			}
			c.signAuthFailure = true;
			return false;
		});
	};

}