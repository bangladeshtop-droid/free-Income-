import React from "react";
import { CheckCircle2, Circle } from "lucide-react";

interface TaskProgressProps {
  completed: number;
  total: number;
}

export default function TaskProgress({ completed, total }: TaskProgressProps) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-6">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="font-bold text-gray-800">Task Progress</h3>
          <p className="text-xs text-gray-500">Your daily completion rate</p>
        </div>
        <div className="text-right">
          <span className="text-xl font-black text-indigo-600">
            {percentage}%
          </span>
        </div>
      </div>

      <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3 relative">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between text-xs font-semibold">
        <div className="flex items-center text-green-600">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
          <span>{completed} Completed</span>
        </div>
        <div className="flex items-center text-gray-400">
          <Circle className="w-3.5 h-3.5 mr-1" />
          <span>{total - completed} Pending</span>
        </div>
      </div>
    </div>
  );
}
