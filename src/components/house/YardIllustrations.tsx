import React from 'react';
import { FarmDecorationId } from '../../types';

const COCOA = '#6B5344';

/* Full Courtyard Backdrop: warm cream sky, soft rolling shrubs, open meadow and a short picnic path */
export const YardSceneBackdropSvg: React.FC<{
  fenceId: FarmDecorationId | null;
  hasGreenhouse?: boolean;
}> = ({ fenceId, hasGreenhouse = false }) => {
  const isWarmWoodFence = fenceId === 'wooden_fence';
  const picketFill = isWarmWoodFence ? '#DFB384' : '#FFFDF8';
  const railFill = isWarmWoodFence ? '#CCA072' : '#EFECE4';

  return (
    <svg
      viewBox="0 0 400 520"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 w-full h-full block"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="yardSkyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={hasGreenhouse ? '#FFF0D2' : '#FFF3DC'} />
          <stop offset="58%" stopColor="#FFF9E9" />
          <stop offset="100%" stopColor="#E8F0D4" />
        </linearGradient>
        <linearGradient id="yardMeadowGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D3E9B5" />
          <stop offset="42%" stopColor="#DFF0C5" />
          <stop offset="100%" stopColor="#CFE5AC" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect x="0" y="0" width="400" height="194" fill="url(#yardSkyGrad)" />

      {/* Soft Fluffy Clouds */}
      <path
        d="M205 48C205 41 212 36 220 37C224 31 234 30 239 36C246 36 251 42 250 48H205Z"
        fill="#FFFFFF"
        opacity="0.82"
      />

      {/* Soft pink-green rolling hills and shrub silhouettes */}
      <path
        d="M0 139Q42 108 92 129Q132 104 180 128Q225 101 275 126Q332 98 400 128V177H0Z"
        fill="#C7DFA9"
        opacity="0.96"
      />
      <path
        d="M0 151Q56 125 114 146Q169 119 226 144Q284 115 342 140Q375 126 400 140V178H0Z"
        fill="#A9CC87"
        opacity="0.88"
      />
      <g fill="#F3B4BE" opacity="0.78">
        <circle cx="28" cy="138" r="2.3" /><circle cx="35" cy="134" r="1.8" />
        <circle cx="300" cy="130" r="2.2" /><circle cx="308" cy="126" r="1.8" />
        <circle cx="371" cy="141" r="2" /><circle cx="379" cy="137" r="1.7" />
      </g>

      {/* Background Picket Fence (Upper Meadow Horizon) */}
      <g>
        <rect x="0" y="145" width="400" height="4.5" fill={railFill} stroke={COCOA} strokeWidth="1.2" opacity="0.9" />
        <rect x="0" y="158" width="400" height="4.5" fill={railFill} stroke={COCOA} strokeWidth="1.2" opacity="0.9" />
        {[10, 32, 54, 76, 98, 120, 142, 164, 186, 208, 230, 252, 274, 296, 318, 340, 362, 384].map((x) => (
          <path
            key={x}
            d={`M${x} 145L${x + 4.5} 138L${x + 9} 145V166H${x}Z`}
            fill={picketFill}
            stroke={COCOA}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        ))}
      </g>

      {/* Main Pastel Meadow Lawn (#D9E8C4) */}
      <path
        d="M0 166Q110 153 230 166T400 162V520H0Z"
        fill="url(#yardMeadowGrad)"
      />
      <path
        d="M0 166Q180 157 400 164"
        fill="none"
        stroke="#A4C97E"
        strokeWidth="1.8"
      />

      {/* Short winding cobblestone path from cottage door to the picnic blanket edge */}
      <g>
        {/* Soft Warm Sand Mortar Bed Under Stones */}
        <path
          d="M124 158C150 171 176 186 184 207C193 231 178 250 161 267C145 284 143 300 155 314C160 320 166 325 174 329"
          fill="none"
          stroke="#C7BA96"
          strokeWidth="30"
          strokeLinecap="round"
          opacity="0.52"
        />
        {[
          { cx: 126, cy: 158, rx: 13, ry: 5.5, rot: 8, fill: '#E7D8C3' },
          { cx: 143, cy: 169, rx: 12, ry: 5, rot: 14, fill: '#D9CAB4' },
          { cx: 160, cy: 181, rx: 12, ry: 5, rot: 14, fill: '#DDD0BA' },
          { cx: 176, cy: 194, rx: 12, ry: 5.5, rot: 18, fill: '#EAE0CE' },
          { cx: 186, cy: 211, rx: 12, ry: 5.5, rot: -8, fill: '#D6C4AE' },
          { cx: 185, cy: 229, rx: 12, ry: 5.5, rot: -18, fill: '#E4D7C4' },
          { cx: 174, cy: 246, rx: 12, ry: 5.5, rot: -22, fill: '#D5C3AC' },
          { cx: 160, cy: 263, rx: 12, ry: 5.5, rot: -25, fill: '#E8DDD0' },
          { cx: 148, cy: 280, rx: 12, ry: 5.5, rot: -22, fill: '#DACBB4' },
          { cx: 146, cy: 297, rx: 12, ry: 5.5, rot: -5, fill: '#E5D8C5' },
          { cx: 156, cy: 313, rx: 12, ry: 5.5, rot: 20, fill: '#D5C5AE' },
          { cx: 170, cy: 326, rx: 11, ry: 5, rot: 18, fill: '#E7DCCB' },
        ].map((stone, idx) => (
          <ellipse
            key={idx}
            cx={stone.cx}
            cy={stone.cy}
            rx={stone.rx}
            ry={stone.ry}
            transform={`rotate(${stone.rot} ${stone.cx} ${stone.cy})`}
            fill={stone.fill}
            stroke={COCOA}
            strokeWidth="1.4"
          />
        ))}
      </g>

      {/* Subtle Hand-Drawn Grass Blades Scattered Across Lawn */}
      {[
        { x: 24, y: 224 },
        { x: 92, y: 258 },
        { x: 244, y: 226 },
        { x: 368, y: 306 },
        { x: 230, y: 378 },
        { x: 46, y: 350 },
        { x: 330, y: 430 },
      ].map((g, idx) => (
        <path
          key={idx}
          d={`M${g.x} ${g.y}L${g.x - 2} ${g.y - 6}M${g.x + 3} ${g.y}L${g.x + 3} ${g.y - 7}M${g.x + 6} ${g.y}L${g.x + 8} ${g.y - 5}`}
          stroke="#7CA85D"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      ))}

      {/* Subtle Greenhouse Skylight Sheen If Upgraded */}
      {hasGreenhouse && (
        <path
          d="M0 0H400V24H0Z"
          fill="rgba(255,255,255,0.34)"
        />
      )}
    </svg>
  );
};

