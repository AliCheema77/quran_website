import { useState } from 'react';
import './login.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { loginUpResponseErrors } from './responseErrors';
import Lodder from './Lodder';

const Login = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState({});
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await axios.post(
      'http://localhost:8000/users/jwt-login/',
      loginForm,
    )
    .then((data) => {
      if (data.status === 200){
        localStorage.setItem("access_token", data.data["access"]);
        localStorage.setItem("refresh_token", data.data["refresh"]);
        setErr("");
        setIsLoading(false)
      }
    })
    .catch((error) => {
      setErr(loginUpResponseErrors(error));
      setIsLoading(false)
    })
  }


  return (
    <div className="component-wrapper">
      { isLoading && (<Lodder/>)}
      <div className="login template d-flex justify-content-center align-items-center vh-100 bg-primary">
        <div className='form_container 50-w p-5 rounded bg-white'>
          <form onSubmit={handleSubmit}>
            <h3 className='text-center'>Sign In</h3>

            <div className="mb-2">
              <label htmlFor='email'>Email</label>
              <input type='email' id='email' placeholder='Enter Email' className='form-control' value={loginForm.email} onChange={(e) => setLoginForm((prevState) => ({...prevState, email:e.target.value}))}/>
            </div>

            <div className="mb-2">
              <label htmlFor='password'>Password</label>
              <input type='password' id='password' placeholder='Enter Password' className='form-control' value={loginForm.password} onChange={(e) => setLoginForm((prevState) => ({...prevState, password:e.target.value}))}/>
            </div>

            <div className="mb-2">
              <input type='checkbox' id='check' className='custom-control custom-checkbox'/>
              <label htmlFor='check' className='custom-input-label ms-2'>Remember Me</label>
            </div>
            <p className='error_messages'>{err?.detail}</p>

            <div className="d-grid">
              <button className='btn btn-primary'>Sign In</button>
            </div>

            <p className='text-end mt-2'>
              Forgot <Link to='/forgot-password'>Password?</Link><Link to="/signup" className='ms-2'>Sign up</Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  )
}

export default Login