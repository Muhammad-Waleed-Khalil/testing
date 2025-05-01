import { Card, CardContent } from "@/components/ui/card";
import { CircleDot } from "lucide-react";

export const Mission = () => {
  const missionPoints = [
    "Revolutionizing interview preparation through AI-powered mock interviews",
    "Providing personalized feedback on communication, technical skills, and body language",
    "Making quality interview practice accessible to everyone",
    "Helping candidates build confidence through real-time performance analysis",
    "Creating a seamless practice environment that simulates real interviews",
    "Using advanced analytics to identify areas for improvement"
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-8">Our Mission</h1>
      
      <div className="max-w-3xl mx-auto space-y-8">
        <p className="text-lg text-gray-700 text-center mb-8">
          At MockPulse, we're dedicated to transforming how professionals prepare for interviews 
          through innovative AI technology and real-time feedback systems.
        </p>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {missionPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CircleDot className="h-5 w-5 mt-1 text-purple-500" />
                  <p className="text-gray-700">{point}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="bg-purple-50 rounded-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
          <p className="text-gray-700">
            We envision a future where every job seeker has access to sophisticated interview 
            preparation tools that provide actionable insights and build genuine confidence. 
            Through continuous innovation in AI technology, we aim to make comprehensive 
            interview preparation accessible, effective, and transformative.
          </p>
        </div>
      </div>
    </div>
  );
};
