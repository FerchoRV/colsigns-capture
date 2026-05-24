import { NextRequest, NextResponse } from "next/server";

const FIREBASE_STORAGE_HOST = "firebasestorage.googleapis.com";

export async function GET(request: NextRequest) {
    const downloadUrl = request.nextUrl.searchParams.get("url");
    const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET;

    if (!downloadUrl || !bucket) {
        return NextResponse.json(
            { error: "Faltan parametros para descargar el archivo." },
            { status: 400 },
        );
    }

    let parsedUrl: URL;
    try {
        parsedUrl = new URL(downloadUrl);
    } catch {
        return NextResponse.json({ error: "URL invalida." }, { status: 400 });
    }

    const expectedPathPrefix = `/v0/b/${bucket}/o/`;
    if (
        parsedUrl.hostname !== FIREBASE_STORAGE_HOST ||
        !parsedUrl.pathname.startsWith(expectedPathPrefix)
    ) {
        return NextResponse.json(
            { error: "Solo se permiten archivos del bucket configurado." },
            { status: 400 },
        );
    }

    try {
        const storageResponse = await fetch(parsedUrl.toString());

        if (!storageResponse.ok || !storageResponse.body) {
            return NextResponse.json(
                { error: "No se pudo descargar el archivo desde Storage." },
                { status: storageResponse.status || 502 },
            );
        }

        return new NextResponse(storageResponse.body, {
            status: 200,
            headers: {
                "Content-Type": storageResponse.headers.get("content-type") || "application/octet-stream",
                "Content-Length": storageResponse.headers.get("content-length") || "",
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        console.error("Error descargando archivo desde Storage:", error);
        return NextResponse.json(
            { error: "Error descargando archivo desde Storage." },
            { status: 500 },
        );
    }
}
