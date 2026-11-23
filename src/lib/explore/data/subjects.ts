import type {
  CurriculumModule,
  LearningStage,
  SubjectDetail,
  SubjectSummary,
} from "../types";

/**
 * DEMONSTRATION DATA — all curricula are ILLUSTRATIVE, modelled on the general
 * structure of university units. They are not official university material and
 * imply no accreditation or institutional partnership.
 */

const ILLUSTRATIVE_INSTITUTION = "Illustrative reference — generic undergraduate unit structure";

/**
 * Compact module builder. Topic titles prefixed with "*" are adapted from an
 * external academic reference; all others are original EduMate content.
 */
function mod(
  subject: string,
  number: number,
  title: string,
  summary: string,
  weeks: string,
  topics: string[],
  refs: { lectures?: string[]; readings?: string[]; practicalId?: string } = {},
): CurriculumModule {
  return {
    id: `${subject}-m${number}`,
    number,
    title,
    summary,
    weeks,
    topics: topics.map((raw, i) => {
      const fromReference = raw.startsWith("*");
      return {
        id: `${subject}-m${number}-t${i + 1}`,
        title: fromReference ? raw.slice(1) : raw,
        source: fromReference ? "reference" : "edumate",
        durationMins: [10, 15, 20, 12][(number + i) % 4],
      };
    }),
    lectureRefs: refs.lectures ?? [],
    readings: refs.readings ?? [],
    practicalId: refs.practicalId,
  };
}

