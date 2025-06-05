import Image from "next/image";

export default function GeneralPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-500">¿Qué es Colsing?</h1>
      <br />
      <p className="text-gray-700">El proyecto Colsing es una iniciativa de investigación aplicada que busca desarrollar soluciones tecnológicas que apoye la inclusión social de personas sordas en Colombia, por medio de la inteligencia artificial y la ingeniería de software.</p>
      <br />
      <h1 className="text-2xl font-bold text-blue-500">¿Cómo surgió?</h1>
      <br />
      <p className="text-gray-700">Todo surge de una simple pregunta en el 2022, ¿Cómo me puedo comunicar con una persona sorda sin saber lengua de señas?, esta pregunta se llevó a un entorno de investigación por parte del Ingeniero Diego Fernando Rivera Vasquez, en donde se identifico la posibilidad de desarrollar interprete de lengua de señas para el contexto colombiano implementando técnicas de inteligencia artificial, visión artificial e ingeniería de software, esta posibilidad se adoptó como trabajo de grado para optar por el título de Magister en computación en la Universidad del Cauca.</p>
      <br />
      <h1 className="text-2xl font-bold text-blue-500">¿Qué se ha conseguido hasta ahora?</h1>
      <br />
      <p className="text-gray-700">Principal mente se ha conseguido experimentar con técnicas de inteligencia artificial para generar modelos de reconocimiento de señas colombianos, se han conseguido modelos con hasta el 90% de precisión para identificar en promedio 28 señas independientes, tanto para señas estáticos como es el abecedario y dinámicos como son los señas que representan palabras, como se ve a continuación:</p>
      <br />
      <div className="flex flex-col items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-center items-center">
          {/* Primer GIF */}
          <div className="flex flex-col items-center">
            <Image
              src="/information-resources/LSC_Clip.gif"
              alt="Resultados de los modelos - GIF 1"
              width={500}
              height={500}
              className="w-3/4 h-auto rounded-lg shadow-lg"
            />
            <p className="mt-2 text-gray-700 text-center">Reconocimiento de señas estáticos(Abecedario)</p>
          </div>

          {/* Segundo GIF */}
          <div className="flex flex-col items-center">
            <Image
              src="/information-resources/clipPalabras.gif"
              alt="Resultados de los modelos - GIF 2"
              width={500}
              height={500}
              className="w-3/4 h-auto rounded-lg shadow-lg"
            />            
            <p className="mt-2 text-gray-700 text-center">Reconocimiento de señas dinámicos(Palabras)</p>
          </div>
        </div>
      </div>
      <br />
      <p className="text-gray-700">
        Para más detalle de estos avances pueden dar clic{" "}
        <a href="https://github.com/FerchoRV/LSTM-Reconocimiento-de-señas-colombianos" className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">
          aquí
        </a>
      </p>
      <br />
      <h1 className="text-2xl font-bold text-blue-500">¿Qué se espera conseguir?</h1>
      <br />
      <p className="text-gray-700">Se espera conseguir un modelo de reconocimiento de señas colombianos capaz de reconocer al menos los 100 señas fundamentales para una conversación, que permita desarrollar una herramienta que facilite la comunicación entre personas sordas y oyentes, además de proveer a la comunidad científica un conjunto de datos como mas de 500 señas colombianos para quienes les interés entrenar estrategias de inteligencia artificial y generar sus propios modelos.</p>
      <br />
      <h1 className="text-2xl font-bold text-blue-500">¿Qué se está haciendo actualmente?</h1>
      <br />
      <p className="text-gray-700">En la actualidad se esta haciendo la captura de datos para entrenar estrategias de inteligencia artificial, la meta es almacenar la información de mas de 500 señas colombianos por medio de videos que se comparte por medio de esta plataforma, además de que se va experimentando con los datos capturados para ir generando modelos con mayor capacidad de reconocimiento, junto a esto se está desarrollando un PMV llamado Colsign Interprete para validar el comportamiento de los modelos en un entorno real. </p>
      <br />
      <h1 className="text-2xl font-bold text-blue-500">Participantes</h1>
      <br />
      <p className="text-gray-700">A continuación, te presentamos a las personas que han aportado en esta iniciativa:</p>
      <br />
        <table className="table-auto border-collapse border border-gray-300 w-full text-gray-700">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Nombre</th>
              <th className="border border-gray-300 px-4 py-2">Rol</th>
              <th className="border border-gray-300 px-4 py-2">Fechas de Participación</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
          <a href="https://www.linkedin.com/in/ingdiegorivera/" className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">Diego Fernando Rivera Vasquez</a>
              </td>
              <td className="border border-gray-300 px-4 py-2">CEO</td>
              <td className="border border-gray-300 px-4 py-2">Feb 2022 – Actual</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
          <a href="https://www.linkedin.com/in/carolina-gonz%C3%A1lez-serrano-19970a180/" className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">Carolina González Serrano</a>
              </td>
              <td className="border border-gray-300 px-4 py-2">Directora trabajo de grado</td>
              <td className="border border-gray-300 px-4 py-2">Feb 2024 – Actual</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
          <a href="https://www.linkedin.com/in/liseth-v-campo-9985aa63/" className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">Liseth V Campo</a>
              </td>
              <td className="border border-gray-300 px-4 py-2">Asesora investigación</td>
              <td className="border border-gray-300 px-4 py-2">Sep 2024 – Actual</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
          <a href="https://www.researchgate.net/profile/Javier-Munoz-Chaves" className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">Javier Andrés Muñoz Chaves</a>
              </td>
              <td className="border border-gray-300 px-4 py-2">Tutor investigación</td>
              <td className="border border-gray-300 px-4 py-2">Feb 2022 – Feb 2023</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
          <a href="https://www.linkedin.com/in/julio-eduardo-mej%C3%ADa-manzano-61aa09205/?originalSubdomain=co" className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">Julio Eduardo Mejía Manzano</a>
              </td>
              <td className="border border-gray-300 px-4 py-2">Asesor técnico </td>
              <td className="border border-gray-300 px-4 py-2">Feb 2022 – Feb 2023</td>
            </tr>
          </tbody>
        </table>
    

    </div>
  );
}