import * as tf from '@tensorflow/tfjs';
import { useState, useEffect } from 'react';

export function useTensorFlowModel(modelPath: string) {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await tf.loadLayersModel(modelPath);
        
        // Verifica si la capa de entrada tiene definida una forma de entrada
        const inputShape = loadedModel.inputs[0].shape;
        if (!inputShape || inputShape.length === 0) {
          console.warn('La capa de entrada del modelo no tiene definida una forma de entrada. Creando una nueva.');

          const input = tf.input({ shape: [30, 126] });  // Ajusta el shape según tu modelo
          const newOutput = loadedModel.apply(input) as tf.SymbolicTensor;
          const newModel = tf.model({ inputs: input, outputs: newOutput });

          setModel(newModel);
        } else {
          setModel(loadedModel);
        }

        console.log('Modelo cargado correctamente.');
      } catch (error) {
        console.error('Error cargando el modelo:', error);
      } finally {
        setLoading(false);
      }
    };

    loadModel();
  }, [modelPath]);

  return { model, loading };
}