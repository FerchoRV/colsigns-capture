'use client';

import React from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

const ExportCSVButton = () => {
  const handleExportCSV = async () => {
    try {
      // Consultar la colección `video_example` ordenada por `name`
      const videoExampleRef = collection(db, 'video_example');
      const q = query(videoExampleRef, orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);

      // Extraer los datos de los documentos
      const data = querySnapshot.docs.map((doc) => ({
        name: doc.data().name,
        meaning: doc.data().meaning,
        type: doc.data().type,
      }));

      // Generar el contenido del CSV con BOM
      const csvContent = [
        ['name', 'meaning', 'type'], // Encabezados
        ...data.map((row) => [
          row.name,
          row.meaning,
          row.type,
        ]),
      ]
        .map((e) => e.map((value) => `"${value}"`).join(',')) // Escapar valores y unir por comas
        .join('\n'); // Unir todas las filas con saltos de línea

      const bom = '\uFEFF'; // Byte Order Mark para UTF-8
      const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' }); // Agregar BOM al inicio del contenido
      const url = URL.createObjectURL(blob);

      // Crear un enlace para descargar el archivo
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'video_example.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('CSV generado y descargado correctamente.');
    } catch (error) {
      console.error('Error al generar el CSV:', error);
    }
  };

  return (
    <button
      onClick={handleExportCSV}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    >
      Exportar CSV
    </button>
  );
};

export default ExportCSVButton;