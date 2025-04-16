import { NextResponse } from "next/server";
import { sign } from "@/lib/auth";

export async function POST(req: Request) {
	const { username, password } = await req.json();

	// Contoh validasi hardcoded
	if (username === process.env.USER! && password === process.env.PASS!) {
		const token = sign({ username });
		return NextResponse.json({ token });
	}

	return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
