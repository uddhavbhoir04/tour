import { useNavigate } from "react-router-dom";
import about from "../assets/images/about.jpg";

const About = () => {
  const navigate = useNavigate();
  return (
    <div>
      <section className="w-full bg-white py-12 px-4 md:px-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10">
          {/* Left Image Section */}
          <div className="w-full md:w-1/2">
            <img
              src={about}
              alt="Travel adventure"
              className="w-full h-full rounded-lg shadow-md object-contain"
            />
          </div>

          {/* Right Text Section */}
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h2 className="text-3xl font-bold text-[#EB662B] mb-4">
              About The Roaming Birds
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              At <span className="font-semibold text-[#EB662B]">The Roaming Birds</span>, we
              believe that every journey should be unforgettable. Our mission is
              to help you explore the world with ease and comfort — whether
              you're looking for serene beaches, vibrant cities, or thrilling
              adventures. With curated travel packages, local expertise, and
              24/7 support, we make sure your travel dreams come true.
            </p>
            <p className="text-gray-700 mt-4">
              Start your journey today with Trevo — where your adventure begins.
            </p>
            <button
              onClick={() => navigate("/search")}
              className="mt-12 px-6 py-3 bg-[#EB662B] text-white rounded-lg hover:opacity-90 transition-all duration-300"
            >
              Explore Tours
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
export default About;
