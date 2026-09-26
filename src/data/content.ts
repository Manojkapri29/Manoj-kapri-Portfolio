/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  ALL SITE CONTENT LIVES HERE.
 *  Edit text in this file only — components read everything from it.
 *
 *  Placeholders:
 *   - Anything wrapped like {{ADD_METRIC: ...}} is shown on the page as a
 *     visible placeholder until you replace it with a real number.
 *   - Project links like {{GITHUB_URL_PROJECT_1}} are HIDDEN on the page
 *     until you replace them with a real URL.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const site = {
  url: 'https://manoj-kapri-portfolio.vercel.app',
  fileName: 'Manoj_Kapri.xlsx',
  title: 'Manoj Kapri — Data Analyst | MIS Executive',
  footer: '© 2026 Manoj Kapri — Sheet1 saved · Data Analyst, Delhi NCR',
};

export const profile = {
  name: 'Manoj Kapri',
  title: 'Data Analyst / MIS Executive',
  titleParts: ['Data Analyst', 'MIS Executive', 'Delhi NCR'],
  location: 'Noida / Gurugram, IN',
  status: 'Open to Data Analyst / MIS roles — Delhi NCR',
  email: 'kaprimanoj88@gmail.com',
  phone: '+91-8954425885',
  phoneHref: 'tel:+918954425885',
  linkedin: 'https://linkedin.com/in/manoj-kapri-066345175',
  github: 'https://github.com/manojkapri29',
  resume: '/Manoj_Kapri_Resume.pdf',
  about:
    'MIS and Data Analyst with 3+ years of experience preparing reports and dashboards for management. At The LaLiT Suri Hospitality Group, prepared weekly and monthly MIS for 12 properties. At M3M India, handled sales and lead MIS in Advanced Excel and automated repeated reports. At AECOM, analyzed traffic survey data using SQL. MBA in Data Science & Analytics (Manipal University Jaipur, CGPA 8.27).',
};

/** Sheet sections: id, Name Box cell, fx formula, tab label. Order = page order. */
export const sections = [
  { id: 'about', cell: 'A1', formula: '=ABOUT()', label: 'About' },
  { id: 'skills', cell: 'B2', formula: '=SKILLS()', label: 'Skills' },
  { id: 'experience', cell: 'C2', formula: '=EXPERIENCE()', label: 'Experience' },
  { id: 'projects', cell: 'D2', formula: '=PROJECTS()', label: 'Projects' },
  { id: 'education', cell: 'E2', formula: '=EDUCATION()', label: 'Education' },
  { id: 'contact', cell: 'F2', formula: '=CONNECT()', label: 'Contact' },
] as const;

export type SectionId = (typeof sections)[number]['id'];

/** Cell-range labels shown next to each section heading. */
export const ranges = {
  skills: 'B2:B5',
  experience: 'C2:C18',
  projects: 'D2:D3',
  education: 'E2:E6',
};

export const kpis = [
  { value: 3, decimals: 0, suffix: '+', label: 'Years Experience', cell: 'A3' },
  { value: 12, decimals: 0, suffix: '', label: 'Properties Reported', cell: 'B3' },
  { value: 8.27, decimals: 2, suffix: '', label: 'MBA CGPA', cell: 'C3' },
  { value: 4, decimals: 0, suffix: '', label: 'Organisations', cell: 'D3' },
];

export const skills = [
  {
    category: 'Data Analysis',
    items: ['SQL (Joins, Subqueries, CTEs)', 'MySQL', 'Python (Pandas, NumPy)', 'Data Cleaning', 'EDA'],
  },
  {
    category: 'Excel & Reporting',
    items: [
      'Advanced Excel (VLOOKUP, VLOOKUP + MATCH, INDEX-MATCH, XLOOKUP, SUMIF, SUMIFS, IF, IFS)',
      'Pivot Tables',
      'Macros',
      'Power Query',
      'Google Sheets',
      'MIS Reports',
      'KPI Tracking',
    ],
  },
  {
    category: 'Visualization',
    items: ['Power BI', 'Excel Dashboards', 'PowerPoint'],
  },
  {
    category: 'Machine Learning',
    items: ['Scikit-learn', 'Forecasting', 'Streamlit'],
  },
];

