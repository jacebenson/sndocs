/*! RESOURCE: /scripts/concourse/directive.printerFriendly.js */
angular.module("sn.concourse").directive('printerFriendly', function(getTemplateUrl) {
    return {
        restrict: 'E',
        templateUrl: getTemplateUrl('concourse_print_friendly.xml'),
        controller: function($scope) {
            $scope.printList = function(maxRows) {
                verifyEventHandlers();
                var veryLargeNumber = "999999999";
                var print = true;
                var features = "resizable=yes,scrollbars=yes,status=yes,toolbar=no,menubar=yes,location=no";
                if (navigator.appVersion.indexOf("Mac OS X") != -1 && navigator.appVersion.indexOf("Chrome") != -1)
                    features = "";
                var href = "";
                if (top.gsft_main)
                    var frame = top.gsft_main.gsft_list_form_modal;
                if (!frame) {
                    frame = top.gsft_main;
                    if (!frame)
                        frame = top;
                }
                if (frame.document.getElementById("printURL") != null) {
                    href = frame.document.getElementById("printURL").value;
                    href = printListURLDecode(href);
                }
                if (!href) {
                    if (frame.document.getElementById("sysparm_total_rows") != null) {
                        validateMaxRows(maxRows);
                    }
                    var formTest;
                    var f = 0;
                    var form;
                    while ((formTest = frame.document.forms[f++])) {
                        if (formTest.id == 'sys_personalize_ajax') {
                            form = formTest;
                            break;
                        }
                    }
                    if (!form)
                        form = frame.document.forms['sys_personalize'];
                    if (form && form.sysparm_referring_url) {
                        href = form.sysparm_referring_url.value;
                        if (href.indexOf("?sys_id=-1") != -1 && !href.startsWith('sys_report_template')) {
                            alert(getMessage("Please save the current form before printing."));
                            return false;
                        }
                        if (navigator.appVersion.indexOf("MSIE") != -1) {
                            var isFormPage = frame.document.getElementById("isFormPage");
                            if (isFormPage != null && isFormPage.value == "true")
                                href = href.replace(/javascript%3A/gi, "_javascript_%3A");
                        }
                        href = printListURLDecode(href);
                    } else
                        href = document.getElementById("gsft_main").contentWindow.location.href;
                }
                if (href.indexOf("?") < 0)
                    href += "?";
                else
                    href += "&";
                href = href.replace("partial_page=", "syshint_unimportant=");
                href = href.replace("sysparm_media=", "syshint_unimportant=");
                href += "sysparm_stack=no&sysparm_force_row_count=" + veryLargeNumber + "&sysparm_media=print";
                if (print) {
                    if (href != null && href != "") {
                        win = window.open(href, "Printer_friendly_format", features);
                        win.focus();
                    } else {
                        alert("Nothing to print");
                    }
                }
            };

            function verifyEventHandlers(maxRows) {
                var mainWin = getMainWindow();
                if (mainWin && mainWin.CustomEvent && mainWin.CustomEvent.fire && mainWin.CustomEvent.fire("print", maxRows) === false)
                    return false;
            }

            function validateMaxRows(maxRows) {
                var mRows = parseInt(maxRows);
                if (mRows < 1)
                    mRows = 5000;
                var totalrows = frame.document.getElementById("sysparm_total_rows").value;
                if (parseInt(totalrows) > parseInt(mRows))
                    print = confirm(getMessage("Printing large lists may affect system performance. Continue?"));
            }

            function printListURLDecode(href) {
                href = href.replace(/@99@/g, "&");
                href = href.replace(/@88@/g, "@99@");
                href = href.replace(/@77@/g, "@88@");
                href = href.replace(/@66@/g, "@77@");
                return href;
            }

            function getMainWindow() {
                var topWindow = getTopWindow();
                return topWindow['gsft_main'];
            }

            function getTopWindow() {
                var topWindow = window.self;
                try {
                    while (topWindow.GJSV && topWindow != topWindow.parent && topWindow.parent.GJSV) {
                        topWindow = topWindow.parent;
                    }
                } catch (e) {}
                return topWindow;
            }
        }
    }
});;