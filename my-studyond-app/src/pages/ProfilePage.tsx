import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Sparkles, GraduationCap, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ProfileEditor } from '@/components/profile/ProfileEditor';
import { TagBadges } from '@/components/profile/TagBadges';
import { useAppStore } from '@/store/useAppStore';
import type { StudentProfile } from '@/types';

async function extractTagsFromProfile(profile: StudentProfile): Promise<string[]> {
  try {
    const response = await fetch('/api/extract-tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile }),
    });
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    return data.tags ?? [];
  } catch {
    // Fallback: combine skills + interests as tags
    return [...profile.skills, ...profile.interests].slice(0, 12);
  }
}

export function ProfilePage() {
  const { profile, profileTags, updateProfile, setProfileTags } = useAppStore();
  const [localProfile, setLocalProfile] = useState<StudentProfile>(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [isTagLoading, setIsTagLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (data: Partial<StudentProfile>) => {
    setLocalProfile((prev) => ({ ...prev, ...data }));
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setIsTagLoading(true);

    // Update global store immediately
    updateProfile(localProfile);

    // Extract AI tags
    const tags = await extractTagsFromProfile(localProfile);
    setProfileTags(tags);

    setIsSaving(false);
    setIsTagLoading(false);
    setSaved(true);
  };

  const degreeLabel: Record<string, string> = {
    bsc: 'BSc',
    msc: 'MSc',
    phd: 'PhD',
  };

  return (
    <div className="h-full overflow-y-auto page-enter">
      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-8 space-y-8">

        {/* Header */}
        <div className="flex items-start gap-4">
          <Avatar className="size-16 bg-primary text-primary-foreground flex-shrink-0">
            <AvatarFallback className="text-xl font-semibold bg-primary text-primary-foreground">
              {localProfile.firstName[0]}{localProfile.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="ds-title-md text-foreground">
              {localProfile.firstName} {localProfile.lastName}
            </h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="ds-small text-muted-foreground flex items-center gap-1.5">
                <GraduationCap className="size-3.5" />
                {degreeLabel[localProfile.degree]} · {localProfile.university}
              </span>
              <span className="ds-small text-muted-foreground flex items-center gap-1.5">
                <Mail className="size-3.5" />
                {localProfile.email}
              </span>
            </div>
          </div>
        </div>

        {/* AI Tags Section */}
        <section className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="size-4 text-ai-solid" />
            <span className="ds-label text-ai-solid">AI Profile Tags</span>
            <span className="ds-caption text-muted-foreground ml-auto">
              Used to personalize your matches
            </span>
          </div>
          <TagBadges tags={profileTags} isLoading={isTagLoading} />
        </section>

        {/* Edit Form */}
        <section>
          <h2 className="ds-title-sm mb-4 text-foreground">Edit Profile</h2>
          <ProfileEditor profile={localProfile} onChange={handleChange} />
        </section>

        {/* Save button */}
        <div className="flex items-center gap-3 pb-10">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-full gap-2 flex-1 sm:flex-none"
          >
            {isSaving ? (
              <>
                <Sparkles className="size-4 animate-pulse" />
                Saving & generating tags...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save & Generate Tags
              </>
            )}
          </Button>

          {saved && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="ds-small text-emerald-600 dark:text-emerald-400"
            >
              Profile saved
            </motion.span>
          )}
        </div>
      </div>
    </div>
  );
}
