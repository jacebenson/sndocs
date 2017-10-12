/*! RESOURCE: /scripts/app.guided_tours/GuidedTourElementTranslator.js */
(function() {
    var GuidedTourElementTranslator = {
        translateTargets: function(data) {
          var list = this.getTargetElement(data.steps, false);
          return this.translate(list, data.checkUI16, data.checkTabbedForm);
        },
        translateActionTargets: function(data) {
          var list = this.getTargetElement(data.steps, true);
          return this.translate(list, data.checkUI16, data.checkTabbedForm);
        },
        getTargetElement: function(steps, isAction) {
          var element = [];
          var targetElements = [];
          for (var i = 0; i < steps.length; i++) {
            if (isAction && typeof steps[i].actionTargetRecord != "undefined") {
              element = [steps[i].actionTargetRecord, steps[i].listV3Compatibility, steps[i].relatedListV3Compatibility];
              targetElements.push(element);
            } else if (!isAction && typeof steps[i].targetRecord != "undefined") {
              element = [steps[i].targetRecord, steps[i].listV3Compatibility, steps[i].relatedListV3Compatibility];
              targetElements.push(element);
            } else {
              targetElements.push("");
            }
          }
          return targetElements;
        },
        translate: function(list, checkUI16, checkTabbedForm) {
            var translatedElements = [];
            for (var i = 0; i <