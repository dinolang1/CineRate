export const uploadProfileImage = async (file: File): Promise<{ fileUrl: string; filename: string }> => {
  const formData = new FormData();
  formData.append('profileImage', file);

  const response = await fetch('/api/upload/profile', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }

  return response.json();
};

export const downloadFile = async (filename: string): Promise<Blob> => {
  const response = await fetch(`/api/download/${filename}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Download failed');
  }

  return response.blob();
};

export const fetchTMDBPopular = async () => {
  const response = await fetch('/api/tmdb/popular', {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch popular movies');
  }

  return response.json();
};

export const searchTMDB = async (query: string) => {
  const response = await fetch(`/api/tmdb/search/${encodeURIComponent(query)}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to search movies');
  }

  return response.json();
};
