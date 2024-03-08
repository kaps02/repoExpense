document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('#login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
    
            const email = document.querySelector('#email').value;
            const password = document.querySelector('#password').value;
    
            try {
                const response = await axios.post('/user/login', {      //axios call.....
                    email,
                    password
                });
    
                if (response.status === 200) {
                localStorage.setItem('token', response.data.token);        //storing .........
                    
                    console.log('Login successful...' ,response.data.token );
                    alert("You Login Successfully");
                    //window.location.href = '/expense/get';
                   //await axios.get('/expense/get' ,  { Headers : {'Authorization': response.data.token}});
                } else {
                    console.error('Login failed');
                    // Optionally, display an error message to the user
                }
            } catch (error) {
                console.error('Error:', error);
                // Optionally, display an error message to the user
            }
        });
    }

    const signupForm = document.querySelector('#form');
    
    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent the default form submission behavior
            const formData = new FormData(signupForm);
            try {
                const response = await axios.post('/user/signup', {     //axios call......
                    name: formData.get('name'),
                    email: formData.get('email'),
                    password: formData.get('password')
                });
                if (response.status === 200) {
                    console.log("user register successfully....")
                    window.location.href = '/user/login';
                    //signupForm.reset(); // Reset the form fields
                }
            } catch (error) {
                console.error('Error in signup form :', error);
            }
        });
    }
});
