"use client";

import Link from 'next/link';
import Image from 'next/image';
import { getAllTypes, getImagePath } from '@/lib/personalityData';
import { getVideoPath, hasVideo } from '@/lib/assets';
import { useMemo, useState, useRef } from 'react';

const CLUSTERS = [
  { id: 'all', name: 'All' },
  { id: 'analysts', name: 'Analysts' },
  { id: 'diplomats', name: 'Diplomats' },
  { id: 'achievers', name: 'Achievers' },
  { id: 'explorers', name: 'Explorers' }
];

export default function PersonalityGrid({ currentType, genderPreference = 'male' }) {
  const [filter, setFilter] = useState('all');
  const [hoveredType, setHoveredType] = useState(null);
  const videoRefs = useRef({});
  
  const all = useMemo(() => getAllTypes(), []);
  const list = useMemo(() => {
    if (filter === 'all') return all;
    return all.filter(t => t.cluster === filter);
  }, [filter, all]);
  
  const handleMouseEnter = (type) => {
    setHoveredType(type);
    const genderCode = genderPreference === 'female' ? 'W' : 'M';
    const videoRef = videoRefs.current[type];
    if (videoRef && hasVideo(type, genderCode)) {
      videoRef.play().catch(() => {});
    }
  };
  
  const handleMouseLeave = (type) => {
    setHoveredType(null);
    const videoRef = videoRefs.current[type];
    if (videoRef) {
      videoRef.pause();
      videoRef.currentTime = 0;
    }
  };

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
            className={`block p-3 rounded-lg border transition-all hover:transform hover:scale-105 ${
              t.type === currentType ? 'border-green-900' : 'border-neutral-200 hover:border-green-900'
            }`}
            style={{
              background: 'var(--surface)',
              boxShadow: t.type === currentType 
                ? '0 4px 0 var(--color-green-900), 0 8px 16px rgba(3, 89, 77, 0.2)'
                : '0 2px 0 var(--color-green-900), 0 4px 8px rgba(3, 89, 77, 0.1)'
            }}
            onMouseEnter={() => handleMouseEnter(t.type)}
            onMouseLeave={() => handleMouseLeave(t.type)}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200">
                {(() => {
                  const genderCode = genderPreference === 'female' ? 'W' : 'M';
                  const videoPath = getVideoPath(t.type, genderCode);
                  const showVideo = hoveredType === t.type && videoPath;
                  
                  return (
                    <>
                      {/* Image Layer */}
                      <div className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
                        showVideo ? 'opacity-0' : 'opacity-100'
                      }`}>
                        <Image
                          src={getImagePath(t.type, genderPreference)}
                          alt={`${t.type} character`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      {/* Video Layer */}
                      {videoPath && (
                        <div className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
                          showVideo ? 'opacity-100' : 'opacity-0'
                        }`}>
                          <video
                            ref={(ref) => {
                              if (ref) videoRefs.current[t.type] = ref;
                            }}
                            src={videoPath}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            loop
                            onError={() => console.warn(`Video failed to load: ${videoPath}`)}
                          />
                        </div>
                      )}
                      
                      {/* Video indicator - more subtle */}
                      {hasVideo(t.type, genderCode) && (
                        <div className="absolute top-1 right-1">
                          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            showVideo 
                              ? 'bg-red-400 animate-pulse scale-110' 
                              : 'bg-green-400 animate-pulse'
                          }`}></div>
                        </div>
                      )}
                    </>
                  );
                })()}
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

