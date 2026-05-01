import { db, doc, setDoc, getDoc, serverTimestamp } from '../config/firebase';
import crypto from 'crypto-js';
import { WEB3FORMS_CONFIG, isWeb3FormsConfigured } from '../config/web3forms';
import firestoreFallback from '../utils/firestoreFallback';

class EmailService {
  constructor() {
    this.otpCollection = 'adminOTPs';
    this.otpExpiryTime = 10 * 60 * 1000;
    this.isConfigured = isWeb3FormsConfigured();
  }

  generateOTP() {
    const array = new Uint32Array(1);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
      return String(100000 + (array[0] % 900000));
    }
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  hashOTP(otp) {
    return crypto.SHA256(String(otp)).toString();
  }

  async sendOTPEmail(email, name) {
    try {
      if (!this.isConfigured) {
        throw new Error('Email service (Web3Forms) not configured');
      }

      const otp = this.generateOTP();
      const hashedOTP = this.hashOTP(otp);
      const expiresAt = Date.now() + this.otpExpiryTime;

      try {
        const otpRef = doc(db, this.otpCollection, email);
        await setDoc(otpRef, {
          email,
          otpHash: hashedOTP,
          expiresAt,
          used: false,
          attempts: 0,
          createdAt: serverTimestamp()
        }, { merge: true });
      } catch (fbError) {
        firestoreFallback.set(this.otpCollection, email, {
          email,
          otpHash: hashedOTP,
          expiresAt,
          used: false,
          attempts: 0
        });
      }

      const formData = new FormData();
      formData.append('access_key', WEB3FORMS_CONFIG.ACCESS_KEY);
      formData.append('subject', 'Your Admin Login OTP');
      formData.append('name', name || 'Admin');
      formData.append('email', email);
      formData.append('message', `Hello ${name || ''},\n\nYour admin login OTP is: ${otp}\nThis OTP is valid for 10 minutes.\n\nIf you did not request this, you can ignore this email.\n\nThanks,\nCSI NMAMIT`);
      formData.append('replyto', import.meta.env.VITE_ADMIN_REPLY_EMAIL || 'noreply@csinmamit.in');
      const response = await fetch(WEB3FORMS_CONFIG.ENDPOINT, { method: 'POST', body: formData });
      const result = await response.json().catch(() => ({}));
      if (response.ok && result.success) {
        return { success: true };
      }
      throw new Error(result.message || `Web3Forms failed with status: ${response.status}`);
    } catch (error) {
      return { success: false, message: error.message || 'Failed to send admin login OTP email.' };
    }
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

  async verifyOTP(email, inputOTP) {
    try {
      let otpDoc = null;

      try {
        const otpRef = doc(db, this.otpCollection, email);
        const otpSnapshot = await getDoc(otpRef);
        if (otpSnapshot.exists()) {
          otpDoc = otpSnapshot.data();
        }
      } catch (fbError) {
        otpDoc = firestoreFallback.get(this.otpCollection, email);
      }

      if (!otpDoc) {
        return { success: false, message: 'No OTP found. Please request a new one.' };
      }

      if (otpDoc.used) {
        return { success: false, message: 'OTP already used. Please request a new one.' };
      }

      if (Date.now() > otpDoc.expiresAt) {
        return { success: false, message: 'OTP expired. Please request a new one.' };
      }

      if (otpDoc.attempts >= 5) {
        return { success: false, message: 'Too many failed attempts. Please request a new OTP.' };
      }

      const hashedInput = this.hashOTP(inputOTP);
      if (hashedInput !== otpDoc.otpHash) {
        try {
          const otpRef = doc(db, this.otpCollection, email);
          await setDoc(otpRef, { attempts: (otpDoc.attempts || 0) + 1 }, { merge: true });
        } catch (e) {
          firestoreFallback.set(this.otpCollection, email, { ...otpDoc, attempts: (otpDoc.attempts || 0) + 1 });
        }
        return { success: false, message: 'Invalid OTP.' };
      }

      try {
        const otpRef = doc(db, this.otpCollection, email);
        await setDoc(otpRef, { used: true, attempts: (otpDoc.attempts || 0) + 1 }, { merge: true });
      } catch (e) {
        firestoreFallback.set(this.otpCollection, email, { ...otpDoc, used: true });
      }

      return { success: true, message: 'OTP verified successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to verify OTP. Please try again.' };
    }
  }
}

export default new EmailService();
