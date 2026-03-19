import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { StudentProfile } from '@/types';

interface ProfileEditorProps {
  profile: StudentProfile;
  onChange: (data: Partial<StudentProfile>) => void;
}

function TagInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
    if (e.key === 'Backspace' && !input && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => onChange(values.filter((v) => v !== tag));

  return (
    <div className="space-y-2">
      <label className="ds-label text-foreground">{label}</label>
      <div className="flex flex-wrap gap-1.5 p-2.5 min-h-[44px] border border-input rounded-lg bg-background focus-within:ring-1 focus-within:ring-ring">
        {values.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-destructive transition-colors"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={values.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <p className="ds-caption text-muted-foreground">Press Enter or comma to add</p>
    </div>
  );
}

export function ProfileEditor({ profile, onChange }: ProfileEditorProps) {
  return (
    <div className="space-y-5">
      {/* Name row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="ds-label text-foreground">First Name</label>
          <Input
            value={profile.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
            className="rounded-lg text-foreground"
          />
        </div>
        <div className="space-y-1.5">
          <label className="ds-label text-foreground">Last Name</label>
          <Input
            value={profile.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
            className="rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* University + Program */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="ds-label text-foreground">University</label>
          <Input
            value={profile.university}
            onChange={(e) => onChange({ university: e.target.value })}
            className="rounded-lg text-foreground"
          />
        </div>
        <div className="space-y-1.5">
          <label className="ds-label text-foreground">Study Program</label>
          <Input
            value={profile.studyProgram}
            onChange={(e) => onChange({ studyProgram: e.target.value })}
            className="rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* About */}
      <div className="space-y-1.5">
          <label className="ds-label text-foreground">About</label>
        <Textarea
          value={profile.about}
          onChange={(e) => onChange({ about: e.target.value })}
          placeholder="Tell us about yourself, your research interests, and what you're looking for..."
          className="rounded-lg min-h-[100px] resize-none text-foreground"
        />
      </div>

      {/* Skills */}
      <TagInput
        label="Skills"
        values={profile.skills}
        onChange={(skills) => onChange({ skills })}
        placeholder="Python, Machine Learning, React..."
      />

      {/* Interests */}
      <TagInput
        label="Research Interests"
        values={profile.interests}
        onChange={(interests) => onChange({ interests })}
        placeholder="AI Ethics, Sustainability, Fintech..."
      />
    </div>
  );
}
