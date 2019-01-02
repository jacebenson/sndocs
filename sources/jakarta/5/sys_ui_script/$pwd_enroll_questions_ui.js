/**
 * Onload function for pwd_enroll_question_ui macro.
 * @param currForm
 */
function questions_and_answers_on_load(formId) {
	var currForm = document.getElementById(formId);
	
	if(currForm == null)
		return;
	
	var mode = currForm.elements['mode'].value;
	
	// If mode is create, all the selects will have 'Select a question'
	// so disable the answer fields
	if (mode == 'create') {
		var allSelectElements = getAllSelectElements(currForm);
		for (var index = 0; index < allSelectElements.length; index++) {
			var currForm = allSelectElements[index].form;
			var answerElm = currForm.elements['answer_' + (index+1)];
			answerElm.disabled = true;
		}
		return;
	}
	
	// get the current verification Id.
	var verificationId = currForm.elements['verification_id'].value;
	// Get the stored questions .
	var storedQuestions = eval('getAllStoredQuestions_'+verificationId+'()');
	var storedAnswers = eval('getAllStoredAnswers_'+verificationId+'()');
	var allSelectElements = getAllSelectElements(currForm);
	
	// let's decide the size of the selects.
	var selectSize = storedQuestions.length;
	
	if (allSelectElements.length > storedQuestions.length) {
		
		// if # of select elements is > what are stored,
		// the required # of questions has changed.
		
		displayEnrollAgainMessage();
		
		
	} else if (allSelectElements.length < storedQuestions.length) {
		
		// the size of questions got smaller for some reason.
		displayEnrollAgainMessage();
		selectSize = allSelectElements.length;
	}
	
	var allQuestions = eval('getAllQuestions_'+verificationId+'()');
	var allStoredAnswerSysIdElements = getAllStoredAnswerSysIdElementsFrom(currForm);
	var storedAnswerSysIds = eval('getAllStoredAnswerSysIds_'+verificationId+'()');
	
	for (var i = 0; i < selectSize; i++) {
		
		var storedQuestion = storedQuestions[i];
		
		// Get the stored answer Id
		var storedAnswersysId = storedAnswerSysIds[i];
		
		// assign the stored sys id to each element.
		var sysIdElm = allStoredAnswerSysIdElements[i];
		sysIdElm.value = storedAnswersysId;
		
		//Let's find the stored question from the all questions.
		var index = getIndex(allQuestions,storedQuestion);
		
		// should not happen. can't find the stored question.
		if (index == -1) continue;
			
		// Once found, let's set selected index.
		var currElm = allSelectElements[i];
		currElm.options.selectedIndex = index+1;
		
		// update  the answer value.
		var answer = storedAnswers[i];
		currForm.elements['answer_'+(i+1)].value=answer;
		
	};
	// Let's remove selected ones from the main question list.
	for (var i = 0; i< allSelectElements.length; i++) {
		var currElm = allSelectElements[i];
		_changeList(i,currElm,false);
	}
	
	// Load submit event handler.
	//setSubmitEventHanlder();
}

function displayEnrollAgainMessage(){
	displayErrorMessage(getMessage("The number of questions required for enrollment has changed. Enroll again."));
}
/**
 * Removes the selected ones from the main question list.
 */
function changeList(index, currElm) {
	var currForm = currElm.form;
    var answerElm = currForm.elements['answer_' + index];
    // If 'Select a question' option is selected, disable the answer field
    if (currElm.value == 'N/A' || currElm.value == '') {
        answerElm.value = '';
        answerElm.disabled = true;
    } else {
        answerElm.disabled = false;
    }
    // PRB651727 - Recalculate questions every time, including 'Select a question'
    _changeList(index, currElm, true);
 }
 
/**
 * Builds the question list with removing the already selected ones from the main question list.
 */
function _changeList(index, currElm, clearNotStoredAnswer) {
	// current form.
	var currForm = currElm.form;
	
	// verification Id
	var verificationId = currForm.elements['verification_id'].value;
	
	//Removes the value if exists.
	if (clearNotStoredAnswer) {
		
		var storedQuestions = eval('getAllStoredQuestions_'+verificationId+'()');
		var currentQuestion = currElm.value;
		
		var metIndex = getIndex(storedQuestions,currentQuestion);
		var answerElm = currForm.elements['answer_'+index];
		
		//If the current question is the stored question, show the stored answer.
		//If the not the stored answer, clear the answer.
		if (metIndex != -1) {
			var storedAnswers = eval('getAllStoredAnswers_'+verificationId+'()');
			answerElm.value = storedAnswers[metIndex];
		} else {
			answerElm.value='';
		}
	}
	
	// get all surrounding elements except for the current.
	var otherSelectElms = getOtherSelectElements(currElm);
	
	// traverse other select elements.
	for (var i = 0; i != otherSelectElms.length; i++) {
		
		var anotherElm  = otherSelectElms[i];
		// if the question is already selected, then throw an error.
		var anotherQuestion = anotherElm.value;
		
		if (anotherQuestion != "" && anotherQuestion == currElm.value) {
			displayErrorMessage(getMessage("The same question was already selected. Select a different question."));
			currElm.options.selectedIndex = 0;
			return;
		}
		// If not the same question, then let's rebuild other select lists.
		rebuildQuestionList(anotherElm,verificationId);
	}
}
/**
 * Mark  the value of the passed element has changed.
 */
