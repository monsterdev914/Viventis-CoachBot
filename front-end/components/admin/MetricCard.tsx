import React from 'react';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  variant?: 'default' | 'gradient';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  subtitle,
  icon,
  color = 'primary',
  variant = 'default'
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-success';
      case 'decrease':
        return 'text-danger';
      default:
        return 'text-default-500';
    }
  };

  const getChangeIcon = () => {
    if (changeType === 'increase') {
      return <ArrowUpIcon className="w-4 h-4" />;
    } else if (changeType === 'decrease') {
      return <ArrowDownIcon className="w-4 h-4" />;
    }
    return null;
  };

  const getCardStyles = () => {
    if (variant === 'gradient') {
      switch (color) {
        case 'primary':
          return 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200';
        case 'success':
          return 'bg-gradient-to-br from-green-50 to-green-100 border-green-200';
        case 'warning':
          return 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200';
        case 'secondary':
          return 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200';
        case 'danger':
          return 'bg-gradient-to-br from-red-50 to-red-100 border-red-200';
        default:
          return 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200';
      }
    }
    return '';
  };

  const getIconStyles = () => {
    if (variant === 'gradient') {
      switch (color) {
        case 'primary':
          return 'text-blue-600';
        case 'success':
          return 'text-green-600';
        case 'warning':
          return 'text-orange-600';
        case 'secondary':
          return 'text-purple-600';
        case 'danger':
          return 'text-red-600';
        default:
          return 'text-blue-600';
      }
    }
    return 'text-default-400';
  };

  const getTitleStyles = () => {
    if (variant === 'gradient') {
      switch (color) {
        case 'primary':
          return 'text-blue-700';
        case 'success':
          return 'text-green-700';
        case 'warning':
          return 'text-orange-700';
        case 'secondary':
          return 'text-purple-700';
        case 'danger':
          return 'text-red-700';
        default:
          return 'text-blue-700';
      }
    }
    return 'text-default-600';
  };

  return (
    <Card className={`w-full ${getCardStyles()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className={`text-sm font-medium ${getTitleStyles()}`}>{title}</h3>
        {icon && <div className={getIconStyles()}>{icon}</div>}
      </CardHeader>
      <CardBody className="pt-0">
        <div className="flex flex-col">
          <p className="text-2xl font-bold text-default-900">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center text-xs mt-1 ${getChangeColor()}`}>
              {getChangeIcon()}
              <span className="ml-1">
                {Math.abs(change)}% from last month
              </span>
            </div>
          )}
          {subtitle && (
            <p className="text-xs text-default-500 mt-1">{subtitle}</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default MetricCard; 