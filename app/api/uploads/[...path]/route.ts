import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { readFile } from "fs/promises";
import { existsSync } from "fs";


export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) {
    try {
        const { path: pathSegments } = await params;
        const fileName = pathSegments.join("/");

        // Security: Prevent directory traversal
        if (fileName.includes("..")) {
            return NextResponse.json({ error: "Invalid path" }, { status: 400 });
        }

        const filePath = path.join(process.cwd(), "public", "uploads", fileName);

        if (!existsSync(filePath)) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        const buffer = await readFile(filePath);

        // Simple MIME type map
        const ext = path.extname(filePath).toLowerCase();
        const mimeMap: Record<string, string> = {
            ".pdf": "application/pdf",
            ".doc": "application/msword",
            ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        };
        const contentType = mimeMap[ext] || "application/octet-stream";

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Error serving file:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
