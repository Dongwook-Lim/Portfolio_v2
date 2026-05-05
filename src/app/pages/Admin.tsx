import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../firebase';

export function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const { settings, updateSettings, isLoading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setIsAuthenticated
      setError('');
    } catch (err: any) {
      console.error(err);
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("로그아웃 에러", err);
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ themeColor: e.target.value });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateSettings({ [name]: value });
  };

  const handleGalleryChange = (index: number, field: string, value: string) => {
    const newGallery = [...settings.galleryData];
    newGallery[index] = { ...newGallery[index], [field]: value };
    updateSettings({ galleryData: newGallery });
  };

  const handleImageUpload = async (index: number, file: File) => {
    if (!file) return;
    try {
      setUploadingIdx(index);
      const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      handleGalleryChange(index, 'img', downloadURL);
    } catch (err) {
      console.error("Upload error:", err);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setUploadingIdx(null);
    }
  };

  if (isCheckingAuth || isLoading) {
    return (
      <div className="w-full h-screen bg-[#0c0c0c] flex items-center justify-center text-[#f0f0f0] font-['Inter']">
        <div className="text-theme-primary tracking-widest animate-pulse">LOADING...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full h-screen bg-[#0c0c0c] flex items-center justify-center text-[#f0f0f0] font-['Inter']">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a1a] p-8 md:p-12 rounded-xl border border-white/10 shadow-2xl max-w-md w-full"
        >
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-widest text-theme-primary mb-2">ADMIN ACCESS</h1>
            <p className="text-sm text-gray-400 opacity-60">관리자 계정으로 로그인해주세요</p>
          </div>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/50 border border-white/20 p-4 rounded text-center tracking-[2px] focus:outline-none focus:border-theme-primary transition-colors"
              autoFocus
              required
            />
            <input 
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/50 border border-white/20 p-4 rounded text-center tracking-[4px] focus:outline-none focus:border-theme-primary transition-colors"
              required
            />
            {error && <span className="text-red-500 text-xs text-center">{error}</span>}
            <button 
              type="submit"
              className="bg-theme-primary text-black font-bold py-4 rounded tracking-widest mt-2 hover:opacity-80 transition-opacity"
            >
              ENTER
            </button>
            <button 
              type="button"
              onClick={() => navigate('/')}
              className="text-gray-500 text-xs tracking-widest hover:text-white transition-colors mt-4"
            >
              BACK TO GALLERY
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#0c0c0c] text-[#f0f0f0] font-['Inter'] pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0c0c0c]/80 backdrop-blur-md border-b border-white/10 p-6 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-widest text-theme-primary">ADMIN DASHBOARD</h1>
        <div className="flex gap-4">
          <button 
            onClick={handleLogout}
            className="text-xs tracking-widest border border-white/30 text-white px-4 py-2 rounded hover:bg-white/10 transition-colors"
          >
            LOGOUT
          </button>
          <button 
            onClick={() => navigate('/')}
            className="text-xs tracking-widest border border-theme-primary text-theme-primary px-4 py-2 rounded hover:bg-theme-primary hover:text-black transition-colors"
          >
            VIEW GALLERY
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-16">
        
        {/* Theme Settings */}
        <section className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-lg tracking-widest opacity-80">THEME SETTINGS</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs tracking-widest opacity-50 uppercase">Primary Theme Color</label>
              <div className="flex gap-4 items-center">
                <input 
                  type="color" 
                  value={settings.themeColor}
                  onChange={handleColorChange}
                  className="w-12 h-12 bg-transparent cursor-pointer rounded"
                />
                <input 
                  type="text" 
                  value={settings.themeColor}
                  onChange={handleColorChange}
                  className="bg-black/50 border border-white/20 p-3 rounded flex-1 focus:border-theme-primary focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Contact Texts */}
        <section className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-lg tracking-widest opacity-80">PANEL TEXTS</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs tracking-widest opacity-50 uppercase">Contact Email</label>
              <input 
                type="text" 
                name="contactEmail"
                value={settings.contactEmail}
                onChange={handleTextChange}
                className="bg-black/50 border border-white/20 p-3 rounded w-full focus:border-theme-primary focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs tracking-widest opacity-50 uppercase">Copyright Text</label>
              <input 
                type="text" 
                name="contactCopyright"
                value={settings.contactCopyright}
                onChange={handleTextChange}
                className="bg-black/50 border border-white/20 p-3 rounded w-full focus:border-theme-primary focus:outline-none transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Gallery Editor */}
        <section className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-lg tracking-widest opacity-80">GALLERY IMAGES</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {settings.galleryData.map((item, idx) => (
              <div key={item.id} className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6 flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-48 h-32 rounded bg-black/50 overflow-hidden shrink-0">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover opacity-80" />
                </div>
                
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-widest opacity-50 uppercase">Title</label>
                    <input 
                      type="text" 
                      value={item.title}
                      onChange={(e) => handleGalleryChange(idx, 'title', e.target.value)}
                      className="bg-black/50 border border-white/10 p-2 rounded w-full text-sm focus:border-theme-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-widest opacity-50 uppercase">Location</label>
                    <input 
                      type="text" 
                      value={item.location}
                      onChange={(e) => handleGalleryChange(idx, 'location', e.target.value)}
                      className="bg-black/50 border border-white/10 p-2 rounded w-full text-sm focus:border-theme-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-widest opacity-50 uppercase">Date</label>
                    <input 
                      type="text" 
                      value={item.date || ''}
                      onChange={(e) => handleGalleryChange(idx, 'date', e.target.value)}
                      className="bg-black/50 border border-white/10 p-2 rounded w-full text-sm focus:border-theme-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[10px] tracking-widest opacity-50 uppercase">Image URL & Upload</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={item.img}
                        onChange={(e) => handleGalleryChange(idx, 'img', e.target.value)}
                        className="bg-black/50 border border-white/10 p-2 rounded flex-1 text-sm focus:border-theme-primary focus:outline-none"
                        placeholder="Image URL"
                      />
                      <label className="cursor-pointer bg-white/5 border border-white/10 px-4 py-2 rounded text-[10px] tracking-widest hover:border-theme-primary hover:text-theme-primary transition-colors flex items-center justify-center shrink-0 uppercase">
                        {uploadingIdx === idx ? 'UPLOADING...' : 'UPLOAD FILE'}
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingIdx === idx}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(idx, file);
                            e.target.value = ''; // Reset input
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-widest opacity-50 uppercase">Detail BG Color</label>
                    <div className="flex gap-4 items-center">
                      <input 
                        type="color" 
                        value={item.bgColor || '#fcfcfc'}
                        onChange={(e) => handleGalleryChange(idx, 'bgColor', e.target.value)}
                        className="w-10 h-10 bg-transparent cursor-pointer rounded"
                      />
                      <input 
                        type="text" 
                        value={item.bgColor || '#fcfcfc'}
                        onChange={(e) => handleGalleryChange(idx, 'bgColor', e.target.value)}
                        className="bg-black/50 border border-white/10 p-2 rounded flex-1 text-sm focus:border-theme-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-widest opacity-50 uppercase">Detail Text Color</label>
                    <div className="flex gap-4 items-center">
                      <input 
                        type="color" 
                        value={item.textColor || settings.themeColor}
                        onChange={(e) => handleGalleryChange(idx, 'textColor', e.target.value)}
                        className="w-10 h-10 bg-transparent cursor-pointer rounded"
                      />
                      <input 
                        type="text" 
                        value={item.textColor || settings.themeColor}
                        onChange={(e) => handleGalleryChange(idx, 'textColor', e.target.value)}
                        className="bg-black/50 border border-white/10 p-2 rounded flex-1 text-sm focus:border-theme-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
