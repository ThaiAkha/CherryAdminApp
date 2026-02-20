import { useState, useEffect } from "react";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import { useAuth } from "../../context/AuthContext";
import { getSmartAvatarUrl, isSmartAvatar } from "../../lib/avatarSystem";
import { Globe } from "lucide-react";
import { cn } from "../../lib/utils";

export default function UserInfoCard() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "" as "male" | "female" | "other" | "",
    age: "" as number | "",
    nationality: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || "",
        email: user.email || "",
        phone: user.agency_phone || "",
        gender: user.gender || "",
        age: user.age || "",
        nationality: user.nationality || "",
      });
    }
  }, [user, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      let finalAvatarUrl = user.avatar_url;

      // Se non ha avatar o ha un avatar intelligente, rigeneralo basandoti su nuovi dati
      if ((!user.avatar_url || isSmartAvatar(user.avatar_url)) && formData.gender && formData.age) {
        finalAvatarUrl = getSmartAvatarUrl(formData.gender as any, Number(formData.age));
      }

      await updateProfile(user.id, {
        full_name: formData.fullName,
        agency_phone: formData.phone,
        gender: formData.gender as any,
        age: formData.age ? Number(formData.age) : undefined,
        nationality: formData.nationality,
        avatar_url: finalAvatarUrl
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save changes", error);
    }
  };


  return (
    <div className="p-6 lg:p-8 rounded-3xl border border-blue-100/50 dark:border-blue-500/10 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-500/5 dark:to-transparent backdrop-blur-xl shadow-sm h-full flex flex-col">
      <div className="flex-1 w-full">
        <h4 className="text-xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white border-b border-blue-100/50 dark:border-blue-500/10 pb-4 mb-8">
          Personal Information
        </h4>

        <div className="flex flex-col gap-6">
          <div>
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-blue-600/60 dark:text-blue-400/60">
              Full Name
            </p>
            {isEditing ? (
              <Input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="bg-white/50 backdrop-blur-sm"
              />
            ) : (
              <p className="text-base font-bold text-gray-800 dark:text-white/90">
                {user?.full_name || "User"}
              </p>
            )}
          </div>

          <div>
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-blue-600/60 dark:text-blue-400/60">
              Phone
            </p>
            {isEditing ? (
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="bg-white/50 backdrop-blur-sm"
              />
            ) : (
              <p className="text-base font-bold text-gray-800 dark:text-white/90">
                {user?.agency_phone || "Not set"}
              </p>
            )}
          </div>

          <div>
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-blue-600/60 dark:text-blue-400/60">
              Email address
            </p>
            <p className="text-base font-bold text-gray-800 dark:text-white/90 break-all">
              {user?.email || ""}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-blue-600/60 dark:text-blue-400/60">
                Gender
              </p>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {['male', 'female', 'other'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gender: g as any }))}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-200 ring-1",
                        formData.gender === g
                          ? "bg-brand-500 text-white ring-brand-500 shadow-md scale-105"
                          : "bg-white text-gray-500 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700 dark:text-gray-400"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-bold text-gray-800 dark:text-white/90">
                  {user?.gender ? (user.gender.charAt(0).toUpperCase() + user.gender.slice(1)) : "Not set"}
                </p>
              )}
            </div>

            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-blue-600/60 dark:text-blue-400/60">
                Nationality
              </p>
              {isEditing ? (
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <Input
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className="pl-8 text-sm bg-white/50 backdrop-blur-sm"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-white/90">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  {user?.nationality || "Not set"}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-blue-600/60 dark:text-blue-400/60">
                Dietary
              </p>
              <p className="text-sm font-bold text-gray-800 dark:text-white/90">
                {user?.dietary_profile || "Regular"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-blue-600/60 dark:text-blue-400/60">
                Allergies
              </p>
              <p className="text-sm font-bold text-gray-800 dark:text-white/90">
                {user?.allergies?.length ? user.allergies.join(", ") : "None"}
              </p>
            </div>
          </div>

          {isEditing && (
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-blue-600/60 dark:text-blue-400/60">
                Age
              </p>
              <Input
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                placeholder="Age"
                className="max-w-[100px] bg-white/50 backdrop-blur-sm"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-blue-100/30 dark:border-blue-500/10">
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
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl font-black uppercase tracking-widest text-xs border-blue-200 dark:border-blue-500/20"
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
