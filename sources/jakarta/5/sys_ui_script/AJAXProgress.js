var  AJAXProgress = Class.create();

AJAXProgress.prototype = {
    WAIT_PERIOD: 5000,

    initialize: function(span_name, stage_list) {
	this.span = gel(span_name);
        this.stageList = gel(stage_list);
        this.stages = new Array();
        this.currentStage = -1;

        this.parseStages(this.stageList);
    },

    start: function() {
        this.currentStage = -1;
        this.stageStart();
    },

    stageStart: function() {
       this.currentStage++;
       
       this.updateSpan();
       this.stageLoop();
    },

    stageLoop: function() {
       var id = this.stages[this.currentStage].ajax;
       var name = this.stages[this.currentStage].name;
       var ga = new GlideAjax('ECCQueueAjax');
       ga.addParam('sysparm_name','ajaxProgress');
       ga.addParam('sysparm_value',name);
       ga.addParam('sysparm_id',id);
       ga.getXMLAnswer(this.stageEvalComplete.bind(this));
    },

    stageEvalComplete: function(answer) {
       if (answer == 'true')
           this.stageComplete();
       else
           setTimeout(this.stageLoop.bind(this), this.WAIT_PERIOD);
    },

    stageComplete: function() {
        if (this.stages[this.currentStage].oncomplete) {
            var c = this.stages[this.currentStage].oncomplete;
            eval(c);
        }

        if (this.currentStage+1 == this.stages.length)
            return;

        this.stageStart();
    },

    parseStages: function(stageNode) {
        for(var i = 0; i < stageNode.childNodes.length; i++) {
            var stage = stageNode.childNodes[i];
            var name = "";
            var ajax = "";
            var complete = "";

            for(var s = 0; s < stage.childNodes.length; s++) {
                var attr = stage.childNodes[s];
                if (attr.tagName.toLowerCase() == "name")
                    name = getTextValue(attr);
                if (attr.tagName.toLowerCase() == "complete_condition")
                    ajax = getTextValue(attr);
                if (attr.tagName.toLowerCase() == "oncomplete")
                    complete = getTextValue(attr);
            }

            this.addStage(name, ajax, complete);
        }
    },

    updateSpan: function() {
        var stageName = this.stages[this.currentStage].name;
        this.span.innerHTML = "<table border='0'><tr><td align='center'>" + stageName +
                              "<br><img src='images/ajax-loader.gifx'>" + "</td></tr></table>";
    },

    addStage: function(name, ajax, complete) {
        var stage = { "name": name, "ajax": ajax, "oncomplete": complete };
        this.stages.push(stage);
    },

    type: "AJAXProgress"
};