function markChanged(index,currElm) {
	
	var currForm = currElm.form;
	var verificationId = currForm.elements['verification_id'].value;
	var questionElm = currForm.elements['question_' + index];
	var question = questionElm.value;
	var storedQuestions = eval('getAllStoredQuestions_' + verificationId + '()');
	var metIndex = getIndex(storedQuestions,question);
	
	// this is a new question, then the status "true" and return.
	if (metIndex == -1) {
		currForm.elements['changed_'+index].value = true;
		return;
	}
	
	var storedAnswers = eval('getAllStoredAnswers_' + verificationId + '()');
	var storedAnswer = storedAnswers[metIndex];
	var answer = currElm.value;
	
	// let's validate one more....
	// if every character is "*" which is masked value, do not take it..
	var otherCharsFound = false;
	
	for (var i = 0; i != answer.length; i++) {
		var ch = answer.charAt(i);
		if (ch != '*') {
			otherCharsFound = true;
			break;
		}
	}
	
	if (otherCharsFound && answer != storedAnswer)
		currForm.elements['changed_' + index].value = true;
}
/**
 * Rebuilds the question list. While rebuilding, removes the questions selected by other select elements.
 */
function rebuildQuestionList(currentElement, verificationId) {
	
	
	// get other select elements that exxcludes the current one.
	var otherSelectElements = getOtherSelectElements(currentElement);
	
	// Get all available questions.
	var allQuestions = eval('getAllQuestions_'+verificationId+'()');
	
	// Get the selected questions for other select elements.
	var otherSelectedQuestions = getSelectedQuestions(otherSelectElements);
	
	// current question.
	var selectedQuestion = currentElement.value;
	
	// shrink the list to the first option. the link will be rebuit now.
	currentElement.options.length=1;
	
	// traverse all questions and remove the selected questions by other select elements.
	var index=0;
	
	for (var i = 0; i < allQuestions.length; i++) {
		
		var question = allQuestions[i];
		
		// if the question is  selected question, then remove the option from the list.
		if(getIndex(otherSelectedQuestions,question) != -1)
			continue;
		
		index++;
		currentElement.options[index]=new Option(question, question);
		
		if(selectedQuestion!="" && question==selectedQuestion)
			currentElement.options.selectedIndex = index;
		
	}
}
/*
 * Returns the elements that have the name "stored_sys_id".
 * The returned elements contain the stored answer sys Id.
 */
function getAllStoredAnswerSysIdElementsFrom(currForm) {
	var arr = [];
	for(var i = 0; i != currForm.elements.length; i++) {
		var elm= currForm.elements[i];
		var name = elm.name;
		
		if(name.indexOf("stored_sys_id_") == -1) continue;
			
		arr.push(elm);
	}
	return arr;
}
/*
 * Find all select elements except for the passsed one from the form.
 */
function getOtherSelectElements(currElm) {
	
	var currForm = currElm.form;
	var arr = [];
	for(var i = 0; i != currForm.elements.length; i++) {
		var elm= currForm.elements[i];
		var name = elm.name;
		
		if(name.indexOf("question_") == -1) continue;
			if(name.indexOf(currElm.name) != -1 ) continue;
			
		arr.push(elm);
	}
	return arr;
}
/**
 * Returns the index of the first occurrence from the array.
 * @param arr
 * @param val
 * @returns {Number}
 */
function getIndex(arr, val) {
	for(var i = 0; i != arr.length; i++ ) {
		if(arr[i] == val) return i;
		}
	return -1;
}
/**
 * Returns an array of questions. The return array excludes the currently selected question.
 */
function getSelectedQuestions(elements) {
	var arr = [];
	for(var i = 0; i != elements.length ;i++) {
		// push other selected question into the array.
		var question = elements[i].value;
		if(question == "") continue;
			arr.push(question);
	}
	return arr;
}
/**
 *Tests if the passed question has the same occrence
 */
function getStoredQuestionIndex(question, verificationId) {
	
	var storedQuestions = eval('getAllStoredQuestions_'+verificationId+'()');
	return getIndex(storedQuestions, question);
}
/**
 * Validate the form before submit.
 */
