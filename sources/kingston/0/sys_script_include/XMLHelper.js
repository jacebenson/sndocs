var XMLHelper = Class.create();
XMLHelper.prototype = {

    initialize : function(xml) {
        this.setXML(xml);
        this.trim = JSUtil.toBoolean(gs.getProperty("glide.xmlhelper.trim.enable", "false"));
    },

    setXML : function(xmlParam) {
         this.xml = xmlParam;

        // if xml is string, or it looks like a string (has trimLeft function and is object)
        // then we want to parse it as a string
        if (typeof xmlParam == 'string' || (typeof xmlParam == 'object' && xmlParam && xmlParam.trimLeft))
            this.xml = GlideXMLUtil.parse(xmlParam);
    },

    // Set whether or not to trim the xml values when going through the toObject method.
    setTrim : function(value) {
        this.trim = value;
    },

    // convert XML to Javascript Object... Use the format specified on
    // http://www.xml.com/pub/a/2006/05/31/converting-between-xml-and-json.html
    toObject : function(xmlParam) {
        if (xmlParam)
            this.setXML(xmlParam);
        if (!this.xml)
            return;

        // borrowed and modified from: http://goessner.net/download/prj/jsonxml/xml2json.js
        var X = {
            toObj : function(xml) {
                var o = {};
                if (xml.getNodeType() == 1) { // element node ..
                    if (xml.attributes.length) // element with attributes ..
                        for ( var i = 0; i < xml.attributes.length; i++) {
                            var nName = xml.attributes.item(i).nodeName;
                            var nValue = '' + xml.attributes.item(i).nodeValue;
                            if (this.trim) nValue = JSUtil.nil(nValue)? "" : nValue.trim();
                            o["@" + nName] = (nValue || "");
                        }
                    if (xml.firstChild) { // element has child nodes ..
                        var textChild = 0, cdataChild = 0, hasElementChild = false;
                        for ( var n = xml.firstChild; n; n = n.nextSibling) {
                            if (n.getNodeType() == 1)
                                hasElementChild = true;
                            else if (n.getNodeType() == 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/))
                                textChild++; // non-whitespace text
                            else if (n.getNodeType() == 4)
                                cdataChild++; // cdata section node
                        }
                        if (hasElementChild) {
                            if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                                X.removeWhite(xml);
                                for ( var n = xml.firstChild; n; n = n.nextSibling) {
                                    if (n.getNodeType() == 3) // text node
                                        o["#text"] = X.escape(n.nodeValue);
                                    else if (n.getNodeType() == 4) // cdata node
                                        o["#cdata"] = X.escape(n.nodeValue);
                                    else if (o[n.nodeName]) { // multiple occurence of element ..
                                        if (o[n.nodeName] instanceof Array)
                                            o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                                        else
                                            o[n.nodeName] = [ o[n.nodeName], X.toObj(n) ];
                                    } else
                                        // first occurence of element..
                                        o[n.nodeName] = X.toObj(n);
                                }
                            } else { // mixed content
                                if (!xml.attributes.length)
                                    o = X.escape(X.innerXml(xml));
                                else
                                    o["#text"] = X.escape(X.innerXml(xml));
                            }
                        } else if (textChild) { // pure text
                            if (!xml.attributes.length)
                                o = X.escape(X.innerXml(xml));
                            else
                                o["#text"] = X.escape(X.innerXml(xml));
                        } else if (cdataChild) { // cdata
                            if (!xml.attributes.length)
                                o = X.escape(xml.firstChild.nodeValue);
                            else
                                for ( var n = xml.firstChild; n; n = n.nextSibling)
                                    o["#cdata"] = X.escape(n.nodeValue);
                        }
                    }
                    if (!xml.attributes.length && !xml.firstChild)
                        o = null;
                } else if (xml.getNodeType() == 9) { // document.node
                    o = X.toObj(xml.documentElement);
                } else
                    gs.log("unhandled node type: " + xml.getNodeType());
                return o;
            },

            innerXml : function(node) {
                var s = "";
                if ("innerHTML" in node)
                    s = node.innerHTML;
                else {
                    var asXml = function(n) {
                        var s = "";
                        if (n.getNodeType() == 1) {
                            s += "<" + n.nodeName;
                            for ( var i = 0; i < n.attributes.length; i++)
                                s += " " + n.attributes.item(i).nodeName + "=\""
                                        + (n.attributes.item(i).nodeValue || "").toString() + "\"";
                            if (n.firstChild) {
                                s += ">";
                                for ( var c = n.firstChild; c; c = c.nextSibling)
                                    s += asXml(c);
                                s += "</" + n.nodeName + ">";
                            } else
                                s += "/>";
                        } else if (n.getNodeType() == 3)
                            s += n.nodeValue;
                        else if (n.getNodeType() == 4)
                            s += "<![CDATA[" + n.nodeValue + "]]>";
                        return s;
                    };
                    for ( var c = node.firstChild; c; c = c.nextSibling)
                        s += asXml(c);
                }
                return s;
            },

            escape : function(txt) {
                var escapedTxt = '' + txt.replaceAll(/[\\]/g, "\\\\").replaceAll(/[\"]/g, '\\"').replaceAll(/[\n]/g, '\\n').replaceAll(/[\r]/g, '\\r');

                if (this.trim) 
                    return JSUtil.nil(escapedTxt)? "" : escapedTxt.trim();

                return escapedTxt;
            },

            removeWhite : function(e) {
                e.normalize();
                for ( var n = e.firstChild; n;) {
                    if (n.getNodeType() == 3) { // text node
                        if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                            var nxt = n.nextSibling;
                            e.removeChild(n);
                            n = nxt;
                        } else
                            n = n.nextSibling;
                    } else if (n.getNodeType() == 1) { // element node
                        X.removeWhite(n);
                        n = n.nextSibling;
                    } else
                        // any other node
                        n = n.nextSibling;
                }
                return e;
            },

            setTrim : function(value) {
                this.trim = value;
            }
        };

        var xml = this.xml;
        X.setTrim(this.trim);
        return X.toObj(X.removeWhite(xml));
    },

    // borrowed and modified from: http://goessner.net/download/prj/jsonxml/json2xml.js
    toXMLDoc : function(o, leaveBlanks) {
       return GlideXMLUtil.parse(this.toXMLStr(o, leaveBlanks));
    },

    toXMLStr : function(o, leaveBlanks) {
        var toXml = function(v, name, ind) {
		   if (typeof(v) == "function")
			  return "";
		   
            var xml = "";
            if (v instanceof Array) {
                for ( var i = 0, n = v.length; i < n; i++)
                    xml += ind + toXml(v[i], name, ind + "\t") + "\n";
            } else if (typeof (v) == "object") {
                var hasChild = false;
                xml += ind + "<" + name;
                for ( var m in v) {
                    if (m.charAt(0) == "@")
                        xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
                    else
                        hasChild = true;
                }
                xml += hasChild ? ">" : "/>";
                if (hasChild) {
                    for ( var m in v) {
                        if (m == "#text")
                            xml += v[m];
                        else if (m == "#cdata")
                            xml += "<![CDATA[" + v[m] + "]]>";
                        else if (m.charAt(0) != "@")
                            xml += toXml(v[m], m, ind + "\t");
                    }
                    xml += (xml.charAt(xml.length - 1) == "\n" ? ind : "") + "</" + name + ">";
                }
            } else {
                xml += ind + "<" + name + ">" + v.toString() + "</" + name + ">";
            }
            return xml;
        };

        xml = "";
        for ( var m in o)
            xml += toXml(o[m], m, "");
		
		if (leaveBlanks)
			return xml;
		
        return xml.replace(/\t|\n/g, "");
    },

    type : "XMLHelper"
}