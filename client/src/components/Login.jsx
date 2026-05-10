import { useState } from 'react';
import { api } from '../api';

export default function Login({ onAuth }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
        const result = isRegister
        ? await api.register(username, password)
        : await api.login(username, password);
        localStorage.setItem('token', result.token);
        onAuth();
    } catch (err) {
        setError(err.message);
    }
    };

    return (
    <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-[#1A1A1A] border-2 border-[#2C2C2C] p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 uppercase text-[#FF4D00]">
            {isRegister ? 'Регистрация' : 'Вход'}
        </h1>
        {error && <div className="text-red-400 mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <label className="block text-sm mb-1">Логин</label>
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#121212] border border-[#2C2C2C] p-2 text-[#E0E0E0] focus:border-[#FF4D00] outline-none"
                required
            />
            </div>
            <div>
            <label className="block text-sm mb-1">Пароль</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#121212] border border-[#2C2C2C] p-2 text-[#E0E0E0] focus:border-[#FF4D00] outline-none"
                required
            />
            </div>
            <button type="submit" className="btn-brutal w-full">
            {isRegister ? 'Зарегистрироваться' : 'Войти'}
            </button>
        </form>
        <div className="mt-4 text-center">
            <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-gray-400 hover:text-[#FF4D00] text-sm"
            >
            {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
            </button>
        </div>
        </div>
    </div>
   );
}