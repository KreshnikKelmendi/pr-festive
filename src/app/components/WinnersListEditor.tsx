'use client';

import React, { useMemo, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

export interface WinnerEntry {
  applicantId: string;
  fullName: string;
  companyName: string;
  companyEmail: string;
  phoneNumber: string;
}

interface ApplicantOption {
  _id: string;
  fullName: string;
  companyName: string;
  companyEmail: string;
  phoneNumber: string;
  selectedSpace: string;
}

interface WinnersListEditorProps {
  mode: 'create' | 'edit';
  listId?: string;
  space: string;
  displaySpace: string;
  initialWinners?: WinnerEntry[];
  applicants: ApplicantOption[];
  onClose: () => void;
  onSaved: () => void;
  onCreated?: (winners: WinnerEntry[]) => void;
}

export default function WinnersListEditor({
  mode,
  listId,
  space,
  displaySpace,
  initialWinners = [],
  applicants,
  onClose,
  onSaved,
  onCreated,
}: WinnersListEditorProps) {
  const [winners, setWinners] = useState<WinnerEntry[]>(initialWinners);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const spaceApplicants = useMemo(
    () => applicants.filter((a) => a.selectedSpace === space),
    [applicants, space]
  );

  const winnerIds = useMemo(() => new Set(winners.map((w) => w.applicantId)), [winners]);

  const filteredApplicants = useMemo(() => {
    const query = search.trim().toLowerCase();
    return spaceApplicants.filter((a) => {
      if (!query) return true;
      return (
        a.fullName.toLowerCase().includes(query) ||
        a.companyName.toLowerCase().includes(query)
      );
    });
  }, [spaceApplicants, search]);

  const handleToggle = (applicant: ApplicantOption) => {
    if (winnerIds.has(applicant._id)) {
      setWinners((prev) => prev.filter((w) => w.applicantId !== applicant._id));
    } else {
      setWinners((prev) => [
        ...prev,
        {
          applicantId: applicant._id,
          fullName: applicant.fullName,
          companyName: applicant.companyName,
          companyEmail: applicant.companyEmail,
          phoneNumber: applicant.phoneNumber,
        },
      ]);
    }
  };

  const handleRemove = (applicantId: string) => {
    setWinners((prev) => prev.filter((w) => w.applicantId !== applicantId));
  };

  const handleSave = async () => {
    if (winners.length === 0) {
      setError('Zgjidhni të paktën një aplikant.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (mode === 'create') {
        const response = await fetch('/api/winners-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ space, winners }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Gabim gjatë ruajtjes');
        onCreated?.(winners);
      } else {
        const response = await fetch(`/api/winners-list/${listId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ winners }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Gabim gjatë ruajtjes');
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gabim gjatë ruajtjes');
    } finally {
      setSaving(false);
    }
  };

  const title = mode === 'create' ? 'Krijo listën fituese' : 'Ndrysho listën fituese';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#031603]/40 backdrop-blur-[2px]">
      <div
        className="w-full max-w-2xl max-h-[88vh] flex flex-col rounded-xl border border-[#031603] shadow-2xl overflow-hidden"
        style={{ backgroundColor: '#ffedde' }}
      >
        <div className="px-5 py-3.5 border-b border-[#031603]/50 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-[#031603] tracking-tight">{title}</h2>
            <p className="text-[11px] font-semibold text-[#031603]/60 mt-0.5">{displaySpace}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[#031603]/40 hover:text-black hover:bg-black/5 transition text-lg leading-none"
            aria-label="Mbyll"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#031603]/50 mb-2">
              Fituesit e zgjedhur ({winners.length})
            </p>
            {winners.length === 0 ? (
              <p className="text-xs font-medium text-[#031603]/45 italic py-3 text-center border border-dashed border-[#031603]/50 rounded-lg">
                Zgjidhni aplikantët nga lista më poshtë.
              </p>
            ) : (
              <div className="border border-[#031603] rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#367a3b]/15 text-[#031603] text-left">
                      <th className="px-3 py-2 font-bold border-b border-[#031603] border-r border-[#031603]/50 w-8">#</th>
                      <th className="px-3 py-2 font-bold border-b border-[#031603] border-r border-[#031603]/50">Emri</th>
                      <th className="px-3 py-2 font-bold border-b border-[#031603] border-r border-[#031603]/50 hidden sm:table-cell">Kompania</th>
                      <th className="px-3 py-2 w-10 border-b border-[#031603]" />
                    </tr>
                  </thead>
                  <tbody>
                    {winners.map((winner, idx) => (
                      <tr key={winner.applicantId} className="border-t border-[#031603]/50 even:bg-[#031603]/[0.03]">
                        <td className="px-3 py-2 font-bold text-[#031603]/50">{idx + 1}</td>
                        <td className="px-3 py-2">
                          <p className="font-bold text-[#031603]">{winner.fullName}</p>
                          <p className="text-[10px] font-semibold text-[#031603]/50 sm:hidden">{winner.companyName}</p>
                        </td>
                        <td className="px-3 py-2 hidden sm:table-cell font-bold text-[#031603]">
                          {winner.companyName}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemove(winner.applicantId)}
                            className="text-[10px] font-semibold text-[#031603]/55 hover:text-black transition"
                          >
                            Hiq
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#031603]/50 mb-2">
              Zgjidh aplikantët
            </p>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kërko sipas emrit ose kompanisë..."
              className="w-full px-3 py-2 text-xs font-medium border border-[#031603] rounded-lg focus:outline-none focus:border-[#EF5B13] mb-2 text-[#031603]"
              style={{ backgroundColor: 'transparent' }}
            />
            <div className="max-h-48 overflow-y-auto border border-[#031603] rounded-lg divide-y divide-[#031603]/50">
              {filteredApplicants.length === 0 ? (
                <p className="text-xs font-medium text-[#031603]/45 p-3 text-center">
                  {search ? 'Nuk u gjet asnjë aplikant.' : 'Nuk ka aplikantë për këtë shesh.'}
                </p>
              ) : (
                filteredApplicants.map((applicant) => {
                  const selected = winnerIds.has(applicant._id);
                  return (
                    <button
                      key={applicant._id}
                      type="button"
                      onClick={() => handleToggle(applicant)}
                      className={`w-full text-left px-3 py-2.5 transition flex items-center gap-3 ${
                        selected ? 'bg-[#EF5B13]/10' : 'hover:bg-[#031603]/[0.04]'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 shrink-0 rounded border-2 flex items-center justify-center ${
                          selected
                            ? 'border-[#031603] bg-[#EF5B13]/20'
                            : 'border-[#031603]'
                        }`}
                      >
                        {selected && (
                          <svg className="w-2.5 h-2.5 text-[#031603]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#031603] truncate">{applicant.fullName}</p>
                        <p className="text-[10px] font-semibold text-[#031603]/50 truncate">{applicant.companyName}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {error && (
            <p className="text-xs font-semibold text-red-600 border border-red-200/60 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div className="px-5 py-3 border-t border-[#031603]/50 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-3 py-1.5 text-[11px] font-semibold text-[#031603]/60 hover:text-black transition disabled:opacity-50"
          >
            Anulo
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 text-[11px] font-bold bg-[#367a3b]/20 text-[#031603] border border-[#031603] rounded-md hover:text-black hover:bg-black/5 transition disabled:opacity-60 inline-flex items-center gap-1.5"
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" />
                Duke ruajtur...
              </>
            ) : (
              mode === 'create' ? 'Ruaj listën' : 'Ruaj ndryshimet'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
