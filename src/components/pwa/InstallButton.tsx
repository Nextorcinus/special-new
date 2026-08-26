// components/pwa/InstallButton.tsx
"use client";

import { useEffect, useState } from "react";

export default function InstallButton() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Cek apakah prompt sudah siap ditangkap sebelumnya
    if ((window as any).deferredPrompt) {
      setShowButton(true);
    }

    // Dengarkan custom event dari PWARegister jika prompt baru saja ditangkap
    const handleInstallable = () => setShowButton(true);
    window.addEventListener("pwa-installable", handleInstallable);

    return () => window.removeEventListener("pwa-installable", handleInstallable);
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = (window as any).deferredPrompt;
    if (!promptEvent) return;

    // Munculkan pop-up dialog install bawaan Chrome Chrome
    promptEvent.prompt();

    // Tunggu jawaban dari user (klik Install atau Cancel)
    const { outcome } = await promptEvent.userChoice;
    console.log(`[PWA] User response to install prompt: ${outcome}`);

    // Bersihkan prompt karena hanya bisa digunakan sekali
    (window as any).deferredPrompt = null;
    setShowButton(false);
  };

  if (!showButton) return null; // Tombol disembunyikan jika tidak memenuhi syarat PWA atau sudah terinstal

  return (
    <button 
      onClick={handleInstallClick}
      className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium"
    >
      Install Aplikasi
    </button>
  );
}