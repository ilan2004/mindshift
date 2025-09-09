"use client";

import Link from 'next/link';
import Image from 'next/image';
import { getAllTypes, getImagePath } from '@/lib/personalityData';
import { useMemo, useState } from 'react';

const CLUSTERS = [
  { id: 'all', name: 'All' },
  { id: 'analysts', name: 'Analysts' },
  { id: 'diplomats', name: 'Diplomats' },
  { id: 'achievers', name: 'Achievers' },
  { id: 'explorers', name: 'Explorers' }
];

export default function PersonalityGrid({ currentType, genderPreference = 'male' }) {
  const [filter, setFilter] = useState('all');
  const all = useMemo(() => getAllTypes(), []);
  const list = useMemo(() => {
    if (filter === 'all') return all;
    return all.filter(t => t.cluster === filter);
  }, [filter, all]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {CLUSTERS.map(c => (
          <button
            key={c.id}
            className={`nav-pill ${filter === c.id ? 'nav-pill--primary' : ''}`}
            onClick={() => setFilter(c.id)}
            aria-pressed={filter === c.id}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {list.map(t => (
          <Link
            key={t.type}
            href={`/about/${t.type.toLowerCase()}`}
            className={`block p-3 rounded-lg border transition-all ${
              t.type === currentType ? 'border-green-900' : 'border-neutral-200 hover:border-green-900'
            }`}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-20 h-20 relative rounded-lg overflow-hidden">
                <Image
                  src={getImagePath(t.type, genderPreference)}
                  alt={`${t.type} character`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="font-semibold text-neutral-800">{t.type}</div>
              <div className="text-xs text-neutral-600">{t.title}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

