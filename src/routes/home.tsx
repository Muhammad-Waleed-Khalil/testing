import { Sparkles } from "lucide-react";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="flex-col w-full pb-24">
      <Container>
        <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-items-center max-w-6xl mx-auto">
          <div className="w-full">
            <h2 className="text-3xl text-center md:text-center md:text-6xl">
              <div className="flex flex-col items-center space-y-4">
                <span className="text-outline font-extrabold md:text-8xl tracking-wider bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  MOCPULSE
                </span>
                <div className="flex flex-col items-center">
                  <span className="text-primary font-bold text-2xl md:text-4xl">
                    Your Interview AI Partner
                  </span>
                  <span className="text-secondary font-semibold text-xl md:text-3xl mt-2">
                    Revolutionizing Mock Interviews with AI
                  </span>
                </div>
              </div>
            </h2>

            <div className="mt-8 text-center max-w-xl mx-auto">
              <p className="text-muted-foreground text-lg leading-relaxed">
                Transform your interview preparation with MOCPULSE's advanced AI technology.
                Experience personalized coaching, real-time feedback, and comprehensive
                analytics designed to elevate your interview performance.
              </p>
            </div>
          </div>

          <div className="flex justify-center w-full">
            <img 
              src="/assets/img/hero_section.jpeg" 
              alt="Interview Preparation" 
              className="rounded-lg shadow-xl max-h-[400px] object-cover"
            />
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="w-full py-12">
          <h3 className="text-2xl font-semibold text-center mb-8">What Our Users Say</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg bg-accent/10 space-y-4">
              <p className="text-muted-foreground italic">
                "MOCPULSE helped me prepare for my software engineering interview at Systems Limited. 
                The AI feedback on my responses was incredibly helpful!"
              </p>
              <p className="text-primary font-semibold">- Ahmad Hassan</p>
              <p className="text-sm text-muted-foreground">Software Engineer, Lahore</p>
            </div>

            <div className="p-6 rounded-lg bg-accent/10 space-y-4">
              <p className="text-muted-foreground italic">
                "I was nervous about my first job interview, but after practicing with MOCPULSE, 
                I felt confident and secured a position at 10Pearls!"
              </p>
              <p className="text-primary font-semibold">- Fatima Zahra</p>
              <p className="text-sm text-muted-foreground">Frontend Developer, Islamabad</p>
            </div>

            <div className="p-6 rounded-lg bg-accent/10 space-y-4">
              <p className="text-muted-foreground italic">
                "The personalized questions based on my CV made my preparation much more focused. 
                Successfully landed a job at NetSol Technologies!"
              </p>
              <p className="text-primary font-semibold">- Muhammad Usman</p>
              <p className="text-sm text-muted-foreground">Full Stack Developer, Karachi</p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="w-full mt-8 space-y-8">
          <h2 className="text-2xl font-semibold text-center mb-8">Complete Interview Preparation Workflow</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Authentication */}
            <div className="p-6 rounded-lg bg-accent/10 space-y-3">
              <h3 className="text-lg font-semibold text-primary">1. User Authentication</h3>
              <p className="text-muted-foreground">Secure sign-up and login system to protect your interview data and track your progress.</p>
            </div>

            {/* CV Upload */}
            <div className="p-6 rounded-lg bg-accent/10 space-y-3">
              <h3 className="text-lg font-semibold text-primary">2. CV Analysis</h3>
              <p className="text-muted-foreground">Upload your CV for AI analysis to generate personalized interview questions based on your experience.</p>
            </div>

            {/* Interview Generation */}
            <div className="p-6 rounded-lg bg-accent/10 space-y-3">
              <h3 className="text-lg font-semibold text-primary">3. AI Question Selection</h3>
              <p className="text-muted-foreground">AI analyzes your CV and job details to select relevant questions from our diverse question bank, ensuring targeted interview practice.</p>
            </div>

            {/* Mock Interview */}
            <div className="p-6 rounded-lg bg-accent/10 space-y-3">
              <h3 className="text-lg font-semibold text-primary">4. Personalized Interview</h3>
              <p className="text-muted-foreground">Experience a dynamic interview tailored to your experience level, with questions adapted from our extensive bank based on your profile.</p>
            </div>

            {/* Real-time Feedback */}
            <div className="p-6 rounded-lg bg-accent/10 space-y-3">
              <h3 className="text-lg font-semibold text-primary">5. Real-time Analysis</h3>
              <p className="text-muted-foreground">Instant feedback on your responses, body language, and communication skills.</p>
            </div>

            {/* Comprehensive Report */}
            <div className="p-6 rounded-lg bg-accent/10 space-y-3">
              <h3 className="text-lg font-semibold text-primary">6. Performance Report</h3>
              <p className="text-muted-foreground">Detailed analysis report with scores, improvements, and personalized recommendations.</p>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <Link to={"/generate"} className="w-full max-w-md">
              <Button className="w-full">
                Start Your Interview Preparation <Sparkles className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default HomePage;
