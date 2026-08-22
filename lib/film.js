/**
 * GWD Tours · Edinburgh Immersive Experience
 * Complete Structured Data & Timing Map
 */

export const FILM_DURATION = 136.8;
export const TOTAL_LADDER_FRAMES = 342;

export const SEGMENTS = [
  {
    id: 'old-town',
    num: 'I',
    title: 'The Old Town & Wynds',
    from: 0.0,
    to: 33.6,
    vh: 480,
    subtitle: 'High Street, narrow alleys, and medieval stone facades.',
  },
  {
    id: 'monuments',
    num: 'II',
    title: 'The Romantic Monuments',
    from: 33.6,
    to: 57.2,
    vh: 380,
    subtitle: 'Gothic spires and neoclassical temples in the sea haar.',
  },
  {
    id: 'citadel',
    num: 'III',
    title: 'The Skyline & Citadel',
    from: 57.2,
    to: 88.2,
    vh: 440,
    subtitle: 'The historic volcanic skyline from Calton Hill to The Mound.',
  },
  {
    id: 'heritage',
    num: 'IV',
    title: 'The Royal Closes & Fortress',
    from: 88.2,
    to: 119.36,
    vh: 420,
    subtitle: 'Curved merchant streets and medieval kirkyard vaults.',
  },
  {
    id: 'enlightenment',
    num: 'V',
    title: 'The Enlightenment Capital',
    from: 119.36,
    to: 136.8,
    vh: 320,
    subtitle: 'The classical New Town and civic monuments of Princes Street.',
  },
];

export const BEATS = [
  // Act I
  {
    t: 3.5,
    seg: 'old-town',
    align: 'left',
    kicker: 'The Sanctuary',
    title: 'St Giles’ Crown Spire',
    body: 'Standing at the heart of the Royal Mile for nine centuries, its distinctive crown steeple cuts through the morning mist above Edinburgh’s volcanic ridge.',
  },
  {
    t: 10.5,
    seg: 'old-town',
    align: 'right',
    kicker: 'The Royal Mile',
    title: 'The Granite Spine',
    body: 'One Scots mile linking Castle Rock to Holyrood Abbey, paved in basalt setts worn smooth by centuries of processions, riots, and trade.',
  },
  {
    t: 15.0,
    seg: 'old-town',
    align: 'left',
    kicker: 'Engineering',
    title: 'The Monumental Arches',
    body: 'Multi-tiered stone viaducts spanning deep ravines, where modern thoroughfares cross high above ancient medieval streets below.',
  },
  {
    t: 19.0,
    seg: 'old-town',
    align: 'right',
    kicker: 'The Scottish Enlightenment',
    title: 'The Wealth of Nations',
    body: 'Adam Smith gazes past St Giles’ toward the city’s universities, where 18th-century thinkers transformed global economics, philosophy, and geology.',
  },
  {
    t: 26.5,
    seg: 'old-town',
    align: 'left',
    kicker: 'Urban Vernacular',
    title: 'Tenements on Cockburn',
    body: 'Curving Victorian and Scots Baronial facades designed with crow-stepped gables and conical corner turrets hugging the steep contours of the valley.',
  },

  // Act II
  {
    t: 36.5,
    seg: 'monuments',
    align: 'left',
    kicker: 'Romanticism',
    title: 'The Scott Monument',
    body: 'A towering Victorian Gothic spire 200 feet high, carved from local Binny sandstone that darkens over centuries with atmospheric patina.',
  },
  {
    t: 44.5,
    seg: 'monuments',
    align: 'right',
    kicker: 'Athens of the North',
    title: 'The National Monument',
    body: 'Twelve massive Craigleith sandstone Doric columns crowning Calton Hill, conceived as a replica of the Parthenon in honour of Scottish soldiers.',
  },
  {
    t: 53.0,
    seg: 'monuments',
    align: 'left',
    kicker: 'The Coastal Haar',
    title: 'Dugald Stewart Monument',
    body: 'A circular choragic temple of Lysicrates, solitary amidst Scots pine as the thick North Sea haar rolls silently across the firth.',
  },

  // Act III
  {
    t: 63.0,
    seg: 'citadel',
    align: 'left',
    kicker: 'The Mound',
    title: 'New College Spires',
    body: 'Twin gothic towers framing the ascent from Princes Street, built on an artificial causeway formed from 1.5 million cartloads of earth.',
  },
  {
    t: 75.0,
    seg: 'citadel',
    align: 'right',
    kicker: 'The Panorama',
    title: 'The Citadel on the Rock',
    body: 'The Balmoral clock tower stands three minutes fast by tradition, while Edinburgh Castle commands the 350-million-year-old basalt plug.',
  },
  {
    t: 84.0,
    seg: 'citadel',
    align: 'left',
    kicker: 'Old Town Wynds',
    title: 'Gaslight & Ashlar',
    body: 'Overhead iron lanterns illuminate narrow passages where ten-storey tenements housed dukes on the third floor and water-carriers in the cellars.',
  },

  // Act IV
  {
    t: 90.5,
    seg: 'heritage',
    align: 'right',
    kicker: 'The Vennel',
    title: 'Steps to the Fortress',
    body: 'The ancient Flodden Wall steps rising sharply from the Grassmarket, presenting the most formidable angle of Castle Rock’s sheer cliffs.',
  },
  {
    t: 95.0,
    seg: 'heritage',
    align: 'left',
    kicker: 'Victoria Street',
    title: 'The Arc of the Bow',
    body: 'Engineered in 1829 to replace the treacherous West Bow, lined with vibrant merchant shops and a continuous upper stone terrace.',
  },
  {
    t: 107.0,
    seg: 'heritage',
    align: 'right',
    kicker: 'Advocate’s Close',
    title: 'The Gavel of Law',
    body: 'A steep medieval wynd named after Lord Advocate Sir James Stewart, framing dramatic views across the New Town rooftops.',
  },
  {
    t: 115.0,
    seg: 'heritage',
    align: 'left',
    kicker: 'Kirkyard Peace',
    title: 'Greyfriars & St Cuthbert’s',
    body: 'Renaissance table-tombs and baroque memento mori carvings resting peacefully in the shadow of the mighty military stronghold above.',
  },

  // Act V
  {
    t: 122.0,
    seg: 'enlightenment',
    align: 'left',
    kicker: 'The Descent',
    title: 'Into the Classical City',
    body: 'Leaving the medieval shadow to enter James Craig’s rational Georgian grid of wide terraces, neoclassical squares, and open vistas.',
  },
  {
    t: 130.0,
    seg: 'enlightenment',
    align: 'right',
    kicker: 'The Sovereign Capital',
    title: 'Register House & Wellington',
    body: 'Sir John Steell’s rearing bronze charger guarding Robert Adam’s General Register House, preserving the nation’s deepest historical archives.',
  },
];

