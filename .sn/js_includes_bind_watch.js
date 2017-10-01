/*! RESOURCE: /scripts/sn/common/bindWatch/js_includes_bind_watch.js */
/*! RESOURCE: /scripts/sn/common/bindWatch/_module.js */
angular.module('sn.common.bindWatch', []);;
/*! RESOURCE: /scripts/sn/common/bindWatch/config.bindWatch.js */
angular.module('sn.common.bindWatch').config(function($provide) {
    "use strict";
    $parseExpressionator.$inject = ['$delegate'];

    function $parseExpressionator($delegate) {
        function wrapParse(parse, exp, interceptor) {
            var parts;
            var part;
            var expression;
            var rawExpression;
            var notifiers;
            if (typeof exp === 'string' && /^:([a-zA-Z0-9][\w-]*):(.+)$/.test(exp)) {
                parts = exp.split(/:/);
                notifiers = [];
                while (parts.length) {
                    part = parts.shift();
                    if (part) {
                        if (/^\s*[\{\[]/.test(part)) {
                            rawExpression = [part].concat(parts).join(':');
                            break;
                        }
                        notifiers.push(part);
                    }
                }
                if (!rawExpression)
                    rawExpression = notifiers.splice(-1, 1)[0];
                expression = parse.call(this, '::' + rawExpression, interceptor);
                expression.$$watchDelegate = dynamicWatcher(expression, notifiers);
                return expression;
            } else {
                return parse.call(this, exp, interceptor);
            }
        }
        return wrapParse.bind(null, $delegate);
    }

    function dynamicWatcher(expression, keys) {
        if (expression.$$watchDelegate.wrapped)
            return expression.$$watchDelegate;

        function setupListeners(scope, callback) {
            keys.forEach(function(newKey) {
                scope.$on('$$applyTwoWayBinding::' + newKey, callback);
            });
        }

        function wrapDelegate(watchDelegate, scope, listener, objectEquality, parsedExpression) {
            var delegateCall = watchDelegate.bind(this, scope, listener, objectEquality, parsedExpression);
            setupListeners(scope, delegateCall);
            delegateCall();
        }
        var delegate = wrapDelegate.bind(this, expression.$$watchDelegate);
        delegate.wrapped = true;
        return delegate;
    }
    $provide.decorator('$parse', $parseExpressionator);
});;
/*! RESOURCE: /scripts/sn/common/bindWatch/BindWatch.js */
angular.module('sn.common.bindWatch').factory('BindWatch', function() {
    "use strict";
    return function(scope, map) {
        if (!scope || !map)
            throw new Error('No scope or map provided');
        Object.keys(map).forEach(function(key) {
            scope.$watch(map[key], function(key, n, o) {
                if (n !== o)
                    scope.$broadcast('$$applyTwoWayBinding::' + key);
            }.bind(null, key));
        });
    }
});;;