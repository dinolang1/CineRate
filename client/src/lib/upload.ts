export async function uploadProfileImage(file: File): Promise<{ fileUrl: string; filename: string }> {
  const formData = new FormData();
  formData.append('profileImage', file);

  const response = await fetch('/api/upload/profile', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }

  return response.json();
}

export function getDownloadUrl(filename: string): string {
  return `/api/download/${filename}`;
}
