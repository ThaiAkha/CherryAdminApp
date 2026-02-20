# 🎨 Sistema di Icone Universale - Guida Completa

## 📋 Panoramica

Sistema centralizzato basato su **Lucide React** per gestire tutte le icone dell'applicazione.

### ✅ Vantaggi
- **Universale** - Funziona in sidebar, dashboard, forms, ovunque
- **Database-friendly** - Salva nomi icone come stringhe
- **Type-safe** - Autocomplete TypeScript completo
- **Future-proof** - Lucide è stabile e ben mantenuto
- **Performante** - Tree-shaking automatico

---

## 🚀 Come Usare

### 1. **Componente `<Icon />`** (Raccomandato)

```tsx
import Icon from '@/components/ui/Icon';

// Uso base
<Icon name="Package" />

// Con dimensione
<Icon name="Home" size={24} />

// Con className Tailwind
<Icon name="Calendar" className="w-6 h-6 text-brand-500" />

// Con fallback se icona non esiste
<Icon name={metadata?.icon} fallback="AlertCircle" />

// Stroke width personalizzato
<Icon name="Settings" strokeWidth={1.5} />
```

### 2. **Helper `getIcon()`** (Per componenti custom)

```tsx
import { getIcon } from '@/lib/iconRegistry';

const MyComponent = ({ iconName }: { iconName: string }) => {
  const IconComponent = getIcon(iconName);

  return <IconComponent className="w-5 h-5" />;
};
```

### 3. **In Database / API**

```sql
-- Tabella: site_metadata_admin
UPDATE site_metadata_admin
SET header_icon = 'Package'
WHERE page_slug = 'admin-inventory';

-- Nota: salva SOLO il nome (stringa), non il componente!
```

---

## 📦 Icone Disponibili

### Navigazione & UI
```
Home, LayoutDashboard, Menu, X,
ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
ArrowRight, ArrowLeft, ArrowUpRight, ExternalLink
```

### Admin Tools
```
Database, Hotel, Package, FolderOpen, CalendarDays,
BarChart3, Settings, Users, UserCog
```

### Manager Operations
```
CalendarPlus, Truck, ShoppingCart, ShoppingBag,
ClipboardList, Eye, ChefHat, UtensilsCrossed
```

### Financial
```
Wallet, CreditCard, Banknote, TrendingUp, TrendingDown,
Receipt, DollarSign
```

### Actions
```
Plus, Minus, Edit, Trash2, Save, Copy, Check,
Search, Filter, RefreshCw, Upload, Download
```

### Status & Alerts
```
AlertCircle, AlertTriangle, Info, CheckCircle,
XCircle, Bell, BellRing
```

### User & Profile
```
User, UserCircle, UserPlus, LogOut, LogIn,
Lock, Unlock, Key, Shield
```

### Files & Media
```
File, FileImage, Image, Folder, FolderPlus,
Paperclip, Camera
```

### Time & Calendar
```
Calendar, Clock, Timer, Hourglass
```

### Food & Kitchen
```
Coffee, Wine, Soup, Pizza, Salad, Apple
```

### Misc
```
Star, Heart, ThumbsUp, Flag, Tag, Bookmark,
Share2, MoreVertical, MoreHorizontal, Grid, List,
Layers, Box, Package2, Palette, Zap, Globe, Link, Sparkles
```

**Tutte le icone disponibili:**
```tsx
import { getAvailableIcons } from '@/lib/iconRegistry';
console.log(getAvailableIcons()); // Array di tutte le icone
```

---

## ➕ Come Aggiungere Nuove Icone

