var MIDServerUtil;

(function() {

MIDServerUtil = {
	createOrUpdateIssue: createOrUpdateIssue,
	resolveExistingIssues: resolveExistingIssues
};

/**
 * Insert or update an issue based on MID, source and message.  Existing resolved issues are ignored.
 *
 */
function createOrUpdateIssue(midSysId, issueSource, issueMessage) {
	var issueSysId;

	var issue = new GlideRecord('ecc_agent_issue');
	issue.addQuery('mid_server', midSysId);
	issue.addQuery('source', issueSource);
	issue.addQuery('message', issueMessage);
	issue.addQuery('state', '!=', 'resolved');
	issue.query();

	if (issue.next()) {
		issueSysId = issue.getValue('sys_id');
		// issue exists, just update last_detected and count
		issue.setValue('last_detected', new GlideDateTime());
		issue.setValue('count', (+ issue.getValue('count')) + 1);
		issue.update();
	} else {
		issue.initialize();
		issue.setValue('mid_server', midSysId);
		issue.setValue('source', issueSource);
		issue.setValue('message', issueMessage);
		issue.setValue('last_detected', new GlideDateTime());
		issueSysId = issue.insert();
	}

	return issueSysId;
}

/**
 * Resolve all open (acknowledged, new) issues for a given MID Server, source and (optionally) message.
 * If a message is given, only issues that match the message will be resolved.
 *
 */
function resolveExistingIssues(midSysId, issueSource, issueMessage) {
	var openIssues = new GlideRecord('ecc_agent_issue');
	openIssues.addQuery('mid_server', midSysId);
	openIssues.addQuery('source', issueSource);
	openIssues.addQuery('state', '!=', 'resolved');
	if (JSUtil.notNil(issueMessage))
		openIssues.addQuery('message', issueMessage);
	openIssues.query();
	openIssues.setValue('state', 'resolved');
	openIssues.updateMultiple();
}

})();
