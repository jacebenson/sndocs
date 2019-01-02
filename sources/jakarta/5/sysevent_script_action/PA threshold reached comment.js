var json = new JSON();
gs.log('json summary: ' + json)
var summary = json.decode(event.parm1);
gs.log('summary.createScoreNotes = ' + summary.thresholdCheck.createScoreNotes);
if (summary.thresholdCheck.createScoreNotes) {
	var uuidComment = summary.thresholdCheck.uuidComment;
	var user = null;
	if (summary.thresholdCheck.personal) {
		user = event.parm2;
	}
    var scoreIntegerDate = summary.scoreIntegerDate;
    var message = buildMessage(summary);
	// Comment are not stored on the aggregates
	gs.log('uuid: ' + uuidComment + ', scoreIntegerDate: ' + scoreIntegerDate + ', message: ' + message);
    appendScoreNote(message, uuidComment, scoreIntegerDate, user);
}

function buildMessage(summary) {
    var scoreDate = summary.scoreDate;
    gs.log('scoreDate = ' + summary.scoreDate);
	
	var thresholdCheck = summary.thresholdCheck;
    
	var uuidString = thresholdCheck.uuidString;
	gs.log('uuidString = ' + thresholdCheck.uuidString);
	
	var message = scoreDate + ": " + uuidString + ": ";
    gs.log('message = ' + thresholdCheck.message);
	
    var unit = thresholdCheck.unit;
    gs.log('unit = ' + thresholdCheck.unit);
	
    if (typeof unit == 'undefined'){
    	unit = '';
    }
	
	var condition = thresholdCheck.condition;
    gs.log('condition = ' + thresholdCheck.condition);
	
	var thresholdLevel = thresholdCheck.thresholdLevel;
    gs.log('thresholdLevel = ' + thresholdCheck.thresholdLevel);
	
	if (typeof thresholdLevel != 'undefined'){
    	condition += ' ' + thresholdLevel;
    	if (unit!=''){
            condition += ' ' + unit;
        }
    }
    return message + condition + ': ' + thresholdCheck.matchingScore + ' ' + unit;
}

function appendScoreNote(message, uuid, integerDate, user) {
	var gr = new GlideRecord("pa_score_notes");
	gr.addQuery("uuid", uuid);
	gr.addQuery("start_at", integerDate);
	gr.addQuery("user", user);
	gr.query();
	if (gr.next()) {
		gr.setValue("text", message + "\n\n" + gr.getValue("text"));
		gr.update();
	} else {
		gr = new GlideRecord("pa_score_notes");
		gr.setValue("uuid", uuid);
		gr.setValue("text", message);
  	    gr.setValue('start_at', integerDate);
		gr.setValue("user", user);
        gr.insert();
	}
}