/* Top-Left Warm Cream Cottage with Arched Door, Windows, Bushes & Clickable Hanging Signboard */
export const YardCottageSvg: React.FC<{
  houseName: string;
  signId: FarmDecorationId | null;
  onEditHouseName: () => void;
}> = ({ houseName, signId, onEditHouseName }) => {
  const isBerrySign = signId === 'berry_arch_sign';

  return (
    <div className="relative w-[54%] max-w-[235px] select-none">
      <svg viewBox="0 0 220 148" fill="none" className="w-full h-auto block" aria-hidden="true">
        {/* Left Side Wall */}
        <path
          d="M0 32L32 22V126H0Z"
          fill="#F5E5CE"
          stroke={COCOA}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Left Side Roof Slope */}
        <path
          d="M0 10L80 2L32 34L0 42Z"
          fill="#E5B47A"
          stroke={COCOA}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M8 20L36 16M6 30L30 26" stroke="#C58F56" strokeWidth="1.3" strokeLinecap="round" />

        {/* Main Cream Front Gable Wall */}
        <path
          d="M32 34L116 4L198 34V128H32V34Z"
          fill="#FFF4E3"
          stroke={COCOA}
          strokeWidth="2.1"
          strokeLinejoin="round"
        />

        {/* Roof Overhang Trim */}
        <path
          d="M22 38L116 2L208 38L200 48L116 14L30 48Z"
          fill="#E2AF74"
          stroke={COCOA}
          strokeWidth="2.1"
          strokeLinejoin="round"
        />

        {/* Stone Doorstep */}
        <path
          d="M72 128L134 128L142 137L80 137Z"
          fill="#E2D3BC"
          stroke={COCOA}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Main Arched Wooden Door */}
        <path
          d="M76 128V76C76 58 128 58 128 76V128Z"
          fill="#C58D59"
          stroke={COCOA}
          strokeWidth="2"
        />
        <path
          d="M82 128V78C82 65 122 65 122 78V128Z"
          fill="#D9A370"
          stroke={COCOA}
          strokeWidth="1.6"
        />
        {/* Vertical Plank Lines */}
        <line x1="95" y1="68" x2="95" y2="128" stroke="#B47C4B" strokeWidth="1.2" />
        <line x1="109" y1="68" x2="109" y2="128" stroke="#B47C4B" strokeWidth="1.2" />
        {/* Door Arched Window */}
        <path
          d="M92 92V83C92 74 112 74 112 83V92Z"
          fill="#CBE6F2"
          stroke={COCOA}
          strokeWidth="1.6"
        />
        <line x1="102" y1="76" x2="102" y2="92" stroke={COCOA} strokeWidth="1.3" />
        <line x1="92" y1="85" x2="112" y2="85" stroke={COCOA} strokeWidth="1.3" />
        {/* Brass Doorknob */}
        <circle cx="116" cy="102" r="3" fill="#FFD166" stroke={COCOA} strokeWidth="1.4" />

        {/* Left Side Window */}
        <path
          d="M5 76V64C5 56 23 56 23 64V76Z"
          fill="#FFFDF8"
          stroke={COCOA}
          strokeWidth="1.6"
        />
        <path d="M5 76V96H23V76" fill="#CBE6F2" stroke={COCOA} strokeWidth="1.6" />
        <line x1="14" y1="59" x2="14" y2="96" stroke={COCOA} strokeWidth="1.3" />
        <line x1="5" y1="80" x2="23" y2="80" stroke={COCOA} strokeWidth="1.3" />
        <rect x="3" y="95" width="22" height="4" rx="1.5" fill="#D5A16C" stroke={COCOA} strokeWidth="1.4" />

        {/* Right Arched Front Window */}
        <path
          d="M150 94V68C150 56 176 56 176 68V94Z"
          fill="#CBE6F2"
          stroke={COCOA}
          strokeWidth="1.8"
        />
        <line x1="163" y1="59" x2="163" y2="94" stroke={COCOA} strokeWidth="1.4" />
        <line x1="150" y1="74" x2="176" y2="74" stroke={COCOA} strokeWidth="1.4" />
        <line x1="150" y1="84" x2="176" y2="84" stroke={COCOA} strokeWidth="1.4" />
        <rect x="146" y="93" width="34" height="5" rx="2" fill="#D5A16C" stroke={COCOA} strokeWidth="1.5" />

        {/* Cozy Flowering Shrubs Along Cottage Base */}
        <g>
          <path
            d="M0 120C6 106 24 106 32 114C42 104 66 108 72 126C52 132 18 134 0 128Z"
            fill="#8FC576"
            stroke={COCOA}
            strokeWidth="1.7"
          />
          <circle cx="16" cy="117" r="3" fill="#FFB2CC" />
          <circle cx="48" cy="116" r="3" fill="#FFF3B0" />
          <circle cx="58" cy="121" r="2.8" fill="#FFB2CC" />
          <path
            d="M132 126C140 110 162 108 176 114C186 104 206 110 212 126C192 132 152 132 132 126Z"
            fill="#89BF70"
            stroke={COCOA}
            strokeWidth="1.7"
          />
          <circle cx="152" cy="120" r="2.8" fill="#FFF3B0" />
          <circle cx="188" cy="119" r="3" fill="#FFB2CC" />
        </g>

        {/* Sign Hanging Ropes / Floral Arch Garland */}
        <line x1="74" y1="8" x2="74" y2="25" stroke={COCOA} strokeWidth="1.8" />
        <line x1="156" y1="8" x2="156" y2="25" stroke={COCOA} strokeWidth="1.8" />
        {isBerrySign && (
          <>
            <circle cx="70" cy="24" r="4" fill="#FF92B4" stroke={COCOA} strokeWidth="1.1" />
            <circle cx="160" cy="24" r="4" fill="#FF92B4" stroke={COCOA} strokeWidth="1.1" />
            <circle cx="115" cy="19" r="3.5" fill="#FFE680" stroke={COCOA} strokeWidth="1" />
          </>
        )}
      </svg>

      {/* Interactive Hanging Signboard Button */}
      <button
        type="button"
        onClick={onEditHouseName}
        aria-label={`修改小屋名稱（目前為 ${houseName}）`}
        className={`absolute left-[19%] top-[14%] w-[68%] min-h-[34px] px-2.5 py-1 rounded-xl border-2 border-[#6B5344] shadow-[0_2px_0_#A6774D] flex items-center justify-center gap-1 transition active:translate-y-0.5 hover:brightness-105 ${
          isBerrySign
            ? 'bg-gradient-to-b from-[#FFEAF2] to-[#FFD6E6] text-[#8E284D]'
            : 'bg-gradient-to-b from-[#EAC496] to-[#D8A570] text-[#4C3121]'
        }`}
      >
        {isBerrySign && <span className="text-[11px] shrink-0" aria-hidden="true">🌸</span>}
        <span className="text-[11px] sm:text-xs font-extrabold truncate">{houseName}</span>
        <svg
          width="11"
          height="11"
          viewBox="0 0 16 16"
          fill="none"
          className="shrink-0 opacity-80"
          aria-hidden="true"
        >
          <path
            d="M11.5 2.5L13.5 4.5L5.5 12.5H3.5V10.5L11.5 2.5Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

