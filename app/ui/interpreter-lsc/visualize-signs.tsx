import React from "react";
import VisualizeSignsInterpreteComponent from "./visualize-signs-interprete";

const VisualizeSignsPage: React.FC = () => {
  return (
    <main>
      <h2>
      Este módulo genera señas a partir de un texto, utilizando videos unificados de señas básicas colombianas, cuenta con alrededor de 536 señas tomadas de INSOR.
      </h2>
      <VisualizeSignsInterpreteComponent />

    </main>
  );
};

export default VisualizeSignsPage;