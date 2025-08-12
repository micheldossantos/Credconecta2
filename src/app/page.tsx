"use client";

import dynamic from 'next/dynamic';
import Loading from './loading';

// Importar componentes dinamicamente para evitar SSR
const DynamicApp = dynamic(() => import('@/components/App'), {
  ssr: false,
  loading: () => <Loading />
});

export default function Home() {
  return <DynamicApp />;
}