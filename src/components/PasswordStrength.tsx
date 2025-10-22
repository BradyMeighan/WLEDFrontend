import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';

interface PasswordStrengthProps {
  password: string;
  showRequirements?: boolean;
}

interface Requirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

interface RequirementItemProps {
  met: boolean;
  text: string;
}

type StrengthLevel = 'weak' | 'medium' | 'strong' | 'very-strong' | null;

const PasswordStrength = ({ password, showRequirements = true }: PasswordStrengthProps) => {
  const [strength, setStrength] = useState(null as StrengthLevel);
  const [requirements, setRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  } as Requirements);
  const { checkPasswordStrength } = useAuth();

  useEffect(() => {
    if (!password) {
      setStrength(null);
      setRequirements({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false
      });
      return;
    }

    // Local requirements check (immediate feedback)
    const localRequirements: Requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    setRequirements(localRequirements);

    // Debounced API call for strength check
    const timeoutId = setTimeout(async () => {
      try {
        const result = await checkPasswordStrength(password);
        if (result.success) {
          setStrength(result.data.strength);
        }
      } catch (error) {
        console.error('Password strength check failed:', error);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [password, checkPasswordStrength]);

  const getStrengthColor = (strengthLevel: StrengthLevel): string => {
    switch (strengthLevel) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-blue-500';
      case 'very-strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStrengthWidth = (strengthLevel: StrengthLevel): string => {
    switch (strengthLevel) {
      case 'weak':
        return 'w-1/4';
      case 'medium':
        return 'w-2/4';
      case 'strong':
        return 'w-3/4';
      case 'very-strong':
        return 'w-full';
      default:
        return 'w-0';
    }
  };

  const getStrengthText = (strengthLevel: StrengthLevel): string => {
    switch (strengthLevel) {
      case 'weak':
        return 'Weak';
      case 'medium':
        return 'Medium';
      case 'strong':
        return 'Strong';
      case 'very-strong':
        return 'Very Strong';
      default:
        return '';
    }
  };

  if (!password) return null;

  return (
    <div className="mt-2">
      {/* Strength Bar */}
      {strength && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Password Strength</span>
            <span className={`text-xs font-medium ${
              strength === 'very-strong' ? 'text-green-400' :
              strength === 'strong' ? 'text-blue-400' :
              strength === 'medium' ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {getStrengthText(strength)}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(strength)} ${getStrengthWidth(strength)}`}
            ></div>
          </div>
        </div>
      )}

      {/* Requirements */}
      {showRequirements && (
        <div className="space-y-1">
          <p className="text-xs text-slate-400 mb-2">Password must contain:</p>
          
          <div className="grid grid-cols-1 gap-1 text-xs">
            <RequirementItem 
              met={requirements.minLength} 
              text="At least 8 characters" 
            />
            <RequirementItem 
              met={requirements.hasUppercase} 
              text="One uppercase letter" 
            />
            <RequirementItem 
              met={requirements.hasLowercase} 
              text="One lowercase letter" 
            />
            <RequirementItem 
              met={requirements.hasNumber} 
              text="One number" 
            />
            <RequirementItem 
              met={requirements.hasSpecialChar} 
              text="One special character (!@#$%^&*)" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

const RequirementItem = ({ met, text }: RequirementItemProps) => (
  <div className={`flex items-center space-x-2 ${met ? 'text-green-400' : 'text-slate-400'}`}>
    {met ? (
      <Check className="w-3 h-3 text-green-400" />
    ) : (
      <X className="w-3 h-3 text-slate-500" />
    )}
    <span>{text}</span>
  </div>
);

export default PasswordStrength; 