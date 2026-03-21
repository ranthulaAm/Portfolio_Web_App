import { motion, AnimatePresence } from 'motion/react';
import { usePortfolioData, Art } from '../hooks/usePortfolioData';
import { Mail, Phone, Globe, MapPin, MessageSquare, Facebook, Instagram, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Home() {
  const { data, loading } = usePortfolioData();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedArt, setSelectedArt] = useState<Art | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    if (!loading && data) {
      // Preload hero image and wait for it
      if (data.heroImage) {
        const img = new Image();
        img.src = data.heroImage;
        img.onload = () => setImageLoaded(true);
        img.onerror = () => setImageLoaded(true); // Fallback if image fails
      } else {
        setImageLoaded(true);
      }

      // Preload portfolio images (background)
      if (data.arts && data.arts.length > 0) {
        data.arts.forEach((art: any) => {
          if (!art.hidden && art.imageUrl) {
            const img = new Image();
            img.src = art.imageUrl;
          }
        });
      }
    }
  }, [data, loading]);

  if (loading || !imageLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--primary)]">
        <div className="w-12 h-12 border-4 border-[var(--secondary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneNumber = data.contact.phone.replace(/[^0-9]/g, '');
    const text = `Hello! My name is ${formData.name}.\nEmail: ${formData.email}\n\nMessage: ${formData.message}`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedText}`, '_blank');
  };

  const titles = data.sectionTitles || {
    skills: "Software Skills",
    experience: "Experience & Education",
    portfolio: "Featured Work",
    portfolioSub: "A selection of my recent digital creations, manipulations, and illustrations.",
    contact: "Let's work together",
    contactSub: "Interested in collaborating or have a project in mind? Feel free to reach out. I'm always open to discussing new projects and creative ideas."
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(10px)', scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      scale: 1,
      transition: {
        duration: 1.2,
        ease: [0.21, 0.47, 0.32, 0.98] as const,
      },
    },
  };

  return (
    <main className="text-white">
      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 space-y-8 min-w-0"
        >
          <div className="space-y-4">
            <motion.h2 
              variants={itemVariants}
              className="text-[var(--secondary)] font-bold tracking-wider uppercase break-words drop-shadow-[0_0_10px_rgba(var(--secondary-rgb),0.3)]"
            >
              {data.heroTitle}
            </motion.h2>
            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-7xl font-black tracking-tight leading-tight text-white break-words"
            >
              {data.heroSubtitle.split(' ').slice(0, -2).join(' ')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--secondary)] to-emerald-300 drop-shadow-[0_0_15px_rgba(var(--secondary-rgb),0.4)]">{data.heroSubtitle.split(' ').slice(-2).join(' ')}</span>
            </motion.h1>
          </div>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-300 max-w-2xl leading-relaxed whitespace-pre-line break-words"
          >
            {data.heroBio}
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap gap-4"
          >
            <motion.a 
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(var(--secondary-rgb),0.5)" }}
              whileTap={{ scale: 0.95 }}
              href="#portfolio" 
              className="bg-[var(--secondary)] hover:opacity-90 text-white px-8 py-4 rounded-md font-bold transition-all shadow-[0_0_20px_rgba(var(--secondary-rgb),0.3)]"
            >
              View My Work
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
              whileTap={{ scale: 0.95 }}
              href="#contact" 
              className="bg-white/10 backdrop-blur-sm border border-white/10 text-white px-8 py-4 rounded-md font-bold transition-all"
            >
              Contact Me
            </motion.a>
          </motion.div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="flex-1 relative w-full max-w-md md:max-w-none mx-auto"
        >
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 flex items-center justify-center"
          >
            <img 
              src={data.heroImage} 
              alt={data.logoText} 
              className="w-full h-auto max-h-[600px] object-contain drop-shadow-[0_0_30px_rgba(var(--secondary-rgb),0.2)] transform-gpu"
              style={{ opacity: (data.heroImageOpacity ?? 100) / 100 }}
              referrerPolicy="no-referrer"
              fetchPriority="high"
              decoding="async"
            />
          </motion.div>
          {/* Decorative elements */}
          <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-[var(--secondary)] rounded-full mix-blend-screen filter blur-[80px] opacity-40 animate-blob"></div>
          <div className="absolute -top-6 -right-6 w-48 h-48 bg-emerald-400 rounded-full mix-blend-screen filter blur-[80px] opacity-30 animate-blob animation-delay-2000"></div>
        </motion.div>
      </section>

      {/* Skills & Experience */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="min-w-0 bg-[rgba(var(--primary-rgb),0.4)] p-8 rounded-3xl border border-white/5 backdrop-blur-xl">
              <h3 className="text-3xl font-black mb-8 break-words text-white">{titles.skills}</h3>
              <div className="space-y-6">
                {data.skills.filter((skill: any) => !skill.hidden).map((skill: any) => (
                  <SkillBar key={skill.id} name={skill.name} percentage={skill.percentage} />
                ))}
              </div>
            </div>
            
            <div className="min-w-0 bg-[rgba(var(--primary-rgb),0.4)] p-8 rounded-3xl border border-white/5 backdrop-blur-xl">
              <h3 className="text-3xl font-black mb-8 break-words text-white">{titles.experience}</h3>
              <div className="space-y-8">
                <div>
                  <ul className="space-y-4 text-gray-300">
                    {data.experiences.filter((exp: any) => !exp.hidden).map(exp => (
                      <li key={exp.id} className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="w-2 h-2 mt-2 rounded-full bg-[var(--secondary)] shrink-0 shadow-[0_0_8px_rgba(var(--secondary-rgb),0.8)]"></div> 
                        <span className="break-words leading-relaxed font-medium">{exp.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-4 border-t border-white/10">
                  <div className="space-y-4">
                    {data.educations.filter((edu: any) => !edu.hidden).map(edu => (
                      <div key={edu.id} className="break-words bg-white/5 p-4 rounded-xl border border-white/5">
                        <p className="font-bold text-white text-lg">{edu.degree} <span className="text-[var(--secondary)] text-sm ml-2 whitespace-nowrap bg-[var(--secondary)]/10 px-2 py-1 rounded-md">{edu.status}</span></p>
                        <p className="text-gray-400 mt-1">{edu.institution}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Gallery */}
      <section id="portfolio" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4 break-words text-white">{titles.portfolio}</h2>
          <p className="text-gray-400 max-w-2xl mx-auto break-words text-lg">{titles.portfolioSub}</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.arts.filter((art: any) => !art.hidden).map((art: any, index: number) => (
            <motion.div 
              key={art.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "100px" }}
              transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
              onClick={() => setSelectedArt(art)}
              className="group relative overflow-hidden rounded-2xl bg-[rgba(var(--primary-rgb),0.5)] aspect-square border border-white/10 shadow-2xl cursor-pointer transform-gpu"
            >
              <img 
                src={art.imageUrl} 
                alt={art.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100 will-change-transform"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                <span className="text-[var(--secondary)] font-bold text-xs mb-1 uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(var(--secondary-rgb),0.8)]">{art.category}</span>
                <h3 className="text-white text-3xl font-black tracking-tight break-words leading-tight">{art.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-0"></div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/5 p-8 md:p-12 rounded-[2.5rem] border border-white/10 backdrop-blur-xl">
            <div className="min-w-0">
              <h2 className="text-4xl md:text-5xl font-black mb-6 break-words text-white text-center">{titles.contact}</h2>
              <p className="text-gray-400 mb-12 max-w-md mx-auto break-words text-lg text-center">
                {titles.contactSub}
              </p>
              
              <div className="space-y-2 max-w-md mx-auto">
                <a 
                  href={`https://wa.me/${data.contact.phone.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group flex items-start gap-5 p-4 -mx-4 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="w-14 h-14 bg-white/5 group-hover:bg-[var(--secondary)]/20 rounded-2xl flex items-center justify-center text-[var(--secondary)] shrink-0 border border-white/10 shadow-[0_0_15px_rgba(var(--secondary-rgb),0.1)] transition-colors">
                    <Phone size={24} />
                  </div>
                  <div className="min-w-0 pt-2">
                    <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-bold">Phone / WhatsApp</p>
                    <p className="font-medium group-hover:text-[var(--secondary)] transition-colors break-all inline-block text-xl text-gray-200">
                      {data.contact.phone}
                    </p>
                  </div>
                </a>
                
                <a 
                  href={`mailto:${data.contact.email}`}
                  className="group flex items-start gap-5 p-4 -mx-4 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="w-14 h-14 bg-white/5 group-hover:bg-[var(--secondary)]/20 rounded-2xl flex items-center justify-center text-[var(--secondary)] shrink-0 border border-white/10 shadow-[0_0_15px_rgba(var(--secondary-rgb),0.1)] transition-colors">
                    <Mail size={24} />
                  </div>
                  <div className="min-w-0 pt-2">
                    <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-bold">Email</p>
                    <p className="font-medium group-hover:text-[var(--secondary)] transition-colors break-all inline-block text-xl text-gray-200">
                      {data.contact.email}
                    </p>
                  </div>
                </a>
                
                <a 
                  href={data.contact.website} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="group flex items-start gap-5 p-4 -mx-4 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="w-14 h-14 bg-white/5 group-hover:bg-[var(--secondary)]/20 rounded-2xl flex items-center justify-center text-[var(--secondary)] shrink-0 border border-white/10 shadow-[0_0_15px_rgba(var(--secondary-rgb),0.1)] transition-colors">
                    <Globe size={24} />
                  </div>
                  <div className="min-w-0 pt-2">
                    <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-bold">Portfolio</p>
                    <p className="font-medium group-hover:text-[var(--secondary)] transition-colors break-all inline-block text-xl text-gray-200">
                      {data.contact.website.replace(/^https?:\/\//, '')}
                    </p>
                  </div>
                </a>
                
                <div className="flex items-start gap-5 p-4 -mx-4">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-[var(--secondary)] shrink-0 border border-white/10 shadow-[0_0_15px_rgba(var(--secondary-rgb),0.1)]">
                    <MapPin size={24} />
                  </div>
                  <div className="min-w-0 pt-2">
                    <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-bold">Location</p>
                    <p className="font-medium whitespace-pre-line break-words text-lg text-gray-200">{data.contact.location}</p>
                  </div>
                </div>

                <a 
                  href="https://web.facebook.com/Ranthula.senmith" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-start gap-5 p-4 -mx-4 rounded-2xl hover:bg-[#1877F2]/10 transition-colors cursor-pointer"
                >
                  <div className="w-14 h-14 bg-white/5 group-hover:bg-[#1877F2]/20 rounded-2xl flex items-center justify-center text-[#1877F2] shrink-0 border border-white/10 shadow-[0_0_15px_rgba(24,119,242,0.1)] transition-colors">
                    <Facebook size={24} />
                  </div>
                  <div className="min-w-0 pt-2">
                    <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-bold">Facebook</p>
                    <p className="font-medium group-hover:text-[#1877F2] transition-colors break-all inline-block text-xl text-gray-200">
                      Ranthula.senmith
                    </p>
                  </div>
                </a>

                <a 
                  href="https://www.instagram.com/_razor_s/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-start gap-5 p-4 -mx-4 rounded-2xl hover:bg-[#E1306C]/10 transition-colors cursor-pointer"
                >
                  <div className="w-14 h-14 bg-white/5 group-hover:bg-[#E1306C]/20 rounded-2xl flex items-center justify-center text-[#E1306C] shrink-0 border border-white/10 shadow-[0_0_15px_rgba(225,48,108,0.1)] transition-colors">
                    <Instagram size={24} />
                  </div>
                  <div className="min-w-0 pt-2">
                    <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-bold">Instagram</p>
                    <p className="font-medium group-hover:text-[#E1306C] transition-colors break-all inline-block text-xl text-gray-200">
                      _razor_s
                    </p>
                  </div>
                </a>

                {data.platforms && data.platforms.filter(p => !p.hidden).map(platform => (
                  <a 
                    key={platform.id}
                    href={platform.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-start gap-5 p-4 -mx-4 rounded-2xl hover:bg-[var(--secondary)]/10 transition-colors cursor-pointer"
                  >
                    <div className="w-14 h-14 bg-white/5 group-hover:bg-[var(--secondary)]/20 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-[0_0_15px_rgba(var(--secondary-rgb),0.1)] transition-colors overflow-hidden">
                      <img src={platform.logoUrl} alt={platform.platformName} className="w-8 h-8 object-contain" />
                    </div>
                    <div className="min-w-0 pt-2">
                      <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-bold">{platform.platformName}</p>
                      <p className="font-medium group-hover:text-[var(--secondary)] transition-colors break-all inline-block text-xl text-gray-200">
                        {platform.userName}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="bg-[var(--primary)] py-12 text-center text-gray-500 text-sm px-4 border-t border-white/5 relative z-10">
        <p className="break-words font-medium tracking-wide">© {new Date().getFullYear()} {data.logoType === 'text' ? data.logoText : 'Ranthula Amarasekara'}. ALL RIGHTS RESERVED.</p>
      </footer>

      {/* Art Detail Modal */}
      <AnimatePresence>
        {selectedArt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedArt(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 bg-black/90 backdrop-blur-sm"
          >
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedArt(null);
              }}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-2 rounded-full transition-all z-50"
            >
              <X size={24} />
            </button>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-full max-h-full flex flex-col items-center justify-center"
            >
              <img
                src={selectedArt.imageUrl}
                alt={selectedArt.title}
                className="max-w-full max-h-[80vh] md:max-h-[85vh] object-contain rounded-lg shadow-2xl transform-gpu"
                referrerPolicy="no-referrer"
                decoding="async"
              />
              <div className="mt-4 text-center">
                <span className="text-[var(--secondary)] font-bold text-xs mb-1 uppercase tracking-[0.2em]">{selectedArt.category}</span>
                <h3 className="text-white text-2xl font-black tracking-tight">{selectedArt.title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

interface SkillBarProps {
  name: string;
  percentage: number;
  key?: any;
}

function SkillBar({ name, percentage }: SkillBarProps) {
  return (
    <div className="min-w-0">
      <div className="flex justify-between mb-2 gap-4">
        <span className="font-bold text-gray-200 break-words flex-1 text-lg">{name}</span>
        <span className="text-[var(--secondary)] font-bold shrink-0">{percentage}%</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="bg-gradient-to-r from-[var(--secondary)] to-emerald-400 h-full rounded-full shadow-[0_0_10px_rgba(var(--secondary-rgb),0.8)] relative"
        >
          <div className="absolute inset-0 bg-white/20 w-full h-full animate-[pulse_2s_ease-in-out_infinite]"></div>
        </motion.div>
      </div>
    </div>
  );
}
