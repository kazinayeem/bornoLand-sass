import { BaseCourierProvider } from "./base.provider.js";

export class SundarbanProvider extends BaseCourierProvider {
  readonly slug = "sundarban" as const;
  readonly name = "Sundarban";
  protected requiredCredentialKeys = ["apiKey", "secret", "merchantCode"];
}
