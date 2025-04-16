import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET!;

export function sign(payload: object) {
	return jwt.sign(payload, secret, { expiresIn: "1h" });
}

export async function verify(token: string) {
	try {
		const payload = jwt.verify(token, secret);
		return payload;
	} catch (err) {
		return null;
	}
}
