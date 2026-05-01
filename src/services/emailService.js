import { WEB3FORMS_CONFIG, isWeb3FormsConfigured } from '../config/web3forms';

class EmailService {
  constructor() {
    this.isConfigured = isWeb3FormsConfigured();
  }

  async sendCustomEmail(toEmail, subject, message, name = 'User') {
    try {
      if (!this.isConfigured) {
        throw new Error('Email service (Web3Forms) not configured');
      }

      const formData = new FormData();
      formData.append('access_key', WEB3FORMS_CONFIG.ACCESS_KEY);
      formData.append('subject', subject);
      formData.append('name', name);
      formData.append('email', toEmail);
      formData.append('message', message);

      const response = await fetch(WEB3FORMS_CONFIG.ENDPOINT, { method: 'POST', body: formData });
      const result = await response.json().catch(() => ({}));

      if (response.ok && result.success) {
        return { success: true, response: result };
      } else {
        throw new Error(result.message || `Web3Forms failed with status: ${response.status}`);
      }
    } catch (error) {
      throw error;
    }
  }
}

export default new EmailService();
