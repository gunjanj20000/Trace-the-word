import React from 'react';

interface IllustrationProps {
  className?: string;
}

// Crisp, friendly, sensory-calm vector illustrations for words
export const ILLUSTRATIONS: Record<string, React.FC<IllustrationProps>> = {
  // 3-LETTER WORDS
  cat: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="110" r="65" fill="#fdba74" />
      {/**/}
      <polygon points="50,65 75,30 90,65" fill="#fb923c" />
      <polygon points="60,65 75,42 85,65" fill="#fed7aa" />
      <polygon points="150,65 125,30 110,65" fill="#fb923c" />
      <polygon points="140,65 125,42 115,65" fill="#fed7aa" />
      {/**/}
      <circle cx="78" cy="105" r="8" fill="#1e293b" />
      <circle cx="80" cy="103" r="2.5" fill="#ffffff" />
      <circle cx="122" cy="105" r="8" fill="#1e293b" />
      <circle cx="124" cy="103" r="2.5" fill="#ffffff" />
      {/**/}
      <polygon points="95,120 105,120 100,126" fill="#f43f5e" />
      <path d="M 94 126 C 90 134, 100 138, 100 130 C 100 138, 110 134, 106 126" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
      {/**/}
      <line x1="50" y1="116" x2="80" y2="120" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
      <line x1="48" y1="128" x2="80" y2="126" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
      <line x1="150" y1="116" x2="120" y2="120" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
      <line x1="152" y1="128" x2="120" y2="126" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),

  dog: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/**/}
      <ellipse cx="50" cy="115" rx="18" ry="40" fill="#92400e" transform="rotate(-15 50 115)" />
      <ellipse cx="150" cy="115" rx="18" ry="40" fill="#92400e" transform="rotate(15 150 115)" />
      <circle cx="100" cy="110" r="60" fill="#d97706" />
      {/**/}
      <ellipse cx="100" cy="130" rx="32" ry="24" fill="#fef3c7" />
      <ellipse cx="100" cy="120" rx="12" ry="8" fill="#1e293b" />
      <path d="M 100 128 L 100 142 M 92 138 C 96 146, 100 146, 100 142 C 100 146, 104 146, 108 138" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
      {/**/}
      <circle cx="76" cy="98" r="8" fill="#1e293b" />
      <circle cx="78" cy="96" r="2.5" fill="#ffffff" />
      <circle cx="124" cy="98" r="8" fill="#1e293b" />
      <circle cx="126" cy="96" r="2.5" fill="#ffffff" />
    </svg>
  ),

  cow: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/**/}
      <path d="M 65 60 Q 50 35 40 45" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" fill="none"/>
      <path d="M 135 60 Q 150 35 160 45" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" fill="none"/>
      <circle cx="100" cy="105" r="58" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="3" />
      {/**/}
      <path d="M 60 70 Q 75 85 60 100 Q 50 85 60 70 Z" fill="#1e293b" />
      <circle cx="135" cy="85" r="14" fill="#1e293b" />
      {/**/}
      <rect x="62" y="115" width="76" height="42" rx="20" fill="#fbcfe8" />
      <ellipse cx="85" cy="135" rx="5" ry="7" fill="#be185d" />
      <ellipse cx="115" cy="135" rx="5" ry="7" fill="#be185d" />
      {/**/}
      <circle cx="75" cy="95" r="6" fill="#1e293b" />
      <circle cx="125" cy="95" r="6" fill="#1e293b" />
    </svg>
  ),

  pig: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,65 70,35 85,65" fill="#f472b6" />
      <polygon points="150,65 130,35 115,65" fill="#f472b6" />
      <circle cx="100" cy="110" r="62" fill="#fbcfe8" />
      <ellipse cx="100" cy="125" rx="26" ry="18" fill="#f472b6" />
      <ellipse cx="92" cy="125" rx="4" ry="7" fill="#831843" />
      <ellipse cx="108" cy="125" rx="4" ry="7" fill="#831843" />
      <circle cx="75" cy="95" r="7" fill="#1e293b" />
      <circle cx="125" cy="95" r="7" fill="#1e293b" />
    </svg>
  ),

  fox: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,75 70,25 95,65" fill="#ea580c" />
      <polygon points="150,75 130,25 105,65" fill="#ea580c" />
      <polygon points="55,75 70,38 88,68" fill="#1e293b" />
      <polygon points="145,75 130,38 112,68" fill="#1e293b" />
      {/**/}
      <path d="M 45 90 Q 100 65 155 90 L 100 165 Z" fill="#ea580c" />
      {/**/}
      <path d="M 45 90 Q 75 110 100 155 Q 70 140 45 90 Z" fill="#f8fafc" />
      <path d="M 155 90 Q 125 110 100 155 Q 130 140 155 90 Z" fill="#f8fafc" />
      <circle cx="100" cy="155" r="8" fill="#1e293b" />
      <circle cx="75" cy="100" r="6" fill="#1e293b" />
      <circle cx="125" cy="100" r="6" fill="#1e293b" />
    </svg>
  ),

  bus: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="55" width="140" height="90" rx="16" fill="#fbbf24" />
      {/**/}
      <rect x="42" y="70" width="30" height="28" rx="6" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2" />
      <rect x="85" y="70" width="30" height="28" rx="6" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2" />
      <rect x="128" y="70" width="30" height="28" rx="6" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2" />
      {/**/}
      <rect x="30" y="112" width="140" height="10" fill="#f59e0b" />
      {/**/}
      <circle cx="36" cy="130" r="6" fill="#fef08a" />
      <circle cx="164" cy="130" r="6" fill="#ef4444" />
      {/**/}
      <circle cx="65" cy="148" r="18" fill="#1e293b" />
      <circle cx="65" cy="148" r="7" fill="#cbd5e1" />
      <circle cx="135" cy="148" r="18" fill="#1e293b" />
      <circle cx="135" cy="148" r="7" fill="#cbd5e1" />
    </svg>
  ),

  car: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/**/}
      <path d="M 40 120 L 60 80 Q 75 70 125 70 L 150 120 L 170 120 Q 175 125 175 135 L 25 135 Q 25 125 40 120 Z" fill="#ef4444" />
      {/**/}
      <path d="M 68 82 L 120 82 L 142 116 L 52 116 Z" fill="#bae6fd" stroke="#0284c7" strokeWidth="2" />
      {/**/}
      <circle cx="65" cy="142" r="16" fill="#1e293b" />
      <circle cx="65" cy="142" r="6" fill="#cbd5e1" />
      <circle cx="140" cy="142" r="16" fill="#1e293b" />
      <circle cx="140" cy="142" r="6" fill="#cbd5e1" />
    </svg>
  ),

  van: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="35" y="70" width="130" height="70" rx="14" fill="#3b82f6" />
      {/**/}
      <rect x="45" y="80" width="45" height="26" rx="4" fill="#dbeafe" />
      <rect x="100" y="80" width="45" height="26" rx="4" fill="#dbeafe" />
      {/**/}
      <circle cx="65" cy="145" r="16" fill="#1e293b" />
      <circle cx="65" cy="145" r="6" fill="#cbd5e1" />
      <circle cx="135" cy="145" r="16" fill="#1e293b" />
      <circle cx="135" cy="145" r="6" fill="#cbd5e1" />
    </svg>
  ),

  sun: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/**/}
      <g stroke="#f59e0b" strokeWidth="6" strokeLinecap="round">
        <line x1="100" y1="20" x2="100" y2="40" />
        <line x1="100" y1="160" x2="100" y2="180" />
        <line x1="20" y1="100" x2="40" y2="100" />
        <line x1="160" y1="100" x2="180" y2="100" />
        <line x1="43" y1="43" x2="58" y2="58" />
        <line x1="142" y1="142" x2="157" y2="157" />
        <line x1="43" y1="157" x2="58" y2="142" />
        <line x1="142" y1="58" x2="157" y2="43" />
      </g>
      <circle cx="100" cy="100" r="48" fill="#fbbf24" />
      {/**/}
      <circle cx="85" cy="94" r="5" fill="#78350f" />
      <circle cx="115" cy="94" r="5" fill="#78350f" />
      <path d="M 86 112 Q 100 125 114 112" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),

  bed: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/**/}
      <rect x="30" y="65" width="20" height="85" rx="6" fill="#854d0e" />
      {/**/}
      <rect x="155" y="90" width="16" height="60" rx="5" fill="#854d0e" />
      {/**/}
      <rect x="50" y="105" width="105" height="35" rx="8" fill="#38bdf8" />
      {/**/}
      <rect x="54" y="94" width="28" height="18" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
    </svg>
  ),

  cup: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/**/}
      <path d="M 130 85 C 165 85, 165 140, 130 140" stroke="#f43f5e" strokeWidth="12" strokeLinecap="round" fill="none" />
      {/**/}
      <path d="M 50 70 L 62 155 Q 64 165 100 165 Q 136 165 138 155 L 150 70 Z" fill="#fb7185" />
      {/**/}
      <path d="M 100 115 C 95 105, 85 108, 90 120 L 100 132 L 110 120 C 115 108, 105 105, 100 115 Z" fill="#ffffff" />
    </svg>
  ),

  hat: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/**/}
      <ellipse cx="100" cy="140" rx="75" ry="20" fill="#0284c7" />
      {/**/}
      <path d="M 60 135 L 68 75 Q 100 65 132 75 L 140 135 Z" fill="#38bdf8" />
      {/**/}
      <rect x="62" y="122" width="76" height="14" rx="4" fill="#fbbf24" />
    </svg>
  ),

  pen: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(-45 100 100)">
        <rect x="88" y="40" width="24" height="100" rx="4" fill="#6366f1" />
        <polygon points="88,140 112,140 100,170" fill="#fcd34d" />
        <polygon points="96,160 104,160 100,170" fill="#1e293b" />
        <rect x="84" y="32" width="32" height="12" rx="4" fill="#4f46e5" />
      </g>
    </svg>
  ),

  box: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="100,45 160,75 100,105 40,75" fill="#d97706" />
      <polygon points="40,75 100,105 100,165 40,135" fill="#b45309" />
      <polygon points="160,75 100,105 100,165 160,135" fill="#92400e" />
      {/**/}
      <line x1="100" y1="45" x2="100" y2="105" stroke="#fbbf24" strokeWidth="6" />
    </svg>
  ),

  key: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(-45 100 100)">
        <circle cx="100" cy="65" r="28" stroke="#f59e0b" strokeWidth="12" fill="none" />
        <rect x="94" y="90" width="12" height="70" rx="3" fill="#f59e0b" />
        <rect x="106" y="130" width="16" height="8" rx="2" fill="#f59e0b" />
        <rect x="106" y="145" width="12" height="8" rx="2" fill="#f59e0b" />
      </g>
    </svg>
  ),

  egg: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="110" rx="55" ry="70" fill="#fed7aa" stroke="#fb923c" strokeWidth="4" />
      <path d="M 80 85 Q 90 70 105 75" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
    </svg>
  ),

  pie: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="130" rx="65" ry="30" fill="#92400e" />
      <path d="M 35 125 C 40 85, 160 85, 165 125 Z" fill="#f59e0b" />
      {/**/}
      <line x1="75" y1="100" x2="85" y2="120" stroke="#b45309" strokeWidth="4" strokeLinecap="round" />
      <line x1="100" y1="95" x2="100" y2="120" stroke="#b45309" strokeWidth="4" strokeLinecap="round" />
      <line x1="125" y1="100" x2="115" y2="120" stroke="#b45309" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),

  jam: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="65" y="45" width="70" height="20" rx="6" fill="#e11d48" />
      <rect x="55" y="65" width="90" height="95" rx="18" fill="#fda4af" stroke="#f43f5e" strokeWidth="4" />
      {/**/}
      <rect x="65" y="90" width="70" height="45" rx="8" fill="#ffffff" />
      {/**/}
      <circle cx="100" cy="112" r="10" fill="#e11d48" />
    </svg>
  ),

  boy: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/**/}
      <path d="M 50 95 C 40 50, 160 50, 150 95 Z" fill="#854d0e" />
      {/**/}
      <circle cx="100" cy="105" r="50" fill="#fed7aa" />
      {/**/}
      <path d="M 45 85 Q 100 50 155 85 L 180 85 Z" fill="#3b82f6" />
      {/**/}
      <circle cx="82" cy="105" r="6" fill="#1e293b" />
      <circle cx="118" cy="105" r="6" fill="#1e293b" />
      <path d="M 85 125 Q 100 140 115 125" stroke="#ea580c" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),

  eye: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 30 100 Q 100 45 170 100 Q 100 155 30 100 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="4" />
      {/**/}
      <circle cx="100" cy="100" r="32" fill="#0284c7" />
      {/**/}
      <circle cx="100" cy="100" r="16" fill="#0f172a" />
      {/**/}
      <circle cx="106" cy="94" r="6" fill="#ffffff" />
    </svg>
  ),

  // 4-LETTER WORDS
  ball: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="70" fill="#f43f5e" />
      {/**/}
      <path d="M 100 30 C 55 55, 55 145, 100 170 C 145 145, 145 55, 100 30 Z" fill="#38bdf8" />
      <path d="M 100 30 C 75 55, 75 145, 100 170 C 125 145, 125 55, 100 30 Z" fill="#fbbf24" />
      <circle cx="100" cy="100" r="16" fill="#ffffff" />
    </svg>
  ),

  book: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 30 135 Q 95 125 100 70 Q 105 125 170 135 L 165 65 Q 105 55 100 60 Q 95 55 35 65 Z" fill="#38bdf8" />
      {/**/}
      <path d="M 35 140 Q 95 130 100 80 Q 105 130 165 140 L 165 72 Q 105 62 100 68 Q 95 62 35 72 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
      {/**/}
      <line x1="100" y1="68" x2="100" y2="148" stroke="#0284c7" strokeWidth="4" />
    </svg>
  ),

  fish: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/**/}
      <polygon points="175,60 145,100 175,140" fill="#f97316" />
      {/**/}
      <ellipse cx="95" cy="100" rx="60" ry="42" fill="#fb923c" />
      {/**/}
      <polygon points="90,62 110,40 120,62" fill="#ea580c" />
      {/**/}
      <circle cx="62" cy="92" r="8" fill="#1e293b" />
      <circle cx="64" cy="90" r="3" fill="#ffffff" />
      {/**/}
      <path d="M 45 108 Q 55 116 65 108" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),

  frog: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/**/}
      <circle cx="60" cy="70" r="24" fill="#22c55e" />
      <circle cx="60" cy="70" r="12" fill="#ffffff" />
      <circle cx="62" cy="70" r="7" fill="#0f172a" />
      <circle cx="140" cy="70" r="24" fill="#22c55e" />
      <circle cx="140" cy="70" r="12" fill="#ffffff" />
      <circle cx="138" cy="70" r="7" fill="#0f172a" />
      {/**/}
      <ellipse cx="100" cy="115" rx="65" ry="48" fill="#4ade80" />
      {/**/}
      <path d="M 60 120 Q 100 145 140 120" stroke="#15803d" strokeWidth="4" strokeLinecap="round" />
      {/**/}
      <circle cx="58" cy="118" r="8" fill="#f472b6" opacity="0.6" />
      <circle cx="142" cy="118" r="8" fill="#f472b6" opacity="0.6" />
    </svg>
  ),

  duck: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/**/}
      <ellipse cx="110" cy="125" rx="55" ry="38" fill="#fbbf24" />
      <polygon points="160,120 180,105 165,135" fill="#f59e0b" />
      {/**/}
      <circle cx="70" cy="85" r="32" fill="#fbbf24" />
      {/**/}
      <path d="M 45 85 L 20 92 L 45 102 Z" fill="#f97316" />
      {/**/}
      <circle cx="62" cy="78" r="6" fill="#1e293b" />
      <circle cx="64" cy="76" r="2" fill="#ffffff" />
    </svg>
  ),

  bird: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="95" cy="110" rx="50" ry="35" fill="#0ea5e9" />
      {/**/}
      <ellipse cx="110" cy="115" rx="30" ry="18" fill="#0284c7" transform="rotate(-15 110 115)" />
      {/**/}
      <circle cx="65" cy="85" r="26" fill="#38bdf8" />
      {/**/}
      <polygon points="42,85 24,90 42,97" fill="#f59e0b" />
      {/**/}
      <circle cx="58" cy="80" r="5" fill="#1e293b" />
      <circle cx="60" cy="78" r="2" fill="#ffffff" />
    </svg>
  ),

  lion: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/**/}
      <circle cx="100" cy="100" r="70" fill="#b45309" />
      {/**/}
      <circle cx="100" cy="102" r="46" fill="#fbbf24" />
      {/**/}
      <circle cx="65" cy="65" r="14" fill="#fbbf24" />
      <circle cx="135" cy="65" r="14" fill="#fbbf24" />
      {/**/}
      <circle cx="84" cy="94" r="6" fill="#1e293b" />
      <circle cx="116" cy="94" r="6" fill="#1e293b" />
      {/**/}
      <polygon points="94,106 106,106 100,114" fill="#78350f" />
      <path d="M 94 116 Q 100 124 106 116" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),

  bear: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/**/}
      <circle cx="55" cy="60" r="20" fill="#78350f" />
      <circle cx="55" cy="60" r="10" fill="#fbcfe8" />
      <circle cx="145" cy="60" r="20" fill="#78350f" />
      <circle cx="145" cy="60" r="10" fill="#fbcfe8" />
      {/**/}
      <circle cx="100" cy="110" r="58" fill="#92400e" />
      {/**/}
      <ellipse cx="100" cy="126" rx="26" ry="20" fill="#fed7aa" />
      <ellipse cx="100" cy="118" rx="10" ry="7" fill="#1e293b" />
      {/**/}
      <circle cx="78" cy="98" r="6" fill="#1e293b" />
      <circle cx="122" cy="98" r="6" fill="#1e293b" />
    </svg>
  ),

  milk: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/**/}
      <polygon points="70,70 100,45 130,70" fill="#38bdf8" />
      <rect x="70" y="70" width="60" height="90" rx="6" fill="#f0f9ff" stroke="#38bdf8" strokeWidth="4" />
      {/**/}
      <rect x="76" y="95" width="48" height="35" rx="4" fill="#0284c7" />
      {/**/}
      <circle cx="95" cy="112" r="7" fill="#ffffff" />
      <circle cx="105" cy="115" r="5" fill="#ffffff" />
    </svg>
  ),

  cake: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/**/}
      <rect x="40" y="115" width="120" height="50" rx="10" fill="#fbcfe8" />
      {/**/}
      <path d="M 40 120 Q 55 135 70 120 Q 85 135 100 120 Q 115 135 130 120 Q 145 135 160 120 L 160 115 L 40 115 Z" fill="#f43f5e" />
      {/**/}
      <rect x="96" y="75" width="8" height="40" rx="2" fill="#38bdf8" />
      {/**/}
      <ellipse cx="100" cy="62" rx="6" ry="12" fill="#f59e0b" />
      <ellipse cx="100" cy="64" rx="3" ry="7" fill="#fef08a" />
    </svg>
  ),

  soup: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/**/}
      <path d="M 40 100 L 50 145 Q 100 170 150 145 L 160 100 Z" fill="#ef4444" />
      <ellipse cx="100" cy="100" rx="60" ry="16" fill="#fed7aa" stroke="#ef4444" strokeWidth="3" />
      {/**/}
      <path d="M 80 85 Q 75 70 85 55" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M 100 82 Q 105 67 95 52" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M 120 85 Q 125 70 115 55" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  ),

  tree: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/**/}
      <rect x="88" y="115" width="24" height="60" rx="4" fill="#854d0e" />
      {/**/}
      <circle cx="100" cy="75" r="45" fill="#22c55e" />
      <circle cx="70" cy="95" r="32" fill="#16a34a" />
      <circle cx="130" cy="95" r="32" fill="#16a34a" />
      {/**/}
      <circle cx="85" cy="80" r="6" fill="#ef4444" />
      <circle cx="115" cy="70" r="6" fill="#ef4444" />
      <circle cx="125" cy="105" r="6" fill="#ef4444" />
    </svg>
  ),

  moon: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 135 40 C 70 45, 60 145, 130 165 C 80 155, 75 80, 135 40 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="3" />
      {/**/}
      <circle cx="50" cy="65" r="4" fill="#fef08a" />
      <circle cx="155" cy="120" r="3" fill="#fef08a" />
    </svg>
  ),

  star: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="100,25 122,78 178,78 133,112 150,165 100,132 50,165 67,112 22,78 78,78" fill="#fbbf24" stroke="#f59e0b" strokeWidth="4" strokeLinejoin="round" />
      {/**/}
      <circle cx="88" cy="95" r="5" fill="#78350f" />
      <circle cx="112" cy="95" r="5" fill="#78350f" />
      <path d="M 90 110 Q 100 118 110 110" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),

  rain: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/**/}
      <path d="M 55 105 C 40 105, 30 85, 45 70 C 45 50, 70 40, 90 55 C 105 40, 135 40, 145 60 C 165 65, 165 95, 150 105 Z" fill="#93c5fd" />
      {/**/}
      <line x1="65" y1="120" x2="55" y2="150" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
      <line x1="95" y1="120" x2="85" y2="150" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
      <line x1="125" y1="120" x2="115" y2="150" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
    </svg>
  ),

  boat: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/**/}
      <polygon points="40,125 160,125 145,155 55,155" fill="#ea580c" />
      {/**/}
      <line x1="100" y1="45" x2="100" y2="125" stroke="#854d0e" strokeWidth="5" />
      {/**/}
      <polygon points="103,50 150,115 103,115" fill="#38bdf8" />
      {/**/}
      <path d="M 20 160 Q 45 150 70 160 Q 95 170 120 160 Q 145 150 170 160" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  ),

  shoe: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 45 90 L 80 90 L 105 110 L 160 115 Q 170 125 165 145 L 35 145 Q 35 115 45 90 Z" fill="#6366f1" />
      {/**/}
      <rect x="30" y="145" width="140" height="15" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
      {/**/}
      <line x1="75" y1="100" x2="90" y2="105" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
      <line x1="82" y1="112" x2="98" y2="117" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),

  door: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/**/}
      <rect x="50" y="35" width="100" height="145" rx="8" fill="#854d0e" />
      {/**/}
      <rect x="58" y="42" width="84" height="135" rx="6" fill="#b45309" />
      {/**/}
      <rect x="68" y="55" width="64" height="45" rx="4" fill="#d97706" />
      <rect x="68" y="115" width="64" height="50" rx="4" fill="#d97706" />
      {/**/}
      <circle cx="120" cy="115" r="7" fill="#fef08a" />
    </svg>
  ),

  hand: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/**/}
      <path d="M 60 120 L 60 90 C 60 80, 75 80, 75 90 L 75 60 C 75 50, 90 50, 90 60 L 90 50 C 90 40, 105 40, 105 50 L 105 60 C 105 50, 120 50, 120 60 L 120 100 C 120 90, 135 90, 135 105 C 135 135, 120 165, 90 165 L 75 165 C 60 165, 60 140, 60 120 Z" fill="#fed7aa" stroke="#fb923c" strokeWidth="3" />
    </svg>
  ),

  nose: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 90 55 L 85 125 C 85 145, 115 145, 115 125 L 110 55" stroke="#f97316" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/**/}
      <ellipse cx="80" cy="130" rx="5" ry="8" fill="#c2410c" />
      <ellipse cx="120" cy="130" rx="5" ry="8" fill="#c2410c" />
    </svg>
  ),

  // 5-LETTER & 6-LETTER WORDS
  apple: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/**/}
      <path d="M 100 55 Q 110 35 120 30" stroke="#854d0e" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/**/}
      <path d="M 105 45 Q 130 35 135 55 Q 110 55 105 45 Z" fill="#22c55e" />
      {/**/}
      <path d="M 100 65 C 65 50, 40 85, 45 130 C 50 165, 90 170, 100 160 C 110 170, 150 165, 155 130 C 160 85, 135 50, 100 65 Z" fill="#ef4444" />
      <circle cx="75" cy="95" r="7" fill="#fca5a5" opacity="0.6" />
    </svg>
  ),

  train: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="70" width="80" height="70" rx="10" fill="#3b82f6" />
      <rect x="120" y="90" width="45" height="50" rx="8" fill="#1d4ed8" />
      {/**/}
      <rect x="135" y="65" width="16" height="25" rx="3" fill="#ef4444" />
      {/**/}
      <rect x="55" y="80" width="30" height="25" rx="4" fill="#e0f2fe" />
      {/**/}
      <circle cx="65" cy="148" r="16" fill="#1e293b" />
      <circle cx="105" cy="148" r="16" fill="#1e293b" />
      <circle cx="145" cy="148" r="16" fill="#1e293b" />
    </svg>
  ),

  house: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/**/}
      <polygon points="100,40 35,95 165,95" fill="#ef4444" />
      {/**/}
      <rect x="50" y="95" width="100" height="70" fill="#fed7aa" />
      {/**/}
      <rect x="85" y="125" width="30" height="40" rx="3" fill="#854d0e" />
      {/**/}
      <rect x="60" y="105" width="20" height="20" rx="2" fill="#bae6fd" />
    </svg>
  ),

  water: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 100 40 C 65 95, 55 130, 55 145 C 55 170, 75 180, 100 180 C 125 180, 145 170, 145 145 C 145 130, 135 95, 100 40 Z" fill="#38bdf8" />
      <ellipse cx="85" cy="140" rx="10" ry="18" fill="#bae6fd" opacity="0.6" />
    </svg>
  ),

  smile: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="65" fill="#fbbf24" />
      <circle cx="80" cy="85" r="7" fill="#78350f" />
      <circle cx="120" cy="85" r="7" fill="#78350f" />
      <path d="M 75 115 Q 100 145 125 115" stroke="#78350f" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/**/}
      <circle cx="68" cy="115" r="8" fill="#fb7185" opacity="0.6" />
      <circle cx="132" cy="115" r="8" fill="#fb7185" opacity="0.6" />
    </svg>
  ),

  heart: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 100 65 C 80 35, 40 45, 40 85 C 40 120, 85 150, 100 165 C 115 150, 160 120, 160 85 C 160 45, 120 35, 100 65 Z" fill="#f43f5e" />
    </svg>
  ),

  banana: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 45 60 C 70 40, 150 65, 155 140 C 145 130, 95 105, 55 100 C 45 85, 40 70, 45 60 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="3" />
      <circle cx="45" cy="60" r="4" fill="#854d0e" />
    </svg>
  ),

  flower: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/**/}
      <circle cx="100" cy="70" r="22" fill="#f472b6" />
      <circle cx="100" cy="130" r="22" fill="#f472b6" />
      <circle cx="70" cy="100" r="22" fill="#f472b6" />
      <circle cx="130" cy="100" r="22" fill="#f472b6" />
      {/**/}
      <circle cx="100" cy="100" r="24" fill="#fbbf24" />
      {/**/}
      <path d="M 100 145 Q 95 170 100 180" stroke="#16a34a" strokeWidth="6" strokeLinecap="round" fill="none" />
    </svg>
  ),

  rocket: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(45 100 100)">
        {/**/}
        <polygon points="90,140 110,140 100,175" fill="#f59e0b" />
        <polygon points="94,140 106,140 100,165" fill="#fef08a" />
        {/**/}
        <polygon points="80,110 55,140 80,135" fill="#ef4444" />
        <polygon points="120,110 145,140 120,135" fill="#ef4444" />
        {/**/}
        <path d="M 80 135 L 80 75 Q 100 35 120 75 L 120 135 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
        {/**/}
        <circle cx="100" cy="85" r="12" fill="#38bdf8" stroke="#0284c7" strokeWidth="3" />
      </g>
    </svg>
  ),

  monkey: ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/**/}
      <circle cx="50" cy="95" r="20" fill="#78350f" />
      <circle cx="50" cy="95" r="12" fill="#fed7aa" />
      <circle cx="150" cy="95" r="20" fill="#78350f" />
      <circle cx="150" cy="95" r="12" fill="#fed7aa" />
      {/**/}
      <circle cx="100" cy="100" r="55" fill="#78350f" />
      {/**/}
      <ellipse cx="85" cy="88" rx="20" ry="16" fill="#fed7aa" />
      <ellipse cx="115" cy="88" rx="20" ry="16" fill="#fed7aa" />
      <ellipse cx="100" cy="115" rx="35" ry="24" fill="#fed7aa" />
      {/**/}
      <circle cx="88" cy="88" r="5" fill="#1e293b" />
      <circle cx="112" cy="88" r="5" fill="#1e293b" />
      <path d="M 85 120 Q 100 132 115 120" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
};

// Clean illustrated placeholder for custom words without an uploaded image
export const DefaultPlaceholder: React.FC<IllustrationProps & { wordText?: string }> = ({ className, wordText }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" rx="36" fill="#f0f9ff" />
    <circle cx="100" cy="100" r="65" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="4" strokeDasharray="8 8" />
    <text x="100" y="112" textAnchor="middle" fill="#0284c7" fontSize="42" fontWeight="bold" fontFamily="system-ui, sans-serif">
      {wordText ? wordText.slice(0, 3) : 'ABC'}
    </text>
  </svg>
);
