var ExpertUIPolicyBuilder = Class.create();

ExpertUIPolicyBuilder.prototype = Object.extendsObject(UIPolicyBuilder, {
   
   initialize: function() {
      UIPolicyBuilder.prototype.initialize.call(this);
   },
      
   _processPolicy: function(gr) {
         var scriptTrue = "";
         var scriptFalse = "";
         
         var scriptName = this._getScriptName(gr.sys_id, "true");
         if (this.uiPolicy.scripts[scriptName])
            scriptTrue = scriptName;
         
         scriptName = this._getScriptName(gr.sys_id, "false");
         if (this.uiPolicy.scripts[scriptName])
            scriptFalse = scriptName;
         
         var fieldPolicy = {};
         
         fieldPolicy.table = "(expert)";
         fieldPolicy.short_description = gr.short_description.toString();
         fieldPolicy.reverse = (gr.reverse_if_false.toString() == "true");
         fieldPolicy.onload = (gr.on_load.toString() == "true");
         fieldPolicy.script_true = scriptTrue;
         fieldPolicy.script_false = scriptFalse;
         fieldPolicy.debug = this.debug;
         this.uiPolicy.fieldPolicies.push(fieldPolicy);
         
         // Handle the conditions
         var conditions = [];
         fieldPolicy.conditions = conditions;
         
         var eq = new GlideQueryString();
         eq.init(fieldPolicy.table, gr.expert_conditions);
         eq.deserialize();
         var terms = eq.getTerms();
         fieldPolicy.condition_fields = [];
         for (var i = 0; i != terms.size(); i++) {
            var term = terms.get(i);
            if (term.isEndQuery())
               continue;
            
            // determine field type
            var termField = term.getTermField();
            var fieldType = this._getVariableType(termField);
            if (!fieldType)
               continue;

            var condition = {};
            condition.newquery = term.isNewQuery();
            condition.field = term.getTermField() + '';
            condition.oper = this._convertOper(term.getOperator() + '');
            condition.value = term.getValue() + '';
            condition.type = fieldType;
            condition.or = term.isOR();
            conditions.push(condition);
            
            var termField = term.getTermField();
            fieldPolicy.condition_fields.push(termField);
         }
         
         // get the policy actions
         var actions = [];
         fieldPolicy.actions = actions;
         
         var actionGR = new GlideRecord('expert_ui_policy_action');
         actionGR.addQuery('ui_policy', gr.sys_id);
         actionGR.query();
         while (actionGR.next()) {
            var action = {};
            action.name = actionGR.expert_variable.toString();
            action.mandatory = actionGR.mandatory.toString();
            action.visible = actionGR.visible.toString();
            action.disabled = actionGR.disabled.toString();
            actions.push(action);
         }
   },

   /* get the Glide data type for the variable */
   _getVariableType: function(sysid) {
         if (sysid.startsWith("IO:"))
            sysid = sysid.substring(3);
         var question = GlideappQuestion.getQuestion(sysid, null);
         if (!question) {
            gs.log("ExpertUIPolicyBuilder: Cannot get question for '" + sysid + "'.  Skipping term");
            return null;
         }
         var ed = question.getED();
         return ed.getInternalType();
   }, 
      
   type: 'ExpertUIPolicyBuilder'
});