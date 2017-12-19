redirectToJobRecord();
function redirectToJobRecord() {
    var table = current.document + "";
    var jobId = current.document_key + "";
    var job = new GlideRecord(table);
    
    if (!job.get("sys_id", jobId)) {
        gs.addErrorMessage("Job record not found.");
        action.setRedirectURL(current);
        return;
    }
    
    action.setRedirectURL(job);
}