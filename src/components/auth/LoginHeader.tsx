import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export const LoginHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from || "/";

  return (
    <>
      <button
        onClick={() => navigate("/")}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Home
      </button>

      <h1 className="text-2xl font-semibold text-center mb-2">
        {from === "/analytics" ? "Unlock Analytics Features!" : "Welcome Back!"}
      </h1>
      <p className="text-gray-600 text-center mb-6">
        {from === "/analytics"
          ? "Sign in to access detailed analytics and track your content performance"
          : "Sign in to save your recordings and access analytics"}
      </p>
    </>
  );
};