var SurveyProcessor = Class.create();

SurveyProcessor.prototype = Object.extendsObject(AbstractScriptProcessor, { 
  process : function() {
    try {
      var taskSurveyOn = gs.getProperty('glide.task.survey_active',false);
      var taskSurveyId = this._gsEscapeValue(this.request.getParameter('sysparm_task_survey'));
                        //added to support assessments
      var taskAssessmentId = this._gsEscapeValue(this.request.getParameter('sysparm_task_assessment'));
                        //addition July 2011 to support attaching doc_id & table_name to the survey response
      var documentTable = this._gsEscapeValue(this.request.getParameter('sysparm_document_table'));
      var documentId = this._gsEscapeValue(this.request.getParameter('sysparm_document_id'));
                        //addition July 2011 to flag when the survey is weighted
      var weighted = this._gsEscapeValue(this.request.getParameter('sysparm_weighted'));
		var returnUrl = this._gsEscapeValue(this.request.getParameter('sysparm_return_url'));

      //make sure we at least have a survey parameter
      var survey = this._gsEscapeValue(this.request.getParameter('sysparm_survey'));
      if (!survey) {
        gs.log('Post Survey submitted without survey parameter');
        this.response.sendRedirect('home.do');
      }
      var user = this._gsEscapeValue(this.request.getParameter('sysparm_survey_user'));
      // in theory we could have passed a user out (which
      // we do if we email,
      // for example)
      // a sat survey to somebody
      // if they just took the survey from within the UI,
      // we can figure out
      // their UID from the session
      if (user == "")
        user = gs.getUserID();
      var update = this._gsEscapeValue(this.request.getParameter('sysparm_survey_update'));
      var bUpdate = false;
      if (update == "" || update == "true")
        bUpdate = true;
      //force instance update to false if using task survey feature
      if (taskSurveyOn == 'true' && taskSurveyId)
        bUpdate = false;
      // set up the survey instance
      var instance = this._getInstance(user, survey, bUpdate, documentTable, documentId);
      
      //update task survey table if feature is active
      if (taskSurveyOn == 'true' && taskSurveyId) {
        this._updateTaskSurvey(instance.getUniqueValue(), taskSurveyId, user);
      }

                        //added to support assessments
      //update task_assessment table if this is an assessment
                        //taskID used to return back to the correct task after submit is clicked
      if (taskAssessmentId) {
        var taskID = this._updateTaskAssessment(instance.getUniqueValue(), taskAssessmentId, user);
      }


      
      // now iterate the answers
      var response = new GlideRecord('survey_response');
                        var score = "";
                        var weight = "";
                        var weightedScore = "";
      var en = this.request.getParameterNames();
      while (en.hasMoreElements()) {
        var arg = en.nextElement();
        if (arg.startsWith('QUESTION:')) {
      response.initialize();
          var value = this.request.getParameter(arg);
                                        if (value == "") 
                                          value = "NULL";
          var key = arg.substring('QUESTION:'.length);
          var questiongr = new GlideRecord('survey_question_new');
          if (!questiongr.get(key)) continue;
                                        //get the score for assessment response
                                        
                                        if (taskAssessmentId || weighted) {
                                          var qGR = GlideRecord('assessment_question');
                                          if(qGR.get(key)){
                                            weight = qGR.weight || 1;
                                          }
                                          var aqGR = new GlideRecord('assessment_question_choice');
                                          aqGR.addQuery('question', key);
                                          aqGR.addQuery('value', value); 
                                          aqGR.query();
                                          if(aqGR.next()){
                                            score = aqGR.score; 
                                            weightedScore = weight * score;
                                          }
                                        }
      //if question type is Multiple Choices or Select Box, populate the question_choice field
      var question_choice = "NULL";
      if(questiongr.getValue("type") == '3' || questiongr.getValue("type") == '5'){
        var qcGR = new GlideRecord('question_choice');
              qcGR.addQuery('question', key);
              qcGR.addQuery('value', value);
              qcGR.query();
              if(qcGR.next()){
                question_choice = qcGR.getValue("sys_id");
              }
      }
          this._postResponse(response, instance.getUniqueValue(), key, value, bUpdate, weightedScore, question_choice);
        }
      }

		// A flag to indicate all the response records have been added/updated.
		instance.setValue("responses_received",'true');
		instance.update();

		if (returnUrl)
			this.response.sendRedirect(returnUrl);
		//added to support assessments so that the end not is not displayed as this is not necessary due to it
		//being in a dialog
		else if (taskAssessmentId) {
			this.response.sendRedirect('task.do?sys_id=' + taskID);
		} else {
			this.response.sendRedirect("survey_thanks.do?sysparm_survey=" + this._gsEscapeValue(this.request.getParameter('sysparm_survey')));
		}
    } catch (err) {
      gs.log("ERROR in SurveyProcessor: " + err.toString());
      this.response.sendRedirect('home.do');
    }
  },

  /**
   * Allow public access to this AJAX processor
   */
  isPublic: function() {
    return true;
  },

  _updateTaskSurvey : function(/*String*/ instance, /*String*/taskSurvey, /*String*/user) {
    var gr = new GlideRecord('task_survey');
    if (gr.get(taskSurvey)) {
      gr.setValue('instance', instance);
      gr.setDisplayValue('completed_date', gs.nowDateTime());
      gr.setValue('taken_by',user);
      gr.setValue('state', 'completed');
      gr.update();
    }
  },

        //added to support assessments
  _updateTaskAssessment : function(instance, taskAssessment, user) {
    var gr = new GlideRecord('task_assessment');
    if (gr.get(taskAssessment)) {
      gr.setValue('instance', instance);
      gr.setDisplayValue('completed_date', gs.nowDateTime());
      gr.setValue('completed_by', user);
                        var taskID = gr.task;
      gr.update();
    }
        return taskID;
  },
  
  
  _getInstance : function(/*String*/user, /*String*/survey, /*boolean*/bUpdate, /**table**/doc_table, /**sys_id**/doc_id) {
    var gr = new GlideRecord('survey_instance');
    var doInsert = true;
    if (bUpdate) {
      gr.addQuery("taken_by", user);
      gr.addQuery("survey", survey);
                        if (doc_table) {gr.addQuery("document_table", doc_table);}
                        if (doc_id)    {gr.addQuery("document_id", doc_id);}
      gr.query();
      if (gr.next()) {
        doInsert = false;
                                gr.setValue('responses_received','false');
                                gr.update();
      }
    }
    if (doInsert) {
      gr.initialize();
      gr.setValue("taken_by", user);
      gr.setValue("survey", survey);
      gr.setValue("document_table", doc_table);
      gr.setValue("document_id", doc_id);
      gr.setDisplayValue("taken_on", gs.nowDateTime());
      gr.setValue("responses_received", 'false');
      gr.insert();
    }
                return gr;
  },

  _gsEscapeValue : function(value)
  {
    if(value)
      return gs.escaper(value);
    else
      return value;
  },

  _postResponse : function(/*GlideRecord*/ response, /*String*/ instance, /*String*/ key, /*String*/ value, /*boolean*/ bUpdate, /*String*/ weightedScore, /*Sys_id*/ questionChoice) {
    var doInsert = true;

    if (bUpdate) {
      // try to update an existing response (if it exists)
      response.initialize();
      response.addQuery("instance", instance);
      response.addQuery("question", key);
      response.query();
      if (response.next()) {
        doInsert = false;
        response.setValue("response", value);
        response.setValue("answer_integer", weightedScore);
        response.setValue("question_choice", questionChoice);
        response.update();
      }
    }
    if (doInsert) {
      response.setValue("instance", instance);
      response.setValue("question", key);
      response.setValue("response", value);
      response.setValue("answer_integer", weightedScore);
      response.setValue("question_choice", questionChoice);
      response.insert();
    }
  },
  
  type : 'SurveyProcessor'
});