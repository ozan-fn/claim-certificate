import { NextRequest, NextResponse } from "next/server";
import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";
import fs from "fs";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const email = searchParams.get("email");

		if (!email) {
			return NextResponse.json({ error: "Email diperlukan" }, { status: 400 });
		}

		// Cari peserta berdasarkan email
		const peserta = await prisma.peserta.findUnique({ where: { email } });

		if (!peserta) {
			return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
		}

		// Path ke file (gunakan process.cwd karena __dirname tidak tersedia di app router)
		const basePath = path.join(process.cwd(), "src", "assets");

		const templatePath = path.join(basePath, "images", "certificate-template.png");
		const fontPath = path.join(basePath, "fonts", "Montserrat-Italic-VariableFont_wght.ttf");
		const robotoFontPath = path.join(basePath, "fonts", "Roboto-VariableFont_wdth,wght.ttf");

		if (!fs.existsSync(templatePath)) {
			return NextResponse.json({ error: "Template sertifikat tidak ditemukan" }, { status: 500 });
		}

		registerFont(fontPath, { family: "Montserrat" });
		registerFont(robotoFontPath, { family: "Robotos" });

		const image = await loadImage(templatePath);
		const canvas = createCanvas(image.width, image.height);
		const ctx = canvas.getContext("2d");

		ctx.drawImage(image, 0, 0, image.width, image.height);

		// Teks tambahan di atas nama peserta (menggunakan font Roboto ukuran 19px)
		ctx.font = '400 42px "Robotos"'; // Mengatur ukuran font Roboto menjadi 19px
		ctx.fillStyle = "#000000"; // Warna teks
		ctx.textAlign = "center"; // Menyelaraskan teks di tengah

		// Teks tambahan di atas nama peserta
		const nomorFormatted = String(peserta.nomorSertifikat || 0).padStart(3, "0");
		const teksAtas = `Nomor : ${nomorFormatted}/KombelGuruSIGAP/04/2025`; // Teks tambahan di atas nama peserta
		ctx.fillText(teksAtas, image.width / 2, image.height / 2 - 290); // Mengatur posisi 80px di atas nama peserta

		// Atur gaya teks (font harus sama dengan yang diregister)
		// ctx.font = '120px "Montserrat", sans-serif';
		ctx.font = 'italic 600 120px "MontserratItalic"';
		ctx.fillStyle = "#333333";
		ctx.textAlign = "center";

		const namaLengkap = peserta.nama.toUpperCase();
		ctx.fillText(namaLengkap, image.width / 2, image.height / 2 - 44);

		const buffer = canvas.toBuffer("image/png");

		const response = new NextResponse(buffer);
		response.headers.set("Content-Type", "image/png");
		response.headers.set("Content-Disposition", `attachment; filename="${namaLengkap.replace(/\s+/g, "_")}_certificate.png"`);

		return response;
	} catch (error: any) {
		console.error("Error saat menghasilkan sertifikat:", error);
		return NextResponse.json({ error: "Terjadi kesalahan saat menghasilkan sertifikat" }, { status: 500 });
	}
}
