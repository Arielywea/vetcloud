import React from 'react';
import Svg, { Path } from 'react-native-svg';
import {
  Home, Menu, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X, Check, Plus, Pencil, Trash2, Eye, EyeOff,
  Search, Filter, FilterX, Download, Send, Save, Bell, BellOff, Settings, Command, MoreVertical, LogOut,
  ArrowRight, AlertCircle, HelpCircle, User, UserCircle, UserPlus, UserRound, Baby, Phone, Mail,
  Stethoscope, Syringe, Scissors, Pill, Shield, ShieldCheck, Heart, HeartPulse, Bug, Microscope, Dna,
  Bone, Brain, Activity, Wind, Droplet, Apple, Utensils, Droplets, Bandage, Skull, Hospital,
  Briefcase, FlaskConical, Calendar, CalendarHeart, CalendarCheck, Clock, ClipboardCheck, ClipboardList,
  History, House, PawPrint, Palette, Camera, Weight, Barcode, Hexagon, Package, Inbox, FileText,
  StickyNote, FileEdit, SearchCode, Dog, Cat, Mars, Venus, Sun, Moon, Bot, Wand2, Play, Pause,
  Square, Mic, MicOff, TrendingUp, Sparkles, Lock, KeyRound, Tractor, Building2, AlertTriangle,
  XCircle, CheckCircle, Circle
} from 'lucide-react-native';

// lucide has no tooth glyph; drawn to match its 24px / 2px stroke style
function ToothIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M7.5 3C5 3 3.5 5 3.5 7.5c0 2 .8 3.4 1.5 5 .6 1.4.9 3 1.3 5.2.3 1.8.9 3.3 2 3.3 1.3 0 1.6-1.6 2-3.5.3-1.4.8-2.5 1.7-2.5s1.4 1.1 1.7 2.5c.4 1.9.7 3.5 2 3.5 1.1 0 1.7-1.5 2-3.3.4-2.2.7-3.8 1.3-5.2.7-1.6 1.5-3 1.5-5C20.5 5 19 3 16.5 3c-1.9 0-2.9 1-4.5 1s-2.6-1-4.5-1z" />
    </Svg>
  );
}

const LUCIDE_MAP: Record<string, any> = {
  'home': Home, 'menu': Menu, 'chevron-left': ChevronLeft, 'chevron-right': ChevronRight,
  'chevron-up': ChevronUp, 'chevron-down': ChevronDown, 'close': X, 'check': Check,
  'plus': Plus, 'pencil': Pencil, 'delete': Trash2, 'trash-2': Trash2, 'eye': Eye,
  'eye-off': EyeOff, 'search': Search, 'magnify': Search, 'filter': Filter,
  'filter-remove': FilterX, 'download': Download, 'send': Send, 'content-save': Save,
  'bell': Bell, 'bell-off': BellOff, 'settings': Settings, 'cog': Settings,
  'command': Command, 'more-vertical': MoreVertical, 'log-out': LogOut, 'logout': LogOut,
  'arrow-right': ArrowRight, 'alert-circle': AlertCircle, 'alert-circle-outline': AlertCircle,
  'help-circle': HelpCircle, 'help-circle-outline': HelpCircle, 'account': User,
  'account-circle': UserCircle, 'user': User, 'user-circle': UserCircle, 'user-plus': UserPlus,
  'patient': UserRound, 'child-care': Baby, 'phone': Phone, 'email': Mail,
  'email-outline': Mail, 'stethoscope': Stethoscope, 'needle': Syringe, 'syringe': Syringe,
  'scissors-cutting': Scissors, 'pill': Pill, 'shield': Shield, 'shield-check': ShieldCheck,
  'shield-check-outline': ShieldCheck, 'heart': Heart, 'heart-pulse': HeartPulse, 'bug': Bug,
  'microscope': Microscope, 'dna': Dna, 'bone': Bone, 'brain': Brain, 'tooth': ToothIcon,
  'stomach': Activity, 'lungs': Wind, 'kidney': Droplet, 'nutrition': Apple, 'food': Utensils,
  'cup-water': Droplets, 'water-opacity': Droplets, 'bandage': Bandage, 'baby-carriage': Baby,
  'skull': Skull, 'hospital-box': Hospital, 'hospital-box-outline': Hospital,
  'medical-bag': Briefcase, 'flask': FlaskConical, 'flask-conical': FlaskConical,
  'calendar': Calendar, 'calendar-blank': Calendar, 'calendar-today': Calendar,
  'calendar-heart': CalendarHeart, 'calendar-check': CalendarCheck, 'calendar-clock': Clock,
  'clock': Clock, 'clipboard-check': ClipboardCheck, 'clipboard-text-clock': ClipboardList,
  'history': History, 'home-outline': House, 'paw': PawPrint, 'palette': Palette,
  'camera': Camera, 'camera-plus': Camera, 'weight': Weight, 'barcode': Barcode,
  'shape': Hexagon, 'package': Package, 'package-variant': Package, 'inbox': Inbox,
  'inbox-outline': Inbox, 'file-document-outline': FileText, 'note-text-outline': StickyNote,
  'notebook-edit-outline': FileEdit, 'text-search': SearchCode, 'dog': Dog, 'cat': Cat,
  'gender-male': Mars, 'gender-female': Venus, 'white-balance-sunny': Sun,
  'moon-waning-crescent': Moon, 'robot': Bot, 'robot-happy': Bot, 'creation': Wand2,
  'play': Play, 'pause': Pause, 'stop': Square, 'microphone': Mic, 'microphone-off': MicOff,
  'chart-line-variant': TrendingUp, 'sparkles': Sparkles, 'lock': Lock, 'lock-outline': Lock,
  'lock-reset': KeyRound, 'tractor': Tractor, 'building-2': Building2, 'alert': AlertTriangle,
  'cancel': XCircle, 'check-circle': CheckCircle, 'check-circle-outline': CheckCircle,
  'circle-outline': Circle, 'auto-fix': Wand2, 'radiobox-marked': Circle,
  'radiobox-blank': Circle, 'checkbox-marked': Check, 'checkbox-blank-outline': Circle,
};

interface DynamicIconProps {
  name: string;
  size?: number;
  color?: string;
}

export default function DynamicIcon({ name, size = 16, color }: DynamicIconProps) {
  const IconComponent = LUCIDE_MAP[name] || AlertCircle;
  return <IconComponent size={size} color={color} />;
}
