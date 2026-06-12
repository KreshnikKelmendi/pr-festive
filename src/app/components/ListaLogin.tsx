'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';

interface ListaLoginProps {
  onSuccess: () => void;
}

function EyeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOffIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

export default function ListaLogin({ onSuccess }: ListaLoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/lista-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        setError('Fjalëkalimi i gabuar. Provoni përsëri.');
      }
    } catch {
      setError('Gabim gjatë hyrjes. Provoni përsëri.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md border border-[#031603] rounded-xl p-8">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/assets/logo-2025.png"
            alt="Logo"
            width={100}
            height={100}
            className="w-24 h-24 object-contain mb-4"
          />
          <h1 className="text-xl font-bold text-[#031603] text-center">
            Hyrje në Listën e Aplikuesve
          </h1>
          <p className="text-sm font-medium text-[#031603]/55 text-center mt-2">
            Shkruani fjalëkalimin për të vazhduar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Fjalëkalimi"
              required
              disabled={loading}
              className="w-full px-4 py-3 pr-12 text-sm font-medium text-[#031603] border border-[#031603] rounded-lg focus:outline-none focus:border-[#EF5B13] transition-colors disabled:opacity-60"
              style={{ backgroundColor: 'transparent' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#031603]/45 hover:text-black transition disabled:opacity-40"
              aria-label={showPassword ? 'Fshih fjalëkalimin' : 'Shfaq fjalëkalimin'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center font-semibold">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-bold py-3 rounded-lg border border-[#031603] text-[#031603] hover:text-black hover:bg-black/5 transition disabled:opacity-70 flex items-center justify-center gap-2.5 min-h-[48px]"
          >
            {loading ? (
              <>
                <span
                  className="h-5 w-5 animate-spin rounded-full border-2 border-[#031603]/20 border-t-[#031603]"
                  role="status"
                  aria-label="Duke u verifikuar"
                />
                <span className="text-sm">Duke u verifikuar...</span>
              </>
            ) : (
              'Hyr'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