/* Top-Right Red-Roofed Wooden Barn / Storage Shed (Clickable to View Ingredient Storage) */
export const YardBarnStorageSvg: React.FC<{
  storageLevel: number;
  storageCap: number;
  onOpenStorage: () => void;
}> = ({ storageLevel, storageCap, onOpenStorage }) => (
  <button
    type="button"
    onClick={onOpenStorage}
    aria-label={`開啟小倉庫清單（Lv.${storageLevel + 1}，上限 ${storageCap}/種）`}
    className="group relative w-[82%] max-w-[220px] select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7A9E] rounded-2xl transition active:scale-[0.98]"
  >
    <svg viewBox="0 0 176 146" fill="none" className="w-full h-auto block" aria-hidden="true">
      {/* Hay Bale Tucked on Left Side */}
      <g transform="translate(0, 82)">
        <rect x="4" y="14" width="22" height="22" rx="3" fill="#E8C678" stroke={COCOA} strokeWidth="1.6" />
        <line x1="6" y1="21" x2="24" y2="21" stroke="#B78E3D" strokeWidth="1.4" />
        <line x1="6" y1="29" x2="24" y2="29" stroke="#B78E3D" strokeWidth="1.4" />
      </g>

      {/* Main Barn Wooden Front & Side Wall */}
      <path
        d="M28 54L74 16L122 54V124H28V54Z"
        fill="#E0AF7D"
        stroke={COCOA}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M122 54L162 46V112L122 124V54Z"
        fill="#CC9866"
        stroke={COCOA}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Red Shingled Roof */}
      <path
        d="M74 14L126 10L170 46L122 54L74 14Z"
        fill="#DF7670"
        stroke={COCOA}
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      <path
        d="M18 58L74 12L126 58L118 65L74 25L26 65Z"
        fill="#E98882"
        stroke={COCOA}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Roof Planks Accent */}
      <path
        d="M95 28L134 23M108 39L148 34"
        stroke="#B85550"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.65"
      />

      {/* Cross-Braced Barn Door */}
      <rect x="52" y="76" width="44" height="48" rx="2" fill="#D59B69" stroke={COCOA} strokeWidth="1.8" />
      <rect x="57" y="81" width="34" height="43" fill="#C48654" stroke={COCOA} strokeWidth="1.4" />
      <path d="M57 81L91 124M91 81L57 124" stroke="#E78A82" strokeWidth="4" strokeLinecap="round" />
      <path d="M57 81L91 124M91 81L57 124" stroke={COCOA} strokeWidth="1.3" strokeLinecap="round" />

      {/* Sunflowers Cluster on Right Side of Barn */}
      <g transform="translate(132, 92)">
        <path d="M8 32Q6 18 10 10M20 34Q22 22 20 14M32 30Q35 18 32 10" stroke="#5D9A57" strokeWidth="2.2" strokeLinecap="round" />
        {[
          { cx: 10, cy: 10, r: 8 },
          { cx: 22, cy: 16, r: 7.5 },
          { cx: 32, cy: 10, r: 7.5 },
          { cx: 16, cy: 26, r: 6.5 },
        ].map((sf, idx) => (
          <g key={idx} transform={`translate(${sf.cx}, ${sf.cy})`}>
            <circle cx="0" cy="0" r={sf.r} fill="#FFD54F" stroke={COCOA} strokeWidth="1.3" />
            <circle cx="0" cy="0" r={sf.r * 0.48} fill="#7B4E34" />
          </g>
        ))}
      </g>
    </svg>

    {/* One-line barn name and compact cream wooden capacity plaque */}
    <div className="pointer-events-none absolute left-[24%] top-[37%] w-[50%] flex flex-col items-center text-center leading-tight">
      <span className="whitespace-nowrap text-[10px] sm:text-xs font-extrabold text-[#4A2F20] drop-shadow-[0_1px_0_rgba(255,248,235,0.8)]">
        小倉庫
      </span>
      <span className="mt-0.5 max-w-full rounded-[5px] border border-[#A77C51] bg-[#FFF1D5]/95 px-1 py-[2px] text-[6.5px] sm:text-[8px] font-extrabold text-[#5D3F2E] tabular-nums whitespace-nowrap shadow-[0_1px_0_rgba(107,83,68,0.2)]">
        Lv.{storageLevel + 1} 上限 {storageCap}/種
      </span>
    </div>
  </button>
);