### Step 1: Trova l'icona su Lucide
Vai su [lucide.dev/icons](https://lucide.dev/icons) e cerca l'icona.

### Step 2: Aggiungi al registry
Apri `src/lib/iconRegistry.ts`:

```tsx
import * as LucideIcons from 'lucide-react';

export const iconRegistry = {
  // ... icone esistenti ...

  // ===== NUOVE ICONE =====
  Rocket: LucideIcons.Rocket,      // ✅ Aggiungi qui
  Sparkle: LucideIcons.Sparkle,    // ✅ E qui
};
```

### Step 3: Usa subito!
```tsx
<Icon name="Rocket" size={32} />
```

**Fatto!** ✅ L'icona è disponibile ovunque nell'app.

---

## 🔧 Esempi Pratici

### Dashboard Home Cards
```tsx
<DashboardNavCard
  path="/admin-inventory"
  iconName="Package"
  label="Inventory"
  description="Manage products and stock"
/>
```

### Sidebar Menu Items (Aggiornato)
```tsx
import { getIcon } from '@/lib/iconRegistry';

const MenuItem = ({ icon, label, path }) => {
  const IconComponent = getIcon(icon);

  return (
    <Link to={path}>
      <IconComponent className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
};
```

### WelcomeHero Headers
```tsx
<WelcomeHero
  badge="Admin Tools"
  titleMain="Inventory"
  description="Manage your products"
  icon="Package"  // ← Stringa, non componente!
/>
```

### Caricamento da Database
```tsx
const PageHeader = () => {
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    contentService.getPageMetadata('admin-inventory').then(meta => {
      setMetadata(meta);
    });
  }, []);

  return (
    <WelcomeHero
      icon={metadata?.icon}  // "Package" dal database
      titleMain={metadata?.titleMain}
    />
  );
};
```

---

## 🎯 Best Practices

### ✅ DO
```tsx
// Usa nomi icone come stringhe
<Icon name="Home" />

// Salva nel database come stringhe
header_icon: "Package"

// Fornisci fallback per sicurezza
<Icon name={user?.icon} fallback="User" />

// Usa TypeScript autocomplete
import type { IconName } from '@/lib/iconRegistry';
```

### ❌ DON'T
```tsx
// Non importare icone direttamente (tranne ArrowRight, ecc. se usati inline)
import { Package } from 'lucide-react'; // ❌ Evita

// Non usare (Icons as any)[name] più
const Icon = (Icons as any)[name]; // ❌ Deprecato

// Non salvare componenti nel database
header_icon: Package // ❌ Sbagliato! Usa "Package" (stringa)
```

---

## 🔄 Migrazione Codice Esistente

### Prima (Vecchio sistema)
```tsx
import * as Icons from 'lucide-react';

const IconComponent = (Icons as any)[iconName];
return <IconComponent className="w-5 h-5" />;
```

### Dopo (Nuovo sistema)
```tsx
import { getIcon } from '@/lib/iconRegistry';

const IconComponent = getIcon(iconName);
return <IconComponent className="w-5 h-5" />;
```

O ancora più semplice:
```tsx
import Icon from '@/components/ui/Icon';

return <Icon name={iconName} className="w-5 h-5" />;
```

---

## 📚 TypeScript Autocomplete

```tsx
import type { IconName } from '@/lib/iconRegistry';

interface Props {
  icon: IconName;  // ✅ Autocomplete di tutte le icone!
}

// Oppure
<Icon name="Pac..." />  // ← Autocomplete suggerisce "Package"
```

---

## 🌐 Compatibilità Futura

**Lucide React è:**
- ✅ Aggiornato regolarmente (nuove icone ogni mese)
- ✅ API stabile (no breaking changes da anni)
- ✅ Versioning semantico (safe upgrades)
- ✅ 100% tree-shakable (bundle size ottimale)
- ✅ Supporto TypeScript nativo

**Quando esce una nuova versione di Lucide:**
1. `npm update lucide-react`
2. Aggiungi nuove icone al registry (opzionale)
3. Done! ✅

**Non serve cambiare sistema** - il registry funzionerà sempre.

---

## 🛠️ Strumenti Utili

### Controllare se icona esiste
```tsx
import { hasIcon } from '@/lib/iconRegistry';

if (hasIcon('Rocket')) {
  console.log('Icon exists!');
}
```

### Lista tutte le icone disponibili
```tsx
import { getAvailableIcons } from '@/lib/iconRegistry';

const allIcons = getAvailableIcons();
console.log(allIcons); // ["AlertCircle", "Apple", "ArrowLeft", ...]
```

### Rendering dinamico (Admin UI)
```tsx
const IconPicker = () => {
  const icons = getAvailableIcons();

  return (
    <div className="grid grid-cols-6 gap-2">
      {icons.map(iconName => (
        <button key={iconName} onClick={() => selectIcon(iconName)}>
          <Icon name={iconName} size={24} />
          <span>{iconName}</span>
        </button>
      ))}
    </div>
  );
};
```

---

## 🎓 Summary

1. **Usa `<Icon name="..." />`** per rendering semplice
2. **Usa `getIcon(name)`** per componenti custom
3. **Salva stringhe nel database**, non componenti
4. **Aggiungi icone al registry** quando servono nuove icone
5. **Goditi TypeScript autocomplete** ✨

---

## 📞 Supporto

Se un'icona non esiste nel registry ma esiste in Lucide:
1. Vai su [lucide.dev/icons](https://lucide.dev/icons)
2. Aggiungi l'import in `iconRegistry.ts`
3. Done!

**Sistema future-proof** garantito! 🚀
