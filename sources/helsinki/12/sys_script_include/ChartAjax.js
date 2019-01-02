var ChartAjax = Class.create();

ChartAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    /*
     * method available to client scripts call using:
     * var gajax = new GlideAjax("ChartAjax");
     * gajax.addParam("sysparm_name", "getDefaultChartColors");
     */
    getDefaultChartColors: function() {
        var result = gs.getProperty("glide.ui.chart.default.colors", null);
        return result;
    },
       
    type: 'ChartAjax'
});