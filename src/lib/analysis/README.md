# Real-time Analysis Features

## Overview
This module implements real-time analysis of tone, facial expressions, and gestures during interview recordings. It uses browser-friendly technologies:

- **Web Audio API** - For tone analysis (pitch, speed, confidence)
- **face-api.js** - For facial expression analysis (emotions)
- **MediaPipe** - For gesture/body language analysis (posture, hand movements)

## Components

### AnalysisManager
The main class that coordinates all analysis features. It initializes and manages the individual analyzers.

### ToneAnalyzer
Analyzes speech using Web Audio API to detect:
- Pitch variations
- Speaking speed (words per minute)
- Confidence level based on voice patterns

### EmotionAnalyzer
Uses face-api.js to detect facial expressions and emotions:
- Primary emotion (happiness, sadness, anger, surprise, frustration, neutral)
- Emotion intensity
- Timeline of emotions throughout the recording

### GestureAnalyzer
Uses MediaPipe to analyze body language and gestures:
- Posture quality
- Hand movement frequency and intensity
- Facial engagement
- Overall body language (open vs. closed)

## Integration
The analysis features are integrated into the RecordAnswer component and automatically start when recording begins if the webcam is enabled. The analysis results are combined with AI-generated content feedback to provide comprehensive interview performance insights.

## Models
Face-api.js models are stored in the `/public/models` directory and are loaded when the application starts.

## Usage
No additional configuration is needed. The analysis features will automatically work when recording with the webcam enabled.