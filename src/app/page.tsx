"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Navigate to the '/ads' page on render.
    router.push("/ads");
  }, [router]);

  return <Loader />;
}

function Loader() {
  return (
    <div className="flex h-full flex-row items-center justify-center gap-2 text-zinc-500">
      <span>Redirecting to Ads</span>
      <Image
        src="/spinner.svg"
        alt={"loading episode"}
        width={32}
        height={32}
      />
    </div>
  );
}