/* Left Pastel Double-Tier Garden Fountain */
export const YardFountainSvg: React.FC = () => (
  <svg width="94" height="90" viewBox="0 0 96 90" fill="none" className="pointer-events-none select-none" aria-hidden="true">
    {/* Meadow Shadow */}
    <ellipse cx="48" cy="76" rx="40" ry="11" fill="rgba(96,128,56,0.22)" />

    {/* Pastel Scalloped Circular Pool Skirt */}
    <path
      d="M11 58C11 74 85 74 85 58V67C85 82 11 82 11 67V58Z"
      fill="#F2D7DF"
      stroke={COCOA}
      strokeWidth="1.9"
      strokeLinejoin="round"
    />
    {/* Pastel Mosaic Rim Stripes */}
    <path d="M26 67V75M42 70V78M58 70V78M72 67V75" stroke="#B6C6E8" strokeWidth="3.2" opacity="0.7" />
    {/* Pool Rim */}
    <ellipse cx="48" cy="58" rx="37" ry="13.5" fill="#FFF7F4" stroke={COCOA} strokeWidth="2" />
    {/* Pool Water */}
    <ellipse cx="48" cy="58" rx="31" ry="10.5" fill="#BBE9F7" stroke={COCOA} strokeWidth="1.5" />
    <path d="M27 59Q36 63 44 61M56 61Q64 63 71 58" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
    <path d="M31 55Q39 52 47 55M55 55Q62 52 68 55" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.72" className="animate-pulse" />
    <circle cx="25" cy="56" r="1.7" fill="#FFFFFF" opacity="0.9" />
    <circle cx="72" cy="57" r="1.4" fill="#FFFFFF" opacity="0.85" />

    {/* Center Pedestal Column */}
    <path
      d="M41 58L43 36H53L55 58C52 60 44 60 41 58Z"
      fill="#F4DCE2"
      stroke={COCOA}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Upper Bowl */}
    <ellipse cx="48" cy="36" rx="18" ry="6.5" fill="#FFF7F4" stroke={COCOA} strokeWidth="1.8" />
    <ellipse cx="48" cy="35.5" rx="14" ry="4.5" fill="#B6E8F8" stroke={COCOA} strokeWidth="1.3" />
    {/* Top Finial */}
    <path d="M45 35L47 22H49L51 35Z" fill="#F2D2DB" stroke={COCOA} strokeWidth="1.5" />

    {/* Flowing Water Arcs */}
    <path
      d="M48 20C43 12 37 15 37 22M48 20C53 12 59 15 59 22M48 18V10"
      stroke="#84D6F5"
      strokeWidth="2.4"
      strokeLinecap="round"
      className="animate-pulse"
    />
    <path
      d="M36 39C31 44 31 53 33 58M60 39C65 44 65 53 63 58"
      stroke="#9CE1FA"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <circle cx="42" cy="11" r="1.6" fill="#BBE9F7" />
    <circle cx="54" cy="11" r="1.6" fill="#BBE9F7" />

    {/* Tiny flower cluster beside the fountain */}
    <path d="M78 75Q78 67 81 62M85 76Q85 69 87 66M91 76Q91 70 94 66" stroke="#659B58" strokeWidth="1.8" strokeLinecap="round" />
    <g stroke={COCOA} strokeWidth="0.7">
      <circle cx="81" cy="60" r="2.7" fill="#FFB4CC" /><circle cx="78.5" cy="62" r="2.2" fill="#FFB4CC" /><circle cx="83.5" cy="62" r="2.2" fill="#FFB4CC" />
      <circle cx="87" cy="64" r="2.5" fill="#FFF0A8" /><circle cx="84.5" cy="66" r="2" fill="#FFF0A8" /><circle cx="89.5" cy="66" r="2" fill="#FFF0A8" />
      <circle cx="81" cy="62" r="1" fill="#FFD84D" /><circle cx="87" cy="66" r="1" fill="#E99A69" />
    </g>
  </svg>
);

