import Login from './componentes/authentication/Login';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './componentes/authentication/Signup';
import VerifyEmailCode from './componentes/authentication/VerifyEmailCode';
import ResendEmailVerifyCode from './componentes/authentication/ResendEmailVerifyCode';
import 'bootstrap/dist/css/bootstrap.min.css'
import ForgotPassword from './componentes/authentication/ForgotPassword';
import ValidateForgotPasswordToken from './componentes/authentication/ValidateForgotPasswordToken';
import ConfirmForgotPassword from './componentes/authentication/ConfirmForgotPassword';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Login/>}></Route>
          <Route path='signup' element={<Signup/>}></Route>
          <Route path='verify-email-code' element={<VerifyEmailCode/>}></Route>
          <Route path='resend-email-verify-code' element={<ResendEmailVerifyCode/>}></Route>
          <Route path='forgot-password' element={<ForgotPassword/>}></Route>
          <Route path='validate-forgot-password-token' element={<ValidateForgotPasswordToken/>}></Route>
          <Route path='confirm-forgot-password' element={<ConfirmForgotPassword/>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
