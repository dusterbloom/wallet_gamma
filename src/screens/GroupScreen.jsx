import React, { useState } from 'react';
import { Header } from '../components/Screen.jsx';

export const GroupScreen = ({ groups, onBack, onContinue, onDeleteGroup, onDeleteBill, onUpdateBill }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  const [editingBill, setEditingBill] = useState(null);

  const handleDeleteGroup = (groupId) => {
    setShowConfirmDelete(null);
    onDeleteGroup(groupId);
  };

  const handleDeleteBill = (e, groupId, billId) => {
    e.stopPropagation();
    onDeleteBill(groupId, billId);
  };

  const handleEditBill = (e, bill, group) => {
    e.stopPropagation();
    setEditingBill({ ...bill, groupId: group.id });
  };

  const handleUpdateBill = (e) => {
    e.stopPropagation();
    if (editingBill) {
      onUpdateBill(editingBill.groupId, editingBill.id, {
        description: editingBill.description,
        amount: editingBill.amount
      });
      setEditingBill(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-black">
      <Header 
        title="Groups"
        onBack={onBack}
      />
      
      <div className="flex-1 p-4 overflow-auto">
        <button
          onClick={() => onContinue({ id: 'new', name: 'New Group', members: [], bills: [] })}
          className="w-full p-4 bg-zinc-900 rounded-xl mb-4
                   transition-all duration-200 hover:bg-zinc-800 
                   active:scale-98 sticky top-0 z-10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#FF9500] flex items-center justify-center">
                <span className="text-xl">+</span>
              </div>
              <span className="text-lg">New Group</span>
            </div>
            <span>→</span>
          </div>
        </button>

        <div className="space-y-3">
          {groups.map((group) => (
            <div key={group.id} className="bg-zinc-900 rounded-xl overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#FF9500] flex items-center justify-center">
                    {group.name[0]}
                  </div>
                  <div className="text-left">
                    <span className="text-lg block">{group.name}</span>
                    <span className="text-sm text-zinc-500">
                      {group.members.join(', ')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onContinue(group)}
                    className="p-2 hover:bg-zinc-800 rounded-full"
                  >
                    <span className="text-xl">→</span>
                  </button>
                  <button
                    onClick={() => setShowConfirmDelete(group.id)}
                    className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-red-500"
                  >
                    <span className="text-xl">×</span>
                  </button>
                </div>
              </div>

              {showConfirmDelete === group.id && (
                <div className="p-4 border-t border-zinc-800 bg-zinc-800/50">
                  <p className="text-sm text-zinc-400 mb-3">Delete this group and all its bills?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowConfirmDelete(null)}
                      className="flex-1 py-2 bg-zinc-700 rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="flex-1 py-2 bg-red-500 rounded-lg text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {group.bills?.length > 0 && (
                <div className="border-t border-zinc-800">
                  {group.bills.map((bill) => (
                    <div 
                      key={bill.id}
                      className="p-4 border-b border-zinc-800 last:border-b-0"
                    >
                      {editingBill?.id === bill.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editingBill.description}
                            onChange={(e) => setEditingBill({
                              ...editingBill,
                              description: e.target.value
                            })}
                            className="w-full bg-zinc-800 rounded-lg p-2 text-sm"
                            placeholder="Description"
                          />
                          <input
                            type="number"
                            value={editingBill.amount}
                            onChange={(e) => setEditingBill({
                              ...editingBill,
                              amount: e.target.value
                            })}
                            className="w-full bg-zinc-800 rounded-lg p-2 text-sm"
                            placeholder="Amount"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingBill(null)}
                              className="flex-1 py-2 bg-zinc-700 rounded-lg text-sm"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleUpdateBill}
                              className="flex-1 py-2 bg-[#FF9500] rounded-lg text-sm text-black"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-lg">${bill.amount}</div>
                            <div className="text-sm text-zinc-500">
                              {bill.description} · {bill.date}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!bill.settled && (
                              <>
                                <button
                                  onClick={(e) => handleEditBill(e, bill, group)}
                                  className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white"
                                >
                                  ✎
                                </button>
                                <button
                                  onClick={(e) => handleDeleteBill(e, group.id, bill.id)}
                                  className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-red-500"
                                >
                                  ×
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onContinue({ ...group, selectedBill: bill });
                                  }}
                                  className="px-4 py-2 bg-[#FF9500] rounded-full text-black
                                           text-sm font-medium transition-all duration-200
                                           hover:bg-[#FF9500]/90 active:scale-95"
                                >
                                  Split
                                </button>
                              </>
                            )}
                            {bill.settled && (
                              <span className="text-sm text-zinc-500">Settled</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
