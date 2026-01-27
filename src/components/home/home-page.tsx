'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useUserInfo } from '@/hooks/useUserInfo';
import '../../styles/home-page.css';
import Header from '@/components/home/header/header';
import { Footer } from '@/components/home/footer/footer';

export function HomePage() {
  const supabase = createClient();
  const { user } = useUserInfo(supabase);
  const [country, setCountry] = useState('US');

  return (
    <>
      <div>
        <Header />
        <Footer />
      </div>
    </>
  );
}