export const VERNACULAR_CARDS = [
  {
    id: 'ashlar',
    title: 'Craigleith Ashlar',
    kicker: 'Materials',
    img: '/stills/04-cowgate-arch.jpg',
    caption: 'Hard, durable carboniferous sandstone that gives Edinburgh its soot-darkened charcoal tone and sharp, unyielding classical profiles.',
  },
  {
    id: 'closes',
    title: 'The Ancient Closes',
    kicker: 'Urban Plan',
    img: '/stills/21-close-gas-lantern.jpg',
    caption: 'Over eighty narrow pedestrian wynds branching like a fishbone off the Royal Mile, descending steeply into the northern and southern valleys.',
  },
  {
    id: 'tenements',
    title: 'Vertical Tenements',
    kicker: 'Habitation',
    img: '/stills/08-cockburn-curve.jpg',
    caption: 'Due to defensive wall constraints, Edinburgh built skyward in the 1600s, creating the world’s earliest multi-storey apartment skyscrapers.',
  },
  {
    id: 'victoria',
    title: 'The Bow Tier',
    kicker: 'Commerce',
    img: '/stills/23-victoria-street-curve.jpg',
    caption: 'The sweeping split-level boulevard constructed with arched stone sub-structures, connecting George IV Bridge down to the historic Grassmarket.',
  },
];

export const HOTSPOTS_DATA = [
  {
    id: 'castle',
    top: '36%',
    left: '26%',
    title: 'Edinburgh Castle',
    kicker: 'Military Citadel',
    desc: 'Perched 440 feet above sea level upon an extinct volcanic plug, site of the Honours of Scotland and the Stone of Scone.',
  },
  {
    id: 'balmoral',
    top: '42%',
    left: '58%',
    title: 'Balmoral Clock Tower',
    kicker: 'Princes Street Landmark',
    desc: 'The iconic 1902 hotel clock famously kept 3 minutes fast so passengers from Waverley Station never miss their trains.',
  },
  {
    id: 'stgiles',
    top: '52%',
    left: '18%',
    title: 'St Giles’ Cathedral',
    kicker: 'The High Kirk',
    desc: 'Focal point of the Scottish Reformation where John Knox preached, topped by its 1495 open-crown stone lantern spire.',
  },
  {
    id: 'dugald',
    top: '58%',
    left: '82%',
    title: 'Dugald Stewart Monument',
    kicker: 'Calton Hill',
    desc: 'William Henry Playfair’s 1831 neoclassical tribute to the Scottish Enlightenment philosopher, overlooking the entire Old Town.',
  },
];

export const NUMBERS = [
  { v: '1,400', k: 'Listed Buildings', body: 'The highest concentration of preserved historic and listed architecture in the United Kingdom.' },
  { v: '1368', k: 'David Hume Era', body: 'The golden age of Enlightenment philosophy, literature, and pioneering scientific discovery.' },
  { v: '350M', k: 'Years of Rock', body: 'Castle Rock’s volcanic basalt core withstood glacial erosion during the last ice age.' },
  { v: '1,100', k: 'Miles of Wynds', body: 'The intricate medieval fishbone network of historic stone wynds, courts, and closes.' },
];

export const MARQUEE = 'GWD TOURS · EDINBURGH IMMERSIVE WALKTHROUGH · THE ATHENS OF THE NORTH · ROYAL MILE · CALTON HILL · CASTLE ROCK · OLD TOWN WYNDS · ';

export function beatsFor(seg) {
  return BEATS.filter((b) => b.seg === seg.id);
}
