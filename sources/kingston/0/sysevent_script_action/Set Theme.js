
setUserTheme();

function setUserTheme() {
   setTheme('');

   var pref = gs.getUser().getPreference('glide.css.theme');
   if (pref) {
      setTheme(pref);
   }

   var company = gs.getUser().getCompanyRecord();
   if (!company)
      return;

   var theme = company.getValue('theme');
   if (theme)
      setTheme(theme);
}

function setTheme(theme) {
  gs.getSession().putProperty('glide.css.theme', theme);
}