/* Right Flower-Vine Wooden Two-Seater Garden Swing */
export const YardFlowerSwingSvg: React.FC = () => (
  <svg width="114" height="104" viewBox="0 0 124 114" fill="none" className="pointer-events-none select-none" aria-hidden="true">
    {/* Soft Meadow Shadow */}
    <ellipse cx="62" cy="100" rx="46" ry="9" fill="rgba(96,128,56,0.22)" />

    {/* Back A-Frame Legs */}
    <path d="M22 24L38 92M94 14L114 82" stroke="#AE7A4A" strokeWidth="5.5" strokeLinecap="round" />
    <path d="M22 24L38 92M94 14L114 82" stroke={COCOA} strokeWidth="1.8" strokeLinecap="round" />

    {/* Top Crossbeam */}
    <path d="M18 22L98 12" stroke="#D39D69" strokeWidth="7.5" strokeLinecap="round" />
    <path d="M18 22L98 12" stroke={COCOA} strokeWidth="1.9" strokeLinecap="round" />

    {/* Suspension Ropes */}
    <line x1="36" y1="22" x2="38" y2="70" stroke="#9B7554" strokeWidth="2.2" />
    <line x1="74" y1="17" x2="76" y2="66" stroke="#9B7554" strokeWidth="2.2" />

    {/* Wooden Swing Seat & Slatted Backrest */}
    <path d="M36 48L76 43V64L36 69Z" fill="#DFAA74" stroke={COCOA} strokeWidth="1.8" strokeLinejoin="round" />
    <line x1="44" y1="47" x2="44" y2="68" stroke={COCOA} strokeWidth="1.3" />
    <line x1="52" y1="46" x2="52" y2="67" stroke={COCOA} strokeWidth="1.3" />
    <line x1="60" y1="45" x2="60" y2="66" stroke={COCOA} strokeWidth="1.3" />
    <line x1="68" y1="44" x2="68" y2="65" stroke={COCOA} strokeWidth="1.3" />
    {/* Seat */}
    <path d="M30 70L74 64L84 74L39 81Z" fill="#ECC090" stroke={COCOA} strokeWidth="1.8" strokeLinejoin="round" />
    {/* Armrests */}
    <path d="M32 62L42 71M74 56L84 65" stroke="#C58B55" strokeWidth="3.5" strokeLinecap="round" />

    {/* Front A-Frame Legs */}
    <path d="M22 24L8 96M22 24L30 100" stroke="#D39D69" strokeWidth="5.5" strokeLinecap="round" />
    <path d="M22 24L8 96M22 24L30 100" stroke={COCOA} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M94 14L86 88M94 14L104 94" stroke="#D39D69" strokeWidth="5.5" strokeLinecap="round" />
    <path d="M94 14L86 88M94 14L104 94" stroke={COCOA} strokeWidth="1.8" strokeLinecap="round" />
    {/* Side Cross Bars */}
    <path d="M14 78L33 82M89 72L108 76" stroke="#C48B56" strokeWidth="4.5" strokeLinecap="round" />

    {/* Pink Blossoms & Leafy Vine Climbing the Swing */}
    <path
      d="M16 48C14 34 18 22 28 21C44 19 60 18 76 15C88 12 96 20 98 34C100 48 97 64 100 76"
      fill="none"
      stroke="#6BA35A"
      strokeWidth="2.3"
      strokeLinecap="round"
    />
    {[
      { x: 18, y: 24, c: '#FFA8C6' },
      { x: 26, y: 18, c: '#FFC2D7' },
      { x: 35, y: 22, c: '#FFA8C6' },
      { x: 52, y: 17, c: '#FFC2D7' },
      { x: 74, y: 14, c: '#FFA8C6' },
      { x: 88, y: 17, c: '#FFC2D7' },
      { x: 96, y: 28, c: '#FFA8C6' },
      { x: 96, y: 46, c: '#FFC2D7' },
      { x: 99, y: 62, c: '#FFA8C6' },
    ].map((fl, i) => (
      <g key={i} transform={`translate(${fl.x}, ${fl.y})`}>
        <circle cx="0" cy="-2.8" r="2.5" fill={fl.c} stroke={COCOA} strokeWidth="0.9" />
        <circle cx="2.8" cy="0" r="2.5" fill={fl.c} stroke={COCOA} strokeWidth="0.9" />
        <circle cx="0" cy="2.8" r="2.5" fill={fl.c} stroke={COCOA} strokeWidth="0.9" />
        <circle cx="-2.8" cy="0" r="2.5" fill={fl.c} stroke={COCOA} strokeWidth="0.9" />
        <circle cx="0" cy="0" r="1.5" fill="#FFE680" />
      </g>
    ))}
  </svg>
);

