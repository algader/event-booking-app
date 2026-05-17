import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { CREATE_USER } from './queries';

export default function SignUpPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
  

    const [createUser, { loading, error }] = useMutation(CREATE_USER, {
        onCompleted: ({ createUser: createdUser }) => {
            if (createdUser?.userId) {
                console.log('Created user:', createdUser);
                console.log('Signup token:', createdUser.token);
                setSuccessMessage('تم إنشاء الحساب بنجاح');
            }
        },
    });

    const submitHandler = async (event) => {
        event.preventDefault();
        setSuccessMessage('');

        await createUser({
            variables: {
                username: username.trim(),
                email: email.trim(),
                password: password.trim(),
            },
        });
    };

    return (
                <form className="auth-form login-form" onSubmit={submitHandler}>
                        <div className="form-control">
                <label htmlFor="name">اسم المستخدم</label>
                <input
                                        value={username}
                                        onChange={({ target }) => setUsername(target.value)}
                    id="name"
                    type="text"
                    required
                />
                        </div>

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
                    {loading ? 'جاري الإنشاء...' : 'إرسال'}
                </button>
          
            </div>

            {error && <p>{error.message}</p>}
            {successMessage && <p>{successMessage}</p>}
        </form>
    );
}

