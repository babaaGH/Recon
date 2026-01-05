import { NextRequest, NextResponse } from 'next/server';

interface Event {
  name: string;
  type: 'Conference' | 'Trade Show' | 'Roundtable' | 'Sponsorship' | 'Speaking' | 'Webinar';
  date: string;
  location: string;
  role: 'Sponsor' | 'Attendee' | 'Speaker' | 'Exhibitor' | 'Host';
  description?: string;
}

// Generate realistic mock networking events data
function generateMockEventsData(companyName: string): Event[] {
  const seed = companyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const conferences = [
    'AWS re:Invent 2026',
    'Salesforce Dreamforce',
    'Microsoft Ignite',
    'Google Cloud Next',
    'TechCrunch Disrupt',
    'Web Summit',
    'CES 2026',
    'MWC Barcelona',
    'SXSW Interactive',
    'Money20/20',
    'FinTech Festival Singapore',
    'Collision Conference'
  ];

  const tradeShows = [
    'SaaS Connect Expo',
    'Enterprise Tech Summit',
    'Digital Transformation World',
    'AI & Big Data Expo',
    'Cloud Expo Europe'
  ];

  const roundtables = [
    'CIO Executive Roundtable',
    'Digital Innovation Forum',
    'Tech Leadership Summit',
    'Enterprise Security Roundtable',
    'Future of Work Discussion'
  ];

  const webinars = [
    'Digital Transformation Best Practices',
    'Scaling Enterprise SaaS',
    'Modern Data Architecture',
    'AI in Business Operations',
    'Cybersecurity Trends 2026'
  ];

  const locations = [
    'Las Vegas, NV',
    'San Francisco, CA',
    'New York, NY',
    'Austin, TX',
    'Seattle, WA',
    'London, UK',
    'Singapore',
    'Barcelona, Spain',
    'Boston, MA',
    'Chicago, IL',
    'Virtual Event',
    'Hybrid Event'
  ];

  const events: Event[] = [];

  // Generate 2-3 conference events
  const confCount = 2 + (seed % 2);
  for (let i = 0; i < confCount; i++) {
    const confIndex = (seed + i * 7) % conferences.length;
    const locIndex = (seed + i * 5) % locations.length;
    const daysFromNow = 30 + ((seed + i * 13) % 120);
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + daysFromNow);

    events.push({
      name: conferences[confIndex],
      type: 'Conference',
      date: eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      location: locations[locIndex],
      role: i % 3 === 0 ? 'Sponsor' : i % 3 === 1 ? 'Speaker' : 'Attendee',
      description: i % 2 === 0 ? `${companyName} will showcase latest innovations and network with industry leaders.` : undefined
    });
  }

  // Generate 1-2 sponsorships
  const sponsorCount = 1 + (seed % 2);
  for (let i = 0; i < sponsorCount; i++) {
    const confIndex = (seed + i * 11 + 100) % conferences.length;
    const locIndex = (seed + i * 9) % locations.length;
    const daysFromNow = 20 + ((seed + i * 17) % 90);
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + daysFromNow);

    events.push({
      name: conferences[confIndex],
      type: 'Sponsorship',
      date: eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      location: locations[locIndex],
      role: 'Sponsor',
      description: `${companyName} is a platinum sponsor for this premier industry event.`
    });
  }

  // Generate 1-2 speaking engagements
  const speakingCount = 1 + (seed % 2);
  for (let i = 0; i < speakingCount; i++) {
    const confIndex = (seed + i * 13 + 200) % conferences.length;
    const locIndex = (seed + i * 11) % locations.length;
    const daysFromNow = 15 + ((seed + i * 19) % 80);
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + daysFromNow);

    events.push({
      name: conferences[confIndex],
      type: 'Speaking',
      date: eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      location: locations[locIndex],
      role: 'Speaker',
      description: `${companyName} executives will present on industry trends and innovations.`
    });
  }

  // Generate 1-2 trade shows
  const tradeCount = 1 + (seed % 2);
  for (let i = 0; i < tradeCount; i++) {
    const tradeIndex = (seed + i * 17) % tradeShows.length;
    const locIndex = (seed + i * 13) % locations.length;
    const daysFromNow = 40 + ((seed + i * 23) % 100);
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + daysFromNow);

    events.push({
      name: tradeShows[tradeIndex],
      type: 'Trade Show',
      date: eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      location: locations[locIndex],
      role: 'Exhibitor'
    });
  }

  // Generate 1 roundtable
  const roundtableIndex = seed % roundtables.length;
  const locIndex = (seed * 7) % locations.length;
  const daysFromNow = 10 + (seed % 60);
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + daysFromNow);

  events.push({
    name: roundtables[roundtableIndex],
    type: 'Roundtable',
    date: eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    location: locations[locIndex],
    role: 'Host',
    description: `Exclusive invitation-only event for senior technology leaders.`
  });

  // Generate 1-2 webinars
  const webinarCount = 1 + (seed % 2);
  for (let i = 0; i < webinarCount; i++) {
    const webinarIndex = (seed + i * 19) % webinars.length;
    const daysFromNow = 5 + ((seed + i * 29) % 50);
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + daysFromNow);

    events.push({
      name: webinars[webinarIndex],
      type: 'Webinar',
      date: eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      location: 'Virtual Event',
      role: 'Host'
    });
  }

  // Sort by date (soonest first)
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return events;
}

export async function POST(request: NextRequest) {
  let companyName = '';

  try {
    const body = await request.json();
    companyName = body.companyName || '';

    // For now, return mock data
    // In production, this would integrate with event platforms, company websites, etc.
    const events = generateMockEventsData(companyName);

    return NextResponse.json({
      events,
      total: events.length
    });
  } catch (error) {
    console.error('Error in networking-events API:', error);

    // Return mock data even on error
    const events = generateMockEventsData(companyName || 'Unknown Company');

    return NextResponse.json({
      events,
      total: events.length
    });
  }
}
