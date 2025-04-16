"use client";

import React, { useState } from "react";
import { Search, Download, CheckCircle, XCircle } from "lucide-react";

export default function CertificatePage() {
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
	const [message, setMessage] = useState("");

	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value);
		setStatus("idle");
		setMessage("");
	};

	const validateEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateEmail(email)) {
			setStatus("error");
			setMessage("Format email tidak valid");
			return;
		}

		setStatus("loading");
		setMessage("");

		try {
			// Periksa keberadaan sertifikat
			const checkResponse = await fetch(`/api/certificate?email=${encodeURIComponent(email)}`, {
				method: "HEAD",
			});

			if (!checkResponse.ok) {
				throw new Error(checkResponse.status === 404 ? "Email tidak terdaftar dalam database peserta" : "Terjadi kesalahan saat memeriksa sertifikat");
			}

			// Jika berhasil, minta pengguna mengunduh sertifikat
			setStatus("success");
			setMessage("Sertifikat ditemukan dan siap diunduh");
		} catch (error: any) {
			setStatus("error");
			setMessage(error.message || "Terjadi kesalahan saat memproses permintaan");
		}
	};

	const downloadCertificate = () => {
		window.location.href = `/api/certificate?email=${encodeURIComponent(email)}`;
	};

	return (
		<main className="min-h-screen overflow-auto bg-gray-50 dark:bg-gray-900">
			<div className="max-w-4xl mx-auto p-6 space-y-8">
				<div className="text-center">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Unduh Sertifikat</h1>
					<p className="text-gray-600 dark:text-gray-400">Masukkan email yang terdaftar untuk mengunduh sertifikat Anda</p>
				</div>

				<div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Email
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Search size={18} className="text-gray-400" />
								</div>
								<input type="email" id="email" className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" placeholder="Masukkan email Anda" value={email} onChange={handleEmailChange} required />
							</div>
						</div>

						<div className="flex items-center justify-between">
							<button type="submit" disabled={status === "loading"} className="flex items-center justify-center px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-gray-400">
								{status === "loading" ? (
									<>
										<svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										Mencari...
									</>
								) : (
									<>
										<Search size={18} className="mr-2" />
										Cari Sertifikat
									</>
								)}
							</button>

							{status === "success" && (
								<button type="button" onClick={downloadCertificate} className="flex items-center justify-center px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
									<Download size={18} className="mr-2" />
									Unduh Sertifikat
								</button>
							)}
						</div>
					</form>

					{status === "success" && (
						<div className="mt-4 p-4 rounded-md bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700">
							<div className="flex">
								<div className="flex-shrink-0">
									<CheckCircle className="h-5 w-5 text-green-400" />
								</div>
								<div className="ml-3">
									<p className="text-sm font-medium text-green-800 dark:text-green-200">{message}</p>
								</div>
							</div>
						</div>
					)}

					{status === "error" && (
						<div className="mt-4 p-4 rounded-md bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700">
							<div className="flex">
								<div className="flex-shrink-0">
									<XCircle className="h-5 w-5 text-red-400" />
								</div>
								<div className="ml-3">
									<p className="text-sm font-medium text-red-800 dark:text-red-200">{message}</p>
								</div>
							</div>
						</div>
					)}
				</div>

				<div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
					<h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Informasi</h2>
					<ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
						<li>Sertifikat hanya tersedia untuk peserta yang terdaftar.</li>
						<li>Pastikan email yang Anda masukkan adalah email yang digunakan saat pendaftaran.</li>
						<li>Sertifikat akan diunduh dalam format PNG.</li>
					</ul>
				</div>
			</div>
		</main>
	);
}
