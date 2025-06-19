import React from 'react';
import { Card, CardHeader, CardBody, Skeleton, Divider, Tabs, Tab } from '@heroui/react';

const SettingsSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto p-6 max-w-7xl mt-10 w-full">
      {/* Tabs Skeleton */}
      <div className="w-full">
        <div className="flex space-x-1 mb-4">
          <Skeleton className="w-20 h-10 rounded-lg" />
          <Skeleton className="w-24 h-10 rounded-lg" />
          <Skeleton className="w-20 h-10 rounded-lg" />
        </div>

        {/* Profile Tab Content Skeleton */}
        <Card className="w-full">
          <CardHeader>
            <Skeleton className="w-48 h-8 rounded-lg" />
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              {/* Name fields row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="w-24 h-4 rounded-lg" />
                  <Skeleton className="w-full h-14 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="w-24 h-4 rounded-lg" />
                  <Skeleton className="w-full h-14 rounded-lg" />
                </div>
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <Skeleton className="w-16 h-4 rounded-lg" />
                <Skeleton className="w-full h-14 rounded-lg" />
                <Skeleton className="w-64 h-3 rounded-lg" />
              </div>

              {/* Account info section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <Skeleton className="w-32 h-4 rounded-lg" />
                  <Skeleton className="w-24 h-5 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="w-28 h-4 rounded-lg" />
                  <Skeleton className="w-20 h-5 rounded-lg" />
                </div>
              </div>

              <Divider />

              {/* Update button */}
              <div className="flex justify-end">
                <Skeleton className="w-32 h-10 rounded-lg" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Subscription Tab Skeleton */}
        <div className="mt-6">
          <Card className="w-full">
            <CardHeader>
              <Skeleton className="w-56 h-8 rounded-lg" />
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                {/* Current plan section */}
                <div className="space-y-4">
                  <Skeleton className="w-32 h-6 rounded-lg" />
                  <div className="p-4 border rounded-lg space-y-3">
                    <Skeleton className="w-40 h-5 rounded-lg" />
                    <Skeleton className="w-64 h-4 rounded-lg" />
                    <Skeleton className="w-48 h-4 rounded-lg" />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-4">
                  <Skeleton className="w-28 h-10 rounded-lg" />
                  <Skeleton className="w-32 h-10 rounded-lg" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Security Tab Skeleton */}
        <div className="mt-6">
          <Card className="w-full">
            <CardHeader>
              <Skeleton className="w-48 h-8 rounded-lg" />
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                {/* Change password section */}
                <div className="space-y-4">
                  <Skeleton className="w-36 h-5 rounded-lg" />
                  <Skeleton className="w-80 h-4 rounded-lg" />
                  <Skeleton className="w-40 h-10 rounded-lg" />
                </div>

                <Divider />

                {/* Export data section */}
                <div className="space-y-4">
                  <Skeleton className="w-36 h-5 rounded-lg" />
                  <Skeleton className="w-80 h-4 rounded-lg" />
                  <Skeleton className="w-32 h-10 rounded-lg" />
                </div>

                <Divider />

                {/* Delete account section */}
                <div className="space-y-4">
                  <Skeleton className="w-40 h-5 rounded-lg" />
                  <Skeleton className="w-96 h-4 rounded-lg" />
                  <Skeleton className="w-36 h-10 rounded-lg" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsSkeleton; 