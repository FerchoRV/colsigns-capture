"use client";

import Link from 'next/link';
import NavLinksInformation from '@/app/ui/information/nav-links-information';
import ColsingLogo from '@/app/ui/colsing-logo';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from "next/navigation";

export default function SideNavInformation() {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-40"
        href="/"
      >
        <div className="w-32 text-white md:w-40">
          <ColsingLogo />
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinksInformation />
        
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>

        <button
          onClick={() => router.push('/')}
          className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
        >
          <ArrowLeftIcon className="w-6" />
          <div className="hidden md:block">Home</div>
        </button>
      </div>
    </div>
  );
}

