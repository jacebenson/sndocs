/*! RESOURCE: /scripts/lib/jquery/jquery-2.1.js */
(function(global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
      module.exports = global.document ?
        factory(global, true) :
        function(w) {
          if (!w.document) {
            throw new Error("jQuery requires a window with a document");
          }
          return factory(w);
        };
    } else {
      factory(global);
    }
  }(typeof window !== "undefined" ? window : this, function(window, noGlobal) {
      var arr = [];
      var slice = arr.slice;
      var concat = arr.concat;
      var push = arr.push;
      var indexOf = arr.indexOf;
      var class2type = {};
      var toString = class2type.toString;
      var hasOwn = class2type.hasOwnProperty;
      var support = {};
      var
        document = window.document,
        version = "2.1.4",
        jQuery = function(selector, context) {
          return new jQuery.fn.init(selector, context);
        },
        rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
        rmsPrefix = /^-ms-/,
        rdashAlpha = /-([\da-z])/gi,
        fcamelCase = function(all, letter) {
          return letter.toUpperCase();
        };
      jQuery.fn = jQuery.prototype = {
        jquery: version,
        constructor: jQuery,
        selector: "",
        length: 0,
        toArray: function() {
          return slice.call(this);
        },
        get: function(num) {
          return num != null ?
            (num < 0 ? this[num + this.length] : this[num]) :
            slice.call(this);
        },
        pushStack: function(elems) {
          var ret = jQuery.merge(this.constructor(), elems);
          ret.prevObject = this;
          ret.context = this.context;
          return ret;
        },
        each: function(callback, args) {
          return jQuery.each(this, callback, args);
        },
        map: function(callback) {
          return this.pushStack(jQuery.map(this, function(elem, i) {
            return callback.call(elem, i, elem);
          }));
        },
        slice: function() {
          return this.pushStack(slice.apply(this, arguments));
        },
        first: function() {
          return this.eq(0);
        },
        last: function() {
          return this.eq(-1);
        },
        eq: function(i) {
          var len = this.length,
            j = +i + (i < 0 ? len : 0);
          return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
        },
        end: function() {
          return this.prevObject || this.constructor(null);
        },
        push: push,
        sort: arr.sort,
        splice: arr.splice
      };
      jQuery.extend = jQuery.fn.extend = function() {
        var options, name, src, copy, copyIsArray, clone,
          target = arguments[0] || {},
          i = 1,
          length = arguments.length,
          deep = false;
        if (typeof target === "boolean") {
          deep = target;
          target = arguments[i] || {};
          i++;
        }
        if (typeof target !== "object" && !jQuery.isFunction(target)) {
          target = {};
        }
        if (i === length) {
          target = this;
          i--;
        }
        for (; i < length; i++) {
          if ((options = arguments[i]) != null) {
            for (name in options) {
              src = target[name];
              copy = options[name];
              if (target === copy) {
                continue;
              }
              if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
                if (copyIsArray) {
                  copyIsArray = false;
                  clone = src && jQuery.isArray(src) ? src : [];
                } else {
                  clone = src && jQuery.isPlainObject(src) ? src : {};
                }
                target[name] = jQuery.extend(deep, clone, copy);
              } else if (copy !== undefined) {
                target[name] = copy;
              }
            }
          }
        }
        return target;
      };
      jQuery.extend({
        expando: "jQuery" + (version + Math.random()).replace(/\D/g, ""),
        isReady: true,
        error: function(msg) {
          throw new Error(msg);
        },
        noop: function() {},
        isFunction: function(obj) {
          return jQuery.type(obj) === "function";
        },
        isArray: Array.isArray,
        isWindow: function(obj) {
          return obj != null && obj === obj.window;
        },
        isNumeric: function(obj) {
          return !jQuery.isArray(obj) && (obj - parseFloat(obj) + 1) >= 0;
        },
        isPlainObject: function(obj) {
          if (jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow(obj)) {
            return false;
          }
          if (obj.constructor &&
            !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
            return false;
          }
          return true;
        },
        isEmptyObject: function(obj) {
          var name;
          for (name in obj) {
            return false;
          }
          return true;
        },
        type: function(obj) {
          if (obj == null) {
            return obj + "";
          }
          return typeof obj === "object" || typeof obj === "function" ?
            class2type[toString.call(obj)] || "object" :
            typeof obj;
        },
        globalEval: function(code) {
          var script,
            indirect = eval;
          code = jQuery.trim(code);
          if (code) {
            if (code.indexOf("use strict") === 1) {
              script = document.createElement("script");
              script.text = code;
              document.head.appendChild(script).parentNode.removeChild(script);
            } else {
              indirect(code);
            }
          }
        },
        camelCase: function(string) {
          return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
        },
        nodeName: function(elem, name) {
          return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
        },
        each: function(obj, callback, args) {
          var value,
            i = 0,
            length = obj.length,
            isArray = isArraylike(obj);
          if (args) {
            if (isArray) {
              for (; i < length; i++) {
                value = callback.apply(obj[i], args);
                if (value === false) {
                  break;
                }
              }
            } else {
              for (i in obj) {
                value = callback.apply(obj[i], args);
                if (value === false) {
                  break;
                }
              }
            }
          } else {
            if (isArray) {
              for (; i < length; i++) {
                value = callback.call(obj[i], i, obj[i]);
                if (value === false) {
                  break;
                }
              }
            } else {
              for (i in obj) {
                value = callback.call(obj[i], i, obj[i]);
                if (value === false) {
                  break;
                }
              }
            }
          }
          return obj;
        },
        trim: function(text) {
          return text == null ?
            "" :
            (text + "").replace(rtrim, "");
        },
        makeArray: function(arr, results) {
          var ret = results || [];
          if (arr != null) {
            if (isArraylike(Object(arr))) {
              jQuery.merge(ret,
                typeof arr === "string" ? [arr] : arr
              );
            } else {
              push.call(ret, arr);
            }
          }
          return ret;
        },
        inArray: function(elem, arr, i) {
          return arr == null ? -1 : indexOf.call(arr, elem, i);
        },
        merge: function(first, second) {
          var len = +second.length,
            j = 0,
            i = first.length;
          for (; j < len; j++) {
            first[i++] = second[j];
          }
          first.length = i;
          return first;
        },
        grep: function(elems, callback, invert) {
          var callbackInverse,
            matches = [],
            i = 0,
            length = elems.length,
            callbackExpect = !invert;
          for (; i < length; i++) {
            callbackInverse = !callback(elems[i], i);
            if (callbackInverse !== callbackExpect) {
              matches.push(elems[i]);
            }
          }
          return matches;
        },
        map: function(elems, callback, arg) {
          var value,
            i = 0,
            length = elems.length,
            isArray = isArraylike(elems),
            ret = [];
          if (isArray) {
            for (; i < length; i++) {
              value = callback(elems[i], i, arg);
              if (value != null) {
                ret.push(value);
              }
            }
          } else {
            for (i in elems) {
              value = callback(elems[i], i, arg);
              if (value != null) {
                ret.push(value);
              }
            }
          }
          return concat.apply([], ret);
        },
        guid: 1,
        proxy: function(fn, context) {
          var tmp, args, proxy;
          if (typeof context === "string") {
            tmp = fn[context];
            context = fn;
            fn = tmp;
          }
          if (!jQuery.isFunction(fn)) {
            return undefined;
          }
          args = slice.call(arguments, 2);
          proxy = function() {
            return fn.apply(context || this, args.concat(slice.call(arguments)));
          };
          proxy.guid = fn.guid = fn.guid || jQuery.guid++;
          return proxy;
        },
        now: Date.now,
        support: support
      });
      jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
        class2type["[object " + name + "]"] = name.toLowerCase();
      });

      function isArraylike(obj) {
        var length = "length" in obj && obj.length,
          type = jQuery.type(obj);
        if (type === "function" || jQuery.isWindow(obj)) {
          return false;
        }
        if (obj.nodeType === 1 && length) {
          return true;
        }
        return type === "array" || length === 0 ||
          typeof length === "number" && length > 0 && (length - 1) in obj;
      }
      var Sizzle =
        (function(window) {
          var i,
            support,
            Expr,
            getText,
            isXML,
            tokenize,
            compile,
            select,
            outermostContext,
            sortInput,
            hasDuplicate,
            setDocument,
            document,
            docElem,
            documentIsHTML,
            rbuggyQSA,
            rbuggyMatches,
            matches,
            contains,
            expando = "sizzle" + 1 * new Date(),
            preferredDoc = window.document,
            dirruns = 0,
            done = 0,
            classCache = createCache(),
            tokenCache = createCache(),
            compilerCache = createCache(),
            sortOrder = function(a, b) {
              if (a === b) {
                hasDuplicate = true;
              }
              return 0;
            },
            MAX_NEGATIVE = 1 << 31,
            hasOwn = ({}).hasOwnProperty,
            arr = [],
            pop = arr.pop,
            push_native = arr.push,
            push = arr.push,
            slice = arr.slice,
            indexOf = function(list, elem) {
              var i = 0,
                len = list.length;
              for (; i < len; i++) {
                if (list[i] === elem) {
                  return i;
                }
              }
              return -1;
            },
            booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
            whitespace = "[\\x20\\t\\r\\n\\f]",
            characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",
            identifier = characterEncoding.replace("w", "w#"),
            attributes = "\\[" + whitespace + "*(" + characterEncoding + ")(?:" + whitespace +
            "*([*^$|!~]?=)" + whitespace +
            "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
            "*\\]",
            pseudos = ":(" + characterEncoding + ")(?:\\((" +
            "('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
            "((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
            ".*" +
            ")\\)|)",
            rwhitespace = new RegExp(whitespace + "+", "g"),
            rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"),
            rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"),
            rcombinators = new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*"),
            rattributeQuotes = new RegExp("=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g"),
            rpseudo = new RegExp(pseudos),
            ridentifier = new RegExp("^" + identifier + "$"),
            matchExpr = {
              "ID": new RegExp("^#(" + characterEncoding + ")"),
              "CLASS": new RegExp("^\\.(" + characterEncoding + ")"),
              "TAG": new RegExp("^(" + characterEncoding.replace("w", "w*") + ")"),
              "ATTR": new RegExp("^" + attributes),
              "PSEUDO": new RegExp("^" + pseudos),
              "CHILD": new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
                "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
                "*(\\d+)|))" + whitespace + "*\\)|)", "i"),
              "bool": new RegExp("^(?:" + booleans + ")$", "i"),
              "needsContext": new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
                whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
            },
            rinputs = /^(?:input|select|textarea|button)$/i,
            rheader = /^h\d$/i,
            rnative = /^[^{]+\{\s*\[native \w/,
            rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
            rsibling = /[+~]/,
            rescape = /'|\\/g,
            runescape = new RegExp("\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig"),
            funescape = function(_, escaped, escapedWhitespace) {
              var high = "0x" + escaped - 0x10000;
              return high !== high || escapedWhitespace ?
                escaped :
                high < 0 ?
                String.fromCharCode(high + 0x10000) :
                String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
            },
            unloadHandler = function() {
              setDocument();
            };
          try {
            push.apply(
              (arr = slice.call(preferredDoc.childNodes)),
              preferredDoc.childNodes
            );
            arr[preferredDoc.childNodes.length].nodeType;
          } catch (e) {
            push = {
              apply: arr.length ?
                function(target, els) {
                  push_native.apply(target, slice.call(els));
                } : function(target, els) {
                  var j = target.length,
                    i = 0;
                  while ((target[j++] = els[i++])) {}
                  target.length = j - 1;
                }
            };
          }

          function Sizzle(selector, context, results, seed) {
            var match, elem, m, nodeType,
              i, groups, old, nid, newContext, newSelector;
            if ((context ? context.ownerDocument || context : preferredDoc) !== document) {
              setDocument(context);
            }
            context = context || document;
            results = results || [];
            nodeType = context.nodeType;
            if (typeof selector !== "string" || !selector ||
              nodeType !== 1 && nodeType !== 9 && nodeType !== 11) {
              return results;
            }
            if (!seed && documentIsHTML) {
              if (nodeType !== 11 && (match = rquickExpr.exec(selector))) {
                if ((m = match[1])) {
                  if (nodeType === 9) {
                    elem = context.getElementById(m);
                    if (elem && elem.parentNode) {
                      if (elem.id === m) {
                        results.push(elem);
                        return results;
                      }
                    } else {
                      return results;
                    }
                  } else {
                    if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) &&
                      contains(context, elem) && elem.id === m) {
                      results.push(elem);
                      return results;
                    }
                  }
                } else if (match[2]) {
                  push.apply(results, context.getElementsByTagName(selector));
                  return results;
                } else if ((m = match[3]) && support.getElementsByClassName) {
                  push.apply(results, context.getElementsByClassName(m));
                  return results;
                }
              }
              if (support.qsa && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
                nid = old = expando;
                newContext = context;
                newSelector = nodeType !== 1 && selector;
                if (nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
                  groups = tokenize(selector);
                  if ((old = context.getAttribute("id"))) {
                    nid = old.replace(rescape, "\\$&");
                  } else {
                    context.setAttribute("id", nid);
                  }
                  nid = "[id='" + nid + "'] ";
                  i = groups.length;
                  while (i--) {
                    groups[i] = nid + toSelector(groups[i]);
                  }
                  newContext = rsibling.test(selector) && testContext(context.parentNode) || context;
                  newSelector = groups.join(",");
                }
                if (newSelector) {
                  try {
                    push.apply(results,
                      newContext.querySelectorAll(newSelector)
                    );
                    return results;
                  } catch (qsaError) {} finally {
                    if (!old) {
                      context.removeAttribute("id");
                    }
                  }
                }
              }
            }
            return select(selector.replace(rtrim, "$1"), context, results, seed);
          }

          function createCache() {
            var keys = [];

            function cache(key, value) {
              if (keys.push(key + " ") > Expr.cacheLength) {
                delete cache[keys.shift()];
              }
              return (cache[key + " "] = value);
            }
            return cache;
          }

          function markFunction(fn) {
            fn[expando] = true;
            return fn;
          }

          function assert(fn) {
            var div = document.createElement("div");
            try {
              return !!fn(div);
            } catch (e) {
              return false;
            } finally {
              if (div.parentNode) {
                div.parentNode.removeChild(div);
              }
              div = null;
            }
          }

          function addHandle(attrs, handler) {
            var arr = attrs.split("|"),
              i = attrs.length;
            while (i--) {
              Expr.attrHandle[arr[i]] = handler;
            }
          }

          function siblingCheck(a, b) {
            var cur = b && a,
              diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
              (~b.sourceIndex || MAX_NEGATIVE) -
              (~a.sourceIndex || MAX_NEGATIVE);
            if (diff) {
              return diff;
            }
            if (cur) {
              while ((cur = cur.nextSibling)) {
                if (cur === b) {
                  return -1;
                }
              }
            }
            return a ? 1 : -1;
          }

          function createInputPseudo(type) {
            return function(elem) {
              var name = elem.nodeName.toLowerCase();
              return name === "input" && elem.type === type;
            };
          }

          function createButtonPseudo(type) {
            return function(elem) {
              var name = elem.nodeName.toLowerCase();
              return (name === "input" || name === "button") && elem.type === type;
            };
          }

          function createPositionalPseudo(fn) {
            return markFunction(function(argument) {
              argument = +argument;
              return markFunction(function(seed, matches) {
                var j,
                  matchIndexes = fn([], seed.length, argument),
                  i = matchIndexes.length;
                while (i--) {
                  if (seed[(j = matchIndexes[i])]) {
                    seed[j] = !(matches[j] = seed[j]);
                  }
                }
              });
            });
          }

          function testContext(context) {
            return context && typeof context.getElementsByTagName !== "undefined" && context;
          }
          support = Sizzle.support = {};
          isXML = Sizzle.isXML = function(elem) {
            var documentElement = elem && (elem.ownerDocument || elem).documentElement;
            return documentElement ? documentElement.nodeName !== "HTML" : false;
          };
          setDocument = Sizzle.setDocument = function(node) {
            var hasCompare, parent,
              doc = node ? node.ownerDocument || node : preferredDoc;
            if (doc === document || doc.nodeType !== 9 || !doc.documentElement) {
              return document;
            }
            document = doc;
            docElem = doc.documentElement;
            parent = doc.defaultView;
            if (parent && parent !== parent.top) {
              if (parent.addEventListener) {
                parent.addEventListener("unload", unloadHandler, false);
              } else if (parent.attachEvent) {
                parent.attachEvent("onunload", unloadHandler);
              }
            }
            documentIsHTML = !isXML(doc);
            support.attributes = assert(function(div) {
              div.className = "i";
              return !div.getAttribute("className");
            });
            support.getElementsByTagName = assert(function(div) {
              div.appendChild(doc.createComment(""));
              return !div.getElementsByTagName("*").length;
            });
            support.getElementsByClassName = rnative.test(doc.getElementsByClassName);
            support.getById = assert(function(div) {
              docElem.appendChild(div).id = expando;
              return !doc.getElementsByName || !doc.getElementsByName(expando).length;
            });
            if (support.getById) {
              Expr.find["ID"] = function(id, context) {
                if (typeof context.getElementById !== "undefined" && documentIsHTML) {
                  var m = context.getElementById(id);
                  return m && m.parentNode ? [m] : [];
                }
              };
              Expr.filter["ID"] = function(id) {
                var attrId = id.replace(runescape, funescape);
                return function(elem) {
                  return elem.getAttribute("id") === attrId;
                };
              };
            } else {
              delete Expr.find["ID"];
              Expr.filter["ID"] = function(id) {
                var attrId = id.replace(runescape, funescape);
                return function(elem) {
                  var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
                  return node && node.value === attrId;
                };
              };
            }
            Expr.find["TAG"] = support.getElementsByTagName ?
              function(tag, context) {
                if (typeof context.getElementsByTagName !== "undefined") {
                  return context.getElementsByTagName(tag);
                } else if (support.qsa) {
                  return context.querySelectorAll(tag);
                }
              } :
              function(tag, context) {
                var elem,
                  tmp = [],
                  i = 0,
                  results = context.getElementsByTagName(tag);
                if (tag === "*") {
                  while ((elem = results[i++])) {
                    if (elem.nodeType === 1) {
                      tmp.push(elem);
                    }
                  }
                  return tmp;
                }
                return results;
              };
            Expr.find["CLASS"] = support.getElementsByClassName && function(className, context) {
              if (documentIsHTML) {
                return context.getElementsByClassName(className);
              }
            };
            rbuggyMatches = [];
            rbuggyQSA = [];
            if ((support.qsa = rnative.test(doc.querySelectorAll))) {
              assert(function(div) {
                docElem.appendChild(div).innerHTML = "<a id='" + expando + "'></a>" +
                  "<select id='" + expando + "-\f]' msallowcapture=''>" +
                  "<option selected=''></option></select>";
                if (div.querySelectorAll("[msallowcapture^='']").length) {
                  rbuggyQSA.push("[*^$]=" + whitespace + "*(?:''|\"\")");
                }
                if (!div.querySelectorAll("[selected]").length) {
                  rbuggyQSA.push("\\[" + whitespace + "*(?:value|" + booleans + ")");
                }
                if (!div.querySelectorAll("[id~=" + expando + "-]").length) {
                  rbuggyQSA.push("~=");
                }
                if (!div.querySelectorAll(":checked").length) {
                  rbuggyQSA.push(":checked");
                }
                if (!div.querySelectorAll("a#" + expando + "+*").length) {
                  rbuggyQSA.push(".#.+[+~]");
                }
              });
              assert(function(div) {
                var input = doc.createElement("input");
                input.setAttribute("type", "hidden");
                div.appendChild(input).setAttribute("name", "D");
                if (div.querySelectorAll("[name=d]").length) {
                  rbuggyQSA.push("name" + whitespace + "*[*^$|!~]?=");
                }
                if (!div.querySelectorAll(":enabled").length) {
                  rbuggyQSA.push(":enabled", ":disabled");
                }
                div.querySelectorAll("*,:x");
                rbuggyQSA.push(",.*:");
              });
            }
            if ((support.matchesSelector = rnative.test((matches = docElem.matches ||
                docElem.webkitMatchesSelector ||
                docElem.mozMatchesSelector ||
                docElem.oMatchesSelector ||
                docElem.msMatchesSelector)))) {
              assert(function(div) {
                support.disconnectedMatch = matches.call(div, "div");
                matches.call(div, "[s!='']:x");
                rbuggyMatches.push("!=", pseudos);
              });
            }
            rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));
            rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join("|"));
            hasCompare = rnative.test(docElem.compareDocumentPosition);
            contains = hasCompare || rnative.test(docElem.contains) ?
              function(a, b) {
                var adown = a.nodeType === 9 ? a.documentElement : a,
                  bup = b && b.parentNode;
                return a === bup || !!(bup && bup.nodeType === 1 && (
                  adown.contains ?
                  adown.contains(bup) :
                  a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16
                ));
              } :
              function(a, b) {
                if (b) {
                  while ((b = b.parentNode)) {
                    if (b === a) {
                      return true;
                    }
                  }
                }
                return false;
              };
            sortOrder = hasCompare ?
              function(a, b) {
                if (a === b) {
                  hasDuplicate = true;
                  return 0;
                }
                var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
                if (compare) {
                  return compare;
                }
                compare = (a.ownerDocument || a) === (b.ownerDocument || b) ?
                  a.compareDocumentPosition(b) :
                  1;
                if (compare & 1 ||
                  (!support.sortDetached && b.compareDocumentPosition(a) === compare)) {
                  if (a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a)) {
                    return -1;
                  }
                  if (b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b)) {
                    return 1;
                  }
                  return sortInput ?
                    (indexOf(sortInput, a) - indexOf(sortInput, b)) :
                    0;
                }
                return compare & 4 ? -1 : 1;
              } :
              function(a, b) {
                if (a === b) {
                  hasDuplicate = true;
                  return 0;
                }
                var cur,
                  i = 0,
                  aup = a.parentNode,
                  bup = b.parentNode,
                  ap = [a],
                  bp = [b];
                if (!aup || !bup) {
                  return a === doc ? -1 :
                    b === doc ? 1 :
                    aup ? -1 :
                    bup ? 1 :
                    sortInput ?
                    (indexOf(sortInput, a) - indexOf(sortInput, b)) :
                    0;
                } else if (aup === bup) {
                  return siblingCheck(a, b);
                }
                cur = a;
                while ((cur = cur.parentNode)) {
                  ap.unshift(cur);
                }
                cur = b;
                while ((cur = cur.parentNode)) {
                  bp.unshift(cur);
                }
                while (ap[i] === bp[i]) {
                  i++;
                }
                return i ?
                  siblingCheck(ap[i], bp[i]) :
                  ap[i] === preferredDoc ? -1 :
                  bp[i] === preferredDoc ? 1 :
                  0;
              };
            return doc;
          };
          Sizzle.matches = function(expr, elements) {
            return Sizzle(expr, null, null, elements);
          };
          Sizzle.matchesSelector = function(elem, expr) {
            if ((elem.ownerDocument || elem) !== document) {
              setDocument(elem);
            }
            expr = expr.replace(rattributeQuotes, "='$1']");
            if (support.matchesSelector && documentIsHTML &&
              (!rbuggyMatches || !rbuggyMatches.test(expr)) &&
              (!rbuggyQSA || !rbuggyQSA.test(expr))) {
              try {
                var ret = matches.call(elem, expr);
                if (ret || support.disconnectedMatch ||
                  elem.document && elem.document.nodeType !== 11) {
                  return ret;
                }
              } catch (e) {}
            }
            return Sizzle(expr, document, null, [elem]).length > 0;
          };
          Sizzle.contains = function(context, elem) {
            if ((context.ownerDocument || context) !== document) {
              setDocument(context);
            }
            return contains(context, elem);
          };
          Sizzle.attr = function(elem, name) {
            if ((elem.ownerDocument || elem) !== document) {
              setDocument(elem);
            }
            var fn = Expr.attrHandle[name.toLowerCase()],
              val = fn && hasOwn.call(Expr.attrHandle, name.toLowerCase()) ?
              fn(elem, name, !documentIsHTML) :
              undefined;
            return val !== undefined ?
              val :
              support.attributes || !documentIsHTML ?
              elem.getAttribute(name) :
              (val = elem.getAttributeNode(name)) && val.specified ?
              val.value :
              null;
          };
          Sizzle.error = function(msg) {
            throw new Error("Syntax error, unrecognized expression: " + msg);
          };
          Sizzle.uniqueSort = function(results) {
            var elem,
              duplicates = [],
              j = 0,
              i = 0;
            hasDuplicate = !support.detectDuplicates;
            sortInput = !support.sortStable && results.slice(0);
            results.sort(sortOrder);
            if (hasDuplicate) {
              while ((elem = results[i++])) {
                if (elem === results[i]) {
                  j = duplicates.push(i);
                }
              }
              while (j--) {
                results.splice(duplicates[j], 1);
              }
            }
            sortInput = null;
            return results;
          };
          getText = Sizzle.getText = function(elem) {
            var node,
              ret = "",
              i = 0,
              nodeType = elem.nodeType;
            if (!nodeType) {
              while ((node = elem[i++])) {
                ret += getText(node);
              }
            } else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
              if (typeof elem.textContent === "string") {
                return elem.textContent;
              } else {
                for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                  ret += getText(elem);
                }
              }
            } else if (nodeType === 3 || nodeType === 4) {
              return elem.nodeValue;
            }
            return ret;
          };
          Expr = Sizzle.selectors = {
            cacheLength: 50,
            createPseudo: markFunction,
            match: matchExpr,
            attrHandle: {},
            find: {},
            relative: {
              ">": {
                dir: "parentNode",
                first: true
              },
              " ": {
                dir: "parentNode"
              },
              "+": {
                dir: "previousSibling",
                first: true
              },
              "~": {
                dir: "previousSibling"
              }
            },
            preFilter: {
              "ATTR": function(match) {
                match[1] = match[1].replace(runescape, funescape);
                match[3] = (match[3] || match[4] || match[5] || "").replace(runescape, funescape);
                if (match[2] === "~=") {
                  match[3] = " " + match[3] + " ";
                }
                return match.slice(0, 4);
              },
              "CHILD": function(match) {
                match[1] = match[1].toLowerCase();
                if (match[1].slice(0, 3) === "nth") {
                  if (!match[3]) {
                    Sizzle.error(match[0]);
                  }
                  match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * (match[3] === "even" || match[3] === "odd"));
                  match[5] = +((match[7] + match[8]) || match[3] === "odd");
                } else if (match[3]) {
                  Sizzle.error(match[0]);
                }
                return match;
              },
              "PSEUDO": function(match) {
                var excess,
                  unquoted = !match[6] && match[2];
                if (matchExpr["CHILD"].test(match[0])) {
                  return null;
                }
                if (match[3]) {
                  match[2] = match[4] || match[5] || "";
                } else if (unquoted && rpseudo.test(unquoted) &&
                  (excess = tokenize(unquoted, true)) &&
                  (excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length)) {
                  match[0] = match[0].slice(0, excess);
                  match[2] = unquoted.slice(0, excess);
                }
                return match.slice(0, 3);
              }
            },
            filter: {
              "TAG": function(nodeNameSelector) {
                var nodeName = nodeNameSelector.replace(runescape, funescape).toLowerCase();
                return nodeNameSelector === "*" ?
                  function() {
                    return true;
                  } :
                  function(elem) {
                    return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
                  };
              },
              "CLASS": function(className) {
                var pattern = classCache[className + " "];
                return pattern ||
                  (pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) &&
                  classCache(className, function(elem) {
                    return pattern.test(typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "");
                  });
              },
              "ATTR": function(name, operator, check) {
                return function(elem) {
                  var result = Sizzle.attr(elem, name);
                  if (result == null) {
                    return operator === "!=";
                  }
                  if (!operator) {
                    return true;
                  }
                  result += "";
                  return operator === "=" ? result === check :
                    operator === "!=" ? result !== check :
                    operator === "^=" ? check && result.indexOf(check) === 0 :
                    operator === "*=" ? check && result.indexOf(check) > -1 :
                    operator === "$=" ? check && result.slice(-check.length) === check :
                    operator === "~=" ? (" " + result.replace(rwhitespace, " ") + " ").indexOf(check) > -1 :
                    operator === "|=" ? result === check || result.slice(0, check.length + 1) === check + "-" :
                    false;
                };
              },
              "CHILD": function(type, what, argument, first, last) {
                var simple = type.slice(0, 3) !== "nth",
                  forward = type.slice(-4) !== "last",
                  ofType = what === "of-type";
                return first === 1 && last === 0 ?
                  function(elem) {
                    return !!elem.parentNode;
                  } :
                  function(elem, context, xml) {
                    var cache, outerCache, node, diff, nodeIndex, start,
                      dir = simple !== forward ? "nextSibling" : "previousSibling",
                      parent = elem.parentNode,
                      name = ofType && elem.nodeName.toLowerCase(),
                      useCache = !xml && !ofType;
                    if (parent) {
                      if (simple) {
                        while (dir) {
                          node = elem;
                          while ((node = node[dir])) {
                            if (ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) {
                              return false;
                            }
                          }
                          start = dir = type === "only" && !start && "nextSibling";
                        }
                        return true;
                      }
                      start = [forward ? parent.firstChild : parent.lastChild];
                      if (forward && useCache) {
                        outerCache = parent[expando] || (parent[expando] = {});
                        cache = outerCache[type] || [];
                        nodeIndex = cache[0] === dirruns && cache[1];
                        diff = cache[0] === dirruns && cache[2];
                        node = nodeIndex && parent.childNodes[nodeIndex];
                        while ((node = ++nodeIndex && node && node[dir] ||
                            (diff = nodeIndex = 0) || start.pop())) {
                          if (node.nodeType === 1 && ++diff && node === elem) {
                            outerCache[type] = [dirruns, nodeIndex, diff];
                            break;
                          }
                        }
                      } else if (useCache && (cache = (elem[expando] || (elem[expando] = {}))[type]) && cache[0] === dirruns) {
                        diff = cache[1];
                      } else {
                        while ((node = ++nodeIndex && node && node[dir] ||
                            (diff = nodeIndex = 0) || start.pop())) {
                          if ((ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) && ++diff) {
                            if (useCache) {
                              (node[expando] || (node[expando] = {}))[type] = [dirruns, diff];
                            }
                            if (node === elem) {
                              break;
                            }
                          }
                        }
                      }
                      diff -= last;
                      return diff === first || (diff % first === 0 && diff / first >= 0);
                    }
                  };
              },
              "PSEUDO": function(pseudo, argument) {
                var args,
                  fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] ||
                  Sizzle.error("unsupported pseudo: " + pseudo);
                if (fn[expando]) {
                  return fn(argument);
                }
                if (fn.length > 1) {
                  args = [pseudo, pseudo, "", argument];
                  return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ?
                    markFunction(function(seed, matches) {
                      var idx,
                        matched = fn(seed, argument),
                        i = matched.length;
                      while (i--) {
                        idx = indexOf(seed, matched[i]);
                        seed[idx] = !(matches[idx] = matched[i]);
                      }
                    }) :
                    function(elem) {
                      return fn(elem, 0, args);
                    };
                }
                return fn;
              }
            },
            pseudos: {
              "not": markFunction(function(selector) {
                var input = [],
                  results = [],
                  matcher = compile(selector.replace(rtrim, "$1"));
                return matcher[expando] ?
                  markFunction(function(seed, matches, context, xml) {
                    var elem,
                      unmatched = matcher(seed, null, xml, []),
                      i = seed.length;
                    while (i--) {
                      if ((elem = unmatched[i])) {
                        seed[i] = !(matches[i] = elem);
                      }
                    }
                  }) :
                  function(elem, context, xml) {
                    input[0] = elem;
                    matcher(input, null, xml, results);
                    input[0] = null;
                    return !results.pop();
                  };
              }),
              "has": markFunction(function(selector) {
                return function(elem) {
                  return Sizzle(selector, elem).length > 0;
                };
              }),
              "contains": markFunction(function(text) {
                text = text.replace(runescape, funescape);
                return function(elem) {
                  return (elem.textContent || elem.innerText || getText(elem)).indexOf(text) > -1;
                };
              }),
              "lang": markFunction(function(lang) {
                if (!ridentifier.test(lang || "")) {
                  Sizzle.error("unsupported lang: " + lang);
                }
                lang = lang.replace(runescape, funescape).toLowerCase();
                return function(elem) {
                  var elemLang;
                  do {
                    if ((elemLang = documentIsHTML ?
                        elem.lang :
                        elem.getAttribute("xml:lang") || elem.getAttribute("lang"))) {
                      elemLang = elemLang.toLowerCase();
                      return elemLang === lang || elemLang.indexOf(lang + "-") === 0;
                    }
                  } while ((elem = elem.parentNode) && elem.nodeType === 1);
                  return false;
                };
              }),
              "target": function(elem) {
                var hash = window.location && window.location.hash;
                return hash && hash.slice(1) === elem.id;
              },
              "root": function(elem) {
                return elem === docElem;
              },
              "focus": function(elem) {
                return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
              },
              "enabled": function(elem) {
                return elem.disabled === false;
              },
              "disabled": function(elem) {
                return elem.disabled === true;
              },
              "checked": function(elem) {
                var nodeName = elem.nodeName.toLowerCase();
                return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
              },
              "selected": function(elem) {
                if (elem.parentNode) {
                  elem.parentNode.selectedIndex;
                }
                return elem.selected === true;
              },
              "empty": function(elem) {
                for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                  if (elem.nodeType < 6) {
                    return false;
                  }
                }
                return true;
              },
              "parent": function(elem) {
                return !Expr.pseudos["empty"](elem);
              },
              "header": function(elem) {
                return rheader.test(elem.nodeName);
              },
              "input": function(elem) {
                return rinputs.test(elem.nodeName);
              },
              "button": function(elem) {
                var name = elem.nodeName.toLowerCase();
                return name === "input" && elem.type === "button" || name === "button";
              },
              "text": function(elem) {
                var attr;
                return elem.nodeName.toLowerCase() === "input" &&
                  elem.type === "text" &&
                  ((attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text");
              },
              "first": createPositionalPseudo(function() {
                return [0];
              }),
              "last": createPositionalPseudo(function(matchIndexes, length) {
                return [length - 1];
              }),
              "eq": createPositionalPseudo(function(matchIndexes, length, argument) {
                return [argument < 0 ? argument + length : argument];
              }),
              "even": createPositionalPseudo(function(matchIndexes, length) {
                var i = 0;
                for (; i < length; i += 2) {
                  matchIndexes.push(i);
                }
                return matchIndexes;
              }),
              "odd": createPositionalPseudo(function(matchIndexes, length) {
                var i = 1;
                for (; i < length; i += 2) {
                  matchIndexes.push(i);
                }
                return matchIndexes;
              }),
              "lt": createPositionalPseudo(function(matchIndexes, length, argument) {
                var i = argument < 0 ? argument + length : argument;
                for (; --i >= 0;) {
                  matchIndexes.push(i);
                }
                return matchIndexes;
              }),
              "gt": createPositionalPseudo(function(matchIndexes, length, argument) {
                var i = argument < 0 ? argument + length : argument;
                for (; ++i < length;) {
                  matchIndexes.push(i);
                }
                return matchIndexes;
              })
            }
          };
          Expr.pseudos["nth"] = Expr.pseudos["eq"];
          for (i in {
              radio: true,
              checkbox: true,
              file: true,
              password: true,
              image: true
            }) {
            Expr.pseudos[i] = createInputPseudo(i);
          }
          for (i in {
              submit: true,
              reset: true
            }) {
            Expr.pseudos[i] = createButtonPseudo(i);
          }

          function setFilters() {}
          setFilters.prototype = Expr.filters = Expr.pseudos;
          Expr.setFilters = new setFilters();
          tokenize = Sizzle.tokenize = function(selector, parseOnly) {
            var matched, match, tokens, type,
              soFar, groups, preFilters,
              cached = tokenCache[selector + " "];
            if (cached) {
              return parseOnly ? 0 : cached.slice(0);
            }
            soFar = selector;
            groups = [];
            preFilters = Expr.preFilter;
            while (soFar) {
              if (!matched || (match = rcomma.exec(soFar))) {
                if (match) {
                  soFar = soFar.slice(match[0].length) || soFar;
                }
                groups.push((tokens = []));
              }
              matched = false;
              if ((match = rcombinators.exec(soFar))) {
                matched = match.shift();
                tokens.push({
                  value: matched,
                  type: match[0].replace(rtrim, " ")
                });
                soFar = soFar.slice(matched.length);
              }
              for (type in Expr.filter) {
                if ((match = matchExpr[type].exec(soFar)) && (!preFilters[type] ||
                    (match = preFilters[type](match)))) {
                  matched = match.shift();
                  tokens.push({
                    value: matched,
                    type: type,
                    matches: match
                  });
                  soFar = soFar.slice(matched.length);
                }
              }
              if (!matched) {
                break;
              }
            }
            return parseOnly ?
              soFar.length :
              soFar ?
              Sizzle.error(selector) :
              tokenCache(selector, groups).slice(0);
          };

          function toSelector(tokens) {
            var i = 0,
              len = tokens.length,
              selector = "";
            for (; i < len; i++) {
              selector += tokens[i].value;
            }
            return selector;
          }

          function addCombinator(matcher, combinator, base) {
            var dir = combinator.dir,
              checkNonElements = base && dir === "parentNode",
              doneName = done++;
            return combinator.first ?
              function(elem, context, xml) {
                while ((elem = elem[dir])) {
                  if (elem.nodeType === 1 || checkNonElements) {
                    return matcher(elem, context, xml);
                  }
                }
              } :
              function(elem, context, xml) {
                var oldCache, outerCache,
                  newCache = [dirruns, doneName];
                if (xml) {
                  while ((elem = elem[dir])) {
                    if (elem.nodeType === 1 || checkNonElements) {
                      if (matcher(elem, context, xml)) {
                        return true;
                      }
                    }
                  }
                } else {
                  while ((elem = elem[dir])) {
                    if (elem.nodeType === 1 || checkNonElements) {
                      outerCache = elem[expando] || (elem[expando] = {});
                      if ((oldCache = outerCache[dir]) &&
                        oldCache[0] === dirruns && oldCache[1] === doneName) {
                        return (newCache[2] = oldCache[2]);
                      } else {
                        outerCache[dir] = newCache;
                        if ((newCache[2] = matcher(elem, context, xml))) {
                          return true;
                        }
                      }
                    }
                  }
                }
              };
          }

          function elementMatcher(matchers) {
            return matchers.length > 1 ?
              function(elem, context, xml) {
                var i = matchers.length;
                while (i--) {
                  if (!matchers[i](elem, context, xml)) {
                    return false;
                  }
                }
                return true;
              } :
              matchers[0];
          }

          function multipleContexts(selector, contexts, results) {
            var i = 0,
              len = contexts.length;
            for (; i < len; i++) {
              Sizzle(selector, contexts[i], results);
            }
            return results;
          }

          function condense(unmatched, map, filter, context, xml) {
            var elem,
              newUnmatched = [],
              i = 0,
              len = unmatched.length,
              mapped = map != null;
            for (; i < len; i++) {
              if ((elem = unmatched[i])) {
                if (!filter || filter(elem, context, xml)) {
                  newUnmatched.push(elem);
                  if (mapped) {
                    map.push(i);
                  }
                }
              }
            }
            return newUnmatched;
          }

          function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
            if (postFilter && !postFilter[expando]) {
              postFilter = setMatcher(postFilter);
            }
            if (postFinder && !postFinder[expando]) {
              postFinder = setMatcher(postFinder, postSelector);
            }
            return markFunction(function(seed, results, context, xml) {
              var temp, i, elem,
                preMap = [],
                postMap = [],
                preexisting = results.length,
                elems = seed || multipleContexts(selector || "*", context.nodeType ? [context] : context, []),
                matcherIn = preFilter && (seed || !selector) ?
                condense(elems, preMap, preFilter, context, xml) :
                elems,
                matcherOut = matcher ?
                postFinder || (seed ? preFilter : preexisting || postFilter) ? [] :
                results :
                matcherIn;
              if (matcher) {
                matcher(matcherIn, matcherOut, context, xml);
              }
              if (postFilter) {
                temp = condense(matcherOut, postMap);
                postFilter(temp, [], context, xml);
                i = temp.length;
                while (i--) {
                  if ((elem = temp[i])) {
                    matcherOut[postMap[i]] = !(matcherIn[postMap[i]] = elem);
                  }
                }
              }
              if (seed) {
                if (postFinder || preFilter) {
                  if (postFinder) {
                    temp = [];
                    i = matcherOut.length;
                    while (i--) {
                      if ((elem = matcherOut[i])) {
                        temp.push((matcherIn[i] = elem));
                      }
                    }
                    postFinder(null, (matcherOut = []), temp, xml);
                  }
                  i = matcherOut.length;
                  while (i--) {
                    if ((elem = matcherOut[i]) &&
                      (temp = postFinder ? indexOf(seed, elem) : preMap[i]) > -1) {
                      seed[temp] = !(results[temp] = elem);
                    }
                  }
                }
              } else {
                matcherOut = condense(
                  matcherOut === results ?
                  matcherOut.splice(preexisting, matcherOut.length) :
                  matcherOut
                );
                if (postFinder) {
                  postFinder(null, results, matcherOut, xml);
                } else {
                  push.apply(results, matcherOut);
                }
              }
            });
          }

          function matcherFromTokens(tokens) {
            var checkContext, matcher, j,
              len = tokens.length,
              leadingRelative = Expr.relative[tokens[0].type],
              implicitRelative = leadingRelative || Expr.relative[" "],
              i = leadingRelative ? 1 : 0,
              matchContext = addCombinator(function(elem) {
                return elem === checkContext;
              }, implicitRelative, true),
              matchAnyContext = addCombinator(function(elem) {
                return indexOf(checkContext, elem) > -1;
              }, implicitRelative, true),
              matchers = [function(elem, context, xml) {
                var ret = (!leadingRelative && (xml || context !== outermostContext)) || (
                  (checkContext = context).nodeType ?
                  matchContext(elem, context, xml) :
                  matchAnyContext(elem, context, xml));
                checkContext = null;
                return ret;
              }];
            for (; i < len; i++) {
              if ((matcher = Expr.relative[tokens[i].type])) {
                matchers = [addCombinator(elementMatcher(matchers), matcher)];
              } else {
                matcher = Expr.filter[tokens[i].type].apply(null, tokens[i].matches);
                if (matcher[expando]) {
                  j = ++i;
                  for (; j < len; j++) {
                    if (Expr.relative[tokens[j].type]) {
                      break;
                    }
                  }
                  return setMatcher(
                    i > 1 && elementMatcher(matchers),
                    i > 1 && toSelector(
                      tokens.slice(0, i - 1).concat({
                        value: tokens[i - 2].type === " " ? "*" : ""
                      })
                    ).replace(rtrim, "$1"),
                    matcher,
                    i < j && matcherFromTokens(tokens.slice(i, j)),
                    j < len && matcherFromTokens((tokens = tokens.slice(j))),
                    j < len && toSelector(tokens)
                  );
                }
                matchers.push(matcher);
              }
            }
            return elementMatcher(matchers);
          }

          function matcherFromGroupMatchers(elementMatchers, setMatchers) {
            var bySet = setMatchers.length > 0,
              byElement = elementMatchers.length > 0,
              superMatcher = function(seed, context, xml, results, outermost) {
                var elem, j, matcher,
                  matchedCount = 0,
                  i = "0",
                  unmatched = seed && [],
                  setMatched = [],
                  contextBackup = outermostContext,
                  elems = seed || byElement && Expr.find["TAG"]("*", outermost),
                  dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
                  len = elems.length;
                if (outermost) {
                  outermostContext = context !== document && context;
                }
                for (; i !== len && (elem = elems[i]) != null; i++) {
                  if (byElement && elem) {
                    j = 0;
                    while ((matcher = elementMatchers[j++])) {
                      if (matcher(elem, context, xml)) {
                        results.push(elem);
                        break;
                      }
                    }
                    if (outermost) {
                      dirruns = dirrunsUnique;
                    }
                  }
                  if (bySet) {
                    if ((elem = !matcher && elem)) {
                      matchedCount--;
                    }
                    if (seed) {
                      unmatched.push(elem);
                    }
                  }
                }
                matchedCount += i;
                if (bySet && i !== matchedCount) {
                  j = 0;
                  while ((matcher = setMatchers[j++])) {
                    matcher(unmatched, setMatched, context, xml);
                  }
                  if (seed) {
                    if (matchedCount > 0) {
                      while (i--) {
                        if (!(unmatched[i] || setMatched[i])) {
                          setMatched[i] = pop.call(results);
                        }
                      }
                    }
                    setMatched = condense(setMatched);
                  }
                  push.apply(results, setMatched);
                  if (outermost && !seed && setMatched.length > 0 &&
                    (matchedCount + setMatchers.length) > 1) {
                    Sizzle.uniqueSort(results);
                  }
                }
                if (outermost) {
                  dirruns = dirrunsUnique;
                  outermostContext = contextBackup;
                }
                return unmatched;
              };
            return bySet ?
              markFunction(superMatcher) :
              superMatcher;
          }
          compile = Sizzle.compile = function(selector, match) {
            var i,
              setMatchers = [],
              elementMatchers = [],
              cached = compilerCache[selector + " "];
            if (!cached) {
              if (!match) {
                match = tokenize(selector);
              }
              i = match.length;
              while (i--) {
                cached = matcherFromTokens(match[i]);
                if (cached[expando]) {
                  setMatchers.push(cached);
                } else {
                  elementMatchers.push(cached);
                }
              }
              cached = compilerCache(selector, matcherFromGroupMatchers(elementMatchers, setMatchers));
              cached.selector = selector;
            }
            return cached;
          };
          select = Sizzle.select = function(selector, context, results, seed) {
            var i, tokens, token, type, find,
              compiled = typeof selector === "function" && selector,
              match = !seed && tokenize((selector = compiled.selector || selector));
            results = results || [];
            if (match.length === 1) {
              tokens = match[0] = match[0].slice(0);
              if (tokens.length > 2 && (token = tokens[0]).type === "ID" &&
                support.getById && context.nodeType === 9 && documentIsHTML &&
                Expr.relative[tokens[1].type]) {
                context = (Expr.find["ID"](token.matches[0].replace(runescape, funescape), context) || [])[0];
                if (!context) {
                  return results;
                } else if (compiled) {
                  context = context.parentNode;
                }
                selector = selector.slice(tokens.shift().value.length);
              }
              i = matchExpr["needsContext"].test(selector) ? 0 : tokens.length;
              while (i--) {
                token = tokens[i];
                if (Expr.relative[(type = token.type)]) {
                  break;
                }
                if ((find = Expr.find[type])) {
                  if ((seed = find(
                      token.matches[0].replace(runescape, funescape),
                      rsibling.test(tokens[0].type) && testContext(context.parentNode) || context
                    ))) {
                    tokens.splice(i, 1);
                    selector = seed.length && toSelector(tokens);
                    if (!selector) {
                      push.apply(results, seed);
                      return results;
                    }
                    break;
                  }
                }
              }
            }
            (compiled || compile(selector, match))(
              seed,
              context, !documentIsHTML,
              results,
              rsibling.test(selector) && testContext(context.parentNode) || context
            );
            return results;
          };
          support.sortStable = expando.split("").sort(sortOrder).join("") === expando;
          support.detectDuplicates = !!hasDuplicate;
          setDocument();
          support.sortDetached = assert(function(div1) {
            return div1.compareDocumentPosition(document.createElement("div")) & 1;
          });
          if (!assert(function(div) {
              div.innerHTML = "<a href='#'></a>";
              return div.firstChild.getAttribute("href") === "#";
            })) {
            addHandle("type|href|height|width", function(elem, name, isXML) {
              if (!isXML) {
                return elem.getAttribute(name, name.toLowerCase() === "type" ? 1 : 2);
              }
            });
          }
          if (!support.attributes || !assert(function(div) {
              div.innerHTML = "<input/>";
              div.firstChild.setAttribute("value", "");
              return div.firstChild.getAttribute("value") === "";
            })) {
            addHandle("value", function(elem, name, isXML) {
              if (!isXML && elem.nodeName.toLowerCase() === "input") {
                return elem.defaultValue;
              }
            });
          }
          if (!assert(function(div) {
              return div.getAttribute("disabled") == null;
            })) {
            addHandle(booleans, function(elem, name, isXML) {
              var val;
              if (!isXML) {
                return elem[name] === true ? name.toLowerCase() :
                  (val = elem.getAttributeNode(name)) && val.specified ?
                  val.value :
                  null;
              }
            });
          }
          return Sizzle;
        })(window);
      jQuery.find = Sizzle;
      jQuery.expr = Sizzle.selectors;
      jQuery.expr[":"] = jQuery.expr.pseudos;
      jQuery.unique = Sizzle.uniqueSort;
      jQuery.text = Sizzle.getText;
      jQuery.isXMLDoc = Sizzle.isXML;
      jQuery.contains = Sizzle.contains;
      var rneedsContext = jQuery.expr.match.needsContext;
      var rsingleTag = (/^<(\w+)\s*\/?>(?:<\/\1>|)$/);
      var risSimple = /^.[^:#\[\.,]*$/;

      function winnow(elements, qualifier, not) {
        if (jQuery.isFunction(qualifier)) {
          return jQuery.grep(elements, function(elem, i) {
            return !!qualifier.call(elem, i, elem) !== not;
          });
        }
        if (qualifier.nodeType) {
          return jQuery.grep(elements, function(elem) {
            return (elem === qualifier) !== not;
          });
        }
        if (typeof qualifier === "string") {
          if (risSimple.test(qualifier)) {
            return jQuery.filter(qualifier, elements, not);
          }
          qualifier = jQuery.filter(qualifier, elements);
        }
        return jQuery.grep(elements, function(elem) {
          return (indexOf.call(qualifier, elem) >= 0) !== not;
        });
      }
      jQuery.filter = function(expr, elems, not) {
        var elem = elems[0];
        if (not) {
          expr = ":not(" + expr + ")";
        }
        return elems.length === 1 && elem.nodeType === 1 ?
          jQuery.find.matchesSelector(elem, expr) ? [elem] : [] :
          jQuery.find.matches(expr, jQuery.grep(elems, function(elem) {
            return elem.nodeType === 1;
          }));
      };
      jQuery.fn.extend({
        find: function(selector) {
          var i,
            len = this.length,
            ret = [],
            self = this;
          if (typeof selector !== "string") {
            return this.pushStack(jQuery(selector).filter(function() {
              for (i = 0; i < len; i++) {
                if (jQuery.contains(self[i], this)) {
                  return true;
                }
              }
            }));
          }
          for (i = 0; i < len; i++) {
            jQuery.find(selector, self[i], ret);
          }
          ret = this.pushStack(len > 1 ? jQuery.unique(ret) : ret);
          ret.selector = this.selector ? this.selector + " " + selector : selector;
          return ret;
        },
        filter: function(selector) {
          return this.pushStack(winnow(this, selector || [], false));
        },
        not: function(selector) {
          return this.pushStack(winnow(this, selector || [], true));
        },
        is: function(selector) {
          return !!winnow(
            this,
            typeof selector === "string" && rneedsContext.test(selector) ?
            jQuery(selector) :
            selector || [],
            false
          ).length;
        }
      });
      var rootjQuery,
        rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
        init = jQuery.fn.init = function(selector, context) {
          var match, elem;
          if (!selector) {
            return this;
          }
          if (typeof selector === "string") {
            if (selector[0] === "<" && selector[selector.length - 1] === ">" && selector.length >= 3) {
              match = [null, selector, null];
            } else {
              match = rquickExpr.exec(selector);
            }
            if (match && (match[1] || !context)) {
              if (match[1]) {
                context = context instanceof jQuery ? context[0] : context;
                jQuery.merge(this, jQuery.parseHTML(
                  match[1],
                  context && context.nodeType ? context.ownerDocument || context : document,
                  true
                ));
                if (rsingleTag.test(match[1]) && jQuery.isPlainObject(context)) {
                  for (match in context) {
                    if (jQuery.isFunction(this[match])) {
                      this[match](context[match]);
                    } else {
                      this.attr(match, context[match]);
                    }
                  }
                }
                return this;
              } else {
                elem = document.getElementById(match[2]);
                if (elem && elem.parentNode) {
                  this.length = 1;
                  this[0] = elem;
                }
                this.context = document;
                this.selector = selector;
                return this;
              }
            } else if (!context || context.jquery) {
              return (context || rootjQuery).find(selector);
            } else {
              return this.constructor(context).find(selector);
            }
          } else if (selector.nodeType) {
            this.context = this[0] = selector;
            this.length = 1;
            return this;
          } else if (jQuery.isFunction(selector)) {
            return typeof rootjQuery.ready !== "undefined" ?
              rootjQuery.ready(selector) :
              selector(jQuery);
          }
          if (selector.selector !== undefined) {
            this.selector = selector.selector;
            this.context = selector.context;
          }
          return jQuery.makeArray(selector, this);
        };
      init.prototype = jQuery.fn;
      rootjQuery = jQuery(document);
      var rparentsprev = /^(?:parents|prev(?:Until|All))/,
        guaranteedUnique = {
          children: true,
          contents: true,
          next: true,
          prev: true
        };
      jQuery.extend({
        dir: function(elem, dir, until) {
          var matched = [],
            truncate = until !== undefined;
          while ((elem = elem[dir]) && elem.nodeType !== 9) {
            if (elem.nodeType === 1) {
              if (truncate && jQuery(elem).is(until)) {
                break;
              }
              matched.push(elem);
            }
          }
          return matched;
        },
        sibling: function(n, elem) {
          var matched = [];
          for (; n; n = n.nextSibling) {
            if (n.nodeType === 1 && n !== elem) {
              matched.push(n);
            }
          }
          return matched;
        }
      });
      jQuery.fn.extend({
        has: function(target) {
          var targets = jQuery(target, this),
            l = targets.length;
          return this.filter(function() {
            var i = 0;
            for (; i < l; i++) {
              if (jQuery.contains(this, targets[i])) {
                return true;
              }
            }
          });
        },
        closest: function(selectors, context) {
          var cur,
            i = 0,
            l = this.length,
            matched = [],
            pos = rneedsContext.test(selectors) || typeof selectors !== "string" ?
            jQuery(selectors, context || this.context) :
            0;
          for (; i < l; i++) {
            for (cur = this[i]; cur && cur !== context; cur = cur.parentNode) {
              if (cur.nodeType < 11 && (pos ?
                  pos.index(cur) > -1 :
                  cur.nodeType === 1 &&
                  jQuery.find.matchesSelector(cur, selectors))) {
                matched.push(cur);
                break;
              }
            }
          }
          return this.pushStack(matched.length > 1 ? jQuery.unique(matched) : matched);
        },
        index: function(elem) {
          if (!elem) {
            return (this[0] && this[0].parentNode) ? this.first().prevAll().length : -1;
          }
          if (typeof elem === "string") {
            return indexOf.call(jQuery(elem), this[0]);
          }
          return indexOf.call(this,
            elem.jquery ? elem[0] : elem
          );
        },
        add: function(selector, context) {
          return this.pushStack(
            jQuery.unique(
              jQuery.merge(this.get(), jQuery(selector, context))
            )
          );
        },
        addBack: function(selector) {
          return this.add(selector == null ?
            this.prevObject : this.prevObject.filter(selector)
          );
        }
      });

      function sibling(cur, dir) {
        while ((cur = cur[dir]) && cur.nodeType !== 1) {}
        return cur;
      }
      jQuery.each({
        parent: function(elem) {
          var parent = elem.parentNode;
          return parent && parent.nodeType !== 11 ? parent : null;
        },
        parents: function(elem) {
          return jQuery.dir(elem, "parentNode");
        },
        parentsUntil: function(elem, i, until) {
          return jQuery.dir(elem, "parentNode", until);
        },
        next: function(elem) {
          return sibling(elem, "nextSibling");
        },
        prev: function(elem) {
          return sibling(elem, "previousSibling");
        },
        nextAll: function(elem) {
          return jQuery.dir(elem, "nextSibling");
        },
        prevAll: function(elem) {
          return jQuery.dir(elem, "previousSibling");
        },
        nextUntil: function(elem, i, until) {
          return jQuery.dir(elem, "nextSibling", until);
        },
        prevUntil: function(elem, i, until) {
          return jQuery.dir(elem, "previousSibling", until);
        },
        siblings: function(elem) {
          return jQuery.sibling((elem.parentNode || {}).firstChild, elem);
        },
        children: function(elem) {
          return jQuery.sibling(elem.firstChild);
        },
        contents: function(elem) {
          return elem.contentDocument || jQuery.merge([], elem.childNodes);
        }
      }, function(name, fn) {
        jQuery.fn[name] = function(until, selector) {
          var matched = jQuery.map(this, fn, until);
          if (name.slice(-5) !== "Until") {
            selector = until;
          }
          if (selector && typeof selector === "string") {
            matched = jQuery.filter(selector, matched);
          }
          if (this.length > 1) {
            if (!guaranteedUnique[name]) {
              jQuery.unique(matched);
            }
            if (rparentsprev.test(name)) {
              matched.reverse();
            }
          }
          return this.pushStack(matched);
        };
      });
      var rnotwhite = (/\S+/g);
      var optionsCache = {};

      function createOptions(options) {
        var object = optionsCache[options] = {};
        jQuery.each(options.match(rnotwhite) || [], function(_, flag) {
          object[flag] = true;
        });
        return object;
      }
      jQuery.Callbacks = function(options) {
        options = typeof options === "string" ?
          (optionsCache[options] || createOptions(options)) :
          jQuery.extend({}, options);
        var
          memory,
          fired,
          firing,
          firingStart,
          firingLength,
          firingIndex,
          list = [],
          stack = !options.once && [],
          fire = function(data) {
            memory = options.memory && data;
            fired = true;
            firingIndex = firingStart || 0;
            firingStart = 0;
            firingLength = list.length;
            firing = true;
            for (; list && firingIndex < firingLength; firingIndex++) {
              if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
                memory = false;
                break;
              }
            }
            firing = false;
            if (list) {
              if (stack) {
                if (stack.length) {
                  fire(stack.shift());
                }
              } else if (memory) {
                list = [];
              } else {
                self.disable();
              }
            }
          },
          self = {
            add: function() {
              if (list) {
                var start = list.length;
                (function add(args) {
                  jQuery.each(args, function(_, arg) {
                    var type = jQuery.type(arg);
                    if (type === "function") {
                      if (!options.unique || !self.has(arg)) {
                        list.push(arg);
                      }
                    } else if (arg && arg.length && type !== "string") {
                      add(arg);
                    }
                  });
                })(arguments);
                if (firing) {
                  firingLength = list.length;
                } else if (memory) {
                  firingStart = start;
                  fire(memory);
                }
              }
              return this;
            },
            remove: function() {
              if (list) {
                jQuery.each(arguments, function(_, arg) {
                  var index;
                  while ((index = jQuery.inArray(arg, list, index)) > -1) {
                    list.splice(index, 1);
                    if (firing) {
                      if (index <= firingLength) {
                        firingLength--;
                      }
                      if (index <= firingIndex) {
                        firingIndex--;
                      }
                    }
                  }
                });
              }
              return this;
            },
            has: function(fn) {
              return fn ? jQuery.inArray(fn, list) > -1 : !!(list && list.length);
            },
            empty: function() {
              list = [];
              firingLength = 0;
              return this;
            },
            disable: function() {
              list = stack = memory = undefined;
              return this;
            },
            disabled: function() {
              return !list;
            },
            lock: function() {
              stack = undefined;
              if (!memory) {
                self.disable();
              }
              return this;
            },
            locked: function() {
              return !stack;
            },
            fireWith: function(context, args) {
              if (list && (!fired || stack)) {
                args = args || [];
                args = [context, args.slice ? args.slice() : args];
                if (firing) {
                  stack.push(args);
                } else {
                  fire(args);
                }
              }
              return this;
            },
            fire: function() {
              self.fireWith(this, arguments);
              return this;
            },
            fired: function() {
              return !!fired;
            }
          };
        return self;
      };
      jQuery.extend({
            Deferred: function(func) {
              var tuples = [
                  ["resolve", "done", jQuery.Callbacks("once memory"), "resolved"],
                  ["reject", "fail", jQuery.Callbacks("once memory"), "rejected"],
                  ["notify", "progress", jQuery.Callbacks("memory")]
                ],
                state = "pending",
                promise = {
                  state: function() {
                    return state;
                  },
                  always: function() {
                    deferred.done(arguments).fail(arguments);
                    return this;
                  },
                  then: function() {
                    var fns = arguments;
                    return jQuery.Deferred(function(newDefer) {
                      jQuery.each(tuples, function(i, tuple) {
                        var fn = jQuery.isFunction(fns[i]) && fns[i];
                        deferred[tuple[1]](function() {
                          var returned = fn && fn.apply(this, arguments);
                          if (returned && jQuery.isFunction(returned.promise)) {
                            returned.promise()
                              .done(newDefer.resolve)
                              .fail(newDefer.reject)
                              .progress(newDefer.notify);
                          } else {
                            newDefer[tuple[0] + "With"](this === promise ? newDefer.promise() : this, fn ? [returned] : arguments);
                          }
                        });
                      });
                      fns = null;
                    }).promise();
                  },
                  promise: function(obj) {
                    return obj != null ? jQuery.extend(obj, promise) : promise;
                  }
                },
                deferred = {};
              promise.pipe = promise.then;
              jQuery.each(tuples, function(i, tuple) {
                var list = tuple[2],
                  stateString = tuple[3];
                promise[tuple[1]] = list.add;
                if (stateString) {
                  list.add(function() {
                    state = stateString;
                  }, tuples[i ^ 1][2].disable, tuples[2][2].lock);
                }
                deferred[tuple[0]] = function() {
                  deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments);
                  return this;
                };
                deferred[tuple[0] + "With"] = list.fireWith;
              });
              promise.promise(deferred);
              if (func) {
                func.call(deferred, deferred);
              }
              return deferred;
            },
            when: function(subordinate) {
                var i = 0,
                  resolveValues = slice.call(arguments),
                  length = resolveValues.length,
                  remaining = length !== 1 || (subordinate && jQuery.isFunction(subordinate.promise)) ? length : 0,
                  deferred = remaining === 1 ? subordinate : jQuery.Deferred(),
                  updateFunc = function(i, contexts, values) {
                    return function(value) {
                      contexts[i] = this;
                      values[i] = arguments.length > 1 ? slice.call(arguments) : value;
                      if (values === progressValues) {
                        deferred.notifyWith(contexts, values);
                      } else if (!(--remaining)) {
                        deferred.resolveWith(contexts, values);
                      }
                    };
                  },
                  progressValues, progressContexts, resolveContexts;
                if (length > 1) {
                  progressValues = new Array(length);
                  progressContexts = new Array(length);
                  resolveContexts = new Array(length);
                  for (; i < length; i++) {
                    if (resolveValues[i] && jQuery.isFunction(resolveValues[i].promise)) {
                      resolveValues[i].promise()
                        .done(updateFunc(i, resolveContexts, resolveValues))
                        .fail(deferred.reject)
                        .progress(updateFunc(i, progressContexts, progressValues));
                    } else {
                      --remaining;
                    }
                  }
                }
                if (!remaining) {
                  deferred.resolveWith(resolveCo