import {
  useState,
  useEffect,
} from "react";
import { Link, useNavigate } from 'react-router-dom'
import axios from "axios";
import './signup.css'
import { signUpResponseErrors, uniqueUsernameResponseError } from "./responseErrors";
import Lodder from "./Lodder";

const Signup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate()
  const [errors, setErrors] = useState({});
  const [uniqueUsernameError, setUniqueUsernameError] = useState({})
  
  const [signupForm, setSignupForm] = useState({
    "username": "",
    "first_name": "",
    "last_name": "",
    "dob": "",
    "gender": "",
    "email": "",
    "password": ""
  })


  // Function to create user
  const handleSubmit = async (e) => {
    setIsLoading(true)
    e.preventDefault();
    await axios.post(
      'http://localhost:8000/users/signup/',
      signupForm,
    )
    .then( (response) => {
      navigate("/verify-email-code");
      setIsLoading(false);
    })
    .catch( (error) => {
      setErrors(signUpResponseErrors(error));
      setIsLoading(false);
    })
  }

  // Function will be used to check username
  useEffect(() => {
    if (signupForm.username !=="") {
      const uniqueUsername = async (e) => {
        await axios.post(
          'http://localhost:8000/users/unique_username/',
          {'username': signupForm.username}
        )
        .then( (response)  => {
          if (response.status === 200) {
            setUniqueUsernameError("")
          }
        })
        .catch((error) => {
          setUniqueUsernameError(uniqueUsernameResponseError(error))
        })
      };
      uniqueUsername();
    }
    
  }, [signupForm.username])
  

  console.log(localStorage.getItem("token"))
  console.log(signupForm)
  return (
      <div className="component-wrapper">
        {
          isLoading && (<Lodder/>)
        }
        <div className="signup template d-flex justify-content-center align-items-center vh-100 bg-primary">
          <div className='form_container 50-w p-5 rounded bg-white'>

            <form onSubmit={handleSubmit}>
              <h3 className='text-center'>Sign UP</h3>

              <div className="mb-2">
                <label htmlFor='uname'>User Name</label>
                <input type='text' id='uname' placeholder='Enter First User Name' className='form-control' value={signupForm.username} onChange={(e) => setSignupForm((prevState) => ({...prevState, username:e.target.value}))}/>
              </div>
              <p className="error_messages">{uniqueUsernameError?.username}</p>

              <div className="mb-2">
                <label htmlFor='fname'>First Name</label>
                <input type='text' id='fname' placeholder='Enter First Name' className='form-control' value={signupForm.first_name} onChange={(e) => setSignupForm((prevState) => ({...prevState,first_name: e.target.value}))}/>
              </div>

              <div className="mb-2">
                <label htmlFor='lname'>Last Name</label>
                <input type='text' id='lname' placeholder='Enter Last Name' className='form-control' value={signupForm.last_name} onChange={(e) => setSignupForm((prevState) => ({...prevState, last_name:e.target.value}))}/>
              </div>

              <div className="mb-2">
                <label htmlFor='dob'>Date Of Birth</label>
                <input type='date' id='dob' placeholder='Enter Your dob' className='form-control' value={signupForm.dob} onChange={(e) => setSignupForm((prevState) => ({...prevState, dob:e.target.value}))}/>
              </div>
              <p className="error_messages">{errors?.dob}</p>

              <div className="mb-2 radio_button">
                  <div>
                    <input type='radio' id='male' name="gender" className='custom-control custom-checkbox' value={signupForm.gender} onChange={(e) => setSignupForm((prevState) => ({...prevState, gender:"male"}))}/>
                    <label htmlFor='male' className='custom-input-label ms-2'>Male</label>
                  </div>
                  <div>
                    <input type='radio' id='female' name="gender" className='custom-control custom-checkbox' value={signupForm.gender} onChange={(e) => setSignupForm((prevState) => ({...prevState, gender:"female"}))}/>
                    <label htmlFor='female' className='custom-input-label ms-2'>Female</label>
                  </div>
                  <div>
                    <input type='radio' id='other' name="gender" className='custom-control custom-checkbox' value={signupForm.gender} onChange={(e) => setSignupForm((prevState) => ({...prevState, gender:"other"}))}/>
                    <label htmlFor='others' className='custom-input-label ms-2'>Others</label>
                  </div>
              </div>
              <p className="error_messages">{errors?.gender}</p>

              <div className="mb-2">
                <label htmlFor='email'>Email</label>
                <input type='email' id='email' placeholder='Enter Email' className='form-control' value={signupForm.email} onChange={(e) => setSignupForm((prevState) => ({...prevState, email:e.target.value}))}/>
              </div>
              <p className="error_messages">{errors?.email}</p>

              <div className="mb-2">
                <label htmlFor='password'>Password</label>
                <input type='password' id='password' placeholder='Enter Password' className='form-control' value={signupForm.password} onChange={(e) => setSignupForm((prevState) => ({...prevState, password:e.target.value}))}/>
              </div>
              <p className="error_messages">{errors?.password}</p>

              <div className="d-grid">
                <button className='btn btn-primary'>Sign Up</button>
              </div>

              <p className='text-end mt-2'>
                Already Registered<Link to="/" className='ms-2'>Login In</Link>
              </p>

            </form>
          </div>
        </div>
      </div>
  )
}

export default Signup