const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'us-east-1' });

exports.handler = async (event) => {
  try {
    // Parse the incoming request body
    const body = JSON.parse(event.body);
    
    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: 'Name, email, and message are required fields' })
      };
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: 'Invalid email format' })
      };
    }
    
    // Prepare email parameters
    const params = {
      Destination: {
        ToAddresses: ['info@matthewkobilan.com']
      },
      Message: {
        Body: {
          Text: {
            Data: `Name: ${body.name}\nEmail: ${body.email}\nMessage: ${body.message}`
          }
        },
        Subject: {
          Data: 'New Contact Form Submission'
        }
      },
      Source: 'no-reply@matthewkobilan.com'
    };
    
    // Send email
    await ses.sendEmail(params).promise();
    
    // Store in DynamoDB for record keeping (optional)
    const dynamoDB = new AWS.DynamoDB.DocumentClient();
    await dynamoDB.put({
      TableName: process.env.CONTACT_FORM_TABLE,
      Item: {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        name: body.name,
        email: body.email,
        message: body.message,
        timestamp: new Date().toISOString()
      }
    }).promise();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Form submitted successfully' })
    };
  } catch (error) {
    console.error('Error processing form submission:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Error processing your request' })
    };
  }
};