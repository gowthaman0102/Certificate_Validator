/* ─────────────────────────────────────────────────────────────
   BlockchainExplorerDecorations.jsx
   - Page-specific background decorations for Blockchain Explorer.
   - Theme: Genesis Blocks, Merkle Trees, ECC Keys, zk-SNARKs, EVM Bytecode, IPFS CIDs & PoS Validators.
   - Fixed top-corner side columns (50% opacity, 140px width), 100% non-interactive.
   ───────────────────────────────────────────────────────────── */

export function BlockchainExplorerDecorations() {
  return (
    <div className="module-bg-decorations" aria-hidden="true">
      {/* Left Top Corner Column: Genesis Block Mining, ECC Secp256k1 Curve, Solidity Contract, P2P Mesh, ZK Proof & Ledger Stream */}
      <div className="module-decor-left">
        <svg width="100%" height="100%" viewBox="0 0 140 850" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Dot Grid */}
          <pattern id="bcGridLeft" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.3" fill="#0a0a0a" opacity="0.4" />
          </pattern>
          <rect x="0" y="0" width="140" height="850" fill="url(#bcGridLeft)" opacity="0.3" />

          {/* 1. Genesis Block & Mining Hash Rig (Top Corner) */}
          <g transform="translate(10, 15)">
            <rect x="0" y="0" width="120" height="95" rx="5" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="8" y="16" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#0a0a0a">GENESIS BLOCK #0</text>
            {/* 3D Block Icon */}
            <path d="M60 26 l20 -10 20 10 -20 10 z M60 26 v16 l20 10 v-16 z M100 26 v16 l-20 10 v-16 z" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <text x="8" y="66" fontFamily="monospace" fontSize="7" fill="#666666">NONCE: 0x9f821a</text>
            <text x="8" y="80" fontFamily="monospace" fontSize="7.5" fontWeight="bold" fill="#0a0a0a">✓ DIFFICULTY PASSED</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="60" y1="110" x2="60" y2="145" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 2. Cryptography ECC secp256k1 Curve */}
          <g transform="translate(10, 150)">
            <rect x="0" y="0" width="120" height="85" rx="5" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="8" y="16" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#0a0a0a">ECC secp256k1</text>
            {/* Curve representation */}
            <path d="M10 60 Q 35 20, 60 42 T 110 28" stroke="#0a0a0a" strokeWidth="2" fill="none" />
            <circle cx="60" cy="42" r="4.5" fill="#0a0a0a" />
            <text x="8" y="74" fontFamily="monospace" fontSize="7" fill="#0a0a0a">KEY PAIR: (X, Y) VALID</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="60" y1="235" x2="60" y2="270" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 3. Smart Contract Solidity Compiler (solc) */}
          <g transform="translate(10, 275)">
            <rect x="0" y="0" width="120" height="90" rx="5" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="8" y="16" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#0a0a0a">SOLIDITY CONTRACT</text>
            <rect x="8" y="24" width="104" height="42" rx="3" stroke="#0a0a0a" strokeWidth="1.2" fill="#ffffff" />
            <text x="13" y="38" fontFamily="monospace" fontSize="6.5" fill="#0a0a0a">contract Certs &#123;</text>
            <text x="13" y="50" fontFamily="monospace" fontSize="6.5" fill="#0a0a0a">  mapping(hash=&gt;bool)</text>
            <text x="13" y="60" fontFamily="monospace" fontSize="6.5" fill="#0a0a0a">&#125;</text>
            <text x="8" y="80" fontFamily="monospace" fontSize="7" fill="#0a0a0a">✓ ABI &amp; BYTECODE OK</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="60" y1="365" x2="60" y2="400" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 4. Distributed P2P Mesh Network */}
          <g transform="translate(10, 405)">
            <rect x="0" y="0" width="120" height="95" rx="5" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="8" y="16" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#0a0a0a">P2P NODE MESH</text>
            {/* Peer Nodes */}
            <circle cx="20" cy="40" r="5" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <circle cx="100" cy="40" r="5" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <circle cx="60" cy="70" r="6" fill="#0a0a0a" />
            <circle cx="35" cy="60" r="3.5" stroke="#0a0a0a" strokeWidth="1.2" fill="#ffffff" />
            <circle cx="85" cy="60" r="3.5" stroke="#0a0a0a" strokeWidth="1.2" fill="#ffffff" />
            {/* Connections */}
            <line x1="20" y1="40" x2="100" y2="40" stroke="#0a0a0a" strokeWidth="1.2" strokeDasharray="2 2" />
            <line x1="20" y1="40" x2="60" y2="70" stroke="#0a0a0a" strokeWidth="1.2" />
            <line x1="100" y1="40" x2="60" y2="70" stroke="#0a0a0a" strokeWidth="1.2" />
            <text x="8" y="88" fontFamily="monospace" fontSize="7" fill="#0a0a0a">100% BYZANTINE FAULT</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="60" y1="500" x2="60" y2="535" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 5. zk-SNARK Zero-Knowledge Circuit */}
          <g transform="translate(10, 540)">
            <rect x="0" y="0" width="120" height="85" rx="5" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="8" y="16" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#0a0a0a">zk-SNARK CIRCUIT</text>
            <rect x="12" y="26" width="96" height="32" rx="3" stroke="#0a0a0a" strokeWidth="1.4" fill="#ffffff" />
            <text x="18" y="45" fontFamily="monospace" fontSize="7" fontWeight="bold" fill="#0a0a0a">PROVE(X, W) ➔ 1</text>
            <text x="8" y="74" fontFamily="monospace" fontSize="7" fill="#0a0a0a">✓ ZERO KNOWLEDGE</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="60" y1="625" x2="60" y2="660" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 6. Immutable Ledger Anchor Seal (Bottom) */}
          <g transform="translate(10, 665)">
            <rect x="0" y="0" width="120" height="68" rx="5" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="8" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">LEDGER ANCHOR</text>
            <text x="8" y="40" fontFamily="serif" fontSize="13" fontWeight="bold" fill="#0a0a0a">IMMUTABLE PROOF</text>
            <text x="8" y="54" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ ON-CHAIN SYNC</text>
          </g>
        </svg>
      </div>

      {/* Right Top Corner Column: EVM Gas Meter, Merkle Tree Root, IPFS Hash CID, PoS Staking, SHA-256 & Validator Seal */}
      <div className="module-decor-right">
        <svg width="100%" height="100%" viewBox="0 0 140 850" preserveAspectRatio="xMidYMin meet" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Dot Grid */}
          <pattern id="bcGridRight" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.3" fill="#0a0a0a" opacity="0.4" />
          </pattern>
          <rect x="0" y="0" width="140" height="850" fill="url(#bcGridRight)" opacity="0.3" />

          {/* 1. EVM Gas Gauge & Stack Opcodes (Top Corner) */}
          <g transform="translate(10, 15)">
            <rect x="0" y="0" width="120" height="95" rx="5" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="8" y="16" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#0a0a0a">EVM GAS METER</text>
            {/* Dial Arc */}
            <path d="M30 55 A 22 22 0 0 1 90 55" stroke="#0a0a0a" strokeWidth="3.5" fill="none" />
            <line x1="60" y1="55" x2="76" y2="40" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" />
            <circle cx="60" cy="55" r="3.5" fill="#0a0a0a" />
            <text x="8" y="74" fontFamily="monospace" fontSize="6.5" fill="#0a0a0a">21,000 GWEI (FAST)</text>
            <text x="8" y="86" fontFamily="monospace" fontSize="7" fontWeight="bold" fill="#0a0a0a">✓ CONFIRMED 2s</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="60" y1="110" x2="60" y2="145" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 2. Merkle Tree Cryptographic Root Vault */}
          <g transform="translate(10, 150)">
            <rect x="0" y="0" width="120" height="90" rx="5" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="8" y="16" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#0a0a0a">MERKLE ROOT VAULT</text>
            {/* Root Box */}
            <rect x="40" y="24" width="40" height="15" rx="2" stroke="#0a0a0a" strokeWidth="1.4" fill="#ffffff" />
            <text x="44" y="34" fontFamily="monospace" fontSize="6.5" fontWeight="bold" fill="#0a0a0a">0xROOT</text>
            <line x1="60" y1="39" x2="30" y2="50" stroke="#0a0a0a" strokeWidth="1.2" />
            <line x1="60" y1="39" x2="90" y2="50" stroke="#0a0a0a" strokeWidth="1.2" />
            <circle cx="30" cy="54" r="3" fill="#0a0a0a" />
            <circle cx="90" cy="54" r="3" fill="#0a0a0a" />
            <text x="8" y="76" fontFamily="monospace" fontSize="7" fill="#0a0a0a">✓ AUDIT PROOF OK</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="60" y1="240" x2="60" y2="275" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 3. IPFS Decentralized File Hash Storage (CID) */}
          <g transform="translate(10, 280)">
            <rect x="0" y="0" width="120" height="90" rx="5" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="8" y="16" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#0a0a0a">IPFS HASH CID</text>
            {/* Hexagon Logo */}
            <polygon points="60 26, 74 34, 74 48, 60 56, 46 48, 46 34" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <line x1="60" y1="26" x2="60" y2="41" stroke="#0a0a0a" strokeWidth="1" />
            <line x1="74" y1="34" x2="60" y2="41" stroke="#0a0a0a" strokeWidth="1" />
            <line x1="46" y1="34" x2="60" y2="41" stroke="#0a0a0a" strokeWidth="1" />
            <text x="8" y="74" fontFamily="monospace" fontSize="6.5" fill="#0a0a0a">QmXoypizjW3WknFi...</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="60" y1="370" x2="60" y2="405" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 4. Proof-of-Stake (PoS) Validator Staking */}
          <g transform="translate(10, 410)">
            <rect x="0" y="0" width="120" height="90" rx="5" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="8" y="16" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#0a0a0a">PoS VALIDATOR</text>
            <circle cx="60" cy="42" r="16" stroke="#0a0a0a" strokeWidth="1.6" fill="#ffffff" />
            <path d="M52 42 l6 6 12 -12" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" fill="none" />
            <text x="8" y="74" fontFamily="monospace" fontSize="7" fill="#0a0a0a">STAKE: 32.00 ETH</text>
            <text x="8" y="84" fontFamily="monospace" fontSize="7" fontWeight="bold" fill="#0a0a0a">✓ FINALITY ATTAINED</text>
          </g>

          {/* Vertical Pulse Line */}
          <line x1="60" y1="500" x2="60" y2="535" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 5. QR Code Transaction Hash Matrix */}
          <g transform="translate(20, 540)">
            <rect x="0" y="0" width="85" height="85" rx="5" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <path d="M10 10h18v18H10zM14 14v10h10V14zM57 10h18v18H57zM61 14v10h10V14zM10 57h18v18H10zM14 61v10h10V61zM34 10h8v10H34zM34 26h8v8H34zM42 36h10v6H42zM54 36h13v6H54zM34 48h8v8H38zM48 48h8v8H48zM60 48h8v13H60z" fill="#0a0a0a" />
          </g>

          {/* Vertical Pulse Line */}
          <line x1="60" y1="625" x2="60" y2="660" stroke="#0a0a0a" strokeWidth="1.8" strokeDasharray="3 3" />

          {/* 6. Zero-Knowledge Validator Seal (Bottom) */}
          <g transform="translate(10, 665)">
            <rect x="0" y="0" width="120" height="68" rx="5" stroke="#0a0a0a" strokeWidth="2" fill="#ffffff" fillOpacity="0.95" />
            <text x="8" y="20" fontFamily="monospace" fontSize="8.5" fontWeight="bold" fill="#0a0a0a">VALIDATOR PROOF</text>
            <text x="8" y="40" fontFamily="serif" fontSize="13" fontWeight="bold" fill="#0a0a0a">100% CONFIRMED</text>
            <text x="8" y="54" fontFamily="monospace" fontSize="7.5" fill="#0a0a0a">✓ ZERO TAMPERING</text>
          </g>
        </svg>
      </div>
    </div>
  );
}

export default BlockchainExplorerDecorations;
