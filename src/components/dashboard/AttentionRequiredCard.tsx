import React from 'react';
import { Button } from '../ui/Button';
import { AlertTriangle, Clock, FileWarning, ArrowRight, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';

export interface AttentionItem {
  id: string;
  title: string;
  description: string;
  priority: 'warning' | 'high' | 'info' | 'emergency';
  actionText: string;
  actionPath: string;
}

interface AttentionRequiredCardProps {
  item: AttentionItem;
  onAction?: (item: AttentionItem) => void;
}

export const AttentionRequiredCard: React.FC<AttentionRequiredCardProps> = ({ item, onAction }) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onAction) onAction(item);
    else navigate(item.actionPath);
  };

  const priorityStyles = {
    emergency: {
      border: 'border-rose-300 bg-rose-50/50',
      iconBg: 'bg-rose-100 text-rose-800',
      badge: 'bg-rose-200 text-rose-900',
      icon: <ShieldAlert className="w-4 h-4" />,
    },
    high: {
      border: 'border-amber-300 bg-amber-50/50',
      iconBg: 'bg-amber-100 text-amber-800',
      badge: 'bg-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-4 h-4" />,
    },
    warning: {
      border: 'border-amber-200 bg-slate-50',
      iconBg: 'bg-amber-100 text-amber-700',
      badge: 'bg-amber-100 text-amber-800',
      icon: <Clock className="w-4 h-4" />,
    },
    info: {
      border: 'border-slate-200 bg-white',
      iconBg: 'bg-sky-100 text-sky-700',
      badge: 'bg-sky-100 text-sky-800',
      icon: <FileWarning className="w-4 h-4" />,
    },
  };

  const currentStyle = priorityStyles[item.priority] || priorityStyles.info;

  return (
    <div
      className={cn(
        'p-4 rounded-xl border transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3',
        currentStyle.border
      )}
    >
      <div className="flex items-start space-x-3 min-w-0">
        <div className={cn('p-2.5 rounded-lg shrink-0 mt-0.5', currentStyle.iconBg)}>
          {currentStyle.icon}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{item.title}</h4>
            <span
              className={cn(
                'text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0',
                currentStyle.badge
              )}
            >
              {item.priority}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{item.description}</p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleAction}
        className="shrink-0 text-xs font-semibold self-end sm:self-center"
        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
      >
        {item.actionText}
      </Button>
    </div>
  );
};
