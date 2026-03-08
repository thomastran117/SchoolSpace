import { useRef, forwardRef, useImperativeHandle } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import environment from "../../configuration/Environment";

export interface CaptchaRef {
  execute: () => Promise<string | null>;
}

const GoogleRecaptcha = forwardRef<CaptchaRef>((_props, ref) => {
  const captchaRef = useRef<ReCAPTCHA | null>(null);

  useImperativeHandle(ref, () => ({
    async execute() {
      if (!captchaRef.current) return null;

      const token = await captchaRef.current.executeAsync();
      captchaRef.current.reset();
      return token;
    },
  }));

  return (
    <ReCAPTCHA
      sitekey={environment.RECAPTCHA_SITE_KEY}
      size="invisible"
      ref={captchaRef}
    />
  );
});

export default GoogleRecaptcha;
