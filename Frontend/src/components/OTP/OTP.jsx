import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LoginUser } from "../../redux/userSlicer";
import ChangePasswordForm from "../../pages/ChangePassword";

const url = import.meta.env.VITE_BACKEND_URL;

const OTP = ({
  length = 6,
  email,
  resendDelay = 60,
  resetPassword = false,
}) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const [otpSubmit, setOtpSubmit] = useState(false);
  const [timer, setTimer] = useState(resendDelay);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [error, setError] = useState("");
  const [updatePassword, setUpdatePassword] = useState(false);
  const [userId, setUserId] = useState(null);
  const inputsRef = useRef([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (!isResendDisabled) return;
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setIsResendDisabled(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isResendDisabled]);

  const onComplete = async (otpValue) => {
    try {
      setOtpSubmit(true);
      const res = await axios.post(
        `${url}/user/api/verifyOtp`,
        { email, otp: otpValue },
        { withCredentials: true }
      );
      if (res.data.success) {
        if (resetPassword) {
          setUserId(res.data.user._id);
          setUpdatePassword(true);
        } else {
          dispatch(LoginUser(res.data.user));
          navigate("/login");
        }
      } else {
        setError(res.data.message || "OTP verification failed");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setOtpSubmit(false);
    }
  };

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    if (val && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== "")) {
      onComplete(newOtp.join(""));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];
      if (newOtp[index]) {
        newOtp[index] = "";
      } else if (index > 0) {
        newOtp[index - 1] = "";
        inputsRef.current[index - 1]?.focus();
      }
      setOtp(newOtp);
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    const newOtp = pasted.split("").map((digit, i) => digit || "");
    const filledOtp = Array(length)
      .fill("")
      .map((_, i) => newOtp[i] || "");
    setOtp(filledOtp);

    const lastIndex = pasted.length >= length ? length - 1 : pasted.length;
    inputsRef.current[lastIndex]?.focus();

    if (pasted.length === length) {
      onComplete(pasted);
    }
  };

  const handleResendClick = async () => {
    if (isResendDisabled) return;
    try {
      await axios.post(
        `${url}/user/api/v1/ResetPassword`,
        { email },
        { withCredentials: true }
      );
      startTimer();
    } catch (err) {
      setError("Failed to resend OTP. Try again later.");
    }
  };

  const startTimer = () => {
    setTimer(resendDelay);
    setIsResendDisabled(true);
  };

  if (updatePassword) {
    return (
      <ChangePasswordForm updatePassword={true} userId={userId} email={email} />
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#fff7ed_0%,#f4f4f5_40%,#ececec_100%)] dark:bg-[radial-gradient(circle_at_top,#1a1a1d_0%,#111113_60%,#0b0b0c_100%)] px-6">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-300/40 blur-3xl dark:bg-amber-500/20" />
      <div className="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-rose-200/60 blur-3xl dark:bg-amber-700/10" />

      <div className="relative flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-8 rounded-3xl border border-amber-100/70 bg-white/90 p-8 text-center shadow-[0_20px_60px_-25px_rgba(120,84,20,0.45)] backdrop-blur dark:border-[#2c2c2f] dark:bg-[#151518]/90 sm:p-10">
        {/* Back Button */}
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center text-sm font-semibold text-amber-900 transition-colors hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        {/* Heading */}
        <div>
          <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            Verification
          </span>
          <h2 className="mt-4 text-3xl font-serif font-bold text-amber-950 dark:text-amber-200">
            Verify your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Enter the <strong>{length}-digit</strong> code sent to
          </p>
          <p className="mt-1 text-sm font-semibold text-amber-900 dark:text-amber-300">
            {email}
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-2" role="group" aria-label="OTP input fields">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              autoFocus={index === 0}
              maxLength={1}
              value={digit}
              disabled={otpSubmit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              ref={(el) => (inputsRef.current[index] = el)}
              aria-label={`OTP digit ${index + 1}`}
              className="h-12 w-11 rounded-2xl border-2 border-amber-200 bg-amber-50/80 text-center text-3xl font-extrabold text-amber-900 shadow-md transition-transform focus:scale-110 focus:outline-none focus:ring-4 focus:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-700 dark:bg-[#0f0f11] dark:text-amber-400 dark:focus:ring-amber-600"
            />
          ))}
        </div>

        {otpSubmit && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300" aria-live="polite">
            Verifying
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p
            className="text-sm font-semibold mt-1
          text-red-600 dark:text-red-400"
          >
            {error}
          </p>
        )}

        {/* Resend Button */}
        <button
          onClick={handleResendClick}
          disabled={isResendDisabled || otpSubmit}
          className={`w-full rounded-2xl py-3 text-sm font-semibold transition ${
            isResendDisabled || otpSubmit
              ? "bg-amber-100 text-amber-600 cursor-not-allowed dark:bg-amber-900/60 dark:text-amber-300"
              : "bg-gradient-to-r from-amber-900 via-amber-800 to-amber-700 text-white shadow-lg shadow-amber-500/30 hover:brightness-110 dark:from-amber-400 dark:via-amber-300 dark:to-amber-200 dark:text-[#111113]"
          }`}
          aria-disabled={isResendDisabled || otpSubmit}
        >
          {isResendDisabled ? `Resend in ${timer}s` : "Resend OTP"}
        </button>
        </div>
      </div>
    </div>
  );
};

export default OTP;
