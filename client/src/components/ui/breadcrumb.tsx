import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="mb-5 flex items-center gap-1.5 font-mono text-[13px]">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1.5">
          {index > 0 && <span className="text-border-strong">/</span>}
          {item.href ? (
            <Link
              to={item.href}
              className="text-muted transition-colors duration-150 hover:text-primary"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-primary">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
