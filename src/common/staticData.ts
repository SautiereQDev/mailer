export const mailerInfo = {
  version: '1.0.0',
  author: 'Quentin Sautiere',
  contact: 'contact@quentinsautiere.com',
  message: 'This is the mailer endpoint. Send a POST request to send an email.',
  endpoints: [
    {
      method: 'POST',
      url: 'https://www.quentinsautiere.com/mailer/send',
      body: {
        name: 'string',
        company: 'string',
        email: 'string',
        message: 'string',
      },
    },
  ],
};
