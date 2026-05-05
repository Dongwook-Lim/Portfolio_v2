import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export type GalleryItemData = {
  id: number;
  title: string;
  location: string;
  date?: string; // Optional if we want to add date
  img: string;
  bgColor?: string;
  textColor?: string;
};

export type AdminSettings = {
  themeColor: string;
  contactEmail: string;
  contactCopyright: string;
  galleryData: GalleryItemData[];
};

export const defaultSettings: AdminSettings = {
  themeColor: "#C29B4C",
  contactEmail: "DWOOKLIIM@GMAIL.COM",
  contactCopyright: "© 2026 LIMDONGWOOK",
  galleryData: [
    { id: 1, title: "HOUSE OF GUCCI", location: "NEW YORK", date: "2026", img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop" },
    { id: 2, title: "DESIGN EMBRACED", location: "LONDON", date: "2025", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop" },
    { id: 3, title: "MARRY MONDAY", location: "PARIS", date: "2026", img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop" },
    { id: 4, title: "URBAN TALES", location: "TOKYO", date: "2024", img: "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=800&auto=format&fit=crop" },
    { id: 5, title: "SILENT ECHO", location: "BERLIN", date: "2025", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop" },
    { id: 6, title: "NEON DRIFT", location: "SEOUL", date: "2026", img: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop" },
    { id: 7, title: "OCEAN BREEZE", location: "MIAMI", date: "2024", img: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=800&auto=format&fit=crop" },
    { id: 8, title: "DESERT SANDS", location: "DUBAI", date: "2025", img: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop" },
    { id: 9, title: "LUNAR ECLIPSE", location: "OSLO", date: "2026", img: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop" },
    { id: 10, title: "FUTURE FORMS", location: "AMSTERDAM", date: "2025", img: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=800&auto=format&fit=crop" },
    { id: 11, title: "ECHOES OF TIME", location: "ROME", date: "2024", img: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=800&auto=format&fit=crop" },
    { id: 12, title: "NEBULA DREAMS", location: "VANCOUVER", date: "2026", img: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800&auto=format&fit=crop" },
    { id: 13, title: "VELVET HORIZON", location: "LOS ANGELES", date: "2025", img: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=800&auto=format&fit=crop" },
    { id: 14, title: "STELLAR WINDS", location: "CHICAGO", date: "2024", img: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=800&auto=format&fit=crop" },
    { id: 15, title: "CHROMA SHIFT", location: "TORONTO", date: "2026", img: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop" },
    { id: 16, title: "RADIANT FLUX", location: "SYDNEY", date: "2025", img: "https://images.unsplash.com/photo-1505909182942-e2f09aee3e89?q=80&w=800&auto=format&fit=crop" },
    { id: 17, title: "ASTRAL PLANE", location: "MADRID", date: "2024", img: "https://images.unsplash.com/photo-1518818419601-129668a6cb93?q=80&w=800&auto=format&fit=crop" },
    { id: 18, title: "VOID RUNNER", location: "SINGAPORE", date: "2026", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop" },
    { id: 19, title: "PRISM GLITCH", location: "HELSINKI", date: "2025", img: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=800&auto=format&fit=crop" },
    { id: 20, title: "SOLAR FLARE", location: "BARCELONA", date: "2026", img: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=800&auto=format&fit=crop" },
  ]
};

type AdminContextType = {
  settings: AdminSettings;
  updateSettings: (newSettings: Partial<AdminSettings>) => void;
  isLoading: boolean;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Firestore에서 실시간 데이터 로드
  useEffect(() => {
    const docRef = doc(db, 'settings', 'main');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as AdminSettings);
      } else {
        // 문서가 없으면 기본값으로 초기 문서 생성
        setDoc(docRef, defaultSettings);
        setSettings(defaultSettings);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading settings:", error);
      setIsLoading(false); // 권한이 없거나 에러 발생 시에도 로딩 해제 (로컬 기본값 사용)
    });

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: Partial<AdminSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated); // UI 즉시 업데이트 (Optimistic UI)
    
    try {
      const docRef = doc(db, 'settings', 'main');
      await setDoc(docRef, updated, { merge: true });
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("데이터 저장에 실패했습니다. 관리자 권한이 있는지 확인해주세요.");
    }
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--theme-primary', settings.themeColor);
  }, [settings.themeColor]);

  return (
    <AdminContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
