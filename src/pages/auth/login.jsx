import { useState } from "react";
import { userAuthService } from "../../api/userAuth";

function Login() {

    const [isError, setIsError] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const email = event.target.email.value;
        const password = event.target.password.value;
        const response = await userAuthService.login(email, password);
        if (response.status === 200) {
            localStorage.setItem('token', response.data.token);
            userAuthService.getInfo(response.data.userId)
            .then((userInfo) => {
                localStorage.setItem('userInfo', JSON.stringify(userInfo.data));
                // @TODO : redirect to home page
        });
        } else {
            setIsError(true);
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <input type="email" name="email" placeholder="Email" required />
                <input type="password" name="password" placeholder="Password" required />
                <button type="submit">Login</button>
            </form>
            {isError && <p>Login failed. Please check your credentials.</p>}
        </>
    )
}

export default Login;