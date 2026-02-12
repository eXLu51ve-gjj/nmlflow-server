import admin from 'firebase-admin';
import { prisma } from './prisma';
import path from 'path';
import fs from 'fs';

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

function initFirebase() {
  if (firebaseInitialized) return true;
  
  try {
    const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      console.log('Firebase service account not found at:', serviceAccountPath);
      return false;
    }
    
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    firebaseInitialized = true;
    console.log('Firebase Admin SDK initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    return false;
  }
}

// Send push notification to specific FCM tokens
async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
) {
  if (!initFirebase()) {
    console.log('Firebase not initialized, skipping push');
    return [];
  }
  
  if (tokens.length === 0) return [];
  
  const results: { token: string; success: boolean; error?: string }[] = [];
  
  for (const token of tokens) {
    try {
      await admin.messaging().send({
        token,
        notification: {
          title,
          body,
        },
        data: data || {},
        android: {
          priority: 'high',
          notification: {
            channelId: 'tasks',
            sound: 'default',
          },
        },
      });
      results.push({ token, success: true });
    } catch (error: any) {
      console.error('Failed to send push to token:', token, error.message);
      results.push({ token, success: false, error: error.message });
      
      // Remove invalid tokens
      if (error.code === 'messaging/invalid-registration-token' ||
          error.code === 'messaging/registration-token-not-registered') {
        await prisma.pushToken.deleteMany({ where: { token } });
      }
    }
  }
  
  return results;
}

export async function notifyUsers(
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, any>
) {
  try {
    const tokens = await prisma.pushToken.findMany({
      where: { userId: { in: userIds } },
      select: { token: true },
    });
    
    const tokenStrings = tokens.map((t: { token: string }) => t.token);
    return sendPushNotification(tokenStrings, title, body, data as Record<string, string>);
  } catch (error) {
    console.error('notifyUsers error:', error);
    return [];
  }
}

export async function notifyAllUsers(
  excludeUserId: string | null,
  title: string,
  body: string,
  data?: Record<string, any>
) {
  try {
    const tokens = await prisma.pushToken.findMany({
      where: excludeUserId ? { userId: { not: excludeUserId } } : {},
      select: { token: true },
    });
    
    const tokenStrings = tokens.map((t: { token: string }) => t.token);
    return sendPushNotification(tokenStrings, title, body, data as Record<string, string>);
  } catch (error) {
    console.error('notifyAllUsers error:', error);
    return [];
  }
}

// Notify users about chat messages (respects chatNotificationsEnabled setting)
export async function notifyChatMessage(
  excludeUserId: string,
  authorName: string,
  messageText: string
) {
  try {
    // Get tokens where chatNotificationsEnabled is true or not set (default true)
    const tokens = await prisma.pushToken.findMany({
      where: {
        userId: { not: excludeUserId },
        chatNotificationsEnabled: { not: false },
      },
      select: { token: true },
    });
    
    const tokenStrings = tokens.map((t: { token: string }) => t.token);
    const shortText = messageText.length > 50 ? messageText.substring(0, 50) + '...' : messageText;
    
    return sendPushNotification(
      tokenStrings,
      `💬 ${authorName}`,
      shortText,
      { type: 'chat' }
    );
  } catch (error) {
    console.error('notifyChatMessage error:', error);
    return [];
  }
}

export async function notifyTaskAssignees(
  taskId: string,
  title: string,
  body: string,
  excludeUserId?: string
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { 
        assignees: {
          select: { memberId: true }
        }
      },
    });
    
    if (!task || !task.assignees.length) return [];
    
    const memberIds = task.assignees.map((a: { memberId: string }) => a.memberId);
    
    // Get user IDs from team member IDs
    const users = await prisma.user.findMany({
      where: { teamMember: { id: { in: memberIds } } },
      select: { id: true },
    });
    
    const userIds = users
      .map((u: { id: string }) => u.id)
      .filter((id: string) => id !== excludeUserId);
    
    return notifyUsers(userIds, title, body, { taskId });
  } catch (error) {
    console.error('notifyTaskAssignees error:', error);
    return [];
  }
}
