import React, { useCallback, useEffect, useRef, useState } from 'react';
import './skill.css';

const GITHUB_USERNAME = process.env.REACT_APP_GITHUB_USERNAME || 'Rish620';
const REFRESH_INTERVAL_MS = 180000;
const GITHUB_HEADERS = {
  Accept: 'application/vnd.github+json',
};

const getRepoTimestamp = (repo) =>
  new Date(repo.pushed_at || repo.updated_at || 0).getTime();

const buildGithubError = (response) => {
  if (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0') {
    return new Error('GitHub API rate limit reached. Try refreshing again in a few minutes.');
  }

  if (response.status === 404) {
    return new Error(`GitHub user "${GITHUB_USERNAME}" was not found.`);
  }

  return new Error('Unable to load GitHub repositories right now.');
};

const fetchRepoPage = async (page, signal) => {
  const response = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100&page=${page}`,
    {
      cache: 'no-store',
      headers: GITHUB_HEADERS,
      signal,
    }
  );

  if (!response.ok) {
    throw buildGithubError(response);
  }

  return response.json();
};

const fetchAllRepos = async (signal) => {
  const repos = [];
  let page = 1;

  while (page <= 10) {
    const repoPage = await fetchRepoPage(page, signal);
    repos.push(...repoPage);

    if (repoPage.length < 100) {
      break;
    }

    page += 1;
  }

  return repos.sort((leftRepo, rightRepo) => getRepoTimestamp(rightRepo) - getRepoTimestamp(leftRepo));
};

const formatRelativeUpdate = (value) => {
  if (!value) {
    return 'just now';
  }

  const elapsed = Date.now() - new Date(value).getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  if (elapsed < minute) {
    return 'just now';
  }

  if (elapsed < hour) {
    const minutes = Math.floor(elapsed / minute);
    return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  }

  if (elapsed < day) {
    const hours = Math.floor(elapsed / hour);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  if (elapsed < month) {
    const days = Math.floor(elapsed / day);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  if (elapsed < year) {
    const months = Math.floor(elapsed / month);
    return `${months} month${months === 1 ? '' : 's'} ago`;
  }

  const years = Math.floor(elapsed / year);
  return `${years} year${years === 1 ? '' : 's'} ago`;
};

const formatSyncTime = (value) =>
  value
    ? value.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Waiting...';

const getRepoBadge = (repo) => {
  if (repo.archived) {
    return 'archived';
  }

  if (repo.fork) {
    return 'fork';
  }

  return repo.visibility || 'public';
};

const getRepoInitials = (name) => {
  const safeName = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase();
  return safeName || 'GH';
};

const Skill = () => {
  const [repos, setRepos] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [lastSynced, setLastSynced] = useState(null);
  const [showAllRepos, setShowAllRepos] = useState(false);
  const abortControllerRef = useRef(null);
  const hasLoadedDataRef = useRef(false);

  const loadRepos = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setStatus(hasLoadedDataRef.current ? 'refreshing' : 'loading');
    setError('');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const nextRepos = await fetchAllRepos(controller.signal);
      setRepos(nextRepos);
      setLastSynced(new Date());
      setStatus('ready');
      hasLoadedDataRef.current = true;
    } catch (loadError) {
      if (loadError.name === 'AbortError') {
        return;
      }

      setError(loadError.message || 'Unable to load GitHub repositories right now.');
      setStatus(hasLoadedDataRef.current ? 'ready' : 'error');
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    loadRepos();

    const intervalId = window.setInterval(() => {
      loadRepos();
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadRepos]);

  const isLoading = status === 'loading';
  const isRefreshing = status === 'refreshing';
  const hasRepos = repos.length > 0;
  const latestRepo = repos[0];
  const visibleRepos = showAllRepos ? repos : repos.slice(0, 6);
  const shouldShowSeeMore = repos.length > 6;

  return (
    <section id="skill" className="skill">
      <span className="skillEyebrow">Live from GitHub</span>
      <h2 className="skillTitle">GitHub Repository Feed</h2>
      <p className="skillDesc">
        This section reads directly from my public GitHub repositories and refreshes
        automatically, so new repos and pushes show up here without editing the page.
      </p>

      <div className="skillMeta">
        <div className="skillStat">
          <span className="skillStatValue">{repos.length}</span>
          <span className="skillStatLabel">Public repos</span>
        </div>

        <div className="skillStat">
          <span className="skillStatValue">
            {latestRepo ? formatRelativeUpdate(latestRepo.pushed_at || latestRepo.updated_at) : 'Waiting...'}
          </span>
          <span className="skillStatLabel">Latest push</span>
        </div>

        <div className="skillStat">
          <span className="skillStatValue">{formatSyncTime(lastSynced)}</span>
          <span className="skillStatLabel">Last sync</span>
        </div>

        <button
          type="button"
          className="skillRefreshButton"
          onClick={loadRepos}
          disabled={isLoading || isRefreshing}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh now'}
        </button>
      </div>

      <p className="skillStatus" aria-live="polite">
        {isLoading && !hasRepos
          ? `Loading repositories from ${GITHUB_USERNAME}...`
          : error
            ? error
            : `Showing ${repos.length} repositories from ${GITHUB_USERNAME}. Auto-refresh runs every 3 minutes.`}
      </p>

      <div className="skillbars">
        {visibleRepos.map((repo) => {
          const pushedAt = repo.pushed_at || repo.updated_at;
          const demoUrl = repo.homepage ? repo.homepage.trim() : '';

          return (
            <article className="skillbar" key={repo.id}>
              <div className="skillBarIcon" aria-hidden="true">
                {getRepoInitials(repo.name)}
              </div>

              <div className="skillBarText">
                <div className="skillBarHeader">
                  <h3>{repo.name}</h3>
                  <span className="skillBadge">{getRepoBadge(repo)}</span>
                </div>

                <p>{repo.description || 'No repository description added on GitHub yet.'}</p>

                <div className="skillRepoMeta">
                  <span>{repo.language || 'Mixed stack'}</span>
                  <span>Stars {repo.stargazers_count}</span>
                  <span>Forks {repo.forks_count}</span>
                  <span title={new Date(pushedAt).toLocaleString()}>
                    Updated {formatRelativeUpdate(pushedAt)}
                  </span>
                </div>

                <div className="skillLinks">
                  <a href={repo.html_url} target="_blank" rel="noreferrer">
                    View repo
                  </a>
                  {demoUrl ? (
                    <a href={demoUrl} target="_blank" rel="noreferrer">
                      Live demo
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {shouldShowSeeMore ? (
        <div className="skillMoreActions">
          <button
            type="button"
            className="skillMoreButton"
            onClick={() => setShowAllRepos((currentValue) => !currentValue)}
          >
            {showAllRepos ? 'Show less' : 'See more'}
          </button>
        </div>
      ) : null}

      {!isLoading && !hasRepos ? (
        <div className="skillEmpty">
          <p>No public repositories are available right now.</p>
        </div>
      ) : null}
    </section>
  );
};

export default Skill;
