import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { LOGIN } from './queries';
import { useNavigate } from 'react-router-dom';


export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();


    const [login, { loading, error }] = useMutation(LOGIN, {
        onCompleted: ({ login: loginResult }) => {
            if (loginResult?.token) {
                localStorage.setItem('token', loginResult.token);
                localStorage.setItem('userId', loginResult.userId);
                console.log('Login token:', loginResult.token);
                setSuccessMessage('تم تسجيل الدخول بنجاح');
            }
        },
    });

    const submitHandler = async (event) => {
        event.preventDefault();
        setSuccessMessage('');

        await login({
            variables: {
                email: email.trim(),
                password: password.trim(),
            },
        });
    };

    return (
        <form className="auth-form login-form" onSubmit={submitHandler}>

            <div className="form-control">
                <label htmlFor="email">البريد الالكتروني</label>
                <input
                    value={email}
                    onChange={({ target }) => setEmail(target.value)}
                    id="email"
                    type="email"
                    required
                />
            </div>

            <div className="form-control">
                <label htmlFor="password">كلمة المرور</label>
                <input
                    value={password}
                    onChange={({ target }) => setPassword(target.value)}
                    id="password"
                    type="password"
                    required
                />
            </div>

            <div className="form-actions">
                <button className="btn m-2" type="submit" disabled={loading}>
                    {loading ? 'جاري التحقق...' : 'إرسال'}
                </button>
                <button className="btn m-2" type="button" onClick={() => navigate('/signup')}>
                     الانتقال الى انشاء حساب  
                </button>
            </div>

            {error && <p>{error.message}</p>}
            {successMessage && <p>{successMessage}</p>}
        </form>
    );
    
}