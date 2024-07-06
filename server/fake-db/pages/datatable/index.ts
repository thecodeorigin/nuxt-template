import type { SalesDetails } from '@/server/fake-db/pages/datatable/types'

import { getPublicUrl } from '@/server/utils/getPublicUrl'

interface DB {
  salesDetails: SalesDetails[]
}

const avatar1 = getPublicUrl('/images/avatars/avatar-1.png')
const avatar2 = getPublicUrl('/images/avatars/avatar-2.png')
const avatar3 = getPublicUrl('/images/avatars/avatar-3.png')
const avatar4 = getPublicUrl('/images/avatars/avatar-4.png')
const avatar5 = getPublicUrl('/images/avatars/avatar-5.png')
const avatar6 = getPublicUrl('/images/avatars/avatar-6.png')
const avatar7 = getPublicUrl('/images/avatars/avatar-7.png')
const avatar8 = getPublicUrl('/images/avatars/avatar-8.png')

const product10 = getPublicUrl('/images/eCommerce/10.png')
const product11 = getPublicUrl('/images/eCommerce/11.png')
const product13 = getPublicUrl('/images/eCommerce/13.png')
const product14 = getPublicUrl('/images/eCommerce/14.png')
const product15 = getPublicUrl('/images/eCommerce/15.png')
const product16 = getPublicUrl('/images/eCommerce/16.png')
const product17 = getPublicUrl('/images/eCommerce/17.png')
const product18 = getPublicUrl('/images/eCommerce/18.png')
const product19 = getPublicUrl('/images/eCommerce/19.png')
const product20 = getPublicUrl('/images/eCommerce/20.png')
const product23 = getPublicUrl('/images/eCommerce/23.png')
const product24 = getPublicUrl('/images/eCommerce/24.png')
const product25 = getPublicUrl('/images/eCommerce/25.png')
const product26 = getPublicUrl('/images/eCommerce/26.png')
const product3 = getPublicUrl('/images/eCommerce/3.png')
const product4 = getPublicUrl('/images/eCommerce/4.png')
const product5 = getPublicUrl('/images/eCommerce/5.png')
const product6 = getPublicUrl('/images/eCommerce/6.png')
const product7 = getPublicUrl('/images/eCommerce/7.png')
const product8 = getPublicUrl('/images/eCommerce/8.png')
const product9 = getPublicUrl('/images/eCommerce/9.png')