/* Pink-White Checkered Picnic Blanket + Woven Seed Baskets + Rattle Toy */
export const YardPicnicAreaSvg: React.FC = () => (
  <svg width="210" height="111" viewBox="0 0 186 98" fill="none" className="pointer-events-none select-none" aria-hidden="true">
    <defs>
      <pattern id="yardPicnicGingham" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(-14)">
        <rect width="16" height="16" fill="#FFFDF9" />
        <rect x="0" y="0" width="8" height="16" fill="#FFB3BF" opacity="0.72" />
        <rect x="0" y="0" width="16" height="8" fill="#FF98A8" opacity="0.62" />
      </pattern>
    </defs>

    {/* Blanket Soft Shadow */}
    <path d="M12 44L104 20L166 56L72 88Z" fill="rgba(96,128,56,0.22)" />

    {/* Perspective Pink & White Gingham Picnic Blanket */}
    <path
      d="M10 40L102 17L162 52L69 83Z"
      fill="url(#yardPicnicGingham)"
      stroke={COCOA}
      strokeWidth="2"
      strokeLinejoin="round"
    />

    {/* Cute Pastel Rattle Toy Resting on Blanket */}
    <g transform="translate(88, 56) rotate(-18)">
      <rect x="0" y="6" width="14" height="3.5" rx="1.7" fill="#E6EEF5" stroke={COCOA} strokeWidth="1.2" />
      <circle cx="0" cy="7.5" r="3" fill="#B5E0FF" stroke={COCOA} strokeWidth="1.2" />
      <circle cx="15" cy="7.5" r="5" fill="#FFB3C6" stroke={COCOA} strokeWidth="1.3" />
      <circle cx="15" cy="7.5" r="2.2" fill="#FFE599" />
    </g>

    {/* Small Woven Bowl of Seeds Beside Blanket */}
    <g transform="translate(114, 52)">
      <ellipse cx="14" cy="14" rx="13" ry="6.5" fill="#D5A670" stroke={COCOA} strokeWidth="1.6" />
      <path d="M2 14C3 23 25 23 26 14" fill="#C4915A" stroke={COCOA} strokeWidth="1.6" />
      <ellipse cx="14" cy="13.5" rx="9.5" ry="4" fill="#9A7E6B" />
      <circle cx="11" cy="13" r="1.2" fill="#D8C8B8" />
      <circle cx="16" cy="14" r="1.2" fill="#D8C8B8" />
      <circle cx="14" cy="12" r="1.2" fill="#6F574A" />
    </g>

    {/* Taller Woven Picnic Basket with Handle */}
    <g transform="translate(140, 32)">
      <path
        d="M8 14C8 4 28 4 28 14"
        fill="none"
        stroke="#B5804D"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M8 14C8 4 28 4 28 14"
        fill="none"
        stroke={COCOA}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M4 16H32L29 36C28 39 8 39 7 36L4 16Z"
        fill="#D6A56D"
        stroke={COCOA}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M6 23H30M7 30H29" stroke="#B4814C" strokeWidth="1.3" />
      <ellipse cx="18" cy="16" rx="14" ry="5" fill="#E3B986" stroke={COCOA} strokeWidth="1.6" />
      <ellipse cx="18" cy="16" rx="10.5" ry="3.2" fill="#7B6A62" />
    </g>
  </svg>
);

