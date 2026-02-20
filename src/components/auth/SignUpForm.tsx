import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import PhoneCountryInput from "../common/PhoneCountryInput";
import { useAuth } from "../../context/AuthContext";

export default function SignUpForm() {
  const { signUpAgency } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // Agency Fields
  const [contactName, setContactName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isChecked) {
      alert("Please accept the Terms and Conditions");
      return;
    }

    setLoading(true);

    try {
      await signUpAgency(email, password, contactName, companyName, taxId, phone);
      navigate("/"); // Redirect or show success message
    } catch (err: any) {
      console.error("Signup failed:", err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="glass-card p-6 sm:p-10 rounded-3xl border border-white/20 dark:border-white/10 shadow-cherry">
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-black text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md uppercase tracking-tight">
              Partner Registration
            </h1>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Join the B2B portal for Thai Akha Kitchen.
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                {/* <!-- Personal Name --> */}
                <div>
                  <Label htmlFor="contactName">
                    Nome Personale / Contact Name<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="contactName"
                    name="contactName"
                    autoComplete="name"
                    placeholder="Enter Your Name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>

                {/* <!-- Company Name --> */}
                <div>
                  <Label htmlFor="companyName">
                    Company Name<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="companyName"
                    name="companyName"
                    autoComplete="organization"
                    placeholder="Enter Agency Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* <!-- Tax ID --> */}
                  <div className="sm:col-span-1">
                    <Label htmlFor="taxId">
                      Tax ID / VAT<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="taxId"
                      name="taxId"
                      autoComplete="off"
                      placeholder="Tax ID Number"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                    />
                  </div>
                  {/* <!-- Phone --> */}
                  <div className="sm:col-span-1">
                    <PhoneCountryInput
                      label="Phone Number"
                      value={phone}
                      onChange={setPhone}
                    />
                  </div>
                </div>

                {/* <!-- Email --> */}
                <div>
                  <Label htmlFor="email">
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    placeholder="agency@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {/* <!-- Password --> */}
                <div>
                  <Label htmlFor="password">
                    Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      autoComplete="new-password"
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                {error && <p className="text-sm text-error-500 font-bold bg-error-50 dark:bg-error-500/10 p-3 rounded-lg border border-error-100 dark:border-error-500/20">{error}</p>}
                {/* <!-- Checkbox --> */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={setIsChecked}
                  />
                  <p className="inline-block text-xs font-medium text-gray-500 dark:text-gray-400 leading-tight">
                    By creating an account means you agree to the{" "}
                    <span className="text-gray-800 dark:text-white/90 font-bold">
                      Terms and Conditions,
                    </span>{" "}
                    and our{" "}
                    <span className="text-gray-800 dark:text-white font-bold">
                      Privacy Policy
                    </span>
                  </p>
                </div>
                {/* <!-- Button --> */}
                <div className="pt-2">
                  <button className="cherry-btn-animation flex items-center justify-center w-full px-4 py-4 text-sm font-black uppercase text-white rounded-2xl bg-brand-500 shadow-cherry hover:bg-brand-600 tracking-wider" disabled={loading}>
                    {loading ? "Registering Agency..." : "Create Partner Account"}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-6 border-t border-gray-100 dark:border-white/5 pt-6 text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Already have an account? {""}
                <Link
                  to="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-bold underline underline-offset-4"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
