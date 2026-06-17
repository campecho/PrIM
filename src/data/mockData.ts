import { FileAsset, PrintCustomer } from "../types";

export const MOCK_CUSTOMERS: PrintCustomer[] = [
  {
    id: "1",
    accountNumber: "100200301",
    companyName: "Acme Corp",
    city: "Chicago",
    state: "IL",
    threePP: "Coupa",
    printToStore: true,
    assignedSpecs: ["spec-rack-card-4x12"],
    notes: [
      {
        id: "n1",
        author: "Alex Miller",
        date: "04/15/2026",
        text: "Spoke with Bob about the new branding requirements.",
      },
      {
        id: "n2",
        author: "Alex Miller",
        date: "04/10/2026",
        text: "Initial setup complete.",
      },
    ],
  },
  {
    id: "2",
    accountNumber: "900800701",
    companyName: "Globex",
    city: "San Francisco",
    state: "CA",
    threePP: "No",
    printToStore: false,
    notes: [],
  },
  {
    id: "3",
    accountNumber: "123456789",
    companyName: "Soylent Corp",
    city: "New York",
    state: "NY",
    threePP: "Oracle",
    printToStore: true,
    notes: [
      {
        id: "n3",
        author: "Bob Jones",
        date: "03/20/2026",
        text: "High volume customer.",
      },
    ],
  },
  {
    id: "4",
    accountNumber: "888777666",
    companyName: "Initech",
    city: "Austin",
    state: "TX",
    threePP: "Workday",
    printToStore: false,
    notes: [],
  },
  {
    id: "5",
    accountNumber: "111222333",
    companyName: "Umbrella Corp",
    city: "Raccoon City",
    state: "MO",
    threePP: "No",
    printToStore: true,
    notes: [],
  },
  {
    id: "6",
    accountNumber: "444555666",
    companyName: "Stark Ind.",
    city: "Malibu",
    state: "CA",
    threePP: "Workday",
    printToStore: true,
    notes: [],
  },
  {
    id: "7",
    accountNumber: "777888999",
    companyName: "Wayne Ent.",
    city: "Gotham",
    state: "NJ",
    threePP: "Coupa",
    printToStore: false,
    notes: [],
  },
  {
    id: "8",
    accountNumber: "222333444",
    companyName: "Cyberdyne",
    city: "Los Angeles",
    state: "CA",
    threePP: "No",
    printToStore: true,
    notes: [],
  },
  {
    id: "9",
    accountNumber: "555444333",
    companyName: "Massive Dynamic",
    city: "Boston",
    state: "MA",
    threePP: "Oracle",
    printToStore: false,
    notes: [],
  },
  {
    id: "10",
    accountNumber: "111222444",
    companyName: "Hooli",
    city: "Palo Alto",
    state: "CA",
    threePP: "No",
    printToStore: true,
    notes: [],
  },
  {
    id: "11",
    accountNumber: "333444555",
    companyName: "Pied Piper",
    city: "San Jose",
    state: "CA",
    threePP: "Coupa",
    printToStore: false,
    notes: [],
  },
  {
    id: "12",
    accountNumber: "666777888",
    companyName: "Aviato",
    city: "San Francisco",
    state: "CA",
    threePP: "Workday",
    printToStore: true,
    notes: [],
  },
];


export const MOCK_FILES: FileAsset[] = Array.from({ length: 50 }).map((_, i) => {
  const types = [
    "PNG",
    "JPG",
    "SVG",
    "PDF",
    "MP4",
    "GIF",
    "WEBM",
    "DOCX",
    "XLSX",
  ];
  const sizes = [
    '9.92" x 13.89"',
    "1920 x 1080 px",
    '8.5" x 11"',
    "500 x 500 px",
    "1080 x 1920 px",
  ];
  const users = ["Alice Smith", "Bob Jones", "Charlie Brown", "Diana Prince"];
  const realAccountNumbers = [
    "100200301",
    "900800701",
    "123456789",
    "888777666",
    "111222333",
    "444555666",
    "777888999",
    "222333444",
    "555444333",
  ];
  return {
    id: i,
    name: `File_${i}.${types[i % types.length].toLowerCase()}`,
    dimensions: sizes[i % sizes.length],
    type: types[i % types.length],
    updatedAt: `04/${((i % 28) + 1).toString().padStart(2, "0")}/2026`,
    description: `This is a sample description for file ${i}. It provides context about the file's purpose and contents.`,
    fileId: `123e4567-e89b-12d3-a456-4266141740${i.toString().padStart(2, "0")}`,
    version: `v${(i % 5) + 1}.0`,
    lastUpdatedBy: users[i % users.length],
    customerAccounts: [
      realAccountNumbers[i % 9],
      realAccountNumbers[(i + 3) % 9],
    ],
    addedBy: users[(i + 1) % users.length],
    ownedBy: users[(i + 2) % users.length],
    isShared: i % 2 === 0,
    sku: `SKU-${1000 + i}`,
    fileSize: ["1.2 MB", "4.5 MB", "12 MB", "500 KB"][i % 4],
    pageCount: ["PNG", "JPG", "SVG", "GIF"].includes(types[i % types.length])
      ? 1
      : (i % 10) + 1,
    colorMode: i % 3 === 0 ? "CMYK" : "RGB",
    resolutionDpi: [72, 150, 300][i % 3],
    preflightCheck: true,
  };
});


