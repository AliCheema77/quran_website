import { useState } from 'react';
import './login.css';
import axios from 'axios';
import { confirmPasswordResponseErrors } from './responseErrors';
import { useNavigate } from 'react-router-dom';
import Lodder from './Lodder';

const Login = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState({});
  const [forgotPassword, setForgotPassword] = useState({
    password: "",
    confirmPassword: "",
    token: ""
  });

  const validatePassword = (password, confirmPassword) => {
    if(password === confirmPassword){
      return true;
    }
    else{
      const errorData = {"password": "Both Passwords Are Not Same!"};
      setErr(errorData);
      return false;
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validatePassowrd = validatePassword(forgotPassword.password, forgotPassword.confirmPassword);
    if(validatePassowrd){
      setIsLoading(true);
      await axios.post(
        'http://localhost:8000/users/forgot-password/confirm/',
        {
          password: forgotPassword.password,
          token: forgotPassword.token
        },
      )
      .then((data) => {
        if (data.status === 200){
          navigate('/');
        }
      })
      .catch((error) => {
        setErr(confirmPasswordResponseErrors(error));
        setIsLoading(false)
      })
    }
  }

  return (
    <div className="component-wrapper">
      { isLoading && (<Lodder/>)}
      <div className="login template d-flex justify-content-center align-items-center vh-100 bg-primary">
        <div className='form_container 50-w p-5 rounded bg-white'>
          <form onSubmit={handleSubmit}>
            <h3 className='text-center'>New Password</h3>

            <div className="mb-2">
              <label htmlFor='password'>Password</label>
              <input type='password' id='password' placeholder='Enter New Password' className='form-control' value={forgotPassword.password} onChange={(e) => setForgotPassword((prevState) => ({...prevState, password:e.target.value}))}/>
            </div>

            <div className="mb-2">
              <label htmlFor='password'>Confirm Password</label>
              <input type='password' id='confirmPassword' placeholder='Confirm Password' className='form-control' value={forgotPassword.confirmPassword} onChange={(e) => setForgotPassword((prevState) => ({...prevState, confirmPassword:e.target.value}))}/>
            </div>

            <div className="mb-2">
              <label htmlFor='token'>Token</label>
              <input type='text' id='token' placeholder='Enter Token Here' className='form-control' value={forgotPassword.token} onChange={(e) => setForgotPassword((prevState) => ({...prevState, token:e.target.value}))}/>
            </div>

            <p className='error_messages'>{err?.password}</p>

            <div className="d-grid">
              <button className='btn btn-primary'>submit</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

export default Login