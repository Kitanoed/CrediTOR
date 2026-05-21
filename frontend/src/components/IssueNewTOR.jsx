import React, { useState } from 'react';
import { Upload, Check, Printer, X } from 'lucide-react';
import QRCode from 'qrcode.react';
import { generateDCN, generateToken } from '../services/mockData';

export const IssueNewTOR = ({ onRecordCreated }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    dcn: '',
    dateIssued: new Date().toISOString().split('T')[0],
    status: 'Active',
    uploadedFileName: '',
  });

  const [uploadedFile, setUploadedFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setFormData((prev) => ({
        ...prev,
        uploadedFileName: file.name,
      }));
    }
  };

  const handleDragDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setFormData((prev) => ({
        ...prev,
        uploadedFileName: file.name,
      }));
    }
  };

  const handleGenerateDCN = () => {
    const dcn = generateDCN();
    setFormData((prev) => ({
      ...prev,
      dcn,
    }));
  };

  const handleRegisterAndGenerate = () => {
    if (!formData.studentId || !formData.fullName || !formData.dcn || !uploadedFile) {
      alert('Please fill in all fields and upload a file');
      return;
    }

    const verificationToken = generateToken();
    const newRecord = {
      id: `TOR-${Date.now()}`,
      ...formData,
      verificationToken,
      fileSize: (uploadedFile.size / (1024 * 1024)).toFixed(2) + ' MB',
      createdAt: new Date().toISOString(),
      file: uploadedFile,
    };

    setPreviewData({
      ...newRecord,
      verificationUrl: `${window.location.origin}/verify?token=${verificationToken}`,
    });
    setShowPreview(true);

    // Notify parent component
    onRecordCreated(newRecord);
  };

  const handlePrint = () => {
    window.print();
  };

  if (showPreview && previewData) {
    return (
      <div className="flex-1 bg-white p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          {/* Close Button */}
          <button
            onClick={() => setShowPreview(false)}
            className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
          >
            <X className="w-5 h-5" />
            Back to Form
          </button>

          {/* Print Preview Container */}
          <div className="bg-white border-2 border-slate-200 rounded-lg p-12 shadow-lg print:shadow-none">
            {/* Header */}
            <div className="text-center mb-8 pb-8 border-b-2 border-slate-300">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">TRANSCRIPT OF RECORDS</h2>
              <p className="text-slate-600">Official Document Verification Certificate</p>
            </div>

            {/* Student Information */}
            <div className="mb-8 grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Student ID</p>
                <p className="text-lg font-semibold text-slate-900">{previewData.studentId}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</p>
                <p className="text-lg font-semibold text-slate-900">{previewData.fullName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Document Control Number</p>
                <p className="text-lg font-mono font-bold text-blue-600">{previewData.dcn}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Date Issued</p>
                <p className="text-lg font-semibold text-slate-900">{previewData.dateIssued}</p>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="mb-8 flex flex-col items-center py-8 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
              <p className="text-xs font-semibold text-slate-600 mb-4 uppercase">Verification QR Code</p>
              <QRCode value={previewData.verificationUrl} size={200} level="H" includeMargin={true} />
              <p className="text-xs text-slate-500 mt-4 text-center">Scan to verify document</p>
            </div>

            {/* Status Badge */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Document Status</p>
                <span className={`inline-block px-4 py-2 rounded-full font-semibold text-sm ${
                  previewData.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {previewData.status}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Issued On</p>
                <p className="text-sm text-slate-600">{new Date(previewData.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-slate-300 pt-8 text-center">
              <p className="text-xs text-slate-500 mb-2">This is an official document issued by the Registrar.</p>
              <p className="text-xs text-slate-400">For verification purposes only. Keep this document secure.</p>
            </div>

            {/* Print Button */}
            <div className="mt-8 flex gap-3 justify-center print:hidden">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
              >
                <Printer className="w-5 h-5" />
                Print Document
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 p-8 overflow-auto">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Issue New Transcript of Records</h1>
          <p className="text-slate-600">Register and generate a new TOR document with verification capability</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-slate-200">
          {/* Student Information Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 pb-4 border-b border-slate-200">Student Information</h2>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Student ID */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Student ID Number *</label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  placeholder="e.g., STU-2024-001"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g., Maria Santos de la Cruz"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* DCN */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Document Control Number (DCN) *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="dcn"
                    value={formData.dcn}
                    onChange={handleInputChange}
                    placeholder="e.g., DCN-12345"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleGenerateDCN}
                    className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-semibold transition"
                  >
                    Auto-Generate
                  </button>
                </div>
              </div>

              {/* Date Issued */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Date Issued *</label>
                <input
                  type="date"
                  name="dateIssued"
                  value={formData.dateIssued}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Document Status */}
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Document Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Revoked">Revoked</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 pb-4 border-b border-slate-200">Document Upload</h2>
            
            {/* Drag and Drop Area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDragDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                uploadedFile
                  ? 'border-green-300 bg-green-50'
                  : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              {uploadedFile ? (
                <div className="flex flex-col items-center">
                  <Check className="w-12 h-12 text-green-600 mb-3" />
                  <p className="font-semibold text-green-700 mb-1">{uploadedFile.name}</p>
                  <p className="text-sm text-green-600">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                  <button
                    onClick={() => {
                      setUploadedFile(null);
                      setFormData((prev) => ({
                        ...prev,
                        uploadedFileName: '',
                      }));
                    }}
                    className="mt-3 text-sm text-green-700 hover:text-green-900 font-semibold underline"
                  >
                    Choose different file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-slate-400 mb-3" />
                  <p className="font-semibold text-slate-900 mb-1">Drag and drop your PDF here</p>
                  <p className="text-sm text-slate-600 mb-4">or click to select a file</p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="fileInput"
                  />
                  <label
                    htmlFor="fileInput"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold cursor-pointer transition"
                  >
                    Browse Files
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Actions Panel */}
          <div className="flex gap-4">
            <button
              onClick={handleRegisterAndGenerate}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition shadow-md hover:shadow-lg"
            >
              <Check className="w-5 h-5" />
              Register & Generate
            </button>
            <button
              onClick={() => {
                setFormData({
                  studentId: '',
                  fullName: '',
                  dcn: '',
                  dateIssued: new Date().toISOString().split('T')[0],
                  status: 'Active',
                  uploadedFileName: '',
                });
                setUploadedFile(null);
              }}
              className="px-6 py-3 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 font-semibold transition"
            >
              Clear Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
