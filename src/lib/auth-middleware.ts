import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromHeader, JWTPayload } from "./jwt";
import prisma from "./prisma";

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

// Verify JWT token and return user payload
export async function authenticateRequest(request: NextRequest): Promise<JWTPayload | null> {
  const authHeader = request.headers.get("authorization");
  const token = getTokenFromHeader(authHeader);
  
  if (!token) {
    return null;
  }
  
  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }
  
  // Verify user still exists
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true },
  });
  
  if (!user) {
    return null;
  }
  
  return payload;
}

// Helper to create unauthorized response
export function unauthorizedResponse(message = "Требуется авторизация") {
  return NextResponse.json({ error: message }, { status: 401 });
}

// Helper to check if request has valid auth (for optional auth endpoints)
export async function getOptionalAuth(request: NextRequest): Promise<JWTPayload | null> {
  try {
    return await authenticateRequest(request);
  } catch {
    return null;
  }
}
