'use client';

// eslint-disable-next-line
import { useState } from 'react';
import { Footer } from '@/components/home/footer/footer';
import Header from '@/components/home/header/header';
import { useUserInfo } from '@/hooks/useUserInfo';
import { createClient } from '@/utils/supabase/client';
import '../../styles/home-page.css';

export function HomePage() {
  const supabase = createClient();
  const { user } = useUserInfo(supabase);

  return (
    <>
      <div>
        <Header user={user}/>
        <Footer />
      </div>
    </>
  );
}
