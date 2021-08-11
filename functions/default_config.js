// Copy this file to config.js, and fill in any necessary values.

// sendGridApiKey: You need an API Key from SendGrid that permits sending
//   emails. You can enter it here, and/or send it with your requests.
//   https://docs.sendgrid.com/ui/account-and-settings/api-keys
//
// useDemoFiles: if set to true, requests without an emailData object will use
//   templates/demo_template.html and demo_data.js to build the email. When set
//   to false, requests without an emailData object will return an error.
const settings = {
  useDemoFiles: true,
  sendGridApiKey: '',
}

module.exports = { settings };
