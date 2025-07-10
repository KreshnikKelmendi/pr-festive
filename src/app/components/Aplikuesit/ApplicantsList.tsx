'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Applicant {
  fullname: string;
  companyName: string;
  phoneNumber: string;
  companyEmail: string;
  selectedSpace: string;
  attachments: string[]; // [0] = Certifikata e ARBK, [1] = Dokumenti Identifikues
}

const ApplicantsList: React.FC = () => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spaceFilter, setSpaceFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplicants, setSelectedApplicants] = useState<Set<string>>(new Set());
  const [showSelectedModal, setShowSelectedModal] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState<string | null>(null);
  const [editingSpace, setEditingSpace] = useState('');
  const applicantsPerPage = 25;

  useEffect(() => {
    // Check if we have saved data in localStorage
    const savedApplicants = localStorage.getItem('applicants-data');
    
    if (savedApplicants) {
      try {
        const parsedData = JSON.parse(savedApplicants);
        setApplicants(parsedData);
        setLoading(false);
      } catch {
        // If parsing fails, fetch from original source
        fetchOriginalData();
      }
    } else {
      // No saved data, fetch from original source
      fetchOriginalData();
    }
  }, []);

  const fetchOriginalData = () => {
    fetch('/applicants-akull-n-vere-2025.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch applicants');
        return res.json();
      })
      .then((data) => {
        setApplicants(data);
        // Save to localStorage
        localStorage.setItem('applicants-data', JSON.stringify(data));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [spaceFilter, companyFilter, nameFilter]);



  const uniqueSpaces = Array.from(new Set(applicants.map(a => a.selectedSpace)));
  
  // Calculate count for each space
  const spaceCounts = uniqueSpaces.reduce((acc, space) => {
    acc[space] = applicants.filter(applicant => applicant.selectedSpace === space).length;
    return acc;
  }, {} as { [key: string]: number });

  const filteredApplicants = applicants.filter(applicant => {
    const matchesSpace = spaceFilter ? applicant.selectedSpace === spaceFilter : true;
    const matchesCompany = companyFilter ? applicant.companyName.toLowerCase().includes(companyFilter.toLowerCase()) : true;
    const matchesName = nameFilter ? applicant.fullname.toLowerCase().includes(nameFilter.toLowerCase()) : true;
    return matchesSpace && matchesCompany && matchesName;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredApplicants.length / applicantsPerPage);
  const paginatedApplicants = filteredApplicants.slice(
    (currentPage - 1) * applicantsPerPage,
    currentPage * applicantsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle checkbox selection
  const handleSelectApplicant = (applicant: Applicant) => {
    const applicantId = `${applicant.companyName}-${applicant.fullname}`;
    const newSelected = new Set(selectedApplicants);
    if (newSelected.has(applicantId)) {
      newSelected.delete(applicantId);
    } else {
      newSelected.add(applicantId);
    }
    setSelectedApplicants(newSelected);
  };

  // Handle select all on current page
  const handleSelectAllOnPage = () => {
    const newSelected = new Set(selectedApplicants);
    
    // Get all applicants on current page
    const currentPageApplicants = paginatedApplicants;
    
    const allSelectedOnPage = currentPageApplicants.every(applicant => {
      const applicantId = `${applicant.companyName}-${applicant.fullname}`;
      return newSelected.has(applicantId);
    });

    if (allSelectedOnPage) {
      // Deselect all on current page
      currentPageApplicants.forEach(applicant => {
        const applicantId = `${applicant.companyName}-${applicant.fullname}`;
        newSelected.delete(applicantId);
      });
    } else {
      // Select all on current page
      currentPageApplicants.forEach(applicant => {
        const applicantId = `${applicant.companyName}-${applicant.fullname}`;
        newSelected.add(applicantId);
      });
    }
    setSelectedApplicants(newSelected);
  };

  // Get selected applicants data
  const getSelectedApplicantsData = () => {
    return filteredApplicants.filter(applicant => {
      const applicantId = `${applicant.companyName}-${applicant.fullname}`;
      return selectedApplicants.has(applicantId);
    });
  };

  // Show selected businesses modal
  const handleShowSelected = () => {
    if (selectedCount > 0) {
      setShowSelectedModal(true);
    }
  };

  // Close selected businesses modal
  const handleCloseSelectedModal = () => {
    setShowSelectedModal(false);
  };

  // Handle space editing
  const handleEditSpace = (applicantId: string, currentSpace: string) => {
    setEditingApplicant(applicantId);
    setEditingSpace(currentSpace);
  };

  const handleSaveSpace = (applicantId: string) => {
    const [companyName, fullname] = applicantId.split('-');
    const updatedApplicants = applicants.map(applicant => {
      if (applicant.companyName === companyName && applicant.fullname === fullname) {
        return { ...applicant, selectedSpace: editingSpace };
      }
      return applicant;
    });
    setApplicants(updatedApplicants);
    // Save updated data to localStorage
    localStorage.setItem('applicants-data', JSON.stringify(updatedApplicants));
    setEditingApplicant(null);
    setEditingSpace('');
  };

  const handleCancelEdit = () => {
    setEditingApplicant(null);
    setEditingSpace('');
  };

  // Reset to original data
  const handleResetToOriginal = () => {
    if (confirm('A jeni të sigurt që dëshironi të rivendosni të dhënat në gjendjen fillestare? Kjo do të fshijë të gjitha ndryshimet.')) {
      localStorage.removeItem('applicants-data');
      fetchOriginalData();
    }
  };

  // Generate PDF for selected businesses
  const handleGenerateSelectedPdf = () => {
    const selectedData = getSelectedApplicantsData();
    
    if (selectedData.length === 0) {
      alert('Ju lutem zgjidhni të paktën një biznes për të krijuar listën!');
      return;
    }

    const doc = new jsPDF({ orientation: 'portrait' });
    
    // Clean white background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');
    
    // Simple title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(239, 91, 19);
    doc.text('Lista e Bizneseve të Përzgjedhura për AKULL N\'VERË', 105, 20, { align: 'center' });
    
    // Date
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Gjeneruar më: ${new Date().toLocaleDateString('sq-AL')}`, 105, 30, { align: 'center' });
    
    // Group businesses by space
    const groupedBySpace = selectedData.reduce((acc, applicant) => {
      const space = applicant.selectedSpace;
      if (!acc[space]) {
        acc[space] = [];
      }
      acc[space].push(applicant);
      return acc;
    }, {} as { [key: string]: typeof selectedData });
    
    // Sort spaces alphabetically
    const sortedSpaces = Object.keys(groupedBySpace).sort();
    
    let currentY = 40;
    let pageNumber = 1;
    
    // Table columns
    const columns = [
      '#',
      'Emri i Kompanisë',
      'Emri i Plotë',
      'Nr. Telefonit'
    ];
    
    sortedSpaces.forEach((space) => {
      const businessesInSpace = groupedBySpace[space];
      
      // Check if we need a new page
      if (currentY > 250) {
        doc.addPage();
        pageNumber++;
        currentY = 20;
      }
      
      // Space header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(239, 91, 19);
      doc.text(`Hapësira: ${space}`, 15, currentY);
      
      currentY += 10;
      
      // Table for this space
      const rows = businessesInSpace.map((applicant, idx) => [
        idx + 1,
        applicant.companyName,
        applicant.fullname,
        applicant.phoneNumber
      ]);
      
      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: currentY,
        styles: { 
          font: 'helvetica', 
          fontSize: 10,
          textColor: [50, 50, 50]
        },
        headStyles: { 
          fillColor: [239, 91, 19],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: { 
          fillColor: [248, 248, 248]
        },
        margin: { left: 15, right: 15 },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' }, // #
          1: { cellWidth: 80, fontStyle: 'bold' }, // Company name
          2: { cellWidth: 60 }, // Full name
          3: { cellWidth: 35, halign: 'center' }  // Phone
        },
        didDrawPage: function () {
          // Add page number
          doc.setFontSize(10);
          doc.setTextColor(150, 150, 150);
          doc.text(`Faqja ${pageNumber}`, 105, 290, { align: 'center' });
        }
      });
      
      // Update currentY for next space
      currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
    });
    
    doc.save('lista-bizneseve-perzgjedhura.pdf');
  };

  // Minimal Outlined Pagination Controls Component
  const MinimalPagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) => {
    // Helper to generate page numbers with ellipsis
    const getPages = () => {
      if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }
      const pages = [];
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
      return pages;
    };

    return (
      <div className="flex flex-wrap gap-3 mt-6 mb-6 justify-center items-center select-none">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`w-9 h-9 flex items-center justify-center rounded-md border-2 text-lg font-bold transition duration-150 ${currentPage === 1 ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed' : 'bg-white text-[#EF5B13] border-[#EF5B13] hover:bg-[#EF5B13] hover:text-white'}`}
          aria-label="Previous page"
        >
          <span className="inline-block align-middle">&#x2039;</span>
        </button>
        {getPages().map((page, idx) =>
          page === '...'
            ? <span key={idx} className="px-2 text-lg text-gray-400">...</span>
            : <button
                key={page}
                onClick={() => onPageChange(Number(page))}
                className={`w-9 h-9 flex items-center justify-center rounded-md border-2 text-base font-semibold transition duration-150 ${
                  page === currentPage
                    ? 'bg-[#EF5B13] text-white border-[#EF5B13] shadow-md'
                    : 'bg-white text-[#031603] border-[#EF5B13] hover:bg-[#EF5B13] hover:text-white'
                }`}
              >
                {page}
              </button>
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`w-9 h-9 flex items-center justify-center rounded-md border-2 text-lg font-bold transition duration-150 ${currentPage === totalPages ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed' : 'bg-white text-[#EF5B13] border-[#EF5B13] hover:bg-[#EF5B13] hover:text-white'}`}
          aria-label="Next page"
        >
          <span className="inline-block align-middle">&#x203A;</span>
        </button>
      </div>
    );
  };

  // PDF export handler
  const handleDownloadPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFont('helvetica', 'bold');
    doc.text('Lista e Aplikantëve për Akull n\'Verë 2025', 14, 14);
    // Table columns
    const columns = [
      '#',
      'Emri i Plotë',
      'Emri i Kompanisë',
      'Nr. Telefonit',
      'Email i Kompanisë',
      'Hapësira e Zgjedhur',
      'Certifikata e ARBK',
      'Dokumenti Identifikues',
    ];
    // Table rows
    const rows = filteredApplicants.map((applicant, idx) => [
      idx + 1,
      applicant.fullname,
      applicant.companyName,
      applicant.phoneNumber,
      applicant.companyEmail,
      applicant.selectedSpace,
      applicant.attachments && applicant.attachments[0] ? 'Po' : '—',
      applicant.attachments && applicant.attachments[1] ? 'Po' : '—',
    ]);
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 22,
      styles: { font: 'helvetica', fontSize: 10 },
      headStyles: { fillColor: [239, 91, 19] },
      alternateRowStyles: { fillColor: [255, 246, 237] },
      margin: { left: 14, right: 14 },
    });
    doc.save('aplikantet.pdf');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const selectedCount = selectedApplicants.size;
  const allSelectedOnPage = paginatedApplicants.length > 0 && paginatedApplicants.every(applicant => {
    const applicantId = `${applicant.companyName}-${applicant.fullname}`;
    return selectedApplicants.has(applicantId);
  });

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-orange-700 drop-shadow">Lista e Aplikuesve për Akull n&apos;Verë 2025</h1>
        <Link href="/" className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded shadow transition duration-200">⬅ Kthehu në Faqen Kryesore</Link>
      </div>
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Filtro Hapësirën:</label>
          <select
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={spaceFilter}
            onChange={e => setSpaceFilter(e.target.value)}
          >
            <option value="">Të gjitha ({applicants.length})</option>
            {uniqueSpaces.map(space => (
              <option key={space} value={space}>{space} ({spaceCounts[space]})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Kërko Kompaninë:</label>
          <input
            type="text"
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Kërko kompani..."
            value={companyFilter}
            onChange={e => setCompanyFilter(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Kërko Emrin:</label>
          <input
            type="text"
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Kërko emër..."
            value={nameFilter}
            onChange={e => setNameFilter(e.target.value)}
          />
        </div>
      </div>
      <div className="mb-4 flex items-center gap-4">
        <span className="inline-block bg-orange-100 text-orange-700 font-semibold px-4 py-2 rounded shadow-sm">
          Numri i aplikuesve: <span className="font-bold">{filteredApplicants.length}</span>
        </span>
        {selectedCount > 0 && (
          <button
            onClick={handleShowSelected}
            className="inline-block bg-green-100 text-green-700 font-semibold px-4 py-2 rounded shadow-sm hover:bg-green-200 transition-colors cursor-pointer"
          >
            Të zgjedhur: <span className="font-bold">{selectedCount}</span>
          </button>
        )}
      </div>
      {/* Pagination Controls (Top) */}
      {totalPages > 1 && (
        <MinimalPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
      {/* PDF Download Buttons */}
      <div className="mb-4 flex justify-end gap-4">
        <button
          onClick={handleGenerateSelectedPdf}
          disabled={selectedCount === 0}
          className={`font-bold py-2 px-6 rounded shadow transition duration-200 ${
            selectedCount === 0 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          KRIJO LISTËN PËRZGJEDHESE ({selectedCount})
        </button>
        <button
          onClick={handleDownloadPdf}
          className="bg-[#EF5B13] hover:bg-[#031603] text-white font-bold py-2 px-6 rounded shadow transition duration-200"
        >
          Shkarko të gjithë listën e aplikuesve (PDF)
        </button>
        <button
          onClick={handleResetToOriginal}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-6 rounded shadow transition duration-200"
        >
          Rivendos të Dhënat
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl shadow-2xl bg-gray-50 border border-orange-200">
        <table className="min-w-full text-sm text-gray-700">
          <thead>
            <tr className="bg-gradient-to-r from-orange-200 via-yellow-100 to-orange-100 text-orange-900">
              <th className="border px-3 py-4 text-center">
                <input
                  type="checkbox"
                  checked={allSelectedOnPage}
                  onChange={handleSelectAllOnPage}
                  className="w-5 h-5 text-orange-600 bg-white border-2 border-orange-500 rounded focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 cursor-pointer hover:bg-orange-50 transition-colors"
                />
              </th>
              <th className="border px-6 py-4 text-left">#</th>
              <th className="border px-6 py-4 text-left">Emri i Plotë</th>
              <th className="border px-6 py-4 text-left">Emri i Kompanisë</th>
              <th className="border px-6 py-4 text-left">Nr. Telefonit</th>
              <th className="border px-6 py-4 text-left">Email i Kompanisë</th>
              <th className="border px-6 py-4 text-left">Hapësira e Zgjedhur</th>
              <th className="border px-6 py-4 text-left">Certifikata e ARBK</th>
              <th className="border px-6 py-4 text-left">Dokumenti Identifikues</th>
            </tr>
          </thead>
          <tbody>
            {paginatedApplicants.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-400">Nuk u gjet asnjë aplikant me këto filtra.</td>
              </tr>
            ) : (
              paginatedApplicants.map((applicant, idx) => {
                const applicantId = `${applicant.companyName}-${applicant.fullname}`;
                return (
                  <tr key={idx} className="hover:bg-orange-50 transition border-b">
                    <td className="border px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedApplicants.has(applicantId)}
                        onChange={() => handleSelectApplicant(applicant)}
                        className="w-5 h-5 text-orange-600 bg-white border-2 border-orange-500 rounded focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 cursor-pointer hover:bg-orange-50 transition-colors"
                      />
                    </td>
                    <td className="border px-6 py-3 font-bold text-orange-600 text-lg">{(currentPage - 1) * applicantsPerPage + idx + 1}</td>
                    <td className="border px-6 py-3 font-semibold">{applicant.fullname}</td>
                    <td className="border px-6 py-3 font-bold bg-gray-100 rounded-l-md">{applicant.companyName}</td>
                    <td className="border px-6 py-3">{applicant.phoneNumber}</td>
                    <td className="border px-6 py-3 underline text-blue-600"><a href={`mailto:${applicant.companyEmail}`}>{applicant.companyEmail}</a></td>
                    <td className="border px-6 py-3">
                      {editingApplicant === applicantId ? (
                        <div className="flex items-center space-x-2">
                          <select
                            value={editingSpace}
                            onChange={(e) => setEditingSpace(e.target.value)}
                            className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                          >
                            {uniqueSpaces.map(space => (
                              <option key={space} value={space}>{space}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleSaveSpace(applicantId)}
                            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                          >
                            Ruaj
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                          >
                            Anulo
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span>{applicant.selectedSpace}</span>
                          <button
                            onClick={() => handleEditSpace(applicantId, applicant.selectedSpace)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs ml-2"
                          >
                            Ndrysho
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="border px-6 py-3">
                      {applicant.attachments && applicant.attachments[0] ? (
                        <a href={applicant.attachments[0]} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline font-medium">Shiko Certifikatën</a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="border px-6 py-3">
                      {applicant.attachments && applicant.attachments[1] ? (
                        <a href={applicant.attachments[1]} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline font-medium">Shiko Dokumentin</a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls (Bottom) */}
      {totalPages > 1 && (
        <div className="mb-16 mt-10">
          <MinimalPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}

      {/* Selected Businesses Modal */}
      {showSelectedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Bizneset e Zgjedhura ({selectedCount})</h2>
              <button
                onClick={handleCloseSelectedModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              {getSelectedApplicantsData().map((applicant, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800">{applicant.companyName}</h3>
                      <p className="text-gray-600">{applicant.fullname}</p>
                      <p className="text-gray-500 text-sm">{applicant.phoneNumber}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-orange-100 text-orange-700 text-sm font-semibold px-3 py-1 rounded">
                        {applicant.selectedSpace}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleCloseSelectedModal}
                className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
              >
                Mbyll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantsList; 