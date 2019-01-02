var cxs_Base = Class.create();
cxs_Base.prototype = {
    initialize: function(_gr, _gs) {
		this._gr = _gr ? _gr : current;
		this._gs = _gs ? _gs : gs;
		this._log = new GSLog("com.snc.contextual_search.log", this.type).setLog4J();
    },

    type: 'cxs_Base'
};