export default function HelpPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-500">Toda ayuda cuenta</h1>
      <br />
      <p className="text-gray-700">Esta iniciativa espera entregar una solución que apoye los procesos de comunicación entre personas sordas y oyentes sin conocimiento en lengua de señas, además de hacer conciencia que para una inclusión social de personas sordas real debemos, interesarnos en sus mecanismos de comunicación.</p>
      <br />
      <p className="text-gray-700">Y todos pueden ser parte actualmente el sistema está en etapa de evaluación para verificar la capacidad de los modelos y capturar primeras perspectivas de los usuarios, para mayores detalles por favor revisa el siguiente video no te tomara más de 10 minutos:</p>
      <br />
      <div className="relative w-full max-w-3xl mx-auto aspect-video rounded-lg overflow-hidden shadow-lg">
        <iframe
          src="https://drive.google.com/file/d/1faYZ--hHbhZeLLY7D7mSiJ7TV4h_lV3u/preview"
          title="Protocolo de evaluación Colsign"
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
      <br />
      <p className="text-gray-700">Con esto puede ser arte de esta iniciativa y quien sabe y aprendas algunas señas, todos los videos de ejemplo proporcionados cuentan con un enlace directo al creador por si requieren mas información sobre la lengua de señas colombiana. Si deseas contribuir de otra manera no dudes en ponerte en contacto con nosotros por medio del correo 
        {' '}
                <a
          href="mailto:diegoferivera@unicauca.edu.co"
          className="text-blue-600 underline hover:text-blue-800"
        >
          diegoferivera@unicauca.edu.co
        </a>, muchas gracias por haber llegado hasta aquí y espero contar con tu ayuda, cordialmente equipo Colsign.
      </p>
    </div>
  );
}
