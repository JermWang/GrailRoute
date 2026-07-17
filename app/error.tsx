"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="status-page">
      <span className="eyebrow">Something went wrong</span>
      <h1>GrailRoute hit an unexpected error.</h1>
      <p>No wallet action was taken. Your connection is managed entirely by your own wallet, so nothing was signed or sent.</p>
      <button className="primary-button" onClick={reset}>Try again</button>
    </div>
  );
}
