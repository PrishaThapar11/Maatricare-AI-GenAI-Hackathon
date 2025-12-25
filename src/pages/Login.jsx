import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import loginIllustration from "../assets/login-illustration.jpeg";

export default function Login() {
  const { setUser, t } = useAppContext();
  const [name, setName] = useState("");
  const navigate = useNavigate();

  /*const handleLogin = () => {
    if (!name.trim()) return alert("Please enter your name!");
    setUser({ name });
    navigate("/dashboard");
  };*/
  const handleLogin = async () => {
  const res = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username: name })

  });

  const data = await res.json();


const userObj = {
  id: data.userId,        // ✅ Keep this as 'id'
  name: data.username
};

// save to context
setUser(userObj);

// save to localStorage (single object, cleaner)
localStorage.setItem("maatricare_user", JSON.stringify(userObj));

navigate("/Dashboard");

};


  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* LEFT */}
        <div style={styles.left}>
          <h2 style={styles.loginTitle}>{t.loginTitle}</h2>

          <p style={styles.loginSubtitle}>
            Access your maternal care dashboard
          </p>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />

          <button onClick={handleLogin} style={styles.button}>
            {t.loginButton}
          </button>

          <p style={styles.footerText}>
            For authorized ASHA workers only
          </p>
        </div>

        {/* RIGHT */}
        <div style={styles.right}>
          {/* PINK OUTLINE */}
          <div style={styles.pinkOutline}>
            {/* WHITE BLOB */}
            <div style={styles.whiteBlob}>
              <img
                src={loginIllustration}
                alt="Healthcare"
                style={styles.circleImage}
              />
            </div>
          </div>

          <h1 style={styles.brand}>MaatriCare AI</h1>
          <p style={styles.tagline}>
            AI-powered maternal care for frontline health workers
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f3b6cf, #f8cdda)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Inter, Arial, sans-serif",
  },

  container: {
    width: "90%",
    maxWidth: "1100px",
    height: "600px",
    background: "#ffffff",
    borderRadius: "26px",
    display: "flex",
    overflow: "hidden",
    boxShadow: "0 30px 80px rgba(236,72,153,0.25)",
  },

  /* LEFT PANEL */
  left: {
    width: "42%",
    padding: "60px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  loginTitle: {
    fontSize: "28px",
    color: "#831843",
    fontWeight: 700,
  },

  loginSubtitle: {
    fontSize: "14px",
    color: "#9d174d",
    marginBottom: "28px",
  },

  input: {
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #f9a8d4",
    marginBottom: "18px",
    fontSize: "15px",
  },

  button: {
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #ec4899, #db2777)",
    color: "#fff",
    fontSize: "15px",
    cursor: "pointer",
    fontWeight: 600,
  },

  footerText: {
    marginTop: "22px",
    fontSize: "13px",
    color: "#9d174d",
  },

  /* RIGHT PANEL */
  right: {
    width: "58%",
    background: "linear-gradient(135deg, #ffe4ec, #ffd1dc)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  /* PINK OUTLINE SHAPE */
  pinkOutline: {
    width: "360px",
    height: "360px",
    background: "#ec4899",
    borderRadius: "55% 45% 60% 40% / 45% 55% 45% 55%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transform: "rotate(-4deg)",
    marginBottom: "28px",
  },

  /* INNER WHITE SHAPE */
  whiteBlob: {
    width: "90%",
    height: "90%",
    background: "#ffffff",
    borderRadius: "48% 52% 45% 55% / 55% 45% 55% 45%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transform: "rotate(4deg)",
  },

  circleImage: {
    width: "83%",
    height: "80%",
    objectFit: "contain",
    borderRadius: '55px',
  },

  brand: {
    fontSize: "32px",
    color: "#831843",
    fontWeight: 700,
    fontFamily: "'Poppins', sans-serif",
    marginTop: "6px",
  },

  tagline: {
    fontSize: "15px",
    color: "#9d174d",
    textAlign: "center",
    maxWidth: "320px",
    fontFamily: "'Poppins', sans-serif",
    marginTop: "2px",
  },
};

