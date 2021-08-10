const emailData = {
  sendGridApiKey: '',
  emailToAddress: '',
  emailFromAddress: '',
  emailFromName: 'Email template system',
  emailSubject: 'Email template system demo',
  templateFile: 'demo_template.html',
  demo_check: 'See "Checking if demo_data.js is as expected" in demo_template.html for information about this property.',
  second_list_item: 'The third list item is {{ third_list_item }}, and will be blank because the "third_list_item" property has been intentionally left out of demo_data.js',
  array_of_strings: [
    'First list item',
    'Second list item',
    'Third list item',
  ],
  array_of_objects: [
    {
      id: 1,
      name: 'Object 1 name',
    },
    {
      id: 2,
      name: 'Object 2 name',
    },
    {
      id: 3,
      name: 'Object 3 name',
    },
    {
      id: 4,
    },
    {
      id: 5,
      name: 'Object 5 name',
    },
  ],
};

module.exports = { emailData };
