var CABApproval = Class.create();

/**
 * Gets all the approvals fo the task
 */
CABApproval.getApprovals = CABApprovalSNC.getApprovals;

/**
 * Gets the current user's approval for the task
 */
CABApproval.getUserApprovals = CABApprovalSNC.getUserApprovals;

CABApproval.prototype = Object.extendsObject(CABApprovalSNC, {

    type: 'CABApproval'
});