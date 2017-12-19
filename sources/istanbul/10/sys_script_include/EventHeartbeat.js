var EventHeartbeat = Class.create();
EventHeartbeat.prototype = {
    EVENT_NAME : 'glide.heartbeat',
    LAST_BEAT_ID : 'glide.event_heartbeat.last_id',
    LAST_BEAT : 'glide.event_heartbeat.last_beat',
    LAST_DELAY : 'glide.event_heartbeat.last_delay',
    CURRENT_AGE : 'glide.event_heartbeat.current_age',
    VERSION_KEY : 'glide.event_heartbeat.version',
    VERSION_NUMBER: '1.0',

    initialize: function() {
        this.shouldRun = gs.getProperty('glide.installation.developer') != 'true';
    },

    getStatus: function(name) {
        var gr = new GlideRecord('sys_status');
        gr.addQuery('name', name);
        gr.query();
        if (gr.next())
            return gr.value + '';
    },

    beat : function() {
        if (!this.shouldRun)
            return;
        var lb = this.getStatus(this.LAST_BEAT_ID);
        var shouldBeat = true;
        if (lb)
            shouldBeat = this.processOldBeat(lb);

        if (!shouldBeat)
            return;

        var gr = new GlideRecord('sysevent');
        gr.name = this.EVENT_NAME;
        gr.user_id = gs.getUserId();
        gr.state = 'ready';
        var id = gr.insert();
        this.postStatus(this.LAST_BEAT_ID, id);
        this.postStatus(this.VERSION_KEY, this.VERSION_NUMBER);
    },

    processOldBeat: function(sys_id) {
        var gr = new GlideRecord('sysevent');
        if (!gr.get(sys_id))
            return true;

        var status = gr.state + '';
        if ('ready' == status || status.indexOf('q') == 0) {
            var created = gr.sys_created_on.getGlideObject().getNumericValue();
            var age = new GlideDateTime().getNumericValue() - created;

            gs.print('EventHeartbeat created: ' + gr.sys_created_on + ', not yet processed, age: ' + age + 'ms');
            this.postStatus(this.CURRENT_AGE, age);
            return false;
        }

        if ('error' == status)
            return true;

        if ('processed' == status) {
            var processed = gr.processed.getGlideObject().getNumericValue();
            var created = gr.sys_created_on.getGlideObject().getNumericValue();
            var delta = processed - created;

            gs.print('EventHeartbeat created: ' + gr.sys_created_on + ", processed: " + gr.processed + ', delay: ' + delta + 'ms');

            this.postStatus(this.LAST_BEAT, gr.sys_created_on);
            this.postStatus(this.LAST_DELAY, delta);
            this.postStatus(this.CURRENT_AGE, delta);

            return true;
        }

        // should never get here but what the heck
        return true;
    },

    postStatus : function(name, value) {
        var gr = new GlideRecord('sys_status');
        var exists = gr.get('name', name);

        gr.name = name;
        gr.value = value;

        if (exists)
            gr.update();
        else
            gr.insert();
    },

    type: 'EventHeartbeat'
};