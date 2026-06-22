import { motion } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
  sublabel?: string;
  colorClass?: string;
}

const ScoreGauge = ({ 
  score, 
  size = 120, 
  label, 
  sublabel,
  colorClass = 'text-indigo-500' 
}: ScoreGaugeProps) => {
  const radius = (size - 16) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background Circle */}
        <svg
          className="transform -rotate-90 w-full h-full"
          viewBox={`0 0 ${size} ${size}`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-800"
          />
          {/* Progress Circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={colorClass}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Inner Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{score}</span>
          <span className="text-xs text-gray-400">/ 100</span>
        </div>
      </div>
      
      {/* Labels */}
      {(label || sublabel) && (
        <div className="text-center mt-4">
          {label && <h4 className="text-sm font-semibold text-gray-200">{label}</h4>}
          {sublabel && <p className="text-xs text-gray-400 mt-1">{sublabel}</p>}
        </div>
      )}
    </div>
  );
};

export default ScoreGauge;
