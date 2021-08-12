const functions = require('firebase-functions');
const logger = functions.logger;
const mustache = require('mustache');
const { sendEmail } = require('./util/email');
const user = require( './util/user' );
const { settings } = require('./config');
const fs = require('fs').promises;
const sanitize = require("sanitize-filename");

exports.install = functions.https.onCall( async ( data, context ) => {
  const hasUsers = await user.hasUsers();
  if ( hasUsers ) {
    logger.error( 'User already exists.' );
    return 'User already exists.';
  }

  logger.info( 'No users, creating first...' );
  const firstUser = await user.add();
  if ( ! firstUser ) {
    return 'User not created, see logs for more information.';
  }
  return 'Initial account created. Send requests using Client ID ' + firstUser.id + ' and Key ' + firstUser.key;
});

exports.getEmail = functions.https.onRequest( async (request, response) => {
  let emailData = request.body.emailData;

  if ( ! emailData ) {
    logger.info( 'Request did not include emailData.' );

    const demoData = await getDemoData();
    if ( ! demoData ) {
      response.status(400).send( 'Request did not include required data.' );
      return;
    }
    emailData = demoData;
  }

  const isValidUser = await user.isValid( emailData.appUserId, emailData.appUserKey );
  if ( isValidUser !== true ) {
    response.status(403).send( 'Not authorized' );
    return;
  }

  let result = await getEmailContent( emailData ).catch( err => {
    logger.error( 'getEmailContent result err', err );
    response.status(500).send( err );
    return;
  });

  response.send( result );
});

exports.sendEmail = functions.https.onRequest( async (request, response) => {
  let emailData = request.body.emailData;

  if ( ! emailData ) {
    logger.info( 'Request did not include emailData.' );

    const demoData = await getDemoData();
    if ( ! demoData ) {
      logger.info( 'Unable to use demo data. Request invalid.' );
      response.status(400).send( 'Request did not include required data.' );
      return;
    }
    emailData = demoData;
  }

  const isValidUser = await user.isValid( emailData.appUserId, emailData.appUserKey );
  logger.info( isValidUser, 'isValidUser' );
  if ( isValidUser !== true ) {
    response.status(403).send( 'Not authorized' );
    return;
  }

  const content = await getEmailContent( emailData )
  .catch( err => {
    logger.error( 'getEmailContent result err', err );
    response.status(500).send( err );
    return;
  });

  emailData.content = content;
  await sendEmail( emailData ).then( result => {
    response.send( result );
  }).catch( err => {
    if ( err.message ) {
      err = err.message;
    }
    response.status( 400 ).send( err );
    return;
  });
});

async function getFileContents( filepath ) {
  return await fs.readFile( filepath, 'utf-8' )
  .then( content => {
    if ( ! content ) {
      logger.error( filepath + ' has no content' );
      return false;
    }
    return content;
  })
  .catch( err => {
    logger.error( 'Error reading from file ' + filepath, err );
    return false;
  });
}

async function getDemoData () {
  if ( ! settings.useDemoFiles ) {
    logger.error('Site configuration does not permit use of demo data.');
    return false;
  }
  return await fs.access( './demo_data.js' ).then( () => {
    return require('./demo_data.js').emailData;
  }).catch ( err => {
    logger.error('Error accessing the demo file.', err);
    return false;
  } );
}

async function getEmailContent ( emailData ) {
  if ( ! emailData || typeof emailData !== 'object' || ! emailData.templateFile ) {
    logger.error( 'getEmailContent called with an invalid emailData parameter.', emailData);
    return Promise.reject( 'getEmailContent called with an invalid emailData parameter.' );
  }

  const templateFile = 'templates/' + sanitize( emailData.templateFile );
  const templateContent = await getFileContents( templateFile );
  if ( ! templateContent ) {
    return Promise.reject( 'Unable to read template: ' + templateFile );
  }

  const content = mustache.render( templateContent, emailData );
  return content;
}

