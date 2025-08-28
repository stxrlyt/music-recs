'use client'

import { useRouter } from "next/navigation";
import { useEffect} from "react";
import { useSolidSession } from "@/context/solidsession";
import toast, { Toaster } from 'react-hot-toast';
// import {} from @inrupt/solid-client;

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function RecPage() {
  const router = useRouter();
  const { session, isLoggedIn } = useSolidSession();

  useEffect(() => {
    if (!isLoggedIn) router.replace("/login");
  }, [isLoggedIn, router]);

  return (
    <div>
      <h1 className="text-xl font-bold">Recommender Page</h1>
      <Toaster position="top-right" />
    </div>
  );
}