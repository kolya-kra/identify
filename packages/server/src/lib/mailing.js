import handlebars from 'handlebars';
import fs from 'fs';

export const sendMail = (
  recipient,
  subject,
  content,
  { html, htmlPath, htmlReplacements },
  attachments
) => {
  const mailjet = require('node-mailjet').connect(
    process.env.MAILJET_SMTP_API,
    process.env.MAILJET_SMTP_SECRET
  );

  try {
    let htmlToSend;
    if (!html && htmlPath) {
      const htmlFile = fs.readFileSync(htmlPath, { encoding: 'utf-8' });

      const htmlTemplate = handlebars.compile(htmlFile);
      htmlToSend = htmlTemplate(htmlReplacements);
    }

    const request = mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: 'identify@deskcode.de',
            Name: 'Office of Identify',
          },
          To: [
            {
              Email: recipient,
            },
          ],
          Subject: subject,
          TextPart: content,
          HTMLPart: html || htmlToSend || '',
          Attachments: attachments || [],
        },
      ],
    });
    return request;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
