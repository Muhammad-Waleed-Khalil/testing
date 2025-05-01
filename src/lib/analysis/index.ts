import * as faceapi from 'face-api.js';
import { Camera } from '@mediapipe/camera_utils';
import { Pose, Results } from '@mediapipe/pose';
// These imports are not used in the current implementation
// import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
// import { POSE_CONNECTIONS } from '@mediapipe/pose';
import { EmotionAnalysis, GestureAnalysis, ToneAnalysis } from '@/types';

// Initialize face-api models
export const initFaceModels = async () => {
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/models')
    ]);
    console.log('Face-api models loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading face-api models:', error);
    return false;
  }
};

// Tone Analysis using Web Audio API
export class ToneAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyzer: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private isAnalyzing: boolean = false;
  private pitchValues: number[] = [];
  private wordCount: number = 0;
  private startTime: number = 0;
  private confidenceScore: number = 50; // Default middle value

  constructor() {
    this.startTime = Date.now();
  }

  async start(stream: MediaStream) {
    try {
      this.audioContext = new AudioContext();
      this.analyzer = this.audioContext.createAnalyser();
      this.analyzer.fftSize = 2048;
      
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.microphone.connect(this.analyzer);
      
      const bufferLength = this.analyzer.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      
      this.isAnalyzing = true;
      this.startTime = Date.now();
      this.analyze();
      
      return true;
    } catch (error) {
      console.error('Error starting tone analysis:', error);
      return false;
    }
  }

  stop() {
    this.isAnalyzing = false;
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyzer = null;
    this.microphone = null;
    this.dataArray = null;
  }

  // Process speech for word count (simplified)
  processSpeech(text: string) {
    const words = text.trim().split(/\s+/);
    this.wordCount = words.length;
  }

  // Update confidence based on voice patterns
  updateConfidence(value: number) {
    this.confidenceScore = Math.max(0, Math.min(100, this.confidenceScore + value));
  }

  private analyze() {
    if (!this.isAnalyzing || !this.analyzer || !this.dataArray) return;

    // Get frequency data
    this.analyzer.getByteFrequencyData(this.dataArray);
    
    // Calculate average frequency (simplified pitch detection)
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    const averageFrequency = sum / this.dataArray.length;
    
    // Store pitch value (normalized to 0-100)
    const normalizedPitch = Math.min(100, (averageFrequency / 255) * 100);
    this.pitchValues.push(normalizedPitch);
    
    // Limit stored values to prevent memory issues
    if (this.pitchValues.length > 100) {
      this.pitchValues.shift();
    }
    
    // Continue analyzing
    requestAnimationFrame(() => this.analyze());
  }

  getAnalysis(): ToneAnalysis {
    // Calculate average pitch
    const avgPitch = this.pitchValues.length > 0 
      ? this.pitchValues.reduce((a, b) => a + b, 0) / this.pitchValues.length 
      : 50;
    
    // Calculate speaking speed (words per minute)
    const durationMinutes = (Date.now() - this.startTime) / 60000;
    const speed = durationMinutes > 0 ? Math.round(this.wordCount / durationMinutes) : 0;
    
    // Determine confidence level based on score
    let confidence: "confident" | "hesitant" | "authoritative" | "nervous" | "enthusiastic" = "confident";
    if (this.confidenceScore > 80) confidence = "confident";
    else if (this.confidenceScore > 60) confidence = "enthusiastic";
    else if (this.confidenceScore > 40) confidence = "hesitant";
    else if (this.confidenceScore > 20) confidence = "hesitant";
    else confidence = "nervous";
    
    // Generate feedback based on analysis
    let feedback = "";
    if (avgPitch > 75) feedback = "Try lowering your pitch for a more authoritative tone.";
    else if (avgPitch < 25) feedback = "Try varying your pitch more to sound more engaging.";
    else if (speed > 160) feedback = "Consider slowing down to improve clarity.";
    else if (speed < 100) feedback = "Try speaking a bit faster to maintain engagement.";
    else feedback = "Your tone is well-balanced. Maintain this level of delivery.";
    
    return {
      pitch: Math.round(avgPitch),
      speed,
      confidence,
      feedback
    };
  }
}

