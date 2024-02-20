import { useState } from 'react';
import './login.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { forgotPasswordResponseErrors } from './responseErrors';
import Lodder from './Lodder';

const ForgotPassword = () => {

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [err, setErr] = useState({})
  const [email, setEmail] = useState("")

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await axios.post(
    'http://localhost:8000/users/forgot-password/',
    {email: email},
    )
    .then((data) => {
      if (data.status === 200){
        setErr({});
        navigate("/validate-forgot-password-token");
      }
    })
    .catch((error) => {
      setErr(forgotPasswordResponseErrors(error));
      setIsLoading(false)
    })
  }

  return (
    <div className="component-wrapper">
      {
          isLoading && (<Lodder/>)
      }
      <div className="login template d-flex justify-content-center align-items-center vh-100 bg-primary">
        <div className='form_container 50-w p-5 rounded bg-white'>
          <form onSubmit={handleSubmit}>
            <h3 className='text-center'>Sign In</h3>

            <div className="mb-2">
              <label htmlFor='email'>Email</label>
              <input type='email' id='email' placeholder='Enter Email' className='form-control' value={email} onChange={(e) => setEmail(e.target.value)}/>
            </div>
            <p className='error_messages'>{err?.response}</p>

            <div className="d-grid">
                <button className='btn btn-primary'>Submit</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword