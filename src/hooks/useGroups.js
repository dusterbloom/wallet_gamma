import { useState } from 'react';

const initialGroups = [
  { 
    id: '1', 
    name: 'Weekend Trip', 
    members: ['Alice', 'Bob', 'Charlie'],
    bills: [
      { id: '1', amount: '120.50', description: 'Dinner', date: 'Today', settled: false },
      { id: '2', amount: '45.00', description: 'Taxi', date: 'Yesterday', settled: true }
    ]
  },
  { 
    id: '2', 
    name: 'Roommates', 
    members: ['David', 'Eve'],
    bills: [
      { id: '3', amount: '200.00', description: 'Groceries', date: 'Today', settled: false }
    ]
  }
];

export const useGroups = () => {
  const [groups, setGroups] = useState(initialGroups);

  const addGroup = (newGroup) => {
    setGroups(current => [...current, { ...newGroup, id: Date.now().toString() }]);
  };

  const updateGroup = (groupId, updatedGroup) => {
    setGroups(current => 
      current.map(group => 
        group.id === groupId ? { ...group, ...updatedGroup } : group
      )
    );
  };

  const deleteGroup = (groupId) => {
    setGroups(current => current.filter(group => group.id !== groupId));
  };

  const addBill = (groupId, newBill) => {
    setGroups(current =>
      current.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            bills: [...(group.bills || []), { ...newBill, id: Date.now().toString() }]
          };
        }
        return group;
      })
    );
  };

  const updateBill = (groupId, billId, updatedBill) => {
    setGroups(current =>
      current.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            bills: group.bills.map(bill =>
              bill.id === billId ? { ...bill, ...updatedBill } : bill
            )
          };
        }
        return group;
      })
    );
  };

  const deleteBill = (groupId, billId) => {
    setGroups(current =>
      current.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            bills: group.bills.filter(bill => bill.id !== billId)
          };
        }
        return group;
      })
    );
  };

  const addMember = (groupId, newMember) => {
    setGroups(current =>
      current.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            members: [...group.members, newMember]
          };
        }
        return group;
      })
    );
  };

  const removeMember = (groupId, memberToRemove) => {
    setGroups(current =>
      current.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            members: group.members.filter(member => member !== memberToRemove)
          };
        }
        return group;
      })
    );
  };

  return {
    groups,
    addGroup,
    updateGroup,
    deleteGroup,
    addBill,
    updateBill,
    deleteBill,
    addMember,
    removeMember
  };
};
