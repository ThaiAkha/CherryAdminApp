import { useState, useEffect } from "react";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import { useAuth } from "../../context/AuthContext";

export default function UserAddressCard() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    country: "",
    city: "",
    province: "",
    postalCode: "",
    taxId: "",
    address: "",
    commissionRate: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        country: user.agency_country || "",
        city: user.agency_city || "",
        province: user.agency_province || "",
        postalCode: user.agency_postal_code || "",
        taxId: user.agency_tax_id || "",
        address: user.agency_address || "",
        commissionRate: user.agency_commission_rate?.toString() || ""
      });
    }
  }, [user, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await updateProfile(user.id, {
        agency_country: formData.country,
        agency_city: formData.city,
        agency_province: formData.province,
        agency_postal_code: formData.postalCode,
        agency_tax_id: formData.taxId,
        agency_address: formData.address
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update address", error);
    }
  };

  return (
    <div className="p-6 lg:p-8 rounded-3xl border border-emerald-100/50 dark:border-emerald-500/10 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-500/5 dark:to-transparent backdrop-blur-xl shadow-sm h-full flex flex-col">
      <div className="flex-1 w-full">
        <h4 className="text-xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white border-b border-emerald-100/50 dark:border-emerald-500/10 pb-4 mb-8">
          Location & Identity
        </h4>

        <div className="flex flex-col gap-6">
          <div>
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-emerald-600/60 dark:text-emerald-400/60">
              Agency Address
            </p>
            {isEditing ? (
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="bg-white/50 backdrop-blur-sm"
              />
            ) : (
              <p className="text-base font-bold text-gray-800 dark:text-white/90">
                {user?.agency_address || "Not set"}
              </p>
            )}
          </div>

          <div>
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-emerald-600/60 dark:text-emerald-400/60">
              Country
            </p>
            {isEditing ? (
              <Input
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="bg-white/50 backdrop-blur-sm"
              />
            ) : (
              <p className="text-base font-bold text-gray-800 dark:text-white/90">
                {user?.agency_country || "Not set"}
              </p>
            )}
          </div>

          <div>
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-emerald-600/60 dark:text-emerald-400/60">
              City
            </p>
            {isEditing ? (
              <Input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="bg-white/50 backdrop-blur-sm"
              />
            ) : (
              <p className="text-base font-bold text-gray-800 dark:text-white/90">
                {user?.agency_city || "Not set"}
              </p>
            )}
          </div>

          <div>
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-emerald-600/60 dark:text-emerald-400/60">
              Province
            </p>
            {isEditing ? (
              <Input
                name="province"
                value={formData.province}
                onChange={handleChange}
                placeholder="Province"
                className="bg-white/50 backdrop-blur-sm"
              />
            ) : (
              <p className="text-base font-bold text-gray-800 dark:text-white/90">
                {user?.agency_province || "Not set"}
              </p>
            )}
          </div>

          <div>
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-emerald-600/60 dark:text-emerald-400/60">
              Postal Code
            </p>
            {isEditing ? (
              <Input
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="bg-white/50 backdrop-blur-sm"
              />
            ) : (
              <p className="text-base font-bold text-gray-800 dark:text-white/90">
                {user?.agency_postal_code || "Not set"}
              </p>
            )}
          </div>

          <div>
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-emerald-600/60 dark:text-emerald-400/60">
              TAX ID / VAT
            </p>
            {isEditing ? (
              <Input
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                className="bg-white/50 backdrop-blur-sm"
              />
            ) : (
              <p className="text-base font-bold text-gray-800 dark:text-white/90">
                {user?.agency_tax_id || "Not set"}
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-emerald-100/30 dark:border-emerald-500/5">
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-emerald-600/60 dark:text-emerald-400/60">
              Commission Rate
            </p>
            <p className="inline-block text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              {user?.agency_commission_rate ? `${user.agency_commission_rate}%` : "Not set"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-emerald-100/30 dark:border-emerald-500/10">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {isEditing ? (
            <>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl font-black uppercase tracking-widest text-xs"
              >
                ANNULLA
              </Button>
              <Button
                onClick={handleSave}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl font-black uppercase tracking-widest text-xs border-emerald-200 dark:border-emerald-500/20"
              >
                SALVA
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="w-full lg:w-auto px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              MODIFICA
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
