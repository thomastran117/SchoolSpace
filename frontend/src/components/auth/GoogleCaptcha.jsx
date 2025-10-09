import React, { useRef, forwardRef, useImperativeHandle } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import config from "../../configs/envManager";

const Captcha = forwardRef((props, ref) => {
  const captchaRef = useRef();

  useImperativeHandle(ref, () => ({
    async execute() {
      const token = await captchaRef.current.executeAsync();
      captchaRef.current.reset();
      return token;
    },
  }));

  return (
    <ReCAPTCHA
      sitekey={config.RECAPTCHA_SITE_KEY}
      size="invisible"
      ref={captchaRef}
    />
  );
});

export default Captcha;
