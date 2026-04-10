export type Subcategory = {
  slug: string
  name: string
  icon: string
}

export type CategorySubs = {
  [categorySlug: string]: Subcategory[]
}

export const SUBCATEGORIES: CategorySubs = {
  auto: [
    { slug: 'autoturisme', name: 'Autoturisme', icon: '🚗' },
    { slug: 'autoutilitare', name: 'Autoutilitare', icon: '🚐' },
    { slug: 'piese', name: 'Piese auto', icon: '🔩' },
    { slug: 'agricole', name: 'Agricole', icon: '🚜' },
    { slug: 'remorci', name: 'Remorci', icon: '🔗' },
    { slug: 'camioane', name: 'Camioane', icon: '🚛' },
    { slug: 'constructii', name: 'Constructii', icon: '🏗️' },
    { slug: 'motociclete', name: 'Motociclete', icon: '🏍️' },
  ],
  imobiliare: [
    { slug: 'apartamente', name: 'Apartamente', icon: '🏢' },
    { slug: 'case', name: 'Case', icon: '🏠' },
    { slug: 'terenuri', name: 'Terenuri', icon: '🌿' },
    { slug: 'spatii-comerciale', name: 'Spatii comerciale', icon: '🏪' },
    { slug: 'garaje', name: 'Garaje', icon: '🅿️' },
  ],
  joburi: [
    { slug: 'it', name: 'IT & Tech', icon: '💻' },
    { slug: 'vanzari', name: 'Vânzări', icon: '📊' },
    { slug: 'horeca', name: 'HoReCa', icon: '🍽️' },
    { slug: 'constructii', name: 'Construcții', icon: '🔨' },
    { slug: 'transport', name: 'Transport', icon: '🚚' },
    { slug: 'medical', name: 'Medical', icon: '🏥' },
  ],
  servicii: [
    { slug: 'reparatii', name: 'Reparații', icon: '🔧' },
    { slug: 'curatenie', name: 'Curățenie', icon: '🧹' },
    { slug: 'transport', name: 'Transport', icon: '🚚' },
    { slug: 'it', name: 'IT & Web', icon: '💻' },
    { slug: 'constructii', name: 'Construcții', icon: '🏗️' },
    { slug: 'frumusete', name: 'Frumusețe', icon: '💅' },
  ],
  electronice: [
    { slug: 'telefoane', name: 'Telefoane', icon: '📱' },
    { slug: 'laptopuri', name: 'Laptopuri', icon: '💻' },
    { slug: 'tv', name: 'TV & Audio', icon: '📺' },
    { slug: 'gaming', name: 'Gaming', icon: '🎮' },
    { slug: 'tablete', name: 'Tablete', icon: '📲' },
    { slug: 'foto-video', name: 'Foto & Video', icon: '📷' },
    { slug: 'alte-electronice', name: 'Alte electronice', icon: '🔌' },
  ],
  moda: [
    { slug: 'haine-femei', name: 'Haine femei', icon: '👗' },
    { slug: 'haine-barbati', name: 'Haine bărbați', icon: '👔' },
    { slug: 'incaltaminte', name: 'Încălțăminte', icon: '👟' },
    { slug: 'genti-accesorii', name: 'Genți & Accesorii', icon: '👜' },
    { slug: 'bijuterii', name: 'Bijuterii & Ceasuri', icon: '💍' },
    { slug: 'haine-copii', name: 'Haine copii', icon: '🧒' },
  ],
  'casa-gradina': [
    { slug: 'mobila', name: 'Mobilă', icon: '🛋️' },
    { slug: 'electrocasnice', name: 'Electrocasnice', icon: '🏠' },
    { slug: 'gradina', name: 'Grădină & Terasa', icon: '🌿' },
    { slug: 'decorare', name: 'Decorare & Design', icon: '🖼️' },
    { slug: 'iluminat', name: 'Iluminat', icon: '💡' },
    { slug: 'bricolaj', name: 'Bricolaj & Unelte', icon: '🔨' },
  ],
  sport: [
    { slug: 'echipament-sport', name: 'Echipament sport', icon: '⚽' },
    { slug: 'biciclete', name: 'Biciclete', icon: '🚲' },
    { slug: 'fitness', name: 'Fitness & Sală', icon: '💪' },
    { slug: 'outdoor', name: 'Outdoor & Camping', icon: '🏕️' },
    { slug: 'sporturi-apa', name: 'Sporturi pe apă', icon: '🏄' },
    { slug: 'sporturi-iarna', name: 'Sporturi de iarnă', icon: '⛷️' },
  ],
  animale: [
    { slug: 'caini', name: 'Câini', icon: '🐕' },
    { slug: 'pisici', name: 'Pisici', icon: '🐈' },
    { slug: 'pasari', name: 'Păsări', icon: '🦜' },
    { slug: 'pesti', name: 'Pești & Acvariu', icon: '🐠' },
    { slug: 'rozatoare', name: 'Rozătoare & Iepuri', icon: '🐹' },
    { slug: 'accesorii-animale', name: 'Accesorii & Hrană', icon: '🦴' },
    { slug: 'alte-animale', name: 'Alte animale', icon: '🐾' },
  ],
  'mama-copilul': [
    { slug: 'haine-copii', name: 'Haine copii', icon: '👕' },
    { slug: 'jucarii', name: 'Jucării', icon: '🧸' },
    { slug: 'carucior', name: 'Cărucioare & Scaune auto', icon: '🍼' },
    { slug: 'mobilier-copii', name: 'Mobilier copii', icon: '🛏️' },
    { slug: 'ingrijire-bebelusi', name: 'Îngrijire bebeluși', icon: '👶' },
    { slug: 'carti-jocuri', name: 'Cărți & Jocuri educative', icon: '📚' },
    { slug: 'alte-mama-copilul', name: 'Altele', icon: '🎀' },
  ],
}

