import { useEffect, useState } from 'react';
import './login.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { responseErrors } from './responseErrors';
import Lodder from './Lodder';

const VerifyEmailCode = () => {

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [err, setErr] = useState({})
  const [code, setCode] = useState("")

  
  useEffect(() => {
    if (code.length === 6) {
      setIsLoading(true)
      const handleSubmit = async (e) => {
          await axios.post(
          'http://localhost:8000/users/verify-email/',
          {code: code},
          )
          .then((data) => {
          if (data.status === 200){
              setErr({});
              navigate("/");
          }
          })
          .catch((error) => {
            setErr(responseErrors(error));
            setIsLoading(false)
          })
      }
      handleSubmit()
    }
    setErr({})

  }, [code])


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
              <label htmlFor='code'>Code</label>
              <input type='text' id='code' placeholder='Enter Code' className='form-control' value={code} onChange={(e) => setCode(e.target.value)}/>
            </div>
            <p className='error_messages'>{err?.response}</p>

            <p className='text-end mt-2'>
              If not found? <Link to="/resend-email-verify-code" className='ms-2'>resend</Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmailCode