const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const EVENT_TYPES = [
  {
    id: 'wedding', name: 'Wedding',
    description: 'Traditional, white, or court wedding ceremonies and receptions',
    categories: [
      { id: 'wedding_catering',     name: 'Catering & Jollof',        defaultPct: 30, description: 'Full catering — buffet, food stations, and service staff' },
      { id: 'wedding_venue',        name: 'Venue / Hall',              defaultPct: 20, description: 'Indoor or outdoor venue hire' },
      { id: 'wedding_decor',        name: 'Decoration & Rentals',      defaultPct: 12, description: 'Floral arrangements, draping, furniture hire, and setup' },
      { id: 'wedding_photography',  name: 'Photography',               defaultPct: 8,  description: 'Pre-wedding and event-day photography coverage' },
      { id: 'wedding_videography',  name: 'Videography',               defaultPct: 6,  description: 'Cinematic video coverage and highlight reel' },
      { id: 'wedding_dj',           name: 'DJ & Sound System',         defaultPct: 5,  description: 'DJ, live band, and full PA system' },
      { id: 'wedding_smallchops',   name: 'Small Chops & Cocktails',   defaultPct: 5,  description: 'Finger foods, canapés, and pre-event cocktails' },
      { id: 'wedding_asoebi',       name: 'Aso-ebi Coordination',      defaultPct: 4,  description: 'Fabric sourcing, distribution, and coordination' },
      { id: 'wedding_mc',           name: 'MC / Host',                 defaultPct: 3,  description: 'Master of ceremonies for the reception' },
      { id: 'wedding_makeup',       name: 'Makeup & Beauty',           defaultPct: 3,  description: 'Bridal makeup, hair styling, and beauty team' },
      { id: 'wedding_cake',         name: 'Wedding Cake',              defaultPct: 2,  description: 'Custom wedding cake design and delivery' },
      { id: 'wedding_transport',    name: 'Transportation & Logistics', defaultPct: 1,  description: 'Guest shuttle, bridal convoy, and car hire' },
      { id: 'wedding_generator',    name: 'Generator & Power',         defaultPct: 1,  description: 'Backup power supply for the entire event' },
    ],
  },
  {
    id: 'birthday', name: 'Birthday',
    description: 'Birthday parties and milestone celebrations',
    categories: [
      { id: 'bday_catering',    name: 'Catering',               defaultPct: 30, description: 'Food and drinks for guests' },
      { id: 'bday_venue',       name: 'Venue / Hall',           defaultPct: 20, description: 'Indoor or outdoor venue hire' },
      { id: 'bday_decor',       name: 'Decoration',             defaultPct: 15, description: 'Themed decor, balloons, and setup' },
      { id: 'bday_dj',          name: 'DJ & Sound System',      defaultPct: 10, description: 'DJ and full PA system' },
      { id: 'bday_photography', name: 'Photography',            defaultPct: 10, description: 'Event photography coverage' },
      { id: 'bday_smallchops', name: 'Small Chops & Cocktails', defaultPct: 7,  description: 'Finger foods and drinks' },
      { id: 'bday_mc',          name: 'MC / Host',              defaultPct: 5,  description: 'Master of ceremonies' },
      { id: 'bday_cake',        name: 'Birthday Cake',          defaultPct: 3,  description: 'Custom celebration cake' },
    ],
  },
  {
    id: 'corporate', name: 'Corporate',
    description: 'Conferences, product launches, team events, and corporate dinners',
    categories: [
      { id: 'corp_catering',    name: 'Catering & Refreshments',   defaultPct: 30, description: 'Food, drinks, and buffet service' },
      { id: 'corp_venue',       name: 'Venue / Conference Center', defaultPct: 25, description: 'Meeting hall or conference facility hire' },
      { id: 'corp_av',          name: 'AV & Sound System',         defaultPct: 15, description: 'Projectors, screens, microphones, and PA' },
      { id: 'corp_decor',       name: 'Decoration & Branding',     defaultPct: 10, description: 'Stage setup, branded backdrops, and signage' },
      { id: 'corp_photography', name: 'Photography',               defaultPct: 8,  description: 'Corporate event photography' },
      { id: 'corp_videography', name: 'Videography',               defaultPct: 6,  description: 'Video documentation and highlight reel' },
      { id: 'corp_transport',   name: 'Transportation',            defaultPct: 4,  description: 'Guest and staff transport logistics' },
      { id: 'corp_mc',          name: 'MC / Moderator',            defaultPct: 2,  description: 'Event host and session moderator' },
    ],
  },
  {
    id: 'baby-shower', name: 'Baby Shower',
    description: 'Baby shower celebrations and naming ceremonies',
    categories: [
      { id: 'baby_catering',    name: 'Catering',               defaultPct: 25, description: 'Food and refreshments for guests' },
      { id: 'baby_decor',       name: 'Decoration & Balloons',  defaultPct: 25, description: 'Themed decor, balloons, and setup' },
      { id: 'baby_venue',       name: 'Venue / Hall',           defaultPct: 20, description: 'Indoor venue hire' },
      { id: 'baby_cake',        name: 'Celebration Cake',       defaultPct: 10, description: 'Themed baby shower cake' },
      { id: 'baby_photography', name: 'Photography',            defaultPct: 10, description: 'Event photography and portraits' },
      { id: 'baby_smallchops', name: 'Small Chops & Cocktails', defaultPct: 7,  description: 'Finger foods and mocktails' },
      { id: 'baby_dj',          name: 'DJ & Music',             defaultPct: 3,  description: 'Background music and sound system' },
    ],
  },
  {
    id: 'graduation', name: 'Graduation',
    description: 'Graduation parties and academic celebration events',
    categories: [
      { id: 'grad_catering',    name: 'Catering',            defaultPct: 30, description: 'Food and drinks for guests' },
      { id: 'grad_venue',       name: 'Venue / Hall',        defaultPct: 20, description: 'Indoor or outdoor venue hire' },
      { id: 'grad_decor',       name: 'Decoration',          defaultPct: 15, description: 'Themed decor and setup' },
      { id: 'grad_photography', name: 'Photography',         defaultPct: 15, description: 'Event and portrait photography' },
      { id: 'grad_dj',          name: 'DJ & Sound System',   defaultPct: 10, description: 'DJ and PA system' },
      { id: 'grad_cake',        name: 'Graduation Cake',     defaultPct: 7,  description: 'Custom graduation cake' },
      { id: 'grad_videography', name: 'Videography',         defaultPct: 3,  description: 'Video coverage and highlight reel' },
    ],
  },
  {
    id: 'anniversary', name: 'Anniversary',
    description: 'Wedding anniversaries and milestone relationship celebrations',
    categories: [
      { id: 'anni_catering',    name: 'Catering',            defaultPct: 25, description: 'Food and drinks for guests' },
      { id: 'anni_venue',       name: 'Venue / Hall',        defaultPct: 20, description: 'Indoor or outdoor venue hire' },
      { id: 'anni_decor',       name: 'Decoration',          defaultPct: 15, description: 'Romantic decor and event setup' },
      { id: 'anni_photography', name: 'Photography',         defaultPct: 12, description: 'Event photography coverage' },
      { id: 'anni_dj',          name: 'DJ & Sound System',   defaultPct: 8,  description: 'DJ and sound system' },
      { id: 'anni_videography', name: 'Videography',         defaultPct: 8,  description: 'Video coverage and highlight reel' },
      { id: 'anni_smallchops', name: 'Small Chops & Cocktails', defaultPct: 6, description: 'Finger foods and drinks' },
      { id: 'anni_mc',          name: 'MC / Host',           defaultPct: 4,  description: 'Master of ceremonies' },
      { id: 'anni_cake',        name: 'Anniversary Cake',    defaultPct: 2,  description: 'Custom celebration cake' },
    ],
  },
]

