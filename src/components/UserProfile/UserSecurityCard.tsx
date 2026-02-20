import { useState } from "react";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useAuth } from "../../context/AuthContext";
import { Trash2, AlertTriangle, ShieldCheck } from "lucide-react";

export default function UserSecurityCard() {
    const { changePassword, updateProfile, signOut, user } = useAuth();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Step for double confirmation: 0 = idle, 1 = first click, 2 = confirmed
    const [deactivateStep, setDeactivateStep] = useState(0);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || password !== confirmPassword) {
            setMessage({ type: "error", text: "Le password non coincidono o sono vuote" });
            return;
        }

        setIsLoading(true);
        setMessage({ type: "", text: "" });

        try {
            await changePassword(password);
            setMessage({ type: "success", text: "Password aggiornata con successo!" });
            setPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Errore nell'aggiornamento della password" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeactivate = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            await updateProfile(user.id, { is_active: false });
            // After deactivation, we might want to sign the user out or show a final message
            await signOut();
        } catch (error) {
            console.error("Deactivation failed", error);
            setDeactivateStep(0);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="p-6 lg:p-8 rounded-3xl border border-purple-100/50 dark:border-purple-500/10 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-500/5 dark:to-transparent backdrop-blur-xl shadow-sm">
                <h4 className="flex items-center gap-2 text-xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-8 border-b border-purple-100/50 dark:border-purple-500/10 pb-4">
                    <ShieldCheck className="w-5 h-5 text-purple-500" />
                    Security & Password
                </h4>

                <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="flex flex-col gap-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-purple-600/60 dark:text-purple-400/60">New Password</Label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="text-base bg-white/50 backdrop-blur-sm"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-purple-600/60 dark:text-purple-400/60">Confirm Password</Label>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="text-base bg-white/50 backdrop-blur-sm"
                        />
                    </div>

                    {message.text && (
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${message.type === "success" ? "text-green-600" : "text-red-500"}`}>
                            {message.text}
                        </p>
                    )}

                    <div className="flex justify-start">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full px-6 py-2.5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-sm hover:shadow-md transition-all active:scale-95"
                        >
                            {isLoading ? "PROCESSO..." : "AGGIORNA PASSWORD"}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="p-6 lg:p-8 rounded-3xl border border-red-100/50 dark:border-red-500/10 bg-gradient-to-br from-red-50/50 to-white dark:from-red-500/5 dark:to-transparent backdrop-blur-xl shadow-sm">
                <h4 className="flex items-center gap-2 text-xl font-black italic uppercase tracking-tighter text-red-600 dark:text-red-400 mb-4">
                    <Trash2 className="w-4 h-4" />
                    Account
                </h4>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-6">
                    Questa azione non può essere annullata facilmente.
                </p>

                <div className="flex flex-col gap-4">
                    {deactivateStep === 0 ? (
                        <Button
                            variant="outline"
                            onClick={() => setDeactivateStep(1)}
                            className="w-full px-6 py-2.5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-red-600 border-red-200 hover:bg-red-50"
                        >
                            DISATTIVA ACCOUNT
                        </Button>
                    ) : (
                        <div className="flex flex-col gap-3 bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/20">
                            <div className="flex items-center gap-3 text-red-600 font-bold text-[10px] uppercase tracking-widest">
                                <AlertTriangle className="w-4 h-4 animate-pulse" />
                                <span>Sei sicuro?</span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setDeactivateStep(0)}
                                    className="flex-1 py-2 rounded-xl text-[9px] font-black"
                                >
                                    ANNULLA
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleDeactivate}
                                    disabled={isLoading}
                                    className="flex-1 py-2 rounded-xl text-[9px] font-black bg-red-600 hover:bg-red-700 text-white border-none"
                                >
                                    {isLoading ? "..." : "SÌ"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
