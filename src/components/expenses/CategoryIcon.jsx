import { Building2, Fuel, Landmark, Package, Tag, Truck, Users, Utensils, Wrench } from 'lucide-react';
import { cn } from '../../lib/cn';

const ICONS = {
  Transport: Truck,
  Fuel,
  Salary: Users,
  Interest: Landmark,
  Office: Building2,
  Food: Utensils,
  Material: Package,
  Maintenance: Wrench,
};

const SIZES = {
  md: 'size-10 rounded-xl [&_svg]:size-[18px]',
  sm: 'size-7 rounded-lg [&_svg]:size-3.5',
};

export default function CategoryIcon({ category, size = 'md' }) {
  const Icon = ICONS[category] ?? Tag;

  return (
    <span className={cn('grid shrink-0 place-items-center bg-sunken text-muted', SIZES[size])}>
      <Icon />
    </span>
  );
}
