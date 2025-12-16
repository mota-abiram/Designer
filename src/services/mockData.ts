import type { Designer, Task } from '../types';
import { addDays, format, startOfWeek } from 'date-fns';

const avatars = {
    user: "https://lh3.googleusercontent.com/aida-public/AB6AXuBi8jXjNHhpaSwAWq9eMb3PRCIDCEXQeEImVr_E23PKVLvU-z0X5Lc4NcReNInJLpF9GOZ2i8CUSOwSHJYovmZMuCZlKLxCWTG4qjZS2bRn_W6VmbrY52vXTAfQSKb7c2DXCiFrZ22sBQ3OMKIBuGlQvrZ-SlROI-Mn4vM7A32ou9-JuL_ScTIVVLdYJ2qX0SumycaKFOkOa8R8h_gbfmg6MtbT2nvaDGXVe4WJDr0Z4ONgcg9kbuO39xrkHKZRH1KSRA8fSCFs-OA",
    req1: "https://lh3.googleusercontent.com/aida-public/AB6AXuDMhQK4hZu5gB9WEKfHn6hYFWzC0FperjH_570RsW8rfVPRek-HXrHfrImGU0ANfvwb9wDc8OjtOCp3Xy6Pnyhh6nwsVRaLfQ6iiR7mB6ak0K-0QXI7kwGjpLaC-CdTmNUoeWNTNkri5S-SkKQ3Gv8GFNdDAZbhw3JY_0kNAe_oV54tSNztNwJCfAW3MwCsFQ1TTfSu_JL__d2PFpg7NIFFwk-5HsaGFpGfBUEKCNovShws0miNhnKHS1s-hbvpO8voIVdZu2okNkk",
    req2: "https://lh3.googleusercontent.com/aida-public/AB6AXuB4BxreDC4keT8sI1LlYrznpmiEagNz1LIO3iqhK5O1br_MKibIddDYWsWdXSWRQEdHCadHaYIJh11Lcym-tsoSUY0dykQF4sJzeVlsJDBwGfeg_ZCFSV-4xQ_RJsvphqtvOYWxTOVYETtKvOmgdXqLQV3D-GtV6C-E_X8uiV0ZuSw3VBjNPPe3aKaVZxmXXcay-UeLg_0M0mIE51dbs_lR5AS4zLFbCeoLE52_hms8MabnlCeeKgRl4G1EhIuttfOamWdpqut4_QU",
    req3: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmaLHIiXySDeIQP_zCCwTbim1s9ovcKCpav6r4wQW-0blHIyy5Z7Vamty7zmbqgtSb6-DOOIhmwOIUBYYfnBx0jQAns_nk4Ie1vPTyOWs-hKAFVDxRd2779S4U6xevQIEByeU9gubG4IR1TpnE0zquqzyjfag1LcqQsMSP2-4qHiZ0Inhu949xIyz5UHjt9Kz56lqqKSZXO-lq_NCg7pL3qU43iRdru1KFGJQHPNUJEzqksEx5qPoPzS7lHbkRWKHW0Z0Rt6Set-I"
};

export const designers: Designer[] = [
    { id: 'd1', name: 'Nagaraju', avatar: avatars.user },
    { id: 'd2', name: 'Surya' },
    { id: 'd3', name: 'Sheshu' },
    { id: 'd4', name: 'Haneef' },
    { id: 'd5', name: 'Raviteja' },
    { id: 'd6', name: 'Murali' },
    { id: 'd7', name: 'Sai Teja' },
    { id: 'd8', name: 'Dhruv' },
];

// Generate dates for the current week starting Monday
const today = new Date();
const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
const getDays = () => {
    const days = [];
    for (let i = 0; i < 5; i++) {
        days.push(format(addDays(startOfCurrentWeek, i), 'yyyy-MM-dd'));
    }
    return days;
};

export const weekDates = getDays();

export const initialTasks: Task[] = [
    {
        id: 't1',
        title: 'Homepage Hero Banner Update',
        description: 'Update main imagery with the new autumn collection photos and adjust the CTA button contrast.',
        link: 'figma.com/file/HKj23...',
        status: 'Pending',
        date: weekDates[0], // Monday
        designerId: 'd1',
        requestorAvatar: avatars.req1,
        createdAt: new Date().toISOString()
    },
    {
        id: 't2',
        title: 'Q4 Social Media Assets',
        description: 'Create 5 Instagram story templates and 3 LinkedIn post graphics for the Q4 launch.',
        link: 'drive.google.com/fo...',
        status: 'Submitted',
        date: weekDates[0],
        designerId: 'd1',
        createdAt: new Date().toISOString()
    },
    {
        id: 't3',
        title: 'Website Refresh - Dark Mode',
        description: 'Implement dark mode color palette across the settings page and user profile components.',
        link: 'jira.atlassian.net/bro...',
        status: 'Pending',
        date: weekDates[1], // Tuesday
        designerId: 'd1',
        requestorAvatar: avatars.req2,
        createdAt: new Date().toISOString()
    },
    {
        id: 't4',
        title: 'Campaign Landing Page V1',
        description: "First draft of the 'Summer Sale' landing page with hero, features, and pricing sections.",
        link: 'figma.com/file/X9s...',
        status: 'Submitted',
        date: weekDates[2], // Wednesday
        designerId: 'd1',
        createdAt: new Date().toISOString()
    },
    {
        id: 't5',
        title: 'Sales One Pager PDF',
        description: 'Design a one-page PDF summarizing the enterprise plan benefits for the sales team.',
        link: 'box.com/s/9d8f7...',
        status: 'Submitted',
        date: weekDates[3], // Thursday
        designerId: 'd1',
        createdAt: new Date().toISOString()
    },
    {
        id: 't6',
        title: 'Icon Set Expansion',
        description: 'Add 15 new icons for the analytics dashboard, following the existing outline style.',
        link: 'figma.com/file/icon...',
        status: 'Pending',
        date: weekDates[3], // Thursday
        designerId: 'd1',
        requestorAvatar: avatars.req3,
        createdAt: new Date().toISOString()
    }
];
