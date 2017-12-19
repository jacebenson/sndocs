var TransactionKillAjax = Class.create();
TransactionKillAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    forceKill: function() {
        var sessionID = this.getParameter('sysparm_session_id');
        GlideTransactionManager.forceKill(sessionID);
        gs.addInfoMessage('Force kill message sent to all transactionns with session ' + sessionID);
        gs.addInfoMessage('Transaction may not terminate immediately');
    },
	
	forceKillCluster: function() {
		var sessionID = this.getParameter('sysparm_session_id');
		var nodeID = this.getParameter('sysparm_node_id');
		var currentNodeID = GlideClusterSynchronizer.getSystemID();
		if (nodeID == currentNodeID) {
			GlideTransactionManager.forceKill(sessionID);
		} else {
			var cancelScript = "GlideTransactionManager.forceKill('" + sessionID + "');";
			GlideClusterMessage.postScript(cancelScript, nodeID);
		}
		gs.addInfoMessage('Force kill message sent to node: ' + nodeID);
		gs.addInfoMessage('Transaction may not terminate immediately. <a href="loading_transactions.do">Refresh</a>');
	},
	
	isPublic: function() {
		return false;
	},

    toString: function() { return 'TransactionKillAjax'; }
});
