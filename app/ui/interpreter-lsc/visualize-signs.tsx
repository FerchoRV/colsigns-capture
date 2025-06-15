import React from "react";
import VisualizeAlphabetComponent from "./visualize-alphabet";

const VisualizeSignsPage: React.FC = () => {
  return (
    <main>
      <p>
        Este módulo permite tiene como fin visualizar las señas que representan un mensaje de texto para poder trasmitir y comunicarse con personas sordas, actualmente solo está disponible el deletreo de palabras apoyado por videos de ejemplos de señas independientes.
      </p>
      <VisualizeAlphabetComponent />

    </main>
  );
};

export default VisualizeSignsPage;