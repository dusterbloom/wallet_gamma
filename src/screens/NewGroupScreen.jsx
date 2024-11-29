import React, { useState } from 'react';
import { Header } from '../components/Screen.jsx';

export const NewGroupScreen = ({ onBack, onComplete }) => {
  const [step, setStep] = useState('name'); // name, members, photo
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState([{ name: 'You', email: '' }]);
  const [newMember, setNewMember] = useState({ name: '', email: '' });

  const handleNext = () => {
    if (step === 'name') {
      setStep('members');
    } else if (step === 'members') {
      setStep('photo');
    } else {
      onComplete({
        id: Date.now().toString(),
        name: groupName,
        members: members.map(m => m.name),
        bills: []
      });
    }
  };

  const handleBack = () => {
    if (step === 'members') {
      setStep('name');
    } else if (step === 'photo') {
      setStep('members');
    } else {
      onBack();
    }
  };

  const addMember = () => {
    if (newMember.name.trim()) {
      setMembers([...members, { ...newMember }]);
      setNewMember({ name: '', email: '' });
    }
  };

  const removeMember = (index) => {
    if (index === 0) return; // Can't remove "You"
    setMembers(members.filter((_, i) => i !== index));
  };

  return (
    <div className="h-full flex flex-col bg-black">
      <Header 
        title="New Group"
        onBack={handleBack}
      />
      
      <div className="flex-1 p-4">
        {step === 'name' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-2xl font-medium mb-2">Name your group</div>
              <p className="text-zinc-500">Give it a name that everyone will recognize</p>
            </div>

            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
              className="w-full bg-zinc-900 rounded-xl p-4 text-white placeholder-zinc-500
                       outline-none text-center text-xl"
              autoFocus
            />

            {groupName.trim() && (
              <div className="flex justify-center">
                <button
                  onClick={handleNext}
                  className="h-14 px-8 bg-[#FF9500] rounded-full flex items-center gap-3
                           text-black font-medium
                           transition-all duration-300 hover:bg-[#FF9500]/90
                           active:scale-95"
                >
                  <span className="text-lg">Next</span>
                  <span className="text-xl">→</span>
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'members' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-2xl font-medium mb-2">Add group members</div>
              <p className="text-zinc-500">Who's in this group?</p>
            </div>

            <div className="space-y-3 mb-6">
              {members.map((member, index) => (
                <div key={index} className="flex items-center justify-between bg-zinc-900 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FF9500] flex items-center justify-center">
                      {member.name[0]}
                    </div>
                    <span>{member.name}</span>
                  </div>
                  {index !== 0 && (
                    <button
                      onClick={() => removeMember(index)}
                      className="text-zinc-500 hover:text-white"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="Name"
                className="w-full bg-zinc-900 rounded-xl p-4 text-white placeholder-zinc-500
                         outline-none"
              />
              <input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                placeholder="Email (optional)"
                className="w-full bg-zinc-900 rounded-xl p-4 text-white placeholder-zinc-500
                         outline-none"
              />
              <button
                onClick={addMember}
                disabled={!newMember.name.trim()}
                className="w-full p-4 bg-zinc-900 rounded-xl text-white
                         transition-all duration-200 hover:bg-zinc-800 
                         active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Member
              </button>
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={handleNext}
                className="h-14 px-8 bg-[#FF9500] rounded-full flex items-center gap-3
                         text-black font-medium
                         transition-all duration-300 hover:bg-[#FF9500]/90
                         active:scale-95"
              >
                <span className="text-lg">Next</span>
                <span className="text-xl">→</span>
              </button>
            </div>
          </div>
        )}

        {step === 'photo' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-2xl font-medium mb-2">Add a group photo</div>
              <p className="text-zinc-500">Optional but recommended</p>
            </div>

            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 rounded-full bg-zinc-900 flex items-center justify-center">
                {groupName[0]}
              </div>
            </div>

            <div className="flex gap-3 mb-8">
              <button
                className="flex-1 py-4 bg-zinc-900 rounded-xl text-white
                         transition-all duration-200 hover:bg-zinc-800 
                         active:scale-98 flex items-center justify-center gap-2"
              >
                <span className="text-xl">📷</span>
                Take Photo
              </button>
              <button
                className="flex-1 py-4 bg-zinc-900 rounded-xl text-white
                         transition-all duration-200 hover:bg-zinc-800 
                         active:scale-98 flex items-center justify-center gap-2"
              >
                <span className="text-xl">🖼️</span>
                Choose Photo
              </button>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleNext}
                className="h-14 px-8 bg-[#FF9500] rounded-full flex items-center gap-3
                         text-black font-medium
                         transition-all duration-300 hover:bg-[#FF9500]/90
                         active:scale-95"
              >
                <span className="text-lg">Create Group</span>
                <span className="text-xl">→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
