import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
    const { user, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark overflow-hidden font-display">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-400/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] left-[20%] w-[25%] h-[25%] bg-purple-400/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-white/70 dark:bg-surface-dark/50 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 dark:border-border-dark"
            >
                <div className="flex flex-col items-center mb-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-20 h-20 mb-6 bg-gradient-to-tr from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3"
                    >
                        <span className="material-symbols-outlined text-white text-4xl">design_services</span>
                    </motion.div>

                    <h1 className="text-3xl font-bold text-text-main mb-2 tracking-tight">
                        Design Tracker
                    </h1>
                    <p className="text-text-muted text-center max-w-xs leading-relaxed">
                        Streamline your creative workflow and manage tasks with ease.
                    </p>
                </div>

                <div className="space-y-4">
                    <motion.button
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogin}
                        className="group w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-white text-text-main font-semibold rounded-xl border border-border-dark shadow-sm hover:shadow-md transition-all duration-300"
                    >
                        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 opacity-90 group-hover:opacity-100 transition-opacity" />
                        <span className="tracking-wide">Continue with Google</span>
                    </motion.button>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-text-muted opacity-60">
                        &copy; {new Date().getFullYear()} Design Tracker. All rights reserved.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};
