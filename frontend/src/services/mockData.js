// Mock data service with sample records and audit logs

export const generateDCN = () => {
  return 'DCN-' + Math.floor(Math.random() * 100000).toString().padStart(5, '0');
};

export const generateToken = () => {
  return 'token_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const maskName = (fullName) => {
  const parts = fullName.split(' ');
  if (parts.length === 0) return fullName;
  
  let masked = '';
  parts.forEach((part, idx) => {
    if (idx === 0) {
      masked += part[0] + '*'.repeat(Math.max(0, part.length - 1));
    } else {
      masked += ', ' + part[0] + '*'.repeat(Math.max(0, part.length - 1));
    }
  });
  return masked;
};

// Initial mock TOR records
export const initialTORRecords = [
  {
    id: 'TOR-001',
    studentId: 'STU-2024-001',
    fullName: 'Maria Santos de la Cruz',
    dcn: 'DCN-12345',
    dateIssued: '2024-01-15',
    uploadedFileName: 'TOR-Maria-Santos.pdf',
    status: 'Active',
    verificationToken: generateToken(),
    fileSize: '2.4 MB',
    createdAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: 'TOR-002',
    studentId: 'STU-2024-002',
    fullName: 'Juan Carlos Ramos Lopez',
    dcn: 'DCN-54321',
    dateIssued: '2024-01-20',
    uploadedFileName: 'TOR-Juan-Carlos.pdf',
    status: 'Active',
    verificationToken: generateToken(),
    fileSize: '2.1 MB',
    createdAt: new Date('2024-01-20').toISOString(),
  },
  {
    id: 'TOR-003',
    studentId: 'STU-2024-003',
    fullName: 'Ana Maria Fernandez Rodriguez',
    dcn: 'DCN-98765',
    dateIssued: '2023-12-10',
    uploadedFileName: 'TOR-Ana-Maria.pdf',
    status: 'Expired',
    verificationToken: generateToken(),
    fileSize: '2.3 MB',
    createdAt: new Date('2023-12-10').toISOString(),
  },
  {
    id: 'TOR-004',
    studentId: 'STU-2024-004',
    fullName: 'Carlos Roberto Mendoza Gutierrez',
    dcn: 'DCN-45678',
    dateIssued: '2024-02-01',
    uploadedFileName: 'TOR-Carlos-Roberto.pdf',
    status: 'Revoked',
    verificationToken: generateToken(),
    fileSize: '2.5 MB',
    createdAt: new Date('2024-02-01').toISOString(),
  },
];

// Initial audit trail logs
export const initialAuditLogs = [
  {
    id: 'AUDIT-001',
    timestamp: new Date('2024-02-15 14:30:00').toISOString(),
    eventType: 'Record Creation',
    dcn: 'DCN-12345',
    details: 'New TOR record created for Maria Santos de la Cruz (STU-2024-001)',
    registrarId: 'REG-001',
  },
  {
    id: 'AUDIT-002',
    timestamp: new Date('2024-02-15 15:45:00').toISOString(),
    eventType: 'Verification Success',
    dcn: 'DCN-12345',
    details: 'Document verified successfully via QR code scan',
    registrarId: 'SYS',
  },
  {
    id: 'AUDIT-003',
    timestamp: new Date('2024-02-16 09:15:00').toISOString(),
    eventType: 'Record Creation',
    dcn: 'DCN-54321',
    details: 'New TOR record created for Juan Carlos Ramos Lopez (STU-2024-002)',
    registrarId: 'REG-002',
  },
  {
    id: 'AUDIT-004',
    timestamp: new Date('2024-02-16 10:20:00').toISOString(),
    eventType: 'Status Update',
    dcn: 'DCN-98765',
    details: 'Status of DCN-98765 changed from Active to Expired',
    registrarId: 'REG-001',
  },
  {
    id: 'AUDIT-005',
    timestamp: new Date('2024-02-16 11:30:00').toISOString(),
    eventType: 'Status Update',
    dcn: 'DCN-45678',
    details: 'Status of DCN-45678 changed from Active to Revoked',
    registrarId: 'REG-002',
  },
  {
    id: 'AUDIT-006',
    timestamp: new Date('2024-02-16 14:00:00').toISOString(),
    eventType: 'Verification Failure',
    dcn: 'DCN-INVALID',
    details: 'Verification failed - Invalid DCN provided',
    registrarId: 'SYS',
  },
];

export const getStatusColor = (status) => {
  switch (status) {
    case 'Active':
      return 'bg-green-50 text-green-800 border-green-200';
    case 'Revoked':
      return 'bg-red-50 text-red-800 border-red-200';
    case 'Expired':
      return 'bg-gray-50 text-gray-800 border-gray-200';
    default:
      return 'bg-blue-50 text-blue-800 border-blue-200';
  }
};

export const getStatusBannerColor = (status) => {
  switch (status) {
    case 'Active':
      return 'bg-green-500 text-white';
    case 'Revoked':
      return 'bg-red-500 text-white';
    case 'Expired':
      return 'bg-gray-500 text-white';
    case 'Invalid':
      return 'bg-red-600 text-white';
    default:
      return 'bg-blue-500 text-white';
  }
};
