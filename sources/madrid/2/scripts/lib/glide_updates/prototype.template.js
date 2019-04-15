/*! RESOURCE: /scripts/lib/glide_updates/prototype.template.js */
var Template = Class.create({
  initialize: function(template) {
    this.template = template.toString();
    this.pattern = /(^|.|\r|\n)(#\{((JS|HTML):)?(.*?)\})/;
  },
  evaluate: function(object) {
    if (object && Object.isFunction(object.toTemplateReplacements))
      object = object.toTemplateReplacements();
    return this.template.gsub(this.pattern, function(match) {
      if (object === null)
        return (match[1] + '');
      var before = match[1] || '';
      if (before === '\\')
        return match[2];
      var ctx = object,
        expr = match[5],
        escape = match[4],
        pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;
      match = pattern.exec(expr);
      if (match === null)
        return before;
      while (match != null) {
        var comp = match[1].startsWith('[') ? match[2].replace(/\\\\]/g, ']') : match[1];
        ctx = ctx[comp];
        if (null === ctx || '' === match[3])
          break;
        expr = expr.substring('[' === match[3] ? match[1].length : match[0].length);
        match = pattern.exec(expr);
      }
      ctx = ctx || '';
      switch (escape || '') {
        case 'HTML':
          ctx = ctx.replace(/'/g, '&#39;').replace(/"/g, '&#34;').replace(/&(?![#|l|g])/g, '&amp;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
          break;
        case 'JS':
          ctx = ctx.replace(/'/g, '&#39;').replace(/"/g, '&#34;');
          break;
      }
      return before + String.interpret(ctx);
    });
  }
});
var XMLTemplate = Class.create(Template, {
  initialize: function($super, id) {
    var s = $(id);
    $super(s && s.innerHTML ? s.innerHTML.replace(/%7B/g, '{').replace(/%7D/g, '}') : '');
  },
  toString: function() {
    'XMLTemplate';
  }
});;