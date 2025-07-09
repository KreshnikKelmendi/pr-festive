import React, { useEffect, useState } from 'react';

interface Applicant {
  fullname: string;
  companyName: string;
  phoneNumber: string;
  companyEmail: string;
  selectedSpace: string;
  attachments: string[];
}

const ApplicantsList: React.FC = () => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/applicants-akull-n-vere-2025.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch applicants');
        return res.json();
      })
      .then((data) => {
        setApplicants(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Lista e Aplikantëve për Akull n&apos;Verë 2025</h1>
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Emri i Plotë</th>
            <th className="border px-4 py-2">Emri i Kompanisë</th>
            <th className="border px-4 py-2">Nr. Telefonit</th>
            <th className="border px-4 py-2">Email i Kompanisë</th>
            <th className="border px-4 py-2">Hapësira e Zgjedhur</th>
            <th className="border px-4 py-2">Attachmentet</th>
          </tr>
        </thead>
        <tbody>
          {applicants.map((applicant, idx) => (
            <tr key={idx}>
              <td className="border px-4 py-2">{applicant.fullname}</td>
              <td className="border px-4 py-2">{applicant.companyName}</td>
              <td className="border px-4 py-2">{applicant.phoneNumber}</td>
              <td className="border px-4 py-2">{applicant.companyEmail}</td>
              <td className="border px-4 py-2">{applicant.selectedSpace}</td>
              <td className="border px-4 py-2">
                {applicant.attachments && applicant.attachments.length > 0 ? (
                  <ul>
                    {applicant.attachments.map((att, i) => (
                      <li key={i}><a href={att} target="_blank" rel="noopener noreferrer">Shiko</a></li>
                    ))}
                  </ul>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicantsList; 