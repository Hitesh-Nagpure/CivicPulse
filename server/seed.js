import mongoose from 'mongoose';
import Complaint from './models/Complaint.js';
import Citizen from './models/Citizen.js';
import Worker from './models/Worker.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civicpulse';

export async function seedDatabase(force = false) {
  try {
    const complaintCount = await Complaint.countDocuments();
    if (complaintCount > 0 && !force) {
      console.log(`Database already has ${complaintCount} complaints. Skipping automatic seed.`);
      return;
    }

    console.log('Seeding fresh initial urban civic management data...');

    if (force) {
      await Complaint.deleteMany({});
      await Citizen.deleteMany({});
      await Worker.deleteMany({});
    }

    // 1. Seed Municipal Workers
    const workersData = [
      {
        name: 'Rajesh Sharma',
        email: 'rajesh.pwd@city.gov.in',
        phone: '+91 98230 11456',
        department: 'Road Infrastructure & Public Works Dept (PWD)',
        badgeNumber: 'PWD-804',
        specialization: 'Asphalt Repair & Pothole Patching',
        avatar: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=200&auto=format&fit=crop&q=80',
        assignedZone: 'Central & West Ward',
        resolvedCount: 38,
        activeJobsCount: 2,
        rating: 4.9,
      },
      {
        name: 'Vikram Singh',
        email: 'vikram.power@city.gov.in',
        phone: '+91 98451 77290',
        department: 'City Power Distribution & Electrical Division',
        badgeNumber: 'ELEC-312',
        specialization: 'High-Voltage Cable & Streetlight Tech',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        assignedZone: 'North Industrial Sector',
        resolvedCount: 29,
        activeJobsCount: 1,
        rating: 4.8,
      },
      {
        name: 'Anita Deshmukh',
        email: 'anita.sanitation@city.gov.in',
        phone: '+91 97112 44321',
        department: 'Solid Waste Management & Sanitation Board',
        badgeNumber: 'SWM-109',
        specialization: 'Bio-Hazard & Municipal Waste Control',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
        assignedZone: 'East Green Valley',
        resolvedCount: 45,
        activeJobsCount: 1,
        rating: 4.9,
      },
      {
        name: 'Mohammed Tariq',
        email: 'tariq.water@city.gov.in',
        phone: '+91 99880 33412',
        department: 'Municipal Water Supply & Sewerage Board',
        badgeNumber: 'WTR-554',
        specialization: 'Hydraulic Pipelines & Deep Drainage',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        assignedZone: 'Metro South Corridor',
        resolvedCount: 32,
        activeJobsCount: 2,
        rating: 4.7,
      },
    ];

    const workers = await Worker.insertMany(workersData);
    console.log(`Created ${workers.length} municipal workers.`);

    // 2. Seed Active Citizens for Civic Leaderboard
    const citizensData = [
      {
        name: 'Aarav Patel',
        email: 'aarav.patel@gmail.com',
        phone: '+91 98765 43210',
        ward: 'Ward 4 - Green Valley',
        resolvedCount: 14,
        totalReported: 16,
        civicPoints: 780,
        badge: 'City Champion 🏆',
      },
      {
        name: 'Priya Sundaram',
        email: 'priya.sundaram@outlook.com',
        phone: '+91 97654 32109',
        ward: 'Ward 7 - Civil Lines',
        resolvedCount: 9,
        totalReported: 11,
        civicPoints: 520,
        badge: 'Urban Guardian 🌟',
      },
      {
        name: 'Kabir Mehta',
        email: 'kabir.mehta@yahoo.com',
        phone: '+91 98111 22334',
        ward: 'Ward 12 - Old City Market',
        resolvedCount: 6,
        totalReported: 8,
        civicPoints: 340,
        badge: 'Urban Guardian 🌟',
      },
      {
        name: 'Sunita Rao',
        email: 'sunita.rao@gmail.com',
        phone: '+91 99222 33445',
        ward: 'Ward 2 - Tech Park Zone',
        resolvedCount: 4,
        totalReported: 5,
        civicPoints: 240,
        badge: 'Neighborhood Sentinel 🛡️',
      },
      {
        name: 'Rohan Verma',
        email: 'rohan.verma@gmail.com',
        phone: '+91 98333 44556',
        ward: 'Ward 9 - Riverside Heights',
        resolvedCount: 2,
        totalReported: 3,
        civicPoints: 130,
        badge: 'Active Citizen 🌱',
      },
    ];

    await Citizen.insertMany(citizensData);
    console.log(`Created ${citizensData.length} citizens for leaderboard.`);

    // 3. Seed Realistic Complaints across various states
    const complaintsData = [
      // Wall of Shame Item 1: Neglected 12 days ago, Critical Sinkhole
      {
        trackingId: 'CP-2026-SH492',
        title: 'Dangerous 4-foot deep sinkhole on Main Ring Road junction',
        description: 'Large sinkhole expanding rapidly near Bus Stop 14. Multiple two-wheelers have skidded and narrowly avoided fatal accidents. The water authority opened it 12 days ago and abandoned it without safety barricades or caution lights.',
        category: 'Pothole & Road Damage',
        location: {
          locationType: 'gps',
          address: 'Ring Road Junction near Sector 14 Bus Depot',
          landmark: 'Opposite State Bank ATM',
          ward: 'Ward 14 - Highway Corridor',
          latitude: 28.6139,
          longitude: 77.2090,
          accuracy: 5,
        },
        media: {
          mediaType: 'photo',
          url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
          filename: 'sinkhole-ringroad.jpg',
          mimetype: 'image/jpeg',
          size: 240000,
        },
        citizen: {
          name: 'Aarav Patel',
          email: 'aarav.patel@gmail.com',
          phone: '+91 98765 43210',
          isGuest: false,
        },
        aiSeverity: {
          level: 'Critical',
          score: 10,
          urgency: 'Emergency (Immediate Dispatch Required)',
          confidence: 0.98,
          reasoning: 'AI Severity Model detected life-threatening crater hazard on major multi-lane arterial road with documented near-fatal incidents and zero safety barricading.',
          factors: [
            'Sinkhole depth exceeding 4 feet',
            'Active vehicular traffic corridor',
            'Unbarricaded open hazard at night',
            'High collision probability for two-wheelers',
          ],
          suggestedDepartment: 'Road Infrastructure & Public Works Dept (PWD)',
          slaHours: 12,
        },
        status: 'Submitted',
        wallOfShame: {
          isFlagged: true,
          shameUpvotes: 84,
          responsibleAuthority: 'Road Infrastructure & Public Works Dept (PWD)',
          flaggedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          officialEscalated: 'Executive Engineer (PWD Zone 4)',
        },
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },

      // Wall of Shame Item 2: Toxic garbage dump next to primary school, neglected 9 days
      {
        trackingId: 'CP-2026-WM831',
        title: 'Massive toxic garbage pile rotting outside Greenfield Primary School',
        description: 'Municipal garbage dumpsters have not been emptied for 9 days. Rotten organic waste, stray cattle and dogs blocking the school gate. Heavy stench causing breathing issues among small children.',
        category: 'Garbage & Waste Disposal',
        location: {
          locationType: 'manual',
          address: 'Gate 2, Greenfield Primary School, Ward 7',
          landmark: 'Behind Community Health Clinic',
          ward: 'Ward 7 - Civil Lines',
          latitude: 28.6289,
          longitude: 77.2185,
        },
        media: {
          mediaType: 'photo',
          url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80',
          filename: 'school-garbage.jpg',
          mimetype: 'image/jpeg',
          size: 198000,
        },
        citizen: {
          name: 'Priya Sundaram',
          email: 'priya.sundaram@outlook.com',
          phone: '+91 97654 32109',
          isGuest: false,
        },
        aiSeverity: {
          level: 'High',
          score: 8,
          urgency: 'High Priority',
          confidence: 0.94,
          reasoning: 'Critical public health hazard due to high-density waste decomposition immediately adjacent to an educational institution with vulnerable child demographic.',
          factors: [
            'Proximity to primary school (< 20 meters)',
            'Vector-borne pathogen & animal aggression risk',
            'Decomposition odor causing respiratory distress',
          ],
          suggestedDepartment: 'Solid Waste Management & Sanitation Board',
          slaHours: 24,
        },
        status: 'Submitted',
        wallOfShame: {
          isFlagged: true,
          shameUpvotes: 62,
          responsibleAuthority: 'Solid Waste Management & Sanitation Board',
          flaggedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          officialEscalated: 'Chief Sanitation Inspector (Ward 7)',
        },
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      },

      // Wall of Shame Item 3: Live sparking high-voltage electrical cable
      {
        trackingId: 'CP-2026-EL108',
        title: 'Dangling live 440V power cable touching pedestrian footbridge',
        description: 'Storm damaged electrical post. Live exposed wire is hanging right over the metal handrail of the pedestrian railway crossing. Visible sparks during rainfall.',
        category: 'Streetlight & Electrical',
        location: {
          locationType: 'manual',
          address: 'Pedestrian Footbridge over Railway Line, Station Road',
          landmark: 'Platform 1 Footbridge East Stairs',
          ward: 'Ward 3 - Railway Colony',
          latitude: 28.6415,
          longitude: 77.2210,
        },
        media: {
          mediaType: 'photo',
          url: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=800&auto=format&fit=crop&q=80',
          filename: 'live-wire.jpg',
          mimetype: 'image/jpeg',
          size: 210000,
        },
        citizen: {
          name: 'Anonymous Citizen',
          email: '',
          phone: '',
          isGuest: true,
        },
        aiSeverity: {
          level: 'Critical',
          score: 10,
          urgency: 'Emergency (Immediate Dispatch Required)',
          confidence: 0.99,
          reasoning: 'Emergency life safety hazard: 440V exposed electrical current grounding to conductive metallic public footbridge in transit zone.',
          factors: [
            'Live sparking high-voltage wire',
            'Conductive metal pedestrian structure',
            'Imminent electrocution fatality risk',
          ],
          suggestedDepartment: 'City Power Distribution & Electrical Division',
          slaHours: 12,
        },
        status: 'Approved',
        wallOfShame: {
          isFlagged: true,
          shameUpvotes: 115,
          responsibleAuthority: 'City Power Distribution & Electrical Division',
          flaggedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          officialEscalated: 'Divisional Power Superintending Engineer',
        },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },

      // State: "Under Review" - Worker completed work and uploaded resolution photo! Ready for Admin to Accept or Reject
      {
        trackingId: 'CP-2026-RV519',
        title: 'Massive drinking water main pipe burst flooding Market Street',
        description: 'Clean drinking water gushing uncontrollably from broken municipal pipeline. Submerged 3 shopfronts and wasting thousands of liters per minute.',
        category: 'Water Supply & Leakage',
        location: {
          locationType: 'manual',
          address: 'Main Market Road, opposite City Bakery',
          landmark: 'City Bakery Corner',
          ward: 'Ward 12 - Old City Market',
          latitude: 28.6505,
          longitude: 77.2300,
        },
        media: {
          mediaType: 'photo',
          url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80',
          filename: 'burst-water-pipe.jpg',
          mimetype: 'image/jpeg',
          size: 180000,
        },
        citizen: {
          name: 'Kabir Mehta',
          email: 'kabir.mehta@yahoo.com',
          phone: '+91 98111 22334',
          isGuest: false,
        },
        aiSeverity: {
          level: 'High',
          score: 8,
          urgency: 'High Priority',
          confidence: 0.92,
          reasoning: 'Substantial civic water supply disruption and structural damage risk to commercial establishments.',
          factors: ['High-pressure water main breach', 'Commercial property inundation', 'Severe potable water waste'],
          suggestedDepartment: 'Municipal Water Supply & Sewerage Board',
          slaHours: 24,
        },
        status: 'Under Review',
        assignedWorker: {
          workerId: workers[3]._id.toString(),
          name: workers[3].name,
          department: workers[3].department,
          phone: workers[3].phone,
          assignedAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
          isSelfClaimed: false,
        },
        resolutionProof: {
          photoUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
          filename: 'repaired-pipeline.jpg',
          notes: 'Replaced ruptured 6-inch ductile iron valve with heavy-duty sleeve clamp. Pressure restored to normal, no more leakage detected.',
          submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        adminReview: {
          decision: 'Pending',
          feedback: '',
          reviewedAt: null,
          reviewedBy: 'Chief Municipal Officer',
        },
        wallOfShame: {
          isFlagged: false,
          shameUpvotes: 12,
          responsibleAuthority: 'Municipal Water Supply & Sewerage Board',
        },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },

      // State: "Approved" (Unassigned) - Open in pool for Worker to willingly accept!
      {
        trackingId: 'CP-2026-OP304',
        title: 'Broken stormwater drainage slab leaving open trench near playground',
        description: 'Concrete cover on storm drain broke in half. Kids playing in the nearby municipal park are at risk of falling into the 6-foot drain.',
        category: 'Sewage & Drainage Overflow',
        location: {
          locationType: 'gps',
          address: 'Children Park Perimeter, Sector 5',
          landmark: 'Next to Children Swing Set',
          ward: 'Ward 5 - Sector 5 Gardens',
          latitude: 28.5800,
          longitude: 77.2400,
          accuracy: 4,
        },
        media: {
          mediaType: 'photo',
          url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80',
          filename: 'broken-drain.jpg',
          mimetype: 'image/jpeg',
          size: 175000,
        },
        citizen: {
          name: 'Sunita Rao',
          email: 'sunita.rao@gmail.com',
          phone: '+91 99222 33445',
          isGuest: false,
        },
        aiSeverity: {
          level: 'High',
          score: 7,
          urgency: 'High Priority',
          confidence: 0.91,
          reasoning: 'Physical fall risk near recreational area frequently populated by minors and joggers.',
          factors: ['Open trench depth > 5 ft', 'Proximity to children playground', 'Uncovered drain hazard'],
          suggestedDepartment: 'Urban Drainage & Flood Prevention Cell',
          slaHours: 24,
        },
        status: 'Approved',
        wallOfShame: {
          isFlagged: false,
          shameUpvotes: 18,
          responsibleAuthority: 'Urban Drainage & Flood Prevention Cell',
        },
        createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000),
      },

      // State: "Resolved" - Completed & Accepted by Admin
      {
        trackingId: 'CP-2026-RS101',
        title: 'Fallen tree blocking two-lane collector road after storm',
        description: 'Large banyan branch snapped during thunderstorm and blocked both lanes of vehicular traffic. Streetlights were also damaged.',
        category: 'Parks & Public Property',
        location: {
          locationType: 'manual',
          address: 'Gulmohar Avenue, Block B',
          landmark: 'Opposite Community Hall',
          ward: 'Ward 4 - Green Valley',
          latitude: 28.5920,
          longitude: 77.2280,
        },
        media: {
          mediaType: 'photo',
          url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
          filename: 'fallen-tree.jpg',
          mimetype: 'image/jpeg',
          size: 215000,
        },
        citizen: {
          name: 'Aarav Patel',
          email: 'aarav.patel@gmail.com',
          phone: '+91 98765 43210',
          isGuest: false,
        },
        aiSeverity: {
          level: 'Medium',
          score: 6,
          urgency: 'Standard Priority',
          confidence: 0.93,
          reasoning: 'Roadway obstruction cleared by emergency horticulture response team within SLA.',
          factors: ['Road blockage', 'Storm damage'],
          suggestedDepartment: 'Horticulture & Parks Department',
          slaHours: 48,
        },
        status: 'Resolved',
        assignedWorker: {
          workerId: workers[0]._id.toString(),
          name: workers[0].name,
          department: workers[0].department,
          phone: workers[0].phone,
          assignedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
          isSelfClaimed: false,
        },
        resolutionProof: {
          photoUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80',
          filename: 'cleared-road.jpg',
          notes: 'Fallen branches completely sawn, loaded into municipal truck and road surface thoroughly swept.',
          submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        adminReview: {
          decision: 'Accepted',
          feedback: 'Swift clearance verified on site. Road reopened safely.',
          reviewedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
          reviewedBy: 'Chief Municipal Officer',
        },
        wallOfShame: {
          isFlagged: false,
          shameUpvotes: 5,
          responsibleAuthority: 'Horticulture & Parks Department',
        },
        createdAt: new Date(Date.now() - 50 * 60 * 60 * 1000),
      },
    ];

    await Complaint.insertMany(complaintsData);
    console.log(`Created ${complaintsData.length} sample complaints across all workflow states.`);
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Standalone execution support: node seed.js --force
if (process.argv[1]?.endsWith('seed.js')) {
  mongoose.connect(MONGODB_URI)
    .then(async () => {
      console.log('Connected to MongoDB for seeding.');
      const force = process.argv.includes('--force');
      await seedDatabase(force);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding connection error:', err);
      process.exit(1);
    });
}
