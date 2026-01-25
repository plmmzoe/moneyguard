'use client';

import { useState } from 'react';

import '../../styles/home-page.css';

import { HomePageBackground } from '@/components/gradients/home-page-background';
import { Footer } from '@/components/home/footer/footer';
import Header from '@/components/home/header/header';
import { LocalizationBanner } from '@/components/home/header/localization-banner';
import { HeroSection } from '@/components/home/hero-section/hero-section';
import { Pricing } from '@/components/home/pricing/pricing';
import { useUserInfo } from '@/hooks/useUserInfo';
import { createClient } from '@/utils/supabase/client';

export function HomePage() {
  const supabase = createClient();
  const { user } = useUserInfo(supabase);
  const [country, setCountry] = useState('US');

  return (
    <>
      <LocalizationBanner country={country} onCountryChange={setCountry} />
      <div>
        <HomePageBackground />
        <Header user={user} />
        <HeroSection />
        <Pricing country={country} />
        <Footer />
      </div>
    </>
  );
}
