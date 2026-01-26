import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface Props {
  user: User | null;
}

export default function Header() {
  return (
    <nav>
      <div className="mx-auto max-w-7xl relative px-[32px] py-[18px] flex items-center justify-between">
        <h1>header</h1>
      </div>
    </nav>
  );
}
