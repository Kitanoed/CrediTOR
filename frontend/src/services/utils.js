export const generateDCN = () => {
  return 'DCN-' + Math.floor(Math.random() * 100000).toString().padStart(5, '0');
};

export const maskStudentId = (studentId) => {
  if (!studentId) return studentId;
  const parts = String(studentId).trim().split('-');
  if (parts.length === 1) {
    const part = parts[0];
    if (part.length <= 2) return '**';
    return `${part.slice(0, 2)}${'*'.repeat(Math.max(2, part.length - 2))}`;
  }
  return parts
    .map((part, i) => {
      if (!part) return '';
      const last = i === parts.length - 1;
      if (last && part.length > 2) {
        const stars = '*'.repeat(Math.max(3, part.length - 2));
        return `${stars}${part.slice(-2)}`;
      }
      const keep = Math.min(2, part.length);
      const stars = '*'.repeat(Math.max(2, part.length - keep));
      return `${part.slice(0, keep)}${stars}`;
    })
    .join('-');
};

export const maskName = (fullName) => {
  const parts = fullName.split(' ');
  if (parts.length === 0) return fullName;

  let masked = '';
  parts.forEach((part, idx) => {
    const segment = part[0] + '*'.repeat(Math.max(0, part.length - 1));
    masked += idx === 0 ? segment : `, ${segment}`;
  });
  return masked;
};

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
