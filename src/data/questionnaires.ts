
export interface Option {
  value: number;
  label: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'scale' | 'boolean' | 'text';
  options?: Option[];
}

export interface Questionnaire {
  id: string; // Must match DB 'type' check constraint
  title: string;
  category: 'Depression' | 'Mania' | 'Bipolarity' | 'OCD' | 'Autism' | 'Anxiety' | 'QoL' | 'Satisfaction' | 'Functioning' | 'AdverseEffects';
  citation?: string;
  questions: Question[];
  calculateScore?: (answers: Record<string, any>) => number;
  interpretation?: (score: number) => string;
}

export const PHQ9_OPTIONS: Option[] = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
];

export const questionnaires: Questionnaire[] = [
  {
    id: 'PHQ9',
    title: 'PHQ-9 (Depression)',
    category: 'Depression',
    citation: 'Kroenke K, et al. (2001)',
    questions: [
      { id: 'q1', text: 'Little interest or pleasure in doing things', type: 'scale', options: PHQ9_OPTIONS },
      { id: 'q2', text: 'Feeling down, depressed, or hopeless', type: 'scale', options: PHQ9_OPTIONS },
      { id: 'q3', text: 'Trouble falling or staying asleep, or sleeping too much', type: 'scale', options: PHQ9_OPTIONS },
      { id: 'q4', text: 'Feeling tired or having little energy', type: 'scale', options: PHQ9_OPTIONS },
      { id: 'q5', text: 'Poor appetite or overeating', type: 'scale', options: PHQ9_OPTIONS },
      { id: 'q6', text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down', type: 'scale', options: PHQ9_OPTIONS },
      { id: 'q7', text: 'Trouble concentrating on things, such as reading the newspaper or watching television', type: 'scale', options: PHQ9_OPTIONS },
      { id: 'q8', text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual', type: 'scale', options: PHQ9_OPTIONS },
      { id: 'q9', text: 'Thoughts that you would be better off dead or of hurting yourself in some way', type: 'scale', options: PHQ9_OPTIONS },
    ],
    calculateScore: (answers) => {
      let total = 0;
      for (let i = 1; i <= 9; i++) {
        total += (answers[`q${i}`] as number) || 0;
      }
      return total;
    },
    interpretation: (score) => {
      if (score <= 4) return 'None-minimal';
      if (score <= 9) return 'Mild';
      if (score <= 14) return 'Moderate';
      if (score <= 19) return 'Moderately Severe';
      return 'Severe';
    }
  },
  {
    id: 'GAD7',
    title: 'GAD-7 (Anxiety)',
    category: 'Anxiety',
    questions: [
      { id: 'q1', text: 'Feeling nervous, anxious, or on edge', type: 'scale', options: PHQ9_OPTIONS },
      { id: 'q2', text: 'Not being able to stop or control worrying', type: 'scale', options: PHQ9_OPTIONS },
      { id: 'q3', text: 'Worrying too much about different things', type: 'scale', options: PHQ9_OPTIONS },
      { id: 'q4', text: 'Trouble relaxing', type: 'scale', options: PHQ9_OPTIONS },
      { id: 'q5', text: 'Being so restless that it is hard to sit still', type: 'scale', options: PHQ9_OPTIONS },
      { id: 'q6', text: 'Becoming easily annoyed or irritable', type: 'scale', options: PHQ9_OPTIONS },
      { id: 'q7', text: 'Feeling afraid, as if something awful might happen', type: 'scale', options: PHQ9_OPTIONS },
    ],
    calculateScore: (answers) => Object.values(answers).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0)
  },
  {
    id: 'YMRS',
    title: 'Young Mania Rating Scale (YMRS)',
    category: 'Mania',
    citation: 'Young RC, et al. (1978)',
    questions: [
      { id: 'q1', text: 'Elevated Mood', type: 'scale', options: [{ value: 0, label: 'Absent' }, { value: 1, label: 'Mildly or possibly increased' }, { value: 2, label: 'Definite subjective elevation; optimistic, self-confident; cheerful; appropriate to content' }, { value: 3, label: 'Elevated, inappropriate to content; humorous' }, { value: 4, label: 'Euphoric; inappropriate laughter; singing' }] },
      { id: 'q2', text: 'Increased Motor Activity-Energy', type: 'scale', options: [{ value: 0, label: 'Absent' }, { value: 1, label: 'Subjectively increased' }, { value: 2, label: 'Animated; gestures increased' }, { value: 3, label: 'Excessive energy; hyperactive at times; restless' }, { value: 4, label: 'Motor excitement; continuous hyperactivity' }] },
      { id: 'q3', text: 'Sexual Interest', type: 'scale', options: [{ value: 0, label: 'Normal; not increased' }, { value: 1, label: 'Mildly or possibly increased' }, { value: 2, label: 'Definite subjective increase on questioning' }, { value: 3, label: 'Spontaneous sexual content; elaborates on sexual matters; hypersexual by self-report' }, { value: 4, label: 'Overt sexual acts (toward patients, staff, or interviewer)' }] },
      { id: 'q4', text: 'Sleep', type: 'scale', options: [{ value: 0, label: 'Reports no decrease in sleep' }, { value: 1, label: 'Sleeping less than normal amount by up to one hour' }, { value: 2, label: 'Sleeping less than normal by more than one hour' }, { value: 3, label: 'Reports decreased need for sleep' }, { value: 4, label: 'Denies need for sleep' }] },
      { id: 'q5', text: 'Irritability', type: 'scale', options: [{ value: 0, label: 'Absent' }, { value: 2, label: 'Subjectively increased' }, { value: 4, label: 'Irritable at times during interview; recent episodes of anger or annoyance on ward' }, { value: 6, label: 'Frequently irritable during interview; short, curt' }, { value: 8, label: 'Hostile, uncooperative; interview impossible' }] },
    ],
    calculateScore: (answers) => Object.values(answers).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0)
  },
  {
    id: 'ASRM',
    title: 'Altman Self-Rating Mania Scale (ASRM)',
    category: 'Mania',
    citation: 'Altman EG, et al. (1997)',
    questions: [
      {
        id: 'q1', text: 'Mood / Happiness', type: 'scale', options: [
          { value: 0, label: 'I do not feel happier or more cheerful than usual.' },
          { value: 1, label: 'I feel happier or more cheerful than usual.' },
          { value: 2, label: 'I feel extremely happy / elated.' },
          { value: 3, label: 'I am planning many things / I have many ideas.' },
          { value: 4, label: 'I feel on top of the world.' }
        ]
      },
      {
        id: 'q2', text: 'Self-Confidence', type: 'scale', options: [
          { value: 0, label: 'I do not feel more self-confident than usual.' },
          { value: 1, label: 'I feel more self-confident than usual.' },
          { value: 2, label: 'I feel extremely self-confident.' },
          { value: 3, label: 'I feel I have special powers or abilities.' },
          { value: 4, label: 'I feel I can do anything.' }
        ]
      },
    ],
    calculateScore: (answers) => Object.values(answers).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0)
  }
];
