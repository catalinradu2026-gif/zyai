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
    { slug: 'motociclete', name: 'Motociclete', icon: '🏍️' },
    { slug: 'camioane', name: 'Camioane', icon: '🚛' },
    { slug: 'agricole', name: 'Agricole', icon: '🚜' },
    { slug: 'remorci', name: 'Remorci', icon: '🔗' },
    { slug: 'constructii', name: 'Constructii', icon: '🏗️' },
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

const currentYear = new Date().getFullYear()
export const YEARS = Array.from({ length: 40 }, (_, i) => String(currentYear - i))