export const AUTO_BRANDS = [
  // Europene
  'Abarth', 'Alfa Romeo', 'Audi', 'BMW', 'Chevrolet', 'Chrysler', 'Citroën',
  'Dacia', 'Daewoo', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Jaguar', 'Jeep',
  'Kia', 'Land Rover', 'Lexus', 'Mazda', 'Mercedes-Benz', 'Mini', 'Mitsubishi',
  'Nissan', 'Opel', 'Peugeot', 'Porsche', 'Renault', 'Seat', 'Skoda', 'Smart',
  'Subaru', 'Suzuki', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo',
  // Electrice chinezești
  'BYD', 'Denza', 'Fang Cheng Bao', 'NIO', 'Xpeng', 'Li Auto', 'AION', 'Zeekr', 'Lynk & Co',
  'MG', 'Great Wall', 'Ora', 'Chery', 'Omoda', 'SAIC', 'Geely', 'Dongfeng', 'Voyah', 'BAIC',
  'JAC', 'Leapmotor', 'Neta', 'Wuling', 'Avatr', 'HiPhi', 'Aito', 'Seres', 'Deepal',
  'Polestar', 'Lucid', 'Rivian', 'Fisker',
]

export const AUTO_MODELS: Record<string, string[]> = {
  'Abarth': ['500', '595', '695', '124 Spider', 'Pulse', '600e'],
  'Alfa Romeo': ['Giulia', 'Stelvio', 'Tonale', 'Giulietta', 'MiTo', '147', '156', '159', 'Brera', 'Spider', '4C'],
  'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q4 e-tron', 'Q5', 'Q7', 'Q8', 'Q8 e-tron', 'e-tron GT', 'TT', 'R8'],
  'BMW': ['Seria 1', 'Seria 2', 'Seria 3', 'Seria 4', 'Seria 5', 'Seria 6', 'Seria 7', 'Seria 8', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'iX1', 'iX3', 'i4', 'i5', 'i7', 'iX', 'Z4', 'M2', 'M3', 'M4', 'M5'],
  'Chevrolet': ['Spark', 'Aveo', 'Cruze', 'Malibu', 'Captiva', 'Trax', 'Equinox', 'Traverse', 'Orlando', 'Camaro', 'Corvette', 'Bolt EV'],
  'Chrysler': ['300C', 'Voyager', 'Grand Voyager', 'Sebring', 'PT Cruiser'],
  'Citroën': ['C1', 'C2', 'C3', 'C3 Aircross', 'C4', 'C4 Cactus', 'C5', 'C5 Aircross', 'C5 X', 'Berlingo', 'Spacetourer', 'e-C3', 'Ami'],
  'Dacia': ['Logan', 'Logan MCV', 'Sandero', 'Sandero Stepway', 'Duster', 'Spring', 'Jogger', 'Dokker', 'Lodgy', 'Pick Up'],
  'Daewoo': ['Matiz', 'Spark', 'Kalos', 'Lacetti', 'Nubira', 'Leganza', 'Tacuma'],
  'Fiat': ['Panda', '500', '500X', '500L', 'Tipo', 'Bravo', 'Punto', 'Stilo', 'Doblo', 'Ducato', '500e', 'Abarth 600e'],
  'Ford': ['Ka', 'Fiesta', 'Focus', 'Mondeo', 'Galaxy', 'S-Max', 'Kuga', 'EcoSport', 'Puma', 'Edge', 'Explorer', 'Ranger', 'Transit', 'Mustang', 'Mustang Mach-E', 'Explorer Electric'],
  'Honda': ['Jazz', 'Civic', 'Accord', 'CR-V', 'HR-V', 'ZR-V', 'e:Ny1', 'e:NS1', 'FR-V', 'Legend', 'e'],
  'Hyundai': ['i10', 'i20', 'i30', 'i40', 'ix20', 'ix35', 'Tucson', 'Santa Fe', 'Kona', 'Kona Electric', 'IONIQ', 'IONIQ 5', 'IONIQ 6', 'Elantra', 'Nexo'],
  'Jaguar': ['XE', 'XF', 'XJ', 'E-Pace', 'F-Pace', 'I-Pace', 'F-Type'],
  'Jeep': ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler', 'Avenger', 'Commander'],
  'Kia': ['Picanto', 'Rio', 'Ceed', 'ProCeed', 'Stonic', 'Niro', 'Niro EV', 'Sportage', 'Sorento', 'Xceed', 'EV6', 'EV9', 'Soul', 'Carnival'],
  'Land Rover': ['Discovery Sport', 'Discovery', 'Freelander', 'Range Rover Evoque', 'Range Rover Velar', 'Range Rover Sport', 'Range Rover', 'Defender'],
  'Lexus': ['CT', 'IS', 'ES', 'GS', 'LS', 'UX', 'NX', 'RX', 'LX', 'RC', 'LC', 'RZ'],
  'Mazda': ['2', '3', '6', 'CX-3', 'CX-30', 'CX-5', 'CX-60', 'CX-80', 'MX-5', 'MX-30'],
  'Mercedes-Benz': ['Clasa A', 'Clasa B', 'Clasa C', 'Clasa CLA', 'Clasa CLS', 'Clasa E', 'Clasa GLA', 'Clasa GLB', 'Clasa GLC', 'Clasa GLE', 'Clasa GLS', 'Clasa S', 'Clasa V', 'EQA', 'EQB', 'EQC', 'EQE', 'EQS', 'AMG GT', 'G-Class', 'Sprinter', 'Vito'],
  'Mini': ['One', 'Cooper', 'Cooper S', 'Clubman', 'Countryman', 'Paceman', 'Cabrio', 'John Cooper Works', 'Electric'],
  'Mitsubishi': ['Colt', 'Lancer', 'Galant', 'Eclipse Cross', 'ASX', 'Outlander', 'Outlander PHEV', 'Pajero', 'L200', 'Space Star'],
  'Nissan': ['Micra', 'Note', 'Juke', 'Qashqai', 'X-Trail', 'Murano', 'Pathfinder', 'Navara', 'GT-R', 'Leaf', 'Ariya', '370Z', '350Z'],
  'Opel': ['Adam', 'Agila', 'Astra', 'Cascada', 'Corsa', 'Crossland', 'Grandland', 'Insignia', 'Karl', 'Meriva', 'Mokka', 'Mokka Electric', 'Corsa Electric', 'Grandland Electric', 'Vectra', 'Zafira', 'Combo'],
  'Peugeot': ['107', '108', '205', '206', '207', '208', '308', '408', '508', '2008', '3008', '5008', 'e-208', 'e-2008', 'e-308', 'Rifter', 'Traveller', 'Expert'],
  'Porsche': ['911', '718 Boxster', '718 Cayman', 'Macan', 'Cayenne', 'Panamera', 'Taycan', 'Macan Electric'],
  'Renault': ['Twingo', 'Clio', 'Megane', 'Laguna', 'Talisman', 'Scenic', 'Grand Scenic', 'Captur', 'Kadjar', 'Koleos', 'Austral', 'Arkana', 'Zoe', 'Megane E-Tech', 'Scenic E-Tech', 'Kangoo', 'Trafic'],
  'Seat': ['Mii', 'Ibiza', 'Leon', 'Toledo', 'Ateca', 'Arona', 'Tarraco', 'Formentor', 'Born'],
  'Skoda': ['Fabia', 'Rapid', 'Octavia', 'Superb', 'Karoq', 'Kodiaq', 'Scala', 'Kamiq', 'Enyaq', 'Enyaq Coupe'],
  'Smart': ['Fortwo', 'Forfour', '#1', '#3'],
  'Subaru': ['Impreza', 'Legacy', 'Outback', 'Forester', 'XV', 'BRZ', 'WRX', 'Solterra'],
  'Suzuki': ['Alto', 'Celerio', 'Swift', 'Baleno', 'Vitara', 'S-Cross', 'Jimny', 'SX4', 'Ignis', 'Across'],
  'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck', 'Roadster'],
  'Toyota': ['Aygo', 'Yaris', 'Yaris Cross', 'Corolla', 'Auris', 'Avensis', 'Camry', 'C-HR', 'RAV4', 'Highlander', 'Land Cruiser', 'Prius', 'bZ4X', 'Proace City', 'Hilux'],
  'Volkswagen': ['up!', 'Polo', 'Golf', 'Golf Plus', 'Jetta', 'Passat', 'Arteon', 'T-Cross', 'T-Roc', 'Tiguan', 'Touareg', 'Touran', 'Sharan', 'Transporter', 'Caddy', 'ID.3', 'ID.4', 'ID.5', 'ID.7'],
  'Volvo': ['V40', 'V60', 'V90', 'S60', 'S90', 'XC40', 'XC60', 'XC90', 'C40 Recharge', 'XC40 Recharge', 'EX30', 'EX40', 'EX90', 'EC40'],
  // Electrice chinezești
  'BYD': ['Atto 2', 'Atto 3', 'Han', 'Han EV', 'Han DM', 'Tang', 'Tang EV', 'Tang DM', 'Seal', 'Seal U', 'Seal U DM', 'Sealion 6', 'Sealion 7', 'Dolphin', 'Dolphin Mini', 'Seagull', 'Song Plus EV', 'Song Plus DM', 'Song L', 'Yuan Plus', 'Shark', 'Frigate 07', 'Yangwang U8', 'Yangwang U9'],
  'NIO': ['ES6', 'ES7', 'ES8', 'ET5', 'ET5 Touring', 'ET7', 'EC6', 'EC7', 'EL6', 'EL7'],
  'Xpeng': ['G3', 'G6', 'G9', 'P5', 'P7', 'P7i', 'X9', 'Mona M03'],
  'Li Auto': ['L6', 'L7', 'L8', 'L9', 'MEGA'],
  'AION': ['Y', 'Y Plus', 'S', 'S Plus', 'V', 'LX', 'LX Plus', 'Hyper GT', 'Hyper SSR'],
  'Zeekr': ['001', '007', 'X', '009', 'Mix'],
  'MG': ['MG3', 'MG5', 'MG ZS', 'MG ZS EV', 'MG4', 'MG HS', 'MG HS PHEV', 'Marvel R', 'Cyberster', 'MG7'],
  'Lynk & Co': ['01', '01 PHEV', '02', '03', '05', '06', '09', 'Zero Concept'],
  'Great Wall': ['Haval H6', 'Haval Jolion', 'Haval H9', 'WEY Coffee 01', 'Tank 300', 'Tank 500'],
  'Ora': ['Funky Cat', 'Good Cat', 'Lightning Cat', '03'],
  'Chery': ['Tiggo 4 Pro', 'Tiggo 7 Pro', 'Tiggo 8 Pro', 'Omoda 5', 'Omoda E5', 'Exlantix ES', 'Jetour'],
  'Geely': ['Emgrand', 'Coolray', 'Azkarra', 'Geometry C', 'Geometry A', 'Galaxy E8', 'Preface'],
  'SAIC': ['Roewe RX5', 'Roewe ei6', 'IM L7', 'IM LS7'],
  'Dongfeng': ['Aeolus AX7', 'Forthing T5', 'Box'],
  'BAIC': ['EC3', 'EC5', 'EU5', 'BJ40', 'BJ60', 'Arcfox Alpha-T', 'Arcfox Alpha-S'],
  'JAC': ['JS4', 'JS6', 'E10X', 'iEV6E', 'iEV7S', 'Yiwei'],
  'Neta': ['U', 'U Pro', 'V', 'V Pro', 'S', 'GT', 'X'],
  'Leapmotor': ['T03', 'C01', 'C10', 'C11'],
  'Wuling': ['Mini EV', 'Air EV', 'Bingo', 'Starlight'],
  'Avatr': ['11', '12'],
  'HiPhi': ['X', 'Z', 'Y'],
  'Denza': ['N7', 'N8', 'D9', 'Z9 GT'],
  'Fang Cheng Bao': ['Leopard 5', 'Leopard 6', 'Bao 8'],
  'Omoda': ['5', 'E5', 'C5', '7'],
  'Voyah': ['Free', 'Dream', 'Passion'],
  'Aito': ['M5', 'M5 EV', 'M7', 'M9'],
  'Seres': ['SF5', 'Aito M5', 'Aito M7'],
  'Deepal': ['SL03', 'S7', 'L07'],
  'Polestar': ['1', '2', '3', '4'],
  'Lucid': ['Air', 'Gravity'],
  'Rivian': ['R1T', 'R1S', 'R2'],
  'Fisker': ['Ocean', 'Pear', 'Alaska'],
}

