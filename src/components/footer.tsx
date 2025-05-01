import { Container } from "@/components/container";

export const Footer: React.FC = () => {
  return (
    <div className="w-full bg-black text-gray-300 hover:text-gray-100 py-8">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* First Column: About Us */}
          <div>
            <h3 className="font-bold text-lg mb-4">About Us</h3>
            <p>
              MOCPULSE is an advanced AI-powered mock interview platform, developed as a Final Year Project
              by Muhammad Waleed Khalil and Muhammad Saad. Our innovative solution combines cutting-edge AI
              technology with comprehensive interview preparation tools.
            </p>
          </div>

          {/* Second Column: Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <p className="mb-4">City University of Science and Information Technology</p>
            <p className="mb-4">Email:</p>
            <ul className="list-none space-y-2">
              <li>Muhammad Waleed Khalil - <a href="mailto:mwaleedkhalil@gmail.com" className="text-primary hover:underline">mwaleedkhalil@gmail.com</a></li>
              <li>Muhammad Saad - <a href="mailto:saadkhangcpian@gmail.com" className="text-primary hover:underline">saadkhangcpian@gmail.com</a></li>
            </ul>
          </div>
        </div>
      </Container>
    </div>
  );
};
