import { useState } from "react";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useAuth } from "../../context/AuthContext";

export default function UserSecurityCard() {
    const { changePassword } = useAuth();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || password !== confirmPassword) {
            setMessage({ type: "error", text: "Passwords do not match or are empty" });
            return;
        }

        setIsLoading(true);
        setMessage({ type: "", text: "" });

        try {
            await changePassword(password);
            setMessage({ type: "success", text: "Password updated successfully!" });
            setPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Failed to update password" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <h4 className="text-lg font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-6">
                Security & Password
            </h4>

            <form onSubmit={handlePasswordChange} className="max-w-xl">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                        <Label>New Password</Label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <Label>Confirm Password</Label>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                {message.text && (
                    <p className={`mt-4 text-xs font-bold uppercase tracking-widest ${message.type === "success" ? "text-green-600" : "text-red-500"}`}>
                        {message.text}
                    </p>
                )}

                <div className="mt-6">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        size="sm"
                        className="rounded-xl font-bold uppercase tracking-widest text-[10px]"
                    >
                        {isLoading ? "Updating..." : "Update Password"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
