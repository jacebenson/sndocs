var TransactionKillAjax = Class.create();
TransactionKillAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    forceKill: function() {
        var sessionID = this.getParameter('sysparm_session_id');
        GlideTransactionManager.forceKill(sessionID);
        gs.addInfoMessage('Force kill message sent to all transactionns with session ' + sessionID);
        gs.addInfoMessage('Transaction may not terminate immediately');
    },
	
	isPublic: function() {
		return false;
	},

    toString: function() { return 'TransactionKillAjax'; }
});
