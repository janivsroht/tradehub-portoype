import './style.css'

export default function Register(){
    return(
    <div className="container" id="create-account-container">
        <h1>Create New Account</h1>
        <form id="create-account-form">
            <input type="text" id="first-name" placeholder="First Name" required/><br/>
            <input type="text" id="last-name" placeholder="Last Name" required/><br/>
            <input type="email" id="new-email" placeholder="Email" required/><br/>
            <input type="password" id="new-password" placeholder="Password" required/><br/>
            <button type="button" className="create-account-btn" onClick="createAccount()">Create Account</button>
            <div classNameName="error-message" id="create-error-message"></div>
            <div className="link" onClick="showLogin()">Back to Login</div>
        </form>
    </div>
    )
}