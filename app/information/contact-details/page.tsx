import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-500">Datos de contacto</h1>
      <br />
      <p className="text-gray-700">
        Para más información sobre la investigación, datos y modelos del proyecto escribir al correo{' '}
        <a
          href="mailto:diegoferivera@unicauca.edu.co"
          className="text-blue-600 underline hover:text-blue-800"
        >
          diegoferivera@unicauca.edu.co
        </a>.
      </p>
      <br />
      <p className="text-gray-700">
        Y si quieres ser parte de esta iniciativa revisa la sección{' '}
        <Link href="/information/help" className="text-blue-600 underline hover:text-blue-800">
          ¿Cómo ayudar?
        </Link>{' '}.
      </p>
    </div>
  );
}