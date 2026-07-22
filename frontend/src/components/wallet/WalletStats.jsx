/**
 * WalletStats.jsx
 * 4 stat boxes using the EXACT same inner white-grid pattern
 * already used in StudentDashboard (the info-grid inside each cert row).
 */

function WalletStats({ totalCerts, stats }) {
  const items = [
    { label: 'Total Certificates', value: totalCerts },
    { label: 'Downloads',          value: stats.downloads },
    { label: 'Shares',             value: stats.shares },
    { label: 'Verifications',      value: stats.verifications },
  ];

  return (
    <div className="wallet-stats-row">
      {items.map((item) => (
        <div key={item.label} className="wallet-stat-box">
          <div className="wallet-stat-box-value">{item.value}</div>
          <div className="wallet-stat-box-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

export default WalletStats;
