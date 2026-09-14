export type Activity = {
  id: string;
  kind: 'presentation' | 'theory' | 'coding';
  title: string;
  body: string;
  starter?: string;
  slide?: { assetId: string; page: number; filename: string; text: string };
};
export type Project = {
  id: string;
  title: string;
  description: string;
  updatedAt: string;
  activities: Activity[];
};
export type Run = {
  id: string;
  project: Project;
  startedAt: string;
  endedAt: string;
  answers: Record<string, string>;
};
export type Store = {
  version: 1;
  projects: Project[];
  runs: Run[];
  drafts: Record<string, Record<string, string>>;
};
export const sample: Project = {
  id: 'linked-lists',
  title: 'Linked lists',
  description: 'Pointers, traversal and a little recursion.',
  updatedAt: '2026-09-14T00:00:00Z',
  activities: [
    {
      id: 'intro',
      kind: 'presentation',
      title: 'One node at a time.',
      body: 'A linked list is a sequence of nodes. Each node stores a value and a pointer to the next node.\n\nToday, we’ll trace a list, reason about the cost of traversal, and write a recursive function.',
    },
    {
      id: 'complexity',
      kind: 'theory',
      title: 'What does a traversal cost?',
      body: 'A singly linked list contains n nodes. We have a pointer to its head, but no stored length.\n\nWhat is the time complexity of finding the last node? Explain which operations your answer counts.',
    },
    {
      id: 'sum',
      kind: 'coding',
      title: 'Sum a linked list',
      body: 'Implement listSum to return the sum of all values in a linked list. Use recursion.\n\nAn empty list should return 0. You may assume the sum fits in an int. Do not modify the list.\n\nExample\n4 → 7 → 2 → NULL\nReturns 13',
      starter:
        '#include <stdio.h>\n\nstruct node {\n    int value;\n    struct node *next;\n};\n\nint listSum(struct node *list) {\n    return 0;\n}\n\nint main(void) {\n    struct node tail = {2, NULL};\n    struct node middle = {7, &tail};\n    struct node head = {4, &middle};\n    printf("%d\\n", listSum(&head));\n    return 0;\n}\n',
    },
  ],
};
export function initialStore(): Store {
  return { version: 1, projects: [sample], runs: [], drafts: {} };
}
export function readStore(raw: string | null): Store {
  if (!raw) return initialStore();
  const value = JSON.parse(raw);
  const activityValid = (a: Activity) =>
    a &&
    typeof a.id === 'string' &&
    ['presentation', 'theory', 'coding'].includes(a.kind) &&
    typeof a.title === 'string' &&
    typeof a.body === 'string' &&
    (a.starter === undefined || typeof a.starter === 'string') &&
    (a.slide === undefined ||
      (a.slide &&
        typeof a.slide.assetId === 'string' &&
        Number.isInteger(a.slide.page) &&
        a.slide.page > 0 &&
        typeof a.slide.filename === 'string' &&
        typeof a.slide.text === 'string'));
  const projectValid = (p: Project) =>
    p &&
    typeof p.id === 'string' &&
    typeof p.title === 'string' &&
    typeof p.description === 'string' &&
    typeof p.updatedAt === 'string' &&
    Array.isArray(p.activities) &&
    p.activities.every(activityValid);
  const answersValid = (a: Record<string, string>) =>
    a &&
    typeof a === 'object' &&
    !Array.isArray(a) &&
    Object.values(a).every((v) => typeof v === 'string');
  if (
    value.version !== 1 ||
    !Array.isArray(value.projects) ||
    !value.projects.every(projectValid) ||
    !Array.isArray(value.runs) ||
    !value.runs.every(
      (r: Run) =>
        r &&
        typeof r.id === 'string' &&
        typeof r.startedAt === 'string' &&
        typeof r.endedAt === 'string' &&
        projectValid(r.project) &&
        answersValid(r.answers),
    ) ||
    !value.drafts ||
    typeof value.drafts !== 'object' ||
    !Object.values(value.drafts).every((a) => answersValid(a as Record<string, string>))
  )
    throw new Error('Invalid saved data');
  return value;
}
