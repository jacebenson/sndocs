gs.include("PrototypeServer");

var ManagementClient = Class.create();

ManagementClient.prototype = {
    initialize : function() {
        this.id = GlideClusterSynchronizer.getSystemID();
        this.url = gs.getProperty('glide.management.host');
    },

    execute : function() {
        var m = new GlideappECCInputMessage(new GlideRecordFactory(), 'SNC_instance', null);
        m.addQuery('topic', this.id);
        m.query();
        while (m.next()) {
            if ('response' == m.getName())
                continue;
            
            var answer = this._execute(m);
            var mw = new GlideMarkupWriter("answer");
            mw.write(answer);
            answer = GlideXMLUtil.toString(mw.getDocument());
            m.setProcessed(new GlideDateTime().toString());
            m.setState('processed');
            m.update();
            this._sendResponse(m, answer);
        }
    },

    _execute : function(message) {
        var xml  = message.getPayload();
        var d = GlideXMLUtil.parse(xml);
        var script = GlideXMLUtil.getText(d, 'script');
        return GlideRhinoHelper.evaluateAsString(script);
    },

    _sendResponse : function(message, answer) {
        var response = new GlideappECCResponseMessage(message, answer);
        response.insert();
    },
   
    type: "ManagementClient"
}