async function main() {
  console.log('Seeding database...')

  // Clean slate
  await prisma.notification.deleteMany()
  await prisma.bid.deleteMany()
  await prisma.planCategory.deleteMany()
  await prisma.plan.deleteMany()
  await prisma.category.deleteMany()
  await prisma.eventType.deleteMany()
  await prisma.user.deleteMany()

  // Users
  const hash = await bcrypt.hash('password123', 10)
  const [organiser, vendor, admin] = await Promise.all([
    prisma.user.create({ data: { name: 'Adaeze Okonkwo', email: 'organiser@confetti.ng', password: hash, role: 'organiser' } }),
    prisma.user.create({ data: { name: 'Chukwuemeka Bello', email: 'vendor@confetti.ng', password: hash, role: 'vendor' } }),
    prisma.user.create({ data: { name: 'Admin User', email: 'admin@confetti.ng', password: hash, role: 'admin' } }),
  ])
  console.log('✓ Users created')

  // Event types + categories
  for (const et of EVENT_TYPES) {
    await prisma.eventType.create({
      data: {
        id: et.id,
        name: et.name,
        description: et.description,
        categories: {
          create: et.categories.map(c => ({
            id: c.id, name: c.name, description: c.description, defaultPct: c.defaultPct,
          })),
        },
      },
    })
  }
  console.log('✓ Event types and categories created')

  // Plans with categories
  const weddingCats = EVENT_TYPES.find(e => e.id === 'wedding').categories
  const birthdayCats = EVENT_TYPES.find(e => e.id === 'birthday').categories
  const babyshowerCats = EVENT_TYPES.find(e => e.id === 'baby-shower').categories
  const corporateCats = EVENT_TYPES.find(e => e.id === 'corporate').categories

  const planWale = await prisma.plan.create({
    data: {
      name: "Wale & Simi's Wedding",
      eventTypeId: 'wedding',
      status: 'open',
      date: new Date('2026-09-20'),
      dateFlexible: false,
      state: 'Lagos',
      city: 'Ikeja',
      totalBudget: 5000000,
      shareCode: 'WS-2026',
      organiserId: organiser.id,
      categories: {
        create: [
          { categoryId: 'wedding_catering',    name: 'Catering & Jollof',        allocation: 1500000 },
          { categoryId: 'wedding_venue',        name: 'Venue / Hall',              allocation: 1000000 },
          { categoryId: 'wedding_decor',        name: 'Decoration & Rentals',      allocation: 600000  },
          { categoryId: 'wedding_photography',  name: 'Photography',               allocation: 400000  },
          { categoryId: 'wedding_videography',  name: 'Videography',               allocation: 300000  },
          { categoryId: 'wedding_dj',           name: 'DJ & Sound System',         allocation: 250000  },
          { categoryId: 'wedding_smallchops',   name: 'Small Chops & Cocktails',   allocation: 250000  },
          { categoryId: 'wedding_asoebi',       name: 'Aso-ebi Coordination',      allocation: 200000  },
          { categoryId: 'wedding_mc',           name: 'MC / Host',                 allocation: 150000  },
          { categoryId: 'wedding_makeup',       name: 'Makeup & Beauty',           allocation: 150000  },
          { categoryId: 'wedding_cake',         name: 'Wedding Cake',              allocation: 100000  },
          { categoryId: 'wedding_generator',    name: 'Generator & Power',         allocation: 100000  },
        ],
      },
    },
    include: { categories: true },
  })

  const planChike = await prisma.plan.create({
    data: {
      name: "Chike's 30th Birthday Bash",
      eventTypeId: 'birthday',
      status: 'bidding',
      date: new Date('2026-08-15'),
      dateFlexible: false,
      state: 'Abuja',
      city: 'Wuse',
      totalBudget: 1500000,
      shareCode: 'CB-30TH',
      organiserId: organiser.id,
      categories: {
        create: [
          { categoryId: 'bday_catering',    name: 'Catering',               allocation: 450000 },
          { categoryId: 'bday_venue',       name: 'Venue / Hall',           allocation: 300000 },
          { categoryId: 'bday_decor',       name: 'Decoration',             allocation: 225000 },
          { categoryId: 'bday_dj',          name: 'DJ & Sound System',      allocation: 150000 },
          { categoryId: 'bday_photography', name: 'Photography',            allocation: 150000 },
          { categoryId: 'bday_smallchops', name: 'Small Chops & Cocktails', allocation: 105000 },
          { categoryId: 'bday_mc',          name: 'MC / Host',              allocation: 75000  },
          { categoryId: 'bday_cake',        name: 'Birthday Cake',          allocation: 45000  },
        ],
      },
    },
    include: { categories: true },
  })

  const planBukola = await prisma.plan.create({
    data: {
      name: "Bukola's Baby Shower",
      eventTypeId: 'baby-shower',
      status: 'open',
      dateFlexible: true,
      state: 'Rivers',
      city: 'Port Harcourt',
      totalBudget: 800000,
      shareCode: 'BBS-26',
      organiserId: organiser.id,
      categories: {
        create: [
          { categoryId: 'baby_catering',    name: 'Catering',               allocation: 200000 },
          { categoryId: 'baby_decor',       name: 'Decoration & Balloons',  allocation: 200000 },
          { categoryId: 'baby_venue',       name: 'Venue / Hall',           allocation: 160000 },
          { categoryId: 'baby_cake',        name: 'Celebration Cake',       allocation: 80000  },
          { categoryId: 'baby_photography', name: 'Photography',            allocation: 80000  },
          { categoryId: 'baby_smallchops', name: 'Small Chops & Cocktails', allocation: 56000  },
          { categoryId: 'baby_dj',          name: 'DJ & Music',             allocation: 24000  },
        ],
      },
    },
    include: { categories: true },
  })

  await prisma.plan.create({
    data: {
      name: 'TechNaija Annual Summit 2026',
      eventTypeId: 'corporate',
      status: 'draft',
      date: new Date('2026-10-10'),
      dateFlexible: false,
      state: 'Lagos',
      city: 'Victoria Island',
      totalBudget: 8000000,
      shareCode: 'TNS-2026',
      organiserId: organiser.id,
      categories: {
        create: [
          { categoryId: 'corp_catering',    name: 'Catering & Refreshments',   allocation: 2400000 },
          { categoryId: 'corp_venue',       name: 'Venue / Conference Center',  allocation: 2000000 },
          { categoryId: 'corp_av',          name: 'AV & Sound System',          allocation: 1200000 },
          { categoryId: 'corp_decor',       name: 'Decoration & Branding',      allocation: 800000  },
          { categoryId: 'corp_photography', name: 'Photography',                allocation: 640000  },
          { categoryId: 'corp_videography', name: 'Videography',                allocation: 480000  },
          { categoryId: 'corp_transport',   name: 'Transportation',             allocation: 320000  },
          { categoryId: 'corp_mc',          name: 'MC / Moderator',             allocation: 160000  },
        ],
      },
    },
  })
  console.log('✓ Plans created')

  // Bids
  const walePhotoCat = planWale.categories.find(c => c.categoryId === 'wedding_photography')
  const waleCateringCat = planWale.categories.find(c => c.categoryId === 'wedding_catering')
  const chikedjCat = planChike.categories.find(c => c.categoryId === 'bday_dj')
  const bukolaDecorCat = planBukola.categories.find(c => c.categoryId === 'baby_decor')

  const bid1 = await prisma.bid.create({
    data: {
      planId: planWale.id,
      planCategoryId: waleCateringCat.id,
      vendorId: vendor.id,
      amount: 1350000,
      pitch: 'We have been catering for over 200 events in Lagos. Our Jollof is our signature — 50 litres of the best rice you will ever taste at a Nigerian wedding. Includes full buffet setup, service staff, and cleanup.',
      status: 'pending',
      isCounterBid: false,
      canUpdate: true,
    },
  })

  const bid2 = await prisma.bid.create({
    data: {
      planId: planChike.id,
      planCategoryId: chikedjCat.id,
      vendorId: vendor.id,
      amount: 180000,
      pitch: "Lagos biggest birthday DJ. 3-hour set with full sound system setup. Afrobeats, Amapiano, and Old School mix — guaranteed to keep everyone on their feet all night.",
      status: 'accepted',
      isCounterBid: true,
      counterReason: 'The budget of ₦150,000 covers the DJ set but not the PA system transport from Surulere. The extra ₦30,000 covers logistics.',
      canUpdate: false,
    },
  })

  const bid3 = await prisma.bid.create({
    data: {
      planId: planWale.id,
      planCategoryId: walePhotoCat.id,
      vendorId: vendor.id,
      amount: 400000,
      pitch: 'Award-winning wedding photographer with 5 years in Lagos. Coverage from traditional to white wedding. 500+ edited photos delivered within 2 weeks. Portfolio available on request.',
      status: 'pending',
      isCounterBid: false,
      canUpdate: true,
    },
  })

  const bid4 = await prisma.bid.create({
    data: {
      planId: planBukola.id,
      planCategoryId: bukolaDecorCat.id,
      vendorId: vendor.id,
      amount: 185000,
      pitch: 'Specialising in baby shower decor in Port Harcourt. Full setup and teardown included. Balloon arch, backdrop, centrepieces, and table settings all covered.',
      status: 'pending',
      isCounterBid: false,
      canUpdate: true,
    },
  })
  console.log('✓ Bids created')

  // Notifications
  await prisma.notification.createMany({
    data: [
      { userId: organiser.id, type: 'bid_received', message: 'Mama Cass Kitchen placed a bid on Catering & Jollof for Wale & Simi\'s Wedding', isRead: false },
      { userId: organiser.id, type: 'bid_received', message: 'Clicks by Emeka placed a bid on Photography for Wale & Simi\'s Wedding', isRead: false },
      { userId: organiser.id, type: 'bid_received', message: 'Blooms & Balloons PH placed a bid on Decoration & Balloons for Bukola\'s Baby Shower', isRead: true },
      { userId: vendor.id, type: 'bid_accepted', message: 'Your bid on DJ & Sound System for Chike\'s 30th Birthday Bash was accepted', isRead: false },
      { userId: vendor.id, type: 'new_plan', message: 'A new Wedding plan is open for bidding in Lagos', isRead: true },
    ],
  })
  console.log('✓ Notifications created')

  console.log('\n✅ Seed complete!')
  console.log('Demo accounts:')
  console.log('  organiser@confetti.ng / password123')
  console.log('  vendor@confetti.ng    / password123')
  console.log('  admin@confetti.ng     / password123')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
