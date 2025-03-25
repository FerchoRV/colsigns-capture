import { useTensorFlowModel } from '@/hooks/useTensorFlowModel';
import * as tf from '@tensorflow/tfjs';
import { useState, useRef, useEffect } from 'react';

const ModelPredictor: React.FC = () => {
  const { model, loading } = useTensorFlowModel('/modeloAbecedario/model.json');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [sequence, setSequence] = useState<number[][]>([]);
  const [sentence, setSentence] = useState<string[]>([]);
  const [predictions, setPredictions] = useState<number[]>([]);
  const threshold = 0.8;
  const actions = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','Ñ','O','P','Q','R','S','T','U','V','W','X','Y','Z']; // Ajusta según las clases de tu modelo

  // Iniciar la cámara
  const startCamera = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(userStream);
      if (videoRef.current) {
        videoRef.current.srcObject = userStream;
      }
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
    }
  };

  // Procesar fotogramas y hacer predicciones
  const processFrame = async () => {
    if (!model || !videoRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Extraer keypoints de la imagen
    const keypoints = extractKeypointsFromFrame(canvas); // Implementa esta función según MediaPipe
    if (!keypoints) return;

    setSequence(prev => {
      const newSequence = [...prev, keypoints].slice(-30);
      if (newSequence.length === 30) {
        makePrediction(newSequence);
      }
      return newSequence;
    });
  };

  // Realizar la predicción
  const makePrediction = async (sequence: number[][]) => {
    if (!model) return;

    const inputTensor = tf.tensor([sequence]);
    const output = model.predict(inputTensor) as tf.Tensor;
    const result = await output.data();
    inputTensor.dispose();
    output.dispose();

    const predictedIndex = result.indexOf(Math.max(...result));
    setPredictions(prev => [...prev, predictedIndex]);

    if (predictions.slice(-15).filter(p => p === predictedIndex).length >= 10) {
      if (result[predictedIndex] > threshold) {
        setSentence(prev => {
          const newSentence = [...prev, actions[predictedIndex]].slice(-5);
          return newSentence;
        });
      }
    }
  };

  useEffect(() => {
    startCamera();
    const interval = setInterval(processFrame, 100); // Procesar cada 100ms
    return () => clearInterval(interval);
  }, [model]);

  return (
    <div>
      <h2>Predicción con TensorFlow.js</h2>
      {loading ? <p>Cargando modelo...</p> : null}
      <video ref={videoRef} autoPlay playsInline></video>
      <p>Predicción: {sentence.join(" ")}</p>
    </div>
  );
};

export default ModelPredictor;

function extractKeypointsFromFrame(canvas: HTMLCanvasElement): number[] | null {
  // Implement the function to extract keypoints from the canvas
  // This is a placeholder implementation
  const keypoints = []; // Replace with actual keypoint extraction logic
  return keypoints.length > 0 ? keypoints : null;
}

