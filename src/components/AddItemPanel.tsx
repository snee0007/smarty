import { useState } from 'react';

interface Props {
  onAdd: (name: string, expiry: string, type: string) => void;
  isFull: boolean;
}

const AddItemPanel = ({ onAdd, isFull }: Props) => {
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [type, setType] = useState('milk');

  const handleAdd = () => {
    if (!name.trim() || !expiry) return;
    onAdd(name.trim(), expiry, type);
    setName('');
    setExpiry('');
  };

  return (
    <div className="fixed top-4 right-4 z-50 retro-panel w-56">
      <div className="retro-title mb-3">+ ADD FOOD</div>
      <div className="space-y-2">
        <input
          className="retro-input"
          placeholder="Item name"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={16}
        />
        <input
          className="retro-input"
          type="date"
          value={expiry}
          onChange={e => setExpiry(e.target.value)}
        />
        <select
          className="retro-select"
          value={type}
          onChange={e => setType(e.target.value)}
        >
          <option value="milk">Milk</option>
          <option value="cheese">Cheese</option>
          <option value="juice">Juice</option>
          <option value="other">Other</option>
        </select>
        <button
          className="retro-button w-full"
          onClick={handleAdd}
          disabled={isFull}
        >
          {isFull ? 'FRIDGE FULL!' : 'ADD ITEM'}
        </button>
      </div>
    </div>
  );
};

export default AddItemPanel;
