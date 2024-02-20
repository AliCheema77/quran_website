function signUpResponseErrors(error){
    if (error === null || error==="undefiend"){
        return null;
    }
    if (error.response){
        if (error.response.status === 400 && error.response.data){
            const responseErrors = error.response.data;
            if (responseErrors) {
                const errorData = {};
                for (const [key, value] of Object.entries(responseErrors)) {
                    errorData[key] = value[0];
                }
            return errorData;
            }
        return null;
        }
    }
}


function uniqueUsernameResponseError(error){
    if (error.response.status === 200 || error==="undefiend"){
        return null;
    }

    if (error.response){
        if (error.response.status === 400 && error.response.data){
            const responseErrors = error.response.data;
            if (responseErrors) {
                const errorData = {};
                errorData["username"] = error.response.data.response
                return errorData
            }
        return null;
        }
    }
}


function loginUpResponseErrors(error){
    if (error.response.status === 200 || error==="undefiend"){
        return null;
    };

    if (error.response){
        if (error.response.status === 401 && error.response.data){
            const responseErrors = error.response.data;
            if (responseErrors) {
                const errorData = {};
                errorData["detail"] = error.response.data["detail"]
                return errorData
            }
        return null;
        }
    }
    
}

function responseErrors(error) {
    if (error.response.status === 200 || error==="undefiend"){
        return null;
    };

    if (error.response){
        if (error.response.status === 400 && error.response.data){
            const responseErrors = error.response.data;
            if (responseErrors) {
                const errorData = {};
                errorData["response"] = error.response.data["response"]
                return errorData
            }
        return null;
        }
    }
}

function forgotPasswordResponseErrors(error) {
    if (error.response.status === 200 || error==="undefiend"){
        return null;
    };

    if (error.response){
        if (error.response.status === 400 && error.response.data){
            const responseErrors = error.response.data;
            if (responseErrors) {
                const errorData = {};
                errorData["response"] = error.response.data["email"][0]
                return errorData
            }
        return null;
        }
    }
}

function confirmPasswordResponseErrors(error) {
    if (error.response.status === 200 || error==="undefiend"){
        return null;
    };

    if (error.response){
        if (error.response.status === 400 && error.response.data){
            const responseErrors = error.response.data;
            if (responseErrors) {
                const errorData = {};
                errorData["password"] = error.response.data["password"][0]
                return errorData
            }
        return null;
        }
    }
}

function validateForgotPasswordTokenResponseErrors(error) {
    if (error.response.status === 200 || error==="undefiend"){
        return null;
    };

    if (error.response){
        if (error.response.status === 404 && error.response.data){
            const responseErrors = error.response.data;
            if (responseErrors) {
                const errorData = {};
                errorData["detail"] = error.response.data["detail"]
                return errorData
            }
        return null;
        }
    }
}

export  { 
    signUpResponseErrors, 
    uniqueUsernameResponseError, 
    loginUpResponseErrors, 
    responseErrors, 
    forgotPasswordResponseErrors,
    confirmPasswordResponseErrors,
    validateForgotPasswordTokenResponseErrors,
 }