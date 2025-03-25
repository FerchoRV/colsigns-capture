'use client';

import dynamic from 'next/dynamic';

const ModelPredictor = dynamic(() => import('./../ui/sign-interpreter/model-interpreter'), { ssr: false });

const InterpreterPage: React.FC = () => {
  return (
    <div>
      <h1>Interprete de lenguage de signos colombianos basado en redes neuronale</h1>
      <ModelPredictor />
    </div>
  );
};

export default InterpreterPage;
