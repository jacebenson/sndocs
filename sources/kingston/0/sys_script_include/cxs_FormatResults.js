var cxs_FormatResults = Class.create();
cxs_FormatResults.prototype = {
    DEFAULT_RESULTS_MACRO: "cxs_results",
    DEFAULT_RESULTS_HEADER_MACRO: "cxs_results_header_table",
    DEFAULT_RESULT_MACRO: "cxs_result",

    initialize: function(actionName, response) {
        this.response = response;
    },

    usingMacro: function(macroNames) {
        var resultsMacro = macroNames.results_macro || this.DEFAULT_RESULTS_MACRO;
        if (!GlideDBMacro.get(resultsMacro).exists())
            return "";

        var resultHeaderMacro = macroNames.result_header_macro || this.DEFAULT_RESULTS_HEADER_MACRO;

        var resultMacro = macroNames.result_macro || this.DEFAULT_RESULT_MACRO;
        if (!GlideDBMacro.get(resultMacro).exists())
            return "";

        var jr = new GlideJellyRunner();
        jr.setEscaping(false);
        jr.setVariable("jvar_cxs_response", this.response);
        if (resultHeaderMacro && GlideDBMacro.get(resultHeaderMacro).exists())
            jr.setVariable("jvar_result_header_macro", resultHeaderMacro);
        else
            jr.setVariable("jvar_result_header_macro", "");

        jr.setVariable("jvar_result_macro", resultMacro);

        return jr.runMacro(resultsMacro);
    },

    type: "cxs_FormatResults"
}