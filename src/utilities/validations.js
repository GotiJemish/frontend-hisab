import * as yup from "yup";

export const loginSchema = yup.object().shape({
  email: yup.string()
    .test("email-or-superuser", "Invalid email format", (value) => {
      if (!value) return false;
      if (value === "superuser@123") return true;
      return yup.string().email().isValidSync(value);
    })
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

export const registerDetailsSchema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
});

export const otpSchema = yup.object().shape({
  otp: yup.string().length(6, "OTP must be exactly 6 characters").required("OTP is required"),
});

export const setPasswordSchema = yup.object().shape({
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

export const forgotPasswordEmailSchema = yup.object().shape({
  email: yup.string().email("Invalid email format").required("Email is required"),
});
