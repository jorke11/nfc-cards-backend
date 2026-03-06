import { registerAs } from '@nestjs/config';

export default registerAs('gmail', () => ({
  user: process.env.GMAIL_USER,
  password: process.env.GMAIL_PASSWORD,
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // false for port 587 (STARTTLS)
}));