function stages(subject: string, items: [LearningStage["academy"], string, string, number][]): LearningStage[] {
  return items.map(([academy, title, summary, weeks], i) => ({
    id: `${subject}-s${i + 1}`,
    academy,
    title,
    summary,
    weeks,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Flagship subjects
// ─────────────────────────────────────────────────────────────────────────────

const robotics: SubjectDetail = {
  slug: "robotics-autonomous-systems",
  title: "Robotics & Autonomous Systems",
  tagline: "Design machines that sense, think and act.",
  description:
    "Discover how robots perceive the world, plan their movements and act safely alongside people — from factory arms to Mars rovers.",
  discipline: "Engineering",
  difficulty: "intermediate",
  motif: "robot",
  theme: { base: "#1e3a8a", accent: "#60a5fa", tint: "#dbeafe", ink: "#1e40af" },
  status: "available",
  tags: ["Mechatronics", "Control", "Sensors", "Programming"],
  featured: true,
  trending: true,
  emerging: true,
  beginnerFriendly: true,
  universityLevel: true,
  addedAt: "2026-10-28",
  estimatedHours: 64,
  learnersExploring: 4820,
  introduction:
    "Robotics brings together mechanical engineering, electronics and computer science to create machines that can sense their environment, make decisions and move with purpose. Autonomous systems take this further — operating without constant human control, from self-driving vehicles to warehouse robots and surgical assistants.",
  applications: [
    { title: "Manufacturing", description: "Precise, tireless robotic arms assemble cars, electronics and medical devices." },
    { title: "Healthcare", description: "Surgical robots, rehabilitation exoskeletons and hospital logistics." },
    { title: "Exploration", description: "Rovers, underwater drones and space robotics reach places humans cannot." },
    { title: "Agriculture", description: "Autonomous tractors and harvesting robots support food production." },
  ],
  whyItMatters: [
    "Robots are taking on dangerous, repetitive and precise work across every industry.",
    "Autonomous systems raise important questions about safety, ethics and the future of work.",
    "Robotics is one of the best ways to see mathematics, physics and coding working together.",
  ],
  outcomes: [
    "Explain how sensors, actuators and controllers form a robotic system.",
    "Describe robot motion using coordinates, vectors and transformations.",
    "Program simple control behaviours and test them in simulation.",
    "Plan and present a small autonomous robotics project.",
  ],
  foundationalKnowledge: ["Basic algebra and graphs", "Forces and motion", "Simple circuits", "Logical thinking"],
  prerequisites: [
    { title: "Forces & motion", why: "Robots move by applying forces and torques.", categorySlug: "science-discovery" },
    { title: "Introductory programming logic", why: "Control behaviours are written as programs.", categorySlug: "artificial-intelligence" },
    { title: "Making & manufacturing basics", why: "Understanding how mechanical parts are produced.", categorySlug: "manufacturing" },
  ],
  stages: stages("rob", [
    ["Foundation", "How robots work", "Parts of a robot, sensing and simple movement — no prior knowledge needed.", 4],
    ["Advanced", "Motion, control & programming", "Kinematics, feedback control and writing robot behaviours.", 6],
    ["Elite Mastery", "Autonomy & projects", "Navigation, mapping and an independent robotics project.", 6],
  ]),
  durationLabel: "About 16 weeks at 4 hours per week",
  relatedCategorySlug: "science-discovery",
  curriculum: {
    referenceInstitution: ILLUSTRATIVE_INSTITUTION,
    referenceUnitTitle: "Introduction to Robotics Engineering",
    referenceUnitCode: "ROB-101 (illustrative)",
    isIllustrative: true,
    description:
      "An introduction to the principles of robotic systems: mechanical structure, sensing, actuation, kinematics, control and autonomy. Learners progress from first principles to a capstone autonomous robotics project.",
    outcomes: [
      "Identify the subsystems of a robot and explain how they interact.",
      "Apply coordinate transformations to describe robot position and orientation.",
      "Implement feedback control for a simple actuator.",
      "Evaluate approaches to autonomous navigation.",
      "Communicate the design and testing of a robotics project.",
    ],
    prerequisites: ["Algebra and trigonometry", "Introductory physics (forces, energy)", "Basic programming concepts"],
    modules: [
      mod("rob", 1, "Introduction to Robotics", "What makes a machine a robot, and where robots are used today.", "Week 1–2", [
        "What is a robot?",
        "A short history of robotics",
        "Robot safety and ethics",
      ], { lectures: ["mit-ocw"], readings: ["modern-robotics"] }),
      mod("rob", 2, "Mathematics for Robotics", "Vectors, matrices and trigonometry as the language of motion.", "Week 3–4", [
        "Vectors and coordinate frames",
        "*Rotation matrices",
        "*Homogeneous transformations",
      ], { lectures: ["khan-linear-algebra"], readings: ["modern-robotics"] }),
      mod("rob", 3, "Mechanical Systems", "Links, joints, gears and the physical structure of robots.", "Week 5–6", [
        "Links, joints and degrees of freedom",
        "Gears, torque and power transmission",
        "*Configuration space",
      ], { readings: ["modern-robotics", "openstax-physics-2"] }),
      mod("rob", 4, "Electronics and Sensors", "How robots sense the world and drive motors.", "Week 7–8", [
        "Circuits for robotics",
        "Sensors: distance, light, touch and IMUs",
        "Motors, servos and drivers",
      ], { readings: ["openstax-physics-2"], practicalId: "lab-circuit-basics" }),
      mod("rob", 5, "Programming and Control", "Feedback loops that keep robots on target.", "Week 9–10", [
        "Open-loop vs closed-loop control",
        "*PID control",
        "Introduction to ROS",
      ], { lectures: ["mit-ocw"], readings: ["ros-docs"] }),
      mod("rob", 6, "Robot Kinematics", "Calculating where a robot arm is — and how to get it somewhere.", "Week 11–12", [
        "Forward kinematics",
        "*Denavit–Hartenberg parameters",
        "Inverse kinematics",
      ], { readings: ["modern-robotics"], practicalId: "lab-robot-arm" }),
      mod("rob", 7, "Autonomous Navigation", "Localisation, mapping and path planning.", "Week 13–14", [
        "Path planning algorithms",
        "*Probabilistic localisation",
        "*SLAM concepts",
      ], { readings: ["probabilistic-robotics", "ros-docs"] }),
      mod("rob", 8, "Advanced Robotics Projects", "Bring everything together in an independent project.", "Week 15–16", [
        "Project scoping and design",
        "Testing and iteration",
        "Presenting your robot",
      ], { practicalId: "lab-line-follower" }),
    ],
    assessments: [
      { title: "Module mastery checks", type: "Mastery quiz", weight: 30, description: "Short adaptive quizzes verify each module before progressing." },
      { title: "Robotic arm simulation", type: "Practical", weight: 25, description: "Demonstrate forward kinematics in the virtual lab." },
      { title: "Explain-it-back", type: "Written explanation", weight: 15, description: "Explain a control concept in your own words on the blank-page workspace." },
      { title: "Capstone robot project", type: "Project", weight: 30, description: "Design, simulate and present an autonomous behaviour." },
    ],
    furtherStudy: ["mit-ocw", "probabilistic-robotics", "ros-docs"],
  },
};

const ai: SubjectDetail = {
  slug: "artificial-intelligence-machine-learning",
  title: "Artificial Intelligence & Machine Learning",
  tagline: "Teach computers to learn from data.",
  description:
    "Understand how machines recognise patterns, make predictions and generate language — and how to build and question AI responsibly.",
  discipline: "Computing",
  difficulty: "intermediate",
  motif: "neural",
  theme: { base: "#4c1d95", accent: "#c4b5fd", tint: "#ede9fe", ink: "#5b21b6" },
  status: "available",
  tags: ["Neural networks", "Data", "Ethics", "Python"],
  featured: true,
  trending: true,
  emerging: true,
  beginnerFriendly: true,
  universityLevel: true,
  addedAt: "2026-10-20",
  estimatedHours: 72,
  learnersExploring: 9310,
  introduction:
    "Artificial intelligence is the science of making computers perform tasks that normally require human intelligence. Machine learning — its most successful branch today — lets computers improve at tasks by learning patterns from examples rather than following hand-written rules.",
  applications: [
    { title: "Language", description: "Translation, chat assistants and summarisation tools." },
    { title: "Medicine", description: "Detecting disease in scans and accelerating drug discovery." },
    { title: "Climate", description: "Forecasting weather and optimising energy grids." },
    { title: "Science", description: "Predicting protein structures and analysing telescope data." },
  ],
  whyItMatters: [
    "AI is reshaping how people work, learn and communicate.",
    "Understanding how AI works helps you use it wisely and spot its limitations.",
    "Building fair and safe AI is one of the defining challenges of this century.",
  ],
  outcomes: [
    "Explain the difference between rule-based programs and learned models.",
    "Prepare a dataset and train a simple model.",
    "Build and train a basic neural network.",
    "Evaluate models for accuracy, bias and real-world risk.",
  ],
  foundationalKnowledge: ["Percentages and averages", "Reading graphs", "Basic coordinate geometry", "Curiosity about data"],
  prerequisites: [
    { title: "What is AI?", why: "Builds on the existing AI knowledge category.", categorySlug: "artificial-intelligence" },
    { title: "Statistics & probability basics", why: "Models make predictions under uncertainty.", categorySlug: "science-discovery" },
    { title: "Digital ethics", why: "Responsible use of AI in society.", categorySlug: "history-society" },
  ],
  stages: stages("ai", [
    ["Foundation", "Thinking with data", "Patterns, predictions and how machines learn — from zero.", 4],
    ["Advanced", "Models & neural networks", "Regression, classification and training your first network.", 7],
    ["Elite Mastery", "Modern AI & responsible design", "Transformers, evaluation and an applied AI project.", 7],
  ]),
  durationLabel: "About 18 weeks at 4 hours per week",
  relatedCategorySlug: "artificial-intelligence",
  curriculum: {
    referenceInstitution: ILLUSTRATIVE_INSTITUTION,
    referenceUnitTitle: "Foundations of Machine Learning",
    referenceUnitCode: "AIM-110 (illustrative)",
    isIllustrative: true,
    description:
      "A structured introduction to machine learning covering data, supervised and unsupervised learning, neural networks, modern architectures and responsible AI.",
    outcomes: [
      "Describe the machine learning workflow from data to deployment.",
      "Train and evaluate supervised learning models.",
      "Explain how neural networks learn through gradient descent.",
      "Critically assess AI systems for bias, safety and societal impact.",
    ],
    prerequisites: ["Algebra", "Introductory statistics", "Basic programming (Python recommended)"],
    modules: [
      mod("ai", 1, "What is Artificial Intelligence?", "From rule-based systems to learning machines.", "Week 1–2", [
        "Defining intelligence",
        "A brief history of AI",
        "Where AI is used today",
      ], { lectures: ["mit-ocw"] }),
      mod("ai", 2, "Data and Representation", "How the world becomes numbers a computer can learn from.", "Week 3–4", [
        "Features and labels",
        "Cleaning and splitting data",
        "Visualising datasets",
      ], { readings: ["d2l"] }),
      mod("ai", 3, "Mathematics for Machine Learning", "Vectors, gradients and probability — explained visually.", "Week 5–6", [
        "Vectors and matrices",
        "*Gradients and optimisation",
        "Probability for predictions",
      ], { lectures: ["khan-linear-algebra"], readings: ["deep-learning-book"] }),
      mod("ai", 4, "Supervised Learning", "Learning from labelled examples.", "Week 7–8", [
        "Linear regression",
        "Classification",
        "*Overfitting and regularisation",
      ], { readings: ["d2l"] }),
      mod("ai", 5, "Neural Networks", "Layers of simple units that learn complex patterns.", "Week 9–10", [
        "The artificial neuron",
        "*Backpropagation",
        "Training loops in practice",
      ], { lectures: ["3b1b-neural-networks"], readings: ["deep-learning-book"], practicalId: "lab-neural-network" }),
      mod("ai", 6, "Unsupervised Learning", "Finding structure without labels.", "Week 11–12", [
        "Clustering",
        "Dimensionality reduction",
        "Anomaly detection",
      ], { readings: ["d2l"] }),
      mod("ai", 7, "Modern Architectures", "Convolutional networks, transformers and generative models.", "Week 13–15", [
        "Convolutional networks for images",
        "*The transformer and attention",
        "Generative AI",
      ], { readings: ["attention-paper", "d2l"] }),
      mod("ai", 8, "Responsible AI Project", "Build, evaluate and critique an applied model.", "Week 16–18", [
        "Bias and fairness",
        "Evaluating real-world impact",
        "Capstone project",
      ], { readings: ["pytorch-docs"], practicalId: "lab-image-classifier" }),
    ],
    assessments: [
      { title: "Module mastery checks", type: "Mastery quiz", weight: 30, description: "Adaptive quizzes confirm understanding of each module." },
      { title: "Neural network lab", type: "Practical", weight: 25, description: "Train a small network and report its accuracy." },
      { title: "AI ethics explanation", type: "Written explanation", weight: 15, description: "Analyse the risks of a real AI application." },
      { title: "Applied AI capstone", type: "Project", weight: 30, description: "Build and evaluate a model on an open dataset." },
    ],
    furtherStudy: ["deep-learning-book", "attention-paper", "mit-ocw"],
  },
};

const energy: SubjectDetail = {
  slug: "energy-generation-storage",
  title: "Energy Generation & Storage",
  tagline: "Power the world — and keep the lights on.",
  description:
    "Explore how electricity is generated from sun, wind and atoms, and how batteries and grids store and deliver it reliably.",
  discipline: "Energy & Environment",
  difficulty: "beginner",
  motif: "battery",
  theme: { base: "#065f46", accent: "#6ee7b7", tint: "#d1fae5", ink: "#047857" },
  status: "available",
  tags: ["Batteries", "Renewables", "Grids", "Electrochemistry"],
  featured: true,
  trending: true,
  beginnerFriendly: true,
  universityLevel: true,
  addedAt: "2026-11-02",
  estimatedHours: 56,
  learnersExploring: 3640,
  introduction:
    "Modern life runs on energy. This subject explains where our energy comes from, how it is converted into electricity, and how technologies like lithium-ion batteries and pumped hydro store it for when it is needed — the key challenge of a renewable-powered world.",
  applications: [
    { title: "Electric vehicles", description: "Battery packs, charging and energy efficiency on the road." },
    { title: "Renewable grids", description: "Balancing solar and wind with storage and demand." },
    { title: "Portable electronics", description: "Making phones and laptops last longer and charge faster." },
    { title: "Off-grid power", description: "Bringing reliable electricity to remote communities." },
  ],
  whyItMatters: [
    "The energy transition is one of the largest engineering projects in human history.",
    "Storage is the missing piece that makes renewable power reliable.",
    "Energy literacy helps people make better choices at home and in society.",
  ],
  outcomes: [
    "Compare energy sources by output, cost and environmental impact.",
    "Explain how a battery stores and releases energy.",
    "Model charging and discharging behaviour.",
    "Propose a storage solution for a real-world energy scenario.",
  ],
  foundationalKnowledge: ["Units and measurement", "Energy and power", "Simple circuits", "Reading graphs"],
  prerequisites: [
    { title: "Energy & power", why: "The core quantities used throughout the subject.", categorySlug: "science-discovery" },
    { title: "Chemical reactions", why: "Batteries store energy chemically.", categorySlug: "science-discovery" },
    { title: "Energy economics", why: "Cost shapes which technologies are deployed.", categorySlug: "economics" },
  ],
  stages: stages("en", [
    ["Foundation", "Energy all around us", "Forms of energy, power and where electricity comes from.", 3],
    ["Advanced", "Generation & batteries", "Renewable generation and how batteries work inside.", 6],
    ["Elite Mastery", "Grid-scale systems", "Storage design, grid balancing and a system-design project.", 5],
  ]),
  durationLabel: "About 14 weeks at 4 hours per week",
  relatedCategorySlug: "science-discovery",
  curriculum: {
    referenceInstitution: ILLUSTRATIVE_INSTITUTION,
    referenceUnitTitle: "Energy Systems and Storage Technologies",
    referenceUnitCode: "ENR-120 (illustrative)",
    isIllustrative: true,
    description:
      "Fundamentals of energy conversion, renewable generation and electrochemical storage, culminating in the design of an integrated energy system.",
    outcomes: [
      "Apply energy and power calculations to real systems.",
      "Explain the operating principles of major generation technologies.",
      "Describe the electrochemistry of lithium-ion cells.",
      "Design a storage system for a given demand profile.",
    ],
    prerequisites: ["Introductory physics", "Introductory chemistry", "Algebra"],
    modules: [
      mod("en", 1, "Energy Fundamentals", "Energy, power and efficiency explained from zero.", "Week 1–2", [
        "Forms of energy",
        "Power vs energy",
        "Efficiency and losses",
      ], { readings: ["without-hot-air"] }),
      mod("en", 2, "Generating Electricity", "Turbines, generators and the power station.", "Week 3–4", [
        "Electromagnetic induction",
        "Thermal power stations",
        "*Capacity factor",
      ], { readings: ["openstax-physics-2"] }),
      mod("en", 3, "Renewable Generation", "Solar, wind, hydro and their variability.", "Week 5–6", [
        "Solar photovoltaics",
        "Wind energy",
        "Hydro and marine power",
      ], { readings: ["iea-reports", "without-hot-air"] }),
      mod("en", 4, "Electrochemistry", "The chemistry that makes batteries possible.", "Week 7–8", [
        "Oxidation and reduction",
        "*Electrochemical cells",
        "Electrode materials",
      ], { readings: ["openstax-chemistry-2e"] }),
      mod("en", 5, "Battery Technology", "Inside a lithium-ion cell.", "Week 9–10", [
        "How lithium-ion cells work",
        "Charging and discharging",
        "*Degradation and lifespan",
      ], { readings: ["li-ion-perspective", "battery-university"], practicalId: "lab-battery-model" }),
      mod("en", 6, "Beyond Batteries", "Pumped hydro, hydrogen, thermal and mechanical storage.", "Week 11", [
        "Pumped hydro storage",
        "Hydrogen as an energy carrier",
        "Thermal and mechanical storage",
      ], { readings: ["iea-reports"] }),
      mod("en", 7, "Grids and Integration", "Keeping supply and demand in balance.", "Week 12–13", [
        "How the grid works",
        "*Frequency and balancing",
        "Smart grids",
      ], { readings: ["iea-reports"] }),
      mod("en", 8, "Energy System Design Project", "Design a storage solution for a community.", "Week 14", [
        "Demand profiles",
        "Sizing storage",
        "Presenting your design",
      ], { practicalId: "lab-microgrid" }),
    ],
    assessments: [
      { title: "Module mastery checks", type: "Mastery quiz", weight: 30, description: "Confirm understanding before progressing." },
      { title: "Battery modelling lab", type: "Practical", weight: 25, description: "Model charge/discharge curves in the virtual lab." },
      { title: "Energy explainer", type: "Written explanation", weight: 15, description: "Explain the storage challenge to a younger learner." },
      { title: "Community microgrid design", type: "Project", weight: 30, description: "Size generation and storage for a real scenario." },
    ],
    furtherStudy: ["without-hot-air", "iea-reports", "mit-ocw"],
  },
};

const semis: SubjectDetail = {
  slug: "semiconductors-chip-manufacturing",
  title: "Semiconductors & Advanced Chip Manufacturing",
  tagline: "Billions of switches on a fingernail.",
  description:
    "Learn how silicon becomes the chips inside every phone and computer — from electrons and transistors to nanometre-scale fabrication.",
  discipline: "Physical Sciences",
  difficulty: "advanced",
  motif: "chip",
  theme: { base: "#0f172a", accent: "#38bdf8", tint: "#e0f2fe", ink: "#0369a1" },
  status: "available",
  tags: ["Transistors", "Lithography", "Silicon", "Nanotechnology"],
  featured: true,
  emerging: true,
  universityLevel: true,
  addedAt: "2026-11-10",
  estimatedHours: 68,
  learnersExploring: 2210,
  introduction:
    "Semiconductors are materials whose electrical behaviour can be precisely controlled. Engineered into transistors — tiny electronic switches — they form the foundation of all modern computing. Advanced chip manufacturing is among the most complex processes humans have ever developed, patterning features thousands of times thinner than a human hair.",
  applications: [
    { title: "Computing", description: "Processors and memory in every digital device." },
    { title: "AI hardware", description: "Specialised chips accelerate machine learning." },
    { title: "Energy", description: "Power electronics and solar cells are semiconductor devices." },
    { title: "Communications", description: "Radio chips connect phones, satellites and networks." },
  ],
  whyItMatters: [
    "Chips are strategic to every economy and to scientific progress.",
    "Manufacturing them combines physics, chemistry, optics and precision engineering.",
    "The industry needs many more skilled engineers and technicians.",
  ],
  outcomes: [
    "Explain conduction in semiconductors and the role of doping.",
    "Describe how a transistor acts as a switch.",
    "Outline the main steps of chip fabrication.",
    "Discuss the limits and future of transistor scaling.",
  ],
  foundationalKnowledge: ["Atoms and electrons", "Basic circuits", "Powers of ten", "Scientific notation"],
  prerequisites: [
    { title: "Atomic structure", why: "Electron behaviour explains semiconductors.", categorySlug: "science-discovery" },
    { title: "Simple circuits", why: "Transistors are circuit components.", categorySlug: "science-discovery" },
    { title: "Manufacturing processes", why: "Fabrication is precision manufacturing.", categorySlug: "manufacturing" },
  ],
  stages: stages("sc", [
    ["Foundation", "Electrons & materials", "Conductors, insulators and why silicon is special.", 4],
    ["Advanced", "Devices & circuits", "Diodes, transistors and logic gates.", 6],
    ["Elite Mastery", "Fabrication & the frontier", "Lithography, cleanrooms and next-generation chips.", 6],
  ]),
  durationLabel: "About 16 weeks at 4 hours per week",
  relatedCategorySlug: "manufacturing",
  curriculum: {
    referenceInstitution: ILLUSTRATIVE_INSTITUTION,
    referenceUnitTitle: "Semiconductor Devices and Fabrication",
    referenceUnitCode: "SEM-210 (illustrative)",
    isIllustrative: true,
    description:
      "Semiconductor physics, device operation and integrated circuit fabrication, from band theory to extreme ultraviolet lithography.",
    outcomes: [
      "Explain band structure and carrier transport qualitatively.",
      "Analyse the behaviour of diodes and MOSFETs.",
      "Describe each stage of the fabrication process flow.",
      "Evaluate challenges in continued transistor scaling.",
    ],
    prerequisites: ["Introductory physics", "Introductory chemistry", "Algebra"],
    modules: [
      mod("sc", 1, "Why Semiconductors Matter", "From vacuum tubes to billions of transistors.", "Week 1", [
        "The digital revolution",
        "*Moore’s law",
        "The global chip industry",
      ], { readings: ["moore-1965"] }),
      mod("sc", 2, "Electrons in Materials", "Conductors, insulators and semiconductors.", "Week 2–3", [
        "Atoms and electrons",
        "*Energy bands",
        "Silicon’s crystal structure",
      ], { readings: ["openstax-physics-2", "openstax-chemistry-2e"] }),
      mod("sc", 3, "Doping and Junctions", "Engineering conductivity on purpose.", "Week 4–5", [
        "n-type and p-type doping",
        "The p–n junction",
        "Diodes and LEDs",
      ], { readings: ["sze-devices"] }),
      mod("sc", 4, "Transistors", "The switch that built the modern world.", "Week 6–7", [
        "How a MOSFET works",
        "*Threshold voltage",
        "Transistors as switches",
      ], { readings: ["sze-devices"], practicalId: "lab-transistor-switch" }),
      mod("sc", 5, "From Transistors to Logic", "Gates, circuits and processors.", "Week 8–9", [
        "CMOS logic gates",
        "Building an adder",
        "Inside a processor",
      ], { lectures: ["mit-ocw"] }),
      mod("sc", 6, "Wafer Fabrication", "Making ultra-pure silicon wafers.", "Week 10–11", [
        "Crystal growth",
        "Cleanrooms",
        "*Oxidation and deposition",
      ], { lectures: ["mit-ocw"] }),
      mod("sc", 7, "Lithography and Patterning", "Printing nanometre-scale features.", "Week 12–14", [
        "Photolithography",
        "*Extreme ultraviolet (EUV)",
        "Etching",
      ], { lectures: ["mit-ocw"] }),
      mod("sc", 8, "The Future of Chips", "3D stacking, new materials and beyond silicon.", "Week 15–16", [
        "Chiplets and 3D integration",
        "New channel materials",
        "Research frontier project",
      ]),
    ],
    assessments: [
      { title: "Module mastery checks", type: "Mastery quiz", weight: 30, description: "Adaptive verification of each module." },
      { title: "Transistor switching lab", type: "Practical", weight: 25, description: "Explore switching behaviour in the virtual lab." },
      { title: "Process-flow explanation", type: "Written explanation", weight: 15, description: "Describe how a chip is made, step by step." },
      { title: "Frontier research brief", type: "Project", weight: 30, description: "Investigate and present an emerging chip technology." },
    ],
    furtherStudy: ["sze-devices", "moore-1965", "mit-ocw"],
  },
};

const sustain: SubjectDetail = {
  slug: "sustainable-resources-circular-engineering",
  title: "Sustainable Resources & Circular Engineering",
  tagline: "Design out waste. Keep materials in use.",
  description:
    "Investigate where materials come from, where they end up, and how engineers design products and systems that regenerate rather than deplete.",
  discipline: "Energy & Environment",
  difficulty: "beginner",
  motif: "cycle",
  theme: { base: "#3f6212", accent: "#bef264", tint: "#ecfccb", ink: "#4d7c0f" },
  status: "available",
  tags: ["Circular economy", "Life-cycle", "Materials", "Policy"],
  featured: true,
  trending: true,
  beginnerFriendly: true,
  addedAt: "2026-11-14",
  estimatedHours: 48,
  learnersExploring: 2980,
  introduction:
    "Every product begins as raw materials taken from the Earth. Circular engineering asks how we can keep those materials in use for as long as possible — through better design, repair, reuse and recycling — while reducing environmental impact and building resilient economies.",
  applications: [
    { title: "Product design", description: "Designing for repair, disassembly and recycling." },
    { title: "Cities", description: "Managing water, waste and construction materials." },
    { title: "Business", description: "New models such as leasing, sharing and remanufacturing." },
    { title: "Critical minerals", description: "Securing the materials needed for clean technologies." },
  ],
  whyItMatters: [
    "Global material use has grown rapidly and continues to rise.",
    "Circular approaches can reduce emissions, pollution and costs together.",
    "Every learner can apply circular thinking at home, at school and in their future careers.",
  ],
  outcomes: [
    "Map the life cycle of an everyday product.",
    "Compare linear and circular economic models.",
    "Analyse resource consumption data.",
    "Redesign a product using circular principles.",
  ],
  foundationalKnowledge: ["Percentages", "Reading charts", "Basic materials knowledge", "Systems thinking"],
  prerequisites: [
    { title: "Materials and their properties", why: "Different materials can be recovered in different ways.", categorySlug: "science-discovery" },
    { title: "How economies work", why: "Circularity changes how value is created.", categorySlug: "economics" },
    { title: "Design thinking", why: "Circular solutions start at the design stage.", categorySlug: "innovation-design" },
  ],
  stages: stages("su", [
    ["Foundation", "Where things come from", "Raw materials, products and waste from first principles.", 3],
    ["Advanced", "Measuring impact", "Life-cycle assessment and material flow analysis.", 5],
    ["Elite Mastery", "Designing circular systems", "Circular business models, policy and a redesign project.", 4],
  ]),
  durationLabel: "About 12 weeks at 4 hours per week",
  relatedCategorySlug: "innovation-design",
  curriculum: {
    referenceInstitution: ILLUSTRATIVE_INSTITUTION,
    referenceUnitTitle: "Circular Economy and Sustainable Engineering",
    referenceUnitCode: "SUS-105 (illustrative)",
    isIllustrative: true,
    description:
      "Principles of sustainable resource management, life-cycle assessment and circular design, applied through data analysis and a product redesign project.",
    outcomes: [
      "Describe global material flows and their impacts.",
      "Conduct a simplified life-cycle assessment.",
      "Apply circular design strategies to a product.",
      "Evaluate policy and business approaches to circularity.",
    ],
    prerequisites: ["Basic mathematics", "Introductory science"],
    modules: [
      mod("su", 1, "Resources and Society", "How humanity uses Earth’s materials.", "Week 1", [
        "Renewable vs non-renewable resources",
        "Global material use",
        "Planetary boundaries",
      ], { readings: ["irp-outlook", "our-world-in-data"] }),
      mod("su", 2, "The Linear Economy", "Take, make, waste — and its costs.", "Week 2", [
        "Extraction and processing",
        "Waste and pollution",
        "Hidden environmental costs",
      ], { readings: ["emf-circular"] }),
      mod("su", 3, "Circular Principles", "Designing waste out of the system.", "Week 3–4", [
        "*The butterfly diagram",
        "Reduce, reuse, repair, recycle",
        "Biological and technical cycles",
      ], { readings: ["emf-circular"] }),
      mod("su", 4, "Life-Cycle Assessment", "Measuring impact from cradle to grave.", "Week 5–6", [
        "System boundaries",
        "*Impact categories",
        "Interpreting results",
      ], { readings: ["openstax-chemistry-2e"] }),
      mod("su", 5, "Material Flow Analysis", "Following materials through the economy.", "Week 7", [
        "Stocks and flows",
        "Data sources",
        "Building a flow diagram",
      ], { readings: ["our-world-in-data"], practicalId: "lab-resource-analysis" }),
      mod("su", 6, "Circular Design", "Products built to last and to be remade.", "Week 8–9", [
        "Design for disassembly",
        "Material selection",
        "Remanufacturing",
      ]),
      mod("su", 7, "Business and Policy", "Systems that make circularity work.", "Week 10–11", [
        "Product-as-a-service",
        "Extended producer responsibility",
        "Critical minerals",
      ], { readings: ["irp-outlook"] }),
      mod("su", 8, "Circular Redesign Project", "Redesign an everyday product.", "Week 12", [
        "Choosing a product",
        "Applying circular strategies",
        "Presenting the impact",
      ], { practicalId: "lab-product-redesign" }),
    ],
    assessments: [
      { title: "Module mastery checks", type: "Mastery quiz", weight: 30, description: "Adaptive verification of each module." },
      { title: "Resource consumption analysis", type: "Practical", weight: 25, description: "Analyse real consumption data." },
      { title: "Life-cycle explanation", type: "Written explanation", weight: 15, description: "Explain the life cycle of a product you own." },
      { title: "Circular redesign", type: "Project", weight: 30, description: "Redesign a product and estimate its impact." },
    ],
    furtherStudy: ["emf-circular", "irp-outlook", "without-hot-air"],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Pathways in development (catalogue entries with overview only)
// ─────────────────────────────────────────────────────────────────────────────

function upcoming(s: Omit<SubjectDetail, "status" | "curriculum" | "stages" | "durationLabel"> & { durationLabel?: string }): SubjectDetail {
  return {
    ...s,
    status: "coming-soon",
    curriculum: null,
    stages: [],
    durationLabel: s.durationLabel ?? "Pathway in development",
  };
}

const aerospace = upcoming({
  slug: "aerospace-engineering",
  title: "Aerospace Engineering",
  tagline: "From flight to orbit.",
  description: "Discover how aircraft fly and spacecraft reach orbit — aerodynamics, propulsion and orbital mechanics.",
  discipline: "Engineering",
  difficulty: "advanced",
  motif: "rocket",
  theme: { base: "#1e293b", accent: "#fb923c", tint: "#ffedd5", ink: "#c2410c" },
  tags: ["Aerodynamics", "Propulsion", "Orbits"],
  featured: true,
  emerging: true,
  universityLevel: true,
  addedAt: "2026-11-18",
  estimatedHours: 70,
  learnersExploring: 1540,
  introduction: "Aerospace engineering covers the design of aircraft and spacecraft. A full EduMate pathway is being developed.",
  applications: [
    { title: "Aviation", description: "Efficient, quieter and lower-emission aircraft." },
    { title: "Space", description: "Satellites, launch vehicles and exploration missions." },
  ],
  whyItMatters: ["Space and aviation connect the world and expand scientific knowledge."],
  outcomes: ["Explain lift, drag, thrust and weight.", "Describe how orbits work."],
  foundationalKnowledge: ["Forces and motion", "Basic trigonometry"],
  prerequisites: [{ title: "Forces & motion", why: "Flight is applied mechanics.", categorySlug: "science-discovery" }],
  relatedCategorySlug: "science-discovery",
});

const biotech = upcoming({
  slug: "biotechnology",
  title: "Biotechnology",
  tagline: "Engineering with living systems.",
  description: "Explore how scientists use cells, DNA and enzymes to create medicines, materials and sustainable food.",
  discipline: "Life Sciences",
  difficulty: "intermediate",
  motif: "dna",
  theme: { base: "#831843", accent: "#f9a8d4", tint: "#fce7f3", ink: "#be185d" },
  tags: ["Genetics", "Medicine", "Bioprocessing"],
  featured: true,
  trending: true,
  beginnerFriendly: true,
  addedAt: "2026-11-16",
  estimatedHours: 60,
  learnersExploring: 2050,
  introduction: "Biotechnology harnesses biology to solve problems in health, food and industry. A full pathway is being developed.",
  applications: [
    { title: "Medicine", description: "Vaccines, gene therapies and biologic drugs." },
    { title: "Food", description: "Resilient crops and alternative proteins." },
  ],
  whyItMatters: ["Biotechnology is transforming healthcare and agriculture."],
  outcomes: ["Explain how DNA encodes information.", "Describe key biotechnology techniques."],
  foundationalKnowledge: ["Cells", "Basic chemistry"],
  prerequisites: [{ title: "Cells and life", why: "All biotechnology builds on cell biology.", categorySlug: "science-discovery" }],
  relatedCategorySlug: "science-discovery",
});

const quantum = upcoming({
  slug: "quantum-computing",
  title: "Quantum Computing",
  tagline: "Computing with the rules of the very small.",
  description: "Meet qubits, superposition and entanglement, and discover what quantum computers may one day solve.",
  discipline: "Computing",
  difficulty: "university",
  motif: "qubit",
  theme: { base: "#312e81", accent: "#a5b4fc", tint: "#e0e7ff", ink: "#4338ca" },
  tags: ["Qubits", "Algorithms", "Physics"],
  featured: true,
  emerging: true,
  universityLevel: true,
  addedAt: "2026-11-12",
  estimatedHours: 80,
  learnersExploring: 1880,
  introduction: "Quantum computing uses quantum mechanics to process information in new ways. A full pathway is being developed.",
  applications: [
    { title: "Chemistry", description: "Simulating molecules for new materials and medicines." },
    { title: "Security", description: "New cryptography for a quantum era." },
  ],
  whyItMatters: ["Quantum technologies may reshape computing, sensing and security."],
  outcomes: ["Describe a qubit and superposition.", "Explain a simple quantum circuit."],
  foundationalKnowledge: ["Probability", "Vectors"],
  prerequisites: [{ title: "Probability basics", why: "Quantum measurement is probabilistic.", categorySlug: "science-discovery" }],
  relatedCategorySlug: "science-discovery",
});

const materials = upcoming({
  slug: "advanced-materials-science",
  title: "Advanced Materials Science",
  tagline: "Atoms arranged for extraordinary properties.",
  description: "Discover graphene, superalloys and smart materials — and how structure at the atomic scale shapes the world we build.",
  discipline: "Physical Sciences",
  difficulty: "advanced",
  motif: "lattice",
  theme: { base: "#134e4a", accent: "#5eead4", tint: "#ccfbf1", ink: "#0f766e" },
  tags: ["Nanomaterials", "Crystals", "Composites"],
  featured: true,
  universityLevel: true,
  addedAt: "2026-11-08",
  estimatedHours: 62,
  learnersExploring: 1320,
  introduction: "Materials science links atomic structure to real-world properties. A full pathway is being developed.",
  applications: [
    { title: "Electronics", description: "New materials for faster, cooler devices." },
    { title: "Transport", description: "Lighter, stronger composites for vehicles." },
  ],
  whyItMatters: ["Almost every technological advance depends on better materials."],
  outcomes: ["Relate structure to properties.", "Describe classes of advanced materials."],
  foundationalKnowledge: ["Atoms and bonding"],
  prerequisites: [{ title: "Atoms and bonding", why: "Structure determines properties.", categorySlug: "science-discovery" }],
  relatedCategorySlug: "manufacturing",
});

export const subjects: SubjectDetail[] = [robotics, ai, energy, semis, sustain, aerospace, biotech, quantum, materials];

export function toSummary(s: SubjectDetail): SubjectSummary {
  return {
    slug: s.slug,
    title: s.title,
    tagline: s.tagline,
    description: s.description,
    discipline: s.discipline,
    difficulty: s.difficulty,
    motif: s.motif,
    theme: s.theme,
    status: s.status,
    tags: s.tags,
    featured: s.featured,
    trending: s.trending,
    emerging: s.emerging,
    beginnerFriendly: s.beginnerFriendly,
    universityLevel: s.universityLevel,
    addedAt: s.addedAt,
    estimatedHours: s.estimatedHours,
    learnersExploring: s.learnersExploring,
  };
}
