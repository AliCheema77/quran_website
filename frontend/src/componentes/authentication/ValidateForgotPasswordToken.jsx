import { useEffect, useState } from 'react';
import './login.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { validateForgotPasswordTokenResponseErrors } from './responseErrors';
import Lodder from './Lodder';

const ValidateForgotPasswordToken = () => {

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [err, setErr] = useState({})
  const [token, setToken] = useState("")

  
  useEffect(() => {
    if (token.length === 5) {
      setIsLoading(true)
      const handleSubmit = async (e) => {
          await axios.post(
          'http://localhost:8000/users/forgot-password/validate_token/',
          {token: token},
          )
          .then((data) => {
          if (data.status === 200){
              setErr({});
              navigate("/confirm-forgot-password");
          }
          })
          .catch((error) => {
            console.log("here is err", error);
            setErr(validateForgotPasswordTokenResponseErrors(error));
            setIsLoading(false)
          })
      }
      handleSubmit()
    }
    setErr({})

  }, [token])


  return (
    <div className="component-wrapper">
      {
          isLoading && (<Lodder/>)
      }
      <div className="login template d-flex justify-content-center align-items-center vh-100 bg-primary">
        <div className='form_container 50-w p-5 rounded bg-white'>
          <form>
            <h3 className='text-center'>Sign In</h3>

            <div className="mb-2">
              <label htmlFor='token'>Token</label>
              <input type='text' id='token' placeholder='Enter Token' className='form-control' value={token} onChange={(e) => setToken(e.target.value)}/>
            </div>
            <p className='error_messages'>{err?.detail}</p>

            <p className='text-end mt-2'>
              If not found? <Link to="/forgot-password" className='ms-2'>resend</Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  )
}

export default ValidateForgotPasswordToken