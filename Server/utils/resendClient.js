const { Resend } = require('resend');

const apiKey = process.env.RESEND_API_KEY;
let resend;

if (apiKey && typeof apiKey === 'string' && apiKey.trim().length > 0) {
  resend = new Resend(apiKey.trim());
} else {
  // Fallback dummy client when RESEND_API_KEY is not configured
  // Prevents the server from crashing on boot in development or when email key is absent
  resend = {
    emails: {
      send: async (options) => {
        console.warn('⚠️ [Resend] Email skipped because RESEND_API_KEY is not configured:', options?.subject || options);
        return { data: { id: 'mock-id' }, error: null };
      }
    }
  };
}

module.exports = resend;
