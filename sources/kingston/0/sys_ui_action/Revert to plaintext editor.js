var converter = new EmailNotificationConverter();
converter.convertTemplateToVersion1(current);
if (! current.isActionAborted())
    action.setRedirectURL(current);