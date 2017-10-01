/*! RESOURCE: /scripts/js_includes_ui16_form.js */
/*! RESOURCE: /scripts/angular_includes_1.5.11.js */
/*! RESOURCE: /scripts/angular_1.5.11/angular.min.js */
/*
 AngularJS v1.5.11
 (c) 2010-2017 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(y){'use strict';function G(a,b){b=b||Error;return function(){var d=arguments[0],c;c="["+(a?a+":":"")+d+"] http://errors.angularjs.org/1.5.11/"+(a?a+"/":"")+d;for(d=1;d<arguments.length;d++){c=c+(1==d?"?":"&")+"p"+(d-1)+"=";var f=encodeURIComponent,e;e=arguments[d];e="function"==typeof e?e.toString().replace(/ \{[\s\S]*$/,""):"undefined"==typeof e?"undefined":"string"!=typeof e?JSON.stringify(e):e;c+=f(e)}return new b(c)}}function la(a){if(null==a||Ya(a))return!1;if(I(a)||D(a)||F&&a instanceof
F)return!0;var b="length"in Object(a)&&a.length;return ba(b)&&(0<=b&&(b-1 in a||a instanceof Array)||"function"===typeof a.item)}function q(a,b,d){var c,f;if(a)if(C(a))for(c in a)"prototype"===c||"length"===c||"name"===c||a.hasOwnProperty&&!a.hasOwnProperty(c)||b.call(d,a[c],c,a);else if(I(a)||la(a)){var e="object"!==typeof a;c=0;for(f=a.length;c<f;c++)(e||c in a)&&b.call(d,a[c],c,a)}else if(a.forEach&&a.forEach!==q)a.forEach(b,d,a);else if(xc(a))for(c in a)b.call(d,a[c],c,a);else if("function"===
typeof a.hasOwnProperty)for(c in a)a.hasOwnProperty(c)&&b.call(d,a[c],c,a);else for(c in a)ua.call(a,c)&&b.call(d,a[c],c,a);return a}function yc(a,b,d){for(var c=Object.keys(a).sort(),f=0;f<c.length;f++)b.call(d,a[c[f]],c[f]);return c}function zc(a){return function(b,d){a(d,b)}}function ke(){return++sb}function Rb(a,b,d){for(var c=a.$$hashKey,f=0,e=b.length;f<e;++f){var g=b[f];if(E(g)||C(g))for(var h=Object.keys(g),k=0,l=h.length;k<l;k++){var m=h[k],n=g[m];d&&E(n)?ja(n)?a[m]=new Date(n.valueOf()):
Za(n)?a[m]=new RegExp(n):n.nodeName?a[m]=n.cloneNode(!0):Sb(n)?a[m]=n.clone():(E(a[m])||(a[m]=I(n)?[]:{}),Rb(a[m],[n],!0)):a[m]=n}}c?a.$$hashKey=c:delete a.$$hashKey;return a}function R(a){return Rb(a,va.call(arguments,1),!1)}function le(a){return Rb(a,va.call(arguments,1),!0)}function Z(a){return parseInt(a,10)}function Tb(a,b){return R(Object.create(a),b)}function w(){}function $a(a){return a}function ha(a){return function(){return a}}function Ac(a){return C(a.toString)&&a.toString!==ma}function z(a){return"undefined"===
typeof a}function x(a){return"undefined"!==typeof a}function E(a){return null!==a&&"object"===typeof a}function xc(a){return null!==a&&"object"===typeof a&&!Bc(a)}function D(a){return"string"===typeof a}function ba(a){return"number"===typeof a}function ja(a){return"[object Date]"===ma.call(a)}function C(a){return"function"===typeof a}function Za(a){return"[object RegExp]"===ma.call(a)}function Ya(a){return a&&a.window===a}function ab(a){return a&&a.$evalAsync&&a.$watch}function Ka(a){return"boolean"===
typeof a}function me(a){return a&&ba(a.length)&&ne.test(ma.call(a))}function Sb(a){return!(!a||!(a.nodeName||a.prop&&a.attr&&a.find))}function oe(a){var b={};a=a.split(",");var d;for(d=0;d<a.length;d++)b[a[d]]=!0;return b}function wa(a){return Q(a.nodeName||a[0]&&a[0].nodeName)}function bb(a,b){var d=a.indexOf(b);0<=d&&a.splice(d,1);return d}function sa(a,b){function d(a,b){var d=b.$$hashKey,e;if(I(a)){e=0;for(var f=a.length;e<f;e++)b.push(c(a[e]))}else if(xc(a))for(e in a)b[e]=c(a[e]);else if(a&&
"function"===typeof a.hasOwnProperty)for(e in a)a.hasOwnProperty(e)&&(b[e]=c(a[e]));else for(e in a)ua.call(a,e)&&(b[e]=c(a[e]));d?b.$$hashKey=d:delete b.$$hashKey;return b}function c(a){if(!E(a))return a;var b=e.indexOf(a);if(-1!==b)return g[b];if(Ya(a)||ab(a))throw xa("cpws");var b=!1,c=f(a);void 0===c&&(c=I(a)?[]:Object.create(Bc(a)),b=!0);e.push(a);g.push(c);return b?d(a,c):c}function f(a){switch(ma.call(a)){case "[object Int8Array]":case "[object Int16Array]":case "[object Int32Array]":case "[object Float32Array]":case "[object Float64Array]":case "[object Uint8Array]":case "[object Uint8ClampedArray]":case "[object Uint16Array]":case "[object Uint32Array]":return new a.constructor(c(a.buffer),
a.byteOffset,a.length);case "[object ArrayBuffer]":if(!a.slice){var b=new ArrayBuffer(a.byteLength);(new Uint8Array(b)).set(new Uint8Array(a));return b}return a.slice(0);case "[object Boolean]":case "[object Number]":case "[object String]":case "[object Date]":return new a.constructor(a.valueOf());case "[object RegExp]":return b=new RegExp(a.source,a.toString().match(/[^/]*$/)[0]),b.lastIndex=a.lastIndex,b;case "[object Blob]":return new a.constructor([a],{type:a.type})}if(C(a.cloneNode))return a.cloneNode(!0)}
var e=[],g=[];if(b){if(me(b)||"[object ArrayBuffer]"===ma.call(b))throw xa("cpta");if(a===b)throw xa("cpi");I(b)?b.length=0:q(b,function(a,d){"$$hashKey"!==d&&delete b[d]});e.push(a);g.push(b);return d(a,b)}return c(a)}function na(a,b){if(a===b)return!0;if(null===a||null===b)return!1;if(a!==a&&b!==b)return!0;var d=typeof a,c;if(d===typeof b&&"object"===d)if(I(a)){if(!I(b))return!1;if((d=a.length)===b.length){for(c=0;c<d;c++)if(!na(a[c],b[c]))return!1;return!0}}else{if(ja(a))return ja(b)?na(a.getTime(),
b.getTime()):!1;if(Za(a))return Za(b)?a.toString()===b.toString():!1;if(ab(a)||ab(b)||Ya(a)||Ya(b)||I(b)||ja(b)||Za(b))return!1;d=V();for(c in a)if("$"!==c.charAt(0)&&!C(a[c])){if(!na(a[c],b[c]))return!1;d[c]=!0}for(c in b)if(!(c in d)&&"$"!==c.charAt(0)&&x(b[c])&&!C(b[c]))return!1;return!0}return!1}function cb(a,b,d){return a.concat(va.call(b,d))}function db(a,b){var d=2<arguments.length?va.call(arguments,2):[];return!C(b)||b instanceof RegExp?b:d.length?function(){return arguments.length?b.apply(a,
cb(d,arguments,0)):b.apply(a,d)}:function(){return arguments.length?b.apply(a,arguments):b.call(a)}}function pe(a,b){var d=b;"string"===typeof a&&"$"===a.charAt(0)&&"$"===a.charAt(1)?d=void 0:Ya(b)?d="$WINDOW":b&&y.document===b?d="$DOCUMENT":ab(b)&&(d="$SCOPE");return d}function eb(a,b){if(!z(a))return ba(b)||(b=b?2:null),JSON.stringify(a,pe,b)}function Cc(a){return D(a)?JSON.parse(a):a}function Dc(a,b){a=a.replace(qe,"");var d=Date.parse("Jan 01, 1970 00:00:00 "+a)/6E4;return ia(d)?b:d}function Ub(a,
b,d){d=d?-1:1;var c=a.getTimezoneOffset();b=Dc(b,c);d*=b-c;a=new Date(a.getTime());a.setMinutes(a.getMinutes()+d);return a}function ya(a){a=F(a).clone();try{a.empty()}catch(b){}var d=F("<div>").append(a).html();try{return a[0].nodeType===La?Q(d):d.match(/^(<[^>]+>)/)[1].replace(/^<([\w-]+)/,function(a,b){return"<"+Q(b)})}catch(c){return Q(d)}}function Ec(a){try{return decodeURIComponent(a)}catch(b){}}function Fc(a){var b={};q((a||"").split("&"),function(a){var c,f,e;a&&(f=a=a.replace(/\+/g,"%20"),
c=a.indexOf("="),-1!==c&&(f=a.substring(0,c),e=a.substring(c+1)),f=Ec(f),x(f)&&(e=x(e)?Ec(e):!0,ua.call(b,f)?I(b[f])?b[f].push(e):b[f]=[b[f],e]:b[f]=e))});return b}function Vb(a){var b=[];q(a,function(a,c){I(a)?q(a,function(a){b.push(oa(c,!0)+(!0===a?"":"="+oa(a,!0)))}):b.push(oa(c,!0)+(!0===a?"":"="+oa(a,!0)))});return b.length?b.join("&"):""}function tb(a){return oa(a,!0).replace(/%26/gi,"&").replace(/%3D/gi,"=").replace(/%2B/gi,"+")}function oa(a,b){return encodeURIComponent(a).replace(/%40/gi,
"@").replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%3B/gi,";").replace(/%20/g,b?"%20":"+")}function re(a,b){var d,c,f=Oa.length;for(c=0;c<f;++c)if(d=Oa[c]+b,D(d=a.getAttribute(d)))return d;return null}function se(a,b){var d,c,f={};q(Oa,function(b){b+="app";!d&&a.hasAttribute&&a.hasAttribute(b)&&(d=a,c=a.getAttribute(b))});q(Oa,function(b){b+="app";var f;!d&&(f=a.querySelector("["+b.replace(":","\\:")+"]"))&&(d=f,c=f.getAttribute(b))});d&&(te?(f.strictDi=null!==re(d,"strict-di"),
b(d,c?[c]:[],f)):y.console.error("Angular: disabling automatic bootstrap. <script> protocol indicates an extension, document.location.href does not match."))}function Gc(a,b,d){E(d)||(d={});d=R({strictDi:!1},d);var c=function(){a=F(a);if(a.injector()){var c=a[0]===y.document?"document":ya(a);throw xa("btstrpd",c.replace(/</,"&lt;").replace(/>/,"&gt;"));}b=b||[];b.unshift(["$provide",function(b){b.value("$rootElement",a)}]);d.debugInfoEnabled&&b.push(["$compileProvider",function(a){a.debugInfoEnabled(!0)}]);
b.unshift("ng");c=fb(b,d.strictDi);c.invoke(["$rootScope","$rootElement","$compile","$injector",function(a,b,c,d){a.$apply(function(){b.data("$injector",d);c(b)(a)})}]);return c},f=/^NG_ENABLE_DEBUG_INFO!/,e=/^NG_DEFER_BOOTSTRAP!/;y&&f.test(y.name)&&(d.debugInfoEnabled=!0,y.name=y.name.replace(f,""));if(y&&!e.test(y.name))return c();y.name=y.name.replace(e,"");$.resumeBootstrap=function(a){q(a,function(a){b.push(a)});return c()};C($.resumeDeferredBootstrap)&&$.resumeDeferredBootstrap()}function ue(){y.name=
"NG_ENABLE_DEBUG_INFO!"+y.name;y.location.reload()}function ve(a){a=$.element(a).injector();if(!a)throw xa("test");return a.get("$$testability")}function Hc(a,b){b=b||"_";return a.replace(we,function(a,c){return(c?b:"")+a.toLowerCase()})}function xe(){var a;if(!Ic){var b=ub();(za=z(b)?y.jQuery:b?y[b]:void 0)&&za.fn.on?(F=za,R(za.fn,{scope:Pa.scope,isolateScope:Pa.isolateScope,controller:Pa.controller,injector:Pa.injector,inheritedData:Pa.inheritedData}),a=za.cleanData,za.cleanData=function(b){for(var c,
f=0,e;null!=(e=b[f]);f++)(c=za._data(e,"events"))&&c.$destroy&&za(e).triggerHandler("$destroy");a(b)}):F=W;$.element=F;Ic=!0}}function gb(a,b,d){if(!a)throw xa("areq",b||"?",d||"required");return a}function Qa(a,b,d){d&&I(a)&&(a=a[a.length-1]);gb(C(a),b,"not a function, got "+(a&&"object"===typeof a?a.constructor.name||"Object":typeof a));return a}function Ra(a,b){if("hasOwnProperty"===a)throw xa("badname",b);}function Jc(a,b,d){if(!b)return a;b=b.split(".");for(var c,f=a,e=b.length,g=0;g<e;g++)c=
b[g],a&&(a=(f=a)[c]);return!d&&C(a)?db(f,a):a}function vb(a){for(var b=a[0],d=a[a.length-1],c,f=1;b!==d&&(b=b.nextSibling);f++)if(c||a[f]!==b)c||(c=F(va.call(a,0,f))),c.push(b);return c||a}function V(){return Object.create(null)}function ye(a){function b(a,b,c){return a[b]||(a[b]=c())}var d=G("$injector"),c=G("ng");a=b(a,"angular",Object);a.$$minErr=a.$$minErr||G;return b(a,"module",function(){var a={};return function(e,g,h){if("hasOwnProperty"===e)throw c("badname","module");g&&a.hasOwnProperty(e)&&
(a[e]=null);return b(a,e,function(){function a(b,d,e,f){f||(f=c);return function(){f[e||"push"]([b,d,arguments]);return H}}function b(a,d){return function(b,f){f&&C(f)&&(f.$$moduleName=e);c.push([a,d,arguments]);return H}}if(!g)throw d("nomod",e);var c=[],f=[],r=[],s=a("$injector","invoke","push",f),H={_invokeQueue:c,_configBlocks:f,_runBlocks:r,requires:g,name:e,provider:b("$provide","provider"),factory:b("$provide","factory"),service:b("$provide","service"),value:a("$provide","value"),constant:a("$provide",
"constant","unshift"),decorator:b("$provide","decorator"),animation:b("$animateProvider","register"),filter:b("$filterProvider","register"),controller:b("$controllerProvider","register"),directive:b("$compileProvider","directive"),component:b("$compileProvider","component"),config:s,run:function(a){r.push(a);return this}};h&&s(h);return H})}})}function ka(a,b){if(I(a)){b=b||[];for(var d=0,c=a.length;d<c;d++)b[d]=a[d]}else if(E(a))for(d in b=b||{},a)if("$"!==d.charAt(0)||"$"!==d.charAt(1))b[d]=a[d];
return b||a}function ze(a){R(a,{bootstrap:Gc,copy:sa,extend:R,merge:le,equals:na,element:F,forEach:q,injector:fb,noop:w,bind:db,toJson:eb,fromJson:Cc,identity:$a,isUndefined:z,isDefined:x,isString:D,isFunction:C,isObject:E,isNumber:ba,isElement:Sb,isArray:I,version:Ae,isDate:ja,lowercase:Q,uppercase:wb,callbacks:{$$counter:0},getTestability:ve,$$minErr:G,$$csp:da,reloadWithDebugInfo:ue});Wb=ye(y);Wb("ng",["ngLocale"],["$provide",function(a){a.provider({$$sanitizeUri:Be});a.provider("$compile",Kc).directive({a:Ce,
input:Lc,textarea:Lc,form:De,script:Ee,select:Fe,option:Ge,ngBind:He,ngBindHtml:Ie,ngBindTemplate:Je,ngClass:Ke,ngClassEven:Le,ngClassOdd:Me,ngCloak:Ne,ngController:Oe,ngForm:Pe,ngHide:Qe,ngIf:Re,ngInclude:Se,ngInit:Te,ngNonBindable:Ue,ngPluralize:Ve,ngRepeat:We,ngShow:Xe,ngStyle:Ye,ngSwitch:Ze,ngSwitchWhen:$e,ngSwitchDefault:af,ngOptions:bf,ngTransclude:cf,ngModel:df,ngList:ef,ngChange:ff,pattern:Mc,ngPattern:Mc,required:Nc,ngRequired:Nc,minlength:Oc,ngMinlength:Oc,maxlength:Pc,ngMaxlength:Pc,ngValue:gf,
ngModelOptions:hf}).directive({ngInclude:jf}).directive(xb).directive(Qc);a.provider({$anchorScroll:kf,$animate:lf,$animateCss:mf,$$animateJs:nf,$$animateQueue:of,$$AnimateRunner:pf,$$animateAsyncRun:qf,$browser:rf,$cacheFactory:sf,$controller:tf,$document:uf,$exceptionHandler:vf,$filter:Rc,$$forceReflow:wf,$interpolate:xf,$interval:yf,$http:zf,$httpParamSerializer:Af,$httpParamSerializerJQLike:Bf,$httpBackend:Cf,$xhrFactory:Df,$jsonpCallbacks:Ef,$location:Ff,$log:Gf,$parse:Hf,$rootScope:If,$q:Jf,
$$q:Kf,$sce:Lf,$sceDelegate:Mf,$sniffer:Nf,$templateCache:Of,$templateRequest:Pf,$$testability:Qf,$timeout:Rf,$window:Sf,$$rAF:Tf,$$jqLite:Uf,$$HashMap:Vf,$$cookieReader:Wf})}])}function hb(a){return a.replace(Xf,function(a,d,c,f){return f?c.toUpperCase():c}).replace(Yf,"Moz$1")}function Sc(a){a=a.nodeType;return 1===a||!a||9===a}function Tc(a,b){var d,c,f=b.createDocumentFragment(),e=[];if(Xb.test(a)){d=f.appendChild(b.createElement("div"));c=(Zf.exec(a)||["",""])[1].toLowerCase();c=pa[c]||pa._default;
d.innerHTML=c[1]+a.replace($f,"<$1></$2>")+c[2];for(c=c[0];c--;)d=d.lastChild;e=cb(e,d.childNodes);d=f.firstChild;d.textContent=""}else e.push(b.createTextNode(a));f.textContent="";f.innerHTML="";q(e,function(a){f.appendChild(a)});return f}function Uc(a,b){var d=a.parentNode;d&&d.replaceChild(b,a);b.appendChild(a)}function W(a){if(a instanceof W)return a;var b;D(a)&&(a=Y(a),b=!0);if(!(this instanceof W)){if(b&&"<"!==a.charAt(0))throw Yb("nosel");return new W(a)}if(b){b=y.document;var d;a=(d=ag.exec(a))?
[b.createElement(d[1])]:(d=Tc(a,b))?d.childNodes:[]}Vc(this,a)}function Zb(a){return a.cloneNode(!0)}function yb(a,b){b||ib(a);if(a.querySelectorAll)for(var d=a.querySelectorAll("*"),c=0,f=d.length;c<f;c++)ib(d[c])}function Wc(a,b,d,c){if(x(c))throw Yb("offargs");var f=(c=zb(a))&&c.events,e=c&&c.handle;if(e)if(b){var g=function(b){var c=f[b];x(d)&&bb(c||[],d);x(d)&&c&&0<c.length||(a.removeEventListener(b,e,!1),delete f[b])};q(b.split(" "),function(a){g(a);Ab[a]&&g(Ab[a])})}else for(b in f)"$destroy"!==
b&&a.removeEventListener(b,e,!1),delete f[b]}function ib(a,b){var d=a.ng339,c=d&&jb[d];c&&(b?delete c.data[b]:(c.handle&&(c.events.$destroy&&c.handle({},"$destroy"),Wc(a)),delete jb[d],a.ng339=void 0))}function zb(a,b){var d=a.ng339,d=d&&jb[d];b&&!d&&(a.ng339=d=++bg,d=jb[d]={events:{},data:{},handle:void 0});return d}function $b(a,b,d){if(Sc(a)){var c=x(d),f=!c&&b&&!E(b),e=!b;a=(a=zb(a,!f))&&a.data;if(c)a[b]=d;else{if(e)return a;if(f)return a&&a[b];R(a,b)}}}function Bb(a,b){return a.getAttribute?
-1<(" "+(a.getAttribute("class")||"")+" ").replace(/[\n\t]/g," ").indexOf(" "+b+" "):!1}function Cb(a,b){b&&a.setAttribute&&q(b.split(" "),function(b){a.setAttribute("class",Y((" "+(a.getAttribute("class")||"")+" ").replace(/[\n\t]/g," ").replace(" "+Y(b)+" "," ")))})}function Db(a,b){if(b&&a.setAttribute){var d=(" "+(a.getAttribute("class")||"")+" ").replace(/[\n\t]/g," ");q(b.split(" "),function(a){a=Y(a);-1===d.indexOf(" "+a+" ")&&(d+=a+" ")});a.setAttribute("class",Y(d))}}function Vc(a,b){if(b)if(b.nodeType)a[a.length++]=
b;else{var d=b.length;if("number"===typeof d&&b.window!==b){if(d)for(var c=0;c<d;c++)a[a.length++]=b[c]}else a[a.length++]=b}}function Xc(a,b){return Eb(a,"$"+(b||"ngController")+"Controller")}function Eb(a,b,d){9===a.nodeType&&(a=a.documentElement);for(b=I(b)?b:[b];a;){for(var c=0,f=b.length;c<f;c++)if(x(d=F.data(a,b[c])))return d;a=a.parentNode||11===a.nodeType&&a.host}}function Yc(a){for(yb(a,!0);a.firstChild;)a.removeChild(a.firstChild)}function Fb(a,b){b||yb(a);var d=a.parentNode;d&&d.removeChild(a)}
function cg(a,b){b=b||y;if("complete"===b.document.readyState)b.setTimeout(a);else F(b).on("load",a)}function Zc(a,b){var d=Gb[b.toLowerCase()];return d&&$c[wa(a)]&&d}function dg(a,b){var d=function(c,d){c.isDefaultPrevented=function(){return c.defaultPrevented};var e=b[d||c.type],g=e?e.length:0;if(g){if(z(c.immediatePropagationStopped)){var h=c.stopImmediatePropagation;c.stopImmediatePropagation=function(){c.immediatePropagationStopped=!0;c.stopPropagation&&c.stopPropagation();h&&h.call(c)}}c.isImmediatePropagationStopped=
function(){return!0===c.immediatePropagationStopped};var k=e.specialHandlerWrapper||eg;1<g&&(e=ka(e));for(var l=0;l<g;l++)c.isImmediatePropagationStopped()||k(a,c,e[l])}};d.elem=a;return d}function eg(a,b,d){d.call(a,b)}function fg(a,b,d){var c=b.relatedTarget;c&&(c===a||gg.call(a,c))||d.call(a,b)}function Uf(){this.$get=function(){return R(W,{hasClass:function(a,b){a.attr&&(a=a[0]);return Bb(a,b)},addClass:function(a,b){a.attr&&(a=a[0]);return Db(a,b)},removeClass:function(a,b){a.attr&&(a=a[0]);
return Cb(a,b)}})}}function Aa(a,b){var d=a&&a.$$hashKey;if(d)return"function"===typeof d&&(d=a.$$hashKey()),d;d=typeof a;return d="function"===d||"object"===d&&null!==a?a.$$hashKey=d+":"+(b||ke)():d+":"+a}function Sa(a,b){if(b){var d=0;this.nextUid=function(){return++d}}q(a,this.put,this)}function ad(a){a=(Function.prototype.toString.call(a)+" ").replace(hg,"");return a.match(ig)||a.match(jg)}function kg(a){return(a=ad(a))?"function("+(a[1]||"").replace(/[\s\r\n]+/," ")+")":"fn"}function fb(a,b){function d(a){return function(b,
c){if(E(b))q(b,zc(a));else return a(b,c)}}function c(a,b){Ra(a,"service");if(C(b)||I(b))b=r.instantiate(b);if(!b.$get)throw Ba("pget",a);return n[a+"Provider"]=b}function f(a,b){return function(){var c=u.invoke(b,this);if(z(c))throw Ba("undef",a);return c}}function e(a,b,d){return c(a,{$get:!1!==d?f(a,b):b})}function g(a){gb(z(a)||I(a),"modulesToLoad","not an array");var b=[],c;q(a,function(a){function d(a){var b,c;b=0;for(c=a.length;b<c;b++){var e=a[b],f=r.get(e[0]);f[e[1]].apply(f,e[2])}}if(!m.get(a)){m.put(a,
!0);try{D(a)?(c=Wb(a),b=b.concat(g(c.requires)).concat(c._runBlocks),d(c._invokeQueue),d(c._configBlocks)):C(a)?b.push(r.invoke(a)):I(a)?b.push(r.invoke(a)):Qa(a,"module")}catch(e){throw I(a)&&(a=a[a.length-1]),e.message&&e.stack&&-1===e.stack.indexOf(e.message)&&(e=e.message+"\n"+e.stack),Ba("modulerr",a,e.stack||e.message||e);}}});return b}function h(a,c){function d(b,e){if(a.hasOwnProperty(b)){if(a[b]===k)throw Ba("cdep",b+" <- "+l.join(" <- "));return a[b]}try{return l.unshift(b),a[b]=k,a[b]=
c(b,e),a[b]}catch(f){throw a[b]===k&&delete a[b],f;}finally{l.shift()}}function e(a,c,f){var g=[];a=fb.$$annotate(a,b,f);for(var h=0,k=a.length;h<k;h++){var l=a[h];if("string"!==typeof l)throw Ba("itkn",l);g.push(c&&c.hasOwnProperty(l)?c[l]:d(l,f))}return g}return{invoke:function(a,b,c,d){"string"===typeof c&&(d=c,c=null);c=e(a,c,d);I(a)&&(a=a[a.length-1]);d=11>=Ia?!1:"function"===typeof a&&/^(?:class\b|constructor\()/.test(Function.prototype.toString.call(a)+" ");return d?(c.unshift(null),new (Function.prototype.bind.apply(a,
c))):a.apply(b,c)},instantiate:function(a,b,c){var d=I(a)?a[a.length-1]:a;a=e(a,b,c);a.unshift(null);return new (Function.prototype.bind.apply(d,a))},get:d,annotate:fb.$$annotate,has:function(b){return n.hasOwnProperty(b+"Provider")||a.hasOwnProperty(b)}}}b=!0===b;var k={},l=[],m=new Sa([],!0),n={$provide:{provider:d(c),factory:d(e),service:d(function(a,b){return e(a,["$injector",function(a){return a.instantiate(b)}])}),value:d(function(a,b){return e(a,ha(b),!1)}),constant:d(function(a,b){Ra(a,"constant");
n[a]=b;s[a]=b}),decorator:function(a,b){var c=r.get(a+"Provider"),d=c.$get;c.$get=function(){var a=u.invoke(d,c);return u.invoke(b,null,{$delegate:a})}}}},r=n.$injector=h(n,function(a,b){$.isString(b)&&l.push(b);throw Ba("unpr",l.join(" <- "));}),s={},H=h(s,function(a,b){var c=r.get(a+"Provider",b);return u.invoke(c.$get,c,void 0,a)}),u=H;n.$injectorProvider={$get:ha(H)};var p=g(a),u=H.get("$injector");u.strictDi=b;q(p,function(a){a&&u.invoke(a)});return u}function kf(){var a=!0;this.disableAutoScrolling=
function(){a=!1};this.$get=["$window","$location","$rootScope",function(b,d,c){function f(a){var b=null;Array.prototype.some.call(a,function(a){if("a"===wa(a))return b=a,!0});return b}function e(a){if(a){a.scrollIntoView();var c;c=g.yOffset;C(c)?c=c():Sb(c)?(c=c[0],c="fixed"!==b.getComputedStyle(c).position?0:c.getBoundingClientRect().bottom):ba(c)||(c=0);c&&(a=a.getBoundingClientRect().top,b.scrollBy(0,a-c))}else b.scrollTo(0,0)}function g(a){a=D(a)?a:ba(a)?a.toString():d.hash();var b;a?(b=h.getElementById(a))?
e(b):(b=f(h.getElementsByName(a)))?e(b):"top"===a&&e(null):e(null)}var h=b.document;a&&c.$watch(function(){return d.hash()},function(a,b){a===b&&""===a||cg(function(){c.$evalAsync(g)})});return g}]}function kb(a,b){if(!a&&!b)return"";if(!a)return b;if(!b)return a;I(a)&&(a=a.join(" "));I(b)&&(b=b.join(" "));return a+" "+b}function lg(a){D(a)&&(a=a.split(" "));var b=V();q(a,function(a){a.length&&(b[a]=!0)});return b}function Ca(a){return E(a)?a:{}}function mg(a,b,d,c){function f(a){try{a.apply(null,
va.call(arguments,1))}finally{if(H--,0===H)for(;u.length;)try{u.pop()()}catch(b){d.error(b)}}}function e(){N=null;g();h()}function g(){p=L();p=z(p)?null:p;na(p,J)&&(p=J);J=p}function h(){if(A!==k.url()||K!==p)A=k.url(),K=p,q(O,function(a){a(k.url(),p)})}var k=this,l=a.location,m=a.history,n=a.setTimeout,r=a.clearTimeout,s={};k.isMock=!1;var H=0,u=[];k.$$completeOutstandingRequest=f;k.$$incOutstandingRequestCount=function(){H++};k.notifyWhenNoOutstandingRequests=function(a){0===H?a():u.push(a)};var p,
K,A=l.href,v=b.find("base"),N=null,L=c.history?function(){try{return m.state}catch(a){}}:w;g();K=p;k.url=function(b,d,e){z(e)&&(e=null);l!==a.location&&(l=a.location);m!==a.history&&(m=a.history);if(b){var f=K===e;if(A===b&&(!c.history||f))return k;var h=A&&Ga(A)===Ga(b);A=b;K=e;!c.history||h&&f?(h||(N=b),d?l.replace(b):h?(d=l,e=b.indexOf("#"),e=-1===e?"":b.substr(e),d.hash=e):l.href=b,l.href!==b&&(N=b)):(m[d?"replaceState":"pushState"](e,"",b),g(),K=p);N&&(N=b);return k}return N||l.href.replace(/%27/g,
"'")};k.state=function(){return p};var O=[],M=!1,J=null;k.onUrlChange=function(b){if(!M){if(c.history)F(a).on("popstate",e);F(a).on("hashchange",e);M=!0}O.push(b);return b};k.$$applicationDestroyed=function(){F(a).off("hashchange popstate",e)};k.$$checkUrlChange=h;k.baseHref=function(){var a=v.attr("href");return a?a.replace(/^(https?:)?\/\/[^/]*/,""):""};k.defer=function(a,b){var c;H++;c=n(function(){delete s[c];f(a)},b||0);s[c]=!0;return c};k.defer.cancel=function(a){return s[a]?(delete s[a],r(a),
f(w),!0):!1}}function rf(){this.$get=["$window","$log","$sniffer","$document",function(a,b,d,c){return new mg(a,c,b,d)}]}function sf(){this.$get=function(){function a(a,c){function f(a){a!==n&&(r?r===a&&(r=a.n):r=a,e(a.n,a.p),e(a,n),n=a,n.n=null)}function e(a,b){a!==b&&(a&&(a.p=b),b&&(b.n=a))}if(a in b)throw G("$cacheFactory")("iid",a);var g=0,h=R({},c,{id:a}),k=V(),l=c&&c.capacity||Number.MAX_VALUE,m=V(),n=null,r=null;return b[a]={put:function(a,b){if(!z(b)){if(l<Number.MAX_VALUE){var c=m[a]||(m[a]=
{key:a});f(c)}a in k||g++;k[a]=b;g>l&&this.remove(r.key);return b}},get:function(a){if(l<Number.MAX_VALUE){var b=m[a];if(!b)return;f(b)}return k[a]},remove:function(a){if(l<Number.MAX_VALUE){var b=m[a];if(!b)return;b===n&&(n=b.p);b===r&&(r=b.n);e(b.n,b.p);delete m[a]}a in k&&(delete k[a],g--)},removeAll:function(){k=V();g=0;m=V();n=r=null},destroy:function(){m=h=k=null;delete b[a]},info:function(){return R({},h,{size:g})}}}var b={};a.info=function(){var a={};q(b,function(b,f){a[f]=b.info()});return a};
a.get=function(a){return b[a]};return a}}function Of(){this.$get=["$cacheFactory",function(a){return a("templates")}]}function Kc(a,b){function d(a,b,c){var d=/^\s*([@&<]|=(\*?))(\??)\s*([\w$]*)\s*$/,e=V();q(a,function(a,f){if(a in n)e[f]=n[a];else{var g=a.match(d);if(!g)throw fa("iscp",b,f,a,c?"controller bindings definition":"isolate scope definition");e[f]={mode:g[1][0],collection:"*"===g[2],optional:"?"===g[3],attrName:g[4]||f};g[4]&&(n[a]=e[f])}});return e}function c(a){var b=a.charAt(0);if(!b||
b!==Q(b))throw fa("baddir",a);if(a!==a.trim())throw fa("baddir",a);}function f(a){var b=a.require||a.controller&&a.name;!I(b)&&E(b)&&q(b,function(a,c){var d=a.match(l);a.substring(d[0].length)||(b[c]=d[0]+c)});return b}var e={},g=/^\s*directive:\s*([\w-]+)\s+(.*)$/,h=/(([\w-]+)(?::([^;]+))?;?)/,k=oe("ngSrc,ngSrcset,src,srcset"),l=/^(?:(\^\^?)?(\?)?(\^\^?)?)?/,m=/^(on[a-z]+|formaction)$/,n=V();this.directive=function A(b,d){gb(b,"name");Ra(b,"directive");D(b)?(c(b),gb(d,"directiveFactory"),e.hasOwnProperty(b)||
(e[b]=[],a.factory(b+"Directive",["$injector","$exceptionHandler",function(a,c){var d=[];q(e[b],function(e,g){try{var h=a.invoke(e);C(h)?h={compile:ha(h)}:!h.compile&&h.link&&(h.compile=ha(h.link));h.priority=h.priority||0;h.index=g;h.name=h.name||b;h.require=f(h);var k=h,l=h.restrict;if(l&&(!D(l)||!/[EACM]/.test(l)))throw fa("badrestrict",l,b);k.restrict=l||"EA";h.$$moduleName=e.$$moduleName;d.push(h)}catch(m){c(m)}});return d}])),e[b].push(d)):q(b,zc(A));return this};this.component=function(a,b){function c(a){function e(b){return C(b)||
I(b)?function(c,d){return a.invoke(b,this,{$element:c,$attrs:d})}:b}var f=b.template||b.templateUrl?b.template:"",g={controller:d,controllerAs:ng(b.controller)||b.controllerAs||"$ctrl",template:e(f),templateUrl:e(b.templateUrl),transclude:b.transclude,scope:{},bindToController:b.bindings||{},restrict:"E",require:b.require};q(b,function(a,b){"$"===b.charAt(0)&&(g[b]=a)});return g}var d=b.controller||function(){};q(b,function(a,b){"$"===b.charAt(0)&&(c[b]=a,C(d)&&(d[b]=a))});c.$inject=["$injector"];
return this.directive(a,c)};this.aHrefSanitizationWhitelist=function(a){return x(a)?(b.aHrefSanitizationWhitelist(a),this):b.aHrefSanitizationWhitelist()};this.imgSrcSanitizationWhitelist=function(a){return x(a)?(b.imgSrcSanitizationWhitelist(a),this):b.imgSrcSanitizationWhitelist()};var r=!0;this.debugInfoEnabled=function(a){return x(a)?(r=a,this):r};var s=!0;this.preAssignBindingsEnabled=function(a){return x(a)?(s=a,this):s};var H=10;this.onChangesTtl=function(a){return arguments.length?(H=a,this):
H};var u=!0;this.commentDirectivesEnabled=function(a){return arguments.length?(u=a,this):u};var p=!0;this.cssClassDirectivesEnabled=function(a){return arguments.length?(p=a,this):p};this.$get=["$injector","$interpolate","$exceptionHandler","$templateRequest","$parse","$controller","$rootScope","$sce","$animate","$$sanitizeUri",function(a,b,c,f,n,M,J,B,T,S){function P(){try{if(!--xa)throw da=void 0,fa("infchng",H);J.$apply(function(){for(var a=[],b=0,c=da.length;b<c;++b)try{da[b]()}catch(d){a.push(d)}da=
void 0;if(a.length)throw a;})}finally{xa++}}function t(a,b){if(b){var c=Object.keys(b),d,e,f;d=0;for(e=c.length;d<e;d++)f=c[d],this[f]=b[f]}else this.$attr={};this.$$element=a}function qa(a,b,c){ta.innerHTML="<span "+b+">";b=ta.firstChild.attributes;var d=b[0];b.removeNamedItem(d.name);d.value=c;a.attributes.setNamedItem(d)}function Ja(a,b){try{a.addClass(b)}catch(c){}}function ca(a,b,c,d,e){a instanceof F||(a=F(a));for(var f=/\S+/,g=0,h=a.length;g<h;g++){var k=a[g];k.nodeType===La&&k.nodeValue.match(f)&&
Uc(k,a[g]=y.document.createElement("span"))}var l=Ma(a,b,a,c,d,e);ca.$$addScopeClass(a);var m=null;return function(b,c,d){gb(b,"scope");e&&e.needsNewScope&&(b=b.$parent.$new());d=d||{};var f=d.parentBoundTranscludeFn,g=d.transcludeControllers;d=d.futureParentElement;f&&f.$$boundTransclude&&(f=f.$$boundTransclude);m||(m=(d=d&&d[0])?"foreignobject"!==wa(d)&&ma.call(d).match(/SVG/)?"svg":"html":"html");d="html"!==m?F(ha(m,F("<div>").append(a).html())):c?Pa.clone.call(a):a;if(g)for(var h in g)d.data("$"+
h+"Controller",g[h].instance);ca.$$addScopeInfo(d,b);c&&c(d,b);l&&l(b,d,d,f);return d}}function Ma(a,b,c,d,e,f){function g(a,c,d,e){var f,k,l,m,n,s,A;if(p)for(A=Array(c.length),m=0;m<h.length;m+=3)f=h[m],A[f]=c[f];else A=c;m=0;for(n=h.length;m<n;)k=A[h[m++]],c=h[m++],f=h[m++],c?(c.scope?(l=a.$new(),ca.$$addScopeInfo(F(k),l)):l=a,s=c.transcludeOnThisElement?G(a,c.transclude,e):!c.templateOnThisElement&&e?e:!e&&b?G(a,b):null,c(f,l,k,d,s)):f&&f(a,k.childNodes,void 0,e)}for(var h=[],k,l,m,n,p,s=0;s<a.length;s++){k=
new t;l=cc(a[s],[],k,0===s?d:void 0,e);(f=l.length?W(l,a[s],k,b,c,null,[],[],f):null)&&f.scope&&ca.$$addScopeClass(k.$$element);k=f&&f.terminal||!(m=a[s].childNodes)||!m.length?null:Ma(m,f?(f.transcludeOnThisElement||!f.templateOnThisElement)&&f.transclude:b);if(f||k)h.push(s,f,k),n=!0,p=p||f;f=null}return n?g:null}function G(a,b,c){function d(e,f,g,h,k){e||(e=a.$new(!1,k),e.$$transcluded=!0);return b(e,f,{parentBoundTranscludeFn:c,transcludeControllers:g,futureParentElement:h})}var e=d.$$slots=V(),
f;for(f in b.$$slots)e[f]=b.$$slots[f]?G(a,b.$$slots[f],c):null;return d}function cc(a,b,c,d,e){var f=c.$attr,g;switch(a.nodeType){case 1:g=wa(a);U(b,Da(g),"E",d,e);for(var k,l,m,n,p=a.attributes,s=0,A=p&&p.length;s<A;s++){var r=!1,u=!1;k=p[s];l=k.name;m=Y(k.value);k=Da(l);(n=Ga.test(k))&&(l=l.replace(bd,"").substr(8).replace(/_(.)/g,function(a,b){return b.toUpperCase()}));(k=k.match(Ha))&&Z(k[1])&&(r=l,u=l.substr(0,l.length-5)+"end",l=l.substr(0,l.length-6));k=Da(l.toLowerCase());f[k]=l;if(n||!c.hasOwnProperty(k))c[k]=
m,Zc(a,k)&&(c[k]=!0);pa(a,b,m,k,n);U(b,k,"A",d,e,r,u)}"input"===g&&"hidden"===a.getAttribute("type")&&a.setAttribute("autocomplete","off");if(!Fa)break;f=a.className;E(f)&&(f=f.animVal);if(D(f)&&""!==f)for(;a=h.exec(f);)k=Da(a[2]),U(b,k,"C",d,e)&&(c[k]=Y(a[3])),f=f.substr(a.index+a[0].length);break;case La:if(11===Ia)for(;a.parentNode&&a.nextSibling&&a.nextSibling.nodeType===La;)a.nodeValue+=a.nextSibling.nodeValue,a.parentNode.removeChild(a.nextSibling);ka(b,a.nodeValue);break;case 8:if(!Ea)break;
Ta(a,b,c,d,e)}b.sort(ja);return b}function Ta(a,b,c,d,e){try{var f=g.exec(a.nodeValue);if(f){var h=Da(f[1]);U(b,h,"M",d,e)&&(c[h]=Y(f[2]))}}catch(k){}}function cd(a,b,c){var d=[],e=0;if(b&&a.hasAttribute&&a.hasAttribute(b)){do{if(!a)throw fa("uterdir",b,c);1===a.nodeType&&(a.hasAttribute(b)&&e++,a.hasAttribute(c)&&e--);d.push(a);a=a.nextSibling}while(0<e)}else d.push(a);return F(d)}function dd(a,b,c){return function(d,e,f,g,h){e=cd(e[0],b,c);return a(d,e,f,g,h)}}function dc(a,b,c,d,e,f){var g;return a?
ca(b,c,d,e,f):function(){g||(g=ca(b,c,d,e,f),b=c=f=null);return g.apply(this,arguments)}}function W(a,b,d,e,f,g,h,k,l){function m(a,b,c,d){if(a){c&&(a=dd(a,c,d));a.require=v.require;a.directiveName=S;if(u===v||v.$$isolateScope)a=ra(a,{isolateScope:!0});h.push(a)}if(b){c&&(b=dd(b,c,d));b.require=v.require;b.directiveName=S;if(u===v||v.$$isolateScope)b=ra(b,{isolateScope:!0});k.push(b)}}function n(a,e,f,g,l){function m(a,b,c,d){var e;ab(a)||(d=c,c=b,b=a,a=void 0);H&&(e=J);c||(c=H?P.parent():P);if(d){var f=
l.$$slots[d];if(f)return f(a,b,e,c,qa);if(z(f))throw fa("noslot",d,ya(P));}else return l(a,b,e,c,qa)}var p,v,B,M,T,J,S,P;b===f?(g=d,P=d.$$element):(P=F(f),g=new t(P,d));T=e;u?M=e.$new(!0):A&&(T=e.$parent);l&&(S=m,S.$$boundTransclude=l,S.isSlotFilled=function(a){return!!l.$$slots[a]});r&&(J=ba(P,g,S,r,M,e,u));u&&(ca.$$addScopeInfo(P,M,!0,!(O&&(O===u||O===u.$$originalDirective))),ca.$$addScopeClass(P,!0),M.$$isolateBindings=u.$$isolateBindings,v=la(e,g,M,M.$$isolateBindings,u),v.removeWatches&&M.$on("$destroy",
v.removeWatches));for(p in J){v=r[p];B=J[p];var L=v.$$bindings.bindToController;if(s){B.bindingInfo=L?la(T,g,B.instance,L,v):{};var ac=B();ac!==B.instance&&(B.instance=ac,P.data("$"+v.name+"Controller",ac),B.bindingInfo.removeWatches&&B.bindingInfo.removeWatches(),B.bindingInfo=la(T,g,B.instance,L,v))}else B.instance=B(),P.data("$"+v.name+"Controller",B.instance),B.bindingInfo=la(T,g,B.instance,L,v)}q(r,function(a,b){var c=a.require;a.bindToController&&!I(c)&&E(c)&&R(J[b].instance,X(b,c,P,J))});q(J,
function(a){var b=a.instance;if(C(b.$onChanges))try{b.$onChanges(a.bindingInfo.initialChanges)}catch(d){c(d)}if(C(b.$onInit))try{b.$onInit()}catch(e){c(e)}C(b.$doCheck)&&(T.$watch(function(){b.$doCheck()}),b.$doCheck());C(b.$onDestroy)&&T.$on("$destroy",function(){b.$onDestroy()})});p=0;for(v=h.length;p<v;p++)B=h[p],sa(B,B.isolateScope?M:e,P,g,B.require&&X(B.directiveName,B.require,P,J),S);var qa=e;u&&(u.template||null===u.templateUrl)&&(qa=M);a&&a(qa,f.childNodes,void 0,l);for(p=k.length-1;0<=p;p--)B=
k[p],sa(B,B.isolateScope?M:e,P,g,B.require&&X(B.directiveName,B.require,P,J),S);q(J,function(a){a=a.instance;C(a.$postLink)&&a.$postLink()})}l=l||{};for(var p=-Number.MAX_VALUE,A=l.newScopeDirective,r=l.controllerDirectives,u=l.newIsolateScopeDirective,O=l.templateDirective,M=l.nonTlbTranscludeDirective,T=!1,J=!1,H=l.hasElementTranscludeDirective,B=d.$$element=F(b),v,S,P,L=e,qa,x=!1,Ja=!1,w,y=0,D=a.length;y<D;y++){v=a[y];var Ta=v.$$start,Ma=v.$$end;Ta&&(B=cd(b,Ta,Ma));P=void 0;if(p>v.priority)break;
if(w=v.scope)v.templateUrl||(E(w)?($("new/isolated scope",u||A,v,B),u=v):$("new/isolated scope",u,v,B)),A=A||v;S=v.name;if(!x&&(v.replace&&(v.templateUrl||v.template)||v.transclude&&!v.$$tlb)){for(w=y+1;x=a[w++];)if(x.transclude&&!x.$$tlb||x.replace&&(x.templateUrl||x.template)){Ja=!0;break}x=!0}!v.templateUrl&&v.controller&&(r=r||V(),$("'"+S+"' controller",r[S],v,B),r[S]=v);if(w=v.transclude)if(T=!0,v.$$tlb||($("transclusion",M,v,B),M=v),"element"===w)H=!0,p=v.priority,P=B,B=d.$$element=F(ca.$$createComment(S,
d[S])),b=B[0],ga(f,va.call(P,0),b),P[0].$$parentNode=P[0].parentNode,L=dc(Ja,P,e,p,g&&g.name,{nonTlbTranscludeDirective:M});else{var G=V();P=F(Zb(b)).contents();if(E(w)){P=[];var Q=V(),bc=V();q(w,function(a,b){var c="?"===a.charAt(0);a=c?a.substring(1):a;Q[a]=b;G[b]=null;bc[b]=c});q(B.contents(),function(a){var b=Q[Da(wa(a))];b?(bc[b]=!0,G[b]=G[b]||[],G[b].push(a)):P.push(a)});q(bc,function(a,b){if(!a)throw fa("reqslot",b);});for(var U in G)G[U]&&(G[U]=dc(Ja,G[U],e))}B.empty();L=dc(Ja,P,e,void 0,
void 0,{needsNewScope:v.$$isolateScope||v.$$newScope});L.$$slots=G}if(v.template)if(J=!0,$("template",O,v,B),O=v,w=C(v.template)?v.template(B,d):v.template,w=Ca(w),v.replace){g=v;P=Xb.test(w)?ed(ha(v.templateNamespace,Y(w))):[];b=P[0];if(1!==P.length||1!==b.nodeType)throw fa("tplrt",S,"");ga(f,B,b);D={$attr:{}};w=cc(b,[],D);var og=a.splice(y+1,a.length-(y+1));(u||A)&&aa(w,u,A);a=a.concat(w).concat(og);ea(d,D);D=a.length}else B.html(w);if(v.templateUrl)J=!0,$("template",O,v,B),O=v,v.replace&&(g=v),
n=ia(a.splice(y,a.length-y),B,d,f,T&&L,h,k,{controllerDirectives:r,newScopeDirective:A!==v&&A,newIsolateScopeDirective:u,templateDirective:O,nonTlbTranscludeDirective:M}),D=a.length;else if(v.compile)try{qa=v.compile(B,d,L);var Z=v.$$originalDirective||v;C(qa)?m(null,db(Z,qa),Ta,Ma):qa&&m(db(Z,qa.pre),db(Z,qa.post),Ta,Ma)}catch(da){c(da,ya(B))}v.terminal&&(n.terminal=!0,p=Math.max(p,v.priority))}n.scope=A&&!0===A.scope;n.transcludeOnThisElement=T;n.templateOnThisElement=J;n.transclude=L;l.hasElementTranscludeDirective=
H;return n}function X(a,b,c,d){var e;if(D(b)){var f=b.match(l);b=b.substring(f[0].length);var g=f[1]||f[3],f="?"===f[2];"^^"===g?c=c.parent():e=(e=d&&d[b])&&e.instance;if(!e){var h="$"+b+"Controller";e=g?c.inheritedData(h):c.data(h)}if(!e&&!f)throw fa("ctreq",b,a);}else if(I(b))for(e=[],g=0,f=b.length;g<f;g++)e[g]=X(a,b[g],c,d);else E(b)&&(e={},q(b,function(b,f){e[f]=X(a,b,c,d)}));return e||null}function ba(a,b,c,d,e,f,g){var h=V(),k;for(k in d){var l=d[k],m={$scope:l===g||l.$$isolateScope?e:f,$element:a,
$attrs:b,$transclude:c},n=l.controller;"@"===n&&(n=b[l.name]);m=M(n,m,!0,l.controllerAs);h[l.name]=m;a.data("$"+l.name+"Controller",m.instance)}return h}function aa(a,b,c){for(var d=0,e=a.length;d<e;d++)a[d]=Tb(a[d],{$$isolateScope:b,$$newScope:c})}function U(b,c,f,g,h,k,l){if(c===h)return null;var m=null;if(e.hasOwnProperty(c)){h=a.get(c+"Directive");for(var n=0,p=h.length;n<p;n++)if(c=h[n],(z(g)||g>c.priority)&&-1!==c.restrict.indexOf(f)){k&&(c=Tb(c,{$$start:k,$$end:l}));if(!c.$$bindings){var s=
m=c,r=c.name,v={isolateScope:null,bindToController:null};E(s.scope)&&(!0===s.bindToController?(v.bindToController=d(s.scope,r,!0),v.isolateScope={}):v.isolateScope=d(s.scope,r,!1));E(s.bindToController)&&(v.bindToController=d(s.bindToController,r,!0));if(v.bindToController&&!s.controller)throw fa("noctrl",r);m=m.$$bindings=v;E(m.isolateScope)&&(c.$$isolateBindings=m.isolateScope)}b.push(c);m=c}}return m}function Z(b){if(e.hasOwnProperty(b))for(var c=a.get(b+"Directive"),d=0,f=c.length;d<f;d++)if(b=
c[d],b.multiElement)return!0;return!1}function ea(a,b){var c=b.$attr,d=a.$attr;q(a,function(d,e){"$"!==e.charAt(0)&&(b[e]&&b[e]!==d&&(d+=("style"===e?";":" ")+b[e]),a.$set(e,d,!0,c[e]))});q(b,function(b,e){a.hasOwnProperty(e)||"$"===e.charAt(0)||(a[e]=b,"class"!==e&&"style"!==e&&(d[e]=c[e]))})}function ia(a,b,c,d,e,g,h,k){var l=[],m,n,p=b[0],s=a.shift(),A=Tb(s,{templateUrl:null,transclude:null,replace:null,$$originalDirective:s}),r=C(s.templateUrl)?s.templateUrl(b,c):s.templateUrl,v=s.templateNamespace;
b.empty();f(r).then(function(f){var u,B;f=Ca(f);if(s.replace){f=Xb.test(f)?ed(ha(v,Y(f))):[];u=f[0];if(1!==f.length||1!==u.nodeType)throw fa("tplrt",s.name,r);f={$attr:{}};ga(d,b,u);var O=cc(u,[],f);E(s.scope)&&aa(O,!0);a=O.concat(a);ea(c,f)}else u=p,b.html(f);a.unshift(A);m=W(a,u,c,e,b,s,g,h,k);q(d,function(a,c){a===u&&(d[c]=b[0])});for(n=Ma(b[0].childNodes,e);l.length;){f=l.shift();B=l.shift();var M=l.shift(),T=l.shift(),O=b[0];if(!f.$$destroyed){if(B!==p){var J=B.className;k.hasElementTranscludeDirective&&
s.replace||(O=Zb(u));ga(M,F(B),O);Ja(F(O),J)}B=m.transcludeOnThisElement?G(f,m.transclude,T):T;m(n,f,O,d,B)}}l=null});return function(a,b,c,d,e){a=e;b.$$destroyed||(l?l.push(b,c,d,a):(m.transcludeOnThisElement&&(a=G(b,m.transclude,e)),m(n,b,c,d,a)))}}function ja(a,b){var c=b.priority-a.priority;return 0!==c?c:a.name!==b.name?a.name<b.name?-1:1:a.index-b.index}function $(a,b,c,d){function e(a){return a?" (module: "+a+")":""}if(b)throw fa("multidir",b.name,e(b.$$moduleName),c.name,e(c.$$moduleName),
a,ya(d));}function ka(a,c){var d=b(c,!0);d&&a.push({priority:0,compile:function(a){a=a.parent();var b=!!a.length;b&&ca.$$addBindingClass(a);return function(a,c){var e=c.parent();b||ca.$$addBindingClass(e);ca.$$addBindingInfo(e,d.expressions);a.$watch(d,function(a){c[0].nodeValue=a})}}})}function ha(a,b){a=Q(a||"html");switch(a){case "svg":case "math":var c=y.document.createElement("div");c.innerHTML="<"+a+">"+b+"</"+a+">";return c.childNodes[0].childNodes;default:return b}}function oa(a,b){if("srcdoc"===
b)return B.HTML;var c=wa(a);if("src"===b||"ngSrc"===b){if(-1===["img","video","audio","source","track"].indexOf(c))return B.RESOURCE_URL}else if("xlinkHref"===b||"form"===c&&"action"===b)return B.RESOURCE_URL}function pa(a,c,d,e,f){var g=oa(a,e),h=k[e]||f,l=b(d,!f,g,h);if(l){if("multiple"===e&&"select"===wa(a))throw fa("selmulti",ya(a));c.push({priority:100,compile:function(){return{pre:function(a,c,f){c=f.$$observers||(f.$$observers=V());if(m.test(e))throw fa("nodomevents");var k=f[e];k!==d&&(l=
k&&b(k,!0,g,h),d=k);l&&(f[e]=l(a),(c[e]||(c[e]=[])).$$inter=!0,(f.$$observers&&f.$$observers[e].$$scope||a).$watch(l,function(a,b){"class"===e&&a!==b?f.$updateClass(a,b):f.$set(e,a)}))}}}})}}function ga(a,b,c){var d=b[0],e=b.length,f=d.parentNode,g,h;if(a)for(g=0,h=a.length;g<h;g++)if(a[g]===d){a[g++]=c;h=g+e-1;for(var k=a.length;g<k;g++,h++)h<k?a[g]=a[h]:delete a[g];a.length-=e-1;a.context===d&&(a.context=c);break}f&&f.replaceChild(c,d);a=y.document.createDocumentFragment();for(g=0;g<e;g++)a.appendChild(b[g]);
F.hasData(d)&&(F.data(c,F.data(d)),F(d).off("$destroy"));F.cleanData(a.querySelectorAll("*"));for(g=1;g<e;g++)delete b[g];b[0]=c;b.length=1}function ra(a,b){return R(function(){return a.apply(null,arguments)},a,b)}function sa(a,b,d,e,f,g){try{a(b,d,e,f,g)}catch(h){c(h,ya(d))}}function la(a,c,d,e,f){function g(b,c,e){!C(d.$onChanges)||c===e||c!==c&&e!==e||(da||(a.$$postDigest(P),da=[]),m||(m={},da.push(h)),m[b]&&(e=m[b].previousValue),m[b]=new Hb(e,c))}function h(){d.$onChanges(m);m=void 0}var k=[],
l={},m;q(e,function(e,h){var m=e.attrName,p=e.optional,s,A,r,u;switch(e.mode){case "@":p||ua.call(c,m)||(d[h]=c[m]=void 0);p=c.$observe(m,function(a){if(D(a)||Ka(a))g(h,a,d[h]),d[h]=a});c.$$observers[m].$$scope=a;s=c[m];D(s)?d[h]=b(s)(a):Ka(s)&&(d[h]=s);l[h]=new Hb(ec,d[h]);k.push(p);break;case "=":if(!ua.call(c,m)){if(p)break;c[m]=void 0}if(p&&!c[m])break;A=n(c[m]);u=A.literal?na:function(a,b){return a===b||a!==a&&b!==b};r=A.assign||function(){s=d[h]=A(a);throw fa("nonassign",c[m],m,f.name);};s=
d[h]=A(a);p=function(b){u(b,d[h])||(u(b,s)?r(a,b=d[h]):d[h]=b);return s=b};p.$stateful=!0;p=e.collection?a.$watchCollection(c[m],p):a.$watch(n(c[m],p),null,A.literal);k.push(p);break;case "<":if(!ua.call(c,m)){if(p)break;c[m]=void 0}if(p&&!c[m])break;A=n(c[m]);var B=A.literal,M=d[h]=A(a);l[h]=new Hb(ec,d[h]);p=a.$watch(A,function(a,b){if(b===a){if(b===M||B&&na(b,M))return;b=M}g(h,a,b);d[h]=a},B);k.push(p);break;case "&":A=c.hasOwnProperty(m)?n(c[m]):w;if(A===w&&p)break;d[h]=function(b){return A(a,
b)}}});return{initialChanges:l,removeWatches:k.length&&function(){for(var a=0,b=k.length;a<b;++a)k[a]()}}}var za=/^\w/,ta=y.document.createElement("div"),Ea=u,Fa=p,xa=H,da;t.prototype={$normalize:Da,$addClass:function(a){a&&0<a.length&&T.addClass(this.$$element,a)},$removeClass:function(a){a&&0<a.length&&T.removeClass(this.$$element,a)},$updateClass:function(a,b){var c=fd(a,b);c&&c.length&&T.addClass(this.$$element,c);(c=fd(b,a))&&c.length&&T.removeClass(this.$$element,c)},$set:function(a,b,d,e){var f=
Zc(this.$$element[0],a),g=gd[a],h=a;f?(this.$$element.prop(a,b),e=f):g&&(this[g]=b,h=g);this[a]=b;e?this.$attr[a]=e:(e=this.$attr[a])||(this.$attr[a]=e=Hc(a,"-"));f=wa(this.$$element);if("a"===f&&("href"===a||"xlinkHref"===a)||"img"===f&&"src"===a)this[a]=b=S(b,"src"===a);else if("img"===f&&"srcset"===a&&x(b)){for(var f="",g=Y(b),k=/(\s+\d+x\s*,|\s+\d+w\s*,|\s+,|,\s+)/,k=/\s/.test(g)?k:/(,)/,g=g.split(k),k=Math.floor(g.length/2),l=0;l<k;l++)var m=2*l,f=f+S(Y(g[m]),!0),f=f+(" "+Y(g[m+1]));g=Y(g[2*
l]).split(/\s/);f+=S(Y(g[0]),!0);2===g.length&&(f+=" "+Y(g[1]));this[a]=b=f}!1!==d&&(null===b||z(b)?this.$$element.removeAttr(e):za.test(e)?this.$$element.attr(e,b):qa(this.$$element[0],e,b));(a=this.$$observers)&&q(a[h],function(a){try{a(b)}catch(d){c(d)}})},$observe:function(a,b){var c=this,d=c.$$observers||(c.$$observers=V()),e=d[a]||(d[a]=[]);e.push(b);J.$evalAsync(function(){e.$$inter||!c.hasOwnProperty(a)||z(c[a])||b(c[a])});return function(){bb(e,b)}}};var Aa=b.startSymbol(),Ba=b.endSymbol(),
Ca="{{"===Aa&&"}}"===Ba?$a:function(a){return a.replace(/\{\{/g,Aa).replace(/}}/g,Ba)},Ga=/^ngAttr[A-Z]/,Ha=/^(.+)Start$/;ca.$$addBindingInfo=r?function(a,b){var c=a.data("$binding")||[];I(b)?c=c.concat(b):c.push(b);a.data("$binding",c)}:w;ca.$$addBindingClass=r?function(a){Ja(a,"ng-binding")}:w;ca.$$addScopeInfo=r?function(a,b,c,d){a.data(c?d?"$isolateScopeNoTemplate":"$isolateScope":"$scope",b)}:w;ca.$$addScopeClass=r?function(a,b){Ja(a,b?"ng-isolate-scope":"ng-scope")}:w;ca.$$createComment=function(a,
b){var c="";r&&(c=" "+(a||"")+": ",b&&(c+=b+" "));return y.document.createComment(c)};return ca}]}function Hb(a,b){this.previousValue=a;this.currentValue=b}function Da(a){return hb(a.replace(bd,""))}function fd(a,b){var d="",c=a.split(/\s+/),f=b.split(/\s+/),e=0;a:for(;e<c.length;e++){for(var g=c[e],h=0;h<f.length;h++)if(g===f[h])continue a;d+=(0<d.length?" ":"")+g}return d}function ed(a){a=F(a);var b=a.length;if(1>=b)return a;for(;b--;){var d=a[b];(8===d.nodeType||d.nodeType===La&&""===d.nodeValue.trim())&&
pg.call(a,b,1)}return a}function ng(a,b){if(b&&D(b))return b;if(D(a)){var d=hd.exec(a);if(d)return d[3]}}function tf(){var a={},b=!1;this.has=function(b){return a.hasOwnProperty(b)};this.register=function(b,c){Ra(b,"controller");E(b)?R(a,b):a[b]=c};this.allowGlobals=function(){b=!0};this.$get=["$injector","$window",function(d,c){function f(a,b,c,d){if(!a||!E(a.$scope))throw G("$controller")("noscp",d,b);a.$scope[b]=c}return function(e,g,h,k){var l,m,n;h=!0===h;k&&D(k)&&(n=k);if(D(e)){k=e.match(hd);
if(!k)throw id("ctrlfmt",e);m=k[1];n=n||k[3];e=a.hasOwnProperty(m)?a[m]:Jc(g.$scope,m,!0)||(b?Jc(c,m,!0):void 0);if(!e)throw id("ctrlreg",m);Qa(e,m,!0)}if(h)return h=(I(e)?e[e.length-1]:e).prototype,l=Object.create(h||null),n&&f(g,n,l,m||e.name),R(function(){var a=d.invoke(e,l,g,m);a!==l&&(E(a)||C(a))&&(l=a,n&&f(g,n,l,m||e.name));return l},{instance:l,identifier:n});l=d.instantiate(e,g,m);n&&f(g,n,l,m||e.name);return l}}]}function uf(){this.$get=["$window",function(a){return F(a.document)}]}function vf(){this.$get=
["$log",function(a){return function(b,d){a.error.apply(a,arguments)}}]}function fc(a){return E(a)?ja(a)?a.toISOString():eb(a):a}function Af(){this.$get=function(){return function(a){if(!a)return"";var b=[];yc(a,function(a,c){null===a||z(a)||(I(a)?q(a,function(a){b.push(oa(c)+"="+oa(fc(a)))}):b.push(oa(c)+"="+oa(fc(a))))});return b.join("&")}}}function Bf(){this.$get=function(){return function(a){function b(a,f,e){null===a||z(a)||(I(a)?q(a,function(a,c){b(a,f+"["+(E(a)?c:"")+"]")}):E(a)&&!ja(a)?yc(a,
function(a,c){b(a,f+(e?"":"[")+c+(e?"":"]"))}):d.push(oa(f)+"="+oa(fc(a))))}if(!a)return"";var d=[];b(a,"",!0);return d.join("&")}}}function gc(a,b){if(D(a)){var d=a.replace(qg,"").trim();if(d){var c=b("Content-Type");(c=c&&0===c.indexOf(jd))||(c=(c=d.match(rg))&&sg[c[0]].test(d));c&&(a=Cc(d))}}return a}function kd(a){var b=V(),d;D(a)?q(a.split("\n"),function(a){d=a.indexOf(":");var f=Q(Y(a.substr(0,d)));a=Y(a.substr(d+1));f&&(b[f]=b[f]?b[f]+", "+a:a)}):E(a)&&q(a,function(a,d){var e=Q(d),g=Y(a);e&&
(b[e]=b[e]?b[e]+", "+g:g)});return b}function ld(a){var b;return function(d){b||(b=kd(a));return d?(d=b[Q(d)],void 0===d&&(d=null),d):b}}function md(a,b,d,c){if(C(c))return c(a,b,d);q(c,function(c){a=c(a,b,d)});return a}function zf(){var a=this.defaults={transformResponse:[gc],transformRequest:[function(a){return E(a)&&"[object File]"!==ma.call(a)&&"[object Blob]"!==ma.call(a)&&"[object FormData]"!==ma.call(a)?eb(a):a}],headers:{common:{Accept:"application/json, text/plain, */*"},post:ka(hc),put:ka(hc),
patch:ka(hc)},xsrfCookieName:"XSRF-TOKEN",xsrfHeaderName:"X-XSRF-TOKEN",paramSerializer:"$httpParamSerializer"},b=!1;this.useApplyAsync=function(a){return x(a)?(b=!!a,this):b};var d=!0;this.useLegacyPromiseExtensions=function(a){return x(a)?(d=!!a,this):d};var c=this.interceptors=[];this.$get=["$httpBackend","$$cookieReader","$cacheFactory","$rootScope","$q","$injector",function(f,e,g,h,k,l){function m(b){function c(a,b){for(var d=0,e=b.length;d<e;){var f=b[d++],g=b[d++];a=a.then(f,g)}b.length=0;
return a}function e(a,b){var c,d={};q(a,function(a,e){C(a)?(c=a(b),null!=c&&(d[e]=c)):d[e]=a});return d}function f(a){var b=R({},a);b.data=md(a.data,a.headers,a.status,g.transformResponse);a=a.status;return 200<=a&&300>a?b:k.reject(b)}if(!E(b))throw G("$http")("badreq",b);if(!D(b.url))throw G("$http")("badreq",b.url);var g=R({method:"get",transformRequest:a.transformRequest,transformResponse:a.transformResponse,paramSerializer:a.paramSerializer},b);g.headers=function(b){var c=a.headers,d=R({},b.headers),
f,g,h,c=R({},c.common,c[Q(b.method)]);a:for(f in c){g=Q(f);for(h in d)if(Q(h)===g)continue a;d[f]=c[f]}return e(d,ka(b))}(b);g.method=wb(g.method);g.paramSerializer=D(g.paramSerializer)?l.get(g.paramSerializer):g.paramSerializer;var h=[],m=[],s=k.when(g);q(H,function(a){(a.request||a.requestError)&&h.unshift(a.request,a.requestError);(a.response||a.responseError)&&m.push(a.response,a.responseError)});s=c(s,h);s=s.then(function(b){var c=b.headers,d=md(b.data,ld(c),void 0,b.transformRequest);z(d)&&
q(c,function(a,b){"content-type"===Q(b)&&delete c[b]});z(b.withCredentials)&&!z(a.withCredentials)&&(b.withCredentials=a.withCredentials);return n(b,d).then(f,f)});s=c(s,m);d?(s.success=function(a){Qa(a,"fn");s.then(function(b){a(b.data,b.status,b.headers,g)});return s},s.error=function(a){Qa(a,"fn");s.then(null,function(b){a(b.data,b.status,b.headers,g)});return s}):(s.success=nd("success"),s.error=nd("error"));return s}function n(c,d){function g(a){if(a){var c={};q(a,function(a,d){c[d]=function(c){function d(){a(c)}
b?h.$applyAsync(d):h.$$phase?d():h.$apply(d)}});return c}}function l(a,c,d,e){function f(){n(c,a,d,e)}J&&(200<=a&&300>a?J.put(S,[a,c,kd(d),e]):J.remove(S));b?h.$applyAsync(f):(f(),h.$$phase||h.$apply())}function n(a,b,d,e){b=-1<=b?b:0;(200<=b&&300>b?O.resolve:O.reject)({data:a,status:b,headers:ld(d),config:c,statusText:e})}function H(a){n(a.data,a.status,ka(a.headers()),a.statusText)}function L(){var a=m.pendingRequests.indexOf(c);-1!==a&&m.pendingRequests.splice(a,1)}var O=k.defer(),M=O.promise,
J,B,T=c.headers,S=r(c.url,c.paramSerializer(c.params));m.pendingRequests.push(c);M.then(L,L);!c.cache&&!a.cache||!1===c.cache||"GET"!==c.method&&"JSONP"!==c.method||(J=E(c.cache)?c.cache:E(a.cache)?a.cache:s);J&&(B=J.get(S),x(B)?B&&C(B.then)?B.then(H,H):I(B)?n(B[1],B[0],ka(B[2]),B[3]):n(B,200,{},"OK"):J.put(S,M));z(B)&&((B=od(c.url)?e()[c.xsrfCookieName||a.xsrfCookieName]:void 0)&&(T[c.xsrfHeaderName||a.xsrfHeaderName]=B),f(c.method,S,d,l,T,c.timeout,c.withCredentials,c.responseType,g(c.eventHandlers),
g(c.uploadEventHandlers)));return M}function r(a,b){0<b.length&&(a+=(-1===a.indexOf("?")?"?":"&")+b);return a}var s=g("$http");a.paramSerializer=D(a.paramSerializer)?l.get(a.paramSerializer):a.paramSerializer;var H=[];q(c,function(a){H.unshift(D(a)?l.get(a):l.invoke(a))});m.pendingRequests=[];(function(a){q(arguments,function(a){m[a]=function(b,c){return m(R({},c||{},{method:a,url:b}))}})})("get","delete","head","jsonp");(function(a){q(arguments,function(a){m[a]=function(b,c,d){return m(R({},d||{},
{method:a,url:b,data:c}))}})})("post","put","patch");m.defaults=a;return m}]}function Df(){this.$get=function(){return function(){return new y.XMLHttpRequest}}}function Cf(){this.$get=["$browser","$jsonpCallbacks","$document","$xhrFactory",function(a,b,d,c){return tg(a,c,a.defer,b,d[0])}]}function tg(a,b,d,c,f){function e(a,b,d){a=a.replace("JSON_CALLBACK",b);var e=f.createElement("script"),m=null;e.type="text/javascript";e.src=a;e.async=!0;m=function(a){e.removeEventListener("load",m,!1);e.removeEventListener("error",
m,!1);f.body.removeChild(e);e=null;var g=-1,s="unknown";a&&("load"!==a.type||c.wasCalled(b)||(a={type:"error"}),s=a.type,g="error"===a.type?404:200);d&&d(g,s)};e.addEventListener("load",m,!1);e.addEventListener("error",m,!1);f.body.appendChild(e);return m}return function(f,h,k,l,m,n,r,s,H,u){function p(){v&&v();N&&N.abort()}function K(b,c,e,f,g){x(O)&&d.cancel(O);v=N=null;b(c,e,f,g);a.$$completeOutstandingRequest(w)}a.$$incOutstandingRequestCount();h=h||a.url();if("jsonp"===Q(f))var A=c.createCallback(h),
v=e(h,A,function(a,b){var d=200===a&&c.getResponse(A);K(l,a,d,"",b);c.removeCallback(A)});else{var N=b(f,h);N.open(f,h,!0);q(m,function(a,b){x(a)&&N.setRequestHeader(b,a)});N.onload=function(){var a=N.statusText||"",b="response"in N?N.response:N.responseText,c=1223===N.status?204:N.status;0===c&&(c=b?200:"file"===ta(h).protocol?404:0);K(l,c,b,N.getAllResponseHeaders(),a)};f=function(){K(l,-1,null,null,"")};N.onerror=f;N.onabort=f;N.ontimeout=f;q(H,function(a,b){N.addEventListener(b,a)});q(u,function(a,
b){N.upload.addEventListener(b,a)});r&&(N.withCredentials=!0);if(s)try{N.responseType=s}catch(L){if("json"!==s)throw L;}N.send(z(k)?null:k)}if(0<n)var O=d(p,n);else n&&C(n.then)&&n.then(p)}}function xf(){var a="{{",b="}}";this.startSymbol=function(b){return b?(a=b,this):a};this.endSymbol=function(a){return a?(b=a,this):b};this.$get=["$parse","$exceptionHandler","$sce",function(d,c,f){function e(a){return"\\\\\\"+a}function g(c){return c.replace(n,a).replace(r,b)}function h(a,b,c,d){var e=a.$watch(function(a){e();
return d(a)},b,c);return e}function k(e,k,n,p){function r(a){try{var b=a;a=n?f.getTrusted(n,b):f.valueOf(b);var d;if(p&&!x(a))d=a;else if(null==a)d="";else{switch(typeof a){case "string":break;case "number":a=""+a;break;default:a=eb(a)}d=a}return d}catch(g){c(Ha.interr(e,g))}}if(!e.length||-1===e.indexOf(a)){var A;k||(k=g(e),A=ha(k),A.exp=e,A.expressions=[],A.$$watchDelegate=h);return A}p=!!p;var v,q,L=0,O=[],M=[];A=e.length;for(var J=[],B=[];L<A;)if(-1!==(v=e.indexOf(a,L))&&-1!==(q=e.indexOf(b,v+
l)))L!==v&&J.push(g(e.substring(L,v))),L=e.substring(v+l,q),O.push(L),M.push(d(L,r)),L=q+m,B.push(J.length),J.push("");else{L!==A&&J.push(g(e.substring(L)));break}n&&1<J.length&&Ha.throwNoconcat(e);if(!k||O.length){var T=function(a){for(var b=0,c=O.length;b<c;b++){if(p&&z(a[b]))return;J[B[b]]=a[b]}return J.join("")};return R(function(a){var b=0,d=O.length,f=Array(d);try{for(;b<d;b++)f[b]=M[b](a);return T(f)}catch(g){c(Ha.interr(e,g))}},{exp:e,expressions:O,$$watchDelegate:function(a,b){var c;return a.$watchGroup(M,
function(d,e){var f=T(d);C(b)&&b.call(this,f,d!==e?c:f,a);c=f})}})}}var l=a.length,m=b.length,n=new RegExp(a.replace(/./g,e),"g"),r=new RegExp(b.replace(/./g,e),"g");k.startSymbol=function(){return a};k.endSymbol=function(){return b};return k}]}function yf(){this.$get=["$rootScope","$window","$q","$$q","$browser",function(a,b,d,c,f){function e(e,k,l,m){function n(){r?e.apply(null,s):e(p)}var r=4<arguments.length,s=r?va.call(arguments,4):[],H=b.setInterval,u=b.clearInterval,p=0,K=x(m)&&!m,A=(K?c:d).defer(),
v=A.promise;l=x(l)?l:0;v.$$intervalId=H(function(){K?f.defer(n):a.$evalAsync(n);A.notify(p++);0<l&&p>=l&&(A.resolve(p),u(v.$$intervalId),delete g[v.$$intervalId]);K||a.$apply()},k);g[v.$$intervalId]=A;return v}var g={};e.cancel=function(a){return a&&a.$$intervalId in g?(g[a.$$intervalId].reject("canceled"),b.clearInterval(a.$$intervalId),delete g[a.$$intervalId],!0):!1};return e}]}function ic(a){a=a.split("/");for(var b=a.length;b--;)a[b]=tb(a[b]);return a.join("/")}function pd(a,b){var d=ta(a);b.$$protocol=
d.protocol;b.$$host=d.hostname;b.$$port=Z(d.port)||ug[d.protocol]||null}function qd(a,b){if(vg.test(a))throw lb("badpath",a);var d="/"!==a.charAt(0);d&&(a="/"+a);var c=ta(a);b.$$path=decodeURIComponent(d&&"/"===c.pathname.charAt(0)?c.pathname.substring(1):c.pathname);b.$$search=Fc(c.search);b.$$hash=decodeURIComponent(c.hash);b.$$path&&"/"!==b.$$path.charAt(0)&&(b.$$path="/"+b.$$path)}function ra(a,b){if(b.slice(0,a.length)===a)return b.substr(a.length)}function Ga(a){var b=a.indexOf("#");return-1===
b?a:a.substr(0,b)}function mb(a){return a.replace(/(#.+)|#$/,"$1")}function jc(a,b,d){this.$$html5=!0;d=d||"";pd(a,this);this.$$parse=function(a){var d=ra(b,a);if(!D(d))throw lb("ipthprfx",a,b);qd(d,this);this.$$path||(this.$$path="/");this.$$compose()};this.$$compose=function(){var a=Vb(this.$$search),d=this.$$hash?"#"+tb(this.$$hash):"";this.$$url=ic(this.$$path)+(a?"?"+a:"")+d;this.$$absUrl=b+this.$$url.substr(1)};this.$$parseLinkUrl=function(c,f){if(f&&"#"===f[0])return this.hash(f.slice(1)),
!0;var e,g;x(e=ra(a,c))?(g=e,g=d&&x(e=ra(d,e))?b+(ra("/",e)||e):a+g):x(e=ra(b,c))?g=b+e:b===c+"/"&&(g=b);g&&this.$$parse(g);return!!g}}function kc(a,b,d){pd(a,this);this.$$parse=function(c){var f=ra(a,c)||ra(b,c),e;z(f)||"#"!==f.charAt(0)?this.$$html5?e=f:(e="",z(f)&&(a=c,this.replace())):(e=ra(d,f),z(e)&&(e=f));qd(e,this);c=this.$$path;var f=a,g=/^\/[A-Z]:(\/.*)/;e.slice(0,f.length)===f&&(e=e.replace(f,""));g.exec(e)||(c=(e=g.exec(c))?e[1]:c);this.$$path=c;this.$$compose()};this.$$compose=function(){var b=
Vb(this.$$search),f=this.$$hash?"#"+tb(this.$$hash):"";this.$$url=ic(this.$$path)+(b?"?"+b:"")+f;this.$$absUrl=a+(this.$$url?d+this.$$url:"")};this.$$parseLinkUrl=function(b,d){return Ga(a)===Ga(b)?(this.$$parse(b),!0):!1}}function rd(a,b,d){this.$$html5=!0;kc.apply(this,arguments);this.$$parseLinkUrl=function(c,f){if(f&&"#"===f[0])return this.hash(f.slice(1)),!0;var e,g;a===Ga(c)?e=c:(g=ra(b,c))?e=a+d+g:b===c+"/"&&(e=b);e&&this.$$parse(e);return!!e};this.$$compose=function(){var b=Vb(this.$$search),
f=this.$$hash?"#"+tb(this.$$hash):"";this.$$url=ic(this.$$path)+(b?"?"+b:"")+f;this.$$absUrl=a+d+this.$$url}}function Ib(a){return function(){return this[a]}}function sd(a,b){return function(d){if(z(d))return this[a];this[a]=b(d);this.$$compose();return this}}function Ff(){var a="",b={enabled:!1,requireBase:!0,rewriteLinks:!0};this.hashPrefix=function(b){return x(b)?(a=b,this):a};this.html5Mode=function(a){if(Ka(a))return b.enabled=a,this;if(E(a)){Ka(a.enabled)&&(b.enabled=a.enabled);Ka(a.requireBase)&&
(b.requireBase=a.requireBase);if(Ka(a.rewriteLinks)||D(a.rewriteLinks))b.rewriteLinks=a.rewriteLinks;return this}return b};this.$get=["$rootScope","$browser","$sniffer","$rootElement","$window",function(d,c,f,e,g){function h(a,b,d){var e=l.url(),f=l.$$state;try{c.url(a,b,d),l.$$state=c.state()}catch(g){throw l.url(e),l.$$state=f,g;}}function k(a,b){d.$broadcast("$locationChangeSuccess",l.absUrl(),a,l.$$state,b)}var l,m;m=c.baseHref();var n=c.url(),r;if(b.enabled){if(!m&&b.requireBase)throw lb("nobase");
r=n.substring(0,n.indexOf("/",n.indexOf("//")+2))+(m||"/");m=f.history?jc:rd}else r=Ga(n),m=kc;var s=r.substr(0,Ga(r).lastIndexOf("/")+1);l=new m(r,s,"#"+a);l.$$parseLinkUrl(n,n);l.$$state=c.state();var H=/^\s*(javascript|mailto):/i;e.on("click",function(a){var f=b.rewriteLinks;if(f&&!a.ctrlKey&&!a.metaKey&&!a.shiftKey&&2!==a.which&&2!==a.button){for(var h=F(a.target);"a"!==wa(h[0]);)if(h[0]===e[0]||!(h=h.parent())[0])return;if(!D(f)||!z(h.attr(f))){var f=h.prop("href"),k=h.attr("href")||h.attr("xlink:href");
E(f)&&"[object SVGAnimatedString]"===f.toString()&&(f=ta(f.animVal).href);H.test(f)||!f||h.attr("target")||a.isDefaultPrevented()||!l.$$parseLinkUrl(f,k)||(a.preventDefault(),l.absUrl()!==c.url()&&(d.$apply(),g.angular["ff-684208-preventDefault"]=!0))}}});mb(l.absUrl())!==mb(n)&&c.url(l.absUrl(),!0);var u=!0;c.onUrlChange(function(a,b){z(ra(s,a))?g.location.href=a:(d.$evalAsync(function(){var c=l.absUrl(),e=l.$$state,f;a=mb(a);l.$$parse(a);l.$$state=b;f=d.$broadcast("$locationChangeStart",a,c,b,e).defaultPrevented;
l.absUrl()===a&&(f?(l.$$parse(c),l.$$state=e,h(c,!1,e)):(u=!1,k(c,e)))}),d.$$phase||d.$digest())});d.$watch(function(){var a=mb(c.url()),b=mb(l.absUrl()),e=c.state(),g=l.$$replace,m=a!==b||l.$$html5&&f.history&&e!==l.$$state;if(u||m)u=!1,d.$evalAsync(function(){var b=l.absUrl(),c=d.$broadcast("$locationChangeStart",b,a,l.$$state,e).defaultPrevented;l.absUrl()===b&&(c?(l.$$parse(a),l.$$state=e):(m&&h(b,g,e===l.$$state?null:l.$$state),k(a,e)))});l.$$replace=!1});return l}]}function Gf(){var a=!0,b=
this;this.debugEnabled=function(b){return x(b)?(a=b,this):a};this.$get=["$window",function(d){function c(a){a instanceof Error&&(a.stack?a=a.message&&-1===a.stack.indexOf(a.message)?"Error: "+a.message+"\n"+a.stack:a.stack:a.sourceURL&&(a=a.message+"\n"+a.sourceURL+":"+a.line));return a}function f(a){var b=d.console||{},f=b[a]||b.log||w;a=!1;try{a=!!f.apply}catch(k){}return a?function(){var a=[];q(arguments,function(b){a.push(c(b))});return f.apply(b,a)}:function(a,b){f(a,null==b?"":b)}}return{log:f("log"),
info:f("info"),warn:f("warn"),error:f("error"),debug:function(){var c=f("debug");return function(){a&&c.apply(b,arguments)}}()}}]}function Ua(a,b){if("__defineGetter__"===a||"__defineSetter__"===a||"__lookupGetter__"===a||"__lookupSetter__"===a||"__proto__"===a)throw ea("isecfld",b);return a}function wg(a){return a+""}function Ea(a,b){if(a){if(a.constructor===a)throw ea("isecfn",b);if(a.window===a)throw ea("isecwindow",b);if(a.children&&(a.nodeName||a.prop&&a.attr&&a.find))throw ea("isecdom",b);if(a===
Object)throw ea("isecobj",b);}return a}function td(a,b){if(a){if(a.constructor===a)throw ea("isecfn",b);if(a===xg||a===yg||a===zg)throw ea("isecff",b);}}function Jb(a,b){if(a&&(a===ud||a===vd||a===wd||a===xd||a===yd||a===zd||a===Ag||a===Bg||a===Kb||a===Cg||a===Ad||a===Dg))throw ea("isecaf",b);}function Eg(a,b){return"undefined"!==typeof a?a:b}function Bd(a,b){return"undefined"===typeof a?b:"undefined"===typeof b?a:a+b}function X(a,b){var d,c,f;switch(a.type){case t.Program:d=!0;q(a.body,function(a){X(a.expression,
b);d=d&&a.expression.constant});a.constant=d;break;case t.Literal:a.constant=!0;a.toWatch=[];break;case t.UnaryExpression:X(a.argument,b);a.constant=a.argument.constant;a.toWatch=a.argument.toWatch;break;case t.BinaryExpression:X(a.left,b);X(a.right,b);a.constant=a.left.constant&&a.right.constant;a.toWatch=a.left.toWatch.concat(a.right.toWatch);break;case t.LogicalExpression:X(a.left,b);X(a.right,b);a.constant=a.left.constant&&a.right.constant;a.toWatch=a.constant?[]:[a];break;case t.ConditionalExpression:X(a.test,
b);X(a.alternate,b);X(a.consequent,b);a.constant=a.test.constant&&a.alternate.constant&&a.consequent.constant;a.toWatch=a.constant?[]:[a];break;case t.Identifier:a.constant=!1;a.toWatch=[a];break;case t.MemberExpression:X(a.object,b);a.computed&&X(a.property,b);a.constant=a.object.constant&&(!a.computed||a.property.constant);a.toWatch=[a];break;case t.CallExpression:d=f=a.filter?!b(a.callee.name).$stateful:!1;c=[];q(a.arguments,function(a){X(a,b);d=d&&a.constant;a.constant||c.push.apply(c,a.toWatch)});
a.constant=d;a.toWatch=f?c:[a];break;case t.AssignmentExpression:X(a.left,b);X(a.right,b);a.constant=a.left.constant&&a.right.constant;a.toWatch=[a];break;case t.ArrayExpression:d=!0;c=[];q(a.elements,function(a){X(a,b);d=d&&a.constant;a.constant||c.push.apply(c,a.toWatch)});a.constant=d;a.toWatch=c;break;case t.ObjectExpression:d=!0;c=[];q(a.properties,function(a){X(a.value,b);d=d&&a.value.constant&&!a.computed;a.value.constant||c.push.apply(c,a.value.toWatch)});a.constant=d;a.toWatch=c;break;case t.ThisExpression:a.constant=
!1;a.toWatch=[];break;case t.LocalsExpression:a.constant=!1,a.toWatch=[]}}function Cd(a){if(1===a.length){a=a[0].expression;var b=a.toWatch;return 1!==b.length?b:b[0]!==a?b:void 0}}function Dd(a){return a.type===t.Identifier||a.type===t.MemberExpression}function Ed(a){if(1===a.body.length&&Dd(a.body[0].expression))return{type:t.AssignmentExpression,left:a.body[0].expression,right:{type:t.NGValueParameter},operator:"="}}function Fd(a){return 0===a.body.length||1===a.body.length&&(a.body[0].expression.type===
t.Literal||a.body[0].expression.type===t.ArrayExpression||a.body[0].expression.type===t.ObjectExpression)}function Gd(a,b){this.astBuilder=a;this.$filter=b}function Hd(a,b){this.astBuilder=a;this.$filter=b}function Lb(a){return"constructor"===a}function lc(a){return C(a.valueOf)?a.valueOf():Fg.call(a)}function Hf(){var a=V(),b=V(),d={"true":!0,"false":!1,"null":null,undefined:void 0},c,f;this.addLiteral=function(a,b){d[a]=b};this.setIdentifierFns=function(a,b){c=a;f=b;return this};this.$get=["$filter",
function(e){function g(c,d,f){var g,k,H;f=f||K;switch(typeof c){case "string":H=c=c.trim();var q=f?b:a;g=q[H];if(!g){":"===c.charAt(0)&&":"===c.charAt(1)&&(k=!0,c=c.substring(2));g=f?p:u;var B=new mc(g);g=(new nc(B,e,g)).parse(c);g.constant?g.$$watchDelegate=r:k?g.$$watchDelegate=g.literal?n:m:g.inputs&&(g.$$watchDelegate=l);f&&(g=h(g));q[H]=g}return s(g,d);case "function":return s(c,d);default:return s(w,d)}}function h(a){function b(c,d,e,f){var g=K;K=!0;try{return a(c,d,e,f)}finally{K=g}}if(!a)return a;
b.$$watchDelegate=a.$$watchDelegate;b.assign=h(a.assign);b.constant=a.constant;b.literal=a.literal;for(var c=0;a.inputs&&c<a.inputs.length;++c)a.inputs[c]=h(a.inputs[c]);b.inputs=a.inputs;return b}function k(a,b){return null==a||null==b?a===b:"object"===typeof a&&(a=lc(a),"object"===typeof a)?!1:a===b||a!==a&&b!==b}function l(a,b,c,d,e){var f=d.inputs,g;if(1===f.length){var h=k,f=f[0];return a.$watch(function(a){var b=f(a);k(b,h)||(g=d(a,void 0,void 0,[b]),h=b&&lc(b));return g},b,c,e)}for(var l=[],
m=[],n=0,s=f.length;n<s;n++)l[n]=k,m[n]=null;return a.$watch(function(a){for(var b=!1,c=0,e=f.length;c<e;c++){var h=f[c](a);if(b||(b=!k(h,l[c])))m[c]=h,l[c]=h&&lc(h)}b&&(g=d(a,void 0,void 0,m));return g},b,c,e)}function m(a,b,c,d){var e,f;return e=a.$watch(function(a){return d(a)},function(a,c,d){f=a;C(b)&&b.apply(this,arguments);x(a)&&d.$$postDigest(function(){x(f)&&e()})},c)}function n(a,b,c,d){function e(a){var b=!0;q(a,function(a){x(a)||(b=!1)});return b}var f,g;return f=a.$watch(function(a){return d(a)},
function(a,c,d){g=a;C(b)&&b.call(this,a,c,d);e(a)&&d.$$postDigest(function(){e(g)&&f()})},c)}function r(a,b,c,d){var e=a.$watch(function(a){e();return d(a)},b,c);return e}function s(a,b){if(!b)return a;var c=a.$$watchDelegate,d=!1,c=c!==n&&c!==m?function(c,e,f,g){f=d&&g?g[0]:a(c,e,f,g);return b(f,c,e)}:function(c,d,e,f){e=a(c,d,e,f);c=b(e,c,d);return x(e)?c:e};a.$$watchDelegate&&a.$$watchDelegate!==l?c.$$watchDelegate=a.$$watchDelegate:b.$stateful||(c.$$watchDelegate=l,d=!a.inputs,c.inputs=a.inputs?
a.inputs:[a]);return c}var H=da().noUnsafeEval,u={csp:H,expensiveChecks:!1,literals:sa(d),isIdentifierStart:C(c)&&c,isIdentifierContinue:C(f)&&f},p={csp:H,expensiveChecks:!0,literals:sa(d),isIdentifierStart:C(c)&&c,isIdentifierContinue:C(f)&&f},K=!1;g.$$runningExpensiveChecks=function(){return K};return g}]}function Jf(){this.$get=["$rootScope","$exceptionHandler",function(a,b){return Id(function(b){a.$evalAsync(b)},b)}]}function Kf(){this.$get=["$browser","$exceptionHandler",function(a,b){return Id(function(b){a.defer(b)},
b)}]}function Id(a,b){function d(){var a=new g;a.resolve=f(a,a.resolve);a.reject=f(a,a.reject);a.notify=f(a,a.notify);return a}function c(){this.$$state={status:0}}function f(a,b){return function(c){b.call(a,c)}}function e(c){!c.processScheduled&&c.pending&&(c.processScheduled=!0,a(function(){var a,d,e;e=c.pending;c.processScheduled=!1;c.pending=void 0;for(var f=0,g=e.length;f<g;++f){d=e[f][0];a=e[f][c.status];try{C(a)?d.resolve(a(c.value)):1===c.status?d.resolve(c.value):d.reject(c.value)}catch(h){d.reject(h),
b(h)}}}))}function g(){this.promise=new c}function h(a){var b=new g;b.reject(a);return b.promise}function k(a,b,c){var d=null;try{C(c)&&(d=c())}catch(e){return h(e)}return d&&C(d.then)?d.then(function(){return b(a)},h):b(a)}function l(a,b,c,d){var e=new g;e.resolve(a);return e.promise.then(b,c,d)}function m(a){if(!C(a))throw n("norslvr",a);var b=new g;a(function(a){b.resolve(a)},function(a){b.reject(a)});return b.promise}var n=G("$q",TypeError);R(c.prototype,{then:function(a,b,c){if(z(a)&&z(b)&&z(c))return this;
var d=new g;this.$$state.pending=this.$$state.pending||[];this.$$state.pending.push([d,a,b,c]);0<this.$$state.status&&e(this.$$state);return d.promise},"catch":function(a){return this.then(null,a)},"finally":function(a,b){return this.then(function(b){return k(b,r,a)},function(b){return k(b,h,a)},b)}});R(g.prototype,{resolve:function(a){this.promise.$$state.status||(a===this.promise?this.$$reject(n("qcycle",a)):this.$$resolve(a))},$$resolve:function(a){function c(a){k||(k=!0,h.$$resolve(a))}function d(a){k||
(k=!0,h.$$reject(a))}var g,h=this,k=!1;try{if(E(a)||C(a))g=a&&a.then;C(g)?(this.promise.$$state.status=-1,g.call(a,c,d,f(this,this.notify))):(this.promise.$$state.value=a,this.promise.$$state.status=1,e(this.promise.$$state))}catch(l){d(l),b(l)}},reject:function(a){this.promise.$$state.status||this.$$reject(a)},$$reject:function(a){this.promise.$$state.value=a;this.promise.$$state.status=2;e(this.promise.$$state)},notify:function(c){var d=this.promise.$$state.pending;0>=this.promise.$$state.status&&
d&&d.length&&a(function(){for(var a,e,f=0,g=d.length;f<g;f++){e=d[f][0];a=d[f][3];try{e.notify(C(a)?a(c):c)}catch(h){b(h)}}})}});var r=l;m.prototype=c.prototype;m.defer=d;m.reject=h;m.when=l;m.resolve=r;m.all=function(a){var b=new g,c=0,d=I(a)?[]:{};q(a,function(a,e){c++;l(a).then(function(a){d[e]=a;--c||b.resolve(d)},function(a){b.reject(a)})});0===c&&b.resolve(d);return b.promise};m.race=function(a){var b=d();q(a,function(a){l(a).then(b.resolve,b.reject)});return b.promise};return m}function Tf(){this.$get=
["$window","$timeout",function(a,b){var d=a.requestAnimationFrame||a.webkitRequestAnimationFrame,c=a.cancelAnimationFrame||a.webkitCancelAnimationFrame||a.webkitCancelRequestAnimationFrame,f=!!d,e=f?function(a){var b=d(a);return function(){c(b)}}:function(a){var c=b(a,16.66,!1);return function(){b.cancel(c)}};e.supported=f;return e}]}function If(){function a(a){function b(){this.$$watchers=this.$$nextSibling=this.$$childHead=this.$$childTail=null;this.$$listeners={};this.$$listenerCount={};this.$$watchersCount=
0;this.$id=++sb;this.$$ChildScope=null}b.prototype=a;return b}var b=10,d=G("$rootScope"),c=null,f=null;this.digestTtl=function(a){arguments.length&&(b=a);return b};this.$get=["$exceptionHandler","$parse","$browser",function(e,g,h){function k(a){a.currentScope.$$destroyed=!0}function l(a){9===Ia&&(a.$$childHead&&l(a.$$childHead),a.$$nextSibling&&l(a.$$nextSibling));a.$parent=a.$$nextSibling=a.$$prevSibling=a.$$childHead=a.$$childTail=a.$root=a.$$watchers=null}function m(){this.$id=++sb;this.$$phase=
this.$parent=this.$$watchers=this.$$nextSibling=this.$$prevSibling=this.$$childHead=this.$$childTail=null;this.$root=this;this.$$destroyed=!1;this.$$listeners={};this.$$listenerCount={};this.$$watchersCount=0;this.$$isolateBindings=null}function n(a){if(K.$$phase)throw d("inprog",K.$$phase);K.$$phase=a}function r(a,b){do a.$$watchersCount+=b;while(a=a.$parent)}function s(a,b,c){do a.$$listenerCount[c]-=b,0===a.$$listenerCount[c]&&delete a.$$listenerCount[c];while(a=a.$parent)}function H(){}function u(){for(;t.length;)try{t.shift()()}catch(a){e(a)}f=
null}function p(){null===f&&(f=h.defer(function(){K.$apply(u)}))}m.prototype={constructor:m,$new:function(b,c){var d;c=c||this;b?(d=new m,d.$root=this.$root):(this.$$ChildScope||(this.$$ChildScope=a(this)),d=new this.$$ChildScope);d.$parent=c;d.$$prevSibling=c.$$childTail;c.$$childHead?(c.$$childTail.$$nextSibling=d,c.$$childTail=d):c.$$childHead=c.$$childTail=d;(b||c!==this)&&d.$on("$destroy",k);return d},$watch:function(a,b,d,e){var f=g(a);if(f.$$watchDelegate)return f.$$watchDelegate(this,b,d,
f,a);var h=this,k=h.$$watchers,l={fn:b,last:H,get:f,exp:e||a,eq:!!d};c=null;C(b)||(l.fn=w);k||(k=h.$$watchers=[],k.$$digestWatchIndex=-1);k.unshift(l);k.$$digestWatchIndex++;r(this,1);return function(){var a=bb(k,l);0<=a&&(r(h,-1),a<k.$$digestWatchIndex&&k.$$digestWatchIndex--);c=null}},$watchGroup:function(a,b){function c(){h=!1;k?(k=!1,b(e,e,g)):b(e,d,g)}var d=Array(a.length),e=Array(a.length),f=[],g=this,h=!1,k=!0;if(!a.length){var l=!0;g.$evalAsync(function(){l&&b(e,e,g)});return function(){l=
!1}}if(1===a.length)return this.$watch(a[0],function(a,c,f){e[0]=a;d[0]=c;b(e,a===c?e:d,f)});q(a,function(a,b){var k=g.$watch(a,function(a,f){e[b]=a;d[b]=f;h||(h=!0,g.$evalAsync(c))});f.push(k)});return function(){for(;f.length;)f.shift()()}},$watchCollection:function(a,b){function c(a){e=a;var b,d,g,h;if(!z(e)){if(E(e))if(la(e))for(f!==n&&(f=n,s=f.length=0,l++),a=e.length,s!==a&&(l++,f.length=s=a),b=0;b<a;b++)h=f[b],g=e[b],d=h!==h&&g!==g,d||h===g||(l++,f[b]=g);else{f!==r&&(f=r={},s=0,l++);a=0;for(b in e)ua.call(e,
b)&&(a++,g=e[b],h=f[b],b in f?(d=h!==h&&g!==g,d||h===g||(l++,f[b]=g)):(s++,f[b]=g,l++));if(s>a)for(b in l++,f)ua.call(e,b)||(s--,delete f[b])}else f!==e&&(f=e,l++);return l}}c.$stateful=!0;var d=this,e,f,h,k=1<b.length,l=0,m=g(a,c),n=[],r={},p=!0,s=0;return this.$watch(m,function(){p?(p=!1,b(e,e,d)):b(e,h,d);if(k)if(E(e))if(la(e)){h=Array(e.length);for(var a=0;a<e.length;a++)h[a]=e[a]}else for(a in h={},e)ua.call(e,a)&&(h[a]=e[a]);else h=e})},$digest:function(){var a,g,k,l,m,r,p,s=b,q,t=[],N,x;n("$digest");
h.$$checkUrlChange();this===K&&null!==f&&(h.defer.cancel(f),u());c=null;do{p=!1;q=this;for(r=0;r<A.length;r++){try{x=A[r],x.scope.$eval(x.expression,x.locals)}catch(z){e(z)}c=null}A.length=0;a:do{if(r=q.$$watchers)for(r.$$digestWatchIndex=r.length;r.$$digestWatchIndex--;)try{if(a=r[r.$$digestWatchIndex])if(m=a.get,(g=m(q))!==(k=a.last)&&!(a.eq?na(g,k):ia(g)&&ia(k)))p=!0,c=a,a.last=a.eq?sa(g,null):g,l=a.fn,l(g,k===H?g:k,q),5>s&&(N=4-s,t[N]||(t[N]=[]),t[N].push({msg:C(a.exp)?"fn: "+(a.exp.name||a.exp.toString()):
a.exp,newVal:g,oldVal:k}));else if(a===c){p=!1;break a}}catch(w){e(w)}if(!(r=q.$$watchersCount&&q.$$childHead||q!==this&&q.$$nextSibling))for(;q!==this&&!(r=q.$$nextSibling);)q=q.$parent}while(q=r);if((p||A.length)&&!s--)throw K.$$phase=null,d("infdig",b,t);}while(p||A.length);for(K.$$phase=null;L<v.length;)try{v[L++]()}catch(y){e(y)}v.length=L=0},$destroy:function(){if(!this.$$destroyed){var a=this.$parent;this.$broadcast("$destroy");this.$$destroyed=!0;this===K&&h.$$applicationDestroyed();r(this,
-this.$$watchersCount);for(var b in this.$$listenerCount)s(this,this.$$listenerCount[b],b);a&&a.$$childHead===this&&(a.$$childHead=this.$$nextSibling);a&&a.$$childTail===this&&(a.$$childTail=this.$$prevSibling);this.$$prevSibling&&(this.$$prevSibling.$$nextSibling=this.$$nextSibling);this.$$nextSibling&&(this.$$nextSibling.$$prevSibling=this.$$prevSibling);this.$destroy=this.$digest=this.$apply=this.$evalAsync=this.$applyAsync=w;this.$on=this.$watch=this.$watchGroup=function(){return w};this.$$listeners=
{};this.$$nextSibling=null;l(this)}},$eval:function(a,b){return g(a)(this,b)},$evalAsync:function(a,b){K.$$phase||A.length||h.defer(function(){A.length&&K.$digest()});A.push({scope:this,expression:g(a),locals:b})},$$postDigest:function(a){v.push(a)},$apply:function(a){try{n("$apply");try{return this.$eval(a)}finally{K.$$phase=null}}catch(b){e(b)}finally{try{K.$digest()}catch(c){throw e(c),c;}}},$applyAsync:function(a){function b(){c.$eval(a)}var c=this;a&&t.push(b);a=g(a);p()},$on:function(a,b){var c=
this.$$listeners[a];c||(this.$$listeners[a]=c=[]);c.push(b);var d=this;do d.$$listenerCount[a]||(d.$$listenerCount[a]=0),d.$$listenerCount[a]++;while(d=d.$parent);var e=this;return function(){var d=c.indexOf(b);-1!==d&&(c[d]=null,s(e,1,a))}},$emit:function(a,b){var c=[],d,f=this,g=!1,h={name:a,targetScope:f,stopPropagation:function(){g=!0},preventDefault:function(){h.defaultPrevented=!0},defaultPrevented:!1},k=cb([h],arguments,1),l,m;do{d=f.$$listeners[a]||c;h.currentScope=f;l=0;for(m=d.length;l<
m;l++)if(d[l])try{d[l].apply(null,k)}catch(n){e(n)}else d.splice(l,1),l--,m--;if(g)return h.currentScope=null,h;f=f.$parent}while(f);h.currentScope=null;return h},$broadcast:function(a,b){var c=this,d=this,f={name:a,targetScope:this,preventDefault:function(){f.defaultPrevented=!0},defaultPrevented:!1};if(!this.$$listenerCount[a])return f;for(var g=cb([f],arguments,1),h,k;c=d;){f.currentScope=c;d=c.$$listeners[a]||[];h=0;for(k=d.length;h<k;h++)if(d[h])try{d[h].apply(null,g)}catch(l){e(l)}else d.splice(h,
1),h--,k--;if(!(d=c.$$listenerCount[a]&&c.$$childHead||c!==this&&c.$$nextSibling))for(;c!==this&&!(d=c.$$nextSibling);)c=c.$parent}f.currentScope=null;return f}};var K=new m,A=K.$$asyncQueue=[],v=K.$$postDigestQueue=[],t=K.$$applyAsyncQueue=[],L=0;return K}]}function Be(){var a=/^\s*(https?|ftp|mailto|tel|file):/,b=/^\s*((https?|ftp|file|blob):|data:image\/)/;this.aHrefSanitizationWhitelist=function(b){return x(b)?(a=b,this):a};this.imgSrcSanitizationWhitelist=function(a){return x(a)?(b=a,this):b};
this.$get=function(){return function(d,c){var f=c?b:a,e;e=ta(d).href;return""===e||e.match(f)?d:"unsafe:"+e}}}function Gg(a){if("self"===a)return a;if(D(a)){if(-1<a.indexOf("***"))throw Fa("iwcard",a);a=Jd(a).replace(/\\\*\\\*/g,".*").replace(/\\\*/g,"[^:/.?&;]*");return new RegExp("^"+a+"$")}if(Za(a))return new RegExp("^"+a.source+"$");throw Fa("imatcher");}function Kd(a){var b=[];x(a)&&q(a,function(a){b.push(Gg(a))});return b}function Mf(){this.SCE_CONTEXTS=ga;var a=["self"],b=[];this.resourceUrlWhitelist=
function(b){arguments.length&&(a=Kd(b));return a};this.resourceUrlBlacklist=function(a){arguments.length&&(b=Kd(a));return b};this.$get=["$injector",function(d){function c(a,b){return"self"===a?od(b):!!a.exec(b.href)}function f(a){var b=function(a){this.$$unwrapTrustedValue=function(){return a}};a&&(b.prototype=new a);b.prototype.valueOf=function(){return this.$$unwrapTrustedValue()};b.prototype.toString=function(){return this.$$unwrapTrustedValue().toString()};return b}var e=function(a){throw Fa("unsafe");
};d.has("$sanitize")&&(e=d.get("$sanitize"));var g=f(),h={};h[ga.HTML]=f(g);h[ga.CSS]=f(g);h[ga.URL]=f(g);h[ga.JS]=f(g);h[ga.RESOURCE_URL]=f(h[ga.URL]);return{trustAs:function(a,b){var c=h.hasOwnProperty(a)?h[a]:null;if(!c)throw Fa("icontext",a,b);if(null===b||z(b)||""===b)return b;if("string"!==typeof b)throw Fa("itype",a);return new c(b)},getTrusted:function(d,f){if(null===f||z(f)||""===f)return f;var g=h.hasOwnProperty(d)?h[d]:null;if(g&&f instanceof g)return f.$$unwrapTrustedValue();if(d===ga.RESOURCE_URL){var g=
ta(f.toString()),n,r,s=!1;n=0;for(r=a.length;n<r;n++)if(c(a[n],g)){s=!0;break}if(s)for(n=0,r=b.length;n<r;n++)if(c(b[n],g)){s=!1;break}if(s)return f;throw Fa("insecurl",f.toString());}if(d===ga.HTML)return e(f);throw Fa("unsafe");},valueOf:function(a){return a instanceof g?a.$$unwrapTrustedValue():a}}}]}function Lf(){var a=!0;this.enabled=function(b){arguments.length&&(a=!!b);return a};this.$get=["$parse","$sceDelegate",function(b,d){if(a&&8>Ia)throw Fa("iequirks");var c=ka(ga);c.isEnabled=function(){return a};
c.trustAs=d.trustAs;c.getTrusted=d.getTrusted;c.valueOf=d.valueOf;a||(c.trustAs=c.getTrusted=function(a,b){return b},c.valueOf=$a);c.parseAs=function(a,d){var e=b(d);return e.literal&&e.constant?e:b(d,function(b){return c.getTrusted(a,b)})};var f=c.parseAs,e=c.getTrusted,g=c.trustAs;q(ga,function(a,b){var d=Q(b);c[hb("parse_as_"+d)]=function(b){return f(a,b)};c[hb("get_trusted_"+d)]=function(b){return e(a,b)};c[hb("trust_as_"+d)]=function(b){return g(a,b)}});return c}]}function Nf(){this.$get=["$window",
"$document",function(a,b){var d={},c=!(a.chrome&&(a.chrome.app&&a.chrome.app.runtime||!a.chrome.app&&a.chrome.runtime&&a.chrome.runtime.id))&&a.history&&a.history.pushState,f=Z((/android (\d+)/.exec(Q((a.navigator||{}).userAgent))||[])[1]),e=/Boxee/i.test((a.navigator||{}).userAgent),g=b[0]||{},h,k=/^(Moz|webkit|ms)(?=[A-Z])/,l=g.body&&g.body.style,m=!1,n=!1;if(l){for(var r in l)if(m=k.exec(r)){h=m[0];h=h[0].toUpperCase()+h.substr(1);break}h||(h="WebkitOpacity"in l&&"webkit");m=!!("transition"in l||
h+"Transition"in l);n=!!("animation"in l||h+"Animation"in l);!f||m&&n||(m=D(l.webkitTransition),n=D(l.webkitAnimation))}return{history:!(!c||4>f||e),hasEvent:function(a){if("input"===a&&11>=Ia)return!1;if(z(d[a])){var b=g.createElement("div");d[a]="on"+a in b}return d[a]},csp:da(),vendorPrefix:h,transitions:m,animations:n,android:f}}]}function Pf(){var a;this.httpOptions=function(b){return b?(a=b,this):a};this.$get=["$templateCache","$http","$q","$sce",function(b,d,c,f){function e(g,h){e.totalPendingRequests++;
if(!D(g)||z(b.get(g)))g=f.getTrustedResourceUrl(g);var k=d.defaults&&d.defaults.transformResponse;I(k)?k=k.filter(function(a){return a!==gc}):k===gc&&(k=null);return d.get(g,R({cache:b,transformResponse:k},a))["finally"](function(){e.totalPendingRequests--}).then(function(a){b.put(g,a.data);return a.data},function(a){if(!h)throw Hg("tpload",g,a.status,a.statusText);return c.reject(a)})}e.totalPendingRequests=0;return e}]}function Qf(){this.$get=["$rootScope","$browser","$location",function(a,b,d){return{findBindings:function(a,
b,d){a=a.getElementsByClassName("ng-binding");var g=[];q(a,function(a){var c=$.element(a).data("$binding");c&&q(c,function(c){d?(new RegExp("(^|\\s)"+Jd(b)+"(\\s|\\||$)")).test(c)&&g.push(a):-1!==c.indexOf(b)&&g.push(a)})});return g},findModels:function(a,b,d){for(var g=["ng-","data-ng-","ng\\:"],h=0;h<g.length;++h){var k=a.querySelectorAll("["+g[h]+"model"+(d?"=":"*=")+'"'+b+'"]');if(k.length)return k}},getLocation:function(){return d.url()},setLocation:function(b){b!==d.url()&&(d.url(b),a.$digest())},
whenStable:function(a){b.notifyWhenNoOutstandingRequests(a)}}}]}function Rf(){this.$get=["$rootScope","$browser","$q","$$q","$exceptionHandler",function(a,b,d,c,f){function e(e,k,l){C(e)||(l=k,k=e,e=w);var m=va.call(arguments,3),n=x(l)&&!l,r=(n?c:d).defer(),s=r.promise,q;q=b.defer(function(){try{r.resolve(e.apply(null,m))}catch(b){r.reject(b),f(b)}finally{delete g[s.$$timeoutId]}n||a.$apply()},k);s.$$timeoutId=q;g[q]=r;return s}var g={};e.cancel=function(a){return a&&a.$$timeoutId in g?(g[a.$$timeoutId].reject("canceled"),
delete g[a.$$timeoutId],b.defer.cancel(a.$$timeoutId)):!1};return e}]}function ta(a){Ia&&(aa.setAttribute("href",a),a=aa.href);aa.setAttribute("href",a);return{href:aa.href,protocol:aa.protocol?aa.protocol.replace(/:$/,""):"",host:aa.host,search:aa.search?aa.search.replace(/^\?/,""):"",hash:aa.hash?aa.hash.replace(/^#/,""):"",hostname:aa.hostname,port:aa.port,pathname:"/"===aa.pathname.charAt(0)?aa.pathname:"/"+aa.pathname}}function od(a){a=D(a)?ta(a):a;return a.protocol===Ld.protocol&&a.host===Ld.host}
function Sf(){this.$get=ha(y)}function Md(a){function b(a){try{return decodeURIComponent(a)}catch(b){return a}}var d=a[0]||{},c={},f="";return function(){var a,g,h,k,l;try{a=d.cookie||""}catch(m){a=""}if(a!==f)for(f=a,a=f.split("; "),c={},h=0;h<a.length;h++)g=a[h],k=g.indexOf("="),0<k&&(l=b(g.substring(0,k)),z(c[l])&&(c[l]=b(g.substring(k+1))));return c}}function Wf(){this.$get=Md}function Rc(a){function b(d,c){if(E(d)){var f={};q(d,function(a,c){f[c]=b(c,a)});return f}return a.factory(d+"Filter",
c)}this.register=b;this.$get=["$injector",function(a){return function(b){return a.get(b+"Filter")}}];b("currency",Nd);b("date",Od);b("filter",Ig);b("json",Jg);b("limitTo",Kg);b("lowercase",Lg);b("number",Pd);b("orderBy",Qd);b("uppercase",Mg)}function Ig(){return function(a,b,d,c){if(!la(a)){if(null==a)return a;throw G("filter")("notarray",a);}c=c||"$";var f;switch(oc(b)){case "function":break;case "boolean":case "null":case "number":case "string":f=!0;case "object":b=Ng(b,d,c,f);break;default:return a}return Array.prototype.filter.call(a,
b)}}function Ng(a,b,d,c){var f=E(a)&&d in a;!0===b?b=na:C(b)||(b=function(a,b){if(z(a))return!1;if(null===a||null===b)return a===b;if(E(b)||E(a)&&!Ac(a))return!1;a=Q(""+a);b=Q(""+b);return-1!==a.indexOf(b)});return function(e){return f&&!E(e)?Na(e,a[d],b,d,!1):Na(e,a,b,d,c)}}function Na(a,b,d,c,f,e){var g=oc(a),h=oc(b);if("string"===h&&"!"===b.charAt(0))return!Na(a,b.substring(1),d,c,f);if(I(a))return a.some(function(a){return Na(a,b,d,c,f)});switch(g){case "object":var k;if(f){for(k in a)if("$"!==
k.charAt(0)&&Na(a[k],b,d,c,!0))return!0;return e?!1:Na(a,b,d,c,!1)}if("object"===h){for(k in b)if(e=b[k],!C(e)&&!z(e)&&(g=k===c,!Na(g?a:a[k],e,d,c,g,g)))return!1;return!0}return d(a,b);case "function":return!1;default:return d(a,b)}}function oc(a){return null===a?"null":typeof a}function Nd(a){var b=a.NUMBER_FORMATS;return function(a,c,f){z(c)&&(c=b.CURRENCY_SYM);z(f)&&(f=b.PATTERNS[1].maxFrac);return null==a?a:Rd(a,b.PATTERNS[1],b.GROUP_SEP,b.DECIMAL_SEP,f).replace(/\u00A4/g,c)}}function Pd(a){var b=
a.NUMBER_FORMATS;return function(a,c){return null==a?a:Rd(a,b.PATTERNS[0],b.GROUP_SEP,b.DECIMAL_SEP,c)}}function Og(a){var b=0,d,c,f,e,g;-1<(c=a.indexOf(Sd))&&(a=a.replace(Sd,""));0<(f=a.search(/e/i))?(0>c&&(c=f),c+=+a.slice(f+1),a=a.substring(0,f)):0>c&&(c=a.length);for(f=0;a.charAt(f)===pc;f++);if(f===(g=a.length))d=[0],c=1;else{for(g--;a.charAt(g)===pc;)g--;c-=f;d=[];for(e=0;f<=g;f++,e++)d[e]=+a.charAt(f)}c>Td&&(d=d.splice(0,Td-1),b=c-1,c=1);return{d:d,e:b,i:c}}function Pg(a,b,d,c){var f=a.d,e=
f.length-a.i;b=z(b)?Math.min(Math.max(d,e),c):+b;d=b+a.i;c=f[d];if(0<d){f.splice(Math.max(a.i,d));for(var g=d;g<f.length;g++)f[g]=0}else for(e=Math.max(0,e),a.i=1,f.length=Math.max(1,d=b+1),f[0]=0,g=1;g<d;g++)f[g]=0;if(5<=c)if(0>d-1){for(c=0;c>d;c--)f.unshift(0),a.i++;f.unshift(1);a.i++}else f[d-1]++;for(;e<Math.max(0,b);e++)f.push(0);if(b=f.reduceRight(function(a,b,c,d){b+=a;d[c]=b%10;return Math.floor(b/10)},0))f.unshift(b),a.i++}function Rd(a,b,d,c,f){if(!D(a)&&!ba(a)||isNaN(a))return"";var e=
!isFinite(a),g=!1,h=Math.abs(a)+"",k="";if(e)k="\u221e";else{g=Og(h);Pg(g,f,b.minFrac,b.maxFrac);k=g.d;h=g.i;f=g.e;e=[];for(g=k.reduce(function(a,b){return a&&!b},!0);0>h;)k.unshift(0),h++;0<h?e=k.splice(h,k.length):(e=k,k=[0]);h=[];for(k.length>=b.lgSize&&h.unshift(k.splice(-b.lgSize,k.length).join(""));k.length>b.gSize;)h.unshift(k.splice(-b.gSize,k.length).join(""));k.length&&h.unshift(k.join(""));k=h.join(d);e.length&&(k+=c+e.join(""));f&&(k+="e+"+f)}return 0>a&&!g?b.negPre+k+b.negSuf:b.posPre+
k+b.posSuf}function Mb(a,b,d,c){var f="";if(0>a||c&&0>=a)c?a=-a+1:(a=-a,f="-");for(a=""+a;a.length<b;)a=pc+a;d&&(a=a.substr(a.length-b));return f+a}function U(a,b,d,c,f){d=d||0;return function(e){e=e["get"+a]();if(0<d||e>-d)e+=d;0===e&&-12===d&&(e=12);return Mb(e,b,c,f)}}function nb(a,b,d){return function(c,f){var e=c["get"+a](),g=wb((d?"STANDALONE":"")+(b?"SHORT":"")+a);return f[g][e]}}function Ud(a){var b=(new Date(a,0,1)).getDay();return new Date(a,0,(4>=b?5:12)-b)}function Vd(a){return function(b){var d=
Ud(b.getFullYear());b=+new Date(b.getFullYear(),b.getMonth(),b.getDate()+(4-b.getDay()))-+d;b=1+Math.round(b/6048E5);return Mb(b,a)}}function qc(a,b){return 0>=a.getFullYear()?b.ERAS[0]:b.ERAS[1]}function Od(a){function b(a){var b;if(b=a.match(d)){a=new Date(0);var e=0,g=0,h=b[8]?a.setUTCFullYear:a.setFullYear,k=b[8]?a.setUTCHours:a.setHours;b[9]&&(e=Z(b[9]+b[10]),g=Z(b[9]+b[11]));h.call(a,Z(b[1]),Z(b[2])-1,Z(b[3]));e=Z(b[4]||0)-e;g=Z(b[5]||0)-g;h=Z(b[6]||0);b=Math.round(1E3*parseFloat("0."+(b[7]||
0)));k.call(a,e,g,h,b)}return a}var d=/^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;return function(c,d,e){var g="",h=[],k,l;d=d||"mediumDate";d=a.DATETIME_FORMATS[d]||d;D(c)&&(c=Qg.test(c)?Z(c):b(c));ba(c)&&(c=new Date(c));if(!ja(c)||!isFinite(c.getTime()))return c;for(;d;)(l=Rg.exec(d))?(h=cb(h,l,1),d=h.pop()):(h.push(d),d=null);var m=c.getTimezoneOffset();e&&(m=Dc(e,m),c=Ub(c,e,!0));q(h,function(b){k=Sg[b];g+=k?k(c,a.DATETIME_FORMATS,m):
"''"===b?"'":b.replace(/(^'|'$)/g,"").replace(/''/g,"'")});return g}}function Jg(){return function(a,b){z(b)&&(b=2);return eb(a,b)}}function Kg(){return function(a,b,d){b=Infinity===Math.abs(Number(b))?Number(b):Z(b);if(ia(b))return a;ba(a)&&(a=a.toString());if(!la(a))return a;d=!d||isNaN(d)?0:Z(d);d=0>d?Math.max(0,a.length+d):d;return 0<=b?rc(a,d,d+b):0===d?rc(a,b,a.length):rc(a,Math.max(0,d+b),d)}}function rc(a,b,d){return D(a)?a.slice(b,d):va.call(a,b,d)}function Qd(a){function b(b){return b.map(function(b){var c=
1,d=$a;if(C(b))d=b;else if(D(b)){if("+"===b.charAt(0)||"-"===b.charAt(0))c="-"===b.charAt(0)?-1:1,b=b.substring(1);if(""!==b&&(d=a(b),d.constant))var f=d(),d=function(a){return a[f]}}return{get:d,descending:c}})}function d(a){switch(typeof a){case "number":case "boolean":case "string":return!0;default:return!1}}function c(a,b){var c=0,d=a.type,k=b.type;if(d===k){var k=a.value,l=b.value;"string"===d?(k=k.toLowerCase(),l=l.toLowerCase()):"object"===d&&(E(k)&&(k=a.index),E(l)&&(l=b.index));k!==l&&(c=
k<l?-1:1)}else c=d<k?-1:1;return c}return function(a,e,g,h){if(null==a)return a;if(!la(a))throw G("orderBy")("notarray",a);I(e)||(e=[e]);0===e.length&&(e=["+"]);var k=b(e),l=g?-1:1,m=C(h)?h:c;a=Array.prototype.map.call(a,function(a,b){return{value:a,tieBreaker:{value:b,type:"number",index:b},predicateValues:k.map(function(c){var e=c.get(a);c=typeof e;if(null===e)c="string",e="null";else if("object"===c)a:{if(C(e.valueOf)&&(e=e.valueOf(),d(e)))break a;Ac(e)&&(e=e.toString(),d(e))}return{value:e,type:c,
index:b}})}});a.sort(function(a,b){for(var c=0,d=k.length;c<d;c++){var e=m(a.predicateValues[c],b.predicateValues[c]);if(e)return e*k[c].descending*l}return m(a.tieBreaker,b.tieBreaker)*l});return a=a.map(function(a){return a.value})}}function Va(a){C(a)&&(a={link:a});a.restrict=a.restrict||"AC";return ha(a)}function Wd(a,b,d,c,f){var e=this,g=[];e.$error={};e.$$success={};e.$pending=void 0;e.$name=f(b.name||b.ngForm||"")(d);e.$dirty=!1;e.$pristine=!0;e.$valid=!0;e.$invalid=!1;e.$submitted=!1;e.$$parentForm=
Nb;e.$rollbackViewValue=function(){q(g,function(a){a.$rollbackViewValue()})};e.$commitViewValue=function(){q(g,function(a){a.$commitViewValue()})};e.$addControl=function(a){Ra(a.$name,"input");g.push(a);a.$name&&(e[a.$name]=a);a.$$parentForm=e};e.$$renameControl=function(a,b){var c=a.$name;e[c]===a&&delete e[c];e[b]=a;a.$name=b};e.$removeControl=function(a){a.$name&&e[a.$name]===a&&delete e[a.$name];q(e.$pending,function(b,c){e.$setValidity(c,null,a)});q(e.$error,function(b,c){e.$setValidity(c,null,
a)});q(e.$$success,function(b,c){e.$setValidity(c,null,a)});bb(g,a);a.$$parentForm=Nb};Xd({ctrl:this,$element:a,set:function(a,b,c){var d=a[b];d?-1===d.indexOf(c)&&d.push(c):a[b]=[c]},unset:function(a,b,c){var d=a[b];d&&(bb(d,c),0===d.length&&delete a[b])},$animate:c});e.$setDirty=function(){c.removeClass(a,Wa);c.addClass(a,Ob);e.$dirty=!0;e.$pristine=!1;e.$$parentForm.$setDirty()};e.$setPristine=function(){c.setClass(a,Wa,Ob+" ng-submitted");e.$dirty=!1;e.$pristine=!0;e.$submitted=!1;q(g,function(a){a.$setPristine()})};
e.$setUntouched=function(){q(g,function(a){a.$setUntouched()})};e.$setSubmitted=function(){c.addClass(a,"ng-submitted");e.$submitted=!0;e.$$parentForm.$setSubmitted()}}function sc(a){a.$formatters.push(function(b){return a.$isEmpty(b)?b:b.toString()})}function Xa(a,b,d,c,f,e){var g=Q(b[0].type);if(!f.android){var h=!1;b.on("compositionstart",function(){h=!0});b.on("compositionend",function(){h=!1;l()})}var k,l=function(a){k&&(e.defer.cancel(k),k=null);if(!h){var f=b.val();a=a&&a.type;"password"===
g||d.ngTrim&&"false"===d.ngTrim||(f=Y(f));(c.$viewValue!==f||""===f&&c.$$hasNativeValidators)&&c.$setViewValue(f,a)}};if(f.hasEvent("input"))b.on("input",l);else{var m=function(a,b,c){k||(k=e.defer(function(){k=null;b&&b.value===c||l(a)}))};b.on("keydown",function(a){var b=a.keyCode;91===b||15<b&&19>b||37<=b&&40>=b||m(a,this,this.value)});if(f.hasEvent("paste"))b.on("paste cut",m)}b.on("change",l);if(Yd[g]&&c.$$hasNativeValidators&&g===d.type)b.on("keydown wheel mousedown",function(a){if(!k){var b=
this.validity,c=b.badInput,d=b.typeMismatch;k=e.defer(function(){k=null;b.badInput===c&&b.typeMismatch===d||l(a)})}});c.$render=function(){var a=c.$isEmpty(c.$viewValue)?"":c.$viewValue;b.val()!==a&&b.val(a)}}function Pb(a,b){return function(d,c){var f,e;if(ja(d))return d;if(D(d)){'"'===d.charAt(0)&&'"'===d.charAt(d.length-1)&&(d=d.substring(1,d.length-1));if(Tg.test(d))return new Date(d);a.lastIndex=0;if(f=a.exec(d))return f.shift(),e=c?{yyyy:c.getFullYear(),MM:c.getMonth()+1,dd:c.getDate(),HH:c.getHours(),
mm:c.getMinutes(),ss:c.getSeconds(),sss:c.getMilliseconds()/1E3}:{yyyy:1970,MM:1,dd:1,HH:0,mm:0,ss:0,sss:0},q(f,function(a,c){c<b.length&&(e[b[c]]=+a)}),new Date(e.yyyy,e.MM-1,e.dd,e.HH,e.mm,e.ss||0,1E3*e.sss||0)}return NaN}}function ob(a,b,d,c){return function(f,e,g,h,k,l,m){function n(a){return a&&!(a.getTime&&a.getTime()!==a.getTime())}function r(a){return x(a)&&!ja(a)?d(a)||void 0:a}tc(f,e,g,h);Xa(f,e,g,h,k,l);var s=h&&h.$options&&h.$options.timezone,q;h.$$parserName=a;h.$parsers.push(function(a){if(h.$isEmpty(a))return null;
if(b.test(a))return a=d(a,q),s&&(a=Ub(a,s)),a});h.$formatters.push(function(a){if(a&&!ja(a))throw pb("datefmt",a);if(n(a))return(q=a)&&s&&(q=Ub(q,s,!0)),m("date")(a,c,s);q=null;return""});if(x(g.min)||g.ngMin){var u;h.$validators.min=function(a){return!n(a)||z(u)||d(a)>=u};g.$observe("min",function(a){u=r(a);h.$validate()})}if(x(g.max)||g.ngMax){var p;h.$validators.max=function(a){return!n(a)||z(p)||d(a)<=p};g.$observe("max",function(a){p=r(a);h.$validate()})}}}function tc(a,b,d,c){(c.$$hasNativeValidators=
E(b[0].validity))&&c.$parsers.push(function(a){var c=b.prop("validity")||{};return c.badInput||c.typeMismatch?void 0:a})}function Zd(a){a.$$parserName="number";a.$parsers.push(function(b){if(a.$isEmpty(b))return null;if(Ug.test(b))return parseFloat(b)});a.$formatters.push(function(b){if(!a.$isEmpty(b)){if(!ba(b))throw pb("numfmt",b);b=b.toString()}return b})}function qb(a){x(a)&&!ba(a)&&(a=parseFloat(a));return ia(a)?void 0:a}function uc(a){var b=a.toString(),d=b.indexOf(".");return-1===d?-1<a&&1>
a&&(a=/e-(\d+)$/.exec(b))?Number(a[1]):0:b.length-d-1}function $d(a,b,d,c,f){if(x(c)){a=a(c);if(!a.constant)throw pb("constexpr",d,c);return a(b)}return f}function vc(a,b){a="ngClass"+a;return["$animate",function(d){function c(a,b){var c=[],d=0;a:for(;d<a.length;d++){for(var f=a[d],m=0;m<b.length;m++)if(f===b[m])continue a;c.push(f)}return c}function f(a){var b=[];return I(a)?(q(a,function(a){b=b.concat(f(a))}),b):D(a)?a.split(" "):E(a)?(q(a,function(a,c){a&&(b=b.concat(c.split(" ")))}),b):a}return{restrict:"AC",
link:function(e,g,h){function k(a){a=l(a,1);h.$addClass(a)}function l(a,b){var c=g.data("$classCounts")||V(),d=[];q(a,function(a){if(0<b||c[a])c[a]=(c[a]||0)+b,c[a]===+(0<b)&&d.push(a)});g.data("$classCounts",c);return d.join(" ")}function m(a,b){var e=c(b,a),f=c(a,b),e=l(e,1),f=l(f,-1);e&&e.length&&d.addClass(g,e);f&&f.length&&d.removeClass(g,f)}function n(a){if(!0===b||(e.$index&1)===b){var c=f(a||[]);if(!r)k(c);else if(!na(a,r)){var d=f(r);m(d,c)}}r=I(a)?a.map(function(a){return ka(a)}):ka(a)}
var r;h.$observe("class",function(b){n(e.$eval(h[a]))});"ngClass"!==a&&e.$watch("$index",function(a,c){var d=a&1;if(d!==(c&1)){var e=f(r);d===b?k(e):(d=l(e,-1),h.$removeClass(d))}});e.$watch(h[a],n,!0)}}}]}function Xd(a){function b(a,b){b&&!e[a]?(k.addClass(f,a),e[a]=!0):!b&&e[a]&&(k.removeClass(f,a),e[a]=!1)}function d(a,c){a=a?"-"+Hc(a,"-"):"";b(rb+a,!0===c);b(ae+a,!1===c)}var c=a.ctrl,f=a.$element,e={},g=a.set,h=a.unset,k=a.$animate;e[ae]=!(e[rb]=f.hasClass(rb));c.$setValidity=function(a,e,f){z(e)?
(c.$pending||(c.$pending={}),g(c.$pending,a,f)):(c.$pending&&h(c.$pending,a,f),be(c.$pending)&&(c.$pending=void 0));Ka(e)?e?(h(c.$error,a,f),g(c.$$success,a,f)):(g(c.$error,a,f),h(c.$$success,a,f)):(h(c.$error,a,f),h(c.$$success,a,f));c.$pending?(b(ce,!0),c.$valid=c.$invalid=void 0,d("",null)):(b(ce,!1),c.$valid=be(c.$error),c.$invalid=!c.$valid,d("",c.$valid));e=c.$pending&&c.$pending[a]?void 0:c.$error[a]?!1:c.$$success[a]?!0:null;d(a,e);c.$$parentForm.$setValidity(a,e,c)}}function be(a){if(a)for(var b in a)if(a.hasOwnProperty(b))return!1;
return!0}var Vg=/^\/(.+)\/([a-z]*)$/,ua=Object.prototype.hasOwnProperty,Q=function(a){return D(a)?a.toLowerCase():a},wb=function(a){return D(a)?a.toUpperCase():a},Ia,F,za,va=[].slice,pg=[].splice,Wg=[].push,ma=Object.prototype.toString,Bc=Object.getPrototypeOf,xa=G("ng"),$=y.angular||(y.angular={}),Wb,sb=0;Ia=y.document.documentMode;var ia=Number.isNaN||function(a){return a!==a};w.$inject=[];$a.$inject=[];var I=Array.isArray,ne=/^\[object (?:Uint8|Uint8Clamped|Uint16|Uint32|Int8|Int16|Int32|Float32|Float64)Array]$/,
Y=function(a){return D(a)?a.trim():a},Jd=function(a){return a.replace(/([-()[\]{}+?*.$^|,:#<!\\])/g,"\\$1").replace(/\x08/g,"\\x08")},da=function(){if(!x(da.rules)){var a=y.document.querySelector("[ng-csp]")||y.document.querySelector("[data-ng-csp]");if(a){var b=a.getAttribute("ng-csp")||a.getAttribute("data-ng-csp");da.rules={noUnsafeEval:!b||-1!==b.indexOf("no-unsafe-eval"),noInlineStyle:!b||-1!==b.indexOf("no-inline-style")}}else{a=da;try{new Function(""),b=!1}catch(d){b=!0}a.rules={noUnsafeEval:b,
noInlineStyle:!1}}}return da.rules},ub=function(){if(x(ub.name_))return ub.name_;var a,b,d=Oa.length,c,f;for(b=0;b<d;++b)if(c=Oa[b],a=y.document.querySelector("["+c.replace(":","\\:")+"jq]")){f=a.getAttribute(c+"jq");break}return ub.name_=f},qe=/:/g,Oa=["ng-","data-ng-","ng:","x-ng-"],te=function(a){var b=a.currentScript,b=b&&b.getAttribute("src");if(!b)return!0;var d=a.createElement("a");d.href=b;if(a.location.origin===d.origin)return!0;switch(d.protocol){case "http:":case "https:":case "ftp:":case "blob:":case "file:":case "data:":return!0;
default:return!1}}(y.document),we=/[A-Z]/g,Ic=!1,La=3,Ae={full:"1.5.11",major:1,minor:5,dot:11,codeName:"princely-quest"};W.expando="ng339";var jb=W.cache={},bg=1;W._data=function(a){return this.cache[a[this.expando]]||{}};var Xf=/([:\-_]+(.))/g,Yf=/^moz([A-Z])/,Ab={mouseleave:"mouseout",mouseenter:"mouseover"},Yb=G("jqLite"),ag=/^<([\w-]+)\s*\/?>(?:<\/\1>|)$/,Xb=/<|&#?\w+;/,Zf=/<([\w:-]+)/,$f=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,pa={option:[1,'<select multiple="multiple">',
"</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};pa.optgroup=pa.option;pa.tbody=pa.tfoot=pa.colgroup=pa.caption=pa.thead;pa.th=pa.td;var gg=y.Node.prototype.contains||function(a){return!!(this.compareDocumentPosition(a)&16)},Pa=W.prototype={ready:function(a){function b(){d||(d=!0,a())}var d=!1;"complete"===y.document.readyState?y.setTimeout(b):
(this.on("DOMContentLoaded",b),W(y).on("load",b))},toString:function(){var a=[];q(this,function(b){a.push(""+b)});return"["+a.join(", ")+"]"},eq:function(a){return 0<=a?F(this[a]):F(this[this.length+a])},length:0,push:Wg,sort:[].sort,splice:[].splice},Gb={};q("multiple selected checked disabled readOnly required open".split(" "),function(a){Gb[Q(a)]=a});var $c={};q("input select option textarea button form details".split(" "),function(a){$c[a]=!0});var gd={ngMinlength:"minlength",ngMaxlength:"maxlength",
ngMin:"min",ngMax:"max",ngPattern:"pattern"};q({data:$b,removeData:ib,hasData:function(a){for(var b in jb[a.ng339])return!0;return!1},cleanData:function(a){for(var b=0,d=a.length;b<d;b++)ib(a[b])}},function(a,b){W[b]=a});q({data:$b,inheritedData:Eb,scope:function(a){return F.data(a,"$scope")||Eb(a.parentNode||a,["$isolateScope","$scope"])},isolateScope:function(a){return F.data(a,"$isolateScope")||F.data(a,"$isolateScopeNoTemplate")},controller:Xc,injector:function(a){return Eb(a,"$injector")},removeAttr:function(a,
b){a.removeAttribute(b)},hasClass:Bb,css:function(a,b,d){b=hb(b);if(x(d))a.style[b]=d;else return a.style[b]},attr:function(a,b,d){var c=a.nodeType;if(c!==La&&2!==c&&8!==c)if(c=Q(b),Gb[c])if(x(d))d?(a[b]=!0,a.setAttribute(b,c)):(a[b]=!1,a.removeAttribute(c));else return a[b]||(a.attributes.getNamedItem(b)||w).specified?c:void 0;else if(x(d))a.setAttribute(b,d);else if(a.getAttribute)return a=a.getAttribute(b,2),null===a?void 0:a},prop:function(a,b,d){if(x(d))a[b]=d;else return a[b]},text:function(){function a(a,
d){if(z(d)){var c=a.nodeType;return 1===c||c===La?a.textContent:""}a.textContent=d}a.$dv="";return a}(),val:function(a,b){if(z(b)){if(a.multiple&&"select"===wa(a)){var d=[];q(a.options,function(a){a.selected&&d.push(a.value||a.text)});return 0===d.length?null:d}return a.value}a.value=b},html:function(a,b){if(z(b))return a.innerHTML;yb(a,!0);a.innerHTML=b},empty:Yc},function(a,b){W.prototype[b]=function(b,c){var f,e,g=this.length;if(a!==Yc&&z(2===a.length&&a!==Bb&&a!==Xc?b:c)){if(E(b)){for(f=0;f<g;f++)if(a===
$b)a(this[f],b);else for(e in b)a(this[f],e,b[e]);return this}f=a.$dv;g=z(f)?Math.min(g,1):g;for(e=0;e<g;e++){var h=a(this[e],b,c);f=f?f+h:h}return f}for(f=0;f<g;f++)a(this[f],b,c);return this}});q({removeData:ib,on:function(a,b,d,c){if(x(c))throw Yb("onargs");if(Sc(a)){c=zb(a,!0);var f=c.events,e=c.handle;e||(e=c.handle=dg(a,f));c=0<=b.indexOf(" ")?b.split(" "):[b];for(var g=c.length,h=function(b,c,g){var h=f[b];h||(h=f[b]=[],h.specialHandlerWrapper=c,"$destroy"===b||g||a.addEventListener(b,e,!1));
h.push(d)};g--;)b=c[g],Ab[b]?(h(Ab[b],fg),h(b,void 0,!0)):h(b)}},off:Wc,one:function(a,b,d){a=F(a);a.on(b,function f(){a.off(b,d);a.off(b,f)});a.on(b,d)},replaceWith:function(a,b){var d,c=a.parentNode;yb(a);q(new W(b),function(b){d?c.insertBefore(b,d.nextSibling):c.replaceChild(b,a);d=b})},children:function(a){var b=[];q(a.childNodes,function(a){1===a.nodeType&&b.push(a)});return b},contents:function(a){return a.contentDocument||a.childNodes||[]},append:function(a,b){var d=a.nodeType;if(1===d||11===
d){b=new W(b);for(var d=0,c=b.length;d<c;d++)a.appendChild(b[d])}},prepend:function(a,b){if(1===a.nodeType){var d=a.firstChild;q(new W(b),function(b){a.insertBefore(b,d)})}},wrap:function(a,b){Uc(a,F(b).eq(0).clone()[0])},remove:Fb,detach:function(a){Fb(a,!0)},after:function(a,b){var d=a,c=a.parentNode;if(c){b=new W(b);for(var f=0,e=b.length;f<e;f++){var g=b[f];c.insertBefore(g,d.nextSibling);d=g}}},addClass:Db,removeClass:Cb,toggleClass:function(a,b,d){b&&q(b.split(" "),function(b){var f=d;z(f)&&
(f=!Bb(a,b));(f?Db:Cb)(a,b)})},parent:function(a){return(a=a.parentNode)&&11!==a.nodeType?a:null},next:function(a){return a.nextElementSibling},find:function(a,b){return a.getElementsByTagName?a.getElementsByTagName(b):[]},clone:Zb,triggerHandler:function(a,b,d){var c,f,e=b.type||b,g=zb(a);if(g=(g=g&&g.events)&&g[e])c={preventDefault:function(){this.defaultPrevented=!0},isDefaultPrevented:function(){return!0===this.defaultPrevented},stopImmediatePropagation:function(){this.immediatePropagationStopped=
!0},isImmediatePropagationStopped:function(){return!0===this.immediatePropagationStopped},stopPropagation:w,type:e,target:a},b.type&&(c=R(c,b)),b=ka(g),f=d?[c].concat(d):[c],q(b,function(b){c.isImmediatePropagationStopped()||b.apply(a,f)})}},function(a,b){W.prototype[b]=function(b,c,f){for(var e,g=0,h=this.length;g<h;g++)z(e)?(e=a(this[g],b,c,f),x(e)&&(e=F(e))):Vc(e,a(this[g],b,c,f));return x(e)?e:this}});W.prototype.bind=W.prototype.on;W.prototype.unbind=W.prototype.off;Sa.prototype={put:function(a,
b){this[Aa(a,this.nextUid)]=b},get:function(a){return this[Aa(a,this.nextUid)]},remove:function(a){var b=this[a=Aa(a,this.nextUid)];delete this[a];return b}};var Vf=[function(){this.$get=[function(){return Sa}]}],ig=/^([^(]+?)=>/,jg=/^[^(]*\(\s*([^)]*)\)/m,Xg=/,/,Yg=/^\s*(_?)(\S+?)\1\s*$/,hg=/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,Ba=G("$injector");fb.$$annotate=function(a,b,d){var c;if("function"===typeof a){if(!(c=a.$inject)){c=[];if(a.length){if(b)throw D(d)&&d||(d=a.name||kg(a)),Ba("strictdi",d);b=
ad(a);q(b[1].split(Xg),function(a){a.replace(Yg,function(a,b,d){c.push(d)})})}a.$inject=c}}else I(a)?(b=a.length-1,Qa(a[b],"fn"),c=a.slice(0,b)):Qa(a,"fn",!0);return c};var de=G("$animate"),nf=function(){this.$get=w},of=function(){var a=new Sa,b=[];this.$get=["$$AnimateRunner","$rootScope",function(d,c){function f(a,b,c){var d=!1;b&&(b=D(b)?b.split(" "):I(b)?b:[],q(b,function(b){b&&(d=!0,a[b]=c)}));return d}function e(){q(b,function(b){var c=a.get(b);if(c){var d=lg(b.attr("class")),e="",f="";q(c,
function(a,b){a!==!!d[b]&&(a?e+=(e.length?" ":"")+b:f+=(f.length?" ":"")+b)});q(b,function(a){e&&Db(a,e);f&&Cb(a,f)});a.remove(b)}});b.length=0}return{enabled:w,on:w,off:w,pin:w,push:function(g,h,k,l){l&&l();k=k||{};k.from&&g.css(k.from);k.to&&g.css(k.to);if(k.addClass||k.removeClass)if(h=k.addClass,l=k.removeClass,k=a.get(g)||{},h=f(k,h,!0),l=f(k,l,!1),h||l)a.put(g,k),b.push(g),1===b.length&&c.$$postDigest(e);g=new d;g.complete();return g}}}]},lf=["$provide",function(a){var b=this;this.$$registeredAnimations=
Object.create(null);this.register=function(d,c){if(d&&"."!==d.charAt(0))throw de("notcsel",d);var f=d+"-animation";b.$$registeredAnimations[d.substr(1)]=f;a.factory(f,c)};this.classNameFilter=function(a){if(1===arguments.length&&(this.$$classNameFilter=a instanceof RegExp?a:null)&&/(\s+|\/)ng-animate(\s+|\/)/.test(this.$$classNameFilter.toString()))throw de("nongcls","ng-animate");return this.$$classNameFilter};this.$get=["$$animateQueue",function(a){function b(a,c,d){if(d){var h;a:{for(h=0;h<d.length;h++){var k=
d[h];if(1===k.nodeType){h=k;break a}}h=void 0}!h||h.parentNode||h.previousElementSibling||(d=null)}d?d.after(a):c.prepend(a)}return{on:a.on,off:a.off,pin:a.pin,enabled:a.enabled,cancel:function(a){a.end&&a.end()},enter:function(f,e,g,h){e=e&&F(e);g=g&&F(g);e=e||g.parent();b(f,e,g);return a.push(f,"enter",Ca(h))},move:function(f,e,g,h){e=e&&F(e);g=g&&F(g);e=e||g.parent();b(f,e,g);return a.push(f,"move",Ca(h))},leave:function(b,c){return a.push(b,"leave",Ca(c),function(){b.remove()})},addClass:function(b,
c,g){g=Ca(g);g.addClass=kb(g.addclass,c);return a.push(b,"addClass",g)},removeClass:function(b,c,g){g=Ca(g);g.removeClass=kb(g.removeClass,c);return a.push(b,"removeClass",g)},setClass:function(b,c,g,h){h=Ca(h);h.addClass=kb(h.addClass,c);h.removeClass=kb(h.removeClass,g);return a.push(b,"setClass",h)},animate:function(b,c,g,h,k){k=Ca(k);k.from=k.from?R(k.from,c):c;k.to=k.to?R(k.to,g):g;k.tempClasses=kb(k.tempClasses,h||"ng-inline-animate");return a.push(b,"animate",k)}}}]}],qf=function(){this.$get=
["$$rAF",function(a){function b(b){d.push(b);1<d.length||a(function(){for(var a=0;a<d.length;a++)d[a]();d=[]})}var d=[];return function(){var a=!1;b(function(){a=!0});return function(d){a?d():b(d)}}}]},pf=function(){this.$get=["$q","$sniffer","$$animateAsyncRun","$document","$timeout",function(a,b,d,c,f){function e(a){this.setHost(a);var b=d();this._doneCallbacks=[];this._tick=function(a){var d=c[0];d&&d.hidden?f(a,0,!1):b(a)};this._state=0}e.chain=function(a,b){function c(){if(d===a.length)b(!0);
else a[d](function(a){!1===a?b(!1):(d++,c())})}var d=0;c()};e.all=function(a,b){function c(f){e=e&&f;++d===a.length&&b(e)}var d=0,e=!0;q(a,function(a){a.done(c)})};e.prototype={setHost:function(a){this.host=a||{}},done:function(a){2===this._state?a():this._doneCallbacks.push(a)},progress:w,getPromise:function(){if(!this.promise){var b=this;this.promise=a(function(a,c){b.done(function(b){!1===b?c():a()})})}return this.promise},then:function(a,b){return this.getPromise().then(a,b)},"catch":function(a){return this.getPromise()["catch"](a)},
"finally":function(a){return this.getPromise()["finally"](a)},pause:function(){this.host.pause&&this.host.pause()},resume:function(){this.host.resume&&this.host.resume()},end:function(){this.host.end&&this.host.end();this._resolve(!0)},cancel:function(){this.host.cancel&&this.host.cancel();this._resolve(!1)},complete:function(a){var b=this;0===b._state&&(b._state=1,b._tick(function(){b._resolve(a)}))},_resolve:function(a){2!==this._state&&(q(this._doneCallbacks,function(b){b(a)}),this._doneCallbacks.length=
0,this._state=2)}};return e}]},mf=function(){this.$get=["$$rAF","$q","$$AnimateRunner",function(a,b,d){return function(b,f){function e(){a(function(){g.addClass&&(b.addClass(g.addClass),g.addClass=null);g.removeClass&&(b.removeClass(g.removeClass),g.removeClass=null);g.to&&(b.css(g.to),g.to=null);h||k.complete();h=!0});return k}var g=f||{};g.$$prepared||(g=sa(g));g.cleanupStyles&&(g.from=g.to=null);g.from&&(b.css(g.from),g.from=null);var h,k=new d;return{start:e,end:e}}}]},fa=G("$compile"),ec=new function(){};
Kc.$inject=["$provide","$$sanitizeUriProvider"];Hb.prototype.isFirstChange=function(){return this.previousValue===ec};var bd=/^((?:x|data)[:\-_])/i,id=G("$controller"),hd=/^(\S+)(\s+as\s+([\w$]+))?$/,wf=function(){this.$get=["$document",function(a){return function(b){b?!b.nodeType&&b instanceof F&&(b=b[0]):b=a[0].body;return b.offsetWidth+1}}]},jd="application/json",hc={"Content-Type":jd+";charset=utf-8"},rg=/^\[|^\{(?!\{)/,sg={"[":/]$/,"{":/}$/},qg=/^\)]\}',?\n/,Zg=G("$http"),nd=function(a){return function(){throw Zg("legacy",
a);}},Ha=$.$interpolateMinErr=G("$interpolate");Ha.throwNoconcat=function(a){throw Ha("noconcat",a);};Ha.interr=function(a,b){return Ha("interr",a,b.toString())};var Ef=function(){this.$get=["$window",function(a){function b(a){var b=function(a){b.data=a;b.called=!0};b.id=a;return b}var d=a.angular.callbacks,c={};return{createCallback:function(a){a="_"+(d.$$counter++).toString(36);var e="angular.callbacks."+a,g=b(a);c[e]=d[a]=g;return e},wasCalled:function(a){return c[a].called},getResponse:function(a){return c[a].data},
removeCallback:function(a){delete d[c[a].id];delete c[a]}}}]},$g=/^([^?#]*)(\?([^#]*))?(#(.*))?$/,ug={http:80,https:443,ftp:21},lb=G("$location"),vg=/^\s*[\\/]{2,}/,ah={$$absUrl:"",$$html5:!1,$$replace:!1,absUrl:Ib("$$absUrl"),url:function(a){if(z(a))return this.$$url;var b=$g.exec(a);(b[1]||""===a)&&this.path(decodeURIComponent(b[1]));(b[2]||b[1]||""===a)&&this.search(b[3]||"");this.hash(b[5]||"");return this},protocol:Ib("$$protocol"),host:Ib("$$host"),port:Ib("$$port"),path:sd("$$path",function(a){a=
null!==a?a.toString():"";return"/"===a.charAt(0)?a:"/"+a}),search:function(a,b){switch(arguments.length){case 0:return this.$$search;case 1:if(D(a)||ba(a))a=a.toString(),this.$$search=Fc(a);else if(E(a))a=sa(a,{}),q(a,function(b,c){null==b&&delete a[c]}),this.$$search=a;else throw lb("isrcharg");break;default:z(b)||null===b?delete this.$$search[a]:this.$$search[a]=b}this.$$compose();return this},hash:sd("$$hash",function(a){return null!==a?a.toString():""}),replace:function(){this.$$replace=!0;return this}};
q([rd,kc,jc],function(a){a.prototype=Object.create(ah);a.prototype.state=function(b){if(!arguments.length)return this.$$state;if(a!==jc||!this.$$html5)throw lb("nostate");this.$$state=z(b)?null:b;return this}});var ea=G("$parse"),ud=[].constructor,vd=(!1).constructor,wd=Function.constructor,xd=(0).constructor,yd={}.constructor,zd="".constructor,Ag=ud.prototype,Bg=vd.prototype,Kb=wd.prototype,Cg=xd.prototype,Ad=yd.prototype,Dg=zd.prototype,xg=Kb.call,yg=Kb.apply,zg=Kb.bind,Fg=Ad.valueOf,Qb=V();q("+ - * / % === !== == != < > <= >= && || ! = |".split(" "),
function(a){Qb[a]=!0});var bh={n:"\n",f:"\f",r:"\r",t:"\t",v:"\v","'":"'",'"':'"'},mc=function(a){this.options=a};mc.prototype={constructor:mc,lex:function(a){this.text=a;this.index=0;for(this.tokens=[];this.index<this.text.length;)if(a=this.text.charAt(this.index),'"'===a||"'"===a)this.readString(a);else if(this.isNumber(a)||"."===a&&this.isNumber(this.peek()))this.readNumber();else if(this.isIdentifierStart(this.peekMultichar()))this.readIdent();else if(this.is(a,"(){}[].,;:?"))this.tokens.push({index:this.index,
text:a}),this.index++;else if(this.isWhitespace(a))this.index++;else{var b=a+this.peek(),d=b+this.peek(2),c=Qb[b],f=Qb[d];Qb[a]||c||f?(a=f?d:c?b:a,this.tokens.push({index:this.index,text:a,operator:!0}),this.index+=a.length):this.throwError("Unexpected next character ",this.index,this.index+1)}return this.tokens},is:function(a,b){return-1!==b.indexOf(a)},peek:function(a){a=a||1;return this.index+a<this.text.length?this.text.charAt(this.index+a):!1},isNumber:function(a){return"0"<=a&&"9">=a&&"string"===
typeof a},isWhitespace:function(a){return" "===a||"\r"===a||"\t"===a||"\n"===a||"\v"===a||"\u00a0"===a},isIdentifierStart:function(a){return this.options.isIdentifierStart?this.options.isIdentifierStart(a,this.codePointAt(a)):this.isValidIdentifierStart(a)},isValidIdentifierStart:function(a){return"a"<=a&&"z">=a||"A"<=a&&"Z">=a||"_"===a||"$"===a},isIdentifierContinue:function(a){return this.options.isIdentifierContinue?this.options.isIdentifierContinue(a,this.codePointAt(a)):this.isValidIdentifierContinue(a)},
isValidIdentifierContinue:function(a,b){return this.isValidIdentifierStart(a,b)||this.isNumber(a)},codePointAt:function(a){return 1===a.length?a.charCodeAt(0):(a.charCodeAt(0)<<10)+a.charCodeAt(1)-56613888},peekMultichar:function(){var a=this.text.charAt(this.index),b=this.peek();if(!b)return a;var d=a.charCodeAt(0),c=b.charCodeAt(0);return 55296<=d&&56319>=d&&56320<=c&&57343>=c?a+b:a},isExpOperator:function(a){return"-"===a||"+"===a||this.isNumber(a)},throwError:function(a,b,d){d=d||this.index;b=
x(b)?"s "+b+"-"+this.index+" ["+this.text.substring(b,d)+"]":" "+d;throw ea("lexerr",a,b,this.text);},readNumber:function(){for(var a="",b=this.index;this.index<this.text.length;){var d=Q(this.text.charAt(this.index));if("."===d||this.isNumber(d))a+=d;else{var c=this.peek();if("e"===d&&this.isExpOperator(c))a+=d;else if(this.isExpOperator(d)&&c&&this.isNumber(c)&&"e"===a.charAt(a.length-1))a+=d;else if(!this.isExpOperator(d)||c&&this.isNumber(c)||"e"!==a.charAt(a.length-1))break;else this.throwError("Invalid exponent")}this.index++}this.tokens.push({index:b,
text:a,constant:!0,value:Number(a)})},readIdent:function(){var a=this.index;for(this.index+=this.peekMultichar().length;this.index<this.text.length;){var b=this.peekMultichar();if(!this.isIdentifierContinue(b))break;this.index+=b.length}this.tokens.push({index:a,text:this.text.slice(a,this.index),identifier:!0})},readString:function(a){var b=this.index;this.index++;for(var d="",c=a,f=!1;this.index<this.text.length;){var e=this.text.charAt(this.index),c=c+e;if(f)"u"===e?(f=this.text.substring(this.index+
1,this.index+5),f.match(/[\da-f]{4}/i)||this.throwError("Invalid unicode escape [\\u"+f+"]"),this.index+=4,d+=String.fromCharCode(parseInt(f,16))):d+=bh[e]||e,f=!1;else if("\\"===e)f=!0;else{if(e===a){this.index++;this.tokens.push({index:b,text:c,constant:!0,value:d});return}d+=e}this.index++}this.throwError("Unterminated quote",b)}};var t=function(a,b){this.lexer=a;this.options=b};t.Program="Program";t.ExpressionStatement="ExpressionStatement";t.AssignmentExpression="AssignmentExpression";t.ConditionalExpression=
"ConditionalExpression";t.LogicalExpression="LogicalExpression";t.BinaryExpression="BinaryExpression";t.UnaryExpression="UnaryExpression";t.CallExpression="CallExpression";t.MemberExpression="MemberExpression";t.Identifier="Identifier";t.Literal="Literal";t.ArrayExpression="ArrayExpression";t.Property="Property";t.ObjectExpression="ObjectExpression";t.ThisExpression="ThisExpression";t.LocalsExpression="LocalsExpression";t.NGValueParameter="NGValueParameter";t.prototype={ast:function(a){this.text=
a;this.tokens=this.lexer.lex(a);a=this.program();0!==this.tokens.length&&this.throwError("is an unexpected token",this.tokens[0]);return a},program:function(){for(var a=[];;)if(0<this.tokens.length&&!this.peek("}",")",";","]")&&a.push(this.expressionStatement()),!this.expect(";"))return{type:t.Program,body:a}},expressionStatement:function(){return{type:t.ExpressionStatement,expression:this.filterChain()}},filterChain:function(){for(var a=this.expression();this.expect("|");)a=this.filter(a);return a},
expression:function(){return this.assignment()},assignment:function(){var a=this.ternary();if(this.expect("=")){if(!Dd(a))throw ea("lval");a={type:t.AssignmentExpression,left:a,right:this.assignment(),operator:"="}}return a},ternary:function(){var a=this.logicalOR(),b,d;return this.expect("?")&&(b=this.expression(),this.consume(":"))?(d=this.expression(),{type:t.ConditionalExpression,test:a,alternate:b,consequent:d}):a},logicalOR:function(){for(var a=this.logicalAND();this.expect("||");)a={type:t.LogicalExpression,
operator:"||",left:a,right:this.logicalAND()};return a},logicalAND:function(){for(var a=this.equality();this.expect("&&");)a={type:t.LogicalExpression,operator:"&&",left:a,right:this.equality()};return a},equality:function(){for(var a=this.relational(),b;b=this.expect("==","!=","===","!==");)a={type:t.BinaryExpression,operator:b.text,left:a,right:this.relational()};return a},relational:function(){for(var a=this.additive(),b;b=this.expect("<",">","<=",">=");)a={type:t.BinaryExpression,operator:b.text,
left:a,right:this.additive()};return a},additive:function(){for(var a=this.multiplicative(),b;b=this.expect("+","-");)a={type:t.BinaryExpression,operator:b.text,left:a,right:this.multiplicative()};return a},multiplicative:function(){for(var a=this.unary(),b;b=this.expect("*","/","%");)a={type:t.BinaryExpression,operator:b.text,left:a,right:this.unary()};return a},unary:function(){var a;return(a=this.expect("+","-","!"))?{type:t.UnaryExpression,operator:a.text,prefix:!0,argument:this.unary()}:this.primary()},
primary:function(){var a;this.expect("(")?(a=this.filterChain(),this.consume(")")):this.expect("[")?a=this.arrayDeclaration():this.expect("{")?a=this.object():this.selfReferential.hasOwnProperty(this.peek().text)?a=sa(this.selfReferential[this.consume().text]):this.options.literals.hasOwnProperty(this.peek().text)?a={type:t.Literal,value:this.options.literals[this.consume().text]}:this.peek().identifier?a=this.identifier():this.peek().constant?a=this.constant():this.throwError("not a primary expression",
this.peek());for(var b;b=this.expect("(","[",".");)"("===b.text?(a={type:t.CallExpression,callee:a,arguments:this.parseArguments()},this.consume(")")):"["===b.text?(a={type:t.MemberExpression,object:a,property:this.expression(),computed:!0},this.consume("]")):"."===b.text?a={type:t.MemberExpression,object:a,property:this.identifier(),computed:!1}:this.throwError("IMPOSSIBLE");return a},filter:function(a){a=[a];for(var b={type:t.CallExpression,callee:this.identifier(),arguments:a,filter:!0};this.expect(":");)a.push(this.expression());
return b},parseArguments:function(){var a=[];if(")"!==this.peekToken().text){do a.push(this.filterChain());while(this.expect(","))}return a},identifier:function(){var a=this.consume();a.identifier||this.throwError("is not a valid identifier",a);return{type:t.Identifier,name:a.text}},constant:function(){return{type:t.Literal,value:this.consume().value}},arrayDeclaration:function(){var a=[];if("]"!==this.peekToken().text){do{if(this.peek("]"))break;a.push(this.expression())}while(this.expect(","))}this.consume("]");
return{type:t.ArrayExpression,elements:a}},object:function(){var a=[],b;if("}"!==this.peekToken().text){do{if(this.peek("}"))break;b={type:t.Property,kind:"init"};this.peek().constant?(b.key=this.constant(),b.computed=!1,this.consume(":"),b.value=this.expression()):this.peek().identifier?(b.key=this.identifier(),b.computed=!1,this.peek(":")?(this.consume(":"),b.value=this.expression()):b.value=b.key):this.peek("[")?(this.consume("["),b.key=this.expression(),this.consume("]"),b.computed=!0,this.consume(":"),
b.value=this.expression()):this.throwError("invalid key",this.peek());a.push(b)}while(this.expect(","))}this.consume("}");return{type:t.ObjectExpression,properties:a}},throwError:function(a,b){throw ea("syntax",b.text,a,b.index+1,this.text,this.text.substring(b.index));},consume:function(a){if(0===this.tokens.length)throw ea("ueoe",this.text);var b=this.expect(a);b||this.throwError("is unexpected, expecting ["+a+"]",this.peek());return b},peekToken:function(){if(0===this.tokens.length)throw ea("ueoe",
this.text);return this.tokens[0]},peek:function(a,b,d,c){return this.peekAhead(0,a,b,d,c)},peekAhead:function(a,b,d,c,f){if(this.tokens.length>a){a=this.tokens[a];var e=a.text;if(e===b||e===d||e===c||e===f||!(b||d||c||f))return a}return!1},expect:function(a,b,d,c){return(a=this.peek(a,b,d,c))?(this.tokens.shift(),a):!1},selfReferential:{"this":{type:t.ThisExpression},$locals:{type:t.LocalsExpression}}};Gd.prototype={compile:function(a,b){var d=this,c=this.astBuilder.ast(a);this.state={nextId:0,filters:{},
expensiveChecks:b,fn:{vars:[],body:[],own:{}},assign:{vars:[],body:[],own:{}},inputs:[]};X(c,d.$filter);var f="",e;this.stage="assign";if(e=Ed(c))this.state.computing="assign",f=this.nextId(),this.recurse(e,f),this.return_(f),f="fn.assign="+this.generateFunction("assign","s,v,l");e=Cd(c.body);d.stage="inputs";q(e,function(a,b){var c="fn"+b;d.state[c]={vars:[],body:[],own:{}};d.state.computing=c;var e=d.nextId();d.recurse(a,e);d.return_(e);d.state.inputs.push(c);a.watchId=b});this.state.computing=
"fn";this.stage="main";this.recurse(c);f='"'+this.USE+" "+this.STRICT+'";\n'+this.filterPrefix()+"var fn="+this.generateFunction("fn","s,l,a,i")+f+this.watchFns()+"return fn;";f=(new Function("$filter","ensureSafeMemberName","ensureSafeObject","ensureSafeFunction","getStringValue","ensureSafeAssignContext","ifDefined","plus","text",f))(this.$filter,Ua,Ea,td,wg,Jb,Eg,Bd,a);this.state=this.stage=void 0;f.literal=Fd(c);f.constant=c.constant;return f},USE:"use",STRICT:"strict",watchFns:function(){var a=
[],b=this.state.inputs,d=this;q(b,function(b){a.push("var "+b+"="+d.generateFunction(b,"s"))});b.length&&a.push("fn.inputs=["+b.join(",")+"];");return a.join("")},generateFunction:function(a,b){return"function("+b+"){"+this.varsPrefix(a)+this.body(a)+"};"},filterPrefix:function(){var a=[],b=this;q(this.state.filters,function(d,c){a.push(d+"=$filter("+b.escape(c)+")")});return a.length?"var "+a.join(",")+";":""},varsPrefix:function(a){return this.state[a].vars.length?"var "+this.state[a].vars.join(",")+
";":""},body:function(a){return this.state[a].body.join("")},recurse:function(a,b,d,c,f,e){var g,h,k=this,l,m,n;c=c||w;if(!e&&x(a.watchId))b=b||this.nextId(),this.if_("i",this.lazyAssign(b,this.computedMember("i",a.watchId)),this.lazyRecurse(a,b,d,c,f,!0));else switch(a.type){case t.Program:q(a.body,function(b,c){k.recurse(b.expression,void 0,void 0,function(a){h=a});c!==a.body.length-1?k.current().body.push(h,";"):k.return_(h)});break;case t.Literal:m=this.escape(a.value);this.assign(b,m);c(m);break;
case t.UnaryExpression:this.recurse(a.argument,void 0,void 0,function(a){h=a});m=a.operator+"("+this.ifDefined(h,0)+")";this.assign(b,m);c(m);break;case t.BinaryExpression:this.recurse(a.left,void 0,void 0,function(a){g=a});this.recurse(a.right,void 0,void 0,function(a){h=a});m="+"===a.operator?this.plus(g,h):"-"===a.operator?this.ifDefined(g,0)+a.operator+this.ifDefined(h,0):"("+g+")"+a.operator+"("+h+")";this.assign(b,m);c(m);break;case t.LogicalExpression:b=b||this.nextId();k.recurse(a.left,b);
k.if_("&&"===a.operator?b:k.not(b),k.lazyRecurse(a.right,b));c(b);break;case t.ConditionalExpression:b=b||this.nextId();k.recurse(a.test,b);k.if_(b,k.lazyRecurse(a.alternate,b),k.lazyRecurse(a.consequent,b));c(b);break;case t.Identifier:b=b||this.nextId();d&&(d.context="inputs"===k.stage?"s":this.assign(this.nextId(),this.getHasOwnProperty("l",a.name)+"?l:s"),d.computed=!1,d.name=a.name);Ua(a.name);k.if_("inputs"===k.stage||k.not(k.getHasOwnProperty("l",a.name)),function(){k.if_("inputs"===k.stage||
"s",function(){f&&1!==f&&k.if_(k.not(k.nonComputedMember("s",a.name)),k.lazyAssign(k.nonComputedMember("s",a.name),"{}"));k.assign(b,k.nonComputedMember("s",a.name))})},b&&k.lazyAssign(b,k.nonComputedMember("l",a.name)));(k.state.expensiveChecks||Lb(a.name))&&k.addEnsureSafeObject(b);c(b);break;case t.MemberExpression:g=d&&(d.context=this.nextId())||this.nextId();b=b||this.nextId();k.recurse(a.object,g,void 0,function(){k.if_(k.notNull(g),function(){f&&1!==f&&k.addEnsureSafeAssignContext(g);if(a.computed)h=
k.nextId(),k.recurse(a.property,h),k.getStringValue(h),k.addEnsureSafeMemberName(h),f&&1!==f&&k.if_(k.not(k.computedMember(g,h)),k.lazyAssign(k.computedMember(g,h),"{}")),m=k.ensureSafeObject(k.computedMember(g,h)),k.assign(b,m),d&&(d.computed=!0,d.name=h);else{Ua(a.property.name);f&&1!==f&&k.if_(k.not(k.nonComputedMember(g,a.property.name)),k.lazyAssign(k.nonComputedMember(g,a.property.name),"{}"));m=k.nonComputedMember(g,a.property.name);if(k.state.expensiveChecks||Lb(a.property.name))m=k.ensureSafeObject(m);
k.assign(b,m);d&&(d.computed=!1,d.name=a.property.name)}},function(){k.assign(b,"undefined")});c(b)},!!f);break;case t.CallExpression:b=b||this.nextId();a.filter?(h=k.filter(a.callee.name),l=[],q(a.arguments,function(a){var b=k.nextId();k.recurse(a,b);l.push(b)}),m=h+"("+l.join(",")+")",k.assign(b,m),c(b)):(h=k.nextId(),g={},l=[],k.recurse(a.callee,h,g,function(){k.if_(k.notNull(h),function(){k.addEnsureSafeFunction(h);q(a.arguments,function(a){k.recurse(a,k.nextId(),void 0,function(a){l.push(k.ensureSafeObject(a))})});
g.name?(k.state.expensiveChecks||k.addEnsureSafeObject(g.context),m=k.member(g.context,g.name,g.computed)+"("+l.join(",")+")"):m=h+"("+l.join(",")+")";m=k.ensureSafeObject(m);k.assign(b,m)},function(){k.assign(b,"undefined")});c(b)}));break;case t.AssignmentExpression:h=this.nextId();g={};this.recurse(a.left,void 0,g,function(){k.if_(k.notNull(g.context),function(){k.recurse(a.right,h);k.addEnsureSafeObject(k.member(g.context,g.name,g.computed));k.addEnsureSafeAssignContext(g.context);m=k.member(g.context,
g.name,g.computed)+a.operator+h;k.assign(b,m);c(b||m)})},1);break;case t.ArrayExpression:l=[];q(a.elements,function(a){k.recurse(a,k.nextId(),void 0,function(a){l.push(a)})});m="["+l.join(",")+"]";this.assign(b,m);c(m);break;case t.ObjectExpression:l=[];n=!1;q(a.properties,function(a){a.computed&&(n=!0)});n?(b=b||this.nextId(),this.assign(b,"{}"),q(a.properties,function(a){a.computed?(g=k.nextId(),k.recurse(a.key,g)):g=a.key.type===t.Identifier?a.key.name:""+a.key.value;h=k.nextId();k.recurse(a.value,
h);k.assign(k.member(b,g,a.computed),h)})):(q(a.properties,function(b){k.recurse(b.value,a.constant?void 0:k.nextId(),void 0,function(a){l.push(k.escape(b.key.type===t.Identifier?b.key.name:""+b.key.value)+":"+a)})}),m="{"+l.join(",")+"}",this.assign(b,m));c(b||m);break;case t.ThisExpression:this.assign(b,"s");c("s");break;case t.LocalsExpression:this.assign(b,"l");c("l");break;case t.NGValueParameter:this.assign(b,"v"),c("v")}},getHasOwnProperty:function(a,b){var d=a+"."+b,c=this.current().own;c.hasOwnProperty(d)||
(c[d]=this.nextId(!1,a+"&&("+this.escape(b)+" in "+a+")"));return c[d]},assign:function(a,b){if(a)return this.current().body.push(a,"=",b,";"),a},filter:function(a){this.state.filters.hasOwnProperty(a)||(this.state.filters[a]=this.nextId(!0));return this.state.filters[a]},ifDefined:function(a,b){return"ifDefined("+a+","+this.escape(b)+")"},plus:function(a,b){return"plus("+a+","+b+")"},return_:function(a){this.current().body.push("return ",a,";")},if_:function(a,b,d){if(!0===a)b();else{var c=this.current().body;
c.push("if(",a,"){");b();c.push("}");d&&(c.push("else{"),d(),c.push("}"))}},not:function(a){return"!("+a+")"},notNull:function(a){return a+"!=null"},nonComputedMember:function(a,b){var d=/[^$_a-zA-Z0-9]/g;return/^[$_a-zA-Z][$_a-zA-Z0-9]*$/.test(b)?a+"."+b:a+'["'+b.replace(d,this.stringEscapeFn)+'"]'},computedMember:function(a,b){return a+"["+b+"]"},member:function(a,b,d){return d?this.computedMember(a,b):this.nonComputedMember(a,b)},addEnsureSafeObject:function(a){this.current().body.push(this.ensureSafeObject(a),
";")},addEnsureSafeMemberName:function(a){this.current().body.push(this.ensureSafeMemberName(a),";")},addEnsureSafeFunction:function(a){this.current().body.push(this.ensureSafeFunction(a),";")},addEnsureSafeAssignContext:function(a){this.current().body.push(this.ensureSafeAssignContext(a),";")},ensureSafeObject:function(a){return"ensureSafeObject("+a+",text)"},ensureSafeMemberName:function(a){return"ensureSafeMemberName("+a+",text)"},ensureSafeFunction:function(a){return"ensureSafeFunction("+a+",text)"},
getStringValue:function(a){this.assign(a,"getStringValue("+a+")")},ensureSafeAssignContext:function(a){return"ensureSafeAssignContext("+a+",text)"},lazyRecurse:function(a,b,d,c,f,e){var g=this;return function(){g.recurse(a,b,d,c,f,e)}},lazyAssign:function(a,b){var d=this;return function(){d.assign(a,b)}},stringEscapeRegex:/[^ a-zA-Z0-9]/g,stringEscapeFn:function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)},escape:function(a){if(D(a))return"'"+a.replace(this.stringEscapeRegex,this.stringEscapeFn)+
"'";if(ba(a))return a.toString();if(!0===a)return"true";if(!1===a)return"false";if(null===a)return"null";if("undefined"===typeof a)return"undefined";throw ea("esc");},nextId:function(a,b){var d="v"+this.state.nextId++;a||this.current().vars.push(d+(b?"="+b:""));return d},current:function(){return this.state[this.state.computing]}};Hd.prototype={compile:function(a,b){var d=this,c=this.astBuilder.ast(a);this.expression=a;this.expensiveChecks=b;X(c,d.$filter);var f,e;if(f=Ed(c))e=this.recurse(f);f=Cd(c.body);
var g;f&&(g=[],q(f,function(a,b){var c=d.recurse(a);a.input=c;g.push(c);a.watchId=b}));var h=[];q(c.body,function(a){h.push(d.recurse(a.expression))});f=0===c.body.length?w:1===c.body.length?h[0]:function(a,b){var c;q(h,function(d){c=d(a,b)});return c};e&&(f.assign=function(a,b,c){return e(a,c,b)});g&&(f.inputs=g);f.literal=Fd(c);f.constant=c.constant;return f},recurse:function(a,b,d){var c,f,e=this,g;if(a.input)return this.inputs(a.input,a.watchId);switch(a.type){case t.Literal:return this.value(a.value,
b);case t.UnaryExpression:return f=this.recurse(a.argument),this["unary"+a.operator](f,b);case t.BinaryExpression:return c=this.recurse(a.left),f=this.recurse(a.right),this["binary"+a.operator](c,f,b);case t.LogicalExpression:return c=this.recurse(a.left),f=this.recurse(a.right),this["binary"+a.operator](c,f,b);case t.ConditionalExpression:return this["ternary?:"](this.recurse(a.test),this.recurse(a.alternate),this.recurse(a.consequent),b);case t.Identifier:return Ua(a.name,e.expression),e.identifier(a.name,
e.expensiveChecks||Lb(a.name),b,d,e.expression);case t.MemberExpression:return c=this.recurse(a.object,!1,!!d),a.computed||(Ua(a.property.name,e.expression),f=a.property.name),a.computed&&(f=this.recurse(a.property)),a.computed?this.computedMember(c,f,b,d,e.expression):this.nonComputedMember(c,f,e.expensiveChecks,b,d,e.expression);case t.CallExpression:return g=[],q(a.arguments,function(a){g.push(e.recurse(a))}),a.filter&&(f=this.$filter(a.callee.name)),a.filter||(f=this.recurse(a.callee,!0)),a.filter?
function(a,c,d,e){for(var n=[],r=0;r<g.length;++r)n.push(g[r](a,c,d,e));a=f.apply(void 0,n,e);return b?{context:void 0,name:void 0,value:a}:a}:function(a,c,d,m){var n=f(a,c,d,m),r;if(null!=n.value){Ea(n.context,e.expression);td(n.value,e.expression);r=[];for(var s=0;s<g.length;++s)r.push(Ea(g[s](a,c,d,m),e.expression));r=Ea(n.value.apply(n.context,r),e.expression)}return b?{value:r}:r};case t.AssignmentExpression:return c=this.recurse(a.left,!0,1),f=this.recurse(a.right),function(a,d,g,m){var n=c(a,
d,g,m);a=f(a,d,g,m);Ea(n.value,e.expression);Jb(n.context);n.context[n.name]=a;return b?{value:a}:a};case t.ArrayExpression:return g=[],q(a.elements,function(a){g.push(e.recurse(a))}),function(a,c,d,e){for(var f=[],r=0;r<g.length;++r)f.push(g[r](a,c,d,e));return b?{value:f}:f};case t.ObjectExpression:return g=[],q(a.properties,function(a){a.computed?g.push({key:e.recurse(a.key),computed:!0,value:e.recurse(a.value)}):g.push({key:a.key.type===t.Identifier?a.key.name:""+a.key.value,computed:!1,value:e.recurse(a.value)})}),
function(a,c,d,e){for(var f={},r=0;r<g.length;++r)g[r].computed?f[g[r].key(a,c,d,e)]=g[r].value(a,c,d,e):f[g[r].key]=g[r].value(a,c,d,e);return b?{value:f}:f};case t.ThisExpression:return function(a){return b?{value:a}:a};case t.LocalsExpression:return function(a,c){return b?{value:c}:c};case t.NGValueParameter:return function(a,c,d){return b?{value:d}:d}}},"unary+":function(a,b){return function(d,c,f,e){d=a(d,c,f,e);d=x(d)?+d:0;return b?{value:d}:d}},"unary-":function(a,b){return function(d,c,f,
e){d=a(d,c,f,e);d=x(d)?-d:0;return b?{value:d}:d}},"unary!":function(a,b){return function(d,c,f,e){d=!a(d,c,f,e);return b?{value:d}:d}},"binary+":function(a,b,d){return function(c,f,e,g){var h=a(c,f,e,g);c=b(c,f,e,g);h=Bd(h,c);return d?{value:h}:h}},"binary-":function(a,b,d){return function(c,f,e,g){var h=a(c,f,e,g);c=b(c,f,e,g);h=(x(h)?h:0)-(x(c)?c:0);return d?{value:h}:h}},"binary*":function(a,b,d){return function(c,f,e,g){c=a(c,f,e,g)*b(c,f,e,g);return d?{value:c}:c}},"binary/":function(a,b,d){return function(c,
f,e,g){c=a(c,f,e,g)/b(c,f,e,g);return d?{value:c}:c}},"binary%":function(a,b,d){return function(c,f,e,g){c=a(c,f,e,g)%b(c,f,e,g);return d?{value:c}:c}},"binary===":function(a,b,d){return function(c,f,e,g){c=a(c,f,e,g)===b(c,f,e,g);return d?{value:c}:c}},"binary!==":function(a,b,d){return function(c,f,e,g){c=a(c,f,e,g)!==b(c,f,e,g);return d?{value:c}:c}},"binary==":function(a,b,d){return function(c,f,e,g){c=a(c,f,e,g)==b(c,f,e,g);return d?{value:c}:c}},"binary!=":function(a,b,d){return function(c,
f,e,g){c=a(c,f,e,g)!=b(c,f,e,g);return d?{value:c}:c}},"binary<":function(a,b,d){return function(c,f,e,g){c=a(c,f,e,g)<b(c,f,e,g);return d?{value:c}:c}},"binary>":function(a,b,d){return function(c,f,e,g){c=a(c,f,e,g)>b(c,f,e,g);return d?{value:c}:c}},"binary<=":function(a,b,d){return function(c,f,e,g){c=a(c,f,e,g)<=b(c,f,e,g);return d?{value:c}:c}},"binary>=":function(a,b,d){return function(c,f,e,g){c=a(c,f,e,g)>=b(c,f,e,g);return d?{value:c}:c}},"binary&&":function(a,b,d){return function(c,f,e,g){c=
a(c,f,e,g)&&b(c,f,e,g);return d?{value:c}:c}},"binary||":function(a,b,d){return function(c,f,e,g){c=a(c,f,e,g)||b(c,f,e,g);return d?{value:c}:c}},"ternary?:":function(a,b,d,c){return function(f,e,g,h){f=a(f,e,g,h)?b(f,e,g,h):d(f,e,g,h);return c?{value:f}:f}},value:function(a,b){return function(){return b?{context:void 0,name:void 0,value:a}:a}},identifier:function(a,b,d,c,f){return function(e,g,h,k){e=g&&a in g?g:e;c&&1!==c&&e&&!e[a]&&(e[a]={});g=e?e[a]:void 0;b&&Ea(g,f);return d?{context:e,name:a,
value:g}:g}},computedMember:function(a,b,d,c,f){return function(e,g,h,k){var l=a(e,g,h,k),m,n;null!=l&&(m=b(e,g,h,k),m+="",Ua(m,f),c&&1!==c&&(Jb(l),l&&!l[m]&&(l[m]={})),n=l[m],Ea(n,f));return d?{context:l,name:m,value:n}:n}},nonComputedMember:function(a,b,d,c,f,e){return function(g,h,k,l){g=a(g,h,k,l);f&&1!==f&&(Jb(g),g&&!g[b]&&(g[b]={}));h=null!=g?g[b]:void 0;(d||Lb(b))&&Ea(h,e);return c?{context:g,name:b,value:h}:h}},inputs:function(a,b){return function(d,c,f,e){return e?e[b]:a(d,c,f)}}};var nc=
function(a,b,d){this.lexer=a;this.$filter=b;this.options=d;this.ast=new t(a,d);this.astCompiler=d.csp?new Hd(this.ast,b):new Gd(this.ast,b)};nc.prototype={constructor:nc,parse:function(a){return this.astCompiler.compile(a,this.options.expensiveChecks)}};var Fa=G("$sce"),ga={HTML:"html",CSS:"css",URL:"url",RESOURCE_URL:"resourceUrl",JS:"js"},Hg=G("$compile"),aa=y.document.createElement("a"),Ld=ta(y.location.href);Md.$inject=["$document"];Rc.$inject=["$provide"];var Td=22,Sd=".",pc="0";Nd.$inject=["$locale"];
Pd.$inject=["$locale"];var Sg={yyyy:U("FullYear",4,0,!1,!0),yy:U("FullYear",2,0,!0,!0),y:U("FullYear",1,0,!1,!0),MMMM:nb("Month"),MMM:nb("Month",!0),MM:U("Month",2,1),M:U("Month",1,1),LLLL:nb("Month",!1,!0),dd:U("Date",2),d:U("Date",1),HH:U("Hours",2),H:U("Hours",1),hh:U("Hours",2,-12),h:U("Hours",1,-12),mm:U("Minutes",2),m:U("Minutes",1),ss:U("Seconds",2),s:U("Seconds",1),sss:U("Milliseconds",3),EEEE:nb("Day"),EEE:nb("Day",!0),a:function(a,b){return 12>a.getHours()?b.AMPMS[0]:b.AMPMS[1]},Z:function(a,
b,d){a=-1*d;return a=(0<=a?"+":"")+(Mb(Math[0<a?"floor":"ceil"](a/60),2)+Mb(Math.abs(a%60),2))},ww:Vd(2),w:Vd(1),G:qc,GG:qc,GGG:qc,GGGG:function(a,b){return 0>=a.getFullYear()?b.ERANAMES[0]:b.ERANAMES[1]}},Rg=/((?:[^yMLdHhmsaZEwG']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|L+|d+|H+|h+|m+|s+|a|Z|G+|w+))(.*)/,Qg=/^-?\d+$/;Od.$inject=["$locale"];var Lg=ha(Q),Mg=ha(wb);Qd.$inject=["$parse"];var Ce=ha({restrict:"E",compile:function(a,b){if(!b.href&&!b.xlinkHref)return function(a,b){if("a"===b[0].nodeName.toLowerCase()){var f=
"[object SVGAnimatedString]"===ma.call(b.prop("href"))?"xlink:href":"href";b.on("click",function(a){b.attr(f)||a.preventDefault()})}}}}),xb={};q(Gb,function(a,b){function d(a,d,f){a.$watch(f[c],function(a){f.$set(b,!!a)})}if("multiple"!==a){var c=Da("ng-"+b),f=d;"checked"===a&&(f=function(a,b,f){f.ngModel!==f[c]&&d(a,b,f)});xb[c]=function(){return{restrict:"A",priority:100,link:f}}}});q(gd,function(a,b){xb[b]=function(){return{priority:100,link:function(a,c,f){if("ngPattern"===b&&"/"===f.ngPattern.charAt(0)&&
(c=f.ngPattern.match(Vg))){f.$set("ngPattern",new RegExp(c[1],c[2]));return}a.$watch(f[b],function(a){f.$set(b,a)})}}}});q(["src","srcset","href"],function(a){var b=Da("ng-"+a);xb[b]=function(){return{priority:99,link:function(d,c,f){var e=a,g=a;"href"===a&&"[object SVGAnimatedString]"===ma.call(c.prop("href"))&&(g="xlinkHref",f.$attr[g]="xlink:href",e=null);f.$observe(b,function(b){b?(f.$set(g,b),Ia&&e&&c.prop(e,f[g])):"href"===a&&f.$set(g,null)})}}}});var Nb={$addControl:w,$$renameControl:function(a,
b){a.$name=b},$removeControl:w,$setValidity:w,$setDirty:w,$setPristine:w,$setSubmitted:w};Wd.$inject=["$element","$attrs","$scope","$animate","$interpolate"];var ee=function(a){return["$timeout","$parse",function(b,d){function c(a){return""===a?d('this[""]').assign:d(a).assign||w}return{name:"form",restrict:a?"EAC":"E",require:["form","^^?form"],controller:Wd,compile:function(d,e){d.addClass(Wa).addClass(rb);var g=e.name?"name":a&&e.ngForm?"ngForm":!1;return{pre:function(a,d,e,f){var n=f[0];if(!("action"in
e)){var r=function(b){a.$apply(function(){n.$commitViewValue();n.$setSubmitted()});b.preventDefault()};d[0].addEventListener("submit",r,!1);d.on("$destroy",function(){b(function(){d[0].removeEventListener("submit",r,!1)},0,!1)})}(f[1]||n.$$parentForm).$addControl(n);var s=g?c(n.$name):w;g&&(s(a,n),e.$observe(g,function(b){n.$name!==b&&(s(a,void 0),n.$$parentForm.$$renameControl(n,b),s=c(n.$name),s(a,n))}));d.on("$destroy",function(){n.$$parentForm.$removeControl(n);s(a,void 0);R(n,Nb)})}}}}}]},De=
ee(),Pe=ee(!0),Tg=/^\d{4,}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+(?:[+-][0-2]\d:[0-5]\d|Z)$/,ch=/^[a-z][a-z\d.+-]*:\/*(?:[^:@]+(?::[^@]+)?@)?(?:[^\s:/?#]+|\[[a-f\d:]+])(?::\d+)?(?:\/[^?#]*)?(?:\?[^#]*)?(?:#.*)?$/i,dh=/^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/,Ug=/^\s*(-|\+)?(\d+|(\d*(\.\d*)))([eE][+-]?\d+)?\s*$/,fe=/^(\d{4,})-(\d{2})-(\d{2})$/,ge=/^(\d{4,})-(\d\d)-(\d\d)T(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/,
wc=/^(\d{4,})-W(\d\d)$/,he=/^(\d{4,})-(\d\d)$/,ie=/^(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/,Yd=V();q(["date","datetime-local","month","time","week"],function(a){Yd[a]=!0});var je={text:function(a,b,d,c,f,e){Xa(a,b,d,c,f,e);sc(c)},date:ob("date",fe,Pb(fe,["yyyy","MM","dd"]),"yyyy-MM-dd"),"datetime-local":ob("datetimelocal",ge,Pb(ge,"yyyy MM dd HH mm ss sss".split(" ")),"yyyy-MM-ddTHH:mm:ss.sss"),time:ob("time",ie,Pb(ie,["HH","mm","ss","sss"]),"HH:mm:ss.sss"),week:ob("week",wc,function(a,b){if(ja(a))return a;
if(D(a)){wc.lastIndex=0;var d=wc.exec(a);if(d){var c=+d[1],f=+d[2],e=d=0,g=0,h=0,k=Ud(c),f=7*(f-1);b&&(d=b.getHours(),e=b.getMinutes(),g=b.getSeconds(),h=b.getMilliseconds());return new Date(c,0,k.getDate()+f,d,e,g,h)}}return NaN},"yyyy-Www"),month:ob("month",he,Pb(he,["yyyy","MM"]),"yyyy-MM"),number:function(a,b,d,c,f,e){tc(a,b,d,c);Xa(a,b,d,c,f,e);Zd(c);var g,h;if(x(d.min)||d.ngMin)c.$validators.min=function(a){return c.$isEmpty(a)||z(g)||a>=g},d.$observe("min",function(a){g=qb(a);c.$validate()});
if(x(d.max)||d.ngMax)c.$validators.max=function(a){return c.$isEmpty(a)||z(h)||a<=h},d.$observe("max",function(a){h=qb(a);c.$validate()})},url:function(a,b,d,c,f,e){Xa(a,b,d,c,f,e);sc(c);c.$$parserName="url";c.$validators.url=function(a,b){var d=a||b;return c.$isEmpty(d)||ch.test(d)}},email:function(a,b,d,c,f,e){Xa(a,b,d,c,f,e);sc(c);c.$$parserName="email";c.$validators.email=function(a,b){var d=a||b;return c.$isEmpty(d)||dh.test(d)}},radio:function(a,b,d,c){z(d.name)&&b.attr("name",++sb);b.on("click",
function(a){b[0].checked&&c.$setViewValue(d.value,a&&a.type)});c.$render=function(){b[0].checked=d.value==c.$viewValue};d.$observe("value",c.$render)},range:function(a,b,d,c,f,e){function g(a,c){b.attr(a,d[a]);d.$observe(a,c)}function h(a){n=qb(a);ia(c.$modelValue)||(m?(a=b.val(),n>a&&(a=n,b.val(a)),c.$setViewValue(a)):c.$validate())}function k(a){r=qb(a);ia(c.$modelValue)||(m?(a=b.val(),r<a&&(b.val(r),a=r<n?n:r),c.$setViewValue(a)):c.$validate())}function l(a){s=qb(a);ia(c.$modelValue)||(m&&c.$viewValue!==
b.val()?c.$setViewValue(b.val()):c.$validate())}tc(a,b,d,c);Zd(c);Xa(a,b,d,c,f,e);var m=c.$$hasNativeValidators&&"range"===b[0].type,n=m?0:void 0,r=m?100:void 0,s=m?1:void 0,q=b[0].validity;a=x(d.min);f=x(d.max);e=x(d.step);var u=c.$render;c.$render=m&&x(q.rangeUnderflow)&&x(q.rangeOverflow)?function(){u();c.$setViewValue(b.val())}:u;a&&(c.$validators.min=m?function(){return!0}:function(a,b){return c.$isEmpty(b)||z(n)||b>=n},g("min",h));f&&(c.$validators.max=m?function(){return!0}:function(a,b){return c.$isEmpty(b)||
z(r)||b<=r},g("max",k));e&&(c.$validators.step=m?function(){return!q.stepMismatch}:function(a,b){var d;if(!(d=c.$isEmpty(b)||z(s))){d=n||0;var e=s,f=Number(b);if((f|0)!==f||(d|0)!==d||(e|0)!==e){var g=Math.max(uc(f),uc(d),uc(e)),g=Math.pow(10,g),f=f*g;d*=g;e*=g}d=0===(f-d)%e}return d},g("step",l))},checkbox:function(a,b,d,c,f,e,g,h){var k=$d(h,a,"ngTrueValue",d.ngTrueValue,!0),l=$d(h,a,"ngFalseValue",d.ngFalseValue,!1);b.on("click",function(a){c.$setViewValue(b[0].checked,a&&a.type)});c.$render=function(){b[0].checked=
c.$viewValue};c.$isEmpty=function(a){return!1===a};c.$formatters.push(function(a){return na(a,k)});c.$parsers.push(function(a){return a?k:l})},hidden:w,button:w,submit:w,reset:w,file:w},Lc=["$browser","$sniffer","$filter","$parse",function(a,b,d,c){return{restrict:"E",require:["?ngModel"],link:{pre:function(f,e,g,h){if(h[0]){var k=Q(g.type);"range"!==k||g.hasOwnProperty("ngInputRange")||(k="text");(je[k]||je.text)(f,e,g,h[0],b,a,d,c)}}}}}],eh=/^(true|false|\d+)$/,gf=function(){return{restrict:"A",
priority:100,compile:function(a,b){return eh.test(b.ngValue)?function(a,b,f){f.$set("value",a.$eval(f.ngValue))}:function(a,b,f){a.$watch(f.ngValue,function(a){f.$set("value",a)})}}}},He=["$compile",function(a){return{restrict:"AC",compile:function(b){a.$$addBindingClass(b);return function(b,c,f){a.$$addBindingInfo(c,f.ngBind);c=c[0];b.$watch(f.ngBind,function(a){c.textContent=z(a)?"":a})}}}}],Je=["$interpolate","$compile",function(a,b){return{compile:function(d){b.$$addBindingClass(d);return function(c,
d,e){c=a(d.attr(e.$attr.ngBindTemplate));b.$$addBindingInfo(d,c.expressions);d=d[0];e.$observe("ngBindTemplate",function(a){d.textContent=z(a)?"":a})}}}}],Ie=["$sce","$parse","$compile",function(a,b,d){return{restrict:"A",compile:function(c,f){var e=b(f.ngBindHtml),g=b(f.ngBindHtml,function(b){return a.valueOf(b)});d.$$addBindingClass(c);return function(b,c,f){d.$$addBindingInfo(c,f.ngBindHtml);b.$watch(g,function(){var d=e(b);c.html(a.getTrustedHtml(d)||"")})}}}}],ff=ha({restrict:"A",require:"ngModel",
link:function(a,b,d,c){c.$viewChangeListeners.push(function(){a.$eval(d.ngChange)})}}),Ke=vc("",!0),Me=vc("Odd",0),Le=vc("Even",1),Ne=Va({compile:function(a,b){b.$set("ngCloak",void 0);a.removeClass("ng-cloak")}}),Oe=[function(){return{restrict:"A",scope:!0,controller:"@",priority:500}}],Qc={},fh={blur:!0,focus:!0};q("click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste".split(" "),function(a){var b=Da("ng-"+a);
Qc[b]=["$parse","$rootScope",function(d,c){return{restrict:"A",compile:function(f,e){var g=d(e[b],null,!0);return function(b,d){d.on(a,function(d){var e=function(){g(b,{$event:d})};fh[a]&&c.$$phase?b.$evalAsync(e):b.$apply(e)})}}}}]});var Re=["$animate","$compile",function(a,b){return{multiElement:!0,transclude:"element",priority:600,terminal:!0,restrict:"A",$$tlb:!0,link:function(d,c,f,e,g){var h,k,l;d.$watch(f.ngIf,function(d){d?k||g(function(d,e){k=e;d[d.length++]=b.$$createComment("end ngIf",
f.ngIf);h={clone:d};a.enter(d,c.parent(),c)}):(l&&(l.remove(),l=null),k&&(k.$destroy(),k=null),h&&(l=vb(h.clone),a.leave(l).done(function(a){!1!==a&&(l=null)}),h=null))})}}}],Se=["$templateRequest","$anchorScroll","$animate",function(a,b,d){return{restrict:"ECA",priority:400,terminal:!0,transclude:"element",controller:$.noop,compile:function(c,f){var e=f.ngInclude||f.src,g=f.onload||"",h=f.autoscroll;return function(c,f,m,n,r){var q=0,t,u,p,z=function(){u&&(u.remove(),u=null);t&&(t.$destroy(),t=null);
p&&(d.leave(p).done(function(a){!1!==a&&(u=null)}),u=p,p=null)};c.$watch(e,function(e){var m=function(a){!1===a||!x(h)||h&&!c.$eval(h)||b()},u=++q;e?(a(e,!0).then(function(a){if(!c.$$destroyed&&u===q){var b=c.$new();n.template=a;a=r(b,function(a){z();d.enter(a,null,f).done(m)});t=b;p=a;t.$emit("$includeContentLoaded",e);c.$eval(g)}},function(){c.$$destroyed||u!==q||(z(),c.$emit("$includeContentError",e))}),c.$emit("$includeContentRequested",e)):(z(),n.template=null)})}}}}],jf=["$compile",function(a){return{restrict:"ECA",
priority:-400,require:"ngInclude",link:function(b,d,c,f){ma.call(d[0]).match(/SVG/)?(d.empty(),a(Tc(f.template,y.document).childNodes)(b,function(a){d.append(a)},{futureParentElement:d})):(d.html(f.template),a(d.contents())(b))}}}],Te=Va({priority:450,compile:function(){return{pre:function(a,b,d){a.$eval(d.ngInit)}}}}),ef=function(){return{restrict:"A",priority:100,require:"ngModel",link:function(a,b,d,c){var f=b.attr(d.$attr.ngList)||", ",e="false"!==d.ngTrim,g=e?Y(f):f;c.$parsers.push(function(a){if(!z(a)){var b=
[];a&&q(a.split(g),function(a){a&&b.push(e?Y(a):a)});return b}});c.$formatters.push(function(a){if(I(a))return a.join(f)});c.$isEmpty=function(a){return!a||!a.length}}}},rb="ng-valid",ae="ng-invalid",Wa="ng-pristine",Ob="ng-dirty",ce="ng-pending",pb=G("ngModel"),gh=["$scope","$exceptionHandler","$attrs","$element","$parse","$animate","$timeout","$rootScope","$q","$interpolate",function(a,b,d,c,f,e,g,h,k,l){this.$modelValue=this.$viewValue=Number.NaN;this.$$rawModelValue=void 0;this.$validators={};
this.$asyncValidators={};this.$parsers=[];this.$formatters=[];this.$viewChangeListeners=[];this.$untouched=!0;this.$touched=!1;this.$pristine=!0;this.$dirty=!1;this.$valid=!0;this.$invalid=!1;this.$error={};this.$$success={};this.$pending=void 0;this.$name=l(d.name||"",!1)(a);this.$$parentForm=Nb;var m=f(d.ngModel),n=m.assign,r=m,s=n,t=null,u,p=this;this.$$setOptions=function(a){if((p.$options=a)&&a.getterSetter){var b=f(d.ngModel+"()"),e=f(d.ngModel+"($$$p)");r=function(a){var c=m(a);C(c)&&(c=b(a));
return c};s=function(a,b){C(m(a))?e(a,{$$$p:b}):n(a,b)}}else if(!m.assign)throw pb("nonassign",d.ngModel,ya(c));};this.$render=w;this.$isEmpty=function(a){return z(a)||""===a||null===a||a!==a};this.$$updateEmptyClasses=function(a){p.$isEmpty(a)?(e.removeClass(c,"ng-not-empty"),e.addClass(c,"ng-empty")):(e.removeClass(c,"ng-empty"),e.addClass(c,"ng-not-empty"))};var y=0;Xd({ctrl:this,$element:c,set:function(a,b){a[b]=!0},unset:function(a,b){delete a[b]},$animate:e});this.$setPristine=function(){p.$dirty=
!1;p.$pristine=!0;e.removeClass(c,Ob);e.addClass(c,Wa)};this.$setDirty=function(){p.$dirty=!0;p.$pristine=!1;e.removeClass(c,Wa);e.addClass(c,Ob);p.$$parentForm.$setDirty()};this.$setUntouched=function(){p.$touched=!1;p.$untouched=!0;e.setClass(c,"ng-untouched","ng-touched")};this.$setTouched=function(){p.$touched=!0;p.$untouched=!1;e.setClass(c,"ng-touched","ng-untouched")};this.$rollbackViewValue=function(){g.cancel(t);p.$viewValue=p.$$lastCommittedViewValue;p.$render()};this.$validate=function(){if(!ia(p.$modelValue)){var a=
p.$$rawModelValue,b=p.$valid,c=p.$modelValue,d=p.$options&&p.$options.allowInvalid;p.$$runValidators(a,p.$$lastCommittedViewValue,function(e){d||b===e||(p.$modelValue=e?a:void 0,p.$modelValue!==c&&p.$$writeModelToScope())})}};this.$$runValidators=function(a,b,c){function d(){var c=!0;q(p.$validators,function(d,e){var g=d(a,b);c=c&&g;f(e,g)});return c?!0:(q(p.$asyncValidators,function(a,b){f(b,null)}),!1)}function e(){var c=[],d=!0;q(p.$asyncValidators,function(e,g){var h=e(a,b);if(!h||!C(h.then))throw pb("nopromise",
h);f(g,void 0);c.push(h.then(function(){f(g,!0)},function(){d=!1;f(g,!1)}))});c.length?k.all(c).then(function(){g(d)},w):g(!0)}function f(a,b){h===y&&p.$setValidity(a,b)}function g(a){h===y&&c(a)}y++;var h=y;(function(){var a=p.$$parserName||"parse";if(z(u))f(a,null);else return u||(q(p.$validators,function(a,b){f(b,null)}),q(p.$asyncValidators,function(a,b){f(b,null)})),f(a,u),u;return!0})()?d()?e():g(!1):g(!1)};this.$commitViewValue=function(){var a=p.$viewValue;g.cancel(t);if(p.$$lastCommittedViewValue!==
a||""===a&&p.$$hasNativeValidators)p.$$updateEmptyClasses(a),p.$$lastCommittedViewValue=a,p.$pristine&&this.$setDirty(),this.$$parseAndValidate()};this.$$parseAndValidate=function(){var b=p.$$lastCommittedViewValue;if(u=z(b)?void 0:!0)for(var c=0;c<p.$parsers.length;c++)if(b=p.$parsers[c](b),z(b)){u=!1;break}ia(p.$modelValue)&&(p.$modelValue=r(a));var d=p.$modelValue,e=p.$options&&p.$options.allowInvalid;p.$$rawModelValue=b;e&&(p.$modelValue=b,p.$modelValue!==d&&p.$$writeModelToScope());p.$$runValidators(b,
p.$$lastCommittedViewValue,function(a){e||(p.$modelValue=a?b:void 0,p.$modelValue!==d&&p.$$writeModelToScope())})};this.$$writeModelToScope=function(){s(a,p.$modelValue);q(p.$viewChangeListeners,function(a){try{a()}catch(c){b(c)}})};this.$setViewValue=function(a,b){p.$viewValue=a;p.$options&&!p.$options.updateOnDefault||p.$$debounceViewValueCommit(b)};this.$$debounceViewValueCommit=function(b){var c=0,d=p.$options;d&&x(d.debounce)&&(d=d.debounce,ba(d)?c=d:ba(d[b])?c=d[b]:ba(d["default"])&&(c=d["default"]));
g.cancel(t);c?t=g(function(){p.$commitViewValue()},c):h.$$phase?p.$commitViewValue():a.$apply(function(){p.$commitViewValue()})};a.$watch(function(){var b=r(a);if(b!==p.$modelValue&&(p.$modelValue===p.$modelValue||b===b)){p.$modelValue=p.$$rawModelValue=b;u=void 0;for(var c=p.$formatters,d=c.length,e=b;d--;)e=c[d](e);p.$viewValue!==e&&(p.$$updateEmptyClasses(e),p.$viewValue=p.$$lastCommittedViewValue=e,p.$render(),p.$$runValidators(p.$modelValue,p.$viewValue,w))}return b})}],df=["$rootScope",function(a){return{restrict:"A",
require:["ngModel","^?form","^?ngModelOptions"],controller:gh,priority:1,compile:function(b){b.addClass(Wa).addClass("ng-untouched").addClass(rb);return{pre:function(a,b,f,e){var g=e[0];b=e[1]||g.$$parentForm;g.$$setOptions(e[2]&&e[2].$options);b.$addControl(g);f.$observe("name",function(a){g.$name!==a&&g.$$parentForm.$$renameControl(g,a)});a.$on("$destroy",function(){g.$$parentForm.$removeControl(g)})},post:function(b,c,f,e){var g=e[0];if(g.$options&&g.$options.updateOn)c.on(g.$options.updateOn,
function(a){g.$$debounceViewValueCommit(a&&a.type)});c.on("blur",function(){g.$touched||(a.$$phase?b.$evalAsync(g.$setTouched):b.$apply(g.$setTouched))})}}}}}],hh=/(\s+|^)default(\s+|$)/,hf=function(){return{restrict:"A",controller:["$scope","$attrs",function(a,b){var d=this;this.$options=sa(a.$eval(b.ngModelOptions));x(this.$options.updateOn)?(this.$options.updateOnDefault=!1,this.$options.updateOn=Y(this.$options.updateOn.replace(hh,function(){d.$options.updateOnDefault=!0;return" "}))):this.$options.updateOnDefault=
!0}]}},Ue=Va({terminal:!0,priority:1E3}),ih=G("ngOptions"),jh=/^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?(?:\s+disable\s+when\s+([\s\S]+?))?\s+for\s+(?:([$\w][$\w]*)|(?:\(\s*([$\w][$\w]*)\s*,\s*([$\w][$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/,bf=["$compile","$document","$parse",function(a,b,d){function c(a,b,c){function e(a,b,c,d,f){this.selectValue=a;this.viewValue=b;this.label=c;this.group=d;this.disabled=f}function f(a){var b;if(!q&&la(a))b=a;else{b=
[];for(var c in a)a.hasOwnProperty(c)&&"$"!==c.charAt(0)&&b.push(c)}return b}var n=a.match(jh);if(!n)throw ih("iexp",a,ya(b));var r=n[5]||n[7],q=n[6];a=/ as /.test(n[0])&&n[1];var t=n[9];b=d(n[2]?n[1]:r);var u=a&&d(a)||b,p=t&&d(t),x=t?function(a,b){return p(c,b)}:function(a){return Aa(a)},A=function(a,b){return x(a,C(a,b))},v=d(n[2]||n[1]),z=d(n[3]||""),L=d(n[4]||""),w=d(n[8]),y={},C=q?function(a,b){y[q]=b;y[r]=a;return y}:function(a){y[r]=a;return y};return{trackBy:t,getTrackByValue:A,getWatchables:d(w,
function(a){var b=[];a=a||[];for(var d=f(a),e=d.length,g=0;g<e;g++){var h=a===d?g:d[g],l=a[h],h=C(l,h),l=x(l,h);b.push(l);if(n[2]||n[1])l=v(c,h),b.push(l);n[4]&&(h=L(c,h),b.push(h))}return b}),getOptions:function(){for(var a=[],b={},d=w(c)||[],g=f(d),h=g.length,n=0;n<h;n++){var p=d===g?n:g[n],r=C(d[p],p),q=u(c,r),p=x(q,r),s=v(c,r),y=z(c,r),r=L(c,r),q=new e(p,q,s,y,r);a.push(q);b[p]=q}return{items:a,selectValueMap:b,getOptionFromViewValue:function(a){return b[A(a)]},getViewValueFromOption:function(a){return t?
sa(a.viewValue):a.viewValue}}}}}var f=y.document.createElement("option"),e=y.document.createElement("optgroup");return{restrict:"A",terminal:!0,require:["select","ngModel"],link:{pre:function(a,b,c,d){d[0].registerOption=w},post:function(d,h,k,l){function m(a,b){a.element=b;b.disabled=a.disabled;a.label!==b.label&&(b.label=a.label,b.textContent=a.label);b.value=a.selectValue}function n(){var a=w&&r.readValue();if(w)for(var b=w.items.length-1;0<=b;b--){var c=w.items[b];x(c.group)?Fb(c.element.parentNode):
Fb(c.element)}w=C.getOptions();var d={};A&&h.prepend(u);w.items.forEach(function(a){var b;if(x(a.group)){b=d[a.group];b||(b=e.cloneNode(!1),D.appendChild(b),b.label=null===a.group?"null":a.group,d[a.group]=b);var c=f.cloneNode(!1)}else b=D,c=f.cloneNode(!1);b.appendChild(c);m(a,c)});h[0].appendChild(D);s.$render();s.$isEmpty(a)||(b=r.readValue(),(C.trackBy||t?na(a,b):a===b)||(s.$setViewValue(b),s.$render()))}var r=l[0],s=l[1],t=k.multiple,u;l=0;for(var p=h.children(),z=p.length;l<z;l++)if(""===p[l].value){u=
p.eq(l);break}var A=!!u,v=!1,y=F(f.cloneNode(!1));y.val("?");var w,C=c(k.ngOptions,h,d),D=b[0].createDocumentFragment(),E=function(){A?v&&u.removeAttr("selected"):u.remove()};t?(s.$isEmpty=function(a){return!a||0===a.length},r.writeValue=function(a){w.items.forEach(function(a){a.element.selected=!1});a&&a.forEach(function(a){if(a=w.getOptionFromViewValue(a))a.element.selected=!0})},r.readValue=function(){var a=h.val()||[],b=[];q(a,function(a){(a=w.selectValueMap[a])&&!a.disabled&&b.push(w.getViewValueFromOption(a))});
return b},C.trackBy&&d.$watchCollection(function(){if(I(s.$viewValue))return s.$viewValue.map(function(a){return C.getTrackByValue(a)})},function(){s.$render()})):(r.writeValue=function(a){var b=w.selectValueMap[h.val()],c=w.getOptionFromViewValue(a);b&&b.element.removeAttribute("selected");c?(h[0].value!==c.selectValue&&(y.remove(),E(),h[0].value=c.selectValue,c.element.selected=!0),c.element.setAttribute("selected","selected")):null===a||A?(y.remove(),A||h.prepend(u),h.val(""),v&&(u.prop("selected",
!0),u.attr("selected",!0))):(E(),h.prepend(y),h.val("?"),y.prop("selected",!0),y.attr("selected",!0))},r.readValue=function(){var a=w.selectValueMap[h.val()];return a&&!a.disabled?(E(),y.remove(),w.getViewValueFromOption(a)):null},C.trackBy&&d.$watch(function(){return C.getTrackByValue(s.$viewValue)},function(){s.$render()}));A?(u.remove(),a(u)(d),8===u[0].nodeType?(v=!1,r.registerOption=function(a,b){""===b.val()&&(v=!0,u=b,u.removeClass("ng-scope"),s.$render(),b.on("$destroy",function(){u=void 0;
v=!1}))}):(u.removeClass("ng-scope"),v=!0)):u=F(f.cloneNode(!1));h.empty();n();d.$watchCollection(C.getWatchables,n)}}}}],Ve=["$locale","$interpolate","$log",function(a,b,d){var c=/{}/g,f=/^when(Minus)?(.+)$/;return{link:function(e,g,h){function k(a){g.text(a||"")}var l=h.count,m=h.$attr.when&&g.attr(h.$attr.when),n=h.offset||0,r=e.$eval(m)||{},s={},t=b.startSymbol(),u=b.endSymbol(),p=t+l+"-"+n+u,x=$.noop,A;q(h,function(a,b){var c=f.exec(b);c&&(c=(c[1]?"-":"")+Q(c[2]),r[c]=g.attr(h.$attr[b]))});q(r,
function(a,d){s[d]=b(a.replace(c,p))});e.$watch(l,function(b){var c=parseFloat(b),f=ia(c);f||c in r||(c=a.pluralCat(c-n));c===A||f&&ia(A)||(x(),f=s[c],z(f)?(null!=b&&d.debug("ngPluralize: no rule defined for '"+c+"' in "+m),x=w,k()):x=e.$watch(f,k),A=c)})}}}],We=["$parse","$animate","$compile",function(a,b,d){var c=G("ngRepeat"),f=function(a,b,c,d,f,m,n){a[c]=d;f&&(a[f]=m);a.$index=b;a.$first=0===b;a.$last=b===n-1;a.$middle=!(a.$first||a.$last);a.$odd=!(a.$even=0===(b&1))};return{restrict:"A",multiElement:!0,
transclude:"element",priority:1E3,terminal:!0,$$tlb:!0,compile:function(e,g){var h=g.ngRepeat,k=d.$$createComment("end ngRepeat",h),l=h.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);if(!l)throw c("iexp",h);var m=l[1],n=l[2],r=l[3],s=l[4],l=m.match(/^(?:(\s*[$\w]+)|\(\s*([$\w]+)\s*,\s*([$\w]+)\s*\))$/);if(!l)throw c("iidexp",m);var t=l[3]||l[1],u=l[2];if(r&&(!/^[$a-zA-Z_][$a-zA-Z0-9_]*$/.test(r)||/^(null|undefined|this|\$index|\$first|\$middle|\$last|\$even|\$odd|\$parent|\$root|\$id)$/.test(r)))throw c("badident",
r);var p,x,A,v,w={$id:Aa};s?p=a(s):(A=function(a,b){return Aa(b)},v=function(a){return a});return function(a,d,e,g,l){p&&(x=function(b,c,d){u&&(w[u]=b);w[t]=c;w.$index=d;return p(a,w)});var m=V();a.$watchCollection(n,function(e){var g,n,p=d[0],s,w=V(),z,y,C,D,F,E,G;r&&(a[r]=e);if(la(e))F=e,n=x||A;else for(G in n=x||v,F=[],e)ua.call(e,G)&&"$"!==G.charAt(0)&&F.push(G);z=F.length;G=Array(z);for(g=0;g<z;g++)if(y=e===F?g:F[g],C=e[y],D=n(y,C,g),m[D])E=m[D],delete m[D],w[D]=E,G[g]=E;else{if(w[D])throw q(G,
function(a){a&&a.scope&&(m[a.id]=a)}),c("dupes",h,D,C);G[g]={id:D,scope:void 0,clone:void 0};w[D]=!0}for(s in m){E=m[s];D=vb(E.clone);b.leave(D);if(D[0].parentNode)for(g=0,n=D.length;g<n;g++)D[g].$$NG_REMOVED=!0;E.scope.$destroy()}for(g=0;g<z;g++)if(y=e===F?g:F[g],C=e[y],E=G[g],E.scope){s=p;do s=s.nextSibling;while(s&&s.$$NG_REMOVED);E.clone[0]!==s&&b.move(vb(E.clone),null,p);p=E.clone[E.clone.length-1];f(E.scope,g,t,C,u,y,z)}else l(function(a,c){E.scope=c;var d=k.cloneNode(!1);a[a.length++]=d;b.enter(a,
null,p);p=d;E.clone=a;w[E.id]=E;f(E.scope,g,t,C,u,y,z)});m=w})}}}}],Xe=["$animate",function(a){return{restrict:"A",multiElement:!0,link:function(b,d,c){b.$watch(c.ngShow,function(b){a[b?"removeClass":"addClass"](d,"ng-hide",{tempClasses:"ng-hide-animate"})})}}}],Qe=["$animate",function(a){return{restrict:"A",multiElement:!0,link:function(b,d,c){b.$watch(c.ngHide,function(b){a[b?"addClass":"removeClass"](d,"ng-hide",{tempClasses:"ng-hide-animate"})})}}}],Ye=Va(function(a,b,d){a.$watch(d.ngStyle,function(a,
d){d&&a!==d&&q(d,function(a,c){b.css(c,"")});a&&b.css(a)},!0)}),Ze=["$animate","$compile",function(a,b){return{require:"ngSwitch",controller:["$scope",function(){this.cases={}}],link:function(d,c,f,e){var g=[],h=[],k=[],l=[],m=function(a,b){return function(c){!1!==c&&a.splice(b,1)}};d.$watch(f.ngSwitch||f.on,function(c){for(var d,f;k.length;)a.cancel(k.pop());d=0;for(f=l.length;d<f;++d){var t=vb(h[d].clone);l[d].$destroy();(k[d]=a.leave(t)).done(m(k,d))}h.length=0;l.length=0;(g=e.cases["!"+c]||e.cases["?"])&&
q(g,function(c){c.transclude(function(d,e){l.push(e);var f=c.element;d[d.length++]=b.$$createComment("end ngSwitchWhen");h.push({clone:d});a.enter(d,f.parent(),f)})})})}}}],$e=Va({transclude:"element",priority:1200,require:"^ngSwitch",multiElement:!0,link:function(a,b,d,c,f){a=d.ngSwitchWhen.split(d.ngSwitchWhenSeparator).sort().filter(function(a,b,c){return c[b-1]!==a});q(a,function(a){c.cases["!"+a]=c.cases["!"+a]||[];c.cases["!"+a].push({transclude:f,element:b})})}}),af=Va({transclude:"element",
priority:1200,require:"^ngSwitch",multiElement:!0,link:function(a,b,d,c,f){c.cases["?"]=c.cases["?"]||[];c.cases["?"].push({transclude:f,element:b})}}),kh=G("ngTransclude"),cf=["$compile",function(a){return{restrict:"EAC",terminal:!0,compile:function(b){var d=a(b.contents());b.empty();return function(a,b,e,g,h){function k(){d(a,function(a){b.append(a)})}if(!h)throw kh("orphan",ya(b));e.ngTransclude===e.$attr.ngTransclude&&(e.ngTransclude="");e=e.ngTransclude||e.ngTranscludeSlot;h(function(a,c){a.length?
b.append(a):(k(),c.$destroy())},null,e);e&&!h.isSlotFilled(e)&&k()}}}}],Ee=["$templateCache",function(a){return{restrict:"E",terminal:!0,compile:function(b,d){"text/ng-template"===d.type&&a.put(d.id,b[0].text)}}}],lh={$setViewValue:w,$render:w},mh=["$element","$scope",function(a,b){var d=this,c=new Sa;d.ngModelCtrl=lh;d.unknownOption=F(y.document.createElement("option"));d.renderUnknownOption=function(b){b="? "+Aa(b)+" ?";d.unknownOption.val(b);a.prepend(d.unknownOption);a.val(b)};b.$on("$destroy",
function(){d.renderUnknownOption=w});d.removeUnknownOption=function(){d.unknownOption.parent()&&d.unknownOption.remove()};d.readValue=function(){d.removeUnknownOption();return a.val()};d.writeValue=function(b){d.hasOption(b)?(d.removeUnknownOption(),a.val(b),""===b&&d.emptyOption.prop("selected",!0)):null==b&&d.emptyOption?(d.removeUnknownOption(),a.val("")):d.renderUnknownOption(b)};d.addOption=function(a,b){if(8!==b[0].nodeType){Ra(a,'"option value"');""===a&&(d.emptyOption=b);var g=c.get(a)||0;
c.put(a,g+1);d.ngModelCtrl.$render();b[0].hasAttribute("selected")&&(b[0].selected=!0)}};d.removeOption=function(a){var b=c.get(a);b&&(1===b?(c.remove(a),""===a&&(d.emptyOption=void 0)):c.put(a,b-1))};d.hasOption=function(a){return!!c.get(a)};d.registerOption=function(a,b,c,h,k){if(h){var l;c.$observe("value",function(a){x(l)&&d.removeOption(l);l=a;d.addOption(a,b)})}else k?a.$watch(k,function(a,f){c.$set("value",a);f!==a&&d.removeOption(f);d.addOption(a,b)}):d.addOption(c.value,b);b.on("$destroy",
function(){d.removeOption(c.value);d.ngModelCtrl.$render()})}}],Fe=function(){return{restrict:"E",require:["select","?ngModel"],controller:mh,priority:1,link:{pre:function(a,b,d,c){var f=c[1];if(f){var e=c[0];e.ngModelCtrl=f;b.on("change",function(){a.$apply(function(){f.$setViewValue(e.readValue())})});if(d.multiple){e.readValue=function(){var a=[];q(b.find("option"),function(b){b.selected&&a.push(b.value)});return a};e.writeValue=function(a){var c=new Sa(a);q(b.find("option"),function(a){a.selected=
x(c.get(a.value))})};var g,h=NaN;a.$watch(function(){h!==f.$viewValue||na(g,f.$viewValue)||(g=ka(f.$viewValue),f.$render());h=f.$viewValue});f.$isEmpty=function(a){return!a||0===a.length}}}},post:function(a,b,d,c){var f=c[1];if(f){var e=c[0];f.$render=function(){e.writeValue(f.$viewValue)}}}}}},Ge=["$interpolate",function(a){return{restrict:"E",priority:100,compile:function(b,d){var c,f;x(d.ngValue)?c=!0:x(d.value)?c=a(d.value,!0):(f=a(b.text(),!0))||d.$set("value",b.text());return function(a,b,d){var k=
b.parent();(k=k.data("$selectController")||k.parent().data("$selectController"))&&k.registerOption(a,b,d,c,f)}}}}],Nc=function(){return{restrict:"A",require:"?ngModel",link:function(a,b,d,c){c&&(d.required=!0,c.$validators.required=function(a,b){return!d.required||!c.$isEmpty(b)},d.$observe("required",function(){c.$validate()}))}}},Mc=function(){return{restrict:"A",require:"?ngModel",link:function(a,b,d,c){if(c){var f,e=d.ngPattern||d.pattern;d.$observe("pattern",function(a){D(a)&&0<a.length&&(a=
new RegExp("^"+a+"$"));if(a&&!a.test)throw G("ngPattern")("noregexp",e,a,ya(b));f=a||void 0;c.$validate()});c.$validators.pattern=function(a,b){return c.$isEmpty(b)||z(f)||f.test(b)}}}}},Pc=function(){return{restrict:"A",require:"?ngModel",link:function(a,b,d,c){if(c){var f=-1;d.$observe("maxlength",function(a){a=Z(a);f=ia(a)?-1:a;c.$validate()});c.$validators.maxlength=function(a,b){return 0>f||c.$isEmpty(b)||b.length<=f}}}}},Oc=function(){return{restrict:"A",require:"?ngModel",link:function(a,b,
d,c){if(c){var f=0;d.$observe("minlength",function(a){f=Z(a)||0;c.$validate()});c.$validators.minlength=function(a,b){return c.$isEmpty(b)||b.length>=f}}}}};y.angular.bootstrap?y.console&&console.log("WARNING: Tried to load angular more than once."):(xe(),ze($),$.module("ngLocale",[],["$provide",function(a){function b(a){a+="";var b=a.indexOf(".");return-1==b?0:a.length-b-1}a.value("$locale",{DATETIME_FORMATS:{AMPMS:["AM","PM"],DAY:"Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),
ERANAMES:["Before Christ","Anno Domini"],ERAS:["BC","AD"],FIRSTDAYOFWEEK:6,MONTH:"January February March April May June July August September October November December".split(" "),SHORTDAY:"Sun Mon Tue Wed Thu Fri Sat".split(" "),SHORTMONTH:"Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" "),STANDALONEMONTH:"January February March April May June July August September October November December".split(" "),WEEKENDRANGE:[5,6],fullDate:"EEEE, MMMM d, y",longDate:"MMMM d, y",medium:"MMM d, y h:mm:ss a",
mediumDate:"MMM d, y",mediumTime:"h:mm:ss a","short":"M/d/yy h:mm a",shortDate:"M/d/yy",shortTime:"h:mm a"},NUMBER_FORMATS:{CURRENCY_SYM:"$",DECIMAL_SEP:".",GROUP_SEP:",",PATTERNS:[{gSize:3,lgSize:3,maxFrac:3,minFrac:0,minInt:1,negPre:"-",negSuf:"",posPre:"",posSuf:""},{gSize:3,lgSize:3,maxFrac:2,minFrac:2,minInt:1,negPre:"-\u00a4",negSuf:"",posPre:"\u00a4",posSuf:""}]},id:"en-us",localeID:"en_US",pluralCat:function(a,c){var f=a|0,e=c;void 0===e&&(e=Math.min(b(a),3));Math.pow(10,e);return 1==f&&0==
e?"one":"other"}})}]),F(y.document).ready(function(){se(y.document,Gc)}))})(window);!window.angular.$$csp().noInlineStyle&&window.angular.element(document.head).prepend('<style type="text/css">@charset "UTF-8";[ng\\:cloak],[ng-cloak],[data-ng-cloak],[x-ng-cloak],.ng-cloak,.x-ng-cloak,.ng-hide:not(.ng-hide-animate){display:none !important;}ng\\:form{display:block;}.ng-animate-shim{visibility:hidden;}.ng-anchor{position:absolute;}</style>');
/*! RESOURCE: /scripts/angular_1.5.11/angular-sanitize.min.js */
/*
 AngularJS v1.5.11
 (c) 2010-2017 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(s,g){'use strict';function H(g){var l=[];t(l,A).chars(g);return l.join("")}var B=g.$$minErr("$sanitize"),C,l,D,E,q,A,F,t;g.module("ngSanitize",[]).provider("$sanitize",function(){function k(a,e){var b={},c=a.split(","),h;for(h=0;h<c.length;h++)b[e?q(c[h]):c[h]]=!0;return b}function I(a){for(var e={},b=0,c=a.length;b<c;b++){var h=a[b];e[h.name]=h.value}return e}function G(a){return a.replace(/&/g,"&amp;").replace(J,function(a){var b=a.charCodeAt(0);a=a.charCodeAt(1);return"&#"+(1024*(b-55296)+
(a-56320)+65536)+";"}).replace(K,function(a){return"&#"+a.charCodeAt(0)+";"}).replace(/</g,"&lt;").replace(/>/g,"&gt;")}function x(a){for(;a;){if(a.nodeType===s.Node.ELEMENT_NODE)for(var e=a.attributes,b=0,c=e.length;b<c;b++){var h=e[b],d=h.name.toLowerCase();if("xmlns:ns1"===d||0===d.lastIndexOf("ns1:",0))a.removeAttributeNode(h),b--,c--}(e=a.firstChild)&&x(e);a=a.nextSibling}}var u=!1;this.$get=["$$sanitizeUri",function(a){u&&l(v,w);return function(e){var b=[];F(e,t(b,function(b,h){return!/^unsafe:/.test(a(b,
h))}));return b.join("")}}];this.enableSvg=function(a){return E(a)?(u=a,this):u};C=g.bind;l=g.extend;D=g.forEach;E=g.isDefined;q=g.lowercase;A=g.noop;F=function(a,e){null===a||void 0===a?a="":"string"!==typeof a&&(a=""+a);f.innerHTML=a;var b=5;do{if(0===b)throw B("uinput");b--;s.document.documentMode&&x(f);a=f.innerHTML;f.innerHTML=a}while(a!==f.innerHTML);for(b=f.firstChild;b;){switch(b.nodeType){case 1:e.start(b.nodeName.toLowerCase(),I(b.attributes));break;case 3:e.chars(b.textContent)}var c;if(!(c=
b.firstChild)&&(1===b.nodeType&&e.end(b.nodeName.toLowerCase()),c=b.nextSibling,!c))for(;null==c;){b=b.parentNode;if(b===f)break;c=b.nextSibling;1===b.nodeType&&e.end(b.nodeName.toLowerCase())}b=c}for(;b=f.firstChild;)f.removeChild(b)};t=function(a,e){var b=!1,c=C(a,a.push);return{start:function(a,d){a=q(a);!b&&z[a]&&(b=a);b||!0!==v[a]||(c("<"),c(a),D(d,function(b,d){var f=q(d),g="img"===a&&"src"===f||"background"===f;!0!==m[f]||!0===n[f]&&!e(b,g)||(c(" "),c(d),c('="'),c(G(b)),c('"'))}),c(">"))},
end:function(a){a=q(a);b||!0!==v[a]||!0===y[a]||(c("</"),c(a),c(">"));a==b&&(b=!1)},chars:function(a){b||c(G(a))}}};var J=/[\uD800-\uDBFF][\uDC00-\uDFFF]/g,K=/([^#-~ |!])/g,y=k("area,br,col,hr,img,wbr"),d=k("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr"),r=k("rp,rt"),p=l({},r,d),d=l({},d,k("address,article,aside,blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,header,hgroup,hr,ins,map,menu,nav,ol,pre,section,table,ul")),r=l({},r,k("a,abbr,acronym,b,bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s,samp,small,span,strike,strong,sub,sup,time,tt,u,var")),
w=k("circle,defs,desc,ellipse,font-face,font-face-name,font-face-src,g,glyph,hkern,image,linearGradient,line,marker,metadata,missing-glyph,mpath,path,polygon,polyline,radialGradient,rect,stop,svg,switch,text,title,tspan"),z=k("script,style"),v=l({},y,d,r,p),n=k("background,cite,href,longdesc,src,xlink:href"),p=k("abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,scope,scrolling,shape,size,span,start,summary,tabindex,target,title,type,valign,value,vspace,width"),
r=k("accent-height,accumulate,additive,alphabetic,arabic-form,ascent,baseProfile,bbox,begin,by,calcMode,cap-height,class,color,color-rendering,content,cx,cy,d,dx,dy,descent,display,dur,end,fill,fill-rule,font-family,font-size,font-stretch,font-style,font-variant,font-weight,from,fx,fy,g1,g2,glyph-name,gradientUnits,hanging,height,horiz-adv-x,horiz-origin-x,ideographic,k,keyPoints,keySplines,keyTimes,lang,marker-end,marker-mid,marker-start,markerHeight,markerUnits,markerWidth,mathematical,max,min,offset,opacity,orient,origin,overline-position,overline-thickness,panose-1,path,pathLength,points,preserveAspectRatio,r,refX,refY,repeatCount,repeatDur,requiredExtensions,requiredFeatures,restart,rotate,rx,ry,slope,stemh,stemv,stop-color,stop-opacity,strikethrough-position,strikethrough-thickness,stroke,stroke-dasharray,stroke-dashoffset,stroke-linecap,stroke-linejoin,stroke-miterlimit,stroke-opacity,stroke-width,systemLanguage,target,text-anchor,to,transform,type,u1,u2,underline-position,underline-thickness,unicode,unicode-range,units-per-em,values,version,viewBox,visibility,width,widths,x,x-height,x1,x2,xlink:actuate,xlink:arcrole,xlink:role,xlink:show,xlink:title,xlink:type,xml:base,xml:lang,xml:space,xmlns,xmlns:xlink,y,y1,y2,zoomAndPan",
!0),m=l({},n,r,p),f;(function(a){if(a.document&&a.document.implementation)a=a.document.implementation.createHTMLDocument("inert");else throw B("noinert");var e=(a.documentElement||a.getDocumentElement()).getElementsByTagName("body");1===e.length?f=e[0]:(e=a.createElement("html"),f=a.createElement("body"),e.appendChild(f),a.appendChild(e))})(s)});g.module("ngSanitize").filter("linky",["$sanitize",function(k){var l=/((ftp|https?):\/\/|(www\.)|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>"\u201d\u2019]/i,
q=/^mailto:/i,x=g.$$minErr("linky"),u=g.isDefined,s=g.isFunction,t=g.isObject,y=g.isString;return function(d,g,p){function w(a){a&&m.push(H(a))}function z(a,b){var c,d=v(a);m.push("<a ");for(c in d)m.push(c+'="'+d[c]+'" ');!u(g)||"target"in d||m.push('target="',g,'" ');m.push('href="',a.replace(/"/g,"&quot;"),'">');w(b);m.push("</a>")}if(null==d||""===d)return d;if(!y(d))throw x("notstring",d);for(var v=s(p)?p:t(p)?function(){return p}:function(){return{}},n=d,m=[],f,a;d=n.match(l);)f=d[0],d[2]||
d[4]||(f=(d[3]?"http://":"mailto:")+f),a=d.index,w(n.substr(0,a)),z(f,d[0].replace(q,"")),n=n.substring(a+d[0].length);w(n);return k(m.join(""))}}])})(window,window.angular);
/*! RESOURCE: /scripts/angular_1.5.11/angular-animate.min.js */
/*
 AngularJS v1.5.11
 (c) 2010-2017 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(R,B){'use strict';function Da(a,b,c){if(!a)throw Ma("areq",b||"?",c||"required");return a}function Ea(a,b){if(!a&&!b)return"";if(!a)return b;if(!b)return a;X(a)&&(a=a.join(" "));X(b)&&(b=b.join(" "));return a+" "+b}function Na(a){var b={};a&&(a.to||a.from)&&(b.to=a.to,b.from=a.from);return b}function Y(a,b,c){var d="";a=X(a)?a:a&&G(a)&&a.length?a.split(/\s+/):[];s(a,function(a,l){a&&0<a.length&&(d+=0<l?" ":"",d+=c?b+a:a+b)});return d}function Oa(a){if(a instanceof F)switch(a.length){case 0:return a;
case 1:if(1===a[0].nodeType)return a;break;default:return F(ta(a))}if(1===a.nodeType)return F(a)}function ta(a){if(!a[0])return a;for(var b=0;b<a.length;b++){var c=a[b];if(1===c.nodeType)return c}}function Pa(a,b,c){s(b,function(b){a.addClass(b,c)})}function Qa(a,b,c){s(b,function(b){a.removeClass(b,c)})}function Z(a){return function(b,c){c.addClass&&(Pa(a,b,c.addClass),c.addClass=null);c.removeClass&&(Qa(a,b,c.removeClass),c.removeClass=null)}}function oa(a){a=a||{};if(!a.$$prepared){var b=a.domOperation||
P;a.domOperation=function(){a.$$domOperationFired=!0;b();b=P};a.$$prepared=!0}return a}function ha(a,b){Fa(a,b);Ga(a,b)}function Fa(a,b){b.from&&(a.css(b.from),b.from=null)}function Ga(a,b){b.to&&(a.css(b.to),b.to=null)}function V(a,b,c){var d=b.options||{};c=c.options||{};var e=(d.addClass||"")+" "+(c.addClass||""),l=(d.removeClass||"")+" "+(c.removeClass||"");a=Ra(a.attr("class"),e,l);c.preparationClasses&&(d.preparationClasses=$(c.preparationClasses,d.preparationClasses),delete c.preparationClasses);
e=d.domOperation!==P?d.domOperation:null;ua(d,c);e&&(d.domOperation=e);d.addClass=a.addClass?a.addClass:null;d.removeClass=a.removeClass?a.removeClass:null;b.addClass=d.addClass;b.removeClass=d.removeClass;return d}function Ra(a,b,c){function d(a){G(a)&&(a=a.split(" "));var b={};s(a,function(a){a.length&&(b[a]=!0)});return b}var e={};a=d(a);b=d(b);s(b,function(a,b){e[b]=1});c=d(c);s(c,function(a,b){e[b]=1===e[b]?null:-1});var l={addClass:"",removeClass:""};s(e,function(b,c){var d,e;1===b?(d="addClass",
e=!a[c]||a[c+"-remove"]):-1===b&&(d="removeClass",e=a[c]||a[c+"-add"]);e&&(l[d].length&&(l[d]+=" "),l[d]+=c)});return l}function y(a){return a instanceof F?a[0]:a}function Sa(a,b,c){var d="";b&&(d=Y(b,"ng-",!0));c.addClass&&(d=$(d,Y(c.addClass,"-add")));c.removeClass&&(d=$(d,Y(c.removeClass,"-remove")));d.length&&(c.preparationClasses=d,a.addClass(d))}function pa(a,b){var c=b?"-"+b+"s":"";la(a,[ma,c]);return[ma,c]}function va(a,b){var c=b?"paused":"",d=aa+"PlayState";la(a,[d,c]);return[d,c]}function la(a,
b){a.style[b[0]]=b[1]}function $(a,b){return a?b?a+" "+b:a:b}function Ha(a,b,c){var d=Object.create(null),e=a.getComputedStyle(b)||{};s(c,function(a,b){var c=e[a];if(c){var g=c.charAt(0);if("-"===g||"+"===g||0<=g)c=Ta(c);0===c&&(c=null);d[b]=c}});return d}function Ta(a){var b=0;a=a.split(/\s*,\s*/);s(a,function(a){"s"===a.charAt(a.length-1)&&(a=a.substring(0,a.length-1));a=parseFloat(a)||0;b=b?Math.max(a,b):a});return b}function wa(a){return 0===a||null!=a}function Ia(a,b){var c=S,d=a+"s";b?c+="Duration":
d+=" linear all";return[c,d]}function Ja(){var a=Object.create(null);return{flush:function(){a=Object.create(null)},count:function(b){return(b=a[b])?b.total:0},get:function(b){return(b=a[b])&&b.value},put:function(b,c){a[b]?a[b].total++:a[b]={total:1,value:c}}}}function Ka(a,b,c){s(c,function(c){a[c]=xa(a[c])?a[c]:b.style.getPropertyValue(c)})}var S,ya,aa,za;void 0===R.ontransitionend&&void 0!==R.onwebkittransitionend?(S="WebkitTransition",ya="webkitTransitionEnd transitionend"):(S="transition",ya=
"transitionend");void 0===R.onanimationend&&void 0!==R.onwebkitanimationend?(aa="WebkitAnimation",za="webkitAnimationEnd animationend"):(aa="animation",za="animationend");var qa=aa+"Delay",Aa=aa+"Duration",ma=S+"Delay",La=S+"Duration",Ma=B.$$minErr("ng"),Ua={transitionDuration:La,transitionDelay:ma,transitionProperty:S+"Property",animationDuration:Aa,animationDelay:qa,animationIterationCount:aa+"IterationCount"},Va={transitionDuration:La,transitionDelay:ma,animationDuration:Aa,animationDelay:qa},
Ba,ua,s,X,xa,ea,Ca,ba,G,J,F,P;B.module("ngAnimate",[],function(){P=B.noop;Ba=B.copy;ua=B.extend;F=B.element;s=B.forEach;X=B.isArray;G=B.isString;ba=B.isObject;J=B.isUndefined;xa=B.isDefined;Ca=B.isFunction;ea=B.isElement}).directive("ngAnimateSwap",["$animate","$rootScope",function(a,b){return{restrict:"A",transclude:"element",terminal:!0,priority:600,link:function(b,d,e,l,n){var I,g;b.$watchCollection(e.ngAnimateSwap||e["for"],function(e){I&&a.leave(I);g&&(g.$destroy(),g=null);if(e||0===e)g=b.$new(),
n(g,function(b){I=b;a.enter(b,null,d)})})}}}]).directive("ngAnimateChildren",["$interpolate",function(a){return{link:function(b,c,d){function e(a){c.data("$$ngAnimateChildren","on"===a||"true"===a)}var l=d.ngAnimateChildren;G(l)&&0===l.length?c.data("$$ngAnimateChildren",!0):(e(a(l)(b)),d.$observe("ngAnimateChildren",e))}}}]).factory("$$rAFScheduler",["$$rAF",function(a){function b(a){d=d.concat(a);c()}function c(){if(d.length){for(var b=d.shift(),n=0;n<b.length;n++)b[n]();e||a(function(){e||c()})}}
var d,e;d=b.queue=[];b.waitUntilQuiet=function(b){e&&e();e=a(function(){e=null;b();c()})};return b}]).provider("$$animateQueue",["$animateProvider",function(a){function b(a){if(!a)return null;a=a.split(" ");var b=Object.create(null);s(a,function(a){b[a]=!0});return b}function c(a,c){if(a&&c){var d=b(c);return a.split(" ").some(function(a){return d[a]})}}function d(a,b,c,d){return l[a].some(function(a){return a(b,c,d)})}function e(a,b){var c=0<(a.addClass||"").length,d=0<(a.removeClass||"").length;
return b?c&&d:c||d}var l=this.rules={skip:[],cancel:[],join:[]};l.join.push(function(a,b,c){return!b.structural&&e(b)});l.skip.push(function(a,b,c){return!b.structural&&!e(b)});l.skip.push(function(a,b,c){return"leave"===c.event&&b.structural});l.skip.push(function(a,b,c){return c.structural&&2===c.state&&!b.structural});l.cancel.push(function(a,b,c){return c.structural&&b.structural});l.cancel.push(function(a,b,c){return 2===c.state&&b.structural});l.cancel.push(function(a,b,d){if(d.structural)return!1;
a=b.addClass;b=b.removeClass;var e=d.addClass;d=d.removeClass;return J(a)&&J(b)||J(e)&&J(d)?!1:c(a,d)||c(b,e)});this.$get=["$$rAF","$rootScope","$rootElement","$document","$$HashMap","$$animation","$$AnimateRunner","$templateRequest","$$jqLite","$$forceReflow",function(b,c,g,l,C,Wa,Q,t,H,T){function O(){var a=!1;return function(b){a?b():c.$$postDigest(function(){a=!0;b()})}}function x(a,b,c){var f=y(b),d=y(a),N=[];(a=h[c])&&s(a,function(a){w.call(a.node,f)?N.push(a.callback):"leave"===c&&w.call(a.node,
d)&&N.push(a.callback)});return N}function r(a,b,c){var f=ta(b);return a.filter(function(a){return!(a.node===f&&(!c||a.callback===c))})}function p(a,h,v){function r(c,f,d,h){sa(function(){var c=x(T,a,f);c.length?b(function(){s(c,function(b){b(a,d,h)});"close"!==d||a[0].parentNode||ra.off(a)}):"close"!==d||a[0].parentNode||ra.off(a)});c.progress(f,d,h)}function k(b){var c=a,f=m;f.preparationClasses&&(c.removeClass(f.preparationClasses),f.preparationClasses=null);f.activeClasses&&(c.removeClass(f.activeClasses),
f.activeClasses=null);E(a,m);ha(a,m);m.domOperation();A.complete(!b)}var m=Ba(v),p,T;if(a=Oa(a))p=y(a),T=a.parent();var m=oa(m),A=new Q,sa=O();X(m.addClass)&&(m.addClass=m.addClass.join(" "));m.addClass&&!G(m.addClass)&&(m.addClass=null);X(m.removeClass)&&(m.removeClass=m.removeClass.join(" "));m.removeClass&&!G(m.removeClass)&&(m.removeClass=null);m.from&&!ba(m.from)&&(m.from=null);m.to&&!ba(m.to)&&(m.to=null);if(!p)return k(),A;v=[p.className,m.addClass,m.removeClass].join(" ");if(!Xa(v))return k(),
A;var g=0<=["enter","move","leave"].indexOf(h),w=l[0].hidden,t=!f||w||N.get(p);v=!t&&z.get(p)||{};var H=!!v.state;t||H&&1===v.state||(t=!M(a,T,h));if(t)return w&&r(A,h,"start"),k(),w&&r(A,h,"close"),A;g&&K(a);w={structural:g,element:a,event:h,addClass:m.addClass,removeClass:m.removeClass,close:k,options:m,runner:A};if(H){if(d("skip",a,w,v)){if(2===v.state)return k(),A;V(a,v,w);return v.runner}if(d("cancel",a,w,v))if(2===v.state)v.runner.end();else if(v.structural)v.close();else return V(a,v,w),v.runner;
else if(d("join",a,w,v))if(2===v.state)V(a,w,{});else return Sa(a,g?h:null,m),h=w.event=v.event,m=V(a,v,w),v.runner}else V(a,w,{});(H=w.structural)||(H="animate"===w.event&&0<Object.keys(w.options.to||{}).length||e(w));if(!H)return k(),ka(a),A;var C=(v.counter||0)+1;w.counter=C;L(a,1,w);c.$$postDigest(function(){var b=z.get(p),c=!b,b=b||{},f=0<(a.parent()||[]).length&&("animate"===b.event||b.structural||e(b));if(c||b.counter!==C||!f){c&&(E(a,m),ha(a,m));if(c||g&&b.event!==h)m.domOperation(),A.end();
f||ka(a)}else h=!b.structural&&e(b,!0)?"setClass":b.event,L(a,2),b=Wa(a,h,b.options),A.setHost(b),r(A,h,"start",{}),b.done(function(b){k(!b);(b=z.get(p))&&b.counter===C&&ka(y(a));r(A,h,"close",{})})});return A}function K(a){a=y(a).querySelectorAll("[data-ng-animate]");s(a,function(a){var b=parseInt(a.getAttribute("data-ng-animate"),10),c=z.get(a);if(c)switch(b){case 2:c.runner.end();case 1:z.remove(a)}})}function ka(a){a=y(a);a.removeAttribute("data-ng-animate");z.remove(a)}function k(a,b){return y(a)===
y(b)}function M(a,b,c){c=F(l[0].body);var f=k(a,c)||"HTML"===a[0].nodeName,d=k(a,g),h=!1,r,e=N.get(y(a));(a=F.data(a[0],"$ngAnimatePin"))&&(b=a);for(b=y(b);b;){d||(d=k(b,g));if(1!==b.nodeType)break;a=z.get(b)||{};if(!h){var p=N.get(b);if(!0===p&&!1!==e){e=!0;break}else!1===p&&(e=!1);h=a.structural}if(J(r)||!0===r)a=F.data(b,"$$ngAnimateChildren"),xa(a)&&(r=a);if(h&&!1===r)break;f||(f=k(b,c));if(f&&d)break;if(!d&&(a=F.data(b,"$ngAnimatePin"))){b=y(a);continue}b=b.parentNode}return(!h||r)&&!0!==e&&
d&&f}function L(a,b,c){c=c||{};c.state=b;a=y(a);a.setAttribute("data-ng-animate",b);c=(b=z.get(a))?ua(b,c):c;z.put(a,c)}var z=new C,N=new C,f=null,A=c.$watch(function(){return 0===t.totalPendingRequests},function(a){a&&(A(),c.$$postDigest(function(){c.$$postDigest(function(){null===f&&(f=!0)})}))}),h=Object.create(null),sa=a.classNameFilter(),Xa=sa?function(a){return sa.test(a)}:function(){return!0},E=Z(H),w=R.Node.prototype.contains||function(a){return this===a||!!(this.compareDocumentPosition(a)&
16)},ra={on:function(a,b,c){var f=ta(b);h[a]=h[a]||[];h[a].push({node:f,callback:c});F(b).on("$destroy",function(){z.get(f)||ra.off(a,b,c)})},off:function(a,b,c){if(1!==arguments.length||G(arguments[0])){var f=h[a];f&&(h[a]=1===arguments.length?null:r(f,b,c))}else for(f in b=arguments[0],h)h[f]=r(h[f],b)},pin:function(a,b){Da(ea(a),"element","not an element");Da(ea(b),"parentElement","not an element");a.data("$ngAnimatePin",b)},push:function(a,b,c,f){c=c||{};c.domOperation=f;return p(a,b,c)},enabled:function(a,
b){var c=arguments.length;if(0===c)b=!!f;else if(ea(a)){var d=y(a);1===c?b=!N.get(d):N.put(d,!b)}else b=f=!!a;return b}};return ra}]}]).provider("$$animation",["$animateProvider",function(a){var b=this.drivers=[];this.$get=["$$jqLite","$rootScope","$injector","$$AnimateRunner","$$HashMap","$$rAFScheduler",function(a,d,e,l,n,I){function g(a){function b(a){if(a.processed)return a;a.processed=!0;var d=a.domNode,p=d.parentNode;e.put(d,a);for(var K;p;){if(K=e.get(p)){K.processed||(K=b(K));break}p=p.parentNode}(K||
c).children.push(a);return a}var c={children:[]},d,e=new n;for(d=0;d<a.length;d++){var g=a[d];e.put(g.domNode,a[d]={domNode:g.domNode,fn:g.fn,children:[]})}for(d=0;d<a.length;d++)b(a[d]);return function(a){var b=[],c=[],d;for(d=0;d<a.children.length;d++)c.push(a.children[d]);a=c.length;var e=0,k=[];for(d=0;d<c.length;d++){var g=c[d];0>=a&&(a=e,e=0,b.push(k),k=[]);k.push(g.fn);g.children.forEach(function(a){e++;c.push(a)});a--}k.length&&b.push(k);return b}(c)}var u=[],C=Z(a);return function(n,Q,t){function H(a){a=
a.hasAttribute("ng-animate-ref")?[a]:a.querySelectorAll("[ng-animate-ref]");var b=[];s(a,function(a){var c=a.getAttribute("ng-animate-ref");c&&c.length&&b.push(a)});return b}function T(a){var b=[],c={};s(a,function(a,d){var h=y(a.element),e=0<=["enter","move"].indexOf(a.event),h=a.structural?H(h):[];if(h.length){var k=e?"to":"from";s(h,function(a){var b=a.getAttribute("ng-animate-ref");c[b]=c[b]||{};c[b][k]={animationID:d,element:F(a)}})}else b.push(a)});var d={},e={};s(c,function(c,k){var r=c.from,
p=c.to;if(r&&p){var z=a[r.animationID],g=a[p.animationID],A=r.animationID.toString();if(!e[A]){var n=e[A]={structural:!0,beforeStart:function(){z.beforeStart();g.beforeStart()},close:function(){z.close();g.close()},classes:O(z.classes,g.classes),from:z,to:g,anchors:[]};n.classes.length?b.push(n):(b.push(z),b.push(g))}e[A].anchors.push({out:r.element,"in":p.element})}else r=r?r.animationID:p.animationID,p=r.toString(),d[p]||(d[p]=!0,b.push(a[r]))});return b}function O(a,b){a=a.split(" ");b=b.split(" ");
for(var c=[],d=0;d<a.length;d++){var e=a[d];if("ng-"!==e.substring(0,3))for(var r=0;r<b.length;r++)if(e===b[r]){c.push(e);break}}return c.join(" ")}function x(a){for(var c=b.length-1;0<=c;c--){var d=e.get(b[c])(a);if(d)return d}}function r(a,b){function c(a){(a=a.data("$$animationRunner"))&&a.setHost(b)}a.from&&a.to?(c(a.from.element),c(a.to.element)):c(a.element)}function p(){var a=n.data("$$animationRunner");!a||"leave"===Q&&t.$$domOperationFired||a.end()}function K(b){n.off("$destroy",p);n.removeData("$$animationRunner");
C(n,t);ha(n,t);t.domOperation();L&&a.removeClass(n,L);n.removeClass("ng-animate");k.complete(!b)}t=oa(t);var ka=0<=["enter","move","leave"].indexOf(Q),k=new l({end:function(){K()},cancel:function(){K(!0)}});if(!b.length)return K(),k;n.data("$$animationRunner",k);var M=Ea(n.attr("class"),Ea(t.addClass,t.removeClass)),L=t.tempClasses;L&&(M+=" "+L,t.tempClasses=null);var z;ka&&(z="ng-"+Q+"-prepare",a.addClass(n,z));u.push({element:n,classes:M,event:Q,structural:ka,options:t,beforeStart:function(){n.addClass("ng-animate");
L&&a.addClass(n,L);z&&(a.removeClass(n,z),z=null)},close:K});n.on("$destroy",p);if(1<u.length)return k;d.$$postDigest(function(){var a=[];s(u,function(b){b.element.data("$$animationRunner")?a.push(b):b.close()});u.length=0;var b=T(a),c=[];s(b,function(a){c.push({domNode:y(a.from?a.from.element:a.element),fn:function(){a.beforeStart();var b,c=a.close;if((a.anchors?a.from.element||a.to.element:a.element).data("$$animationRunner")){var d=x(a);d&&(b=d.start)}b?(b=b(),b.done(function(a){c(!a)}),r(a,b)):
c()}})});I(g(c))});return k}}]}]).provider("$animateCss",["$animateProvider",function(a){var b=Ja(),c=Ja();this.$get=["$window","$$jqLite","$$AnimateRunner","$timeout","$$forceReflow","$sniffer","$$rAFScheduler","$$animateQueue",function(a,e,l,n,I,g,u,C){function B(a,b){var c=a.parentNode;return(c.$$ngAnimateParentKey||(c.$$ngAnimateParentKey=++O))+"-"+a.getAttribute("class")+"-"+b}function Q(r,p,g,n){var k;0<b.count(g)&&(k=c.get(g),k||(p=Y(p,"-stagger"),e.addClass(r,p),k=Ha(a,r,n),k.animationDuration=
Math.max(k.animationDuration,0),k.transitionDuration=Math.max(k.transitionDuration,0),e.removeClass(r,p),c.put(g,k)));return k||{}}function t(a){x.push(a);u.waitUntilQuiet(function(){b.flush();c.flush();for(var a=I(),d=0;d<x.length;d++)x[d](a);x.length=0})}function H(c,e,g){e=b.get(g);e||(e=Ha(a,c,Ua),"infinite"===e.animationIterationCount&&(e.animationIterationCount=1));b.put(g,e);c=e;g=c.animationDelay;e=c.transitionDelay;c.maxDelay=g&&e?Math.max(g,e):g||e;c.maxDuration=Math.max(c.animationDuration*
c.animationIterationCount,c.transitionDuration);return c}var T=Z(e),O=0,x=[];return function(a,c){function d(){k()}function u(){k(!0)}function k(b){if(!(w||F&&O)){w=!0;O=!1;f.$$skipPreparationClasses||e.removeClass(a,ga);e.removeClass(a,ea);va(h,!1);pa(h,!1);s(x,function(a){h.style[a[0]]=""});T(a,f);ha(a,f);Object.keys(A).length&&s(A,function(a,b){a?h.style.setProperty(b,a):h.style.removeProperty(b)});if(f.onDone)f.onDone();fa&&fa.length&&a.off(fa.join(" "),z);var c=a.data("$$animateCss");c&&(n.cancel(c[0].timer),
a.removeData("$$animateCss"));G&&G.complete(!b)}}function M(a){q.blockTransition&&pa(h,a);q.blockKeyframeAnimation&&va(h,!!a)}function L(){G=new l({end:d,cancel:u});t(P);k();return{$$willAnimate:!1,start:function(){return G},end:d}}function z(a){a.stopPropagation();var b=a.originalEvent||a;a=b.$manualTimeStamp||Date.now();b=parseFloat(b.elapsedTime.toFixed(3));Math.max(a-Z,0)>=R&&b>=m&&(F=!0,k())}function N(){function b(){if(!w){M(!1);s(x,function(a){h.style[a[0]]=a[1]});T(a,f);e.addClass(a,ea);if(q.recalculateTimingStyles){na=
h.className+" "+ga;ia=B(h,na);D=H(h,na,ia);ca=D.maxDelay;J=Math.max(ca,0);m=D.maxDuration;if(0===m){k();return}q.hasTransitions=0<D.transitionDuration;q.hasAnimations=0<D.animationDuration}q.applyAnimationDelay&&(ca="boolean"!==typeof f.delay&&wa(f.delay)?parseFloat(f.delay):ca,J=Math.max(ca,0),D.animationDelay=ca,da=[qa,ca+"s"],x.push(da),h.style[da[0]]=da[1]);R=1E3*J;V=1E3*m;if(f.easing){var d,g=f.easing;q.hasTransitions&&(d=S+"TimingFunction",x.push([d,g]),h.style[d]=g);q.hasAnimations&&(d=aa+
"TimingFunction",x.push([d,g]),h.style[d]=g)}D.transitionDuration&&fa.push(ya);D.animationDuration&&fa.push(za);Z=Date.now();var p=R+1.5*V;d=Z+p;var g=a.data("$$animateCss")||[],N=!0;if(g.length){var l=g[0];(N=d>l.expectedEndTime)?n.cancel(l.timer):g.push(k)}N&&(p=n(c,p,!1),g[0]={timer:p,expectedEndTime:d},g.push(k),a.data("$$animateCss",g));if(fa.length)a.on(fa.join(" "),z);f.to&&(f.cleanupStyles&&Ka(A,h,Object.keys(f.to)),Ga(a,f))}}function c(){var b=a.data("$$animateCss");if(b){for(var d=1;d<b.length;d++)b[d]();
a.removeData("$$animateCss")}}if(!w)if(h.parentNode){var d=function(a){if(F)O&&a&&(O=!1,k());else if(O=!a,D.animationDuration)if(a=va(h,O),O)x.push(a);else{var b=x,c=b.indexOf(a);0<=a&&b.splice(c,1)}},g=0<ba&&(D.transitionDuration&&0===W.transitionDuration||D.animationDuration&&0===W.animationDuration)&&Math.max(W.animationDelay,W.transitionDelay);g?n(b,Math.floor(g*ba*1E3),!1):b();v.resume=function(){d(!0)};v.pause=function(){d(!1)}}else k()}var f=c||{};f.$$prepared||(f=oa(Ba(f)));var A={},h=y(a);
if(!h||!h.parentNode||!C.enabled())return L();var x=[],I=a.attr("class"),E=Na(f),w,O,F,G,v,J,R,m,V,Z,fa=[];if(0===f.duration||!g.animations&&!g.transitions)return L();var ja=f.event&&X(f.event)?f.event.join(" "):f.event,$="",U="";ja&&f.structural?$=Y(ja,"ng-",!0):ja&&($=ja);f.addClass&&(U+=Y(f.addClass,"-add"));f.removeClass&&(U.length&&(U+=" "),U+=Y(f.removeClass,"-remove"));f.applyClassesEarly&&U.length&&T(a,f);var ga=[$,U].join(" ").trim(),na=I+" "+ga,ea=Y(ga,"-active"),I=E.to&&0<Object.keys(E.to).length;
if(!(0<(f.keyframeStyle||"").length||I||ga))return L();var ia,W;0<f.stagger?(E=parseFloat(f.stagger),W={transitionDelay:E,animationDelay:E,transitionDuration:0,animationDuration:0}):(ia=B(h,na),W=Q(h,ga,ia,Va));f.$$skipPreparationClasses||e.addClass(a,ga);f.transitionStyle&&(E=[S,f.transitionStyle],la(h,E),x.push(E));0<=f.duration&&(E=0<h.style[S].length,E=Ia(f.duration,E),la(h,E),x.push(E));f.keyframeStyle&&(E=[aa,f.keyframeStyle],la(h,E),x.push(E));var ba=W?0<=f.staggerIndex?f.staggerIndex:b.count(ia):
0;(ja=0===ba)&&!f.skipBlocking&&pa(h,9999);var D=H(h,na,ia),ca=D.maxDelay;J=Math.max(ca,0);m=D.maxDuration;var q={};q.hasTransitions=0<D.transitionDuration;q.hasAnimations=0<D.animationDuration;q.hasTransitionAll=q.hasTransitions&&"all"===D.transitionProperty;q.applyTransitionDuration=I&&(q.hasTransitions&&!q.hasTransitionAll||q.hasAnimations&&!q.hasTransitions);q.applyAnimationDuration=f.duration&&q.hasAnimations;q.applyTransitionDelay=wa(f.delay)&&(q.applyTransitionDuration||q.hasTransitions);q.applyAnimationDelay=
wa(f.delay)&&q.hasAnimations;q.recalculateTimingStyles=0<U.length;if(q.applyTransitionDuration||q.applyAnimationDuration)m=f.duration?parseFloat(f.duration):m,q.applyTransitionDuration&&(q.hasTransitions=!0,D.transitionDuration=m,E=0<h.style[S+"Property"].length,x.push(Ia(m,E))),q.applyAnimationDuration&&(q.hasAnimations=!0,D.animationDuration=m,x.push([Aa,m+"s"]));if(0===m&&!q.recalculateTimingStyles)return L();if(null!=f.delay){var da;"boolean"!==typeof f.delay&&(da=parseFloat(f.delay),J=Math.max(da,
0));q.applyTransitionDelay&&x.push([ma,da+"s"]);q.applyAnimationDelay&&x.push([qa,da+"s"])}null==f.duration&&0<D.transitionDuration&&(q.recalculateTimingStyles=q.recalculateTimingStyles||ja);R=1E3*J;V=1E3*m;f.skipBlocking||(q.blockTransition=0<D.transitionDuration,q.blockKeyframeAnimation=0<D.animationDuration&&0<W.animationDelay&&0===W.animationDuration);f.from&&(f.cleanupStyles&&Ka(A,h,Object.keys(f.from)),Fa(a,f));q.blockTransition||q.blockKeyframeAnimation?M(m):f.skipBlocking||pa(h,!1);return{$$willAnimate:!0,
end:d,start:function(){if(!w)return v={end:d,cancel:u,resume:null,pause:null},G=new l(v),t(N),G}}}}]}]).provider("$$animateCssDriver",["$$animationProvider",function(a){a.drivers.push("$$animateCssDriver");this.$get=["$animateCss","$rootScope","$$AnimateRunner","$rootElement","$sniffer","$$jqLite","$document",function(a,c,d,e,l,n,I){function g(a){return a.replace(/\bng-\S+\b/g,"")}function u(a,b){G(a)&&(a=a.split(" "));G(b)&&(b=b.split(" "));return a.filter(function(a){return-1===b.indexOf(a)}).join(" ")}
function C(c,e,n){function l(a){var b={},c=y(a).getBoundingClientRect();s(["width","height","top","left"],function(a){var d=c[a];switch(a){case "top":d+=t.scrollTop;break;case "left":d+=t.scrollLeft}b[a]=Math.floor(d)+"px"});return b}function p(){var c=g(n.attr("class")||""),d=u(c,k),c=u(k,c),d=a(C,{to:l(n),addClass:"ng-anchor-in "+d,removeClass:"ng-anchor-out "+c,delay:!0});return d.$$willAnimate?d:null}function I(){C.remove();e.removeClass("ng-animate-shim");n.removeClass("ng-animate-shim")}var C=
F(y(e).cloneNode(!0)),k=g(C.attr("class")||"");e.addClass("ng-animate-shim");n.addClass("ng-animate-shim");C.addClass("ng-anchor");H.append(C);var M;c=function(){var c=a(C,{addClass:"ng-anchor-out",delay:!0,from:l(e)});return c.$$willAnimate?c:null}();if(!c&&(M=p(),!M))return I();var L=c||M;return{start:function(){function a(){c&&c.end()}var b,c=L.start();c.done(function(){c=null;if(!M&&(M=p()))return c=M.start(),c.done(function(){c=null;I();b.complete()}),c;I();b.complete()});return b=new d({end:a,
cancel:a})}}}function B(a,b,c,e){var g=Q(a,P),n=Q(b,P),l=[];s(e,function(a){(a=C(c,a.out,a["in"]))&&l.push(a)});if(g||n||0!==l.length)return{start:function(){function a(){s(b,function(a){a.end()})}var b=[];g&&b.push(g.start());n&&b.push(n.start());s(l,function(a){b.push(a.start())});var c=new d({end:a,cancel:a});d.all(b,function(a){c.complete(a)});return c}}}function Q(c){var d=c.element,e=c.options||{};c.structural&&(e.event=c.event,e.structural=!0,e.applyClassesEarly=!0,"leave"===c.event&&(e.onDone=
e.domOperation));e.preparationClasses&&(e.event=$(e.event,e.preparationClasses));c=a(d,e);return c.$$willAnimate?c:null}if(!l.animations&&!l.transitions)return P;var t=I[0].body;c=y(e);var H=F(c.parentNode&&11===c.parentNode.nodeType||t.contains(c)?c:t);return function(a){return a.from&&a.to?B(a.from,a.to,a.classes,a.anchors):Q(a)}}]}]).provider("$$animateJs",["$animateProvider",function(a){this.$get=["$injector","$$AnimateRunner","$$jqLite",function(b,c,d){function e(c){c=X(c)?c:c.split(" ");for(var d=
[],e={},l=0;l<c.length;l++){var s=c[l],B=a.$$registeredAnimations[s];B&&!e[s]&&(d.push(b.get(B)),e[s]=!0)}return d}var l=Z(d);return function(a,b,d,u){function C(){u.domOperation();l(a,u)}function B(a,b,d,e,f){switch(d){case "animate":b=[b,e.from,e.to,f];break;case "setClass":b=[b,F,G,f];break;case "addClass":b=[b,F,f];break;case "removeClass":b=[b,G,f];break;default:b=[b,f]}b.push(e);if(a=a.apply(a,b))if(Ca(a.start)&&(a=a.start()),a instanceof c)a.done(f);else if(Ca(a))return a;return P}function y(a,
b,d,e,f){var g=[];s(e,function(e){var k=e[f];k&&g.push(function(){var e,f,g=!1,h=function(a){g||(g=!0,(f||P)(a),e.complete(!a))};e=new c({end:function(){h()},cancel:function(){h(!0)}});f=B(k,a,b,d,function(a){h(!1===a)});return e})});return g}function t(a,b,d,e,f){var g=y(a,b,d,e,f);if(0===g.length){var h,k;"beforeSetClass"===f?(h=y(a,"removeClass",d,e,"beforeRemoveClass"),k=y(a,"addClass",d,e,"beforeAddClass")):"setClass"===f&&(h=y(a,"removeClass",d,e,"removeClass"),k=y(a,"addClass",d,e,"addClass"));
h&&(g=g.concat(h));k&&(g=g.concat(k))}if(0!==g.length)return function(a){var b=[];g.length&&s(g,function(a){b.push(a())});b.length?c.all(b,a):a();return function(a){s(b,function(b){a?b.cancel():b.end()})}}}var H=!1;3===arguments.length&&ba(d)&&(u=d,d=null);u=oa(u);d||(d=a.attr("class")||"",u.addClass&&(d+=" "+u.addClass),u.removeClass&&(d+=" "+u.removeClass));var F=u.addClass,G=u.removeClass,x=e(d),r,p;if(x.length){var K,J;"leave"===b?(J="leave",K="afterLeave"):(J="before"+b.charAt(0).toUpperCase()+
b.substr(1),K=b);"enter"!==b&&"move"!==b&&(r=t(a,b,u,x,J));p=t(a,b,u,x,K)}if(r||p){var k;return{$$willAnimate:!0,end:function(){k?k.end():(H=!0,C(),ha(a,u),k=new c,k.complete(!0));return k},start:function(){function b(c){H=!0;C();ha(a,u);k.complete(c)}if(k)return k;k=new c;var d,e=[];r&&e.push(function(a){d=r(a)});e.length?e.push(function(a){C();a(!0)}):C();p&&e.push(function(a){d=p(a)});k.setHost({end:function(){H||((d||P)(void 0),b(void 0))},cancel:function(){H||((d||P)(!0),b(!0))}});c.chain(e,
b);return k}}}}}]}]).provider("$$animateJsDriver",["$$animationProvider",function(a){a.drivers.push("$$animateJsDriver");this.$get=["$$animateJs","$$AnimateRunner",function(a,c){function d(c){return a(c.element,c.event,c.classes,c.options)}return function(a){if(a.from&&a.to){var b=d(a.from),n=d(a.to);if(b||n)return{start:function(){function a(){return function(){s(d,function(a){a.end()})}}var d=[];b&&d.push(b.start());n&&d.push(n.start());c.all(d,function(a){e.complete(a)});var e=new c({end:a(),cancel:a()});
return e}}}else return d(a)}}]}])})(window,window.angular);
/*! RESOURCE: /scripts/angular_1.5.11/angular-resource.min.js */
/*
 AngularJS v1.5.11
 (c) 2010-2017 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(R,b){'use strict';function G(s,g){g=g||{};b.forEach(g,function(b,k){delete g[k]});for(var k in s)!s.hasOwnProperty(k)||"$"===k.charAt(0)&&"$"===k.charAt(1)||(g[k]=s[k]);return g}var y=b.$$minErr("$resource"),N=/^(\.[a-zA-Z_$@][0-9a-zA-Z_$@]*)+$/;b.module("ngResource",["ng"]).provider("$resource",function(){var s=/^https?:\/\/[^/]*/,g=this;this.defaults={stripTrailingSlashes:!0,cancellable:!1,actions:{get:{method:"GET"},save:{method:"POST"},query:{method:"GET",isArray:!0},remove:{method:"DELETE"},
"delete":{method:"DELETE"}}};this.$get=["$http","$log","$q","$timeout",function(k,M,H,I){function z(b,e){return encodeURIComponent(b).replace(/%40/gi,"@").replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%20/g,e?"%20":"+")}function B(b,e){this.template=b;this.defaults=r({},g.defaults,e);this.urlParams={}}function J(A,e,p,m){function c(a,d){var c={};d=r({},e,d);u(d,function(d,e){w(d)&&(d=d(a));var f;if(d&&d.charAt&&"@"===d.charAt(0)){f=a;var l=d.substr(1);if(null==l||""===l||
"hasOwnProperty"===l||!N.test("."+l))throw y("badmember",l);for(var l=l.split("."),h=0,g=l.length;h<g&&b.isDefined(f);h++){var q=l[h];f=null!==f?f[q]:void 0}}else f=d;c[e]=f});return c}function O(a){return a.resource}function h(a){G(a||{},this)}var s=new B(A,m);p=r({},g.defaults.actions,p);h.prototype.toJSON=function(){var a=r({},this);delete a.$promise;delete a.$resolved;delete a.$cancelRequest;return a};u(p,function(a,d){var b=/^(POST|PUT|PATCH)$/i.test(a.method),e=a.timeout,g=K(a.cancellable)?
a.cancellable:s.defaults.cancellable;e&&!P(e)&&(M.debug("ngResource:\n  Only numeric values are allowed as `timeout`.\n  Promises are not supported in $resource, because the same value would be used for multiple requests. If you are looking for a way to cancel requests, you should use the `cancellable` option."),delete a.timeout,e=null);h[d]=function(f,l,m,A){var q={},p,v,C;switch(arguments.length){case 4:C=A,v=m;case 3:case 2:if(w(l)){if(w(f)){v=f;C=l;break}v=l;C=m}else{q=f;p=l;v=m;break}case 1:w(f)?
v=f:b?p=f:q=f;break;case 0:break;default:throw y("badargs",arguments.length);}var D=this instanceof h,n=D?p:a.isArray?[]:new h(p),t={},z=a.interceptor&&a.interceptor.response||O,B=a.interceptor&&a.interceptor.responseError||void 0,x,E;u(a,function(a,d){switch(d){default:t[d]=Q(a);case "params":case "isArray":case "interceptor":case "cancellable":}});!D&&g&&(x=H.defer(),t.timeout=x.promise,e&&(E=I(x.resolve,e)));b&&(t.data=p);s.setUrlParams(t,r({},c(p,a.params||{}),q),a.url);q=k(t).then(function(f){var c=
f.data;if(c){if(L(c)!==!!a.isArray)throw y("badcfg",d,a.isArray?"array":"object",L(c)?"array":"object",t.method,t.url);if(a.isArray)n.length=0,u(c,function(a){"object"===typeof a?n.push(new h(a)):n.push(a)});else{var b=n.$promise;G(c,n);n.$promise=b}}f.resource=n;return f},function(a){(C||F)(a);return H.reject(a)});q["finally"](function(){n.$resolved=!0;!D&&g&&(n.$cancelRequest=F,I.cancel(E),x=E=t.timeout=null)});q=q.then(function(a){var d=z(a);(v||F)(d,a.headers,a.status,a.statusText);return d},
B);return D?q:(n.$promise=q,n.$resolved=!1,g&&(n.$cancelRequest=x.resolve),n)};h.prototype["$"+d]=function(a,c,b){w(a)&&(b=c,c=a,a={});a=h[d].call(this,a,this,c,b);return a.$promise||a}});h.bind=function(a){a=r({},e,a);return J(A,a,p,m)};return h}var F=b.noop,u=b.forEach,r=b.extend,Q=b.copy,L=b.isArray,K=b.isDefined,w=b.isFunction,P=b.isNumber;B.prototype={setUrlParams:function(b,e,g){var m=this,c=g||m.template,k,h,r="",a=m.urlParams={};u(c.split(/\W/),function(d){if("hasOwnProperty"===d)throw y("badname");
!/^\d+$/.test(d)&&d&&(new RegExp("(^|[^\\\\]):"+d+"(\\W|$)")).test(c)&&(a[d]={isQueryParamValue:(new RegExp("\\?.*=:"+d+"(?:\\W|$)")).test(c)})});c=c.replace(/\\:/g,":");c=c.replace(s,function(a){r=a;return""});e=e||{};u(m.urlParams,function(a,b){k=e.hasOwnProperty(b)?e[b]:m.defaults[b];K(k)&&null!==k?(h=a.isQueryParamValue?z(k,!0):z(k,!0).replace(/%26/gi,"&").replace(/%3D/gi,"=").replace(/%2B/gi,"+"),c=c.replace(new RegExp(":"+b+"(\\W|$)","g"),function(a,b){return h+b})):c=c.replace(new RegExp("(/?):"+
b+"(\\W|$)","g"),function(a,b,d){return"/"===d.charAt(0)?d:b+d})});m.defaults.stripTrailingSlashes&&(c=c.replace(/\/+$/,"")||"/");c=c.replace(/\/\.(?=\w+($|\?))/,".");b.url=r+c.replace(/\/\\\./,"/.");u(e,function(a,c){m.urlParams[c]||(b.params=b.params||{},b.params[c]=a)})}};return J}]})})(window,window.angular);
/*! RESOURCE: /scripts/angular_1.5.11/angular-route.min.js */
/*
 AngularJS v1.5.11
 (c) 2010-2017 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(E,d){'use strict';function y(t,l,g){return{restrict:"ECA",terminal:!0,priority:400,transclude:"element",link:function(b,e,a,c,k){function p(){m&&(g.cancel(m),m=null);h&&(h.$destroy(),h=null);n&&(m=g.leave(n),m.done(function(b){!1!==b&&(m=null)}),n=null)}function B(){var a=t.current&&t.current.locals;if(d.isDefined(a&&a.$template)){var a=b.$new(),c=t.current;n=k(a,function(a){g.enter(a,null,n||e).done(function(a){!1===a||!d.isDefined(A)||A&&!b.$eval(A)||l()});p()});h=c.scope=a;h.$emit("$viewContentLoaded");
h.$eval(s)}else p()}var h,n,m,A=a.autoscroll,s=a.onload||"";b.$on("$routeChangeSuccess",B);B()}}}function w(d,l,g){return{restrict:"ECA",priority:-400,link:function(b,e){var a=g.current,c=a.locals;e.html(c.$template);var k=d(e.contents());if(a.controller){c.$scope=b;var p=l(a.controller,c);a.controllerAs&&(b[a.controllerAs]=p);e.data("$ngControllerController",p);e.children().data("$ngControllerController",p)}b[a.resolveAs||"$resolve"]=c;k(b)}}}var x,C,s=d.module("ngRoute",["ng"]).provider("$route",
function(){function t(b,e){return d.extend(Object.create(b),e)}function l(b,d){var a=d.caseInsensitiveMatch,c={originalPath:b,regexp:b},g=c.keys=[];b=b.replace(/([().])/g,"\\$1").replace(/(\/)?:(\w+)(\*\?|[?*])?/g,function(b,a,d,c){b="?"===c||"*?"===c?"?":null;c="*"===c||"*?"===c?"*":null;g.push({name:d,optional:!!b});a=a||"";return""+(b?"":a)+"(?:"+(b?a:"")+(c&&"(.+?)"||"([^/]+)")+(b||"")+")"+(b||"")}).replace(/([/$*])/g,"\\$1");c.regexp=new RegExp("^"+b+"$",a?"i":"");return c}x=d.isArray;C=d.isObject;
var g={};this.when=function(b,e){var a;a=void 0;if(x(e)){a=a||[];for(var c=0,k=e.length;c<k;c++)a[c]=e[c]}else if(C(e))for(c in a=a||{},e)if("$"!==c.charAt(0)||"$"!==c.charAt(1))a[c]=e[c];a=a||e;d.isUndefined(a.reloadOnSearch)&&(a.reloadOnSearch=!0);d.isUndefined(a.caseInsensitiveMatch)&&(a.caseInsensitiveMatch=this.caseInsensitiveMatch);g[b]=d.extend(a,b&&l(b,a));b&&(c="/"===b[b.length-1]?b.substr(0,b.length-1):b+"/",g[c]=d.extend({redirectTo:b},l(c,a)));return this};this.caseInsensitiveMatch=!1;
this.otherwise=function(b){"string"===typeof b&&(b={redirectTo:b});this.when(null,b);return this};this.$get=["$rootScope","$location","$routeParams","$q","$injector","$templateRequest","$sce",function(b,e,a,c,k,p,l){function h(a){var f=v.current;(x=(r=y())&&f&&r.$$route===f.$$route&&d.equals(r.pathParams,f.pathParams)&&!r.reloadOnSearch&&!z)||!f&&!r||b.$broadcast("$routeChangeStart",r,f).defaultPrevented&&a&&a.preventDefault()}function n(){var u=v.current,f=r;if(x)u.params=f.params,d.copy(u.params,
a),b.$broadcast("$routeUpdate",u);else if(f||u)z=!1,(v.current=f)&&f.redirectTo&&(d.isString(f.redirectTo)?e.path(w(f.redirectTo,f.params)).search(f.params).replace():e.url(f.redirectTo(f.pathParams,e.path(),e.search())).replace()),c.when(f).then(m).then(function(c){f===v.current&&(f&&(f.locals=c,d.copy(f.params,a)),b.$broadcast("$routeChangeSuccess",f,u))},function(a){f===v.current&&b.$broadcast("$routeChangeError",f,u,a)})}function m(a){if(a){var b=d.extend({},a.resolve);d.forEach(b,function(a,
c){b[c]=d.isString(a)?k.get(a):k.invoke(a,null,null,c)});a=s(a);d.isDefined(a)&&(b.$template=a);return c.all(b)}}function s(a){var b,c;d.isDefined(b=a.template)?d.isFunction(b)&&(b=b(a.params)):d.isDefined(c=a.templateUrl)&&(d.isFunction(c)&&(c=c(a.params)),d.isDefined(c)&&(a.loadedTemplateUrl=l.valueOf(c),b=p(c)));return b}function y(){var a,b;d.forEach(g,function(c,g){var q;if(q=!b){var h=e.path();q=c.keys;var l={};if(c.regexp)if(h=c.regexp.exec(h)){for(var k=1,p=h.length;k<p;++k){var m=q[k-1],
n=h[k];m&&n&&(l[m.name]=n)}q=l}else q=null;else q=null;q=a=q}q&&(b=t(c,{params:d.extend({},e.search(),a),pathParams:a}),b.$$route=c)});return b||g[null]&&t(g[null],{params:{},pathParams:{}})}function w(a,b){var c=[];d.forEach((a||"").split(":"),function(a,d){if(0===d)c.push(a);else{var e=a.match(/(\w+)(?:[?*])?(.*)/),g=e[1];c.push(b[g]);c.push(e[2]||"");delete b[g]}});return c.join("")}var z=!1,r,x,v={routes:g,reload:function(){z=!0;var a={defaultPrevented:!1,preventDefault:function(){this.defaultPrevented=
!0;z=!1}};b.$evalAsync(function(){h(a);a.defaultPrevented||n()})},updateParams:function(a){if(this.current&&this.current.$$route)a=d.extend({},this.current.params,a),e.path(w(this.current.$$route.originalPath,a)),e.search(a);else throw D("norout");}};b.$on("$locationChangeStart",h);b.$on("$locationChangeSuccess",n);return v}]}),D=d.$$minErr("ngRoute");s.provider("$routeParams",function(){this.$get=function(){return{}}});s.directive("ngView",y);s.directive("ngView",w);y.$inject=["$route","$anchorScroll",
"$animate"];w.$inject=["$compile","$controller","$route"]})(window,window.angular);
/*! RESOURCE: /scripts/angular_1.5.11/angular-touch.min.js */
/*
 AngularJS v1.5.11
 (c) 2010-2017 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(x,n){'use strict';function s(f,k){var e=!1,a=!1;this.ngClickOverrideEnabled=function(b){return n.isDefined(b)?(b&&!a&&(a=!0,t.$$moduleName="ngTouch",k.directive("ngClick",t),f.decorator("ngClickDirective",["$delegate",function(a){if(e)a.shift();else for(var b=a.length-1;0<=b;){if("ngTouch"===a[b].$$moduleName){a.splice(b,1);break}b--}return a}])),e=b,this):e};this.$get=function(){return{ngClickOverrideEnabled:function(){return e}}}}function v(f,k,e){p.directive(f,["$parse","$swipe",function(a,
b){return function(l,u,g){function h(c){if(!d)return!1;var a=Math.abs(c.y-d.y);c=(c.x-d.x)*k;return r&&75>a&&0<c&&30<c&&.3>a/c}var m=a(g[f]),d,r,c=["touch"];n.isDefined(g.ngSwipeDisableMouse)||c.push("mouse");b.bind(u,{start:function(c,a){d=c;r=!0},cancel:function(c){r=!1},end:function(c,d){h(c)&&l.$apply(function(){u.triggerHandler(e);m(l,{$event:d})})}},c)}}])}var p=n.module("ngTouch",[]);p.provider("$touch",s);s.$inject=["$provide","$compileProvider"];p.factory("$swipe",[function(){function f(a){a=
a.originalEvent||a;var b=a.touches&&a.touches.length?a.touches:[a];a=a.changedTouches&&a.changedTouches[0]||b[0];return{x:a.clientX,y:a.clientY}}function k(a,b){var l=[];n.forEach(a,function(a){(a=e[a][b])&&l.push(a)});return l.join(" ")}var e={mouse:{start:"mousedown",move:"mousemove",end:"mouseup"},touch:{start:"touchstart",move:"touchmove",end:"touchend",cancel:"touchcancel"},pointer:{start:"pointerdown",move:"pointermove",end:"pointerup",cancel:"pointercancel"}};return{bind:function(a,b,l){var e,
g,h,m,d=!1;l=l||["mouse","touch","pointer"];a.on(k(l,"start"),function(c){h=f(c);d=!0;g=e=0;m=h;b.start&&b.start(h,c)});var r=k(l,"cancel");if(r)a.on(r,function(c){d=!1;b.cancel&&b.cancel(c)});a.on(k(l,"move"),function(c){if(d&&h){var a=f(c);e+=Math.abs(a.x-m.x);g+=Math.abs(a.y-m.y);m=a;10>e&&10>g||(g>e?(d=!1,b.cancel&&b.cancel(c)):(c.preventDefault(),b.move&&b.move(a,c)))}});a.on(k(l,"end"),function(c){d&&(d=!1,b.end&&b.end(f(c),c))})}}}]);var t=["$parse","$timeout","$rootElement",function(f,k,e){function a(a,
d,b){for(var c=0;c<a.length;c+=2){var g=a[c+1],e=b;if(25>Math.abs(a[c]-d)&&25>Math.abs(g-e))return a.splice(c,c+2),!0}return!1}function b(b){if(!(2500<Date.now()-u)){var d=b.touches&&b.touches.length?b.touches:[b],e=d[0].clientX,d=d[0].clientY;if(!(1>e&&1>d||h&&h[0]===e&&h[1]===d)){h&&(h=null);var c=b.target;"label"===n.lowercase(c.nodeName||c[0]&&c[0].nodeName)&&(h=[e,d]);a(g,e,d)||(b.stopPropagation(),b.preventDefault(),b.target&&b.target.blur&&b.target.blur())}}}function l(a){a=a.touches&&a.touches.length?
a.touches:[a];var b=a[0].clientX,e=a[0].clientY;g.push(b,e);k(function(){for(var a=0;a<g.length;a+=2)if(g[a]===b&&g[a+1]===e){g.splice(a,a+2);break}},2500,!1)}var u,g,h;return function(h,d,k){var c=f(k.ngClick),w=!1,q,p,s,t;d.on("touchstart",function(a){w=!0;q=a.target?a.target:a.srcElement;3===q.nodeType&&(q=q.parentNode);d.addClass("ng-click-active");p=Date.now();a=a.originalEvent||a;a=(a.touches&&a.touches.length?a.touches:[a])[0];s=a.clientX;t=a.clientY});d.on("touchcancel",function(a){w=!1;d.removeClass("ng-click-active")});
d.on("touchend",function(c){var h=Date.now()-p,f=c.originalEvent||c,m=(f.changedTouches&&f.changedTouches.length?f.changedTouches:f.touches&&f.touches.length?f.touches:[f])[0],f=m.clientX,m=m.clientY,v=Math.sqrt(Math.pow(f-s,2)+Math.pow(m-t,2));w&&750>h&&12>v&&(g||(e[0].addEventListener("click",b,!0),e[0].addEventListener("touchstart",l,!0),g=[]),u=Date.now(),a(g,f,m),q&&q.blur(),n.isDefined(k.disabled)&&!1!==k.disabled||d.triggerHandler("click",[c]));w=!1;d.removeClass("ng-click-active")});d.onclick=
function(a){};d.on("click",function(a,b){h.$apply(function(){c(h,{$event:b||a})})});d.on("mousedown",function(a){d.addClass("ng-click-active")});d.on("mousemove mouseup",function(a){d.removeClass("ng-click-active")})}}];v("ngSwipeLeft",-1,"swipeleft");v("ngSwipeRight",1,"swiperight")})(window,window.angular);
/*! RESOURCE: /scripts/angular_1.5.11/angular-cookies.min.js */
/*
 AngularJS v1.5.11
 (c) 2010-2017 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(n,c){'use strict';function l(b,a,g){var d=g.baseHref(),k=b[0];return function(b,e,f){var g,h;f=f||{};h=f.expires;g=c.isDefined(f.path)?f.path:d;c.isUndefined(e)&&(h="Thu, 01 Jan 1970 00:00:00 GMT",e="");c.isString(h)&&(h=new Date(h));e=encodeURIComponent(b)+"="+encodeURIComponent(e);e=e+(g?";path="+g:"")+(f.domain?";domain="+f.domain:"");e+=h?";expires="+h.toUTCString():"";e+=f.secure?";secure":"";f=e.length+1;4096<f&&a.warn("Cookie '"+b+"' possibly not set or overflowed because it was too large ("+
f+" > 4096 bytes)!");k.cookie=e}}c.module("ngCookies",["ng"]).provider("$cookies",[function(){var b=this.defaults={};this.$get=["$$cookieReader","$$cookieWriter",function(a,g){return{get:function(d){return a()[d]},getObject:function(d){return(d=this.get(d))?c.fromJson(d):d},getAll:function(){return a()},put:function(d,a,m){g(d,a,m?c.extend({},b,m):b)},putObject:function(d,b,a){this.put(d,c.toJson(b),a)},remove:function(a,k){g(a,void 0,k?c.extend({},b,k):b)}}}]}]);c.module("ngCookies").factory("$cookieStore",
["$cookies",function(b){return{get:function(a){return b.getObject(a)},put:function(a,c){b.putObject(a,c)},remove:function(a){b.remove(a)}}}]);l.$inject=["$document","$log","$browser"];c.module("ngCookies").provider("$$cookieWriter",function(){this.$get=l})})(window,window.angular);
/*! RESOURCE: /scripts/angular_1.5.11/angular-aria.min.js */
/*
 AngularJS v1.5.11
 (c) 2010-2017 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(t,p){'use strict';var b="BUTTON A INPUT TEXTAREA SELECT DETAILS SUMMARY".split(" "),l=function(a,c){if(-1!==c.indexOf(a[0].nodeName))return!0};p.module("ngAria",["ng"]).provider("$aria",function(){function a(a,b,m,h){return function(d,f,e){var q=e.$normalize(b);!c[q]||l(f,m)||e[q]||d.$watch(e[a],function(a){a=h?!a:!!a;f.attr(b,a)})}}var c={ariaHidden:!0,ariaChecked:!0,ariaReadonly:!0,ariaDisabled:!0,ariaRequired:!0,ariaInvalid:!0,ariaValue:!0,tabindex:!0,bindKeypress:!0,bindRoleForClick:!0};
this.config=function(a){c=p.extend(c,a)};this.$get=function(){return{config:function(a){return c[a]},$$watchExpr:a}}}).directive("ngShow",["$aria",function(a){return a.$$watchExpr("ngShow","aria-hidden",[],!0)}]).directive("ngHide",["$aria",function(a){return a.$$watchExpr("ngHide","aria-hidden",[],!1)}]).directive("ngValue",["$aria",function(a){return a.$$watchExpr("ngValue","aria-checked",b,!1)}]).directive("ngChecked",["$aria",function(a){return a.$$watchExpr("ngChecked","aria-checked",b,!1)}]).directive("ngReadonly",
["$aria",function(a){return a.$$watchExpr("ngReadonly","aria-readonly",b,!1)}]).directive("ngRequired",["$aria",function(a){return a.$$watchExpr("ngRequired","aria-required",b,!1)}]).directive("ngModel",["$aria",function(a){function c(c,h,d,f){return a.config(h)&&!d.attr(c)&&(f||!l(d,b))}function g(a,c){return!c.attr("role")&&c.attr("type")===a&&"INPUT"!==c[0].nodeName}function k(a,c){var d=a.type,f=a.role;return"checkbox"===(d||f)||"menuitemcheckbox"===f?"checkbox":"radio"===(d||f)||"menuitemradio"===
f?"radio":"range"===d||"progressbar"===f||"slider"===f?"range":""}return{restrict:"A",require:"ngModel",priority:200,compile:function(b,h){var d=k(h,b);return{pre:function(a,e,c,b){"checkbox"===d&&(b.$isEmpty=function(a){return!1===a})},post:function(f,e,b,n){function h(){return n.$modelValue}function k(a){e.attr("aria-checked",b.value==n.$viewValue)}function l(){e.attr("aria-checked",!n.$isEmpty(n.$viewValue))}var m=c("tabindex","tabindex",e,!1);switch(d){case "radio":case "checkbox":g(d,e)&&e.attr("role",
d);c("aria-checked","ariaChecked",e,!1)&&f.$watch(h,"radio"===d?k:l);m&&e.attr("tabindex",0);break;case "range":g(d,e)&&e.attr("role","slider");if(a.config("ariaValue")){var p=!e.attr("aria-valuemin")&&(b.hasOwnProperty("min")||b.hasOwnProperty("ngMin")),r=!e.attr("aria-valuemax")&&(b.hasOwnProperty("max")||b.hasOwnProperty("ngMax")),s=!e.attr("aria-valuenow");p&&b.$observe("min",function(a){e.attr("aria-valuemin",a)});r&&b.$observe("max",function(a){e.attr("aria-valuemax",a)});s&&f.$watch(h,function(a){e.attr("aria-valuenow",
a)})}m&&e.attr("tabindex",0)}!b.hasOwnProperty("ngRequired")&&n.$validators.required&&c("aria-required","ariaRequired",e,!1)&&b.$observe("required",function(){e.attr("aria-required",!!b.required)});c("aria-invalid","ariaInvalid",e,!0)&&f.$watch(function(){return n.$invalid},function(a){e.attr("aria-invalid",!!a)})}}}}}]).directive("ngDisabled",["$aria",function(a){return a.$$watchExpr("ngDisabled","aria-disabled",b,!1)}]).directive("ngMessages",function(){return{restrict:"A",require:"?ngMessages",
link:function(a,b,g,k){b.attr("aria-live")||b.attr("aria-live","assertive")}}}).directive("ngClick",["$aria","$parse",function(a,c){return{restrict:"A",compile:function(g,k){var m=c(k.ngClick,null,!0);return function(c,d,f){if(!l(d,b)&&(a.config("bindRoleForClick")&&!d.attr("role")&&d.attr("role","button"),a.config("tabindex")&&!d.attr("tabindex")&&d.attr("tabindex",0),a.config("bindKeypress")&&!f.ngKeypress))d.on("keypress",function(a){function b(){m(c,{$event:a})}var d=a.which||a.keyCode;32!==d&&
13!==d||c.$apply(b)})}}}}]).directive("ngDblclick",["$aria",function(a){return function(c,g,k){!a.config("tabindex")||g.attr("tabindex")||l(g,b)||g.attr("tabindex",0)}}])})(window,window.angular);
/*! RESOURCE: /scripts/app/base/_module.js */
angular.module('sn.base', ['sn.common.auth']);
window.countWatchers = window.countWatchers || function (root) {
var watchers = [];
var f = function (element) {
angular.forEach(['$scope', '$isolateScope'], function (scopeProperty) {
if (element.data() && element.data().hasOwnProperty(scopeProperty)) {
angular.forEach(element.data()[scopeProperty].$$watchers, function (watcher) {
watchers.push(watcher);
});
}
});
angular.forEach(element.children(), function (childElement) {
f(angular.element(childElement));
});
};
f(root);
var watchersWithoutDuplicates = [];
angular.forEach(watchers, function(item) {
if(watchersWithoutDuplicates.indexOf(item) < 0) {
watchersWithoutDuplicates.push(item);
}
});
console.log(watchersWithoutDuplicates.length);
};
;
/*! RESOURCE: /scripts/sn/common/auth/_module.js */
angular.module('sn.common.auth', []);
angular.module('sn.auth', ['sn.common.auth']);
;
/*! RESOURCE: /scripts/sn/common/auth/service.authInterceptor.js */
angular.module('sn.common.auth').config(function($httpProvider) {
$httpProvider.interceptors.push(function($rootScope, $q, $injector, $window, $log) {
var LOG_PREFIX = '(authIntercepter) ';
function error(response) {
var status = response.status;
if (status == 401) {
var newPromise = handle401(response);
if (newPromise)
return newPromise;
}
return $q.reject(response);
}
function handle401(response) {
if (canResendRequest(response)) {
var deferredAgain = $q.defer();
var $http = $injector.get('$http');
$http(response.config).then(function success(newResponse) {
deferredAgain.resolve(newResponse);
}, function error(newResponse) {
deferredAgain.reject(newResponse);
});
return deferredAgain.promise;
}
$log.info(LOG_PREFIX + 'User has been logged out');
$rootScope.$broadcast("@page.login");
return null;
}
function canResendRequest(response) {
var headers = response.headers();
var requestToken = response.config.headers['X-UserToken'];
if (!requestToken) {
requestToken = headers['x-usertoken-request'];
}
if ($window.g_ck && (requestToken !== $window.g_ck)) {
$log.info(LOG_PREFIX + 'Token refreshed since request -- retrying');
response.config.headers['X-UserToken'] = $window.g_ck;
return true;
}
if (headers['x-sessionloggedin'] != 'true')
return false;
if (headers['x-usertoken-allowresubmit'] == 'false')
return false;
var token = headers['x-usertoken-response'];
if (token) {
$log.info(LOG_PREFIX +  'Received new token -- retrying');
response.config.headers['X-UserToken'] = token;
setToken(token);
return true;
}
return false;
}
function setToken(token) {
$window.g_ck = token;
if (!token) {
$httpProvider.defaults.headers.common["X-UserToken"] = 'token_intentionally_left_blank';
} else {
$httpProvider.defaults.headers.common["X-UserToken"] = token;
}
if ($window.jQuery) {
jQuery.ajaxSetup({
headers: {
'X-UserToken': token
}
});
}
if ($window.Zepto) {
if (!Zepto.ajaxSettings.headers)
Zepto.ajaxSettings.headers = {};
Zepto.ajaxSettings.headers['X-UserToken'] = token;
}
}
setToken($window.g_ck);
return {
responseError: error
}
});
});
;
;
/*! RESOURCE: /scripts/app.ng.amb/app.ng.amb.js */
angular.module("ng.amb", ['sn.common.presence', 'sn.common.util'])
.value("ambLogLevel", 'info')
.value("ambServletURI", '/amb')
.value("cometd", angular.element.cometd)
.value("ambLoginWindow", 'true');
;
/*! RESOURCE: /scripts/app.ng.amb/service.AMB.js */
angular.module("ng.amb").service("amb", function (AMBOverlay, $window, $q, $log, $rootScope, $timeout) {
"use strict";
var ambClient = null;
var _window = $window.self;
var loginWindow = null;
var sameScope = false;
ambClient = amb.getClient();
if (_window.g_ambClient) {
sameScope = true;
}
if (sameScope) {
var serverConnection = ambClient.getServerConnection();
serverConnection.loginShow = function() {
if (!serverConnection.isLoginWindowEnabled())
return;
if (loginWindow && loginWindow.isVisible())
return;
if (serverConnection.isLoginWindowOverride())
return;
loginWindow = new AMBOverlay();
loginWindow.render();
loginWindow.show();
};
serverConnection.loginHide = function() {
if (!loginWindow)
return;
loginWindow.hide();
loginWindow.destroy();
loginWindow = null;
}
}
var AUTO_CONNECT_TIMEOUT = 20 * 1000;
var connected = $q.defer();
var connectionInterrupted = false;
var monitorAMB = false;
$timeout(startMonitoringAMB, AUTO_CONNECT_TIMEOUT);
connected.promise.then(startMonitoringAMB);
function startMonitoringAMB() {
monitorAMB = true;
}
function ambInterrupted() {
var state = ambClient.getState();
return monitorAMB && state !== "opened" && state !== "initialized"
}
var interruptionTimeout;
var extendedInterruption = false;
function setInterrupted(eventName) {
connectionInterrupted = true;
$rootScope.$broadcast(eventName);
if (!interruptionTimeout) {
interruptionTimeout = $timeout(function () {
extendedInterruption = true;
}, 30 * 1000)
}
connected = $q.defer();
}
var connectOpenedEventId = ambClient.subscribeToEvent("connection.opened", function () {
$rootScope.$broadcast("amb.connection.opened");
if (interruptionTimeout) {
$timeout.cancel(interruptionTimeout);
interruptionTimeout = null;
}
extendedInterruption = false;
if(connectionInterrupted) {
connectionInterrupted = false;
$rootScope.$broadcast("amb.connection.recovered");
}
connected.resolve();
});
var connectClosedEventId = ambClient.subscribeToEvent("connection.closed", function () {
setInterrupted("amb.connection.closed");
});
var connectBrokenEventId = ambClient.subscribeToEvent("connection.broken", function () {
setInterrupted("amb.connection.broken");
});
var onUnloadWindow = function() {
ambClient.unsubscribeFromEvent(connectOpenedEventId);
ambClient.unsubscribeFromEvent(connectClosedEventId);
ambClient.unsubscribeFromEvent(connectBrokenEventId);
angular.element($window).off('unload', onUnloadWindow);
};
angular.element($window).on('unload', onUnloadWindow);
var documentReadyState = $window.document ? $window.document.readyState : null;
if(documentReadyState === 'complete') {
autoConnect();
} else {
angular.element($window).on('load', autoConnect);
}
$timeout(autoConnect, 10000);
var initiatedConnection = false;
function autoConnect() {
if (!initiatedConnection) {
initiatedConnection = true;
ambClient.connect();
}
}
return {
getServerConnection: function() {
return ambClient.getServerConnection();
},
connect: function() {
if (initiatedConnection) {
ambClient.connect();
}
return connected.promise;
},
get interrupted() {
return ambInterrupted();
},
get extendedInterruption() {
return extendedInterruption;
},
get connected() {
return connected.promise;
},
abort: function() {
ambClient.abort();
},
disconnect: function() {
ambClient.disconnect();
},
getConnectionState: function () {
return ambClient.getConnectionState();
},
getClientId: function () {
return ambClient.getClientId();
},
getChannel: function(channelName) {
return ambClient.getChannel(channelName);
},
registerExtension: function(extensionName, extension) {
ambClient.registerExtension(extensionName, extension);
},
unregisterExtension: function(extensionName) {
ambClient.unregisterExtension(extensionName);
},
batch: function(batch) {
ambClient.batch(batch);
},
getState: function() {
return ambClient.getState();
},
getFilterString: function(filter) {
filter = filter.
replace(/\^EQ/g, '').
replace(/\^ORDERBY(?:DESC)?[^^]*/g, '').
replace(/^GOTO/, '');
return btoa(filter).replace(/=/g, '-');
},
getChannelRW: function(table, filter) {
var t = '/rw/default/' + table + '/' + this.getFilterString(filter);
return this.getChannel(t);
},
isLoggedIn: function() {
return ambClient.isLoggedIn();
},
subscribeToEvent: function(event, callback) {
return ambClient.subscribeToEvent(event, callback);
},
getConnectionEvents: function() {
return ambClient.getConnectionEvents();
},
getEvents: function() {
return ambClient.getConnectionEvents();
},
loginComplete: function() {
ambClient.loginComplete();
}
};
});
;
/*! RESOURCE: /scripts/app.ng.amb/controller.AMBRecordWatcher.js */
angular.module("ng.amb").controller("AMBRecordWatcher", function($scope, $timeout, $window) {
"use strict";
var amb = $window.top.g_ambClient;
$scope.messages = [];
var lastFilter;
var watcherChannel;
var watcher;
function onMessage(message) {
$scope.messages.push(message.data);
}
$scope.getState = function() {
return amb.getState();
};
$scope.initWatcher = function() {
angular.element(":focus").blur();
if(!$scope.filter || $scope.filter === lastFilter)
return;
lastFilter = $scope.filter;
console.log("initiating watcher on " + $scope.filter);
$scope.messages = [];
if(watcher) {
watcher.unsubscribe();
}
var base64EncodeQuery = btoa($scope.filter).replace(/=/g, '-');
var channelId = '/rw/' + base64EncodeQuery;
watcherChannel = amb.getChannel(channelId)
watcher = watcherChannel.subscribe(onMessage);
};
amb.connect();
})
;
/*! RESOURCE: /scripts/app.ng.amb/factory.snRecordWatcher.js */
angular.module("ng.amb").factory('snRecordWatcher', function($rootScope, amb, $timeout, snPresence, $log, urlTools) {
"use strict";
var watcherChannel;
var connected = false;
var diagnosticLog = true;
function initWatcher(table, sys_id, query) {
if (!table)
return;
if (sys_id)
var filter = "sys_id=" + sys_id;
else
filter = query;
if (!filter)
return;
return initChannel(table, filter);
}
function initList(table, query) {
if (!table)
return;
query = query || "sys_idISNOTEMPTY";
return initChannel(table, query);
}
function initTaskList(list, prevChannel) {
if (prevChannel)
prevChannel.unsubscribe();
var sys_ids = list.toString();
var filter = "sys_idIN" + sys_ids;
return initChannel("task", filter);
}
function initChannel(table, filter) {
if (isBlockedTable(table)) {
$log.log("Blocked from watching", table);
return null;
}
if (diagnosticLog)
log(">>> init " + table + "?" + filter);
watcherChannel = amb.getChannelRW(table, filter);
watcherChannel.subscribe(onMessage);
amb.connect();
return watcherChannel;
}
function onMessage(message) {
var r = message.data;
var c = message.channel;
if (diagnosticLog)
log(">>> record " + r.operation + ": " + r.table_name + "." + r.sys_id + " " + r.display_value);
$rootScope.$broadcast('record.updated', r);
$rootScope.$broadcast("sn.stream.tap");
$rootScope.$broadcast('list.updated', r, c);
}
function log(message) {
$log.log(message);
}
function isBlockedTable(table) {
return table == 'sys_amb_message' || table.startsWith('sys_rw');
}
return {
initTaskList: initTaskList,
initChannel: initChannel,
init: function () {
var location = urlTools.parseQueryString(window.location.search);
var table = location['table'] || location['sysparm_table'];
var sys_id = location['sys_id'] || location['sysparm_sys_id'];
var query = location['sysparm_query'];
initWatcher(table, sys_id, query);
snPresence.init(table, sys_id, query);
},
initList:  initList,
initRecord: function(table, sysId) {
initWatcher(table, sysId, null);
snPresence.initPresence(table, sysId);
},
_initWatcher: initWatcher
}
});
;
/*! RESOURCE: /scripts/app.ng.amb/factory.AMBOverlay.js */
angular.module("ng.amb").factory("AMBOverlay", function($templateCache, $compile, $rootScope) {
"use strict";
var showCallbacks = [],
hideCallbacks = [],
isRendered = false,
modal,
modalScope,
modalOptions;
var defaults = {
backdrop: 'static',
keyboard: false,
show: true
};
function AMBOverlay(config) {
config = config || {};
if(angular.isFunction(config.onShow))
showCallbacks.push(config.onShow);
if(angular.isFunction(config.onHide))
hideCallbacks.push(config.onHide);
function lazyRender() {
if(!angular.element('html')['modal']) {
var bootstrapInclude = "/scripts/bootstrap3/bootstrap.js";
ScriptLoader.getScripts([bootstrapInclude], renderModal);
} else
renderModal();
}
function renderModal() {
if(isRendered)
return;
modalScope = angular.extend($rootScope.$new(), config);
modal = $compile($templateCache.get("amb_disconnect_modal.xml"))(modalScope);
angular.element("body").append(modal);
modal.on("shown.bs.modal", function(e) {
for(var i = 0, len = showCallbacks.length; i < len; i++)
showCallbacks[i](e);
});
modal.on("hidden.bs.modal", function(e) {
for(var i = 0, len = hideCallbacks.length; i < len; i++)
hideCallbacks[i](e);
});
modalOptions = angular.extend({}, defaults, config);
modal.modal(modalOptions);
isRendered = true;
}
function showModal() {
if(isRendered)
modal.modal('show');
}
function hideModal() {
if(isRendered)
modal.modal('hide');
}
function destroyModal() {
if(!isRendered)
return;
modal.modal('hide');
modal.remove();
modalScope.$destroy();
modalScope = void(0);
isRendered = false;
var pos = showCallbacks.indexOf(config.onShow);
if(pos >= 0)
showCallbacks.splice(pos, 1);
pos = hideCallbacks.indexOf(config.onShow);
if(pos >= 0)
hideCallbacks.splice(pos, 1);
}
return {
render: lazyRender,
destroy: destroyModal,
show: showModal,
hide: hideModal,
isVisible: function() {
if(!isRendered)
false;
return modal.visible();
}
}
}
$templateCache.put('amb_disconnect_modal.xml',
'<div id="amb_disconnect_modal" tabindex="-1" aria-hidden="true" class="modal" role="dialog">' +
'	<div class="modal-dialog small-modal" style="width:450px">' +
'		<div class="modal-content">' +
'			<header class="modal-header">' +
'				<h4 id="small_modal1_title" class="modal-title">{{title || "Login"}}</h4>' +
'			</header>' +
'			<div class="modal-body">' +
'			<iframe class="concourse_modal" ng-src=\'{{iframe || "/amb_login.do"}}\' frameborder="0" scrolling="no" height="400px" width="405px"></iframe>' +
'			</div>' +
'		</div>' +
'	</div>' +
'</div>'
);
return AMBOverlay;
});
;
/*! RESOURCE: /scripts/sn/common/_module.js */
angular.module('sn.common', [
'ngSanitize',
'ngAnimate',
'sn.common.avatar',
'sn.common.controls',
'sn.common.datetime',
'sn.common.glide',
'sn.common.i18n',
'sn.common.link',
'sn.common.mention',
'sn.common.messaging',
'sn.common.notification',
'sn.common.presence',
'sn.common.stream',
'sn.common.ui',
'sn.common.user_profile',
'sn.common.util'
]);
angular.module('ng.common', [
'sn.common'
]);
;
/*! RESOURCE: /scripts/sn/common/dist/templates.js */
angular.module('sn.common.dist.templates', []);
;
/*! RESOURCE: /scripts/sn/common/datetime/js_includes_datetime.js */
/*! RESOURCE: /scripts/sn/common/datetime/_module.js */
angular.module('sn.common.datetime', [
'sn.common.i18n'
]);
angular.module('sn.timeAgo', [
'sn.common.datetime'
]);
;
/*! RESOURCE: /scripts/sn/common/datetime/directive.snTimeAgo.js */
angular.module('sn.common.datetime').constant('DATE_GRANULARITY', {
DATETIME: 1,
DATE: 2
});
angular.module('sn.common.datetime').factory('timeAgoTimer', function($interval, $rootScope, DATE_GRANULARITY) {
"use strict";
var digestInterval;
return function(displayGranularityType) {
displayGranularityType = typeof displayGranularityType !== 'undefined' ? displayGranularityType : DATE_GRANULARITY.DATETIME;
if (!digestInterval && displayGranularityType == DATE_GRANULARITY.DATETIME)
digestInterval = $interval(function() {
$rootScope.$broadcast('sn.TimeAgo.tick');
}, 30 * 1000);
return Date.now();
};
});
angular.module('sn.common.datetime').factory('timeAgo', function(timeAgoSettings, DATE_GRANULARITY) {
var service = {
settings: timeAgoSettings.get(),
allowFuture: function allowFuture(bool) {
this.settings.allowFuture = bool;
return this;
},
toWords: function toWords(distanceMillis, messageGranularity) {
messageGranularity = messageGranularity || DATE_GRANULARITY.DATETIME;
var $l = service.settings.strings;
var seconds = Math.abs(distanceMillis) / 1000;
var minutes = seconds / 60;
var hours = minutes / 60;
var days = hours / 24;
var years = days / 365;
var ago = $l.ago;
if ((seconds < 45 && messageGranularity == DATE_GRANULARITY.DATETIME)
|| (hours < 24 && messageGranularity == DATE_GRANULARITY.DATE)
|| (!service.settings.allowFuture && distanceMillis < 0))
ago = '%d';
if (service.settings.allowFuture) {
if (distanceMillis < 0) {
ago = $l.fromNow;
}
}
function substitute(stringOrFunction, number) {
var string = angular.isFunction(stringOrFunction) ?
stringOrFunction(number, distanceMillis) : stringOrFunction;
if (!string)
return "";
var value = ($l.numbers && $l.numbers[number]) || number;
return string.replace(/%d/i, value);
}
var wantDate = messageGranularity == DATE_GRANULARITY.DATE;
var wantDateTime = messageGranularity == DATE_GRANULARITY.DATETIME;
var words = distanceMillis <= 0 && wantDateTime && substitute($l.justNow, 0) ||
distanceMillis <= 0 && wantDate && substitute($l.today, 0) ||
seconds < 45 && (distanceMillis >= 0 || !service.settings.allowFuture) && wantDateTime && substitute($l.justNow, Math.round(seconds)) ||
seconds < 45 && wantDateTime && substitute($l.seconds, Math.round(seconds)) ||
seconds < 90 && wantDateTime && substitute($l.minute, 1) ||
minutes < 45 && wantDateTime && substitute($l.minutes, Math.round(minutes)) ||
minutes < 90 && wantDateTime && substitute($l.hour, 1) ||
hours < 24 && wantDateTime && substitute($l.hours, Math.round(hours)) ||
hours < 24 && wantDate && substitute($l.today, 0) ||
hours < 42 && substitute($l.day, 1) ||
days < 30 && substitute($l.days, Math.ceil(days)) ||
days < 45 && substitute($l.month, 1) ||
days < 365 && substitute($l.months, Math.round(days / 30)) ||
years < 1.5 && substitute($l.year, 1) ||
substitute($l.years, Math.round(years));
return substitute(ago, words);
},
parse: function(iso8601) {
if (angular.isNumber(iso8601))
return new Date(parseInt(iso8601, 10));
var s = iso8601.trim();
s = s.replace(/\.\d+/,"");
s = s.replace(/-/,"/").replace(/-/,"/");
s = s.replace(/T/," ").replace(/Z/," UTC");
s = s.replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2");
return new Date(s);
}
};
return service;
});
angular.module('sn.common.datetime').directive("snTimeAgo", function(timeAgoSettings, $rootScope, timeAgo, timeAgoTimer, DATE_GRANULARITY) {
"use strict";
return {
restrict: "E",
template: '<time title="{{ ::titleTime }}">{{timeAgo}}</time>',
scope: {
timestamp: "=",
local: "="
},
link: function(scope) {
timeAgoSettings.ready.then(function() {
timeAgoTimer(DATE_GRANULARITY.DATETIME)
scope.$on('sn.TimeAgo.tick', setTimeAgo);
setTimeAgo();
});
function setTimeAgo() {
scope.timeAgo = timeAgoConverter(scope.timestamp, true);
}
function timeAgoConverter(input, noFuture) {
if (!input)
return;
var allowFuture = !noFuture;
var date = timeAgo.parse(input);
if (scope.local) {
scope.titleTime = input;
return timeAgo.allowFuture(allowFuture).toWords(new Date() - date);
}
if (Object.prototype.toString.call(date) !== "[object Date]" && Object.prototype.toString.call(date) !== "[object Number]")
return input;
else if (Object.prototype.toString.call(date) == "[object Date]" && isNaN(date.getTime()))
return input;
setTitleTime(date);
var currentDate = new Date();
currentDate = new Date(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate(), currentDate.getUTCHours(), currentDate.getUTCMinutes(), currentDate.getUTCSeconds() );
var diff = currentDate - date;
return timeAgo.allowFuture(allowFuture).toWords(diff);
}
function setTitleTime(date) {
var t = date.getTime();
var o = date.getTimezoneOffset();
t -= o * 60 * 1000;
scope.titleTime = new Date(t).toLocaleString();
}
}
}
});
angular.module('sn.common.datetime').directive("snTimeAgoStatic", function(timeAgoSettings, $rootScope, timeAgo, timeAgoTimer, DATE_GRANULARITY) {
"use strict";
return {
restrict: "E",
template: '<time title="{{ ::titleTime }}">{{timeAgo}}</time>',
scope: {
timestamp: "@",
local: "@"
},
link: function(scope) {
timeAgoSettings.ready.then(function() {
timeAgoTimer(DATE_GRANULARITY.DATETIME)
scope.$on('sn.TimeAgo.tick', setTimeAgo);
setTimeAgo();
});
function setTimeAgo() {
scope.timeAgo = timeAgoConverter(scope.timestamp, true);
}
function timeAgoConverter(input, noFuture) {
if (!input)
return;
var allowFuture = !noFuture;
var date = timeAgo.parse(input);
if (scope.local) {
scope.titleTime = input;
return timeAgo.allowFuture(allowFuture).toWords(new Date() - date);
}
if (Object.prototype.toString.call(date) !== "[object Date]" && Object.prototype.toString.call(date) !== "[object Number]")
return input;
else if (Object.prototype.toString.call(date) == "[object Date]" && isNaN(date.getTime()))
return input;
setTitleTime(date);
var currentDate = new Date();
currentDate = new Date(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate(), currentDate.getUTCHours(), currentDate.getUTCMinutes(), currentDate.getUTCSeconds() );
var diff = currentDate - date;
return timeAgo.allowFuture(allowFuture).toWords(diff);
}
function setTitleTime(date) {
var t = date.getTime();
var o = date.getTimezoneOffset();
t -= o * 60 * 1000;
scope.titleTime = new Date(t).toLocaleString();
}
}
}
});
;
/*! RESOURCE: /scripts/sn/common/datetime/directive.snDayAgo.js */
angular.module('sn.common.datetime').directive("snDayAgo", function(timeAgoSettings, $rootScope, timeAgo, timeAgoTimer, DATE_GRANULARITY) {
"use strict";
return {
restrict: "E",
template: '<time>{{dayAgo}}</time>',
scope: {
date: "="
},
link: function(scope) {
timeAgoSettings.ready.then(function() {
setDayAgo();
});
function setDayAgo() {
scope.dayAgo = dayAgoConverter(scope.date, "noFuture");
}
function dayAgoConverter(input, option) {
if (!input) return;
var allowFuture = !((option === 'noFuture') || (option === 'no_future'));
var date = timeAgo.parse(input);
if ( Object.prototype.toString.call(date) !== "[object Date]" )
return input;
else if ( isNaN(date.getTime()) )
return input;
var diff = timeAgoTimer(DATE_GRANULARITY.DATE) - date;
return timeAgo.allowFuture(allowFuture).toWords(diff, DATE_GRANULARITY.DATE);
}
}
}
});
;
/*! RESOURCE: /scripts/sn/common/datetime/snTimeAgoSettings.js */
angular.module('sn.common.datetime').provider('snTimeAgoSettings', function() {
"use strict";
var INIT_NEVER = 'never';
var INIT_AUTO = 'auto';
var INIT_MANUAL = 'manual';
var _initMethod = INIT_AUTO;
this.setInitializationMethod = function(init) {
switch (init) {
default:
init = INIT_AUTO;
case INIT_NEVER:
case INIT_AUTO:
case INIT_MANUAL:
_initMethod = init;
break;
}
};
this.$get = function(i18n, $q) {
var settings = {
allowFuture: true,
dateOnly: false,
strings: {}
};
var _initialized = false;
var ready = $q.defer();
function initialize() {
if (_initMethod === INIT_NEVER) {
return $q.reject();
}
if (!_initialized) {
_initialized = true;
i18n.getMessages(['%d ago', '%d from now', 'just now',
'less than a minute', 'about a minute', '%d minutes', 'about an hour', 'about %d hours', 'today', 'a day', '%d days',
'about a month', '%d months', 'about a year', 'about a year', '%d years'], function (msgs) {
settings.strings = {
ago: msgs['%d ago'],
fromNow: msgs['%d from now'],
justNow: msgs["just now"],
seconds: msgs["less than a minute"],
minute: msgs["about a minute"],
minutes: msgs["%d minutes"],
hour: msgs["about an hour"],
hours: msgs["about %d hours"],
day: msgs["a day"],
days: msgs["%d days"],
month: msgs["about a month"],
months: msgs["%d months"],
year: msgs["about a year"],
years: msgs["%d years"],
today: msgs["today"],
wordSeparator: msgs["timeago_number_separator"],
numbers: []
};
ready.resolve();
});
}
return ready.promise;
}
if (_initMethod === INIT_AUTO) {
initialize();
}
return {
initialize: initialize,
ready: ready.promise,
get: function get() {
return settings;
},
set: function set(translated) {
settings = angular.extend(settings, translated);
}
};
};
}).factory('timeAgoSettings', function(snTimeAgoSettings) {
return snTimeAgoSettings;
});
;
;
/*! RESOURCE: /scripts/sn/common/glide/js_includes_glide.js */
/*! RESOURCE: /scripts/sn/common/glide/_module.js */
angular.module('sn.common.glide', [
'sn.common.util'
]);
;
/*! RESOURCE: /scripts/sn/common/glide/factory.glideUrlBuilder.js */
angular.module('sn.common.glide').factory('glideUrlBuilder', ['$window', function($window) {
"use strict";
function GlideUrl(contextPath){
var objDef = {
contextPath: '',
params: {},
encodedString: '',
encode: true,
setFromCurrent: function() {
this.setFromString($window.location.href);
},
setFromString:function(href) {
var pos = href.indexOf('?');
if (pos < 0) {
this.contextPath = href;
return;
}
this.contextPath = href.slice(0, pos);
var hashes = href.slice(pos + 1).split('&');
var i = hashes.length;
while (i--) {
var pos = hashes[i].indexOf('=');
this.params[hashes[i].substring(0, pos)] = hashes[i].substring(++pos);
}
},
setContextPath: function(c) {
this.contextPath = c;
},
getParam: function(p) {
return this.params[p];
},
getParams: function() {
return this.params;
},
addParam: function(name, value) {
this.params[name] = value;
return this;
},
addToken: function() {
if (typeof g_ck != 'undefined' && g_ck != "")
this.addParam('sysparm_ck', g_ck);
return this;
},
deleteParam: function(name) {
delete this.params[name];
},
addEncodedString: function(s) {
if (!s)
return;
if (s.substr(0, 1) != "&")
this.encodedString += "&";
this.encodedString += s;
return this;
},
getQueryString: function(additionalParams) {
var qs = this._getParamsForURL(this.params);
qs += this._getParamsForURL(additionalParams);
qs += this.encodedString;
if (qs.length == 0)
return "";
return qs.substring(1);
},
_getParamsForURL: function(params) {
if (!params)
return '';
var url = '';
for (var n in params) {
var p = params[n] || '';
url += '&' + n + '=' + (this.encode ? encodeURIComponent(p + '') : p);
}
return url;
},
getURL: function(additionalParams) {
var url = this.contextPath;
var qs = this.getQueryString(additionalParams);
if (qs)
url += "?" + qs;
return url;
},
setEncode: function(b) {
this.encode = b;
},
toString: function() { return 'GlideURL'; }
}
return objDef;
}
return {
newGlideUrl: function(contextPath) {
var glideUrl = new GlideUrl();
glideUrl.setFromString(contextPath ? contextPath : '');
return glideUrl;
},
refresh: function(){
$window.location.replace( $window.location.href );
},
getCancelableLink: function(link) {
if ($window.NOW && $window.NOW.g_cancelPreviousTransaction) {
var nextChar = link.indexOf('?') > -1 ? '&' : '?';
link += nextChar + "sysparm_cancelable=true";
}
return link;
}
};
}]);
;
/*! RESOURCE: /scripts/sn/common/glide/service.queryFilter.js */
angular.module('sn.common.glide').factory('queryFilter', function() {
"use strict";
return {
create : function() {
var that = {};
that.conditions = [];
function newCondition(field, operator, value, label, displayValue, type){
var condition = {
field: field,
operator: operator,
value: value,
displayValue: displayValue,
label: label,
left: null,
right: null,
type: null,
setValue: function(value, displayValue){
this.value = value;
this.displayValue = displayValue ? displayValue : value;
}
};
if (type)
condition.type = type;
return condition;
}
function addCondition(condition) {
that.conditions.push(condition);
return condition;
}
function removeCondition(condition) {
for (var i = that.conditions.length-1; i >= 0; i--) {
if (that.conditions[i] === condition)
that.conditions.splice(i, 1);
}
}
function getConditionsByField(conditions, field){
var conditionsToReturn = [];
for(var condition in conditions){
if (conditions.hasOwnProperty(condition)){
if (conditions[condition].field == field)
conditionsToReturn.push(conditions[condition]);
}
}
return conditionsToReturn;
}
function encodeCondition(condition){
var output = "";
if (condition.hasOwnProperty("left") && condition.left){
output += encodeCondition(condition.left);
}
if (condition.hasOwnProperty("right") && condition.right){
var right = encodeCondition(condition.right);
if (right.length > 0){
output += "^" + condition.type + right;
}
}
if (condition.field){
output += condition.field;
output += condition.operator;
if (condition.value !== null && typeof condition.value !== "undefined")
output += condition.value;
}
return output;
}
function createEncodedQuery() {
var eq = "";
var ca = that.conditions;
for (var i = 0; i < ca.length; i++) {
var condition = ca[i];
if (eq.length)
eq += '^';
eq += encodeCondition(condition);
}
eq += "^EQ";
return eq;
}
that.addCondition = addCondition;
that.newCondition = newCondition;
that.createEncodedQuery = createEncodedQuery;
that.getConditionsByField = getConditionsByField;
that.removeCondition = removeCondition;
return that;
}
};
});
;
/*! RESOURCE: /scripts/sn/common/glide/service.filterExpressionParser.js */
angular.module('sn.common.glide').factory('filterExpressionParser', function() {
'use strict';
var operatorExpressions = [{
wildcardExp: '(.*)',
operator: 'STARTSWITH',
toExpression: function(filter) {
return filter;
}
},{
wildcardExp: '^\\*(.*)',
operator: 'LIKE',
toExpression: function(filter) {
return (filter === '*' ? filter : '*' + filter);
}
},{
wildcardExp: '^\\.(.*)',
operator: 'LIKE',
toExpression: function(filter) {
return '.' + filter;
}
},{
wildcardExp: '^%(.*)',
operator: 'ENDSWITH',
toExpression: function(filter) {
return (filter === '%' ? filter : '%' + filter);
}
},{
wildcardExp: '(.*)%',
operator: 'LIKE',
toExpression: function(filter) {
return filter + '%';
}
},{
wildcardExp: '^=(.*)',
operator: '=',
toExpression: function(filter) {
return (filter === '=' ? filter : '=' + filter);
}
},{
wildcardExp: '^!\\*(.*)',
operator: 'NOT LIKE',
toExpression: function(filter) {
return (filter === '!*' || filter === '!' ? filter : '!*' + filter);
}
},{
wildcardExp: '^!=(.*)',
operator: '!=',
toExpression: function(filter) {
return (filter === '!=' || filter === '!' ? filter : '!=' + filter);
}
}];
return {
getOperatorExpressionForOperator: function(operator) {
for (var i = 0; i < operatorExpressions.length; i++) {
var item = operatorExpressions[i];
if (item.operator === operator)
return item;
}
throw {
name: 'OperatorNotSupported',
message: 'The operator ' + operator + ' is not in the list of operatorExpressions.'
};
},
parse: function(val, defaultOperator) {
var parsedValue = {
filterText: val,
operator: defaultOperator || 'STARTSWITH'
};
for (var i = 1; i < operatorExpressions.length; i++) {
var operatorItem = operatorExpressions[i];
var match = val.match(operatorItem.wildcardExp);
if (match && match[1] !== '') {
parsedValue.operator = operatorItem.operator;
parsedValue.filterText = match[1];
}
}
return parsedValue;
}
};
});
;
/*! RESOURCE: /scripts/sn/common/glide/service.userPreferences.js */
angular.module('sn.common.glide').factory("userPreferences", function ($http, $q, unwrappedHTTPPromise, urlTools) {
"use strict";
var	preferencesCache = {};
function getPreference(preferenceName) {
if (preferenceName in preferencesCache)
return preferencesCache[preferenceName];
var targetURL = urlTools.getURL('user_preference', {
"sysparm_pref_name": preferenceName,
"sysparm_action": "get"
}),
deferred = $q.defer();
$http.get(targetURL).success(function (response) {
deferred.resolve(response.sysparm_pref_value);
}).error(function (data, status) {
deferred.reject("Error getting preference " + preferenceName + ": " + status);
});
preferencesCache[preferenceName] = deferred.promise;
return deferred.promise;
}
function setPreference(preferenceName, preferenceValue) {
var targetURL = urlTools.getURL('user_preference', {
"sysparm_pref_name": preferenceName,
"sysparm_action": "set",
"sysparm_pref_value": "" + preferenceValue
});
var httpPromise = $http.get(targetURL);
addToCache(preferenceName, preferenceValue);
return unwrappedHTTPPromise(httpPromise);
}
function addToCache(preferenceName, preferenceValue){
preferencesCache[preferenceName] = $q.when(preferenceValue);
}
var userPreferences = {
getPreference: getPreference,
setPreference: setPreference,
addToCache: addToCache
};
return userPreferences;
});
;
/*! RESOURCE: /scripts/sn/common/glide/service.nowStream.js */
angular.module('sn.common.glide').constant('nowStreamTimerInterval', 5000);
angular.module('sn.common.glide').factory('nowStream', function($q, $timeout, urlTools, nowStreamTimerInterval, snResource, $log) {
'use strict';
var Stream = function() {
this.initialize.apply(this, arguments);
};
Stream.prototype = {
initialize: function(table, query, sys_id, processor, interval, source, includeAttachments) {
this.table = table;
this.query = query;
this.sysparmQuery = null;
this.sys_id = sys_id;
this.processor = processor;
this.lastTimestamp = 0;
this.inflightRequest = null;
this.requestImmediateUpdate = false;
this.interval = interval;
this.source = source;
this.includeAttachments = includeAttachments;
this.stopped = true;
},
setQuery: function(sysparmQuery) {
this.sysparmQuery = sysparmQuery;
},
poll: function(callback, preRequestCallback) {
this.callback = callback;
this.preRequestCallback = preRequestCallback;
this._stopPolling();
this._startPolling();
},
tap: function() {
if (!this.inflightRequest) {
this._stopPolling();
this._startPolling();
}
else
this.requestImmediateUpdate = true;
},
insert: function(field, text) {
this.insertForEntry(field, text, this.table, this.sys_id);
},
insertForEntry: function(field, text, table, sys_id) {
return this.insertEntries([{
field: field,
text: text
}], table, sys_id);
},
expandMentions: function (entryText, mentionIDMap) {
return entryText.replace(/@\[(.+?)\]/gi, function (mention) {
var mentionedName = mention.substring(2, mention.length - 1);
if (mentionIDMap[mentionedName]) {
return "@[" + mentionIDMap[mentionedName] + ":" + mentionedName + "]";
} else {
return mention;
}
});
},
insertEntries: function(entries, table, sys_id, mentionIDMap) {
mentionIDMap = mentionIDMap || {};
var sanitizedEntries = [];
for (var i = 0; i < entries.length; i++) {
var entryText = entries[i].text;
if (entryText && entryText.endsWith('\n'))
entryText = entryText.substring(0, entryText.length - 1);
if (!entryText)
continue;
entries[i].text = this.expandMentions(entryText, mentionIDMap);
sanitizedEntries.push(entries[i]);
}
if (sanitizedEntries.length === 0)
return;
this._isInserting = true;
var url = this._getInsertURL(table, sys_id);
var that = this;
return snResource().post(url, {
entries: sanitizedEntries
}).then(this._successCallback.bind(this), function() {
$log.warn('Error submitting entries', sanitizedEntries);
}).then(function() {
that._isInserting = false;
});
},
cancel: function() {
this._stopPolling();
},
_startPolling : function() {
var interval = this._getInterval();
var that = this;
var successCallback = this._successCallback.bind(this);
that.stopped = false;
function runPoll() {
if (that._isInserting) {
establishNextRequest();
return;
}
if (!that.inflightRequest) {
that.inflightRequest = that._executeRequest();
that.inflightRequest.then(successCallback);
that.inflightRequest.finally(function() {
that.inflightRequest = null;
if (that.requestImmediateUpdate) {
that.requestImmediateUpdate = false;
establishNextRequest(0);
}
else {
establishNextRequest();
}
});
}
}
function establishNextRequest(intervalOverride) {
if (that.stopped)
return;
intervalOverride = (parseFloat(intervalOverride) >= 0) ? intervalOverride : interval;
$timeout.cancel(that.timer);
that.timer = $timeout(runPoll, intervalOverride);
}
runPoll();
},
_stopPolling : function() {
if (this.timer)
$timeout.cancel(this.timer);
this.stopped = true;
},
_executeRequest: function() {
var url = this._getURL();
if (this.preRequestCallback) {
this.preRequestCallback();
}
return snResource().get(url);
},
_getURL: function() {
var params = {
table: this.table,
action: this._getAction(),
sysparm_silent_request: true,
sysparm_auto_request: true,
sysparm_timestamp: this.lastTimestamp,
include_attachments: this.includeAttachments
};
if (this.sys_id) {
params['sys_id'] = this.sys_id;
} else if (this.sysparmQuery) {
params['sysparm_query'] = this.sysparmQuery;
}
var url = urlTools.getURL(this.processor, params);
if (!this.sys_id) {
url += "&p=" + this.query;
}
return url;
},
_getInsertURL: function(table, sys_id) {
return urlTools.getURL(this.processor, {
action: 'insert',
table: table,
sys_id: sys_id,
sysparm_timestamp: this.timestamp || 0,
sysparm_source: this.source
});
},
_successCallback: function(response) {
var response = response.data;
if (response.entries && response.entries.length) {
response.entries = this._filterOld(response.entries);
if (response.entries.length > 0) {
this.lastEntry = angular.copy(response.entries[0]);
this.lastTimestamp = response.sys_timestamp || response.entries[0].sys_timestamp;
}
}
this.callback.call(null, response);
},
_filterOld: function(entries) {
for (var i = 0; i < entries.length; i++) {
if (entries[i].sys_timestamp == this.lastTimestamp) {
if (this.lastEntry) {
if (!angular.equals(this._makeComparable(entries[i]), this._makeComparable(this.lastEntry)))
continue;
}
}
if (entries[i].sys_timestamp <= this.lastTimestamp)
return entries.slice(0, i);
}
return entries;
},
_makeComparable: function(entry) {
var copy = angular.copy(entry);
delete copy.short_description;
delete copy.display_value;
return copy;
},
_getAction: function() {
return this.sys_id ? 'get_new_entries' : 'get_set_entries';
},
_getInterval: function() {
if (this.interval)
return this.interval;
else if (window.NOW && NOW.stream_poll_interval)
return NOW.stream_poll_interval * 1000;
else
return nowStreamTimerInterval;
}
};
return {
create: function(table, query, sys_id, processor, interval, source) {
return new Stream(table, query, sys_id, processor, interval, source);
}
};
});
;
/*! RESOURCE: /scripts/sn/common/glide/service.nowServer.js */
angular.module('sn.common.glide').factory('nowServer', function($http, $q, userPreferences, angularProcessorUrl, urlTools) {
return {
getBaseURL: function () {
return angularProcessorUrl;
},
getPartial: function(scope, partial, parms, callback) {
var url = this.getPartialURL(partial, parms);
if (url === scope.url) {
callback.call();
return;
}
var fn = scope.$on('$includeContentLoaded', function() {
fn.call();
callback.call();
});
scope.url = url;
},
replaceView: function($location, newView) {
var p = $location.path();
var a = p.split("/");
a[1] = newView;
p = a.join("/");
return p;
},
getPartialURL: urlTools.getPartialURL,
getURL: urlTools.getURL,
urlFor : urlTools.urlFor,
getPropertyURL: urlTools.getPropertyURL,
setPreference: userPreferences.setPreference,
getPreference: userPreferences.getPreference
}
});
;
;
/*! RESOURCE: /scripts/sn/common/user_profile/js_includes_user_profile.js */
/*! RESOURCE: /scripts/sn/common/user_profile/_module.js */
angular.module("sn.common.user_profile", ['sn.common.ui']);
;
/*! RESOURCE: /scripts/sn/common/user_profile/directive.snUserProfile.js */
angular.module('sn.common.user_profile').directive('snUserProfile', function(getTemplateUrl, snCustomEvent, $window, avatarProfilePersister, $timeout, $http) {
"use strict";
return {
replace: true,
restrict: 'E',
templateUrl: getTemplateUrl('snUserProfile.xml'),
scope: {
profile: "=",
showDirectMessagePrompt: "="
},
link: function(scope, element) {
scope.showDirectMessagePromptFn = function() {
if (scope.showDirectMessagePrompt) {
var activeUserID = $window.NOW.user_id || "";
return !(!scope.profile
|| activeUserID === scope.profile.sysID
|| (scope.profile.document && activeUserID === scope.profile.document));
} else {
return false;
}
};
$timeout(function() {
element.find("#direct-message-popover-trigger").on("click", scope.openDirectMessageConversation);
}, 0, false);
},
controller: function($scope, snConnectService) {
if ($scope.profile && $scope.profile.userID && avatarProfilePersister.getAvatar($scope.profile.userID)) {
$scope.profile = avatarProfilePersister.getAvatar($scope.profile.userID);
$scope.$emit("sn-user-profile.ready");
} else {
$http.get('/api/now/live/profiles/sys_user.' + $scope.profile.userID).then(function (response) {
angular.merge($scope.profile, response.data.result);
avatarProfilePersister.setAvatar($scope.profile.userID, $scope.profile);
$scope.$emit("sn-user-profile.ready");
})
}
$scope.openDirectMessageConversation = function(evt) {
if (evt && evt.keyCode === 9)
return;
$timeout(function () {
snConnectService.openWithProfile($scope.profile);
}, 0, false);
angular.element('.popover').each(function() {
angular.element('body').off('click.snUserAvatarPopoverClose');
angular.element(this).popover('hide');
});
};
}
}
});
;
;
/*! RESOURCE: /scripts/sn/common/avatar/_module.js */
angular.module('sn.common.avatar', ['sn.common.presence', 'sn.common.messaging', 'sn.common.user_profile']).config(function($provide) {
$provide.value("liveProfileID", '');
});
;
/*! RESOURCE: /scripts/sn/common/avatar/directive.snAvatarPopover.js */
angular.module('sn.common.avatar').directive('snAvatarPopover', function($http, $compile, getTemplateUrl, avatarProfilePersister, $injector) {
'use strict';
return {
restrict : 'E',
templateUrl: getTemplateUrl('sn_avatar_popover.xml'),
replace: true,
transclude: true,
scope : {
members: '=',
primary: '=?',
showPresence: '=?',
enableContextMenu: '=?',
enableTooltip: '=?',
enableBindOnce: '@',
displayMemberCount: "=?",
groupAvatar: "@",
nopopover: "=",
directconversation: '@',
conversation: '=',
primaryNonAssign: '=?'
},
compile: function(tElement) {
var template = tElement.html();
return function (scope, element, attrs, controller, transcludeFn) {
if (scope.directconversation) {
if (scope.directconversation === "true")
scope.directconversation = true;
else
scope.directconversation = false;
scope.showdirectconversation = !scope.directconversation;
} else {
scope.showdirectconversation = true;
}
if ($injector.has('inSupportClient') && $injector.get('inSupportClient'))
scope.showdirectconversation = false;
if (scope.primaryNonAssign) {
scope.primary = angular.extend({}, scope.primary, scope.primaryNonAssign);
if (scope.users && scope.users[0])
scope.users[0] = scope.primary;
}
function recompile () {
if (scope.primaryNonAssign) {
scope.primary = angular.extend({}, scope.primary, scope.primaryNonAssign);
if (scope.users && scope.users[0])
scope.users[0] = scope.primary;
}
var newElement = $compile(template, transcludeFn)(scope);
element.html(newElement);
if (scope.enableTooltip) {
element.tooltip({
placement: 'auto top',
container: 'body'
}).attr('data-original-title', scope.users[0].name).tooltip('fixTitle');
if (element.hideFix)
element.hideFix();
}
}
if (attrs.enableBindOnce === 'false') {
scope.$watch('primary', recompile);
scope.$watch('primaryNonAssign', recompile);
scope.$watch('members', recompile);
}
if (scope.enableTooltip && scope.nopopover) {
var usersWatch = scope.$watch('users', function () {
if (scope.users && scope.users.length === 1 && scope.users[0] && scope.users[0].name) {
element.tooltip({
placement: 'auto top',
container: 'body'
}).attr('data-original-title', scope.users[0].name).tooltip('fixTitle');
if (element.hideFix)
element.hideFix();
usersWatch();
}
});
}
};
},
controller: function($scope, liveProfileID, $timeout, $element, $document, snCustomEvent) {
$scope.randId = Math.random();
$scope.loadEvent = 'sn-user-profile.ready';
$scope.closeEvent = ['chat:open_conversation', 'snAvatar.closePopover', 'body_clicked'];
$scope.popoverConfig = {
template: '<div class="popover" role="tooltip"><div class="arrow"></div><div class="popover-content"></div></div>'
};
$scope.displayMemberCount = $scope.displayMemberCount || false;
$scope.liveProfileID = liveProfileID;
if ($scope.primaryNonAssign) {
$scope.primary =  angular.extend({}, $scope.primary, $scope.primaryNonAssign);
if ($scope.users && $scope.users[0])
$scope.users[0] = $scope.primary;
}
$scope.$watch('members', function(newVal, oldVal) {
if(newVal === oldVal)
return;
if ($scope.members)
buildAvatar();
});
$scope.noPopover = function () {
$scope.popoverCursor = ($scope.nopopover || ($scope.members && $scope.members.length > 2) ) ? "default" : "pointer";
return ($scope.nopopover || ($scope.members && $scope.members.length > 2));
}
$scope.avatarType = function() {
var result = [];
if($scope.groupAvatar || !$scope.users)
return result;
if ($scope.users.length > 1)
result.push("group")
if ($scope.users.length === 2)
result.push("avatar-duo")
if ($scope.users.length === 3)
result.push("avatar-trio")
if ($scope.users.length >= 4)
result.push("avatar-quad")
return result;
}
$scope.getBackgroundStyle = function(user) {
var avatar = (user ? user.avatar  : '');
if ($scope.groupAvatar)
avatar = $scope.groupAvatar;
if (avatar && avatar !== '')
return { 'background-image' : 'url(' + avatar + ')' };
if (user && user.name)
return '';
return void(0);
};
$scope.stopPropCheck = function (evt) {
$scope.$broadcast("snAvatar.closeOtherPopovers", $scope.randId);
if (!$scope.nopopover) {
evt.stopPropagation();
}
};
$scope.$on("snAvatar.closeOtherPopovers", function (id) {
if (id !== $scope.randId)
snCustomEvent.fireTop('snAvatar.closePopover');
});
$scope.maxStringWidth = function() {
var paddedWidth = parseInt($scope.avatarWidth * 0.8, 10);
return $scope.users.length === 1 ? paddedWidth : paddedWidth / 2;
};
function buildInitials(name) {
if (!name)
return "--";
var initials = name.split(" ").map(function(word) {
return word.toUpperCase();
}).filter(function(word) {
return word.match(/^[A-Z]/);
}).map(function(word) {
return word.substring(0,1);
}).join("");
return (initials.length > 3)
? initials.substr(0, 3)
: initials;
}
$scope.avatartooltip = function() {
if (!$scope.enableTooltip) {
return '';
}
if (!$scope.users) {
return '';
}
var names = [];
$scope.users.forEach(function(user) {
if(!user) { return; }
names.push(user.name);
});
return names.join(', ');
};
function buildAvatar() {
if (typeof $scope.primary === 'string') {
$http.get('/api/now/live/profiles/sys_user.' + $scope.primary).then(function (response) {
$scope.users = [{
userID: $scope.primary,
name: response.data.result.name,
initials: buildInitials(response.data.result.name),
avatar: response.data.result.avatar
}];
});
return;
}
if ($scope.primary) {
if ($scope.primary.userImage)
$scope.primary.avatar = $scope.primary.userImage;
if (!$scope.primary.userID && $scope.primary.sys_id)
$scope.primary.userID = $scope.primary.sys_id;
}
$scope.isGroup = $scope.conversation && $scope.conversation.isGroup;
$scope.users = [$scope.primary];
if ($scope.primary && (!$scope.members || $scope.members.length <= 0) && ($scope.primary.avatar || $scope.primary.initials) && $scope.isDocument) {
$scope.users = [$scope.primary];
} else if ($scope.members && $scope.members.length > 0) {
$scope.users = buildCompositeAvatar($scope.members);
}
$scope.presenceEnabled = $scope.showPresence && !$scope.isGroup && $scope.users.length === 1;
}
function buildCompositeAvatar(members) {
var currentUser = window.NOW.user ? window.NOW.user.userID : window.NOW.user_id;
var users = angular.isArray(members) ? members.slice() : [members];
users = users.sort(function(a, b) {
var aID = a.userID || a.document;
var bID = b.userID || b.document;
if (a.table === "chat_queue_entry")
return 1;
if (aID === currentUser)
return 1;
else if (bID === currentUser)
return -1;
return 0;
});
if (users.length === 2)
users = [users[0]];
if (users.length > 2 && $scope.primary && $scope.primary.name && $scope.primary.table === "sys_user") {
var index = -1;
angular.forEach(users, function(user, i) {
if (user.sys_id === $scope.primary.sys_id) {
index = i;
}
});
if (index > -1) {
users.splice(index, 1);
}
users.splice(1, 0, $scope.primary);
}
return users;
}
buildAvatar();
$scope.loadFullProfile = function () {
if ($scope.primary && !$scope.primary.sys_id && !avatarProfilePersister.getAvatar($scope.primary.userID)) {
$http.get('/api/now/live/profiles/' + $scope.primary.userID).then(
function (response) {
try{
angular.extend($scope.primary, response.data.result);
avatarProfilePersister.setAvatar($scope.primary.userID, $scope.primary);
}catch(e){}
});
}
}
}
}
});
;
/*! RESOURCE: /scripts/sn/common/avatar/directive.snAvatar.js */
angular.module('sn.common.avatar')
.run(function ($http, $templateCache, getTemplateUrl) {
function uppercaseFirst(string) {
return string.charAt(0).toUpperCase() + string.slice(1);
}
var templateTypes = {
'singleBinding': null,
'default': null
};
var templateUrl = getTemplateUrl('sn_avatar.xml');
function getTemplate(_templateType) {
var templateType = _templateType || 'default';
if (templateTypes[templateType])
return $q.when(templateTypes[templateType]);
return $http.get(templateUrl, { cache: $templateCache })
.then(function (response) {
var replacement = templateType === 'singleBinding' ? '::' : '';
return templateTypes[templateType] = response.data.replace(/REPLACE_ME/g, replacement)
});
}
Object.keys(templateTypes).forEach(function (_type){
getTemplate(_type).then(function(template) {
$templateCache.put('snAvatar' + uppercaseFirst(_type.replace('default', '')) + '.tpl', template);
});
});
})
.factory('snAvatarFactory', function($http, $compile, $templateCache, $q, getTemplateUrl, snCustomEvent, snConnectService) {
'use strict';
return function() {
return {
restrict : 'E',
replace: true,
transclude: true,
scope : {
members: '=',
primary: '=',
showPresence: '=?',
enableContextMenu: '=?',
enableTooltip: '=?',
enableBindOnce: '@',
displayMemberCount: "=?",
groupAvatar: "@"
},
compile: function(tElement) {
var template = tElement.html();
return function (scope, element, attrs, controller, transcludeFn) {
var newElement = $compile(template, transcludeFn)(scope);
element.html(newElement);
if (scope.enableTooltip) {
element.tooltip({
placement: 'auto top',
container: 'body'
}).attr('data-original-title', scope.users[0].name).tooltip('fixTitle');
if (element.hideFix)
element.hideFix();
}
if (attrs.enableBindOnce === 'false') {
scope.$watch('primary', recompile);
scope.$watch('members', recompile);
}
if (scope.enableTooltip) {
var usersWatch = scope.$watch('users', function () {
if (scope.users && scope.users.length === 1 && scope.users[0] && scope.users[0].name) {
element.tooltip({
placement: 'auto top',
container: 'body'
}).attr('data-original-title', scope.users[0].name).tooltip('fixTitle');
if (element.hideFix)
element.hideFix();
usersWatch();
}
});
}
if (scope.enableContextMenu !== false) {
scope.contextOptions = [];
var gUser = null;
try { gUser = g_user; } catch (err) {}
if (scope.users && scope.users.length === 1 && scope.users[0] && (scope.users[0].userID || scope.users[0].sys_id)) {
scope.contextOptions = [
["Open user's profile", function () {
if (scope.users && scope.users.length > 0) {
window.open('/nav_to.do?uri=' + encodeURIComponent('sys_user.do?sys_id=' + scope.users[0].userID), '_blank');
}
}]];
if ((gUser && scope.users[0].userID && scope.users[0].userID !== gUser.userID) ||
(scope.liveProfileID && scope.users[0] && scope.users[0].sysID !== scope.liveProfileID)) {
scope.contextOptions.push(["Open a new chat", function () {
snConnectService.openWithProfile(scope.users[0]);
}]);
}
}
} else {
scope.contextOptions = [];
}
};
},
controller: function($scope, liveProfileID) {
var firstBuildAvatar = true;
$scope.displayMemberCount = $scope.displayMemberCount || false;
$scope.liveProfileID = liveProfileID;
$scope.$watch('primary', function(newValue, oldValue) {
if ($scope.primary && newValue !== oldValue) {
if(!firstBuildAvatar)
buildAvatar();
if ($scope.contextOptions.length > 0) {
$scope.contextOptions = [
["Open user's profile", function () {
if ($scope.users && $scope.users.length > 0) {
window.location.href = 'sys_user.do?sys_id=' + $scope.users[0].userID || $scope.users[0].userID;
}
}]];
var gUser = null;
try {
gUser = g_user;
} catch (err) {
}
if ((!gUser && !liveProfileID) || ($scope.users && $scope.users.length === 1 && $scope.users[0])) {
if ((gUser && $scope.users[0].userID && $scope.users[0].userID !== gUser.userID) ||
($scope.liveProfileID && $scope.users[0] && $scope.users[0].sysID !== $scope.liveProfileID)) {
$scope.contextOptions.push(["Open a new chat", function () {
snConnectService.openWithProfile($scope.users[0]);
}]);
}
}
}
}
});
$scope.$watch('members', function() {
if ($scope.members && !firstBuildAvatar)
buildAvatar();
});
$scope.avatarType = function() {
var result = [];
if($scope.groupAvatar || !$scope.users)
return result;
if ($scope.users.length > 1)
result.push("group");
if ($scope.users.length === 2)
result.push("avatar-duo");
if ($scope.users.length === 3)
result.push("avatar-trio");
if ($scope.users.length >= 4)
result.push("avatar-quad");
return result;
};
$scope.getBackgroundStyle = function(user) {
var avatar = (user ? user.avatar  : '');
if ($scope.groupAvatar)
avatar = $scope.groupAvatar;
if (avatar && avatar !== '')
return { 'background-image' : 'url(' + avatar + ')' };
if (user && user.name)
return '';
return void(0);
};
$scope.maxStringWidth = function() {
var paddedWidth = parseInt($scope.avatarWidth * 0.8, 10);
return $scope.users.length === 1 ? paddedWidth : paddedWidth / 2;
};
function buildInitials(name) {
if (!name)
return "--";
var initials = name.split(" ").map(function(word) {
return word.toUpperCase();
}).filter(function(word) {
return word.match(/^[A-ZÀ-Ÿ]/);
}).map(function(word) {
return word.substring(0,1);
}).join("");
return (initials.length > 3)
? initials.substr(0, 3)
: initials;
}
$scope.avatartooltip = function() {
if (!$scope.enableTooltip) {
return '';
}
if (!$scope.users) {
return '';
}
var names = [];
$scope.users.forEach(function(user) {
if(!user) { return; }
names.push(user.name);
});
return names.join(', ');
};
function setPresence(){
$scope.presenceEnabled = $scope.showPresence && !$scope.isDocument && $scope.users.length === 1;
return $scope.presenceEnabled;
}
function buildAvatar() {
if(firstBuildAvatar)
firstBuildAvatar = false;
if (typeof $scope.primary === 'string') {
return $http.get('/api/now/live/profiles/sys_user.' + $scope.primary).then(function (response) {
$scope.users = [{
userID: $scope.primary,
name: response.data.result.name,
initials: buildInitials(response.data.result.name),
avatar: response.data.result.avatar
}];
return setPresence();
});
}
if ($scope.primary) {
if ($scope.primary.userImage)
$scope.primary.avatar = $scope.primary.userImage;
if (!$scope.primary.userID && $scope.primary.sys_id)
$scope.primary.userID = $scope.primary.sys_id;
}
$scope.isDocument = $scope.primary && $scope.primary.table && $scope.primary.table !== "sys_user" && $scope.primary.table !== "chat_queue_entry";
$scope.users = [$scope.primary];
if ($scope.primary && (!$scope.members || $scope.members.length <= 0) && ($scope.primary.avatar || $scope.primary.initials) && $scope.isDocument) {
$scope.users = [$scope.primary];
} else if ($scope.members && $scope.members.length > 0) {
$scope.users = buildCompositeAvatar($scope.members);
}
return $q.when(setPresence());
}
function buildCompositeAvatar(members) {
var currentUser = window.NOW.user ? window.NOW.user.userID : window.NOW.user_id;
var users = angular.isArray(members) ? members.slice() : [members];
users = users.sort(function(a, b) {
var aID = a.userID || a.document;
var bID = b.userID || b.document;
if (a.table === "chat_queue_entry")
return 1;
if (aID === currentUser)
return 1;
else if (bID === currentUser)
return -1;
return 0;
});
if (users.length === 2)
users = [users[0]];
if (users.length > 2 && $scope.primary && $scope.primary.name && $scope.primary.table === "sys_user") {
var index = -1;
angular.forEach(users, function(user, i) {
if (user.sys_id === $scope.primary.sys_id) {
index = i;
}
});
if (index > -1) {
users.splice(index, 1);
}
users.splice(1, 0, $scope.primary);
}
return users;
}
buildAvatar();
}
}
}
})
.directive('snAvatar', function(snAvatarFactory){
var directive = snAvatarFactory();
directive.templateUrl = 'snAvatar.tpl';
return directive;
})
.directive('snAvatarOnce', function (snAvatarFactory) {
var directive = snAvatarFactory();
directive.templateUrl = 'snAvatarSingleBinding.tpl';
return directive;
});
;
/*! RESOURCE: /scripts/sn/common/avatar/service.avatarProfilePersister.js */
angular.module('sn.common.avatar').service('avatarProfilePersister', function () {
"use strict";
var avatars = {};
function setAvatar (id, payload) {
avatars[id] = payload;
}
function getAvatar (id) {
return avatars[id];
}
return {
setAvatar: setAvatar,
getAvatar: getAvatar
}
});
;
/*! RESOURCE: /scripts/sn/common/avatar/directive.snUserAvatar.js */
angular.module('sn.common.avatar').directive('snUserAvatar', function(getTemplateUrl) {
"use strict";
return {
restrict: 'E',
templateUrl: getTemplateUrl('sn_user_avatar.xml'),
replace: true,
scope: {
profile: '=?',
userId: '=?',
avatarUrl: '=?',
initials: '=?',
enablePresence: '@',
disablePopover: '=?',
directConversationButton: '=?',
userName: '=?',
isAccessible: '=?'
},
link: function (scope, element) {
scope.evaluatedProfile = undefined;
scope.backgroundStyle = undefined;
scope.enablePresence = scope.enablePresence !== 'false';
if (scope.profile) {
scope.evaluatedProfile = scope.profile;
scope.userId = scope.profile.userID || "";
scope.avatarUrl = scope.profile.avatar || "";
scope.initials = scope.profile.initials || "";
scope.backgroundStyle = scope.getBackgroundStyle();
} else if (scope.userId || scope.avatarUrl || scope.initials || scope.userName) {
scope.evaluatedProfile = scope.profile = {
'userID': scope.userId || "",
'avatar': scope.avatarUrl || "",
'initials': scope.initials || "",
'userName': scope.userName || "",
'isAccessible': scope.isAccessible || false
};
scope.backgroundStyle = scope.getBackgroundStyle();
} else {
var unwatch = scope.$watch('profile', function (newVal) {
if (newVal) {
scope.evaluatedProfile = newVal;
scope.backgroundStyle = scope.getBackgroundStyle();
unwatch();
}
})
}
scope.directConversationButton = scope.directConversationButton !== 'false' && scope.directConversationButton !== false;
scope.template = '<sn-user-profile profile="evaluatedProfile" show-direct-message-prompt="::directConversationButton" class="avatar-popover avatar-popover-padding"></sn-user-profile>';
},
controller: function($scope) {
$scope.getBackgroundStyle = function() {
if ( ($scope.avatarUrl && $scope.avatarUrl !== '') || $scope.evaluatedProfile && $scope.evaluatedProfile.avatar !== '' )
return {"background-image": 'url(' + ($scope.avatarUrl || $scope.evaluatedProfile.avatar) + ')'};
return {"background-image": ""};
};
}
}
});
;
/*! RESOURCE: /scripts/sn/common/controls/js_includes_controls.js */
/*! RESOURCE: /scripts/sn/common/controls/_module.js */
angular.module('sn.common.controls', []);
;
/*! RESOURCE: /scripts/sn/common/controls/directive.snChoiceList.js */
angular.module('sn.common.controls').directive('snChoiceList', function($timeout) {
"use strict";
return {
restrict : 'E',
replace : true,
scope : {
snModel: "=",
snTextField: "@",
snValueField: "@",
snOptions: "=?",
snItems: "=?",
snOnChange: "&",
snDisabled: "=",
snDialogName: "="
},
template :
'<select ng-disabled="snDisabled" ' +
'        ng-model="model" ' +
'        ng-options="item[snValueField] as item[snTextField] for item in snItems">' +
'  <option value="" ng-show="snOptions.placeholder">{{snOptions.placeholder}}</option>' +
'</select>',
link : function (scope, element, attrs) {
if (scope.snDialogName)
scope.$on("dialog." + scope.snDialogName + ".close", function() {
$timeout(function() {
$(element).select2("destroy");
})
});
$(element).css("opacity", 0);
var config = {
width: "100%"
};
if (scope.snOptions){
if (scope.snOptions.placeholder){
config.placeholder = scope.snOptions.placeholder;
config.placeholderOption = "first";
}
if (scope.snOptions.hideSearch && scope.snOptions.hideSearch === true){
config.minimumResultsForSearch = -1;
}
}
function init(){
scope.model = scope.snModel;
render();
}
function render(){
if (!attrs){
$timeout(function(){render();});
return;
}
$timeout(function(){
$(element).css("opacity", 1);
$(element).select2("destroy");
$(element).select2(config);
});
}
init();
scope.$watch("snItems", function(newValue, oldValue){
if (newValue !== oldValue){
init();
}
}, true);
scope.$watch("snModel", function(newValue){
if (newValue !== undefined && newValue !== scope.model){
init();
}
});
scope.$watch("model", function(newValue, oldValue){
if (newValue !== oldValue){
scope.snModel = newValue;
if (scope.snOnChange)
scope.snOnChange({selectedValue:newValue});
}
});
scope.$on('$destroy', function() {
$(element).select2("destroy");
});
},
controller : function($scope) {
}
}
});
;
/*! RESOURCE: /scripts/sn/common/controls/directive.snReferencePicker.js */
angular.module('sn.common.controls').directive('snReferencePicker', function($timeout, $http, urlTools, filterExpressionParser, $sanitize, i18n) {
"use strict";
return {
restrict: 'E',
replace: true,
scope: {
ed: "=?",
field: "=",
refTable: "=?",
refId: "=?",
snOptions: "=?",
snOnChange: "&",
snOnBlur: "&",
snOnClose: "&",
snOnOpen: '&',
minimumInputLength : "@",
snDisabled: "=",
snPageSize: "@",
dropdownCssClass: "@",
formatResultCssClass: "&",
overlay: "=",
additionalDisplayColumns: "@",
displayColumn: "@",
recordValues: '&',
getGlideForm: '&glideForm',
domain: "@",
snSelectWidth: '@',
},
template: '<input type="text" name="{{field.name}}" ng-disabled="snDisabled" style="min-width: 150px;" ng-model="field.displayValue" />',
link: function(scope, element, attrs, ctrl) {
scope.ed = scope.ed || scope.field.ed;
scope.selectWidth = scope.snSelectWidth || '100%';
element.css("opacity", 0);
var fireReadyEvent = true;
var g_form;
if (angular.isDefined(scope.getGlideForm))
g_form = scope.getGlideForm();
var fieldAttributes = {};
if (angular.isDefined(scope.field) && angular.isDefined(scope.field.attributes) && typeof scope.ed.attributes == 'undefined')
if (Array.isArray(scope.field.attributes))
fieldAttributes = scope.field.attributes;
else
fieldAttributes = parseAttributes(scope.field.attributes);
else
fieldAttributes = parseAttributes(scope.ed.attributes);
if (!angular.isDefined(scope.additionalDisplayColumns) && angular.isDefined(fieldAttributes['ref_ac_columns']))
scope.additionalDisplayColumns = fieldAttributes['ref_ac_columns'];
var select2AjaxHelpers = {
formatSelection: function(item) {
return $sanitize(getDisplayValue(item));
},
formatResult: function(item) {
var displayValues = getDisplayValues(item);
if (displayValues.length == 1)
return $sanitize(displayValues[0]);
if (displayValues.length > 1) {
var width = 100 / displayValues.length;
var markup = "";
for (var i = 0; i < displayValues.length; i++)
markup += "<div style='width: " + width + "%;' class='select2-result-cell'>" + $sanitize(displayValues[i])  + "</div>";
return markup;
}
return "";
},
search: function(queryParams) {
if ('sysparm_include_variables' in queryParams.data) {
var url = urlTools.getURL('ref_list_data', queryParams.data);
return $http.get(url).then(queryParams.success);
}else {
var url = urlTools.getURL('ref_list_data');
return $http.post(url, queryParams.data).then(queryParams.success);
}
},
initSelection: function(elem, callback) {
if (scope.field.displayValue)
callback({
sys_id: scope.field.value,
name: scope.field.displayValue
});
}
};
var config = {
width : scope.selectWidth,
minimumInputLength: scope.minimumInputLength ? parseInt(scope.minimumInputLength, 10) : 0,
overlay: scope.overlay,
containerCssClass : 'select2-reference ng-form-element',
placeholder : '   ',
formatSearching: '',
allowClear: attrs.allowClear !== 'false',
id: function(item) {
return item.sys_id;
},
sortResults: (scope.snOptions && scope.snOptions.sortResults) ? scope.snOptions.sortResults : undefined,
ajax: {
quietMillis: NOW.ac_wait_time,
data: function(filterText, page) {
var q = _getReferenceQuery(filterText);
var params = {
start: (scope.pageSize * (page - 1)),
count: scope.pageSize,
sysparm_target_table: scope.refTable,
sysparm_target_sys_id: scope.refId,
sysparm_target_field: scope.ed.dependent_field || scope.ed.name,
table: scope.ed.reference,
qualifier: scope.ed.qualifier,
data_adapter: scope.ed.data_adapter,
attributes: scope.ed.attributes,
dependent_field: scope.ed.dependent_field,
dependent_table: scope.ed.dependent_table,
dependent_value: scope.ed.dependent_value,
p: scope.ed.reference + ';q:' + q + ';r:' + scope.ed.qualifier
};
if (scope.domain) {
params.sysparm_domain = scope.domain;
}
if (angular.isDefined(scope.field) && scope.field['_cat_variable'] === true){
delete params['sysparm_target_table'];
params['sysparm_include_variables'] = true;
params['variable_ids'] = scope.field.sys_id;
var getFieldSequence = g_form.$private.options('getFieldSequence');
if (getFieldSequence) {
params['variable_sequence1'] = getFieldSequence();
}
var itemSysId = g_form.$private.options('itemSysId');
params['sysparm_id'] = itemSysId;
var getFieldParams = g_form.$private.options('getFieldParams');
if (getFieldParams) {
angular.extend(params, getFieldParams());
}
}
if (scope.recordValues)
params.sysparm_record_values = scope.recordValues();
return params;
},
results: function(data, page) {
return ctrl.filterResults(data, page, scope.pageSize);
},
transport: select2AjaxHelpers.search
},
formatSelection: select2AjaxHelpers.formatSelection,
formatResult: select2AjaxHelpers.formatResult,
initSelection: select2AjaxHelpers.initSelection,
dropdownCssClass: attrs.dropdownCssClass,
formatResultCssClass: scope.formatResultCssClass || null
};
if (scope.snOptions) {
if (scope.snOptions.placeholder) {
config.placeholder = scope.snOptions.placeholder;
}
if (scope.snOptions.width) {
config.width = scope.snOptions.width;
}
}
function _getReferenceQuery(filterText) {
var filterExpression = filterExpressionParser.parse(filterText, scope.ed.defaultOperator);
var colToSearch = getReferenceColumnsToSearch();
var excludedValues = getExcludedValues();
return colToSearch.map(function(column) {
return column + filterExpression.operator + filterExpression.filterText +
'^' + column + 'ISNOTEMPTY' + excludedValues;
}).join("^NQ");
}
function getReferenceColumnsToSearch() {
var colName = ['name'];
if (scope.ed.searchField) {
colName = scope.ed.searchField.split(";");
} else if (fieldAttributes['ref_ac_columns_search'] == 'true' && 'ref_ac_columns' in fieldAttributes && fieldAttributes['ref_ac_columns'] != '') {
colName = fieldAttributes['ref_ac_columns'].split(';');
} else if (fieldAttributes['ref_ac_order_by']) {
colName = [fieldAttributes['ref_ac_order_by']];
}
return colName;
}
function getExcludedValues () {
if (scope.ed.excludeValues && scope.ed.excludeValues != '') {
return '^sys_idNOT IN' + scope.ed.excludeValues;
}
return '';
}
function parseAttributes(strAttributes) {
var attributeArray = (strAttributes && strAttributes.length ? strAttributes.split(',') : []);
var attributeObj = {};
for (var i = 0; i < attributeArray.length; i++) {
if (attributeArray[i].length > 0) {
var attribute = attributeArray[i].split('=');
attributeObj[attribute[0]] = attribute.length > 1 ? attribute[1] : '';
}
}
return attributeObj;
}
function init() {
scope.model = scope.snModel;
render();
}
function render() {
$timeout(function() {
i18n.getMessage('Searching...', function(searchingMsg) {
config.formatSearching = function() {
return searchingMsg;
};
});
element.css("opacity", 1);
element.select2("destroy");
var select2 = element.select2(config);
select2.bind("change", select2Change);
select2.bind("select2-removed", select2Change);
select2.bind("select2-blur", function() {
scope.$apply(function() {
scope.snOnBlur();
});
});
select2.bind("select2-close", function() {
scope.$apply(function() {
scope.snOnClose();
});
});
select2.bind("select2-open", function() {
scope.$apply(function() {
if (scope.snOnOpen)
scope.snOnOpen();
});
});
select2.bind('select2-focus', function() {
redirectLabel(element);
});
if (fireReadyEvent) {
scope.$emit('select2.ready', element);
fireReadyEvent = false;
}
});
}
function select2Change(e) {
e.stopImmediatePropagation();
if (e.added) {
if (scope.$$phase || scope.$root.$$phase)
return;
var selectedItem = e.added;
var value = selectedItem.sys_id;
var displayValue = value ? getDisplayValue(selectedItem) : '';
if (scope.snOptions && scope.snOptions.useGlideForm === true) {
g_form.setValue(scope.field.name, value, displayValue);
scope.rowSelected();
e.displayValue = displayValue;
triggerSnOnChange();
} else {
scope.$apply(function() {
scope.field.value = value;
scope.field.displayValue = displayValue;
scope.rowSelected();
e.displayValue = displayValue;
triggerSnOnChange();
});
}
} else if (e.removed) {
if (scope.snOptions && scope.snOptions.useGlideForm === true) {
g_form.clearValue(scope.field.name);
triggerSnOnChange();
} else {
scope.$apply(function() {
scope.field.displayValue = '';
scope.field.value = '';
triggerSnOnChange();
});
}
}
function triggerSnOnChange(){
if (scope.snOnChange)
scope.snOnChange(e);
}
}
function redirectLabel($select2) {
if (NOW.select2LabelWorkaround)
NOW.select2LabelWorkaround($select2);
}
function getDisplayValue(selectedItem) {
var displayValue = '';
if (selectedItem && selectedItem.sys_id) {
if (scope.displayColumn && typeof selectedItem[scope.displayColumn] != "undefined")
displayValue = selectedItem[scope.displayColumn];
else if (selectedItem.$$displayValue)
displayValue = selectedItem.$$displayValue;
else if (selectedItem.name)
displayValue = selectedItem.name;
else if (selectedItem.title)
displayValue = selectedItem.title;
}
return displayValue;
}
function getDisplayValues(selectedItem) {
var displayValues = [];
if (selectedItem && selectedItem.sys_id) {
var current = "";
if (scope.displayColumn && typeof selectedItem[scope.displayColumn] != "undefined")
current = selectedItem[scope.displayColumn];
else if (selectedItem.$$displayValue)
current = selectedItem.$$displayValue;
else if (selectedItem.name)
current = selectedItem.name;
else if (selectedItem.title)
current = selectedItem.title;
displayValues.push(current);
}
if (scope.additionalDisplayColumns) {
var columns = scope.additionalDisplayColumns.split(",");
for (var i = 0; i < columns.length; i++) {
var column = columns[i];
if (selectedItem[column])
displayValues.push(selectedItem[column]);
}
}
return displayValues;
}
scope.$watch("field.displayValue", function(newValue, oldValue) {
if (newValue != oldValue && newValue !== scope.model) {
init();
}
});
scope.$on("snReferencePicker.activate", function(evt, parms) {
$timeout(function() {
element.select2("open");
})
});
init();
},
controller: function($scope, $rootScope) {
$scope.pageSize = 20;
if ($scope.snPageSize)
$scope.pageSize = parseInt($scope.snPageSize);
$scope.rowSelected = function() {
$rootScope.$broadcast("@page.reference.selected", {
field: $scope.field,
ed: $scope.ed
});
};
this.filterResults = function(data, page) {
return {
results: data.data.items,
more: (page * $scope.pageSize < data.data.total)
};
};
}
};
});
;
/*! RESOURCE: /scripts/sn/common/controls/directive.snRecordPicker.js */
angular.module('sn.common.controls').directive('snRecordPicker', function($timeout, $http, urlTools, filterExpressionParser, $sanitize, i18n) {
"use strict";
var cache = {};
function cleanLabel(val) {
if (typeof val == "object")
return "";
return typeof val == "string" ? val.trim() : val;
}
return {
restrict: 'E',
replace: true,
scope: {
field: '=',
table: '=',
defaultQuery: '=?',
startswith: '=?',
searchFields: '=?',
valueField: '=?',
displayField: '=?',
displayFields: '=?',
pageSize: '=?',
onChange: '&',
snDisabled: '=',
multiple: '=?',
options: '=?',
placeholder: '@'
},
template: '<input type="text" ng-disabled="snDisabled" style="min-width: 150px;" name="{{field.name}}" ng-model="field.value" />',
controller: function($scope) {
if (!angular.isNumber($scope.pageSize))
$scope.pageSize = 20;
if (!angular.isDefined($scope.valueField))
$scope.valueField = 'sys_id';
this.filterResults = function(data, page) {
return {
results: data.data.result,
more: (page * $scope.pageSize < parseInt(data.headers('x-total-count'), 10))
};
};
},
link: function(scope, element, attrs, ctrl) {
var isExecuting = false;
var select2Helpers = {
formatSelection: function(item) {
return $sanitize(getDisplayValue(item));
},
formatResult: function(item) {
var displayFields = getdisplayFields(item);
if (displayFields.length == 1)
return $sanitize(cleanLabel(displayFields[0]));
if (displayFields.length > 1) {
var markup = $sanitize(displayFields[0]);
var width = 100 / (displayFields.length - 1);
markup += "<div>";
for (var i = 1; i < displayFields.length; i++)
markup += "<div style='width: " + width + "%;' class='select2-additional-display-field'>" + $sanitize(cleanLabel(displayFields[i]))  + "</div>";
markup += "</div>";
return markup;
}
return "";
},
search: function(queryParams) {
var url = '/api/now/table/' + scope.table + '?' + urlTools.encodeURIParameters(queryParams.data);
if (scope.options && scope.options.cache && cache[url])
return queryParams.success(cache[url]);
return $http.get(url).then(function(response) {
if (scope.options && scope.options.cache) {
cache[url] = response;
}
return queryParams.success(response)
});
},
initSelection: function(elem, callback) {
if (scope.field.displayValue) {
if (scope.multiple){
var items = [], sel;
var values = scope.field.value.split(',');
var displayValues = scope.field.displayValue.split(',');
for(var i=0; i<values.length; i++){
sel = {};
sel[scope.valueField] = values[i];
sel[scope.displayField] = displayValues[i];
items.push(sel);
}
callback(items);
}
else {
var sel = {};
sel[scope.valueField] = scope.field.value;
sel[scope.displayField] = scope.field.displayValue;
callback(sel);
}
} else
callback([]);
}
};
var config = {
width : '100%',
containerCssClass : 'select2-reference ng-form-element',
placeholder : scope.placeholder || '    ',
formatSearching: '',
allowClear: (scope.options && typeof scope.options.allowClear !== "undefined") ? scope.options.allowClear : true,
id: function(item) {
return item[scope.valueField];
},
ajax: {
quietMillis: NOW.ac_wait_time,
data: function(filterText, page) {
var params = {
sysparm_offset: (scope.pageSize * (page - 1)),
sysparm_limit: scope.pageSize,
sysparm_query: buildQuery(filterText, scope.searchFields, scope.defaultQuery)
};
return params;
},
results: function(data, page) {
return ctrl.filterResults(data, page, scope.pageSize);
},
transport: select2Helpers.search
},
formatSelection: select2Helpers.formatSelection,
formatResult: select2Helpers.formatResult,
formatResultCssClass: function(){ return ''; },
initSelection: select2Helpers.initSelection,
multiple: scope.multiple
};
function buildQuery(filterText, searchFields, defaultQuery) {
var queryParts = [];
var operator = "CONTAINS";
if (scope.startswith)
operator = "STARTSWITH";
if (filterText.startsWith("*")) {
filterText = filterText.substring(1);
operator = "CONTAINS";
}
if (defaultQuery)
queryParts.push(defaultQuery);
var filterExpression = filterExpressionParser.parse(filterText, operator);
if (searchFields != null) {
var fields = searchFields.split(',');
if (filterExpression.filterText != '') {
var OR = "";
for (var i = 0; i < fields.length; i++) {
queryParts.push(OR + fields[i] + filterExpression.operator + filterExpression.filterText);
OR = "OR";
}
}
for (var i = 0; i < fields.length; i++)
queryParts.push('ORDERBY' + fields[i]);
queryParts.push('EQ');
}
return queryParts.join('^');
}
scope.field = scope.field || {};
var initTimeout = null;
var value = scope.field.value;
var oldValue = scope.field.value;
var $select;
function init() {
element.css("opacity", 0);
$timeout.cancel(initTimeout);
initTimeout = $timeout(function() {
i18n.getMessage('Searching...', function(searchingMsg) {
config.formatSearching = function() {
return searchingMsg;
};
});
element.css("opacity", 1);
element.select2("destroy");
$select = element.select2(config);
$select.bind("change", onChanged);
$select.bind("select2-removed", onChanged);
$select.bind("select2-selecting", onSelecting);
$select.bind("select2-removing", onRemoving);
scope.$emit('select2.ready', element);
});
}
function onSelecting(e) {
isExecuting = true;
oldValue = scope.field.value;
var selectedItem = e.choice;
if (scope.multiple && selectedItem[scope.valueField] != '') {
var values = !scope.field.value ? [] : scope.field.value.split(',');
var displayValues = !scope.field.displayValue ? [] : scope.field.displayValue.split(',');
values.push(selectedItem[scope.valueField]);
displayValues.push(getDisplayValue(selectedItem));
scope.field.value = values.join(',');
scope.field.displayValue = displayValues.join(',');
e.preventDefault();
$select.select2('val', values).select2('close');
scope.$apply(function() {
callChange(oldValue, e);
});
}
}
function onRemoving(e) {
isExecuting = true;
oldValue = scope.field.value;
var removed = e.choice;
if (scope.multiple){
var values = scope.field.value.split(',');
var displayValues = scope.field.displayValue.split(',');
for(var i = values.length-1; i>=0; i--){
if (removed[scope.valueField] == values[i]) {
values.splice(i, 1);
displayValues.splice(i, 1);
break;
}
}
scope.field.value = values.join(',');
scope.field.displayValue = displayValues.join(',');
e.preventDefault();
$select.select2('val', scope.field.value.split(','));
scope.$apply(function() {
callChange(oldValue, e);
});
}
}
function callChange(oldValue, e) {
var f = scope.field;
var p = {
field: f,
newValue: f.value,
oldValue: oldValue,
displayValue: f.displayValue
}
scope.$emit("field.change", p);
scope.$emit("field.change." + f.name, p);
if (scope.onChange)
try {
scope.onChange(e);
} catch(ex) {
console.log("directive.snRecordPicker error in onChange")
console.log(ex)
}
isExecuting = false;
}
function onChanged(e) {
e.stopImmediatePropagation();
if (scope.$$phase || scope.$root.$$phase) {
console.warn('in digest, returning early');
return;
}
if (e.added) {
var selectedItem = e.added;
if (!scope.multiple){
scope.field.value = selectedItem[scope.valueField];
if (scope.field.value) {
scope.field.displayValue = getDisplayValue(selectedItem);
} else
scope.field.displayValue = '';
}
} else if (e.removed) {
if (!scope.multiple) {
scope.field.displayValue = '';
scope.field.value = '';
}
}
scope.$apply(function() {
callChange(oldValue, e);
});
}
function getDisplayValue(selectedItem) {
var displayValue = selectedItem[scope.valueField];
if (selectedItem) {
if (scope.displayField && angular.isDefined(selectedItem[scope.displayField]))
displayValue = selectedItem[scope.displayField];
else if (selectedItem.name)
displayValue = selectedItem.name;
else if (selectedItem.title)
displayValue = selectedItem.title;
}
return cleanLabel(displayValue);
}
function getdisplayFields(selectedItem) {
var displayFields = [];
if (selectedItem && selectedItem[scope.valueField]) {
var current = "";
if (scope.displayField && angular.isDefined(selectedItem[scope.displayField]))
current = selectedItem[scope.displayField];
else if (selectedItem.name)
current = selectedItem.name;
else if (selectedItem.title)
current = selectedItem.title;
displayFields.push(current);
}
if (scope.displayFields) {
var columns = scope.displayFields.split(",");
for (var i = 0; i < columns.length; i++) {
var column = columns[i];
if (selectedItem[column])
displayFields.push(selectedItem[column]);
}
}
return displayFields;
}
scope.$watch("field.value", function(newValue) {
if (isExecuting) return;
if (angular.isDefined(newValue) && $select) {
if (scope.multiple)
$select.select2('val', newValue.split(',')).select2('close');
else
$select.select2('val', newValue).select2('close');
}
});
if (attrs.displayValue) {
attrs.$observe('displayValue', function(value){
scope.field.value = value;
});
}
init();
}
};
});
;
/*! RESOURCE: /scripts/sn/common/controls/directive.snSelectBasic.js */
angular.module('sn.common.controls').directive('snSelectBasic', function($timeout) {
return {
restrict: 'C',
priority: 1,
require: '?ngModel',
scope: {
'snAllowClear': '@',
'snSelectWidth': '@',
'snChoices': '=?'
},
link: function (scope, element, attrs, ngModel) {
if (angular.isFunction(element.select2)) {
element.css("opacity", 0);
scope.selectWidth = scope.snSelectWidth || '100%';
scope.selectAllowClear = scope.snAllowClear === "true";
$timeout(function(){
element.css("opacity", 1);
element.select2({
allowClear: scope.selectAllowClear,
width: scope.selectWidth
});
if (ngModel === null)
return;
ngModel.$render = function(){
element.select2('val', ngModel.$viewValue);
element.val(ngModel.$viewValue);
};
});
element.on('change', function() {
scope.$evalAsync(setModelValue);
});
scope.$watch('snChoices', function(newValue, oldValue){
if (angular.isDefined(newValue) && newValue != oldValue) {
$timeout(function(){
setModelValue();
});
}
}, true);
function setModelValue(){
if (ngModel === null)
return;
ngModel.$setViewValue(element.val());
}
}
}
};
});
;
/*! RESOURCE: /scripts/sn/common/controls/directive.snTableReference.js */
angular.module('sn.common.controls').directive('snTableReference', function($timeout) {
"use strict";
return {
restrict: 'E',
replace: true,
scope: {
field: "=",
snChange: "&",
snDisabled: "="
},
template: '<select ng-disabled="snDisabled" style="min-width: 150px;" name="{{::field.name}}" ng-model="fieldValue" ng-model-options="{getterSetter: true}" ng-options="choice.value as choice.label for choice in field.choices"></select>',
controller: function($scope){
$scope.fieldValue = function(selected){
if (angular.isDefined(selected)) {
$scope.snChange({ newValue: selected });
}
return $scope.field.value;
}
},
link: function(scope, element) {
var initTimeout = null;
var fireReadyEvent = true;
element.css("opacity", 0);
function render() {
$timeout.cancel(initTimeout);
initTimeout = $timeout(function() {
element.css("opacity", 1);
element.select2("destroy");
element.select2();
if (fireReadyEvent) {
scope.$emit('select2.ready', element);
fireReadyEvent = false;
}
});
}
scope.$watch("field.displayValue", function(newValue, oldValue) {
if (newValue !== undefined && newValue != oldValue) {
render();
}
});
render();
}
};
});
;
/*! RESOURCE: /scripts/sn/common/controls/directive.snFieldReference.js */
angular.module('sn.common.controls').directive('snFieldReference', function($timeout, $http, nowServer) {
"use strict";
return {
restrict: 'E',
replace: true,
scope: {
field: "=",
snChange: "&",
snDisabled: "=",
getGlideForm: '&glideForm'
},
template: '<select ng-disabled="snDisabled" name="{{field.name}}" style="min-width: 150px;" ng-model="fieldValue" ng-model-options="{getterSetter: true}" ng-options="choice.name as choice.label for choice in field.choices"></select>',
controller: function($scope){
$scope.fieldValue = function(selected){
if (angular.isDefined(selected))
$scope.snChange({ newValue: selected });
return $scope.field.value;
}
$scope.$watch('field.dependentValue', function(newVal, oldVal){
if (!angular.isDefined(newVal))
return;
var src = nowServer.getURL('table_fields', 'exclude_formatters=true&fd_table=' + newVal);
$http.post(src).success(function(response) {
$scope.field.choices = response;
$scope.render();
});
});
},
link: function(scope, element) {
var initTimeout = null;
var fireReadyEvent = true;
scope.render = function() {
$timeout.cancel(initTimeout);
initTimeout = $timeout(function() {
element.select2("destroy");
element.select2();
if (fireReadyEvent) {
scope.$emit('select2.ready', element);
fireReadyEvent = false;
}
});
};
scope.$watch("field.displayValue", function(newValue, oldValue) {
if (newValue !== undefined && newValue != oldValue) {
scope.render();
}
});
scope.render();
}
};
});
;
/*! RESOURCE: /scripts/sn/common/controls/directive.snSyncWith.js */
angular.module("sn.common.controls").directive('snSyncWith', function() {
return {
restrict: 'A',
require: 'ngModel',
link: function (scope, elem, attr) {
var journalField = scope.$eval(attr.snSyncWith);
var journalValue =  scope.$eval(attr.ngModel);
if(attr.snSyncWithValueInFn)
scope.$eval(attr.ngModel + "=" + attr.snSyncWithValueInFn, {text: scope.value});
scope.$watch(function() {
return scope.$eval(attr.snSyncWith);
}, function(nv, ov) {
if (nv !== ov)
journalField = nv;
});
scope.$watch(function() {
return scope.$eval(attr.ngModel);
}, function(nv, ov) {
if (nv !== ov)
journalValue = nv;
});
if (!window.g_form)
return;
scope.$watch(function(){
return journalValue;
}, function (n, o) {
if (n !== o)
setFieldValue();
});
function setFieldValue() {
setValue(journalField, journalValue);
}
function setValue(field, value) {
value = !!value ? value : '';
var control = g_form.getControl(field);
if(attr.snSyncWithValueOutFn)
value = scope.$eval(attr.snSyncWithValueOutFn,  {text: value})
control.value = value;
onChange(control.id);
}
scope.$watch(function(){
return journalField;
}, function(newValue, oldValue) {
if (newValue !== oldValue){
if (oldValue)
setValue(oldValue, '');
if (newValue)
setFieldValue();
}
}, true);
}
};
});
;
/*! RESOURCE: /scripts/sn/common/controls/directive.contenteditable.js */
angular.module('sn.common.controls').directive('contenteditable', function($timeout, $sanitize) {
return {
require: 'ngModel',
link: function(scope, elem, attrs, ctrl) {
var changehandler = scope.changehandler;
scope.usenewline = scope.usenewline + "" != "false";
var newLine = "\n";
var nodeBR = "BR";
var nodeDIV = "DIV";
var nodeText = "#text";
var nbspRegExp = new RegExp(String.fromCharCode(160), "g");
if (!scope.usenewline)
elem.keypress(function(event) {
if (event.which == "13") {
if (scope.entercallback)
scope.entercallback(elem);
event.preventDefault();
}
});
function processNodes(nodes) {
var val = "";
for (var i = 0; i < nodes.length; i++) {
var node = nodes[i];
var follow = true;
switch (node.nodeName) {
case nodeText:
val += node.nodeValue.replace(nbspRegExp, " ");
break;
case nodeDIV:
val += newLine;
if (node.childNodes.length == 1 && node.childNodes[0].nodeName == nodeBR)
follow = false;
break;
case nodeBR:
val += scope.usenewline ? newLine : "";
}
if (follow)
val += processNodes(node.childNodes)
}
return val;
}
function readHtml() {
var val = processNodes(elem[0].childNodes);
ctrl.$setViewValue(val);
}
function writeHtml() {
var val = ctrl.$viewValue;
if (!val || val === null)
val = "";
val = val.replace(/\n/gi,	scope.usenewline ? "<br/>" : "");
val = val.replace(/  /gi,	" &nbsp;");
try {
if (attrs.contenteditableEscapeHtml == "true")
val = $sanitize(val);
} catch (err) {
var replacement = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;'};
val = val.replace(/[&<>"'\/]/g, function (pattern) {return replacement[pattern]});
};
elem.html(val);
}
function processPlaceholder() {
if (elem[0].dataset) {
if (elem[0].textContent)
elem[0].dataset.divPlaceholderContent = 'true';
else if (elem[0].dataset.divPlaceholderContent)
delete(elem[0].dataset.divPlaceholderContent);
}
}
elem.bind('keyup', function() {
scope.$apply(function() {
readHtml();
processPlaceholder();
});
});
function selectText(elem) {
var range;
var selection;
if (document.body.createTextRange) {
range = document.body.createTextRange();
range.moveToElementText(elem);
range.select();
} else if (window.getSelection) {
selection = window.getSelection();
range = document.createRange();
range.selectNodeContents(elem);
selection.removeAllRanges();
selection.addRange(range);
}
}
elem.bind('focus', function() {
if (scope[attrs.tracker] && scope[attrs.tracker]['isDefault_' + attrs.trackeratt])
$timeout(function() {
selectText(elem[0]);
});
elem.original = ctrl.$viewValue;
});
elem.bind('blur', function() {
scope.$apply(function() {
readHtml();
processPlaceholder();
if (elem.original != ctrl.$viewValue && changehandler) {
if (scope[attrs.tracker] && typeof scope[attrs.tracker]['isDefault_' + attrs.trackeratt] != "undefined")
scope[attrs.tracker]['isDefault_' + attrs.trackeratt] = false;
changehandler(scope[attrs.tracker], attrs.trackeratt);
}
});
});
elem.bind('paste', function() {
scope.$apply(function() {
setTimeout(function() {
readHtml();
writeHtml();
}, 0);
return false;
});
});
ctrl.$render = function() {
writeHtml();
};
scope.$watch('field.readonly', function(){
elem[0].contentEditable = !scope.$eval('field.readonly');
});
scope.$watch(
function () {
return {
val: elem[0].textContent
};
},
function (newValue, oldValue) {
if (newValue.val != oldValue.val)
processPlaceholder();
},
true);
writeHtml();
}
};
});
;
/*! RESOURCE: /scripts/sn/common/controls/directive.snGlyph.js */
angular.module("sn.common.controls").directive("snGlyph", function() {
"use strict";
return {
restrict : 'E',
replace : true,
scope : {
char : "@",
},
template : '<span class="glyphicon glyphicon-{{char}}" />',
link : function(scope) {}
}
});
angular.module("sn.common.controls").directive('fa', function () {
return {
restrict: 'E',
template: '<span class="fa" aria-hidden="true"></span>',
replace: true,
link: function (scope, element, attrs) {
'use strict';
var currentClasses = {};
function _observeStringAttr (attr, baseClass) {
var className;
attrs.$observe(attr, function () {
baseClass = baseClass || 'fa-' + attr;
element.removeClass(currentClasses[attr]);
if (attrs[attr]) {
className = [baseClass, attrs[attr]].join('-');
element.addClass(className);
currentClasses[attr] = className;
}
});
}
_observeStringAttr('name', 'fa');
_observeStringAttr('rotate');
_observeStringAttr('flip');
_observeStringAttr('stack');
attrs.$observe('size', function () {
var className;
element.removeClass(currentClasses.size);
if (attrs.size === 'large') {
className = 'fa-lg';
} else if (!isNaN(parseInt(attrs.size, 10))) {
className = 'fa-' + attrs.size + 'x';
}
element.addClass(className);
currentClasses.size = className;
});
attrs.$observe('stack', function () {
var className;
element.removeClass(currentClasses.stack);
if (attrs.stack === 'large') {
className = 'fa-stack-lg';
} else if (!isNaN(parseInt(attrs.stack, 10))) {
className = 'fa-stack-' + attrs.stack + 'x';
}
element.addClass(className);
currentClasses.stack = className;
});
function _observeBooleanAttr (attr, className) {
var value;
attrs.$observe(attr, function () {
className = className || 'fa-' + attr;
value = attr in attrs && attrs[attr] !== 'false' && attrs[attr] !== false;
element.toggleClass(className, value);
});
}
_observeBooleanAttr('border');
_observeBooleanAttr('fw');
_observeBooleanAttr('inverse');
_observeBooleanAttr('spin');
element.toggleClass('fa-li',
element.parent() &&
element.parent().prop('tagName') === 'LI' &&
element.parent().parent() &&
element.parent().parent().hasClass('fa-ul') &&
element.parent().children()[0] === element[0] &&
attrs.list !== 'false' &&
attrs.list !== false
);
attrs.$observe('alt', function () {
var altText = attrs.alt,
altElem = element.next(),
altElemClass = 'fa-alt-text';
if (altText) {
element.removeAttr('alt');
if (!altElem || !altElem.hasClass(altElemClass)) {
element.after('<span class="sr-only fa-alt-text"></span>');
altElem = element.next();
}
altElem.text(altText);
} else if (altElem && altElem.hasClass(altElemClass)) {
altElem.remove();
}
});
}
};
})
.directive('faStack', function () {
return {
restrict: 'E',
transclude: true,
template: '<span ng-transclude class="fa-stack fa-lg"></span>',
replace: true,
link: function (scope, element, attrs) {
var currentClasses = {};
function _observeStringAttr (attr, baseClass) {
var className;
attrs.$observe(attr, function () {
baseClass = baseClass || 'fa-' + attr;
element.removeClass(currentClasses[attr]);
if (attrs[attr]) {
className = [baseClass, attrs[attr]].join('-');
element.addClass(className);
currentClasses[attr] = className;
}
});
}
_observeStringAttr('size');
attrs.$observe('size', function () {
var className;
element.removeClass(currentClasses.size);
if (attrs.size === 'large') {
className = 'fa-lg';
} else if (!isNaN(parseInt(attrs.size, 10))) {
className = 'fa-' + attrs.size + 'x';
}
element.addClass(className);
currentClasses.size = className;
});
}
};
});
;
/*! RESOURCE: /scripts/sn/common/controls/directive.snImageUploader.js */
angular.module('sn.common.controls').directive('snImageUploader', function($window, $rootScope, $timeout, getTemplateUrl, i18n, snAttachmentHandler) {
var DRAG_IMAGE_SELECT = i18n.getMessage('Drag image or click to select');
return {
restrict: 'E',
replace: true,
templateUrl: getTemplateUrl('directive.snImageUploader'),
transclude: true,
scope: {
readOnly: '@',
tableName: '@',
sysId: '@',
fieldName: '@',
onUpload: '&',
onDelete: '&',
uploadMessage: '@',
src: '='
},
controller: function($scope) {
$scope.uploading = false;
$scope.getTitle = function() {
if($scope.readOnly !== 'true')
return DRAG_IMAGE_SELECT;
return '';
}
},
link: function(scope, element) {
function isValidImage(file) {
if (file.type.indexOf('image') != 0) {
$alert(i18n.getMessage('Please select an image'));
return false;
}
if (file.type.indexOf('tiff') > 0) {
$alert(i18n.getMessage('Please select a common image format such as gif, jpeg or png'));
return false;
}
return true;
}
function $alert(message) {
alert(message);
}
scope.onFileSelect = function($files) {
if (scope.readOnly === 'true')
return;
if ($files.length == 0)
return;
var file = $files[0];
if(!isValidImage(file))
return;
var uploadParams = {
sysparm_fieldname: scope.fieldName
};
scope.uploading = true;
snAttachmentHandler.create(scope.tableName, scope.sysId).uploadAttachment(file, uploadParams).then(function(response) {
$timeout(function() {
scope.uploading = false;
});
if (scope.onUpload)
scope.onUpload({thumbnail: response.thumbnail});
$rootScope.$broadcast("snImageUploader:complete", scope.sysId, response);
});
}
scope.openFileSelector = function($event) {
$event.stopPropagation();
var input = element.find('input[type=file]');
input.click();
}
scope.activateUpload = function($event) {
if (scope.readOnly !== 'true')
scope.openFileSelector($event);
else
scope.showUpload = !scope.showUpload;
}
scope.deleteAttachment = function () {
var sys_id = scope.src.split(".")[0];
snAttachmentHandler.deleteAttachment(sys_id).then(function () {
scope.src = null;
if (scope.onDelete)
scope.onDelete();
$rootScope.$broadcast("snImageUploader:delete", scope.sysId, sys_id);
});
}
}
}
});
;
;
/*! RESOURCE: /scripts/sn/common/i18n/js_includes_i18n.js */
/*! RESOURCE: /scripts/sn/common/i18n/_module.js */
angular.module('sn.common.i18n', ['sn.common.glide']);
angular.module('sn.i18n', ['sn.common.i18n']);
;
/*! RESOURCE: /scripts/sn/common/i18n/directive.snBindI18n.js */
angular.module('sn.common.i18n').directive('snBindI18n', function(i18n, $sanitize) {
return {
restrict: 'A',
link : function(scope, iElem, iAttrs) {
i18n.getMessage(iAttrs.snBindI18n, function(translatedValue) {
var sanitizedValue = $sanitize(translatedValue);
iElem.append(sanitizedValue);
});
}
}
});
;
/*! RESOURCE: /scripts/sn/common/i18n/directive.message.js */
angular.module('sn.common.i18n').directive('nowMessage', function(i18n) {
return {
restrict: 'E',
priority: 0,
template: '',
replace: true,
compile: function(element, attrs, transclude) {
var value = element.attr('value');
if (!attrs.key || !value)
return;
i18n.loadMessage(attrs.key, value);
}
};
});
;
/*! RESOURCE: /scripts/sn/common/i18n/service.i18n.js */
angular.module('sn.common.i18n').provider('i18n', function() {
var messageMap = {};
function loadMessage(msgKey, msgValue) {
messageMap[msgKey] = msgValue;
}
this.preloadMessages = function(messages) {
angular.forEach(messages, function(key, val) {
loadMessage(key, val);
});
};
function interpolate(param) {
return this.replace(/{([^{}]*)}/g,
function (a, b) {
var r = param[b];
return typeof r === 'string' || typeof r === 'number' ? r : a;
}
);
}
if (!String.prototype.withValues)
String.prototype.withValues = interpolate;
this.$get = function(nowServer, $http, $window, $log) {
var isDebug = $window.NOW ? $window.NOW.i18n_debug : true;
function debug(msg) {
if (!isDebug)
return;
$log.log('i18n: ' + msg);
}
function getMessageFromServer( msgKey, callback) {
getMessagesFromServer([msgKey], function() {
if (callback)
callback(messageMap[msgKey]);
});
}
function getMessagesFromServer( msgArray, callback,  msgArrayFull) {
var url = nowServer.getURL('message');
$http.post(url, { messages: msgArray }).success(function(response) {
var messages = response.messages;
for (var i in messages) {
loadMessage(i, messages[i]);
}
var returnMessages = {},
allMessages = msgArrayFull || msgArray;
for (var j = 0; j < allMessages.length; j++) {
var key = allMessages[j];
returnMessages[key] = messageMap[key];
}
if (callback)
callback(returnMessages);
});
}
return {
getMessage: function( msgKey, callback) {
debug('getMessage: Checking for ' + msgKey);
if (messageMap.hasOwnProperty(msgKey)) {
var message = messageMap[msgKey];
if (typeof(callback) == 'function')
callback(message);
debug('getMessage: Found: ' + msgKey + ', message: ' + message);
return message;
}
debug('getMessage: Not found: ' + msgKey + ', querying server');
getMessageFromServer(msgKey, callback);
msgKey.withValues = interpolate;
if (typeof(callback) != 'function')
$log.warn('getMessage (key="' + msgKey + '"): synchronous use not supported in Mobile or Service Portal unless message is already cached');
return msgKey;
},
format: function(message) {
if(arguments.length == 1)
return message;
if(arguments.length == 2 && (typeof arguments[1] === 'object'))
return interpolate.call(message, arguments[1]);
return interpolate.call(message, [].slice.call(arguments, 1));
},
getMessages: function( msgArray, callback) {
debug('getMessages: Checking for ' + msgArray.join(','));
var results = {},
needMessage = [],
needServerRequest = false;
for (var i = 0; i < msgArray.length; i++) {
var key = msgArray[i];
if (!messageMap.hasOwnProperty(key)) {
debug('getMessages: Did not find ' + key);
needMessage.push(key);
needServerRequest = true;
results[key] = key;
continue;
}
results[key] = messageMap[key];
debug('getMessages: Found ' + key + ', message: ' + results[key]);
}
if (needServerRequest) {
debug('getMessages: Querying server for ' + needMessage.join(','));
getMessagesFromServer(needMessage, callback, msgArray);
} else if (typeof(callback) == 'function') {
debug('getMessages: Found all messages');
callback(results);
}
return results;
},
clearMessages: function() {
debug('clearMessages: clearing messages');
messageMap = {};
},
loadMessage: function(msgKey, msgValue) {
loadMessage(msgKey, msgValue);
debug('loadMessage: loaded key: ' + msgKey + ', value: ' + msgValue);
},
preloadMessages: function() {
var that = this
angular.element('now-message').each(function() {
var elem = angular.element(this);
that.loadMessage(elem.attr('key'), elem.attr('value'));
})
}
};
};
});
;
;
/*! RESOURCE: /scripts/sn/common/link/js_includes_link.js */
/*! RESOURCE: /scripts/sn/common/link/_module.js */
angular.module("sn.common.link", []);
;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContent.js */
angular.module('sn.common.link').directive('snLinkContent', function($compile, linkContentTypes) {
'use strict';
return {
restrict: 'E',
replace: true,
template: "<span />",
scope: {
link: "="
},
link: function(scope, elem) {
scope.isShowing = function() {
return (scope.link.isActive || scope.link.isUnauthorized) && !scope.link.isPending;
};
var linkDirective = linkContentTypes.forType(scope.link);
elem.attr(linkDirective, "");
elem.attr('ng-if', 'isShowing()');
$compile(elem)(scope);
}
}
});
;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentYoutube.js */
angular.module('sn.common.link').directive('snLinkContentYoutube', function(getTemplateUrl, $sce, inFrameSet) {
'use strict';
return {
restrict: 'A',
replace: true,
templateUrl: getTemplateUrl('snLinkContentYoutube.xml'),
scope: {
link: "="
},
controller: function($scope) {
$scope.playerActive = false;
$scope.width = (inFrameSet) ? '248px' : '500px';
$scope.height = (inFrameSet) ? '139px' : '281px';
$scope.showPlayer = function() {
$scope.playerActive = true;
};
$scope.getVideoEmbedLink = function() {
if ($scope.link.embedLink) {
var videoLink = $scope.link.embedLink + "?autoplay=1";
return $sce.trustAsHtml("<iframe width='" + $scope.width + "' height='" + $scope.height + "' autoplay='1' frameborder='0' allowfullscreen='' src='" + videoLink + "'></iframe>");
}
};
}
}
});
;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentSoundcloud.js */
angular.module('sn.common.link').directive('snLinkContentSoundcloud', function(getTemplateUrl, $sce, inFrameSet) {
'use strict';
return {
restrict: 'A',
replace: true,
templateUrl: getTemplateUrl('snLinkContentSoundcloud.xml'),
scope: {
link: "="
},
controller: function($scope) {
$scope.playerActive = false;
$scope.width = (inFrameSet) ? '248px' : '500px';
$scope.height = (inFrameSet) ? '139px' : '281px';
$scope.showPlayer = function() {
$scope.playerActive = true;
};
$scope.getVideoEmbedLink = function() {
if ($scope.link.embedLink) {
var videoLink = $scope.link.embedLink + "&amp;auto_play=true";
var width = (inFrameSet) ? 248 : 500;
return $sce.trustAsHtml("<iframe width='" + $scope.width + "' height='" + $scope.height + "' autoplay='1' frameborder='0' allowfullscreen='' src='" + videoLink + "'></iframe>");
}
};
}
}
});
;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentArticle.js */
angular.module('sn.common.link').directive('snLinkContentArticle', function(getTemplateUrl) {
'use strict';
return {
restrict: 'A',
replace: true,
templateUrl: getTemplateUrl('snLinkContentArticle.xml'),
scope: {
link: "="
},
controller: function($scope) {
$scope.backgroundImageStyle = $scope.link.imageLink
? {"background-image": 'url(' + $scope.link.imageLink + ')'}
: {};
$scope.isVisible = function() {
var link = $scope.link;
return !!link.shortDescription || !!link.imageLink;
};
$scope.hasDescription = function() {
var link = $scope.link;
return link.shortDescription && (link.shortDescription !== link.title);
};
}
}
});
;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentError.js */
angular.module('sn.common.link').directive('snLinkContentError', function(getTemplateUrl) {
'use strict';
return {
restrict: 'A',
replace: true,
templateUrl: getTemplateUrl('snLinkContentError.xml'),
scope: {
link: "="
},
controller: function($scope) {
}
}
});
;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentImage.js */
angular.module('sn.common.link').directive('snLinkContentImage', function(getTemplateUrl) {
'use strict';
return {
restrict: 'A',
replace: true,
templateUrl: getTemplateUrl('snLinkContentImage.xml'),
scope: {
link: "="
},
controller: function($scope) {
}
}
});
;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentAttachment.js */
angular.module('sn.common.link').directive('snLinkContentAttachment', function(getTemplateUrl) {
'use strict';
return {
restrict: 'EA',
replace: true,
templateUrl: getTemplateUrl('snLinkContentAttachment.xml'),
scope: {
attachment: '=',
link: '='
},
controller: function($scope, $element, snCustomEvent) {
$scope.attachment = $scope.attachment || $scope.link.attachment;
$scope.calcImageSize = function() {
var imageWidth = $scope.width;
var imageHeight = $scope.height;
var MAX_IMAGE_SIZE = $element.width() < 298 ? $element.width() : 298;
if (imageHeight < 0 || imageWidth < 0)
return "";
if (imageHeight > imageWidth) {
if (imageHeight >= MAX_IMAGE_SIZE) {
imageWidth *= MAX_IMAGE_SIZE / imageHeight;
imageHeight = MAX_IMAGE_SIZE;
}
} else {
if (imageWidth >= MAX_IMAGE_SIZE) {
imageHeight *= MAX_IMAGE_SIZE / imageWidth;
imageWidth = MAX_IMAGE_SIZE
}
}
return "height: " + imageHeight + "px; width: " + imageWidth + "px;";
};
$scope.aspectRatioClass = function() {
return ($scope.height > $scope.width) ? 'limit-height' : 'limit-width';
};
$scope.showImage = function(event) {
if (event.keyCode === 9)
return;
snCustomEvent.fire('sn.attachment.preview', event, $scope.attachment.rawData);
};
}
}
});
;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentRecord.js */
angular.module('sn.common.link').directive('snLinkContentRecord', function(getTemplateUrl) {
'use strict';
return {
restrict: 'A',
replace: true,
templateUrl: getTemplateUrl('snLinkContentRecord.xml'),
scope: {
link: '='
},
controller: function($scope) {
$scope.isTitleVisible = function() {
return !$scope.isDescriptionVisible() && $scope.link.title;
};
$scope.isDescriptionVisible = function() {
return $scope.link.shortDescription;
};
$scope.hasNoHeader = function() {
return !$scope.isTitleVisible() && !$scope.isDescriptionVisible();
};
$scope.isUnassigned = function() {
return $scope.link.isTask && !$scope.link.avatarID;
};
}
}
});
;
/*! RESOURCE: /scripts/sn/common/link/provider.linkContentTypes.js */
angular.module('sn.common.link').provider('linkContentTypes', function linkContentTypesProvider() {
"use strict";
var linkDirectiveMap = {
'record' : "sn-link-content-record",
'attachment' : "sn-link-content-attachment",
'video' : "sn-link-content-youtube",
'music.song': "sn-link-content-soundcloud",
'link'   : 'sn-link-content-article',
'article': 'sn-link-content-article',
'website': 'sn-link-content-article',
'image': 'sn-link-content-image'
};
this.$get = function linkContentTypesFactory() {
return {
forType: function(link) {
if (link.isUnauthorized)
return "sn-link-content-error";
return linkDirectiveMap[link.type] || "no-card";
}
}
};
});
;
;
/*! RESOURCE: /scripts/sn/common/mention/js_includes_mention.js */
/*! RESOURCE: /scripts/sn/common/mention/_module.js */
angular.module("sn.common.mention", []);
;
/*! RESOURCE: /scripts/sn/common/mention/directive.snMentionPopover.js */
angular.module('sn.common.mention').directive("snMentionPopover", function(getTemplateUrl, $timeout) {
'use strict';
return {
restrict: 'E',
replace: true,
templateUrl: getTemplateUrl('snMentionPopover.xml'),
link: function(scope, elem, $attrs) {
elem.detach().appendTo(document.body);
scope.dontPositionManually = scope.$eval($attrs.dontpositionmanually) || false;
scope.onClick = function(event) {
if (!angular.element(event.target).closest("#mention-popover").length
|| angular.element(event.target).closest("#direct-message-popover-trigger").length) {
scope.$evalAsync(function() {
scope.$parent.showPopover = false;
scope.$emit("snMentionPopover.showPopoverIsFalse");
if (scope.dontPositionManually && !(scope.$eval($attrs.snavatarpopover))) {
elem.remove();
} else {
scope.$broadcast("sn-avatar-popover-destroy");
}
angular.element('.popover').each(function () {
var object = angular.element(this);
if (object.popover) {
object.popover('hide');
}
})
});
}
};
scope.clickListener = $timeout(function() {
angular.element('html').on('click.mentionPopover', scope.onClick);
}, 0, false);
scope.$on('sn-bootstrap-popover.close-other-popovers', scope.onClick);
function setPopoverPosition(clickX, clickY) {
var topPosition;
var leftPosition;
var windowHeight = window.innerHeight;
var windowWidth  = window.innerWidth;
if (((clickY - (elem.height() / 2))) < 10)
topPosition = 10;
else
topPosition = ((clickY + (elem.height() / 2)) > windowHeight) ? windowHeight - elem.height() - 15 : clickY - (elem.height() / 2);
leftPosition = ((clickX + 20 + (elem.width())) > windowWidth) ? windowWidth - elem.width() - 15: clickX  + 20;
elem.css("top", topPosition + "px").css("left", leftPosition + "px");
}
if (!scope.dontPositionManually) {
$timeout(function () {
var clickX = (scope.$parent && scope.$parent.clickEvent && scope.$parent.clickEvent.pageX) ? scope.$parent.clickEvent.pageX : clickX || 300;
var clickY = (scope.$parent && scope.$parent.clickEvent && scope.$parent.clickEvent.pageY) ? scope.$parent.clickEvent.pageY : clickY || 300;
setPopoverPosition(clickX, clickY);
elem.velocity({
opacity: 1
}, {
duration: 100,
easing: "cubic"
});
});
}
},
controller: function($scope, $element, $attrs) {
$scope.profile = $scope.$eval($attrs.profile);
$scope.$on("$destroy", function() {
angular.element('html').off('click.mentionPopover', $scope.onClick);
$element.remove();
});
}
}
});
;
/*! RESOURCE: /scripts/sn/common/mention/service.snMention.js */
angular.module("sn.common.mention").factory("snMention", function(liveProfileID, $q, $http) {
"use strict";
var MENTION_PATH = "/api/now/form/mention/record";
var USER_PATH = '/api/now/ui/user/';
var avatarCache = {};
function retrieveMembers(table, document, term) {
if(!term || !document || !table) {
var deferred = $q.defer();
deferred.resolve([]);
return deferred.promise;
}
return $http( {
url: MENTION_PATH + "/" + table + "/" + document,
method: "GET",
params: {
term: term
}
}).then(function(response) {
var members = response.data.result;
var promises = [];
angular.forEach(members, function(user) {
if (avatarCache[user.sys_id]) {
user.initials = avatarCache[user.sys_id].initials;
user.avatar = avatarCache[user.sys_id].avatar;
} else {
var promise = $http.get(USER_PATH + user.sys_id).success(function(response) {
user.initials = response.result.user_initials;
user.avatar = response.result.user_avatar;
avatarCache[user.sys_id] = {initials: user.initials, avatar: user.avatar};
});
promises.push(promise);
}
});
return $q.all(promises).then(function() {
return members;
});
})
}
return {
retrieveMembers: retrieveMembers
}
});
;
;
/*! RESOURCE: /scripts/sn/common/messaging/_module.js */
angular.module('sn.common.messaging', []);
angular.module('sn.messaging', ['sn.common.messaging']);
;
/*! RESOURCE: /scripts/sn/common/messaging/service.snCustomEvent.js */
angular.module('sn.common.messaging').factory('snCustomEvent',  function() {
"use strict";
if (typeof NOW.CustomEvent === 'undefined')
throw "CustomEvent not found in NOW global";
return NOW.CustomEvent;
});
;
/*! RESOURCE: /scripts/sn/common/notification/js_includes_notification.js */
/*! RESOURCE: /scripts/sn/common/notification/_module.js */
angular.module('sn.common.notification', ['sn.common.util', 'ngSanitize', 'sn.common.i18n']);
;
/*! RESOURCE: /scripts/sn/common/notification/factory.notificationWrapper.js */
angular.module("sn.common.notification").factory("snNotificationWrapper", function($window, $timeout) {
"use strict";
function assignHandler(notification, handlerName, options){
if (typeof options[handlerName] === "function")
notification[handlerName.toLowerCase()] = options[handlerName];
}
return function NotificationWrapper(title, options) {
var defaults = {
dir: 'auto',
lang: 'en_US',
decay: true,
lifespan: 4000,
body: "",
tag: "",
icon: '/native_notification_icon.png'
};
var optionsOnClick = options.onClick;
options.onClick = function() {
if(angular.isFunction($window.focus))
$window.focus();
if(typeof optionsOnClick === "function")
optionsOnClick();
}
var result = {};
options = angular.extend(defaults, options);
var previousOnClose = options.onClose;
options.onClose = function() {
if(angular.isFunction(result.onclose))
result.onclose();
if(angular.isFunction(previousOnClose))
previousOnClose();
}
var notification = new $window.Notification(title, options);
assignHandler(notification, "onShow", options);
assignHandler(notification, "onClick", options);
assignHandler(notification, "onError", options);
assignHandler(notification, "onClose", options);
if (options.decay && options.lifespan > 0)
$timeout(function() {
notification.close();
}, options.lifespan)
result.close = function() {
notification.close();
}
return result;
}
})
;
/*! RESOURCE: /scripts/sn/common/notification/service.snNotifier.js */
angular.module("sn.common.notification").factory("snNotifier", function ($window, snNotificationWrapper) {
"use strict";
return function(settings) {
function requestNotificationPermission() {
if($window.Notification && $window.Notification.permission === "default")
$window.Notification.requestPermission();
}
function canUseNativeNotifications() {
return ($window.Notification && $window.Notification.permission === "granted");
}
var currentNotifications = [];
settings = angular.extend({
notifyMethods: ["native", "glide"]
}, settings);
var methods = {
'native': nativeNotify,
'glide': glideNotify
};
function nativeNotify(title, options) {
if(canUseNativeNotifications()) {
var newNotification = snNotificationWrapper(title, options);
newNotification.onclose = function () {
stopTrackingNotification(newNotification)
};
currentNotifications.push(newNotification);
return true;
}
return false;
}
function glideNotify(title, options) {
return false;
}
function stopTrackingNotification(newNotification) {
var index = currentNotifications.indexOf(newNotification);
if(index > -1)
currentNotifications.splice(index, 1);
}
function notify(title, options) {
if(typeof options === "string")
options = {body: options};
options = options || {};
for(var i = 0, len = settings.notifyMethods.length; i < len; i++)
if(typeof settings.notifyMethods[i] == "string") {
if(methods[settings.notifyMethods[i]](title, options))
break;
} else {
if(settings.notifyMethods[i](title, options))
break;
}
}
function clearAllNotifications() {
while(currentNotifications.length > 0)
currentNotifications.pop().close();
}
return {
notify: notify,
canUseNativeNotifications: canUseNativeNotifications,
clearAllNotifications: clearAllNotifications,
requestNotificationPermission: requestNotificationPermission
}
}
});
;
/*! RESOURCE: /scripts/sn/common/notification/directive.snNotification.js */
angular.module('sn.common.notification').directive('snNotification', function($timeout, $rootScope) {
"use strict";
return {
restrict: 'E',
replace: true,
template: '<div class="notification-container"></div>',
link: function(scope, element) {
scope.addNotification = function(payload) {
if (!payload)
payload = {};
if (!payload.text)
payload.text = '';
if (!payload.classes)
payload.classes = '';
if (!payload.duration)
payload.duration = 5000;
angular.element('<div/>').qtip({
content: {
text: payload.text,
title: {
button: false
}
},
position: {
target: [0, 0],
container: angular.element('.notification-container')
},
show: {
event: false,
ready: true,
effect: function () {
angular.element(this).stop(0, 1).animate({ height: 'toggle' }, 400, 'swing');
},
delay: 0,
persistent: false
},
hide: {
event: false,
effect: function (api) {
angular.element(this).stop(0, 1).animate({ height: 'toggle' }, 400, 'swing');
}
},
style: {
classes: 'jgrowl' + ' ' + payload.classes,
tip: false
},
events: {
render: function (event, api) {
if (!api.options.show.persistent) {
angular.element(this).bind('mouseover mouseout', function(e) {
clearTimeout(api.timer);
if (e.type !== 'mouseover') {
api.timer = setTimeout(function() {
api.hide(e);
}, payload.duration);
}
})
.triggerHandler('mouseout');
}
}
}
});
},
scope.$on('notification.notify', function(event, payload) {
scope.addNotification(payload);
});
}
};
});
;
/*! RESOURCE: /scripts/sn/common/notification/service.snNotification.js */
angular.module('sn.common.notification').factory('snNotification', function($document, $templateCache, $compile, $rootScope, $timeout, $q, getTemplateUrl, $http, i18n) {
'use strict';
var openNotifications = [],
timeouts = {},
options = {
top: 20,
gap: 10,
duration: 5000
};
return {
show: function(type, message, duration, onClick, container) {
return createNotificationElement(type, message).then(function(element) {
displayNotification(element, container);
checkAndSetDestroyDuration(element, duration);
return element;
});
},
hide: hide,
setOptions: function(opts) {
if (angular.isObject(opts))
angular.extend(options, opts);
}
};
function getTemplate() {
var templateName = 'sn_notification.xml',
template = $templateCache.get(templateName),
deferred = $q.defer();
if (!template) {
var url = getTemplateUrl(templateName);
$http.get(url).then(function(result) {
$templateCache.put(templateName, result.data);
deferred.resolve(result.data);
},
function(reason) {
return $q.reject(reason);
});
} else
deferred.resolve(template);
return deferred.promise;
}
function createNotificationElement(type, message) {
var thisScope, thisElement;
var icon = 'icon-info';
if (type == 'error') {
icon = 'icon-cross-circle';
} else if (type == 'warning') {
icon = 'icon-alert';
} else if (type = 'success') {
icon = 'icon-check-circle';
}
return getTemplate().then(function(template) {
thisScope = $rootScope.$new();
thisScope.type = type;
thisScope.message = message;
thisScope.icon = icon;
thisElement = $compile(template)(thisScope);
return angular.element(thisElement[0]);
});
}
function displayNotification(element, container) {
var container = $document.find(container || 'body'),
id = 'elm' + Date.now(),
pos;
container.append(element);
pos = options.top + openNotifications.length * getElementHeight(element);
positionElement(element, pos);
element.addClass('visible');
element.attr('id', id);
element.find('button').bind('click', function(e) {
hideElement(element);
});
openNotifications.push(element);
if (options.duration > 0)
timeouts[id] = $timeout(function () {
hideNext();
}, options.duration);
}
function hide(element) {
$timeout.cancel(timeouts[element.attr('id')]);
element.removeClass('visible');
element.addClass('hidden');
element.find('button').eq(0).unbind();
element.scope().$destroy();
element.remove();
repositionAll();
}
function hideElement(element) {
var index = openNotifications.indexOf(element);
openNotifications.splice(index, 1);
hide(element);
}
function hideNext() {
var element = openNotifications.shift();
if (element)
hide(element);
}
function getElementHeight(element) {
return element[0].offsetHeight + options.gap;
}
function positionElement(element, pos) {
element[0].style.top = pos + 'px';
}
function repositionAll() {
var pos = options.top;
openNotifications.forEach(function(element) {
positionElement(element, pos);
pos += getElementHeight(element);
});
}
function checkAndSetDestroyDuration(element, duration){
if (duration){
timeouts[element.attr('id')] = $timeout(function(){
hideElement(element);
}, duration);
}
}
});
;
;
/*! RESOURCE: /scripts/sn/common/presence/snPresenceLite.js */
(function(exports, $) {
'use strict';
var PRESENCE_DISABLED = "false" === "true";
if (PRESENCE_DISABLED) {
return;
}
if (typeof $.Deferred === "undefined") {
return;
}
var USER_KEY = '{{SYSID}}';
var REPLACE_REGEX = new RegExp(USER_KEY, 'g');
var COLOR_ONLINE = '#71e279';
var COLOR_AWAY = '#fc8a3d';
var COLOR_OFFLINE = 'transparent';
var BASE_STYLES = [
'.sn-presence-lite { display: inline-block; width: 1rem; height: 1rem; border-radius: 50%; }'
];
var USER_STYLES = [
'.sn-presence-'+ USER_KEY +'-online [data-presence-id="'+ USER_KEY +'"] { background-color: '+ COLOR_ONLINE +'; }',
'.sn-presence-'+ USER_KEY +'-away [data-presence-id="'+ USER_KEY +'"] { background-color: '+ COLOR_AWAY +'; }',
'.sn-presence-'+ USER_KEY +'-offline [data-presence-id="'+ USER_KEY +'"] { background-color: '+ COLOR_OFFLINE +'; }'
];
var $head = $('head');
var stylesheet = $.Deferred();
var registeredUsers = {};
var registeredUsersLength = 0;
$(function() {
updateRegisteredUsers();
});
$head.ready(function() {
var styleElement = document.createElement('style');
$head.append(styleElement);
var $styleElement = $(styleElement);
stylesheet.resolve($styleElement);
});
function updateStyles(styles) {
stylesheet.done(function($styleElement) {
$styleElement.empty();
BASE_STYLES.forEach(function(baseStyle) {
$styleElement.append(baseStyle);
});
$styleElement.append(styles);
});
}
function getUserStyles(sysId) {
var newStyles = '';
for (var i = 0, iM = USER_STYLES.length; i < iM; i++) {
newStyles += USER_STYLES[i].replace(REPLACE_REGEX, sysId);
}
return newStyles;
}
function updateUserStyles() {
var userKeys = Object.keys(registeredUsers);
var userStyles = "";
userKeys.forEach(function(userKey) {
userStyles += getUserStyles(userKey);
});
updateStyles(userStyles);
}
exports.applyPresenceArray = applyPresenceArray;
function applyPresenceArray(presenceArray) {
if (!presenceArray || !presenceArray.length) {
return;
}
var users = presenceArray.filter(function(presence) {
return typeof registeredUsers[presence.user] !== "undefined";
});
updateUserPresenceStatus(users);
}
function updateUserPresenceStatus(users) {
var presenceStatus = getBaseCSSClasses();
for (var i = 0, iM = users.length; i < iM; i++) {
var presence = users[i];
var status = getNormalizedStatus(presence.status);
if (status === 'offline') {
continue;
}
presenceStatus.push('sn-presence-' + presence.user + '-' + status);
}
setCSSClasses(presenceStatus.join(' '));
}
function getNormalizedStatus(status) {
switch (status) {
case 'probably offline':
case 'maybe offline':
return 'away';
default:
return 'offline';
case 'online':
case 'offline':
return status;
}
}
function updateRegisteredUsers() {
var presenceIndicators = document.querySelectorAll('[data-presence-id]');
var obj = {};
for (var i = 0, iM = presenceIndicators.length; i < iM; i++) {
var uid = presenceIndicators[i].getAttribute('data-presence-id');
obj[uid] = true;
}
if (Object.keys(obj).length === registeredUsersLength){
return;
}
registeredUsers = obj;
registeredUsersLength = Object.keys(registeredUsers).length;
updateUserStyles();
}
function setCSSClasses(classes) {
$('html')[0].className = classes;
}
function getBaseCSSClasses() {
return $('html')[0].className.split(' ').filter(function(item){
return item.indexOf('sn-presence-') !== 0;
});
}
})(window, window.jQuery || window.Zepto);
;
/*! RESOURCE: /scripts/sn/common/presence/_module.js */
angular.module('sn.common.presence', ['ng.amb', 'sn.common.glide']).config(function($provide) {
"use strict";
$provide.constant("PRESENCE_DISABLED", "false" === "true");
});
;
/*! RESOURCE: /scripts/sn/common/presence/factory.snPresence.js */
angular.module("sn.common.presence").factory('snPresence', function($rootScope, $window, $log, amb, $timeout, $http, snRecordPresence, snTabActivity, urlTools, PRESENCE_DISABLED) {
"use strict";
var REST = {
PRESENCE: "/api/now/ui/presence"
};
var RETRY_INTERVAL = ($window.NOW.presence_interval || 15) * 1000;
var MAX_RETRY_DELAY = RETRY_INTERVAL * 10;
var initialized = false;
var primary = false;
var presenceArray = [];
var serverTimeMillis;
var skew = 0;
var st = 0;
function init() {
var location = urlTools.parseQueryString($window.location.search);
var table = location['table'] || location['sysparm_table'];
var sys_id = location['sys_id'] || location['sysparm_sys_id'];
return initPresence(table, sys_id);
}
function initPresence(t, id) {
if(PRESENCE_DISABLED)
return;
if (!initialized) {
initialized = true;
initRootScopes();
if (!primary) {
CustomEvent.observe('sn.presence', onPresenceEvent);
CustomEvent.fireTop('sn.presence.ping');
} else {
presenceArray = getLocalPresence($window.localStorage.getItem('snPresence'));
if (presenceArray)
$timeout(schedulePresence, 100);
else
updatePresence();
}
}
return snRecordPresence.initPresence(t, id);
}
function onPresenceEvent(parms) {
presenceArray = parms;
$timeout(broadcastPresence);
}
function initRootScopes() {
if ($window.NOW.presence_scopes) {
var ps = $window.NOW.presence_scopes;
if (ps.indexOf($rootScope) == -1)
ps.push($rootScope);
} else {
$window.NOW.presence_scopes = [$rootScope];
primary = CustomEvent.isTopWindow();
}
}
function setPresence(data, st) {
var rt = new Date().getTime() - st;
if (rt > 500)
console.log("snPresence response time " + rt + "ms");
if (data.result && data.result.presenceArray) {
presenceArray = data.result.presenceArray;
setLocalPresence(presenceArray);
serverTimeMillis = data.result.serverTimeMillis;
skew = new Date().getTime() - serverTimeMillis;
var t  = Math.floor(skew / 1000);
if (t < -15 )
console.log(">>>>> server ahead " + Math.abs(t) + " seconds");
else if (t > 15)
console.log(">>>>> browser time ahead " + t + " seconds");
}
schedulePresence();
}
function updatePresence(numAttempts) {
presenceArray = getLocalPresence($window.localStorage.getItem('snPresence'));
if (presenceArray) {
determineStatus(presenceArray);
$timeout(schedulePresence);
return;
}
if (!amb.isLoggedIn() || !snTabActivity.isPrimary) {
$timeout(schedulePresence);
return;
}
var p = {
user_agent: navigator.userAgent,
ua_time: new Date().toISOString(),
href: window.location.href,
pathname: window.location.pathname,
search: window.location.search,
path: window.location.pathname + window.location.search
};
st = new Date().getTime();
$http.post(REST.PRESENCE + '?sysparm_auto_request=true&cd=' + st, p).success(function(data) {
setPresence(data, st);
}).error(function(response, status) {
console.log("snPresence " + status);
schedulePresence(numAttempts);
})
}
function schedulePresence(numAttempts) {
numAttempts = isFinite(numAttempts) ? numAttempts + 1 : 0;
var interval = getDecayingRetryInterval(numAttempts);
$timeout(function() {
updatePresence(numAttempts)
}, interval);
determineStatus(presenceArray);
broadcastPresence();
}
function broadcastPresence() {
if (angular.isDefined($window.applyPresenceArray)) {
$window.applyPresenceArray(presenceArray);
}
$rootScope.$emit("sn.presence", presenceArray);
if (!primary)
return;
CustomEvent.fireAll('sn.presence', presenceArray);
}
function determineStatus(presenceArray) {
if (!presenceArray || !presenceArray.forEach)
return;
var t = new Date().getTime();
t -= skew;
presenceArray.forEach(function (p) {
var x = 0 + p.last_on;
var y = t - x;
p.status = "online";
if (y > (5 * RETRY_INTERVAL))
p.status = "offline";
else if (y > (3 * RETRY_INTERVAL))
p.status = "probably offline";
else if (y > (2.5 * RETRY_INTERVAL))
p.status = "maybe offline";
})
}
function setLocalPresence(value) {
var p = {
saved: new $window.Date().getTime(),
presenceArray: value
};
$window.localStorage.setItem('snPresence', angular.toJson(p));
}
function getLocalPresence(p) {
if (!p)
return null;
try {
p = angular.fromJson(p);
} catch (e) {
p = {};
}
if (!p.presenceArray)
return null;
var now = new Date().getTime();
if (now - p.saved >= RETRY_INTERVAL)
return null;
return p.presenceArray;
}
function getDecayingRetryInterval(numAttempts) {
return Math.min(RETRY_INTERVAL * Math.pow(2, numAttempts), MAX_RETRY_DELAY);
}
return {
init: init,
initPresence: initPresence,
_getLocalPresence: getLocalPresence,
_setLocalPresence: setLocalPresence,
_determineStatus: determineStatus
}
});
;
/*! RESOURCE: /scripts/sn/common/presence/factory.snRecordPresence.js */
angular.module("sn.common.presence").factory('snRecordPresence', function($rootScope, $location, amb, $timeout, $window, PRESENCE_DISABLED, snTabActivity) {
"use strict";
var statChannel;
var interval = ($window.NOW.record_presence_interval || 20) * 1000;
var sessions = {};
var primary = false;
var table;
var sys_id;
function initPresence(t, id) {
if(PRESENCE_DISABLED)
return;
if (!t || !id)
return;
if (t == table && id == sys_id)
return;
initRootScopes();
if (!primary)
return;
termPresence();
table = t;
sys_id = id;
var recordPresence = "/sn/rp/" + table + "/" + sys_id;
$rootScope.me = NOW.session_id;
statChannel = amb.getChannel(recordPresence);
statChannel.subscribe(onStatus);
amb.connected.then(function() {
setStatus("entered");
$rootScope.status = "viewing";
});
return statChannel;
}
function initRootScopes() {
if ($window.NOW.record_presence_scopes) {
var ps = $window.NOW.record_presence_scopes;
if (ps.indexOf($rootScope) == -1) {
ps.push($rootScope);
CustomEvent.observe('sn.sessions', onPresenceEvent);
}
} else {
$window.NOW.record_presence_scopes = [$rootScope];
primary = true;
}
}
function onPresenceEvent(sessionsToSend) {
$rootScope.$emit("sn.sessions", sessionsToSend);
$rootScope.$emit("sp.sessions", sessionsToSend);
}
function termPresence() {
if (!statChannel)
return;
statChannel.unsubscribe();
statChannel = table = sys_id = null;
}
function setStatus(status) {
if (status == $rootScope.status)
return;
$rootScope.status = status;
if (Object.keys(sessions).length == 0)
return;
if (getStatusPrecedence(status) > 1)
return;
publish($rootScope.status);
}
function publish(status) {
if (!statChannel)
return;
if (amb.getState() !== "opened")
return;
statChannel.publish({ presences: [{
status : status,
session_id : NOW.session_id,
user_name : NOW.user_name,
user_id: NOW.user_id,
user_display_name : NOW.user_display_name,
user_initials : NOW.user_initials,
user_avatar: NOW.user_avatar,
ua : navigator.userAgent,
table: table,
sys_id: sys_id,
time: new Date().toString().substring(0,24)
}]});
}
function onStatus(message) {
message.data.presences.forEach(function(d){
if (!d.session_id || d.session_id == NOW.session_id)
return;
var s = sessions[d.session_id];
if (s)
angular.extend(s, d);
else
s = sessions[d.session_id] = d;
s.lastUpdated = new Date();
if (s.status == 'exited')
delete sessions[d.session_id];
});
broadcastSessions();
}
function broadcastSessions() {
var sessionsToSend = getUniqueSessions();
$rootScope.$emit("sn.sessions", sessionsToSend);
$rootScope.$emit("sp.sessions", sessionsToSend);
if (primary)
$timeout(function() {CustomEvent.fire('sn.sessions', sessionsToSend);})
}
function getUniqueSessions() {
var uniqueSessionsByUser = {};
var sessionKeys = Object.keys(sessions);
sessionKeys.forEach(function(key) {
var session = sessions[key];
if (session.user_id == NOW.user_id)
return;
if (session.user_id in uniqueSessionsByUser) {
var otherSession = uniqueSessionsByUser[session.user_id];
var thisPrecedence = getStatusPrecedence(session.status);
var otherPrecedence = getStatusPrecedence(otherSession.status);
uniqueSessionsByUser[session.user_id] = thisPrecedence < otherPrecedence ? session : otherSession;
return
}
uniqueSessionsByUser[session.user_id] = session;
});
var uniqueSessions = {};
angular.forEach(uniqueSessionsByUser, function(item) {
uniqueSessions[item.session_id] = item;
});
return uniqueSessions;
}
function getStatusPrecedence(status) {
switch (status) {
case 'typing':
return 0;
case 'viewing':
return 1;
case 'entered':
return 2;
case 'exited':
case 'probably left':
return 4;
case 'offline':
return 5;
default:
return 3;
}
}
$rootScope.$on("record.typing", function(evt, data) {
setStatus(data.status);
});
var idleTable, idleSysID;
snTabActivity.onIdle({
onIdle: function RecordPresenceTabIdle() {
idleTable = table;
idleSysID = sys_id;
sessions = {};
termPresence();
broadcastSessions();
},
onReturn: function RecordPresenceTabActive() {
initPresence(idleTable, idleSysID, true);
idleTable = idleSysID = void(0);
},
delay: interval * 4
});
return {
initPresence: initPresence,
termPresence: termPresence
}
});
;
/*! RESOURCE: /scripts/sn/common/presence/directive.snPresence.js */
angular.module('sn.common.presence').directive('snPresence', function(snPresence, $rootScope, $timeout, i18n) {
'use strict';
$timeout(snPresence.init, 100);
var presenceStatus = {};
i18n.getMessages(['maybe offline', 'probably offline', 'offline', 'online', 'entered', 'viewing'], function (results) {
presenceStatus.maybe_offline = results['maybe offline'];
presenceStatus.probably_offline = results['probably offline'];
presenceStatus.offline = results['offline'];
presenceStatus.online = results['online'];
presenceStatus.entered = results['entered'];
presenceStatus.viewing = results['viewing'];
});
var presences = {};
$rootScope.$on('sn.presence', function (event, presenceArray) {
if (!presenceArray) {
angular.forEach(presences, function (p) {
p.status = "offline";
});
return;
}
presenceArray.forEach(function (presence) {
presences[presence.user] = presence;
});
});
return {
restrict: 'EA',
replace: false,
scope: {
userId: '@?',
snPresence: '=?',
user: '=?',
profile: '=?',
displayName: '=?'
},
link: function (scope, element) {
if (scope.profile) {
scope.user = scope.profile.userID;
scope.profile.tabIndex = -1;
if (scope.profile.isAccessible)
scope.profile.tabIndex = 0;
}
if (!element.hasClass('presence'))
element.addClass('presence');
function updatePresence () {
var id = scope.snPresence || scope.user;
if (!angular.isDefined(id) && angular.isDefined(scope.userId)) {
id = scope.userId;
}
if (presences[id]) {
var status = presences[id].status;
if (status === 'maybe offline' || status === 'probably offline') {
element.removeClass('presence-online presence-offline presence-away');
element.addClass('presence-away');
} else if (status == "offline" && !element.hasClass('presence-offline')) {
element.removeClass('presence-online presence-away');
element.addClass('presence-offline');
} else if ( (status == "online" || status == "entered" || status == "viewing") && !element.hasClass('presence-online')) {
element.removeClass('presence-offline presence-away');
element.addClass('presence-online');
}
status = status.replace(/ /g,"_");
if (scope.profile)
angular.element('div[user-avatar-id="' + id + '"]').attr("aria-label", scope.profile.userName + ' ' + presenceStatus[status]);
else
angular.element('div[user-avatar-id="' + id + '"]').attr("aria-label", scope.displayName + ' ' + presenceStatus[status]);
} else {
if (!element.hasClass('presence-offline'))
element.addClass('presence-offline');
}
}
var unbind = $rootScope.$on('sn.presence', updatePresence);
scope.$on('$destroy', unbind);
updatePresence();
}
};
});
;
/*! RESOURCE: /scripts/sn/common/util/js_includes_util.js */
/*! RESOURCE: /scripts/thirdparty/autosizer/autosizer.min.js */
/*!
 Autosize 4.0.0
 license: MIT
 http://www.jacklmoore.com/autosize
 */
!function(e,t){if("function"==typeof define&&define.amd)define(["exports","module"],t);else if("undefined"!=typeof exports&&"undefined"!=typeof module)t(exports,module);else{var n={exports:{}};t(n.exports,n),e.autosize=n.exports}}(this,function(e,t){"use strict";function n(e){function t(){var t=window.getComputedStyle(e,null);"vertical"===t.resize?e.style.resize="none":"both"===t.resize&&(e.style.resize="horizontal"),s="content-box"===t.boxSizing?-(parseFloat(t.paddingTop)+parseFloat(t.paddingBottom)):parseFloat(t.borderTopWidth)+parseFloat(t.borderBottomWidth),isNaN(s)&&(s=0),l()}function n(t){var n=e.style.width;e.style.width="0px",e.offsetWidth,e.style.width=n,e.style.overflowY=t}function o(e){for(var t=[];e&&e.parentNode&&e.parentNode instanceof Element;)e.parentNode.scrollTop&&t.push({node:e.parentNode,scrollTop:e.parentNode.scrollTop}),e=e.parentNode;return t}function r(){var t=e.style.height,n=o(e),r=document.documentElement&&document.documentElement.scrollTop;e.style.height="";var i=e.scrollHeight+s;return 0===e.scrollHeight?void(e.style.height=t):(e.style.height=i+"px",u=e.clientWidth,n.forEach(function(e){e.node.scrollTop=e.scrollTop}),void(r&&(document.documentElement.scrollTop=r)))}function l(){r();var t=Math.round(parseFloat(e.style.height)),o=window.getComputedStyle(e,null),i="content-box"===o.boxSizing?Math.round(parseFloat(o.height)):e.offsetHeight;if(i!==t?"hidden"===o.overflowY&&(n("scroll"),r(),i="content-box"===o.boxSizing?Math.round(parseFloat(window.getComputedStyle(e,null).height)):e.offsetHeight):"hidden"!==o.overflowY&&(n("hidden"),r(),i="content-box"===o.boxSizing?Math.round(parseFloat(window.getComputedStyle(e,null).height)):e.offsetHeight),a!==i){a=i;var l=d("autosize:resized");try{e.dispatchEvent(l)}catch(e){}}}if(e&&e.nodeName&&"TEXTAREA"===e.nodeName&&!i.has(e)){var s=null,u=e.clientWidth,a=null,c=function(){e.clientWidth!==u&&l()},p=function(t){window.removeEventListener("resize",c,!1),e.removeEventListener("input",l,!1),e.removeEventListener("keyup",l,!1),e.removeEventListener("autosize:destroy",p,!1),e.removeEventListener("autosize:update",l,!1),Object.keys(t).forEach(function(n){e.style[n]=t[n]}),i.delete(e)}.bind(e,{height:e.style.height,resize:e.style.resize,overflowY:e.style.overflowY,overflowX:e.style.overflowX,wordWrap:e.style.wordWrap});e.addEventListener("autosize:destroy",p,!1),"onpropertychange"in e&&"oninput"in e&&e.addEventListener("keyup",l,!1),window.addEventListener("resize",c,!1),e.addEventListener("input",l,!1),e.addEventListener("autosize:update",l,!1),e.style.overflowX="hidden",e.style.wordWrap="break-word",i.set(e,{destroy:p,update:l}),t()}}function o(e){var t=i.get(e);t&&t.destroy()}function r(e){var t=i.get(e);t&&t.update()}var i="function"==typeof Map?new Map:function(){var e=[],t=[];return{has:function(t){return e.indexOf(t)>-1},get:function(n){return t[e.indexOf(n)]},set:function(n,o){e.indexOf(n)===-1&&(e.push(n),t.push(o))},delete:function(n){var o=e.indexOf(n);o>-1&&(e.splice(o,1),t.splice(o,1))}}}(),d=function(e){return new Event(e,{bubbles:!0})};try{new Event("test")}catch(e){d=function(e){var t=document.createEvent("Event");return t.initEvent(e,!0,!1),t}}var l=null;"undefined"==typeof window||"function"!=typeof window.getComputedStyle?(l=function(e){return e},l.destroy=function(e){return e},l.update=function(e){return e}):(l=function(e,t){return e&&Array.prototype.forEach.call(e.length?e:[e],function(e){return n(e,t)}),e},l.destroy=function(e){return e&&Array.prototype.forEach.call(e.length?e:[e],o),e},l.update=function(e){return e&&Array.prototype.forEach.call(e.length?e:[e],r),e}),t.exports=l});
/*! RESOURCE: /scripts/sn/common/util/_module.js */
angular.module('sn.common.util', ['sn.common.auth']);
angular.module('sn.util', ['sn.common.util']);
;
/*! RESOURCE: /scripts/sn/common/util/service.dateUtils.js */
angular.module('sn.common.util').factory('dateUtils', function(){
var dateUtils = {
SYS_DATE_FORMAT: "yyyy-MM-dd",
SYS_TIME_FORMAT: "HH:mm:ss",
SYS_DATE_TIME_FORMAT: "yyyy-MM-dd HH:mm:ss",
MONTH_NAMES: new Array('January','February','March','April','May','June','July','August','September','October','November','December','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'),
DAY_NAMES: new Array('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sun','Mon','Tue','Wed','Thu','Fri','Sat'),
LZ: function (x) {return(x<0||x>9?"":"0")+x},
isDate: function (val,format) {
var date=this.getDateFromFormat(val,format);
if (date==0) { return false; }
return true;
},
compareDates: function (date1,dateformat1,date2,dateformat2) {
var d1=this.getDateFromFormat(date1,dateformat1);
var d2=this.getDateFromFormat(date2,dateformat2);
if (d1==0 || d2==0) {
return -1;
}
else if (d1 > d2) {
return 1;
}
return 0;
},
formatDateServer: function(date, format) {
var ga = new GlideAjax("DateTimeUtils");
ga.addParam("sysparm_name", "formatCalendarDate");
var browserOffset = date.getTimezoneOffset() * 60000;
var utcTime = date.getTime() - browserOffset;
var userDateTime = utcTime - g_tz_offset;
ga.addParam("sysparm_value", userDateTime);
ga.getXMLWait();
return ga.getAnswer();
},
formatDate: function(date,format) {
if (format.indexOf("z") > 0)
return this.formatDateServer(date, format);
format=format+"";
var result="";
var i_format=0;
var c="";
var token="";
var y=date.getYear()+"";
var M=date.getMonth()+1;
var d=date.getDate();
var E=date.getDay();
var H=date.getHours();
var m=date.getMinutes();
var s=date.getSeconds();
var yyyy,yy,MMM,MM,dd,hh,h,mm,ss,ampm,HH,H,KK,K,kk,k;
var value=new Object();
value["M"]=M;
value["MM"]=this.LZ(M);
value["MMM"]=this.MONTH_NAMES[M+11];
value["NNN"]=this.MONTH_NAMES[M+11];
value["MMMM"]=this.MONTH_NAMES[M-1];
value["d"]=d;
value["dd"]=this.LZ(d);
value["E"]=this.DAY_NAMES[E+7];
value["EE"]=this.DAY_NAMES[E];
value["H"]=H;
value["HH"]=this.LZ(H);
if (format.indexOf('w') != -1) {
var wk = date.getWeek();
if (wk >= 52 && M == 1) {
y = date.getYear();
y--;
y = y + "";
}
if (wk == 1 && M == 12) {
y = date.getYear();
y++;
y = y + "";
}
value["w"] = wk;
value["ww"] = this.LZ(wk);
}
var dayOfWeek = (7 + (E + 1) - (g_first_day_of_week - 1)) % 7;
if (dayOfWeek == 0)
dayOfWeek = 7;
value["D"] = dayOfWeek;
if (y.length < 4) {
y=""+(y-0+1900);
}
value["y"]=""+y;
value["yyyy"]=y;
value["yy"]=y.substring(2,4);
if (H==0) {
value["h"]=12;
} else if (H>12){
value["h"]=H-12;
} else {
value["h"]=H;
}
value["hh"]=this.LZ(value["h"]);
if (H>11) {
value["K"]=H-12;
} else {
value["K"]=H;
}
value["k"]=H+1;
value["KK"]=this.LZ(value["K"]);
value["kk"]=this.LZ(value["k"]);
if (H > 11) {
value["a"]="PM";
} else {
value["a"]="AM";
}
value["m"]=m;
value["mm"]=this.LZ(m);
value["s"]=s;
value["ss"]=this.LZ(s);
while (i_format < format.length) {
c=format.charAt(i_format);
token="";
while ((format.charAt(i_format)==c) && (i_format < format.length)) {
token += format.charAt(i_format++);
}
if (value[token] != null) { result=result + value[token]; }
else { result=result + token; }
}
return result;
},
_isInteger: function (val) {
var digits="1234567890";
for (var i=0; i < val.length; i++) {
if (digits.indexOf(val.charAt(i))==-1) { return false; }
}
return true;
},
_getInt: function (str,i,minlength,maxlength) {
for (var x=maxlength; x>=minlength; x--) {
var token=str.substring(i,i+x);
if (token.length < minlength) { return null; }
if (this._isInteger(token)) { return token; }
}
return null;
},
getDateFromFormat: function (val,format) {
val=val+"";
format=format+"";
var i_val=0;
var i_format=0;
var c="";
var token="";
var token2="";
var x,y;
var now=new Date();
var year=now.getYear();
var month=now.getMonth()+1;
var date=0;
var hh=now.getHours();
var mm=now.getMinutes();
var ss=now.getSeconds();
var ampm="";
var week = false;
while (i_format < format.length) {
c=format.charAt(i_format);
token="";
while ((format.charAt(i_format)==c) && (i_format < format.length)) {
token += format.charAt(i_format++);
}
if (token=="yyyy" || token=="yy" || token=="y") {
if (token=="yyyy") { x=4;y=4; }
if (token=="yy")   { x=2;y=2; }
if (token=="y")    { x=2;y=4; }
year=this._getInt(val,i_val,x,y);
if (year==null) { return 0; }
i_val += year.length;
if (year.length==2) {
if (year > 70) { year=1900+(year-0); }
else { year=2000+(year-0); }
}
}
else if (token=="MMM"||token=="NNN"){
month=0;
for (var i=0; i<this.MONTH_NAMES.length; i++) {
var month_name=this.MONTH_NAMES[i];
if (val.substring(i_val,i_val+month_name.length).toLowerCase()==month_name.toLowerCase()) {
if (token=="MMM"||(token=="NNN"&&i>11)) {
month=i+1;
if (month>12) { month -= 12; }
i_val += month_name.length;
break;
}
}
}
if ((month < 1)||(month>12)){return 0;}
}
else if (token=="EE"||token=="E") {
for (var i=0; i<this.DAY_NAMES.length; i++) {
var day_name=this.DAY_NAMES[i];
if (val.substring(i_val,i_val+day_name.length).toLowerCase()==day_name.toLowerCase()) {
if (week) {
if (i==0 || i == 7)
date+=6;
else if (i== 2 || i == 9)
date+=1;
else if (i== 3 || i == 10)
date+=2;
else if (i == 4 || i == 11)
date+=3;
else if (i == 5 || i == 12)
date +=4;
else if (i == 6 || i== 13)
date+=5;
}
i_val += day_name.length;
break;
}
}
}
else if (token=="MM"||token=="M") {
month=this._getInt(val,i_val,token.length,2);
if(month==null||(month<1)||(month>12)){return 0;}
i_val+=month.length;}
else if (token=="dd"||token=="d") {
date=this._getInt(val,i_val,token.length,2);
if(date==null||(date<1)||(date>31)){return 0;}
i_val+=date.length;}
else if (token=="hh"||token=="h") {
hh=this._getInt(val,i_val,token.length,2);
if(hh==null||(hh<1)||(hh>12)){return 0;}
i_val+=hh.length;}
else if (token=="HH"||token=="H") {
hh=this._getInt(val,i_val,token.length,2);
if(hh==null||(hh<0)||(hh>23)){return 0;}
i_val+=hh.length;}
else if (token=="KK"||token=="K") {
hh=this._getInt(val,i_val,token.length,2);
if(hh==null||(hh<0)||(hh>11)){return 0;}
i_val+=hh.length;}
else if (token=="kk"||token=="k") {
hh=this._getInt(val,i_val,token.length,2);
if(hh==null||(hh<1)||(hh>24)){return 0;}
i_val+=hh.length;hh--;}
else if (token=="mm"||token=="m") {
mm=this._getInt(val,i_val,token.length,2);
if(mm==null||(mm<0)||(mm>59)){return 0;}
i_val+=mm.length;}
else if (token=="ss"||token=="s") {
ss=this._getInt(val,i_val,token.length,2);
if(ss==null||(ss<0)||(ss>59)){return 0;}
i_val+=ss.length;}
else if (token=="a") {
if (val.substring(i_val,i_val+2).toLowerCase()=="am") {ampm="AM";}
else if (val.substring(i_val,i_val+2).toLowerCase()=="pm") {ampm="PM";}
else {return 0;}
i_val+=2;}
else if (token == "w" || token == "ww") {
var weekNum = this._getInt(val,i_val,token.length, 2);
week = true;
if (weekNum != null) {
var temp = new Date(year, 0, 1, 0, 0, 0);
temp.setWeek(parseInt(weekNum, 10));
year = temp.getFullYear();
month = temp.getMonth()+1;
date = temp.getDate();
}
weekNum += "";
i_val += weekNum.length;
}
else if (token=="D") {
if (week) {
var day = this._getInt(val,i_val,token.length, 1);
if ((day == null) || (day <= 0) || (day > 7))
return 0;
var temp = new Date(year, month-1, date, hh, mm, ss);
var dayOfWeek = temp.getDay();
day = parseInt(day, 10);
day = (day + g_first_day_of_week - 1) % 7;
if (day == 0)
day = 7;
day--;
if (day < dayOfWeek)
day = 7 - (dayOfWeek - day);
else
day -= dayOfWeek;
if (day > 0) {
temp.setDate(temp.getDate() + day);
year = temp.getFullYear();
month = temp.getMonth() + 1;
date = temp.getDate();
}
i_val++;
}
} else if (token =="z")
i_val+=3;
else {
if (val.substring(i_val,i_val+token.length)!=token) {return 0;}
else {i_val+=token.length;}
}
}
if (i_val != val.length) { return 0; }
if (month==2) {
if ( ( (year%4==0)&&(year%100 != 0) ) || (year%400==0) ) {
if (date > 29){ return 0; }
}
else { if (date > 28) { return 0; } }
}
if ((month==4)||(month==6)||(month==9)||(month==11)) {
if (date > 30) { return 0; }
}
if (hh<12 && ampm=="PM") { hh=hh-0+12; }
else if (hh>11 && ampm=="AM") { hh-=12; }
var newdate=new Date(year,month-1,date,hh,mm,ss);
return newdate.getTime();
},
parseDate: function (val) {
var preferEuro=(arguments.length==2)?arguments[1]:false;
generalFormats=new Array('y-M-d','MMM d, y','MMM d,y','y-MMM-d','d-MMM-y','MMM d');
monthFirst=new Array('M/d/y','M-d-y','M.d.y','MMM-d','M/d','M-d');
dateFirst =new Array('d/M/y','d-M-y','d.M.y','d-MMM','d/M','d-M');
yearFirst =new Array( 'yyyyw.F', 'yyw.F');
var checkList=new Array('generalFormats',preferEuro?'dateFirst':'monthFirst',preferEuro?'monthFirst':'dateFirst', 'yearFirst');
var d=null;
for (var i=0; i<checkList.length; i++) {
var l=window[checkList[i]];
for (var j=0; j<l.length; j++) {
d=this.getDateFromFormat(val,l[j]);
if (d!=0) { return new Date(d); }
}
}
return null;
}
};
Date.prototype.getWeek = function() {
var newYear = new Date(this.getFullYear(),0,1);
var day = newYear.getDay() - (g_first_day_of_week - 1);
day = (day >= 0 ? day : day + 7);
var dayNum = Math.floor((this.getTime() - newYear.getTime() - (this.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;
var weekNum;
if (day < 4) {
weekNum = Math.floor((dayNum+day-1)/7) +1;
if (weekNum > 52)
weekNum = this._checkNextYear(weekNum);
return weekNum;
}
weekNum = Math.floor((dayNum+day-1)/7);
if (weekNum < 1)
weekNum = this._lastWeekOfYear();
else if (weekNum > 52)
weekNum = this._checkNextYear(weekNum);
return weekNum;
};
Date.prototype._lastWeekOfYear = function() {
var newYear = new Date(this.getFullYear() - 1,0,1);
var endOfYear = new Date(this.getFullYear() - 1,11,31);
var day = newYear.getDay() - (g_first_day_of_week - 1);
var dayNum = Math.floor((endOfYear.getTime() - newYear.getTime() - (endOfYear.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;
return day < 4 ? Math.floor((dayNum+day-1)/7) + 1 : Math.floor((dayNum+day-1)/7);
};
Date.prototype._checkNextYear = function() {
var nYear = new Date(this.getFullYear() + 1,0,1);
var nDay = nYear.getDay() - (g_first_day_of_week-1);
nDay = nDay >= 0 ? nDay : nDay + 7;
return nDay < 4 ? 1 : 53;
};
Date.prototype.setWeek = function(weekNum) {
weekNum--;
var startOfYear = new Date(this.getFullYear(), 0, 1);
var day = startOfYear.getDay() - (g_first_day_of_week - 1);
if (day > 0 && day < 4) {
this.setFullYear(startOfYear.getFullYear() - 1);
this.setDate(31 - day + 1);
this.setMonth(11);
} else if (day > 3)
this.setDate(startOfYear.getDate() + (7-day));
this.setDate(this.getDate() + (7 * weekNum));
};
return dateUtils;
})
;
/*! RESOURCE: /scripts/sn/common/util/service.debounceFn.js */
angular.module("sn.common.util").service("debounceFn", function () {
"use strict";
function debounce(func, wait, immediate) {
var timeout;
return function() {
var context = this, args = arguments;
var later = function() {
timeout = null;
if (!immediate) func.apply(context, args);
};
var callNow = immediate && !timeout;
clearTimeout(timeout);
timeout = setTimeout(later, wait);
if (callNow) func.apply(context, args);
};
}
return {
debounce: debounce
}
});
;
/*! RESOURCE: /scripts/sn/common/util/factory.unwrappedHTTPPromise.js */
angular.module('sn.common.util').factory("unwrappedHTTPPromise", function ($q) {
"use strict";
function isGenericPromise(promise){
return (typeof promise.then === "function" &&
promise.success === undefined &&
promise.error === undefined);
}
return function(httpPromise){
if(isGenericPromise(httpPromise))
return httpPromise;
var deferred = $q.defer();
httpPromise.success(function(data){
deferred.resolve(data);
}).error(function(data, status){
deferred.reject({
data: data,
status: status
})
});
return deferred.promise;
};
});
;
/*! RESOURCE: /scripts/sn/common/util/service.urlTools.js */
angular.module('sn.common.util').constant('angularProcessorUrl', 'angular.do?sysparm_type=');
angular.module('sn.common.util').factory("urlTools", function(getTemplateUrl, angularProcessorUrl) {
"use strict";
function getPartialURL(name, parameters) {
var url = getTemplateUrl(name);
if (parameters) {
if (typeof parameters !== 'string') {
parameters = encodeURIParameters(parameters);
}
if (parameters.length) {
url += "&" + parameters;
}
}
if (window.NOW && window.NOW.ng_cache_defeat)
url += "&t=" + new Date().getTime();
return url;
}
function getURL(name, parameters) {
if (parameters && typeof parameters === 'object')
return urlFor(name, parameters);
var url = angularProcessorUrl;
url += name;
if (parameters)
url += "&" + parameters;
return url;
}
function urlFor(route, parameters) {
var p = encodeURIParameters(parameters);
return angularProcessorUrl + route + (p.length ? '&' + p : '');
}
function getPropertyURL(name) {
var url = angularProcessorUrl + "get_property&name=" + name;
url += "&t=" + new Date().getTime();
return url;
}
function encodeURIParameters(parameters) {
var s = [];
for (var parameter in parameters) {
if (parameters.hasOwnProperty(parameter)) {
var key = encodeURIComponent(parameter);
var value = parameters[parameter] ? encodeURIComponent(parameters[parameter]) : '';
s.push(key + "=" + value);
}
}
return s.join('&');
}
function parseQueryString(qs) {
qs = qs || '';
if (qs.charAt(0) === '?') {
qs = qs.substr(1);
}
var a = qs.split('&');
if (a === "") {
return {};
}
if(a && a[0].indexOf('http') != -1)
a[0] = a[0].split("?")[1];
var b = {};
for (var i = 0; i < a.length; i++) {
var p = a[i].split('=', 2);
if (p.length == 1) {
b[p[0]] = "";
} else {
b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
}
}
return b;
}
return {
getPartialURL: getPartialURL,
getURL: getURL,
urlFor: urlFor,
getPropertyURL: getPropertyURL,
encodeURIParameters: encodeURIParameters,
parseQueryString: parseQueryString
};
});
;
/*! RESOURCE: /scripts/sn/common/util/service.getTemplateUrl.js */
angular.module('sn.common.util').provider('getTemplateUrl', function(angularProcessorUrl) {
'use strict';
var _handlerId = 0;
var _handlers = {};
this.registerHandler = function(handler) {
var registeredId = _handlerId;
_handlers[_handlerId] = handler;
_handlerId++;
return function() {
delete _handlers[registeredId];
};
};
this.$get = function() {
return getTemplateUrl;
};
function getTemplateUrl(templatePath) {
if (_handlerId > 0) {
var path;
var handled = false;
angular.forEach(_handlers, function(handler) {
if (!handled) {
var handlerPath = handler(templatePath);
if (typeof handlerPath !== 'undefined') {
path = handlerPath;
handled = true;
}
}
});
if (handled) {
return path;
}
}
return angularProcessorUrl + 'get_partial&name=' + templatePath;
}
});
;
/*! RESOURCE: /scripts/sn/common/util/service.snTabActivity.js */
angular.module("sn.common.util").service("snTabActivity", function ($window, $timeout, $rootElement, $document) {
"use strict";
var activeEvents = ["keydown", "DOMMouseScroll", "mousewheel", "mousedown", "touchstart", "mousemove", "mouseenter", "input", "focus", "scroll"],
defaultIdle = 75000,
isPrimary = true,
idleTime = 0,
isVisible = true,
idleTimeout = void(0),
pageIdleTimeout = void(0),
hasActed = false,
appName = $rootElement.attr('ng-app') || "",
storageKey = "sn.tabs." + appName + ".activeTab";
var callbacks = {
"tab.primary": [],
"tab.secondary": [],
"activity.active": [],
"activity.idle": [{delay: defaultIdle, cb: function(){}}]
};
$window.tabGUID = $window.tabGUID || createGUID();
function getActiveEvents() {
return activeEvents.join(".snTabActivity ") + ".snTabActivity";
}
function setAppName (an) {
appName = an;
storageKey = "sn.tabs." + appName + ".activeTab";
makePrimary(true);
}
function createGUID(l) {
l = l || 32;
var strResult = '';
while (strResult.length < l)
strResult += (((1+Math.random()+new Date().getTime())*0x10000)|0).toString(16).substring(1);
return strResult.substr(0, l);
}
function ngObjectIndexOf(arr, obj) {
for (var i = 0, len = arr.length; i < len; i++)
if (angular.equals(arr[i], obj))
return i;
return -1;
}
var detectedApi,
apis = [{
eventName: 'visibilitychange',
propertyName: 'hidden'
},{
eventName: 'mozvisibilitychange',
propertyName: 'mozHidden'
},{
eventName: 'msvisibilitychange',
propertyName: 'msHidden'
},{
eventName: 'webkitvisibilitychange',
propertyName: 'webkitHidden'
}];
apis.some(function(api) {
if (angular.isDefined($document[0][api.propertyName])) {
detectedApi = api;
return true;
}
});
if(detectedApi)
$document.on(detectedApi.eventName, function() {
if(!$document[0][detectedApi.propertyName]) {
makePrimary();
isVisible = true;
} else {
if(!idleTimeout && !idleTime)
waitForIdle(0);
isVisible = false;
}
});
angular.element($window).on({
"mouseleave": function(e) {
var destination = angular.isUndefined(e.toElement) ? e.relatedTarget : e.toElement;
if (destination === null && $document[0].hasFocus()) {
waitForIdle(0);
}
},
"storage": function(e) {
if(e.originalEvent.key !== storageKey)
return;
if($window.localStorage.getItem(storageKey) !== $window.tabGUID)
makeSecondary();
}
});
function waitForIdle(index, delayOffset) {
var callback = callbacks['activity.idle'][index];
var numCallbacks = callbacks['activity.idle'].length;
delayOffset = delayOffset || callback.delay;
angular.element($window).off(getActiveEvents());
angular.element($window).one(getActiveEvents(), setActive);
if(index >= numCallbacks)
return;
if(idleTimeout)
$timeout.cancel(idleTimeout);
idleTimeout = $timeout(function() {
idleTime = callback.delay;
callback.cb();
$timeout.cancel(idleTimeout);
idleTimeout = void(0);
angular.element($window).off(getActiveEvents());
angular.element($window).one(getActiveEvents(), setActive);
for( var i = index + 1; i < numCallbacks; i++ ) {
var nextDelay = callbacks['activity.idle'][i].delay;
if(nextDelay <= callback.delay)
callbacks['activity.idle'][i].cb();
else {
waitForIdle(i, nextDelay - callback.delay);
break;
}
}
}, delayOffset, false);
}
function setActive() {
angular.element($window).off(getActiveEvents());
if(idleTimeout) {
$timeout.cancel(idleTimeout);
idleTimeout = void(0);
}
var activeCallbacks =  callbacks['activity.active'];
activeCallbacks.some(function(callback) {
if(callback.delay <= idleTime)
callback.cb();
else
return true;
});
idleTime = 0;
makePrimary();
if(pageIdleTimeout) {
$timeout.cancel(pageIdleTimeout);
pageIdleTimeout = void(0);
}
var minDelay = callbacks['activity.idle'][0].delay;
hasActed = false;
if(!pageIdleTimeout)
pageIdleTimeout = $timeout(pageIdleHandler, minDelay, false);
listenForActivity();
}
function pageIdleHandler() {
if(idleTimeout)
return;
var minDelay = callbacks['activity.idle'][0].delay;
if(hasActed) {
hasActed = false;
if(pageIdleTimeout)
$timeout.cancel(pageIdleTimeout);
pageIdleTimeout = $timeout(pageIdleHandler, minDelay, false);
listenForActivity();
return;
}
var delayOffset = minDelay;
if(callbacks['activity.idle'].length > 1)
delayOffset = callbacks['activity.idle'][1].delay - minDelay;
idleTime = minDelay;
callbacks['activity.idle'][0].cb();
waitForIdle(1, delayOffset);
pageIdleTimeout = void(0);
}
function listenForActivity() {
angular.element($window).off(getActiveEvents());
angular.element($window).one(getActiveEvents(), onActivity);
angular.element("#gsft_main").on("load.snTabActivity", function() {
var src = angular.element(this).attr('src');
if(src.indexOf("/") == 0 || src.indexOf($window.location.origin) == 0 || src.indexOf('http') == -1) {
var iframeWindow = this.contentWindow ? this.contentWindow : this.contentDocument.defaultView;
angular.element(iframeWindow).off(getActiveEvents());
angular.element(iframeWindow).one(getActiveEvents(), onActivity);
}
});
angular.element('iframe').each(function(idx, iframe) {
var src = angular.element(iframe).attr('src');
if (!src)
return;
if(src.indexOf("/") == 0 || src.indexOf($window.location.origin) == 0 || src.indexOf('http') == -1) {
var iframeWindow = iframe.contentWindow ? iframe.contentWindow : iframe.contentDocument.defaultView;
angular.element(iframeWindow).off(getActiveEvents());
angular.element(iframeWindow).one(getActiveEvents(), onActivity);
}
});
}
function onActivity() {
hasActed = true;
makePrimary();
}
function makePrimary(initial) {
var oldGuid = $window.localStorage.getItem(storageKey);
isPrimary = true;
isVisible = true;
$timeout.cancel(idleTimeout);
idleTimeout = void(0);
if(canUseStorage() && oldGuid !== $window.tabGUID && !initial)
for(var i = 0, len = callbacks["tab.primary"].length; i < len; i++)
callbacks["tab.primary"][i].cb();
try {
$window.localStorage.setItem(storageKey, $window.tabGUID);
} catch (ignored) {
}
if(idleTime && $document[0].hasFocus())
setActive();
}
function makeSecondary() {
isPrimary = false;
isVisible = false;
for(var i = 0, len = callbacks["tab.secondary"].length; i < len; i++)
callbacks["tab.secondary"][i].cb();
}
function registerCallback(event, callback, scope) {
var cbObject = angular.isObject(callback) ? callback : {delay: defaultIdle, cb: callback};
if(callbacks[event]) {
callbacks[event].push(cbObject);
callbacks[event].sort(function(a, b) {
return a.delay - b.delay;
})
}
function destroyCallback() {
if (callbacks[event]) {
var pos = ngObjectIndexOf(callbacks[event], cbObject);
if (pos !== -1)
callbacks[event].splice(pos, 1);
}
}
if(scope)
scope.$on("$destroy", function() {
destroyCallback();
});
return destroyCallback;
}
function registerIdleCallback(options, onIdle, onReturn, scope) {
var delay = options,
onIdleDestroy,
onReturnDestroy;
if(angular.isObject(options)) {
delay = options.delay;
onIdle = options.onIdle || onIdle;
onReturn = options.onReturn || onReturn;
scope = options.scope || scope;
}
if(angular.isFunction(onIdle))
onIdleDestroy = registerCallback("activity.idle", {delay: delay, cb: onIdle});
else if (angular.isFunction(onReturn)) {
onIdleDestroy = registerCallback("activity.idle", {delay: delay, cb: function(){}});
}
if(angular.isFunction(onReturn))
onReturnDestroy = registerCallback("activity.active", {delay: delay, cb: onReturn});
function destroyAll() {
if(angular.isFunction(onIdleDestroy))
onIdleDestroy();
if(angular.isFunction(onReturnDestroy))
onReturnDestroy();
}
if(scope)
scope.$on("$destroy", function() {
destroyAll();
});
return destroyAll;
}
function canUseStorage() {
var canWe = false;
try {
$window.localStorage.setItem(storageKey, $window.tabGUID);
canWe = true;
} catch (ignored) {
}
return canWe;
}
makePrimary(true);
listenForActivity();
pageIdleTimeout = $timeout(pageIdleHandler, defaultIdle, false);
return {
on: registerCallback,
onIdle: registerIdleCallback,
setAppName: setAppName,
get isPrimary() { return isPrimary; },
get isIdle() { return idleTime > 0; },
get idleTime() { return idleTime; },
get isVisible() { return isVisible; },
get appName() { return appName; },
get defaultIdleTime() { return defaultIdle },
isActive: function() {
return this.idleTime < this.defaultIdleTime && this.isVisible;
}
}
});
;
/*! RESOURCE: /scripts/sn/common/util/factory.ArraySynchronizer.js */
angular.module("sn.common.util").factory("ArraySynchronizer", function() {
'use strict';
function ArraySynchronizer(){}
function index(key, arr) {
var result = {};
var keys = [];
result.orderedKeys = keys;
angular.forEach(arr, function(item) {
var keyValue = item[key];
result[keyValue] = item;
keys.push(keyValue);
});
return result;
}
function sortByKeyAndModel(arr, key, model) {
arr.sort(function(a, b) {
var aIndex = model.indexOf(a[key]);
var bIndex = model.indexOf(b[key]);
if(aIndex > bIndex)
return 1;
else if (aIndex < bIndex)
return -1;
return 0;
});
}
ArraySynchronizer.prototype = {
add: function(syncField, dest, source, end) {
end = end || "bottom";
var destIndex = index(syncField, dest);
var sourceIndex = index(syncField, source);
angular.forEach(sourceIndex.orderedKeys, function(key) {
if(destIndex.orderedKeys.indexOf(key) === -1) {
if(end === "bottom") {
dest.push(sourceIndex[key]);
} else {
dest.unshift(sourceIndex[key]);
}
}
});
},
synchronize: function(syncField, dest, source, deepKeySyncArray) {
var destIndex = index(syncField, dest);
var sourceIndex = index(syncField, source);
deepKeySyncArray = (typeof deepKeySyncArray === "undefined") ? [] : deepKeySyncArray;
for(var i = destIndex.orderedKeys.length - 1; i >= 0; i--) {
var key = destIndex.orderedKeys[i];
if(sourceIndex.orderedKeys.indexOf(key) === -1) {
destIndex.orderedKeys.splice(i, 1);
dest.splice(i, 1);
}
if (deepKeySyncArray.length > 0) {
angular.forEach(deepKeySyncArray, function(deepKey) {
if (sourceIndex[key] && destIndex[key][deepKey] !== sourceIndex[key][deepKey]) {
destIndex[key][deepKey] = sourceIndex[key][deepKey];
}
});
}
}
angular.forEach(sourceIndex.orderedKeys, function(key) {
if(destIndex.orderedKeys.indexOf(key) === -1)
dest.push(sourceIndex[key]);
});
sortByKeyAndModel(dest, syncField, sourceIndex.orderedKeys);
}
};
return ArraySynchronizer;
});
;
/*! RESOURCE: /scripts/sn/common/util/directive.snBindOnce.js */
angular.module("sn.common.util").directive("snBindOnce", function($sanitize) {
"use strict";
return {
restrict: "A",
link: function(scope, element, attrs) {
var value = scope.$eval(attrs.snBindOnce);
var sanitizedValue = $sanitize(value);
element.append(sanitizedValue);
}
}
})
;
/*! RESOURCE: /scripts/sn/common/util/directive.snCloak.js */
angular.module("sn.common.util").directive("snCloak", function() {
"use strict";
return {
restrict: "A",
compile: function(element, attr) {
return function() {
attr.$set('snCloak', undefined);
element.removeClass('sn-cloak');
}
}
};
})
;
/*! RESOURCE: /scripts/sn/common/util/service.md5.js */
angular.module('sn.common.util').factory('md5', function() {
'use strict';
var md5cycle = function(x, k) {
var a = x[0], b = x[1], c = x[2], d = x[3];
a = ff(a, b, c, d, k[0], 7, -680876936);
d = ff(d, a, b, c, k[1], 12, -389564586);
c = ff(c, d, a, b, k[2], 17,  606105819);
b = ff(b, c, d, a, k[3], 22, -1044525330);
a = ff(a, b, c, d, k[4], 7, -176418897);
d = ff(d, a, b, c, k[5], 12,  1200080426);
c = ff(c, d, a, b, k[6], 17, -1473231341);
b = ff(b, c, d, a, k[7], 22, -45705983);
a = ff(a, b, c, d, k[8], 7,  1770035416);
d = ff(d, a, b, c, k[9], 12, -1958414417);
c = ff(c, d, a, b, k[10], 17, -42063);
b = ff(b, c, d, a, k[11], 22, -1990404162);
a = ff(a, b, c, d, k[12], 7,  1804603682);
d = ff(d, a, b, c, k[13], 12, -40341101);
c = ff(c, d, a, b, k[14], 17, -1502002290);
b = ff(b, c, d, a, k[15], 22,  1236535329);
a = gg(a, b, c, d, k[1], 5, -165796510);
d = gg(d, a, b, c, k[6], 9, -1069501632);
c = gg(c, d, a, b, k[11], 14,  643717713);
b = gg(b, c, d, a, k[0], 20, -373897302);
a = gg(a, b, c, d, k[5], 5, -701558691);
d = gg(d, a, b, c, k[10], 9,  38016083);
c = gg(c, d, a, b, k[15], 14, -660478335);
b = gg(b, c, d, a, k[4], 20, -405537848);
a = gg(a, b, c, d, k[9], 5,  568446438);
d = gg(d, a, b, c, k[14], 9, -1019803690);
c = gg(c, d, a, b, k[3], 14, -187363961);
b = gg(b, c, d, a, k[8], 20,  1163531501);
a = gg(a, b, c, d, k[13], 5, -1444681467);
d = gg(d, a, b, c, k[2], 9, -51403784);
c = gg(c, d, a, b, k[7], 14,  1735328473);
b = gg(b, c, d, a, k[12], 20, -1926607734);
a = hh(a, b, c, d, k[5], 4, -378558);
d = hh(d, a, b, c, k[8], 11, -2022574463);
c = hh(c, d, a, b, k[11], 16,  1839030562);
b = hh(b, c, d, a, k[14], 23, -35309556);
a = hh(a, b, c, d, k[1], 4, -1530992060);
d = hh(d, a, b, c, k[4], 11,  1272893353);
c = hh(c, d, a, b, k[7], 16, -155497632);
b = hh(b, c, d, a, k[10], 23, -1094730640);
a = hh(a, b, c, d, k[13], 4,  681279174);
d = hh(d, a, b, c, k[0], 11, -358537222);
c = hh(c, d, a, b, k[3], 16, -722521979);
b = hh(b, c, d, a, k[6], 23,  76029189);
a = hh(a, b, c, d, k[9], 4, -640364487);
d = hh(d, a, b, c, k[12], 11, -421815835);
c = hh(c, d, a, b, k[15], 16,  530742520);
b = hh(b, c, d, a, k[2], 23, -995338651);
a = ii(a, b, c, d, k[0], 6, -198630844);
d = ii(d, a, b, c, k[7], 10,  1126891415);
c = ii(c, d, a, b, k[14], 15, -1416354905);
b = ii(b, c, d, a, k[5], 21, -57434055);
a = ii(a, b, c, d, k[12], 6,  1700485571);
d = ii(d, a, b, c, k[3], 10, -1894986606);
c = ii(c, d, a, b, k[10], 15, -1051523);
b = ii(b, c, d, a, k[1], 21, -2054922799);
a = ii(a, b, c, d, k[8], 6,  1873313359);
d = ii(d, a, b, c, k[15], 10, -30611744);
c = ii(c, d, a, b, k[6], 15, -1560198380);
b = ii(b, c, d, a, k[13], 21,  1309151649);
a = ii(a, b, c, d, k[4], 6, -145523070);
d = ii(d, a, b, c, k[11], 10, -1120210379);
c = ii(c, d, a, b, k[2], 15,  718787259);
b = ii(b, c, d, a, k[9], 21, -343485551);
x[0] = add32(a, x[0]);
x[1] = add32(b, x[1]);
x[2] = add32(c, x[2]);
x[3] = add32(d, x[3]);
};
var cmn = function(q, a, b, x, s, t) {
a = add32(add32(a, q), add32(x, t));
return add32((a << s) | (a >>> (32 - s)), b);
};
var ff = function(a, b, c, d, x, s, t) {
return cmn((b & c) | ((~b) & d), a, b, x, s, t);
};
var gg = function(a, b, c, d, x, s, t) {
return cmn((b & d) | (c & (~d)), a, b, x, s, t);
};
var hh = function(a, b, c, d, x, s, t) {
return cmn(b ^ c ^ d, a, b, x, s, t);
};
var ii = function(a, b, c, d, x, s, t) {
return cmn(c ^ (b | (~d)), a, b, x, s, t);
};
var md51 = function(s) {
var txt = '';
var n = s.length,
state = [1732584193, -271733879, -1732584194, 271733878], i;
for (i=64; i<=s.length; i+=64) {
md5cycle(state, md5blk(s.substring(i-64, i)));
}
s = s.substring(i-64);
var tail = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
for (i=0; i<s.length; i++)
tail[i>>2] |= s.charCodeAt(i) << ((i%4) << 3);
tail[i>>2] |= 0x80 << ((i%4) << 3);
if (i > 55) {
md5cycle(state, tail);
for (i=0; i<16; i++) tail[i] = 0;
}
tail[14] = n*8;
md5cycle(state, tail);
return state;
};
var md5blk = function(s) {
var md5blks = [], i;
for (i=0; i<64; i+=4) {
md5blks[i>>2] = s.charCodeAt(i)
+ (s.charCodeAt(i+1) << 8)
+ (s.charCodeAt(i+2) << 16)
+ (s.charCodeAt(i+3) << 24);
}
return md5blks;
};
var hex_chr = '0123456789abcdef'.split('');
var rhex = function(n) {
var s='', j=0;
for(; j<4; j++)
s += hex_chr[(n >> (j * 8 + 4)) & 0x0F]
+ hex_chr[(n >> (j * 8)) & 0x0F];
return s;
};
var hex = function(x) {
for (var i=0; i<x.length; i++)
x[i] = rhex(x[i]);
return x.join('');
};
var add32 = function(a, b) {
return (a + b) & 0xFFFFFFFF;
};
return function(s) {
return hex(md51(s));
};
});
;
/*! RESOURCE: /scripts/sn/common/util/service.priorityQueue.js */
angular.module('sn.common.util').factory('priorityQueue', function() {
'use strict';
return function(comparator) {
var items = [];
var compare = comparator || function(a, b) {
return a - b;
};
var swap = function(a, b) {
var temp = items[a];
items[a] = items[b];
items[b] = temp;
};
var bubbleUp = function(pos) {
var parent;
while (pos > 0) {
parent = (pos - 1) >> 1;
if (compare(items[pos], items[parent]) >= 0)
break;
swap(parent, pos);
pos = parent;
}
};
var bubbleDown = function(pos) {
var left, right, min, last = items.length - 1;
while (true) {
left = (pos << 1) + 1;
right = left + 1;
min = pos;
if (left <= last && compare(items[left], items[min]) < 0)
min = left;
if (right <= last && compare(items[right], items[min]) < 0)
min = right;
if (min === pos)
break;
swap(min, pos);
pos = min;
}
};
return {
add: function(item) {
items.push(item);
bubbleUp(items.length - 1);
},
poll: function() {
var first = items[0],
last = items.pop();
if (items.length > 0) {
items[0] = last;
bubbleDown(0);
}
return first;
},
peek: function() {
return items[0];
},
clear: function() {
items = [];
},
inspect: function() {
return angular.toJson(items, true);
},
get size() {
return items.length;
},
get all() {
return items;
},
set comparator(fn) {
compare = fn;
}
};
};
});
;
/*! RESOURCE: /scripts/sn/common/util/service.snResource.js */
angular.module('sn.common.util').factory('snResource', function($http, $q, priorityQueue, md5) {
'use strict';
var methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'jsonp', 'trace'],
queue = priorityQueue(function(a, b) {
return a.timestamp - b.timestamp;
}),
resource = {},
pendingRequests = [],
inFlightRequests = [];
return function() {
var requestInterceptors = $http.defaults.transformRequest,
responseInterceptors = $http.defaults.transformResponse;
var next = function() {
var request = queue.peek();
pendingRequests.shift();
inFlightRequests.push(request.hash);
$http(request.config).then(function(response) {
request.deferred.resolve(response);
}, function(reason) {
request.deferred.reject(reason);
}).finally(function() {
queue.poll();
inFlightRequests.shift();
if (queue.size > 0)
next();
});
};
angular.forEach(methods, function(method) {
resource[method] = function(url, data) {
var deferredRequest = $q.defer(),
promise = deferredRequest.promise,
deferredAbort = $q.defer(),
config = {
method: method,
url: url,
data: data,
transformRequest: requestInterceptors,
transformResponse: responseInterceptors,
timeout: deferredAbort.promise
},
hash = md5(JSON.stringify(config));
pendingRequests.push(hash);
queue.add({
config: config,
deferred: deferredRequest,
timestamp: Date.now(),
hash: hash
});
if (queue.size === 1)
next();
promise.abort = function() {
deferredAbort.resolve('Request cancelled');
};
return promise;
};
});
resource.addRequestInterceptor = function(fn) {
requestInterceptors = requestInterceptors.concat([fn]);
};
resource.addResponseInterceptor = function(fn) {
responseInterceptors = responseInterceptors.concat([fn]);
};
resource.queueSize = function() {
return queue.size;
};
resource.queuedRequests = function() {
return queue.all;
};
return resource;
};
});
;
/*! RESOURCE: /scripts/sn/common/util/service.snConnect.js */
angular.module("sn.common.util").service("snConnectService", function ($http, snCustomEvent) {
"use strict";
var connectPaths = ["/$c.do", "/$chat.do"];
function canOpenInFrameset() {
return window.top.NOW.collaborationFrameset;
}
function isInConnect() {
var parentPath = getParentPath();
return connectPaths.some(function(path) {
return parentPath == path;
});
}
function getParentPath() {
try {
return window.top.location.pathname;
} catch(IGNORED) {
return "";
}
}
function openWithProfile(profile) {
if (isInConnect() || canOpenInFrameset())
snCustomEvent.fireTop('chat:open_conversation', profile);
else
window.open("$c.do#/with/" + profile.sys_id, "_blank");
}
return {
openWithProfile: openWithProfile
}
});
;
/*! RESOURCE: /scripts/sn/common/util/snPolyfill.js */
(function(){
"use strict";
polyfill(String.prototype, 'startsWith', function(prefix) {
return this.indexOf(prefix) === 0;
});
polyfill(String.prototype, 'endsWith', function(suffix) {
return this.indexOf(suffix, this.length - suffix.length) !== -1;
});
polyfill(Number, 'isNaN', function(value) {
return value !== value;
});
polyfill(window, 'btoa', function (input) {
var str = String(input);
var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
for (
var block, charCode, idx = 0, map = chars, output = '';
str.charAt(idx | 0) || (map = '=', idx % 1);
output += map.charAt(63 & block >> 8 - idx % 1 * 8)
) {
charCode = str.charCodeAt(idx += 3/4);
if (charCode > 0xFF) {
throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
}
block = block << 8 | charCode;
}
return output;
});
function polyfill(obj, slot, fn) {
if (obj[slot] === void(0)) {
obj[slot] = fn;
}
}
window.console = window.console || { log: function(){} };
})();
;
/*! RESOURCE: /scripts/sn/common/util/directive.snFocus.js */
angular.module('sn.common.util').directive('snFocus', function($timeout) {
'use strict';
return function(scope, element, attrs) {
scope.$watch(attrs.snFocus, function(value) {
if (value !== true)
return;
$timeout(function() {
element[0].focus();
});
});
};
});
;
/*! RESOURCE: /scripts/sn/common/util/directive.snResizeHeight.js */
angular.module('sn.common.util').directive('snResizeHeight', function($window) {
'use strict';
return {
restrict : 'A',
link : function(scope, elem, attrs) {
if (typeof $window.autosize === 'undefined') {
return;
}
$window.autosize(elem);
function _update() {
$window.autosize.update(elem);
}
function _destroy() {
$window.autosize.destroy(elem);
}
if (typeof attrs.disableValueWatcher === "undefined") {
scope.$watch(function() {
return elem.val();
}, function valueWatcher(newValue, oldValue) {
if (newValue === oldValue) {
return;
}
_update();
});
}
elem.on('input.resize', _update());
scope.$on('$destroy', function() {
_destroy();
});
if (attrs.snTextareaAutosizer === 'trim') {
elem.on('blur', function() {
elem.val(elem.val().trim());
_update();
})
}
}
}
});
;
/*! RESOURCE: /scripts/sn/common/util/directive.snBlurOnEnter.js */
angular.module('sn.common.util').directive('snBlurOnEnter', function() {
'use strict';
return function(scope, element) {
element.bind("keydown keypress", function(event) {
if (event.which !== 13)
return;
element.blur();
event.preventDefault();
});
};
});
;
/*! RESOURCE: /scripts/sn/common/util/directive.snStickyHeaders.js */
angular.module('sn.common.util').directive('snStickyHeaders', function() {
"use strict";
return {
restrict : 'A',
transclude: false,
replace: false,
link: function (scope, element, attrs) {
element.addClass('sticky-headers');
var containers;
var scrollContainer = element.find('[sn-sticky-scroll-container]');
scrollContainer.addClass('sticky-scroll-container');
function refreshHeaders () {
if (attrs.snStickyHeaders !== 'false') {
angular.forEach(containers, function (container) {
var stickyContainer = angular.element(container);
var stickyHeader = stickyContainer.find('[sn-sticky-header]');
var stickyOffset = stickyContainer.position().top + stickyContainer.outerHeight();
stickyContainer.addClass('sticky-container');
if (stickyOffset < stickyContainer.outerHeight() && stickyOffset > -stickyHeader.outerHeight()) {
stickyContainer.css('padding-top', stickyHeader.outerHeight());
stickyHeader.css('width', stickyHeader.outerWidth());
stickyHeader.removeClass('sticky-header-disabled').addClass('sticky-header-enabled');
} else {
stickyContainer.css('padding-top', '');
stickyHeader.css('width', '');
stickyHeader.removeClass('sticky-header-enabled').addClass('sticky-header-disabled');
}
});
} else {
element.find('[sn-sticky-container]').removeClass('sticky-container');
element.find('[sn-sticky-container]').css('padding-top', '');
element.find('[sn-sticky-header]').css('width', '');
element.find('[sn-sticky-header]').removeClass('sticky-header-enabled').addClass('sticky-header-disabled');
}
}
scope.$watch(function () {
scrollContainer.find('[sn-sticky-header]').addClass('sticky-header');
containers = element.find('[sn-sticky-container]');
return attrs.snStickyHeaders;
}, refreshHeaders);
scope.$watch(function () {
return scrollContainer[0].scrollHeight;
}, refreshHeaders);
scrollContainer.on('scroll', refreshHeaders);
}
};
});
;
;
/*! RESOURCE: /scripts/sn/common/ui/js_includes_ui.js */
/*! RESOURCE: /scripts/sn/common/ui/_module.js */
angular.module('sn.common.ui', ['sn.common.messaging']);
;
/*! RESOURCE: /scripts/sn/common/ui/popover/js_includes_ui_popover.js */
/*! RESOURCE: /scripts/sn/common/ui/popover/_module.js */
angular.module('sn.common.ui.popover', []);
;
/*! RESOURCE: /scripts/sn/common/ui/popover/directive.snBindPopoverSelection.js */
angular.module('sn.common.ui.popover').directive('snBindPopoverSelection', function(snCustomEvent) {
"use strict";
return {
restrict: "A",
controller: function($scope, $element, $attrs , snCustomEvent) {
snCustomEvent.observe('list.record_select', recordSelectDataHandler);
function recordSelectDataHandler(data, event) {
if (!data || !event)
return;
event.stopPropagation();
var ref = ($scope.field) ? $scope.field.ref : $attrs.ref;
if (data.ref === ref) {
if (window.g_form) {
if ($attrs.addOption) {
addGlideListChoice('select_0' + $attrs.ref, data.value, data.displayValue);
} else {
var fieldValue = typeof $attrs.ref === 'undefined' ? data.ref : $attrs.ref;
window.g_form._setValue(fieldValue, data.value, data.displayValue);
clearDerivedFields(data.value);
}
}
if ($scope.field) {
$scope.field.value = data.value;
$scope.field.displayValue = data.displayValue;
}
}
}
function clearDerivedFields(value) {
if (window.DerivedFields) {
var df = new DerivedFields($scope.field ? $scope.field.ref : $attrs.ref);
df.clearRelated();
df.updateRelated(value);
}
}
}
};
});
;
/*! RESOURCE: /scripts/sn/common/ui/popover/directive.snComplexPopover.js */
angular.module('sn.common.ui.popover').directive('snComplexPopover', function(getTemplateUrl, $q, $http, $templateCache, $compile, $timeout){
"use strict";
return {
restrict: 'E',
replace:true,
templateUrl: function(elem, attrs){
return getTemplateUrl(attrs.buttonTemplate);
},
controller: function($scope, $element, $attrs, $q, $document, snCustomEvent, snComplexPopoverService){
$scope.type = $attrs.complexPopoverType || "complex_popover";
if ($scope.closeEvent){
snCustomEvent.observe($scope.closeEvent, destroyPopover);
$scope.$on($scope.closeEvent, destroyPopover);
}
$scope.$parent.$on('$destroy', destroyPopover);
$scope.$on('$destroy', function() {
snCustomEvent.un($scope.closeEvent, destroyPopover);
});
var newScope;
var open;
var popover;
var content;
var popoverDefaults = {
container: 'body',
html: true,
placement: 'auto',
trigger: 'manual',
template: '<div class="complex_popover popover" role="dialog"><div class="arrow"></div><div class="popover-content"></div></div>'
};
var popoverConfig = angular.extend(popoverDefaults, $scope.popoverConfig);
$scope.loading      = false;
$scope.initialized  = false;
$scope.popOverDisplaying = false;
$scope.togglePopover = function(event) {
if (!open){
showPopover(event);
} else {
destroyPopover();
}
$scope.popOverDisplaying = !$scope.popOverDisplaying;
};
function showPopover(e) {
if ($scope.loading)
return;
$scope.$toggleButton = angular.element(e.target);
$scope.loading = true;
$scope.$emit('list.toggleLoadingState', true);
_getTemplate()
.then(_insertTemplate)
.then(_createPopover)
.then(_bindHtml)
.then(function(){
$scope.initialized = true;
if (!$scope.loadEvent)
_openPopover();
});
}
function destroyPopover() {
if (!newScope)
return;
$scope.$toggleButton.on('hidden.bs.popover', function(){
open = false;
$scope.$toggleButton.data('bs.popover').$element.removeData('bs.popover').off('.popover');
$scope.$toggleButton = null;
snCustomEvent.fire('hidden.complexpopover.' + $scope.ref);
});
$scope.$toggleButton.popover('hide');
snCustomEvent.fire('hide.complexpopover.' + $scope.ref, $scope.$toggleButton);
newScope.$broadcast('$destroy');
newScope.$destroy();
newScope = null;
$scope.initialized = false;
angular.element(window).off({
'click': complexHtmlHandler,
'keydown': keyDownHandler
});
}
function _getTemplate() {
return snComplexPopoverService.getTemplate(getTemplateUrl($attrs.template));
}
function _createPopover() {
$scope.$toggleButton.popover(popoverConfig);
return $q.when(true);
}
function _insertTemplate(response) {
newScope = $scope.$new();
if ($scope.loadEvent)
newScope.$on($scope.loadEvent, _openPopover);
content = $compile(response.data)(newScope);
popoverConfig.content = content;
newScope.open = true;
snCustomEvent.fire('inserted.complexpopover.' + $scope.ref, $scope.$toggleButton);
return $q.when(true);
}
function _bindHtml() {
angular.element(window).on({
'click': complexHtmlHandler,
'keydown': keyDownHandler
});
return $q.when(true);
}
function complexHtmlHandler(e) {
var parentComplexPopoverScope = angular.element(e.target).parents('.popover-content').children().scope();
if (parentComplexPopoverScope && (parentComplexPopoverScope.type = "complex_popover") && $scope.type === "complex_popover")
return;
if (!open || angular.element(e.target).parents('html').length === 0)
return;
if ($scope.initialized && !$scope.loading && !$scope.$toggleButton.is(e.target) && content.parents('.popover').has(angular.element(e.target)).length === 0) {
_eventClosePopover(e);
destroyPopover(e);
}
}
function keyDownHandler(e) {
if (e.keyCode != 27)
return;
if (!open || angular.element(e.target).parents('html').length === 0)
return;
if ($scope.initialized && !$scope.loading && !$scope.$toggleButton.is(e.target) && content.parents('.popover').has(angular.element(e.target)).length > 0) {
_eventClosePopover(e);
destroyPopover();
}
}
function _eventClosePopover(e) {
e.preventDefault();
e.stopPropagation();
}
function createAndActivateFocusTrap(popover) {
var deferred = $q.defer();
if (!window.focusTrap) {
deferred.reject('Focus trap not found');
} else {
if (!$scope.focusTrap) {
$scope.focusTrap = window.focusTrap(popover, { clickOutsideDeactivates: true });
}
try {
$scope.focusTrap.activate({
onActivate: function() {
deferred.resolve();
}
});
} catch(e) {
console.warn("Unable to activate focus trap", e);
}
}
return deferred.promise;
}
function deactivateAndDestroyFocusTrap() {
var deferred = $q.defer();
if (!$scope.focusTrap) {
deferred.reject("Focus trap not found");
} else {
try {
$scope.focusTrap.deactivate({
returnFocus: false,
onDeactivate: function () {
deferred.resolve();
}
});
} catch (e) {
console.warn("Unable to deactivate focus trap", e);
}
$scope.focusTrap = null;
}
return deferred.promise;
}
function _openPopover() {
if (open) {
return;
}
open = true;
$timeout(function() {
$scope.$toggleButton.popover('show');
$scope.loading = false;
snCustomEvent.fire('show.complexpopover.' + $scope.ref, $scope.$toggleButton);
$scope.$toggleButton.on('shown.bs.popover', function(evt) {
var popoverObject = angular.element(evt.target).data('bs.popover'),
$tooltip,
popover;
$tooltip = popoverObject && popoverObject.$tip;
popover = $tooltip && $tooltip[0];
if (popover) {
createAndActivateFocusTrap(popover);
}
snCustomEvent.fire('shown.complexpopover.' + $scope.ref, $scope.$toggleButton);
});
$scope.$toggleButton.on('hide.bs.popover', function () {
deactivateAndDestroyFocusTrap().finally(function() {
$scope.$toggleButton.focus();
});
});
}, 0 );
}
}
};
});
;
/*! RESOURCE: /scripts/sn/common/ui/popover/service.snComplexPopoverService.js */
angular.module('sn.common.ui.popover').service('snComplexPopoverService', function($http, $q, $templateCache){
"use strict";
return {
getTemplate: getTemplate
};
function getTemplate(template){
return $http.get(template, {cache: $templateCache});
}
});
;
;
/*! RESOURCE: /scripts/sn/common/ui/directive.snConfirmModal.js */
angular.module('sn.common.ui').directive('snConfirmModal', function(getTemplateUrl) {
return {
templateUrl: getTemplateUrl('sn_confirm_modal.xml'),
restrict: 'E',
replace: true,
transclude: true,
scope: {
config: '=?',
modalName: '@',
title: '@?',
message: '@?',
cancelButton:  '@?',
okButton: '@?',
alertButton: '@?',
cancel: '&?',
ok: '&?',
alert: '&?'
},
link: function (scope, element) {
element.find('.modal').remove();
},
controller: function($scope, $rootScope) {
$scope.config = $scope.config || {};
function Button(fn, text) {
return { fn: fn, text: text }
}
var buttons = {
'cancelButton': new Button('cancel', 'Cancel'),
'okButton':     new Button('ok',     'OK'),
'alertButton':  new Button('alert',  'Close'),
getText: function(type) {
var button = this[type];
if (button && $scope.get(button.fn))
return button.text;
}
};
$scope.get = function(type) {
if ($scope.config[type])
return $scope.config[type];
if (!$scope[type]) {
var text = buttons.getText(type);
if (text)
return $scope.config[type] = text;
}
return $scope.config[type] = $scope[type];
};
if(!$scope.get('modalName'))
$scope.config.modalName = 'confirm-modal';
function call(type) {
var action = $scope.get(type);
if (action) {
if (angular.isFunction(action))
action();
return true;
}
return !!buttons.getText(type);
}
$scope.cancelPressed = close('cancel');
$scope.okPressed = close('ok');
$scope.alertPressed = close('alert');
function close (type) {
return function () {
actionClosed = true;
$rootScope.$broadcast('dialog.' + $scope.config.modalName + '.close');
call(type);
}
}
var actionClosed;
$scope.$on('dialog.' + $scope.get('modalName') + '.opened', function() {
actionClosed = false;
});
$scope.$on('dialog.' + $scope.get('modalName') + '.closed', function() {
if (actionClosed)
return;
if (call('cancel'))
return;
if (call('alert'))
return;
call('ok');
});
}
};
});
;
/*! RESOURCE: /scripts/sn/common/ui/directive.snContextMenu.js */
angular.module('sn.common.ui').directive('contextMenu', function ($document, $window, snCustomEvent) {
var $contextMenu, $ul;
var scrollHeight = angular.element("body").get(0).scrollHeight;
var contextMenuItemHeight = 0;
var $triggeringElement;
var _focusTrap;
function setContextMenuPosition(event, $ul){
if (!event.pageX && event.originalEvent.changedTouches)
event = event.originalEvent.changedTouches[0];
if (contextMenuItemHeight === 0)
contextMenuItemHeight = 24;
var cmWidth = 150;
var cmHeight = contextMenuItemHeight * $ul.children().length;
var pageX = event.pageX;
var pageY = event.pageY;
if (!pageX) {
var rect = event.target.getBoundingClientRect();
pageX = rect.left + angular.element(event.target).width();
pageY = rect.top + angular.element(event.target).height();
}
var startX = pageX + cmWidth >= $window.innerWidth ? pageX - cmWidth : pageX;
var startY = pageY + cmHeight >= $window.innerHeight ? pageY - cmHeight : pageY;
$ul.css({
display: 'block',
position: 'absolute',
left: startX,
top: startY
});
}
function renderContextMenuItems($scope, event, options) {
$ul.empty();
angular.forEach(options, function (item) {
var $li = angular.element('<li role="presentation">');
if (item === null) {
$li.addClass('divider');
} else {
var $a = angular.element('<a role="menuitem" href="javascript:void(0)">');
$a.text(typeof item[0] == 'string' ? item[0] : item[0].call($scope, $scope));
$li.append($a);
$li.on('click', function ($event) {
$event.preventDefault();
$scope.$apply(function () {
_clearContextMenus(event);
item[1].call($scope, $scope);
});
});
}
$ul.append($li);
});
setContextMenuPosition(event, $ul);
}
var renderContextMenu = function ($scope, event, options) {
angular.element(event.currentTarget).addClass('context');
$contextMenu = angular.element('<div>', {
'class': 'dropdown clearfix context-dropdown open'
});
$contextMenu.on('click', function (e) {
if (angular.element(e.target).hasClass('dropdown')) {
_clearContextMenus(event);
}
});
$contextMenu.on('contextmenu', function (event) {
event.preventDefault();
_clearContextMenus(event);
});
$contextMenu.on('keydown', function(event) {
if (event.keyCode != 27 && event.keyCode != 9)
return;
event.preventDefault();
_clearContextMenus(event);
});
$contextMenu.css({
position: 'absolute',
top: 0,
height: scrollHeight,
left: 0,
right: 0,
zIndex: 9999
});
$document.find('body').append($contextMenu);
$ul = angular.element('<ul>', {
'class': 'dropdown-menu',
'role': 'menu'
});
renderContextMenuItems($scope, event, options);
$contextMenu.append($ul);
$triggeringElement = document.activeElement;
activateFocusTrap();
$contextMenu.data('resizeHandler', function() {
scrollHeight = angular.element("body").get(0).scrollHeight;
$contextMenu.css('height', scrollHeight);
});
snCustomEvent.observe('partial.page.reload', $contextMenu.data('resizeHandler'));
};
function _clearContextMenus(event){
if (!event)
return;
angular.element(event.currentTarget).removeClass('context');
var els = angular.element(".context-dropdown");
angular.forEach(els, function(el){
snCustomEvent.un('partial.page.reload', angular.element(el).data('resizeHandler'));
angular.element(el).remove();
});
deactivateFocusTrap();
}
function activateFocusTrap() {
if (_focusTrap || !window.focusTrap)
return;
_focusTrap = focusTrap($contextMenu[0], {
focusOutsideDeactivates: true,
clickOutsideDeactivates: true
});
_focusTrap.activate();
}
function deactivateFocusTrap() {
if (!_focusTrap || !window.focusTrap)
return;
_focusTrap.deactivate();
_focusTrap = null;
}
return function (scope, element, attrs) {
element.on('contextmenu', function (event) {
if (event.ctrlKey)
return;
if (angular.element(element).attr('context-type'))
return;
showMenu(event);
});
element.on('click', handleClick);
element.on('keydown', function(event) {
if (event.keyCode == 32) {
handleSpace(event);
} else if (event.keyCode === 13) {
handleClick(event);
}
});
var doubleTapTimeout,
doubleTapActive = false,
doubleTapStartPosition;
element.on('touchstart', function(event) {
doubleTapStartPosition = {
x: event.originalEvent.changedTouches[0].screenX,
y: event.originalEvent.changedTouches[0].screenY
};
});
element.on('touchend', function(event) {
var distX = Math.abs(event.originalEvent.changedTouches[0].screenX - doubleTapStartPosition.x);
var distY = Math.abs(event.originalEvent.changedTouches[0].screenY - doubleTapStartPosition.y);
if (distX > 15 || distY > 15) {
doubleTapStartPosition = null;
return;
}
if (doubleTapActive) {
doubleTapActive = false;
clearTimeout(doubleTapTimeout);
showMenu(event);
event.preventDefault();
return;
}
doubleTapActive = true;
event.preventDefault();
doubleTapTimeout = setTimeout(function() {
doubleTapActive = false;
if (event.target)
event.target.click();
}, 300);
});
function handleSpace(evt) {
var $target = angular.element(evt.target);
if ($target.is('button, [role=button]')) {
handleClick(evt);
return;
}
if (!$target.hasClass('list-edit-cursor'))
return;
showMenu(evt);
}
function handleClick(event) {
var $el = angular.element(element);
var $target = angular.element(event.target);
if (!$el.attr('context-type') && !$target.hasClass('context-menu-click'))
return;
showMenu(event);
}
function showMenu(evt) {
scope.$apply(function () {
applyMenu(evt);
clearWindowSelection();
});
}
function clearWindowSelection() {
if (window.getSelection)
if (window.getSelection().empty)
window.getSelection().empty();
else if (window.getSelection().removeAllRanges)
window.getSelection().removeAllRanges();
else if (document.selection)
document.selection.empty();
}
function applyMenu(event) {
var tagName = event.target.tagName;
if (tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'BUTTON') {
return;
}
var menu = scope.$eval(attrs.contextMenu, { event: event });
if (menu instanceof Array) {
if (menu.length > 0) {
event.stopPropagation();
event.preventDefault();
scope.$watch(function(){ return menu; }, function(newValue, oldValue){ if (newValue !== oldValue) renderContextMenuItems(scope, event, menu);}, true);
renderContextMenu(scope, event, menu);
}
} else if (typeof menu !== 'undefined' && typeof menu.then === 'function' ) {
event.stopPropagation();
event.preventDefault();
menu.then(function(response) {
var contextMenu = response;
if (contextMenu.length > 0) {
scope.$watch(function() {
return contextMenu;
}, function(newValue, oldValue) {
if (newValue !== oldValue)
renderContextMenuItems(scope, event, contextMenu);
}, true);
renderContextMenu(scope, event, contextMenu);
} else {
throw '"' + attrs.contextMenu + '" is not an array or promise';
}
});
} else {
throw '"' + attrs.contextMenu + '" is not an array or promise';
}
}
};
});
;
/*! RESOURCE: /scripts/sn/common/ui/directive.snDialog.js */
angular.module("sn.common.ui").directive("snDialog", function($timeout, $rootScope, $document) {
"use strict";
return {
restrict: "AE",
transclude: true,
scope: {
modal: "=?",
disableAutoFocus: "=?",
classCheck: "="
},
replace: true,
template: '<dialog ng-keyup="escape($event)"><div ng-click="onClickClose()" title="Close" class="close-button icon-button icon-cross"></div></dialog>',
link: function(scope, element, attrs, ctrl, transcludeFn) {
var transcludeScope = {};
scope.isOpen = function() {
return element[0].open;
};
transcludeFn(element.scope().$new(), function(a, b) {
element.append(a);
transcludeScope = b;
});
element.click(function(event) {
event.stopPropagation();
if (event.offsetX < 0 || event.offsetX > element[0].offsetWidth || event.offsetY < 0 || event.offsetY > element[0].offsetHeight)
if (!scope.classCheck)
scope.onClickClose();
else {
var classes = scope.classCheck.split(",");
var found = false;
for (var i = 0; i < classes.length; i++)
if (angular.element(event.target).closest(classes[i]).length > 0)
found = true;
if (!found)
scope.onClickClose();
}
});
scope.show = function() {
var d = element[0];
if (!d.showModal || true) {
dialogPolyfill.registerDialog(d);
d.setDisableAutoFocus(scope.disableAutoFocus);
}
if (scope.modal)
d.showModal();
else
d.show();
if(!angular.element(d).hasClass('sn-alert')) {
$timeout(function() {
if (d.dialogPolyfillInfo && d.dialogPolyfillInfo.backdrop) {
angular.element(d.dialogPolyfillInfo.backdrop).one('click', function(event) {
if (!scope.classCheck || angular.element(event.srcElement).closest(scope.classCheck).length == 0)
scope.onClickClose();
})
}
else {
$document.on('click', function(event) {
if (!scope.classCheck || angular.element(event.srcElement).closest(scope.classCheck).length == 0)
scope.onClickClose();
})
}
});
}
element.find('.btn-primary').eq(0).focus();
};
scope.setPosition = function(data) {
var contextData = scope.getContextData(data);
if (contextData && element && element[0]) {
if (contextData.position) {
element[0].style.top = contextData.position.top + "px";
element[0].style.left = contextData.position.left + "px";
element[0].style.margin = "0px";
}
if (contextData.dimensions) {
element[0].style.width = contextData.dimensions.width + "px";
element[0].style.height = contextData.dimensions.height + "px";
}
}
}
scope.$on("dialog." + attrs.name + ".move", function(event, data) {
scope.setPosition(data);
})
scope.$on("dialog." + attrs.name + ".show", function(event, data) {
scope.setPosition(data);
scope.setKeyEvents(data);
if (scope.isOpen() === true)
scope.close();
else
scope.show();
angular.element(".sn-dialog-menu").each(function(index, value) {
var name = angular.element(this).attr('name');
if(name != attrs.name && !angular.element(this).attr('open')) {
return true;
}
if(name != attrs.name  && angular.element(this).attr('open')) {
$rootScope.$broadcast("dialog." + name + ".close");
}
});
})
scope.onClickClose = function() {
if (scope.isOpen())
$rootScope.$broadcast("dialog." + attrs.name + ".close");
}
scope.escape = function($event) {
if ($event.keyCode === 27) {
scope.onClickClose();
}
};
scope.close = function() {
var d = element[0];
d.close();
scope.removeListeners();
}
scope.ok = function(contextData) {
contextData.ok();
scope.removeListeners();
}
scope.cancel = function(contextData) {
contextData.cancel();
scope.removeListeners();
}
scope.removeListeners = function() {
element[0].removeEventListener("ok", scope.handleContextOk, false);
element[0].removeEventListener("cancel", scope.handleContextCancel, false);
}
scope.setKeyEvents = function(data) {
var contextData = scope.getContextData(data);
if (contextData && contextData.cancel) {
scope.handleContextOk = function() {
scope.ok(contextData);
}
scope.handleContextCancel = function() {
scope.cancel(contextData);
}
element[0].addEventListener("ok", scope.handleContextOk, false);
element[0].addEventListener("cancel", scope.handleContextCancel, false);
}
}
scope.getContextData = function(data) {
var context = attrs.context;
var contextData = null;
if (context && data && context in data) {
contextData = data[context];
transcludeScope[context] = contextData;
}
return contextData;
}
scope.$on("dialog." + attrs.name + ".close", scope.close);
}
}
});
;
/*! RESOURCE: /scripts/sn/common/ui/directive.snFlyout.js */
angular.module('sn.common.ui').directive('snFlyout', function(getTemplateUrl) {
'use strict';
return {
restrict: 'E',
transclude: true,
replace: 'true',
templateUrl: getTemplateUrl('sn_flyout.xml'),
scope: true,
link: function($scope, element, attrs) {
$scope.open = false;
$scope.more = false;
$scope.position = attrs.position || 'left';
$scope.flyoutControl = attrs.control;
$scope.register = attrs.register;
var body = angular.element('.flyout-body', element);
var header = angular.element('.flyout-header', element);
var tabs = angular.element('.flyout-tabs', element);
var distance = 0;
var position = $scope.position;
var options = {duration: 800, easing: 'easeOutBounce'}
var animation = {};
if ($scope.flyoutControl) {
$('.flyout-handle', element).hide();
var controls = angular.element('#' + $scope.flyoutControl);
controls.click(function() { angular.element(this).trigger("snFlyout.open"); });
controls.on('snFlyout.open', function() {
$scope.$apply(function() { $scope.open = !$scope.open; });
});
}
var animate = function() {
element.velocity(animation, options);
}
var setup = function() {
animation[position] = -distance;
if ($scope.open)
element.css(position, 0);
else
element.css(position, -distance);
}
var calculatePosition = function() {
if ($scope.open) {
animation[position] = 0;
} else {
if ($scope.position === 'left' || $scope.position === 'right')
animation[position] = -body.outerWidth();
else
animation[position] = -body.outerHeight();
}
}
$scope.$watch('open', function(newValue, oldValue) {
if(newValue === oldValue)
return;
calculatePosition();
animate();
});
$scope.$watch('more', function(newValue, oldValue) {
if (newValue === oldValue)
return;
var moreAnimation = {};
if ($scope.more) {
element.addClass('fly-double');
moreAnimation = {width: body.outerWidth() * 2};
}
else {
element.removeClass('fly-double');
moreAnimation = {width: body.outerWidth() / 2};
}
body.velocity(moreAnimation, options);
header.velocity(moreAnimation, options);
});
if ($scope.position === 'left' || $scope.position === 'right') {
$scope.$watch(element[0].offsetWidth, function() {
element.addClass('fly-from-' + $scope.position);
distance = body.outerWidth();
setup();
});
} else if ($scope.position === 'top' || $scope.position === 'bottom') {
$scope.$watch(element[0].offsetWidth, function() {
element.addClass('fly-from-' + $scope.position);
distance = body.outerHeight() + header.outerHeight();
setup();
});
}
$scope.$on($scope.register + ".bounceTabByIndex", function(event, index) {
$scope.bounceTab(index);
});
$scope.$on($scope.register + ".bounceTab", function(event, tab) {
$scope.bounceTab($scope.tabs.indexOf(tab));
});
$scope.$on($scope.register + ".selectTabByIndex", function(event, index) {
$scope.selectTab($scope.tabs[index]);
});
$scope.$on($scope.register + ".selectTab", function(event, tab) {
$scope.selectTab(tab);
});
},
controller: function($scope, $element) {
$scope.tabs = [];
var baseColor, highLightColor;
$scope.selectTab = function(tab) {
if ($scope.selectedTab)
$scope.selectedTab.selected = false;
tab.selected = true;
$scope.selectedTab = tab;
normalizeTab($scope.tabs.indexOf(tab));
}
function expandTab(tabElem) {
tabElem.queue("tabBounce", function(next) {
tabElem.velocity({
width: ["2.5rem", "2.125rem"],
backgroundColorRed: [highLightColor[0], baseColor[0]],
backgroundColorGreen: [highLightColor[1], baseColor[1]],
backgroundColorBlue: [highLightColor[2], baseColor[2]]
},{
easing: "easeInExpo",
duration: 250
});
next();
});
}
function contractTab(tabElem) {
tabElem.queue("tabBounce", function(next) {
tabElem.velocity({
width: ["2.125rem","2.5rem"],
backgroundColorRed: [baseColor[0], highLightColor[0]],
backgroundColorGreen: [baseColor[1], highLightColor[1]],
backgroundColorBlue: [baseColor[2], highLightColor[2]]
},{
easing: "easeInExpo",
duration: 250
});
next();
});
}
$scope.bounceTab = function(index) {
if(index >= $scope.tabs.length || index < 0)
return;
var tabScope = $scope.tabs[index];
if(!tabScope.selected) {
var tabElem =  $element.find('.flyout-tab').eq(index);
if(!baseColor) {
baseColor = tabElem.css('backgroundColor').match(/[0-9]+/g);
for( var i = 0; i < baseColor.length; i++)
baseColor[i] = parseInt(baseColor[i], 10);
}
if(!highLightColor)
highLightColor = invertColor(baseColor);
if(tabScope.highlighted)
contractTab(tabElem);
for(var i = 0; i < 2; i++) {
expandTab(tabElem);
contractTab(tabElem);
}
expandTab(tabElem);
tabElem.dequeue("tabBounce");
tabScope.highlighted = true;
}
}
$scope.toggleOpen = function() {
$scope.open = !$scope.open;
}
this.addTab = function(tab) {
$scope.tabs.push(tab);
if($scope.tabs.length === 1)
$scope.selectTab(tab)
}
function normalizeTab(index) {
if(index < 0 || index >= $scope.tabs.length || !$scope.tabs[index].highlighted)
return;
var tabElem =  $element.find('.flyout-tab').eq(index);
tabElem.velocity({
width: ["2.125rem", "2.5rem"]
},{
easing: "easeInExpo",
duration: 250
});
tabElem.css('backgroundColor', '');
$scope.tabs[index].highlighted = false;
}
function invertColor(rgb) {
if(typeof rgb === "string")
var color = rgb.match(/[0-9]+/g);
else
var color = rgb.slice(0);
for(var i = 0; i < color.length; i++)
color[i] = 255 - parseInt(color[i], 10);
return color;
}
}
}
}).directive("snFlyoutTab", function() {
"use strict";
return {
restrict: "E",
require: "^snFlyout",
replace: true,
scope: true,
transclude: true,
template: "<div ng-show='selected' ng-transclude='' style='height: 100%'></div>",
link: function(scope, element, attrs, flyoutCtrl) {
flyoutCtrl.addTab(scope);
}
}
})
;
/*! RESOURCE: /scripts/sn/common/ui/directive.snModal.js */
angular.module("sn.common.ui").directive("snModal", function($timeout, $rootScope) {
"use strict";
return {
restrict: "AE",
transclude: true,
scope: {},
replace: true,
template: '<div tabindex="-1" aria-hidden="true" class="modal" role="dialog"></div>',
link: function(scope, element, attrs, ctrl, transcludeFn) {
var transcludeScope = {};
transcludeFn(element.scope().$new(), function(a, b) {
element.append(a);
transcludeScope = b;
});
scope.$on("dialog." + attrs.name + ".show", function(event, data) {
if (!isOpen())
show(data);
});
scope.$on("dialog." + attrs.name + ".close", function() {
if (isOpen())
close();
});
function eventFn(eventName) {
return function (e) {
$rootScope.$broadcast("dialog." + attrs.name + "." + eventName, e);
}
}
var events = {
'shown.bs.modal'  : eventFn("opened"),
'hide.bs.modal'   : eventFn("hide"),
'hidden.bs.modal' : eventFn("closed")
};
function show(data) {
var context = attrs.context;
var contextData = null;
if (context && data && context in data) {
contextData = data[context];
transcludeScope[context] = contextData;
}
$timeout(function() {
angular.element('.sn-popover-basic').each(function () {
var $this = angular.element(this);
if (angular.element($this.attr('data-target')).is(':visible')) {
$this.popover('hide');
}
});
});
element.modal('show');
for (var event in events)
if(events.hasOwnProperty(event))
element.on(event, events[event]);
if (attrs.moveBackdrop == 'true')
moveBackdrop(element);
}
function close() {
element.modal('hide');
for (var event in events)
if(events.hasOwnProperty(event))
element.off(event, events[event]);
}
function isOpen() {
return element.hasClass('in');
}
function moveBackdrop(element) {
var backdrop = element.data('bs.modal').$backdrop;
if (!backdrop)
return;
element.after(backdrop.remove());
}
}
}
});
;
/*! RESOURCE: /scripts/sn/common/ui/directive.snModalShow.js */
angular.module('sn.common.ui').directive('snModalShow', function() {
"use strict";
return {
restrict: 'A',
link: function(scope, element, attrs) {
element.click(function() {
showDialog();
});
function showDialog() {
scope.$broadcast('dialog.' + attrs.snModalShow + '.show');
}
if (window.SingletonKeyboardRegistry) {
SingletonKeyboardRegistry.getInstance().bind('ctrl + alt + i', function () {
scope.$broadcast('dialog.impersonate.show');
}).selector(null, true);
}
}
}
});
;
/*! RESOURCE: /scripts/sn/common/ui/directive.snTabs.js */
angular.module('sn.common.ui').directive('snTabs', function() {
'use strict';
return {
restrict: 'E',
transclude: true,
replace: 'true',
scope: {
tabData: '='
},
link: function($scope, element, attrs) {
$scope.tabClass = attrs.tabClass;
$scope.register = attrs.register;
attrs.$observe('register', function(value) {
$scope.register = value;
$scope.setupListeners();
});
$scope.bounceTab = function() {
angular.element()
}
},
controller: 'snTabs'
}
}).controller('snTabs', function($scope, $rootScope) {
$scope.selectedTabIndex = 0;
$scope.tabData[$scope.selectedTabIndex].selected = true;
$scope.setupListeners = function() {
$scope.$on($scope.register + '.selectTabByIndex', function(event, index) {
$scope.selectTabByIndex(event, index);
});
}
$scope.selectTabByIndex = function(event, index) {
if (index === $scope.selectedTabIndex)
return;
if (event.stopPropagation)
event.stopPropagation();
$scope.tabData[$scope.selectedTabIndex].selected = false;
$scope.tabData[index].selected = true;
$scope.selectedTabIndex = index;
$rootScope.$broadcast($scope.register + '.selectTabByIndex', $scope.selectedTabIndex);
}
}).directive('snTab', function() {
'use strict';
return {
restrict: 'E',
transclude: true,
replace: 'true',
scope: {
tabData: '=',
index: '='
},
template: '',
controller: 'snTab',
link: function($scope, element, attrs) {
$scope.register = attrs.register;
attrs.$observe('register', function(value) {
$scope.register = value;
$scope.setupListeners();
});
$scope.bounceTab = function() {
alert('Bounce Tab at Index: ' + $scope.index);
}
}
}
}).controller('snTab', function($scope) {
$scope.selectTabByIndex = function(index) {
$scope.$emit($scope.register + '.selectTabByIndex', index);
}
$scope.setupListeners = function() {
$scope.$on($scope.register + '.showTabActivity', function(event, index, type) {
$scope.showTabActivity(index, type);
});
}
$scope.showTabActivity = function(index, type) {
if ($scope.index !== index)
return;
switch (type) {
case 'message':
break;
case 'error':
break;
default:
$scope.bounceTab();
}
}
});
;
/*! RESOURCE: /scripts/sn/common/ui/directive.snTextExpander.js */
angular.module('sn.common.ui').directive('snTextExpander', function(getTemplateUrl, $timeout) {
'use strict';
return {
restrict: 'E',
replace: true,
templateUrl: getTemplateUrl('sn_text_expander.xml'),
scope: {
maxHeight: '&',
value: '='
},
link: function compile(scope, element, attrs) {
var container = angular.element(element).find('.textblock-content-container');
var content = angular.element(element).find('.textblock-content');
if (scope.maxHeight() === undefined) {
scope.maxHeight = function () {
return 100;
}
}
container.css('overflow-y', 'hidden');
container.css('max-height', scope.maxHeight() + 'px');
},
controller: function ($scope, $element) {
var container = $element.find('.textblock-content-container');
var content = $element.find('.textblock-content');
$scope.value = $scope.value || '';
$scope.toggleExpand = function () {
$scope.showMore = !$scope.showMore;
if ($scope.showMore) {
container.css('max-height', content.height());
} else {
container.css('max-height', $scope.maxHeight());
}
};
$timeout(function () {
if (content.height() > $scope.maxHeight()) {
$scope.showToggle = true;
$scope.showMore = false;
}
});
}
};
});
;
/*! RESOURCE: /scripts/sn/common/ui/directive.snAttachmentPreview.js */
angular.module('sn.common.ui').directive('snAttachmentPreview', function(getTemplateUrl, snCustomEvent) {
return {
restrict: 'E',
templateUrl: getTemplateUrl('sn_attachment_preview.xml'),
controller: function($scope) {
snCustomEvent.observe('sn.attachment.preview', function(evt, attachment) {
if (evt.stopPropagation)
evt.stopPropagation();
if (evt.preventDefault)
evt.preventDefault();
$scope.image = attachment;
$scope.$broadcast('dialog.attachment_preview.show');
return false;
});
}
}
});
;
/*! RESOURCE: /scripts/sn/common/ui/service.progressDialog.js */
angular.module('sn.common.ui').factory('progressDialog', ['$rootScope', '$compile', '$timeout', '$http', '$templateCache', 'nowServer', 'i18n', function($rootScope, $compile, $timeout, $http, $templateCache, nowServer, i18n) {
'use strict';
i18n.getMessages(['Close']);
return {
STATES : ["Pending", "Running", "Succeeded", "Failed", "Cancelled" ],
STATUS_IMAGES : ["images/workflow_skipped.gif", "images/loading_anim2.gifx",
"images/progress_success.png", "images/progress_failure.png",
'images/request_cancelled.gif' ],
EXPAND_IMAGE : "images/icons/filter_hide.gif",
COLLAPSE_IMAGE : "images/icons/filter_reveal.gif",
BACK_IMAGE : "images/activity_filter_off.gif",
TIMEOUT_INTERVAL : 750,
_findChildMessage: function( statusObject ) {
if ( !statusObject.children ) return null;
for ( var i = 0; i < statusObject.children.length; i++ ) {
var child = statusObject.children[i];
if ( child.state == '1' ) {
var msg = child.message;
var submsg = this._findChildMessage( child );
if ( submsg == null )
return msg;
else
return null;
} else if ( child.state == '0' ) {
return null;
} else {
}
}
return null;
},
create: function(scope, elemid, title, startCallback, endCallback, closeCallback) {
var namespace = this;
var progressItem = scope.$new(true);
progressItem.id = elemid + "_progressDialog";
progressItem.overlayVisible = true;
progressItem.state = 0;
progressItem.message = '';
progressItem.percentComplete = 0;
progressItem.enableChildMessages = false;
if (!title) title = '';
progressItem.title = title;
progressItem.button_close = i18n.getMessage('Close');
var overlayElement;
overlayElement = $compile(
'<div id="{{id}}" ng-show="overlayVisible" class="modal modal-mask" role="dialog" tabindex="-1">' +
'<div class="modal-dialog m_progress_overlay_content">' +
'<div class="modal-content">' +
'<header class="modal-header">' +
'<h4 class="modal-title">{{title}}</h4>' +
'</header>' +
'<div class="modal-body">' +
'<div class="progress" ng-class="{\'progress-danger\': (state == 3)}">' +
'<div class="progress-bar" ng-class="{\'progress-bar-danger\': (state == 3)}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="{{percentComplete}}" ng-style="{width: percentComplete + \'%\'}">' +
'</div>' +
'</div>' +
'<div>{{message}}<span style="float: right;" ng-show="state==1 || state == 2">{{percentComplete}}%</span></div>' +
'</div>' +
'<footer class="modal-footer">' +
'<button class="btn btn-default sn-button sn-button-normal" ng-click="close()" ng-show="state > 1">{{button_close}}</button>' +
'</footer>' +
'</div>' +
'</div>' +
'</div>')(progressItem);
$("body")[0].appendChild(overlayElement[0]);
progressItem.setEnableChildMessages = function( enableChildren ) {
progressItem.enableChildMessages = enableChildren;
}
progressItem.start = function( src, dataArray ) {
$http.post(src, dataArray).success(function(response) {
progressItem.trackerId = response.sys_id;
try { if ( startCallback ) startCallback(response); } catch(e) { }
$timeout(progressItem.checkProgress.bind(progressItem));
})
.error(function(response, status, headers, config) {
progressItem.state = '3';
if (endCallback) endCallback( response );
});
};
progressItem.checkProgress = function() {
var src = nowServer.getURL('progress_status', {sysparm_execution_id: this.trackerId});
$http.post(src).success(function(response) {
if ( $.isEmptyObject(response) ) {
progressItem.state = '3';
if (endCallback) endCallback( response );
return;
}
progressItem.update( response );
if (response.status == 'error' || response.state == '') {
progressItem.state = '3';
if ( response.message )
progressItem.message = response.message;
else
progressItem.message = response;
if (endCallback) endCallback( response );
return;
}
if ( response.state == '0' || response.state == '1' ) {
$timeout(progressItem.checkProgress.bind(progressItem), namespace.TIMEOUT_INTERVAL);
} else {
if (endCallback) endCallback( response );
}
})
.error(function(response, status, headers, config) {
progressItem.state = '3';
progressItem.message = response;
if (endCallback) endCallback( response );
});
};
progressItem.update = function( statusObject ) {
var msg = statusObject.message;
if ( progressItem.enableChildMessages ) {
var childMsg = namespace._findChildMessage( statusObject );
if ( childMsg != null )
msg = childMsg;
}
this.message = msg;
this.state = statusObject.state;
this.percentComplete = statusObject.percent_complete;
};
progressItem.close = function(ev) {
try { if (closeCallback) closeCallback(); } catch(e) { }
$("body")[0].removeChild($("#" + this.id)[0]);
delete namespace.progressItem;
};
return progressItem;
}
}
}]);
;
/*! RESOURCE: /scripts/sn/common/ui/factory.paneManager.js */
angular.module("sn.common.ui").factory("paneManager", ['$timeout', 'userPreferences', 'snCustomEvent', function($timeout, userPreferences, snCustomEvent) {
"use strict";
var paneIndex = {};
function registerPane(paneName) {
if (!paneName in paneIndex) {
paneIndex[paneName] = false;
}
userPreferences.getPreference(paneName + '.opened').then(function(value) {
var isOpen = value !== 'false';
if (isOpen) {
togglePane(paneName, false);
}
});
}
function togglePane(paneName, autoFocusPane) {
for (var currentPane in paneIndex) {
if (paneName != currentPane && paneIndex[currentPane]) {
CustomEvent.fireTop(currentPane + '.toggle');
saveState(currentPane, false);
}
}
snCustomEvent.fireTop(paneName + '.toggle', false, autoFocusPane);
saveState(paneName, !paneIndex[paneName]);
};
function saveState(paneName, state) {
paneIndex[paneName] = state;
userPreferences.setPreference(paneName + '.opened', state);
}
return {
registerPane : registerPane,
togglePane : togglePane
};
}]);
;
/*! RESOURCE: /scripts/sn/common/ui/directive.snBootstrapPopover.js */
angular.module('sn.common.ui').directive('snBootstrapPopover', function ($timeout, $compile, $rootScope) {
'use strict';
return {
restrict: 'A',
link: function (scope, element) {
element.on('click.snBootstrapPopover', function (event) {
$rootScope.$broadcast('sn-bootstrap-popover.close-other-popovers');
createPopover(event);
});
element.on('keypress.snBootstrapPopover', function (event) {
if (event.keyCode == 9)
return;
if (event.keyCode ===  32 ) {
event.preventDefault();
}
scope.$broadcast('sn-bootstrap-popover.close-other-popovers');
createPopover(event);
});
var popoverOpen = false;
function _hidePopover() {
popoverOpen = false;
var api = element.data('bs.popover');
if (api) {
api.hide();
element.off('.popover').removeData('bs.popover');
element.data('bs.popover', void(0));
}
}
function _openPopover() {
$timeout(function () {
popoverOpen = true;
element.on('hidden.bs.popover', function () {
_hidePopover();
popoverOpen = false;
});
element.popover('show');
}, 0, false);
}
function createPopover (evt) {
angular.element('.popover').each(function () {
var object = angular.element(this);
if (!object.is(evt.target) && object.has(evt.target).length === 0 && angular.element('.popover').has(evt.target).length === 0) {
_hidePopover();
object.popover('hide');
}
});
if (scope.disablePopover || evt.keyCode === 9)
return;
if (popoverOpen) {
_hidePopover();
return;
}
var childScope = scope.$new();
evt.stopPropagation();
element.attr('data-toggle', 'popover');
element.attr('data-trigger','focus');
element.attr('tabindex',0);
angular.element(element).popover({
container: 'body',
placement: 'auto top',
html: true,
trigger: 'manual',
content: $compile(scope.template)(childScope)
});
var wait = element.attr('popover-wait-event');
if (wait)
scope.$on(wait, _openPopover);
else
_openPopover();
var bodyClickEvent = angular.element('body').on('click.snBootstrapPopover.body', function (evt) {
angular.element('.popover').each(function () {
var object = angular.element(this);
if (!object.is(evt.target) && object.has(evt.target).length === 0 && angular.element('.popover').has(evt.target).length === 0) {
bodyClickEvent.off();
_hidePopover();
childScope.$destroy();
}
})
});
element.on('$destroy', function () {
bodyClickEvent.off();
_hidePopover();
childScope.$destroy();
})
};
}
}
});
;
/*! RESOURCE: /scripts/sn/common/ui/directive.snFocusEsc.js */
angular.module('sn.common.ui').directive('snFocusEsc', function($document) {
'use strict';
return {
restrict: 'A',
scope: false,
link: function (scope, element, attrs) {
$document.on('keyup', function($event) {
if ($event.keyCode === 27 ) {
var focusedElement = $event.target;
if (focusedElement && element[0].contains(focusedElement)) {
scope.$eval(attrs.snFocusEsc);
}
}
});
}
};
});
;
;
/*! RESOURCE: /scripts/sn/common/stream/js_includes_stream.js */
/*! RESOURCE: /scripts/thirdparty/ment.io/mentio.js */
(function() {
'use strict';
angular.module('mentio', [])
.directive('mentio', ['mentioUtil', '$document', '$compile', '$log', '$timeout',
function (mentioUtil, $document, $compile, $log, $timeout) {
return {
restrict: 'A',
scope: {
macros: '=mentioMacros',
search: '&mentioSearch',
select: '&mentioSelect',
items: '=mentioItems',
typedTerm: '=mentioTypedTerm',
altId: '=mentioId',
iframeElement: '=mentioIframeElement',
requireLeadingSpace: '=mentioRequireLeadingSpace',
suppressTrailingSpace: '=mentioSuppressTrailingSpace',
selectNotFound: '=mentioSelectNotFound',
trimTerm: '=mentioTrimTerm',
ngModel: '='
},
controller: ["$scope", "$timeout", "$attrs", function($scope, $timeout, $attrs) {
$scope.query = function (triggerChar, triggerText) {
var remoteScope = $scope.triggerCharMap[triggerChar];
if ($scope.trimTerm === undefined || $scope.trimTerm) {
triggerText = triggerText.trim();
}
remoteScope.showMenu();
remoteScope.search({
term: triggerText
});
remoteScope.typedTerm = triggerText;
};
$scope.defaultSearch = function(locals) {
var results = [];
angular.forEach($scope.items, function(item) {
if (item.label.toUpperCase().indexOf(locals.term.toUpperCase()) >= 0) {
results.push(item);
}
});
$scope.localItems = results;
};
$scope.bridgeSearch = function(termString) {
var searchFn = $attrs.mentioSearch ? $scope.search : $scope.defaultSearch;
searchFn({
term: termString
});
};
$scope.defaultSelect = function(locals) {
return $scope.defaultTriggerChar + locals.item.label;
};
$scope.bridgeSelect = function(itemVar) {
var selectFn = $attrs.mentioSelect ? $scope.select : $scope.defaultSelect;
return selectFn({
item: itemVar
});
};
$scope.setTriggerText = function(text) {
if ($scope.syncTriggerText) {
$scope.typedTerm = ($scope.trimTerm === undefined || $scope.trimTerm) ? text.trim() : text;
}
};
$scope.context = function() {
if ($scope.iframeElement) {
return {iframe: $scope.iframeElement};
}
};
$scope.replaceText = function (text, hasTrailingSpace) {
$scope.hideAll();
mentioUtil.replaceTriggerText($scope.context(), $scope.targetElement, $scope.targetElementPath,
$scope.targetElementSelectedOffset, $scope.triggerCharSet, text, $scope.requireLeadingSpace,
hasTrailingSpace, $scope.suppressTrailingSpace);
if (!hasTrailingSpace) {
$scope.setTriggerText('');
angular.element($scope.targetElement).triggerHandler('change');
if ($scope.isContentEditable()) {
$scope.contentEditableMenuPasted = true;
var timer = $timeout(function() {
$scope.contentEditableMenuPasted = false;
}, 200);
$scope.$on('$destroy', function() {
$timeout.cancel(timer);
});
}
}
};
$scope.hideAll = function () {
for (var key in $scope.triggerCharMap) {
if ($scope.triggerCharMap.hasOwnProperty(key)) {
$scope.triggerCharMap[key].hideMenu();
}
}
};
$scope.getActiveMenuScope = function () {
for (var key in $scope.triggerCharMap) {
if ($scope.triggerCharMap.hasOwnProperty(key)) {
if ($scope.triggerCharMap[key].visible) {
return $scope.triggerCharMap[key];
}
}
}
return null;
};
$scope.selectActive = function () {
for (var key in $scope.triggerCharMap) {
if ($scope.triggerCharMap.hasOwnProperty(key)) {
if ($scope.triggerCharMap[key].visible) {
$scope.triggerCharMap[key].selectActive();
}
}
}
};
$scope.isActive = function () {
for (var key in $scope.triggerCharMap) {
if ($scope.triggerCharMap.hasOwnProperty(key)) {
if ($scope.triggerCharMap[key].visible) {
return true;
}
}
}
return false;
};
$scope.isContentEditable = function() {
return ($scope.targetElement.nodeName !== 'INPUT' && $scope.targetElement.nodeName !== 'TEXTAREA');
};
$scope.replaceMacro = function(macro, hasTrailingSpace) {
if (!hasTrailingSpace) {
$scope.replacingMacro = true;
$scope.timer = $timeout(function() {
mentioUtil.replaceMacroText($scope.context(), $scope.targetElement,
$scope.targetElementPath, $scope.targetElementSelectedOffset,
$scope.macros, $scope.macros[macro]);
angular.element($scope.targetElement).triggerHandler('change');
$scope.replacingMacro = false;
}, 300);
$scope.$on('$destroy', function() {
$timeout.cancel($scope.timer);
});
} else {
mentioUtil.replaceMacroText($scope.context(), $scope.targetElement, $scope.targetElementPath,
$scope.targetElementSelectedOffset, $scope.macros, $scope.macros[macro]);
}
};
$scope.addMenu = function(menuScope) {
if (menuScope.parentScope && $scope.triggerCharMap.hasOwnProperty(menuScope.triggerChar)) {
return;
}
$scope.triggerCharMap[menuScope.triggerChar] = menuScope;
if ($scope.triggerCharSet === undefined) {
$scope.triggerCharSet = [];
}
$scope.triggerCharSet.push(menuScope.triggerChar);
menuScope.setParent($scope);
};
$scope.$on(
'menuCreated', function (event, data) {
if (
$attrs.id !== undefined ||
$attrs.mentioId !== undefined
)
{
if (
$attrs.id === data.targetElement ||
(
$attrs.mentioId !== undefined &&
$scope.altId === data.targetElement
)
)
{
$scope.addMenu(data.scope);
}
}
}
);
$document.on(
'click', function () {
if ($scope.isActive()) {
$scope.$apply(function () {
$scope.hideAll();
});
}
}
);
$document.on(
'keydown keypress paste', function (event) {
var activeMenuScope = $scope.getActiveMenuScope();
if (activeMenuScope) {
if (event.which === 9 || event.which === 13) {
event.preventDefault();
activeMenuScope.selectActive();
}
if (event.which === 27) {
event.preventDefault();
activeMenuScope.$apply(function () {
activeMenuScope.hideMenu();
});
}
if (event.which === 40) {
event.preventDefault();
activeMenuScope.$apply(function () {
activeMenuScope.activateNextItem();
});
activeMenuScope.adjustScroll(1);
}
if (event.which === 38) {
event.preventDefault();
activeMenuScope.$apply(function () {
activeMenuScope.activatePreviousItem();
});
activeMenuScope.adjustScroll(-1);
}
if (event.which === 37 || event.which === 39) {
event.preventDefault();
}
}
}
);
}],
link: function (scope, element, attrs, $timeout) {
scope.triggerCharMap = {};
scope.targetElement = element;
scope.scrollBarParents = element.parents().filter(function() {
var overflow = angular.element(this).css("overflow");
return this.scrollHeight > this.clientHeight && overflow !== "hidden" && overflow !== "visible";
});
scope.scrollPosition = null;
attrs.$set('autocomplete','off');
if (attrs.mentioItems) {
scope.localItems = [];
scope.parentScope = scope;
var itemsRef = attrs.mentioSearch ? ' mentio-items="items"' : ' mentio-items="localItems"';
scope.defaultTriggerChar = attrs.mentioTriggerChar ? scope.$eval(attrs.mentioTriggerChar) : '@';
var html = '<mentio-menu' +
' mentio-search="bridgeSearch(term)"' +
' mentio-select="bridgeSelect(item)"' +
itemsRef;
if (attrs.mentioTemplateUrl) {
html = html + ' mentio-template-url="' + attrs.mentioTemplateUrl + '"';
}
html = html + ' mentio-trigger-char="\'' + scope.defaultTriggerChar + '\'"' +
' mentio-parent-scope="parentScope"' +
'/>';
var linkFn = $compile(html);
var el = linkFn(scope);
element.parent().append(el);
scope.$on('$destroy', function() {
el.remove();
});
}
if (attrs.mentioTypedTerm) {
scope.syncTriggerText = true;
}
function keyHandler(event) {
function stopEvent(event) {
event.preventDefault();
event.stopPropagation();
event.stopImmediatePropagation();
}
var activeMenuScope = scope.getActiveMenuScope();
if (activeMenuScope) {
if (event.which === 9 || event.which === 13) {
stopEvent(event);
activeMenuScope.selectActive();
return false;
}
if (event.which === 27) {
stopEvent(event);
activeMenuScope.$apply(function () {
activeMenuScope.hideMenu();
});
return false;
}
if (event.which === 40) {
stopEvent(event);
activeMenuScope.$apply(function () {
activeMenuScope.activateNextItem();
});
activeMenuScope.adjustScroll(1);
return false;
}
if (event.which === 38) {
stopEvent(event);
activeMenuScope.$apply(function () {
activeMenuScope.activatePreviousItem();
});
activeMenuScope.adjustScroll(-1);
return false;
}
if (event.which === 37 || event.which === 39) {
stopEvent(event);
return false;
}
}
}
scope.$watch(
'iframeElement', function(newValue) {
if (newValue) {
var iframeDocument = newValue.contentWindow.document;
iframeDocument.addEventListener('click',
function () {
if (scope.isActive()) {
scope.$apply(function () {
scope.hideAll();
});
}
}
);
iframeDocument.addEventListener('keydown', keyHandler, true );
scope.$on ( '$destroy', function() {
iframeDocument.removeEventListener ( 'keydown', keyHandler );
});
}
}
);
scope.$watch(
'ngModel',
function (newValue) {
if ((!newValue || newValue === '') && !scope.isActive()) {
return;
}
if (scope.triggerCharSet === undefined) {
$log.warn('Error, no mentio-items attribute was provided, ' +
'and no separate mentio-menus were specified.  Nothing to do.');
return;
}
if (scope.contentEditableMenuPasted) {
scope.contentEditableMenuPasted = false;
return;
}
if (scope.replacingMacro) {
$timeout.cancel(scope.timer);
scope.replacingMacro = false;
}
var isActive = scope.isActive();
var isContentEditable = scope.isContentEditable();
var mentionInfo = mentioUtil.getTriggerInfo(scope.context(), scope.triggerCharSet,
scope.requireLeadingSpace, isActive);
if (mentionInfo !== undefined &&
(
!isActive ||
(isActive &&
(
(isContentEditable && mentionInfo.mentionTriggerChar ===
scope.currentMentionTriggerChar) ||
(!isContentEditable && mentionInfo.mentionPosition ===
scope.currentMentionPosition)
)
)
)
)
{
if (mentionInfo.mentionSelectedElement) {
scope.targetElement = mentionInfo.mentionSelectedElement;
scope.targetElementPath = mentionInfo.mentionSelectedPath;
scope.targetElementSelectedOffset = mentionInfo.mentionSelectedOffset;
}
scope.setTriggerText(mentionInfo.mentionText);
scope.currentMentionPosition = mentionInfo.mentionPosition;
scope.currentMentionTriggerChar = mentionInfo.mentionTriggerChar;
scope.query(mentionInfo.mentionTriggerChar, mentionInfo.mentionText);
} else {
var currentTypedTerm = scope.typedTerm;
scope.setTriggerText('');
scope.hideAll();
var macroMatchInfo = mentioUtil.getMacroMatch(scope.context(), scope.macros);
if (macroMatchInfo !== undefined) {
scope.targetElement = macroMatchInfo.macroSelectedElement;
scope.targetElementPath = macroMatchInfo.macroSelectedPath;
scope.targetElementSelectedOffset = macroMatchInfo.macroSelectedOffset;
scope.replaceMacro(macroMatchInfo.macroText, macroMatchInfo.macroHasTrailingSpace);
} else if (scope.selectNotFound && currentTypedTerm && currentTypedTerm !== '') {
var lastScope = scope.triggerCharMap[scope.currentMentionTriggerChar];
if (lastScope) {
var text = lastScope.select({
item: {label: currentTypedTerm}
});
if (typeof text.then === 'function') {
text.then(scope.replaceText);
} else {
scope.replaceText(text, true);
}
}
}
}
}
);
}
};
}])
.directive('mentioMenu', ['mentioUtil', '$rootScope', '$log', '$window', '$document', '$timeout',
function (mentioUtil, $rootScope, $log, $window, $document, $timeout) {
return {
restrict: 'E',
scope: {
search: '&mentioSearch',
select: '&mentioSelect',
items: '=mentioItems',
triggerChar: '=mentioTriggerChar',
forElem: '=mentioFor',
parentScope: '=mentioParentScope'
},
templateUrl: function(tElement, tAttrs) {
return tAttrs.mentioTemplateUrl !== undefined ? tAttrs.mentioTemplateUrl : 'mentio-menu.tpl.html';
},
controller: ["$scope", function ($scope) {
$scope.visible = false;
this.activate = $scope.activate = function (item) {
$scope.activeItem = item;
};
this.isActive = $scope.isActive = function (item) {
return $scope.activeItem === item;
};
this.selectItem = $scope.selectItem = function (item) {
if (item.termLengthIsZero) {
item.name = $scope.triggerChar + $scope.typedTerm
}
var text = $scope.select({
item: item
});
if (typeof text.then === 'function') {
text.then($scope.parentMentio.replaceText);
} else {
$scope.parentMentio.replaceText(text);
}
};
$scope.activateNextItem = function () {
var index = $scope.items.indexOf($scope.activeItem);
this.activate($scope.items[(index + 1) % $scope.items.length]);
};
$scope.activatePreviousItem = function () {
var index = $scope.items.indexOf($scope.activeItem);
this.activate($scope.items[index === 0 ? $scope.items.length - 1 : index - 1]);
};
$scope.isFirstItemActive = function () {
var index = $scope.items.indexOf($scope.activeItem);
return index === 0;
};
$scope.isLastItemActive = function () {
var index = $scope.items.indexOf($scope.activeItem);
return index === ($scope.items.length - 1);
};
$scope.selectActive = function () {
$scope.selectItem($scope.activeItem);
};
$scope.isVisible = function () {
return $scope.visible;
};
$scope.showMenu = function () {
if (!$scope.visible) {
$scope.menuElement.css("visibility", "visible");
$scope.requestVisiblePendingSearch = true;
}
};
$scope.setParent = function (scope) {
$scope.parentMentio = scope;
$scope.targetElement = scope.targetElement;
};
var scopeDuplicate = $scope;
$rootScope.$on('mentio.closeMenu', function () {
scopeDuplicate.hideMenu();
})
}],
link: function (scope, element) {
element[0].parentNode.removeChild(element[0]);
$document[0].body.appendChild(element[0]);
scope.menuElement = element;
scope.menuElement.css("visibility", "hidden");
if (scope.parentScope) {
scope.parentScope.addMenu(scope);
} else {
if (!scope.forElem) {
$log.error('mentio-menu requires a target element in tbe mentio-for attribute');
return;
}
if (!scope.triggerChar) {
$log.error('mentio-menu requires a trigger char');
return;
}
$rootScope.$broadcast('menuCreated',
{
targetElement : scope.forElem,
scope : scope
});
}
angular.element($window).bind(
'resize', function () {
if (scope.isVisible()) {
var triggerCharSet = [];
triggerCharSet.push(scope.triggerChar);
mentioUtil.popUnderMention(scope.parentMentio.context(),
triggerCharSet, element, scope.requireLeadingSpace);
}
}
);
scope.$watch('items', function (items) {
if (items && items.length > 0) {
scope.activate(items[0]);
if (!scope.visible && scope.requestVisiblePendingSearch) {
scope.visible = true;
scope.requestVisiblePendingSearch = false;
}
$timeout(function() {
var menu = element.find(".dropdown-menu");
if(menu.length > 0 && menu.offset().top < 0)
menu.addClass("reverse");
}, 0, false);
} else {
scope.activate({
termLengthIsZero: true
});
}
});
scope.$watch('isVisible()', function (visible) {
if (visible) {
var triggerCharSet = [];
triggerCharSet.push(scope.triggerChar);
mentioUtil.popUnderMention(scope.parentMentio.context(),
triggerCharSet, element, scope.requireLeadingSpace);
} else {
element.find(".dropdown-menu").removeClass("reverse");
}
});
var prevScroll;
scope.parentMentio.scrollBarParents.each(function() {
angular.element(this).on("scroll.mentio", function() {
if (!prevScroll)
prevScroll = this.scrollTop;
var scrollDiff = prevScroll - this.scrollTop;
prevScroll = this.scrollTop;
if (element[0].style["position"] === "absolute") {
element[0].style["z-index"] = 9;
element[0].style.top = (parseInt(element[0].style.top) + scrollDiff) + "px";
}
});
});
scope.parentMentio.$on('$destroy', function () {
element.remove();
});
scope.hideMenu = function () {
scope.visible = false;
element.css('display', 'none');
};
scope.adjustScroll = function (direction) {
var menuEl = element[0];
var menuItemsList = menuEl.querySelector('ul');
var menuItem = menuEl.querySelector('[mentio-menu-item].active');
if (scope.isFirstItemActive()) {
return menuItemsList.scrollTop = 0;
} else if(scope.isLastItemActive()) {
return menuItemsList.scrollTop = menuItemsList.scrollHeight;
}
if (direction === 1) {
menuItemsList.scrollTop += menuItem.offsetHeight;
} else {
menuItemsList.scrollTop -= menuItem.offsetHeight;
}
};
}
};
}])
.directive('mentioMenuItem', function () {
return {
restrict: 'A',
scope: {
item: '=mentioMenuItem'
},
require: '^mentioMenu',
link: function (scope, element, attrs, controller) {
scope.$watch(function () {
return controller.isActive(scope.item);
}, function (active) {
if (active) {
element.addClass('active');
} else {
element.removeClass('active');
}
});
element.bind('mouseenter', function () {
scope.$apply(function () {
controller.activate(scope.item);
});
});
element.bind('click', function () {
controller.selectItem(scope.item);
return false;
});
}
};
})
.filter('unsafe', ["$sce", function($sce) {
return function (val) {
return $sce.trustAsHtml(val);
};
}])
.filter('mentioHighlight', function() {
function escapeRegexp (queryToEscape) {
return queryToEscape.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
}
return function (matchItem, query, hightlightClass) {
if (query) {
var replaceText = hightlightClass ?
'<span class="' + hightlightClass + '">$&</span>' :
'<strong>$&</strong>';
return ('' + matchItem).replace(new RegExp(escapeRegexp(query), 'gi'), replaceText);
} else {
return matchItem;
}
};
});
'use strict';
angular.module('mentio')
.factory('mentioUtil', ["$window", "$location", "$anchorScroll", "$timeout", function ($window, $location, $anchorScroll, $timeout) {
function popUnderMention (ctx, triggerCharSet, selectionEl, requireLeadingSpace) {
var coordinates;
var mentionInfo = getTriggerInfo(ctx, triggerCharSet, requireLeadingSpace, false);
if (mentionInfo !== undefined) {
if (selectedElementIsTextAreaOrInput(ctx)) {
coordinates = getTextAreaOrInputUnderlinePosition(ctx, getDocument(ctx).activeElement,
mentionInfo.mentionPosition);
} else {
coordinates = getContentEditableCaretPosition(ctx, mentionInfo.mentionPosition);
}
selectionEl.css({
top: coordinates.top + 'px',
left: coordinates.left + 'px',
position: 'absolute',
zIndex: 5000,
display: 'block'
});
$timeout(function(){
scrollIntoView(ctx, selectionEl);
},0);
} else {
selectionEl.css({
display: 'none'
});
}
}
function scrollIntoView(ctx, elem)
{
var reasonableBuffer = 20;
var maxScrollDisplacement = 100;
var clientRect;
var e = elem[0];
while (clientRect === undefined || clientRect.height === 0) {
clientRect = e.getBoundingClientRect();
if (clientRect.height === 0) {
e = e.childNodes[0];
if (e === undefined || !e.getBoundingClientRect) {
return;
}
}
}
var elemTop = clientRect.top;
var elemBottom = elemTop + clientRect.height;
if(elemTop < 0) {
$window.scrollTo(0, $window.pageYOffset + clientRect.top - reasonableBuffer);
} else if (elemBottom > $window.innerHeight) {
var maxY = $window.pageYOffset + clientRect.top - reasonableBuffer;
if (maxY - $window.pageYOffset > maxScrollDisplacement) {
maxY = $window.pageYOffset + maxScrollDisplacement;
}
var targetY = $window.pageYOffset - ($window.innerHeight - elemBottom);
if (targetY > maxY) {
targetY = maxY;
}
$window.scrollTo(0, targetY);
}
}
function selectedElementIsTextAreaOrInput (ctx) {
var element = getDocument(ctx).activeElement;
if (element !== null) {
var nodeName = element.nodeName;
var type = element.getAttribute('type');
return (nodeName === 'INPUT' && type === 'text') || nodeName === 'TEXTAREA';
}
return false;
}
function selectElement (ctx, targetElement, path, offset) {
var range;
var elem = targetElement;
if (path) {
for (var i = 0; i < path.length; i++) {
elem = elem.childNodes[path[i]];
if (elem === undefined) {
return;
}
while (elem.length < offset) {
offset -= elem.length;
elem = elem.nextSibling;
}
if (elem.childNodes.length === 0 && !elem.length) {
elem = elem.previousSibling;
}
}
}
var sel = getWindowSelection(ctx);
range = getDocument(ctx).createRange();
range.setStart(elem, offset);
range.setEnd(elem, offset);
range.collapse(true);
try{sel.removeAllRanges();}catch(error){}
sel.addRange(range);
targetElement.focus();
}
function pasteHtml (ctx, html, startPos, endPos) {
var range, sel;
sel = getWindowSelection(ctx);
range = getDocument(ctx).createRange();
range.setStart(sel.anchorNode, startPos);
range.setEnd(sel.anchorNode, endPos);
range.deleteContents();
var el = getDocument(ctx).createElement('div');
el.innerHTML = html;
var frag = getDocument(ctx).createDocumentFragment(),
node, lastNode;
while ((node = el.firstChild)) {
lastNode = frag.appendChild(node);
}
range.insertNode(frag);
if (lastNode) {
range = range.cloneRange();
range.setStartAfter(lastNode);
range.collapse(true);
sel.removeAllRanges();
sel.addRange(range);
}
}
function resetSelection (ctx, targetElement, path, offset) {
var nodeName = targetElement.nodeName;
if (nodeName === 'INPUT' || nodeName === 'TEXTAREA') {
if (targetElement !== getDocument(ctx).activeElement) {
targetElement.focus();
}
} else {
selectElement(ctx, targetElement, path, offset);
}
}
function replaceMacroText (ctx, targetElement, path, offset, macros, text) {
resetSelection(ctx, targetElement, path, offset);
var macroMatchInfo = getMacroMatch(ctx, macros);
if (macroMatchInfo.macroHasTrailingSpace) {
macroMatchInfo.macroText = macroMatchInfo.macroText + '\xA0';
text = text + '\xA0';
}
if (macroMatchInfo !== undefined) {
var element = getDocument(ctx).activeElement;
if (selectedElementIsTextAreaOrInput(ctx)) {
var startPos = macroMatchInfo.macroPosition;
var endPos = macroMatchInfo.macroPosition + macroMatchInfo.macroText.length;
element.value = element.value.substring(0, startPos) + text +
element.value.substring(endPos, element.value.length);
element.selectionStart = startPos + text.length;
element.selectionEnd = startPos + text.length;
} else {
pasteHtml(ctx, text, macroMatchInfo.macroPosition,
macroMatchInfo.macroPosition + macroMatchInfo.macroText.length);
}
}
}
function replaceTriggerText (ctx, targetElement, path, offset, triggerCharSet,
text, requireLeadingSpace, hasTrailingSpace, suppressTrailingSpace) {
resetSelection(ctx, targetElement, path, offset);
var mentionInfo = getTriggerInfo(ctx, triggerCharSet, requireLeadingSpace, true, hasTrailingSpace);
if (mentionInfo !== undefined) {
if (selectedElementIsTextAreaOrInput()) {
var myField = getDocument(ctx).activeElement;
if (!suppressTrailingSpace) {
text = text + ' ';
}
var startPos = mentionInfo.mentionPosition;
var endPos = mentionInfo.mentionPosition + mentionInfo.mentionText.length + 1;
myField.value = myField.value.substring(0, startPos) + text +
myField.value.substring(endPos, myField.value.length);
myField.selectionStart = startPos + text.length;
myField.selectionEnd = startPos + text.length;
} else {
if (!suppressTrailingSpace) {
text = text + '\xA0';
}
pasteHtml(ctx, text, mentionInfo.mentionPosition,
mentionInfo.mentionPosition + mentionInfo.mentionText.length + 1);
}
}
}
function getNodePositionInParent (ctx, elem) {
if (elem.parentNode === null) {
return 0;
}
for (var i = 0; i < elem.parentNode.childNodes.length; i++) {
var node = elem.parentNode.childNodes[i];
if (node === elem) {
return i;
}
}
}
function getMacroMatch (ctx, macros) {
var selected, path = [], offset;
if (selectedElementIsTextAreaOrInput(ctx)) {
selected = getDocument(ctx).activeElement;
} else {
var selectionInfo = getContentEditableSelectedPath(ctx);
if (selectionInfo) {
selected = selectionInfo.selected;
path = selectionInfo.path;
offset = selectionInfo.offset;
}
}
var effectiveRange = getTextPrecedingCurrentSelection(ctx);
if (effectiveRange !== undefined && effectiveRange !== null) {
var matchInfo;
var hasTrailingSpace = false;
if (effectiveRange.length > 0 &&
(effectiveRange.charAt(effectiveRange.length - 1) === '\xA0' ||
effectiveRange.charAt(effectiveRange.length - 1) === ' ')) {
hasTrailingSpace = true;
effectiveRange = effectiveRange.substring(0, effectiveRange.length-1);
}
angular.forEach(macros, function (macro, c) {
var idx = effectiveRange.toUpperCase().lastIndexOf(c.toUpperCase());
if (idx >= 0 && c.length + idx === effectiveRange.length) {
var prevCharPos = idx - 1;
if (idx === 0 || effectiveRange.charAt(prevCharPos) === '\xA0' ||
effectiveRange.charAt(prevCharPos) === ' ' ) {
matchInfo = {
macroPosition: idx,
macroText: c,
macroSelectedElement: selected,
macroSelectedPath: path,
macroSelectedOffset: offset,
macroHasTrailingSpace: hasTrailingSpace
};
}
}
});
if (matchInfo) {
return matchInfo;
}
}
}
function getContentEditableSelectedPath(ctx) {
var sel = getWindowSelection(ctx);
var selected = sel.anchorNode;
var path = [];
var offset;
if (selected != null) {
var i;
var ce = selected.contentEditable;
while (selected !== null && ce !== 'true') {
i = getNodePositionInParent(ctx, selected);
path.push(i);
selected = selected.parentNode;
if (selected !== null) {
ce = selected.contentEditable;
}
}
path.reverse();
offset = sel.getRangeAt(0).startOffset;
return {
selected: selected,
path: path,
offset: offset
};
}
}
function getTriggerInfo (ctx, triggerCharSet, requireLeadingSpace, menuAlreadyActive, hasTrailingSpace) {
var selected, path, offset;
if (selectedElementIsTextAreaOrInput(ctx)) {
selected = getDocument(ctx).activeElement;
} else {
var selectionInfo = getContentEditableSelectedPath(ctx);
if (selectionInfo) {
selected = selectionInfo.selected;
path = selectionInfo.path;
offset = selectionInfo.offset;
}
}
var effectiveRange = getTextPrecedingCurrentSelection(ctx);
if (effectiveRange !== undefined && effectiveRange !== null) {
var mostRecentTriggerCharPos = -1;
var triggerChar;
triggerCharSet.forEach(function(c) {
var idx = effectiveRange.lastIndexOf(c);
if (idx > mostRecentTriggerCharPos) {
mostRecentTriggerCharPos = idx;
triggerChar = c;
}
});
if (mostRecentTriggerCharPos >= 0 &&
(
mostRecentTriggerCharPos === 0 ||
!requireLeadingSpace ||
/[\xA0\s]/g.test
(
effectiveRange.substring(
mostRecentTriggerCharPos - 1,
mostRecentTriggerCharPos)
)
)
)
{
var currentTriggerSnippet = effectiveRange.substring(mostRecentTriggerCharPos + 1,
effectiveRange.length);
triggerChar = effectiveRange.substring(mostRecentTriggerCharPos, mostRecentTriggerCharPos+1);
var firstSnippetChar = currentTriggerSnippet.substring(0,1);
var leadingSpace = currentTriggerSnippet.length > 0 &&
(
firstSnippetChar === ' ' ||
firstSnippetChar === '\xA0'
);
if (hasTrailingSpace) {
currentTriggerSnippet = currentTriggerSnippet.trim();
}
if (!leadingSpace && (menuAlreadyActive || !(/[\xA0\s]/g.test(currentTriggerSnippet)))) {
return {
mentionPosition: mostRecentTriggerCharPos,
mentionText: currentTriggerSnippet,
mentionSelectedElement: selected,
mentionSelectedPath: path,
mentionSelectedOffset: offset,
mentionTriggerChar: triggerChar
};
}
}
}
}
function getWindowSelection(ctx) {
if (!ctx) {
return window.getSelection();
} else {
return ctx.iframe.contentWindow.getSelection();
}
}
function getDocument(ctx) {
if (!ctx) {
return document;
} else {
return ctx.iframe.contentWindow.document;
}
}
function getTextPrecedingCurrentSelection (ctx) {
var text;
if (selectedElementIsTextAreaOrInput(ctx)) {
var textComponent = getDocument(ctx).activeElement;
var startPos = textComponent.selectionStart;
text = textComponent.value.substring(0, startPos);
} else {
var selectedElem = getWindowSelection(ctx).anchorNode;
if (selectedElem != null) {
var workingNodeContent = selectedElem.textContent;
var selectStartOffset = getWindowSelection(ctx).getRangeAt(0).startOffset;
if (selectStartOffset >= 0) {
text = workingNodeContent.substring(0, selectStartOffset);
}
}
}
return text;
}
function getContentEditableCaretPosition (ctx, selectedNodePosition) {
var markerTextChar = '\ufeff';
var markerEl, markerId = 'sel_' + new Date().getTime() + '_' + Math.random().toString().substr(2);
var range;
var sel = getWindowSelection(ctx);
var prevRange = sel.getRangeAt(0);
range = getDocument(ctx).createRange();
range.setStart(sel.anchorNode, selectedNodePosition);
range.setEnd(sel.anchorNode, selectedNodePosition);
range.collapse(false);
markerEl = getDocument(ctx).createElement('span');
markerEl.id = markerId;
markerEl.appendChild(getDocument(ctx).createTextNode(markerTextChar));
range.insertNode(markerEl);
sel.removeAllRanges();
sel.addRange(prevRange);
var coordinates = {
left: 0,
top: markerEl.offsetHeight
};
localToGlobalCoordinates(ctx, markerEl, coordinates);
markerEl.parentNode.removeChild(markerEl);
return coordinates;
}
function localToGlobalCoordinates(ctx, element, coordinates) {
var obj = element;
var iframe = ctx ? ctx.iframe : null;
while(obj) {
coordinates.left += obj.offsetLeft;
coordinates.top += obj.offsetTop;
if (obj !== getDocument().body) {
coordinates.top -= obj.scrollTop;
coordinates.left -= obj.scrollLeft;
}
obj = obj.offsetParent;
if (!obj && iframe) {
obj = iframe;
iframe = null;
}
}
}
function getTextAreaOrInputUnderlinePosition (ctx, element, position) {
var properties = [
'direction',
'boxSizing',
'width',
'height',
'overflowX',
'overflowY',
'borderTopWidth',
'borderRightWidth',
'borderBottomWidth',
'borderLeftWidth',
'paddingTop',
'paddingRight',
'paddingBottom',
'paddingLeft',
'fontStyle',
'fontVariant',
'fontWeight',
'fontStretch',
'fontSize',
'fontSizeAdjust',
'lineHeight',
'fontFamily',
'textAlign',
'textTransform',
'textIndent',
'textDecoration',
'letterSpacing',
'wordSpacing'
];
var isFirefox = (window.mozInnerScreenX !== null);
var div = getDocument(ctx).createElement('div');
div.id = 'input-textarea-caret-position-mirror-div';
getDocument(ctx).body.appendChild(div);
var style = div.style;
var computed = window.getComputedStyle ? getComputedStyle(element) : element.currentStyle;
style.whiteSpace = 'pre-wrap';
if (element.nodeName !== 'INPUT') {
style.wordWrap = 'break-word';
}
style.position = 'absolute';
style.visibility = 'hidden';
properties.forEach(function (prop) {
style[prop] = computed[prop];
});
if (isFirefox) {
style.width = (parseInt(computed.width) - 2) + 'px';
if (element.scrollHeight > parseInt(computed.height))
style.overflowY = 'scroll';
} else {
style.overflow = 'hidden';
}
div.textContent = element.value.substring(0, position);
if (element.nodeName === 'INPUT') {
div.textContent = div.textContent.replace(/\s/g, '\u00a0');
}
var span = getDocument(ctx).createElement('span');
span.textContent = element.value.substring(position) || '.';
div.appendChild(span);
var coordinates = {
top: span.offsetTop + parseInt(computed.borderTopWidth) + parseInt(computed.fontSize),
left: span.offsetLeft + parseInt(computed.borderLeftWidth)
};
localToGlobalCoordinates(ctx, element, coordinates);
getDocument(ctx).body.removeChild(div);
return coordinates;
}
return {
popUnderMention: popUnderMention,
replaceMacroText: replaceMacroText,
replaceTriggerText: replaceTriggerText,
getMacroMatch: getMacroMatch,
getTriggerInfo: getTriggerInfo,
selectElement: selectElement,
getTextAreaOrInputUnderlinePosition: getTextAreaOrInputUnderlinePosition,
getTextPrecedingCurrentSelection: getTextPrecedingCurrentSelection,
getContentEditableSelectedPath: getContentEditableSelectedPath,
getNodePositionInParent: getNodePositionInParent,
getContentEditableCaretPosition: getContentEditableCaretPosition,
pasteHtml: pasteHtml,
resetSelection: resetSelection,
scrollIntoView: scrollIntoView
};
}]);
angular.module("mentio").run(["$templateCache", function($templateCache) {$templateCache.put("mentio-menu.tpl.html","<style>\n.scrollable-menu {\n    height: auto;\n    max-height: 300px;\n    overflow: auto;\n}\n\n.menu-highlighted {\n    font-weight: bold;\n}\n</style>\n<ul class=\"dropdown-menu scrollable-menu\" style=\"display:block\">\n    <li mentio-menu-item=\"item\" ng-repeat=\"item in items track by $index\">\n        <a class=\"text-primary\" ng-bind-html=\"item.label | mentioHighlight:typedTerm:\'menu-highlighted\' | unsafe\"></a>\n    </li>\n</ul>");}]);
})();
;
/*! RESOURCE: /scripts/sn/common/stream/_module.js */
(function() {
var moduleDeps = [ 'sn.base', 'ng.amb', 'sn.messaging', 'sn.common.glide', 'ngSanitize',
'sn.common.avatar', 'sn.common.ui.popover', 'mentio', 'sn.common.controls', 'sn.common.user_profile',
'sn.common.datetime', 'sn.common.mention', 'sn.common.ui'];
if (angular.version.major == 1 && angular.version.minor >= 3)
moduleDeps.push('ngAria');
angular.module("sn.common.stream", moduleDeps);
angular.module("sn.stream.direct", [ 'sn.common.stream']);
})();
;
/*! RESOURCE: /scripts/sn/common/stream/controller.Stream.js */
angular.module("sn.common.stream").controller("Stream", function($rootScope, $scope, snRecordWatcher, $timeout) {
var isForm = NOW.sysId.length > 0;
$scope.showCommentsAndWorkNotes = isForm;
$scope.sessions = {};
$scope.recordStreamOpen = false;
$scope.streamHidden = true;
$scope.recordSysId = '';
$scope.recordDisplayValue = '';
$scope.$on('record.updated', onRecordUpdated);
$rootScope.$on('sn.sessions', onSessions);
$timeout(function() {
if (isForm)
snRecordWatcher.initRecord(NOW.targetTable, NOW.sysId);
else
snRecordWatcher.initList(NOW.targetTable, NOW.tableQuery);
}, 100);
$scope.controls = {
showRecord : function($event, entry, sysId) {
if (sysId !== '')
return;
if ($event.currentTarget != $event.target && $event.target.tagName == 'A')
return;
$scope.recordSysId = entry.document_id;
$scope.recordDisplayValue = entry.display_value;
$scope.recordStreamOpen = true;
$scope.streamHidden = true;
},
openRecord : function() {
var targetFrame = window.self;
var url = NOW.targetTable + ".do?sys_id=" + $scope.recordSysId;
if (NOW.linkTarget == 'form_pane') {
url += "&sysparm_clear_stack=true";
window.parent.CustomEvent.fireTop(
"glide:nav_open_url", {
url : url,
openInForm : true
});
return;
}
if (NOW.streamLinkTarget == 'parent' || NOW.concourse == 'true')
targetFrame = window.parent;
targetFrame.location = url;
},
openAttachment : function(event, sysId) {
event.stopPropagation();
var url = "/sys_attachment.do?view=true&sys_id=" + sysId;
var newTab = window.open(url, '_blank');
newTab.focus();
}
};
$scope.sessionCount = function() {
$scope.sessions.length = Object.keys($scope.sessions.data).length;
return $scope.sessions.length;
};
function onSessions(name, sessions) {
$scope.sessions.data = sessions;
$scope.sessionCount();
}
function onRecordUpdated(name, data) {
}
$scope.showListStream = function () {
$scope.recordStreamOpen = false;
$scope.recordHidden = false;
$scope.streamHidden = false;
angular.element('div.list-stream-record').velocity('snTransition.streamSlideRight', {
duration: 400
});
angular.element('[streamType="list"]').velocity('snTransition.slideIn', {
duration: 400,
complete: function (element) {
angular.element(element).css({display: 'block'});
}
});
};
$scope.$watch(function () {
return angular.element('div.list-stream-record').length
}, function (newValue, oldValue) {
if (newValue == 1) {
angular.element('div.list-stream-record').delay(100).velocity('snTransition.streamSlideLeft', {
begin: function (element) {
angular.element(element).css({visibility: 'visible'});
angular.element('.list-stream-record-header').css({visibility: 'visible'});
},
duration: 400,
complete: function (element) {
angular.element(element).css({transform: "translateX(0)"});
angular.element(element).scrollTop(0);
angular.element(element).css({transform: "initial"});
angular.element('.return-to-stream').focus();
}
});
}
});
});
;
/*! RESOURCE: /scripts/sn/common/stream/controller.snStream.js */
angular.module("sn.common.stream").controller("snStream", function($rootScope, $scope, $attrs, $http, nowStream, snRecordPresence, snCustomEvent, userPreferences, $window, $q, $timeout, $sanitize, $sce, snMention, i18n, getTemplateUrl) {
"use strict";
if (angular.isDefined($attrs.isInline)) {
bindInlineStreamAttributes();
}
function bindInlineStreamAttributes() {
var streamAttributes = {};
if ($attrs.table) {
streamAttributes.table = $attrs.table;
}
if ($attrs.query) {
streamAttributes.query = $attrs.query;
}
if ($attrs.sysId) {
streamAttributes.sysId = $attrs.sysId;
}
if ($attrs.active) {
streamAttributes.active = ($attrs.active == "true");
}
if ($attrs.template) {
streamAttributes.template = $attrs.template;
}
if ($attrs.preferredInput) {
streamAttributes.preferredInput = $attrs.preferredInput;
}
if ($attrs.useMultipleInputs) {
streamAttributes.useMultipleInputs = ($attrs.useMultipleInputs == "true");
}
if ($attrs.expandEntries) {
streamAttributes.expandEntries = ($attrs.expandEntries == "true");
}
if ($attrs.pageSize) {
streamAttributes.pageSize = parseInt($attrs.pageSize, 10);
}
if ($attrs.truncate) {
streamAttributes.truncate = ($attrs.truncate == "true");
}
if ($attrs.attachments) {
streamAttributes.attachments = ($attrs.attachments == "true");
}
if ($attrs.showCommentsAndWorkNotes) {
streamAttributes.attachments = ($attrs.showCommentsAndWorkNotes == "true");
}
angular.extend($scope, streamAttributes)
}
var stream;
var processor = $attrs.processor || "list_history";
var interval;
var FROM_LIST = 'from_list';
var FROM_FORM = 'from_form';
var source = $scope.sysId ? FROM_FORM : FROM_LIST;
var _firstPoll = true;
var _firstPollTimeout;
var fieldsInitialized = false;
var primaryJournalFieldOrder = ["comments", "work_notes"];
var primaryJournalField = null;
$scope.defaultShowCommentsAndWorkNotes = ($scope.sysId != null && !angular.isUndefined($scope.sysId) && $scope.sysId.length > 0);
$scope.canWriteWorkNotes = false;
$scope.inputTypeValue = "";
$scope.entryTemplate = getTemplateUrl($attrs.template || "list_stream_entry");
$scope.isFormStream = $attrs.template === "record_stream_entry.xml";
$scope.allFields = null;
$scope.fields = {};
$scope.fieldColor = "transparent";
$scope.multipleInputs = $scope.useMultipleInputs;
$scope.checkbox = {};
var typing = '{0} is typing', viewing = '{0} is viewing', entered = '{0} has entered';
var probablyLeft = '{0} has probably left', exited = '{0} has exited', offline = '{0} is offline';
i18n.getMessages(
[
typing,
viewing,
entered,
probablyLeft,
exited,
offline
],
function (results) {
typing = results[typing];
viewing = results[viewing];
entered = results[entered];
probablyLeft = results[probablyLeft];
exited = results[exited];
offline = results[offline];
}
);
$scope.parsePresence = function (sessionData) {
var status = sessionData.status;
var name = sessionData.user_display_name;
switch (status) {
case 'typing':
return i18n.format(typing, name);
case 'viewing':
return i18n.format(viewing, name);
case 'entered':
return i18n.format(entered, name);
case 'probably left':
return i18n.format(probablyLeft, name);
case 'exited':
return i18n.format(exited, name);
case 'offline':
return i18n.format(offline, name);
default:
return '';
}
};
$scope.members = [];
$scope.members.loading = true;
var mentionMap = {};
$scope.selectAtMention = function(item) {
if(item.termLengthIsZero)
return (item.name || "") + "\n";
mentionMap[item.name] = item.sys_id;
return "@[" + item.name + "]";
};
var typingTimer;
$scope.searchMembersAsync = function(term) {
$scope.members = [];
$scope.members.loading = true;
$timeout.cancel(typingTimer);
if (term.length === 0) {
$scope.members = [{
termLengthIsZero: true
}];
$scope.members.loading = false;
} else {
typingTimer = $timeout(function() {
snMention.retrieveMembers($scope.table, $scope.sysId, term).then(function(members) {
$scope.members = members;
$scope.members.loading = false;
}, function () {
$scope.members = [{
termLengthIsZero: true
}];
$scope.members.loading = false;
});
}, 500);
}
};
$scope.expandMentions = function(text) {
return stream.expandMentions(text, mentionMap)
};
$scope.reduceMentions = function(text) {
if(!text)
return text;
var regexMentionParts = /[\w\d\s/\']+/gi;
text = text.replace(/@\[[\w\d\s]+:[\w\d\s/\']+\]/gi, function (mention) {
var mentionParts = mention.match(regexMentionParts);
if (mentionParts.length === 2) {
var name = mentionParts[1];
mentionMap[name] = mentionParts[0];
return "@[" + name + "]";
}
return mentionParts;
});
return text;
};
$scope.parseMentions = function(entry) {
var regexMentionParts = /[\w\d\s/\']+/gi;
entry = entry.replace(/@\[[\w\d\s]+:[\w\d\s/\']+\]/gi, function (mention) {
var mentionParts = mention.match(regexMentionParts);
if (mentionParts.length === 2) {
return '<a class="at-mention at-mention-user-' + mentionParts[0] + '">@' + mentionParts[1] + '</a>';
}
return mentionParts;
});
return entry;
};
$scope.parseLinks = function(text) {
var regexLinks = /@L\[([^|]+?)\|([^\]]*)]/gi;
return text.replace(regexLinks, "<a href='$1' target='_blank'>$2</a>");
};
$scope.parseSpecial = function(text) {
var parsedText = $scope.parseLinks($sanitize(text));
parsedText = $scope.parseMentions(parsedText);
return $sce.trustAsHtml(parsedText);
};
$scope.getFullEntryValue = function(entry, event) {
event.stopPropagation();
var index = getEntryIndex(entry);
var journal = $scope.entries[index].entries.journal[0];
journal.loading = true;
$http.get('/api/now/ui/stream_entry/full_entry', {
params: {
sysparm_sys_id: journal.sys_id
}
}).then(function (response) {
journal.new_value = response.data.result.replace(/\n/g, '<br/>');
journal.is_truncated = false;
journal.loading = false;
journal.showMore = true;
});
};
function getEntryIndex(entry) {
for (var i = 0, l = $scope.entries.length; i < l; i++) {
if (entry === $scope.entries[i]) {
return i;
}
}
}
$scope.$watch('active', function(n, o) {
if (n === o)
return;
if ($scope.active)
startPolling();
else
cancelStream();
});
$scope.defaultControls = {
getTitle: function(entry) {
if(entry && entry.short_description) {
return entry.short_description;
} else if(entry && entry.shortDescription) {
return entry.shortDescription;
}
},
showCreatedBy: function() {
return true;
},
hideCommentLabel: function() {
return false;
},
showRecord: function($event, entry) {
},
showRecordLink: function() {
return true;
}
};
if ($scope.controls) {
for (var attr in $scope.controls)
$scope.defaultControls[attr] = $scope.controls[attr];
}
$scope.controls = $scope.defaultControls;
if ($scope.showCommentsAndWorkNotes === undefined) {
$scope.showCommentsAndWorkNotes = $scope.defaultShowCommentsAndWorkNotes;
}
snCustomEvent.observe('sn.stream.change_input_display', function(table, display) {
if (table != $scope.table)
return;
$scope.showCommentsAndWorkNotes = display;
$scope.$apply();
});
$scope.$on("$destroy", function() {
cancelStream();
});
$scope.$on('sn.stream.interval', function($event, time) {
interval = time;
reschedulePoll();
});
$scope.$on("sn.stream.tap", function() {
if (stream)
stream.tap();
else
startPolling();
});
$scope.$on('window_visibility_change', function($event, hidden) {
interval = (hidden) ? 120000 : undefined;
reschedulePoll();
});
$scope.$on("sn.stream.refresh", function(event, data) {
stream._successCallback(data.response);
});
$scope.$on("sn.stream.reload", function() {
startPolling();
});
$scope.$on('sn.stream.input_value', function(otherScope, type, value) {
if(!$scope.multipleInputs) {
$scope.inputType = type;
$scope.inputTypeValue = value;
}
});
$scope.$watchCollection('[table, query, sysId]', startPolling);
$scope.changeInputType = function(field) {
if (!primaryJournalField){
angular.forEach($scope.fields, function(item) {
if (item.isPrimary)
primaryJournalField = item.name;
});
}
$scope.inputType = field.checked ? field.name : primaryJournalField;
userPreferences.setPreference('glide.ui.' + $scope.table + '.stream_input', $scope.inputType);
};
$scope.selectedInputType = function(value) {
if (angular.isDefined(value)) {
$scope.inputType = value;
userPreferences.setPreference('glide.ui.' + $scope.table + '.stream_input', $scope.inputType);
}
return $scope.inputType;
};
$scope.$watch('inputType', function() {
if (!$scope.inputType || !$scope.preferredInput)
return;
$scope.preferredInput = $scope.inputType;
});
$scope.submitCheck = function(event){
var key = event.keyCode || event.which;
if (key === 13) {
$scope.postJournalEntryForCurrent(event);
}
};
$scope.postJournalEntry = function(type, entry, event) {
type = type || primaryJournalFieldOrder[0];
event.stopPropagation();
var requestTable = $scope.table || "board:" + $scope.board.sys_id;
stream.insertForEntry(type, entry.journalText, requestTable, entry.document_id);
entry.journalText = "";
entry.commentBoxVisible = false;
snRecordPresence.termPresence();
};
$scope.postJournalEntryForCurrent = function(event) {
event.stopPropagation();
var entries = [];
if ($scope.multipleInputs) {
angular.forEach($scope.fields, function(item) {
if (!item.isActive || !item.value)
return;
entries.push({
field: item.name,
text: item.value
});
})
} else {
entries.push({
field: $scope.inputType,
text: $scope.inputTypeValue
})
}
var request = stream.insertEntries(entries, $scope.table, $scope.sysId, mentionMap);
if (request) {
request.then(function () {
for (var i = 0; i < entries.length; i++) {
fireInsertEvent(entries[i].field, entries[i].text);
}
});
}
clearInputs();
return false;
};
function fireInsertEvent(name, value) {
snCustomEvent.fire('sn.stream.insert', name, value);
}
function clearInputs() {
$scope.inputTypeValue = "";
angular.forEach($scope.fields, function(item) {
if (!item.isActive)
return;
if (item.value)
item.filled = true;
item.value = "";
});
}
$scope.showCommentBox = function(entry, event) {
event.stopPropagation();
if (entry !== $scope.selectedEntry)
$scope.closeEntry();
$scope.selectedEntry = entry;
entry.commentBoxVisible = !entry.commentBoxVisible;
if (entry.commentBoxVisible) {
snRecordPresence.initPresence($scope.table, entry.document_id);
}
};
$scope.showMore = function(journal, event) {
event.stopPropagation();
journal.showMore = true;
};
$scope.showLess = function(journal, event) {
event.stopPropagation();
journal.showMore = false;
};
$scope.closeEntry = function() {
if ($scope.selectedEntry)
$scope.selectedEntry.commentBoxVisible = false;
};
$scope.previewAttachment = function(evt, attachmentUrl) {
snCustomEvent.fire('sn.attachment.preview', evt, attachmentUrl);
};
$rootScope.$on('sn.sessions', function(someOtherScope, sessions) {
if ($scope.selectedEntry && $scope.selectedEntry.commentBoxVisible)
$scope.selectedEntry.sessions = sessions;
});
$scope.$watch("inputTypeValue", function(n, o) {
if (n !== o) {
emitTyping($scope.inputTypeValue);
}
});
$scope.$watch("selectedEntry.journalText", function(newValue) {
if ($scope.selectedEntry)
emitTyping(newValue || "");
});
$scope.$watch('useMultipleInputs', function() {
setMultipleInputs();
});
function emitTyping(inputValue) {
if (!angular.isDefined(inputValue)){
return;
}
var status = inputValue.length ? "typing" : "viewing";
$scope.$emit("record.typing", {status: status, value: inputValue, table: $scope.table, sys_id: $scope.sys_id});
}
function preloadedData() {
if (typeof window.NOW.snActivityStreamData === 'object'
&& window.NOW.snActivityStreamData[$scope.table + '_' + $scope.sysId]) {
_firstPoll = false;
var data = window.NOW.snActivityStreamData[$scope.table + '_' + $scope.sysId];
stream = nowStream.create($scope.table, $scope.query, $scope.sysId,
processor, interval, source, $scope.attachments);
stream.callback = onPoll;
stream.preRequestCallback = beforePoll;
stream.lastTimestamp = data.sys_timestamp;
if (data.entries && data.entries.length) {
stream.lastEntry = angular.copy(data.entries[0]);
}
_firstPollTimeout = setTimeout(function() {
stream.poll(onPoll, beforePoll);
_firstPollTimeout = false;
}, 20000);
beforePoll();
onPoll(data);
return true;
}
return false;
}
function scheduleNewPoll(lastTimestamp) {
cancelStream();
stream = nowStream.create($scope.table, $scope.query, $scope.sysId,
processor, interval, source, $scope.attachments);
stream.lastTimestamp = lastTimestamp;
stream.poll(onPoll, beforePoll);
}
function reschedulePoll() {
var lastTimestamp = stream ? stream.lastTimestamp : 0;
if (cancelStream()) {
scheduleNewPoll(lastTimestamp);
}
}
function reset() {
removeInlineStream();
$scope.loaded = false;
startPolling();
}
function emitFilterChange() {
$scope.$emit('sn.stream.is_filtered_change', $scope.isFiltered);
}
function startPolling() {
if ($scope.loading && !$scope.loaded)
return;
if (!$scope.active)
return;
$scope.entries = [];
$scope.allEntries = [];
$scope.showAllEntriesButton = false;
$scope.loaded = false;
$scope.loading = true;
if (_firstPoll && preloadedData()) {
return;
}
scheduleNewPoll();
$scope.$emit('sn.stream.entries_change', $scope.entries);
}
function onPoll(response) {
$scope.loading = false;
if (response.primary_fields)
primaryJournalFieldOrder = response.primary_fields;
if (!fieldsInitialized)
processFields(response.fields);
processEntries(response.entries);
if (response.inlineStreamLoaded) {
$scope.inlineStreamLoaded = true;
addInlineStreamEntryClass();
}
if (!$scope.loaded) {
$scope.loaded = true;
$scope.$emit("sn.stream.loaded", response);
}
}
function beforePoll() {
$scope.$emit("sn.stream.requested");
}
function processFields(fields) {
if(!fields || !fields.length)
return;
fieldsInitialized = true;
$scope.allFields = fields;
setShowAllFields();
$scope.fieldsVisible = 0;
var i = 0;
angular.forEach(fields, function(field) {
if (!field.isJournal)
return;
if (i==0)
$scope.firstJournal = field.name;
i++;
if ($scope.fields[field.name]) {
angular.extend($scope.fields[field.name], field);
} else {
$scope.fields[field.name] = field;
}
$scope.fields[field.name].visible = !$scope.formJournalFields;
if ($scope.fields[field.name].visible)
$scope.fieldsVisible++;
if ($scope.fieldsVisible > 1 && !$scope.fields[field.name].canWrite)
$scope.fieldsVisible--;
var fieldColor = field.color;
if (fieldColor)
fieldColor = field.color.replace(/background-color: /, '');
if (!fieldColor || fieldColor == 'transparent')
fieldColor = null;
$scope.fields[field.name].color = fieldColor;
});
setFieldVisibility();
setPrimaryJournalField();
setMultipleInputs();
}
$scope.$watch('formJournalFields', function() {
setFieldVisibility();
setPrimaryJournalField();
setMultipleInputs();
}, true);
function setFieldVisibility() {
if (!$scope.formJournalFields || !$scope.fields || !$scope.showCommentsAndWorkNotes)
return;
$scope.fieldsVisible = 0;
angular.forEach($scope.formJournalFields, function(formField) {
if (!$scope.fields[formField.name])
return;
$scope.fields[formField.name].value = formField.value;
$scope.fields[formField.name].mandatory = formField.mandatory;
$scope.fields[formField.name].label = formField.label;
$scope.fields[formField.name].messages = formField.messages;
$scope.fields[formField.name].visible = formField.visible && !formField.readonly;
if ($scope.fields[formField.name].visible)
$scope.fieldsVisible++;
});
}
$scope.getStubbedFieldModel = function(fieldName) {
if ($scope.fields[fieldName])
return $scope.fields[fieldName];
$scope.fields[fieldName] = {
name: fieldName
};
return $scope.fields[fieldName];
};
function setPrimaryJournalField() {
if (!$scope.fields || !$scope.showCommentsAndWorkNotes)
return;
angular.forEach($scope.fields, function(item) {
item.isPrimary = false;
});
var visibleFields = Object.keys($scope.fields).filter(function(item) {
return $scope.fields[item].visible;
});
if (visibleFields.indexOf($scope.preferredInput) != -1) {
var field = $scope.fields[$scope.preferredInput];
field.checked = true;
field.isPrimary = true;
$scope.inputType = $scope.preferredInput;
primaryJournalField = $scope.preferredInput;
} else {
for (var i = 0; i < primaryJournalFieldOrder.length; i++) {
var fieldName = primaryJournalFieldOrder[i];
if (visibleFields.indexOf(fieldName) != -1) {
$scope.fields[fieldName].isPrimary = true;
primaryJournalField = fieldName;
$scope.inputType = fieldName;
break;
}
}
}
if(visibleFields.length === 0) {
primaryJournalField = '';
$scope.inputType = primaryJournalField;
} else if (!$scope.inputType && visibleFields.length > 0) {
primaryJournalField = visibleFields[0];
$scope.inputType = primaryJournalField;
$scope.fields[primaryJournalField].isPrimary = true;
}
if ($scope.fields && visibleFields.indexOf(primaryJournalField) == -1) {
var keys = Object.keys($scope.fields);
if (keys.length)
$scope.fields[keys[0]].isPrimary = true;
}
}
function setShowAllFields() {
$scope.checkbox.showAllFields = $scope.showAllFields = $scope.allFields && !$scope.allFields.some(function(item) {
return !item.isActive;
});
$scope.hideAllFields = !$scope.allFields || !$scope.allFields.some(function(item) {
return item.isActive;
});
$scope.isFiltered = !$scope.showAllFields || $scope.allFields.some(function(item) {
return !item.isActive;
});
}
$scope.setPrimary = function(entry) {
angular.forEach($scope.fields, function(item) {
item.checked = false;
});
for (var i = 0; i < primaryJournalFieldOrder.length; i++) {
var fieldName = primaryJournalFieldOrder[i];
if (entry.writable_journal_fields.indexOf(fieldName) != -1) {
entry.primaryJournalField = fieldName;
entry.inputType = fieldName;
return;
}
}
if (!entry.inputType) {
var primaryField = entry.writable_journal_fields[0];
entry.primaryJournalField = primaryField;
entry.inputType = primaryField;
}
};
$scope.updateFieldVisibilityAll = function() {
$scope.showAllFields = !$scope.showAllFields;
angular.forEach($scope.allFields, function(item) {
item.isActive = $scope.showAllFields;
});
$scope.updateFieldVisibility();
};
$scope.updateFieldVisibility = function() {
var activeFields = $scope.allFields.map(function(item) {
return item.name + ',' + item.isActive;
});
setShowAllFields();
emitFilterChange();
userPreferences
.setPreference($scope.table + '.activity.filter', activeFields.join(';'))
.then(function() {
reset();
});
};
$scope.configureAvailableFields = function() {
$window.personalizer($scope.table, 'activity', $scope.sysId);
};
$scope.toggleMultipleInputs = function(val) {
userPreferences.setPreference('glide.ui.activity_stream.multiple_inputs', val ? 'true' : 'false')
.then(function() {
$scope.useMultipleInputs = val;
setMultipleInputs();
});
};
$scope.changeEntryInputType = function(fieldName, entry) {
var checked = $scope.fields[fieldName].checked;
entry.inputType = checked ? fieldName : entry.primaryJournalField;
};
function processEntries(entries) {
if (!entries || !entries.length)
return;
entries = entries.reverse();
var newEntries = [];
angular.forEach(entries, function (entry) {
var entriesToAdd = [entry];
if (entry.attachment) {
entry.type = getAttachmentType(entry.attachment);
entry.attachment.extension = getAttachmentExt(entry.attachment);
} else if (entry.is_email === true){
entry.email = {};
var allFields = entry.entries.custom;
for(var i = 0; i < allFields.length; i++){
entry.email[allFields[i].field_name] = {
label: allFields[i]['field_label'],
displayValue: allFields[i]['new_value']
};
}
entry['entries'].custom = [];
} else if ($scope.sysId) {
entriesToAdd = extractJournalEntries(entry);
} else {
entriesToAdd = handleJournalEntriesWithoutExtraction(entry);
}
if (entriesToAdd instanceof Array) {
entriesToAdd.forEach(function (e) {
$scope.entries.unshift(e);
newEntries.unshift(e);
});
}
else {
$scope.entries.unshift(entriesToAdd);
newEntries.unshift(entriesToAdd)
}
if (source != FROM_FORM)
$scope.entries = $scope.entries.slice(0, 49);
if ($scope.maxEntries != undefined) {
var maxNumEntries = parseInt($scope.maxEntries, 10);
$scope.entries = $scope.entries.slice(0, maxNumEntries);
}
});
if ($scope.inlineStreamLoaded) {
if ($scope.entries.length > 0) {
removeInlineStreamEntryClass();
}
}
if ($scope.loaded) {
$scope.$emit("sn.stream.new_entries", newEntries);
triggerResize();
}
else if ($scope.pageSize && $scope.entries.length > $scope.pageSize) {
setUpPaging();
}
$timeout(function() {
$scope.$emit('sn.stream.entries_change', $scope.entries);
});
}
function removeInlineStream() {
angular.element(document).find('#sn_form_inline_stream_container').hide().remove();
}
function removeInlineStreamEntryClass() {
angular.element(document).find('#sn_form_inline_stream_entries').removeClass('sn-form-inline-stream-entries-only');
}
function addInlineStreamEntryClass() {
angular.element(document).find('#sn_form_inline_stream_entries').addClass('sn-form-inline-stream-entries-only');
}
function setUpPaging() {
$scope.showAllEntriesButton = true;
$scope.allEntries = $scope.entries;
$scope.entries = [];
loadEntries(0, $scope.pageSize);
}
$scope.loadMore = function() {
if ($scope.entries.length + $scope.pageSize > $scope.allEntries.length) {
$scope.loadAll();
return;
}
loadEntries($scope.loadedEntries, $scope.loadedEntries + $scope.pageSize);
};
$scope.loadAll = function() {
$scope.showAllEntriesButton = false;
loadEntries($scope.loadedEntries, $scope.allEntries.length);
};
function loadEntries(start, end) {
$scope.entries = $scope.entries.concat($scope.allEntries.slice(start, end));
$scope.loadedEntries = $scope.entries.length;
$scope.$emit('sn.stream.entries_change', $scope.entries);
}
function getAttachmentType(attachment) {
if (attachment.content_type.startsWith('image/') && attachment.size_bytes < 5 * 1024 * 1024 && attachment.path.indexOf(attachment.sys_id) == 0)
return 'attachment-image';
return 'attachment';
}
function getAttachmentExt(attachment) {
var filename = attachment.file_name;
return filename.substring(filename.lastIndexOf('.') + 1);
}
function handleJournalEntriesWithoutExtraction(oneLargeEntry) {
if (oneLargeEntry.entries.journal.length === 0)
return oneLargeEntry;
for (var i = 0; i < oneLargeEntry.entries.journal.length; i++) {
newLinesToBR(oneLargeEntry.entries.journal);
}
return oneLargeEntry;
}
function extractJournalEntries(oneLargeEntry) {
var smallerEntries = [];
if (oneLargeEntry.entries.journal.length === 0)
return oneLargeEntry;
for (var i = 0; i < oneLargeEntry.entries.journal.length; i++) {
var journalEntry = angular.copy(oneLargeEntry);
journalEntry.entries.journal = journalEntry.entries.journal.slice(i, i + 1);
newLinesToBR(journalEntry.entries.journal);
journalEntry.entries.changes = [];
journalEntry.type = 'journal';
smallerEntries.unshift(journalEntry);
}
oneLargeEntry.entries.journal = [];
oneLargeEntry.type = 'changes';
if (oneLargeEntry.entries.changes.length > 0)
smallerEntries.unshift(oneLargeEntry);
return smallerEntries;
}
function newLinesToBR(entries) {
angular.forEach(entries, function(item) {
if (!item.new_value)
return;
item.new_value = item.new_value.replace(/\n/g, '<br/>');
});
}
function cancelStream() {
if (_firstPollTimeout) {
clearTimeout(_firstPollTimeout);
_firstPollTimeout = false;
}
if (!stream)
return false;
stream.cancel();
stream = null;
return true; 
}
function setMultipleInputs() {
$scope.multipleInputs = $scope.useMultipleInputs;
if ($scope.useMultipleInputs === true || !$scope.formJournalFields) {
return;
}
var numAffectedFields = 0;
angular.forEach($scope.formJournalFields, function(item) {
if (item.mandatory || item.value)
numAffectedFields++;
});
if (numAffectedFields > 0)
$scope.multipleInputs = true;
}
function triggerResize() {
if (window._frameChanged)
setTimeout(_frameChanged, 0);
}
});
;
/*! RESOURCE: /scripts/sn/common/stream/directive.snStream.js */
angular.module("sn.common.stream").directive("snStream", function(getTemplateUrl, $http, $sce, $sanitize) {
"use strict";
return {
restrict: "E",
replace: true,
scope: {
table: "=",
query: "=?",
sysId: "=?",
active: "=",
controls: "=?",
showCommentsAndWorkNotes: "=?",
previousActivity: "=?",
sessions: "=",
attachments: "=",
board: "=",
formJournalFields: "=",
useMultipleInputs: "=?",
preferredInput: "=",
labels: "=",
subStream: "=",
expandEntries: "=",
scaleAnimatedGifs: "=",
scaleImages :"=",
pageSize: "=",
maxEntries: "@"
},
templateUrl: getTemplateUrl("ng_activity_stream.xml"),
controller: "snStream",
link: function (scope, element) {
element.on("click", ".at-mention", function(evt) {
var userID = angular.element(evt.target).attr('class').substring("at-mention at-mention-user-".length);
$http({
url: '/api/now/form/mention/user/' + userID,
method: "GET"
}).then(function(response) {
scope.showPopover = true;
scope.mentionPopoverProfile = response.data.result;
scope.clickEvent = evt;
}, function () {
$http({
url: '/api/now/live/profiles/' + userID,
method: "GET"
}).then(function(response) {
scope.showPopover = true;
var tempProfile = response.data.result;
tempProfile.userID = tempProfile.sys_id = response.data.result.document;
scope.mentionPopoverProfile = tempProfile;
scope.mentionPopoverProfile.sysID = response.data.result["userID"];
scope.clickEvent = evt;
})
});
});
scope.toggleEmailIframe = function(email, event){
email.expanded = !email.expanded;
event.preventDefault();
};
}
};
});
;
/*! RESOURCE: /scripts/sn/common/stream/directive.formStreamEntry.js */
angular.module('sn.common.stream').directive('formStreamEntry', function(getTemplateUrl) {
return {
restrict: 'A',
templateUrl: getTemplateUrl('record_stream_entry.xml')
}
});
;
/*! RESOURCE: /scripts/sn/common/stream/directive.snExpandedEmail.js */
angular.module("sn.common.stream").directive("snExpandedEmail", function() {
"use strict";
return {
restrict: "E",
replace: true,
scope: {
email: "="
},
template: "<iframe style='width: 100%;' class='card' src='{{::emailBodySrc}}'></iframe>",
controller: function($scope){
$scope.emailBodySrc = "email_display.do?email_id=" + $scope.email.sys_id.displayValue;
},
link: function(scope, element) {
element.load(function(){
var bodyHeight = $j(this).get(0).contentWindow.document.body.scrollHeight + "px";
$j(this).height(bodyHeight);
});
}
};
});
;
/*! RESOURCE: /scripts/app.form_presence/controller.formStream.js */
(function() {
var journalModel = {};
window.journalModel = journalModel;
CustomEvent.observe('sn.form.journal_field.add', function(name, mandatory, readonly, visible, value, label) {
journalModel[name] = {
name: name,
mandatory: mandatory,
readonly: readonly,
visible: visible,
value: value,
label: label,
messages: []
};
});
CustomEvent.observe('sn.form.journal_field.readonly', function(name, readonly) {
modifyJournalAttribute(name, "readonly", readonly);
});
CustomEvent.observe('sn.form.journal_field.value', function(name, value) {
modifyJournalAttribute(name, "value", value);
});
CustomEvent.observe('sn.form.journal_field.mandatory', function(name, mandatory) {
modifyJournalAttribute(name, "mandatory", mandatory);
});
CustomEvent.observe('sn.form.journal_field.visible', function(name, visible) {
modifyJournalAttribute(name, "visible", visible);
});
CustomEvent.observe('sn.form.journal_field.label', function(name, visible) {
modifyJournalAttribute(name, "label", visible);
});
CustomEvent.observe('sn.form.journal_field.show_msg', function(input, message, type) {
var messages = journalModel[input]['messages'].concat([{
type: type,
message: message
}]);
modifyJournalAttribute(input, 'messages', messages);
});
CustomEvent.observe('sn.form.journal_field.hide_msg', function(input, clearAll) {
if (journalModel[input]['messages'].length == 0)
return;
var desiredValue = [];
if (!clearAll)
desiredValue = journalModel[input]['messages'].slice(1);
modifyJournalAttribute(input, 'messages', desiredValue);
});
CustomEvent.observe('sn.form.hide_all_field_msg', function(type) {
var fields = Object.keys(journalModel);
for (var i = 0; i < fields.length; i++) {
var f = fields[i];
if (journalModel[f].messages.length == 0)
continue;
var messages = [];
if (type) {
var oldMessages = angular.copy(journalModel[f].messages);
for (var j = 0; j < oldMessages.length; j++) {
if (oldMessages[j].type != type)
messages.push(oldMessages[j]);
}
}
modifyJournalAttribute(f, 'messages', messages);
}
});
CustomEvent.observe('sn.stream.insert', function(field, text) {
if (typeof window.g_form !== "undefined")
g_form.getControl(field).value = NOW.STREAM_VALUE_KEY + text;
});
function modifyJournalAttribute(field, prop, value) {
if (journalModel[field][prop] === value)
return;
journalModel[field][prop] = value;
CustomEvent.fire('sn.form.journal_field.changed');
}
angular.module('sn.common.stream').controller('formStream', function($scope, snCustomEvent, i18n) {
var isFiltered = !angular.element('.activity-stream-label-filtered').hasClass('hide');
var _inlineTemplateCache;
function renderLabel(count) {
var processedLabel = _getLabel(count);
angular.element('.activity-stream-label-counter').html(processedLabel);
angular.element('.activity-stream-label-filtered').toggleClass('hide', !isFiltered);
}
function _getLabel(count) {
var label = 'Activities: {0}';
return i18n.getMessage(label).withValues([count]);
}
function _getInlineEntries() {
if (_inlineTemplateCache === 0) {
return 0;
}
_inlineTemplateCache = document.querySelectorAll('#sn_form_inline_stream_container ul.activities-form li.h-card_comments').length;
return _inlineTemplateCache;
}
$scope.$on('sn.stream.entries_change', function(evt, entries) {
var inlineTemplateCount = _getInlineEntries();
var count = inlineTemplateCount + entries.length;
renderLabel(count);
});
$scope.$on('sn.stream.is_filtered_change', function(evt, filtered) {
isFiltered = filtered;
});
$scope.formJournalFields = journalModel;
$scope.formJournalFieldsVisible = false;
setUp();
snCustomEvent.observe('sn.form.journal_field.changed', function() {
setUp();
if (!$scope.$$phase)
$scope.$apply();
});
function setUp() {
setInputValue();
}
function setInputValue() {
angular.forEach($scope.formJournalFields, function(item) {
if (typeof window.g_form === "undefined")
return;
item.value = g_form.getValue(item.name);
if (!item.readonly && item.visible && (item.value !== undefined || item.value !== null) || item.value !== '') {
$scope.$broadcast('sn.stream.input_value', item.name, item.value);
}
});
}
})
})();
;
/*! RESOURCE: /scripts/app.form_presence/directive.scroll_form.js */
angular.module('sn.common.stream').directive('scrollFrom', function() {
"use strict";
var SCROLL_TOP_PAD = 10;
return {
restrict: 'A',
link: function($scope, $element, $attrs) {
var target = $attrs.scrollFrom;
$j(target).click(function(evt) {
if (window.g_form) {
var tab = g_form._getTabNameForElement($element);
if (tab)
g_form.activateTab(tab);
}
var $scrollRoot = $element.closest('.form-group');
if ($scrollRoot.length === 0)
$scrollRoot = $element;
var $scrollParent = $scrollRoot.scrollParent();
var offset = $element.offset().top - $scrollParent.offset().top - SCROLL_TOP_PAD + $scrollParent.scrollTop();
$scrollParent.animate({
scrollTop: offset
}, '500', 'swing');
evt.stopPropagation();
})
}
}
});
;
;
/*! RESOURCE: /scripts/heisenberg/angular/js_includes_angular.js */
/*! RESOURCE: /scripts/heisenberg/angular/_module.heisenberg.js */
(function() {
"use strict";
angular.module('heisenberg', []);
})();
;
/*! RESOURCE: /scripts/heisenberg/angular/directive.snPopoverBasic.js */
(function($) {
angular.module('heisenberg').directive('snPopoverBasic', function() {
"use strict";
return {
restrict: 'C',
link: function(scope, elem) {
elem.each(function () {
var $this = $(this);
if (!$this.data('bs.popover'))
$this.popover();
});
}
}
});
})(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/angular/directive.snTooltipBasic.js */
(function($) {
"use strict";
if ('ontouchstart' in document.documentElement)
return;
angular.module('heisenberg').directive('snTooltipBasic', function() {
return {
restrict: 'C',
link: function(scope, elem) {
if (isMobile())
return;
var $elem = $(elem);
if ($elem.data('bs.tooltip'))
return;
var bsTooltip = $.fn.tooltip.Constructor;
var delayShow = bsTooltip.DEFAULTS.delay.show || 500;
$elem.hideFix();
$elem.one('mouseenter', function() {
if ($elem.data('bs.tooltip'))
return;
$elem.tooltip({
container: $elem.attr('data-container') || 'body'
});
$elem.data('hover', setTimeout(function() {
$elem.tooltip('show');
}, delayShow));
});
$elem.one('mouseleave', function() {
var hover = $elem.data('hover');
if (hover) {
clearTimeout($elem.data('hover'));
$elem.removeData('hover')
}
});
$elem.click(function() {
hideToolTip();
});
scope.$on('$destroy', function() {
destroyToolTip();
});
function destroyToolTip() {
if ($elem.tooltip) {
$elem.tooltip('destroy');
}
}
function hideToolTip() {
if ($elem.tooltip) {
$elem.tooltip('hide');
}
}
function isMobile() {
if (navigator.userAgent.match(/Android/i)
|| navigator.userAgent.match(/webOS/i)
|| navigator.userAgent.match(/iPhone/i)
|| navigator.userAgent.match(/iPad/i)
|| navigator.userAgent.match(/iPod/i)
|| navigator.userAgent.match(/BlackBerry/i)
|| navigator.userAgent.match(/Windows Phone/i)) {
return true;
} else {
return false;
}
}
}
};
});
})(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/angular/directive.snTabsBasic.js */
(function ($) {
angular.module('heisenberg').directive('snTabsBasic', function() {
return {
restrict: 'C',
link : function link(scope, elem) {
elem.each(function () {
var $this = $(this);
if (!$this.data('sn.tabs'))
$this.tabs();
});
}
}
});
})(jQuery);
;
;
/*! RESOURCE: /scripts/classes/GlideNavigation.js */
;(function() {
var GlideNavigation = function() {};
var MAX_URL_LENGTH = 2000;
var _open = function(url, target) {
if (target) {
window.open(url, target);
return;
}
window.location.href = url;
};
GlideNavigation.prototype = {
open: function(url, target) {
if (url.length <= MAX_URL_LENGTH) {
_open(url, target);
return;
}
jQuery.ajax({
type: "POST",
url: '/api/now/tinyurl',
data: JSON.stringify({url : url}),
contentType: "application/json; charset=utf-8",
dataType: "json"
}).done(function(response) {
_open(response.result, target);
});
},
openList: function(table, query) {
var url = table + '_list.do';
if (query)
url += "?sysparm_query=" + encodeURIComponent(query);
this.open(url);
},
openRecord: function(table, sys_id) {
var url = table + '.do?sys_id=' + sys_id;
this.open(url);
},
reloadWindow: function() {
if (window.location.reload)
window.location.reload();
},
refreshNavigator: function() {
CustomEvent.fireTop('navigator.refresh');
},
getURL: function() {
return window.location.href;
},
openPopup: function(url, name, features, noStack){
if (noStack === true && url.indexOf("sysparm_nameofstack") == -1)
url += "&sysparm_stack=no";
var win = window.open(url, name, features, false);
return win;
},
setPermalink: function(title, relativePath){
CustomEvent.fireTop('magellanNavigator.permalink.set', { title : title, relativePath: relativePath } );
},
addUserHistoryEntry: function(title, relativePath, description, isTable){
if (typeof description == "undefined")
description = "";
if (typeof isTable == "undefined")
isTable = false;
CustomEvent.fireTop('magellanNavigator.sendHistoryEvent', {
title : title,
url : relativePath,
description : description,
isTable : isTable
});
}
};
window.g_navigation = new GlideNavigation();
})();
;
/*! RESOURCE: /scripts/classes/nowapi/nowapi.js */
"use strict";
window.nowapi = {
g_guid: {
generate: function(l) {
var l = l || 32, strResult = '';
while (strResult.length < l)
strResult += (((1 + Math.random() + new Date().getTime()) * 0x10000) | 0).toString(16).substring(1);
return strResult.substr(0, l);
}
},
g_document: {
getElement: function(selector, context) {
context = context || document;
return context.querySelector(selector);
},
getElements: function(selector, context) {
context = context || document;
return context.querySelectorAll(selector);
},
createElement: function(tagname) {
return document.createElement(tagname);
}
},
g_navigation: window.g_navigation,
g_api: 2
};
angular.injector(['ng']).invoke(function($log) {
window.nowapi.log = $log.log;
window.jslog = window.jslog || $log.log;
});
;
/*! RESOURCE: /scripts/classes/nowapi/ui/Notification.js */
(function(exports, angular) {
"use strict";
angular.injector(['ng', 'sn.common.notification']).invoke(function(snNotification) {
exports.g_notification = snNotification;
});
})(window.nowapi, angular);
;
/*! RESOURCE: /scripts/classes/nowapi/ui/GlidePopup.js */
(function(exports, $, CustomEvent) {
"use strict";
var _focusTraps;
var _popupCursors = (function() {
var cursor = "progress";
var oldCursor;
return {
startWaiting: function(target) {
if (target == null) return;
oldCursor = target.style.cursor;
target.style.cursor = cursor;
},
stopWaiting: function(target) {
if (!target) return;
target.style.cursor = oldCursor ? oldCursor : "";
}
};
})();
var _getPopupConfig = (function() {
var DEFAULT_POPOVER_TEMPLATE =
'<div class="popover glide-popup" role="tooltip" style="max-width:650px"><div class="arrow"></div><div class="popover-content" style="width:650px;"></div></div>';
var DEFAULT_CONFIG = {
trigger: "manual",
placement: "bottom",
html: true
};
function _wrapWithDefaultTemplate($markup) {
var $wrappedMarkup = $(DEFAULT_POPOVER_TEMPLATE);
$wrappedMarkup.children(".popover-content").append($markup);
return $wrappedMarkup;
}
function _processTemplate(contentResponse, options) {
var $markup = $(contentResponse);
if (!$markup.hasClass("glide-popup")) {
$markup = _wrapWithDefaultTemplate($markup);
}
if (options && options.width) {
$markup
.css({ maxWidth: options.width })
.find(".popover-content")
.css({ width: options.width });
}
return $markup;
}
function _getTemplateContentFromMarkup($markup) {
return $markup.find(".popover-content").html();
}
function _getPopoverTitle($markup) {
return $markup.find(".small_caption").detach().text();
}
function _getContainer($target) {
var formContainerExists =
$(".section_header_content_no_scroll").length > 0;
var container = formContainerExists
? ".section_header_content_no_scroll"
: "body";
var modalContainer = $target.closest(".modal");
if (modalContainer.length > 0) {
container = modalContainer;
}
return container;
}
return function getPopupConfig(url, $target, options) {
return $.post(url).then(function(contentResponse) {
var $markup = _processTemplate(contentResponse, options);
var container = _getContainer($target);
var title = _getPopoverTitle($markup);
var content = _getTemplateContentFromMarkup($markup);
return $.extend({}, DEFAULT_CONFIG, {
title: title,
container: container,
content: content,
html: true,
template: $markup[0].outerHTML,
viewport: {
selector: container,
padding: 40
}
});
});
};
})();
function showPopup(evt, url, options) {
evt.preventDefault();
if (_shouldSkip(evt)) {
return;
}
var $target = $(evt.target);
_popupCursors.startWaiting(evt.target);
destroypopDiv(evt);
bindClose();
_getPopupConfig(url, $target, options).then(function(config) {
$target.popover(config);
$target.popover("show");
$target.addClass("glide-popup-target");
$target.attr('aria-expanded',true);
_popupCursors.stopWaiting(evt.target);
if (options && options.trapFocus === true) {
createAndActivateFocusTrap(getActivePopup());
}
});
}
function _popupClickHandler(evt) {
if ($(evt.target).closest(".glide-popup").length > 0) {
return;
}
destroypopDiv();
}
function _registerClickHandler() {
document.addEventListener('click', _popupClickHandler, true);
}
function _deregisterClickHandler() {
document.removeEventListener('click', _popupClickHandler, true);
}
function _popupEscapeHandler(evt) {
if (evt.keyCode != 27) {
return;
}
destroypopDiv(evt);
}
function _registerEscape() {
$(document).on("keyup", _popupEscapeHandler);
}
function _deregisterEscape() {
$(document).off("keyup", _popupEscapeHandler);
}
function _popupWindowResizeHandler() {
destroypopDiv();
}
function _registerWindowResize() {
$(window).on("resize", _popupWindowResizeHandler);
}
function _deregisterWindowResize() {
$(window).off("resize", _popupWindowResizeHandler);
}
function bindClose() {
_registerClickHandler();
_registerEscape();
_registerWindowResize();
}
function destroypopDiv() {
_deregisterClickHandler();
_deregisterEscape();
_deregisterWindowResize();
deactivateAndDestroyFocusTrap(getActivePopup());
$(".glide-popup-target")
.popover("destroy")
.removeClass("glide-popup-target")
.attr('aria-expanded',false);
if (typeof CustomEvent !== "undefined") {
CustomEvent.fire("refresh.event");
}
}
function getActivePopup() {
var elementData = $(".glide-popup-target").data("bs.popover");
return typeof elementData !== "undefined"
? elementData.$tip[0]
: undefined;
}
function exitPopup(evt) {
destroypopDiv(evt);
}
function createAndActivateFocusTrap(popup) {
if (!popup) {
return;
}
if (!window.focusTrap || !window.WeakMap) {
return;
}
_focusTraps = _focusTraps || new WeakMap();
var focusTrap = _focusTraps.get(popup);
if (!focusTrap) {
focusTrap = window.focusTrap(popup, {
clickOutsideDeactivates: true
});
_focusTraps.set(popup, focusTrap);
}
try {
focusTrap.activate();
} catch (e) {
console.warn("Unable to activate focus trap", e);
}
}
function deactivateAndDestroyFocusTrap(popup) {
if (!popup) {
return;
}
if (!window.focusTrap || !window.WeakMap) {
return;
}
_focusTraps = _focusTraps || new WeakMap();
var focusTrap = _focusTraps.get(popup);
if (!focusTrap) {
return;
}
try {
focusTrap.deactivate({
returnFocus: true
});
} catch (e) {
console.warn("Unable to deactivate focus trap", e);
}
}
function _shouldSkip(evt) {
if ($(evt.target).data("bs.popover")) {
return true;
}
if (evt.ctrlKey) {
return true;
}
return false;
}
function _createOptionsObject(trapFocus, width) {
return {
trapFocus: !!trapFocus,
width: width || 0
};
}
function popListDiv(
evt,
target,
sys_id,
view,
width,
showOpenButton,
trapFocus
) {
evt.preventDefault();
var options = _createOptionsObject(trapFocus, width);
var contentURL = new GlideURL("popup.do");
contentURL.addParam("sysparm_sys_id", sys_id);
contentURL.addParam("sysparm_table_name", target);
contentURL.addParam("sysparm_field_name", "sys_id");
contentURL.addParam("sys_popup_direct", "true");
contentURL.addParam("sysparm_show_open_button", !!showOpenButton);
if (view) {
contentURL.addParam("sysparm_view", view);
}
contentURL.addParam("sysparm_glide_popup", "true");
showPopup(evt, contentURL.getURL(), options);
}
function popReferenceDiv(evt, inputId, view, form, refKey, trapFocus) {
evt.preventDefault();
var options = _createOptionsObject(trapFocus);
var safeInputID = inputId || ".";
var safeInput = document.getElementById(safeInputID) || "";
var firstDotIndex = safeInputID.indexOf(".");
var sys_id = safeInput.value;
var fieldName = safeInputID.slice(firstDotIndex + 1);
var table = safeInputID.slice(0, firstDotIndex);
var displayInput = gel("sys_display." + safeInputID);
if (displayInput) {
var targetForm = displayInput.getAttribute('data-table');
}
if (evt.metaKey && targetForm) {
window.open(targetForm + ".do?sys_id=" + sys_id + "&sysparm_view=" + view);
return;
}
var contentURL = new GlideURL("popup.do");
contentURL.addParam("sysparm_sys_id", sys_id);
contentURL.addParam("sysparm_table_name", table);
contentURL.addParam("sysparm_field_name", fieldName);
contentURL.addParam("sysparm_view", view);
contentURL.addParam("sysparm_show_open_button", "true");
if (form) {
contentURL.addParam("sysparm_form", form);
}
if (refKey) {
contentURL.addParam("sysparm_refkey", refKey);
}
contentURL.addParam("sysparm_glide_popup", "true");
showPopup(evt, contentURL.getURL(), options);
}
function popForm(evt, target, sys_id, view, width) {
evt.preventDefault();
var options = _createOptionsObject(false, width);
var contentURL = new GlideURL("popup.do");
contentURL.addParam("sysparm_sys_id", sys_id);
contentURL.addParam("sysparm_table_name", target);
contentURL.addParam("sysparm_field_name", "sys_id");
contentURL.addParam("sys_popup_direct", "true");
contentURL.addParam("sysparm_show_open_button", "true");
if (view) {
contentURL.addParam("sysparm_view", view);
}
contentURL.addParam("sysparm_glide_popup", "true");
showPopup(evt, contentURL.getURL(), options);
}
function popDiv(evt, sys_id) {
evt.preventDefault();
var contentURL = new GlideURL("service_catalog.do");
contentURL.addParam("sysparm_action", "popup");
contentURL.addParam("sysparm_sys_id", sys_id);
contentURL.addParam("sysparm_glide_popup", "true");
showPopup(evt, contentURL.getURL());
}
function popCatDiv(evt, sys_id) {
evt.preventDefault();
var contentURL = new GlideURL("service_catalog.do");
contentURL.addParam("sysparm_action", "popupCat");
contentURL.addParam("sysparm_sys_id", sys_id);
contentURL.addParam("sysparm_glide_popup", "true");
showPopup(evt, contentURL.getURL());
}
function popKnowledgeDiv(evt, sys_id) {
evt.preventDefault();
var contentURL = new GlideURL("kb_preview.do");
contentURL.addParam("sys_kb_id", sys_id);
contentURL.addParam("sysparm_nostack", "true");
contentURL.addParam("sysparm_glide_popup", "true");
showPopup(evt, contentURL.getURL());
}
function popRecordDiv(evt, table, sys_id, view, width) {
evt.preventDefault();
var options = _createOptionsObject(false, width);
var contentURL = new GlideURL("popup.do");
contentURL.addParam("sysparm_sys_id", sys_id);
contentURL.addParam("sysparm_table_name", table);
contentURL.addParam("sysparm_field_name", "sys_id");
contentURL.addParam("sys_popup_direct", "true");
contentURL.addParam("sysparm_show_open_button", "true");
if (view) {
contentURL.addParam("sysparm_view", view);
}
contentURL.addParam("sysparm_glide_popup", "true");
showPopup(evt, contentURL.getURL(), options);
}
function popLightWeightReferenceDiv(evt, inputid) {
evt.preventDefault();
var table;
var sys_id;
var tableElem = document.getElementById(inputid + "TABLE");
if (tableElem) {
table = tableElem.value;
}
var sysIdElem = document.getElementById(inputid);
if (sysIdElem) {
sys_id = sysIdElem.value;
}
var contentURL = new GlideURL("popup.do");
contentURL.addParam("sysparm_sys_id", sys_id);
contentURL.addParam("sysparm_table_name", table);
contentURL.addParam("sysparm_field_name", "sys_id");
contentURL.addParam("sysparm_view", null);
contentURL.addParam("sysparm_popup_direct", "true");
contentURL.addParam("sysparm_glide_popup", "true");
contentURL.addParam("sysparm_show_open_button", "true");
showPopup(evt, contentURL.getURL());
}
function popIssueDiv(evt, issues) {
evt.preventDefault();
var contentURL = new GlideURL("issuespopup.do");
contentURL.addParam("sysparm_issues", issues);
contentURL.addParam("sysparm_glide_popup", "true");
showPopup(evt, contentURL.getURL());
}
function popReportInfoDiv(evt, sys_id) {
evt.preventDefault();
var contentURL = new GlideURL("popup.do");
contentURL.addParam("sysparm_sys_id", sys_id);
contentURL.addParam("sysparm_table_name", "sys_report");
contentURL.addParam("sysparm_field_name", "user");
contentURL.addParam("sysparm_popup_direct", "true");
contentURL.addParam("sysparm_glide_popup", "true");
showPopup(evt, contentURL.getURL());
}
function popHistoryDiv(evt, table, sys_id, checkpoint, internalCP) {
evt.preventDefault();
var contentURL = new GlideURL("historypopup.do");
contentURL.addParam("sysparm_table_name", table);
contentURL.addParam("sysparm_sys_id", sys_id);
contentURL.addParam("checkpoint", checkpoint);
contentURL.addParam("internalCP", internalCP);
contentURL.addParam("sysparm_glide_popup", "true");
showPopup(evt, contentURL.getURL());
}
exports.nowapi = exports.nowapi || {};
exports.nowapi.g_popup_manager = {
POPUP_PREFIX: "popup_",
showPopup: showPopup,
bindClose: bindClose,
destroypopDiv: destroypopDiv,
createAndActivateFocusTrap: createAndActivateFocusTrap,
deactivateAndDestroyFocusTrap: deactivateAndDestroyFocusTrap,
exitPopup: exitPopup,
getActivePopup: getActivePopup,
popListDiv: popListDiv,
popReferenceDiv: popReferenceDiv,
popForm: popForm,
popDiv: popDiv,
popCatDiv: popCatDiv,
popKnowledgeDiv: popKnowledgeDiv,
popRecordDiv: popRecordDiv,
popLightWeightReferenceDiv: popLightWeightReferenceDiv,
popIssueDiv: popIssueDiv,
popReportInfoDiv: popReportInfoDiv,
popHistoryDiv: popHistoryDiv,
type: "GlidePopup"
};
})(window, jQuery, CustomEvent);
;
/*! RESOURCE: /scripts/classes/nowapi/util/_util_includes.js */
/*! RESOURCE: /scripts/lib/labjs/LAB.min.js */
/*! LAB.js (LABjs :: Loading And Blocking JavaScript)
    v2.0.3 (c) Kyle Simpson
    MIT License
*/
(function(o){var K=o.$LAB,y="UseLocalXHR",z="AlwaysPreserveOrder",u="AllowDuplicates",A="CacheBust",B="BasePath",C=/^[^?#]*\//.exec(location.href)[0],D=/^\w+\:\/\/\/?[^\/]+/.exec(C)[0],i=document.head||document.getElementsByTagName("head"),L=(o.opera&&Object.prototype.toString.call(o.opera)=="[object Opera]")||("MozAppearance"in document.documentElement.style),q=document.createElement("script"),E=typeof q.preload=="boolean",r=E||(q.readyState&&q.readyState=="uninitialized"),F=!r&&q.async===true,M=!r&&!F&&!L;function G(a){return Object.prototype.toString.call(a)=="[object Function]"}function H(a){return Object.prototype.toString.call(a)=="[object Array]"}function N(a,c){var b=/^\w+\:\/\//;if(/^\/\/\/?/.test(a)){a=location.protocol+a}else if(!b.test(a)&&a.charAt(0)!="/"){a=(c||"")+a}return b.test(a)?a:((a.charAt(0)=="/"?D:C)+a)}function s(a,c){for(var b in a){if(a.hasOwnProperty(b)){c[b]=a[b]}}return c}function O(a){var c=false;for(var b=0;b<a.scripts.length;b++){if(a.scripts[b].ready&&a.scripts[b].exec_trigger){c=true;a.scripts[b].exec_trigger();a.scripts[b].exec_trigger=null}}return c}function t(a,c,b,d){a.onload=a.onreadystatechange=function(){if((a.readyState&&a.readyState!="complete"&&a.readyState!="loaded")||c[b])return;a.onload=a.onreadystatechange=null;d()}}function I(a){a.ready=a.finished=true;for(var c=0;c<a.finished_listeners.length;c++){a.finished_listeners[c]()}a.ready_listeners=[];a.finished_listeners=[]}function P(d,f,e,g,h){setTimeout(function(){var a,c=f.real_src,b;if("item"in i){if(!i[0]){setTimeout(arguments.callee,25);return}i=i[0]}a=document.createElement("script");if(f.type)a.type=f.type;if(f.charset)a.charset=f.charset;if(h){if(r){e.elem=a;if(E){a.preload=true;a.onpreload=g}else{a.onreadystatechange=function(){if(a.readyState=="loaded")g()}}a.src=c}else if(h&&c.indexOf(D)==0&&d[y]){b=new XMLHttpRequest();b.onreadystatechange=function(){if(b.readyState==4){b.onreadystatechange=function(){};e.text=b.responseText+"\n//@ sourceURL="+c;g()}};b.open("GET",c);b.send()}else{a.type="text/cache-script";t(a,e,"ready",function(){i.removeChild(a);g()});a.src=c;i.insertBefore(a,i.firstChild)}}else if(F){a.async=false;t(a,e,"finished",g);a.src=c;i.insertBefore(a,i.firstChild)}else{t(a,e,"finished",g);a.src=c;i.insertBefore(a,i.firstChild)}},0)}function J(){var l={},Q=r||M,n=[],p={},m;l[y]=true;l[z]=false;l[u]=false;l[A]=false;l[B]="";function R(a,c,b){var d;function f(){if(d!=null){d=null;I(b)}}if(p[c.src].finished)return;if(!a[u])p[c.src].finished=true;d=b.elem||document.createElement("script");if(c.type)d.type=c.type;if(c.charset)d.charset=c.charset;t(d,b,"finished",f);if(b.elem){b.elem=null}else if(b.text){d.onload=d.onreadystatechange=null;d.text=b.text}else{d.src=c.real_src}i.insertBefore(d,i.firstChild);if(b.text){f()}}function S(c,b,d,f){var e,g,h=function(){b.ready_cb(b,function(){R(c,b,e)})},j=function(){b.finished_cb(b,d)};b.src=N(b.src,c[B]);b.real_src=b.src+(c[A]?((/\?.*$/.test(b.src)?"&_":"?_")+~~(Math.random()*1E9)+"="):"");if(!p[b.src])p[b.src]={items:[],finished:false};g=p[b.src].items;if(c[u]||g.length==0){e=g[g.length]={ready:false,finished:false,ready_listeners:[h],finished_listeners:[j]};P(c,b,e,((f)?function(){e.ready=true;for(var a=0;a<e.ready_listeners.length;a++){e.ready_listeners[a]()}e.ready_listeners=[]}:function(){I(e)}),f)}else{e=g[0];if(e.finished){j()}else{e.finished_listeners.push(j)}}}function v(){var e,g=s(l,{}),h=[],j=0,w=false,k;function T(a,c){a.ready=true;a.exec_trigger=c;x()}function U(a,c){a.ready=a.finished=true;a.exec_trigger=null;for(var b=0;b<c.scripts.length;b++){if(!c.scripts[b].finished)return}c.finished=true;x()}function x(){while(j<h.length){if(G(h[j])){try{h[j++]()}catch(err){}continue}else if(!h[j].finished){if(O(h[j]))continue;break}j++}if(j==h.length){w=false;k=false}}function V(){if(!k||!k.scripts){h.push(k={scripts:[],finished:true})}}e={script:function(){for(var f=0;f<arguments.length;f++){(function(a,c){var b;if(!H(a)){c=[a]}for(var d=0;d<c.length;d++){V();a=c[d];if(G(a))a=a();if(!a)continue;if(H(a)){b=[].slice.call(a);b.unshift(d,1);[].splice.apply(c,b);d--;continue}if(typeof a=="string")a={src:a};a=s(a,{ready:false,ready_cb:T,finished:false,finished_cb:U});k.finished=false;k.scripts.push(a);S(g,a,k,(Q&&w));w=true;if(g[z])e.wait()}})(arguments[f],arguments[f])}return e},wait:function(){if(arguments.length>0){for(var a=0;a<arguments.length;a++){h.push(arguments[a])}k=h[h.length-1]}else k=false;x();return e}};return{script:e.script,wait:e.wait,setOptions:function(a){s(a,g);return e}}}m={setGlobalDefaults:function(a){s(a,l);return m},setOptions:function(){return v().setOptions.apply(null,arguments)},script:function(){return v().script.apply(null,arguments)},wait:function(){return v().wait.apply(null,arguments)},queueScript:function(){n[n.length]={type:"script",args:[].slice.call(arguments)};return m},queueWait:function(){n[n.length]={type:"wait",args:[].slice.call(arguments)};return m},runQueue:function(){var a=m,c=n.length,b=c,d;for(;--b>=0;){d=n.shift();a=a[d.type].apply(null,d.args)}return a},noConflict:function(){o.$LAB=K;return m},sandbox:function(){return J()}};return m}o.$LAB=J();(function(a,c,b){if(document.readyState==null&&document[a]){document.readyState="loading";document[a](c,b=function(){document.removeEventListener(c,b,false);document.readyState="complete"},false)}})("addEventListener","DOMContentLoaded")})(this);
/*! RESOURCE: /scripts/classes/nowapi/util/GlideUrlBuilder.js */
(function(exports, angular) {
"use strict";
angular.injector(['ng', 'sn.common.glide']).invoke(function(glideUrlBuilder) {
exports.GlideURLBuilder = glideUrlBuilder;
exports.GlideURL = glideUrlBuilder.newGlideUrl;
});
})(window.nowapi, angular);
;
/*! RESOURCE: /scripts/classes/nowapi/util/ScriptLoader.js */
window.nowapi.ScriptLoader = {
getScripts: function(scripts, callback) {
if (!(scripts instanceof Array))
scripts = [ scripts ];
for (var i = 0; i < scripts.length; i++)
$LAB.queueScript(scripts[i]);
$LAB.queueWait(callback);
$LAB.runQueue();
}
};
;
/*! RESOURCE: /scripts/classes/nowapi/util/StopWatch.js */
(function(global) {
"use strict";
var StopWatch = function() {
StopWatch.prototype.initialize.apply(this, arguments);
};
function doubleDigitFormat(num) {
if (num >= 10)
return num;
return "0" + num;
}
function tripleDigitFormat(num) {
if (num >= 100)
return num;
if (num >= 10)
return "0" + doubleDigitFormat(num);
return "00" + num;
}
var objPrototype = {
MILLIS_IN_SECOND: 1000,
MILLIS_IN_MINUTE: 60 * 1000,
MILLIS_IN_HOUR: 60 * 60 * 1000,
initialize: function(started) {
this.started = started || new Date();
},
getTime: function() {
var now = new Date();
return now.getTime() - this.started.getTime();
},
restart: function() {
this.initialize();
},
jslog: function(msg, src, date) {
global.log('[' + this.toString() + '] ' + msg, src, date);
return;
},
toString: function() {
return this.formatISO(this.getTime());
},
formatISO: function(millis) {
var hours = 0, minutes = 0, seconds = 0, milliseconds = 0;
if (millis >= this.MILLIS_IN_HOUR) {
hours = parseInt(millis / this.MILLIS_IN_HOUR);
millis = millis - (hours * this.MILLIS_IN_HOUR);
}
if (millis >= this.MILLIS_IN_MINUTE) {
minutes = parseInt(millis / this.MILLIS_IN_MINUTE);
millis = millis - (minutes * this.MILLIS_IN_MINUTE);
}
if (millis >= this.MILLIS_IN_SECOND) {
seconds = parseInt(millis / this.MILLIS_IN_SECOND);
millis = millis - (seconds * this.MILLIS_IN_SECOND);
}
milliseconds = parseInt(millis);
return doubleDigitFormat(hours) + ":" + doubleDigitFormat(minutes) + ":" + doubleDigitFormat(seconds) +
"." + tripleDigitFormat(milliseconds);
},
type: "StopWatch"
};
StopWatch.prototype = objPrototype;
global.GlideStopWatch = StopWatch;
})(window.nowapi);
;
;
/*! RESOURCE: /scripts/classes/nowapi/GlideAjax.js */
(function(exports, $) {
'use strict';
var url = "xmlhttp.do";
function GlideAjax() {
this.initialize.apply(this, arguments);
}
var objDef = {
initialize: function(targetProcessor, targetURL) {
this.processor = null;
this.params = {};
this.callbackFn = function() {};
this.errorCallbackFn = function() {};
this.wantAnswer = false;
this.requestObject = null;
this.setProcessor(targetProcessor);
url = targetURL || url;
},
addParam: function(name, value) {
this.params[name] = value;
},
getParam: function(name) {
return this.params[name];
},
getXML: function(callback) {
this.wantAnswer = false;
this.callbackFn = callback;
this.execute();
},
getXMLAnswer: function(callback) {
this.wantAnswer = true;
this.callbackFn = callback;
this.execute();
},
getJSON: function(callback){
this.getXMLAnswer(function(answer) {
var answerJSON = JSON.parse(answer);
callback(answerJSON);
});
},
getAnswer: function() {
return this.requestObject.responseXML.documentElement.getAttribute('answer');
},
setErrorCallback: function(errorCallback) {
this.errorCallbackFn = errorCallback;
},
getURL: function() {
return url;
},
getParams: function() {
return this.params;
},
setProcessor: function(p) {
this.addParam('sysparm_processor', p);
if (!p)
alert('GlideAjax.initalize: must specify a processor');
this.processor = p;
},
getProcessor: function() {
return this.processor;
},
execute: function() {
$.ajax({
type: 'POST',
url: url,
data: this.params,
dataType: 'xml',
success: this.successCallback.bind(this),
error: this.errorCallback.bind(this)
});
},
successCallback: function(data, status, xhr) {
this.requestObject = xhr;
this._fireUINotifications();
var args = [ this.wantAnswer ? this.getAnswer() : xhr ];
this.callbackFn.apply(null, args);
},
errorCallback: function(xhr) {
this.requestObject = xhr;
this._handleError();
this._fireUINotifications();
this.errorCallbackFn(xhr);
},
setScope: function(scope) {
if (scope)
this.addParam('sysparm_scope', scope);
return this;
},
_outOfScope: function() {
var callerScope = this.getParam("sysparm_scope") ? this.getParam("sysparm_scope") : "global";
var isAppScope = callerScope != "global";
return isAppScope && this.requestObject.responseXML.documentElement.getAttribute("error").indexOf("HTTP Processor class not found") == 0;
},
_fireUINotifications: function() {
if (!this.requestObject || !this.requestObject.responseXML)
return;
var notifications = this.requestObject.responseXML.getElementsByTagName('ui_notifications');
if (!notifications || notifications.length == 0)
return;
var spans = notifications[0].childNodes;
for (var i = 0; i < spans.length; i++) {
var span = spans[i];
CustomEvent.fire('legacy_session_notification', span);
}
},
_handleError: function() {
var responseCode = this._getResponseCode();
if (responseCode == 404 && this._outOfScope()) {
var err_options = {
text: "Access to Script Include " + this.processor +" blocked from scope: " + (this.getParam("sysparm_scope") ? this.getParam("sysparm_scope") : "global"),
notification_type: "system",
attributes: { type: "error" }
};
CustomEvent.fire('session_notification', err_options);
}
},
_getResponseCode: function() {
return this.requestObject.status;
},
};
GlideAjax.prototype = objDef;
exports.GlideAjax = window.GlideAjax || GlideAjax;
})(nowapi, jQuery);
;
/*! RESOURCE: /scripts/classes/nowapi/GlideRecord.js */
(function(exports) {
'use strict';
function GlideRecord() {
this.initialize.apply(this, arguments);
}
var objDef = {
AJAX_PROCESSOR: "AJAXGlideRecord",
initialized: false,
initialize: function(tableName) {
this.currentRow = -1;
this.rows = [];
this.conditions = [];
this.encodedQuery = "";
this.orderByFields = [];
this.orderByDescFields = [];
this.displayFields = [];
this.maxQuerySize = -1;
if (tableName)
this.setTableName(tableName);
if (this.initialized == false) {
this.ignoreNames = {};
for (var xname in this) {
this.ignoreNames[xname] = true;
}
} else {
for (var xname in this) {
if (this.ignoreNames[xname] && this.ignoreNames[xname] == true)
continue;
delete this[xname];
}
}
this.initialized = true;
},
addQuery: function() {
var fName;
var fOper;
var fValue;
if (arguments.length == 2) {
fName = arguments[0];
fOper = '=';
fValue = arguments[1];
} else if (arguments.length == 3) {
fName = arguments[0];
fOper = arguments[1];
fValue = arguments[2];
}
this.conditions.push({'name': fName, 'oper': fOper, 'value': fValue});
},
getEncodedQuery: function() {
var ec = this.encodedQuery;
for (var i = 0; i < this.conditions.length; i++) {
var q = this.conditions[i];
ec += "^" + q['name'] + q['oper'] + q['value'];
}
return ec;
},
deleteRecord: function(responseFunction) {
var ajax = new nowapi.GlideAjax(this.AJAX_PROCESSOR);
ajax.addParam("sysparm_type", "delete");
ajax.addParam("sysparm_name", this.getTableName());
ajax.addParam("sysparm_chars", this._getXMLSerialized());
if (typeof responseFunction != 'function') {
ajax.getXML();
return;
}
ajax.getXML(this._deleteRecord0.bind(this, responseFunction));
},
_deleteRecord0: function(responseFunction, response) {
if (!response || !response.responseXML)
return;
responseFunction(this);
},
get: function(id) {
this.initialize();
this.addQuery('sys_id', id);
this.query();
return this.next();
},
getTableName: function() {
return this.tableName;
},
hasNext: function() {
return (this.currentRow + 1 < this.rows.length);
},
insert: function(responseFunction) {
return this.update(responseFunction);
},
gotoTop: function() {
this.currentRow = -1;
},
next: function() {
return this._next();
},
_next: function() {
if (!this.hasNext())
return false;
this.currentRow++;
this.loadRow(this.rows[this.currentRow]);
return true;
},
loadRow: function(r) {
for (var i = 0; i < r.length; i++) {
var name = r[i].name;
var value = r[i].value;
if (this.isDotWalkField(name)) {
var start = this;
var parts = name.split(/-/);
for (var p = 0; p < parts.length - 1; p++) {
var part = parts[p];
if (typeof start[part] != 'object')
start[part] = new Object();
start = start[part];
}
var fieldName = parts[parts.length - 1];
start[fieldName] = value;
} else {
this[name] = value;
}
}
},
getValue: function(fieldName) {
return this[fieldName];
},
setValue: function(fieldName, value) {
this[fieldName] = value;
},
isDotWalkField: function(name) {
for (var i = 0; i < this.displayFields.length; i++) {
var fieldName = this.displayFields[i];
if (fieldName.indexOf(".") == -1)
continue;
var encodedFieldName = fieldName.replace(/\./g, "-");
if (name == encodedFieldName)
return true;
}
return false;
},
addOrderBy: function(f) {
this.orderByFields.push(f);
},
orderBy: function(f) {
this.orderByFields.push(f);
},
orderByDesc: function(f) {
this.orderByDescFields.push(f);
},
setDisplayFields: function(fields) {
this.displayFields = fields;
},
query: function() {
var responseFunction = this._parseArgs(arguments);
if (this._getBaseLine()) {
var rxml = loadXML(g_filter_description.getBaseLine());
this._queryResponse(rxml);
return;
}
var ajax = new nowapi.GlideAjax(this.AJAX_PROCESSOR);
ajax.addParam("sysparm_type", "query");
ajax.addParam("sysparm_name", this.getTableName());
ajax.addParam("sysparm_chars", this.getEncodedQuery());
if (this.getLimit() != -1)
ajax.addParam("sysparm_max_query", this.getLimit());
if (this.orderByFields.length > 0)
ajax.addParam("sysparm_orderby", this.orderByFields.join(","));
if (this.orderByDescFields.length > 0)
ajax.addParam("sysparm_orderby_desc", this.orderByDescFields.join(","));
if (this.displayFields.length > 0)
ajax.addParam("sysparm_display_fields", this.displayFields.join(","));
ajax.getXML(this._query0.bind(this, responseFunction));
},
_parseArgs: function(args) {
var responseFunction = null;
var i = 0;
while (i < args.length) {
if (typeof args[i] == 'function') {
responseFunction = args[i];
i++;
continue;
}
if (i + 1 < args.length) {
this.conditions.push({'name': args[i], 'oper': '=', 'value': args[i + 1]});
i += 2;
} else
i++;
}
return responseFunction;
},
_query0: function(responseFunction, response) {
if (!response || !response.responseXML)
return;
this._queryResponse(response.responseXML);
responseFunction(this);
},
_queryResponse: function(rxml) {
var rows = [];
var items = rxml.getElementsByTagName("item");
for (var i = 0; i < items.length; i++) {
if ((items[i].parentNode.parentNode == rxml)) {
var grData = items[i];
var cnodes = grData.childNodes;
var fields = [];
for (var z = 0; z < cnodes.length; z++) {
var field = cnodes[z];
var name = field.nodeName;
var value = getTextValue(field);
if (!value)
value = "";
fields.push({'name': name, 'value': value});
}
if (cnodes.length && cnodes.length > 0)
rows.push(fields);
}
}
this.setRows(rows);
},
setRows: function(r) {
this.rows = r;
},
setTableName: function(tableName) {
this.tableName = tableName;
},
update: function(responseFunction) {
var ajax = new nowapi.GlideAjax(this.AJAX_PROCESSOR);
ajax.addParam("sysparm_type", "save_list");
ajax.addParam("sysparm_name", this.getTableName());
ajax.addParam("sysparm_chars", this._getXMLSerialized());
if (typeof responseFunction != 'function')
responseFunction = doNothing;
ajax.getXML(this._update0.bind(this, responseFunction));
},
_update0: function(responseFunction, response) {
if (!response || !response.responseXML)
return;
var answer = this._updateResponse(response.responseXML);
responseFunction(this, answer);
},
_updateResponse: function(rxml) {
var items = rxml.getElementsByTagName("item");
if (items && items.length > 0)
return getTextValue(items[0]);
},
setLimit: function(maxQuery) {
this.maxQuerySize = maxQuery;
},
getLimit: function() {
return this.maxQuerySize;
},
_getXMLSerialized: function() {
var xml = loadXML("<record_update/>");
var root = xml.documentElement;
if (this.sys_id)
root.setAttribute("id", this.sys_id);
root.setAttribute('table', this.getTableName());
var item = xml.createElement(this.getTableName());
root.appendChild(item);
for (var xname in this) {
if (this.ignoreNames[xname])
continue;
var f = xml.createElement(xname);
item.appendChild(f);
var v = this[xname];
if (!v)
v = "NULL";
var t = xml.createTextNode(v);
f.appendChild(t);
}
return getXMLString(xml);
},
_getBaseLine: function() {
return window.g_filter_description
&& typeof g_filter_description.getBaseLine() != 'undefined'
&& this.getTableName() == 'cmdb_baseline'
&& this.getEncodedQuery()
&& this.orderByFields.length < 1
&& this.displayFields.length < 1;
},
z: null
};
GlideRecord.prototype = objDef;
function getTextValue(node) {
if (node.textContent)
return node.textContent;
var firstNode = node.childNodes[0];
if (!firstNode)
return null;
if (firstNode.data)
return firstNode.data;
return firstNode.nodeValue;
}
function loadXML(r) {
var xml = r.responseXML;
if (typeof xml != 'undefined')
return xml;
var dom = null;
try {
dom = new DOMParser().parseFromString(r, 'text/xml');
} catch (e) {}
return dom;
}
function doNothing() {}
function getXMLString(node) {
var xml = "???";
if (node.xml) {
xml = node.xml;
} else if (window.XMLSerializer) {
xml = (new XMLSerializer()).serializeToString(node);
}
return xml;
}
exports.GlideRecord = window.GlideRecord || GlideRecord;
})(nowapi);
;
/*! RESOURCE: /scripts/classes/nowapi/i18n.js */
(function(exports, angular) {
"use strict";
var i18nService;
angular.injector(['ng', 'sn.common.i18n']).invoke(function(i18n) {
i18nService = i18n;
});
exports.g_i18n = {
getMessage: i18nService.getMessage,
format: i18nService.format,
getMessages: i18nService.getMessages
};
})(window.nowapi, angular);
;
/*! RESOURCE: /scripts/scoped_object_generators.js */
function ScopedGlideAjaxGenerator(scope) {
var ScopedGlideAjax = function() {
ScopedGlideAjax.prototype.initialize.apply(this, arguments);
};
ScopedGlideAjax.prototype = classExtendForScope({}, window.GlideAjax.prototype, {
scope: scope,
initialize: function(endpoint, url) {
GlideAjax.prototype.initialize.call(this, endpoint, url);
this.setScope(this.scope);
},
getXMLWait: function() {
var err_options = {
text: "Access to getXMLWait is not available in scoped applications.",
type: "system",
attributes: { type: "error" }
};
notifyFromWrappedScopedObject(err_options);
},
setScope: function(newScope) {
if (newScope != this.scope && newScope !== "global") {
var err_options = {
text: "Scoped applications cannot impersonate other scopes.",
type: "system",
attributes: { type: "error" }
};
notifyFromWrappedScopedObject(err_options);
return;
}
return GlideAjax.prototype.setScope.call(this, scope);
},
addParam: function(param, value) {
if (param == "sysparm_scope" && value != this.scope && value != "global") {
var err_options = {
text: "Scoped applications cannot impersonate other scopes.",
type: "system",
attributes: { type: "error" }
};
notifyFromWrappedScopedObject(err_options);
return;
}
return window.GlideAjax.prototype.addParam.call(this, param, value);
}
})
return ScopedGlideAjax;
}
function ScopedGFormGenerator(scope) {
var ScopedGForm =  function() {};
if ("undefined" == typeof g_form) {
return ScopedGForm;
}
ScopedGForm.prototype = g_form;
var scoped_g_form = new ScopedGForm();
function inScope(fieldName) {
try {
if (scope == g_form.getGlideUIElement(fieldName).getScope())
return true;
if(g_form.getGlideUIElement(fieldName).isInherited && (scope == g_form.getScope()))
return true;
} catch (e) {
jslog(e);
}
return false;
}
function _noCallbackError(displayName, fieldName) {
var text = displayName + " for " + fieldName + " not allowed: missing callback function as parameter";
var err_options = {
text: text,
type: "system",
attributes: { type: "error" }
}
notifyFromWrappedScopedObject(err_options);
}
function _showScopeError(displayName, fieldName, value) {
var text = displayName + " " + value + " not set on field " + fieldName + ": cross-scope access denied.";
var err_options = {
text: text,
type: "system",
attributes: { type: "error" }
}
opticsLog(scoped_g_form.getTableName(), fieldName, text);
notifyFromWrappedScopedObject(err_options);
}
function validField(fieldName) {
fieldName = g_form.removeCurrentPrefix(fieldName);
return g_form.hasField(fieldName) || g_form.getPrefixHandler(fieldName);
}
scoped_g_form.setReadOnly = function(fieldName, disabled) {
if (!validField(fieldName))
return;
if (inScope(fieldName))
return g_form.setReadOnly(fieldName, disabled);
_showScopeError("ReadOnly", fieldName, disabled);
}
scoped_g_form.setReadonly = function(fieldName, disabled) {
if (!validField(fieldName))
return;
if (inScope(fieldName))
return g_form.setReadonly(fieldName, disabled);
_showScopeError("ReadOnly", fieldName, disabled);
}
scoped_g_form.setMandatory = function(fieldName, mandatory) {
if (!validField(fieldName))
return;
if (inScope(fieldName))
return g_form.setMandatory(fieldName, mandatory);
_showScopeError("Mandatory", fieldName, mandatory);
}
scoped_g_form.setDisplay = function(fieldName, display) {
if (!validField(fieldName))
return;
if (inScope(fieldName))
return g_form.setDisplay(fieldName, display);
_showScopeError("Display", fieldName, display);
}
scoped_g_form.setDisabled = function(fieldName, disabled) {
if (!validField(fieldName))
return;
if (inScope(fieldName))
return g_form.setDisabled(fieldName, disabled);
_showScopeError("Disabled", fieldName, disabled);
}
scoped_g_form.getReference = function(fieldName, callBack) {
if (!validField(fieldName))
return;
if ('function' == typeof callBack)
return g_form.getReference(fieldName, callBack);
_noCallbackError("getReference", fieldName, false);
}
return scoped_g_form;
}
function ScopedGlideDialogWindowGenerator(scope) {
var extendFrom = window.GlideDialogWindow ? GlideDialogWindow.prototype : GlideModal.prototype;
var ScopedGlideDialogWindow = function() {
ScopedGlideDialogWindow.prototype.initialize.apply(this, arguments);
};
ScopedGlideDialogWindow.prototype = classExtendForScope({}, extendFrom, {
scope: scope,
initialize: function(id, readOnly, width, height) {
extendFrom.initialize.call(this, id, readOnly, width, height);
this.setScope(this.scope);
}
});
return ScopedGlideDialogWindow;
}
function classExtendForScope(extended, defaults, options) {
if (window.jQuery)
return jQuery.extend(extended, defaults, options);
var prop;
for (prop in defaults) {
extended[prop] = defaults[prop];
}
for (prop in options) {
extended[prop] = options[prop];
}
return extended;
}
function notifyFromWrappedScopedObject(msgObject) {
jslog(msgObject.text);
if (typeof nowapi !== 'undefined' && nowapi && typeof nowapi.hasOwnProperty('g_notification'))
nowapi.g_notification.show(msgObject.attributes.type, msgObject.text);
else if (typeof GlideUI != 'undefined')
GlideUI.get().display(new GlideUINotification(msgObject));
}
;
/*! RESOURCE: /scripts/classes/nowapi/scoped_object_bridge.js */
window.nowapi.ScopedGlideAjaxGenerator = ScopedGlideAjaxGenerator;
window.nowapi.ScopedGForm = ScopedGFormGenerator;
window.nowapi.ScopedGlideDialogWindowGenerator = ScopedGlideDialogWindowGenerator;
;
/*! RESOURCE: /scripts/sn/common/video/js_includes_video.js */
/*! RESOURCE: /scripts/sn/common/video/GlideVideoPlayer.js */
(function(exports) {
function GlideVideoPlayer(options) {
if (!(this instanceof GlideVideoPlayer))
return new GlideVideoPlayer(options);
this.initialize.apply(this, arguments);
}
GlideVideoPlayer.prototype = {
initialize: function(options) {
this.name = options.name || '';
this.type = options.type || '';
this.width = options.width || 640;
this.height = options.height || 264;
this.class = options.class || 'video-js vjs-default-skin';
this.includeControls = options.includeControls || 'true';
this.options = options.options;
this.playerConstructed = false;
this.linkConstructed = false;
this.attachment = options.attachment;
this.link = !!this.attachment ? '/sys_attachment.do?sys_id=' + this.attachment : '/' + this.name;
this.guid = options.id;
if (!this.guid)
this.guid = exports.nowapi.g_guid ? exports.nowapi.g_guid.generate() : this.name;
this.video = {
element: document.createElement('video'),
attributes: {
id: this.guid,
controls: this.includeControls,
width: this.width,
height: this.height,
class: this.class
}
};
this.source = {
element: document.createElement('source'),
attributes: {
src: this.link,
type: this.type
}
};
this.link = {
element: document.createElement('a'),
textContent: this.name,
attributes: {
download: this.name,
href: this.link
}
};
},
createPlayer: function(options) {
if (this.playerConstructed)
return this.video.element;
this._constructElement(this.video, options);
this._constructElement(this.source, {});
this.video.element.appendChild(this.source.element);
this.playerConstructed = true;
return this.video.element;
},
createDownloadLink: function(options) {
if (this.linkConstructed)
return this.link.element;
this._constructElement(this.link, options);
this.linkConstructed = true;
return this.link.element;
},
getUniqueId: function() {
return this.guid;
},
_constructElement: function(e, overrides) {
e.attributes = Object.assign({}, e.attributes, overrides);
for (var attribute in e.attributes)
e.element.setAttribute(attribute, e.attributes[attribute])
if (e.textContent)
e.element.textContent = e.textContent;
}
};
exports.GlideVideoPlayer = GlideVideoPlayer;
})(window);
;
/*! RESOURCE: /scripts/sn/common/video/_module.js */
angular.module('sn.common.video', []);
;
/*! RESOURCE: /scripts/sn/common/video/directive.snVideoPlayer.js */
angular.module('sn.common.video').directive('snVideoPlayer', function(getTemplateUrl) {
"use strict";
return {
restrict: 'E',
scope: {},
templateUrl: getTemplateUrl('sn_table_cell_video.xml'),
link: function(scope, element, attrs) {
scope.playerActive = attrs.playOnLoad === 'true';
scope.name = attrs.name;
scope.player = new GlideVideoPlayer(attrs);
scope.playVideo = function() {
scope.playerActive = !scope.playerActive;
element.append(scope.player.createPlayer());
if (attrs.showDownloadLink === 'true' && attrs.attachmentRecord !== '')
element.append(scope.player.createDownloadLink());
}
}
}
});
;
;
/*! RESOURCE: /scripts/doctype/FormAdditionalOptionsMenu.js */
$j(function() {
"use strict";
var tagsInitialized = false;
var $moreOptions = $j('#toggleMoreOptions').popover({
html: true,
placement: 'bottom'
}).on('show.bs.popover', function() {
if (!tagsInitialized && window.NOW.FormTags) {
tagsInitialized = true;
window.NOW.FormTags.init();
}
$j(this).data('bs.popover').$tip.find('.popover-title').hide();
}).on('shown.bs.popover', function() {
var windowHeight = $j(window).height() - 148;
var popoverMaxHeight = windowHeight > 300 ? windowHeight : 300;
$j('#moreOptionsContainer').css({'max-height': popoverMaxHeight + 'px'});
this.setAttribute("aria-expanded", "true");
if ($j('#moreOptionsContainer').find("button").length > 0)
$j('#moreOptionsContainer').find("button")[0].focus();
}).on('hide.bs.popover', function() {
this.setAttribute("aria-expanded", "false");
});
});
;
;
