import React from 'react';
import { Card, CardBody, CardHeader, Skeleton, Divider } from '@heroui/react';

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton className="w-40 h-4 rounded-lg" />
      </div>

      {/* Key Metrics Row Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => {
          const gradients = [
            'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
            'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
            'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
            'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
          ];
          
          return (
            <Card key={index} className={`w-full ${gradients[index]}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="w-24 h-4 rounded-lg" />
                <Skeleton className="w-5 h-5 rounded-lg" />
              </CardHeader>
              <CardBody className="pt-0">
                <div className="flex flex-col space-y-2">
                  <Skeleton className="w-20 h-8 rounded-lg" />
                  <Skeleton className="w-32 h-3 rounded-lg" />
                  <Skeleton className="w-28 h-3 rounded-lg" />
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <Divider />

      {/* Charts Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Skeleton */}
        <Card className="w-full bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="w-48 h-6 rounded-lg" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="w-1 h-1 rounded-full" />
                <Skeleton className="w-8 h-3 rounded-lg" />
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="relative h-72 w-full p-4">
              {/* Y-axis labels skeleton */}
              <div className="absolute left-0 top-4 bottom-8 flex flex-col justify-between">
                <Skeleton className="w-6 h-3 rounded" />
                <Skeleton className="w-6 h-3 rounded" />
                <Skeleton className="w-6 h-3 rounded" />
              </div>
              
              {/* Chart bars skeleton */}
              <div className="ml-10 mr-2 h-full relative">
                {/* Grid lines skeleton */}
                <div className="absolute inset-0 flex flex-col justify-between pb-8">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="border-t border-gray-200/60 w-full" />
                  ))}
                </div>
                
                <div className="absolute inset-0 flex items-end justify-between px-2 pb-8">
                  {[...Array(10)].map((_, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="relative mb-2">
                        <Skeleton 
                          className="w-10 rounded-t-lg shadow-sm" 
                          style={{ height: `${Math.random() * 80 + 20}%` }}
                        />
                      </div>
                      <Skeleton className="w-8 h-3 rounded" />
                    </div>
                  ))}
                </div>
                
                {/* X-axis line skeleton */}
                <div className="absolute bottom-8 left-0 right-0 h-px bg-gray-200"></div>
              </div>
              
              {/* Chart stats skeleton */}
              <div className="absolute top-4 right-4 text-right">
                <Skeleton className="w-8 h-3 rounded mb-1" />
                <Skeleton className="w-6 h-4 rounded" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Subscription Distribution Skeleton */}
        <Card className="w-full">
          <CardHeader>
            <Skeleton className="w-48 h-6 rounded-lg" />
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="w-20 h-4 rounded-lg" />
                    <Skeleton className="w-24 h-4 rounded-lg" />
                  </div>
                  <Skeleton className="w-full h-2 rounded-lg" />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Revenue Metrics Row Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, index) => {
          const revenueGradients = [
            'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
            'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200',
            'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
          ];
          
          return (
            <Card key={index} className={`w-full ${revenueGradients[index]}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="w-32 h-4 rounded-lg" />
                <Skeleton className="w-5 h-5 rounded-lg" />
              </CardHeader>
              <CardBody className="pt-0">
                <div className="flex flex-col space-y-2">
                  <Skeleton className="w-24 h-8 rounded-lg" />
                  <Skeleton className="w-28 h-3 rounded-lg" />
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity Skeleton */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="w-32 h-6 rounded-lg" />
          <div className="flex items-center">
            <Skeleton className="w-4 h-4 rounded-lg mr-1" />
            <Skeleton className="w-16 h-4 rounded-lg" />
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-default-100 last:border-b-0">
                <div className="flex items-center">
                  <Skeleton className="w-8 h-8 rounded-full mr-3" />
                  <div className="flex flex-col space-y-1">
                    <Skeleton className="w-32 h-4 rounded-lg" />
                    <Skeleton className="w-48 h-3 rounded-lg" />
                  </div>
                </div>
                <Skeleton className="w-20 h-4 rounded-lg" />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DashboardSkeleton; 