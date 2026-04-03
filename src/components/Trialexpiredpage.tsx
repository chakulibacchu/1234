import { useNavigate } from 'react-router-dom';

// Replace these with your actual imports once you add images to src/assets/
import joinGroupImg from 'src/PHOTOS/GG1.png';
import ignoreSubscriptionImg from 'src/PHOTOS/GG2.png';

export function TrialExpiredPage() {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    window.open('https://play.google.com/store/apps/details?id=app.connect.mobile', '_blank');
  };

  const handleJoinGroup = () => {
    window.open('https://groups.google.com/g/goalgrid-beta-testers', '_blank');
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      {/* Icon */}
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏰</div>

      {/* Heading */}
      <h1
        style={{
          fontSize: '1.8rem',
          fontWeight: 700,
          marginBottom: '0.75rem',
          background: 'linear-gradient(90deg, #a855f7, #ec4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Your 2-Min Preview Is Up!
      </h1>

      {/* Subtext */}
      <p
        style={{
          opacity: 0.7,
          fontSize: '1rem',
          maxWidth: '300px',
          lineHeight: 1.6,
          marginBottom: '0.5rem',
        }}
      >
        Loved what you saw? Join our{' '}
        <strong style={{ color: 'white', opacity: 1 }}>
          free closed internal testing
        </strong>{' '}
        — get full access at no cost, before we launch publicly.
      </p>

      <p
        style={{
          opacity: 0.5,
          fontSize: '0.8rem',
          maxWidth: '260px',
          lineHeight: 1.5,
          marginBottom: '2rem',
        }}
      >
        🔒 Closed beta · 100% free · Limited spots
      </p>

      {/* What you get */}
      <div
        style={{
          width: '100%',
          maxWidth: '300px',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        {[
          { e: '🔔', t: 'Daily missions to build real confidence' },
          { e: '⚡', t: 'Full access — no time limits' },
          { e: '🔒', t: 'Your plan synced & saved forever' },
          { e: '👥', t: 'Community of people who get it' },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '0.65rem 1rem',
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>{item.e}</span>
            <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>{item.t}</span>
          </div>
        ))}
      </div>

      {/* CTA button */}
      <button
        onClick={handleUpgrade}
        style={{
          background: 'linear-gradient(90deg, #a855f7, #ec4899)',
          color: 'white',
          border: 'none',
          padding: '0.85rem 2.5rem',
          borderRadius: '999px',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(168,85,247,0.4)',
          marginBottom: '1rem',
          width: '100%',
          maxWidth: '300px',
        }}
      >
        Join Free Closed Testing →
      </button>

      {/* Google Play badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          opacity: 0.4,
          fontSize: '0.75rem',
          marginBottom: '1.25rem',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 512 512">
          <path fill="#4CAF50" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z" />
          <path fill="#FF3D00" d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.1-256L47 0z" />
          <path fill="#FFD600" d="M401.4 233.7l-87.8-50.4-66.7 64.7 66.7 64.7 89.2-51.1c12.8-7.4 12.8-20.6-1.4-28z" />
          <path fill="#FF3D00" d="M104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
        </svg>
        Available on Google Play · iOS coming soon
      </div>

      {/* Support link */}
      <p style={{ opacity: 0.4, fontSize: '0.8rem', marginBottom: '2.5rem' }}>
        Questions?{' '}
        <a
          href="mailto:support@goalgrid.app"
          style={{ color: 'inherit', textDecoration: 'underline' }}
        >
          Contact support
        </a>
      </p>

      {/* ───────── HOW TO JOIN SECTION ───────── */}
      <div
        style={{
          width: '100%',
          maxWidth: '340px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '2rem',
        }}
      >
        {/* Section heading */}
        <p
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            opacity: 0.4,
            marginBottom: '1rem',
          }}
        >
          How to join in 2 steps
        </p>

        {/* Step 1 */}
        <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '0.6rem',
            }}
          >
            <span
              style={{
                background: 'linear-gradient(90deg, #a855f7, #ec4899)',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              1
            </span>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>
              Click <span style={{ color: '#a78bfa' }}>"Join group"</span> on the page
            </p>
          </div>

          {/* Step 1 image */}
          <div
            style={{
              borderRadius: '14px',
              overflow: 'hidden',
              border: '1px solid rgba(168,85,247,0.25)',
              boxShadow: '0 4px 24px rgba(168,85,247,0.15)',
            }}
          >
            <img
              src={joinGroupImg}
              alt="Click Join group button"
              style={{ width: '100%', display: 'block' }}
            />
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '0.6rem',
            }}
          >
            <span
              style={{
                background: 'linear-gradient(90deg, #a855f7, #ec4899)',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              2
            </span>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>
              Ignore the subscription dropdown — just hit{' '}
              <span style={{ color: '#a78bfa' }}>"Join group"</span>
            </p>
          </div>

          {/* Step 2 image */}
          <div
            style={{
              borderRadius: '14px',
              overflow: 'hidden',
              border: '1px solid rgba(168,85,247,0.25)',
              boxShadow: '0 4px 24px rgba(168,85,247,0.15)',
            }}
          >
            <img
              src={ignoreSubscriptionImg}
              alt="Ignore subscription dropdown"
              style={{ width: '100%', display: 'block' }}
            />
          </div>
        </div>

        {/* Join group CTA */}
        <button
          onClick={handleJoinGroup}
          style={{
            background: 'transparent',
            color: 'white',
            border: '1.5px solid rgba(168,85,247,0.6)',
            padding: '0.85rem 2.5rem',
            borderRadius: '999px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            width: '100%',
            marginBottom: '0.75rem',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#a855f7')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(168,85,247,0.6)')}
        >
          Open Join Page →
        </button>

        <p style={{ opacity: 0.35, fontSize: '0.72rem', textAlign: 'center' }}>
          Takes less than 30 seconds · No payment needed
        </p>
      </div>
    </div>
  );
}