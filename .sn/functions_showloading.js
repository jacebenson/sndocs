/*! RESOURCE: /scripts/functions_showloading.js */
function showLoadingDialog(callbackFn) {
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    window.loadingDialog = new dialogClass("dialog_loading", true, 300);
    window.loadingDialog.setPreference('table', 'loading');
    window.loadingDialog._isLoadingDialogRendered = false;
    window.loadingDialog.on('bodyrendered', function() {
        window.loadingDialog._isLoadingDialogRendered = true;
    });
    if (callbackFn)
        window.loadingDialog.on('bodyrendered', callbackFn);
    window.loadingDialog.render();
}

function hideLoadingDialog() {
    if (!window.loadingDialog) {
        jslog('hideLoadingDialog called with no loading dialog on the page')
        return;
    }
    if (!window.loadingDialog._isLoadingDialogRendered) {
        window.loadingDialog.on('bodyrendered', function() {
            window.loadingDialog.destroy();
        });
        return;
    }
    window.loadingDialog.destroy();
};