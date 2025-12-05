import {
    IconTrophy,
    IconDoor,
    IconUserCheck,
    IconCalendar,
    IconCoin,
    IconBriefcase,
    IconRepeat,
    IconCheck,
    IconFlame,
    IconStar,
    IconCoins,
    IconCalendarCheck,
    IconConfetti,
    IconPigMoney,
    IconSend,
    IconChartLine,
    IconCalendarEvent,
    IconCalendarStats,
    IconListCheck,
    IconCalendarStar,
    IconAward,
    IconCompass,
    IconStars,
    IconCrown,
    IconDiamond,
    IconMedal,
    IconInfinity,
    IconTarget,
    IconSparkles,
    IconSun,
    IconSunrise,
    IconStack,
    IconCash,
    IconBuildingBank,
    IconRun,
    IconRocket,
    IconUsers,
    IconWallet,
    IconChartBar,
    IconReportMoney,
    IconPig,
    IconNote,
    IconNotes,
    IconPencil,
    IconBook,
    IconBooks,
    IconLibrary,
    IconNotebook,
    IconList,
    IconCheckbox,
    IconChecks,
    IconShoppingCart,
    IconRobot,
    IconFolder,
    IconFolders,
    IconFlag,
    IconBox,
    IconBoxMultiple,
    IconBuildingWarehouse,
    IconBuilding,
    IconBuildingCastle,
    IconHandMove,
    IconSearch,
    IconDeviceTv,
    IconMovie,
    IconPlayerPlay,
    IconPlayerStop,
    IconStarHalf,
    IconChefHat,
    IconSalad,
    IconMeat,
    IconGrill,
    IconHeart,
    IconGift,
    IconHeartHandshake,
    IconGiftCard,
    IconCake,
    IconBolt,
    IconCalendarWeek,
    IconCalendarMonth,
} from '@tabler/icons-react';
import type { AchievementPublic } from '@ycmm/core';

// Achievement interface extends AchievementPublic with additional fields for display
export interface Achievement extends AchievementPublic {
    requirement?: number;
    isHidden?: boolean;
}

export interface ProfileSharingStatus {
    isPublic: boolean;
    shareUrl: string | null;
    profileSlug: string;
}

// Icon mapping for achievements
export const iconMap: Record<string, React.ElementType> = {
    // General
    'door': IconDoor,
    'user-check': IconUserCheck,
    'calendar-star': IconCalendarStar,
    'calendar-check': IconCalendarCheck,
    'award': IconAward,
    'compass': IconCompass,
    'star': IconStar,
    'stars': IconStars,
    'crown': IconCrown,
    'diamond': IconDiamond,
    'trophy': IconTrophy,

    // Streaks
    'flame': IconFlame,
    'fire': IconFlame,
    'medal': IconMedal,
    'infinity': IconInfinity,

    // Habits
    'check': IconCheck,
    'check-double': IconCheckbox,
    'target': IconTarget,
    'sparkles': IconSparkles,
    'sun': IconSun,

    // Deadlines
    'calendar-event': IconCalendarEvent,
    'calendar-stats': IconCalendarStats,
    'confetti': IconConfetti,
    'sunrise': IconSunrise,

    // Subscriptions
    'repeat': IconRepeat,
    'list-check': IconListCheck,
    'stack': IconStack,
    'pig-money': IconPigMoney,
    'cash': IconCash,
    'bank': IconBuildingBank,

    // Applications
    'briefcase': IconBriefcase,
    'send': IconSend,
    'run': IconRun,
    'rocket': IconRocket,
    'calendar': IconCalendar,
    'users': IconUsers,

    // Expenses
    'coin': IconCoin,
    'coins': IconCoins,
    'wallet': IconWallet,
    'chart-line': IconChartLine,
    'chart-bar': IconChartBar,
    'report-money': IconReportMoney,
    'piggy-bank': IconPigMoney,
    'pig': IconPig,

    // Notes
    'note': IconNote,
    'notes': IconNotes,
    'pencil': IconPencil,
    'book': IconBook,
    'books': IconBooks,
    'library': IconLibrary,
    'diary': IconNotebook,

    // Lists
    'list': IconList,
    'checkbox': IconCheckbox,
    'checks': IconChecks,
    'shopping-cart': IconShoppingCart,
    'robot': IconRobot,

    // Projects
    'folder': IconFolder,
    'folders': IconFolders,
    'flag-checkered': IconFlag,

    // Inventory
    'box': IconBox,
    'boxes': IconBoxMultiple,
    'warehouse': IconBuildingWarehouse,
    'building': IconBuilding,
    'castle': IconBuildingCastle,
    'hand-move': IconHandMove,
    'search': IconSearch,

    // Media
    'device-tv': IconDeviceTv,
    'movie': IconMovie,
    'popcorn': IconMovie,
    'player-play': IconPlayerPlay,
    'player-stop': IconPlayerStop,
    'star-half': IconStarHalf,

    // Meals
    'chef-hat': IconChefHat,
    'salad': IconSalad,
    'meat': IconMeat,
    'grill': IconGrill,
    'heart': IconHeart,

    // Wishlists
    'gift': IconGift,
    'heart-handshake': IconHeartHandshake,
    'gift-card': IconGiftCard,

    // Legendary & General Dynamic
    'cake': IconCake,
    'bolt': IconBolt,
    'calendar-week': IconCalendarWeek,
    'calendar-month': IconCalendarMonth,
};

// Category colors mapping
export const categoryColors: Record<string, string> = {
    general: 'blue',
    streaks: 'orange',
    habits: 'green',
    deadlines: 'red',
    subscriptions: 'violet',
    applications: 'cyan',
    expenses: 'yellow',
    notes: 'gray',
    lists: 'teal',
    projects: 'indigo',
    inventory: 'lime',
    media: 'pink',
    meals: 'grape',
    wishlists: 'rose',
    legendary: 'gold',
};
