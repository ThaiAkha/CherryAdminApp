import { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useAuth } from "../../context/AuthContext";

export default function UserAddressCard() {
  const { user, updateProfile } = useAuth();
  const { isOpen, openModal, closeModal } = useModal();
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
  }, [user]);

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
        agency_address: formData.address,
        agency_commission_rate: formData.commissionRate ? parseFloat(formData.commissionRate) : undefined
      });
      closeModal();
    } catch (error) {
      console.error("Failed to update address", error);
    }
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 w-full">
            <h4 className="text-lg font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-6">
              Location & Identity
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 lg:gap-x-12 xl:gap-x-24">
              <div className="lg:col-span-2">
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Agency Address
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  {user?.agency_address || "Not set"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Country
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  {user?.agency_country || "Not set"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  City / Province
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  {user?.agency_city ? `${user.agency_city}${user.agency_province ? `, ${user.agency_province}` : ""}` : "Not set"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Postal Code
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  {user?.agency_postal_code || "Not set"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  TAX ID / VAT
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  {user?.agency_tax_id || "Not set"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Commission Rate
                </p>
                <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                  {user?.agency_commission_rate ? `${user.agency_commission_rate}%` : "Not set"}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto transition-all duration-200 active:scale-95"
          >
            Edit Address
          </button>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white">
              Location Details
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Manage your physical address, tax identification, and commission settings.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="custom-scrollbar h-auto max-h-[50vh] overflow-y-auto px-2 pb-3">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2">
                  <Label>Agency Address</Label>
                  <Input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Enter full address" />
                </div>

                <div>
                  <Label>Country</Label>
                  <Input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="e.g. Thailand" />
                </div>

                <div>
                  <Label>City</Label>
                  <Input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Chiang Mai" />
                </div>

                <div>
                  <Label>Province / State</Label>
                  <Input type="text" name="province" value={formData.province} onChange={handleChange} placeholder="e.g. Chiang Mai" />
                </div>

                <div>
                  <Label>Postal Code</Label>
                  <Input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="50200" />
                </div>

                <div>
                  <Label>TAX ID / VAT</Label>
                  <Input type="text" name="taxId" value={formData.taxId} onChange={handleChange} placeholder="Enter your tax id" />
                </div>

                <div>
                  <Label>Commission Rate (%)</Label>
                  <Input type="number" name="commissionRate" value={formData.commissionRate} onChange={handleChange} placeholder="0" />
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