export const CAROSERIE_TYPES = [
  'Berlina', 'SUV', 'Hatchback', 'Break/Combi', 'Coupe', 'Cabrio', 'Monovolum', 'Pickup', 'Van'
]

export const TRUCK_BRANDS = [
  'DAF', 'Iveco', 'MAN', 'Mercedes-Benz', 'Renault Trucks', 'Scania', 'Volvo Trucks',
  'Ford', 'Fiat', 'Volkswagen', 'Toyota', 'Mitsubishi Fuso', 'Isuzu', 'Hino',
]

export const TRUCK_BODY_TYPES = [
  'Autotractor', 'Basculantă', 'Platformă', 'Frigorifică', 'Izoterma',
  'Cisternă', 'Betonieră', 'Container', 'Forestier', 'Altele',
]

export const UTILITY_BRANDS = [
  'Citroën', 'Fiat', 'Ford', 'Mercedes-Benz', 'Opel', 'Peugeot',
  'Renault', 'Toyota', 'Volkswagen', 'Nissan', 'Iveco', 'DAF', 'MAN',
]

export const PIESE_CATEGORIES = [
  'Motor și accesorii', 'Transmisie', 'Suspensie și direcție', 'Frâne',
  'Caroserie și elemente vizuale', 'Interior', 'Electricitate și electronice',
  'Evacuare', 'Răcire', 'Climatizare', 'Anvelope și jante', 'Altele',
]

