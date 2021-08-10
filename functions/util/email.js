const { logger } = require('firebase-functions');
const sendGridMail = require('@sendgrid/mail');
const { settings } = require('../config');
const { htmlToText } = require('html-to-text');

exports.sendEmail = async (email) => {
  if ( ! email.sendGridApiKey ) {
    logger.info( 'No sendGridApiKey in request, using default from config...' );
    email.sendGridApiKey = settings.sendGridApiKey;
  }

  if ( ! email.sendGridApiKey ) {
    logger.error( 'A SendGrid API key was not included in the request, and a default key has not been configured.' );
    return Promise.reject( 'A SendGrid API key was not included in the request, and a default key has not been configured.' );
  }

  sendGridMail.setApiKey( email.sendGridApiKey );
  const textContent = htmlToText(
    email.content, {
    wordwrap: 130
  });

  const msg = {
    to: email.emailToAddress,
    from: email.emailFromName + ' <' + email.emailFromAddress + '>',
    subject: email.emailSubject,
    text: textContent,
    html: email.content,
  }

  logger.info( 'sending email to ' + email.emailToAddress + ' with the subject: ' + email.emailSubject );
  return await sendGridMail.send( msg ).then( () => {
    logger.info('Email sent');
    return Promise.resolve( true );
  }).catch( err => {
    logger.error( err );
    if ( err?.response?.body?.errors ) {
      err = 'SendGrid error: ' + err.response.body.errors[0].message;
    }
    if ( err.message ) {
      err = 'SendGrid error: ' + err.message;
    }
    return Promise.reject( err );
  });
}
