import type {
  ConnectionsTab,
  ProfileHeader,
  ProfileTab,
  ProjectTableRow,
  ProjectsTab,
  TeamsTab,
} from '@/server/fake-db/pages/profile/types'

import { getPublicUrl } from '@/server/utils/getPublicUrl'

interface DataType {
  profileHeader: ProfileHeader
  profile: ProfileTab
  teams: TeamsTab[]
  projects: ProjectsTab[]
  connections: ConnectionsTab[]
}

interface DB {
  data: DataType
  projectTable: ProjectTableRow[]
}

const avatar1 = getPublicUrl('/images/avatars/avatar-1.png')
const avatar2 = getPublicUrl('/images/avatars/avatar-2.png')
const avatar3 = getPublicUrl('/images/avatars/avatar-3.png')
const avatar4 = getPublicUrl('/images/avatars/avatar-4.png')
const avatar5 = getPublicUrl('/images/avatars/avatar-5.png')
const avatar6 = getPublicUrl('/images/avatars/avatar-6.png')
const avatar7 = getPublicUrl('/images/avatars/avatar-7.png')
const avatar8 = getPublicUrl('/images/avatars/avatar-8.png')
const eventLabel = getPublicUrl('/images/icons/project-icons/event.png')
const figmaLabel = getPublicUrl('/images/icons/project-icons/figma.png')
const htmlLabel = getPublicUrl('/images/icons/project-icons/html5.png')
const reactLabel = getPublicUrl('/images/icons/project-icons/react.png')
const socialLabel = getPublicUrl('/images/icons/project-icons/social.png')
const supportLabel = getPublicUrl('/images/icons/project-icons/support.png')
const twitterLabel = getPublicUrl('/images/icons/project-icons/twitter.png')
const vueLabel = getPublicUrl('/images/icons/project-icons/vue.png')
const xdLabel = getPublicUrl('/images/icons/project-icons/xd.png')
const UserProfileHeaderBg = getPublicUrl('/images/pages/user-profile-header-bg.png')

