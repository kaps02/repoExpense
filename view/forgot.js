document.getElementById("forgotForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    console.log("sending axios...")
    axios
      .post("http://localhost:5000/password/forgotpassword", {
        email
      })
      .then((result) => {
        console.log("result is ...." , result);
      })
      .catch((err) => console.log(err));
  });