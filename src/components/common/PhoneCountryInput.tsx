import { useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import ReactCountryFlag from 'react-country-flag';
import { cn } from '../../lib/utils';
import { Globe } from 'lucide-react';

export interface CountryInfo {
  code?: string;
  dialCode?: string;
  name?: string;
}

type Props = {
  value?: string;
  onChange?: (val: string) => void;
  onCountryChange?: (c: CountryInfo) => void;
  label?: string;
};

export default function PhoneCountryInput({ value, onChange, onCountryChange, label }: Props) {
  const [country, setCountry] = useState<CountryInfo | null>(null);

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-black uppercase text-gray-500 tracking-wider px-1">
          {label}
        </label>
      )}

      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 transition-colors group-focus-within:text-brand-500 text-gray-400">
          <Globe className="w-4 h-4" />
        </div>

        <PhoneInput
          country={'th'} // Default to Thailand
          value={value}
          onChange={(phone: string, data: any) => {
            onChange?.(phone);
            const info: CountryInfo = {
              code: (data?.countryCode || '').toUpperCase(),
              dialCode: `+${data?.dialCode || ''}`,
              name: data?.name || '',
            };
            setCountry(info);
            onCountryChange?.(info);
          }}
          inputProps={{
            name: 'phone',
            className: cn(
              "w-full h-[46px] pl-10 pr-4 rounded-xl border border-gray-200 dark:border-gray-700",
              "bg-white dark:bg-gray-900 text-sm font-medium text-gray-900 dark:text-white",
              "focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none",
              "placeholder:text-gray-400 dark:placeholder:text-gray-600"
            )
          }}
          containerClass="!w-full"
          buttonClass="!hidden" // Hide the default flag button since we have a custom icon or we can style it
          placeholder="e.g. +66 81 234 5678"
        />
      </div>

      {country && country.name && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-1">
          <ReactCountryFlag
            countryCode={country.code || ''}
            svg
            className="!w-4 !h-4 rounded-sm shadow-sm"
          />
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
            {country.name}
          </span>
          <span className="text-[10px] font-bold text-brand-500/70">
            {country.dialCode}
          </span>
        </div>
      )}
    </div>
  );
}
