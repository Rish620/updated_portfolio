import React, { useEffect, useState } from 'react';
import './intro.css';
import btnImg from '../../assets/hireme.png';

// Typing effect hook
const useTyping = (text, speed = 150) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i === text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return displayed;
};

const Intro = () => {
  const typedName = useTyping("I'm Rishu", 150);
  const portrait = `${process.env.PUBLIC_URL}/intro-portrait.png?v=20260317`;

  return (
   <section id="intro">
  <div className="introWrapper">
    <img src={portrait} alt="Rishu portrait" className="introImage" />
    
    <div className="introContent">
      <span className="hello">Hello,</span>
      <span className="introText">
        <span className="introName">{typedName}</span> <br />
         Developer
      </span>
      <p className="intropara">
        I am a skilled web developer with experience in creating <br />
        visually appealing and user-friendly websites.
      </p>
       
      <button className="btn">
        <img src={btnImg} alt="Hire me icon" className="btnImg" />
        Hire me
        <span className="downloadIcon" title="Download CV">⬇️</span>
        <a href="/Rishu_Resume.pdf" download target="_blank" rel="noopener noreferrer">
  Download CV
</a>

      </button>
    </div>
  </div>
</section>

  );
};

export default Intro;
