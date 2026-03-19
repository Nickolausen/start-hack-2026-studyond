import type { RoadmapData } from "@/lib/types";

/**
 * Sample decision roadmap: a thesis journey.
 *
 * The tree represents the full decision space. The viewer displays
 * only the parent path leading to the current node + its future branches.
 *
 * Stages follow the Studyond thesis journey model:
 *   1. Orientation
 *   2. Topic & Supervisor Search
 *   3. Planning
 *   4. Execution
 *   5. Writing & Finalization
 */
export const thesisRoadmap: RoadmapData = {
  title: "Thesis Journey",
  subtitle:
    "Your decision roadmap from first idea to final submission.",
  root: {
    id: "start",
    label: "Start Your Thesis",
    description: "Begin your thesis journey. Where are you right now?",
    status: "completed",
    icon: "Compass",
    children: [
      {
        id: "orientation",
        label: "Orientation",
        description:
          "Discover what you want to write about. Explore fields, industries, and research areas.",
        status: "completed",
        icon: "Search",
        children: [
          {
            id: "topic-search",
            label: "Topic & Supervisor Search",
            description:
              "Lock in a topic, find the right supervisor, and optionally connect with a company partner.",
            status: "current",
            icon: "Target",
            children: [
              {
                id: "company-topic",
                label: "Company-Sponsored Topic",
                description:
                  "Work on a real-world challenge provided by a company. Includes industry access and potential employment.",
                status: "upcoming",
                icon: "Building2",
                children: [
                  {
                    id: "plan-company",
                    label: "Planning with Company",
                    description:
                      "Co-create the research plan with your company partner and supervisor.",
                    status: "upcoming",
                    icon: "ClipboardList",
                    children: [
                      {
                        id: "exec-company",
                        label: "Execution",
                        description:
                          "Conduct research with company data access and expert interviews.",
                        status: "upcoming",
                        icon: "FlaskConical",
                        children: [
                          {
                            id: "write-company",
                            label: "Writing & Submission",
                            description:
                              "Finalize your thesis and submit. Your company partner reviews practical relevance.",
                            status: "upcoming",
                            icon: "FileText",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                id: "academic-topic",
                label: "Academic Research Topic",
                description:
                  "Pursue a supervisor-proposed or self-directed research question within academia.",
                status: "upcoming",
                icon: "GraduationCap",
                children: [
                  {
                    id: "plan-academic",
                    label: "Research Planning",
                    description:
                      "Structure your methodology, define milestones, and plan your timeline.",
                    status: "upcoming",
                    icon: "ClipboardList",
                    children: [
                      {
                        id: "exec-academic",
                        label: "Research Execution",
                        description:
                          "Gather data, run experiments, iterate on findings.",
                        status: "upcoming",
                        icon: "FlaskConical",
                        children: [
                          {
                            id: "write-academic",
                            label: "Writing & Submission",
                            description:
                              "Produce and submit your thesis document.",
                            status: "upcoming",
                            icon: "FileText",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                id: "own-topic",
                label: "Define Your Own Topic",
                description:
                  "Formulate your own research question. Requires finding a supervisor who aligns with your idea.",
                status: "upcoming",
                icon: "Lightbulb",
                children: [
                  {
                    id: "find-supervisor",
                    label: "Find a Supervisor",
                    description:
                      "Identify and approach a professor whose expertise matches your topic.",
                    status: "upcoming",
                    icon: "Users",
                    children: [
                      {
                        id: "plan-own",
                        label: "Co-Create Research Plan",
                        description:
                          "Work with your supervisor to refine scope, methodology, and timeline.",
                        status: "upcoming",
                        icon: "ClipboardList",
                        children: [
                          {
                            id: "exec-own",
                            label: "Independent Execution",
                            description:
                              "Conduct research independently, seeking interview partners and data sources.",
                            status: "upcoming",
                            icon: "FlaskConical",
                            children: [
                              {
                                id: "write-own",
                                label: "Writing & Submission",
                                description:
                                  "Complete and submit your thesis.",
                                status: "upcoming",
                                icon: "FileText",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};
