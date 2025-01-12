import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import bg from "../../assets/Login/Img1.svg";
import vector from "../../assets/Login/Vector.svg";
import vector_mob from "../../assets/Login/Vector_mob.svg";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Logo from "../../assets/header_logo.svg";
import { Link, Navigate, useNavigate } from "react-router-dom";
import RoleSlider from "./Components/Slider";
import { useDonee } from "../../context/DoneeContext";
import { useDonor } from "../../context/DonorContext";
import { useBloodManager } from "../../context/BloodManagerContext";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { useUser } from "../../context/userContext";

const Login = () => {
  const {
    donorData,
    loginDonor,
    loading: loadingDonor,
    error: donorError,
  } = useDonor();
  const {
    doneeData,
    loginDonee,
    loading: loadingDonee,
    error: doneeError,
  } = useDonee();
  const {
    managerData,
    loginManager,
    loading: loadingManager,
    error: managerError,
  } = useBloodManager();

  //donor api 
  const DonorLogin = async (e) => {
    e.preventDefault();
    try {
      // Prepare the payload for login
      const payload = {
        email: loginDonor.email, // Make sure loginDonor contains the correct data
        password: loginDonor.password,
      };
  
      // Send the request to the API endpoint
      const response = await fetch("http://localhost:8200/api/donor/donor-login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Handle successful login
        console.log('donor data:', data.donor);
  
        // Store donor data in local storage or context
        localStorage.setItem('id', data.donor.id);
        localStorage.setItem('first_name', data.donor.first_name);
        localStorage.setItem('last_name', data.donor.last_name);
        localStorage.setItem('contact', data.donor.contact);
        localStorage.setItem('email', data.donor.email);
        localStorage.setItem('health_status', data.donor.health_status);
        localStorage.setItem('blood_group', data.donor.blood_group);
        localStorage.setItem('age', data.donor.age);
  
        // Update user context or local state if needed
        updateUser({
          id: data.donor.id,
          email: data.donor.email,
          firstName: data.donor.first_name,
          lastName: data.donor.last_name,
          contact: data.donor.contact,
          healthStatus: data.donor.health_status,
          bloodGroup: data.donor.blood_group,
          age: data.donor.age,
        });
  
        // Clear the form fields
        setemail('');
        setPassword('');
  
        // Navigate to the dashboard after login
        navigate("/dashboard");
      } else {
        // Handle errors from the response
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error connecting to the server', error);
      alert('Failed to connect to the server. Please try again later.');
    }
  };  
  
  const { updateUser } = useUser();

  const [showPassword, setShowPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [selectedRole, setSelectedRole] = useState("donor");
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      setKeyboardVisible(window.innerHeight < 600);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const validateFields = () => {
    let valid = true;
    const newErrors = { email: "", password: "" };

    if (!email) {
      newErrors.email = "Email is required.";
      valid = false;
    } else if (email.length < 3) {
      newErrors.email = "Email must be at least 3 characters.";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email is not valid.";
      valid = false;
    }
    if (email.length > 254) {
      newErrors.email = "Email must be no longer than 254 characters.";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Password is required.";
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateFields()) {
      if (selectedRole.toUpperCase() === "DONOR") {
        await loginDonor({ email: email.trim(), password: password.trim() });
        setData(donorData);
      } else if (selectedRole.toUpperCase() === "DONEE") {
        await loginDonee({ email: email.trim(), password: password.trim() });
        setData(doneeData);
      } else if (selectedRole.toUpperCase() === "BLOOD MANAGER") {
        await loginManager({ email: email.trim(), password: password.trim() });
        setData(managerData);
      }

      const error =
        selectedRole.toUpperCase() === "DONOR"
          ? donorError
          : selectedRole.toUpperCase() === "DONEE"
          ? doneeError
          : managerError;

      if (error) {
        toast.error(error, {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: 0,
          theme: "dark",
          transition: Bounce,
        });
      } else {
        const user =
          selectedRole.toUpperCase() === "DONOR"
            ? data?.donor
            : selectedRole.toUpperCase() === "DONEE"
            ? data?.donee
            : data?.manager;

        console.log(data);
        if (user ) {
         const userData = {
           id: user.id,
           email: user.email,
           phone: user.contact ?? user.phone, // Ensure you're using the correct property names
           token: user.token,
           role:
             selectedRole.toUpperCase() === "DONOR"
               ? "DONOR"
               : selectedRole.toUpperCase() === "DONEE"
               ? "DONEE"
               : "MANAGER",
         };

         if (selectedRole.toUpperCase() === "BLOOD MANAGER") {
           userData.username = user.username;
         } else {
           userData.firstName = user.first_name;
           userData.lastName = user.last_name;
           userData.blood_group = user.blood_group
           userData.age = user.age ?? 0;
           userData.health_status = user.health_status;
         }
         updateUser(userData);
         console.log(userData);
         navigate("/dashboard");
        }

        // Prepare the user object based on the role
        
      }
    }
  };

  return (
    <div
      className={`overflow-x-hidden w-screen h-full ${
        keyboardVisible ? "pb-20" : ""
      }`}
    >
      {" "}
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className="relative w-full h-screen">
        <img src={bg} alt="Background" className="object-cover w-full h-full" />
        <div className="absolute w-full h-full top-0 left-0 bg-black bg-opacity-35 z-10"></div>
        <div className="absolute top-0 w-full z-20">
          <Header />
        </div>

        <div className="hidden absolute lg:block top-0 right-0 h-full lg:max-w-[70%] xl:max-w-[70%] max-w-[65%] z-30">
          <div className="relative h-full">
            <img src={vector} className="h-full object-cover" alt="Vector" />
            <div className="absolute top-10 right-10 w-[67%] h-[80%] p-8">
              <div className="">
                <p className="text-3xl font-viga">Welcome Back at,</p>
              </div>
              <div className="w-full flex justify-end mt-4 pr-14">
                <img src={Logo} alt="" className="h-10" />
              </div>

              <div className="mt-16">
                <form onSubmit={handleSubmit}>
                  {" "}
                  <RoleSlider
                    selectedRole={selectedRole}
                    onRoleChange={setSelectedRole}
                  />
                  <div className="mt-5 ">
                    <p className="text-xs font-light">email</p>
                    <input
                      type="text"
                      name="email"
                      id="email"
                      value={email}
                      onChange={(e) => setemail(e.target.value)}
                      className="bg-[#999595] bg-opacity-20 rounded mt-2 px-3 py-2 w-full border border-slate-500"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs text-ellipsis">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div className="mt-5 w-[100%] relative">
                    <p className="text-xs font-light">Password</p>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-[#999595] bg-opacity-20 rounded mt-2 w-full px-3 py-2 border border-slate-500"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-xs">{errors.password}</p>
                    )}
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-9 text-gray-500"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                      />
                    </button>
                    <div className="w-full flex justify-end mt-8">
                      <input
                        type="submit"
                        value={`Login as ${selectedRole.toUpperCase()}`}
                        className="text-center font-viga text-sm border shadow-md shadow-gray-400 hover:shadow-none cursor-pointer border-gray-500 rounded px-5 py-2"
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute lg:hidden bottom-0 left-0 right-0 h-[60%] w-full z-30">
          <img
            src={vector_mob}
            className="h-full w-full opacity-95 object-cover relative overflow-clip"
            alt="Vector"
          />
          <div className="absolute top-10 right-0 left-0 w-full h-[80%] p-6">
            <div className="">
              <p className="text-2xl font-viga">Welcome Back at,</p>
            </div>
            <div className="w-full flex justify-end mt-4 pr-2">
              <img src={Logo} alt="" className="h-10" />
            </div>

            <div className="mt-5">
              <form onSubmit={handleSubmit}>
                <RoleSlider
                  selectedRole={selectedRole}
                  onRoleChange={setSelectedRole}
                />
                <div className="mt-5">
                  <p className="text-xs font-light">email</p>
                  <input
                    type="text"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setemail(e.target.value)}
                    className="bg-[#999595] bg-opacity-20 rounded mt-2 px-3 py-2 w-full border border-slate-500"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs">{errors.email}</p>
                  )}
                </div>
                <div className="mt-5 w-full relative">
                  <p className="text-xs font-light">Password</p>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#999595] bg-opacity-20 rounded mt-2 w-full px-3 py-2 border border-slate-500"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs">{errors.password}</p>
                  )}
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-9 text-gray-500"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>

                  <div className="w-full flex justify-end mt-8">
                    <input
                      type="submit"
                      value={`Login as ${selectedRole.toUpperCase()}`}
                      className="text-center font-viga text-sm border shadow-md shadow-gray-400 hover:shadow-none cursor-pointer border-gray-500 rounded px-5 py-2"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full block">
        <Footer />
      </div>
    </div>
  );
};

export default Login;
