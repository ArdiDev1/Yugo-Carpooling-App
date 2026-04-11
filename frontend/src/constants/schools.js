export const SCHOOLS = [
  { id: "amherst",    name: "Amherst College",          domain: "amherst.edu" },
  { id: "smith",      name: "Smith College",             domain: "smith.edu" },
  { id: "mtholyoke",  name: "Mount Holyoke College",     domain: "mtholyoke.edu" },
  { id: "hampshire",  name: "Hampshire College",         domain: "hampshire.edu" },
  { id: "umass",      name: "UMass Amherst",             domain: "umass.edu" },
  { id: "dartmouth",  name: "Dartmouth College",         domain: "dartmouth.edu" },
  { id: "harvard",    name: "Harvard University",        domain: "harvard.edu" },
  { id: "mit",        name: "MIT",                       domain: "mit.edu" },
  { id: "yale",       name: "Yale University",           domain: "yale.edu" },
  { id: "brown",      name: "Brown University",          domain: "brown.edu" },
  { id: "columbia",   name: "Columbia University",       domain: "columbia.edu" },
  { id: "cornell",    name: "Cornell University",        domain: "cornell.edu" },
  { id: "bu",         name: "Boston University",         domain: "bu.edu" },
  { id: "northeastern","name": "Northeastern University","domain": "northeastern.edu" },
  { id: "bc",         name: "Boston College",            domain: "bc.edu" },
  { id: "wellesley",  name: "Wellesley College",         domain: "wellesley.edu" },
];

export const getSchoolByEmail = (email) => {
  const domain = email?.split("@")[1];
  if (!domain) return null;
  return SCHOOLS.find((s) => domain.endsWith(s.domain)) ?? null;
};

export const getSchoolById = (id) => SCHOOLS.find((s) => s.id === id) ?? null;
