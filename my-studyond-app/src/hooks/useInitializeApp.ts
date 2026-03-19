import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { fetchStudent, fetchThreads } from '@/api';

const DEMO_STUDENT_ID = 'student-01';

/**
 * On app mount: fetch the student profile + threads from MongoDB and hydrate
 * the Zustand store. The DB is the authoritative source of truth.
 * Falls back silently to localStorage state if the API is unavailable.
 */
export function useInitializeApp() {
  const { hydrateFromDB, profile } = useAppStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function init() {
      try {
        const [student, threads] = await Promise.all([
          fetchStudent(DEMO_STUDENT_ID),
          fetchThreads(DEMO_STUDENT_ID),
        ]);

        // Build the profile shape — display-only fields (university, studyProgram)
        // are kept from the existing store since they're not in the DB schema directly.
        hydrateFromDB({
          profile: {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            degree: student.degree as 'bsc' | 'msc' | 'phd',
            university: profile.university,       // display-only, from localStorage
            studyProgram: profile.studyProgram,   // display-only, from localStorage
            studyProgramId: student.studyProgramId,
            universityId: student.universityId,
            skills: student.skills,
            interests: student.interests.length > 0 ? student.interests : profile.interests,
            about: student.about ?? profile.about,
            objectives: student.objectives,
          },
          profileTags: student.aiTags.length > 0 ? student.aiTags : undefined,
          // hydrateFromDB handles Date conversions, pass raw API data
          savedThreads: threads as Parameters<typeof hydrateFromDB>[0]['savedThreads'],
          roadmapSteps: student.roadmapSteps as Parameters<typeof hydrateFromDB>[0]['roadmapSteps'],
        });

        console.log(
          `[App] Hydrated from MongoDB — ${threads.length} thread(s), ` +
          `${student.roadmapSteps.filter((s) => s.status === 'committed').length} step(s) committed`
        );
      } catch (err) {
        console.warn('[App] Could not reach API, using localStorage state:', err);
      }
    }

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