/**
 * Mini formula sheet in the Skills section. Clicking a cell shows the snippet.
 * These are illustrative examples of techniques, not results.
 */
export const formulaCells = [
  {
    cell: 'A1',
    label: 'XLOOKUP',
    lang: 'Excel',
    code: '=XLOOKUP([@PropertyID], Master[PropertyID], Master[Region], "Not found")',
  },
  {
    cell: 'B1',
    label: 'SUMIFS',
    lang: 'Excel',
    code: '=SUMIFS(Sales[Amount], Sales[Month], $B$1, Sales[Project], [@Project])',
  },
  {
    cell: 'C1',
    label: 'INDEX-MATCH',
    lang: 'Excel',
    code: '=INDEX(Scores[GSI], MATCH([@Property], Scores[Property], 0))',
  },
  {
    cell: 'A2',
    label: 'SQL CTE',
    lang: 'SQL',
    code: `WITH trips AS (
  SELECT origin, destination, COUNT(*) AS n
  FROM od_survey
  GROUP BY origin, destination
)
SELECT * FROM trips
ORDER BY n DESC
LIMIT 10;`,
  },
  {
    cell: 'B2',
    label: 'Pandas groupby',
    lang: 'Python',
    code: `(df.groupby(["property", "month"])["score"]
   .mean()
   .unstack("month")
   .round(1))`,
  },
  {
    cell: 'C2',
    label: 'Pivot Table',
    lang: 'Excel',
    code: 'Rows: Property  ·  Columns: Month  ·  Values: Count of Complaints',
  },
];

export const experience = [
  {
    role: 'MIS Executive',
    org: 'The LaLiT Suri Hospitality Group (Bharat Hotels Ltd.)',
    period: 'Feb 2026 – Jul 2026',
    note: 'Corporate L&D and MIS · 12 properties across India',
    points: [
      'Prepared weekly and monthly MIS reports and dashboards for 12 properties for corporate management.',
      'Prepared the weekly Guest Satisfaction Index (GSI) report with property-wise comparison.',
      'Maintained training (L&D) data and reports in Excel to track training completion across properties.',
      'Analyzed guest complaint data to find common issues and presented findings in Excel and PowerPoint.',
      'Prepared monthly guest feedback, staff feedback, quality audit and mystery call audit reports.',
      'Collected data from different properties, cleaned it and kept it in a standard format for reporting.',
    ],
  },
  {
    role: 'Data Analyst',
    org: 'AECOM India Pvt. Ltd., Gurugram',
    period: 'Aug 2025 – Feb 2026',
    points: [
      'Worked on traffic survey (Origin-Destination) data using SQL and Excel to find travel patterns and busy routes.',
      'Prepared dashboards and reports to share data trends with the project team.',
    ],
  },
  {
    role: 'MIS Executive',
    org: 'M3M India Pvt. Ltd., Gurugram',
    period: 'Feb 2023 – Jun 2025',
    points: [
      'Prepared daily, weekly and monthly sales and lead MIS reports in Excel using Pivot Tables, lookups and Macros.',
      'Automated repeated reports to save manual effort and reduce errors.',
      'Maintained KPI dashboards for management and checked data accuracy across sources.',
    ],
  },
  {
    role: 'Data Science Intern',
    org: 'NextHikes IT Solutions (Part-time, Remote)',
    period: 'Sep 2024 – Jun 2025',
    points: [
      'Worked on price prediction and sales forecasting projects in Python (Pandas, Scikit-learn).',
      'Performed data cleaning and EDA, and created simple web apps for the models using Streamlit.',
    ],
  },
];

