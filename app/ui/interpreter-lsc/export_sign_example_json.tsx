'use client';

import React from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';// Importa tu configuración de Firebase

const ExportJSONButton = () => {
  const handleExportJSON = async () => {
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

      // Generar el contenido del archivo JSON
      const jsonContent = JSON.stringify(data, null, 2); // Formatear el JSON con indentación de 2 espacios

      // Crear un archivo Blob para el JSON
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      // Crear un enlace para descargar el archivo
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'video_example.json'); // Nombre del archivo
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('JSON generado y descargado correctamente.');
    } catch (error) {
      console.error('Error al generar el JSON:', error);
    }
  };

  return (
    <button
      onClick={handleExportJSON}
      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
    >
      Exportar JSON
    </button>
  );
};

export default ExportJSONButton;