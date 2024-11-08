"use client";

import { useState, ChangeEvent, FormEvent } from 'react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      alert("Please upload a file.");
      return;
    }

    // Proceed with file reading and submission
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64File = reader.result as string;

      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, surname, file: base64File }),
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
      } else {
        alert(`Error: ${result.error}`);
      }
    };
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      
      // Allowed file types
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg'];

      // Validate file type
      if (selectedFile && !allowedTypes.includes(selectedFile.type)) {
        setFileError('Invalid file type. Please upload a PDF, DOCX, or JPG file.');
        setFile(null);
      } else {
        setFileError('');
        setFile(selectedFile);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 space-y-6">
        <h2 className="text-2xl font-semibold text-center text-gray-800">Contact Us</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Surname</label>
          <input
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">File</label>
          <input
            type="file"
            onChange={handleFileChange}
            required
            accept=".pdf, .docx, .jpg, .jpeg"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-500"
          />
          {fileError && <p className="text-red-500 text-sm mt-2">{fileError}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition duration-200 shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
        >
          Send
        </button>
      </form>
    </div>
  );
}