// Face Expression Analysis using face-api.js
export class EmotionAnalyzer {
  private isAnalyzing: boolean = false;
  private emotionTimeline: Array<{emotion: string, timestamp: number}> = [];
  private detectionInterval: number | null = null;
  private video: HTMLVideoElement | null = null;

  async start(video: HTMLVideoElement) {
    try {
      this.video = video;
      this.isAnalyzing = true;
      
      // Start detection loop
      this.detectionInterval = window.setInterval(() => {
        this.detectEmotions();
      }, 1000) as unknown as number; // Check every second
      
      return true;
    } catch (error) {
      console.error('Error starting emotion analysis:', error);
      return false;
    }
  }

  stop() {
    this.isAnalyzing = false;
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
  }

  private async detectEmotions() {
    if (!this.isAnalyzing || !this.video) return;
    
    try {
      const detections = await faceapi.detectAllFaces(this.video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
      
      if (detections && detections.length > 0) {
        const expressions = detections[0].expressions;
        
        // Find the dominant emotion
        let dominantEmotion = 'neutral';
        let maxScore = expressions.neutral;
        
        if (expressions.happy > maxScore) {
          dominantEmotion = "happiness";
          maxScore = expressions.happy;
        }
        if (expressions.sad > maxScore) {
          dominantEmotion = "sadness";
          maxScore = expressions.sad;
        }
        if (expressions.angry > maxScore) {
          dominantEmotion = "anger";
          maxScore = expressions.angry;
        }
        if (expressions.surprised > maxScore) {
          dominantEmotion = 'surprise';
          maxScore = expressions.surprised;
        }
        if (expressions.fearful > maxScore) {
          dominantEmotion = 'frustration';
          maxScore = expressions.fearful;
        }
        
        // Add to timeline
        this.emotionTimeline.push({
          emotion: dominantEmotion,
          timestamp: Date.now()
        });
        
        // Limit timeline length
        if (this.emotionTimeline.length > 60) { // Keep last minute
          this.emotionTimeline.shift();
        }
      }
    } catch (error) {
      console.error('Error detecting emotions:', error);
    }
  }

  getAnalysis(): EmotionAnalysis {
    // Define valid emotion types
    type ValidEmotion = "happiness" | "sadness" | "anger" | "surprise" | "frustration" | "neutral";
    
    // Default values
    let primary: ValidEmotion = "neutral";
    let intensity = 50;
    let feedback = "Maintain consistent emotional engagement throughout your answer.";
    
    // Calculate dominant emotion
    if (this.emotionTimeline.length > 0) {
      const emotionCounts: Record<string, number> = {
        happiness: 0,
        sadness: 0,
        anger: 0,
        surprise: 0,
        frustration: 0,
        neutral: 0
      };
      
      this.emotionTimeline.forEach(item => {
        if (emotionCounts[item.emotion] !== undefined) {
          emotionCounts[item.emotion]++;
        }
      });
      
      // Find most frequent emotion
      let maxCount = 0;
      Object.entries(emotionCounts).forEach(([emotion, count]) => {
        if (count > maxCount) {
          maxCount = count;
          // Ensure emotion is a valid primary emotion type
          if (emotion === 'happiness' || emotion === 'sadness' || 
              emotion === 'anger' || emotion === 'surprise' || 
              emotion === 'frustration' || emotion === 'neutral') {
            primary = emotion as ValidEmotion;
          }
        }
      });
      
      // Calculate intensity (percentage of dominant emotion)
      intensity = Math.round((maxCount / this.emotionTimeline.length) * 100);
      
      // Generate feedback based on emotion type and intensity
      if (primary === "neutral" && intensity > 70) {
        feedback = "Try to show more emotional engagement to connect better with your audience.";
      } else if (primary === "happiness" && intensity > 70) {
        feedback = "Your positive demeanor is excellent, but vary your expressions for key points.";
      } else if (primary === "sadness" || primary === "anger" || primary === "frustration") {
        feedback = "Try to maintain a more positive emotional tone during your responses.";
      } else if (emotionCounts.neutral < 10) {
        feedback = "Your emotional expressiveness is good. Continue to match emotions to content.";
      }
    }
    
    return {
      primary,
      intensity,
      timeline: this.emotionTimeline,
      feedback
    };
  }
}

// Gesture Analysis using MediaPipe
export class GestureAnalyzer {
  private pose: Pose | null = null;
  private camera: Camera | null = null;
  private isAnalyzing: boolean = false;
  private postureSamples: string[] = [];
  private handMovementSamples: string[] = [];
  private facialEngagementSamples: string[] = [];
  private bodyLanguageSamples: string[] = [];

