# Firebase email template system

## Table of Contents

+ [About](#about)
+ [Getting Started](#getting-started)
  + [Prerequisites](#prerequisites)
  + [Installing](#installing)
    + [Create Firebase Project](#create-firebase-project)
    + [Functions](#functions)
    + [Firestore Database](#firestore-database)
    + [Initialize Firebase](#initialize-firebase)
    + [Configure](#configure)
    + [Create User](#create-user)
  + [Deploying](#deploying)
+ [Usage](#usage)
  + [getEmail Endpoint](#getemail-endpoint)
  + [sendEmail Endpoint](#sendemail-endpoint)
  + [VSCode Rest Client Extension](#vscode-rest-client-extension)
+ [Demo/Tutorial](#demo---tutorial)

## About

This project uses [Google Firebase](https://firebase.google.com/) as a back-end
for a basic email template system. It creates HTTP endpoints to get and send
emails that are generated using template files. [mustache.js](https://github.com/janl/mustache.js/)
is used for the template syntax, and the mustache tags are replaced with data
sent within the body of the HTTP request. [SendGrid](https://sendgrid.com/) is
used to send the emails.

I created this project as a learning exercise. It is not intended to be a robust
and production-ready system. The method to prevent unauthorized connections is
relatively basic, and no code exists for throttling requests.

Also, it's not practical to have the template files reside on the filesystem.
A change to a template requires you to redeploy to Firebase. It would be better
if the system used Firestore or Google Cloud Storage for the templates.

## Getting Started

These instructions will get you a copy of the project up and running on your
own system.

### Prerequisites

+ [Node.js 14 and npm 7](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
+ [The Firebase CLI](https://firebase.google.com/docs/functions/get-started#set-up-node.js-and-the-firebase-cli)
+ Google Cloud Platform account with a [Billing Account](https://cloud.google.com/billing/docs).
  This is required to enable Cloud Functions, but you should remain well below
  free-tier usage during development.
+ A [SendGrid API Key](https://docs.sendgrid.com/ui/account-and-settings/api-keys)
  for sending emails.

### Installing

#### Create Firebase Project

Log into the Firebase Cloud Console, and create a new Firebase Project. There is
no need to enable Analytics on the project.

#### Functions

Go to the Functions page in the Cloud Console, and click the link to upgrade the
project to the "Blaze" billing plan; a project must be assigned a
[Billing Account](https://cloud.google.com/billing/docs) to use Cloud Functions.
You shouldn't exceed the free tier usage during development, but you can set a
Budget Alert for $1 just in case.

#### Firestore Database

1. Go to the Firestore Database tab in the Firebase Cloud Console and click
"Create database".

2. Make sure "Start in production mode" is selected, and click "Next".

3. Choose the [Cloud Firestore location](https://firebase.google.com/docs/projects/locations?authuser=0)
most suitable for your project, and click "Enable".

#### Initialize Firebase

Go to the project's directory after downloading or cloning it to your system,
and initialize Firebase:

```bash
cd my_project
firebase init
```

Make the following selections:

+ Features: Functions, Emulators
+ Use an existing project, then select your project
+ Language: JavaScript
+ ESLint: **No**
+ Do **NOT** overwrite existing files in the /functions directory
  + package.json
  + index.js
  + .gitignore
+ Install dependencies: Yes
+ Emulators: Functions Emulators
+ Port: Choose the default port unless it conflicts with an existing service on
  your system
+ Emulator UI: Optional

#### Configure

Copy ```functions/default_config.js``` to ```functions/config.js```, and follow
the instructions in the file for filling in the values.

#### Create User

Run ```firebase functions:shell``` on the command line and type ```install({})```
to run the install endpoint (type ```.exit``` to close the shell afterwards).

```bash
$ firebase functions:shell
⚠  functions: The Cloud Firestore emulator is not running, so calls to Firestore will affect production.
i  functions: Loaded functions: install, getEmail, sendEmail
⚠  functions: The following emulators are not running, calls to these services will affect production: firestore, database, pubsub, storage
firebase > install({})
Sent request to function.
firebase > >  {"verifications":{"app":"MISSING","auth":"MISSING"},"logging.googleapis.com/labels":{"firebase-log-type":"callable-request-verification"},"severity":"INFO","message":"Callable request verification passed"}
⚠  Google API requested!
   - URL: "https://oauth2.googleapis.com/token"
   - Be careful, this may be a production service.
>  {"severity":"INFO","message":"No users, creating first..."}

RESPONSE RECEIVED FROM FUNCTION: 200, {
  "result": "Initial account created. Send requests using Client ID L082w9MtPhgd7UXr2aeg and Key 9218cf63-5040-4ea3-b6bb-8d5f98469a2c"
}
########## type .exit to quit the shell ##########
.exit
```

This is a [Callable Function](https://firebase.google.com/docs/functions/callable),
and can only be called from the app or other authenticated source, like the
shell. It cannot be run from your browser or a REST client like ```getEmail```
and ```sendEmail``` can.

It will create a user in Firestore, if one doesn't already exist, with an
ID and Key that will be needed to make requests to the other endpoints. It will
fail if a user already exists.

To see existing user(s), along with their ID and Key, browse to the Firestore
Console and click on the Firestore Database tab. You can also go there to create
users manually.

### Deploying

Use the ```firebase deploy``` command to create publicly accessible endpoints.

```bash
$ firebase deploy

=== Deploying to 'my-project'...

i  deploying functions
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
i  functions: ensuring required API cloudbuild.googleapis.com is enabled...
✔  functions: required API cloudfunctions.googleapis.com is enabled
✔  functions: required API cloudbuild.googleapis.com is enabled
i  functions: preparing functions directory for uploading...
i  functions: packaged functions (120.65 KB) for uploading
✔  functions: functions folder uploaded successfully
i  functions: creating Node.js 14 function getEmail(us-central1)...
i  functions: creating Node.js 14 function sendEmail(us-central1)...
i  functions: creating Node.js 14 function install(us-central1)...
✔  functions[sendEmail(us-central1)]: Successful create operation.
✔  functions[getEmail(us-central1)]: Successful create operation.
✔  functions[install(us-central1)]: Successful create operation.
i  functions: cleaning up build files...

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/my-project/overview
```

## Usage

Send requests to the ```getEmail``` or ```sendEmail``` https endpoints. You can
find the URLs for the deployed endpoints by browsing to the "Functions" tab of
the Project Console in Firebase. The endpoints will respond the same to GET or
POST requests.

The request header should have ```content-type``` set to ```application/json```,
and the request body should be a JSON object with a property named ```emailData```
containing the data that mustache.js will use to replace the tags in the
template file.

### getEmail Endpoint

Requests to the ```getEmail``` endpoint must include an ```emailData``` object,
unless ```useDemoFiles``` is set to ```true``` in ```config.js```. In addition
to the properties for replacing template tags, ```emailData``` must have the
following properties:

+ appUserId
+ appUserKey
+ templateFile (the name of a file in the "templates" directory)

### sendEmail Endpoint

The ```sendEmail``` endpoint has the same requirements as ```getEmail```, but
its  ```emailData``` object must also include the properties related to sending
the email:

+ appUserId
+ appUserKey
+ templateFile
+ emailToAddress
+ emailFromAddress
+ emailFromName
+ emailSubject
+ sendGridApiKey (only if it isn't set in config.js)

### VSCode Rest Client Extension

Below is an example of a request that you can send in VSCode using the
[REST Client extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client).
It contains the same object that is in ```demo_data.js```, and uses
 ```templates/demo_template.html``` as the template file. Replace the values in
 ```appUserId``` and ```appUserKey``` with the corresponding values for the user
 created in the Install step above.

```http
POST http://localhost:5000/my-project/us-central1/getEmail HTTP/1.1

content-type: application/json
{
  "emailData": {
    "appUserId": "",
    "appUserKey": "",
    "templateFile": "demo_template.html",
    "sendGridApiKey" : "",
    "emailToAddress" : "foo@example.com",
    "emailFromAddress": "bar@example.com",
    "emailFromName": "Email template system",
    "emailSubject": "Email template system demo",
    "demo_check": "See 'Checking if demo_data.js is as expected' in templates/demo_template.html for information about this property.",
    "second_list_item": "The third list item is {{ third_list_item }}, and will be blank because the 'third_list_item' property has been intentionally left out of demo_data.js",
    "array_of_strings": [
      "First list item",
      "Second list item",
      "Third list item"
    ],
    "array_of_objects": [
      { "id": 1, "name": "Object 1 name" },
      { "id": 2, "name": "Object 2 name" },
      { "id": 3, "name": "Object 3 name" },
      { "id": 4 },
      { "id": 5, "name": "Object 5 name"}
    ]
  }
}
```

## Demo - Tutorial

Copy ```default_demo_data.js``` to ```demo_data.js```, and
```templates/default_demo_template.html``` to ```templates/demo_template.html```.
Open the ```demo_data.js``` file, and set ```appUserId``` and ```appUserKey``` to the
corresponding values for the user created in the Install step above.

These demo files contain a short introduction / tutorial on how to use
mustache.js to build templates. They can also be used to quickly verify that
everything is configured correctly using your browser.

After copying the files, and making sure ```useDemoFiles``` in ```config.js``` is set to
```true```, you can get to the tutorial by starting the Firebase Functions Emulator
and browsing to the URL for the ```getEmail``` endpoint. It will be in the form
```http://localhost:PORT/PROJECT_ID/GOOGLE_CLOUD_REGION/getEmail```

```bash
$ firebase serve

=== Serving from '/path/to/my_project'...

✔  functions: Using node@14 from host.
i  functions: Watching "/path/to/my_project/functions" for Cloud Functions...
⚠  functions: The Cloud Firestore emulator is not running, so calls to Firestore will affect production.
✔  functions[us-central1-install]: http function initialized (http://localhost:5000/my-project/us-central1/install).
✔  functions[us-central1-getEmail]: http function initialized (http://localhost:5000/my-project/us-central1/getEmail).
✔  functions[us-central1-sendEmail]: http function initialized (http://localhost:5000/my-project/us-central1/sendEmail).
```

You can use the ```sendEmail``` endpoint to test sending emails. You will need to
edit ```demo_data.js``` and add values to the ```emailToAddress``` and ```emailFromAddress```
properties. You will also need to put your SendGrid API Key as the value of the
```SendGridAPIKey``` property in ```demo_data.js``` or ```config.js```. Browse to the URL for
the ```sendEmail``` endpoint that ```firebase serve``` outputs (see above), and the
system should email the content of the demo to the email you specified in the
```demo_data.js``` file. The email will contain both an HTML and plain-text version of
the content.