/* Active Yard Flowerbed Decoration Accent Strip */
export const YardFlowerbedAccent: React.FC<{ flowerbedId: FarmDecorationId | null }> = ({
  flowerbedId,
}) => {
  if (!flowerbedId) return null;
  const isLavender = flowerbedId === 'lavender_flowerbed';

  return (
    <div
      className="pointer-events-none flex items-center justify-between px-4 -mt-1 mb-1 select-none"
      aria-hidden="true"
    >
      {[0, 1, 2, 3, 4].map((idx) => (
        <svg key={idx} width="34" height="20" viewBox="0 0 36 22" fill="none">
          <path d="M6 19Q4 11 8 8M18 19V6M30 19Q32 11 28 8" stroke="#629D54" strokeWidth="1.8" strokeLinecap="round" />
          {isLavender ? (
            <>
              <ellipse cx="8" cy="7" rx="3" ry="5" fill="#B58CEB" stroke={COCOA} strokeWidth="1" />
              <ellipse cx="18" cy="5" rx="3.2" ry="5.2" fill="#C9A8F5" stroke={COCOA} strokeWidth="1" />
              <ellipse cx="28" cy="7" rx="3" ry="5" fill="#B58CEB" stroke={COCOA} strokeWidth="1" />
            </>
          ) : (
            <>
              <circle cx="8" cy="8" r="4" fill="#FFFDF5" stroke={COCOA} strokeWidth="1" />
              <circle cx="8" cy="8" r="1.6" fill="#FFD54F" />
              <circle cx="18" cy="6" r="4.3" fill="#FFFDF5" stroke={COCOA} strokeWidth="1" />
              <circle cx="18" cy="6" r="1.7" fill="#FFD54F" />
              <circle cx="28" cy="8" r="4" fill="#FFFDF5" stroke={COCOA} strokeWidth="1" />
              <circle cx="28" cy="8" r="1.6" fill="#FFD54F" />
            </>
          )}
        </svg>
      ))}
    </div>
  );
};

