import React from 'react';
import { Card, CardBody, CardHeader } from '@heroui/react';

interface ChartData {
  date: string;
  users: number;
}

interface SimpleChartProps {
  title: string;
  data: ChartData[];
  color?: string;
}

const SimpleChart: React.FC<SimpleChartProps> = ({ 
  title, 
  data, 
  color = '#3b82f6' 
}) => {
  if (!data || data.length === 0) {
    return (
      <Card className="w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No data available</p>
              <p className="text-sm text-gray-400 mt-1">Data will appear here when available</p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  const maxValue = Math.max(...data.map(d => d.users));
  const minValue = Math.min(...data.map(d => d.users));
  const range = maxValue - minValue || 1;

  return (
    <Card className="w-full bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <div className="w-1 h-1 rounded-full bg-green-400"></div>
            <span>Live</span>
          </div>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        <div className="relative h-72 w-full p-4">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-4 bottom-8 flex flex-col justify-between text-xs font-medium text-gray-400">
            <span className="bg-white px-1 rounded">{maxValue}</span>
            <span className="bg-white px-1 rounded">{Math.round((maxValue + minValue) / 2)}</span>
            <span className="bg-white px-1 rounded">{minValue}</span>
          </div>
          
          {/* Chart area */}
          <div className="ml-10 mr-2 h-full relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pb-8">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="border-t border-gray-200/60 w-full relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/30 to-transparent h-px"></div>
                </div>
              ))}
            </div>
            
            {/* Data bars */}
            <div className="absolute inset-0 flex items-end justify-between px-2 pb-8">
              {data.map((item, index) => {
                const height = range > 0 ? ((item.users - minValue) / range) * 100 : 0;
                const barHeight = Math.max(height, 1);
                
                return (
                  <div key={index} className="flex flex-col items-center group relative">
                    {/* Bar container with shadow */}
                    <div className="relative mb-2">
                      {/* Shadow/base */}
                      <div 
                        className="absolute bottom-0 w-10 bg-gray-200/50 rounded-t-lg transform translate-y-1"
                        style={{ height: `${barHeight * 0.85}%` }}
                      />
                      
                      {/* Main bar with gradient */}
                      <div
                        className="w-10 rounded-t-lg relative overflow-hidden transform transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-1 cursor-pointer shadow-sm"
                        style={{
                          height: `${barHeight}%`,
                          background: `linear-gradient(180deg, ${color} 0%, ${color}CC 100%)`,
                          minHeight: '3px',
                          boxShadow: `0 4px 20px ${color}33`
                        }}
                      >
                        {/* Highlight effect */}
                        <div 
                          className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                        
                        {/* Shimmer effect */}
                        <div 
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"
                        />
                      </div>
                    </div>
                    
                    {/* Date label */}
                    <div className="text-xs font-medium text-gray-500 transform -rotate-45 origin-center mt-1 group-hover:text-gray-700 transition-colors">
                      {new Date(item.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    
                    {/* Modern Tooltip */}
                    <div className="absolute bottom-full mb-4 hidden group-hover:flex items-center justify-center pointer-events-none z-10">
                      <div className="bg-gray-900/95 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-xl shadow-2xl border border-gray-700/50 relative">
                        <div className="flex flex-col items-center text-center">
                          <div className="font-semibold text-blue-300">{item.users}</div>
                          <div className="text-xs text-gray-300">users</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(item.date).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                        {/* Tooltip arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/95"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* X-axis line */}
            <div className="absolute bottom-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
          
          {/* Chart stats overlay */}
          <div className="absolute top-4 right-4 text-right">
            <div className="text-xs text-gray-400">Peak</div>
            <div className="text-sm font-bold text-gray-700">{maxValue}</div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default SimpleChart; 