export const AGRICOLE_TYPES = [
  'Tractor', 'Combină', 'Plug', 'Cultivator', 'Semănătoare', 'Presă baloți',
  'Remorcă agricolă', 'Pulverizator', 'Încărcător frontal', 'Disc', 'Grapă', 'Altele',
]

export const AGRICOLE_BRANDS = [
  'Case IH', 'Claas', 'Deutz-Fahr', 'Fendt', 'John Deere', 'Kubota',
  'Massey Ferguson', 'New Holland', 'Same', 'Zetor', 'Farmtrac', 'MTZ Belarus', 'Altele',
]

export const REMORCI_TYPES = [
  'Remorcă auto', 'Remorcă cargo/platformă', 'Remorcă basculantă',
  'Remorcă barcă', 'Rulotă', 'Semiremorcă', 'Remorcă frigorifică',
  'Remorcă cisternă', 'Remorcă lemne', 'Altele',
]

export const CONSTRUCTII_TYPES = [
  'Excavator', 'Buldozer', 'Încărcător frontal', 'Macara', 'Compactor',
  'Autobetonieră', 'Pompă beton', 'Nacela', 'Schela', 'Generator',
  'Compresor', 'Mini-excavator', 'Graifer', 'Altele',
]

export const CONSTRUCTII_BRANDS = [
  'Caterpillar', 'Komatsu', 'Volvo CE', 'Liebherr', 'Terex', 'JCB',
  'Bobcat', 'Hyundai', 'Doosan', 'Hitachi', 'Manitou', 'Altele',
]

