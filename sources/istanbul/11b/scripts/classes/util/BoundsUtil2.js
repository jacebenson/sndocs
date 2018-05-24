/*! RESOURCE: /scripts/classes/util/BoundsUtil2.js */
var BoundsUtil = Class.create({
  getElemBounds: function(elem) {
    var offset = elem.cumulativeOffset();
    var dimensions = elem.getDimensions();
    var bounds = [];
    bounds.left = offset.left;
    bounds.right = offset.left + dimensions.width;
    bounds.top = offset.top;
    bounds.bottom = offset.top + dimensions.height;
    bounds.width = dimensions.width;
    bounds.height = dimensions.height;
    return bounds;
  },
  getElemBoundsWithScrollOffset: function(elem) {
    var offset = elem.cumulativeOffset();
    var scrollOffset = elem.cumulativeScrollOffset();
    var dimensions = elem.getDimensions();
    var bounds = [];
    bounds.left = offset.left - scrollOffset.left;
    bounds.right = offset.left - scrollOffset.left + dimensions.width;
    bounds.top = offset.top - scrollOffset.top;
    bounds.bottom = offset.top - scrollOffset.top + dimensions.height;
    bounds.width = dimensions.width;
    bounds.height = dimensions.height;
    return bounds;
  }
});
BoundsUtil.instance = new BoundsUtil();
BoundsUtil.getInstance = function() {
  return BoundsUtil.instance;
};