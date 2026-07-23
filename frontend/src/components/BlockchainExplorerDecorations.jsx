/* ─────────────────────────────────────────────────────────────
   BlockchainExplorerDecorations.jsx
   - Page-specific background decorations for Blockchain Explorer.
   - Theme: Merkle Trees, Hash Strings, 3D Block Stack & Smart Contracts.
   - Un-clipped vector illustrations spanning top to bottom (15% opacity).
   ───────────────────────────────────────────────────────────── */

export function BlockchainExplorerDecorations() {
  return (
    <div className="module-bg-decorations" aria-hidden="true">
      {/* Left Column: Merkle Nodes, Hashes & Consensus (Top to Bottom) */}
      <div className="module-decor-left">
        <svg width="100%" height="100%" viewBox="0 0 180 1000" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Dot Grid */}
          <pattern id="bcGridLeft" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#0a0a0a" opacity="0.35" />
          </pattern>
          <rect x="5" y="5" width="170" height="990" fill="url(#bcGridLeft)" opacity="0.3" />

          {/* 1. Merkle Tree Network Node Topology (Top) */}
          <g transform="translate(10, 20)" stroke="#0a0a0a" strokeWidth="1.4">
            <circle cx="65" cy="25" r="12" fill="#ffffff" />
            <line x1="65" y1="37" x2="30" y2="70" />
            <line x1="65" y1="37" x2="100" y2="70" />
            <circle cx="30" cy="70" r="9" fill="#ffffff" />
            <circle cx="100" cy="70" r="9" fill="#ffffff" />
            <line x1="30" y1="79" x2="10" y2="110" />
            <line x1="30" y1="79" x2="50" y2="110" />
            <line x1="100" y1="79" x2="80" y2="110" />
            <line x1="100" y1="79" x2="120" y2="110" />
            <circle cx="10" cy="110" r="5" fill="#ffffff" />
            <circle cx="50" cy="110" r="5" fill="#ffffff" />
            <circle cx="80" cy="110" r="5" fill="#ffffff" />
            <circle cx="120" cy="110" r="5" fill="#ffffff" />
          </g>

          {/* Connecting Line */}
          <line x1="75" y1="145" x2="75" y2="185" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* 2. Cryptographic Hash Strings Stack */}
          <g transform="translate(10, 195)" opacity="0.85">
            <rect x="0" y="0" width="135" height="85" rx="3" stroke="#0a0a0a" strokeWidth="1.4" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="24" fontFamily="monospace" fontSize="7.5" fontWeight="bold" fill="#0a0a0a">0x7f9a...3b21 ➔ MATCH</text>
            <text x="10" y="44" fontFamily="monospace" fontSize="7.5" fill="#666666">0xa4f8...e291 ➔ ANCHORED</text>
            <text x="10" y="64" fontFamily="monospace" fontSize="7.5" fill="#666666">0xc1e9...5d42 ➔ VERIFIED</text>
          </g>

          {/* Connecting Line */}
          <line x1="75" y1="290" x2="75" y2="330" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* 3. Consensus Node Circle */}
          <g transform="translate(25, 340)">
            <circle cx="45" cy="45" r="38" stroke="#0a0a0a" strokeWidth="1.4" strokeDasharray="3 3" fill="#ffffff" fillOpacity="0.95" />
            <circle cx="45" cy="45" r="24" stroke="#0a0a0a" strokeWidth="1" fill="none" />
            <circle cx="45" cy="7" r="4" fill="#0a0a0a" />
            <circle cx="83" cy="45" r="4" fill="#0a0a0a" />
            <circle cx="45" cy="83" r="4" fill="#0a0a0a" />
            <circle cx="7" cy="45" r="4" fill="#0a0a0a" />
          </g>

          {/* Connecting Line */}
          <line x1="75" y1="435" x2="75" y2="475" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* 4. Smart Contract Execution Box */}
          <g transform="translate(10, 485)">
            <rect x="0" y="0" width="130" height="70" rx="3" stroke="#0a0a0a" strokeWidth="1.4" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="20" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#0a0a0a">SMART CONTRACT</text>
            <text x="10" y="38" fontFamily="monospace" fontSize="7" fill="#666666">HYPERLEDGER FABRIC</text>
            <text x="10" y="52" fontFamily="monospace" fontSize="7" fill="#666666">RAFT CONSENSUS</text>
          </g>
        </svg>
      </div>

      {/* Right Column: 3D Blocks, Block Anchors & Chain Nodes (Top to Bottom) */}
      <div className="module-decor-right">
        <svg width="100%" height="100%" viewBox="0 0 180 1000" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Dot Grid */}
          <pattern id="bcGridRight" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#0a0a0a" opacity="0.35" />
          </pattern>
          <rect x="5" y="5" width="170" height="990" fill="url(#bcGridRight)" opacity="0.3" />

          {/* 1. Connected 3D Isometric Block Stack (Top) */}
          <g transform="translate(35, 20)" stroke="#0a0a0a" strokeWidth="1.4">
            <path d="M40 8 l22 -11 22 11 -22 11 z M40 8 v16 l22 11 v-16 z M84 8 v16 l-22 11 v-16 z" fill="#ffffff" />
            <line x1="62" y1="35" x2="62" y2="60" strokeDasharray="3 3" strokeWidth="1.4" />
            <g transform="translate(0, 44)">
              <path d="M40 8 l22 -11 22 11 -22 11 z M40 8 v16 l22 11 v-16 z M84 8 v16 l-22 11 v-16 z" fill="#ffffff" />
            </g>
          </g>

          {/* Connecting Line */}
          <line x1="75" y1="135" x2="75" y2="175" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* 2. Block Transaction Anchoring Badge */}
          <g transform="translate(15, 185)">
            <rect x="0" y="0" width="125" height="65" rx="3" stroke="#0a0a0a" strokeWidth="1.4" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="18" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#0a0a0a">BLOCK #849201</text>
            <text x="10" y="36" fontFamily="monospace" fontSize="7" fill="#666666">TXS: 1,482 CERTS</text>
            <text x="10" y="48" fontFamily="monospace" fontSize="7" fill="#666666">CONFIRMATIONS: 256</text>
          </g>

          {/* Connecting Line */}
          <line x1="75" y1="260" x2="75" y2="300" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* 3. Decentralized Ledger Chain Nodes */}
          <g transform="translate(25, 310)" stroke="#0a0a0a" strokeWidth="1.4">
            <rect x="0" y="0" width="40" height="40" rx="4" fill="#ffffff" />
            <line x1="40" y1="20" x2="60" y2="20" strokeDasharray="2 2" />
            <rect x="60" y="0" width="40" height="40" rx="4" fill="#ffffff" />
          </g>

          {/* Connecting Line */}
          <line x1="75" y1="360" x2="75" y2="400" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* 4. Distributed Hash Validator Badge */}
          <g transform="translate(15, 410)">
            <rect x="0" y="0" width="125" height="60" rx="3" stroke="#0a0a0a" strokeWidth="1.4" fill="#ffffff" fillOpacity="0.95" />
            <text x="10" y="18" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#0a0a0a">LEDGER ANCHOR</text>
            <text x="10" y="36" fontFamily="serif" fontSize="14" fontWeight="bold" fill="#0a0a0a">100% VALID</text>
            <text x="10" y="48" fontFamily="monospace" fontSize="7" fill="#666666">✓ PROOF OF AUTHORITY</text>
          </g>
        </svg>
      </div>
    </div>
  );
}

export default BlockchainExplorerDecorations;
