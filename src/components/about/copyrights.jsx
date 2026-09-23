"use client";

import { useEffect, useState } from "react";
import {
  getCachedCopyrights,
  scheduleCopyrightsRefresh,
} from "../../services/copyright-service";

const retrievedDateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function Copyrights() {
  const [cache, setCache] = useState(() => getCachedCopyrights());
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    scheduleCopyrightsRefresh()
      .then((bundle) => {
        if (cancelled) return;
        setCache(bundle);
      })
      .catch(() => {
        if (cancelled) return;
        setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const data = cache?.data ?? [];
  const retrievedAt = cache?.retrievedAt ? new Date(cache.retrievedAt) : null;

  return (
    <div className="about-body about-eula">
      <h3 className="about-title">Copyrights</h3>
      {retrievedAt ? (
        <p className="about-copyright-provenance">
          Copyright data retrieved {retrievedDateFormatter.format(retrievedAt)}
        </p>
      ) : null}
      {failed && !cache ? (
        <p className="about-copyright-unavailable">
          Copyright data is currently unavailable. Please try again later.
        </p>
      ) : data.length === 0 && !cache ? (
        <p className="about-copyright-loading">Loading copyright data…</p>
      ) : (
        data.map((entry) => <CopyrightEntry key={entry.bibleId} entry={entry} />)
      )}
    </div>
  );
}

function CopyrightEntry({ entry }) {
  const { translationName, abbreviationLocal, language, copyright = {} } = entry;
  const { notice = "", url = "", requirements = [] } = copyright;
  const label = abbreviationLocal
    ? `${translationName} (${abbreviationLocal})`
    : translationName;

  return (
    <section className="about-copyright">
      <h4 className="about-subtitle">{label}</h4>
      {language ? <p className="about-copyright-language">{language}</p> : null}
      {notice ? <p>{notice}</p> : null}
      {url ? (
        <p>
          <a href={url} target="_blank" rel="noreferrer">{url}</a>
        </p>
      ) : null}
      {requirements.length > 0 ? (
        <ul>
          {requirements.map((requirement, index) => (
            <li key={index}>{requirement}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}