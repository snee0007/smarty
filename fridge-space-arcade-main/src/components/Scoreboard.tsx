import { FridgeItem } from '@/types/fridge';
import { getDaysLeft } from '@/lib/fridgeStore';

interface Props {
  items: FridgeItem[];
}

const Scoreboard = ({ items }: Props) => {
  const sorted = [...items]
    .map(i => ({ ...i, daysLeft: getDaysLeft(i.expiry) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5);

  return (
    <div className="fixed bottom-4 left-4 z-50 retro-panel w-64">
      <div className="retro-title mb-3">⚠ EXPIRING SOON</div>
      {sorted.length === 0 ? (
        <div className="text-[8px] font-pixel text-muted-foreground">
          FRIDGE IS EMPTY...
        </div>
      ) : (
        <div className="space-y-1">
          {sorted.map(item => {
            const cls =
              item.daysLeft <= 2
                ? 'expiry-critical'
                : item.daysLeft <= 7
                ? 'expiry-warning'
                : 'expiry-ok';
            return (
              <div
                key={item.id}
                className={`flex items-center gap-2 text-[7px] font-pixel ${cls}`}
              >
                <span className="w-2 h-2 inline-block flex-shrink-0" style={{
                  background: item.type === 'milk' ? '#f8f8f8' : 
                    item.type === 'cheese' ? '#fcd566' : 
                    item.type === 'juice' ? '#ff8844' : '#b08050'
                }} />
                <span className="truncate flex-1">{item.name}</span>
                <span className="flex-shrink-0">D-{item.daysLeft}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Scoreboard;
