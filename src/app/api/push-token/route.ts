import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getTokenFromHeader } from '@/lib/jwt';

// Register FCM token or update settings
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { fcmToken, platform = 'android', chatNotificationsEnabled, userId } = body;

    // If updating chat notifications setting
    if (typeof chatNotificationsEnabled === 'boolean' && userId) {
      await prisma.pushToken.updateMany({
        where: { userId },
        data: { chatNotificationsEnabled },
      });
      return NextResponse.json({ success: true });
    }

    // Register FCM token
    if (!fcmToken) {
      return NextResponse.json({ error: 'FCM token required' }, { status: 400 });
    }

    // Upsert token (update if exists, create if not)
    await prisma.pushToken.upsert({
      where: { token: fcmToken },
      update: { 
        userId: payload.userId,
        platform,
        updatedAt: new Date(),
      },
      create: {
        token: fcmToken,
        userId: payload.userId,
        platform,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push token registration error:', error);
    return NextResponse.json({ error: 'Failed to register token' }, { status: 500 });
  }
}

// Delete FCM token (logout)
export async function DELETE(request: NextRequest) {
  try {
    const { fcmToken } = await request.json();

    if (fcmToken) {
      await prisma.pushToken.deleteMany({
        where: { token: fcmToken },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push token deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete token' }, { status: 500 });
  }
}
