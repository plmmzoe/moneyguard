'use client';

import { Loader2, Sparkles } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { saveAnalysis } from './actions';

export default function AnalyzePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnalyzePageContent />
    </Suspense>
  );
}

function AnalyzePageContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [item, setItem] = useState(searchParams.get('item') || '');
  const [price, setPrice] = useState(searchParams.get('price') || '');
  const [description, setDescription] = useState(searchParams.get('description') || '');

  useEffect(() => {
    // If we have params, we could auto-submit or just let the user review
    // For now, we just pre-fill
  }, [searchParams]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data = {
      item: formData.get('item'),
      price: formData.get('price'),
      description: formData.get('description'),
    };

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const json = await response.json();
      setResult(json.analysis);

      // Save the analysis to the database
      await saveAnalysis({
        itemName: data.item as string,
        price: parseFloat(data.price as string) || 0,
        description: data.description as string,
        aiAnalysis: json.analysis,
      });
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <div className="flex flex-col items-center mb-8 space-y-4 text-center">
        <div className="p-3 bg-primary/10 rounded-full">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Impulse Buy Analyzer
        </h1>
        <p className="text-muted-foreground max-w-[42rem] leading-normal sm:text-xl sm:leading-8">
          Before you buy, let AI do a reality check. Is it a dream purchase or a budget nightmare?
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
            <CardDescription>
              Tell us what you&apos;re thinking of buying.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="item">Item Name</Label>
                <Input
                  id="item"
                  name="item"
                  placeholder="e.g. Vintage Typewriter"
                  required
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="text"
                  placeholder="e.g. $150"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Why do you want it?</Label>
                <textarea
                  id="description"
                  name="description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="It looks cool and I might write a novel..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Purchase'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {error && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-destructive-foreground">{error}</p>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Verdict
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {result}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