export const fileTypeCounts = MOCK_FILES.reduce(
  (acc, file) => {
    acc[file.type] = (acc[file.type] || 0) + 1;
    return acc;
  },
  {} as Record<string, number>,
);


export const SORTED_FILE_TYPES = Object.entries(fileTypeCounts)
  .sort((a, b) => b[1] - a[1])
  .map(([type]) => type);


export const FAKE_USERS = ["Jen A", "Jess S", "Stacy S"];


export const MOCK_ORDERS = [
  {
    id: "760124891",
    externalId: "HCA-155035",
    items: 3,
    customer: "HCA",
    customerId: "12345678",
    dateReceived: "2026-04-18",
    status: "Processing",
    contact: {
      name: "Mary Smith",
      phone: "5557106075",
      email: "mary.smith@email.null",
    },
  },
  {
    id: "760982341",
    externalId: "HCA-155036",
    items: 1,
    customer: "HCA",
    customerId: "12345678",
    dateReceived: "2026-04-19",
    status: "Shipped",
    contact: {
      name: "John Doe",
      phone: "5551234567",
      email: "john.doe@email.null",
    },
  },
  {
    id: "",
    externalId: "HCA-155037",
    items: 5,
    customer: "HCA",
    customerId: "12345678",
    dateReceived: "2026-04-20",
    status: "Pending",
    contact: {
      name: "Jane Smith",
      phone: "5559876543",
      email: "jane.smith@email.null",
    },
  },
  {
    id: "",
    externalId: "HCA-155038",
    items: 2,
    customer: "HCA",
    customerId: "12345678",
    dateReceived: "2026-04-20",
    status: "Failed",
    contact: {
      name: "Bob Wilson",
      phone: "5552223333",
      email: "bob.wilson@email.null",
    },
  },
  {
    id: "",
    externalId: "HCA-155039",
    items: 12,
    customer: "HCA",
    customerId: "12345678",
    dateReceived: "2026-04-20",
    status: "On Hold",
    contact: {
      name: "Alice Brown",
      phone: "5554445555",
      email: "alice.brown@email.null",
    },
  },
];


export const ADDITIONAL_ORDERS = Array.from({ length: 29 }).map((_, i) => {
  const status = ["Processing", "Shipped", "Pending", "Delivered", "Failed", "On Hold"][Math.floor(Math.random() * 6)];
  return {
    id: ["Failed", "Pending", "On Hold"].includes(status) ? "" : `760${100000 + i}`,
    externalId: `HCA-1550${40 + i}`,
    items: Math.floor(Math.random() * 10) + 1,
    customer: "HCA",
    customerId: "12345678",
    dateReceived: `2026-04-${String(20 - (i % 5)).padStart(2, "0")}`,
    status,
    contact: {
      name: "Generated User " + i,
      phone: "555000" + String(i).padStart(4, "0"),
      email: `genuser${i}@email.null`
    }
  };
});

MOCK_ORDERS.push(...ADDITIONAL_ORDERS);

// Default Source catalog (Settings > Sources). Shared as the persisted-state
// fallback for "appData/sources" so the Mapping Source dropdown and the
// Settings table seed from the same list.
export const INITIAL_SOURCES = [
  {
    id: "source-hca-censhare",
    name: "HCA/Censhare",
    description: "HCA Marketing System",
    contactName: "John Doe",
    contactEmail: "john@example.com",
  },
];
