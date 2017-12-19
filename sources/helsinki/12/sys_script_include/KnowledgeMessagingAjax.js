var KnowledgeMessagingAjax = Class.create();

KnowledgeMessagingAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	/**
 	* Prevent public access to this script
 	*/
	isPublic: function() {
		return false;
	},
	
	process: function() {
		var err = j2js(gs.getErrorMessages());
		var inf = j2js(gs.getInfoMessages());
		
		var msgs = [];
		
		for (i in err) {
			var mErr = {msg:err[i],type:'error'};
			msgs.push(mErr);
		}
		for (j in inf) {
			var mInf = {msg:inf[j],type:'info'};
			msgs.push(mInf);
		}
		gs.flushMessages();
		return (new JSON().encode(msgs));
	},
	type: "KnowledgeMessagingAjax"
});