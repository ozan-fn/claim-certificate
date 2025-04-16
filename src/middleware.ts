import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_FILE = /\.(.*)$/;

// Ganti dengan secret JWT kamu
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "rahasia-super-aman");

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Lewatkan file statis dan path publik
	if (pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico") || PUBLIC_FILE.test(pathname)) {
		return NextResponse.next();
	}

	// Proteksi hanya untuk endpoint tertentu
	const protectedRoutes = ["/api/dashboard", "/api/certificate", "/api/peserta"];

	const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
	if (!isProtected) {
		return NextResponse.next();
	}

	// Ambil token dari header Authorization
	const authHeader = request.headers.get("authorization");

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return NextResponse.json({ error: "Unauthorized - Token tidak ditemukan" }, { status: 401 });
	}

	const token = authHeader.split(" ")[1];

	try {
		// Verifikasi token
		await jwtVerify(token, JWT_SECRET);

		// Jika valid, lanjutkan ke route berikutnya
		return NextResponse.next();
	} catch (error) {
		return NextResponse.json({ error: "Unauthorized - Token tidak valid" }, { status: 401 });
	}
}

// Tentukan route mana yang dipantau middleware
export const config = {
	matcher: ["/api/dashboard/:path*", "/api/certificate/:path*", "/api/peserta/:path*"],
};
