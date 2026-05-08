// src/components/Avatar.tsx
"use client";

import { useState, useEffect } from 'react';

import type { UserProfile } from './AuthProvider';
import apiClient from '@/lib/apiClient';

type AvatarProps = {
  user: UserProfile;
  url: string | null;
  userName: string | null; // <-- ADDED: To display the user's initial
  onUpload: (newUrl: string) => void;
};

export default function Avatar({ user, url, userName, onUpload }: AvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(url);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    setAvatarUrl(url);
  }, [url]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError('');
      if (!cloudName || !uploadPreset) throw new Error('Cloudinary environment variables are not configured.');
      if (!event.target.files || event.target.files.length === 0) throw new Error('You must select an image to upload.');

      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload image to Cloudinary.');

      const data = await response.json();
      const newAvatarUrl = data.secure_url;
      if (!newAvatarUrl) throw new Error('Cloudinary response did not include a secure URL.');

      // Use apiClient to update the profile
      await apiClient('user/profile', 'PUT', { profile_pic: newAvatarUrl });

      setAvatarUrl(newAvatarUrl);
      onUpload(newAvatarUrl);
    } catch (error: any) {
      setError(`Error uploading avatar: ${error.message}`);
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  // Helper to get the first character of the name for the fallback
  const getInitial = (name: string | null) => {
    if (name && name.length > 0) {
      return name.charAt(0).toUpperCase();
    }
    return 'A'; // A generic fallback initial
  };

  return (
    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
      <style jsx>{`
            /* ... (other styles remain the same) ... */
            .avatar-container {
                position: relative;
                width: 120px;
                height: 120px;
                margin: 0 auto;
            }
            .avatar-image {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                object-fit: cover;
                border: 3px solid #e2e8f0;
                box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            }
            .avatar-upload-label {
                position: absolute;
                bottom: 0;
                right: 0;
                background-color: #2c5282;
                color: white;
                border-radius: 50%;
                width: 35px;
                height: 35px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                border: 2px solid white;
                transition: background-color 0.2s;
            }
            .avatar-upload-label:hover {
                background-color: #1a365d;
            }
            /* --- NEW STYLES FOR THE FALLBACK AVATAR --- */
            .avatar-fallback {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                background-color: #2c5282; /* A nice background color */
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 3rem; /* Large initial */
                font-weight: 600;
                border: 3px solid #e2e8f0;
                box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            }
            .avatar-error {
                color: #e53e3e;
                margin-top: 0.5rem;
                font-size: 0.875rem;
            }
            .uploading-text {
                margin-top: 8px;
                color: #4a5568;
            }
        `}</style>
      <div className="avatar-container">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="User profile"
            className="avatar-image"
          />
        ) : (
          <div className="avatar-fallback">
            <span>{getInitial(userName)}</span>
          </div>
        )}
        <label htmlFor="avatar-upload" className="avatar-upload-label" title="Change profile picture">
          <i className="fas fa-camera"></i>
        </label>
      </div>
      <input
        style={{ display: 'none' }}
        type="file"
        id="avatar-upload"
        accept="image/png, image/jpeg"
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p className="uploading-text">Uploading...</p>}
      {error && <p className="avatar-error">{error}</p>}
    </div>
  );
}