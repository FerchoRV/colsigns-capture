import React from "react";
import VisualizeSignComponent from "../evaluate/visualize-signs";

const VisualizeSignsPage: React.FC = () => {
  return (
    <main>
      <p>
        Este módulo permite visualizar las señas que representan un mensaje de texto para poder trasmitir información y facilitar la comunicación con personas sordas, puedes enviar letras individuales(a,b,c..), palabras(Hola, Qué, Caminar), o frases(Cómo estás, Buenos días, por favor) o combinaciones separados por “,” (Hola,Como estas,diego), para los textos que el sistema no tenga soporte idéntico te entregara el deletreo de la palabra.
      </p>
      <VisualizeSignComponent />

    </main>
  );
};

export default VisualizeSignsPage;