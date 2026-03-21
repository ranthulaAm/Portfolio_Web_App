import { useState, useRef, FormEvent, ChangeEvent, useEffect } from 'react';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { Trash2, Plus, Image as ImageIcon, Lock, Upload, Edit2, X, Check, Eye, EyeOff, ArrowUp, ArrowDown, ArrowUpToLine, ArrowDownToLine } from 'lucide-react';
import { motion } from 'motion/react';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { compressImage } from '../utils/imageCompression';

export default function Admin() {
  const { 
    data, loading, updateGeneral, updateContact, 
    addSkill, updateSkill, removeSkill, reorderSkill,
    addExperience, updateExperience, removeExperience, 
    addEducation, updateEducation, removeEducation, 
    addArt, updateArt, removeArt, reorderArt,
    addPlatform, updatePlatform, removePlatform,
    updateSecondaryColor,
    updatePrimaryColor
  } = usePortfolioData();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('General');
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ message: string, onConfirm: () => void } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [newArt, setNewArt] = useState({ title: '', imageUrl: '', category: '' });
  const [newSkill, setNewSkill] = useState({ name: '', percentage: 50 });
  const [newExp, setNewExp] = useState({ title: '' });
  const [newEdu, setNewEdu] = useState({ degree: '', status: '', institution: '' });
  const [newPlatform, setNewPlatform] = useState({ platformName: '', userName: '', url: '', logoUrl: '' });

  // Edit states
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [editingExp, setEditingExp] = useState<string | null>(null);
  const [editingEdu, setEditingEdu] = useState<string | null>(null);
  const [editingArt, setEditingArt] = useState<string | null>(null);
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Refs for file inputs to clear them after upload
  const artFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const platformFileInputRef = useRef<HTMLInputElement>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#1dbf73] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (password === '3963') {
      setIsAuthenticated(true);
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  // Helper to upload file to Firebase Storage
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        // Compress and convert to WebP
        const compressedBlob = await compressImage(file);
        
        // Create a unique filename with .webp extension
        const fileName = file.name.split('.').slice(0, -1).join('.') || 'image';
        const storageRef = ref(storage, `portfolio/${Date.now()}_${fileName}.webp`);
        
        const snapshot = await uploadBytes(storageRef, compressedBlob);
        const downloadURL = await getDownloadURL(snapshot.ref);
        callback(downloadURL);
      } catch (err) {
        console.error("Upload failed", err);
        setError("Failed to process or upload image. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent, callback: (url: string) => void) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setIsUploading(true);
      try {
        const compressedBlob = await compressImage(file);
        const fileName = file.name.split('.').slice(0, -1).join('.') || 'image';
        const storageRef = ref(storage, `portfolio/${Date.now()}_${fileName}.webp`);
        const snapshot = await uploadBytes(storageRef, compressedBlob);
        const downloadURL = await getDownloadURL(snapshot.ref);
        callback(downloadURL);
      } catch (err) {
        console.error("Upload failed", err);
        setError("Failed to process or upload image. Please try again.");
      } finally {
        setIsUploading(false);
      }
    } else if (file) {
      setError("Please drop a valid image file.");
    }
  };

  const handleAddArt = (e: FormEvent) => {
    e.preventDefault();
    if (newArt.title && newArt.imageUrl && newArt.category) {
      addArt(newArt);
      setNewArt({ title: '', imageUrl: '', category: '' });
      if (artFileInputRef.current) artFileInputRef.current.value = '';
    } else if (!newArt.imageUrl) {
      setError("Please upload an image for the artwork.");
    }
  };

  const handleDeleteArt = (id: string) => {
    setConfirmAction({
      message: 'Are you sure you want to delete this artwork? This action cannot be undone.',
      onConfirm: () => removeArt(id)
    });
  };

  const handleAddPlatform = (e: FormEvent) => {
    e.preventDefault();
    if (newPlatform.platformName && newPlatform.userName && newPlatform.url && newPlatform.logoUrl) {
      addPlatform(newPlatform);
      setNewPlatform({ platformName: '', userName: '', url: '', logoUrl: '' });
      if (platformFileInputRef.current) platformFileInputRef.current.value = '';
    } else if (!newPlatform.logoUrl) {
      setError("Please upload a logo for the platform.");
    }
  };

  const handleDeletePlatform = (id: string) => {
    setConfirmAction({
      message: 'Are you sure you want to delete this platform? This action cannot be undone.',
      onConfirm: () => removePlatform(id)
    });
  };

  const handleAddSkill = (e: FormEvent) => {
    e.preventDefault();
    if (newSkill.name) {
      addSkill(newSkill);
      setNewSkill({ name: '', percentage: 50 });
    }
  };

  const handleDeleteSkill = (id: string) => {
    setConfirmAction({
      message: 'Are you sure you want to delete this skill?',
      onConfirm: () => removeSkill(id)
    });
  };

  const handleAddExp = (e: FormEvent) => {
    e.preventDefault();
    if (newExp.title) {
      addExperience(newExp);
      setNewExp({ title: '' });
    }
  };

  const handleDeleteExp = (id: string) => {
    setConfirmAction({
      message: 'Are you sure you want to delete this experience?',
      onConfirm: () => removeExperience(id)
    });
  };

  const handleAddEdu = (e: FormEvent) => {
    e.preventDefault();
    if (newEdu.degree && newEdu.institution) {
      addEducation(newEdu);
      setNewEdu({ degree: '', status: '', institution: '' });
    }
  };

  const handleDeleteEdu = (id: string) => {
    setConfirmAction({
      message: 'Are you sure you want to delete this education entry?',
      onConfirm: () => removeEducation(id)
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleLogin} 
          className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md text-center"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-[#1dbf73]">
            <Lock size={32} />
          </div>
          <h2 className="text-3xl font-black mb-2 text-gray-900">Admin Access</h2>
          <p className="text-gray-500 mb-8">Please enter the password to continue</p>
          
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-[#1dbf73] focus:border-transparent text-center text-xl tracking-widest text-gray-900" 
            placeholder="••••" 
            autoFocus
          />
          <button type="submit" className="w-full bg-[#1dbf73] hover:bg-[#19a463] text-white py-4 rounded-lg font-bold transition-colors text-lg">
            Unlock Dashboard
          </button>
        </motion.form>
      </div>
    );
  }

  const tabs = ['General', 'Contact', 'Skills', 'Experience', 'Education', 'Portfolio'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your portfolio content</p>
        </div>
        <button 
          onClick={() => setIsAuthenticated(false)}
          className="text-gray-500 hover:text-gray-900 font-medium transition-colors"
        >
          Lock Dashboard
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b mb-8 overflow-x-auto">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-2 font-medium whitespace-nowrap transition-colors ${activeTab === tab ? 'border-b-2 border-[#1dbf73] text-[#1dbf73]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        
        {/* GENERAL TAB */}
        {activeTab === 'General' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-2xl">
            <h2 className="text-xl font-bold mb-4">General Information</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Logo Type</label>
              <div className="flex gap-6 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="logoType" value="text" checked={data.logoType !== 'image'} onChange={() => updateGeneral({ logoType: 'text' })} className="text-[#1dbf73] focus:ring-[#1dbf73]" />
                  <span className="font-medium">Text Logo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="logoType" value="image" checked={data.logoType === 'image'} onChange={() => updateGeneral({ logoType: 'image' })} className="text-[#1dbf73] focus:ring-[#1dbf73]" />
                  <span className="font-medium">Image Logo</span>
                </label>
              </div>

              {data.logoType === 'image' ? (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Logo Image</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    ref={logoFileInputRef}
                    disabled={isUploading}
                    onChange={e => handleImageUpload(e, url => updateGeneral({ logoImageUrl: url }))}
                    className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 focus:ring-[#1dbf73] focus:border-[#1dbf73] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#1dbf73] file:text-white hover:file:bg-[#19a463] cursor-pointer disabled:opacity-50"
                  />
                  {isUploading && <p className="text-sm text-[#1dbf73] mt-2 animate-pulse">Uploading image...</p>}
                  {data.logoImageUrl && (
                    <div className="mt-4 p-4 bg-white rounded border border-gray-200 inline-block relative">
                      <img src={data.logoImageUrl} alt="Logo Preview" className="h-10 object-contain" referrerPolicy="no-referrer" loading="lazy" />
                      <button 
                        onClick={() => {
                          setConfirmAction({
                            message: 'Remove this logo image?',
                            onConfirm: () => {
                              updateGeneral({ logoImageUrl: '' });
                              if(logoFileInputRef.current) logoFileInputRef.current.value = '';
                            }
                          });
                        }} 
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        title="Remove Logo"
                      >
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo Text</label>
                  <input 
                    type="text" 
                    value={data.logoText}
                    onChange={e => updateGeneral({ logoText: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 focus:ring-[#1dbf73] focus:border-[#1dbf73]"
                  />
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Theme Customization</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Background Color</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={data.primaryColor || '#050505'}
                      onChange={e => updatePrimaryColor(e.target.value)}
                      className="w-12 h-12 rounded cursor-pointer border-0 p-0 bg-transparent"
                    />
                    <input 
                      type="text" 
                      value={data.primaryColor || '#050505'}
                      onChange={e => updatePrimaryColor(e.target.value)}
                      className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-mono w-28 focus:ring-[#1dbf73] focus:border-[#1dbf73]"
                    />
                    <button 
                      onClick={() => updatePrimaryColor('#050505')}
                      className="text-xs text-gray-500 hover:text-[#1dbf73] font-medium underline"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={data.secondaryColor || '#1dbf73'}
                      onChange={e => updateSecondaryColor(e.target.value)}
                      className="w-12 h-12 rounded cursor-pointer border-0 p-0 bg-transparent"
                    />
                    <input 
                      type="text" 
                      value={data.secondaryColor || '#1dbf73'}
                      onChange={e => updateSecondaryColor(e.target.value)}
                      className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-mono w-28 focus:ring-[#1dbf73] focus:border-[#1dbf73]"
                    />
                    <button 
                      onClick={() => updateSecondaryColor('#1dbf73')}
                      className="text-xs text-gray-500 hover:text-[#1dbf73] font-medium underline"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4 italic">These colors will be used for the public portfolio view. The Admin dashboard remains consistent for usability.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
              <input 
                type="text" 
                value={data.heroTitle}
                onChange={e => updateGeneral({ heroTitle: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-md px-4 py-2 focus:ring-[#1dbf73] focus:border-[#1dbf73]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
              <input 
                type="text" 
                value={data.heroSubtitle}
                onChange={e => updateGeneral({ heroSubtitle: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-md px-4 py-2 focus:ring-[#1dbf73] focus:border-[#1dbf73]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Bio</label>
              <textarea 
                rows={4}
                value={data.heroBio}
                onChange={e => updateGeneral({ heroBio: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-md px-4 py-2 focus:ring-[#1dbf73] focus:border-[#1dbf73]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Portrait Image</label>
              <input 
                type="file" 
                accept="image/*"
                ref={heroFileInputRef}
                disabled={isUploading}
                onChange={e => handleImageUpload(e, url => updateGeneral({ heroImage: url }))}
                className="w-full bg-gray-50 border border-gray-300 rounded-md px-4 py-2 focus:ring-[#1dbf73] focus:border-[#1dbf73] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#1dbf73] file:text-white hover:file:bg-[#19a463] cursor-pointer disabled:opacity-50"
              />
              {isUploading && <p className="text-sm text-[#1dbf73] mt-2 animate-pulse">Uploading image...</p>}
              {data.heroImage && (
                <div className="mt-4 relative inline-block">
                  <img src={data.heroImage} alt="Preview" className="w-32 h-32 object-contain" referrerPolicy="no-referrer" loading="lazy" />
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Portrait Image Opacity: {data.heroImageOpacity ?? 100}%
              </label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={data.heroImageOpacity ?? 100}
                onChange={e => updateGeneral({ heroImageOpacity: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1dbf73]"
              />
            </div>
          </motion.div>
        )}

        {/* CONTACT TAB */}
        {activeTab === 'Contact' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Contact Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input 
                type="text" 
                value={data.contact.phone}
                onChange={e => updateContact({ ...data.contact, phone: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-md px-4 py-2 focus:ring-[#1dbf73] focus:border-[#1dbf73]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value={data.contact.email}
                onChange={e => updateContact({ ...data.contact, email: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-md px-4 py-2 focus:ring-[#1dbf73] focus:border-[#1dbf73]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
              <input 
                type="url" 
                value={data.contact.website}
                onChange={e => updateContact({ ...data.contact, website: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-md px-4 py-2 focus:ring-[#1dbf73] focus:border-[#1dbf73]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <textarea 
                rows={3}
                value={data.contact.location}
                onChange={e => updateContact({ ...data.contact, location: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-md px-4 py-2 focus:ring-[#1dbf73] focus:border-[#1dbf73]"
              />
            </div>

            <hr className="my-8 border-gray-200" />
            
            <h2 className="text-xl font-bold mb-4">Default Social Platforms</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Username</label>
                <input 
                  type="text" 
                  value={data.contact.facebookUsername || ''}
                  onChange={e => updateContact({ ...data.contact, facebookUsername: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-md px-4 py-2 focus:ring-[#1dbf73] focus:border-[#1dbf73]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                <input 
                  type="url" 
                  value={data.contact.facebookUrl || ''}
                  onChange={e => updateContact({ ...data.contact, facebookUrl: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-md px-4 py-2 focus:ring-[#1dbf73] focus:border-[#1dbf73]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Username</label>
                <input 
                  type="text" 
                  value={data.contact.instagramUsername || ''}
                  onChange={e => updateContact({ ...data.contact, instagramUsername: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-md px-4 py-2 focus:ring-[#1dbf73] focus:border-[#1dbf73]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                <input 
                  type="url" 
                  value={data.contact.instagramUrl || ''}
                  onChange={e => updateContact({ ...data.contact, instagramUrl: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-md px-4 py-2 focus:ring-[#1dbf73] focus:border-[#1dbf73]"
                />
              </div>
            </div>

            <hr className="my-8 border-gray-200" />
            
            <h2 className="text-xl font-bold mb-4">Additional Social Platforms</h2>
            
            <form onSubmit={handleAddPlatform} className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
              <h3 className="font-bold mb-4 text-gray-800">Add New Platform</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input 
                  type="text" 
                  placeholder="Platform Name (e.g., LinkedIn)" 
                  value={newPlatform.platformName} 
                  onChange={e => setNewPlatform({...newPlatform, platformName: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-[#1dbf73] focus:border-[#1dbf73]"
                  required
                />
                <input 
                  type="text" 
                  placeholder="Your Name/Handle (e.g., John Doe)" 
                  value={newPlatform.userName} 
                  onChange={e => setNewPlatform({...newPlatform, userName: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-[#1dbf73] focus:border-[#1dbf73]"
                  required
                />
                <input 
                  type="url" 
                  placeholder="Profile URL" 
                  value={newPlatform.url} 
                  onChange={e => setNewPlatform({...newPlatform, url: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-[#1dbf73] focus:border-[#1dbf73]"
                  required
                />
                <div className="w-full">
                  <input 
                    type="file" 
                    accept="image/*"
                    ref={platformFileInputRef}
                    disabled={isUploading}
                    onChange={e => handleImageUpload(e, url => setNewPlatform({...newPlatform, logoUrl: url}))}
                    className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 focus:ring-[#1dbf73] focus:border-[#1dbf73] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#1dbf73] file:text-white hover:file:bg-[#19a463] cursor-pointer disabled:opacity-50"
                  />
                  {isUploading && <p className="text-sm text-[#1dbf73] mt-2 animate-pulse">Uploading image...</p>}
                  {newPlatform.logoUrl && (
                    <div className="mt-2 w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                      <img src={newPlatform.logoUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isUploading}
                className="bg-[#1dbf73] text-white px-6 py-2 rounded-md hover:bg-[#19a463] transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
              >
                <Plus size={18} /> Add Platform
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(data.platforms || []).map(platform => (
                <div key={platform.id} className={`bg-white p-6 rounded-xl border ${platform.hidden ? 'border-gray-200 opacity-60' : 'border-gray-200'} shadow-sm relative group`}>
                  {editingPlatform === platform.id ? (
                    <div className="space-y-4">
                      <input 
                        type="text" 
                        value={platform.platformName} 
                        onChange={e => updatePlatform(platform.id, { platformName: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#1dbf73] focus:border-[#1dbf73]"
                      />
                      <input 
                        type="text" 
                        value={platform.userName} 
                        onChange={e => updatePlatform(platform.id, { userName: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#1dbf73] focus:border-[#1dbf73]"
                      />
                      <input 
                        type="url" 
                        value={platform.url} 
                        onChange={e => updatePlatform(platform.id, { url: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#1dbf73] focus:border-[#1dbf73]"
                      />
                      <button 
                        onClick={() => setEditingPlatform(null)}
                        className="bg-[#1dbf73] text-white px-4 py-2 rounded-md hover:bg-[#19a463] transition-colors w-full flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <Check size={16} /> Save Changes
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                          <img src={platform.logoUrl} alt={platform.platformName} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-lg truncate">{platform.platformName}</h3>
                          <p className="text-gray-500 text-sm truncate">{platform.userName}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 truncate mb-4">{platform.url}</p>
                      
                      <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                        <button 
                          onClick={() => updatePlatform(platform.id, { hidden: !platform.hidden })}
                          className={`p-2 rounded-md transition-colors ${platform.hidden ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                          title={platform.hidden ? "Show" : "Hide"}
                        >
                          {platform.hidden ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button 
                          onClick={() => setEditingPlatform(platform.id)}
                          className="text-gray-500 hover:text-[#1dbf73] p-2 bg-gray-50 hover:bg-green-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeletePlatform(platform.id)}
                          className="text-gray-500 hover:text-red-500 p-2 bg-gray-50 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* SKILLS TAB */}
        {activeTab === 'Skills' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-xl font-bold mb-4">Software Skills</h2>
            <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row gap-4 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex-1">
                <input 
                  type="text" placeholder="Skill Name (e.g. Photoshop)" required
                  value={newSkill.name} onChange={e => setNewSkill({...newSkill, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                />
              </div>
              <div className="w-full sm:w-32">
                <input 
                  type="number" placeholder="%" min="0" max="100" required
                  value={newSkill.percentage} onChange={e => setNewSkill({...newSkill, percentage: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                />
              </div>
              <button type="submit" className="bg-[#1dbf73] text-white px-4 py-2 rounded-md font-bold flex items-center justify-center gap-2">
                <Plus size={18} /> Add
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.skills.map(skill => (
                <div key={skill.id} className={`flex items-center justify-between p-4 border rounded-lg transition-opacity ${skill.hidden ? 'border-gray-300 opacity-60 bg-gray-50' : 'border-gray-200'}`}>
                  {editingSkill === skill.id ? (
                    <div className="flex-1 flex gap-2">
                      <input 
                        type="text" 
                        value={skill.name} 
                        onChange={e => updateSkill(skill.id, { name: e.target.value })}
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                      <input 
                        type="number" 
                        value={skill.percentage} 
                        onChange={e => updateSkill(skill.id, { percentage: Number(e.target.value) })}
                        className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                      <button onClick={() => setEditingSkill(null)} className="text-[#1dbf73] p-1"><Check size={18} /></button>
                    </div>
                  ) : (
                    <>
                      <div className="break-words pr-4 flex items-center gap-2">
                        {skill.hidden && <span className="bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">HIDDEN</span>}
                        <div>
                          <p className="font-bold">{skill.name}</p>
                          <p className="text-sm text-gray-500">{skill.percentage}%</p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <div className="flex flex-col border-r border-gray-200 pr-2 mr-1">
                          <button 
                            onClick={() => reorderSkill(skill.id, 'up')}
                            className="text-gray-400 hover:text-gray-700 p-0.5"
                            title="Move Up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button 
                            onClick={() => reorderSkill(skill.id, 'down')}
                            className="text-gray-400 hover:text-gray-700 p-0.5"
                            title="Move Down"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>
                        <button 
                          onClick={() => updateSkill(skill.id, { hidden: !skill.hidden })}
                          className={`p-2 rounded-md ${skill.hidden ? 'text-gray-500 hover:bg-gray-200' : 'text-[#1dbf73] hover:bg-green-50'}`}
                          title={skill.hidden ? "Show on portfolio" : "Hide from portfolio"}
                        >
                          {skill.hidden ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button onClick={() => setEditingSkill(skill.id)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-md"><Edit2 size={18} /></button>
                        <button onClick={() => handleDeleteSkill(skill.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-md"><Trash2 size={18} /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* EXPERIENCE TAB */}
        {activeTab === 'Experience' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-xl font-bold mb-4">Experience & Collaborations</h2>
            <form onSubmit={handleAddExp} className="flex flex-col sm:flex-row gap-4 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex-1">
                <input 
                  type="text" placeholder="Experience Title (e.g. Wings Designs)" required
                  value={newExp.title} onChange={e => setNewExp({title: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                />
              </div>
              <button type="submit" className="bg-[#1dbf73] text-white px-4 py-2 rounded-md font-bold flex items-center justify-center gap-2 shrink-0">
                <Plus size={18} /> Add
              </button>
            </form>

            <div className="space-y-3">
              {data.experiences.map(exp => (
                <div key={exp.id} className={`flex items-center justify-between p-4 border rounded-lg transition-opacity ${exp.hidden ? 'border-gray-300 opacity-60 bg-gray-50' : 'border-gray-200'}`}>
                  {editingExp === exp.id ? (
                    <div className="flex-1 flex gap-2">
                      <input 
                        type="text" 
                        value={exp.title} 
                        onChange={e => updateExperience(exp.id, { title: e.target.value })}
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                      <button onClick={() => setEditingExp(null)} className="text-[#1dbf73] p-1"><Check size={18} /></button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 pr-4 break-words">
                        {exp.hidden && <span className="bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">HIDDEN</span>}
                        <p className="font-medium">{exp.title}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button 
                          onClick={() => updateExperience(exp.id, { hidden: !exp.hidden })}
                          className={`p-2 rounded-md ${exp.hidden ? 'text-gray-500 hover:bg-gray-200' : 'text-[#1dbf73] hover:bg-green-50'}`}
                          title={exp.hidden ? "Show on portfolio" : "Hide from portfolio"}
                        >
                          {exp.hidden ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button onClick={() => setEditingExp(exp.id)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-md"><Edit2 size={18} /></button>
                        <button onClick={() => handleDeleteExp(exp.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-md"><Trash2 size={18} /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* EDUCATION TAB */}
        {activeTab === 'Education' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-xl font-bold mb-4">Education</h2>
            <form onSubmit={handleAddEdu} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <input 
                type="text" placeholder="Degree (e.g. BA Animation)" required
                value={newEdu.degree} onChange={e => setNewEdu({...newEdu, degree: e.target.value})}
                className="border border-gray-300 rounded-md px-4 py-2"
              />
              <input 
                type="text" placeholder="Institution" required
                value={newEdu.institution} onChange={e => setNewEdu({...newEdu, institution: e.target.value})}
                className="border border-gray-300 rounded-md px-4 py-2"
              />
              <div className="flex gap-4">
                <input 
                  type="text" placeholder="Status (e.g. UG)" 
                  value={newEdu.status} onChange={e => setNewEdu({...newEdu, status: e.target.value})}
                  className="flex-1 border border-gray-300 rounded-md px-4 py-2"
                />
                <button type="submit" className="bg-[#1dbf73] text-white px-4 py-2 rounded-md font-bold flex items-center justify-center gap-2 shrink-0">
                  <Plus size={18} /> Add
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {data.educations.map(edu => (
                <div key={edu.id} className={`flex items-center justify-between p-4 border rounded-lg transition-opacity ${edu.hidden ? 'border-gray-300 opacity-60 bg-gray-50' : 'border-gray-200'}`}>
                  {editingEdu === edu.id ? (
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={edu.degree} 
                          onChange={e => updateEducation(edu.id, { degree: e.target.value })}
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                          placeholder="Degree"
                        />
                        <input 
                          type="text" 
                          value={edu.status} 
                          onChange={e => updateEducation(edu.id, { status: e.target.value })}
                          className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                          placeholder="Status"
                        />
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={edu.institution} 
                          onChange={e => updateEducation(edu.id, { institution: e.target.value })}
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                          placeholder="Institution"
                        />
                        <button onClick={() => setEditingEdu(null)} className="text-[#1dbf73] p-1"><Check size={18} /></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="break-words pr-4 flex items-start gap-2">
                        {edu.hidden && <span className="bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded mt-1">HIDDEN</span>}
                        <div>
                          <p className="font-bold">{edu.degree} <span className="text-sm text-[#1dbf73] ml-2">{edu.status}</span></p>
                          <p className="text-sm text-gray-600">{edu.institution}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button 
                          onClick={() => updateEducation(edu.id, { hidden: !edu.hidden })}
                          className={`p-2 rounded-md ${edu.hidden ? 'text-gray-500 hover:bg-gray-200' : 'text-[#1dbf73] hover:bg-green-50'}`}
                          title={edu.hidden ? "Show on portfolio" : "Hide from portfolio"}
                        >
                          {edu.hidden ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button onClick={() => setEditingEdu(edu.id)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-md"><Edit2 size={18} /></button>
                        <button onClick={() => handleDeleteEdu(edu.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-md"><Trash2 size={18} /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* PORTFOLIO TAB */}
        {activeTab === 'Portfolio' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Portfolio Artworks</h2>
            </div>

            <form 
              onSubmit={handleAddArt} 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, url => setNewArt({...newArt, imageUrl: url}))}
              className={`grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 p-4 rounded-lg border transition-colors ${isDragging ? 'bg-green-50 border-[#1dbf73] border-dashed' : 'bg-gray-50 border-gray-200'} items-start`}
            >
              <div>
                <input 
                  type="text" placeholder="Title" required
                  value={newArt.title} onChange={e => setNewArt({...newArt, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                />
              </div>
              <div>
                <input 
                  type="text" placeholder="Category" required
                  value={newArt.category} onChange={e => setNewArt({...newArt, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                />
              </div>
              <div className="relative">
                <input 
                  type="file" accept="image/*" required={!newArt.imageUrl}
                  ref={artFileInputRef}
                  disabled={isUploading}
                  onChange={e => handleImageUpload(e, url => setNewArt({...newArt, imageUrl: url}))}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#1dbf73] file:text-white hover:file:bg-[#19a463] cursor-pointer disabled:opacity-50"
                />
                {isDragging && (
                  <div className="absolute inset-0 bg-[#1dbf73]/10 border-2 border-[#1dbf73] border-dashed rounded-md flex items-center justify-center pointer-events-none">
                    <span className="text-[#1dbf73] font-bold text-sm">Drop image here</span>
                  </div>
                )}
                {isUploading && <p className="text-xs text-[#1dbf73] mt-1 animate-pulse">Uploading...</p>}
                {!isUploading && newArt.imageUrl && <p className="text-xs text-[#1dbf73] mt-1 font-medium">Image ready</p>}
              </div>
              <button type="submit" disabled={isUploading} className="bg-[#1dbf73] text-white px-4 py-2 rounded-md font-bold flex items-center justify-center gap-2 h-[42px] disabled:opacity-50">
                <Plus size={18} /> Add Art
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.arts.map((art, index) => (
                <div key={art.id} className={`group relative rounded-lg overflow-hidden border ${art.hidden ? 'border-gray-300 opacity-60' : 'border-gray-200'} flex flex-col transition-opacity`}>
                  {editingArt === art.id ? (
                    <div className="p-4 space-y-3 bg-gray-50 flex-1">
                      <div className="relative aspect-video rounded overflow-hidden border border-gray-200">
                        <img src={art.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                          <Upload className="text-white" size={24} />
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={e => handleImageUpload(e, url => updateArt(art.id, { imageUrl: url }))}
                          />
                        </label>
                      </div>
                      <input 
                        type="text" 
                        value={art.title} 
                        onChange={e => updateArt(art.id, { title: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="Title"
                      />
                      <input 
                        type="text" 
                        value={art.category} 
                        onChange={e => updateArt(art.id, { category: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="Category"
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingArt(null)} className="bg-[#1dbf73] text-white px-3 py-1 rounded text-sm font-bold flex items-center gap-1">
                          <Check size={14} /> Done
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <img src={art.imageUrl} alt={art.title} className="w-full aspect-video object-cover" referrerPolicy="no-referrer" loading="lazy" />
                      <div className="p-4 break-words flex-1 flex flex-col justify-end">
                        <p className="text-[10px] text-[#1dbf73] font-bold uppercase tracking-[0.2em] mb-0.5">{art.category}</p>
                        <p className="font-black text-lg leading-tight tracking-tight">{art.title}</p>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex bg-white rounded-md shadow-sm overflow-hidden border border-gray-100 mr-1">
                          <button 
                            onClick={() => reorderArt(art.id, 'top')}
                            disabled={index === 0}
                            className="p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move to Top"
                          >
                            <ArrowUpToLine size={16} />
                          </button>
                          <div className="w-px bg-gray-200"></div>
                          <button 
                            onClick={() => reorderArt(art.id, 'up')}
                            disabled={index === 0}
                            className="p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move Up"
                          >
                            <ArrowUp size={16} />
                          </button>
                          <div className="w-px bg-gray-200"></div>
                          <button 
                            onClick={() => reorderArt(art.id, 'down')}
                            disabled={index === data.arts.length - 1}
                            className="p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move Down"
                          >
                            <ArrowDown size={16} />
                          </button>
                          <div className="w-px bg-gray-200"></div>
                          <button 
                            onClick={() => reorderArt(art.id, 'bottom')}
                            disabled={index === data.arts.length - 1}
                            className="p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move to Bottom"
                          >
                            <ArrowDownToLine size={16} />
                          </button>
                        </div>
                        <button 
                          onClick={() => updateArt(art.id, { hidden: !art.hidden })}
                          className={`bg-white p-2 rounded-md shadow-sm ${art.hidden ? 'text-gray-500 hover:bg-gray-50' : 'text-[#1dbf73] hover:bg-green-50'}`}
                          title={art.hidden ? "Show on portfolio" : "Hide from portfolio"}
                        >
                          {art.hidden ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button 
                          onClick={() => setEditingArt(art.id)}
                          className="bg-white text-blue-500 p-2 rounded-md shadow-sm hover:bg-blue-50"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteArt(art.id)}
                          className="bg-white text-red-500 p-2 rounded-md shadow-sm hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      {art.hidden && (
                        <div className="absolute top-2 left-2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                          HIDDEN
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
              {data.arts.length === 0 && (
                <div className="col-span-full p-8 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
                  No artworks found. Add some above!
                </div>
              )}
            </div>
          </motion.div>
        )}



      </div>

      {/* Modals */}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-2 text-gray-900">Notice</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button onClick={() => setError(null)} className="w-full bg-[#1dbf73] hover:bg-[#19a463] text-white py-2 rounded-lg font-bold transition-colors">OK</button>
          </motion.div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-2 text-gray-900">Confirm Action</h3>
            <p className="text-gray-600 mb-6">{confirmAction.message}</p>
            <div className="flex gap-4">
              <button onClick={() => setConfirmAction(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-bold transition-colors">Cancel</button>
              <button onClick={() => { confirmAction.onConfirm(); setConfirmAction(null); }} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-bold transition-colors">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