const currentYear = new Date().getFullYear()
export const YEARS = Array.from({ length: 40 }, (_, i) => String(currentYear - i))

// ─── IMOBILIARE ───────────────────────────────────────────────
export const IMOB_TIP_TRANZACTIE = ['Vânzare', 'Închiriere', 'Regim hotelier']
export const IMOB_TIP_APARTAMENT = ['Garsonieră', '2 camere', '3 camere', '4 camere', '5+ camere']
export const IMOB_COMPARTIMENTARE = ['Decomandat', 'Semidecomandat', 'Nedecomandat', 'Studio', 'Circular']
export const IMOB_STARE = ['Nou', 'Renovat recent', 'Bun', 'Necesită renovare', 'Bloc nou']
export const IMOB_TIP_CASA = ['Vilă', 'Casă', 'Duplex', 'Triplex', 'Casă de vacanță', 'Casă tradițională']
export const IMOB_TIP_TEREN = ['Intravilan - construcții', 'Intravilan - agricol', 'Extravilan - agricol', 'Pădure', 'Industrial', 'Mixt']
export const IMOB_TIP_SPATIU = ['Birou', 'Spațiu comercial', 'Depozit', 'Industrial', 'Pensiune/hotel', 'Restaurant/bar', 'Hală']
export const IMOB_FACILITATI = ['Parcare', 'Balcon/terasă', 'Lift', 'Boxa/magazie', 'Piscină', 'Grădină', 'Garaj', 'Aer condiționat', 'Centrală proprie', 'Interfon/videointerfon']
export const IMOB_ETAJE = ['Parter', 'Etaj 1', 'Etaj 2', 'Etaj 3', 'Etaj 4', 'Etaj 5', 'Etaj 6', 'Etaj 7', 'Etaj 8', 'Etaj 9', 'Etaj 10+', 'Mansardă', 'Demisol', 'Subsol']
export const IMOB_AN_CONSTRUCTIE = ['Înainte de 1980', '1980-1990', '1990-2000', '2000-2010', '2010-2015', '2015-2020', '2020-2025', '2025+']
export const IMOB_DESTINATIE = ['Rezidențial', 'Comercial', 'Mixt', 'Investiție']

// ─── JOBURI ───────────────────────────────────────────────────
export const JOB_DOMENII = [
  'IT & Software', 'Inginerie', 'Vânzări & Marketing', 'Contabilitate & Finanțe',
  'Resurse Umane', 'Juridic', 'Logistică & Transport', 'HoReCa & Turism',
  'Construcții & Imobiliare', 'Medical & Farmacie', 'Educație', 'Producție',
  'Agricultură', 'Servicii Clienți', 'Design & Creativ', 'Management',
  'Administrație', 'Altele',
]
export const JOB_TIP_CONTRACT = ['Full-time', 'Part-time', 'Contract proiect', 'Stagiu/Internship', 'Sezonier', 'Freelance', 'Colaborare']
export const JOB_NIVEL_EXPERIENTA = ['Fără experiență', 'Sub 1 an', '1-2 ani', '3-5 ani', '5-10 ani', 'Peste 10 ani']
export const JOB_REGIM_MUNCA = ['La birou (On-site)', 'Remote', 'Hibrid', 'Pe teren', 'Tură/schimburi']
export const JOB_NIVEL_STUDII = ['Fără studii obligatorii', 'Liceu/Bacalaureat', 'Școală profesională', 'Facultate/Licență', 'Master/Postuniversitar', 'Doctorat']
export const JOB_BENEFICII = ['Tichete de masă', 'Asigurare medicală privată', 'Bonusuri de performanță', 'Mașină de serviciu', 'Laptop & telefon', 'Pensie privată', 'Abonament sală', 'Zile libere extra', 'Formare profesională', 'Decontare transport']
export const JOB_IT_STACK = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'PHP', 'Go', 'Rust', 'Swift', 'Kotlin', 'React', 'Vue', 'Angular', 'Node.js', 'Next.js', '.NET', 'Spring', 'Django', 'Flutter', 'React Native', 'DevOps', 'AWS', 'Azure', 'GCP']

