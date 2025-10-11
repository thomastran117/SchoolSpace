import { useState, useRef } from "react";
import AuthImageSection from "../../components/auth/ImageSection";
import AuthFormSection from "../../components/auth/AuthSection";
import Captcha from "../../components/auth/GoogleCaptcha";
import "../../styles/auth.css";

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);
  const captchaRef = useRef();

  return (
    <main
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background:
          "linear-gradient(135deg, #f8e8ff 0%, #e6f0ff 25%, #eafff3 50%, #fffbe6 75%, #ffe8e8 100%)",
        backgroundSize: "200% 200%",
        animation: "bgShift 20s ease infinite",
      }}
    >
      <div
        className="auth-card-wrapper rounded-4 shadow-lg position-relative"
        style={{
          width: "100%",
          maxWidth: "900px",
          overflow: "hidden",
        }}
      >
        <div
          className="rounded-4 bg-white position-relative overflow-hidden"
          style={{
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            zIndex: 2,
          }}
        >
          <div className="row g-0 position-relative" style={{ zIndex: 1 }}>
            <AuthImageSection />
            <AuthFormSection
              isSignup={isSignup}
              setIsSignup={setIsSignup}
              captchaRef={captchaRef}
            />
          </div>
        </div>
      </div>
      <Captcha ref={captchaRef} />
    </main>
  );
}
