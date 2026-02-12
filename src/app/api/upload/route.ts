import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    let bytes: Buffer;
    let filename: string;
    const timestamp = Date.now();
    
    // Handle JSON with base64 (from mobile app)
    if (contentType.includes('application/json')) {
      const body = await request.json();
      
      if (!body.base64) {
        return NextResponse.json({ error: "No base64 data provided" }, { status: 400 });
      }
      
      bytes = Buffer.from(body.base64, 'base64');
      filename = body.filename || `${timestamp}-${Math.random().toString(36).substring(2, 8)}.jpg`;
    } 
    // Handle FormData (from web browser)
    else {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      
      if (!file || typeof file === 'string') {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }
      
      const ext = file.name?.split(".").pop() || "jpg";
      filename = `${timestamp}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const arrayBuffer = await file.arrayBuffer();
      bytes = Buffer.from(arrayBuffer);
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const filepath = path.join(uploadsDir, filename);
    await writeFile(filepath, bytes);

    // Return the URL
    const url = `/api/uploads/${filename}`;
    
    console.log("File uploaded successfully:", url);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
