import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const CheckLogin = () => {
  const { user } = useSelector((state) => state.user);
  const navigate= useNavigate();
  useEffect(()=>{
    if(!user){
        navigate('/')
    }
  }, [])
  return  null;
};

export default CheckLogin;
