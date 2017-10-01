/*! RESOURCE: /scripts/doctype/AngularBootstrapper.js */
window.ANGULAR_BOOTSTRAPPER = (function angularBootstrapper() {
    function createBootstrapModule(baseModules) {
        var allModules = baseModules.slice();
        $j('[sn-ng-formatter]').each(function(index, item) {
            var formatterModule = item.getAttribute('sn-ng-formatter');
            if (!formatterModule)
                return;
            try {
                angular.module(formatterModule);
                allModules.push(formatterModule);
            } catch (e) {
                jslog("Skipped loading of module " + formatterModule + " from " + item + " because it does not exist");
            }
        });
        var bootstrapModule = angular.module('appBootstrap', allModules);
        bootstrapModule.config(['$compileProvider', function($compileProvider) {}]);
        return bootstrapModule;
    }

    function getElemDepth(elem) {
        var parent = elem;
        var depth = 0;
        while (parent = parent.parentElement)
            depth++;
        return depth;
    }

    function getElemsOrderedByDepth(selectors) {
        return selectors.reduce(function(memo, selector) {
            return memo.concat(Array.prototype.slice.call(document.querySelectorAll(selector)));
        }, []).map(function(elem) {
            return {
                elem: elem,
                depth: getElemDepth(elem)
            }
        }).sort(function(a, b) {
            return a.depth - b.depth
        }).map(function(a) {
            return a.elem;
        });
    }

    function scheduleCompilation(selectors) {
        var elems = getElemsOrderedByDepth(selectors);
        if (!elems.length > 0) {
            jslog("Element matching selector not found, skipping Angular compilation of: " + selectors);
            return;
        }
        addLateLoadEvent(function compile() {
            var injector = angular.element(document.documentElement).injector();
            var $compile = injector.get('$compile');
            var $scope = injector.get('$rootScope').$new();
            var uncompiledElems = [];
            var compiledParent = null;
            for (var i = 0; i < elems.length; i++) {
                if (compiledParent = getCompiledParent(elems[i])) {
                    continue;
                }
                uncompiledElems.push(elems[i]);
                markElementCompiled(elems[i]);
            }
            console.log("Compiling in AngularBootstrapper.js", uncompiledElems);
            $compile(uncompiledElems)($scope);
        });
    }

    function markElementCompiled(elem) {
        elem.setAttribute('sn-ng-compiled', 'true');
    }

    function getCompiledParent(elem) {
        var parent = elem;
        while (parent != null) {
            if (parent.getAttribute('sn-ng-compiled'))
                return parent;
            if (parent.getAttribute('ng-non-bindable'))
                return null;
            if (parent.classList && parent.classList.contains('ng-non-bindable'))
                return null;
            parent = parent.parentElement;
        }
        return null;
    }

    function compileTemplates() {
        var templates = document.querySelectorAll('script[type="text/ng-template"]');
        if (!templates.length)
            return;
        var $templateCache = angular.element(document.documentElement).injector().get('$templateCache');
        var i;
        for (i = 0; i < templates.length; ++i)
            $templateCache.put(templates[i].id, templates[i].textContent);
    }

    function bootstrap(baseModules) {
        if (!window.angular)
            return;
        window.NOW = window.NOW || {};
        window.NOW.singleFormBootstrap = true;
        var bootstrapModule = createBootstrapModule(baseModules);
        angular.bootstrap(document.documentElement, [bootstrapModule.name]);
        compileTemplates();
        var compilationTargets = [
            'now-message',
            '.activity_table',
            '.section_zero',
            'sn-related-list',
            'sn-record-preview',
            'sn-reference-selector',
            '[sn-ng-formatter]'
        ];
        scheduleCompilation(compilationTargets);
    }
    return {
        bootstrap: bootstrap
    }
})();;