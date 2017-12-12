var ContractManagementUtils = Class.create();

ContractManagementUtils.prototype = {
    initialize: function() {
    },
    
    renewContract: function(contractRecord){
        if ((contractRecord.state == 'active') && (contractRecord.substate == 'renewal_active')) {
            this._updateContractDates(contractRecord, 'renewal');
            if(contractRecord.ratecard)
                this._updateRateCards(contractRecord, 'renewal');
            else
                this._updateContract(contractRecord, 'renewal');
        }
        return;
    },
    
    extendContract: function(contractRecord){
        if ((contractRecord.state == 'active') && (contractRecord.substate == 'extension_active')) {
            this._updateContractDates(contractRecord, 'extension');
            if(contractRecord.ratecard)
                this._updateRateCards(contractRecord, 'extension');
            else
                this._updateContract(contractRecord, 'extension');
        }
        return;
    },
    
    activateRateCards: function(contractRecord, activate) {
        if (!SNC.AssetMgmtUtil.isPluginRegistered('com.snc.cost_management')) 
            return;
        
        var rateCardRecord = new GlideRecord('fm_contract_rate_card');
        rateCardRecord.addQuery('contract', contractRecord.sys_id);
        rateCardRecord.query();
        while(rateCardRecord.next()){
            rateCardRecord.setValue('active', activate);
            rateCardRecord.update();
        }
    },
    
updateTermsAndConditions: function(sysId) {
        var english_terms = "";
       
        var contractterms = new GlideRecord('clm_m2m_contract_and_terms');
        contractterms.addQuery('contract', sysId);
        contractterms.orderBy('order');
        contractterms.query();

        while (contractterms.next()) {
            var terms = new GlideRecord('clm_terms_and_conditions');
            terms.get(contractterms.terms_and_conditions);
            english_terms += '<b><u>' + terms.getValue('name') + '</u></b><br />' +  terms.getValue('description') + '<p></p>';
        }
        contract = new GlideRecord('ast_contract');
        contract.get(sysId);
        contract.setValue('terms_and_conditions', english_terms);
        contract.update();
        //to build T&C in all active languages on the instance other than english
         this._updateContractTermsAndConditionsForLanguagesOtherThanEnglish(sysId, english_terms);

    },
    
    _updateContractTermsAndConditionsForLanguagesOtherThanEnglish: function(sysId, english_terms) {
        var active_languages = {};
        var language_terms = {};
        var terms_available = {}; // flag to check all the terms are in specific language
        var language_display_name = {};

        var lang = new GlideRecord('sys_language');
        if(lang.isValid()){
        lang.addQuery('active','true');
        lang.query();
        }
        //for all the languages active on the instance
        var numberofactivelanguages=-1;
        while(lang.next()){
         var lang_id = lang.getValue('id');
         active_languages[++numberofactivelanguages] = lang_id; 
         terms_available[lang_id] = true;
         language_terms[lang_id] = "";
         language_display_name[lang_id] = lang.getValue('name');
        }
        if(numberofactivelanguages == -1){
            return;
        }
        contractterms = new GlideRecord('clm_m2m_contract_and_terms');
        contractterms.addQuery('contract', sysId);
        contractterms.orderBy('order');
        contractterms.query();

        while (contractterms.next()) {
            var k = 0;
            terms = new GlideRecord('clm_terms_and_conditions');
            terms.get(contractterms.terms_and_conditions);
            var termsandconditions = terms.getValue('sys_id');
            while(k <= numberofactivelanguages){
                language_id = active_languages[k];
                if(terms_available[language_id]){
                    var traslatedtextavailable = new GlideRecord('sys_translated_text');
                    traslatedtextavailable.addQuery('tablename','clm_terms_and_conditions');
                    traslatedtextavailable.addQuery('documentkey',termsandconditions);
                    traslatedtextavailable.addQuery('fieldname','description');
                    traslatedtextavailable.addQuery('language',language_id);
                    traslatedtextavailable.query();
                
                    if(traslatedtextavailable.next()){
                        language_terms[language_id] +=  '<b><u>' +terms.getValue('name') + '</u></b><br />' + traslatedtextavailable.getValue('value') + '<p></p>';
                        }
                    else{
                        language_terms[language_id] = english_terms;
                        terms_available[language_id] = false;
                        }
                }
                k++;
            }
        }

        var j=0;
        var k =-1;
        var tokensArray = [];
        while(j <= numberofactivelanguages){
            language_id = active_languages[j];
            //create or update contract's T&C in sys_translated_text for all active languages 
            var traslatedtext = new GlideRecord('sys_translated_text');
            traslatedtext.addQuery('documentkey',sysId);
            traslatedtext.addQuery('fieldname','terms_and_conditions');
            traslatedtext.addQuery('language',language_id);
            traslatedtext.addQuery('tablename','ast_contract');
            traslatedtext.query();
            if (!traslatedtext.next()){
                traslatedtext.initialize();
                traslatedtext.setValue('documentkey',sysId);
                traslatedtext.setValue('fieldname','terms_and_conditions');
                traslatedtext.setValue('language',language_id);
                traslatedtext.setValue('tablename','ast_contract');
                traslatedtext.setValue('value',language_terms[language_id]);
                traslatedtext.insert();
            }
            else {
                traslatedtext.setValue('value',language_terms[language_id]);
                traslatedtext.update();
            }

            if(terms_available[language_id]){
                tokensArray += " " + gs.getMessage(language_display_name[language_id]);
            }

            j++;
        }

        var message = gs.getMessage("Terms and Conditions are Built/Rebuilt in English ") + tokensArray;
        gs.addInfoMessage(message);

    },
        
    appendContractHistory : function(prev_contract) {
        var terms = prev_contract.getValue('terms_and_conditions');
        var history = new GlideRecord('clm_contract_history');
        history.initialize();
        history.setValue('contract_id', prev_contract.sys_id);
        if(!prev_contract.starts.nil())
            history.setValue('starts', prev_contract.starts);
        if(!prev_contract.ends.nil())
            history.setValue('ends', prev_contract.ends);
        if(!prev_contract.terms_and_conditions.nil())
            history.setValue('terms_and_conditions', terms);
        history.insert();   
    },
    
    getContractModels : function() {
        var cm = new GlideRecord('cmdb_model');
        cm.addQuery('cmdb_model_categoryLIKE996b568ec3102000b959fd251eba8f19');
        cm.query();

        var strQuery = 'sys_idIN';
        while (cm.next())
            strQuery += ',' + cm.sys_id;

        return strQuery;
    },

    filterAssetToContract : function(m2m) {
        if (m2m.contract.application_model != '')
            return 'quantity=1^sys_class_name!=alm_consumable^model_category=35bf2d4137101000deeabfc8bcbe5dbd^model.ref_cmdb_software_product_model.application_model=' + m2m.contract.application_model;
        else if (m2m.contract.contract_model.name == 'Software License')
            return 'quantity=1^sys_class_name!=alm_consumable^model_category=35bf2d4137101000deeabfc8bcbe5dbd';
        return 'quantity=1^sys_class_name!=alm_consumable^';
    },
    
    _isCostManagementActive: function(){
        if (SNC.AssetMgmtUtil.isPluginRegistered('com.snc.cost_management'))
            return true;
        return false;
    },
    
    _updateRateCards: function(contractRecord, process){
        if (!SNC.AssetMgmtUtil.isPluginRegistered('com.snc.cost_management')) 
            return;
        var rateCardRecord = new GlideRecord('fm_contract_rate_card');
        rateCardRecord.addQuery('contract', contractRecord.sys_id);
        rateCardRecord.query();
        while(rateCardRecord.next()){
            if(rateCardRecord.active){
                var base = rateCardRecord.base_cost;
                if(process == 'renewal')
                    rateCardRecord.start_date = contractRecord.renewal_date;
                rateCardRecord.end_date = contractRecord.renewal_end_date;
                if(contractRecord.cost_adjustment != '0')
                    base = parseFloat(rateCardRecord.getValue('base_cost'))+parseFloat(contractRecord.cost_adjustment);
                
                if (contractRecord.cost_adjustment_percentage != '0')
                    base = base * (1 + parseFloat(contractRecord.cost_adjustment_percentage)/100);
                
                rateCardRecord.setValue('base_cost', base);
                rateCardRecord.update();
            }
        }
        return;
    },
    
    _updateContractDates:function(contractRecord, process){
        if(process=='renewal')
            contractRecord.starts = contractRecord.renewal_date;
        gs.log('Updated date to: ' + contractRecord.renewal_end_date);
        contractRecord.ends = contractRecord.renewal_end_date;
        contractRecord.update();
        return;
    },
    
    _updateContract:function(contractRecord, process){
        if (contractRecord.cost_adjustment != "0")
            contractRecord.payment_amount = parseFloat(contractRecord.payment_amount)+ parseFloat(contractRecord.cost_adjustment);
        if (contractRecord.cost_adjustment_percentage != "0")
            contractRecord.payment_amount = parseFloat(contractRecord.payment_amount) * (1 + parseFloat(contractRecord.cost_adjustment_percentage)/100);
        return;
    },
    
    type: 'ContractManagementUtils'
}