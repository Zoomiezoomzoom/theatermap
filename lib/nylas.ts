import Nylas from 'nylas';

if (!process.env.NYLAS_API_KEY) {
  throw new Error('NYLAS_API_KEY is not set in environment variables.');
}

const nylas = new Nylas({
  apiKey: process.env.NYLAS_API_KEY,
  apiUri: process.env.NYLAS_API_URI || 'https://api.us.nylas.com',
});

export default nylas; 