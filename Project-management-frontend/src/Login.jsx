import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

function LoginSignUp({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [role, setRole] = useState("Student");
    const [isLoading, setIsLoading] = useState(false);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otp, setOtp] = useState("");
    const navigate = useNavigate();

    const handleSignup = async () => {
        try {
            const response = await fetch("http://localhost:8080/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    college_email: email,
                    password: password,
                    role: role,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Signup failed");
            }

            setMessage("Signup successful! Please verify your email.");
            await handleSendOtp();
        } catch (error) {
            setMessage(error.message);
            setIsLoading(false);
        }
    };

    const handleSendOtp = async () => {
        try {
            const response = await fetch("http://localhost:8080/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to send OTP");
            }

            setMessage("OTP sent successfully! Please check your email.");
            setShowOtpInput(true);
            setIsLoading(false);
        } catch (error) {
            setMessage(error.message);
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("http://localhost:8080/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email,
                    otp: otp,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "OTP verification failed");
            }

            if (!isLogin) {
                if (role === "Student") {
                    navigate("/studentdetails", {
                        state: { userId: data.user_id },
                    });
                } else {
                    navigate("/facultydetails", {
                        state: { userId: data.user_id },
                    });
                }
            } else {
                onLoginSuccess(data.user_id);
                navigate("/home", {
                    state: { userId: data.user_id },
                });
            }
        } catch (error) {
            setMessage(error.message);
            setIsLoading(false);
        }
    };

    const handleLogin = async () => {
        try {
            const response = await fetch("http://localhost:8080/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    college_email: email,
                    password: password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            onLoginSuccess(data.user_id);
            navigate("/home", {
                state: { userId: data.user_id },
            });
        } catch (error) {
            setMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (isLogin) {
            await handleLogin();
        } else {
            await handleSignup();
        }
    };

    return (
        <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-4">
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-2 font-serif">
                        Project Information System
                    </h1>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-xl w-96 transform transition-all duration-300 hover:scale-105">
                    <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                        {isLogin ? "Welcome Back!" : "Create Account"}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-gray-700 font-medium">College Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="your.email@college.edu"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-gray-700 font-medium">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="block text-gray-700 font-medium">Role</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                >
                                    <option value="Student">Student</option>
                                    <option value="Faculty">Faculty</option>
                                </select>
                            </div>
                        )}

                        {showOtpInput ? (
                            <div className="space-y-2">
                                <label className="block text-gray-700 font-medium">Enter OTP</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter OTP"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={handleVerifyOtp}
                                    className="w-full mt-2 py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transform hover:-translate-y-1 transition-all duration-200"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center">
                                            <Loader2 className="animate-spin mr-2" size={20} />
                                            Verifying...
                                        </span>
                                    ) : (
                                        "Verify OTP"
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    className="w-full mt-2 py-2 px-4 text-blue-500 hover:text-purple-500 transition-colors duration-200"
                                >
                                    Resend OTP
                                </button>
                            </div>
                        ) : (
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-500 text-white transform hover:-translate-y-1 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <Loader2 className="animate-spin mr-2" size={20} />
                                        Processing...
                                    </span>
                                ) : (
                                    isLogin ? "Login" : "Sign Up"
                                )}
                            </button>
                        )}
                    </form>

                    {message && (
                        <div
                            className={`mt-4 p-3 rounded-lg text-sm ${message.includes("failed") ||
                                message.includes("error") ||
                                message.includes("wrong")
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                                }`}
                        >
                            {message}
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            className="text-blue-500 hover:text-purple-500 transition-colors duration-200"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setMessage("");
                                setShowOtpInput(false);
                                setOtp("");
                            }}
                        >
                            {isLogin ? "New here? Create an account" : "Already have an account? Login"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginSignUp;
