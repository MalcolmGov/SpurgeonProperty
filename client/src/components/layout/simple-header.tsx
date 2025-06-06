import { Link } from "wouter";
import { Building } from "lucide-react";

export default function SimpleHeader() {
  return (
    <header style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '16px 24px'
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
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            color: 'inherit'
          }}>
            <Building style={{ 
              width: '32px',
              height: '32px',
              color: '#7c3aed'
            }} />
            <span style={{ 
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937'
            }}>
              PropertyHub
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav style={{ display: 'flex', gap: '32px' }}>
          <Link href="/">
            <span style={{ 
              color: '#6b7280',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Home
            </span>
          </Link>
          <Link href="/properties">
            <span style={{ 
              color: '#6b7280',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Properties
            </span>
          </Link>
          <Link href="/admin">
            <span style={{ 
              color: '#6b7280',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Admin
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}