var RowColorDecorator = Class.create(CSSClassDecorator, {
  initialize: function($super, bgColor) {
    $super(this._createClass(bgColor));
  },
  _createClass: function(bgColor) {
    var className = this.type + '_' + bgColor.replace('#', '');
    if (document.getElementById(className) == null) {
      var style = document.createElement('style');
      style.id = className;
      style.type = 'text/css';
      style.innerHTML = 'tr.' + className + ' td.list_decoration_cell img.list_decoration, ' +
        'tr.' + className + ' td.list_decoration_cell, ' +
        'tr.' + className + ' td { background-color:' + bgColor + ';}';
      document.getElementsByTagName('head')[0].appendChild(style);
      style = document.createElement('style');
      style.id = className + 'WithHighlighting';
      style.type = 'text/css';
      style.innerHTML = '.highlight_enabled .list_div tr.' + className + ' td img.list_decoration, ' +
        '.highlight_enabled .list_div tr.' + className + ' td { background-color:' + bgColor + ';}';
      document.getElementsByTagName('head')[0].appendChild(style);
    }
    return className;
  },
  type: 'RowColorDecorator'
});
RowColorDecorator.make = function(colors, callbackFn) {
  if (colors == null) {
    var glideProperties = new GlideAjax('ChartAjax');
    glideProperties.addParam('sysparm_name', 'getDefaultChartColors');
    glideProperties.getXMLAnswer(function(answer, decorationMgr) {
      var decorators = [];
      answer.split(', ').each(function(color, i) {
        decorators.push(new RowColorDecorator(color));
      });
      callbackFn(decorators);
    });
  } else {
    var decorators = [];
    if (typeof(colors) == 'string') {
      colors = [colors];
    }
    colors.each(function(color, i) {
      decorators.push(new RowColorDecorator(color));
    });
    if (typeof(onComplete) != 'undefined' && callbackFn != null) {
      callbackFn(decorators);
    }
    return decorators;
  }
}