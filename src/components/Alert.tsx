import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: string[];
  onClose?: () => void;
  className?: string;
}

interface AlertStyles {
  container: string;
  icon: React.ReactElement;
  iconBg: string;
  closeButton: string;
}

const Alert: React.FC<AlertProps> = ({ type = 'info', message, details = [], onClose, className = '' }) => {
  if (!message) return null;

  const getAlertStyles = (): AlertStyles => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-800/30 border-green-400/50 text-green-200',
          icon: <CheckCircle className="w-5 h-5 text-green-300" />,
          iconBg: 'bg-green-500/20',
          closeButton: 'text-green-300 hover:text-green-100 hover:bg-green-500/20'
        };
      case 'error':
        return {
          container: 'bg-red-900/20 border-red-500/30 text-red-300',
          icon: <XCircle className="w-5 h-5 text-red-400" />,
          iconBg: 'bg-red-500/20',
          closeButton: 'text-red-300 hover:text-red-100 hover:bg-red-500/20'
        };
      case 'warning':
        return {
          container: 'bg-yellow-900/20 border-yellow-500/30 text-yellow-300',
          icon: <AlertCircle className="w-5 h-5 text-yellow-400" />,
          iconBg: 'bg-yellow-500/20',
          closeButton: 'text-yellow-300 hover:text-yellow-100 hover:bg-yellow-500/20'
        };
      default:
        return {
          container: 'bg-blue-900/20 border-blue-500/30 text-blue-300',
          icon: <Info className="w-5 h-5 text-blue-400" />,
          iconBg: 'bg-blue-500/20',
          closeButton: 'text-blue-300 hover:text-blue-100 hover:bg-blue-500/20'
        };
    }
  };

  const styles = getAlertStyles();

  return (
    <div className={`relative rounded-lg border p-4 ${styles.container} ${className}`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 rounded-full p-1 ${styles.iconBg}`}>
          {styles.icon}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">
            {message}
          </p>
          {details && details.length > 0 && (
            <ul className="mt-2 text-xs space-y-1 opacity-90">
              {details.map((detail, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-1 h-1 bg-current rounded-full mr-2 flex-shrink-0"></span>
                  {detail}
                </li>
              ))}
            </ul>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-3 flex-shrink-0 rounded-full p-1 transition-colors duration-200 ${styles.closeButton}`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert; 