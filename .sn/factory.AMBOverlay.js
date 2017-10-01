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
        if (angular.isFunction(config.onShow))
            showCallbacks.push(config.onShow);
        if (angular.isFunction(config.onHide))
            hideCallbacks.push(config.onHide);

        function lazyRender() {
            if (!angular.element('html')['modal']) {
                var bootstrapInclude = "/scripts/bootstrap3/bootstrap.js";
                ScriptLoader.getScripts([bootstrapInclude], renderModal);
            } else
                renderModal();
        }

        function renderModal() {
            if (isRendered)
                return;
            modalScope = angular.extend($rootScope.$new(), config);
            modal = $compile($templateCache.get("amb_disconnect_modal.xml"))(modalScope);
            angular.element("body").append(modal);
            modal.on("shown.bs.modal", function(e) {
                for (var i = 0, len = showCallbacks.length; i < len; i++)
                    showCallbacks[i](e);
            });
            modal.on("hidden.bs.modal", function(e) {
                for (var i = 0, len = hideCallbacks.length; i < len; i++)
                    hideCallbacks[i](e);
            });
            modalOptions = angular.extend({}, defaults, config);
            modal.modal(modalOptions);
            isRendered = true;
        }

        function showModal() {
            if (isRendered)
                modal.modal('show');
        }

        function hideModal() {
            if (isRendered)
                modal.modal('hide');
        }

        function destroyModal() {
            if (!isRendered)
                return;
            modal.modal('hide');
            modal.remove();
            modalScope.$destroy();
            modalScope = void(0);
            isRendered = false;
            var pos = showCallbacks.indexOf(config.onShow);
            if (pos >= 0)
                showCallbacks.splice(pos, 1);
            pos = hideCallbacks.indexOf(config.onShow);
            if (pos >= 0)
                hideCallbacks.splice(pos, 1);
        }
        return {
            render: lazyRender,
            destroy: destroyModal,
            show: showModal,
            hide: hideModal,
            isVisible: function() {
                if (!isRendered)
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
});;