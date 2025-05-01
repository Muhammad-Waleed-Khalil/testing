/* eslint-disable @typescript-eslint/no-unused-vars */
import { useAuth } from "@clerk/clerk-react";
import {
  CircleStop,
  Loader,
  Mic,
  RefreshCw,
  Save,
  Video,
  VideoOff,
  WebcamIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useSpeechToText, { ResultType } from "react-hook-speech-to-text";
import { useParams } from "react-router-dom";
import WebCam from "react-webcam";
import { TooltipButton } from "./tooltip-button";
import { toast } from "sonner";
import { chatSession } from "@/scripts";
import { SaveModal } from "./save-modal";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { ToneAnalysis, EmotionAnalysis, GestureAnalysis } from "@/types";
import { AnalysisManager } from "@/lib/analysis";


interface RecordAnswerProps {
  question: { question: string; answer: string };
  isWebCam: boolean;
  setIsWebCam: (value: boolean) => void;
}

interface AIResponse {
  ratings: number;
  feedback: string;
  toneAnalysis: ToneAnalysis;
  emotionAnalysis: EmotionAnalysis;
  gestureAnalysis: GestureAnalysis;
}

export const RecordAnswer = ({
  question,
  isWebCam,
  setIsWebCam,
}: RecordAnswerProps) => {
  const {
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  const [userAnswer, setUserAnswer] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // References
  const webcamRef = useRef<WebCam>(null);
  const analysisManagerRef = useRef<AnalysisManager | null>(null);

  const { userId } = useAuth();
  const { interviewId } = useParams();

  const recordUserAnswer = async () => {
    if (isRecording) {
      stopSpeechToText();
      
      // Stop analysis if it's running
      if (isAnalyzing && analysisManagerRef.current) {
        analysisManagerRef.current.stop();
        setIsAnalyzing(false);
      }
      
      // Check answer length and generate result
      if (userAnswer?.length >= 30) {
        const result = await generateResult(
          question.question,
          question.answer,
          userAnswer
        );
        setAiResult(result);
      } else {
        toast.error("Error", {
          description: "Your answer should be more than 30 characters",
        });
      }
    } else {
      setAiResult(null); // Reset AI result when starting new recording
      startSpeechToText();
      
      // Start real-time analysis if webcam is enabled
      if (isWebCam && webcamRef.current && webcamRef.current.video) {
        try {
          // Get audio stream for tone analysis
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          
          // Initialize analysis manager if needed
          if (!analysisManagerRef.current) {
            analysisManagerRef.current = new AnalysisManager();
          }
          
          // Start analysis
          const success = await analysisManagerRef.current.start(
            webcamRef.current.video,
            audioStream
          );
          
          if (success) {
            setIsAnalyzing(true);
            toast.success("Analysis started", {
              description: "Real-time analysis of tone, expression, and gestures is now active",
            });
          } else {
            toast.error("Analysis failed", {
              description: "Could not start real-time analysis. Please try again.",
            });
          }
        } catch (error) {
          console.error("Error starting analysis:", error);
          toast.error("Analysis error", {
            description: "Could not access media devices for analysis",
          });
        }
      }
    }
  };

  const cleanJsonResponse = (responseText: string) => {
    // Step 1: Trim any surrounding whitespace
    let cleanText = responseText.trim();

    // Step 2: Remove any occurrences of "json" or code block symbols (``` or `)
    cleanText = cleanText.replace(/(json|```|`)/g, "");

    // Step 3: Parse the clean JSON text into an array of objects
    try {
      return JSON.parse(cleanText);
    } catch (error) {
      throw new Error("Invalid JSON format: " + (error as Error)?.message);
    }
  };

  const generateResult = async (
    qst: string,
    qstAns: string,
    userAns: string,
  ): Promise<AIResponse> => {
    setIsAiGenerating(true);
    
    // Get real-time analysis results if available
    let realTimeAnalysis = {
      toneAnalysis: {
        pitch: 50,
        speed: 0,
        confidence: "confident" as const,
        feedback: "No tone analysis available"
      },
      emotionAnalysis: {
        primary: "neutral" as const,
        intensity: 0,
        timeline: [],
        feedback: "No emotion analysis available"
      },
      gestureAnalysis: {
        posture: "neutral" as const,
        handMovements: "minimal" as const,
        facialEngagement: "low" as const,
        bodyLanguage: "neutral" as const,
        feedback: "No gesture analysis available"
      }
    };
    
    // Get analysis results if analysis is active
    if (isAnalyzing && analysisManagerRef.current) {
      // Update tone analyzer with the final speech text
      analysisManagerRef.current.updateSpeechText(userAns);
      
      // Get the analysis results
      realTimeAnalysis = analysisManagerRef.current.getAnalysisResults();
    }
    
    const prompt = `
      Question: "${qst}"
      User Answer: "${userAns}"
      Correct Answer: "${qstAns}"
      
      Analyze the answer and provide a concise analysis with actionable tips:
      1. Content Rating (1-10) with a brief improvement tip
      
      Return a JSON response with concise tips:
      {
        "ratings": number (1-10),
        "feedback": "Brief actionable content improvement tip"
      }
    `;

    try {
      // Only use AI for content rating and feedback
      const aiResult = await chatSession.sendMessage(prompt);
      const parsedContentResult = cleanJsonResponse(aiResult.response.text());
      
      // Combine AI content analysis with real-time analysis
      const combinedResult: AIResponse = {
        ratings: parsedContentResult.ratings || 0,
        feedback: parsedContentResult.feedback || "Unable to generate feedback",
        toneAnalysis: realTimeAnalysis.toneAnalysis,
        emotionAnalysis: realTimeAnalysis.emotionAnalysis,
        gestureAnalysis: realTimeAnalysis.gestureAnalysis
      };
      
      return combinedResult;
    } catch (error) {
      console.log(error);
      toast("Error", {
        description: "An error occurred while generating feedback.",
      });
      return {
        ratings: 0,
        feedback: "Unable to generate feedback",
        toneAnalysis: realTimeAnalysis.toneAnalysis,
        emotionAnalysis: realTimeAnalysis.emotionAnalysis,
        gestureAnalysis: realTimeAnalysis.gestureAnalysis
      };
    } finally {
      setIsAiGenerating(false);
    }
  };

  const recordNewAnswer = () => {
    setUserAnswer("");
    setAiResult(null); // Reset AI result for new recording
    
    // Stop current recording if active
    if (isRecording) {
      stopSpeechToText();
    }
    
    // Stop analysis if it's running
    if (isAnalyzing && analysisManagerRef.current) {
      analysisManagerRef.current.stop();
      setIsAnalyzing(false);
    }
    
    // Start new recording
    startSpeechToText();
    
    // Start real-time analysis if webcam is enabled
    if (isWebCam && webcamRef.current && webcamRef.current.video) {
      try {
        // Get audio stream for tone analysis
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(audioStream => {
            // Initialize analysis manager if needed
            if (!analysisManagerRef.current) {
              analysisManagerRef.current = new AnalysisManager();
            }
            
            // Start analysis
            analysisManagerRef.current.start(
              webcamRef.current!.video!,
              audioStream
            ).then(success => {
              if (success) {
                setIsAnalyzing(true);
                toast.success("Analysis started", {
                  description: "Real-time analysis is now active",
                });
              }
            });
          })
          .catch(error => {
            console.error("Error accessing audio:", error);
          });
      } catch (error) {
        console.error("Error starting analysis:", error);
      }
    }
  };

  const saveUserAnswer = async () => {
    setLoading(true);

    if (!aiResult) {
      return;
    }

    const currentQuestion = question.question;
    try {
      // query the firbase to check if the user answer already exists for this question

      const userAnswerQuery = query(
        collection(db, "userAnswers"),
        where("userId", "==", userId),
        where("question", "==", currentQuestion)
      );

      const querySnap = await getDocs(userAnswerQuery);

      // if the user already answerd the question dont save it again
      if (!querySnap.empty) {
        console.log("Query Snap Size", querySnap.size);
        toast.info("Already Answered", {
          description: "You have already answered this question",
        });
        return;
      } else {
        // save the user answer

        await addDoc(collection(db, "userAnswers"), {
          mockIdRef: interviewId,
          question: question.question,
          correct_ans: question.answer,
          user_ans: userAnswer,
          feedback: aiResult.feedback,
          rating: aiResult.ratings,
          userId,
          createdAt: serverTimestamp(),
          toneAnalysis: aiResult.toneAnalysis,
          emotionAnalysis: aiResult.emotionAnalysis,
          gestureAnalysis: aiResult.gestureAnalysis
        });

        toast("Saved", { description: "Your answer has been saved.." });
      }

      setUserAnswer("");
      stopSpeechToText();
    } catch (error) {
      toast("Error", {
        description: "An error occurred while generating feedback.",
      });
      console.log(error);
    } finally {
      setLoading(false);
      setOpen(!open);
    }
  };

  useEffect(() => {
    const combineTranscripts = results
      .filter((result): result is ResultType => typeof result !== "string")
      .map((result) => result.transcript)
      .join(" ");

    setUserAnswer(combineTranscripts);
    
    // Update tone analyzer with current speech text if analyzing
    if (isAnalyzing && analysisManagerRef.current && combineTranscripts) {
      analysisManagerRef.current.updateSpeechText(combineTranscripts);
    }
  }, [results, isAnalyzing]);
  
  // Cleanup effect to stop analysis when component unmounts
  useEffect(() => {
    return () => {
      // Stop analysis if it's running when component unmounts
      if (analysisManagerRef.current) {
        analysisManagerRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-8 mt-4">
      {/* save modal */}
      <SaveModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={saveUserAnswer}
        loading={loading}
      />

      <div className="w-full h-[400px] md:w-96 flex flex-col items-center justify-center border p-4 bg-gray-50 rounded-md">
        {isWebCam ? (
          <WebCam
            ref={webcamRef}
            onUserMedia={() => setIsWebCam(true)}
            onUserMediaError={() => setIsWebCam(false)}
            className="w-full h-full object-cover rounded-md"
          />
        ) : (
          <WebcamIcon className="min-w-24 min-h-24 text-muted-foreground" />
        )}
      </div>

      <div className="flex itece justify-center gap-3">
        <TooltipButton
          content={isWebCam ? "Turn Off" : "Turn On"}
          icon={
            isWebCam ? (
              <VideoOff className="min-w-5 min-h-5" />
            ) : (
              <Video className="min-w-5 min-h-5" />
            )
          }
          onClick={() => setIsWebCam(!isWebCam)}
        />

        <TooltipButton
          content={isRecording ? "Stop Recording" : "Start Recording"}
          icon={
            isRecording ? (
              <CircleStop className="min-w-5 min-h-5" />
            ) : (
              <Mic className="min-w-5 min-h-5" />
            )
          }
          onClick={recordUserAnswer}
        />

        <TooltipButton
          content="Record Again"
          icon={<RefreshCw className="min-w-5 min-h-5" />}
          onClick={recordNewAnswer}
        />

        <TooltipButton
          content="Save Result"
          icon={
            isAiGenerating ? (
              <Loader className="min-w-5 min-h-5 animate-spin" />
            ) : (
              <Save className="min-w-5 min-h-5" />
            )
          }
          onClick={() => setOpen(!open)}
          disbaled={!aiResult}
        />
      </div>

      <div className="w-full mt-4 p-4 border rounded-md bg-gray-50">
        <h2 className="text-lg font-semibold">Your Answer:</h2>

        <p className="text-sm mt-2 text-gray-700 whitespace-normal">
          {userAnswer || "Start recording to see your ansewer here"}
        </p>

        {interimResult && (
          <p className="text-sm text-gray-500 mt-2">
            <strong>Current Speech:</strong>
            {interimResult}
          </p>
        )}
      </div>
    </div>
  );
};
