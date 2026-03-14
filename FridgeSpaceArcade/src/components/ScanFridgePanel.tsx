import { useRef } from 'react';

interface Props {
  isScanning: boolean;
  onFileSelect: (file: File) => Promise<void> | void;
}

const ScanFridgePanel = ({ isScanning, onFileSelect }: Props) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className={`space-y-2 transition-all duration-300 ${isScanning ? 'opacity-95' : ''}`}>
      <label
        className={`retro-button w-full text-center block relative overflow-hidden ${
          isScanning ? 'opacity-80 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
        }`}
      >
        {isScanning ? 'AI SCANNING...' : 'UPLOAD PHOTO'}

        {isScanning && (
          <span className="absolute inset-0 animate-pulse bg-white/10 pointer-events-none" />
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={isScanning}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              await onFileSelect(file);
            } finally {
              if (inputRef.current) {
                inputRef.current.value = '';
              }
            }
          }}
        />
      </label>

      <div className="text-[7px] leading-3 font-pixel text-muted-foreground">
        {isScanning
          ? 'Detecting fridge items and adding them into the shelves...'
          : 'Upload a fridge photo and the AI will detect items.'}
      </div>

      {isScanning && (
        <div className="h-2 w-full rounded-sm bg-white/10 overflow-hidden">
          <div className="h-full w-1/2 bg-white/50 animate-[scanBar_1s_linear_infinite]" />
        </div>
      )}

      <style>{`
        @keyframes scanBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(220%); }
        }
      `}</style>
    </div>
  );
};

export default ScanFridgePanel;