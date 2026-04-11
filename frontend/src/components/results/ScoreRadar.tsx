import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

interface ScoreRadarProps {
  dimensions: {
    technical: number;
    problemSolving: number;
    communication: number;
    depth: number;
    clarity: number;
  };
}

const ScoreRadar = ({ dimensions }: ScoreRadarProps) => {
  const data = [
    { subject: 'Technical', value: dimensions.technical },
    { subject: 'Problem Solving', value: dimensions.problemSolving },
    { subject: 'Communication', value: dimensions.communication },
    { subject: 'Depth', value: dimensions.depth },
    { subject: 'Clarity', value: dimensions.clarity },
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke="hsl(240 4% 18%)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: 'hsl(220 8% 50%)', fontSize: 11 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 10]}
          tick={{ fill: 'hsl(220 8% 50%)', fontSize: 10 }}
          axisLine={false}
        />
        <Radar
          name="Score"
          dataKey="value"
          stroke="hsl(239 84% 67%)"
          fill="hsl(239 84% 67%)"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default ScoreRadar;