export type Project = {
  name: string;
  tags: string[];
  description: string;
  tools: string[];
  metrics: { label: string; value: string }[];
  github: string;
  demo: string;
};

export const projects: Project[] = [
  {
    name: 'Rossmann Pharmaceuticals Sales Forecasting',
    tags: ['Forecasting', 'Python'],
    description: 'Analyzed store sales data and built a model in Python to forecast future sales.',
    tools: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Scikit-learn'],
    metrics: [
      { label: 'Stores analyzed', value: '{{ADD_METRIC: number of stores}}' },
      { label: 'Forecast error', value: '{{ADD_METRIC: MAPE / RMSE}}' },
      { label: 'Forecast horizon', value: '{{ADD_METRIC: weeks ahead}}' },
    ],
    github: '{{GITHUB_URL_PROJECT_1}}',
    demo: '{{DEMO_URL_PROJECT_1}}',
  },
  {
    name: 'Retail Sales Forecasting',
    tags: ['Forecasting', 'Retail'],
    description: 'Built a forecasting model for multiple stores and compared forecast with actual sales.',
    tools: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Scikit-learn'],
    metrics: [
      { label: 'Stores covered', value: '{{ADD_METRIC: number of stores}}' },
      { label: 'Forecast error', value: '{{ADD_METRIC: MAPE / RMSE}}' },
      { label: 'Data period', value: '{{ADD_METRIC: months of history}}' },
    ],
    github: '{{GITHUB_URL_PROJECT_2}}',
    demo: '{{DEMO_URL_PROJECT_2}}',
  },
  // ── Template: copy this block to add a project ─────────────────────────────
  // {
  //   name: 'Project name',
  //   tags: ['Tag 1', 'Tag 2'],
  //   description: 'One or two sentences about the project.',
  //   tools: ['Python', 'SQL'],
  //   metrics: [
  //     { label: 'Metric 1', value: '{{ADD_METRIC: ...}}' },
  //     { label: 'Metric 2', value: '{{ADD_METRIC: ...}}' },
  //     { label: 'Metric 3', value: '{{ADD_METRIC: ...}}' },
  //   ],
  //   github: '{{GITHUB_URL_PROJECT_3}}',
  //   demo: '{{DEMO_URL_PROJECT_3}}',
  // },
];

export const education = [
  {
    degree: 'MBA — Data Science & Analytics',
    school: 'Manipal University Jaipur',
    period: '2023–2025',
    score: 'CGPA 8.27',
  },
  {
    degree: 'PG Program — Data Science & AI',
    school: 'Digicrome Academy',
    period: '2024–2025',
  },
  {
    degree: 'BBA',
    school: 'Khandelwal College of Management and Technology',
    period: '2014–2017',
  },
];

export const certifications = [
  'IBM Data Science Program — IIM Bombay & IBM',
  'IBM Machine Learning',
  'Data Analysis Certification — Unified Mentor',
];

export const contact = {
  heading: `=CONNECT("Let's build something with data")`,
  line: 'Open to Data Analyst / MIS roles across Delhi NCR.',
};

/** True while a value is still an unfilled {{PLACEHOLDER}}. */
export const isPlaceholder = (v: string) => /\{\{.*\}\}/.test(v);

/**
 * 3D Data City landmark towers (desktop only).
 * Heights use only real facts from this file:
 *  - skills: number of tools in each category
 *  - experience: months in each role (from the periods above)
 */
export const cityLandmarks = {
  skills: skills.map((s) => ({ label: s.category, sub: `${s.items.length} tools`, height: 2 + s.items.length * 1.1 })),
  experience: [
    { label: 'C2 · The LaLiT', sub: '6 months', height: 2 + 6 * 0.32 },
    { label: 'C6 · AECOM', sub: '7 months', height: 2 + 7 * 0.32 },
    { label: 'C10 · M3M India', sub: '29 months', height: 2 + 29 * 0.32 },
    { label: 'C14 · NextHikes', sub: '10 months', height: 2 + 10 * 0.32 },
  ],
  projects: projects.map((p, i) => ({ label: `D${i + 2} · ${p.name.split(' ').slice(0, 2).join(' ')}`, sub: p.tags.join(' · '), height: 5 + i * 1.5 })),
  education: education.map((e, i) => ({ label: e.degree.split(' — ')[0], sub: e.period, height: 6 - i * 1.4 })),
};

