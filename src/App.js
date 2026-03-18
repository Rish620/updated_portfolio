import { useEffect, useState } from "react";
import Navbar from "./components/navbar/navbar";
import Intro from "./components/intro/intro";
import Skill from "./components/skills/skill";
import Work from "./components/work/work";
import Contact from "./components/contact/contact";
import Footer from "./components/footer/footer";

const getInitialTheme = () => {
  const storedTheme = localStorage.getItem("portfolio-theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }
  return "light";
};

function App() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
    localStorage.removeItem("theme");
    localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  return (
    <div className="App">
       <Navbar theme={theme} onToggleTheme={toggleTheme} />
       <Intro/>
       <Skill/>
       <Work />
       <Contact />
       <Footer />
    </div>
  );
}
export default App;
