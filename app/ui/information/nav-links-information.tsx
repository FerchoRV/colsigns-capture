'use client';

import {
  DocumentDuplicateIcon,
  InformationCircleIcon,
  AtSymbolIcon,
  HandRaisedIcon, 
  UserGroupIcon
  
} from '@heroicons/react/24/outline';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: 'General', href: '/information', icon: InformationCircleIcon },
  {
    name: 'Cómo Ayudar',
    href: '/information/help',
    icon: HandRaisedIcon,
  },
  { name: 'Publicaciones', href: '/information/publications', icon: DocumentDuplicateIcon },
  { name: 'Patrocinadores', href: '/information/sponsors', icon: UserGroupIcon },
  { name: 'Contacto', href: '/information/contact-details', icon: AtSymbolIcon },
];

export default function NavLinksInformation() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-sky-100 text-blue-600': pathname === link.href,
              },
            )}
            >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