// ─── SERVICII ─────────────────────────────────────────────────
export const SERVICII_CATEGORII = [
  'Construcții & Renovări', 'Instalații sanitare & termice', 'Electricitate',
  'Curățenie & Menaj', 'Mutări & Transport', 'IT & Calculatoare',
  'Contabilitate & Juridic', 'Îngrijire & Sănătate', 'Frumusețe & Wellness',
  'Evenimente & Foto/Video', 'Meditații & Educație', 'Auto & Mecanică',
  'Grădinărit & Amenajări', 'Animale de companie', 'Design & Grafică', 'Altele',
]
export const SERVICII_DISPONIBILITATE = ['Imediat', 'În termen de o săptămână', 'La cerere', 'Program fix', 'Weekend', 'Non-stop']
export const SERVICII_ZONA = ['La domiciliul clientului', 'La sediul meu', 'Online/Remote', 'Oriunde în oraș', 'Județ', 'Național']
export const SERVICII_EXPERIENTA = ['Sub 1 an', '1-3 ani', '3-5 ani', '5-10 ani', 'Peste 10 ani']

// ─── MOTO ─────────────────────────────────────────────────────
export const MOTO_BRANDS = [
  'BMW', 'Ducati', 'Honda', 'Husqvarna', 'Kawasaki', 'KTM', 'MV Agusta',
  'Piaggio', 'Royal Enfield', 'Suzuki', 'Triumph', 'Vespa', 'Yamaha', 'Zero', 'Altele',
]
export const MOTO_TYPES = ['Sport', 'Naked', 'Touring', 'Adventure', 'Enduro/Cross', 'Scooter', 'Custom/Chopper', 'Trial', 'Moped', 'Electric']
export const MOTO_CC = ['Sub 125cc', '125-250cc', '250-500cc', '500-750cc', '750-1000cc', 'Peste 1000cc']

// ─── ELECTRONICE ──────────────────────────────────────────────
export const ELECTRO_STARE = ['Nou (sigilat)', 'Nou (fără cutie)', 'Second-hand - ca nou', 'Second-hand - bun', 'Defect/Piese']
export const TELEFON_BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'OnePlus', 'Google', 'Sony', 'Motorola', 'Nokia', 'Oppo', 'Realme', 'Vivo', 'Nothing', 'Altele']
export const TELEFON_STOCARE = ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB']
export const TELEFON_RAM = ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB']
export const LAPTOP_BRANDS = ['Apple', 'Asus', 'Acer', 'Dell', 'HP', 'Lenovo', 'MSI', 'Microsoft', 'Razer', 'Samsung', 'LG', 'Toshiba', 'Altele']
export const LAPTOP_RAM = ['4GB', '8GB', '16GB', '32GB', '64GB']
export const LAPTOP_STOCARE = ['128GB', '256GB', '512GB', '1TB', '2TB', '4TB']
export const LAPTOP_DIAGONALA = ['11"', '12"', '13"', '14"', '15"', '15.6"', '16"', '17"', '18"']
export const LAPTOP_OS = ['Windows 11', 'Windows 10', 'macOS', 'Linux', 'ChromeOS', 'Fără sistem de operare']
export const LAPTOP_PROCESOR = ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'Intel Core Ultra', 'AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9', 'Apple M1', 'Apple M2', 'Apple M3', 'Apple M4']
export const TV_DIAGONALA = ['24"', '32"', '40"', '43"', '50"', '55"', '58"', '65"', '70"', '75"', '85"', '98"+']
export const TV_REZOLUTIE = ['HD (720p)', 'Full HD (1080p)', '4K (2160p)', '8K']
export const TV_TIP = ['LED/LCD', 'OLED', 'QLED/AMOLED', 'QNED', 'MicroLED', 'Proiector']
export const AUDIO_TIP = ['Căști on-ear/over-ear', 'Căști in-ear', 'Boxe portabile', 'Soundbar', 'Sistem home cinema', 'Amplificator', 'Subwoofer', 'Altele']
export const GAMING_PLATFORMA = ['PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One', 'Nintendo Switch', 'PC Gaming', 'Retro / Alte console']
export const GAMING_TIP = ['Consolă', 'Joc fizic', 'Accesoriu', 'Scaun gaming', 'Monitor gaming', 'Periferice PC']
export const FOTO_TIP = ['DSLR', 'Mirrorless', 'Compact', 'Instant', 'Cameră acțiune / Dronă', 'Obiectiv', 'Trepied & Accesorii', 'Cameră video']
export const FOTO_BRANDS = ['Canon', 'Nikon', 'Sony', 'Fujifilm', 'Panasonic', 'Olympus', 'Leica', 'GoPro', 'DJI', 'Altele']
export const TABLETA_STOCARE = ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB']
export const TABLETA_CONECTIVITATE = ['WiFi', 'WiFi + 4G/LTE', 'WiFi + 5G']

