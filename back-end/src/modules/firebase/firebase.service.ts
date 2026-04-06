import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  async sendPushNotification(deviceToken: string, title: string, body: string) {
    const message = {
      notification: { title, body },
      token: deviceToken,
    };
    try {
      const response = await admin.messaging().send(message);
      return { success: true, response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
