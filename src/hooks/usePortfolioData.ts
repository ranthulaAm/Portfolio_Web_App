import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc, getDocFromServer } from 'firebase/firestore';
import { auth } from '../firebase';

export interface Skill {
  id: string;
  name: string;
  percentage: number;
  hidden?: boolean;
}

export interface Experience {
  id: string;
  title: string;
  hidden?: boolean;
}

export interface Education {
  id: string;
  degree: string;
  status: string;
  institution: string;
  hidden?: boolean;
}

export interface Art {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  hidden?: boolean;
}

export interface Platform {
  id: string;
  platformName: string;
  userName: string;
  url: string;
  logoUrl: string;
  hidden?: boolean;
}

export interface PortfolioData {
  logoType: 'text' | 'image';
  logoText: string;
  logoImageUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBio: string;
  heroImage: string;
  heroImageOpacity?: number;
  sectionTitles: {
    skills: string;
    experience: string;
    portfolio: string;
    portfolioSub: string;
    contact: string;
    contactSub: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
    location: string;
    facebookUrl?: string;
    facebookUsername?: string;
    instagramUrl?: string;
    instagramUsername?: string;
  };
  skills: Skill[];
  experiences: Experience[];
  educations: Education[];
  arts: Art[];
  platforms: Platform[];
  secondaryColor?: string;
  primaryColor?: string;
}

const initialArts: Art[] = [
  { id: '1', title: 'Futuristic Cityscape', imageUrl: 'https://picsum.photos/seed/futuristic/800/600', category: 'Manipulation' },
  { id: '2', title: 'Surreal Portrait', imageUrl: 'https://picsum.photos/seed/surreal/800/600', category: 'Illustration' },
  { id: '3', title: 'Neon Dreams', imageUrl: 'https://picsum.photos/seed/neon/800/600', category: 'Lighting' },
  { id: '4', title: 'Abstract Nature', imageUrl: 'https://picsum.photos/seed/nature/800/600', category: 'Manipulation' },
  { id: '5', title: 'Cyberpunk Alley', imageUrl: 'https://picsum.photos/seed/cyberpunk/800/600', category: 'Concept Art' },
  { id: '6', title: 'Ethereal Glow', imageUrl: 'https://picsum.photos/seed/ethereal/800/600', category: 'Effects' }
];

const defaultData: PortfolioData = {
  logoType: 'text',
  logoText: "RANTHULA",
  logoImageUrl: "",
  heroTitle: "Creative Designer",
  heroSubtitle: "Transforming ideas into surreal visions.",
  heroBio: "I am a multidisciplinary digital creator specializing in advanced image manipulation. Through handmade illustrations, I master lighting and effects to build artistic, futuristic, and surreal assets.",
  heroImage: "https://picsum.photos/seed/portrait/800/1000",
  heroImageOpacity: 100,
  sectionTitles: {
    skills: "Software Skills",
    experience: "Experience & Education",
    portfolio: "Featured Work",
    portfolioSub: "A selection of my recent digital creations, manipulations, and illustrations.",
    contact: "Let's work together",
    contactSub: "Interested in collaborating or have a project in mind? Feel free to reach out. I'm always open to discussing new projects and creative ideas."
  },
  contact: {
    phone: "0712 132 855",
    email: "ranthuls112@gmail.com",
    website: "https://ranthulaam.github.io/portfolio/",
    location: "414/2, Thuduwegedara\nKiriwaththuduwa, Homagama\nSri Lanka (10200)",
    facebookUrl: "https://web.facebook.com/Ranthula.senmith",
    facebookUsername: "Ranthula.senmith",
    instagramUrl: "https://www.instagram.com/_razor_s/",
    instagramUsername: "_razor_s"
  },
  skills: [
    { id: '1', name: 'Adobe Illustrator', percentage: 90 },
    { id: '2', name: 'Adobe Photoshop', percentage: 90 },
    { id: '3', name: 'Adobe Lightroom', percentage: 80 },
    { id: '4', name: 'Adobe InDesign', percentage: 60 },
    { id: '5', name: 'Adobe Premiere Pro', percentage: 50 },
    { id: '6', name: 'Adobe After Effects', percentage: 50 },
  ],
  experiences: [
    { id: '1', title: 'Wings Designs (Clothing Brand)' },
    { id: '2', title: 'Nut Nut Ceylon (Food Company)' },
    { id: '3', title: 'Vita Organic (Food exporting company)' },
    { id: '4', title: 'Freelancing & Academic Institutions' },
  ],
  educations: [
    { id: '1', degree: 'BA(Hons) Animation And VFX', status: '(UG)', institution: 'Falmouth University UK' },
    { id: '2', degree: 'GCE Advanced Level (A/L)', status: '(Pending)', institution: 'Physical Science Stream' },
  ],
  arts: initialArts,
  platforms: [],
  secondaryColor: '#1dbf73',
  primaryColor: '#050505'
};