// ─── MODĂ ─────────────────────────────────────────────────────
export const MODA_STARE = ['Nou cu etichetă', 'Nou fără etichetă', 'Folosit - ca nou', 'Folosit - bun', 'Folosit - acceptabil']
export const MODA_GEN = ['Femei', 'Bărbați', 'Fete', 'Băieți', 'Unisex']
export const MODA_MARIMI_ADULTI = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL+']
export const MODA_MARIMI_PANTOFI = ['34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47+']
export const MODA_MARIMI_COPII = ['0-3 luni', '3-6 luni', '6-12 luni', '1-2 ani', '2-3 ani', '3-4 ani', '4-5 ani', '5-6 ani', '6-8 ani', '8-10 ani', '10-12 ani', '12-14 ani', '14-16 ani']
export const MODA_MATERIAL = ['Bumbac', 'Poliester', 'Denim / Jean', 'Lână', 'Mătase', 'Piele naturală', 'Piele ecologică', 'Catifea', 'In', 'Viscoză', 'Nylon', 'Amestec']
export const BIJUTERII_TIP = ['Inel', 'Colier / Lanț', 'Brățară', 'Cercei', 'Ceas bărbătesc', 'Ceas dama', 'Set bijuterii', 'Brose', 'Altele']
export const BIJUTERII_MATERIAL = ['Aur 14k', 'Aur 18k', 'Aur 24k', 'Argint', 'Platină', 'Titan', 'Oțel inoxidabil', 'Bijuterie fashion', 'Altele']
export const GENTI_TIP = ['Geantă de mână', 'Rucsac', 'Geantă de umăr', 'Portmoneu / Portofel', 'Geantă laptop', 'Valiză / Troleu', 'Geantă sport', 'Altele']

// ─── CASĂ & GRĂDINĂ ──────────────────────────────────────────
export const CASA_STARE = ['Nou (în cutie)', 'Nou (fără cutie)', 'Ca nou', 'Bun', 'Acceptabil', 'Necesită reparații']
export const MOBILA_TIP = ['Canapea / Colțar', 'Pat / Somieră', 'Dulap / Șifonier', 'Masă & Scaune', 'Bibliotecă / Raft', 'Birou', 'Comodă / Noptieră', 'Fotoliu', 'Mobilă bucătărie', 'Mobilier baie', 'Mobilier hol', 'Altele']
export const MOBILA_MATERIAL = ['Lemn masiv', 'PAL / MDF', 'Metal', 'Sticlă', 'Tapițat', 'Rattan / Împletit', 'Plastic', 'Altele']
export const ELECTROCASNICE_TIP = ['Frigider / Combină', 'Mașină de spălat', 'Uscător de rufe', 'Mașină de spălat vase', 'Cuptor', 'Plită', 'Microunde', 'Aspirator', 'Robot de bucătărie', 'Cafetieră', 'Aer condiționat', 'Ventilator / Răcitor', 'Convector / Calorifer', 'Fer de călcat', 'Altele']
export const ELECTROCASNICE_BRANDS = ['Bosch', 'Samsung', 'LG', 'Whirlpool', 'Indesit', 'Arctic', 'Zanussi', 'Electrolux', 'Beko', 'Candy', 'Gorenje', 'Philips', 'Tefal', 'Dyson', 'Altele']
export const GRADINA_TIP = ['Mobilier grădină / Terasă', 'Unelte & Echipamente', 'Plante & Semințe', 'Jardiniere & Ghivece', 'Sisteme irigații', 'Piscine & Accesorii', 'Grătare & BBQ', 'Iluminat exterior', 'Altele']
export const DECORARE_TIP = ['Tablouri & Postere', 'Covoare & Mochete', 'Draperii & Perdele', 'Vaze & Decoruri', 'Lumânări & Aromaterapie', 'Oglinzi', 'Ceasuri de perete', 'Perne & Textile', 'Altele']
export const ILUMINAT_TIP = ['Lustră / Plafonieră', 'Lampă de masă / Podea', 'Aplică de perete', 'Spot / Downlight', 'Bandă LED', 'Bec smart', 'Proiector LED', 'Lanternă', 'Altele']
export const BRICOLAJ_TIP = ['Unelte electrice', 'Unelte manuale', 'Scule pneumatice', 'Echipament de sudură', 'Compresoare', 'Materiale construcții', 'Vopsele & Tencuieli', 'Altele']

