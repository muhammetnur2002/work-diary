import { useState } from 'react';
import { api } from '../api';
import { sha256 } from '../cryptoUtils';

export default function Login({ onAuth }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [validation, setValidation] = useState({});

    const validate = () => {
    const errors = {};
    if (!username.trim()) errors.username = 'Введите логин';
    if (password.length < 4) errors.password = 'Минимальная длина пароля — 4 символа';
    setValidation(errors);
    return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setError('');
    setLoading(true);
    try {
      const passwordHash = await sha256(password); // хешируем на клиенте
        const result = isRegister
        ? await api.register(username, passwordHash)
        : await api.login(username, passwordHash);
        localStorage.setItem('token', result.token);
        onAuth();
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
    };

    return (
    <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-[#1A1A1A] border-2 border-[#2C2C2C] p-8 w-full max-w-md rounded-sm">
        <h1 className="text-3xl font-bold text-center mb-6 uppercase text-[#FF4D00] tracking-wider">
            {isRegister ? 'Регистрация' : 'Вход'}
        </h1>

        {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-2 mb-4 text-sm rounded-sm">
            {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
            <label className="block text-base mb-1 font-medium text-[#CCCCCC]">Логин</label>
            <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setValidation({...validation, username: ''}); }}
                className={`w-full bg-[#121212] border ${validation.username ? 'border-red-500' : 'border-[#2C2C2C]'} p-3 text-lg text-[#E0E0E0] focus:border-[#FF4D00] outline-none transition-colors`}
                placeholder="Ваш логин"
                autoFocus
            />
            {validation.username && <p className="text-red-400 text-sm mt-1">{validation.username}</p>}
            </div>

            <div>
            <label className="block text-base mb-1 font-medium text-[#CCCCCC]">Пароль</label>
            <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setValidation({...validation, password: ''}); }}
                className={`w-full bg-[#121212] border ${validation.password ? 'border-red-500' : 'border-[#2C2C2C]'} p-3 text-lg text-[#E0E0E0] focus:border-[#FF4D00] outline-none transition-colors`}
                placeholder="••••••••"
            />
            {validation.password && <p className="text-red-400 text-sm mt-1">{validation.password}</p>}
            </div>

            <button
            type="submit"
            disabled={loading}
            className="btn-brutal w-full py-3 text-lg flex items-center justify-center gap-2"
            >
            {loading ? (
                <>
                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                {isRegister ? 'Регистрация...' : 'Вход...'}
                </>
            ) : (
                isRegister ? 'Зарегистрироваться' : 'Войти'
            )}
            </button>
        </form>

        <div className="mt-4 text-center space-y-2">
            <button
            onClick={() => { setIsRegister(!isRegister); setError(''); setValidation({}); }}
            className="text-gray-400 hover:text-[#FF4D00] text-sm transition-colors"
            >
            {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
            </button>
           <div>
            <span
                className="text-gray-500 text-xs cursor-pointer hover:text-gray-300 transition-colors"
                onClick={() => alert('Функция восстановления пароля пока недоступна.\nОбратитесь к администратору.')}
            >
                Забыли пароль?
            </span>
            </div>
        </div>
        </div>
    </div>
    );
}