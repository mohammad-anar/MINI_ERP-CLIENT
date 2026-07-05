export const getImageUrl = (path: string | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const backendUrl =
    window.location.hostname === 'localhost'
      ? 'http://localhost:5000'
      : 'https://mini-erp-server-34md.onrender.com';

  return `${backendUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};
