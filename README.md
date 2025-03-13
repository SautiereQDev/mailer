# Express Mailer Server 📧

A simple backend server built with Express.js that provides an API for sending emails.
Uses the SMTP protocol.

## Features

- API for sending emails
- Customizable email templates
- Rate limiting to prevent abuse
- Input data validation

## Requirements

- [Node.js](https://nodejs.org/en) (v18.0.0 or higher)
- npm or yarn
- An account for an SMTP service (SendGrid, Mailgun, Amazon SES, etc.)

## Installation

```bash
# Clone the repository
git clone https://github.com/SautiereQDev/mailer.git
cd mailer

# Install dependencies
npm install
```

## Configuration

Create `.env.development` and `.env.production` files at the root of the project with the following variables:

```dotenv
## Environment ##
NODE_ENV=development

## Server ##
PORT=3004
HOST=localhost

EMAIL_PASSWORD=enter_your_email_password_here

## Setup jet-logger ##
JET_LOGGER_MODE=CONSOLE
JET_LOGGER_FILEPATH=jet-logger.log
JET_LOGGER_TIMESTAMP=TRUE
JET_LOGGER_FORMAT=LINE
```

## Project Structure

```plaintext
./src
├── common
│ ├── ENV.js
│ ├── ENV.ts
│ ├── HttpStatusCodes.js
│ ├── HttpStatusCodes.ts
│ ├── route-errors.js
│ ├── route-errors.ts
│ ├── staticData.js
│ └── staticData.ts
├── config
│ ├── mailer.js
│ └── mailer.ts
├── index.js
├── index.ts
├── midlewares
│ ├── rateLimiter.js
│ └── rateLimiter.ts
├── routes
│ ├── index.js
│ └── index.ts
├── scripts
│ ├── build.js
│ └── build.ts
├── server.js
├── server.ts
├── services
│ ├── emailTemplateService.js
│ ├── emailTemplateService.ts
│ ├── transporter.js
│ └── transporter.ts
├── utils
│ ├── validator.js
│ └── validator.ts
└── views
    └── emails
        ├── confirmation.hbs
        ├── contact.hbs
        ├── layouts
        │ └── main.hbs
        └── partials
            ├── footer.hbs
            └── header.hbs
```

## Usage

### Starting the server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### API Usage Examples

#### Sending an email (HTML content)

```bash
curl -X POST http://localhost:3000/mailer/send \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Quentin Sautière",
    "email": "contact@quentinsautiere.com",
    "company": "Company example",
    "message": "<p>This is test message in <strong>HTML</strong></p>"
  }'
```

## API Reference

### `POST /api/mail/send`

Sends a simple email.

**Request Body:**

```json
{
  "name": "string of the sender",
  "email": "string (email)",
  "company": "string (optional)",
  "message": "string (HTML)"
}
```

**Response:**

Success:

```json
{
  "message": "Email sent successfully",
}
```
Error:

```json
{
  "message": "Email not sent",
  "error": {
    "code": 500,
    "message": "Internal server error"
  }
}
```

## Security

- Requests are limited by IP to prevent abuse
- Input data is validated before processing
- No sensitive information is exposed in logs or responses

## Development

### Available Scripts

```bash
# Start the server in development mode (automatic reload)
npm run dev:hot

# Run tests
npm test

# Linting (eslint)
npm run lint

# Format code (prettier)
npm run format
```

## Main Dependencies

- [express](https://expressjs.com/): Web framework for Node.js
- [nodemailer](https://www.nodemailer.com/): Library for sending emails
- [handlebars](https://handlebarsjs.com/): Template engine for emails
- [dotenv](https://www.dotenv.org/): Loading environment variables
- [express-rate-limit](https://www.npmjs.com/package/express-rate-limit): Rate limiting for the API
- [helmet](https://www.npmjs.com/package/helmet): Security for Express
- [jet-logger](https://www.npmjs.com/package/jet-logger): Logger for Express

## Contributors

- **Quentin Sautière** - Initial work and main developer - [SautiereQDev](https://github.com/SautiereQDev)
## Contributions

Contributions are welcome! Please follow these steps:

1. Fork the project
2. Create a branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap
- Support for attachments
- Customizable email templates
- Secure authentication for API access
- Detailed logs of sent emails
- Support for plain text and HTML emails

## License

Distributed under the Apache 2.0 License. See `LICENSE` for more information.

Thanks to [**Sean Maxwell**](https://github.com/seanpmaxwell) for his Express TypeScript project generator (https://github.com/seanpmaxwell/express-generator-typescript)