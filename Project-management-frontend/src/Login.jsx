import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LoginSignUp({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [role, setRole] = useState("Student"); // Only for sign-up
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = isLogin
                ? "http://localhost:8080/login"
                : "http://localhost:8080/signup";

            const data = { college_email: email, password };
            if (!isLogin) data.role = role;

            const response = await axios.post(url, data);

            if (response.data.user_id) {
                const userId = response.data.user_id;

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
                setMessage(response.data.message || "Something went wrong!");
            }
        } catch (error) {
            setMessage(error.response?.data?.message || "An error occurred!");
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h1 className="text-2xl font-bold text-center mb-6">
                {isLogin ? "Login" : "Sign-Up"}
            </h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                {!isLogin && (
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Student">Student</option>
                            <option value="Faculty">Faculty</option>
                        </select>
                    </div>
                )}
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
                >
                    {isLogin ? "Login" : "Sign-Up"}
                </button>
            </form>
            <p className="text-sm text-center text-gray-600 mt-4">{message}</p>
            <p className="text-center mt-4">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                    type="button"
                    className="text-blue-500 hover:underline"
                    onClick={() => {
                        setIsLogin(!isLogin);
                        setMessage("");
                    }}
                >
                    {isLogin ? "Sign-Up" : "Login"}
                </button>
            </p>
        </div>
    );
}

export default LoginSignUp;
