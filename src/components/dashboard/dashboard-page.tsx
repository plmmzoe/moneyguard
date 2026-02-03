'use client';

import { Tabs } from 'radix-ui';
import { useEffect, useState } from 'react';

import { getAnalyses } from '@/app/dashboard/actions';
import { Profile } from '@/components/dashboard/profile';
import Header from '@/components/home/header/header';
import { useUserInfo } from '@/hooks/useUserInfo';
import { Tables } from '@/lib/database.types';
import '../../styles/home-page.css';
import { createClient } from '@/utils/supabase/client';

export function DashboardPage() {
  const supabase = createClient();
  return (
    <>
      <div className={'w-full h-full'}>
        <Header user={useUserInfo(supabase).user}/>
        <Tabs.Root
          className="flex w-full flex-col"
          defaultValue="profile"
        >
          <Tabs.List
            className="flex shrink-0 border-b border-mauve6 w-3/4 m-auto"
          >
            <Tabs.Trigger
              className="flex h-[45px] flex-1 cursor-default select-none items-center justify-center  px-5 text-[15px] leading-none text-mauve11 outline-none first:rounded-tl-md last:rounded-tr-md hover:text-violet11 data-[state=active]:text-violet11 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current data-[state=active]:focus:relative "
              value="profile"
            >
              Profile
            </Tabs.Trigger>
            <Tabs.Trigger
              className="flex h-[45px] flex-1 cursor-default select-none items-center justify-center  px-5 text-[15px] leading-none text-mauve11 outline-none first:rounded-tl-md last:rounded-tr-md hover:text-violet11 data-[state=active]:text-violet11 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current data-[state=active]:focus:relative "
              value="rec_analysis"
            >
              Recent Analysis
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content
            className="grow rounded-b-md  p-5 outline-none"
            value="profile"
          >
            <Profile supabase={supabase} />
          </Tabs.Content>
          <Tabs.Content
            className="grow rounded-b-md  p-5 outline-none"
            value="rec_analysis"
          >
            <RecentAnalyses/>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </>
  );
}

function RecentAnalyses() {
  const [analyses, setAnalyses] = useState<Tables<'analyses'>[]>([]);

  useEffect(() => {
    getAnalyses().then(setAnalyses);
  }, []);

  if (analyses.length === 0) {return null;}

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Recent Impulse Analysis</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {analyses.map((analysis) => (
          <div key={analysis.id} className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{analysis.item_name}</h3>
              <span className="text-sm text-muted-foreground">${analysis.price}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{analysis.ai_analysis}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(analysis.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
