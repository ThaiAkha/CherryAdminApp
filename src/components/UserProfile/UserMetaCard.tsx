import { useState, useEffect, useRef } from "react";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useAuth } from "../../context/AuthContext";
import { Camera } from "lucide-react";

export default function UserMetaCard() {
  const { user, updateProfile, uploadAvatar } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
  });

  useEffect(() => {
    if (user) {
      const [firstName, ...rest] = (user.full_name || "").split(" ");
      const lastName = rest.join(" ");

      setFormData({
        firstName: firstName || "",
        lastName: lastName || "",
        email: user.email || "",
        phone: user.agency_phone || "",
        bio: user.agency_company_name || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      await updateProfile(user.id, {
        full_name: fullName,
        agency_phone: formData.phone,
        agency_company_name: formData.bio
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      setIsUploading(true);
      try {
        await uploadAvatar(user.id, file);
      } catch (error: any) {
        console.error("Avatar upload failed", error);
        alert(`Failed to upload avatar: ${error.message || "Unknown error"}. Check if "avatars" bucket exists and has correct RLS policies.`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="p-6 lg:p-8 rounded-3xl border border-brand-100/50 dark:border-brand-500/10 bg-gradient-to-br from-brand-50/50 to-white dark:from-brand-500/5 dark:to-transparent backdrop-blur-xl shadow-sm">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-8 xl:flex-row">
          <div className="relative group">
            <div className="w-28 h-28 lg:w-32 lg:h-32 overflow-hidden border-2 border-white rounded-full dark:border-gray-800 transition-all duration-300 group-hover:opacity-90 shadow-brand-500/20 shadow-xl">
              <img
                src={user?.avatar_url || "/images/user/owner.jpg"}
                alt="user"
                className="object-cover w-full h-full text-[10px]"
              />
            </div>
            <button
              onClick={handleAvatarClick}
              disabled={isUploading}
              className="absolute bottom-1 right-1 flex items-center justify-center w-10 h-10 text-white transition-all duration-300 bg-brand-600 rounded-full hover:scale-110 disabled:bg-gray-400 shadow-lg border-2 border-white dark:border-gray-900"
            >
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
              ) : (
                <Camera className="w-5 h-5" />
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>
          <div className="order-3 xl:order-2 flex-1 w-full">
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label className="text-[10px] uppercase tracking-widest text-brand-600 mb-1 block">First Name</Label>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="bg-white/50 backdrop-blur-sm"
                  />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-widest text-brand-600 mb-1 block">Last Name</Label>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="bg-white/50 backdrop-blur-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-[10px] uppercase tracking-widest text-brand-600 mb-1 block">Company / Agency Name</Label>
                  <Input
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center gap-2 text-center xl:flex-row xl:gap-4 xl:text-left">
                  <p className="text-sm font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full">
                    {user?.role ? user.role.toUpperCase() : "GUEST"}
                  </p>
                  <div className="hidden h-4 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                  <h4 className="text-xl lg:text-2xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white">
                    {user?.full_name || "User"}
                  </h4>
                </div>
                {user?.agency_company_name && (
                  <p className="mt-2 text-xs font-bold text-gray-400 uppercase tracking-widest text-center xl:text-left">
                    {user.agency_company_name}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center">
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
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl font-black uppercase tracking-widest text-xs"
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
