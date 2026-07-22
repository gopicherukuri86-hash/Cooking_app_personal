import React, { useState } from 'react';
import { ShoppingBag, Plus, Trash2, CheckCircle2, Copy, Check, Sparkles, DollarSign, ListFilter } from 'lucide-react';
import { ShoppingListItem, IngredientCategory } from '../types';

interface ShoppingListTabProps {
  items: ShoppingListItem[];
  setItems: React.Dispatch<React.SetStateAction<ShoppingListItem[]>>;
}

const CATEGORIES: IngredientCategory[] = [
  'Produce',
  'Protein',
  'Dairy',
  'Pantry',
  'Grains',
  'Spices',
  'Beverages',
  'Other',
];

export const ShoppingListTab: React.FC<ShoppingListTabProps> = ({ items, setItems }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('1 unit');
  const [newItemCategory, setNewItemCategory] = useState<IngredientCategory>('Produce');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const toggleItemCompleted = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCompleted = () => {
    setItems((prev) => prev.filter((item) => !item.completed));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: ShoppingListItem = {
      id: `shop_${Date.now()}`,
      name: newItemName.trim(),
      amount: newItemAmount || '1 unit',
      category: newItemCategory,
      completed: false,
      addedAt: new Date().toLocaleDateString(),
    };

    setItems((prev) => [...prev, newItem]);
    setNewItemName('');
  };

  const copyToClipboard = () => {
    const textList = items
      .map((i) => `[${i.completed ? 'x' : ' '}] ${i.name} - ${i.amount} (${i.category})`)
      .join('\n');

    navigator.clipboard.writeText(`🛒 Shopping List:\n${textList}`);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const totalCompleted = items.filter((i) => i.completed).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-[#E6E2D3] rounded-[32px] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F5F5F0] text-[#5A5A40] border border-[#D1CEC0]">
            <ShoppingBag className="w-3.5 h-3.5" /> 1-Click Grocery Sync
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic font-bold text-[#2D2D20]">Shopping List</h1>
          <p className="text-xs sm:text-sm text-[#8E8E7A] font-medium">
            {items.length} items total • {totalCompleted} completed
          </p>
        </div>

        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <>
              <button
                onClick={copyToClipboard}
                className="px-4 py-2.5 rounded-full bg-[#F5F5F0] hover:bg-[#E6E2D3] text-[#333322] border border-[#D1CEC0] text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                {copiedSuccess ? <Check className="w-4 h-4 text-[#5A5A40]" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSuccess ? 'Copied!' : 'Copy List'}</span>
              </button>

              {totalCompleted > 0 && (
                <button
                  onClick={clearCompleted}
                  className="px-4 py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Completed</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add New Item Form */}
      <form onSubmit={handleAddItem} className="bg-white border border-[#E6E2D3] rounded-[32px] p-5 shadow-xs flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Item name (e.g., Tamarind, Mustard Seeds, Ghee)..."
          className="flex-2 bg-[#F9F8F4] border border-[#E6E2D3] rounded-2xl px-4 py-2.5 text-sm text-[#2D2D20] placeholder-[#8E8E7A] focus:outline-none focus:border-[#5A5A40]"
        />
        <input
          type="text"
          value={newItemAmount}
          onChange={(e) => setNewItemAmount(e.target.value)}
          placeholder="Quantity (e.g. 250g)"
          className="flex-1 bg-[#F9F8F4] border border-[#E6E2D3] rounded-2xl px-4 py-2.5 text-sm text-[#2D2D20] placeholder-[#8E8E7A] focus:outline-none focus:border-[#5A5A40]"
        />
        <select
          value={newItemCategory}
          onChange={(e) => setNewItemCategory(e.target.value as IngredientCategory)}
          className="bg-[#F9F8F4] border border-[#E6E2D3] rounded-2xl px-4 py-2.5 text-sm text-[#2D2D20] focus:outline-none"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-6 py-2.5 bg-[#5A5A40] hover:bg-[#4A4A35] text-white font-bold rounded-full text-sm flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </form>

      {/* Categorized Items List */}
      <div className="space-y-6">
        {CATEGORIES.map((category) => {
          const categoryItems = items.filter((i) => i.category === category);
          if (categoryItems.length === 0) return null;

          return (
            <div key={category} className="bg-white border border-[#E6E2D3] rounded-[32px] p-6 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider flex items-center justify-between">
                <span>{category}</span>
                <span className="text-[#8E8E7A] font-mono">({categoryItems.length})</span>
              </h3>

              <div className="space-y-2">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleItemCompleted(item.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      item.completed
                        ? 'bg-[#F9F8F4] border-[#E6E2D3] text-[#8E8E7A] line-through'
                        : 'bg-[#F9F8F4] border-[#E6E2D3] hover:border-[#D1CEC0] text-[#2D2D20]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          item.completed ? 'bg-[#5A5A40] border-[#5A5A40] text-white' : 'border-[#D1CEC0]'
                        }`}
                      >
                        {item.completed && <Check className="w-3.5 h-3.5 font-extrabold" />}
                      </div>
                      <div>
                        <span className="font-semibold text-sm block">{item.name}</span>
                        {item.recipeSource && (
                          <span className="text-[11px] text-[#8E8E7A] block">
                            For recipe: <span className="text-[#5A5A40] font-medium">{item.recipeSource}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-[#5A5A40] bg-white px-3 py-1 rounded-full border border-[#D1CEC0]">
                        {item.amount}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteItem(item.id);
                        }}
                        className="text-[#8E8E7A] hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="text-center py-16 bg-white border border-[#E6E2D3] rounded-[32px] space-y-3">
            <ShoppingBag className="w-12 h-12 text-[#8E8E7A] mx-auto" />
            <p className="text-[#2D2D20] font-serif italic font-bold text-lg">Your shopping list is empty</p>
            <p className="text-[#8E8E7A] text-xs max-w-sm mx-auto">
              Missing ingredients from recipe cards will automatically populate here when you click "+ Missing".
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
