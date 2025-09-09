"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { getPersonalityData, getAllTypes } from '@/lib/personalityData';
import AboutPageContent from '@/components/AboutPageContent';

export default function PersonalityTypePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [personalityData, setPersonalityData] = useState(null);
  const [userStoredType, setUserStoredType] = useState('');

  const readStoredType = () => {
    if (typeof window === 'undefined') return '';
    try {
      return (localStorage.getItem('mindshift_personality_type') || '').toUpperCase();
    } catch {
      return '';
    }
  };

  const handleInvalidType = useCallback((storedType) => {
    if (storedType) {
      // Redirect to user's stored type
      router.replace(`/about/${storedType.toLowerCase()}`);
    } else {
      // No stored type - redirect to main about page for type selection
      router.replace('/about');
    }
  }, [router]);

  useEffect(() => {
    // Get the type from URL params
    const typeFromUrl = params?.type?.toUpperCase();
    
    // Get user's stored type from localStorage
    const storedType = readStoredType();
    setUserStoredType(storedType);

    // Validate the URL type parameter
    if (typeFromUrl) {
      const data = getPersonalityData(typeFromUrl);
      if (data) {
        // Valid type - show the page
        setPersonalityData({ type: typeFromUrl, ...data });
        setLoading(false);
        return;
      } else {
        // Invalid type - redirect to fallback
        console.log('Invalid personality type:', typeFromUrl);
        handleInvalidType(storedType);
        return;
      }
    }

    // No type parameter - shouldn't happen with dynamic routes, but handle gracefully
    handleInvalidType(storedType);
  }, [params, router, handleInvalidType]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-green-900 border-t-transparent rounded-full mx-auto mb-3"></div>
          <div className="text-sm text-neutral-600">Loading personality profile...</div>
        </div>
      </div>
    );
  }

  if (!personalityData) {
    return null; // Will redirect in useEffect
  }

  return (
    <AboutPageContent 
      personalityData={personalityData}
      isOwnType={personalityData.type === userStoredType}
      userStoredType={userStoredType}
    />
  );
}

