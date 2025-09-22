import { notFound } from 'next/navigation';
import SourcePage from '../../../components/source-page';
import { slugToSourceName } from '@/lib/utils';

interface SourcePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function Source({ params }: SourcePageProps) {
  const { slug } = await params;
  const sourceName = slugToSourceName(slug);
  
  return <SourcePage sourceName={sourceName} slug={slug} />;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: SourcePageProps) {
  const { slug } = await params;
  const sourceName = slugToSourceName(slug);
  
  return {
    title: `${sourceName} - Fantasy Red Zone`,
    description: `Latest fantasy football content from ${sourceName}. Articles, videos, and analysis to help you dominate your fantasy leagues.`,
  };
}
