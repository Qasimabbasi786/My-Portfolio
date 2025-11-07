import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from './Button';

interface SkillsEditorProps {
  skills: string[];
  onSkillsUpdate: (skills: string[]) => void;
  isEditing: boolean;
}

export const SkillsEditor: React.FC<SkillsEditorProps> = ({
  skills,
  onSkillsUpdate,
  isEditing
}) => {
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      onSkillsUpdate([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onSkillsUpdate(skills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  if (!isEditing) {
    return (
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
          >
            {skill}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <div
            key={index}
            className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
          >
            <span>{skill}</span>
            <button
              onClick={() => removeSkill(skill)}
              className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a skill..."
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Button
          onClick={addSkill}
          disabled={!newSkill.trim()}
          className="px-3 py-2"
        >
          <Plus size={16} />
        </Button>
      </div>
    </div>
  );
};