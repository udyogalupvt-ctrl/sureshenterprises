import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/cn';
import Menu, { MenuItem } from '../ui/Menu';
import { THEME_OPTIONS } from './themeOptions';

/** Icon button that opens a Light / Dark / System menu. */
export default function ThemeToggle({ className }) {
  const { preference, setPreference } = useTheme();
  const CurrentIcon = THEME_OPTIONS.find((option) => option.value === preference).icon;

  return (
    <Menu
      label="Theme"
      width={180}
      trigger={(props) => (
        <button
          type="button"
          aria-label="Theme"
          title="Theme"
          className={cn(
            'grid size-10 place-items-center rounded-xl text-muted transition-colors hover:bg-sunken hover:text-fg',
            className,
          )}
          {...props}
        >
          <CurrentIcon className="size-[18px]" />
        </button>
      )}
    >
      {({ close }) =>
        THEME_OPTIONS.map(({ value, label, icon }) => (
          <MenuItem
            key={value}
            icon={icon}
            checked={value === preference}
            onSelect={() => {
              setPreference(value);
              close();
            }}
          >
            {label}
          </MenuItem>
        ))
      }
    </Menu>
  );
}
