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
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const url = isLogin
                ? "http://localhost:8080/login"
                : "http://localhost:8080/signup";

            const data = { college_email: email, password };
            if (!isLogin) data.role = role;

            // Simulate API call for demo
            await new Promise(resolve => setTimeout(resolve, 1000));

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (responseData.user_id) {
                const userId = responseData.user_id;

                if (!isLogin) {
                    if (role === "Student") {
                        navigate("/studentdetails", { state: { userId } });
                    } else if (role === "Faculty") {
                        navigate("/facultydetails", { state: { userId } });
                    }
                } else {
                    navigate("/home", { state: { userId } });
                    onLoginSuccess(userId);
                }
            } else {
                setMessage(responseData.message || "Something went wrong!");
            }
        } catch (error) {
            setMessage(error.response?.data?.message || "An error occurred!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-4">
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-2 font-serif">
                        Project Information System
                    </h1>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-xl w-96 transform transition-all duration-300 hover:scale-105">
                    <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                        {isLogin ? "Welcome Back!" : "Join Us"}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-gray-700 font-medium">Email</label>
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

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 
                            ${isLoading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transform hover:-translate-y-1'
                                }`}
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
                    </form>

                    {message && (
                        <div className={`mt-4 p-3 rounded-lg text-sm ${message.includes("error") || message.includes("wrong")
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                            }`}>
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