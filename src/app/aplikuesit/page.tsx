"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { mockApplicants, spaces } from './data/data';

export default function AplikuesitPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [searchByName, setSearchByName] = useState<string>('');
  const [searchByCompany, setSearchByCompany] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewingDocument, setViewingDocument] = useState<{
    url: string;
    filename: string;
  } | null>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const applicantsPerPage = 15;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };

    if (isSortDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortDropdownOpen]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, searchByName, searchByCompany]);

  const spaceCounts = useMemo(() => {
    return {
      'Sheshi Skënderbeu': mockApplicants.filter(a => a.selectedSpace === 'Sheshi Skënderbeu').length,
      'Sheshi Zahir Pajaziti': mockApplicants.filter(a => a.selectedSpace === 'Sheshi Zahir Pajaziti').length,
      'Wonderland (me mjete motorike)': mockApplicants.filter(a => a.selectedSpace === 'Wonderland (me mjete motorike)').length,
    };
  }, []);

  const filteredApplicants = useMemo(() => {
    let filtered = [...mockApplicants];

    if (selectedFilter) {
      filtered = filtered.filter(applicant => applicant.selectedSpace === selectedFilter);
    }

    if (searchByName.trim()) {
      filtered = filtered.filter(applicant =>
        applicant.fullName.toLowerCase().includes(searchByName.toLowerCase().trim())
      );
    }

    if (searchByCompany.trim()) {
      filtered = filtered.filter(applicant =>
        applicant.companyName.toLowerCase().includes(searchByCompany.toLowerCase().trim())
      );
    }

    return filtered.sort((a, b) => {
      const idA = parseInt(a.id, 10);
      const idB = parseInt(b.id, 10);
      return sortOrder === 'asc' ? idA - idB : idB - idA;
    });
  }, [selectedFilter, searchByName, searchByCompany, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredApplicants.length / applicantsPerPage);
  const paginatedApplicants = filteredApplicants.slice(
    (currentPage - 1) * applicantsPerPage,
    currentPage * applicantsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getFilenameFromPath = (path: string | undefined): string => {
    if (!path) return '';
    const parts = path.split('/');
    return parts[parts.length - 1] || '';
  };

  const handleViewDocument = (documentUrl: string | undefined) => {
    if (documentUrl) {
      const filename = getFilenameFromPath(documentUrl);
      setViewingDocument({ url: documentUrl, filename });
    }
  };

  const closeDocumentViewer = () => {
    setViewingDocument(null);
  };

  const handleSortChange = (order: 'asc' | 'desc') => {
    setSortOrder(order);
    setIsSortDropdownOpen(false);
  };

  const getSortLabel = () => {
    return sortOrder === 'asc' ? 'I pari te i fundit' : 'Më të rejat';
  };

  // Pagination Component
  const Pagination = () => {
    const getPages = () => {
      const pages: (number | string)[] = [];
      
      if (totalPages <= 5) {
        // Show all pages if 5 or less
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Always show first page
        pages.push(1);
        
        if (currentPage <= 3) {
          // Near the start
          pages.push(2, 3, 4, '...', totalPages);
        } else if (currentPage >= totalPages - 2) {
          // Near the end
          pages.push('...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
          // In the middle
          pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
        }
      }
      
      return pages;
    };

    if (totalPages <= 1) return null;

    return (
      <div className="flex gap-1 mt-4 mb-4 justify-center items-center">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`w-7 h-7 flex items-center justify-center rounded border border-gray-700 text-xs transition ${
            currentPage === 1 
              ? 'bg-transparent text-gray-400 border-gray-400 cursor-not-allowed' 
              : 'bg-transparent text-gray-700 hover:border-gray-600'
          }`}
          aria-label="Previous page"
        >
          <span>&#x2039;</span>
        </button>
        {getPages().map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-xs text-gray-400">...</span>
          ) : (
            <button
              key={`page-${page}-${idx}`}
              onClick={() => handlePageChange(Number(page))}
              className={`w-7 h-7 flex items-center justify-center rounded border border-gray-700 text-xs transition ${
                page === currentPage
                  ? 'bg-gray-700 text-white'
                  : 'bg-transparent text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`w-7 h-7 flex items-center justify-center rounded border border-gray-700 text-xs transition ${
            currentPage === totalPages 
              ? 'bg-transparent text-gray-400 border-gray-400 cursor-not-allowed' 
              : 'bg-transparent text-gray-700 hover:border-gray-600'
          }`}
          aria-label="Next page"
        >
          <span>&#x203A;</span>
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen max-w-7xl p-4 sm:p-6 md:p-8 mx-auto">
      <div className="w-full">
        {/* Simple Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-4 mb-3">
            <Image 
              src="/assets/logo-2025.png" 
              alt="Logo" 
              width={80}
              height={80}
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-[#031603] font-aerialpro">Lista e Aplikuesve për Shtëpizë në Verë n&apos;Dimën</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 font-aerialpro">
            <span className="font-aerialpro">Sheshi Skënderbeu: <strong className="text-[#EF5B13] font-aerialpro">{spaceCounts['Sheshi Skënderbeu']}</strong></span>
            <span className="font-aerialpro">Sheshi Zahir Pajaziti: <strong className="text-[#367a3b] font-aerialpro">{spaceCounts['Sheshi Zahir Pajaziti']}</strong></span>
            <span className="font-aerialpro">Wonderland: <strong className="text-blue-600 font-aerialpro">{spaceCounts['Wonderland (me mjete motorike)']}</strong></span>
          </div>
        </div>

        {/* Simple Search and Filters */}
        <div className="mb-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchByName}
              onChange={(e) => setSearchByName(e.target.value)}
              placeholder="Kërko sipas emrit..."
              className="flex-1 w-full sm:min-w-[200px] px-3 sm:px-4 py-2 text-sm border border-gray-700 rounded focus:outline-none focus:border-[#EF5B13] font-aerialpro"
            />
            <input
              type="text"
              value={searchByCompany}
              onChange={(e) => setSearchByCompany(e.target.value)}
              placeholder="Kërko sipas kompanisë..."
              className="flex-1 w-full sm:min-w-[200px] px-3 sm:px-4 py-2 text-sm border border-gray-700 rounded focus:outline-none focus:border-[#EF5B13] font-aerialpro"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              onClick={() => setSelectedFilter('')}
              className={`w-full px-3 py-1 rounded text-sm font-aerialpro ${
                selectedFilter === '' ? 'bg-[#EF5B13] text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Të gjitha
            </button>
            {spaces.map((space) => (
              <button
                key={space}
                onClick={() => setSelectedFilter(space)}
                className={`w-full px-3 py-1 rounded text-sm font-aerialpro ${
                  selectedFilter === space ? 'bg-[#EF5B13] text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {space === 'Wonderland (me mjete motorike)' ? 'Wonderland' : space}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count and Sort Button */}
        <div className="mb-3 flex justify-between items-center gap-3">
          <div className="text-xs sm:text-sm text-gray-600 font-aerialpro">
            Rezultatet: <span className="font-bold text-[#EF5B13]">{filteredApplicants.length}</span>
            {totalPages > 1 && (
              <span className="ml-2">
                (Faqja <span className="font-bold">{currentPage}</span> nga <span className="font-bold">{totalPages}</span>)
              </span>
            )}
          </div>
          <div className="relative flex-shrink-0" ref={sortDropdownRef}>
            <button
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className="px-3 py-1.5 bg-transparent border border-gray-700 text-gray-700 rounded hover:border-gray-600 font-aerialpro text-xs whitespace-nowrap flex items-center gap-1.5"
            >
              <span>{getSortLabel()}</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isSortDropdownOpen && (
              <div className="absolute right-0 mt-1 w-auto bg-white border border-gray-200 rounded shadow-lg z-20">
                <button
                  onClick={() => handleSortChange('asc')}
                  className="block w-full px-3 py-1.5 text-left hover:bg-gray-100 font-aerialpro text-xs"
                >
                  I pari te i fundit
                </button>
                <button
                  onClick={() => handleSortChange('desc')}
                  className="block w-full px-3 py-1.5 text-left hover:bg-gray-100 font-aerialpro text-xs border-t"
                >
                  Më të rejat
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pagination Top */}
        {totalPages > 1 && <Pagination />}

        {/* Mobile Card View */}
        <div className="md:hidden space-y-0">
          {paginatedApplicants.length > 0 ? (
            paginatedApplicants.map((applicant) => (
              <div key={applicant.id} className="border-b border-gray-300 p-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#EF5B13] font-aerialpro mb-1">ID: {applicant.id}</span>
                  <h3 className="text-base font-bold text-[#367a3b] font-aerialpro tracking-[0.5px] mb-2">
                    {applicant.fullName}
                  </h3>
                  <p className="text-sm text-gray-600 font-aerialpro mb-1">
                    {applicant.companyName}
                  </p>
                  <p className="text-sm text-[#367a3b] font-aerialpro">
                    {applicant.selectedSpace === 'Wonderland (me mjete motorike)' ? 'Wonderland' : applicant.selectedSpace}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="border-b border-gray-300 p-8 text-center text-gray-500 font-aerialpro">
              Nuk u gjetën aplikantë
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block border border-gray-400 p-1 sm:p-2 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm text-[#031603] font-aerialpro border-b">ID</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm text-[#031603] font-aerialpro border-b">Emri</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm text-[#031603] font-aerialpro border-b">Kompania</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm text-[#031603] font-aerialpro border-b hidden lg:table-cell">Telefoni</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm text-[#031603] font-aerialpro border-b hidden lg:table-cell">Email</th>
                  <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm text-[#031603] font-aerialpro border-b">Hapësira</th>
                  <th className="px-2 sm:px-4 py-2 text-center text-xs sm:text-sm text-[#031603] font-aerialpro border-b">Dokumentet</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApplicants.length > 0 ? (
                  paginatedApplicants.map((applicant) => (
                    <tr key={applicant.id} className="border-b hover:bg-gray-50">
                      <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold text-[#EF5B13] font-aerialpro">{applicant.id}</td>
                      <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-[#367a3b] font-aerialpro font-bold tracking-[0.5px]">
                        {applicant.fullName}
                      </td>
                      <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-[#031603] font-aerialpro">{applicant.companyName}</td>
                      <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-[#031603] font-aerialpro hidden lg:table-cell">{applicant.phoneNumber}</td>
                      <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-[#031603] font-aerialpro hidden lg:table-cell break-all">{applicant.companyEmail}</td>
                      <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-[#367a3b] font-aerialpro">
                        {applicant.selectedSpace === 'Wonderland (me mjete motorike)' ? 'Wonderland' : applicant.selectedSpace}
                      </td>
                      <td className="px-2 sm:px-4 py-2 text-center">
                        <div className="flex justify-center gap-1 sm:gap-2 flex-wrap">
                          {applicant.businessCertificate && (
                            <button
                              onClick={() => handleViewDocument(applicant.businessCertificate)}
                              className="text-[10px] sm:text-xs px-2 py-1 bg-[#367a3b] text-white rounded hover:bg-[#2d5f32] font-aerialpro"
                            >
                              Cert
                            </button>
                          )}
                          {applicant.personalDocument && (
                            <button
                              onClick={() => handleViewDocument(applicant.personalDocument)}
                              className="text-[10px] sm:text-xs px-2 py-1 bg-[#EF5B13] text-white rounded hover:bg-[#c94a0f] font-aerialpro"
                            >
                              ID
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 font-aerialpro">
                      Nuk u gjetën aplikantë
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Bottom */}
        {totalPages > 1 && <Pagination />}
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={closeDocumentViewer}
        >
          <div 
            className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 sm:p-4 border-b">
              <h3 className="font-bold text-[#031603] font-aerialpro text-sm sm:text-base truncate pr-2">{viewingDocument.filename}</h3>
              <button
                onClick={closeDocumentViewer}
                className="p-2 hover:bg-gray-100 rounded flex-shrink-0"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2 sm:p-4">
              <iframe
                src={viewingDocument.url}
                className="w-full h-full min-h-[400px] sm:min-h-[600px] border-0"
                title={viewingDocument.filename}
              />
            </div>
            <div className="p-3 sm:p-4 border-t flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <a
                href={viewingDocument.url}
                download={viewingDocument.filename}
                className="px-4 py-2 bg-[#367a3b] text-white rounded hover:bg-[#2d5f32] font-aerialpro text-sm sm:text-base text-center"
              >
                Shkarko
              </a>
              <button
                onClick={closeDocumentViewer}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-aerialpro text-sm sm:text-base"
              >
                Mbyll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
