var EmailDiagnosticsV2 = Class.create();

EmailDiagnosticsV2.prototype = {

    initialize: function() {
        this.STATE_RANKS = {
            "-1": 1, //Error
            None: 2,
            "2": 3, //Queued
            "1": 4, //Running
            "0": 5 //Ready
        };

        this.SMTP_SENDER_JOB_ID = "d8e37da5c0a80064009ff6d19882218a";
        this.SMS_SENDER_JOB_ID = "90f73fab0a0a0b130078bef17cd2809f";
        this.EMAIL_READER_JOB_ID = "52fb24f70a0005fc008b6be3853ca58c";

        this.smtpSenderInfo = this._getJobInfo(this.SMTP_SENDER_JOB_ID);
        this.smsSenderInfo = this._getJobInfo(this.SMS_SENDER_JOB_ID);
        this.readerInfo = this._getJobInfo(this.EMAIL_READER_JOB_ID);

        this.lastSent = this._getLastEmail('sent');
        this.lastReceived = this._getLastEmail('received');
        this.sendingEnabled = this._getTypedProperty('glide.email.smtp.active', false);
        this.receivingEnabled = this._getTypedProperty('glide.email.read.active', false);
        this.sendReadyCount = this.getSendReadyCount();

        this.smtpSenderState = this._getJobState(this.smtpSenderInfo);
        this.smtpSenderLastRun = this._getLastRunTime(this.smtpSenderInfo);
        this.smtpSenderDuration = this._getLargestProcessingTime(this.smtpSenderInfo);

        this.smsSenderState = this._getJobState(this.smsSenderInfo);
        this.smsSenderLastRun = this._getLastRunTime(this.smsSenderInfo);
        this.smsSenderDuration = this._getLargestProcessingTime(this.smsSenderInfo);

        this.emailReaderState = this._getJobState(this.readerInfo);
        this.emailReaderLastRun = this._getLastRunTime(this.readerInfo);
        this.emailReaderDuration = this._getLargestProcessingTime(this.readerInfo);
    },

    isSendingOperational: function() {
        //Email Sending Stats
        var sendReadyThresholdExceeded = this.isSendReadyThresholdExceeded();
        //SMTP Sender
        var smtpSenderDurationThresholdExceeded = this.isSmtpProcessingThresholdExceeded();
        var smtpLastRunThresholdExceeded = this.isSmtpLastRunThresholdExceeded();

        //SMS Sender
        var smsSenderDurationThresholdExceeded = this.isSmsProcessingThresholdExceeded();
        var smsLastRunThresholdExceeded = this.isSmsLastRunThresholdExceeded();

        return this.sendingEnabled && !sendReadyThresholdExceeded && this.smtpSenderState != "Error" && this.smtpSenderState != "None" &&
            !smtpSenderDurationThresholdExceeded && !smtpLastRunThresholdExceeded && this.smsSenderState != "Error" &&
            this.smsSenderState != "None" && !smsSenderDurationThresholdExceeded && !smsLastRunThresholdExceeded;
    },

    isReceivingOperational: function() {
        var readerDurationThresholdExceeded = this.isReaderProcessingThresholdExceeded();
        var readerLastRunThresholdExceeded = this.isReaderLastRunThresholdExceeded();

        return this.receivingEnabled && !readerDurationThresholdExceeded && !readerLastRunThresholdExceeded && this.emailReaderState != "Error" && this.emailReaderState != "None";
    },

    isSendReadyThresholdExceeded: function() {
        return this.sendReadyCount > this.sendReadyThreshold();
    },

    isSmtpProcessingThresholdExceeded: function() {
        return this.smtpSenderDuration > this.smtpSenderProcessingTimeThreshold();
    },

    isSmsProcessingThresholdExceeded: function() {
        return this.smsSenderDuration > this.smsSenderProcessingTimeThreshold();
    },

    isSmtpLastRunThresholdExceeded: function() {
        return gs.dateDiff(gs.minutesAgo(this.smtpJobLastRunThreshold()), this.smtpSenderLastRun ,true) < 0;
    },

    isSmsLastRunThresholdExceeded: function() {
        return gs.dateDiff(gs.minutesAgo(this.smsJobLastRunThreshold()), this.smsSenderLastRun ,true) < 0;
    },

    isReaderProcessingThresholdExceeded: function() {
        return this.emailReaderDuration > this.readerProcessingTimeThreshold();
    },

    isReaderLastRunThresholdExceeded: function() {
        return gs.dateDiff( gs.minutesAgo(this.readerJobLastRunThreshold()), this.emailReaderLastRun,true) < 0;
    },

    sendReadyThreshold: function() {
        return gs.getProperty('glide.email_diag.threshold.send_ready', 200);
    },

    smtpSenderProcessingTimeThreshold: function() {
        return GlideProperties.getInt('glide.email_diag.threshold.smtp_sender.runtime', 10000);
    },

    smsSenderProcessingTimeThreshold: function() {
        return GlideProperties.getInt('glide.email_diag.threshold.sms_sender.runtime', 10000);
    },

    smtpJobLastRunThreshold: function() {
        return gs.getProperty('glide.email_diag.threshold.smtp_sender.last_run', 10);
    },

    smsJobLastRunThreshold: function() {
        return gs.getProperty('glide.email_diag.threshold.sms_sender.last_run', 10);
    },

    readerProcessingTimeThreshold: function() {
        return GlideProperties.getInt('glide.email_diag.threshold.email_reader.runtime', 10000);
    },

    readerJobLastRunThreshold: function() {
        return gs.getProperty('glide.email_diag.threshold.email_reader.last_run', 10);
    },

    getSendReadyCount: function() {
        var emailAgg = new GlideAggregate("sys_email");
        emailAgg.addQuery("type","send-ready");
        emailAgg.addQuery("sys_created_on", ">", gs.hoursAgo(48));
        emailAgg.addAggregate("COUNT");
        emailAgg.query();
        if (!emailAgg.next())
            return 0;

        return parseInt(emailAgg.getAggregate("COUNT"));
    },

    _getJobInfo: function(jobId) {
        var trigger = new GlideRecord("sys_trigger");
        trigger.addQuery("job_id", jobId);
        trigger.query();
        var smtpJobs = [];
        while (trigger.next()) {
            var stateDisplay = trigger.getDisplayValue("state");

            var job = {};
            job.lastRun = new GlideDateTime(trigger.getValue('sys_updated_on'));
            job.duration = trigger.getValue('processing_duration');
            job.state = (stateDisplay) ? trigger.getValue('state') : 'None';
            job.id = trigger.getUniqueValue();

            smtpJobs.push(job);
        }

        return smtpJobs;
    },

    _getJobState: function(states) {
        if (states.length === 0) {
            return 'No Job Defined';
        }
        var lowestSenderRank = this.STATE_RANKS[states[0].state];

        for (var i = 0; i <= states.length; i++) {
            var state = states[i].state;

            var rank = this.STATE_RANKS[state];

            if (rank < lowestSenderRank) {
                lowestSenderRank = rank;
            }
        }
        return this._getStateString(lowestSenderRank);
    },

    _getLargestProcessingTime: function(senders) {
        var processingTime = 0;

        for (var i = 0; i < senders.length; i++) {
            var duration = senders[i].duration;
            if (duration > processingTime)
                processingTime = duration;
        }

        return processingTime;
    },

    _getLastRunTime: function(senders) {
        var lastRun = senders[0].lastRun;

        for (var i = 1; i < senders.length; i++) {
            if (lastRun < senders[i].lastRun)
                lastRun = senders[i].lastRun;
        }

        return lastRun;
    },

    _getTypedProperty: function (inProp, inDef) {
        var prop = gs.getProperty(inProp, inDef);
        if (prop.toLowerCase() == "true") {
            return true;
        }
        if (prop.toLowerCase() == "false") {
            return false;
        }
        return prop;
    },

    _getLastEmail:function(type) {
        var email = new GlideRecord("sys_email");
        email.addQuery("type",type);
        email.addQuery("sys_created_on", ">", gs.hoursAgo(24));
        email.orderByDesc("sys_updated_on");
        email.setLimit(1);
        email.query();

        return (email.next()) ? email.sys_updated_on : null;
    },

    _getStateString: function(stateRank) {
        for (var key in this.STATE_RANKS) {
            if (stateRank == this.STATE_RANKS[key]) {
                return key;
            }
        }
    },

    type: 'EmailDiagnosticsV2'
};