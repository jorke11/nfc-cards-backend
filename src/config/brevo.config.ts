import { registerAs } from '@nestjs/config';

export default registerAs('brevo', () => ({
  apiKey: process.env.BREVO_API_KEY,
  fromEmail: process.env.BREVO_FROM_EMAIL || 'noreply@example.com',
}));
