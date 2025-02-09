import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignLanguage } from '@fortawesome/free-solid-svg-icons';

export default function ColsingLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none text-white`}
    >
      <FontAwesomeIcon icon={faSignLanguage} size="2x" className="h-12 w-12 rotate-[15deg]" />
      <p className="text-[40px]">Colsing</p>
    </div>
  );
}
