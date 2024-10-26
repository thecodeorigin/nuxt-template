import { createTransport } from 'nodemailer'

export async function sendMail(emaitTo: string, subject: string, text: string) {
  const transporter = createTransport({
    host: process.env.SMTP_SERVER,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: emaitTo,
    subject,
    text,
  })
}
