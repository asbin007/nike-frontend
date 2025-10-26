import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  className?: string;
  to?: string; // Optional: specific route to go to
}

const BackButton: React.FC<BackButtonProps> = ({ className = "", to }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1); // Go back in browser history
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-orange-500 transition-colors duration-200 ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="text-sm font-medium">Back</span>
    </button>
  );
};

export default BackButton;

