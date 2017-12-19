var PASearchAjax = Class.create();
PASearchAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    initialize: function(request, responseXML, gc) {
        AbstractAjaxProcessor.prototype.initialize.call(this,request, responseXML, gc);
    },

    getSearchResults: function() {
		var value = this.getParameter("sysparm_value");
        var timer = this.getParameter("sysparm_timer");
		var totalCount = 0;
		
        var tags = new GlideRecord("pa_tags");
		tags.addEncodedQuery("labelLIKE" + value);
		tags.orderBy("label");
		tags.query();

        var tagInfo = [];
		var count = 0;

        while (tags.next() && count < this.MAX_RESULTS) {
			if (tags.canRead()) {
				count++;
            	tagInfo.push({"label": tags.getDisplayValue()+"",
                          	"name": tags.sys_id+"",
							  "type": "Tag"});
			}
        }
		totalCount += count;
		
		var indicators = new GlideRecord("pa_indicators");
		indicators.addQuery("display", true);
		indicators.addEncodedQuery("nameLIKE" + value);
		indicators.addNullQuery("benchmarking").addOrCondition("benchmarking", "equals", false);
		indicators.orderBy("name");
		indicators.query();
		
		var indicatorInfo = [];
		count = 0;
		
        while (indicators.next() && count < this.MAX_RESULTS) {
			if (indicators.canRead()) {
				count++;
            	indicatorInfo.push({"label": indicators.getDisplayValue()+"",
                          	"name": indicators.sys_id+"",
							  "type": "Name"});
			}
        }
		totalCount += count;
		
		var result = {};
		result.recordList = {};
		result.recordList.Tag = tagInfo;
		result.recordList.Name = indicatorInfo;
		result.timer = timer;
		result.rowCount = count;
		return new global.JSON().encode(result);
    },

    type: 'PASearchAjax',
	MAX_RESULTS: 5
});