export const db: DB = {
  data: {
    profileHeader: {
      fullName: 'John Doe',
      location: 'Vatican City',
      joiningDate: 'April 2021',
      designation: 'UX Designer',
      profileImg: avatar1,
      coverImg: UserProfileHeaderBg,
    },
    profile: {
      about: [
        { property: 'Full Name', value: 'John Doe', icon: 'ri-user-line' },
        { property: 'Status', value: 'Active', icon: 'ri-check-line' },
        { property: 'Role', value: 'Developer', icon: 'ri-star-smile-line' },
        { property: 'Country', value: 'USA', icon: 'ri-flag-2-line' },
        { property: 'Language', value: 'English', icon: 'ri-translate-2' },
      ],
      contacts: [
        { property: 'Contact', value: '(123) 456-7890', icon: 'ri-phone-line' },
        { property: 'Skype', value: 'john.doe', icon: 'ri-wechat-line' },
        { property: 'Email', value: 'john.doe@example.com', icon: 'ri-mail-open-line' },
      ],
      teams: [
        { property: 'Backend Developer', value: '(126 Members)', icon: 'ri-github-fill', color: 'secondary' },
        { property: 'VueJS Developer', value: '(98 Members)', icon: 'ri-vuejs-line', color: 'success' },
      ],
      overview: [
        { property: 'Task Compiled', value: '13.5k', icon: 'ri-check-line' },
        { property: 'Connections', value: '897', icon: 'ri-user-line' },
        { property: 'Projects Compiled', value: '146', icon: 'ri-star-smile-line' },
      ],
      connections: [
        {
          isFriend: false,
          connections: '45',
          name: 'Cecilia Payne',
          avatar: avatar2,
        },
        {
          isFriend: true,
          connections: '1.32k',
          name: 'Curtis Fletcher',
          avatar: avatar3,
        },
        {
          isFriend: true,
          connections: '125',
          name: 'Alice Stone',
          avatar: avatar4,
        },
        {
          isFriend: false,
          connections: '456',
          name: 'Darrell Barnes',
          avatar: avatar5,
        },
        {
          isFriend: false,
          connections: '1.2k',
          name: 'Eugenia Moore',
          avatar: avatar8,
        },
      ],
      teamsTech: [
        {
          members: 72,
          ChipColor: 'error',
          chipText: 'Developer',
          title: 'React Developers',
          avatar: reactLabel,
        },
        {
          members: 122,
          chipText: 'Support',
          ChipColor: 'primary',
          title: 'Support Team',
          avatar: supportLabel,
        },
        {
          members: 7,
          ChipColor: 'info',
          chipText: 'Designer',
          title: 'UI Designer',
          avatar: figmaLabel,
        },
        {
          members: 289,
          ChipColor: 'error',
          chipText: 'Developer',
          title: 'Vue.js Developers',
          avatar: vueLabel,
        },
        {
          members: 24,
          chipText: 'Marketing',
          ChipColor: 'secondary',
          title: 'Digital Marketing',
          avatar: twitterLabel,
        },
      ],
    },
    teams: [
      {
        extraMembers: 9,
        title: 'React Developers',
        avatar: reactLabel,
        avatarGroup: [
          { avatar: avatar1, name: 'Vinnie Mostowy' },
          { avatar: avatar2, name: 'Allen Rieske' },
          { avatar: avatar3, name: 'Julee Rossignol' },
          { avatar: avatar4, name: 'George Burrill' },
        ],
        description:
                  'We don\'t make assumptions about the rest of your technology stack, so you can develop new features in React.',
        chips: [
          {
            title: 'React',
            color: 'primary',
          },
          {
            title: 'MUI',
            color: 'info',
          },
        ],
      },
      {
        extraMembers: 4,
        title: 'Vue.js Dev Team',
        avatar: vueLabel,
        avatarGroup: [
          { avatar: avatar5, name: 'Kaith D\'souza' },
          { avatar: avatar6, name: 'John Doe' },
          { avatar: avatar7, name: 'Alan Walker' },
          { avatar: avatar8, name: 'Calvin Middleton' },
        ],
        description:
                  'The development of Vue and its ecosystem is guided by an international team, some of whom have chosen to be featured below.',
        chips: [
          {
            title: 'Vuejs',
            color: 'success',
          },
          {
            color: 'error',
            title: 'Developer',
          },
        ],
      },
      {
        extraMembers: 2,
        title: 'Creative Designers',
        avatar: xdLabel,
        avatarGroup: [
          { avatar: avatar1, name: 'Jimmy Ressula' },
          { avatar: avatar2, name: 'Kristi Lawker' },
          { avatar: avatar3, name: 'Danny Paul' },
          { avatar: avatar4, name: 'Alicia Littleton' },
        ],
        description:
                  'A design or product team is more than just the people on it. A team includes the creative people, the roles they play.',
        chips: [
          {
            title: 'Sketch',
            color: 'warning',
          },
          {
            title: 'XD',
            color: 'error',
          },
        ],
      },
      {
        extraMembers: 7,
        title: 'Support Team',
        avatar: supportLabel,
        avatarGroup: [
          { avatar: avatar5, name: 'Andrew Tye' },
          { avatar: avatar6, name: 'Rishi Swaat' },
          { avatar: avatar7, name: 'Rossie Kim' },
          { avatar: avatar8, name: 'Mary Hunter' },
        ],
        description:
                  'Support your team. Your customer support team is fielding the good, the bad, and the ugly day in and day out.',
        chips: [
          {
            color: 'info',
            title: 'Zendesk',
          },
        ],
      },
      {
        title: 'Digital Marketing',
        avatar: socialLabel,
        avatarGroup: [
          { avatar: avatar1, name: 'Kim Merchent' },
          { avatar: avatar2, name: 'Sam D\'souza' },
          { avatar: avatar3, name: 'Nurvi Karlos' },
          { avatar: avatar4, name: 'Margorie Whitmire' },
        ],
        description:
                  'Digital marketing refers to advertising delivered through digital channels such as search engines,social media, websites…',
        chips: [
          {
            color: 'primary',
            title: 'Twitter',
          },
          {
            title: 'Email',
            color: 'success',
          },
        ],
      },
      {
        title: 'Event',
        extraMembers: 2,
        avatar: eventLabel,
        avatarGroup: [
          { avatar: avatar5, name: 'Vinnie Mostowy' },
          { avatar: avatar6, name: 'Allen Rieske' },
          { avatar: avatar7, name: 'Julee Rossignol' },
          { avatar: avatar8, name: 'Daniel Long' },
        ],
        description:
                  'Event is defined as a particular contest which is part of a program of contests. An example of an event is the long…',
        chips: [
          {
            title: 'Hubilo',
            color: 'success',
          },
        ],
      },
      {
        title: 'Figma Resources',
        avatar: figmaLabel,
        avatarGroup: [
          { avatar: avatar1, name: 'Andrew Mostowy' },
          { avatar: avatar2, name: 'Micky Ressula' },
          { avatar: avatar3, name: 'Michel Pal' },
          { avatar: avatar4, name: 'Herman Lockard' },
        ],
        description:
                  'Explore, install, use, and remix thousands of plugins and files published to the Figma Community by designers and developers.',
        chips: [
          {
            title: 'UI/UX',
            color: 'success',
          },
          {
            title: 'Figma',
            color: 'warning',
          },
        ],
      },
      {
        title: 'Native Mobile App',
        avatar: reactLabel,
        avatarGroup: [
          { avatar: avatar1, name: 'Andrew Mostowy' },
          { avatar: avatar2, name: 'Micky Ressula' },
          { avatar: avatar3, name: 'Michel Pal' },
        ],
        description:
                  'Explore, install, use, and remix thousands of plugins and files published to the Figma Community by designers and developers.',
        chips: [
          {
            title: 'React',
            color: 'primary',
          },
        ],
      },
      {
        extraMembers: 8,
        title: 'Only Beginners',
        avatar: htmlLabel,
        avatarGroup: [
          { avatar: avatar5, name: 'Kim Karlos' },
          { avatar: avatar6, name: 'Katy Turner' },
          { avatar: avatar7, name: 'Peter Adward' },
          { avatar: avatar8, name: 'Leona Miller' },
        ],
        description:
                  'Learn the basics of how websites work, front-end vs back-end, and using a code editor. Learn basic HTML, CSS, and…',
        chips: [
          {
            title: 'CSS',
            color: 'info',
          },
          {
            title: 'HTML',
            color: 'primary',
          },
        ],
      },
    ],
    projects: [
      {
        daysLeft: 28,
        comments: 15,
        totalTask: 344,
        hours: '380/244',
        tasks: '290/344',
        budget: '$18.2k',
        completedTask: 328,
        deadline: '28/2/22',
        chipColor: 'success',
        startDate: '14/2/21',
        budgetSpent: '$24.8k',
        members: '280 members',
        title: 'Social Banners',
        client: 'Christian Jimenez',
        avatar: socialLabel,
        description: 'We are Consulting, Software Development and Web Development Services.',
        avatarGroup: [
          { avatar: avatar1, name: 'Vinnie Mostowy' },
          { avatar: avatar2, name: 'Allen Rieske' },
          { avatar: avatar3, name: 'Julee Rossignol' },
        ],
      },
      {
        daysLeft: 15,
        comments: 236,
        totalTask: 90,
        tasks: '12/90',
        hours: '98/135',
        budget: '$1.8k',
        completedTask: 38,
        deadline: '21/6/22',
        budgetSpent: '$2.4k',
        chipColor: 'warning',
        startDate: '18/8/21',
        members: '1.1k members',
        title: 'Admin Template',
        client: 'Jeffrey Phillips',
        avatar: reactLabel,
        avatarGroup: [
          { avatar: avatar4, name: 'Kaith D\'souza' },
          { avatar: avatar5, name: 'John Doe' },
          { avatar: avatar6, name: 'Alan Walker' },
        ],
        description: 'Time is our most valuable asset, that\'s why we want to help you save it by creating…',
      },
      {
        daysLeft: 45,
        comments: 98,
        budget: '$420',
        totalTask: 140,
        tasks: '22/140',
        hours: '880/421',
        completedTask: 95,
        chipColor: 'error',
        budgetSpent: '$980',
        deadline: '8/10/21',
        title: 'App Design',
        startDate: '24/7/21',
        members: '458 members',
        client: 'Ricky McDonald',
        avatar: vueLabel,
        description: 'App design combines the user interface (UI) and user experience (UX).',
        avatarGroup: [
          { avatar: avatar7, name: 'Jimmy Ressula' },
          { avatar: avatar8, name: 'Kristi Lawker' },
          { avatar: avatar1, name: 'Danny Paul' },
        ],
      },
      {
        comments: 120,
        daysLeft: 126,
        totalTask: 420,
        budget: '2.43k',
        tasks: '237/420',
        hours: '1.2k/820',
        completedTask: 302,
        deadline: '12/9/22',
        budgetSpent: '$8.5k',
        chipColor: 'warning',
        startDate: '10/2/19',
        members: '137 members',
        client: 'Hulda Wright',
        title: 'Create Website',
        avatar: htmlLabel,
        description: 'Your domain name should reflect your products or services so that your...',
        avatarGroup: [
          { avatar: avatar2, name: 'Andrew Tye' },
          { avatar: avatar3, name: 'Rishi Swaat' },
          { avatar: avatar4, name: 'Rossie Kim' },
        ],
      },
      {
        daysLeft: 5,
        comments: 20,
        totalTask: 285,
        tasks: '29/285',
        budget: '28.4k',
        hours: '142/420',
        chipColor: 'error',
        completedTask: 100,
        deadline: '25/12/21',
        startDate: '12/12/20',
        members: '82 members',
        budgetSpent: '$52.7k',
        client: 'Jerry Greene',
        title: 'Figma Dashboard',
        avatar: figmaLabel,
        description: 'Use this template to organize your design project. Some of the key features are…',
        avatarGroup: [
          { avatar: avatar5, name: 'Kim Merchent' },
          { avatar: avatar6, name: 'Sam D\'souza' },
          { avatar: avatar7, name: 'Nurvi Karlos' },
        ],
      },
      {
        daysLeft: 4,
        comments: 16,
        budget: '$655',
        totalTask: 290,
        tasks: '29/290',
        hours: '580/445',
        completedTask: 290,
        budgetSpent: '$1.3k',
        chipColor: 'success',
        deadline: '02/11/21',
        startDate: '17/8/21',
        title: 'Logo Design',
        members: '16 members',
        client: 'Olive Strickland',
        avatar: xdLabel,
        description: 'Premium logo designs created by top logo designers. Create the branding of business.',
        avatarGroup: [
          { avatar: avatar8, name: 'Kim Karlos' },
          { avatar: avatar1, name: 'Katy Turner' },
          { avatar: avatar2, name: 'Peter Adward' },
        ],
      },
    ],
    connections: [
      {
        tasks: '834',
        projects: '18',
        isConnected: true,
        connections: '129',
        name: 'Mark Gilbert',
        designation: 'UI Designer',
        avatar: avatar1,
        chips: [
          {
            title: 'Figma',
            color: 'secondary',
          },
          {
            title: 'Sketch',
            color: 'warning',
          },
        ],
      },
      {
        tasks: '2.31k',
        projects: '112',
        isConnected: false,
        connections: '1.28k',
        name: 'Eugenia Parsons',
        designation: 'Developer',
        avatar: avatar2,
        chips: [
          {
            color: 'error',
            title: 'Angular',
          },
          {
            color: 'info',
            title: 'React',
          },
        ],
      },
      {
        tasks: '1.25k',
        projects: '32',
        isConnected: false,
        connections: '890',
        name: 'Francis Byrd',
        designation: 'Developer',
        avatar: avatar3,
        chips: [
          {
            title: 'HTML',
            color: 'primary',
          },
          {
            color: 'info',
            title: 'React',
          },
        ],
      },
      {
        tasks: '12.4k',
        projects: '86',
        isConnected: false,
        connections: '890',
        name: 'Leon Lucas',
        designation: 'UI/UX Designer',
        avatar: avatar4,
        chips: [
          {
            title: 'Figma',
            color: 'secondary',
          },
          {
            title: 'Sketch',
            color: 'warning',
          },
          {
            color: 'primary',
            title: 'Photoshop',
          },
        ],
      },
      {
        tasks: '23.8k',
        projects: '244',
        isConnected: true,
        connections: '2.14k',
        name: 'Jayden Rogers',
        designation: 'Full Stack Developer',
        avatar: avatar5,
        chips: [
          {
            color: 'info',
            title: 'React',
          },
          {
            title: 'HTML',
            color: 'warning',
          },
          {
            color: 'success',
            title: 'Node.js',
          },
        ],
      },
      {
        tasks: '1.28k',
        projects: '32',
        isConnected: false,
        designation: 'SEO',
        connections: '1.27k',
        name: 'Jeanette Powell',
        avatar: avatar6,
        chips: [
          {
            title: 'Analysis',
            color: 'secondary',
          },
          {
            color: 'success',
            title: 'Writing',
          },
        ],
      },
    ],
  },
  projectTable: [
    {
      id: 1,
      status: 38,
      leader: 'Eileen',
      name: 'Website SEO',
      date: '10 may 2021',
      avatarColor: 'success',
      avatarGroup: [avatar1, avatar2, avatar3, avatar4],
    },
    {
      id: 2,
      status: 45,
      leader: 'Owen',
      date: '03 Jan 2021',
      name: 'Social Banners',
      avatar: socialLabel,
      avatarGroup: [avatar5, avatar6],
    },
    {
      id: 3,
      status: 92,
      leader: 'Keith',
      date: '12 Aug 2021',
      name: 'Logo Designs',
      avatar: '/images/icons/project-icons/sketch-label.png',
      avatarGroup: [avatar7, avatar8, avatar1, avatar2],
    },
    {
      id: 4,
      status: 56,
      leader: 'Merline',
      date: '19 Apr 2021',
      name: 'IOS App Design',
      avatar: '/images/icons/project-icons/sketch-label.png',
      avatarGroup: [avatar3, avatar4, avatar5, avatar6],
    },
    {
      id: 5,
      status: 25,
      leader: 'Harmonia',
      date: '08 Apr 2021',
      name: 'Figma Dashboards',
      avatar: figmaLabel,
      avatarGroup: [avatar7, avatar8, avatar1],
    },
    {
      id: 6,
      status: 36,
      leader: 'Allyson',
      date: '29 Sept 2021',
      name: 'Crypto Admin',
      avatar: htmlLabel,
      avatarGroup: [avatar2, avatar3, avatar4, avatar5],
    },
    {
      id: 7,
      status: 72,
      leader: 'Georgie',
      date: '20 Mar 2021',
      name: 'Create Website',
      avatar: reactLabel,
      avatarGroup: [avatar6, avatar7, avatar8, avatar1],
    },
    {
      id: 8,
      status: 89,
      leader: 'Fred',
      date: '09 Feb 2021',
      name: 'App Design',
      avatar: xdLabel,
      avatarGroup: [avatar2, avatar3, avatar4, avatar5],
    },
    {
      id: 9,
      status: 77,
      leader: 'Richardo',
      date: '17 June 2021',
      name: 'Angular APIs',
      avatar: figmaLabel,
      avatarGroup: [avatar6, avatar7, avatar8, avatar1],
    },
    {
      id: 10,
      status: 100,
      leader: 'Genevra',
      date: '06 Oct 2021',
      name: 'Admin Template',
      avatar: vueLabel,
      avatarGroup: [avatar2, avatar3, avatar4, avatar5],
    },
  ],
}
