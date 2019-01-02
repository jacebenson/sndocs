/**
 * Handle a workflow.notification event by creating an email notification that can be sent
 *
 *   parm1 - sys_id of workflow activity,sys_id of workflow context
 *   parm2 - comma-separated list of recipients
 */
sendWorkflowNotification();

function sendWorkflowNotification() {
    // get the activity that defines the information about the event
    var parts = event.parm1.split(',');
    var activity = new GlideRecord('wf_activity');
    if (!activity.get(parts[0])) 
        return 0;
    
    // The EmailAction does not know how to handle ${workflow...} constructs so we need to handle those for it
    var context = new GlideRecord('wf_context');
    if (parts.length == 2) 
        context.get(parts[1]);
    
    GlideController.putGlobal("context", context);
    var workflow = new Workflow().workflow.newWorkflowProxy();
    GlideController.putGlobal("workflow", workflow);
    
    var subject = jsWorkflow(activity.vars.subject);
    var message = jsWorkflow(activity.vars.email);
    var emailAction = new GlideEmailAction();
    
    var emailGR = new GlideRecord('sysevent_email_action');
    emailGR.initialize();
    emailGR.event_parm_2 = true;
    emailGR.name = activity.getValue('name');
    emailGR.content_type = 'text/html';
    emailGR.subject = subject;
    emailGR.message = message;
    emailGR.weight = '-1';
    emailGR.send_self = true;
    emailAction.process(event, current, emailGR);
    return 0;
}

function jsWorkflow(str) {
	var gc = GlideController;
    var s = new String(str);
    
    // replace anything with ${workflow.x} to eval(workflow.x)
    s = s.replace(/\$\{(workflow\..*?)\s*\}/g, function(str, p1) {
        return (eval(p1) || "");
    });
    return s;
}
