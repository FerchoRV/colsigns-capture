import React from "react";
import VisualizeSignsInterpreteComponent from "./visualize-signs-interprete";

const VisualizeSignsPage: React.FC = () => {
  return (
    <main>
      <h2>
        Este modulo genera señas a partir de un texto, utilizando videos unificados de señas basicas colombianas, cuenta con alrrededor de 536 señas tomadas de INSOR.
      </h2>
      <VisualizeSignsInterpreteComponent />

    </main>
  );
};

export default VisualizeSignsPage;