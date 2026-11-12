import { useNavigate } from "react-router-dom";
import about from "../assets/images/about.jpg";
import { useSettings } from "../context/SettingsContext";

const About = () => {
  const navigate = useNavigate();
  const { s } = useSettings();
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
            <h2 className="text-3xl font-bold text-emerald-700 mb-4">{s.aboutTitle || `About ${s.brandName || ""}`}</h2>
            {(s.aboutText || []).map((para, i) => (
              <p key={i} className="text-gray-700 text-lg leading-relaxed mb-4">
                {para}
              </p>
            ))}
            <button
              onClick={() => navigate("/search")}
              className="mt-12 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:opacity-90 transition-all duration-300"
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