/* Bottom Wooden Fence + Left/Right Wildflower Clusters + Centered Mint Ribbon-Wrapped Candy CTA Button */
export const YardRibbonBottomFence: React.FC<{
  fenceId: FarmDecorationId | null;
  onGoToFarm: () => void;
}> = ({ fenceId, onGoToFarm }) => {
  const isWhiteFence = fenceId === 'white_picket_fence';
  const postFill = isWhiteFence ? '#FFFDF8' : '#E2B88B';
  const railTopFill = isWhiteFence ? '#F1EDE6' : '#CCA072';
  const railBotFill = isWhiteFence ? '#E6E0D6' : '#C49668';
  const nailFill = isWhiteFence ? '#CFC6BC' : '#B58458';

  return (
    <div className="relative w-full pt-3 pb-1 overflow-visible select-none">
      {/* Left & Right Fence + Flowers SVG */}
      <svg
        viewBox="0 0 400 72"
        className="w-full h-[64px] sm:h-[70px] block pointer-events-none"
        preserveAspectRatio="xMidYMax meet"
        fill="none"
        aria-hidden="true"
      >
        {/* Left Wooden Fence */}
        <g>
          <rect x="0" y="34" width="110" height="7" rx="3" fill={railTopFill} stroke={COCOA} strokeWidth="1.6" />
          <rect x="0" y="52" width="110" height="7" rx="3" fill={railBotFill} stroke={COCOA} strokeWidth="1.6" />
          {[12, 38, 64, 90].map((x) => (
            <g key={x}>
              <rect
                x={x - 6.5}
                y="22"
                width="13"
                height="48"
                rx="6"
                fill={postFill}
                stroke={COCOA}
                strokeWidth="1.7"
              />
              <circle cx={x} cy="37.5" r="1.3" fill={nailFill} />
              <circle cx={x} cy="55.5" r="1.3" fill={nailFill} />
            </g>
          ))}
        </g>

        {/* Right Wooden Fence */}
        <g>
          <rect x="290" y="34" width="110" height="7" rx="3" fill={railTopFill} stroke={COCOA} strokeWidth="1.6" />
          <rect x="290" y="52" width="110" height="7" rx="3" fill={railBotFill} stroke={COCOA} strokeWidth="1.6" />
          {[310, 336, 362, 388].map((x) => (
            <g key={x}>
              <rect
                x={x - 6.5}
                y="22"
                width="13"
                height="48"
                rx="6"
                fill={postFill}
                stroke={COCOA}
                strokeWidth="1.7"
              />
              <circle cx={x} cy="37.5" r="1.3" fill={nailFill} />
              <circle cx={x} cy="55.5" r="1.3" fill={nailFill} />
            </g>
          ))}
        </g>

        {/* Left & Right Wildflower Clusters */}
        {[
          { x: 18, y: 63, c: '#FFF8E2', center: '#FFD859' },
          { x: 40, y: 58, c: '#9AD4FA', center: '#FFF4A8' },
          { x: 60, y: 64, c: '#F59CC4', center: '#FFE67D' },
          { x: 80, y: 61, c: '#D6A8F0', center: '#FFE67D' },
          { x: 322, y: 62, c: '#F59CC4', center: '#FFE67D' },
          { x: 344, y: 58, c: '#FFE47D', center: '#F294B8' },
          { x: 366, y: 64, c: '#D6A8F0', center: '#FFE67D' },
          { x: 386, y: 60, c: '#F59CC4', center: '#FFF4A8' },
        ].map((fl, i) => (
          <g key={i} transform={`translate(${fl.x}, ${fl.y})`}>
            <path d="M-4 6Q-6 -1 -2 -4M0 6V-5M4 6Q6 -1 2 -4" stroke="#649D52" strokeWidth="1.7" strokeLinecap="round" />
            <circle cx="0" cy="-7" r="2.6" fill={fl.c} stroke={COCOA} strokeWidth="0.9" />
            <circle cx="-3" cy="-4.5" r="2.4" fill={fl.c} stroke={COCOA} strokeWidth="0.9" />
            <circle cx="3" cy="-4.5" r="2.4" fill={fl.c} stroke={COCOA} strokeWidth="0.9" />
            <circle cx="0" cy="-4.5" r="1.7" fill={fl.center} />
          </g>
        ))}
      </svg>

      {/* Embedded Mint Ribbon-Wrapped Candy 3D Button */}
      <div className="absolute inset-x-0 bottom-2.5 flex justify-center px-4 z-20">
        <button
          type="button"
          onClick={onGoToFarm}
          className="group relative inline-flex items-center justify-center min-h-[44px] focus-visible:outline-2 focus-visible:outline-[#3BA886] active:translate-y-0.5 transition"
        >
          {/* Left Candy-Ribbon Tail */}
          <svg
            width="24"
            height="36"
            viewBox="0 0 24 36"
            fill="none"
            className="-mr-2.5 shrink-0 z-0 transition-transform group-hover:-translate-x-0.5"
            aria-hidden="true"
          >
            <path
              d="M22 10L6 3C2 6 2 14 7 18C2 22 2 30 6 33L22 26Z"
              fill="#8CE2C0"
              stroke={COCOA}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M18 14L9 10M18 22L9 26" stroke="#53B792" strokeWidth="1.6" strokeLinecap="round" />
          </svg>

          {/* Center Pill Body */}
          <span className="relative z-10 inline-flex items-center justify-center gap-1 rounded-full bg-gradient-to-b from-[#98E8C8] via-[#7AD8B4] to-[#59BE98] border-2 border-[#6B5344] shadow-[0_3px_0_#439676] px-2.5 py-2 text-[10px] sm:gap-1.5 sm:px-4 sm:text-[13px] font-extrabold text-[#1E4F3D] whitespace-nowrap">
            <span aria-hidden="true">🌱</span>
            <span>前往食堂開心農場種植／採收作物</span>
          </span>

          {/* Right Candy-Ribbon Tail */}
          <svg
            width="24"
            height="36"
            viewBox="0 0 24 36"
            fill="none"
            className="-ml-2.5 shrink-0 z-0 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          >
            <path
              d="M2 10L18 3C22 6 22 14 17 18C22 22 22 30 18 33L2 26Z"
              fill="#8CE2C0"
              stroke={COCOA}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M6 14L15 10M6 22L15 26" stroke="#53B792" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};
