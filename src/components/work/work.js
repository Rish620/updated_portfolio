import React, { useCallback, useEffect, useRef, useState } from 'react';
import './work.css';
import protfolio1 from '../../assets/portfolio-1.png';
import protfolio2 from '../../assets/portfolio-2.png';
import protfolio3 from '../../assets/portfolio-3.png';
import protfolio4 from '../../assets/portfolio-4.png';
import protfolio5 from '../../assets/portfolio-5.png';
import protfolio6 from '../../assets/portfolio-6.png';

const LEETCODE_PROFILE_URL = 'https://leetcode.com/u/Rishusaurabh/';
const LINKEDIN_PROFILE_URL = 'https://www.linkedin.com/in/rishu-saurabh-4901a7252/';
const LEETCODE_CARD_URL =
  'https://leetcard.jacoblin.cool/Rishusaurabh?theme=light,dark&font=Nunito&cache=0&border=0&radius=18';
const PROFILE_DATA_URL =
  process.env.REACT_APP_PROFILE_DATA_URL || `${process.env.PUBLIC_URL}/profile-data.json`;
const PROFILE_REFRESH_INTERVAL_MS = 180000;
const DEFAULT_EXPERIENCE_DATA = {
  currentCompany: 'Apptad',
  currentRole: 'Intern',
  summary:
    'This card refreshes from a live profile data file, so company and role changes can appear without editing the component.',
  timeline: [
    {
      role: 'Intern',
      company: 'Apptad',
      details: 'Currently contributing at Apptad and continuing to grow my professional experience.',
    },
    {
      role: 'Cloud Engineer Intern',
      company: 'Ecotec Service',
      details: 'Worked onsite with AWS, Google Cloud, and Jenkins-based CI/CD workflows.',
    },
    {
      role: 'Full Stack Intern',
      company: 'Future Interns',
      details: 'Built and maintained web applications with React.js, Node.js, and MongoDB.',
    },
  ],
  skills: ['React.js', 'Node.js', 'AWS', 'Google Cloud', 'Jenkins', 'CI/CD'],
  lastUpdated: '',
};

const toTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');

const normalizeTimeline = (value) => {
  if (!Array.isArray(value)) {
    return DEFAULT_EXPERIENCE_DATA.timeline;
  }

  const nextTimeline = value
    .map((item) => ({
      role: toTrimmedString(item?.role),
      company: toTrimmedString(item?.company),
      details: toTrimmedString(item?.details),
    }))
    .filter((item) => item.role && item.company);

  return nextTimeline.length > 0 ? nextTimeline : DEFAULT_EXPERIENCE_DATA.timeline;
};

const normalizeSkills = (value) => {
  if (!Array.isArray(value)) {
    return DEFAULT_EXPERIENCE_DATA.skills;
  }

  const nextSkills = value
    .map((item) => toTrimmedString(item))
    .filter(Boolean);

  return nextSkills.length > 0 ? nextSkills : DEFAULT_EXPERIENCE_DATA.skills;
};

const normalizeExperienceData = (value = {}) => ({
  currentCompany:
    toTrimmedString(value.currentCompany) || DEFAULT_EXPERIENCE_DATA.currentCompany,
  currentRole: toTrimmedString(value.currentRole) || DEFAULT_EXPERIENCE_DATA.currentRole,
  summary: toTrimmedString(value.summary) || DEFAULT_EXPERIENCE_DATA.summary,
  timeline: normalizeTimeline(value.timeline),
  skills: normalizeSkills(value.skills),
  lastUpdated: toTrimmedString(value.lastUpdated),
});

const buildProfileDataUrl = () => {
  const separator = PROFILE_DATA_URL.includes('?') ? '&' : '?';
  return `${PROFILE_DATA_URL}${separator}ts=${Date.now()}`;
};

const fetchExperienceData = async (signal) => {
  const response = await fetch(buildProfileDataUrl(), {
    cache: 'no-store',
    signal,
  });

  if (!response.ok) {
    throw new Error('Unable to load live experience data right now.');
  }

  const payload = await response.json();
  return normalizeExperienceData(payload);
};

const formatSyncTime = (value) =>
  value
    ? value.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Waiting...';

