# Contact Form Mailer Service

A robust NestJS-based email service designed to handle contact form submissions. This service provides a secure and reliable way to process contact form data and send emails using SMTP servers.

## 🚀 Features

- **Contact Form Processing**: Handle contact form submissions via REST API
- **Email Templates**: Handlebars-based email templates for professional-looking emails
- **SMTP Support**: Compatible with various SMTP providers (IONOS, Gmail, etc.)
- **Docker Support**: Development and production Docker configurations
- **Development Environment**: Includes MailHog for local email testing
- **Production Ready**: Secure configuration for production deployment

## 🛠 Tech Stack

- NestJS
- TypeScript
- Docker & Docker Compose
- NodeMailer
- Handlebars (for email templates)
- MailHog (for development)

## 📋 Prerequisites

- Node.js (v20 or later)
- Docker & Docker Compose
- SMTP server credentials

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Application
APPLICATION_PORT=3001

# SMTP Configuration
MAIL_HOST=your.smtp.server
MAIL_PORT=465
MAIL_USER=your@email.com
MAIL_PASSWORD=your_password
MAIL_FROM_NAME="Your Name"
MAIL_FROM_EMAIL=your@email.com
```

## 🚀 Getting Started

### Development

```bash
# Start development environment with MailHog
docker-compose up app-dev

# Access MailHog interface
http://localhost:8025
```

### Production

```bash
# Start production service
docker-compose up -d app-prod
```

## 📝 API Documentation

### Send Contact Form

```http
POST /contact

{
  "nom": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I would like to get in touch.",
  "entreprise": "Company Name", // Optional
  "source": "https://yourwebsite.com" // Source of the contact form
}
```

## 📧 Email Template

The service uses a professional email template that includes:

- Contact name and email
- Company name (if provided)
- Message content
- Source of the contact form
- Timestamp of submission

## 🔒 Security Features

- CORS protection
- Input validation
- SSL/TLS email encryption
- Rate limiting (optional)

## 🐳 Docker Configuration

The project includes two Docker configurations:

- `Dockerfile.dev`: Development environment with hot-reload
- `Dockerfile.prod`: Production-optimized build

## 📁 Project Structure

```
├── src/
│   ├── contact/
│   │   ├── templates/    # Email templates
│   │   ├── dto/         # Data transfer objects
│   │   ├── contact.service.ts
│   │   └── contact.controller.ts
│   └── app.module.ts
├── docker-compose.yml
├── Dockerfile.dev
└── Dockerfile.prod
```

## ⚙️ Development

```bash
# Install dependencies
npm install

# Run tests
npm run test

# Run in development
npm run start:dev

# Build for production
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

**Author** : [SautiereQDev](https://github.com/SautiereQDev)

This project is licensed under the Apache 2.0 License - see the LICENSE file for details.
