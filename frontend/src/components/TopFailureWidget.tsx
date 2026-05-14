import React, { useEffect, useState, useRef } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface FailureCategory {
  failure_category: string;
  ticket_count: number;
}

type WidgetState = 'loading' | 'populated' | 'empty' | 'error';

// ── Constants ─────────────────────────────────────────────────────────────────

const API_BASE = 'http://localhost:4000';
const CUSTOMER_ID = 'cust_001'; // Hardcoded customer for this widget

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert snake_case / underscore labels to Title Case for display */
function formatCategory(raw: string): string {
  return raw
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Simulate a latency delay (used in demo/mock mode) */
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ── Sub-components ────────────────────────────────────────────────────────────

/** Animated skeleton placeholder shown while data loads */
const LoadingSkeleton: React.FC = () => (
  <div className="skeleton-list" role="status" aria-label="Loading failure data">
    {[1, 2, 3].map((i) => (
      <div className="skeleton-item" key={i}>
        <div className="skeleton-row">
          <div className="skeleton-label" />
          <div className="skeleton-count" />
        </div>
        <div className="skeleton-bar-track" />
      </div>
    ))}
    <div className="skeleton-footer">
      <div className="skeleton-dot" />
      <div className="skeleton-text-sm" />
    </div>
  </div>
);

/** Populated state: horizontal bar chart for up to 3 failure categories */
const PopulatedChart: React.FC<{ data: FailureCategory[] }> = ({ data }) => {
  const [mounted, setMounted] = useState(false);
  const maxCount = data[0]?.ticket_count ?? 1;

  // Trigger bar width animation on next frame after mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const rankClass = (i: number) =>
    i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : 'rank-3';

  return (
    <div className="failure-list" role="list" aria-label="Top failure categories">
      {data.map((item, idx) => (
        <div className="failure-item" role="listitem" key={item.failure_category}>
          <div className="failure-row">
            <span
              className={`failure-rank ${rankClass(idx)}`}
              aria-hidden="true"
            >
              #{idx + 1}
            </span>
            <span className="failure-category-name">
              {formatCategory(item.failure_category)}
            </span>
            <span
              className={`failure-count-badge ${rankClass(idx)}`}
              aria-label={`${item.ticket_count} tickets`}
            >
              {item.ticket_count}
            </span>
          </div>
          <div className="bar-track" role="progressbar" aria-valuenow={item.ticket_count} aria-valuemax={maxCount}>
            <div
              className={`bar-fill ${rankClass(idx)}`}
              style={{
                width: mounted
                  ? `${Math.round((item.ticket_count / maxCount) * 100)}%`
                  : '0%',
              }}
            />
          </div>
        </div>
      ))}

      <div className="widget-footer">
        <div className="status-dot" aria-hidden="true" />
        <span>{data.reduce((acc, d) => acc + d.ticket_count, 0)} unresolved tickets across top categories</span>
      </div>
    </div>
  );
};

/** Empty state: no unresolved tagged tickets for this customer */
const EmptyState: React.FC = () => (
  <div className="empty-state" role="status" aria-label="No failure patterns detected">
    <div className="empty-illustration" aria-hidden="true">✅</div>
    <h3>All Clear!</h3>
    <p>
      No failure patterns detected —{' '}
      <strong style={{ color: '#34d399' }}>this customer is in great shape</strong>.
      Keep up the good work!
    </p>
    <div className="empty-state-footer">
      <div className="status-dot-green" aria-hidden="true" />
      <span>No open unresolved tickets with failure tags</span>
    </div>
  </div>
);

// ── Main Widget ───────────────────────────────────────────────────────────────

const TopFailureWidget: React.FC = () => {
  const [state, setState] = useState<WidgetState>('loading');
  const [data, setData] = useState<FailureCategory[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = async (signal: AbortSignal) => {
    setState('loading');
    try {
      const res = await fetch(
        `${API_BASE}/api/analytics/top-failures/${CUSTOMER_ID}`,
        { signal }
      );
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = await res.json();
      const rows: FailureCategory[] = json.data ?? [];
      setData(rows);
      setState(rows.length === 0 ? 'empty' : 'populated');
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') return; // component unmounted
      console.error('Failed to fetch top failures:', err);
      setErrorMsg((err as Error).message ?? 'Unknown error');
      setState('error');
    }
  };

  useEffect(() => {
    abortRef.current = new AbortController();
    fetchData(abortRef.current.signal);
    return () => abortRef.current?.abort();
  }, []);

  // Render based on current state
  const renderBody = () => {
    switch (state) {
      case 'loading':
        return <LoadingSkeleton />;
      case 'populated':
        return <PopulatedChart data={data} />;
      case 'empty':
        return <EmptyState />;
      case 'error':
        return (
          <div className="empty-state" role="alert">
            <div className="empty-illustration">⚠️</div>
            <h3>Could not load data</h3>
            <p style={{ color: '#f87171' }}>{errorMsg}</p>
          </div>
        );
    }
  };

  return (
    <div className="widget-card" aria-live="polite">
      <div className="widget-header">
        <div className="widget-icon" aria-hidden="true">📊</div>
        <div className="widget-header-text">
          <h2>Top Failure Categories</h2>
          <span>Customer: {CUSTOMER_ID}</span>
        </div>
        <span className="widget-badge">Live</span>
      </div>
      <div className="widget-body">{renderBody()}</div>
    </div>
  );
};

export default TopFailureWidget;
