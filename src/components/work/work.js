import React, { useState } from 'react';
import './work.css';
import protfolio1 from '../../assets/portfolio-1.png';
import protfolio2 from '../../assets/portfolio-2.png';
import protfolio3 from '../../assets/portfolio-3.png';
import protfolio4 from '../../assets/portfolio-4.png';
import protfolio5 from '../../assets/portfolio-5.png';
import protfolio6 from '../../assets/portfolio-6.png';

const LEETCODE_PROFILE_URL = 'https://leetcode.com/u/Rishusaurabh/';
const LEETCODE_CARD_URL =
  'https://leetcard.jacoblin.cool/Rishusaurabh?theme=light,dark&font=Nunito&cache=0&border=0&radius=18';

const portfolioItems = [
  {
    id: 'portfolio-1',
    image: protfolio1,
    alt: 'Portfolio preview 1',
  },
  {
    id: 'portfolio-2',
    image: protfolio2,
    alt: 'Portfolio preview 2',
  },
  {
    id: 'portfolio-3',
    image: protfolio3,
    alt: 'Portfolio preview 3',
  },
  {
    id: 'portfolio-4',
    image: protfolio4,
    alt: 'Portfolio preview 4',
  },
  {
    id: 'portfolio-5',
    image: protfolio5,
    alt: 'Portfolio preview 5',
  },
  {
    id: 'portfolio-6',
    image: protfolio6,
    alt: 'Portfolio preview 6',
  },
];

const Work = () => {
  const [leetcodeCardFailed, setLeetcodeCardFailed] = useState(false);

  return (
    <section id="works">
      <h2 className="worksTitle">My Work</h2>
      <p className="worksDesc">
        Along with portfolio projects, I also track my problem-solving progress.
        This card pulls my LeetCode achievements dynamically so visitors can see my
        current profile at a glance.
      </p>

      <div className="workImgs">
        <a
          className="workCard workCardLeetcode"
          href={LEETCODE_PROFILE_URL}
          target="_blank"
          rel="noreferrer"
        >
          <div className="workCardHeader">
            <span className="workCardTag">Live Profile</span>
            <h3>LeetCode Achievements</h3>
            <p>Updated from my public LeetCode profile.</p>
          </div>

          {!leetcodeCardFailed ? (
            <div className="workLeetcodeMedia">
              <img
                src={LEETCODE_CARD_URL}
                alt="Live LeetCode stats for Rishusaurabh"
                className="workLeetcodeImg"
                loading="lazy"
                decoding="async"
                onError={() => setLeetcodeCardFailed(true)}
              />
            </div>
          ) : (
            <div className="workLeetcodeFallback">
              <strong>LeetCode Profile</strong>
              <span>Open my profile to view the latest solved problem count and ranking.</span>
            </div>
          )}
        </a>

        {portfolioItems.map((item) => (
          <article className="workCard" key={item.id}>
            <img src={item.image} alt={item.alt} className="workImg" />
          </article>
        ))}
      </div>

      <a
        className="workBtn"
        href={LEETCODE_PROFILE_URL}
        target="_blank"
        rel="noreferrer"
      >
        Visit LeetCode
      </a>
    </section>
  );
};

export default Work;
