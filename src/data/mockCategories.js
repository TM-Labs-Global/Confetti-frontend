export const EVENT_META = {
  wedding:      { emoji: '💍', color: '#E07A8F', bg: '#FDF0F3', tagline: 'Ceremony & reception' },
  birthday:     { emoji: '🎂', color: '#F5923E', bg: '#FEF5EE', tagline: 'Milestone celebrations' },
  corporate:    { emoji: '💼', color: '#6C7CC7', bg: '#F0F2FB', tagline: 'Professional events' },
  'baby-shower':{ emoji: '👶', color: '#A370DB', bg: '#F5EEFB', tagline: 'New arrival celebrations' },
  graduation:   { emoji: '🎓', color: '#2AB56E', bg: '#EDFBF2', tagline: 'Academic achievements' },
  anniversary:  { emoji: '🥂', color: '#D4A017', bg: '#FEF9EA', tagline: 'Years well celebrated' },
}

export const EVENT_TYPES = [
  {
    id: 'wedding',
    name: 'Wedding',
    description: 'Traditional, white, or court wedding ceremonies and receptions',
    categories: [
      { id: 'catering',     name: 'Catering & Jollof',         defaultPct: 30, description: 'Full catering — buffet, food stations, and service staff' },
      { id: 'venue',        name: 'Venue / Hall',               defaultPct: 20, description: 'Indoor or outdoor venue hire' },
      { id: 'decor',        name: 'Decoration & Rentals',       defaultPct: 12, description: 'Floral arrangements, draping, furniture hire, and setup' },
      { id: 'photography',  name: 'Photography',                defaultPct: 8,  description: 'Pre-wedding and event-day photography coverage' },
      { id: 'videography',  name: 'Videography',                defaultPct: 6,  description: 'Cinematic video coverage and highlight reel' },
      { id: 'dj-sound',     name: 'DJ & Sound System',          defaultPct: 5,  description: 'DJ, live band, and full PA system' },
      { id: 'small-chops',  name: 'Small Chops & Cocktails',    defaultPct: 5,  description: 'Finger foods, canapés, and pre-event cocktails' },
      { id: 'asoebi',       name: 'Aso-ebi Coordination',       defaultPct: 4,  description: 'Fabric sourcing, distribution, and coordination' },
      { id: 'mc',           name: 'MC / Host',                  defaultPct: 3,  description: 'Master of ceremonies for the reception' },
      { id: 'makeup',       name: 'Makeup & Beauty',            defaultPct: 3,  description: 'Bridal makeup, hair styling, and beauty team' },
      { id: 'cake',         name: 'Wedding Cake',               defaultPct: 2,  description: 'Custom wedding cake design and delivery' },
      { id: 'transport',    name: 'Transportation & Logistics',  defaultPct: 1,  description: 'Guest shuttle, bridal convoy, and car hire' },
      { id: 'generator',    name: 'Generator & Power',          defaultPct: 1,  description: 'Backup power supply for the entire event' },
    ],
  },
  {
    id: 'birthday',
    name: 'Birthday',
    description: 'Birthday parties and milestone celebrations',
    categories: [
      { id: 'catering',     name: 'Catering',                   defaultPct: 30, description: 'Food and drinks for guests' },
      { id: 'venue',        name: 'Venue / Hall',               defaultPct: 20, description: 'Indoor or outdoor venue hire' },
      { id: 'decor',        name: 'Decoration',                 defaultPct: 15, description: 'Themed decor, balloons, and setup' },
      { id: 'dj-sound',     name: 'DJ & Sound System',          defaultPct: 10, description: 'DJ and full PA system' },
      { id: 'photography',  name: 'Photography',                defaultPct: 10, description: 'Event photography coverage' },
      { id: 'small-chops',  name: 'Small Chops & Cocktails',    defaultPct: 7,  description: 'Finger foods and drinks' },
      { id: 'mc',           name: 'MC / Host',                  defaultPct: 5,  description: 'Master of ceremonies' },
      { id: 'cake',         name: 'Birthday Cake',              defaultPct: 3,  description: 'Custom celebration cake' },
    ],
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Conferences, product launches, team events, and corporate dinners',
    categories: [
      { id: 'catering',     name: 'Catering & Refreshments',    defaultPct: 30, description: 'Food, drinks, and buffet service' },
      { id: 'venue',        name: 'Venue / Conference Center',  defaultPct: 25, description: 'Meeting hall or conference facility hire' },
      { id: 'av-sound',     name: 'AV & Sound System',          defaultPct: 15, description: 'Projectors, screens, microphones, and PA' },
      { id: 'decor',        name: 'Decoration & Branding',      defaultPct: 10, description: 'Stage setup, branded backdrops, and signage' },
      { id: 'photography',  name: 'Photography',                defaultPct: 8,  description: 'Corporate event photography' },
      { id: 'videography',  name: 'Videography',                defaultPct: 6,  description: 'Video documentation and highlight reel' },
      { id: 'transport',    name: 'Transportation',             defaultPct: 4,  description: 'Guest and staff transport logistics' },
      { id: 'mc',           name: 'MC / Moderator',             defaultPct: 2,  description: 'Event host and session moderator' },
    ],
  },
  {
    id: 'baby-shower',
    name: 'Baby Shower',
    description: 'Baby shower celebrations and naming ceremonies',
    categories: [
      { id: 'catering',     name: 'Catering',                   defaultPct: 25, description: 'Food and refreshments for guests' },
      { id: 'decor',        name: 'Decoration & Balloons',      defaultPct: 25, description: 'Themed decor, balloons, and setup' },
      { id: 'venue',        name: 'Venue / Hall',               defaultPct: 20, description: 'Indoor venue hire' },
      { id: 'cake',         name: 'Celebration Cake',           defaultPct: 10, description: 'Themed baby shower cake' },
      { id: 'photography',  name: 'Photography',                defaultPct: 10, description: 'Event photography and portraits' },
      { id: 'small-chops',  name: 'Small Chops & Cocktails',    defaultPct: 7,  description: 'Finger foods and mocktails' },
      { id: 'dj-sound',     name: 'DJ & Music',                 defaultPct: 3,  description: 'Background music and sound system' },
    ],
  },
  {
    id: 'graduation',
    name: 'Graduation',
    description: 'Graduation parties and academic celebration events',
    categories: [
      { id: 'catering',     name: 'Catering',                   defaultPct: 30, description: 'Food and drinks for guests' },
      { id: 'venue',        name: 'Venue / Hall',               defaultPct: 20, description: 'Indoor or outdoor venue hire' },
      { id: 'decor',        name: 'Decoration',                 defaultPct: 15, description: 'Themed decor and setup' },
      { id: 'photography',  name: 'Photography',                defaultPct: 15, description: 'Event and portrait photography' },
      { id: 'dj-sound',     name: 'DJ & Sound System',          defaultPct: 10, description: 'DJ and PA system' },
      { id: 'cake',         name: 'Graduation Cake',            defaultPct: 7,  description: 'Custom graduation cake' },
      { id: 'videography',  name: 'Videography',                defaultPct: 3,  description: 'Video coverage and highlight reel' },
    ],
  },
  {
    id: 'anniversary',
    name: 'Anniversary',
    description: 'Wedding anniversaries and milestone relationship celebrations',
    categories: [
      { id: 'catering',     name: 'Catering',                   defaultPct: 25, description: 'Food and drinks for guests' },
      { id: 'venue',        name: 'Venue / Hall',               defaultPct: 20, description: 'Indoor or outdoor venue hire' },
      { id: 'decor',        name: 'Decoration',                 defaultPct: 15, description: 'Romantic decor and event setup' },
      { id: 'photography',  name: 'Photography',                defaultPct: 12, description: 'Event photography coverage' },
      { id: 'dj-sound',     name: 'DJ & Sound System',          defaultPct: 8,  description: 'DJ and sound system' },
      { id: 'videography',  name: 'Videography',                defaultPct: 8,  description: 'Video coverage and highlight reel' },
      { id: 'small-chops',  name: 'Small Chops & Cocktails',    defaultPct: 6,  description: 'Finger foods and drinks' },
      { id: 'mc',           name: 'MC / Host',                  defaultPct: 4,  description: 'Master of ceremonies' },
      { id: 'cake',         name: 'Anniversary Cake',           defaultPct: 2,  description: 'Custom celebration cake' },
    ],
  },
]

export const EVENT_TYPE_MAP = Object.fromEntries(EVENT_TYPES.map(e => [e.id, e]))

export function getCategoriesForEventType(eventTypeId) {
  return EVENT_TYPE_MAP[eventTypeId]?.categories ?? []
}
