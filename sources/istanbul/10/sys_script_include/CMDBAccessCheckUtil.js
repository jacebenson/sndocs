var CMDBAccessCheckUtil = Class.create();
CMDBAccessCheckUtil.prototype = {
            initialize: function() {
            },
    
            isDomainSameAsUser: function(currentSysDomain) {
                var answer = true;
                if (GlidePluginManager.isActive("com.glide.domain.msp_extensions.installer")) {
                    answer = (currentSysDomain == this._getDomainId());
                }
        
                return answer;
            },
            
            getDomain: function() {
                var answer = 'global';
                if (GlidePluginManager.isActive("com.glide.domain.msp_extensions.installer"))
                    answer = this._getDomainId();
                return answer;
            },
            
            _getDomainId: function() {
                var userDomain = gs.getUser().getDomainID();
                userDomain = userDomain ? userDomain : 'global';
                return userDomain;
            },
    
            type: 'CMDBAccessCheckUtil'
};