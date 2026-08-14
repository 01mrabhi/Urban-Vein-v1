import { redirect } from 'next/navigation';

export default async function TrackAwbPage({ params }: { params: Promise<{ awb: string }> }) {
  const { awb } = await params;
  redirect(`/track?awb=${encodeURIComponent(awb)}`);
}
