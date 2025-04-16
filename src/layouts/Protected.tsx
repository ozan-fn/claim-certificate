"use client";

import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedProps {
	children: React.ReactNode;
}

export default function Protected({ children }: ProtectedProps) {
	const [isLogin, setIsLogin] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) return redirect("/login");
		setIsLogin(true);
	}, []);

	if (!isLogin) return null;

	return <>{children}</>;
}
