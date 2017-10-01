/*! RESOURCE: /scripts/transaction_scope_includes.js */
/*! RESOURCE: /scripts/scope/GlideTransactionScope.js */
var GlideTransactionScope = (function() {
var SYSPARM_TRANASACTION_SCOPE = 'sysparm_transaction_scope';
var SYSPARM_RECORD_SCOPE = 'sysparm_record_scope';
var transactionScope;
var recordScope;
function appendTransactionScope(appender, appendRecordScope) {
if(appender && typeof appender == 'function') {
if(transactionScope)
appender(SYSPARM_TRANASACTION_SCOPE, transactionScope);
if(appendRecordScope && recordScope)
appender(SYSPARM_RECORD_SCOPE, recordScope);
}
}
function setTransactionScope(scope) {
transactionScope = scope;
}
function setRecordScope(scope) {
recordScope = scope;
}
return {
appendTransactionScope : appendTransactionScope,
setTransactionScope : setTransactionScope,
setRecordScope : setRecordScope
};
})();
;
;
