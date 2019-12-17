/*! RESOURCE: /scripts/functions/textutil.js */
function htmlEscape(s) {
  return s.replace(/&/g, "&amp;").replace(/'/g, "&#39;").replace(/"/g, "&quot;").replace(/</g, "&#60;").replace(/>/g, "&#62;");
}

function htmlEscapeQuote(s) {
  return s.replace(/'/g, "&#39;");
}

function htmlEscapeDoubleQuote(s) {
  return s.replace(/"/g, "&quot;");
}

function loadXML(r) {
  var xml = r.responseXML;
  if (typeof xml != 'undefined')
    return xml;
  var dom = null;
  if (window.DOMParser) {
    try {
      dom = (new DOMParser()).parseFromString(r, 'text/xml');
    } catch (e) {
      dom = null;
    }
  } else if (window.ActiveXObject) {
    try {
      dom = new ActiveXObject('Microsoft.XMLDOM');
      dom.async = false;
      if (!dom.loadXML(r))
        jslog('ERROR: ' + dom.parseError.reason + dom.parseError.srcText);
    } catch (e) {
      dom = null;
    }
  } else
    jslog('ERROR: Cannot parse xml string - "' + r + '".');
  return dom;
}
window.sanitizeHtml = function sanitizeHtml(text) {
  if (!text)
    return text;
  var uriAttrs = 'background,cite,href,longdesc,src,xlink:href';
  var htmlAttrs = 'abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,' +
    'color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,' +
    'ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,' +
    'scope,scrolling,shape,size,span,start,summary,tabindex,target,title,type,' +
    'valign,value,vspace,width';
  var svgAttrs = 'accent-height,accumulate,additive,alphabetic,arabic-form,ascent,' +
    'baseProfile,bbox,begin,by,calcMode,cap-height,class,color,color-rendering,content,' +
    'cx,cy,d,dx,dy,descent,display,dur,end,fill,fill-rule,font-family,font-size,font-stretch,' +
    'font-style,font-variant,font-weight,from,fx,fy,g1,g2,glyph-name,gradientUnits,hanging,' +
    'height,horiz-adv-x,horiz-origin-x,ideographic,k,keyPoints,keySplines,keyTimes,lang,' +
    'marker-end,marker-mid,marker-start,markerHeight,markerUnits,markerWidth,mathematical,' +
    'max,min,offset,opacity,orient,origin,overline-position,overline-thickness,panose-1,' +
    'path,pathLength,points,preserveAspectRatio,r,refX,refY,repeatCount,repeatDur,' +
    'requiredExtensions,requiredFeatures,restart,rotate,rx,ry,slope,stemh,stemv,stop-color,' +
    'stop-opacity,strikethrough-position,strikethrough-thickness,stroke,stroke-dasharray,' +
    'stroke-dashoffset,stroke-linecap,stroke-linejoin,stroke-miterlimit,stroke-opacity,' +
    'stroke-width,systemLanguage,target,text-anchor,to,transform,type,u1,u2,underline-position,' +
    'underline-thickness,unicode,unicode-range,units-per-em,values,version,viewBox,visibility,' +
    'width,widths,x,x-height,x1,x2,xlink:actuate,xlink:arcrole,xlink:role,xlink:show,xlink:title,' +
    'xlink:type,xml:base,xml:lang,xml:space,xmlns,xmlns:xlink,y,y1,y2,zoomAndPan';
  var validAttrs = toMap([uriAttrs, svgAttrs.toLowerCase(), htmlAttrs]);

  function toMap(attrs) {
    var obj = {};
    attrs.forEach(function(items) {
      items.split(',').forEach(function(item) {
        obj[item] = true;
      });
    });
    return obj;
  }

  function sanitizeElement(elem) {
    if (!elem || elem.nodeType !== Node.ELEMENT_NODE)
      return;
    var invalidAttrs = [];
    for (var i = 0; i < elem.attributes.length; i++) {
      var attr = elem.attributes[i].nodeName;
      if (validAttrs[attr.toLowerCase()] !== true)
        invalidAttrs.push(attr);
    }
    invalidAttrs.forEach(function(attr) {
      elem.removeAttribute(attr);
    });
    elem.childNodes.forEach(function(node) {
      sanitizeElement(node);
    });
  }
  text = text.replace(/(<script\b[^>]*>[\s\S]*?<\/script>)/gmi, "");
  var xmlDoc = new DOMParser().parseFromString(text, "text/html");
  var nodes = xmlDoc.documentElement.childNodes;
  nodes.forEach(function(node) {
    sanitizeElement(node);
  });
  return xmlDoc.getElementsByTagName('body')[0].innerHTML;
};