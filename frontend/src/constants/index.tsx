
import React from 'react';
import {
  Utensils,
  HeartPulse,
  Car,
  GraduationCap,
  Home,
  Gamepad2,
  ShoppingBag,
  Briefcase,
  Coffee,
  Film,
  Shirt,
  Plane,
  Dumbbell,
  Wifi,
  Smartphone,
  Gift,
  Fuel,
  Pizza,
  Baby,
  Dog
} from 'lucide-react';

export const AVAILABLE_ICONS = [
  { name: 'Utensils', label: 'כלי אוכל', Component: Utensils },
  { name: 'Pizza', label: 'פיצה', Component: Pizza },
  { name: 'Coffee', label: 'קפה', Component: Coffee },
  { name: 'ShoppingBag', label: 'קניות', Component: ShoppingBag },
  { name: 'Shirt', label: 'בגדים', Component: Shirt },
  { name: 'Home', label: 'בית', Component: Home },
  { name: 'Car', label: 'רכב', Component: Car },
  { name: 'Fuel', label: 'דלק', Component: Fuel },
  { name: 'HeartPulse', label: 'בריאות', Component: HeartPulse },
  { name: 'Dumbbell', label: 'כושר', Component: Dumbbell },
  { name: 'GraduationCap', label: 'חינוך', Component: GraduationCap },
  { name: 'Gamepad2', label: 'בילויים', Component: Gamepad2 },
  { name: 'Film', label: 'קולנוע', Component: Film },
  { name: 'Plane', label: 'טיסות', Component: Plane },
  { name: 'Wifi', label: 'אינטרנט', Component: Wifi },
  { name: 'Smartphone', label: 'טלפון', Component: Smartphone },
  { name: 'Gift', label: 'מתנות', Component: Gift },
  { name: 'Baby', label: 'תינוק', Component: Baby },
  { name: 'Dog', label: 'חיות מחמד', Component: Dog },
  { name: 'Briefcase', label: 'אחר', Component: Briefcase }
];

export const DEFAULT_CATEGORIES = [
  { id: 1, name: 'מזון', icon: 'Utensils', color: '#FF6B6B', isActive: true },
  { id: 2, name: 'בריאות', icon: 'HeartPulse', color: '#4ECDC4', isActive: true },
  { id: 3, name: 'רכב', icon: 'Car', color: '#45B7D1', isActive: true },
  { id: 4, name: 'חינוך', icon: 'GraduationCap', color: '#96CEB4', isActive: true },
  { id: 5, name: 'בית', icon: 'Home', color: '#FAD390', isActive: true },
  { id: 6, name: 'בילויים', icon: 'Gamepad2', color: '#A29BFE', isActive: true },
  { id: 7, name: 'קניות', icon: 'ShoppingBag', color: '#FAB1A0', isActive: true },
  { id: 8, name: 'אחר', icon: 'Briefcase', color: '#B2BEC3', isActive: true },
];

export const getIcon = (name: string, size: number = 20) => {
  const iconData = AVAILABLE_ICONS.find(icon => icon.name === name);
  if (iconData) {
    const Icon = iconData.Component;
    return <Icon size={size} />;
  }
  return <Briefcase size={size} />;
};
