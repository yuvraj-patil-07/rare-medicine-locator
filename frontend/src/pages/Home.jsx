import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiSearch, HiLocationMarker, HiShieldCheck, HiLightningBolt } from 'react-icons/hi';
import SearchBar from '../components/common/SearchBar';

const Home = () => {
  const navigate = useNavigate();

  const handleSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const features = [
    {
      icon: HiLocationMarker,
      title: 'Geospatial Search',
      description: 'Find medicines in pharmacies near your exact location instantly using advanced 2dsphere mapping.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      icon: HiLightningBolt,
      title: 'Real-time Stock',
      description: 'Check live inventory status before visiting to ensure your critical medicine is actually available.',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    {
      icon: HiShieldCheck,
      title: 'Verified Pharmacies',
      description: 'All pharmacies on our platform undergo strict verification for authenticity and reliability.',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium mb-8 border border-primary-100 dark:border-primary-800/50"
          >
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
            Discover Rare Medicines Instantly
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-extrabold tracking-tight mb-6 text-balance"
          >
            Find Critical Healthcare <br className="hidden md:block" />
            <span className="gradient-text">When It Matters Most</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-surface-600 dark:text-surface-300 max-w-3xl mx-auto mb-10 text-balance"
          >
            Locate rare medicines, check real-time stock at nearby pharmacies, and reserve them instantly. Your health should never wait.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-2xl mx-auto relative z-20"
          >
            <SearchBar onSearch={handleSearch} placeholder="Search for any medicine, generic name, or brand..." />
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-primary-500/20 rounded-full blur-[100px] -z-10 mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-accent-500/20 rounded-full blur-[100px] -z-10 mix-blend-multiply dark:mix-blend-screen"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-surface-50 dark:bg-surface-900/50 border-y border-surface-200 dark:border-surface-800 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Why Choose MedLocator?</h2>
            <p className="section-subtitle mx-auto">We bridge the gap between critical patients and life-saving medicines through technology.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-surface-600 dark:text-surface-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-10 dark:opacity-20"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Are you a Pharmacy Owner?</h2>
          <p className="text-xl text-surface-600 dark:text-surface-300 mb-10 max-w-2xl mx-auto">
            Join our network to list your rare inventory, reach more patients, and manage your stock digitally.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary w-full sm:w-auto text-lg px-8">
              Register Pharmacy
            </Link>
            <Link to="/login" className="btn-ghost w-full sm:w-auto text-lg px-8">
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
