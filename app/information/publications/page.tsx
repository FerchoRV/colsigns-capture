export default function PublicationsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-500">Revistas indexadas</h1>
      <br />
      <p className="text-gray-700">Este proyecto al estar vinculado a la investigación se han escritos diferentes artículos que se han sometido a revistas indexadas a continuación se comparte el resumen de estos documentos.</p>
      <br />
      <table className="table-auto border-collapse border border-gray-300 w-full text-gray-700">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Nombre</th>
            <th className="border border-gray-300 px-4 py-2">Revista</th>
            <th className="border border-gray-300 px-4 py-2">Esatado</th>
            <th className="border border-gray-300 px-4 py-2">Link</th>
          </tr>          
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Desarrollo de sistema informático para comunicación de personas sordas y oyentes implementando inteligencia artificial (Interprete lengua de señas colombiano)</td>
            <td className="border border-gray-300 px-4 py-2">Mundo FESC</td>
            <td className="border border-gray-300 px-4 py-2">EN REVISIÓN FINAL</td>
            <td className="border border-gray-300 px-4 py-2"><a href="https://www.fesc.edu.co/Revistas/OJS/index.php/mundofesc" target="_blank" rel="noopener noreferrer">No disponible</a></td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Redes neuronales LSTM para el reconocimiento de lengua de señas colombianas estáticas(letras) y dinámicas(palabras).</td>
            <td className="border border-gray-300 px-4 py-2">Revista Facultad de Ingeniería</td>
            <td className="border border-gray-300 px-4 py-2">ACEPTADO PARA PUBLICACIÓN</td>
            <td className="border border-gray-300 px-4 py-2"><a href="https://revistas.uptc.edu.co/index.php/ingenieria" target="_blank" rel="noopener noreferrer">No disponible</a></td>
          </tr>
        </tbody>
      </table>
     
    </div>
  );
}