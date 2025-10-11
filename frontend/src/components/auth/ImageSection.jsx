import { useState, useEffect } from "react";

export default function ImageSection() {
  const images = [
    "https://png.pngtree.com/background/20240824/original/pngtree-blue-and-purple-neon-star-3d-art-background-with-a-cool-picture-image_10210904.jpg",
    "https://t3.ftcdn.net/jpg/07/35/44/76/360_F_735447660_Mb1mTmfff8EhrRuornYjGkE9JlGUk4lP.jpg",
    "https://t4.ftcdn.net/jpg/05/76/98/51/240_F_576985183_nfEaQRw64qlH8rqjbLjtMrvkiQfRbagf.jpg",
  ];

  const [current, setCurrent] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % images.length);
        setIsFading(false);
      }, 800);
    }, 5000);
    return () => clearTimeout(timer);
  }, [current, images.length]);

  return (
    <div className="col-md-6 d-none d-md-flex justify-content-center align-items-center bg-light-subtle position-relative overflow-hidden">
      <div className="auth-ribbons">
        <svg viewBox="0 0 800 600" preserveAspectRatio="none">
          <defs>
            <linearGradient
              id="leftRibbon1"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#a2d2ff" />
              <stop offset="50%" stopColor="#ffc8dd" />
              <stop offset="100%" stopColor="#bde0fe" />
            </linearGradient>
            <linearGradient
              id="leftRibbon2"
              x1="0%"
              y1="100%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#ffd6a5" />
              <stop offset="50%" stopColor="#cdb4db" />
              <stop offset="100%" stopColor="#ffafcc" />
            </linearGradient>
            <linearGradient
              id="leftRibbon3"
              x1="0%"
              y1="50%"
              x2="100%"
              y2="50%"
            >
              <stop offset="0%" stopColor="#e2f0ff" />
              <stop offset="100%" stopColor="#fce1ff" />
            </linearGradient>
          </defs>

          <path
            d="M -100 120 C 200 200, 400 60, 900 220"
            fill="none"
            stroke="url(#leftRibbon1)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.35"
          />
          <path
            d="M -100 280 C 150 350, 450 180, 900 350"
            fill="none"
            stroke="url(#leftRibbon2)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
          />
          <path
            d="M -100 440 C 220 500, 500 300, 900 460"
            fill="none"
            stroke="url(#leftRibbon3)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.25"
          />
        </svg>
      </div>

      {images.map((src, index) => (
        <img
          key={index}
          src={src}
          alt={`Slide ${index + 1}`}
          className="img-fluid position-absolute carousel-slide"
          style={{
            opacity: index === current ? (isFading ? 0 : 1) : 0,
            transition: "opacity 1s ease-in-out",
            width: "85%",
            height: "85%",
            objectFit: "cover",
            borderRadius: "1rem",
            filter: "brightness(0.95)",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
            zIndex: 2,
          }}
        />
      ))}

      <div
        className="position-absolute d-flex gap-2"
        style={{ bottom: "20px", zIndex: 3 }}
      >
        {images.map((_, index) => (
          <div
            key={index}
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor:
                index === current
                  ? "rgba(13,110,253,0.9)"
                  : "rgba(13,110,253,0.25)",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
