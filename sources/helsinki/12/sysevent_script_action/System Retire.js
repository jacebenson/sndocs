gs.print("retiring instance " + event.parm1);

var sa = new SecurelyAccess("com.glideapp.deploy", "shell.scripts/retire-instance.sh");
sa.setBackground(true);
sa.setQuiet(false);
sa.runCommand(event.parm1);