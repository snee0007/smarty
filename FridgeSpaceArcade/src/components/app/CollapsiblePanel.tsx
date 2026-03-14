import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

const CollapsiblePanel = ({ title, defaultOpen = true, children, className }: Props) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={cn('retro-panel bg-[rgba(14,18,35,0.92)] backdrop-blur-md overflow-hidden', className)}>
      <CollapsibleTrigger className="retro-title mb-0 w-full flex items-center justify-between gap-2 py-2 text-left hover:bg-white/5 transition-colors rounded-sm -m-1 px-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30">
        <span>{title}</span>
        <span className="text-white/70 shrink-0">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden">
        <div className="pt-3 mt-1 border-t border-white/10">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CollapsiblePanel;