  async start(video: HTMLVideoElement) {
    try {
      this.pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });
      
      this.pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      
      this.pose.onResults((results: Results) => {
        this.processResults(results);
      });
      
      this.camera = new Camera(video, {
        onFrame: async () => {
          if (this.pose && this.isAnalyzing) {
            await this.pose.send({image: video});
          }
        },
        width: 640,
        height: 480
      });
      
      this.isAnalyzing = true;
      await this.camera.start();
      
      return true;
    } catch (error) {
      console.error('Error starting gesture analysis:', error);
      return false;
    }
  }

  stop() {
    this.isAnalyzing = false;
    if (this.camera) {
      this.camera.stop();
    }
    this.pose = null;
    this.camera = null;
  }

  private processResults(results: Results) {
    if (!results.poseLandmarks) return;
    
    // Analyze posture
    this.analyzePosture(results.poseLandmarks);
    
    // Analyze hand movements
    this.analyzeHandMovements(results.poseLandmarks);
    
    // Analyze facial engagement
    this.analyzeFacialEngagement(results.poseLandmarks);
    
    // Analyze overall body language
    this.analyzeBodyLanguage(results.poseLandmarks);
  }

  private analyzePosture(landmarks: any[]) {
    // Simplified posture analysis based on shoulder alignment and head position
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const nose = landmarks[0];
    
    if (leftShoulder && rightShoulder && nose) {
      // Check if shoulders are level (good posture)
      const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
      
      // Check if head is centered
      const headCentered = Math.abs((leftShoulder.x + rightShoulder.x) / 2 - nose.x) < 0.1;
      
      let posture = "neutral";
      if (shoulderDiff < 0.05 && headCentered) {
        posture = "good";
      } else if (shoulderDiff > 0.1 || !headCentered) {
        posture = "poor";
      }
      
      this.postureSamples.push(posture);
      
      // Limit samples
      if (this.postureSamples.length > 30) {
        this.postureSamples.shift();
      }
    }
  }

  private analyzeHandMovements(landmarks: any[]) {
    // Simplified hand movement analysis
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    
    if (leftWrist && rightWrist && leftShoulder && rightShoulder) {
      // Calculate hand movement relative to shoulders
      const leftHandMovement = Math.sqrt(
        Math.pow(leftWrist.x - leftShoulder.x, 2) + 
        Math.pow(leftWrist.y - leftShoulder.y, 2)
      );
      
      const rightHandMovement = Math.sqrt(
        Math.pow(rightWrist.x - rightShoulder.x, 2) + 
        Math.pow(rightWrist.y - rightShoulder.y, 2)
      );
      
      const avgMovement = (leftHandMovement + rightHandMovement) / 2;
      
      let handMovement = "minimal";
      if (avgMovement > 0.3) {
        handMovement = "excessive";
      } else if (avgMovement > 0.15) {
        handMovement = "moderate";
      }
      
      this.handMovementSamples.push(handMovement);
      
      // Limit samples
      if (this.handMovementSamples.length > 30) {
        this.handMovementSamples.shift();
      }
    }
  }

  private analyzeFacialEngagement(landmarks: any[]) {
    // Simplified facial engagement analysis based on face visibility
    const nose = landmarks[0];
    const leftEye = landmarks[2];
    const rightEye = landmarks[5];
    const mouth = landmarks[10];
    
    if (nose && leftEye && rightEye && mouth) {
      // Check if face is visible and frontal
      const faceVisible = nose.visibility > 0.9 && 
                          leftEye.visibility > 0.8 && 
                          rightEye.visibility > 0.8;
      
      let engagement = "low";
      if (faceVisible) {
        engagement = "high";
      } else if (nose.visibility > 0.7) {
        engagement = "moderate";
      }
      
      this.facialEngagementSamples.push(engagement);
      
      // Limit samples
      if (this.facialEngagementSamples.length > 30) {
        this.facialEngagementSamples.shift();
      }
    }
  }

  private analyzeBodyLanguage(landmarks: any[]) {
    // Simplified body language analysis
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    
    if (leftShoulder && rightShoulder && leftHip && rightHip) {
      // Calculate shoulder width
      const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
      
      // Determine if posture is open or closed
      let bodyLanguage = "neutral";
      if (shoulderWidth > 0.3) {
        bodyLanguage = "open";
      } else if (shoulderWidth < 0.2) {
        bodyLanguage = "closed";
      }
      
      this.bodyLanguageSamples.push(bodyLanguage);
      
      // Limit samples
      if (this.bodyLanguageSamples.length > 30) {
        this.bodyLanguageSamples.shift();
      }
    }
  }

  getAnalysis(): GestureAnalysis {
    // Calculate most frequent posture
    const postureCounts = this.countOccurrences(this.postureSamples);
    const posture = this.getMostFrequent(postureCounts) as "good" | "poor" | "neutral";
    
    // Calculate most frequent hand movement
    const handMovementCounts = this.countOccurrences(this.handMovementSamples);
    const handMovements = this.getMostFrequent(handMovementCounts) as "minimal" | "moderate" | "excessive";
    
    // Calculate most frequent facial engagement
    const facialEngagementCounts = this.countOccurrences(this.facialEngagementSamples);
    const facialEngagement = this.getMostFrequent(facialEngagementCounts) as "high" | "low" | "moderate";
    
    // Calculate most frequent body language
    const bodyLanguageCounts = this.countOccurrences(this.bodyLanguageSamples);
    const bodyLanguage = this.getMostFrequent(bodyLanguageCounts) as "open" | "closed" | "neutral";
    
    // Generate feedback
    let feedback = "";
    
    if (posture === "poor") {
      feedback += "Improve your posture by sitting up straight and facing the camera directly. ";
    }
    
    if (handMovements === "excessive") {
      feedback += "Try to reduce excessive hand movements as they can be distracting. ";
    } else if (handMovements === "minimal") {
      feedback += "Consider using more hand gestures to emphasize key points. ";
    }
    
    if (facialEngagement === "low") {
      feedback += "Increase your facial expressiveness to appear more engaged. ";
    }
    
    if (bodyLanguage === "closed") {
      feedback += "Open up your body language to project more confidence. ";
    }
    
    if (feedback === "") {
      feedback = "Your body language and gestures are appropriate for an interview setting.";
    }
    
    return {
      posture,
      handMovements,
      facialEngagement,
      bodyLanguage,
      feedback
    };
  }

  private countOccurrences(arr: string[]): Record<string, number> {
    return arr.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private getMostFrequent(counts: Record<string, number>): string {
    let maxCount = 0;
    let mostFrequent = "";
    
    Object.entries(counts).forEach(([item, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostFrequent = item;
      }
    });
    
    return mostFrequent;
  }
}

