import React from 'react';
import { Skill } from '../../types';

interface SkillRadarChartProps {
  skills: Skill[];
  size?: number;
  className?: string;
}

const SkillRadarChart: React.FC<SkillRadarChartProps> = ({
  skills,
  size = 300,
  className = '',
}) => {
  const center = size / 2;
  const radius = size * 0.4;
  const skillsCount = skills.length;
  
  if (skillsCount < 3) {
    return (
      <div className="flex items-center justify-center text-gray-400">
        Not enough skills to generate a chart
      </div>
    );
  }

  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / skillsCount - Math.PI / 2;
    const normalizedValue = value / 100;
    const x = center + radius * normalizedValue * Math.cos(angle);
    const y = center + radius * normalizedValue * Math.sin(angle);
    return { x, y };
  };

  const getAxisCoordinates = (index: number) => {
    const angle = (Math.PI * 2 * index) / skillsCount - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y };
  };

  const circles = [0.2, 0.4, 0.6, 0.8, 1].map((ratio) => ({
    ratio,
    radius: radius * ratio,
  }));

  const points = skills.map((skill, index) => getCoordinates(index, skill.level));
  const axes = skills.map((_, index) => getAxisCoordinates(index));
  const polygonPoints = points.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <div className={`relative ${className}`}>
      <svg width={size} height={size} className="overflow-visible">
        {/* Background circles */}
        {circles.map((circle, index) => (
          <circle
            key={`circle-${index}`}
            cx={center}
            cy={center}
            r={circle.radius}
            fill="none"
            stroke="rgba(107, 70, 193, 0.2)"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {axes.map((point, index) => (
          <line
            key={`axis-${index}`}
            x1={center}
            y1={center}
            x2={point.x}
            y2={point.y}
            stroke="rgba(107, 70, 193, 0.3)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        {/* Skill area */}
        <polygon
          points={polygonPoints}
          fill="rgba(147, 51, 234, 0.2)"
          stroke="rgba(168, 85, 247, 0.8)"
          strokeWidth="2"
        />

        {/* Skill points */}
        {points.map((point, index) => (
          <circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#a855f7"
          />
        ))}
      </svg>

      {/* Skill labels */}
      {skills.map((skill, index) => {
        const point = getAxisCoordinates(index);
        const labelOffset = 10;
        const textAnchor = point.x > center + 5
          ? 'start'
          : point.x < center - 5
            ? 'end'
            : 'middle';
        const dy = point.y > center + 5
          ? '0.8em'
          : point.y < center - 5
            ? '-0.5em'
            : '0.3em';
        
        const xOffset = point.x > center + 5
          ? labelOffset
          : point.x < center - 5
            ? -labelOffset
            : 0;
        
        const yOffset = point.y > center + 5
          ? labelOffset
          : point.y < center - 5
            ? -labelOffset
            : 0;
            
        return (
          <div
            key={`label-${index}`}
            className="absolute text-sm text-gray-300 font-medium"
            style={{
              left: `${point.x + xOffset}px`,
              top: `${point.y + yOffset}px`,
              transform: 'translate(-50%, -50%)',
              textAlign: textAnchor === 'middle' ? 'center' : textAnchor === 'start' ? 'left' : 'right',
            }}
          >
            {skill.name}
          </div>
        );
      })}
    </div>
  );
};

export default SkillRadarChart;