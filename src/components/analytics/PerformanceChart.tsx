import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis } from "recharts";

interface PerformanceChartProps {
  data: any[];
}

const PerformanceChart = ({ data }: PerformanceChartProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Performance Over Time</h2>
      <div className="bg-white rounded-lg shadow p-4">
        <ChartContainer className="h-[400px]" config={{}}>
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line type="monotone" dataKey="impressions" stroke="#2563eb" />
            <Line type="monotone" dataKey="likes" stroke="#16a34a" />
            <Line type="monotone" dataKey="comments" stroke="#d97706" />
            <Line type="monotone" dataKey="reshares" stroke="#dc2626" />
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export default PerformanceChart;