const formatSourceUpdate = (value) => {
  if (!value) {
    return '';
  }

  const parsedValue = new Date(value);

  if (Number.isNaN(parsedValue.getTime())) {
    return '';
  }

  return parsedValue.toLocaleDateString([], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getMonogram = (value) => {
  const words = toTrimmedString(value).split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return 'LI';
  }

  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
};

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
  const [experienceData, setExperienceData] = useState(DEFAULT_EXPERIENCE_DATA);
  const [experienceStatus, setExperienceStatus] = useState('idle');
  const [experienceError, setExperienceError] = useState('');
  const [experienceLastSynced, setExperienceLastSynced] = useState(null);
  const experienceAbortControllerRef = useRef(null);
  const hasLoadedExperienceRef = useRef(false);

  const loadExperienceData = useCallback(async () => {
    if (experienceAbortControllerRef.current) {
      experienceAbortControllerRef.current.abort();
      experienceAbortControllerRef.current = null;
    }

    setExperienceStatus(hasLoadedExperienceRef.current ? 'refreshing' : 'loading');
    setExperienceError('');

    const controller = new AbortController();
    experienceAbortControllerRef.current = controller;

    try {
      const nextExperienceData = await fetchExperienceData(controller.signal);
      setExperienceData(nextExperienceData);
      setExperienceLastSynced(new Date());
      setExperienceStatus('ready');
      hasLoadedExperienceRef.current = true;
    } catch (loadError) {
      if (loadError.name === 'AbortError') {
        return;
      }

      setExperienceError(loadError.message || 'Unable to load live experience data right now.');
      setExperienceStatus(hasLoadedExperienceRef.current ? 'ready' : 'error');
    } finally {
      if (experienceAbortControllerRef.current === controller) {
        experienceAbortControllerRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    loadExperienceData();

    const intervalId = window.setInterval(() => {
      loadExperienceData();
    }, PROFILE_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);

      if (experienceAbortControllerRef.current) {
        experienceAbortControllerRef.current.abort();
      }
    };
  }, [loadExperienceData]);

  const isExperienceLoading = experienceStatus === 'loading';
  const isExperienceRefreshing = experienceStatus === 'refreshing';
  const sourceUpdatedLabel = formatSourceUpdate(experienceData.lastUpdated);
  const experienceStatusText = isExperienceLoading
    ? 'Loading live experience data...'
    : experienceError
      ? experienceError
      : `Last synced ${formatSyncTime(experienceLastSynced)}. Auto-refresh runs every 3 minutes.`;

  return (
    <section id="works">
      <h2 className="worksTitle">My Work</h2>
      <p className="worksDesc">
        Along with portfolio projects, I also track my problem-solving progress and
        professional updates. These featured cards pull live LeetCode stats and
        auto-refresh synced experience data so visitors can see what I am doing now.
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

        <article className="workCard workCardExperience">
          <div className="workExperienceTop">
            <span className="workCardTag workCardTagLinkedin">Auto Sync</span>
            <span className="workExperiencePill">Experience + Company</span>
          </div>

          <div className="workCardHeader">
            <h3>Professional Experience</h3>
            <p>{experienceData.summary}</p>
          </div>

          <div className="workExperienceCompany">
            <div className="workExperienceIdentity">
              <span className="workExperienceMonogram">
                {getMonogram(experienceData.currentCompany)}
              </span>
              <div>
                <span className="workExperienceLabel">Current company</span>
                <strong>{experienceData.currentCompany}</strong>
                <span className="workExperienceMeta">
                  Current role: {experienceData.currentRole}
                </span>
                {sourceUpdatedLabel ? (
                  <span className="workExperienceMeta workExperienceMetaSoft">
                    Source updated {sourceUpdatedLabel}
                  </span>
                ) : null}
              </div>
            </div>

            <a
              className="workExperienceLink"
              href={LINKEDIN_PROFILE_URL}
              target="_blank"
              rel="noreferrer"
            >
              View LinkedIn
            </a>
          </div>

          <div className="workExperienceActions">
            <p className="workExperienceStatus" aria-live="polite">
              {experienceStatusText}
            </p>

            <button
              type="button"
              className="workExperienceRefreshButton"
              onClick={loadExperienceData}
              disabled={isExperienceLoading || isExperienceRefreshing}
            >
              {isExperienceRefreshing ? 'Refreshing...' : 'Refresh data'}
            </button>
          </div>

          <div className="workExperienceTimeline">
            {experienceData.timeline.map((item) => (
              <div className="workExperienceRole" key={`${item.role}-${item.company}`}>
                <strong className="workExperienceRoleTitle">{item.role}</strong>
                <span className="workExperienceRoleCompany">{item.company}</span>
                <span className="workExperienceRoleMeta">{item.details}</span>
              </div>
            ))}
          </div>

          <div className="workExperienceSkills">
            {experienceData.skills.map((skill) => (
              <span className="workExperienceSkill" key={skill}>
                {skill}
              </span>
            ))}
          </div>
        </article>

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
