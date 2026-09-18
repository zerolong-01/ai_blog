export function SecurityArtwork() {
  return (
    <div className="minimalArtwork securityArtwork" aria-hidden="true">
      <div className="visualLabel"><span>SECURITY SIGNAL</span><strong>NETWORK</strong></div>
      <svg className="securityNetwork" viewBox="0 0 400 400" fill="none" focusable="false">
        <defs>
          <linearGradient id="security-shield" x1="135" y1="120" x2="265" y2="290" gradientUnits="userSpaceOnUse">
            <stop stopColor="#b9eaff" />
            <stop offset="0.32" stopColor="#6587ff" />
            <stop offset="0.7" stopColor="#3157f6" />
            <stop offset="1" stopColor="#1433a8" />
          </linearGradient>
          <linearGradient id="security-edge" x1="140" y1="140" x2="270" y2="290" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6ed7f3" /><stop offset="0.5" stopColor="#2442b8" /><stop offset="1" stopColor="#0a1c62" />
          </linearGradient>
          <linearGradient id="security-reflection" x1="150" y1="140" x2="240" y2="250" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="0.6" /><stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="security-ground-glow">
            <stop stopColor="var(--accent)" stopOpacity="0.25" /><stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
          <filter id="security-depth" x="-50%" y="-30%" width="200%" height="190%">
            <feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#142d85" floodOpacity="0.3" />
          </filter>
        </defs>
        <ellipse cx="208" cy="318" rx="100" ry="22" fill="url(#security-ground-glow)" />
        <circle className="securityOrbit" cx="200" cy="200" r="154" />
        <circle className="securityOrbit securityOrbitInner" cx="200" cy="200" r="114" />
        <g className="securityConnections">
          <path d="M64 100H108V150H148 M200 46V120 M336 100H292V150H252 M64 300H108V250H158 M200 354V286 M336 300H292V250H242" />
        </g>
        <g className="securityPackets">
          <path d="M64 100H108V150H148" />
          <path d="M336 100H292V150H252" />
          <path d="M64 300H108V250H158" />
          <path d="M336 300H292V250H242" />
        </g>
        <g filter="url(#security-depth)">
          <path d="M200 116L267 143V201C267 242 238 271 200 291C162 271 133 242 133 201V143L200 116Z" fill="url(#security-edge)" transform="translate(8 9)" />
          <path className="securityShield" d="M200 116L267 143V201C267 242 238 271 200 291C162 271 133 242 133 201V143L200 116Z" fill="url(#security-shield)" />
          <path d="M200 116L267 143L133 216V143L200 116Z" fill="url(#security-reflection)" />
          <path className="securityShieldInset" d="M200 131L254 153V201C254 233 232 259 200 276C168 259 146 233 146 201V153L200 131Z" />
          <g className="securityLock">
            <path d="M182 192V177A18 18 0 0 1 218 177V192" />
            <rect x="171" y="192" width="58" height="47" rx="9" />
            <circle cx="200" cy="212" r="4" />
            <path d="M200 216V223" />
          </g>
        </g>
        <g className="securityNodes">
          <circle cx="64" cy="100" r="9" /><circle cx="200" cy="46" r="9" />
          <circle cx="336" cy="100" r="9" /><circle cx="64" cy="300" r="9" />
          <circle cx="200" cy="354" r="9" /><circle cx="336" cy="300" r="9" />
        </g>
        <g className="securityNodeCores">
          <circle cx="64" cy="100" r="3" /><circle cx="200" cy="46" r="3" />
          <circle cx="336" cy="100" r="3" /><circle cx="64" cy="300" r="3" />
          <circle cx="200" cy="354" r="3" /><circle cx="336" cy="300" r="3" />
        </g>
      </svg>
      <div className="visualFooter"><span>AI / SECURITY / TRUST</span><span>2026</span></div>
    </div>
  );
}
