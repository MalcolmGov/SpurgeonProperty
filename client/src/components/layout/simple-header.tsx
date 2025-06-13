import { Link } from "wouter";
import { Logo } from "@/components/ui/logo";

export default function SimpleHeader() {
  return (
    <header style={{ 
      position: 'sticky',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '16px 24px',
      margin: 0
    }}>
      <div style={{ 
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <Link href="/">
          <a style={{ 
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit'
          }}>
            <Logo />
          </a>
        </Link>

        {/* Navigation */}
        <nav style={{ display: 'flex', gap: '32px' }}>
          <Link href="/">
            <a style={{ 
              color: '#6b7280',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Home
            </a>
          </Link>
          <Link href="/properties">
            <a style={{ 
              color: '#6b7280',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Properties
            </a>
          </Link>
          <Link href="/admin">
            <a style={{ 
              color: '#6b7280',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Admin
            </a>
          </Link>
        </nav>
      </div>
    </header>
  );
}