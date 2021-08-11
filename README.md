# Email template system

## Table of Contents

+ [About](#about)
+ [Getting Started](#getting-started)
  + [Prerequisites](#prerequisites)
  + [Installing](#installing)
    + [Functions](#functions)
    + [Initialize Firebase](#initialize-firebase)
    + [Configure](#configure)
+ [Demo/Tutorial](#demo---tutorial)
+ [Deployment](#deployment)
+ [Usage](#usage)

## About

This project uses [Google Firebase](https://firebase.google.com/) as a back-end
for a basic email template system. It creates HTTP endpoints to get and send
emails that are generated using template files. [mustache.js](https://github.com/janl/mustache.js/)
is used for the template syntax, and the mustache tags are replaced with data
sent within the body of the HTTP request. [SendGrid](https://sendgrid.com/) is
used to send the emails.

I created this project as a learning exercise. It is not intended to be a robust
and production-ready system. There is no authentication or code for throttling
requests. If you deploy it as-is, anyone with the addresses will be able to make
requests and potentially use it for spamming.

Also, it's not practical to have the template files reside on the filesystem.
A change to a template requires you to redeploy to Firebase. It would be better
if the system used Firestore or Google Cloud Storage for the templates.

## Getting Started

These instructions will get you a copy of the project up and running on your
own system.

### Prerequisites

+ [Node.js 14 and npm 7](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
+ [The Firebase CLI](https://firebase.google.com/docs/functions/get-started)
+ Google Cloud Platform account with a [Billing Account](https://cloud.google.com/billing/docs).
  This is required to enable Cloud Functions, but you should remain well below
  free-tier usage during development.
+ A [SendGrid API Key](https://docs.sendgrid.com/ui/account-and-settings/api-keys)
  for sending emails.

### Installing

#### Firebase Project

Log into the Firebase Cloud Console, and create a new Firebase Project.

Go to the Functions page in the Cloud Console, and click the link to upgrade the
project to the "Blaze" billing plan; a project must be assigned a
[Billing Account](https://cloud.google.com/billing/docs) to use Cloud Functions.
You shouldn't exceed the free tier usage during development, but you can set a
Budget Alert for $1 just in case.

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

Copy default_config.js to config.js, and follow the instructions in the file for
filling in the values.

## Demo - Tutorial

Copy default_demo_data.js to demo_data.js, and templates/default_demo_template.html
to templates/demo_template.html. These demo files contain a short
introduction / tutorial on how to use mustache.js to build templates. They can
also be used to quickly verify that everything is configured correctly using
your browser.

After copying the files, and setting useDemoFiles in config.js to true,
you can get to the tutorial by starting the Firebase Functions Emulator
and browsing to the URL for the "getEmail" endpoint. It will be in the form
```http://localhost:PORT/PROJECT_ID/GOOGLE_CLOUD_REGION/getEmail```:

```bash
$ firebase serve

=== Serving from '/path/to/my_project'...

✔  functions: Using node@14 from host.
i  functions: Watching "/path/to/my_project/functions" for Cloud Functions...
✔  functions[us-central1-getEmail]: http function initialized (http://localhost:5000/my-project/us-central1/getEmail).
✔  functions[us-central1-sendEmail]: http function initialized (http://localhost:5000/my-project/us-central1/sendEmail).
```

You can use the "sendEmail" endpoint to test sending emails. You will need to
edit demo_data.js and add values to the "emailToAddress" and "emailFromAddress"
properties. You will also need to put your SendGrid API Key as the value of the
"SendGridAPIKey" property in demo_data.js or config.js. Browse to the URL for
the "sendEmail" endpoint that ```firebase serve``` outputs (see above), and the
system should email the content of the demo to the email you specified in the
demo_data.js file. The email will contain both an HTML and plain-text version of
the content.

## Deployment

**The deployed endpoints can be reached by anyone that knows the addresses.
This project does not have any authentication or access controls. It should not
be used in production, or left deployed for extended periods of time.**

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
✔  functions[sendEmail(us-central1)]: Successful create operation.
✔  functions[getEmail(us-central1)]: Successful create operation.
i  functions: cleaning up build files...

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/my-project/overview
```

## Usage

Send requests to the getEmail or sendEmail https endpoints. You can find the
URLs for the deployed endpoints by browsing to the "Functions" tab of the
Project Console in Firebase. The endpoints will respond the same to GET or POST
requests.

The request header should have "content-type" set to "application/json", and the
request body should be a JSON object with a property named "emailData"
containing the data that mustache.js will use to replace the tags in the
template file.

The only requirement for the getEmail endpoint is that the emailData object has
a "templateFile" property whose value is the name of a file in the "templates"
directory.

For the sendEmail endpoint, the emailData object should have the following
properties:

+ templateFile (the name of a file in the "templates" directory)
+ emailToAddress
+ emailFromAddress
+ emailFromName
+ emailSubject
+ sendGridApiKey (only if it isn't set in config.js)

Below is an example of a request that you can send in VSCode using the
[REST Client extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client).
It contains the same object that is in demo_data.js, and uses
templates/demo_template.html as the template file:

```http
POST http://localhost:5000/my-project/us-central1/getEmail HTTP/1.1

content-type: application/json
{
  "emailData": {
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
