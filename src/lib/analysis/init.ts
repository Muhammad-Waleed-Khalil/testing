// Face API is imported and used in the initFaceModels function
import { initFaceModels } from './index';

// This function safely initializes analysis models only in browser environments
export const setupAnalysisModels = async () => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    console.log('Skipping analysis models setup in non-browser environment');
    return;
  }

  try {
    // Dynamically load models only in browser context
    const modelsLoaded = await initFaceModels();
    
    if (modelsLoaded) {
      console.log('Analysis models initialized successfully');
    } else {
      console.warn('Failed to initialize some analysis models');
    }
  } catch (error) {
    console.error('Error initializing analysis models:', error);
    // Don't throw error to prevent app from crashing during SSR
  }
};

// Helper function to check if MediaPipe can be initialized
// This is useful for components that use MediaPipe
export const canUseMediaPipe = () => {
  return typeof window !== 'undefined' && 
         typeof navigator !== 'undefined' && 
         navigator.mediaDevices !== undefined;
};

// Helper function to check if face-api can be initialized
export const canUseFaceApi = () => {
  return typeof window !== 'undefined' && 
         typeof document !== 'undefined' && 
         typeof HTMLImageElement !== 'undefined' && 
         typeof HTMLVideoElement !== 'undefined' && 
         typeof HTMLCanvasElement !== 'undefined';
};