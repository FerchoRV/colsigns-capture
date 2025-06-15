// mediapipe-globals.d.ts
// Este archivo declara los objetos globales de MediaPipe disponibles en `window`.
// Los tipos de estos objetos se importan de los paquetes npm de MediaPipe.

// Importa los tipos desde los paquetes npm.
// Usamos alias (ej. Pose_ como Pose) para evitar conflictos de nombres con la declaración global.
import { Pose as Pose_ } from '@mediapipe/pose';
import { Results as PoseResults_ } from '@mediapipe/pose';

import { Hands as Hands_ } from '@mediapipe/hands';
import { Results as HandsResults_ } from '@mediapipe/hands';

import { Camera as Camera_ } from '@mediapipe/camera_utils';

import {
  drawConnectors as drawConnectors_,
  drawLandmarks as drawLandmarks_,
  Landmark as Landmark_, // Alias para Landmark
  POSE_CONNECTIONS as POSE_CONNECTIONS_,
  HAND_CONNECTIONS as HAND_CONNECTIONS_,
} from '@mediapipe/drawing_utils';

// Declara los tipos globales que estarán disponibles en el objeto 'window'.
declare global {
  interface Window {
    // Clases de MediaPipe (se accederán como new window.Pose(), new window.Hands(), etc.)
    Pose: typeof Pose_;
    Hands: typeof Hands_;
    Camera: typeof Camera_;

    // Funciones de dibujo (se accederán como window.drawConnectors(), etc.)
    drawConnectors: typeof drawConnectors_;
    drawLandmarks: typeof drawLandmarks_;

    // Conexiones de los modelos (se accederán como window.POSE_CONNECTIONS, etc.)
    POSE_CONNECTIONS: typeof POSE_CONNECTIONS_;
    HAND_CONNECTIONS: typeof HAND_CONNECTIONS_;
  }

  // También puedes declarar las interfaces de resultados y Landmark a nivel global
  // para que sean fácilmente referenciables en tu código TSX.
  // Esto asume que no hay conflictos de nombres con otros tipos globales.
  interface Landmark extends Landmark_ {}
  interface PoseResults extends PoseResults_ {}
  interface HandsResults extends HandsResults_ {}
}

// Puedes eliminar tu antiguo `types/mediapipe.d.ts` si tenías uno.