function questions_and_answers_on_submit(formId) {
	var currForm = document.getElementById(formId);
	
	if (currForm == null)
		return false;
	
	var questions = getAllSelectElements(currForm);
	var answers = getAllAnswerElements(currForm);
	
	//We need to traverse all the answers and call markChanged method
	//because some browsers (e.g. safari on ipad) have different behaviors for certain events.
	//markChanged function marks the answer dirty if the answer is changed by the user.
	for (var i = 0; i < answers.length; i++) {
		var answer = answers[i];
		
		//make sure i+1 is getting passed. It's a question index starting with 1.
		markChanged(i + 1, answer);
	}
	
	// If enrollment is not required for this form, then either all of the Q&A should
	// be empty, or they should all be valid. Also, the answers should be different. 
	var emptyQuestions = 0;
	var emptyAnswers = 0;
	var sameAnswers = 1;
	var minLengthAnswers = 0;
	var answerMap = {};
	var question;
	var trimmedAnswer;
	
	var MIN_LENGTH = currForm.elements['min_length_for_qa'].value;

	for (i = 0; i < questions.length; i++) {
		question = questions[i];
		if(questions[i].value == '')
			++emptyQuestions;
		
		// Don't validate answers if unchanged
		if (currForm.elements['changed_' + (i + 1)].value != 'true')
			continue;
		
		trimmedAnswer = answers[i].value.trim();
		if (trimmedAnswer == '')
			++emptyAnswers;
		else if (answerMap[trimmedAnswer])
			++sameAnswers;
		else if (trimmedAnswer.length < MIN_LENGTH)
			++minLengthAnswers;
		else
			answerMap[trimmedAnswer] = true;
	}
	
	currForm.elements['can_submit'].value = 'true';
	var errorMessage;
	// questions are all selected
	if (emptyQuestions == 0) {
		if (emptyAnswers > 0)
			errorMessage = getMessage("All questions should be answered");
		else if (sameAnswers > 1)
			errorMessage = getMessage("All answers must be unique");
		else if (minLengthAnswers > 0)
			errorMessage = new GwtMessage().getMessage("Answer text must be at least {0} characters", MIN_LENGTH);	

	}
	
	// no questions is selected
	else if (emptyQuestions == questions.length) {
		if (currForm.elements['mandatory'].value == 'true')
			errorMessage = getMessage("Enrollment is required for QA Verification");
		else 
		    currForm.elements['can_submit'].value = 'false';
	}
	
	// only some of questions are selected
	else {
		errorMessage = new GwtMessage().getMessage("You need to choose {0} questions", questions.length);
	}
	
	if (errorMessage) {
		handleInvalidForm(currForm, errorMessage);
		return false;
	}
	
	return true;
}

// If the form fails validation, this will show a message and focus the tab the form is on
function handleInvalidForm(currForm, message) {	
	var tabId = 'tablabel' + currForm.elements['tab_index'].value;
	var tab = gel(tabId);
	tab.click();	
	if (message) 
		displayErrorMessage(message);
}

function getAllSelectElements(currForm) {
	var arr = [];
	var elements = currForm.elements;
	
	for(var i = 0; i < elements.length ; i++) {
		var element= elements[i];
		var name = element.name;
		
		if(name.indexOf("question_") == -1) continue;
			arr.push(element);
	}
	return arr;
}

function getAllAnswerElements(currForm) {
	var arr = [];
	var elements = currForm.elements;
	
	for(var i = 0; i < elements.length; i++) {
		var element= elements[i];
		var name = element.name;
		
		if(name.indexOf("answer_") == -1) continue;
			arr.push(element);
	}
	return arr;
}

/** Clears the old value */
function clearValue(index ,currElm) {
	var currForm = currElm.form;
	var verificationId = currForm.elements['verification_id'].value;
	var questionElm = currForm.elements['question_'+index];
	var question = questionElm.value;
	
	// if this is not stored question, then return.
	var allStoredQuestions = eval('getAllStoredQuestions_'+verificationId+'()');
	var metIndex = getIndex(allStoredQuestions,question);
	
	// If the question is not stored, then return.
	if(metIndex == -1)
		return;
	
	// if the question is stored,let's compare the answer.
	var storedAnswers = eval('getAllStoredAnswers_'+verificationId+'()');
	var storedAnswer = storedAnswers[metIndex];
	
	var answerElm = currForm.elements['answer_'+index];
	var answer = answerElm.value;
	
	// if the value is the masked value, then remove the value.
	if(storedAnswer == answer) {
		answerElm.value = '';
	}
}
/**
 * Restores the value if the value has not been changed.
 */
function restoreValue (index ,currElm) {
	//if the length of the current value is not 0,do not restore.
	var answer = currElm.value;
	if(answer.length!=0)
		return;
	
	var currForm = currElm.form;
	var question = currForm.elements['question_'+index].value;
	var verificationId = currForm.elements['verification_id'].value;
	
	var allStoredQuestions = eval('getAllStoredQuestions_'+verificationId+'()');
	var metIndex = getIndex(allStoredQuestions, question);
	
	// it the question is not the stored one, just return.
	if(metIndex == -1)
		return;
	
	// if the question is stored,let's compare the answer.
	var storedAnswers = eval('getAllStoredAnswers_'+verificationId+'()');
	var storedAnswer = storedAnswers[metIndex];
	currElm.value=storedAnswer;
}
/**
 * Tests if the question is stored or not.
 */
function isStoredQuestion(question,verificationId) {
	var storedQuestions = eval('getAllStoredQuestions_'+verificationId+'()');
	return getIndex(storedQuestions,question) != -1;
}
