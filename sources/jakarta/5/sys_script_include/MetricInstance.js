gs.include("PrototypeServer");

var MetricInstance = Class.create();

MetricInstance.prototype = {
    initialize: function(definitionGR, currentGR) {
        this.definition = definitionGR;
        this.current = currentGR;
    },

    // process is the driver for field value duration type definitions 
    process: function() {
        answer = true; 
        mi = this; // global variable
        eval(this.definition.script);
        if (!answer) 
           return; 

        this.endDuration();  // end any previous duration for this metric
        this.startDuration(); // start a new one    
    },

    startDuration: function() {
        var gr = this.getNewRecord();
        gr.field_value = this.current[this.definition.field];
        gr.start = current.sys_updated_on;
        gr.insert();
    },

    endDuration: function() {
        var gr = new GlideRecord('metric_instance');
        gr.addQuery('definition', this.definition.sys_id);
        gr.addQuery('id', this.current.sys_id);
        gr.addQuery('calculation_complete', false);
        gr.query();
        if (!gr.next())
          return;
          
        gr.end = this.current.sys_updated_on;
        gr.duration = gs.dateDiff(gr.start.getDisplayValue(), gr.end.getDisplayValue());
        gr.calculation_complete = true;
        gr.update();
    },

    getNewRecord: function() {
        var gr = new GlideRecord('metric_instance');
        gr.table = this.current.getRecordClassName();
        gr.id = this.current.sys_id;
        gr.definition = this.definition.sys_id;
        gr.field = this.definition.field;
        return gr;
    },

    // return true if a metric exists for this definition and current
    metricExists: function() {
        var gr = new GlideRecord('metric_instance');
        gr.addQuery("id", this.current.sys_id);
        gr.addQuery("definition", this.definition.sys_id);
        gr.query();
        return gr.hasNext();
    },

    _z : function() {
    }    
}