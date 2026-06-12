'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import LoadingSpinner from './LoadingSpinner';
import DocumentViewer from './DocumentViewer';
import WinnersListEditor, { WinnerEntry } from './WinnersListEditor';
import ViewIcon from './icons/ViewIcon';
import { WINNER_SPACES, spaceMapping } from '@/lib/winners-list';

const spaces = [...WINNER_SPACES];

interface Applicant {
  _id: string;
  fullName: string;
  companyName: string;
  companyEmail: string;
  phoneNumber: string;
  selectedSpace: string;
  businessCertificateViewUrl: string;
  businessCertificateName: string;
  personalDocumentName: string;
  createdAt: string;
}

interface SavedWinnersList {
  _id: string;
  space: string;
  displaySpace: string;
  winners: {
    applicantId: string;
    fullName: string;
    companyName: string;
    companyEmail: string;
    phoneNumber: string;
  }[];
  createdAt: string;
  updatedAt?: string;
}

interface ListaDashboardProps {
  onLogout: () => void;
}

export default function ListaDashboard({ onLogout }: ListaDashboardProps) {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [savedLists, setSavedLists] = useState<SavedWinnersList[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingList, setEditingList] = useState<SavedWinnersList | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [searchByName, setSearchByName] = useState('');
  const [searchByCompany, setSearchByCompany] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [creatingForSpace, setCreatingForSpace] = useState<string | null>(null);
  const [viewingDocument, setViewingDocument] = useState<{
    fileName: string;
    applicantId: string;
    docType: 'business' | 'personal';
  } | null>(null);
  const applicantsPerPage = 15;

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [applicantsRes, listsRes] = await Promise.all([
        fetch('/api/applicants'),
        fetch('/api/winners-list'),
      ]);

      if (!applicantsRes.ok) throw new Error('Gabim gjatë ngarkimit të aplikantëve');

      const applicantsData = await applicantsRes.json();
      setApplicants(applicantsData);

      if (listsRes.ok) {
        const listsData = await listsRes.json();
        setSavedLists(listsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gabim gjatë ngarkimit');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, searchByName, searchByCompany]);

  const getDownloadUrl = (applicantId: string, docType: 'business' | 'personal') =>
    `/api/download?id=${applicantId}&type=${docType}`;

  const spaceCounts = useMemo(() => ({
    'Sheshi Skënderbeu': applicants.filter((a) => a.selectedSpace === 'Sheshi Skënderbeu').length,
    'Sheshi Zahir Pajaziti': applicants.filter((a) => a.selectedSpace === 'Sheshi Zahir Pajaziti').length,
    'Wonderland (me mjete motorike)': applicants.filter((a) => a.selectedSpace === 'Wonderland (me mjete motorike)').length,
  }), [applicants]);

  const filteredApplicants = useMemo(() => {
    let filtered = [...applicants];
    if (selectedFilter) filtered = filtered.filter((a) => a.selectedSpace === selectedFilter);
    if (searchByName.trim()) {
      filtered = filtered.filter((a) =>
        a.fullName.toLowerCase().includes(searchByName.toLowerCase().trim())
      );
    }
    if (searchByCompany.trim()) {
      filtered = filtered.filter((a) =>
        a.companyName.toLowerCase().includes(searchByCompany.toLowerCase().trim())
      );
    }
    return filtered;
  }, [applicants, selectedFilter, searchByName, searchByCompany]);

  const totalPages = Math.ceil(filteredApplicants.length / applicantsPerPage);
  const paginatedApplicants = filteredApplicants.slice(
    (currentPage - 1) * applicantsPerPage,
    currentPage * applicantsPerPage
  );

  const generateWinnersPDF = (targetSpace: string, winners: SavedWinnersList['winners']) => {
    const doc = new jsPDF({ orientation: 'portrait' });
    const displaySpace = spaceMapping[targetSpace] || targetSpace;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(239, 91, 19);
    doc.text('LISTA FITUESE', 105, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(54, 122, 59);
    doc.text(`Sheshi: ${displaySpace}`, 105, 30, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Gjeneruar më: ${new Date().toLocaleDateString('sq-AL', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      105,
      40,
      { align: 'center' }
    );

    autoTable(doc, {
      head: [['#', 'Emri i Plotë', 'Emri i Kompanisë', 'Email', 'Telefoni']],
      body: winners.map((w, idx) => [
        idx + 1,
        w.fullName,
        w.companyName,
        w.companyEmail,
        w.phoneNumber,
      ]),
      startY: 50,
      styles: { font: 'helvetica', fontSize: 9, textColor: [50, 50, 50] },
      headStyles: { fillColor: [239, 91, 19], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      margin: { left: 15, right: 15 },
    });

    doc.save(`lista-fituese-${displaySpace.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  const handleListCreated = (targetSpace: string, winners: WinnerEntry[]) => {
    generateWinnersPDF(targetSpace, winners);
  };

  const refreshSavedLists = async () => {
    const listsRes = await fetch('/api/winners-list');
    if (listsRes.ok) setSavedLists(await listsRes.json());
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm('A jeni i sigurt që dëshironi ta fshini këtë listë fituese?')) return;

    setDeletingId(listId);
    try {
      const response = await fetch(`/api/winners-list/${listId}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gabim gjatë fshirjes');
      }
      await refreshSavedLists();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gabim gjatë fshirjes');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/lista-auth', { method: 'DELETE' });
    onLogout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner label="Duke ngarkuar aplikantët..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-7xl p-4 sm:p-6 md:p-8 mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <Image src="/assets/logo-2025.png" alt="Logo" width={80} height={80} className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
            <h1 className="text-2xl sm:text-3xl font-bold text-[#031603] font-aerialpro">
              Lista e Aplikuesve për Shtëpizë në Verë n&apos;Dimën
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 font-aerialpro">
            <span>Sheshi Skënderbeu: <strong className="text-[#EF5B13]">{spaceCounts['Sheshi Skënderbeu']}</strong></span>
            <span>Sheshi Zahir Pajaziti: <strong className="text-[#367a3b]">{spaceCounts['Sheshi Zahir Pajaziti']}</strong></span>
            <span>Wonderland: <strong className="text-blue-600">{spaceCounts['Wonderland (me mjete motorike)']}</strong></span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 text-[11px] font-bold text-[#031603] border border-[#031603] rounded-md hover:text-black hover:bg-black/5 transition self-start"
        >
          Dil
        </button>
      </div>

      {/* Winners list creation */}
      <div className="mb-6 border border-[#031603] rounded-lg p-4">
        <p className="text-sm font-bold text-[#031603] mb-3">Krijo listën fituese</p>
        <div className="flex flex-wrap gap-2">
          {spaces.map((space) => {
            const displaySpace = spaceMapping[space] || space;
            const count = applicants.filter((a) => a.selectedSpace === space).length;
            return (
              <button
                key={space}
                type="button"
                onClick={() => setCreatingForSpace(space)}
                className="px-4 py-2 text-sm font-bold text-[#031603] border border-[#031603] rounded-md hover:text-black hover:bg-black/5 transition"
              >
                {displaySpace}
                <span className="text-[#031603]/60 font-semibold"> ({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Saved winners lists */}
      {savedLists.length > 0 && (
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#031603]/40 mb-2.5">
            Listat fituese të ruajtura
          </p>
          <div className="divide-y divide-[#031603]/50 border border-[#031603] rounded-lg overflow-hidden">
            {savedLists.map((list) => (
              <div
                key={list._id}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-[#031603]/[0.02] transition"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#031603] truncate">{list.displaySpace}</p>
                  <p className="text-[11px] text-[#031603]/45 mt-0.5">
                    {list.winners.length} fitues
                    <span className="mx-1.5 text-[#031603]/20">·</span>
                    {new Date(list.createdAt).toLocaleDateString('sq-AL')}
                    {list.updatedAt && (
                      <>
                        <span className="mx-1.5 text-[#031603]/20">·</span>
                        përditësuar {new Date(list.updatedAt).toLocaleDateString('sq-AL')}
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingList(list)}
                    className="px-2 py-1 text-[10px] font-semibold text-[#031603]/55 hover:text-black transition"
                  >
                    Ndrysho
                  </button>
                  <span className="text-[#031603]/15 mx-0.5">|</span>
                  <button
                    type="button"
                    onClick={() => generateWinnersPDF(list.space, list.winners)}
                    className="px-2 py-1 text-[10px] font-semibold text-[#031603]/55 hover:text-black transition"
                  >
                    Shkarko PDF
                  </button>
                  <span className="text-[#031603]/15 mx-0.5">|</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteList(list._id)}
                    disabled={deletingId === list._id}
                    className="px-2 py-1 text-[10px] font-semibold text-[#031603]/55 hover:text-black transition disabled:opacity-40"
                  >
                    {deletingId === list._id ? '...' : 'Fshi'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {creatingForSpace && (
        <WinnersListEditor
          mode="create"
          space={creatingForSpace}
          displaySpace={spaceMapping[creatingForSpace] || creatingForSpace}
          applicants={applicants}
          onClose={() => setCreatingForSpace(null)}
          onSaved={refreshSavedLists}
          onCreated={(winners) => handleListCreated(creatingForSpace, winners)}
        />
      )}

      {editingList && (
        <WinnersListEditor
          mode="edit"
          listId={editingList._id}
          space={editingList.space}
          displaySpace={editingList.displaySpace}
          initialWinners={editingList.winners}
          applicants={applicants}
          onClose={() => setEditingList(null)}
          onSaved={refreshSavedLists}
        />
      )}

      {/* Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" value={searchByName} onChange={(e) => setSearchByName(e.target.value)} placeholder="Kërko sipas emrit..." className="flex-1 px-4 py-2 text-sm font-medium text-[#031603] border border-[#031603] rounded focus:outline-none focus:border-[#EF5B13]" />
          <input type="text" value={searchByCompany} onChange={(e) => setSearchByCompany(e.target.value)} placeholder="Kërko sipas kompanisë..." className="flex-1 px-4 py-2 text-sm font-medium text-[#031603] border border-[#031603] rounded focus:outline-none focus:border-[#EF5B13]" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button onClick={() => setSelectedFilter('')} className={`px-3 py-1.5 rounded-lg text-sm font-bold transition ${selectedFilter === '' ? 'bg-[#EF5B13]/15 text-black border-2 border-[#031603]' : 'text-[#031603] border border-[#031603] hover:text-black hover:bg-black/5'}`}>Të gjitha</button>
          {spaces.map((space) => (
            <button key={space} onClick={() => setSelectedFilter(space)} className={`px-3 py-1.5 rounded-lg text-sm font-bold transition ${selectedFilter === space ? 'bg-[#EF5B13]/15 text-black border-2 border-[#031603]' : 'text-[#031603] border border-[#031603] hover:text-black hover:bg-black/5'}`}>
              {space === 'Wonderland (me mjete motorike)' ? 'Wonderland' : space}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 text-sm text-gray-600">
        Rezultatet: <strong className="text-[#EF5B13]">{filteredApplicants.length}</strong>
      </p>

      <div className="overflow-x-auto rounded-lg border border-[#031603]">
        <table className="min-w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#367a3b]/15 text-[#031603]">
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider border-b-2 border-[#031603] border-r border-[#031603]/50 w-10">#</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider border-b-2 border-[#031603] border-r border-[#031603]/50">Emri i Plotë</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider border-b-2 border-[#031603] border-r border-[#031603]/50">Kompania</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider border-b-2 border-[#031603] border-r border-[#031603]/50 hidden md:table-cell">Email</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider border-b-2 border-[#031603] border-r border-[#031603]/50 hidden sm:table-cell">Telefoni</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider border-b-2 border-[#031603] border-r border-[#031603]/50">Hapësira</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider border-b-2 border-[#031603] border-r border-[#031603]/50">Dokumentet</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider border-b-2 border-[#031603]">Data e aplikimit</th>
            </tr>
          </thead>
          <tbody>
            {paginatedApplicants.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-[#031603]/45 text-sm font-medium">
                  Nuk ka aplikantë për të shfaqur.
                </td>
              </tr>
            ) : (
              paginatedApplicants.map((applicant, idx) => {
                const displaySpace = spaceMapping[applicant.selectedSpace] || applicant.selectedSpace;
                const rowNum = (currentPage - 1) * applicantsPerPage + idx + 1;
                return (
                  <tr
                    key={applicant._id}
                    className="border-b border-[#031603]/50 last:border-b-0 transition-colors hover:bg-[#031603]/[0.03] even:bg-[#031603]/[0.02]"
                  >
                    <td className="px-4 py-3.5 text-[#031603]/50 text-xs font-bold border-r border-[#031603]/50">{rowNum}</td>
                    <td className="px-4 py-3.5 text-[#031603] font-bold border-r border-[#031603]/50">{applicant.fullName}</td>
                    <td className="px-4 py-3.5 font-bold text-[#031603] border-r border-[#031603]/50">{applicant.companyName}</td>
                    <td className="px-4 py-3.5 text-[#031603] font-semibold text-xs hidden md:table-cell border-r border-[#031603]/50">{applicant.companyEmail}</td>
                    <td className="px-4 py-3.5 text-[#031603] font-semibold text-xs hidden sm:table-cell border-r border-[#031603]/50">{applicant.phoneNumber}</td>
                    <td className="px-4 py-3.5 border-r border-[#031603]/50">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#EF5B13]/10 text-[#031603] border border-[#031603] whitespace-nowrap">
                        {displaySpace}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 border-r border-[#031603]/50">
                      <div className="flex flex-col gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingDocument({ fileName: applicant.businessCertificateName, applicantId: applicant._id, docType: 'business' })}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#031603]/60 hover:text-black transition group/doc"
                        >
                          <span className="p-1 rounded group-hover/doc:bg-black/5 transition">
                            <ViewIcon className="w-3.5 h-3.5" />
                          </span>
                          Certifikata
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewingDocument({ fileName: applicant.personalDocumentName, applicantId: applicant._id, docType: 'personal' })}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#031603]/60 hover:text-black transition group/doc"
                        >
                          <span className="p-1 rounded group-hover/doc:bg-black/5 transition">
                            <ViewIcon className="w-3.5 h-3.5" />
                          </span>
                          Dokumenti
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[#031603] font-semibold text-xs whitespace-nowrap">
                      {new Date(applicant.createdAt).toLocaleDateString('sq-AL')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-3 mt-6 justify-center">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-[11px] font-bold text-[#031603] border border-[#031603] rounded-md hover:text-black hover:bg-black/5 transition disabled:opacity-40"
          >
            Mbrapa
          </button>
          <span className="text-[11px] text-[#031603]/50">
            Faqja <span className="font-semibold text-[#031603]">{currentPage}</span> nga {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-[11px] font-bold text-[#031603] border border-[#031603] rounded-md hover:text-black hover:bg-black/5 transition disabled:opacity-40"
          >
            Para
          </button>
        </div>
      )}

      {viewingDocument && (
        <DocumentViewer
          applicantId={viewingDocument.applicantId}
          docType={viewingDocument.docType}
          fileName={viewingDocument.fileName}
          downloadUrl={getDownloadUrl(viewingDocument.applicantId, viewingDocument.docType)}
          onClose={() => setViewingDocument(null)}
        />
      )}
    </div>
  );
}