/**
 * PERSONAL INTRODUCTION — told as a comic: "The Data Innings".
 * `body` is Manoj's own introduction, word for word. Cricket headings, the
 * sound effects (`sfx`) and scenes are just the storytelling layer — edit freely.
 * `scene` picks the artwork: cover | stadium | scoreboard | wagonwheel | grounds | decision | nets | finale
 */
export const intro = [
  {
    cell: 'A1',
    scene: 'cover',
    kicker: 'Issue #1 · Delhi NCR',
    title: 'The Data Innings',
    bubble: "Hi, I'm Manoj Kapri.",
    body: "I have close to three years of experience across MIS reporting and data analysis, and I'm someone who genuinely enjoys working with data — whether it's cleaning it, analyzing it, or turning it into insights that drive real decisions.",
    sfx: '',
  },
  {
    cell: 'A2',
    scene: 'stadium',
    kicker: 'The prologue',
    title: 'Before the spreadsheets…',
    // Manoj's cricket background — add detail here (team, level, years) if you like.
    body: 'Before the spreadsheets, I was a professional cricketer.',
    sfx: 'CRACK!',
  },
  {
    cell: 'A3',
    scene: 'scoreboard',
    kicker: 'Innings 1 · M3M India · MIS Executive',
    title: 'Opening the batting',
    body: 'I started my career at M3M India as an MIS Executive, where I spent about two and a half years in the real estate sector managing large-scale reporting and dashboards.',
    sfx: 'ON STRIKE!',
  },
  {
    cell: 'A4',
    scene: 'wagonwheel',
    kicker: 'Innings 2 · AECOM India · Data Analyst',
    title: 'New ground',
    body: 'From there, I moved to AECOM India as a Data Analyst, which strengthened my core analytical and reporting skills.',
    sfx: 'SWITCH HIT!',
  },
  {
    cell: 'A5',
    scene: 'grounds',
    kicker: 'Innings 3 · The LaLiT Suri Hospitality Group',
    title: '12 grounds, one scorecard',
    body: 'Most recently, I worked as an MIS Executive at The Bharat Hotels Limited (The LaLiT Suri Hospitality Group), handling dashboards and reporting across 12+ properties pan-India within a Corporate L&D and MIS function.',
    sfx: 'HOWZAT!',
  },
  {
    cell: 'A6',
    scene: 'decision',
    kicker: 'The review',
    title: 'Choosing my format',
    body: "I moved on from that role because I wanted to focus more deeply on hands-on data analysis rather than L&D-related reporting, and I'm now looking to build a career fully centered around data.",
    sfx: 'DRS: DATA!',
  },
  {
    cell: 'A7',
    scene: 'nets',
    kicker: 'Nets practice · Digicrome · Manipal University Jaipur',
    title: 'Practice makes the player',
    body: 'Alongside my work experience, I did an online Data Science internship with Digicrome, which gave me practical exposure to Python, EDA, and machine learning. I also completed my MBA in Data Science and Analytics from Manipal University Jaipur with an 8.27 CGPA, which strengthened my foundation in Advanced Excel, Python, SQL, and Power BI.',
    sfx: '8.27!',
  },
  {
    cell: 'A8',
    scene: 'finale',
    kicker: 'What I bring',
    title: 'Ready for the next match',
    body: "What I bring is a mix of real business reporting experience and formal data science training, along with a genuine interest in solving problems through data — and I'm looking forward to applying that here.",
    sfx: 'GAME ON!',
  },
] as const;
