import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
    request: NextRequest,
    { params: paramsPromise }: { params: Promise<{ filename: string }> }
) {
    const params = await paramsPromise;
    const { filename } = params;
    
    // Security: Prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return new NextResponse('Invalid filename', { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

    if (!fs.existsSync(filePath)) {
        return new NextResponse('File not found', { status: 404 });
    }

    try {
        const fileBuffer = fs.readFileSync(filePath);
        const extension = path.extname(filename).toLowerCase();
        
        let contentType = 'image/jpeg';
        if (extension === '.png') contentType = 'image/png';
        if (extension === '.webp') contentType = 'image/webp';
        if (extension === '.gif') contentType = 'image/gif';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        return new NextResponse('Error reading file', { status: 500 });
    }
}
