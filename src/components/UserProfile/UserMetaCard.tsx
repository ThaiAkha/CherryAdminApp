import { useState, useEffect, useRef } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useAuth } from "../../context/AuthContext";
import { Camera } from "lucide-react";

export default function UserMetaCard() {
  const { user, updateProfile, uploadAvatar } = useAuth();
  const { isOpen, openModal, closeModal } = useModal();
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
      closeModal();
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
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="relative group">
              <div className="w-24 h-24 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 transition-all duration-300 group-hover:opacity-90">
                <img
                  src={user?.avatar_url || "/images/user/owner.jpg"}
                  alt="user"
                  className="object-cover w-full h-full text-[10px]"
                />
              </div>
              <button
                onClick={handleAvatarClick}
                disabled={isUploading}
                className="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 text-white transition-all duration-300 bg-brand-600 rounded-full hover:scale-110 disabled:bg-gray-400 shadow-lg"
              >
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                ) : (
                  <Camera className="w-4 h-4" />
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
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-2xl font-black italic uppercase tracking-tighter text-center text-gray-900 dark:text-white xl:text-left">
                {user?.full_name || "User"}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-xs font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">
                  {user?.role ? user.role.toUpperCase() : "GUEST"}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {user?.agency_country || "Thailand"}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto transition-all duration-200 active:scale-95"
          >
            Edit Settings
          </button>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white">
              Edit Profile Info
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Manage your global profile settings and company information.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="custom-scrollbar h-auto max-h-[50vh] overflow-y-auto px-2 pb-3">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <Label>First Name</Label>
                  <Input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Last Name</Label>
                  <Input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="cursor-not-allowed opacity-50 bg-gray-50 dark:bg-gray-800"
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Phone</Label>
                  <Input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="col-span-2">
                  <Label>Agency Company Name</Label>
                  <Input
                    type="text"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Enter your agency name"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-8 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} className="rounded-xl font-bold uppercase tracking-widest text-[10px]">
                Cancel
              </Button>
              <Button size="sm" type="submit" className="rounded-xl font-bold uppercase tracking-widest text-[10px]">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