const DATA_DOC_PATH = 'settings/portfolio';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function usePortfolioData() {
  const [data, setData] = useState<PortfolioData>(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();

    const unsubscribe = onSnapshot(doc(db, DATA_DOC_PATH), (snapshot) => {
      if (snapshot.exists()) {
        setData({ ...defaultData, ...snapshot.data() as PortfolioData });
      } else {
        // Initialize with default data if doc doesn't exist
        setDoc(doc(db, DATA_DOC_PATH), defaultData).catch(err => {
          console.error("Failed to initialize default data", err);
        });
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, DATA_DOC_PATH);
    });

    return () => unsubscribe();
  }, []);

  const syncData = async (newData: PortfolioData) => {
    try {
      await setDoc(doc(db, DATA_DOC_PATH), newData);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, DATA_DOC_PATH);
    }
  };

  const updateGeneral = (updates: Partial<PortfolioData>) => syncData({ ...data, ...updates });
  const updateSectionTitles = (titles: Partial<PortfolioData['sectionTitles']>) => syncData({ ...data, sectionTitles: { ...(data.sectionTitles || defaultData.sectionTitles), ...titles } });
  const updateContact = (contact: PortfolioData['contact']) => syncData({ ...data, contact });
  
  const addSkill = (skill: Omit<Skill, 'id'>) => syncData({ ...data, skills: [...data.skills, { ...skill, id: Date.now().toString() }] });
  const updateSkill = (id: string, updates: Partial<Skill>) => syncData({ ...data, skills: data.skills.map(s => s.id === id ? { ...s, ...updates } : s) });
  const removeSkill = (id: string) => syncData({ ...data, skills: data.skills.filter(s => s.id !== id) });
  const reorderSkill = (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    const index = data.skills.findIndex(s => s.id === id);
    if (index === -1) return;
    if ((direction === 'up' || direction === 'top') && index === 0) return;
    if ((direction === 'down' || direction === 'bottom') && index === data.skills.length - 1) return;

    const newSkills = [...data.skills];
    const [movedSkill] = newSkills.splice(index, 1);

    if (direction === 'top') {
      newSkills.unshift(movedSkill);
    } else if (direction === 'bottom') {
      newSkills.push(movedSkill);
    } else if (direction === 'up') {
      newSkills.splice(index - 1, 0, movedSkill);
    } else if (direction === 'down') {
      newSkills.splice(index + 1, 0, movedSkill);
    }
    
    syncData({ ...data, skills: newSkills });
  };
  
  const addExperience = (exp: Omit<Experience, 'id'>) => syncData({ ...data, experiences: [...data.experiences, { ...exp, id: Date.now().toString() }] });
  const updateExperience = (id: string, updates: Partial<Experience>) => syncData({ ...data, experiences: data.experiences.map(e => e.id === id ? { ...e, ...updates } : e) });
  const removeExperience = (id: string) => syncData({ ...data, experiences: data.experiences.filter(e => e.id !== id) });
  
  const addEducation = (edu: Omit<Education, 'id'>) => syncData({ ...data, educations: [...data.educations, { ...edu, id: Date.now().toString() }] });
  const updateEducation = (id: string, updates: Partial<Education>) => syncData({ ...data, educations: data.educations.map(e => e.id === id ? { ...e, ...updates } : e) });
  const removeEducation = (id: string) => syncData({ ...data, educations: data.educations.filter(e => e.id !== id) });
  
  const addArt = (art: Omit<Art, 'id'>) => syncData({ ...data, arts: [{ ...art, id: Date.now().toString() }, ...data.arts] });
  const updateArt = (id: string, updates: Partial<Art>) => syncData({ ...data, arts: data.arts.map(a => a.id === id ? { ...a, ...updates } : a) });
  const removeArt = (id: string) => syncData({ ...data, arts: data.arts.filter(a => a.id !== id) });
  const reorderArt = (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    const index = data.arts.findIndex(a => a.id === id);
    if (index === -1) return;
    if ((direction === 'up' || direction === 'top') && index === 0) return;
    if ((direction === 'down' || direction === 'bottom') && index === data.arts.length - 1) return;

    const newArts = [...data.arts];
    const [movedArt] = newArts.splice(index, 1);

    if (direction === 'top') {
      newArts.unshift(movedArt);
    } else if (direction === 'bottom') {
      newArts.push(movedArt);
    } else if (direction === 'up') {
      newArts.splice(index - 1, 0, movedArt);
    } else if (direction === 'down') {
      newArts.splice(index + 1, 0, movedArt);
    }
    
    syncData({ ...data, arts: newArts });
  };

  const addPlatform = (platform: Omit<Platform, 'id'>) => syncData({ ...data, platforms: [...(data.platforms || []), { ...platform, id: Date.now().toString() }] });
  const updatePlatform = (id: string, updates: Partial<Platform>) => syncData({ ...data, platforms: (data.platforms || []).map(p => p.id === id ? { ...p, ...updates } : p) });
  const removePlatform = (id: string) => syncData({ ...data, platforms: (data.platforms || []).filter(p => p.id !== id) });

  const updateSecondaryColor = (color: string) => syncData({ ...data, secondaryColor: color });
  const updatePrimaryColor = (color: string) => syncData({ ...data, primaryColor: color });

  return { 
    data, 
    loading,
    updateGeneral, 
    updateSectionTitles,
    updateContact, 
    addSkill, updateSkill, removeSkill, reorderSkill,
    addExperience, updateExperience, removeExperience, 
    addEducation, updateEducation, removeEducation, 
    addArt, updateArt, removeArt, reorderArt,
    addPlatform, updatePlatform, removePlatform,
    updateSecondaryColor,
    updatePrimaryColor
  };
}

