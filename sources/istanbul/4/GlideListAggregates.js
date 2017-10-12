/*! RESOURCE: /scripts/GlideListAggregates.js */
var GlideListAggregates = Class.create({
      initialize: function(tableController) {
        this.aggregates = {};
        this.tableController = tableController;
        this._initAggregates();
      },
      getAggregate: function(fieldName, type) {
        var agg = this.aggregates[fieldName + ":" + type];
        if (!agg)
          return null;
        return agg;
      },
      getAggregateValue: function(fieldName, type) {
        var agg = this.aggregates[fieldName + ":" + type];
        if (!agg)
          return null;
        return agg.value;
      },
      getAggregateElement: function(fieldName, type) {
        var agg = this.getAggregate(fieldName, type);
        if (!agg)
          return null;
        var td = this.tableController.getCellByNdx(agg.rowNdx, agg.colNdx);
        var spans = td.getElementsByTagName("SPAN");
        for (var spanNdx = 0; spanNdx < spans.length; spanNdx++) {
          var span = spans[spanNdx];
          if (!hasClassName(span, "aggregate_value"))
            continue;
          var aggtype = getAttributeValue(span, "aggregate_type");
          if (aggtype == type)
            return span;
        }
        return null;
      },
      getAggregateFields: function() {
        return this.aggregateFields;
      },
      updateAggregates: function(fieldName, oldValue, newValue) {
          if (oldValue == newValue)
            return;
          this._updateAggregate(fieldName, "