// ─── SPORT ────────────────────────────────────────────────────
export const SPORT_STARE = ['Nou (neutilizat)', 'Ca nou', 'Bun', 'Acceptabil']
export const SPORT_TIP = ['Fotbal', 'Baschet', 'Volei', 'Tenis', 'Badminton', 'Box & Arte marțiale', 'Atletism', 'Înot', 'Golf', 'Rugby', 'Baseball', 'Hochei', 'Altele']
export const BICICLETA_TIP = ['MTB / Mountain bike', 'Road / Cursieră', 'City / Trekking', 'BMX', 'Electric / E-bike', 'Fat bike', 'Copii', 'Altele']
export const BICICLETA_BRANDS = ['Trek', 'Giant', 'Specialized', 'Cannondale', 'Scott', 'Merida', 'Cube', 'Bianchi', 'Orbea', 'Focus', 'Kross', 'Altele']
export const BICICLETA_CADRU = ['XS (13"-14")', 'S (15"-16")', 'M (17"-18")', 'L (19"-20")', 'XL (21"-22")', 'XXL (23"+)']
export const FITNESS_TIP = ['Bicicletă fitness / spinning', 'Bandă de alergare', 'Eliptic / Stepper', 'Aparat multifuncțional', 'Gantere & Bare', 'Greutăți & Discuri', 'Saltea & Yoga', 'TRX & Benzi', 'Banca fitness', 'Altele']
export const OUTDOOR_TIP = ['Cort', 'Sac de dormit', 'Rucsac drumeție', 'Bocanci & Încălțăminte', 'Îmbrăcăminte outdoor', 'Echipament escaladă', 'Kayak & Caiac', 'Altele']
export const SPORTURI_APA_TIP = ['Surf / Windsurf', 'Kiteboarding', 'Scuba Diving', 'Snorkeling', 'Paddleboarding (SUP)', 'Caiac & Kayak', 'Barcă & Accesorii', 'Altele']
export const SPORTURI_IARNA_TIP = ['Ski alpin', 'Snowboard', 'Ski fond', 'Sanie', 'Patine', 'Îmbrăcăminte ski', 'Altele']

// ─── ANIMALE ──────────────────────────────────────────────────
export const ANIMALE_VARSTA = ['Sub 3 luni (pui)', '3-6 luni', '6-12 luni', '1-3 ani', '3-7 ani', 'Peste 7 ani (senior)']
export const ANIMALE_SEX = ['Mascul', 'Femelă']
export const CAINI_RASE = [
  'Labrador', 'Golden Retriever', 'German Shepherd', 'Bulldog Francez', 'Beagle',
  'Poodle / Pudel', 'Rottweiler', 'Yorkshire Terrier', 'Husky Siberian', 'Dachshund',
  'Boxer', 'Doberman', 'Maltese', 'Chihuahua', 'Shih Tzu', 'Border Collie',
  'Cocker Spaniel', 'Mops / Pug', 'Bichon', 'Ciobănesc Românesc Carpatin',
  'Mioritic', 'Metis / Mix', 'Altă rasă',
]
export const PISICI_RASE = [
  'Persan', 'Maine Coon', 'Siamese', 'Bengal', 'British Shorthair',
  'Ragdoll', 'Scottish Fold', 'Sphynx', 'Abisinian', 'Norwegian Forest Cat',
  'Birman', 'Devon Rex', 'Metis / Mix', 'Altă rasă',
]
export const ACCESORII_ANIMALE_TIP = ['Hrană uscată', 'Hrană umedă', 'Gulere & Lese', 'Cuști & Adăposturi', 'Jucării', 'Îmbrăcăminte', 'Toaletare', 'Patul & Saltele', 'Acvariu & Accesorii', 'Altele']

// ─── MAMĂ & COPILUL ───────────────────────────────────────────
export const MAMA_STARE = ['Nou cu etichetă', 'Nou fără etichetă', 'Ca nou', 'Bun', 'Acceptabil']
export const MAMA_VARSTA_COPIL = ['0-3 luni', '3-6 luni', '6-12 luni', '1-2 ani', '2-3 ani', '3-4 ani', '4-5 ani', '5-6 ani', '6-8 ani', '8-10 ani', '10-12 ani', '12+ ani']
export const MAMA_GEN_COPIL = ['Fată', 'Băiat', 'Unisex']
export const JUCARII_VARSTA = ['0-1 an', '1-3 ani', '3-5 ani', '5-8 ani', '8-12 ani', '12+ ani']
export const JUCARII_TIP = ['Jucării educative', 'Lego & Construcție', 'Mașinuțe & Vehicule', 'Păpuși & Figurine', 'Jocuri de masă', 'Jocuri video & Console', 'Jocuri de exterior', 'Instrumente muzicale copii', 'Altele']
export const CARUCIOR_TIP = ['Cărucior complet (landou + sport)', 'Landou', 'Cărucior sport / ușor', 'Jogger', 'Cărucior geamăn', 'Scaun auto grup 0+', 'Scaun auto grup 1', 'Scaun auto grup 2-3', 'Altele']
export const CARUCIOR_BRANDS = ['Britax Römer', 'Bugaboo', 'Cybex', 'Doona', 'Inglesina', 'Jane', 'Maxi-Cosi', 'Nuna', 'Quinny', 'Silver Cross', 'Stokke', 'Thule', 'UPPAbaby', 'Altele']
export const MOBILIER_COPII_TIP = ['Pătuț bebeluș', 'Pat copil', 'Leagăn & Șezlong', 'Balansoar', 'Masă de înfășat', 'Masă & scaun copii', 'Scaun înalt', 'Saltea', 'Altele']
export const INGRIJIRE_TIP = ['Cădiță & Accesorii baie', 'Sterilizatoare', 'Pompe de sân', 'Monitor bebeluș', 'Termometre', 'Biberon & Suzete', 'Sac de dormit bebeluș', 'Marsupiu & Hamac', 'Altele']
