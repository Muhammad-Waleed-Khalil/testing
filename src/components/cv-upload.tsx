import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from './ui/card';
import { CVData } from '@/types';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';

interface CVUploadProps {
  onCVData: (data: CVData) => void;
}

export function CVUpload({ onCVData }: CVUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    setIsProcessing(true);
    try {
      // Mock CV data
      const mockCVData: CVData = {
        fullName: "John Doe",
        email: "john.doe@example.com",
        phone: "+1234567890",
        education: [
          {
            degree: "Master of Computer Science",
            institution: "Tech University",
            year: "2020"
          }
        ],
        experience: [
          {
            position: "Senior Software Engineer",
            company: "Tech Corp",
            duration: "3 years",
            responsibilities: ["Led development team", "Implemented key features"]
          }
        ],
        skills: ["React", "TypeScript", "Node.js", "AWS"],
        languages: ["English", "Spanish"]
      };

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onCVData(mockCVData);
      toast.success('CV processed successfully');
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast.error(error instanceof Error ? error.message : 'Error processing CV');
    } finally {
      setIsProcessing(false);
    }
  }, [onCVData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={`p-6 border-2 border-dashed cursor-pointer ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          {isProcessing ? (
            <>
              <Loader className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm text-gray-500">Processing your CV...</p>
            </>
          ) : isDragActive ? (
            <p>Drop your CV here</p>
          ) : (
            <>
              <p>Drag and drop your CV here, or click to select</p>
              <p className="text-sm text-gray-500">Only PDF files are accepted</p>
            </>
          )}
        </div>
      </Card>
      <div className="text-sm text-gray-500">
        <p>Tips for better CV processing:</p>
        <ul className="list-disc pl-5 mt-1">
          <li>Ensure your CV has clear section headers (Education, Experience, Skills, etc.)</li>
          <li>Use standard section names for better detection</li>
          <li>Make sure the PDF is text-based, not scanned images</li>
        </ul>
      </div>
    </div>
  );
}
