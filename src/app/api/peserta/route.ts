// app/api/peserta/route.ts
import { PrismaClient } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validasi input
		if (!Array.isArray(body.participants)) {
			return NextResponse.json({ error: "Format data tidak valid" }, { status: 400 });
		}

		// Validasi setiap peserta
		for (const participant of body.participants) {
			if (!participant.name || !participant.email) {
				return NextResponse.json({ error: "Setiap peserta harus memiliki nama dan email" }, { status: 400 });
			}

			// Validasi email
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(participant.email)) {
				return NextResponse.json({ error: `Email tidak valid: ${participant.email}` }, { status: 400 });
			}
		}

		// Ambil nomor sertifikat terbesar yang sudah ada
		const lastPeserta = await prisma.peserta.findFirst({
			where: { nomorSertifikat: { not: null } },
			orderBy: { nomorSertifikat: "desc" },
		});

		const startNomor = lastPeserta ? lastPeserta.nomorSertifikat! + 1 : 1;

		// Generate data dengan nomor sertifikat yang terurut
		const dataPeserta = body.participants.map((p: { name: string; email: string }, index: number) => {
			const nomor = startNomor + index;
			return {
				nama: p.name,
				email: p.email,
				nomorSertifikat: nomor, // disimpan dalam bentuk angka
			};
		});

		// Simpan data peserta
		const result = await prisma.peserta.createMany({
			data: dataPeserta,
		});

		return NextResponse.json(
			{
				message: "Data peserta berhasil disimpan",
				count: result.count,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error saat menyimpan data peserta:", error);
		return NextResponse.json({ error: "Terjadi kesalahan saat menyimpan data" }, { status: 500 });
	}
}

export async function GET() {
	try {
		const peserta = await prisma.peserta.findMany({
			orderBy: {
				nomorSertifikat: "asc",
			},
		});

		return NextResponse.json({
			peserta: peserta.map((p: { id: any; nama: any; email: any; createdAt: any }) => ({
				id: p.id,
				name: p.nama,
				email: p.email,
				createdAt: p.createdAt,
			})),
		});
	} catch (error) {
		console.error("Error saat mengambil data peserta:", error);
		return NextResponse.json({ error: "Terjadi kesalahan saat mengambil data" }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json({ error: "ID peserta diperlukan" }, { status: 400 });
		}

		await prisma.peserta.delete({
			where: {
				id: id,
			},
		});

		return NextResponse.json({ message: "Peserta berhasil dihapus" });
	} catch (error) {
		console.error("Error saat menghapus peserta:", error);
		return NextResponse.json({ error: "Terjadi kesalahan saat menghapus data" }, { status: 500 });
	}
}
