var KBMyKnowledgeSNC = Class.create();

KBMyKnowledgeSNC.prototype = Object.extendsObject(KBCommon, {
    KB_KNOWLEDGE: "kb_knowledge",
    KB_FEEDBACK: "kb_feedback",
    _TRUNCATE_LENGTH: 50,
    _ELLIPSES: "...",
    _DEFAULT_WINDOW_SIZE: 5,
    _DEFAULT_WINDOW_START: 0,

    initialize: function(type, windowStart) {
        KBCommonSNC.prototype.initialize.call(this);

        this.knowledgeType = type;
        this.windowSize = this._DEFAULT_WINDOW_SIZE;
        this.windowPosition = (windowStart || this._DEFAULT_WINDOW_START) - 0;
    },

    setWindowSize: function(size) {
        this.windowSize = parseInt(size);
    },

    setWindowPosition: function(position) {
        this.windowPosition = parseInt(position);
    },

    getArticles: function() {
        if (this.knowledgeType === "")
            return {};

        if (this.knowledgeType == "published")
            return this._getPublished();

        if (this.knowledgeType == "retired")
            return this._getRetired();

        if (this.knowledgeType == "comments")
            return this._getComments();

        if (this.knowledgeType == "suggested_edits")
            return this._getSuggestedEdits();
    },

    _getPublished: function() {
        var response = {};
        var usingWindow = false;

        var articles = new GlideRecord(this.KB_KNOWLEDGE);
        articles.addQuery("workflow_state", "published");
        articles.orderByDesc("published");
        articles.query();

        response["header_columns"] = this._getFieldDetails(articles, [ "short_description", "published" ]);
        response["results"] = [];
        response["has_more"] = false;

        var index = this.windowPosition;
        if (index > 0)
            articles.setLocation(index);

        while (articles.next()) {
            if (!this._canAccess(articles))
                continue;

            if (index == this.windowPosition + this.windowSize) {
                response["has_more"] = true;
                break;
            }

            response["results"].push({
                "short_description": {
                    "truncated": this._truncate(articles.short_description),
                    "complete": articles.short_description + ""
                },
                "published": articles.published.getDisplayValue(),
                "link": this._getKnowledgeLink(articles.getUniqueValue())
            });

            index++;
        }

        response["window"] = {
            "start": this.windowPosition,
            "end": articles.getLocation() - 1
        };

        return response;
    },

    _getRetired: function() {
        var response = {};

        var retired = new GlideRecord(this.KB_KNOWLEDGE);
        retired.addQuery("workflow_state", "retired");
        retired.orderByDesc("sys_updated_on");
        retired.query();

        response["header_columns"] = this._getFieldDetails(retired, [ "short_description", "sys_updated_on" ]);
        response["results"] = [];
        response["has_more"] = false;

        var index = this.windowPosition;
        if (index > 0)
            retired.setLocation(index);

        while (retired.next()) {
            if (!this._canAccess(retired))
                continue;

            if (index == this.windowPosition + this.windowSize) {
                response["has_more"] = true;
                break;
            }

            response["results"].push({
                "short_description": {
                    "truncated": this._truncate(retired.short_description),
                    "complete": retired.short_description + ""
                },
                "retired": !retired.retired ? "" : retired.retired.getGlideObject().getDate().getDisplayValue(),
                "link": this._getKnowledgeLink(retired.getUniqueValue())
            });

            index++;
        }

        response["window"] = {
            "start": this.windowPosition,
            "end": retired.getLocation() - 1
        };

        return response;
    },

    _getComments: function(response) {
        var response = {};

        var feedback = new GlideRecord(this.KB_FEEDBACK);
        feedback.addQuery("article.workflow_state", "!=", "retired");
        feedback.addQuery("flagged", false);
        feedback.addNullQuery("useful");
        feedback.addNullQuery("rating");
        feedback.addNotNullQuery("comments")
        feedback.orderByDesc("sys_created_on");
        feedback.query();

        response["header_columns"] = this._getFieldDetails(feedback, [ "article", "comments", "sys_created_on" ]);
        response["results"] = [];
        response["has_more"] = false;

        var index = this.windowPosition;
        if (index > 0)
            feedback.setLocation(index);

        while (feedback.next()) {
            if (!feedback.canWrite())
                continue;

            if (index == this.windowPosition + this.windowSize) {
                response["has_more"] = true;
                break;
            }

            response["results"].push({
                "sys_id": feedback.sys_id + "",
                "number": feedback.article.number + "",
                "comments": {
                    "truncated": this._truncate(feedback.comments),
                    "complete": feedback.comments + ""
                },
                "sys_created_on": feedback.sys_created_on.getGlideObject().getDate().getDisplayValue(),
                "user": feedback.user.getDisplayValue(),
                "link": "kb_view.do?sys_kb_id=" + feedback.article,
            });

            index++;
        }

        response["window"] = {
            "start": this.windowPosition,
            "end": feedback.getLocation() - 1
        };

        return response;
    },

    _getSuggestedEdits: function(response) {
        var response = {};

        var feedback = new GlideRecord(this.KB_FEEDBACK);
        feedback.addQuery("article.workflow_state", "!=", "retired");
        feedback.addQuery("flagged", true);
        feedback.addNotNullQuery("comments")
        feedback.orderByDesc("sys_created_on");
        feedback.query();

        response["header_columns"] = this._getFieldDetails(feedback, [ "article", "comments", "sys_created_on" ]);
        response["results"] = [];
        response["has_more"] = false;

        var index = this.windowPosition;
        if (index > 0)
            feedback.setLocation(index);

        while (feedback.next()) {
            if (!feedback.canWrite())
                continue;

            if (index == this.windowPosition + this.windowSize) {
                response["has_more"] = true;
                break;
            }

            response["results"].push({
                "sys_id": feedback.sys_id + "",
                "number": feedback.article.number + "",
                "comments": {
                    "truncated": this._truncate(feedback.comments),
                    "complete": feedback.comments + ""
                },
                "sys_created_on": feedback.sys_created_on.getGlideObject().getDate().getDisplayValue(),
                "user": feedback.user.getDisplayValue(),
                "link": "kb_view.do?sys_kb_id=" + feedback.article,
            });

            index++;
        }

        response["window"] = {
            "start": this.windowPosition,
            "end": feedback.getLocation() - 1
        };

        return response;
    },

    _getKnowledgeLink: function(id) {
        return "kb_view.do?sys_kb_id=" + id;
    },

    _getFieldDetails: function(gr, fields) {
        var fieldDetails = {};

        if (!gr || !fields || fields.length == 0)
            return fieldDetails;

        for (var i = 0; i < fields.length; i++) {
            var element = gr.getElement(fields[i]);
            fieldDetails[element.getName()] = element.getLabel();
        }

        return fieldDetails;
    },

    _truncate: function(value) {
        value = value + "";
        return value.length >= this._TRUNCATE_LENGTH ? value.substring(0, this._TRUNCATE_LENGTH) + this._ELLIPSES : value;
    },

    _canAccess: function(kbGR) {
        if (!kbGR)
            return false;

        if (this.isRecordVersion3(kbGR))
            return new KBKnowledge().canRead(kbGR) && this._knowledgeHelper.canContribute(kbGR);
        else if (this.isRecordVersion2(kbGR))
            return kbGR.canRead() && kbGR.canWrite();

        return false;
    },

    type: "KBMyKnowledgeSNC"
});