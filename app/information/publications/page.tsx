export default function PublicationsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-500">Revistas indexadas</h1>
      <br />
      <p className="text-gray-700">Durante la ejecución de este proyecto de investigación se espera escribir diferentes artículos para compartir de manera formal los resultados obtenidos, en este espacio se comparte el resumen de estos:</p>
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
            <td className="border border-gray-300 px-4 py-2">Recognition of Colombian Sign Language using Neural Networks with Long- and Short-Term Memory</td>
            <td className="border border-gray-300 px-4 py-2">Revista Facultad de Ingeniería</td>
            <td className="border border-gray-300 px-4 py-2">Publicado</td>
            <td className="underline text-blue-600 border border-gray-300 px-4 py-2"><a href="https://doi.org/10.19053/uptc.01211129.v34.n71.2025.18059" target="_blank" rel="noopener noreferrer">Ver</a></td>
          </tr>
        </tbody>
      </table>
     
    </div>
  );
}