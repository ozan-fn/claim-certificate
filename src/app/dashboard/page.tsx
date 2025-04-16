"use client";

import Protected from "@/layouts/Protected";
import React, { useState, useEffect } from "react";

export default function Page() {
	const [inputText, setInputText] = useState("");
	const [participants, setParticipants] = useState<{ email: string; name: string }[]>([]);
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [savedParticipants, setSavedParticipants] = useState<any[]>([]);
	const [isLoadingData, setIsLoadingData] = useState(false);

	// Fetch saved participants on component mount
	useEffect(() => {
		fetchParticipants();
	}, []);

	const fetchParticipants = async () => {
		try {
			setIsLoadingData(true);
			const response = await fetch("/api/peserta");
			const data = await response.json();

			if (data.peserta) {
				setSavedParticipants(data.peserta);
			}
		} catch (error) {
			console.error("Error fetching participants:", error);
		} finally {
			setIsLoadingData(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInputText(e.target.value);
	};

	const processParticipants = () => {
		if (!inputText.trim()) {
			setError("Input tidak boleh kosong");
			return;
		}

		const lines = inputText.trim().split("\n");
		const newParticipants: { email: string; name: string }[] = [];
		let hasError = false;

		lines.forEach((line, index) => {
			const parts = line.trim().split(/\s+/);

			// Check if we have at least 2 parts (name and email)
			if (parts.length < 2) {
				setError(`Baris ${index + 1}: Format tidak valid. Format yang benar: [nama] [email]`);
				hasError = true;
				return;
			}

			// The last part should be the email
			const email = parts.pop();
			// All remaining parts form the name
			const name = parts.join(" ");

			if (!email) {
				setError(`Baris ${index + 1}: Email tidak boleh kosong`);
				hasError = true;
				return;
			}

			// Simple email validation
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				setError(`Baris ${index + 1}: Email tidak valid "${email}"`);
				hasError = true;
				return;
			}

			newParticipants.push({ name, email });
		});

		if (!hasError) {
			setParticipants(newParticipants);
			setError("");
		}
	};

	const saveParticipants = async () => {
		if (participants.length === 0) {
			setError("Tidak ada data peserta untuk disimpan");
			return;
		}

		try {
			setIsLoading(true);
			setError("");
			setSuccessMessage("");

			const response = await fetch("/api/peserta", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ participants }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Terjadi kesalahan saat menyimpan data");
			}

			setSuccessMessage(`Berhasil menyimpan ${data.count} data peserta`);
			setInputText(""); // Clear input
			setParticipants([]); // Clear processed participants

			// Refresh the list of saved participants
			fetchParticipants();
		} catch (error: any) {
			setError(error.message || "Terjadi kesalahan saat menyimpan data");
		} finally {
			setIsLoading(false);
		}
	};

	const deleteParticipant = async (id: string) => {
		if (!confirm("Apakah Anda yakin ingin menghapus peserta ini?")) {
			return;
		}

		try {
			const response = await fetch(`/api/peserta?id=${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Terjadi kesalahan saat menghapus data");
			}

			// Refresh the list of saved participants
			fetchParticipants();
			setSuccessMessage("Peserta berhasil dihapus");
		} catch (error: any) {
			setError(error.message || "Terjadi kesalahan saat menghapus data");
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString("id-ID", {
			day: "2-digit",
			month: "long",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<Protected>
			<main className="min-h-screen overflow-auto flex-col p-6 2xl:px-0">
				<div className="max-w-7xl mx-auto space-y-8">
					<div>
						<h1 className="text-2xl font-bold mb-4">Input Data Peserta</h1>
						<p className="mb-4 text-gray-600">Masukkan data peserta dengan format: nama [spasi] email (satu baris per peserta)</p>
						<label htmlFor="participants" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
							Data Peserta
						</label>
						<textarea
							id="participants"
							rows={8}
							className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
							placeholder="Contoh:
ozan ozan6825@gmail.com
kafuu chino kafuu@gmail.com"
							value={inputText}
							onChange={handleInputChange}
						></textarea>

						{error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
						{successMessage && <div className="mt-2 text-green-500 text-sm">{successMessage}</div>}

						<div className="flex gap-3 mt-4">
							<button onClick={processParticipants} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
								Proses Data
							</button>

							{participants.length > 0 && (
								<button onClick={saveParticipants} disabled={isLoading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400">
									{isLoading ? "Menyimpan..." : "Simpan ke Database"}
								</button>
							)}
						</div>
					</div>

					{participants.length > 0 && (
						<div className="mt-8">
							<h2 className="text-xl font-semibold mb-3">Preview Data Peserta ({participants.length})</h2>
							<div className="overflow-x-auto">
								<table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
									<thead>
										<tr className="bg-gray-100 dark:bg-gray-700">
											<th className="py-2 px-4 border-b text-left">No</th>
											<th className="py-2 px-4 border-b text-left">Nama</th>
											<th className="py-2 px-4 border-b text-left">Email</th>
										</tr>
									</thead>
									<tbody>
										{participants.map((participant, index) => (
											<tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
												<td className="py-2 px-4 border-b">{index + 1}</td>
												<td className="py-2 px-4 border-b">{participant.name}</td>
												<td className="py-2 px-4 border-b">{participant.email}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}

					{/* Saved Participants Section */}
					<div className="mt-12">
						<h2 className="text-xl font-semibold mb-3">Data Peserta Tersimpan</h2>
						{isLoadingData ? (
							<div className="text-center py-8">
								<p>Memuat data...</p>
							</div>
						) : savedParticipants.length === 0 ? (
							<div className="text-center py-8 text-gray-500">
								<p>Belum ada data peserta tersimpan</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
									<thead>
										<tr className="bg-gray-100 dark:bg-gray-700">
											<th className="py-2 px-4 border-b text-left">No</th>
											<th className="py-2 px-4 border-b text-left">Nama</th>
											<th className="py-2 px-4 border-b text-left">Email</th>
											<th className="py-2 px-4 border-b text-left">Tanggal Dibuat</th>
											<th className="py-2 px-4 border-b text-left">Aksi</th>
										</tr>
									</thead>
									<tbody>
										{savedParticipants.map((participant, index) => (
											<tr key={participant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
												<td className="py-2 px-4 border-b">{index + 1}</td>
												<td className="py-2 px-4 border-b">{participant.name}</td>
												<td className="py-2 px-4 border-b">{participant.email}</td>
												<td className="py-2 px-4 border-b">{formatDate(participant.createdAt)}</td>
												<td className="py-2 px-4 border-b">
													<button onClick={() => deleteParticipant(participant.id)} className="text-red-600 hover:text-red-800">
														Hapus
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			</main>
		</Protected>
	);
}
