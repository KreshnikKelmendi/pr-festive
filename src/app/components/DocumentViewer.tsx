'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import LoadingSpinner from './LoadingSpinner';

interface DocumentViewerProps {
  applicantId: string;
  docType: 'business' | 'personal';
  fileName: string;
  onClose: () => void;
  downloadUrl: string;
}

function isPdf(fileName: string): boolean {
  return fileName.toLowerCase().endsWith('.pdf');
}

function isImage(fileName: string): boolean {
  return /\.(jpe?g|png)$/i.test(fileName);
}

export default function DocumentViewer({
  applicantId,
  docType,
  fileName,
  onClose,
  downloadUrl,
}: DocumentViewerProps) {
  const [loading, setLoading] = useState(true);
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [pageUrls, setPageUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const apiViewUrl = `/api/view?id=${applicantId}&type=${docType}`;

  useEffect(() => {
    let cancelled = false;

    async function loadDocument() {
      setLoading(true);
      setError(null);
      setViewUrl(null);
      setPageUrls([]);

      try {
        const viewResponse = await fetch(apiViewUrl);
        const contentType = viewResponse.headers.get('content-type') || '';

        if (!cancelled && viewResponse.ok && !contentType.includes('application/json')) {
          setViewUrl(apiViewUrl);
          setLoading(false);
          return;
        }

        const pagesResponse = await fetch(
          `/api/document-pages?id=${applicantId}&type=${docType}`
        );

        if (!pagesResponse.ok) {
          throw new Error('Dokumenti nuk mund të hapet.');
        }

        const data = await pagesResponse.json();
        if (!cancelled) {
          setPageUrls(data.pages || []);
          if (!data.pages?.length) {
            throw new Error('Dokumenti nuk ka faqe për të shfaqur.');
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Gabim gjatë ngarkimit.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDocument();

    return () => {
      cancelled = true;
    };
  }, [applicantId, docType, apiViewUrl]);

  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 sm:p-4 border-b">
          <h3 className="font-bold text-[#031603] text-sm sm:text-base truncate pr-2">
            {fileName}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            aria-label="Mbyll"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-2 sm:p-4 bg-gray-50 min-h-[300px]">
          {loading && (
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner label="Duke ngarkuar dokumentin..." size="lg" />
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center justify-center min-h-[400px]">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {!loading && !error && viewUrl && isPdf(fileName) && (
            <iframe
              src={viewUrl}
              className="w-full min-h-[500px] sm:min-h-[650px] border-0 bg-white rounded shadow-sm"
              title={fileName}
            />
          )}

          {!loading && !error && viewUrl && isImage(fileName) && (
            <div className="flex justify-center">
              <Image
                src={viewUrl}
                alt={fileName}
                width={1200}
                height={1600}
                unoptimized
                className="max-w-full max-h-[70vh] h-auto w-auto mx-auto shadow-md rounded"
              />
            </div>
          )}

          {!loading && !error && !viewUrl && pageUrls.length > 0 && (
            <div className="space-y-4 max-w-3xl mx-auto">
              {pageUrls.length > 1 && (
                <p className="text-center text-sm text-gray-500 font-medium">
                  {pageUrls.length} faqe
                </p>
              )}
              {pageUrls.map((url, index) => (
                <div key={url} className="bg-white rounded shadow-sm overflow-hidden">
                  {pageUrls.length > 1 && (
                    <p className="text-xs text-gray-400 px-3 py-2 border-b bg-gray-50">
                      Faqja {index + 1}
                    </p>
                  )}
                  <Image
                    src={url}
                    alt={`${fileName} - faqja ${index + 1}`}
                    width={1200}
                    height={1600}
                    unoptimized
                    className="w-full h-auto"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 border-t flex flex-col sm:flex-row justify-end gap-2">
          <a
            href={downloadUrl}
            download={fileName}
            className="px-4 py-2 bg-[#367a3b] text-white rounded hover:bg-[#2d5f32] text-center text-sm transition-colors"
          >
            Shkarko
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm transition-colors"
          >
            Mbyll
          </button>
        </div>
      </div>
    </div>
  );
}
