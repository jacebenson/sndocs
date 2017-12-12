var PwdPostProcessor = Class.create();

PwdPostProcessor.prototype = {
    category: 'password_reset.extension.post_reset_script',        // DO NOT REMOVE THIS LINE!
    
    initialize: function() {
    },

    /**********
    * Execute custom actions after the password reset process has completed.
    * 
    * @param params.resetRequestId The sys-id of the current password-reset request (table: pwd_reset_request)
    * @param params.wfSuccess      A flag indicating if workflow completed sucessfully. True if (and only if) sucessful.
    * @return no return value
    **********/
    process: function(params) {
        // isSuccess to indicate if outcome of password reset was success or failure
        gs.log('[PwdPostProcessor.process] wfStatus [' + params.wfSuccess + '], requestId [' + params.resetRequestId + ']');
        
        if (params.wfSuccess) {
           // Do something when success
           gs.log('[PwdPostProcessor.process] success post processing for request [' + params.resetRequestId + ']');
        } else {
            // Do something when failure
           gs.log('[PwdPostProcessor.process] failure post processing for request [' + params.resetRequestId + ']');
        }
        
        // Do something regardless of success or failure
        return;
    },

    type: 'PwdPostProcessor'
}