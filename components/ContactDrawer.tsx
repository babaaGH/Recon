'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface LinkedInTarget {
  name: string;
  title: string;
  linkedinUrl: string;
  snippet: string;
  location: string;
  connection: string;
}

interface ContactDrawerProps {
  contacts: LinkedInTarget[];
  isOpen: boolean;
  onClose: () => void;
  onResearch: (contact: LinkedInTarget) => void;
}

export default function ContactDrawer({ contacts, isOpen, onClose, onResearch }: ContactDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'c-suite' | 'vp' | 'director'>('all');

  // Filter contacts based on search and role filter
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.title.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterRole === 'all') return true;

    const titleLower = contact.title.toLowerCase();
    if (filterRole === 'c-suite') {
      return titleLower.includes('ceo') || titleLower.includes('cfo') ||
             titleLower.includes('cto') || titleLower.includes('cio') ||
             titleLower.includes('coo') || titleLower.includes('chief');
    }
    if (filterRole === 'vp') {
      return titleLower.includes('vp') || titleLower.includes('vice president');
    }
    if (filterRole === 'director') {
      return titleLower.includes('director') || titleLower.includes('head of');
    }

    return true;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xl z-40"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full md:w-[800px] bg-[#0a0f1e]/95 backdrop-blur-xl border-l border-white/10 z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="border-b border-white/10 p-6 bg-[var(--dark-slate)]/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">All Contacts</h2>
                  <p className="text-sm opacity-60 mt-1">
                    {filteredContacts.length} of {contacts.length} contacts
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-2xl opacity-60 hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>

              {/* Search & Filters */}
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Search by name or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 rounded bg-black/40 border border-white/10 text-sm font-mono focus:outline-none focus:border-[#4a9eff] transition-colors"
                />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as any)}
                  className="px-4 py-2 rounded bg-black/40 border border-white/10 text-sm font-mono focus:outline-none focus:border-[#4a9eff] transition-colors"
                >
                  <option value="all">All Roles</option>
                  <option value="c-suite">C-Suite</option>
                  <option value="vp">VP Level</option>
                  <option value="director">Directors</option>
                </select>
              </div>
            </div>

            {/* High-Density Contact Table */}
            <div className="flex-1 overflow-y-auto">
              {/* Table Header */}
              <div className="sticky top-0 bg-[var(--dark-slate)]/90 backdrop-blur-sm border-b border-white/10 z-10">
                <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold uppercase tracking-wider opacity-60">
                  <div className="col-span-4">Name</div>
                  <div className="col-span-5">Role</div>
                  <div className="col-span-2">Location</div>
                  <div className="col-span-1 text-center">Action</div>
                </div>
              </div>

              {/* Table Body - Condensed Rows with Zebra Striping */}
              <div className="font-mono text-sm">
                {filteredContacts.map((contact, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`grid grid-cols-12 gap-4 px-6 py-3 items-center border-b border-white/5 hover:bg-[#4a9eff]/5 transition-colors cursor-pointer ${
                      index % 2 === 0 ? 'bg-black/20' : 'bg-transparent'
                    }`}
                    style={{ height: '48px' }}
                  >
                    {/* Name */}
                    <div className="col-span-4 truncate">
                      <a
                        href={contact.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[#e5e7eb] hover:text-[#4a9eff] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {contact.name}
                      </a>
                      <div className="text-xs opacity-40 mt-0.5">
                        {contact.connection} connection
                      </div>
                    </div>

                    {/* Role */}
                    <div className="col-span-5 truncate text-sm opacity-80">
                      {contact.title}
                    </div>

                    {/* Location */}
                    <div className="col-span-2 truncate text-xs opacity-60">
                      {contact.location}
                    </div>

                    {/* Research Button */}
                    <div className="col-span-1 flex justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onResearch(contact);
                        }}
                        className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wide bg-[#4a9eff] bg-opacity-10 text-[#4a9eff] hover:bg-opacity-20 transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Empty State */}
              {filteredContacts.length === 0 && (
                <div className="text-center py-12 opacity-60">
                  <div className="text-sm">No contacts match your search criteria</div>
                </div>
              )}
            </div>

            {/* Footer Stats */}
            <div className="border-t border-white/10 p-4 bg-[var(--dark-slate)]/50">
              <div className="flex items-center justify-between text-xs opacity-60 font-mono">
                <div>
                  {filteredContacts.filter(c => c.title.toLowerCase().includes('chief') ||
                    c.title.toLowerCase().includes('ceo') || c.title.toLowerCase().includes('cfo')).length} C-Suite •{' '}
                  {filteredContacts.filter(c => c.title.toLowerCase().includes('vp') ||
                    c.title.toLowerCase().includes('vice president')).length} VPs •{' '}
                  {filteredContacts.filter(c => c.title.toLowerCase().includes('director')).length} Directors
                </div>
                <div>Mission Control Terminal</div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
