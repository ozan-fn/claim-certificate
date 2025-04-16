"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, LogIn, User, Lock } from "lucide-react";
import jwt from "jsonwebtoken";

export default function LoginPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			try {
				const decoded: any = jwt.decode(token);
				if (decoded && decoded.exp * 1000 > Date.now()) {
					window.location.href = "/dashboard";
				}
			} catch (err) {
				// do nothing, biarkan user tetap di login
			}
		}
	}, []);

	async function handleLogin(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			const res = await fetch("/api/login", {
				method: "POST",
				body: JSON.stringify({ username, password }),
				headers: { "Content-Type": "application/json" },
			});

			const data = await res.json();

			if (data.token) {
				localStorage.setItem("token", data.token);
				window.location.href = "/dashboard";
			} else {
				setError(data.message || "Login gagal. Silakan periksa username dan password Anda.");
			}
		} catch (err) {
			setError("Terjadi kesalahan pada server. Silakan coba lagi nanti.");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="flex min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
			<div className="m-auto w-full max-w-md p-8">
				<div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
					{/* Header */}
					<div className="bg-gray-700 p-6 border-b border-gray-600">
						<div className="flex justify-center mb-2">
							<div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center">
								<LogIn size={32} className="text-white" />
							</div>
						</div>
						<h1 className="text-2xl font-bold text-center text-white">Login</h1>
						<p className="text-gray-300 text-center mt-2">Masuk ke akun Anda</p>
					</div>

					{/* Form */}
					<form onSubmit={handleLogin} className="p-6 space-y-6">
						{error && (
							<div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded relative" role="alert">
								<span className="block sm:inline">{error}</span>
							</div>
						)}

						<div className="space-y-2">
							<label htmlFor="username" className="text-sm font-medium text-gray-300 block">
								Username
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<User size={18} className="text-gray-400" />
								</div>
								<input id="username" className="bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Masukkan username" />
							</div>
						</div>

						<div className="space-y-2">
							<label htmlFor="password" className="text-sm font-medium text-gray-300 block">
								Password
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Lock size={18} className="text-gray-400" />
								</div>
								<input id="password" className="bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 p-3" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" />
								<div className="absolute inset-y-0 right-0 pr-3 flex items-center">
									<button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-300 focus:outline-none">
										{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
									</button>
								</div>
							</div>
						</div>

						<div className="flex items-center justify-between">
							<div className="flex items-start">
								<div className="flex items-center h-5">
									<input id="remember" aria-describedby="remember" type="checkbox" className="w-4 h-4 bg-gray-700 border border-gray-600 rounded focus:ring-blue-500" />
								</div>
								<div className="ml-3 text-sm">
									<label htmlFor="remember" className="text-gray-300">
										Ingat saya
									</label>
								</div>
							</div>
							<a href="#" className="text-sm font-medium text-blue-500 hover:underline">
								Lupa password?
							</a>
						</div>

						<button type="submit" disabled={isLoading} className="w-full flex justify-center items-center px-4 py-3 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm text-white transition-all duration-200 ease-in-out">
							{isLoading ? (
								<>
									<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Sedang Memproses...
								</>
							) : (
								<>
									<LogIn size={18} className="mr-2" />
									Masuk
								</>
							)}
						</button>
					</form>

					{/* Footer */}
					<div className="p-6 bg-gray-700 border-t border-gray-600">
						<p className="text-sm text-center text-gray-300">
							Belum punya akun?{" "}
							<a href="/register" className="text-blue-500 hover:underline font-medium">
								Daftar sekarang
							</a>
						</p>
					</div>
				</div>

				<p className="mt-6 text-sm text-center text-gray-400">© {new Date().getFullYear()} Aplikasi Anda. Semua hak dilindungi.</p>
			</div>
		</div>
	);
}
