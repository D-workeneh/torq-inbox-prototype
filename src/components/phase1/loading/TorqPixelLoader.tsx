'use client';

export function TorqPixelLoader() {
  return (
    <div role="status" aria-label="Loading" className="torq-bar-loader">
      <div className="torq-bar-loader__slot torq-bar-loader__slot--top">
        <span className="torq-bar-loader__bar torq-bar-loader__bar--top" />
      </div>
      <div className="torq-bar-loader__slot torq-bar-loader__slot--mid">
        <span className="torq-bar-loader__bar torq-bar-loader__bar--mid" />
      </div>
      <div className="torq-bar-loader__slot torq-bar-loader__slot--bottom">
        <span className="torq-bar-loader__bar torq-bar-loader__bar--bottom" />
      </div>
    </div>
  );
}
