var ExampleTimelineRangeCalculator = Class.create();
ExampleTimelineRangeCalculator.prototype = {
    initialize: function() {
    },

    /**
     * This is called when a record is changed in the timeline
     * 
     * This is intended to be used to update parent records
     */
    updateParents: function(id, table, startDate, endDate){
        
    },
    
    /**
     * Returns array with following values:
     * maximum start date (in milliseconds) that the record can be moved/resized to
     * minimum end date (in milliseconds) that the record can be moved/resized to
     * comma separated list of sys_id's of records that are restricting resize/movement
     *
     * Return [-1, -1, "", ""] to place no restriction
     */
    getMinRangeDetails: function(id, table){
        var min = -1;
        var max = -1;
        var minID = "";
        var maxID = "";
        if (table == "rm_release_scrum"){
           var gr = new GlideRecord("rm_sprint");
           gr.addQuery("release", id);
           gr.query();
           while(gr.next()){
              var start = this.getTimeMs(gr["start_date"]);
              var end = this.getTimeMs(gr["end_date"]);
              var id = gr["sys_id"];
              if (min == -1 || start <= min){
                 if (start != min)
                    minID = "";
                 min = start;
                 minID += "," + id;
              }
              if (max == -1 || end >= max){
                 if (end != max)
                    maxID = "";
                 max = end;
                 maxID += "," + id;
              }  
           }
        }
        return [min, max, minID, maxID];
    },

    /**
     * Returns array with following values:
     * minimum start date (in milliseconds) that the record can be moved/resized to
     * maximum end date (in milliseconds) that the record can be moved/resized to
     * sys_id of record that is restricting resize/movement
     *
     * Return [-1, -1, ""] to place no restriction
     */
    getMaxRangeDetails: function(id, table){
        return [-1, -1, ""];
    },

    getTimeMs: function(date){
        return new GlideScheduleDateTime(date).getMS();
    },
    
    getTimeObject: function(timeMS) { 
        var gdt = new GlideDateTime(); 
        gdt.setNumericValue(timeMS); 
        return gdt; 
    },

    logMessage: function(message){
        gs.log(message);
    },

    type: 'ExampleTimelineRangeCalculator'
}