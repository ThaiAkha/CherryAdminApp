import { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useAuth } from "../../context/AuthContext";

export default function UserInfoCard() {
  const { user, updateProfile } = useAuth();
  const { isOpen, openModal, closeModal } = useModal();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || "",
        email: user.email || "",
        phone: user.agency_phone || "",
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
      await updateProfile(user.id, {
        full_name: formData.fullName,
        agency_phone: formData.phone,
      });
      closeModal();
    } catch (error) {
      console.error("Failed to save changes", error);
    }
  };

  const isAdminOrStaff = user?.role !== 'guest' && user?.role !== 'alumni';

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1 w-full">
          <h4 className="text-lg font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 lg:gap-x-12 xl:gap-x-24">
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Full Name
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {user?.full_name || "User"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Role
              </p>
              <p className="text-xs font-black uppercase tracking-[0.1em] text-blue-600 dark:text-blue-400">
                {user?.role ? user.role.toUpperCase() : "GUEST"}
              </p>
            </div>

            <div className="lg:col-span-1">
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {user?.email || ""}
              </p>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Phone
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {user?.agency_phone || "Not set"}
              </p>
            </div>

            {!isAdminOrStaff && (
              <>
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    Dietary Profile
                  </p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    {user?.dietary_profile || "Regular"}
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    Allergies
                  </p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    {user?.allergies?.length ? user.allergies.join(", ") : "None"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto transition-all duration-200 active:scale-95"
        >
          Edit Info
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white">
              Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Manage your personal identity and contact details.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="custom-scrollbar h-auto max-h-[50vh] overflow-y-auto px-2 pb-3">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <Label>Full Name</Label>
                  <Input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Phone</Label>
                  <Input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
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
    </div>
  );
}
