if (!gs.nil(gs.getSession().getAvailableElevatedRoles())){
  var uinot = new UINotification('security');
  uinot.setText('Your Elevated Privilege has expired.&nbsp;Your session is being reloaded.');
  uinot.setAttribute('message', 'Your Elevated Privileges has expired.');
  uinot.send();
}