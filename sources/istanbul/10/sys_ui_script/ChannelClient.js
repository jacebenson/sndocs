var ChannelClient = Class.create();

ChannelClient.prototype = {
    initialize: function(iframe, autoCreate) {
        this.iframe = iframe;
        this.fdocument = this._getFrameDocument();
        this.channelName = iframe.getAttribute("channel");
        this.autoCreate = autoCreate;
    },

    writeMsg: function(msg) {
        var gaj = new GlideAjax("ChannelAjax");
        gaj.addParam("sysparm_name", this.channelName);
        gaj.addParam("sysparm_type", "write");
        gaj.addParam("sysparm_chars", msg);
        gaj.addParam("sysparm_silent_request", "true");
        gaj.getXML(doNothing);
    },

    stream: function() {
        this._initUnloader();
        this.streamChannel(0);
    },

    streamChannel: function(lastSeq) {
        var gaj = new GlideAjax("ChannelAjax");
        gaj.addParam("sysparm_name", this.channelName);
        gaj.addParam("sysparm_type", "read");
        gaj.addParam("sysparm_value", lastSeq);
        gaj.addParam("sysparm_silent_request", "true");
        gaj.addParam("sysparm_express_transaction", "true");

        if (this.autoCreate)
            gaj.addParam("sysparm_auto_create", "true");

        gaj.getXML(this.gotChannelMessages.bind(this));
    },

    gotChannelMessages: function(response) {
        if (this.haveError(response))
            return;

        var lastSeq = response.responseXML.documentElement.getAttribute("channel_last_sequence");
        var items = response.responseXML.getElementsByTagName("item");
        jslog("response=" + response.responseText);

        for(var i = 0; i < items.length; i++) {
            var item = items[i];
            var msg = item.getAttribute('message');
            var date = item.getAttribute('date');
            var friendlyDate = new Date(parseInt(date));
            this.newMsg(getFormattedDateAndTime(friendlyDate) + " " + msg);
        }

        if (lastSeq != null)
           this.streamChannel(lastSeq);
    },

    newMsg: function(msg) {
        var el = this.fdocument.createElement('pre');
        el.innerHTML = htmlEscape(msg);
        this.fdocument.body.appendChild(el);

        this.scroll();
    },

    scroll: function() {
        if (this.iframe.getAttribute("autoscroll") == 'true')
            this.fdocument.body.scrollTop = this.fdocument.body.scrollHeight;
    },

    haveError: function(response) {
        if (!response) {
            alert("invalid response!");
            return true;
        }

        var interrupted = response.responseXML.documentElement.getAttribute("interrupted");
        if (interrupted)
            return true;

        var error = response.responseXML.documentElement.getAttribute("error");
        if (error) {
            alert("ERROR: " + error);
            return true;
        }

        return false;
    },

    _initUnloader: function() {
        Event.observe(window, 'beforeunload', this._forceUnload.bind(this), false);
    },

    _forceUnload: function() {
        this.iframe.src = "threads.do?sysparm_action=interrupt&sysparm_name=streaming_channel&sysparm_value=" + this.channelName;
    },

    _getFrameDocument: function() {
        if (this.iframe.contentDocument) {
            return this.iframe.contentDocument;  // For NS6
        } else if (this.iframe.contentWindow) {
            return this.iframe.contentWindow.document; // For IE5.5 and IE6
        } else if (this.iframe.document) {
            return this.iframe.document; // For IE5
        }
    },

    type: "ChannelClient"
}