// Analysis Manager to coordinate all analyzers
export class AnalysisManager {
  private toneAnalyzer: ToneAnalyzer;
  private emotionAnalyzer: EmotionAnalyzer;
  private gestureAnalyzer: GestureAnalyzer;
  private isAnalyzing: boolean = false;

  constructor() {
    this.toneAnalyzer = new ToneAnalyzer();
    this.emotionAnalyzer = new EmotionAnalyzer();
    this.gestureAnalyzer = new GestureAnalyzer();
  }

  async start(video: HTMLVideoElement, audioStream: MediaStream): Promise<boolean> {
    try {
      // Start all analyzers
      const toneStarted = await this.toneAnalyzer.start(audioStream);
      const emotionStarted = await this.emotionAnalyzer.start(video);
      const gestureStarted = await this.gestureAnalyzer.start(video);
      
      this.isAnalyzing = toneStarted && emotionStarted && gestureStarted;
      return this.isAnalyzing;
    } catch (error) {
      console.error('Error starting analysis:', error);
      return false;
    }
  }

  stop() {
    this.toneAnalyzer.stop();
    this.emotionAnalyzer.stop();
    this.gestureAnalyzer.stop();
    this.isAnalyzing = false;
  }

  updateSpeechText(text: string) {
    if (this.isAnalyzing) {
      this.toneAnalyzer.processSpeech(text);
    }
  }

  getAnalysisResults() {
    return {
      toneAnalysis: this.toneAnalyzer.getAnalysis(),
      emotionAnalysis: this.emotionAnalyzer.getAnalysis(),
      gestureAnalysis: this.gestureAnalyzer.getAnalysis()
    };
  }
}