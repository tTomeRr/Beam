interface DefaultCategoryData {
  name: string;
  icon: string;
  color: string;
  subcategories: Array<{
    name: string;
    icon: string;
    color: string;
  }>;
}

export const DEFAULT_CATEGORIES: DefaultCategoryData[] = [
  {
    name: 'בית',
    icon: 'Home',
    color: '#FAD390',
    subcategories: [
      { name: 'שכר דירה/משכנתא', icon: 'Home', color: '#FAD390' },
      { name: 'חשמל ומים', icon: 'Wifi', color: '#FAD390' },
      { name: 'תחזוקה', icon: 'Home', color: '#FAD390' },
      { name: 'ריהוט ומכשירים', icon: 'Home', color: '#FAD390' },
    ],
  },
  {
    name: 'רכב',
    icon: 'Car',
    color: '#45B7D1',
    subcategories: [
      { name: 'דלק', icon: 'Fuel', color: '#45B7D1' },
      { name: 'ביטוח רכב', icon: 'Briefcase', color: '#45B7D1' },
      { name: 'חניה', icon: 'Car', color: '#45B7D1' },
      { name: 'תחזוקה ותיקונים', icon: 'Car', color: '#45B7D1' },
      { name: 'רישוי', icon: 'Car', color: '#45B7D1' },
    ],
  },
  {
    name: 'מזון',
    icon: 'Utensils',
    color: '#FF6B6B',
    subcategories: [
      { name: 'סופרמרקט', icon: 'ShoppingBag', color: '#FF6B6B' },
      { name: 'מסעדות', icon: 'Pizza', color: '#FF6B6B' },
      { name: 'קפה וחטיפים', icon: 'Coffee', color: '#FF6B6B' },
    ],
  },
  {
    name: 'בגדים',
    icon: 'Shirt',
    color: '#DDA15E',
    subcategories: [
      { name: 'מבוגרים', icon: 'Shirt', color: '#DDA15E' },
      { name: 'ילדים', icon: 'Baby', color: '#DDA15E' },
      { name: 'נעליים', icon: 'Shirt', color: '#DDA15E' },
    ],
  },
  {
    name: 'חינוך',
    icon: 'GraduationCap',
    color: '#96CEB4',
    subcategories: [
      { name: 'שכר לימוד', icon: 'GraduationCap', color: '#96CEB4' },
      { name: 'ספרים וציוד', icon: 'Briefcase', color: '#96CEB4' },
      { name: 'קורסים והשתלמויות', icon: 'GraduationCap', color: '#96CEB4' },
    ],
  },
  {
    name: 'בריאות',
    icon: 'HeartPulse',
    color: '#4ECDC4',
    subcategories: [
      { name: 'ביקורי רופא', icon: 'HeartPulse', color: '#4ECDC4' },
      { name: 'תרופות', icon: 'Briefcase', color: '#4ECDC4' },
      { name: 'שיניים', icon: 'HeartPulse', color: '#4ECDC4' },
      { name: 'טיפולים', icon: 'Dumbbell', color: '#4ECDC4' },
    ],
  },
  {
    name: 'תרבות',
    icon: 'Gamepad2',
    color: '#A29BFE',
    subcategories: [
      { name: 'קולנוע ותיאטרון', icon: 'Film', color: '#A29BFE' },
      { name: 'קונצרטים ואירועים', icon: 'Gamepad2', color: '#A29BFE' },
      { name: 'ספרים', icon: 'Briefcase', color: '#A29BFE' },
      { name: 'מנויים', icon: 'Wifi', color: '#A29BFE' },
    ],
  },
  {
    name: 'הוצאות בלתי צפויות',
    icon: 'Briefcase',
    color: '#E74C3C',
    subcategories: [],
  },
  {
    name: 'ביטוחים',
    icon: 'Briefcase',
    color: '#3498DB',
    subcategories: [
      { name: 'ביטוח בריאות', icon: 'HeartPulse', color: '#3498DB' },
      { name: 'ביטוח דירה', icon: 'Home', color: '#3498DB' },
      { name: 'ביטוח חיים', icon: 'HeartPulse', color: '#3498DB' },
    ],
  },
  {
    name: 'תקשורת',
    icon: 'Smartphone',
    color: '#9B59B6',
    subcategories: [],
  },
  {
    name: 'אחר',
    icon: 'Briefcase',
    color: '#B2BEC3',
    subcategories: [],
  },
];
