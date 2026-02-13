const otpStore = {};

export function saveOTP(email, otp) {
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 }; // 5 min
}

export function verifyOTP(email, enteredOtp) {
  const record = otpStore[email];
  if (!record) return false;
  const { otp, expires } = record;
  if (Date.now() > expires) return false;
  return otp === enteredOtp;
}