export const db: DB = {
  salesDetails: [
    {
      product: {
        id: 19,
        name: 'OnePlus 7 Pro ',
        slug: 'one-plus-7-pro-19',
        brand: 'Philips',
        category: 'Smart Phone',
        price: 14.99,
        image: product9,
        hasFreeShipping: false,
        rating: 4,
        description:
                    'The OnePlus 7 Pro features a brand new design, with a glass back and front and curved sides. The phone feels\n    very premium but\u2019s it\u2019s also very heavy. The Nebula Blue variant looks slick but it\u2019s quite slippery, which\n    makes single-handed use a real challenge. It has a massive 6.67-inch \u2018Fluid AMOLED\u2019 display with a QHD+\n    resolution, 90Hz refresh rate and support for HDR 10+ content. The display produces vivid colours, deep blacks\n    and has good viewing angles.',
      },
      date: '30 Apr 2020',
      buyer: {
        name: 'Ana Smith',
        avatar: avatar3,
      },
      payment: {
        total: 984,
        receivedPaymentStatus: 'Fully Paid',
        paidAmount: 984,
        status: 'Completed',
      },
    },
    {
      product: {
        id: 21,
        name: 'Google - Google Home',
        slug: 'google-google-home-white-slate-fabric-21',
        brand: 'Google',
        category: 'Google Home',
        price: 129.29,
        image: product7,
        hasFreeShipping: true,
        rating: 4,
        description:
                    'Simplify your everyday life with the Google Home, a voice-activated speaker powered by the Google Assistant. Use\n    voice commands to enjoy music, get answers from Google and manage everyday tasks. Google Home is compatible with\n    Android and iOS operating systems, and can control compatible smart devices such as Chromecast or Nest.',
      },
      date: '11 Jul 2020',
      buyer: {
        name: 'Lindsay Green',
        avatar: avatar8,
      },
      payment: {
        total: 1101,
        receivedPaymentStatus: 'Fully Paid',
        paidAmount: 1101,
        status: 'Completed',
      },
    },
    {
      product: {
        id: 17,
        name: 'Nike Air Max',
        slug: '72-9301-speaker-wire-harness-adapter-for-most-plymouth-dodge-and-mitsubishi-vehicles-multi-17',
        description:
                    'With a bold application of colorblocking inspired by modern art styles, the Nike Air Max 270 React sneaker is constructed with layers of lightweight material to achieve its artful look and comfortable feel.',
        brand: 'Nike',
        category: 'Shoes',
        price: 81.99,
        image: product11,
        hasFreeShipping: true,
        rating: 5,
      },
      date: '06 Jan 2021',
      buyer: {
        name: 'Ethan Lee',
        avatar: avatar1,
      },
      payment: {
        total: 726,
        receivedPaymentStatus: 'Partially Paid',
        paidAmount: 126,
        status: 'Confirmed',
      },
    },
    {
      product: {
        id: 2,
        name: 'Bose Frames Tenor',
        slug: 'bose-frames-tenor-rectangular-polarized-bluetooth-audio-sunglasses-2',
        description:
                    'Redesigned for luxury \u2014 Thoughtfully refined and strikingly elegant, the latest Bose sunglasses blend enhanced features and designs for an elevated way to listen',
        brand: 'Bose',
        category: 'Glass',
        price: 249,
        image: product26,
        hasFreeShipping: false,
        rating: 4,
      },
      date: '21 Aug 2020',
      buyer: {
        name: 'Scott Miller',
        avatar: avatar7,
      },
      payment: {
        total: 646,
        receivedPaymentStatus: 'Partially Paid',
        paidAmount: 345,
        status: 'Confirmed',
      },
    },
    {
      product: {
        id: 25,
        name: 'Apple iMac 27-inch',
        slug: 'apple-i-mac-27-inch-25',
        brand: 'Apple',
        category: 'iMac',
        price: 999.99,
        image: product3,
        hasFreeShipping: true,
        rating: 4,
        description:
                    'The all-in-one for all. If you can dream it, you can do it on iMac. It\u2019s beautifully & incredibly intuitive and\n    packed with tools that let you take any idea to the next level. And the new 27-inch model elevates the\n    experience in way, with faster processors and graphics, expanded memory and storage, enhanced audio and video\n    capabilities, and an even more stunning Retina 5K display. It\u2019s the desktop that does it all \u2014 better and faster\n    than ever.',
      },
      date: '21 Aug 2020',
      buyer: {
        name: 'Brandon Brooks',
        avatar: avatar5,
      },
      payment: {
        total: 1005,
        receivedPaymentStatus: 'Partially Paid',
        paidAmount: 21,
        status: 'Confirmed',
      },
    },
    {
      product: {
        id: 12,
        name: 'Adidas Mens Tech Response Shoes',
        slug: 'adidas-mens-tech-response-shoes-12',
        description:
                    'Comfort + performance.  Designed with materials that are durable, lightweight and extremely comfortable. Core performance delivers the perfect mix of fit, style and all-around performance.',
        brand: 'Adidas',
        category: 'Shoes',
        price: 54.59,
        image: product16,
        hasFreeShipping: false,
        rating: 5,
      },
      date: '10 Mar 2021',
      buyer: {
        name: 'Henry Mann',
        avatar: avatar6,
      },
      payment: {
        total: 1114,
        receivedPaymentStatus: 'Partially Paid',
        paidAmount: 814,
        status: 'Confirmed',
      },
    },
    {
      product: {
        id: 25,
        name: 'Apple iMac 27-inch',
        slug: 'apple-i-mac-27-inch-25',
        brand: 'Apple',
        category: 'iMac',
        price: 999.99,
        image: product3,
        hasFreeShipping: true,
        rating: 4,
        description:
                    'The all-in-one for all. If you can dream it, you can do it on iMac. It\u2019s beautifully & incredibly intuitive and\n    packed with tools that let you take any idea to the next level. And the new 27-inch model elevates the\n    experience in way, with faster processors and graphics, expanded memory and storage, enhanced audio and video\n    capabilities, and an even more stunning Retina 5K display. It\u2019s the desktop that does it all \u2014 better and faster\n    than ever.',
      },
      date: '21 Aug 2020',
      buyer: {
        name: 'Brandon Brooks',
        avatar: avatar5,
      },
      payment: {
        total: 1005,
        receivedPaymentStatus: 'Partially Paid',
        paidAmount: 21,
        status: 'Confirmed',
      },
    },
    {
      product: {
        id: 24,
        name: 'OneOdio A71 Wired Headphones',
        slug: 'one-odio-a71-wired-headphones-24',
        brand: 'OneOdio',
        category: 'Headphone',
        price: 49.99,
        image: product4,
        hasFreeShipping: true,
        rating: 3,
        description:
                    'Omnidirectional detachable boom mic upgrades the headphones into a professional headset for gaming, business,\n    podcasting and taking calls on the go. Better pick up your voice. Control most electric devices through voice\n    activation, or schedule a ride with Uber and order a pizza. OneOdio A71 Wired Headphones voice-controlled device\n    turns any home into a smart device on a smartphone or tablet.',
      },
      date: '12 Nov 2020',
      buyer: {
        name: 'Grant Wright',
        avatar: avatar2,
      },
      payment: {
        total: 207,
        receivedPaymentStatus: 'Fully Paid',
        paidAmount: 207,
        status: 'Completed',
      },
    },
    {
      product: {
        id: 20,
        name: 'Sony 4K Ultra HD LED TV ',
        slug: 'sony-4-k-ultra-hd-led-tv-20',
        brand: 'Apple',
        category: 'Smart TV',
        price: 7999.99,
        image: product8,
        hasFreeShipping: false,
        rating: 5,
        description:
                    'Sony 4K Ultra HD LED TV has 4K HDR Support. The TV provides clear visuals and provides distinct sound quality\n    and an immersive experience. This TV has Yes HDMI ports & Yes USB ports. Connectivity options included are HDMI.\n    You can connect various gadgets such as your laptop using the HDMI port. The TV comes with a 1 Year warranty.',
      },
      date: '19 Apr 2021',
      buyer: {
        name: 'Amanda Sanchez',
        avatar: avatar2,
      },
      payment: {
        total: 1119,
        receivedPaymentStatus: 'Fully Paid',
        paidAmount: 1119,
        status: 'Completed',
      },
    },
    {
      product: {
        id: 23,
        name: 'Apple - MacBook Air\u00AE',
        slug: 'apple-mac-book-air-latest-model-13-3-display-silver-23',
        brand: 'Apple',
        category: 'Mac',
        price: 999.99,
        image: product5,
        hasFreeShipping: false,
        rating: 4,
        description:
                    'MacBook Air is a thin, lightweight laptop from Apple. MacBook Air features up to 8GB of memory, a\n    fifth-generation Intel Core processor, Thunderbolt 2, great built-in apps, and all-day battery life.1 Its thin,\n    light, and durable enough to take everywhere you go-and powerful enough to do everything once you get there,\n better.',
      },
      date: '25 Dec 2020',
      buyer: {
        name: 'Kathy Estrada',
        avatar: avatar2,
      },
      payment: {
        total: 1221,
        receivedPaymentStatus: 'Partially Paid',
        paidAmount: 1025,
        status: 'Confirmed',
      },
    },
    {
      product: {
        id: 25,
        name: 'Apple iMac 27-inch',
        slug: 'apple-i-mac-27-inch-25',
        brand: 'Apple',
        category: 'iMac',
        price: 999.99,
        image: product3,
        hasFreeShipping: true,
        rating: 4,
        description:
                    'The all-in-one for all. If you can dream it, you can do it on iMac. It\u2019s beautifully & incredibly intuitive and\n    packed with tools that let you take any idea to the next level. And the new 27-inch model elevates the\n    experience in way, with faster processors and graphics, expanded memory and storage, enhanced audio and video\n capabilities, and an even more stunning Retina 5K display. It\u2019s the desktop that does it all \u2014 better and faster\n than ever.',
      },
      date: '19 May 2020',
      buyer: {
        name: 'William Lopez',
        avatar: avatar2,
      },
      payment: {
        total: 973,
        receivedPaymentStatus: 'Partially Paid',
        paidAmount: 374,
        status: 'Confirmed',
      },
    },
    {
      product: {
        id: 8,
        name: 'PlayStation 4 Console',
        slug: 'play-station-4-console-8',
        description:
                    'All the greatest, games, TV, music and more. Connect with your friends to broadcast and celebrate your epic moments at the press of the Share button to Twitch, YouTube, Facebook and Twitter.',
        brand: 'Sony',
        category: 'Gaming',
        price: 339.95,
        image: product20,
        hasFreeShipping: false,
        rating: 4,
      },
      date: '27 Mar 2021',
      buyer: {
        name: 'Colleen Taylor',
        avatar: avatar2,
      },
      payment: {
        total: 1235,
        receivedPaymentStatus: 'Fully Paid',
        paidAmount: 1235,
        status: 'Completed',
      },
    },
    {
      product: {
        id: 5,
        name: 'Toshiba Canvio External Hard Drive',
        slug: 'toshiba-canvio-advance-2-tb-portable-external-hard-drive-5',
        description: 'Up to 3TB of storage capacity to store your growing files and content',
        brand: 'Toshiba',
        category: 'Storage Device',
        price: 69.99,
        image: product23,
        hasFreeShipping: true,
        rating: 2,
      },
      date: '21 Jun 2020',
      buyer: {
        name: 'Melanie Olson',
        avatar: avatar6,
      },
      payment: {
        total: 780,
        receivedPaymentStatus: 'Fully Paid',
        paidAmount: 780,
        status: 'Completed',
      },
    },
    {
      product: {
        id: 19,
        name: 'OnePlus 7 Pro ',
        slug: 'one-plus-7-pro-19',
        brand: 'Philips',
        category: 'Smart Phone',
        price: 14.99,
        image: product9,
        hasFreeShipping: false,
        rating: 4,
        description:
                    'The OnePlus 7 Pro features a brand new design, with a glass back and front and curved sides. The phone feels\n    very premium but\u2019s it\u2019s also very heavy. The Nebula Blue variant looks slick but it\u2019s quite slippery, which\n    makes single-handed use a real challenge. It has a massive 6.67-inch \u2018Fluid AMOLED\u2019 display with a QHD+\n    resolution, 90Hz refresh rate and support for HDR 10+ content. The display produces vivid colours, deep blacks\n    and has good viewing angles.',
      },
      date: '28 Jan 2021',
      buyer: {
        name: 'Cynthia Cannon',
        avatar: avatar7,
      },
      payment: {
        total: 1073,
        receivedPaymentStatus: 'Partially Paid',
        paidAmount: 871,
        status: 'Confirmed',
      },
    },
    {
      product: {
        id: 23,
        name: 'Apple - MacBook Air\u00AE',
        slug: 'apple-mac-book-air-latest-model-13-3-display-silver-23',
        brand: 'Apple',
        category: 'Mac',
        price: 999.99,
        image: product5,
        hasFreeShipping: false,
        rating: 4,
        description:
                    'MacBook Air is a thin, lightweight laptop from Apple. MacBook Air features up to 8GB of memory, a\n    fifth-generation Intel Core processor, Thunderbolt 2, great built-in apps, and all-day battery life.1 Its thin,\n    light, and durable enough to take everywhere you go-and powerful enough to do everything once you get there,\n better.',
      },
      date: '20 Aug 2020',
      buyer: {
        name: 'David Archer',
        avatar: avatar5,
      },
      payment: {
        total: 224,
        receivedPaymentStatus: 'Fully Paid',
        paidAmount: 224,
        status: 'Completed',
      },
    },
    {
      product: {
        id: 9,
        name: 'Giotto 32oz Leakproof BPA Free Drinking Water',
        slug: 'giotto-32oz-leakproof-bpa-free-drinking-water-9',
        description:
                    'With unique inspirational quote and time markers on it,this water bottle is great for measuring your daily intake of water,reminding you stay hydrated and drink enough water throughout the day.A must have for any fitness goals including weight loss,appetite control and overall health.',
        brand: '3M',
        category: 'Home',
        price: 16.99,
        image: product19,
        hasFreeShipping: true,
        rating: 4,
      },
      date: '29 Dec 2020',
      buyer: {
        name: 'Michael Cervantes',
        avatar: avatar8,
      },
      payment: {
        total: 960,
        receivedPaymentStatus: 'Partially Paid',
        paidAmount: 866,
        status: 'Confirmed',
      },
    },
    {
      product: {
        id: 13,
        name: 'Laptop Bag',
        slug: 'laptop-bag-13',
        description:
                    'TSA FRIENDLY- A separate DIGI SMART compartment can hold 15.6 inch Laptop as well as 15 inch, 14 inch MacBook, 12.9 inch iPad, and tech accessories like charger for quick TSA checkpoint when traveling',
        brand: 'TAS',
        category: 'Bag',
        price: 29.99,
        image: product15,
        hasFreeShipping: true,
        rating: 5,
      },
      date: '15 Aug 2020',
      buyer: {
        name: 'Nathaniel Marshall',
        avatar: avatar6,
      },
      payment: {
        total: 1423,
        receivedPaymentStatus: 'Unpaid',
        paidAmount: 0,
        status: 'Cancelled',
      },
    },
    {
      product: {
        id: 5,
        name: 'Toshiba Canvio External Hard Drive',
        slug: 'toshiba-canvio-advance-2-tb-portable-external-hard-drive-5',
        description: 'Up to 3TB of storage capacity to store your growing files and content',
        brand: 'Toshiba',
        category: 'Storage Device',
        price: 69.99,
        image: product23,
        hasFreeShipping: true,
        rating: 2,
      },
      date: '03 Jan 2021',
      buyer: {
        name: 'Tiffany Ross',
        avatar: avatar4,
      },
      payment: {
        total: 663,
        receivedPaymentStatus: 'Partially Paid',
        paidAmount: 285,
        status: 'Confirmed',
      },
    },
    {
      product: {
        id: 14,
        name: 'Wireless Charger 5W Max',
        slug: 'wireless-charger-5-w-max-14',
        description:
                    'Charge with case: transmits charging power directly through protective cases. Rubber/plastic/TPU cases under 5 mm thickness . Do not use any magnetic and metal attachments or cards, or it will prevent charging.',
        brand: '3M',
        category: 'Electronics',
        price: 10.83,
        image: product14,
        hasFreeShipping: true,
        rating: 3,
      },
      date: '20 Dec 2020',
      buyer: {
        name: 'Philip Walters',
        avatar: null,
      },
      payment: {
        total: 1112,
        receivedPaymentStatus: 'Partially Paid',
        paidAmount: 426,
        status: 'Confirmed',
      },
    },
    {
      product: {
        id: 15,
        name: 'Vankyo leisure 3 mini projector',
        slug: '3-m-filtrete-vacuum-belt-for-select-hoover-t-series-upright-vacuums-15',
        description:
                    'SUPERIOR VIEWING EXPERIENCE: Supporting 1920x1080 resolution, VANKYO Leisure 3 projector is powered by MStar Advanced Color Engine, which is ideal for home entertainment. 2020 upgraded LED lighting provides a superior viewing experience for you.',
        brand: 'Vankyo Store',
        category: 'Projector',
        price: 99.99,
        image: product13,
        hasFreeShipping: true,
        rating: 2,
      },
      date: '02 Jul 2020',
      buyer: {
        name: 'Pamela Smith',
        avatar: null,
      },
      payment: {
        total: 462,
        receivedPaymentStatus: 'Partially Paid',
        paidAmount: 383,
        status: 'Confirmed',
      },
    },
    {
      product: {
        id: 12,
        name: 'Adidas Mens Tech Response Shoes',
        slug: 'adidas-mens-tech-response-shoes-12',
        description:
                    'Comfort + performance.  Designed with materials that are durable, lightweight and extremely comfortable. Core performance delivers the perfect mix of fit, style and all-around performance.',
        brand: 'Adidas',
        category: 'Shoes',
        price: 54.59,
        image: product16,
        hasFreeShipping: false,
        rating: 5,
      },
      date: '24 Jul 2020',
      buyer: {
        name: 'Kara Gonzalez',
        avatar: avatar3,
      },
      payment: {
        total: 1325,
        receivedPaymentStatus: 'Partially Paid',
        paidAmount: 792,
        status: 'Confirmed',
      },
    },
    {
      product: {
        id: 18,
        name: 'Logitech K380 Wireless Keyboard',
        slug: 'acer-11-6-chromebook-intel-celeron-2-gb-memory-16-gb-e-mmc-flash-memory-moonstone-white-18',
        description:
                    'Logitech K380 Bluetooth Wireless Keyboard gives you the comfort and convenience of desktop typing on your smartphone, and tablet. It is a wireless keyboard that connects to all Bluetooth wireless devices that support external keyboards. Take this compact, lightweight, Bluetooth keyboard anywhere in your home. Type wherever you like, on any compatible computer, phone or tablet.',
        brand: 'Logitech',
        category: 'Keyboard',
        price: 81.99,
        image: product10,
        hasFreeShipping: false,
        rating: 4,
      },
      date: '07 Jan 2021',
      buyer: {
        name: 'Katherine Tate',
        avatar: avatar8,
      },
      payment: {
        total: 582,
        receivedPaymentStatus: 'Partially Paid',
        paidAmount: 234,
        status: 'Confirmed',
      },
    },
    {
      product: {
        id: 3,
        name: 'Willful Smart Watch for Men Women 2020,',
        slug: 'willful-smart-watch-for-men-women-2020-3',
        description:
                    'Are you looking for a smart watch, which can not only easily keep tracking of your steps, calories, heart rate and sleep quality, but also keep you informed of incoming calls.',
        brand: 'Willful',
        category: 'Smart Watch',
        price: 29.99,
        image: product25,
        hasFreeShipping: true,
        rating: 5,
      },
      date: '29 Aug 2020',
      buyer: {
        name: 'Ashley Douglas DDS',
        avatar: avatar3,
      },
      payment: {
        total: 1092,
        receivedPaymentStatus: 'Fully Paid',
        paidAmount: 1092,
        status: 'Completed',
      },
    },
    {
      product: {
        id: 22,
        name: 'Switch Pro Controller',
        slug: 'switch-pro-controller-22',
        brand: 'Sharp',
        category: 'Gaming',
        price: 429.99,
        image: product6,
        hasFreeShipping: false,
        rating: 3,
        description:
                    'The Nintendo Switch Pro Controller is one of the priciest \'baseline\' controllers in the current console\n generation, but it\'s also sturdy, feels good to play with, has an excellent direction pad, and features\n    impressive motion sensors and vibration systems. On top of all of that, it uses Bluetooth, so you don\'t need an\n    adapter to use it with your PC.',
      },
      date: '09 Jan 2021',
      buyer: {
        name: 'Eric Gregory',
        avatar: avatar3,
      },
      payment: {
        total: 939,
        receivedPaymentStatus: 'Fully Paid',
        paidAmount: 939,
        status: 'Completed',
      },
    },
    {
      product: {
        id: 4,
        name: 'Ronyes Unisex College Bag Bookbags for Women',
        slug: 'ronyes-unisex-college-bag-bookbags-for-women-4',
        description:
                    'Made of high quality water-resistant material; padded and adjustable shoulder straps; external USB with built-in charging cable offers a convenient charging',
        brand: 'Ronyes',
        category: 'Bag',
        price: 23.99,
        image: product24,
        hasFreeShipping: true,
        rating: 2,
      },
      date: '06 May 2020',
      buyer: {
        name: 'Taylor Hernandez',
        avatar: avatar3,
      },
      payment: {
        total: 1129,
        receivedPaymentStatus: 'Unpaid',
        paidAmount: 0,
        status: 'Cancelled',
      },
    },
    {
      product: {
        id: 10,
        name: 'Oculus Quest All-in-one VR',
        slug: 'oculus-quest-all-in-one-vr-10',
        description:
                    'All-in-one VR: No PC. No wires. No limits. Oculus quest is an all-in-one gaming system built for virtual reality. Now you can play almost anywhere with just a VR headset and controllers. Oculus touch controllers: arm yourself with the award-winning Oculus touch controllers. Your slashes, throws and grab appear in VR with intuitive, realistic Precision, transporting your hands and gestures right into the game',
        brand: 'Oculus',
        category: 'VR',
        price: 645,
        image: product18,
        hasFreeShipping: false,
        rating: 1,
      },
      date: '29 Dec 2020',
      buyer: {
        name: 'Justin Patterson',
        avatar: avatar3,
      },
      payment: {
        total: 252,
        receivedPaymentStatus: 'Fully Paid',
        paidAmount: 252,
        status: 'Completed',
      },
    },
    {
      product: {
        id: 11,
        name: 'Handbags for Women Large Designer bag',
        slug: 'handbags-for-women-large-designer-bag-11',
        description:
                    'Classic Hobo Purse: Top zipper closure, with 2 side zipper pockets design and elegant tassels decoration, fashionable and practical handbags for women, perfect for shopping, dating, travel and business',
        brand: 'Hobo',
        category: 'Bag',
        price: 39.99,
        image: product17,
        hasFreeShipping: true,
        rating: 3,
      },
      date: '19 Dec 2020',
      buyer: {
        name: 'Judy Cummings',
        avatar: avatar3,
      },
      payment: {
        total: 1369,
        receivedPaymentStatus: 'Fully Paid',
        paidAmount: 1369,
        status: 'Completed',
      },
    },
    {
      product: {
        id: 18,
        name: 'Logitech K380 Wireless Keyboard',
        slug: 'acer-11-6-chromebook-intel-celeron-2-gb-memory-16-gb-e-mmc-flash-memory-moonstone-white-18',
        description:
                    'Logitech K380 Bluetooth Wireless Keyboard gives you the comfort and convenience of desktop typing on your smartphone, and tablet. It is a wireless keyboard that connects to all Bluetooth wireless devices that support external keyboards. Take this compact, lightweight, Bluetooth keyboard anywhere in your home. Type wherever you like, on any compatible computer, phone or tablet.',
        brand: 'Logitech',
        category: 'Keyboard',
        price: 81.99,
        image: product10,
        hasFreeShipping: false,
        rating: 4,
      },
      date: '02 Jan 2021',
      buyer: {
        name: 'Linda Buchanan',
        avatar: avatar7,
      },
      payment: {
        total: 351,
        receivedPaymentStatus: 'Fully Paid',
        paidAmount: 351,
        status: 'Completed',
      },
    },
    {
      product: {
        id: 21,
        name: 'Google - Google Home',
        slug: 'google-google-home-white-slate-fabric-21',
        brand: 'Google',
        category: 'Google Home',
        price: 129.29,
        image: product7,
        hasFreeShipping: true,
        rating: 4,
        description:
                    'Simplify your everyday life with the Google Home, a voice-activated speaker powered by the Google Assistant. Use\n    voice commands to enjoy music, get answers from Google and manage everyday tasks. Google Home is compatible with\n    Android and iOS operating systems, and can control compatible smart devices such as Chromecast or Nest.',
      },
      date: '25 Feb 2021',
      buyer: {
        name: 'Brian Perez',
        avatar: avatar8,
      },
      payment: {
        total: 506,
        receivedPaymentStatus: 'Partially Paid',
        paidAmount: 497,
        status: 'Confirmed',
      },
    },
    {
      product: {
        id: 3,
        name: 'Willful Smart Watch for Men Women 2020,',
        slug: 'willful-smart-watch-for-men-women-2020-3',
        description:
                    'Are you looking for a smart watch, which can not only easily keep tracking of your steps, calories, heart rate and sleep quality, but also keep you informed of incoming calls.',
        brand: 'Willful',
        category: 'Smart Watch',
        price: 29.99,
        image: product25,
        hasFreeShipping: true,
        rating: 5,
      },
      date: '13 Sep 2020',
      buyer: {
        name: 'Amy White',
        avatar: null,
      },
      payment: {
        total: 195,
        receivedPaymentStatus: 'Fully Paid',
        paidAmount: 195,
        status: 'Completed',
      },
    },
    {
      product: {
        id: 18,
        name: 'Logitech K380 Wireless Keyboard',
        slug: 'acer-11-6-chromebook-intel-celeron-2-gb-memory-16-gb-e-mmc-flash-memory-moonstone-white-18',
        description:
                    'Logitech K380 Bluetooth Wireless Keyboard gives you the comfort and convenience of desktop typing on your smartphone, and tablet. It is a wireless keyboard that connects to all Bluetooth wireless devices that support external keyboards. Take this compact, lightweight, Bluetooth keyboard anywhere in your home. Type wherever you like, on any compatible computer, phone or tablet.',
        brand: 'Logitech',
        category: 'Keyboard',
        price: 81.99,
        image: product10,
        hasFreeShipping: false,
        rating: 4,
      },
      date: '30 Sep 2020',
      buyer: {
        name: 'Katherine Clark',
        avatar: avatar1,
      },
      payment: {
        total: 1246,
        receivedPaymentStatus: 'Partially Paid',
        paidAmount: 475,
        status: 'Confirmed',
      },
    },
    {
      product: {
        id: 14,
        name: 'Wireless Charger 5W Max',
        slug: 'wireless-charger-5-w-max-14',
        description:
                    'Charge with case: transmits charging power directly through protective cases. Rubber/plastic/TPU cases under 5 mm thickness . Do not use any magnetic and metal attachments or cards, or it will prevent charging.',
        brand: '3M',
        category: 'Electronics',
        price: 10.83,
        image: product14,
        hasFreeShipping: true,
        rating: 3,
      },
      date: '26 Mar 2021',
      buyer: {
        name: 'Jose Murphy',
        avatar: avatar5,
      },
      payment: {
        total: 383,
        receivedPaymentStatus: 'Fully Paid',
        paidAmount: 383,
        status: 'Completed',
      },
    },
    {
      product: {
        id: 2,
        name: 'Bose Frames Tenor',
        slug: 'bose-frames-tenor-rectangular-polarized-bluetooth-audio-sunglasses-2',
        description:
                    'Redesigned for luxury \u2014 Thoughtfully refined and strikingly elegant, the latest Bose sunglasses blend enhanced features and designs for an elevated way to listen',
        brand: 'Bose',
        category: 'Glass',
        price: 249,
        image: product26,
        hasFreeShipping: false,
        rating: 4,
      },
      date: '01 Dec 2020',
      buyer: {
        name: 'Jeffrey Rose',
        avatar: avatar5,
      },
      payment: {
        total: 902,
        receivedPaymentStatus: 'Fully Paid',
        paidAmount: 902,
        status: 'Completed',
      },
    },
    {
      product: {
        id: 24,
        name: 'OneOdio A71 Wired Headphones',
        slug: 'one-odio-a71-wired-headphones-24',
        brand: 'OneOdio',
        category: 'Headphone',
        price: 49.99,
        image: product4,
        hasFreeShipping: true,
        rating: 3,
        description:
                    'Omnidirectional detachable boom mic upgrades the headphones into a professional headset for gaming, business,\n    podcasting and taking calls on the go. Better pick up your voice. Control most electric devices through voice\n    activation, or schedule a ride with Uber and order a pizza. OneOdio A71 Wired Headphones voice-controlled device\n    turns any home into a smart device on a smartphone or tablet.',
      },
      date: '15 Sep 2020',
      buyer: {
        name: 'Amber Hunt',
        avatar: avatar7,
      },
      payment: {
        total: 379,
        receivedPaymentStatus: 'Partially Paid',
        paidAmount: 174,
        status: 'Confirmed',
      },
    },
    {
      product: {
        id: 2,
        name: 'Bose Frames Tenor',
        slug: 'bose-frames-tenor-rectangular-polarized-bluetooth-audio-sunglasses-2',
        description:
                    'Redesigned for luxury \u2014 Thoughtfully refined and strikingly elegant, the latest Bose sunglasses blend enhanced features and designs for an elevated way to listen',
        brand: 'Bose',
        category: 'Glass',
        price: 249,
        image: product26,
        hasFreeShipping: false,
        rating: 4,
      },
      date: '08 Apr 2021',
      buyer: {
        name: 'Christopher Haas',
        avatar: avatar2,
      },
      payment: {
        total: 7,
        receivedPaymentStatus: 'Unpaid',
        paidAmount: 0,
        status: 'Confirmed',
      },
    },
    {
      product: {
        id: 2,
        name: 'Bose Frames Tenor',
        slug: 'bose-frames-tenor-rectangular-polarized-bluetooth-audio-sunglasses-2',
        description:
                    'Redesigned for luxury \u2014 Thoughtfully refined and strikingly elegant, the latest Bose sunglasses blend enhanced features and designs for an elevated way to listen',
        brand: 'Bose',
        category: 'Glass',
        price: 249,
        image: product26,
        hasFreeShipping: false,
        rating: 4,
      },
      date: '21 Oct 2020',
      buyer: {
        name: 'Stephen Mccormick',
        avatar: avatar6,
      },
      payment: {
        total: 186,
        receivedPaymentStatus: 'Partially Paid',
        paidAmount: 81,
        status: 'Confirmed',
      },
    },
    {
      product: {
        id: 19,
        name: 'OnePlus 7 Pro ',
        slug: 'one-plus-7-pro-19',
        brand: 'Philips',
        category: 'Smart Phone',
        price: 14.99,
        image: product9,
        hasFreeShipping: false,
        rating: 4,
        description:
                    'The OnePlus 7 Pro features a brand new design, with a glass back and front and curved sides. The phone feels\n    very premium but\u2019s it\u2019s also very heavy. The Nebula Blue variant looks slick but it\u2019s quite slippery, which\n    makes single-handed use a real challenge. It has a massive 6.67-inch \u2018Fluid AMOLED\u2019 display with a QHD+\n    resolution, 90Hz refresh rate and support for HDR 10+ content. The display produces vivid colours, deep blacks\n    and has good viewing angles.',
      },
      date: '21 Oct 2020',
      buyer: {
        name: 'Matthew Reyes',
        avatar: avatar3,
      },
      payment: {
        total: 198,
        receivedPaymentStatus: 'Fully Paid',
        paidAmount: 198,
        status: 'Completed',
      },
    },
    {
      product: {
        id: 4,
        name: 'Ronyes Unisex College Bag Bookbags for Women',
        slug: 'ronyes-unisex-college-bag-bookbags-for-women-4',
        description:
                    'Made of high quality water-resistant material; padded and adjustable shoulder straps; external USB with built-in charging cable offers a convenient charging',
        brand: 'Ronyes',
        category: 'Bag',
        price: 23.99,
        image: product24,
        hasFreeShipping: true,
        rating: 2,
      },
      date: '16 May 2020',
      buyer: {
        name: 'Ricardo Morgan',
        avatar: avatar5,
      },
      payment: {
        total: 519,
        receivedPaymentStatus: 'Partially Paid',
        paidAmount: 447,
        status: 'Confirmed',
      },
    },
    {
      product: {
        id: 20,
        name: 'Sony 4K Ultra HD LED TV ',
        slug: 'sony-4-k-ultra-hd-led-tv-20',
        brand: 'Apple',
        category: 'Smart TV',
        price: 7999.99,
        image: product8,
        hasFreeShipping: false,
        rating: 5,
        description:
                    'Sony 4K Ultra HD LED TV has 4K HDR Support. The TV provides clear visuals and provides distinct sound quality\n    and an immersive experience. This TV has Yes HDMI ports & Yes USB ports. Connectivity options included are HDMI.\n    You can connect various gadgets such as your laptop using the HDMI port. The TV comes with a 1 Year warranty.',
      },
      date: '01 Jul 2020',
      buyer: {
        name: 'William Castillo',
        avatar: avatar4,
      },
      payment: {
        total: 10,
        receivedPaymentStatus: 'Partially Paid',
        paidAmount: 6,
        status: 'Confirmed',
      },
    },
    {
      product: {
        id: 11,
        name: 'Handbags for Women Large Designer bag',
        slug: 'handbags-for-women-large-designer-bag-11',
        description:
                    'Classic Hobo Purse: Top zipper closure, with 2 side zipper pockets design and elegant tassels decoration, fashionable and practical handbags for women, perfect for shopping, dating, travel and business',
        brand: 'Hobo',
        category: 'Bag',
        price: 39.99,
        image: product17,
        hasFreeShipping: true,
        rating: 3,
      },
      date: '04 Jul 2020',
      buyer: {
        name: 'James Coleman',
        avatar: avatar8,
      },
      payment: {
        total: 897,
        receivedPaymentStatus: 'Partially Paid',
        paidAmount: 677,
        status: 'Confirmed',
      },
    },
    {
      product: {
        id: 18,
        name: 'Logitech K380 Wireless Keyboard',
        slug: 'acer-11-6-chromebook-intel-celeron-2-gb-memory-16-gb-e-mmc-flash-memory-moonstone-white-18',
        description:
                    'Logitech K380 Bluetooth Wireless Keyboard gives you the comfort and convenience of desktop typing on your smartphone, and tablet. It is a wireless keyboard that connects to all Bluetooth wireless devices that support external keyboards. Take this compact, lightweight, Bluetooth keyboard anywhere in your home. Type wherever you like, on any compatible computer, phone or tablet.',
        brand: 'Logitech',
        category: 'Keyboard',
        price: 81.99,
        image: product10,
        hasFreeShipping: false,
        rating: 4,
      },
      date: '19 Feb 2021',
      buyer: {
        name: 'Michael Summers',
        avatar: avatar3,
      },
      payment: {
        total: 653,
        receivedPaymentStatus: 'Fully Paid',
        paidAmount: 653,
        status: 'Completed',
      },
    },
    {
      product: {
        id: 3,
        name: 'Willful Smart Watch for Men Women 2020,',
        slug: 'willful-smart-watch-for-men-women-2020-3',
        description:
                    'Are you looking for a smart watch, which can not only easily keep tracking of your steps, calories, heart rate and sleep quality, but also keep you informed of incoming calls.',
        brand: 'Willful',
        category: 'Smart Watch',
        price: 29.99,
        image: product25,
        hasFreeShipping: true,
        rating: 5,
      },
      date: '03 Mar 2021',
      buyer: {
        name: 'Jeremiah Espinoza',
        avatar: avatar2,
      },
      payment: {
        total: 913,
        receivedPaymentStatus: 'Partially Paid',
        paidAmount: 468,
        status: 'Confirmed',
      },
    },
    {
      product: {
        id: 2,
        name: 'Bose Frames Tenor',
        slug: 'bose-frames-tenor-rectangular-polarized-bluetooth-audio-sunglasses-2',
        description:
                    'Redesigned for luxury \u2014 Thoughtfully refined and strikingly elegant, the latest Bose sunglasses blend enhanced features and designs for an elevated way to listen',
        brand: 'Bose',
        category: 'Glass',
        price: 249,
        image: product26,
        hasFreeShipping: false,
        rating: 4,
      },
      date: '03 Mar 2021',
      buyer: {
        name: 'Tyler Brooks',
        avatar: null,
      },
      payment: {
        total: 1123,
        receivedPaymentStatus: 'Fully Paid',
        paidAmount: 1123,
        status: 'Completed',
      },
    },
    {
      product: {
        id: 17,
        name: 'Nike Air Max',
        slug: '72-9301-speaker-wire-harness-adapter-for-most-plymouth-dodge-and-mitsubishi-vehicles-multi-17',
        description:
                    'With a bold application of colorblocking inspired by modern art styles, the Nike Air Max 270 React sneaker is constructed with layers of lightweight material to achieve its artful look and comfortable feel.',
        brand: 'Nike',
        category: 'Shoes',
        price: 81.99,
        image: product11,
        hasFreeShipping: true,
        rating: 5,
      },
      date: '29 Dec 2020',
      buyer: {
        name: 'Juan Wilson',
        avatar: avatar3,
      },
      payment: {
        total: 779,
        receivedPaymentStatus: 'Fully Paid',
        paidAmount: 779,
        status: 'Completed',
      },
    },
    {
      product: {
        id: 15,
        name: 'Vankyo leisure 3 mini projector',
        slug: '3-m-filtrete-vacuum-belt-for-select-hoover-t-series-upright-vacuums-15',
        description:
                    'SUPERIOR VIEWING EXPERIENCE: Supporting 1920x1080 resolution, VANKYO Leisure 3 projector is powered by MStar Advanced Color Engine, which is ideal for home entertainment. 2020 upgraded LED lighting provides a superior viewing experience for you.',
        brand: 'Vankyo Store',
        category: 'Projector',
        price: 99.99,
        image: product13,
        hasFreeShipping: true,
        rating: 2,
      },
      date: '03 Dec 2020',
      buyer: {
        name: 'Marvin Duran',
        avatar: null,
      },
      payment: {
        total: 594,
        receivedPaymentStatus: 'Unpaid',
        paidAmount: 0,
        status: 'Cancelled',
      },
    },
    {
      product: {
        id: 22,
        name: 'Switch Pro Controller',
        slug: 'switch-pro-controller-22',
        brand: 'Sharp',
        category: 'Gaming',
        price: 429.99,
        image: product6,
        hasFreeShipping: false,
        rating: 3,
        description:
                    'The Nintendo Switch Pro Controller is one of the priciest \'baseline\' controllers in the current console\n    generation, but it\'s also sturdy, feels good to play with, has an excellent direction pad, and features\n impressive motion sensors and vibration systems. On top of all of that, it uses Bluetooth, so you don\'t need an\n    adapter to use it with your PC.',
      },
      date: '28 May 2020',
      buyer: {
        name: 'Jessica Glass',
        avatar: avatar5,
      },
      payment: {
        total: 1065,
        receivedPaymentStatus: 'Partially Paid',
        paidAmount: 844,
        status: 'Confirmed',
      },
    },
    {
      product: {
        id: 18,
        name: 'Logitech K380 Wireless Keyboard',
        slug: 'acer-11-6-chromebook-intel-celeron-2-gb-memory-16-gb-e-mmc-flash-memory-moonstone-white-18',
        description:
                    'Logitech K380 Bluetooth Wireless Keyboard gives you the comfort and convenience of desktop typing on your smartphone, and tablet. It is a wireless keyboard that connects to all Bluetooth wireless devices that support external keyboards. Take this compact, lightweight, Bluetooth keyboard anywhere in your home. Type wherever you like, on any compatible computer, phone or tablet.',
        brand: 'Logitech',
        category: 'Keyboard',
        price: 81.99,
        image: product10,
        hasFreeShipping: false,
        rating: 4,
      },
      date: '17 May 2020',
      buyer: {
        name: 'Gary Herman',
        avatar: avatar8,
      },
      payment: {
        total: 432,
        receivedPaymentStatus: 'Partially Paid',
        paidAmount: 64,
        status: 'Confirmed',
      },
    },
    {
      product: {
        id: 19,
        name: 'OnePlus 7 Pro ',
        slug: 'one-plus-7-pro-19',
        brand: 'Philips',
        category: 'Smart Phone',
        price: 14.99,
        image: product9,
        hasFreeShipping: false,
        rating: 4,
        description:
                    'The OnePlus 7 Pro features a brand new design, with a glass back and front and curved sides. The phone feels\n    very premium but\u2019s it\u2019s also very heavy. The Nebula Blue variant looks slick but it\u2019s quite slippery, which\n    makes single-handed use a real challenge. It has a massive 6.67-inch \u2018Fluid AMOLED\u2019 display with a QHD+\n    resolution, 90Hz refresh rate and support for HDR 10+ content. The display produces vivid colours, deep blacks\n    and has good viewing angles.',
      },
      date: '25 Mar 2021',
      buyer: {
        name: 'Adam Williams',
        avatar: avatar2,
      },
      payment: {
        total: 1402,
        receivedPaymentStatus: 'Partially Paid',
        paidAmount: 434,
        status: 'Confirmed',
      },
    },
    {
      product: {
        id: 20,
        name: 'Sony 4K Ultra HD LED TV ',
        slug: 'sony-4-k-ultra-hd-led-tv-20',
        brand: 'Apple',
        category: 'Smart TV',
        price: 7999.99,
        image: product8,
        hasFreeShipping: false,
        rating: 5,
        description:
                    'Sony 4K Ultra HD LED TV has 4K HDR Support. The TV provides clear visuals and provides distinct sound quality\n    and an immersive experience. This TV has Yes HDMI ports & Yes USB ports. Connectivity options included are HDMI.\n    You can connect various gadgets such as your laptop using the HDMI port. The TV comes with a 1 Year warranty.',
      },
      date: '13 Apr 2021',
      buyer: {
        name: 'Bobby Brown',
        avatar: null,
      },
      payment: {
        total: 100,
        receivedPaymentStatus: 'Partially Paid',
        paidAmount: 65,
        status: 'Confirmed',
      },
    },
    {
      product: {
        id: 14,
        name: 'Wireless Charger 5W Max',
        slug: 'wireless-charger-5-w-max-14',
        description:
                    'Charge with case: transmits charging power directly through protective cases. Rubber/plastic/TPU cases under 5 mm thickness . Do not use any magnetic and metal attachments or cards, or it will prevent charging.',
        brand: '3M',
        category: 'Electronics',
        price: 10.83,
        image: product14,
        hasFreeShipping: true,
        rating: 3,
      },
      date: '07 Aug 2020',
      buyer: {
        name: 'Sharon Moss',
        avatar: avatar8,
      },
      payment: {
        total: 823,
        receivedPaymentStatus: 'Unpaid',
        paidAmount: 0,
        status: 'Cancelled',
      },
    },
    {
      product: {
        id: 15,
        name: 'Vankyo leisure 3 mini projector',
        slug: '3-m-filtrete-vacuum-belt-for-select-hoover-t-series-upright-vacuums-15',
        description:
                    'SUPERIOR VIEWING EXPERIENCE: Supporting 1920x1080 resolution, VANKYO Leisure 3 projector is powered by MStar Advanced Color Engine, which is ideal for home entertainment. 2020 upgraded LED lighting provides a superior viewing experience for you.',
        brand: 'Vankyo Store',
        category: 'Projector',
        price: 99.99,
        image: product13,
        hasFreeShipping: true,
        rating: 2,
      },
      date: '23 Feb 2021',
      buyer: {
        name: 'Scott Buchanan',
        avatar: avatar5,
      },
      payment: {
        total: 183,
        receivedPaymentStatus: 'Unpaid',
        paidAmount: 0,
        status: 'Cancelled',
      },
    },
  ],
}
