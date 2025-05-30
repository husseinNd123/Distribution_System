export default function Logout(){
    localStorage.clear();
    window.location.href = "../../views/auth/sign-in/index.jsx";
    console.log(localStorage.getItem("user"));
}
